import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { listingsAPI } from '../services/api';
import { 
  AvitoHeader, 
  AvitoBottomNav, 
  AvitoProductCard, 
  AvitoCategoryGrid,
  AvitoEmptyState,
  AvitoLoading,
} from '../components/ui';

interface Listing {
  _id: string;
  title: string;
  price: number;
  city: string;
  images: string[];
  category: string;
  createdAt?: string;
}

export default function Home() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await listingsAPI.getAll({});
      setListings(response.data?.listings || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const filteredListings = listings.filter(listing => {
    if (selectedCategory && listing.category !== selectedCategory) return false;
    return true;
  });

  return (
    <>
      <Head>
        <title>Диабет Маркет — товары для людей с диабетом</title>
        <meta name="description" content="Маркетплейс товаров для людей с диабетом. Глюкометры, тест-полоски, инсулиновые помпы и многое другое." />
      </Head>

      <div className="min-h-screen bg-avito-bg">
        <AvitoHeader onSearch={handleSearch} />

        {/* Основной контент */}
        <main className="avito-container py-4 md:py-6 pb-24 md:pb-6">
          {/* Мобильные категории */}
          <div className="md:hidden mb-4">
            <AvitoCategoryGrid 
              variant="horizontal"
              selected={selectedCategory} 
              onSelect={setSelectedCategory} 
            />
          </div>

          {/* Десктоп layout с сайдбаром */}
          <div className="flex gap-6">
            {/* Сайдбар с категориями (десктоп) */}
            <aside className="hidden md:block w-56 flex-shrink-0">
              <div className="bg-white rounded-avito-lg p-4 sticky top-28">
                <h2 className="font-medium text-avito-text mb-3">Категории</h2>
                <AvitoCategoryGrid 
                  variant="list"
                  selected={selectedCategory} 
                  onSelect={setSelectedCategory} 
                />
              </div>

              {/* Блок безопасности */}
              <div className="bg-white rounded-avito-lg p-4 mt-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-avito-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-avito-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-avito-text mb-1">Безопасные сделки</h3>
                    <p className="text-xs text-avito-text-secondary leading-relaxed">
                      Проверка продавцов и защита покупок
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Основной контент */}
            <div className="flex-1 min-w-0">
              {/* Заголовок секции */}
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-lg font-medium text-avito-text">
                  {selectedCategory || 'Рекомендации для вас'}
                </h1>
                {selectedCategory && (
                  <button 
                    onClick={() => setSelectedCategory('')}
                    className="text-sm text-avito-blue hover:underline"
                  >
                    Сбросить
                  </button>
                )}
              </div>

              {/* Сетка товаров */}
              {loading ? (
                <AvitoLoading type="skeleton" count={8} />
              ) : filteredListings.length === 0 ? (
                <AvitoEmptyState
                  title="Ничего не найдено"
                  description={selectedCategory 
                    ? `В категории «${selectedCategory}» пока нет объявлений` 
                    : 'Будьте первым, кто разместит объявление!'
                  }
                  actionLabel="Разместить объявление"
                  actionHref="/listings/create"
                />
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {filteredListings.map((listing) => (
                      <AvitoProductCard 
                        key={listing._id} 
                        listing={listing}
                        showDelivery={Math.random() > 0.7}
                      />
                    ))}
                  </div>

                  {/* Кнопка "Показать ещё" */}
                  {filteredListings.length >= 12 && (
                    <div className="mt-6 text-center">
                      <button className="avito-btn avito-btn-secondary px-8">
                        Показать ещё
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Сервисы (как на Авито) */}
              <section className="mt-8">
                <h2 className="text-lg font-medium text-avito-text mb-4">Сервисы</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/delivery" className="bg-white rounded-avito-lg p-4 flex items-start gap-3 hover:shadow-avito-hover transition-shadow">
                    <div className="w-10 h-10 bg-avito-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🚚</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-avito-text mb-0.5">Доставка</h3>
                      <p className="text-xs text-avito-text-secondary">Проверка при получении и возврат</p>
                    </div>
                  </Link>

                  <Link href="/verification" className="bg-white rounded-avito-lg p-4 flex items-start gap-3 hover:shadow-avito-hover transition-shadow">
                    <div className="w-10 h-10 bg-avito-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">✅</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-avito-text mb-0.5">Проверенные продавцы</h3>
                      <p className="text-xs text-avito-text-secondary">Гарантия качества товаров</p>
                    </div>
                  </Link>

                  <Link href="/help" className="bg-white rounded-avito-lg p-4 flex items-start gap-3 hover:shadow-avito-hover transition-shadow">
                    <div className="w-10 h-10 bg-avito-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">💚</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-avito-text mb-0.5">Помощь</h3>
                      <p className="text-xs text-avito-text-secondary">Ответы на частые вопросы</p>
                    </div>
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </main>

        {/* Футер (десктоп) */}
        <footer className="hidden md:block bg-white border-t border-avito-border mt-8">
          <div className="avito-container py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm text-avito-text-secondary">
                <Link href="/about" className="hover:text-avito-text">О проекте</Link>
                <Link href="/terms" className="hover:text-avito-text">Условия использования</Link>
                <Link href="/privacy" className="hover:text-avito-text">Политика конфиденциальности</Link>
                <Link href="/help" className="hover:text-avito-text">Помощь</Link>
              </div>
              <p className="text-sm text-avito-text-muted">© 2024 Диабет Маркет</p>
            </div>
          </div>
        </footer>

        {/* Мобильная навигация */}
        <AvitoBottomNav activeTab="home" />
      </div>
    </>
  );
}
