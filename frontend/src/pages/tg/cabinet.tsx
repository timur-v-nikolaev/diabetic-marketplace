import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { authAPI } from '@/services/api';
import MiniAppNav from '@/components/ui/MiniAppNav';
import { EmptyState } from '@/components/ui';

// Telegram WebApp SDK hook
const useTelegram = () => {
  const [tg, setTg] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const telegram = (window as any).Telegram.WebApp;
      telegram.ready();
      setTg(telegram);
      setUser(telegram.initDataUnsafe?.user || null);
    }
  }, []);

  return { tg, user };
};

interface UserProfile {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
  rating: number;
  reviewsCount: number;
  listingsCount: number;
  verificationStatus: string;
}

export default function TGCabinet() {
  const router = useRouter();
  const { user: tgUser } = useTelegram();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setProfile(response.data);
    } catch (err) {
      console.error('Ошибка загрузки профиля:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (avatar?: string) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${avatar}`;
  };

  return (
    <>
      <Head>
        <title>Кабинет - Диабет Маркет</title>
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </Head>

      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-500 to-blue-600 sticky top-0 z-50">
          <div className="px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
            >
              <span className="text-white text-xl">←</span>
            </button>
            <h1 className="text-lg font-bold text-white">Кабинет</h1>
          </div>
        </header>

        <div className="p-4 space-y-4">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center overflow-hidden">
                {profile?.avatar || tgUser?.photo_url ? (
                  <img
                    src={getAvatarUrl(profile?.avatar) || tgUser?.photo_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">
                    {(profile?.name || tgUser?.first_name || 'U').charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800">
                  {profile?.name || `${tgUser?.first_name || ''} ${tgUser?.last_name || ''}`.trim() || 'Пользователь'}
                </h2>
                {profile?.verificationStatus === 'verified' && (
                  <span className="inline-flex items-center gap-1 text-sm text-green-600">
                    ✓ Верифицирован
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <p className="text-xl font-bold text-blue-600">{profile?.listingsCount || 0}</p>
                <p className="text-xs text-gray-500">Объявлений</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-xl">
                <p className="text-xl font-bold text-yellow-600">
                  {profile?.rating ? profile.rating.toFixed(1) : '—'}
                </p>
                <p className="text-xs text-gray-500">Рейтинг</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <p className="text-xl font-bold text-green-600">{profile?.reviewsCount || 0}</p>
                <p className="text-xs text-gray-500">Отзывов</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
            <button
              onClick={() => router.push('/tg/create')}
              className="w-full p-4 flex items-center gap-4 text-left"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">📝</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">Создать объявление</p>
                <p className="text-sm text-gray-500">Продайте свой товар</p>
              </div>
              <span className="text-gray-300">›</span>
            </button>

            <button
              onClick={() => router.push('/tg/messages')}
              className="w-full p-4 flex items-center gap-4 text-left"
            >
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">💬</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">Сообщения</p>
                <p className="text-sm text-gray-500">Чаты с покупателями</p>
              </div>
              <span className="text-gray-300">›</span>
            </button>

            <button
              onClick={() => router.push('/tg')}
              className="w-full p-4 flex items-center gap-4 text-left"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">🏠</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">На главную</p>
                <p className="text-sm text-gray-500">Все товары</p>
              </div>
              <span className="text-gray-300">›</span>
            </button>
          </div>

          {/* My Listings */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Мои объявления</h3>
            <EmptyState
              icon="📦"
              title="Нет объявлений"
              description="Создайте первое объявление"
              actionLabel="Создать"
              onAction={() => router.push('/tg/create')}
            />
          </div>
        </div>

        <MiniAppNav prefix="/tg" />
      </div>
    </>
  );
}
