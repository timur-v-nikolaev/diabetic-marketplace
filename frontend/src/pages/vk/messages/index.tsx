import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useVK } from '@/hooks/useVK';
import { chatAPI, authAPI } from '@/services/api';
import MiniAppNav from '@/components/ui/MiniAppNav';
import { EmptyState, Loading } from '@/components/ui';

interface Conversation {
  _id: string;
  listing: {
    _id: string;
    title: string;
    price: number;
    images: string[];
  };
  otherUser: {
    _id: string;
    name: string;
    avatar?: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
}

export default function VKMessages() {
  const router = useRouter();
  const { launchParams } = useVK();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    checkAuthAndLoad();
  }, [launchParams]);

  const checkAuthAndLoad = async () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      setIsAuthenticated(true);
      try {
        const profileRes = await authAPI.getProfile();
        setCurrentUserId(profileRes.data._id);
      } catch {
        // Ignore
      }
      await loadConversations();
    } else if (launchParams) {
      try {
        const response = await authAPI.vkAuth(launchParams);
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          setIsAuthenticated(true);
          setCurrentUserId(response.data.user._id);
          await loadConversations();
        }
      } catch (error) {
        console.error('VK auth failed:', error);
      }
    }
    setLoading(false);
  };

  const loadConversations = async () => {
    try {
      const response = await chatAPI.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const getImageUrl = (img?: string) => {
    if (!img) return '/placeholder.png';
    if (img.startsWith('http')) return img;
    return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${img}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Вчера';
    } else if (days < 7) {
      return date.toLocaleDateString('ru-RU', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading type="fullscreen" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <header className="bg-gradient-to-r from-blue-500 to-blue-600 sticky top-0 z-50">
          <div className="px-4 py-4 flex items-center justify-center">
            <h1 className="text-lg font-bold text-white">Сообщения</h1>
          </div>
        </header>
        <EmptyState
          icon="🔒"
          title="Требуется вход"
          description="Войдите, чтобы просматривать сообщения"
          actionLabel="На главную"
          onAction={() => router.push('/vk')}
        />
        <MiniAppNav prefix="/vk" />
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
        <header className="bg-gradient-to-r from-blue-500 to-blue-600 sticky top-0 z-50">
          <div className="px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => router.push('/vk')}
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
            >
              <span className="text-white text-xl">←</span>
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white">Сообщения</h1>
              <p className="text-blue-100 text-sm">{conversations.length} диалогов</p>
            </div>
          </div>
        </header>

        {/* Conversations List */}
        {conversations.length === 0 ? (
          <EmptyState
            icon="💬"
            title="Нет сообщений"
            description="Напишите продавцу, чтобы начать диалог"
            actionLabel="Смотреть товары"
            onAction={() => router.push('/vk')}
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => router.push(`/vk/messages/${conv._id}`)}
                className="w-full p-4 bg-white flex items-center gap-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
              >
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center overflow-hidden">
                    {conv.listing.images?.[0] ? (
                      <img
                        src={getImageUrl(conv.listing.images[0])}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-2xl">📦</span>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{conv.unreadCount}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-gray-800 truncate">{conv.otherUser.name}</span>
                    {conv.lastMessage && (
                      <span className="text-xs text-gray-400">{formatTime(conv.lastMessage.createdAt)}</span>
                    )}
                  </div>
                  <p className="text-sm text-blue-600 font-medium truncate mb-0.5">{conv.listing.title}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {conv.lastMessage?.senderId === currentUserId && <span className="text-gray-400">Вы: </span>}
                    {conv.lastMessage?.content || 'Нет сообщений'}
                  </p>
                </div>
                <div className="text-gray-300">›</div>
              </button>
            ))}
          </div>
        )}

        <MiniAppNav prefix="/vk" />
      </div>
    </>
  );
}
