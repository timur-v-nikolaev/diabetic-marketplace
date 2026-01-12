import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.email || !formData.password) {
      setLocalError('Пожалуйста, заполните все поля');
      return;
    }

    try {
      await login(formData.email, formData.password);
    } catch (err: any) {
      setLocalError(err.message || 'Ошибка входа. Проверьте учетные данные.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700">
      {/* Декоративные элементы */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute top-40 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Логотип */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <span className="text-4xl">💊</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Диабет Маркет</h1>
          <p className="text-blue-100">Войдите в свой аккаунт</p>
        </div>

        {/* Форма */}
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8">
          {(localError || error) && (
            <div className="mb-6 p-4 bg-red-50 rounded-2xl flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <p className="text-red-600 text-sm font-medium">{localError || error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Пароль
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Вход...</span>
                </>
              ) : (
                <>
                  <span>Войти</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Разделитель */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-sm">или</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Социальные кнопки */}
          <div className="space-y-3">
            <button className="w-full py-3.5 bg-[#0077FF] text-white font-semibold rounded-xl hover:bg-[#0066DD] transition-all flex items-center justify-center gap-2">
              <span className="text-xl">📱</span>
              <span>Войти через VK ID</span>
            </button>
            <button className="w-full py-3.5 bg-[#0088CC] text-white font-semibold rounded-xl hover:bg-[#0077BB] transition-all flex items-center justify-center gap-2">
              <span className="text-xl">✈️</span>
              <span>Войти через Telegram</span>
            </button>
          </div>

          {/* Ссылка на регистрацию */}
          <p className="text-center text-gray-600 mt-6">
            Нет аккаунта?{' '}
            <Link href="/auth/register" className="font-semibold text-blue-600 hover:text-blue-700">
              Зарегистрируйтесь
            </Link>
          </p>
        </div>

        {/* Нижняя информация */}
        <div className="mt-8 text-center">
          <p className="text-blue-100 text-sm">
            🔒 Защищено шифрованием SSL
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link href="/privacy" className="text-blue-200 hover:text-white text-sm transition-colors">
              Конфиденциальность
            </Link>
            <span className="text-blue-300">•</span>
            <Link href="/terms" className="text-blue-200 hover:text-white text-sm transition-colors">
              Условия
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
