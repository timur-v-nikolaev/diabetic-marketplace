import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { verificationAPI } from '../../services/api';

export default function AdminVerifications() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const fetchPendingVerifications = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const response = await verificationAPI.getPending();
        setPendingUsers(response.data.users || []);
      } catch (error: any) {
        console.error('Ошибка загрузки запросов:', error);
        if (error.response?.status === 403) {
          alert('Доступ запрещен. Только для администраторов.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPendingVerifications();
  }, [isAuthenticated]);

  const handleApprove = async (userId: string) => {
    if (!confirm('Одобрить верификацию этого пользователя?')) return;

    setProcessing(userId);
    try {
      await verificationAPI.approve(userId, 'Верификация одобрена администратором');
      setPendingUsers(pendingUsers.filter(u => u._id !== userId));
      alert('Верификация одобрена!');
    } catch (error: any) {
      console.error('Ошибка одобрения:', error);
      alert(error.response?.data?.error || 'Не удалось одобрить верификацию');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (userId: string) => {
    const reason = prompt('Укажите причину отклонения:');
    if (!reason) return;

    setProcessing(userId);
    try {
      await verificationAPI.reject(userId, reason);
      setPendingUsers(pendingUsers.filter(u => u._id !== userId));
      alert('Верификация отклонена');
    } catch (error: any) {
      console.error('Ошибка отклонения:', error);
      alert(error.response?.data?.error || 'Не удалось отклонить верификацию');
    } finally {
      setProcessing(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-diabetes-50 via-white to-health-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-warm-900 mb-4">
            Необходима авторизация
          </h1>
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Войти в аккаунт
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-diabetes-50 via-white to-health-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p className="text-warm-600 font-medium">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-diabetes-50 via-white to-health-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-soft border-b-4 border-diabetes-600">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-health-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">💊</span>
            </div>
            <h1 className="text-2xl font-bold text-warm-900">Диабет Маркет</h1>
          </Link>

          <nav className="flex gap-4">
            <Link href="/auth/profile" className="text-warm-700 hover:text-warm-900 font-medium">
              Профиль
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-warm-900 mb-2">Панель администратора</h1>
          <p className="text-warm-600">Управление запросами на верификацию продавцов</p>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-medium border border-warm-200 p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-warm-900 mb-2">
              Нет ожидающих запросов
            </h2>
            <p className="text-warm-600">
              Все запросы на верификацию обработаны
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⚠️</span>
                <div>
                  <p className="font-bold text-yellow-900">Ожидает проверки: {pendingUsers.length}</p>
                  <p className="text-yellow-700 text-sm">
                    Проверьте документы и личность продавцов перед одобрением
                  </p>
                </div>
              </div>
            </div>

            {pendingUsers.map((user) => (
              <div
                key={user._id}
                className="bg-white rounded-xl shadow-soft border border-warm-200 p-6 hover:shadow-medium transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-health-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-warm-900">{user.name}</h3>
                        <p className="text-warm-600">📧 {user.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-warm-600 mb-1">📱 Телефон</p>
                        <p className="font-medium text-warm-900">{user.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-warm-600 mb-1">🏙️ Город</p>
                        <p className="font-medium text-warm-900">{user.city}</p>
                      </div>
                      <div>
                        <p className="text-sm text-warm-600 mb-1">📅 Регистрация</p>
                        <p className="font-medium text-warm-900">
                          {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>

                    {/* Документы */}
                    {user.verificationDocuments && user.verificationDocuments.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-warm-600 mb-2 font-semibold">
                          📄 Документы для проверки:
                        </p>
                        <div className="space-y-2">
                          {user.verificationDocuments.map((doc: string, index: number) => (
                            <a
                              key={index}
                              href={doc}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block bg-warm-50 p-3 rounded-lg hover:bg-warm-100 transition-colors"
                            >
                              <span className="text-warm-800 text-sm truncate">
                                🔗 {doc}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Заметки пользователя */}
                    {user.verificationNotes && (
                      <div className="mb-4">
                        <p className="text-sm text-warm-600 mb-2 font-semibold">
                          💬 Дополнительная информация:
                        </p>
                        <div className="bg-warm-50 p-4 rounded-lg">
                          <p className="text-warm-800">{user.verificationNotes}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Действия */}
                  <div className="ml-6 flex flex-col gap-3">
                    <button
                      onClick={() => handleApprove(user._id)}
                      disabled={processing === user._id}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
                    >
                      {processing === user._id ? '⏳' : '✅'} Одобрить
                    </button>
                    <button
                      onClick={() => handleReject(user._id)}
                      disabled={processing === user._id}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
                    >
                      {processing === user._id ? '⏳' : '❌'} Отклонить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
