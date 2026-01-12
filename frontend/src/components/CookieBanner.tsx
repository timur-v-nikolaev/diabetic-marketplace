import { useState, useEffect } from 'react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'diabet_market_cookie_consent';

interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>({
    necessary: true, // Всегда включены
    analytics: false,
    marketing: false,
    timestamp: 0,
  });

  useEffect(() => {
    // Проверяем, было ли уже дано согласие
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!savedConsent) {
      // Показываем баннер через небольшую задержку
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const saveConsent = (newConsent: CookieConsent) => {
    const consentWithTimestamp = {
      ...newConsent,
      timestamp: Date.now(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentWithTimestamp));
    setIsVisible(false);
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    });
  };

  const acceptNecessary = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    });
  };

  const acceptSelected = () => {
    saveConsent(consent);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-6xl mx-auto">
        {!showSettings ? (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">🍪 Мы используем cookies</h3>
              <p className="text-sm text-gray-600">
                Для улучшения работы сайта мы используем файлы cookie. Продолжая использовать сайт, 
                вы соглашаетесь с{' '}
                <Link href="/privacy" className="text-primary-600 hover:underline">
                  Политикой конфиденциальности
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Настроить
              </button>
              <button
                onClick={acceptNecessary}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Только необходимые
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Принять все
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Настройки файлов cookie</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={consent.necessary}
                  disabled
                  className="mt-1 w-4 h-4"
                />
                <div>
                  <span className="font-medium text-gray-900">Необходимые</span>
                  <p className="text-sm text-gray-600">
                    Обеспечивают работу основных функций сайта. Без них сайт не будет работать корректно.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent.analytics}
                  onChange={(e) => setConsent({ ...consent, analytics: e.target.checked })}
                  className="mt-1 w-4 h-4"
                />
                <div>
                  <span className="font-medium text-gray-900">Аналитические</span>
                  <p className="text-sm text-gray-600">
                    Помогают понять, как пользователи взаимодействуют с сайтом, для улучшения сервиса.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent.marketing}
                  onChange={(e) => setConsent({ ...consent, marketing: e.target.checked })}
                  className="mt-1 w-4 h-4"
                />
                <div>
                  <span className="font-medium text-gray-900">Маркетинговые</span>
                  <p className="text-sm text-gray-600">
                    Используются для показа релевантной рекламы на основе ваших интересов.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={acceptNecessary}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Только необходимые
              </button>
              <button
                onClick={acceptSelected}
                className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Сохранить выбор
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
