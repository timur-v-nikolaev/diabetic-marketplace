import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useVK } from '@/hooks/useVK';
import { chatAPI, authAPI } from '@/services/api';
import { Loading } from '@/components/ui';

interface Message {
  _id: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

interface ConversationDetail {
  _id: string;
  listing: {
    _id: string;
    title: string;
    price: number;
    images: string[];
    status: string;
  };
  otherUser: {
    _id: string;
    name: string;
    avatar?: string;
  };
  messages: Message[];
}

export default function VKChat() {
  const router = useRouter();
  const { id } = router.query;
  const { launchParams, hapticFeedback } = useVK();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    checkAuthAndLoad();
  }, [id, launchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const checkAuthAndLoad = async () => {
    if (!id) return;

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const profileRes = await authAPI.getProfile();
        setCurrentUserId(profileRes.data._id);
      } catch {
        // Ignore
      }
      await loadConversation();
    } else if (launchParams) {
      try {
        const response = await authAPI.vkAuth(launchParams);
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          setCurrentUserId(response.data.user._id);
          await loadConversation();
        }
      } catch (error) {
        console.error('VK auth failed:', error);
      }
    }
    setLoading(false);
  };

  const loadConversation = async () => {
    try {
      const response = await chatAPI.getConversation(id as string);
      setConversation(response.data);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || sending || !id) return;
    
    hapticFeedback('success');
    setSending(true);

    try {
      await chatAPI.sendMessage(id as string, message.trim());
      setMessage('');
      await loadConversation();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const getImageUrl = (img?: string) => {
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

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-6xl mb-4">😔</p>
        <p className="text-gray-500 text-lg">Чат не найден</p>
        <button
          onClick={() => router.push('/vk/messages')}
          className="mt-4 text-blue-500 font-semibold"
        >
          ← К сообщениям
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Чат - {conversation.otherUser.name}</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-500 to-blue-600 sticky top-0 z-50">
          <div className="px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => router.push('/vk/messages')}
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
            >
              <span className="text-white text-xl">←</span>
            </button>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center overflow-hidden">
              {conversation.otherUser.avatar ? (
                <img
                  src={getImageUrl(conversation.otherUser.avatar)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold">
                  {conversation.otherUser.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-bold truncate">{conversation.otherUser.name}</h1>
              <p className="text-blue-100 text-sm">онлайн</p>
            </div>
          </div>
        </header>

        {/* Listing Info */}
        <button
          onClick={() => router.push(`/vk/listings/${conversation.listing._id}`)}
          className="mx-4 mt-4 p-3 bg-white rounded-2xl shadow-sm flex items-center gap-3"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
            {conversation.listing.images?.[0] ? (
              <img
                src={getImageUrl(conversation.listing.images[0])}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
            )}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="font-semibold text-gray-800 truncate text-sm">{conversation.listing.title}</p>
            <p className="text-blue-600 font-bold">{formatPrice(conversation.listing.price)}</p>
          </div>
          <span className="text-gray-300">›</span>
        </button>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {conversation.messages.map((msg) => {
            const isOwn = msg.senderId === currentUserId;
            return (
              <div
                key={msg._id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    isOwn
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                    {formatTime(msg.createdAt)}
                    {isOwn && (
                      <span className="ml-1">
                        {msg.read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Напишите сообщение..."
              className="flex-1 px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || sending}
              className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white disabled:opacity-50"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-xl">↑</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
