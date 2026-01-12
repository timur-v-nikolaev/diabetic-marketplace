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
      <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700 flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
          <span className="text-4xl">🔒</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Требуется авторизация</h1>
        <p className="text-blue-100 text-center mb-8">
          Войдите в аккаунт для просмотра своих объявлений
        </p>
        <Link
          href="/auth/login"
          className="px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
        >
          Войти в аккаунт
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-4 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <Link href="/" className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-xl">←</span>
            </Link>
            <h1 className="text-lg font-bold">Мои объявления</h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Загрузка объявлений...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all">
                <span className="text-xl">←</span>
              </Link>
              <div>
                <h1 className="text-lg font-bold">Мои объявления</h1>
                <p className="text-blue-100 text-sm">{listings.length} товаров</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/profile" className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all">
                <span>👤</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <span>🚪</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Кнопка создания */}
        <Link
          href="/listings/create"
          className="block w-full mb-6 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-lg shadow-green-500/30 hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">➕</span>
            <span className="font-bold text-lg">Создать объявление</span>
          </div>
        </Link>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-sm p-2 mb-6 flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              filterStatus === 'all'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Все ({listings.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              filterStatus === 'active'
                ? 'bg-green-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ✅ Активные
          </button>
          <button
            onClick={() => setFilterStatus('sold')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              filterStatus === 'sold'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ✓ Проданные
          </button>
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📦</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Нет объявлений</h2>
            <p className="text-gray-500 mb-6">
              {filterStatus === 'all'
                ? 'Вы еще не создали ни одного объявления'
                : `Нет ${filterStatus === 'active' ? 'активных' : 'проданных'} объявлений`}
            </p>
            <Link
              href="/listings/create"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg"
            >
              Создать первое объявление
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((listing: any) => (
              <div
                key={listing._id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all"
              >
                {/* Image */}
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 h-40 flex items-center justify-center relative">
                  <span className="text-5xl">
                    {listing.images?.length > 0 ? '🖼️' : '📷'}
                  </span>
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-bold ${
                    listing.status === 'active' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-orange-500 text-white'
                  }`}>
                    {listing.status === 'active' ? '✅ Активно' : '✓ Продано'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">
                    {listing.title}
                  </h3>

                  <p className="text-2xl font-bold text-blue-600 mb-3">
                    {listing.price.toLocaleString()} ₽
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <span>👁️</span> {listing.views || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <span>💬</span> {listing.reviewsCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <span>📍</span> {listing.city}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/listings/${listing._id}`}
                      className="flex-1 py-2.5 bg-blue-50 text-blue-600 font-semibold rounded-xl text-center hover:bg-blue-100 transition-all"
                    >
                      Открыть
                    </Link>
                    <button className="py-2.5 px-4 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-all">
                      ✏️
                    </button>
                    <button className="py-2.5 px-4 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-all">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 safe-area-pb">
        <div className="max-w-6xl mx-auto flex justify-around">
          <Link href="/" className="flex flex-col items-center gap-1 text-gray-400">
            <span className="text-xl">🏠</span>
            <span className="text-xs">Главная</span>
          </Link>
          <Link href="/listings" className="flex flex-col items-center gap-1 text-blue-500">
            <span className="text-xl">📋</span>
            <span className="text-xs font-semibold">Объявления</span>
          </Link>
          <Link href="/listings/create" className="flex flex-col items-center gap-1 text-gray-400">
            <div className="w-12 h-12 -mt-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">+</span>
            </div>
          </Link>
          <Link href="/messages" className="flex flex-col items-center gap-1 text-gray-400">
            <span className="text-xl">💬</span>
            <span className="text-xs">Сообщения</span>
          </Link>
          <Link href="/auth/profile" className="flex flex-col items-center gap-1 text-gray-400">
            <span className="text-xl">👤</span>
            <span className="text-xs">Профиль</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
