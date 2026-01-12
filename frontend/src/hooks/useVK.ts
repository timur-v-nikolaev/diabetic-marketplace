import { useEffect, useState, useCallback } from 'react';

interface VKUserInfo {
  id: number;
  first_name: string;
  last_name: string;
  photo_200?: string;
  city?: {
    id: number;
    title: string;
  };
}

interface UseVKResult {
  bridge: any;
  user: VKUserInfo | null;
  isInVK: boolean;
  isReady: boolean;
  launchParams: string;
  
  // Actions
  getUserInfo: () => Promise<VKUserInfo | null>;
  showAlert: (message: string) => void;
  hapticFeedback: (type: 'success' | 'error' | 'warning') => void;
  share: (message: string) => Promise<void>;
  close: () => void;
}

export function useVK(): UseVKResult {
  const [bridge, setBridge] = useState<any>(null);
  const [user, setUser] = useState<VKUserInfo | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [launchParams, setLaunchParams] = useState('');

  useEffect(() => {
    const initVK = async () => {
      if (typeof window === 'undefined') return;

      try {
        // Динамический импорт VK Bridge
        const vkBridge = await import('@vkontakte/vk-bridge');
        const bridge = vkBridge.default;
        
        setBridge(bridge);

        // Получаем launch params из URL
        const params = window.location.search.substring(1);
        setLaunchParams(params);

        // Проверяем, что мы внутри VK
        const isVK = params.includes('vk_user_id') || params.includes('vk_app_id');
        
        if (isVK) {
          // Инициализируем VK Bridge
          await bridge.send('VKWebAppInit');
          
          // Получаем информацию о пользователе
          try {
            const userInfo = await bridge.send('VKWebAppGetUserInfo');
            setUser(userInfo);
          } catch (e) {
            console.error('Failed to get VK user info:', e);
          }
        }

        setIsReady(true);
      } catch (error) {
        console.error('Failed to init VK Bridge:', error);
        setIsReady(true); // Всё равно считаем готовым для работы вне VK
      }
    };

    initVK();
  }, []);

  const getUserInfo = useCallback(async (): Promise<VKUserInfo | null> => {
    if (!bridge) return null;
    try {
      const userInfo = await bridge.send('VKWebAppGetUserInfo');
      setUser(userInfo);
      return userInfo;
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  }, [bridge]);

  const showAlert = useCallback((message: string) => {
    if (bridge) {
      bridge.send('VKWebAppTapticNotificationOccurred', { type: 'success' });
    }
    alert(message);
  }, [bridge]);

  const hapticFeedback = useCallback((type: 'success' | 'error' | 'warning') => {
    if (!bridge) return;
    try {
      bridge.send('VKWebAppTapticNotificationOccurred', { type });
    } catch (e) {
      // Игнорируем ошибки haptic feedback
    }
  }, [bridge]);

  const share = useCallback(async (_message?: string): Promise<void> => {
    if (!bridge) return;
    try {
      await bridge.send('VKWebAppShare', { link: window.location.href });
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [bridge]);

  const close = useCallback(() => {
    if (bridge) {
      bridge.send('VKWebAppClose', { status: 'success' });
    }
  }, [bridge]);

  const isInVK = Boolean(launchParams && launchParams.includes('vk_'));

  return {
    bridge,
    user,
    isInVK,
    isReady,
    launchParams,
    getUserInfo,
    showAlert,
    hapticFeedback,
    share,
    close,
  };
}
