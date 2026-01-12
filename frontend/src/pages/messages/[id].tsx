import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { chatAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

interface Sender {
  _id: string;
  name: string;
  avatar?: string;
}

interface Message {
  _id: string;
  senderId: Sender;
  text: string;
  read: boolean;
  createdAt: string;
}

export default function ChatPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && id) {
      loadChat();
      intervalRef.current = setInterval(loadMessages, 10000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, authLoading, id, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChat = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getMessages(id as string);
      setMessages(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось загрузить чат');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await chatAPI.getMessages(id as string);
      setMessages(response.data);
    } catch (err) {
      // Ignore background errors
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await chatAPI.sendMessage(id as string, newMessage.trim());
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось отправить сообщение');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    }
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    });
  };

  const shouldShowDate = (currentMsg: Message, prevMsg?: Message) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();
    return currentDate !== prevDate;
  };

  const otherUser = messages.length > 0 
    ? messages.find(m => m.senderId._id !== user?._id)?.senderId
    : null;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-4 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Link href="/messages" className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-xl">←</span>
            </Link>
            <h1 className="text-lg font-bold">Загрузка...</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Чат - Диабет Маркет</title>
      </Head>

      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Link 
              href="/messages" 
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <span className="text-xl">←</span>
            </Link>
            
            {otherUser && (
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/20 flex items-center justify-center">
                  {otherUser.avatar ? (
                    <img
                      src={`http://localhost:5001${otherUser.avatar}`}
                      alt={otherUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold">
                      {otherUser.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="font-bold">{otherUser.name}</h1>
                  <p className="text-blue-100 text-xs">онлайн</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 text-center text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <span className="text-3xl">💬</span>
                </div>
                <p className="text-gray-500">Начните общение!</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isOwnMessage = message.senderId._id === user?._id;
                const showDate = shouldShowDate(message, messages[index - 1]);

                return (
                  <div key={message._id}>
                    {showDate && (
                      <div className="flex justify-center my-6">
                        <span className="px-4 py-1 bg-white rounded-full text-xs text-gray-500 shadow-sm">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] md:max-w-[60%] rounded-2xl px-4 py-3 shadow-sm ${
                          isOwnMessage
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                            : 'bg-white text-gray-800 rounded-bl-md'
                        }`}
                      >
                        <p className="break-words leading-relaxed">{message.text}</p>
                        <p className={`text-xs mt-1 flex items-center gap-1 ${
                          isOwnMessage ? 'text-blue-100 justify-end' : 'text-gray-400'
                        }`}>
                          {formatTime(message.createdAt)}
                          {isOwnMessage && (
                            <span>{message.read ? '✓✓' : '✓'}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-100 p-4 sticky bottom-0 safe-area-pb">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Сообщение..."
              className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-xl">→</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
