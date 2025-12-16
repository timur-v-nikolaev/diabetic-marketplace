import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
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
  }, [user, authLoading]);

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

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;
    return d.toLocaleDateString('ru-RU');
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-warm-700 font-medium">Загрузка сообщений...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Мои сообщения - Диабет Маркет</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-warm-50 to-primary-50/30">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold text-warm-900 mb-2">
              💬 Мои сообщения
            </h1>
            <p className="text-warm-600">Общайтесь с покупателями и продавцами</p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl mb-6">
              ❌ {error}
            </div>
          )}

          {conversations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-soft p-12 text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-warm-700 text-lg mb-6">У вас пока нет сообщений</p>
              <button
                onClick={() => router.push('/listings')}
                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 font-bold shadow-medium hover:shadow-large transition-all"
              >
                🛍️ Перейти к объявлениям
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-soft overflow-hidden divide-y divide-warm-200">
            {conversations.map((conversation) => {
              const otherUser = getOtherParticipant(conversation.participants);
              const listing = conversation.listingId;

              return (
                <div
                  key={conversation._id}
                  onClick={() => router.push(`/messages/${conversation._id}`)}
                  className="p-6 hover:bg-warm-50 cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {otherUser?.avatar ? (
                        <img
                          src={`http://localhost:5001${otherUser.avatar}`}
                          alt={otherUser.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-primary-200"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-xl shadow-soft">
                          {otherUser?.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg text-warm-900 truncate">
                          {otherUser?.name || 'Неизвестный пользователь'}
                        </h3>
                        <span className="text-xs text-warm-500 ml-2 flex-shrink-0 font-medium">
                          🕐 {formatDate(conversation.lastMessageAt)}
                        </span>
                      </div>

                      {/* Listing info */}
                      <div className="flex items-center gap-3 mb-2 bg-warm-50 p-2 rounded-lg">
                        {listing?.images && listing.images.length > 0 && (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-warm-700 truncate font-medium">
                            {listing?.title}
                          </p>
                          <p className="text-sm font-bold text-primary-600">
                            {listing?.price.toLocaleString('ru-RU')} ₽
                          </p>
                        </div>
                      </div>

                      {/* Last message */}
                      {conversation.lastMessage && (
                        <p className="text-sm text-warm-600 truncate">
                          💬 {conversation.lastMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
