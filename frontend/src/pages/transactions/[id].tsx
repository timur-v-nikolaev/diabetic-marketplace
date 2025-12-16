import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { transactionsAPI, chatAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

interface Listing {
  _id: string;
  title: string;
  price: number;
  images?: string[];
  description: string;
}

interface User {
  _id: string;
  name: string;
  avatar?: string;
  phone: string;
  city: string;
}

interface Conversation {
  _id: string;
}

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

interface Transaction {
  _id: string;
  listingId: Listing;
  buyerId: User;
  sellerId: User;
  conversationId?: Conversation;
  amount: number;
  status: string;
  paymentMethod?: string;
  trackingNumber?: string;
  disputeReason?: string;
  disputeDetails?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

const statusLabels: { [key: string]: string } = {
  pending: 'Ожидает оплаты',
  paid: 'Оплачена',
  shipped: 'Отправлена',
  delivered: 'Доставлена',
  completed: 'Завершена',
  disputed: 'Спор',
  cancelled: 'Отменена',
};

export default function TransactionDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDetails, setDisputeDetails] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && id) {
      loadTransaction();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, authLoading, id]);

  useEffect(() => {
    if (transaction?.conversationId?._id) {
      loadMessages();
      // Обновляем сообщения каждые 10 секунд для снижения нагрузки
      intervalRef.current = setInterval(loadMessages, 10000);
    }
  }, [transaction?.conversationId?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadTransaction = async () => {
    try {
      setLoading(true);
      const response = await transactionsAPI.getById(id as string);
      setTransaction(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось загрузить сделку');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!transaction?.conversationId?._id) return;
    
    try {
      const response = await chatAPI.getMessages(transaction.conversationId._id);
      setMessages(response.data);
    } catch (err) {
      // Игнорируем ошибки при фоновом обновлении
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage || !transaction?.conversationId?._id) return;

    try {
      setSendingMessage(true);
      const response = await chatAPI.sendMessage(transaction.conversationId._id, newMessage.trim());
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Не удалось отправить сообщение');
    } finally {
      setSendingMessage(false);
    }
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
    });
  };

  const shouldShowDate = (currentMsg: Message, prevMsg?: Message) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();
    return currentDate !== prevDate;
  };

  const handleUpdateStatus = async (newStatus: string, data?: any) => {
    if (!transaction) return;

    try {
      setActionLoading(true);
      await transactionsAPI.updateStatus(transaction._id, newStatus, data);
      await loadTransaction();
      setTrackingNumber('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Не удалось обновить статус');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateDispute = async () => {
    if (!transaction || !disputeReason.trim()) {
      alert('Укажите причину спора');
      return;
    }

    try {
      setActionLoading(true);
      await transactionsAPI.createDispute(transaction._id, disputeReason, disputeDetails);
      await loadTransaction();
      setShowDisputeForm(false);
      setDisputeReason('');
      setDisputeDetails('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Не удалось открыть спор');
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-600">{error || 'Сделка не найдена'}</p>
        <Link href="/transactions" className="text-blue-600 hover:underline">
          ← Вернуться к сделкам
        </Link>
      </div>
    );
  }

  const isBuyer = transaction.buyerId._id === user?._id;
  const otherUser = isBuyer ? transaction.sellerId : transaction.buyerId;

  return (
    <>
      <Head>
        <title>Сделка #{transaction._id.slice(-6)} - Diabetic Marketplace</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <Link href="/transactions" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Назад к сделкам
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Статус сделки</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Текущий статус:</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                    {statusLabels[transaction.status]}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>ID сделки:</span>
                  <span className="font-mono">#{transaction._id.slice(-8)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Создана:</span>
                  <span>{new Date(transaction.createdAt).toLocaleString('ru-RU')}</span>
                </div>
              </div>
            </div>

            {/* Listing Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Информация о товаре</h2>
              <div className="flex gap-4">
                {transaction.listingId.images?.[0] && (
                  <img
                    src={transaction.listingId.images[0]}
                    alt={transaction.listingId.title}
                    className="w-32 h-32 rounded object-cover"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-lg mb-2">{transaction.listingId.title}</h3>
                  <p className="text-gray-600 mb-2">{transaction.listingId.description}</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {transaction.amount.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Действия</h2>
              <div className="space-y-3">
                {/* Buyer actions */}
                {isBuyer && transaction.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateStatus('paid', { paymentMethod: 'Наличные' })}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                  >
                    💳 Подтвердить оплату
                  </button>
                )}

                {isBuyer && transaction.status === 'shipped' && (
                  <button
                    onClick={() => handleUpdateStatus('delivered')}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                  >
                    ✅ Подтвердить получение
                  </button>
                )}

                {isBuyer && transaction.status === 'delivered' && (
                  <button
                    onClick={() => handleUpdateStatus('completed')}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    🎉 Завершить сделку
                  </button>
                )}

                {/* Seller actions */}
                {!isBuyer && transaction.status === 'paid' && (
                  <div>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Трек-номер отправления"
                      className="w-full px-4 py-2 border rounded-lg mb-2"
                    />
                    <button
                      onClick={() => handleUpdateStatus('shipped', { trackingNumber })}
                      disabled={actionLoading || !trackingNumber.trim()}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300"
                    >
                      📦 Отметить как отправлено
                    </button>
                  </div>
                )}

                {/* Cancel/Dispute */}
                {['pending', 'paid'].includes(transaction.status) && (
                  <button
                    onClick={() => handleUpdateStatus('cancelled', { cancelReason: 'По согласованию сторон' })}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 disabled:bg-gray-100"
                  >
                    ❌ Отменить сделку
                  </button>
                )}

                {['paid', 'shipped', 'delivered'].includes(transaction.status) && !showDisputeForm && (
                  <button
                    onClick={() => setShowDisputeForm(true)}
                    className="w-full px-4 py-2 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50"
                  >
                    ⚠️ Открыть спор
                  </button>
                )}

                {showDisputeForm && (
                  <div className="border rounded-lg p-4 space-y-3">
                    <input
                      type="text"
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      placeholder="Причина спора"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                    <textarea
                      value={disputeDetails}
                      onChange={(e) => setDisputeDetails(e.target.value)}
                      placeholder="Подробности (необязательно)"
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateDispute}
                        disabled={actionLoading}
                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                      >
                        Отправить
                      </button>
                      <button
                        onClick={() => setShowDisputeForm(false)}
                        className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dispute Info */}
            {transaction.status === 'disputed' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="font-semibold text-orange-900 mb-2">⚠️ Спор открыт</h3>
                <p className="text-orange-800 mb-1">
                  <strong>Причина:</strong> {transaction.disputeReason}
                </p>
                {transaction.disputeDetails && (
                  <p className="text-orange-800">
                    <strong>Детали:</strong> {transaction.disputeDetails}
                  </p>
                )}
                <p className="text-sm text-orange-700 mt-2">
                  Администрация рассмотрит спор в ближайшее время
                </p>
              </div>
            )}

            {/* Tracking */}
            {transaction.trackingNumber && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-medium text-blue-900 mb-1">📦 Трек-номер:</p>
                <p className="font-mono text-lg text-blue-800">{transaction.trackingNumber}</p>
              </div>
            )}

            {/* Chat */}
            {transaction.conversationId && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                  <h2 className="text-xl font-semibold">💬 Чат со {isBuyer ? 'продавцом' : 'покупателем'}</h2>
                </div>

                {/* Messages */}
                <div className="h-96 overflow-y-auto p-4 space-y-3">
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
                            <div className="text-center text-xs text-gray-500 my-3">
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
                      disabled={sendingMessage}
                    />
                    <button
                      type="submit"
                      disabled={sendingMessage || !newMessage.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {sendingMessage ? '...' : 'Отправить'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="font-semibold mb-4">
                {isBuyer ? 'Продавец' : 'Покупатель'}
              </h3>
              <div className="space-y-3">
                {otherUser.avatar && (
                  <img
                    src={`http://localhost:5001${otherUser.avatar}`}
                    alt={otherUser.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-medium text-lg">{otherUser.name}</p>
                  <p className="text-gray-600 text-sm">{otherUser.city}</p>
                </div>
                <a
                  href={`tel:${otherUser.phone}`}
                  className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700"
                >
                  📞 {otherUser.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
