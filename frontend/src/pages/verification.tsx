import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { verificationAPI } from '../services/api';

export default function VerificationPage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [documents, setDocuments] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [documentInput, setDocumentInput] = useState('');

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const response = await verificationAPI.getStatus();
        setVerificationStatus(response.data);
      } catch (error) {
        console.error('Ошибка загрузки статуса верификации:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationStatus();
  }, [isAuthenticated]);

  const handleAddDocument = () => {
    if (documentInput.trim()) {
      setDocuments([...documents, documentInput.trim()]);
      setDocumentInput('');
    }
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await verificationAPI.requestVerification({
        documents,
        notes,
      });
      
      setVerificationStatus({
        verificationStatus: 'pending',
        verificationDate: null,
        verificationNotes: '',
      });
      
      alert('Запрос на верификацию отправлен! Мы рассмотрим его в течение 24-48 часов.');
    } catch (error: any) {
      console.error('Ошибка отправки запроса:', error);
      alert(error.response?.data?.error || 'Не удалось отправить запрос на верификацию');
    } finally {
      setSubmitting(false);
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

  const status = verificationStatus?.verificationStatus || 'none';

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

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-warm-900 mb-8">Верификация продавца</h1>

        {/* Статус верификации */}
        {status === 'verified' && (
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-5xl">✅</div>
              <div>
                <h2 className="text-2xl font-bold text-green-900 mb-2">
                  Вы верифицированный продавец!
                </h2>
                <p className="text-green-700 mb-2">
                  Дата верификации: {new Date(verificationStatus.verificationDate).toLocaleDateString('ru-RU')}
                </p>
                <p className="text-green-600">
                  Теперь покупатели видят значок верификации на ваших объявлениях, что повышает доверие.
                </p>
              </div>
            </div>
          </div>
        )}

        {status === 'pending' && (
          <div className="bg-yellow-50 border-2 border-yellow-500 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-5xl">⏳</div>
              <div>
                <h2 className="text-2xl font-bold text-yellow-900 mb-2">
                  Запрос на рассмотрении
                </h2>
                <p className="text-yellow-700">
                  Ваш запрос на верификацию находится на рассмотрении. Обычно это занимает 24-48 часов.
                  Мы уведомим вас по email о результате проверки.
                </p>
              </div>
            </div>
          </div>
        )}

        {status === 'rejected' && (
          <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-5xl">❌</div>
              <div>
                <h2 className="text-2xl font-bold text-red-900 mb-2">
                  Верификация отклонена
                </h2>
                <p className="text-red-700 mb-2">
                  {verificationStatus.verificationNotes || 'Не указана причина'}
                </p>
                <p className="text-red-600">
                  Вы можете повторно подать запрос с корректными данными.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Форма подачи запроса */}
        {(status === 'none' || status === 'rejected') && (
          <div className="bg-white rounded-2xl shadow-medium border border-warm-200 p-8">
            <h2 className="text-2xl font-bold text-warm-900 mb-4">
              Подать запрос на верификацию
            </h2>
            <p className="text-warm-600 mb-6">
              Верификация помогает покупателям убедиться, что вы настоящий продавец. 
              Предоставьте ссылки на документы или профили в соцсетях для подтверждения личности.
            </p>

            <form onSubmit={handleSubmitVerification}>
              {/* Документы/ссылки */}
              <div className="mb-6">
                <label className="block text-warm-900 font-semibold mb-2">
                  Документы и ссылки для подтверждения
                </label>
                <p className="text-sm text-warm-600 mb-3">
                  Добавьте ссылки на: паспорт, профиль в соцсети, фото с документом, сертификаты и т.д.
                </p>
                
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={documentInput}
                    onChange={(e) => setDocumentInput(e.target.value)}
                    placeholder="Вставьте ссылку (например, на Google Drive)"
                    className="flex-1 px-4 py-2 border-2 border-primary-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddDocument}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Добавить
                  </button>
                </div>

                {documents.length > 0 && (
                  <div className="space-y-2">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-warm-50 p-3 rounded-lg">
                        <span className="text-warm-800 text-sm truncate flex-1">
                          📄 {doc}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(index)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Дополнительная информация */}
              <div className="mb-6">
                <label className="block text-warm-900 font-semibold mb-2">
                  Дополнительная информация (опционально)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Расскажите о себе, опыте продаж, почему хотите стать верифицированным продавцом..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-primary-300 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || documents.length === 0}
                className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-bold text-lg hover:shadow-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Отправка...' : '🚀 Отправить запрос на верификацию'}
              </button>
            </form>
          </div>
        )}

        {/* Информация о верификации */}
        <div className="mt-8 bg-warm-50 border border-warm-300 rounded-xl p-6">
          <h3 className="text-xl font-bold text-warm-900 mb-4">
            Преимущества верификации
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <strong className="text-warm-900">Больше доверия</strong>
                <p className="text-warm-700">Значок верификации показывает, что вы настоящий продавец</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">📈</span>
              <div>
                <strong className="text-warm-900">Увеличение продаж</strong>
                <p className="text-warm-700">Верифицированные продавцы получают на 40% больше заказов</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <strong className="text-warm-900">Безопасность</strong>
                <p className="text-warm-700">Ваши данные надежно защищены и не передаются третьим лицам</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
