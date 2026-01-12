import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AvitoHeader from '../../../components/ui/AvitoHeader';
import AvitoBottomNav from '../../../components/ui/AvitoBottomNav';
import api from '../../../services/api';

const CATEGORIES = [
  'Глюкометры',
  'Тест-полоски',
  'Инсулиновые помпы',
  'Мониторинг',
  'Ланцеты',
  'Шприцы и ручки',
  'Аксессуары',
  'Другое',
];

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        HapticFeedback?: {
          impactOccurred: (style: string) => void;
          notificationOccurred: (type: string) => void;
        };
        showAlert?: (message: string) => void;
        MainButton?: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
      };
    };
  }
}

export default function TGCreateListing() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    city: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const haptic = (type: 'light' | 'medium' | 'success' | 'error') => {
    try {
      if (type === 'success' || type === 'error') {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type);
      } else {
        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(type);
      }
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.category) {
      haptic('error');
      alert('Заполните обязательные поля');
      return;
    }

    setLoading(true);
    try {
      await api.post('/listings', {
        ...form,
        price: Number(form.price),
      });
      haptic('success');
      window.Telegram?.WebApp?.showAlert?.('Объявление создано!');
      router.push('/tg');
    } catch (error: any) {
      haptic('error');
      alert(error.response?.data?.error || 'Ошибка создания');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Создать объявление — Telegram Mini App</title>
        </Head>
        <div className="min-h-screen bg-avito-bg pb-20">
          <AvitoHeader minimal showBack title="Новое объявление" />
          <div className="p-4 text-center">
            <span className="text-5xl block mb-4">🔐</span>
            <h1 className="text-lg font-bold mb-2">Войдите в аккаунт</h1>
            <p className="text-avito-text-secondary mb-4">Чтобы создать объявление</p>
            <button
              onClick={() => router.push('/tg/cabinet')}
              className="avito-btn avito-btn-primary"
            >
              Войти
            </button>
          </div>
          <AvitoBottomNav activeTab="create" prefix="/tg" />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Создать объявление — Telegram Mini App</title>
      </Head>
      <div className="min-h-screen bg-avito-bg pb-24">
        <AvitoHeader minimal showBack title="Новое объявление" />
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-white rounded-avito-lg p-4">
            <label className="block text-sm font-medium text-avito-text mb-2">
              Название *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Например: Глюкометр Accu-Chek"
              className="w-full h-11 px-3 border border-avito-border rounded-avito focus:outline-none focus:border-avito-blue"
              required
            />
          </div>

          <div className="bg-white rounded-avito-lg p-4">
            <label className="block text-sm font-medium text-avito-text mb-2">
              Категория *
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full h-11 px-3 border border-avito-border rounded-avito focus:outline-none focus:border-avito-blue bg-white"
              required
            >
              <option value="">Выберите категорию</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-avito-lg p-4">
            <label className="block text-sm font-medium text-avito-text mb-2">
              Цена, ₽ *
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="0"
              className="w-full h-11 px-3 border border-avito-border rounded-avito focus:outline-none focus:border-avito-blue"
              min="0"
              required
            />
          </div>

          <div className="bg-white rounded-avito-lg p-4">
            <label className="block text-sm font-medium text-avito-text mb-2">
              Город
            </label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Москва"
              className="w-full h-11 px-3 border border-avito-border rounded-avito focus:outline-none focus:border-avito-blue"
            />
          </div>

          <div className="bg-white rounded-avito-lg p-4">
            <label className="block text-sm font-medium text-avito-text mb-2">
              Описание
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Опишите товар подробнее"
              rows={4}
              className="w-full px-3 py-2 border border-avito-border rounded-avito focus:outline-none focus:border-avito-blue resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-avito-green text-white font-semibold rounded-avito disabled:opacity-70"
          >
            {loading ? 'Публикация...' : 'Опубликовать'}
          </button>
        </form>

        <AvitoBottomNav activeTab="create" prefix="/tg" />
      </div>
    </>
  );
}
