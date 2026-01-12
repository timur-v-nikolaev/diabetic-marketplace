import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AvitoHeader from '../components/ui/AvitoHeader';
import AvitoProductCard from '../components/ui/AvitoProductCard';
import AvitoCategoryGrid from '../components/ui/AvitoCategoryGrid';
import api from '../services/api';

interface Listing {
  _id: string;
  title: string;
  price: number;
  images: string[];
  city: string;
  category: string;
  createdAt: string;
}

export default function CatalogPage() {
  const router = useRouter();
  const { category: queryCategory, q: searchQuery } = router.query;
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (queryCategory && typeof queryCategory === 'string') {
      setSelectedCategory(queryCategory);
    }
  }, [queryCategory]);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (selectedCategory) params.category = selectedCategory;
        if (searchQuery && typeof searchQuery === 'string') params.search = searchQuery;
        params.sort = sortBy;
        params.order = sortOrder;
        
        const response = await api.get('/listings', { params });
        setListings(response.data.listings || []);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [selectedCategory, searchQuery, sortBy, sortOrder]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    if (category) {
      router.push(`/catalog?category=${encodeURIComponent(category)}`, undefined, { shallow: true });
    } else {
      router.push('/catalog', undefined, { shallow: true });
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/catalog?q=${encodeURIComponent(query)}`);
    }
  };

  const pageTitle = selectedCategory 
    ? `${selectedCategory} — Диабет Маркет` 
    : searchQuery 
      ? `Поиск: ${searchQuery} — Диабет Маркет`
      : 'Каталог товаров — Диабет Маркет';

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content="Каталог товаров для диабетиков: глюкометры, тест-полоски, инсулиновые помпы и аксессуары" />
      </Head>

      <div className="min-h-screen bg-avito-bg">
        <AvitoHeader showSearch onSearch={handleSearch} />

        <main className="avito-container py-4">
          {/* Хлебные крошки */}
          <nav className="text-sm text-avito-text-secondary mb-4">
            <a href="/" className="hover:text-avito-blue">Главная</a>
            <span className="mx-2">›</span>
            {selectedCategory ? (
              <>
                <a href="/catalog" className="hover:text-avito-blue">Каталог</a>
                <span className="mx-2">›</span>
                <span className="text-avito-text">{selectedCategory}</span>
              </>
            ) : (
              <span className="text-avito-text">Каталог</span>
            )}
          </nav>

          <div className="flex gap-6">
            {/* Сайдбар с категориями (десктоп) */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-avito-lg p-4 shadow-avito-card">
                <h2 className="text-base font-semibold text-avito-text mb-3">Категории</h2>
                <AvitoCategoryGrid 
                  variant="list" 
                  selected={selectedCategory}
                  onSelect={handleCategorySelect}
                  showAll
                />
              </div>
            </aside>

            {/* Основной контент */}
            <div className="flex-1">
              {/* Заголовок и сортировка */}
              <div className="bg-white rounded-avito-lg p-4 shadow-avito-card mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-bold text-avito-text">
                      {selectedCategory || (searchQuery ? `Результаты поиска: ${searchQuery}` : 'Все объявления')}
                    </h1>
                    <p className="text-sm text-avito-text-secondary mt-1">
                      {loading ? 'Загрузка...' : `${listings.length} объявлений`}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-avito-text-secondary">Сортировка:</span>
                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [field, order] = e.target.value.split('-');
                        setSortBy(field);
                        setSortOrder(order as 'asc' | 'desc');
                      }}
                      className="h-9 px-3 bg-avito-bg border border-avito-border rounded text-sm focus:outline-none focus:border-avito-blue"
                    >
                      <option value="createdAt-desc">Сначала новые</option>
                      <option value="createdAt-asc">Сначала старые</option>
                      <option value="price-asc">Сначала дешёвые</option>
                      <option value="price-desc">Сначала дорогие</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Мобильные категории */}
              <div className="lg:hidden mb-4">
                <AvitoCategoryGrid 
                  variant="horizontal" 
                  selected={selectedCategory}
                  onSelect={handleCategorySelect}
                />
              </div>

              {/* Сетка товаров */}
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-avito-lg overflow-hidden shadow-avito-card animate-pulse">
                      <div className="aspect-square bg-gray-200" />
                      <div className="p-3">
                        <div className="h-5 bg-gray-200 rounded mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : listings.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {listings.map((listing) => (
                    <AvitoProductCard
                      key={listing._id}
                      listing={listing}
                      href={`/listings/${listing._id}`}
                      showFavorite
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-avito-lg p-8 text-center shadow-avito-card">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-avito-text mb-2">
                    {selectedCategory ? 'В этой категории пока нет объявлений' : 'Объявления не найдены'}
                  </h3>
                  <p className="text-avito-text-secondary mb-4">
                    Попробуйте изменить параметры поиска или выбрать другую категорию
                  </p>
                  <button
                    onClick={() => handleCategorySelect('')}
                    className="avito-btn avito-btn-secondary"
                  >
                    Показать все объявления
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Футер */}
        <footer className="bg-white border-t border-avito-border mt-8 py-6">
          <div className="avito-container">
            <div className="text-center text-sm text-avito-text-secondary">
              © 2026 Диабет Маркет — маркетплейс товаров для диабетиков
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
