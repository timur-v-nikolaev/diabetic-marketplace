import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { listingsAPI, favoritesAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface Seller {
  _id: string;
  name: string;
  city?: string;
  avatar?: string;
  rating?: number;
  reviewsCount?: number;
  verificationStatus?: string;
  createdAt?: string;
}

interface Listing {
  _id: string;
  title: string;
  price: number;
  images: string[];
  city: string;
  category: string;
}

export default function SellerProfile() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, user } = useAuth();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const listingsResponse = await listingsAPI.getByUserId(id as string);
        const sellerListings = listingsResponse.data || [];
        setListings(sellerListings);
        if (sellerListings.length > 0 && sellerListings[0].sellerId) {
          setSeller(sellerListings[0].sellerId);
        } else {
          setSeller({ _id: id as string, name: 'Продавец', rating: 0, reviewsCount: 0, city: 'Не указан' });
        }
      } catch (error) {
        console.error('Failed to fetch seller data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSellerData();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!id) return;
    try {
      setFavoriteLoading(true);
      if (isFavorite) {
        await favoritesAPI.removeSeller(id as string);
        setIsFavorite(false);
      } else {
        await favoritesAPI.addSeller(id as string);
        setIsFavorite(true);
      }
    } catch (error: any) {
      if (error.response?.data?.error === 'Seller already in favorites') {
        setIsFavorite(true);
      }
    } finally {
      setFavoriteLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'недавно';
    const date = new Date(dateString);
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getImageUrl = (images: string[]) => {
    if (!images || images.length === 0) return null;
    const img = images[0];
    if (img.startsWith('http')) return img;
    return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${img}`;
  };

  const getAvatarUrl = (avatar?: string) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${avatar}`;
  };

  const isOwnProfile = user?.id === id || user?._id === id;

  if (loading) {
    return (
      <>
        <Head><title>Загрузка... — Диабет Маркет</title></Head>
        <div className="min-h-screen bg-avito-bg">
          <div className="bg-white border-b border-avito-border">
            <div className="max-w-[1280px] mx-auto px-4 py-3">
              <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="max-w-[1280px] mx-auto px-4 py-6">
            <div className="bg-white rounded-avito-lg p-6 animate-pulse">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-8 w-48 bg-gray-200 rounded mb-3" />
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!seller) {
    return (
      <>
        <Head><title>Продавец не найден — Диабет Маркет</title></Head>
        <div className="min-h-screen bg-avito-bg flex items-center justify-center">
          <div className="text-center">
            <span className="text-6xl block mb-4">😔</span>
            <h1 className="text-2xl font-bold text-avito-text mb-4">Продавец не найден</h1>
            <Link href="/" className="text-avito-blue hover:underline">← На главную</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{seller.name} — Диабет Маркет</title>
        <meta name="description" content={`Профиль продавца ${seller.name}. ${listings.length} объявлений.`} />
      </Head>

      <div className="min-h-screen bg-avito-bg">
        {/* Header */}
        <header className="bg-white border-b border-avito-border sticky top-0 z-50">
          <div className="max-w-[1280px] mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">💊</span>
                <span className="text-xl font-bold text-avito-text">Диабет Маркет</span>
              </Link>
              <nav className="flex items-center gap-4">
                <Link href="/favorites" className="text-avito-text-secondary hover:text-avito-text">Избранное</Link>
                {isAuthenticated ? (
                  <Link href="/auth/profile" className="text-avito-blue hover:underline">Профиль</Link>
                ) : (
                  <Link href="/auth/login" className="text-avito-blue hover:underline">Войти</Link>
                )}
              </nav>
            </div>
          </div>
        </header>

        {/* Breadcrumbs */}
        <div className="bg-white border-b border-avito-border">
          <div className="max-w-[1280px] mx-auto px-4 py-2">
            <nav className="flex items-center gap-2 text-sm text-avito-text-secondary">
              <Link href="/" className="hover:text-avito-blue">Главная</Link>
              <span>→</span>
              <span className="text-avito-text">{seller.name}</span>
            </nav>
          </div>
        </div>

        <main className="max-w-[1280px] mx-auto px-4 py-6">
          {/* Seller Card */}
          <div className="bg-white rounded-avito-lg border border-avito-border p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-avito-bg flex items-center justify-center border-2 border-avito-border">
                  {seller.avatar ? (
                    <img src={getAvatarUrl(seller.avatar) || ''} alt={seller.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">{seller.name?.charAt(0) || '👤'}</span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-avito-text">{seller.name}</h1>
                  {seller.verificationStatus === 'verified' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-sm font-medium">
                      ✓ Проверен
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500 text-lg">★</span>
                    <span className="font-semibold text-avito-text">{seller.rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-avito-text-secondary">({seller.reviewsCount || 0} отзывов)</span>
                  </div>
                </div>

                {/* City & Registration */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-avito-text-secondary mb-4">
                  {seller.city && (
                    <span className="flex items-center gap-1">📍 {seller.city}</span>
                  )}
                  <span className="flex items-center gap-1">📅 На сайте с {formatDate(seller.createdAt)}</span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  {!isOwnProfile && (
                    <>
                      <button
                        onClick={handleToggleFavorite}
                        disabled={favoriteLoading}
                        className={`px-4 py-2 rounded-avito border font-medium transition-colors ${
                          isFavorite
                            ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
                            : 'border-avito-border text-avito-text hover:bg-avito-bg'
                        } disabled:opacity-50`}
                      >
                        {favoriteLoading ? 'Загрузка...' : (
                          <span className="flex items-center gap-2">
                            {isFavorite ? '❤️ В избранном' : '🤍 В избранное'}
                          </span>
                        )}
                      </button>
                      <Link
                        href={`/messages?seller=${seller._id}`}
                        className="px-4 py-2 bg-avito-blue text-white rounded-avito font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
                      >
                        💬 Написать
                      </Link>
                    </>
                  )}
                  {isOwnProfile && (
                    <Link
                      href="/auth/profile"
                      className="px-4 py-2 bg-avito-blue text-white rounded-avito font-medium hover:bg-blue-600 transition-colors"
                    >
                      Редактировать профиль
                    </Link>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex md:flex-col gap-4 md:gap-2 md:text-right">
                <div className="bg-avito-bg rounded-lg px-4 py-3 text-center md:text-right">
                  <div className="text-2xl font-bold text-avito-text">{listings.length}</div>
                  <div className="text-sm text-avito-text-secondary">объявлений</div>
                </div>
              </div>
            </div>
          </div>

          {/* Listings */}
          <div className="bg-white rounded-avito-lg border border-avito-border p-6">
            <h2 className="text-xl font-bold text-avito-text mb-6">
              Объявления продавца ({listings.length})
            </h2>

            {listings.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-5xl block mb-4">📦</span>
                <p className="text-avito-text-secondary text-lg">
                  У продавца пока нет активных объявлений
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {listings.map((listing) => (
                  <Link
                    key={listing._id}
                    href={`/listings/${listing._id}`}
                    className="group block"
                  >
                    <div className="bg-white border border-avito-border rounded-avito overflow-hidden hover:shadow-md transition-shadow">
                      {/* Image */}
                      <div className="aspect-square bg-avito-bg relative overflow-hidden">
                        {listing.images?.length > 0 ? (
                          <img
                            src={getImageUrl(listing.images) || ''}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-4xl text-avito-text-secondary">📷</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-3">
                        <div className="text-lg font-bold text-avito-text mb-1">
                          {listing.price.toLocaleString('ru-RU')} ₽
                        </div>
                        <h3 className="text-sm text-avito-text line-clamp-2 mb-2 group-hover:text-avito-blue transition-colors">
                          {listing.title}
                        </h3>
                        <div className="text-xs text-avito-text-secondary">
                          {listing.city}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Safety tips */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-avito-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-semibold text-avito-text mb-1">Советы по безопасности</h3>
                <ul className="text-sm text-avito-text-secondary space-y-1">
                  <li>• Проверяйте товар перед покупкой</li>
                  <li>• Не переводите предоплату незнакомым продавцам</li>
                  <li>• Встречайтесь в безопасных общественных местах</li>
                </ul>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-avito-border mt-8">
          <div className="max-w-[1280px] mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">💊</span>
                <span className="font-bold text-avito-text">Диабет Маркет</span>
              </div>
              <div className="flex gap-6 text-sm text-avito-text-secondary">
                <Link href="/about" className="hover:text-avito-blue">О нас</Link>
                <Link href="/help" className="hover:text-avito-blue">Помощь</Link>
                <Link href="/terms" className="hover:text-avito-blue">Условия</Link>
              </div>
              <div className="text-sm text-avito-text-secondary">
                © 2024 Диабет Маркет
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
