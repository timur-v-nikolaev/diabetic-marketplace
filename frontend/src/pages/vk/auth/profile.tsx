import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AvitoHeader from '../../../components/ui/AvitoHeader';
import AvitoBottomNav from '../../../components/ui/AvitoBottomNav';
import api from '../../../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  avatar?: string;
  rating?: number;
  reviewsCount?: number;
}

export default function VKProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    
    setIsAuthenticated(true);
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    router.push('/vk');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-avito-bg pb-20">
        <AvitoHeader minimal title="Профиль" />
        <div className="p-4 animate-pulse">
          <div className="bg-white rounded-avito-lg p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            </div>
          </div>
        </div>
        <AvitoBottomNav activeTab="profile" prefix="/vk" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Профиль — VK Mini App</title>
        </Head>
        <div className="min-h-screen bg-avito-bg pb-20">
          <AvitoHeader minimal title="Профиль" />
          <div className="p-4 text-center">
            <span className="text-5xl block mb-4">👤</span>
            <h1 className="text-lg font-bold mb-2">Войдите в аккаунт</h1>
            <p className="text-avito-text-secondary mb-4">Чтобы видеть профиль</p>
            <Link href="/vk/cabinet" className="avito-btn avito-btn-primary">
              Войти
            </Link>
          </div>
          <AvitoBottomNav activeTab="profile" prefix="/vk" />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Профиль — VK Mini App</title>
      </Head>
      <div className="min-h-screen bg-avito-bg pb-20">
        <AvitoHeader minimal title="Профиль" />

        <main className="p-4 space-y-4">
          {/* User Card */}
          <div className="bg-white rounded-avito-lg p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-avito-bg flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">👤</span>
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg">{user?.name}</h2>
                <p className="text-sm text-avito-text-secondary">{user?.email}</p>
                {user?.rating && (
                  <div className="flex items-center gap-1 mt-1 text-sm">
                    <span className="text-yellow-500">★</span>
                    <span>{user.rating.toFixed(1)}</span>
                    <span className="text-avito-text-secondary">({user.reviewsCount} отзывов)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-avito-lg divide-y divide-avito-border">
            <Link href="/vk/listings/create" className="flex items-center gap-3 p-4">
              <span className="text-xl">📝</span>
              <span className="flex-1">Мои объявления</span>
              <svg className="w-5 h-5 text-avito-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/vk/favorites" className="flex items-center gap-3 p-4">
              <span className="text-xl">❤️</span>
              <span className="flex-1">Избранное</span>
              <svg className="w-5 h-5 text-avito-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/vk/messages" className="flex items-center gap-3 p-4">
              <span className="text-xl">💬</span>
              <span className="flex-1">Сообщения</span>
              <svg className="w-5 h-5 text-avito-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Info */}
          {(user?.phone || user?.city) && (
            <div className="bg-white rounded-avito-lg p-4 space-y-3">
              {user?.phone && (
                <div className="flex items-center gap-3">
                  <span className="text-xl">📞</span>
                  <span>{user.phone}</span>
                </div>
              )}
              {user?.city && (
                <div className="flex items-center gap-3">
                  <span className="text-xl">📍</span>
                  <span>{user.city}</span>
                </div>
              )}
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full py-3.5 bg-white text-red-500 font-medium rounded-avito-lg"
          >
            Выйти
          </button>
        </main>

        <AvitoBottomNav activeTab="profile" prefix="/vk" />
      </div>
    </>
  );
}
