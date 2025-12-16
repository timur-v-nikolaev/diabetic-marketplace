import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';

export default function Register() {
  const { register, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    city: '',
  });
  const [localError, setLocalError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

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

    if (!formData.email || !formData.password || !formData.name || !formData.phone || !formData.city) {
      setLocalError('Пожалуйста, заполните все поля');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('Пароль должен быть не менее 6 символов');
      return;
    }

    if (!agreedToTerms || !agreedToPrivacy) {
      setLocalError('Необходимо принять условия использования и политику конфиденциальности');
      return;
    }

    try {
      await register(formData);
    } catch (err: any) {
      setLocalError(err.message || 'Ошибка регистрации. Попробуйте еще раз.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-primary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-3xl">💊</span>
          </div>
          <h1 className="text-3xl font-bold text-warm-900">Диабет Маркет</h1>
          <p className="text-warm-600 mt-2">Создание аккаунта</p>
        </div>

        <div className="bg-white rounded-2xl shadow-medium border border-warm-200 p-8">
          {(localError || error) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <span className="text-red-600 mt-1">⚠️</span>
              <p className="text-red-700 text-sm font-medium">{localError || error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-warm-900 mb-2">
                Полное имя
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Иван Петров"
                className="w-full px-4 py-2 border-2 border-warm-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-200 transition-all"
              />
            </div>

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
                className="w-full px-4 py-2 border-2 border-warm-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-200 transition-all"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-warm-900 mb-2">
                Телефон
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+7 (999) 999-99-99"
                className="w-full px-4 py-2 border-2 border-warm-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-200 transition-all"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-semibold text-warm-900 mb-2">
                Город
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Москва"
                className="w-full px-4 py-2 border-2 border-warm-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-200 transition-all"
              />
            </div>

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
                className="w-full px-4 py-2 border-2 border-warm-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-200 transition-all"
              />
              <p className="text-xs text-warm-600 mt-1">Минимум 6 символов</p>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedToPrivacy}
                  onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                  className="mt-1 w-4 h-4 text-warm-600 border-warm-300 rounded focus:ring-diabetes-500"
                />
                <span className="text-sm text-primary-700">
                  Я согласен(на) с{' '}
                  <Link 
                    href="/personal-data" 
                    target="_blank"
                    className="text-warm-600 hover:text-primary-800 underline font-medium"
                  >
                    обработкой персональных данных
                  </Link>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-warm-600 border-warm-300 rounded focus:ring-diabetes-500"
                />
                <span className="text-sm text-primary-700">
                  Я принимаю{' '}
                  <Link 
                    href="/terms" 
                    target="_blank"
                    className="text-warm-600 hover:text-primary-800 underline font-medium"
                  >
                    пользовательское соглашение
                  </Link>
                  {' '}и{' '}
                  <Link 
                    href="/privacy" 
                    target="_blank"
                    className="text-warm-600 hover:text-primary-800 underline font-medium"
                  >
                    политику конфиденциальности
                  </Link>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !agreedToTerms || !agreedToPrivacy}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:shadow-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Регистрация...
                </>
              ) : (
                '✓ Зарегистрироваться'
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-warm-200"></div>
            <span className="text-warm-600 text-sm">или</span>
            <div className="flex-1 h-px bg-warm-200"></div>
          </div>

          <p className="text-center text-primary-700">
            Уже есть аккаунт?{' '}
            <Link href="/auth/login" className="font-semibold text-warm-600 hover:text-primary-700 transition-colors">
              Войдите
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
