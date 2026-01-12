import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { chatAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

interface Participant {
  _id: string;
  name: string;
  avatar?: string;
}

interface Listing {
  _id: string;
  title: string;
  price: number;
  images?: string[];
}

interface Conversation {
  _id: string;
  participants: Participant[];
  listingId: Listing;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      loadConversations();
    }
  }, [user, authLoading, router]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getConversations();
      setConversations(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось загрузить чаты');
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (participants: Participant[]) => {
    return participants.find((p) => p._id !== user?._id);
  };

  const formatDate = (date?: string) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'сейчас';
    if (diffMins < 60) return `${diffMins}м`;
    if (diffHours < 24) return `${diffHours}ч`;
    if (diffDays < 7) return `${diffDays}д`;
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-4 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Link href="/" className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-xl">←</span>
            </Link>
            <h1 className="text-lg font-bold">Сообщения</h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Загрузка чатов...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Сообщения - Диабет Маркет</title>
      </Head>

      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all">
                <span className="text-xl">←</span>
              </Link>
              <div>
                <h1 className="text-lg font-bold">Сообщения</h1>
                <p className="text-blue-100 text-sm">{conversations.length} диалогов</p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mx-4 mt-4 p-4 bg-red-50 rounded-2xl flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {conversations.length === 0 ? (
            <div className="px-4 py-12">
              <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">💬</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Нет сообщений</h2>
                <p className="text-gray-500 mb-6">
                  Начните общение, написав продавцу
                </p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg"
                >
                  Смотреть товары
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversations.map((conversation) => {
                const otherUser = getOtherParticipant(conversation.participants);
                const listing = conversation.listingId;

                return (
                  <div
                    key={conversation._id}
                    onClick={() => router.push(`/messages/${conversation._id}`)}
                    className="bg-white hover:bg-gray-50 cursor-pointer transition-all p-4"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          {otherUser?.avatar ? (
                            <img
                              src={`http://localhost:5001${otherUser.avatar}`}
                              alt={otherUser.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-xl font-bold">
                              {otherUser?.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        {conversation.unreadCount && conversation.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-gray-800 truncate">
                            {otherUser?.name || 'Пользователь'}
                          </h3>
                          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                            {formatDate(conversation.lastMessageAt)}
                          </span>
                        </div>

                        {/* Listing preview */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500 truncate">
                            📦 {listing?.title}
                          </span>
                          <span className="text-xs font-bold text-blue-600">
                            {listing?.price?.toLocaleString()} ₽
                          </span>
                        </div>

                        {/* Last message */}
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage || 'Начните диалог...'}
                        </p>
                      </div>

                      {/* Arrow */}
                      <span className="text-gray-300 text-xl">→</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 safe-area-pb">
          <div className="max-w-4xl mx-auto flex justify-around">
            <Link href="/" className="flex flex-col items-center gap-1 text-gray-400">
              <span className="text-xl">🏠</span>
              <span className="text-xs">Главная</span>
            </Link>
            <Link href="/listings" className="flex flex-col items-center gap-1 text-gray-400">
              <span className="text-xl">📋</span>
              <span className="text-xs">Объявления</span>
            </Link>
            <Link href="/listings/create" className="flex flex-col items-center gap-1 text-gray-400">
              <div className="w-12 h-12 -mt-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">+</span>
              </div>
            </Link>
            <Link href="/messages" className="flex flex-col items-center gap-1 text-blue-500">
              <span className="text-xl">💬</span>
              <span className="text-xs font-semibold">Сообщения</span>
            </Link>
            <Link href="/auth/profile" className="flex flex-col items-center gap-1 text-gray-400">
              <span className="text-xl">👤</span>
              <span className="text-xs">Профиль</span>
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
