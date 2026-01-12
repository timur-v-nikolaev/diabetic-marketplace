import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { listingsAPI, chatAPI, favoritesAPI } from '@/services/api';
import MiniAppNav from '@/components/ui/MiniAppNav';
import { Loading } from '@/components/ui';

interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  city: string;
  status: string;
  views: number;
  sellerId: {
    _id: string;
    name: string;
    avatar?: string;
    rating: number;
    reviewsCount: number;
    verificationStatus: string;
    city: string;
  };
  isSaved?: boolean;
  createdAt: string;
}

export default function TGListingDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const loadListing = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await listingsAPI.getById(id as string);
      setListing(response.data);
      setIsSaved(response.data.isSaved || false);
    } catch (error) {
      console.error('Failed to load listing:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadListing();
  }, [loadListing]);

  const handleSave = async () => {
    if (!listing) return;
    
    try {
      await favoritesAPI.toggle(listing._id);
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Failed to toggle save:', error);
    }
  };

  const handleContact = async () => {
    if (!listing) return;

    try {
      const response = await chatAPI.getOrCreateConversation(
        listing._id,
        listing.sellerId._id
      );
      router.push(`/tg/messages/${response.data._id}`);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      alert('Войдите, чтобы написать продавцу');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    });
  };

  const getImageUrl = (img: string) => {
    if (!img) return '/placeholder.png';
    if (img.startsWith('http')) return img;
    return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${img}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading type="fullscreen" />
      </div>
    );
  }

  if (!listing) {
    return (
      <>
        <Head>
          <title>Товар не найден - Диабет Маркет</title>
          <script src="https://telegram.org/js/telegram-web-app.js" async />
        </Head>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <p className="text-6xl mb-4">😔</p>
          <p className="text-gray-500 text-lg">Объявление не найдено</p>
          <button
            onClick={() => router.push('/tg')}
            className="mt-4 text-blue-500 font-semibold"
          >
            ← На главную
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{listing.title} - Диабет Маркет</title>
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </Head>

      <div className="min-h-screen bg-gray-50 pb-32">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-500 to-blue-600 sticky top-0 z-50">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
            >
              <span className="text-white text-xl">←</span>
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
              >
                <span>{isSaved ? '❤️' : '🤍'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Image Gallery */}
        <div className="relative bg-white">
          {listing.images && listing.images.length > 0 ? (
            <>
              <div className="aspect-square overflow-hidden">
                <img
                  src={getImageUrl(listing.images[currentImage])}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {listing.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {listing.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === currentImage ? 'bg-blue-500 w-4' : 'bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              <span className="text-6xl">📦</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Price & Title */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-3xl font-bold text-blue-600 mb-2">
              {formatPrice(listing.price)}
            </p>
            <h1 className="text-xl font-bold text-gray-800">{listing.title}</h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <span>📍 {listing.city}</span>
              <span>•</span>
              <span>👁 {listing.views} просмотров</span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-2">Описание</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{listing.description}</p>
          </div>

          {/* Category & Date */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Категория</span>
              <span className="font-semibold text-gray-800">{listing.category}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-500">Опубликовано</span>
              <span className="font-semibold text-gray-800">{formatDate(listing.createdAt)}</span>
            </div>
          </div>

          {/* Seller */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-3">Продавец</h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center overflow-hidden">
                {listing.sellerId.avatar ? (
                  <img
                    src={getImageUrl(listing.sellerId.avatar)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {listing.sellerId.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{listing.sellerId.name}</p>
                <div className="flex items-center gap-2 text-sm">
                  {listing.sellerId.rating > 0 && (
                    <span className="text-yellow-500">⭐ {listing.sellerId.rating.toFixed(1)}</span>
                  )}
                  {listing.sellerId.verificationStatus === 'verified' && (
                    <span className="text-green-500">✓ Проверен</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-40">
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center"
            >
              <span className="text-2xl">{isSaved ? '❤️' : '🤍'}</span>
            </button>
            <button
              onClick={handleContact}
              className="flex-1 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              <span>💬</span> Написать продавцу
            </button>
          </div>
        </div>

        <MiniAppNav prefix="/tg" />
      </div>
    </>
  );
}
