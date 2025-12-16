import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { listingsAPI } from '../../services/api';

export default function MyListings() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (user?.id) {
          const response = await listingsAPI.getByUserId(user.id);
          setListings(response.data || []);
        }
      } catch (err: any) {
        console.error('Ошибка при загрузке объявлений:', err);
        setError('Ошибка при загрузке объявлений');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.id) {
      fetchListings();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const filteredListings = listings.filter((listing) => {
    if (filterStatus === 'all') return true;
    return listing.status === filterStatus;
  });

  // Защита маршрута
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-diabetes-50 via-white to-health-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-warm-900 mb-4">
            Необходима авторизация
          </h1>
          <p className="text-warm-600 mb-8">
            Пожалуйста, войдите в аккаунт для просмотра своих объявлений
          </p>
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:shadow-medium transition-all"
          >
            Войти в аккаунт
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-diabetes-50 via-white to-health-50">
        <header className="sticky top-0 z-50 bg-white shadow-soft border-b-4 border-diabetes-600">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-health-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">💊</span>
              </div>
              <h1 className="text-2xl font-bold text-warm-900">Диабет Маркет</h1>
            </Link>
          </div>
        </header>

        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
            <p className="text-warm-600 font-medium">Загрузка объявлений...</p>
          </div>
        </div>
      </div>
    );
  }

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

          <nav className="flex gap-4 items-center">
            <Link href="/" className="text-warm-700 hover:text-warm-900 font-medium">
              Главная
            </Link>
            <Link href="/auth/profile" className="text-warm-700 hover:text-warm-900 font-medium">
              Профиль
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-health-500 text-white rounded-lg hover:bg-health-600 transition-colors font-medium"
            >
              Выход
            </button>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-warm-900 mb-2">
            📋 Мои объявления
          </h1>
          <p className="text-warm-600 mb-6">
            Управляйте всеми своими товарами в одном месте
          </p>

          <div className="flex gap-4 mb-6">
            <Link
              href="/listings/create"
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:shadow-medium transition-all flex items-center gap-2"
            >
              <span>➕</span> Создать объявление
            </Link>
            <Link
              href="/auth/profile"
              className="px-6 py-3 border-2 border-primary-300 text-warm-900 font-semibold rounded-lg hover:bg-warm-50 transition-all flex items-center gap-2"
            >
              <span>👤</span> Профиль
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <span className="text-red-600 mt-1">⚠️</span>
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-soft border border-warm-200 p-4 mb-8">
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'all'
                  ? 'bg-primary-600 text-white shadow-soft'
                  : 'bg-warm-50 text-warm-900 hover:bg-warm-100'
              }`}
            >
              Все ({listings.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'active'
                  ? 'bg-health-500 text-white shadow-soft'
                  : 'bg-health-50 text-health-900 hover:bg-health-100'
              }`}
            >
              Активные ({listings.filter((l) => l.status === 'active').length})
            </button>
            <button
              onClick={() => setFilterStatus('sold')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'sold'
                  ? 'bg-accent-main text-white shadow-soft'
                  : 'bg-accent-50 text-accent-900 hover:bg-accent-100'
              }`}
            >
              Проданные ({listings.filter((l) => l.status === 'sold').length})
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-medium border border-warm-200 p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-warm-900 mb-2">
              Нет объявлений
            </h2>
            <p className="text-warm-600 mb-6">
              {filterStatus === 'all'
                ? 'Вы еще не создали ни одного объявления'
                : `Нет ${filterStatus === 'active' ? 'активных' : 'проданных'} объявлений`}
            </p>
            <Link
              href="/listings/create"
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:shadow-medium transition-all inline-block"
            >
              Создать первое объявление
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing: any) => (
              <div
                key={listing._id}
                className="bg-white rounded-xl shadow-soft border border-warm-200 overflow-hidden hover:shadow-medium transition-all"
              >
                {/* Image */}
                <div className="bg-gradient-to-br from-diabetes-100 to-health-100 h-48 flex items-center justify-center text-6xl relative">
                  {listing.images?.length > 0 ? '🖼️' : '📷'}
                  <div className="absolute top-3 right-3 px-3 py-1 bg-primary-600 text-white rounded-full text-sm font-bold">
                    {listing.status === 'active' ? '✅ Активно' : '✓ Продано'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-warm-900 mb-2 line-clamp-2">
                    {listing.title}
                  </h3>

                  <p className="text-2xl font-bold text-primary-600 mb-3">
                    ₽{listing.price.toLocaleString()}
                  </p>

                  {/* Info */}
                  <div className="space-y-1 mb-4 text-sm text-warm-600">
                    <p>📂 {listing.category}</p>
                    <p>🏙️ {listing.city}</p>
                    <p>👁️ {listing.views || 0} просмотров</p>
                    <p>⭐ Рейтинг: {listing.rating || 0}</p>
                    <p>💬 Отзывов: {listing.reviewsCount || 0}</p>
                  </div>

                  {/* Description Preview */}
                  <p className="text-sm text-warm-700 mb-4 line-clamp-2">
                    {listing.description}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/listings/${listing._id}`}
                      className="flex-1 px-3 py-2 border-2 border-primary-300 text-warm-900 font-medium rounded-lg hover:bg-warm-50 transition-all text-sm text-center"
                    >
                      Просмотр
                    </Link>
                    <button className="flex-1 px-3 py-2 border-2 border-health-500 text-primary-600 font-medium rounded-lg hover:bg-health-50 transition-all text-sm">
                      Изменить
                    </button>
                    <button className="flex-1 px-3 py-2 border-2 border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-all text-sm">
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
