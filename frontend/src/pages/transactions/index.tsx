import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { transactionsAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

interface Listing {
  _id: string;
  title: string;
  price: number;
  images?: string[];
}

interface User {
  _id: string;
  name: string;
  avatar?: string;
}

interface Transaction {
  _id: string;
  listingId: Listing;
  buyerId: User;
  sellerId: User;
  amount: number;
  status: string;
  createdAt: string;
  trackingNumber?: string;
}

const statusLabels: { [key: string]: string } = {
  pending: '⏳ Ожидает оплаты',
  paid: '💳 Оплачена',
  shipped: '📦 Отправлена',
  delivered: '✅ Доставлена',
  completed: '🎉 Завершена',
  disputed: '⚠️ Спор',
  cancelled: '❌ Отменена',
};

const statusColors: { [key: string]: string } = {
  pending: 'bg-accent-100 text-accent-800',
  paid: 'bg-secondary-100 text-secondary-800',
  shipped: 'bg-primary-100 text-primary-800',
  delivered: 'bg-success/20 text-success',
  completed: 'bg-success/30 text-success',
  disputed: 'bg-red-100 text-red-800',
  cancelled: 'bg-warm-200 text-warm-700',
};

export default function TransactionsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'buyer' | 'seller'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      loadTransactions();
    }
  }, [user, authLoading, activeTab]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const role = activeTab === 'all' ? undefined : activeTab;
      const response = await transactionsAPI.getAll(role);
      setTransactions(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось загрузить сделки');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-warm-700 font-medium">Загрузка сделок...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Мои сделки - Диабет Маркет</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-warm-50 to-primary-50/30">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold text-warm-900 mb-2">
              💼 Безопасные сделки
            </h1>
            <p className="text-warm-600">Управляйте своими покупками и продажами</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-white rounded-xl shadow-soft p-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-medium'
                  : 'text-warm-700 hover:bg-warm-50'
              }`}
            >
              📊 Все сделки
            </button>
            <button
              onClick={() => setActiveTab('buyer')}
              className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all ${
                activeTab === 'buyer'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-medium'
                  : 'text-warm-700 hover:bg-warm-50'
              }`}
            >
              🛍️ Мои покупки
            </button>
            <button
              onClick={() => setActiveTab('seller')}
              className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all ${
                activeTab === 'seller'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-medium'
                  : 'text-warm-700 hover:bg-warm-50'
              }`}
            >
              💰 Мои продажи
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl mb-6">
              ❌ {error}
            </div>
          )}

          {transactions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-soft p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-warm-700 text-lg mb-6">У вас пока нет сделок</p>
              <button
                onClick={() => router.push('/listings')}
                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 font-bold shadow-medium hover:shadow-large transition-all"
              >
                🛍️ Перейти к объявлениям
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {transactions.map((transaction) => {
              const isBuyer = transaction.buyerId._id === user?._id;
              const otherUser = isBuyer ? transaction.sellerId : transaction.buyerId;
              const role = isBuyer ? 'Покупка' : 'Продажа';

              return (
                <div
                  key={transaction._id}
                  onClick={() => router.push(`/transactions/${transaction._id}`)}
                  className="bg-white rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 p-6 cursor-pointer border border-warm-200 hover:border-primary-300"
                >
                  <div className="flex items-start gap-6">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      {transaction.listingId.images?.[0] ? (
                        <img
                          src={transaction.listingId.images[0]}
                          alt={transaction.listingId.title}
                          className="w-28 h-28 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-xl bg-gradient-to-br from-warm-100 to-primary-100 flex items-center justify-center">
                          <span className="text-4xl">📦</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-xl text-warm-900 mb-2">
                            {transaction.listingId.title}
                          </h3>
                          <p className="text-sm text-warm-600 flex items-center gap-2">
                            <span className={isBuyer ? '🛍️' : '💰'}>{role}</span>
                            <span>•</span>
                            <span className="font-medium">{otherUser.name}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-2xl text-primary-600">
                            {transaction.amount.toLocaleString('ru-RU')}
                          </p>
                          <p className="text-primary-500 font-semibold">₽</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <span
                          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                            statusColors[transaction.status]
                          }`}
                        >
                          {statusLabels[transaction.status]}
                        </span>
                        <span className="text-sm text-warm-500 font-medium">
                          📅 {new Date(transaction.createdAt).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      {transaction.trackingNumber && (
                        <div className="mt-3 bg-warm-50 rounded-lg p-3">
                          <p className="text-sm text-warm-700">
                            📦 Трек-номер: <span className="font-mono font-semibold text-primary-600">{transaction.trackingNumber}</span>
                          </p>
                        </div>
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
