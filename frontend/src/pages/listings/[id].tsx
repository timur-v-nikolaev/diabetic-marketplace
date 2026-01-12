import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { listingsAPI, chatAPI, transactionsAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import AvitoHeader from '../../components/ui/AvitoHeader';

interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  city: string;
  category: string;
  condition?: string;
  rating: number;
  reviewsCount: number;
  isSaved?: boolean;
  views?: number;
  sellerId: {
    _id: string;
    name: string;
    rating: number;
    reviewsCount: number;
    city: string;
    phone: string;
    avatar?: string;
    createdAt?: string;
  };
  createdAt: string;
}

export default function ListingDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await listingsAPI.getById(id as string);
        setListing(response.data);
        setSaved(response.data.isSaved || false);
      } catch (error) {
        console.error('Failed to fetch listing:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  // Keyboard navigation for gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!listing?.images?.length) return;
      if (e.key === 'ArrowLeft') {
        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : listing.images.length - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveImageIndex((prev) => (prev < listing.images.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Escape' && showFullscreen) {
        setShowFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [listing, showFullscreen]);

  const handleSave = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    setActionLoading('save');
    try {
      if (saved) {
        await listingsAPI.unsave(id as string);
      } else {
        await listingsAPI.save(id as string);
      }
      setSaved(!saved);
    } catch (error) {
      console.error('Failed to toggle save:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleContact = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (!listing?.sellerId._id) return;

    setActionLoading('contact');
    try {
      const response = await chatAPI.getOrCreateConversation(
        listing._id,
        listing.sellerId._id
      );
      router.push(`/messages/${response.data._id}`);
    } catch (error: any) {
      console.error('Failed to create conversation:', error);
      alert(`Не удалось открыть чат: ${error.response?.data?.error || error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBuy = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!listing) return;

    setActionLoading('buy');
    try {
      const response = await transactionsAPI.create(listing._id, listing.price);
      router.push(`/transactions/${response.data._id}`);
    } catch (error: any) {
      alert(`${error.response?.data?.error || 'Не удалось создать сделку'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована!');
    }
  }, [listing]);

  const isOwner = isAuthenticated && (user?.id === listing?.sellerId._id || user?._id === listing?.sellerId._id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'сегодня';
    if (days === 1) return 'вчера';
    if (days < 7) return `${days} дней назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long'
    });
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
    }
    return phone;
  };

  const maskPhoneNumber = (phone: string) => {
    if (!phone) return 'Показать телефон';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 4) {
      return `+7 (${cleaned.slice(1, 4)}) ***-**-**`;
    }
    return 'Показать телефон';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-avito-bg">
        <AvitoHeader showBack backHref="/" />
        <div className="avito-container py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-avito-lg overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
              </div>
              <div className="bg-white rounded-avito-lg p-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-6" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-avito-lg p-6 animate-pulse">
                <div className="h-12 bg-gray-200 rounded mb-4" />
                <div className="h-12 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <>
        <Head>
          <title>Объявление не найдено — Диабет Маркет</title>
        </Head>
        <div className="min-h-screen bg-avito-bg">
          <AvitoHeader showBack backHref="/" />
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-20 h-20 bg-avito-bg rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">😕</span>
            </div>
            <h1 className="text-xl font-bold text-avito-text mb-2">Объявление не найдено</h1>
            <p className="text-avito-text-secondary mb-6 text-center">
              Возможно, оно было удалено или снято с публикации
            </p>
            <Link href="/catalog" className="avito-btn avito-btn-primary">
              Перейти в каталог
            </Link>
          </div>
        </div>
      </>
    );
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  return (
    <>
      <Head>
        <title>{listing.title} — {formatPrice(listing.price)} ₽ — Диабет Маркет</title>
        <meta name="description" content={listing.description?.slice(0, 160)} />
        <meta property="og:title" content={listing.title} />
        <meta property="og:description" content={listing.description?.slice(0, 160)} />
        {listing.images?.[0] && <meta property="og:image" content={listing.images[0]} />}
      </Head>

      <div className="min-h-screen bg-avito-bg">
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <AvitoHeader />
        </div>

        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-50 bg-white border-b border-avito-border">
          <div className="flex items-center h-14 px-4 gap-2">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-avito-bg transition-colors -ml-2"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div className="flex-1" />
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-avito-bg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <button
              onClick={handleSave}
              disabled={actionLoading === 'save'}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-avito-bg transition-colors"
            >
              {saved ? (
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        <main className="avito-container py-4 lg:py-6 pb-28 lg:pb-6">
          {/* Breadcrumbs - Desktop */}
          <nav className="hidden lg:flex text-sm text-avito-text-secondary mb-4 items-center gap-2">
            <Link href="/" className="hover:text-avito-blue">Главная</Link>
            <span>›</span>
            <Link href="/catalog" className="hover:text-avito-blue">Каталог</Link>
            <span>›</span>
            <Link href={`/catalog?category=${encodeURIComponent(listing.category)}`} className="hover:text-avito-blue">
              {listing.category}
            </Link>
            <span>›</span>
            <span className="text-avito-text truncate max-w-xs">{listing.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Left Column - Images & Description */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Image Gallery */}
              <div className="bg-white rounded-avito-lg overflow-hidden shadow-avito-card">
                <div 
                  className="relative aspect-[4/3] bg-gray-100 cursor-zoom-in"
                  onClick={() => setShowFullscreen(true)}
                >
                  {listing.images && listing.images.length > 0 ? (
                    <>
                      <img
                        src={listing.images[activeImageIndex]}
                        alt={listing.title}
                        className="w-full h-full object-contain"
                      />
                      
                      {/* Navigation Arrows */}
                      {listing.images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : listing.images.length - 1));
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImageIndex((prev) => (prev < listing.images.length - 1 ? prev + 1 : 0));
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </>
                      )}
                      
                      {/* Image Counter */}
                      {listing.images.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
                          {activeImageIndex + 1} / {listing.images.length}
                        </div>
                      )}

                      {/* Zoom Icon */}
                      <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                        Увеличить
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-avito-text-secondary">
                      <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">Нет фото</span>
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {listing.images && listing.images.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide border-t border-avito-border">
                    {listing.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                          idx === activeImageIndex 
                            ? 'border-avito-blue ring-2 ring-avito-blue/20' 
                            : 'border-transparent hover:border-avito-border'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price & Title - Mobile Only */}
              <div className="lg:hidden bg-white rounded-avito-lg p-4 shadow-avito-card">
                <p className="text-2xl font-bold text-avito-price mb-1">
                  {formatPrice(listing.price)} ₽
                </p>
                <h1 className="text-lg text-avito-text mb-3">{listing.title}</h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-avito-text-secondary">
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {listing.city}
                  </span>
                  <span>•</span>
                  <span>{formatDate(listing.createdAt)}</span>
                  {listing.views && (
                    <>
                      <span>•</span>
                      <span>{listing.views} просмотров</span>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-avito-lg p-4 lg:p-6 shadow-avito-card">
                <h2 className="text-lg font-semibold text-avito-text mb-4">Описание</h2>
                <div className="text-avito-text leading-relaxed whitespace-pre-wrap">
                  {listing.description || 'Продавец не добавил описание'}
                </div>
                
                {/* Category Badge */}
                <div className="mt-6 pt-4 border-t border-avito-border">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/catalog?category=${encodeURIComponent(listing.category)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-avito-bg rounded-full text-sm text-avito-text-secondary hover:bg-avito-border transition-colors"
                    >
                      <span>🏷️</span>
                      {listing.category}
                    </Link>
                    {listing.condition && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-avito-bg rounded-full text-sm text-avito-text-secondary">
                        <span>📦</span>
                        {listing.condition}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-avito-lg p-4 lg:p-6 shadow-avito-card">
                <h2 className="text-lg font-semibold text-avito-text mb-4">Местоположение</h2>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-avito-bg rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-avito-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-avito-text">{listing.city}</p>
                    <p className="text-sm text-avito-text-secondary">Точный адрес уточняйте у продавца</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Seller & Actions */}
            <div className="space-y-4">
              {/* Price Card - Desktop Only */}
              <div className="hidden lg:block bg-white rounded-avito-lg p-6 shadow-avito-card">
                <p className="text-3xl font-bold text-avito-price mb-2">
                  {formatPrice(listing.price)} ₽
                </p>
                <h1 className="text-lg text-avito-text mb-4">{listing.title}</h1>
                
                <div className="flex items-center gap-2 text-sm text-avito-text-secondary mb-6">
                  <span>{listing.city}</span>
                  <span>•</span>
                  <span>{formatDate(listing.createdAt)}</span>
                </div>

                {!isOwner && (
                  <div className="space-y-3">
                    <button
                      onClick={handleContact}
                      disabled={actionLoading === 'contact'}
                      className="w-full py-3.5 bg-avito-blue text-white font-semibold rounded-avito flex items-center justify-center gap-2 hover:bg-avito-blue-hover transition-colors disabled:opacity-70"
                    >
                      {actionLoading === 'contact' ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Написать продавцу
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setShowPhone(!showPhone)}
                      className="w-full py-3.5 border-2 border-avito-green text-avito-green font-semibold rounded-avito flex items-center justify-center gap-2 hover:bg-avito-green hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {showPhone ? formatPhoneNumber(listing.sellerId.phone) : maskPhoneNumber(listing.sellerId.phone)}
                    </button>

                    <button
                      onClick={handleBuy}
                      disabled={actionLoading === 'buy'}
                      className="w-full py-3.5 bg-avito-green text-white font-semibold rounded-avito flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-70"
                    >
                      {actionLoading === 'buy' ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Купить безопасно
                        </>
                      )}
                    </button>
                  </div>
                )}

                {isOwner && (
                  <div className="space-y-3">
                    <button
                      onClick={() => alert('Редактирование в разработке')}
                      className="w-full py-3.5 bg-avito-blue text-white font-semibold rounded-avito hover:bg-avito-blue-hover transition-colors"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('Удалить это объявление?')) {
                          try {
                            await listingsAPI.delete(listing._id);
                            router.push('/auth/profile');
                          } catch (error) {
                            alert('Ошибка при удалении');
                          }
                        }
                      }}
                      className="w-full py-3.5 border border-red-500 text-red-500 font-semibold rounded-avito hover:bg-red-50 transition-colors"
                    >
                      Удалить объявление
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-avito-border">
                  <button
                    onClick={handleSave}
                    disabled={actionLoading === 'save'}
                    className="flex items-center gap-2 text-sm text-avito-text-secondary hover:text-avito-text transition-colors"
                  >
                    {saved ? (
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    )}
                    {saved ? 'В избранном' : 'В избранное'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 text-sm text-avito-text-secondary hover:text-avito-text transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Поделиться
                  </button>
                </div>
              </div>

              {/* Seller Card */}
              <div className="bg-white rounded-avito-lg p-4 lg:p-6 shadow-avito-card">
                <Link 
                  href={`/sellers/${listing.sellerId._id}`}
                  className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-avito-bg flex items-center justify-center flex-shrink-0">
                    {listing.sellerId.avatar ? (
                      <img
                        src={`${apiUrl}${listing.sellerId.avatar}`}
                        alt={listing.sellerId.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">👤</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-avito-text truncate">{listing.sellerId.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-avito-text-secondary mt-0.5">
                      {listing.sellerId.rating > 0 && (
                        <>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            {listing.sellerId.rating.toFixed(1)}
                          </span>
                          <span>•</span>
                        </>
                      )}
                      <span>{listing.sellerId.reviewsCount || 0} отзывов</span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-avito-text-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                
                {listing.sellerId.createdAt && (
                  <p className="text-xs text-avito-text-secondary mt-3 pt-3 border-t border-avito-border">
                    На Диабет Маркет с {new Date(listing.sellerId.createdAt).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>

              {/* Safety Tips */}
              <div className="bg-blue-50 rounded-avito-lg p-4">
                <h3 className="font-medium text-avito-text mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-avito-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Безопасная сделка
                </h3>
                <p className="text-sm text-avito-text-secondary">
                  Проверяйте товар при получении. Не переводите предоплату незнакомым продавцам.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Bottom Bar */}
        {!isOwner && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-avito-border p-3 safe-area-pb z-40">
            <div className="flex gap-2">
              <button
                onClick={handleContact}
                disabled={actionLoading === 'contact'}
                className="flex-1 py-3 bg-avito-blue text-white font-semibold rounded-avito flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {actionLoading === 'contact' ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Написать'
                )}
              </button>
              <button
                onClick={() => setShowPhone(!showPhone)}
                className="flex-1 py-3 bg-avito-green text-white font-semibold rounded-avito flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {showPhone ? 'Скрыть' : 'Позвонить'}
              </button>
            </div>
            {showPhone && listing.sellerId.phone && (
              <a
                href={`tel:${listing.sellerId.phone}`}
                className="block w-full mt-2 py-3 bg-avito-bg text-center font-medium text-avito-text rounded-avito"
              >
                {formatPhoneNumber(listing.sellerId.phone)}
              </a>
            )}
          </div>
        )}

        {/* Fullscreen Image Modal */}
        {showFullscreen && listing.images && listing.images.length > 0 && (
          <div 
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
            onClick={() => setShowFullscreen(false)}
          >
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <img
              src={listing.images[activeImageIndex]}
              alt={listing.title}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {listing.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : listing.images.length - 1));
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev < listing.images.length - 1 ? prev + 1 : 0));
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {listing.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex(idx);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === activeImageIndex ? 'bg-white w-6' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
