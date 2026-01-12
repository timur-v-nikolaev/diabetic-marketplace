import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';

export default function Register() {
  const { register, loading, error } = useAuth();
  const [step, setStep] = useState(1);
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
      setLocalError('Необходимо принять условия использования');
      return;
    }

    try {
      await register(formData);
    } catch (err: any) {
      setLocalError(err.message || 'Ошибка регистрации. Попробуйте еще раз.');
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.email)) {
      setLocalError('Заполните имя и email');
      return;
    }
    if (step === 2 && (!formData.phone || !formData.city)) {
      setLocalError('Заполните телефон и город');
      return;
    }
    setLocalError('');
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700">
      {/* Декоративные элементы */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute top-40 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Логотип */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-2xl">
            <span className="text-3xl">💊</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Диабет Маркет</h1>
          <p className="text-blue-100 text-sm">Создание аккаунта</p>
        </div>

        {/* Индикатор шагов */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-all ${
                s === step ? 'bg-white scale-125' : s < step ? 'bg-white/80' : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Форма */}
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
          {(localError || error) && (
            <div className="mb-4 p-3 bg-red-50 rounded-xl flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <p className="text-red-600 text-sm font-medium">{localError || error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Шаг 1: Основная информация */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-800 mb-4">👤 Основная информация</h2>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Ваше имя
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Иван Петров"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-900"
                  />
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                >
                  <span>Далее</span>
                  <span>→</span>
                </button>
              </div>
            )}

            {/* Шаг 2: Контактная информация */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-800 mb-4">📱 Контактные данные</h2>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+7 (999) 999-99-99"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Город
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Москва"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-900"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                  >
                    ← Назад
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/30"
                  >
                    Далее →
                  </button>
                </div>
              </div>
            )}

            {/* Шаг 3: Пароль и согласия */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-800 mb-4">🔐 Безопасность</h2>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Пароль
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Минимум 6 символов"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-900"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToPrivacy}
                      onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                      className="mt-0.5 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">
                      Согласен с{' '}
                      <Link href="/personal-data" target="_blank" className="text-blue-600 font-medium">
                        обработкой персональных данных
                      </Link>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">
                      Принимаю{' '}
                      <Link href="/terms" target="_blank" className="text-blue-600 font-medium">
                        условия
                      </Link>
                      {' '}и{' '}
                      <Link href="/privacy" target="_blank" className="text-blue-600 font-medium">
                        политику
                      </Link>
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                  >
                    ← Назад
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !agreedToTerms || !agreedToPrivacy}
                    className="flex-1 py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>✓</span>
                        <span>Создать</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Разделитель */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-sm">или</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Социальные кнопки */}
          <div className="space-y-2.5">
            <button className="w-full py-3 bg-[#0077FF] text-white font-semibold rounded-xl hover:bg-[#0066DD] transition-all flex items-center justify-center gap-2">
              <span>📱</span>
              <span>Войти через VK ID</span>
            </button>
            <button className="w-full py-3 bg-[#0088CC] text-white font-semibold rounded-xl hover:bg-[#0077BB] transition-all flex items-center justify-center gap-2">
              <span>✈️</span>
              <span>Войти через Telegram</span>
            </button>
          </div>

          {/* Ссылка на вход */}
          <p className="text-center text-gray-600 mt-5 text-sm">
            Уже есть аккаунт?{' '}
            <Link href="/auth/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Войдите
            </Link>
          </p>
        </div>

        {/* Нижняя информация */}
        <div className="mt-6 text-center">
          <p className="text-blue-100 text-sm">
            🔒 Ваши данные защищены
          </p>
        </div>
      </div>
    </div>
  );
}
