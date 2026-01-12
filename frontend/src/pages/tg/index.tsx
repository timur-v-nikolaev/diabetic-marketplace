import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { listingsAPI } from '@/services/api';
import { 
  AvitoProductCard, 
  AvitoCategoryGrid, 
  AvitoEmptyState, 
  AvitoLoading,
  AvitoBottomNav
} from '@/components/ui';
import type { Listing } from '@/types';

// Telegram WebApp SDK hook
const useTelegram = () => {
  const [tg, setTg] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const telegram = (window as any).Telegram.WebApp;
      telegram.ready();
      telegram.expand();
      setTg(telegram);
      setUser(telegram.initDataUnsafe?.user || null);
    }
  }, []);

  const hapticFeedback = (type: 'light' | 'medium' | 'heavy') => {
    tg?.HapticFeedback?.impactOccurred(type);
  };

  return { tg, user, hapticFeedback };
};

export default function TGHome() {
  const router = useRouter();
  const { hapticFeedback } = useTelegram();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    loadListings();
  }, [selectedCategory]);

  const loadListings = async () => {
    try {
      const response = await listingsAPI.getAll({
        category: selectedCategory || undefined,
        limit: 20,
      });
      setListings(response.data?.listings || []);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    hapticFeedback('light');
    setSelectedCategory(selectedCategory === category ? '' : category);
  };

  const handleListingClick = (id: string) => {
    hapticFeedback('light');
    router.push(`/tg/listings/${id}`);
  };

  const filteredListings = listings.filter(listing => {
    if (search && !listing.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <Head>
        <title>Диабет Маркет — Telegram</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </Head>

      <div className="min-h-screen bg-avito-bg pb-20">
        {/* Хедер в стиле Авито */}
        <header className="sticky top-0 z-50 bg-white shadow-avito-header">
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-avito-teal rounded flex items-center justify-center">
                <span className="text-white text-lg">💊</span>
              </div>
              <div className="flex-1">
                <h1 className="text-base font-semibold text-avito-text">Диабет Маркет</h1>
                <p className="text-[11px] text-avito-text-secondary">Telegram Mini App</p>
              </div>
            </div>
          </div>

          {/* Поиск */}
          <div className="px-4 pb-3">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по объявлениям"
                className="w-full h-10 pl-10 pr-4 bg-avito-bg border border-avito-border rounded text-sm focus:outline-none focus:border-avito-blue focus:bg-white transition-colors"
              />
              <svg 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-avito-text-muted"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </header>

        {/* Категории */}
        <div className="bg-white border-b border-avito-border px-4 py-3">
          <AvitoCategoryGrid
            variant="horizontal"
            selected={selectedCategory}
            onSelect={handleCategorySelect}
          />
        </div>

        {/* Объявления */}
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-avito-text">
              {selectedCategory || 'Все товары'}
            </h2>
            {selectedCategory && (
              <button
                onClick={() => {
                  hapticFeedback('light');
                  setSelectedCategory('');
                }}
                className="text-sm text-avito-blue"
              >
                Сбросить
              </button>
            )}
          </div>

          {loading ? (
            <AvitoLoading type="skeleton" count={6} />
          ) : filteredListings.length === 0 ? (
            <AvitoEmptyState
              title="Нет товаров"
              description={selectedCategory 
                ? `В категории «${selectedCategory}» пока нет товаров` 
                : 'Будьте первым продавцом!'
              }
              actionLabel="Создать объявление"
              onAction={() => {
                hapticFeedback('medium');
                router.push('/tg/listings/create');
              }}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredListings.map(listing => (
                <AvitoProductCard
                  key={listing._id}
                  listing={listing}
                  onClick={() => handleListingClick(listing._id)}
                  showDelivery={Math.random() > 0.7}
                />
              ))}
            </div>
          )}
        </div>

        <AvitoBottomNav activeTab="home" prefix="/tg" />
      </div>
    </>
  );
}
