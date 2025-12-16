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

  // Синхронизируем ошибку от hook'а с локальным state
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
      console.log('Отправляю данные входа:', formData);
      await login(formData.email, formData.password);
      // login функция автоматически перенаправит на главную после успешного входа
    } catch (err: any) {
      console.error('Ошибка входа:', err);
      setLocalError(err.message || 'Ошибка входа. Проверьте учетные данные.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-primary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-3xl">💊</span>
          </div>
          <h1 className="text-3xl font-bold text-warm-900">Диабет Маркет</h1>
          <p className="text-warm-600 mt-2">Вход в аккаунт</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-medium border border-warm-200 p-8">
          {(localError || error) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <span className="text-red-600 mt-1">⚠️</span>
              <p className="text-red-700 text-sm font-medium">{localError || error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-warm-900 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border-2 border-warm-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-200 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-warm-900 mb-2">
                Пароль
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-warm-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-200 transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:shadow-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Вход...
                </>
              ) : (
                '✓ Войти'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-diabetes-200"></div>
            <span className="text-warm-600 text-sm">или</span>
            <div className="flex-1 h-px bg-diabetes-200"></div>
          </div>

          {/* Registration Link */}
          <p className="text-center text-primary-700">
            Нет аккаунта?{' '}
            <Link href="/auth/register" className="font-semibold text-primary-600 hover:text-health-700 transition-colors">
              Зарегистрируйтесь
            </Link>
          </p>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-warm-600 text-sm">
          <p>Защищено шифрованием SSL и политикой конфиденциальности</p>
        </div>
      </div>
    </div>
  );
}
