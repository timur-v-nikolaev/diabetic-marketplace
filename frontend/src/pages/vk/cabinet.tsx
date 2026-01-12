import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useVK } from '../../hooks/useVK';
import MiniAppNav from '../../components/ui/MiniAppNav';
import { EmptyState } from '../../components/ui';

export default function VKCabinet() {
  const router = useRouter();
  const { user } = useVK();
  const [listings] = useState<any[]>([]);

  useEffect(() => {
    // В реальном приложении здесь будет загрузка данных
  }, []);

  const stats = [
    { label: 'Объявления', value: listings.length, icon: '📦' },
    { label: 'Продажи', value: 0, icon: '💰' },
    { label: 'Отзывы', value: 0, icon: '⭐' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-500 to-blue-600 pt-4 pb-20">
        <div className="px-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">←</span>
          </button>
          <h1 className="text-lg font-bold text-white">Профиль</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="px-4 -mt-14 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden">
              {user?.photo_200 ? (
                <img src={user.photo_200} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl text-white">👤</span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">
                {user ? `${user.first_name} ${user.last_name}` : 'Гость'}
              </h2>
              <p className="text-gray-500 text-sm">Участник маркетплейса</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <span className="text-xl">{stat.icon}</span>
                <p className="text-xl font-bold text-gray-800 mt-1">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-4 space-y-3">
        <Link
          href="/vk/create"
          className="block w-full p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-lg shadow-green-500/30"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">➕</span>
            <div>
              <p className="font-bold">Создать объявление</p>
              <p className="text-green-100 text-xs">Продайте свой товар</p>
            </div>
          </div>
        </Link>

        <Link
          href="/vk/favorites"
          className="block w-full p-4 bg-white rounded-2xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">❤️</span>
              <span className="font-semibold text-gray-800">Избранное</span>
            </div>
            <span className="text-gray-400">→</span>
          </div>
        </Link>

        <Link
          href="/vk/messages"
          className="block w-full p-4 bg-white rounded-2xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💬</span>
              <span className="font-semibold text-gray-800">Сообщения</span>
            </div>
            <span className="text-gray-400">→</span>
          </div>
        </Link>
      </div>

      {/* My Listings */}
      <div className="px-4 py-4">
        <h2 className="font-bold text-gray-800 mb-4">Мои объявления</h2>
        {listings.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Нет объявлений"
            description="Создайте первое объявление"
            actionLabel="Создать"
            actionHref="/vk/create"
          />
        ) : (
          <div className="space-y-3">
            {/* Listings will be rendered here */}
          </div>
        )}
      </div>

      <MiniAppNav prefix="/vk" />
    </div>
  );
}
