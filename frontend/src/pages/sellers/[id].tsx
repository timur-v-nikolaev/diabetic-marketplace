import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { listingsAPI, favoritesAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export default function SellerProfile() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, user } = useAuth();
  const [seller, setSeller] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Получаем объявления продавца
        const listingsResponse = await listingsAPI.getByUserId(id as string);
        const sellerListings = listingsResponse.data || [];
        setListings(sellerListings);

        // Если есть хотя бы одно объявление, получаем информацию о продавце из него
        if (sellerListings.length > 0 && sellerListings[0].sellerId) {
          setSeller(sellerListings[0].sellerId);
        } else {
          // Если объявлений нет, пробуем получить информацию о пользователе напрямую
          // (это требует создания отдельного API эндпоинта)
          setSeller({ _id: id, name: 'Продавец', rating: 0, reviewsCount: 0, city: 'Не указан' });
        }
      } catch (error) {
        console.error('Failed to fetch seller data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [id]);

  const handleAddToFavorites = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!id) return;

    try {
      setFavoriteLoading(true);
      await favoritesAPI.addSeller(id as string);
      alert('✅ Продавец добавлен в избранное!');
    } catch (error: any) {
      if (error.response?.data?.error === 'Seller already in favorites') {
        alert('ℹ️ Продавец уже в избранном');
      } else {
        alert('❌ Не удалось добавить продавца в избранное');
      }
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-diabetes-50 via-white to-health-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p className="text-warm-600 font-medium">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-diabetes-50 via-white to-health-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-warm-900 mb-4">Продавец не найден</h1>
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:shadow-medium transition-all inline-block"
          >
            ← На главную
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === id || user?._id === id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-diabetes-50 via-white to-health-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-soft border-b-4 border-diabetes-600">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-health-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">💊</span>
            </div>
            <h1 className="text-2xl font-bold text-warm-900">Диабет Маркет</h1>
          </Link>

          <nav className="flex gap-4">
            <Link href="/" className="text-warm-700 hover:text-warm-900 font-medium">
              Главная
            </Link>
            {isAuthenticated && (
              <Link href="/auth/profile" className="text-warm-700 hover:text-warm-900 font-medium">
                Профиль
              </Link>
            )}
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Seller Profile Header */}
        <div className="bg-white rounded-2xl shadow-medium border border-warm-200 p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary-600 to-health-500 flex items-center justify-center text-white text-5xl font-bold shadow-soft border-4 border-white">
                {seller.avatar ? (
                  <img 
                    src={`http://localhost:5001${seller.avatar}`} 
                    alt={seller.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{seller.name?.charAt(0) || '?'}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-warm-900">
                    {seller.name}
                  </h1>
                  {seller.verificationStatus === 'verified' && (
                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
                      ✅ Верифицирован
                    </div>
                  )}
                </div>
                <p className="text-warm-600 mb-1">📍 {seller.city}</p>
                <div className="flex items-center gap-4 text-warm-600">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold">{seller.rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-sm">({seller.reviewsCount || 0} отзывов)</span>
                  </div>
                </div>
              </div>
            </div>

            {!isOwnProfile && isAuthenticated && (
              <button
                onClick={handleAddToFavorites}
                disabled={favoriteLoading}
                className="px-6 py-3 border-2 border-yellow-500 text-yellow-600 font-semibold rounded-lg hover:bg-yellow-50 transition-all disabled:opacity-50"
              >
                {favoriteLoading ? '⏳ Добавление...' : '⭐ Добавить в избранное'}
              </button>
            )}

            {isOwnProfile && (
              <Link
                href="/auth/profile"
                className="px-6 py-3 border-2 border-primary-300 text-warm-900 font-semibold rounded-lg hover:bg-warm-50 transition-all"
              >
                ⚙️ Редактировать профиль
              </Link>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-soft border border-warm-200 p-6">
            <div className="text-3xl font-bold text-warm-900 mb-2">{listings.length}</div>
            <div className="text-warm-600">Активных объявлений</div>
          </div>
          <div className="bg-white rounded-xl shadow-soft border border-warm-200 p-6">
            <div className="text-3xl font-bold text-warm-900 mb-2">{seller.rating?.toFixed(1) || '0.0'}</div>
            <div className="text-warm-600">Средний рейтинг</div>
          </div>
          <div className="bg-white rounded-xl shadow-soft border border-warm-200 p-6">
            <div className="text-3xl font-bold text-warm-900 mb-2">{seller.reviewsCount || 0}</div>
            <div className="text-warm-600">Отзывов</div>
          </div>
        </div>

        {/* Listings */}
        <div className="bg-white rounded-2xl shadow-medium border border-warm-200 p-8">
          <h2 className="text-2xl font-bold text-warm-900 mb-6 flex items-center gap-2">
            <span>📋</span> Объявления продавца
          </h2>

          {listings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-warm-600 text-lg">
                У продавца пока нет активных объявлений
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing: any) => (
                <Link
                  key={listing._id}
                  href={`/listings/${listing._id}`}
                  className="border-2 border-warm-300 rounded-lg p-4 hover:shadow-soft transition-all hover:border-diabetes-400 block"
                >
                  <div className="bg-gradient-to-br from-diabetes-100 to-health-100 h-40 rounded-lg mb-4 flex items-center justify-center text-4xl">
                    {listing.images?.length > 0 ? '🖼️' : '📷'}
                  </div>
                  <h3 className="font-bold text-warm-900 mb-2 line-clamp-2">
                    {listing.title}
                  </h3>
                  <p className="text-2xl font-bold text-primary-600 mb-3">
                    ₽{listing.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-warm-600 mb-1">
                    📂 {listing.category}
                  </p>
                  <p className="text-sm text-warm-600">
                    📍 {listing.city}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
