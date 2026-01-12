import { useEffect, useState, useCallback } from 'react';
import type { TelegramWebApp, WebAppUser, ThemeParams } from '../types/telegram';

interface UseTelegramResult {
  webApp: TelegramWebApp | null;
  user: WebAppUser | null;
  isInTelegram: boolean;
  isReady: boolean;
  initData: string;
  themeParams: ThemeParams;
  colorScheme: 'light' | 'dark';
  
  // Actions
  showMainButton: (text: string, onClick: () => void) => void;
  hideMainButton: () => void;
  showBackButton: (onClick: () => void) => void;
  hideBackButton: () => void;
  showAlert: (message: string) => Promise<void>;
  showConfirm: (message: string) => Promise<boolean>;
  hapticFeedback: (type: 'success' | 'error' | 'warning' | 'impact') => void;
  close: () => void;
  expand: () => void;
}

export function useTelegram(): UseTelegramResult {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
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
  }, []);

  const showMainButton = useCallback((text: string, onClick: () => void) => {
    if (webApp?.MainButton) {
      webApp.MainButton.setText(text);
      webApp.MainButton.onClick(onClick);
      webApp.MainButton.show();
    }
  }, [webApp]);

  const hideMainButton = useCallback(() => {
    if (webApp?.MainButton) {
      webApp.MainButton.hide();
    }
  }, [webApp]);

  const showBackButton = useCallback((onClick: () => void) => {
    if (webApp?.BackButton) {
      webApp.BackButton.onClick(onClick);
      webApp.BackButton.show();
    }
  }, [webApp]);

  const hideBackButton = useCallback(() => {
    if (webApp?.BackButton) {
      webApp.BackButton.hide();
    }
  }, [webApp]);

  const showAlert = useCallback((message: string): Promise<void> => {
    return new Promise((resolve) => {
      if (webApp) {
        webApp.showAlert(message, resolve);
      } else {
        alert(message);
        resolve();
      }
    });
  }, [webApp]);

  const showConfirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (webApp) {
        webApp.showConfirm(message, resolve);
      } else {
        resolve(window.confirm(message));
      }
    });
  }, [webApp]);

  const hapticFeedback = useCallback((type: 'success' | 'error' | 'warning' | 'impact') => {
    if (webApp?.HapticFeedback) {
      switch (type) {
        case 'success':
          webApp.HapticFeedback.notificationOccurred('success');
          break;
        case 'error':
          webApp.HapticFeedback.notificationOccurred('error');
          break;
        case 'warning':
          webApp.HapticFeedback.notificationOccurred('warning');
          break;
        case 'impact':
          webApp.HapticFeedback.impactOccurred('medium');
          break;
      }
    }
  }, [webApp]);

  const close = useCallback(() => {
    webApp?.close();
  }, [webApp]);

  const expand = useCallback(() => {
    webApp?.expand();
  }, [webApp]);

  return {
    webApp,
    user: webApp?.initDataUnsafe?.user || null,
    isInTelegram: !!webApp,
    isReady,
    initData: webApp?.initData || '',
    themeParams: webApp?.themeParams || {},
    colorScheme: webApp?.colorScheme || 'light',
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    showAlert,
    showConfirm,
    hapticFeedback,
    close,
    expand,
  };
}

export default useTelegram;
