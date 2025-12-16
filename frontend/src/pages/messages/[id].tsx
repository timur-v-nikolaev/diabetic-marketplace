import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
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
      // Обновляем сообщения каждые 3 секунды
      intervalRef.current = setInterval(loadMessages, 10000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, authLoading, id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChat = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getMessages(id as string);
      setMessages(response.data);
      
      // Получаем информацию о чате из первого сообщения или из API
      // Здесь нужно будет добавить отдельный эндпоинт для получения информации о чате
      // Пока просто загружаем сообщения
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
      // Игнорируем ошибки при фоновом обновлении
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
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const shouldShowDate = (currentMsg: Message, prevMsg?: Message) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();
    return currentDate !== prevDate;
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Загрузка...</p>
      </div>
    );
  }

  const otherUser = messages.length > 0 
    ? messages.find(m => m.senderId._id !== user?._id)?.senderId
    : null;

  return (
    <>
      <Head>
        <title>Чат - Diabetic Marketplace</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg flex flex-col h-[calc(100vh-12rem)]">
          {/* Header */}
          <div className="p-4 border-b flex items-center gap-3">
            <button
              onClick={() => router.push('/messages')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Назад
            </button>
            {otherUser && (
              <>
                {otherUser.avatar ? (
                  <img
                    src={`http://localhost:5001${otherUser.avatar}`}
                    alt={otherUser.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                    {otherUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <h2 className="font-semibold text-lg">{otherUser.name}</h2>
              </>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 text-sm">
              {error}
            </div>
          )}

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Нет сообщений. Начните общение!
              </div>
            ) : (
              messages.map((message, index) => {
                const isOwnMessage = message.senderId._id === user?._id;
                const showDate = shouldShowDate(message, messages[index - 1]);

                return (
                  <div key={message._id}>
                    {showDate && (
                      <div className="text-center text-xs text-gray-500 my-4">
                        {formatDate(message.createdAt)}
                      </div>
                    )}
                    <div
                      className={`flex ${
                        isOwnMessage ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isOwnMessage
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="break-words">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Введите сообщение..."
                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {sending ? 'Отправка...' : 'Отправить'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
