import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { TelegramWebApp, WebAppUser, ThemeParams } from '../types/telegram';

interface TelegramContextType {
  webApp: TelegramWebApp | null;
  user: WebAppUser | null;
  isInTelegram: boolean;
  isReady: boolean;
  initData: string;
  themeParams: ThemeParams;
  colorScheme: 'light' | 'dark';
}

const TelegramContext = createContext<TelegramContextType>({
  webApp: null,
  user: null,
  isInTelegram: false,
  isReady: false,
  initData: '',
  themeParams: {},
  colorScheme: 'light',
});

interface TelegramProviderProps {
  children: ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Ждем загрузки скрипта Telegram WebApp
      const initTelegram = () => {
        if (window.Telegram?.WebApp) {
          const tgApp = window.Telegram.WebApp;
          setWebApp(tgApp);
          
          // Сообщаем Telegram что приложение готово
          tgApp.ready();
          
          // Расширяем на весь экран
          tgApp.expand();
          
          // Устанавливаем цвета
          tgApp.setHeaderColor('bg_color');
          tgApp.setBackgroundColor('bg_color');
          
          setIsReady(true);
        }
      };

      // Попробуем инициализировать сразу
      initTelegram();
      
      // Если не получилось, подождем загрузки
      if (!window.Telegram?.WebApp) {
        const checkInterval = setInterval(() => {
          if (window.Telegram?.WebApp) {
            initTelegram();
            clearInterval(checkInterval);
          }
        }, 100);
        
        // Прекращаем проверку через 5 секунд
        setTimeout(() => clearInterval(checkInterval), 5000);
      }
    }
  }, []);

  const value: TelegramContextType = {
    webApp,
    user: webApp?.initDataUnsafe?.user || null,
    isInTelegram: !!webApp,
    isReady,
    initData: webApp?.initData || '',
    themeParams: webApp?.themeParams || {},
    colorScheme: webApp?.colorScheme || 'light',
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegramContext() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegramContext must be used within a TelegramProvider');
  }
  return context;
}

export default TelegramContext;
