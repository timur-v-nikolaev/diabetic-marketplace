import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
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

export default function SearchPage() {
  const router = useRouter();
  const { q: searchQuery, category: queryCategory } = router.query;
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    if (queryCategory && typeof queryCategory === 'string') {
      setSelectedCategory(queryCategory);
    }
  }, [queryCategory]);

  useEffect(() => {
    if (!router.isReady) return;
    
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (searchQuery && typeof searchQuery === 'string') params.search = searchQuery;
        if (selectedCategory) params.category = selectedCategory;
        
        const response = await api.get('/listings', { params });
        setListings(response.data.listings || []);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [router.isReady, searchQuery, selectedCategory]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery as string);
    if (category) params.set('category', category);
    router.push(`/search?${params.toString()}`, undefined, { shallow: true });
  };

  const queryString = typeof searchQuery === 'string' ? searchQuery : '';

  return (
    <>
      <Head>
        <title>{queryString ? `${queryString} — Поиск` : 'Поиск'} — Диабет Маркет</title>
        <meta name="description" content={`Результаты поиска${queryString ? `: ${queryString}` : ''}`} />
      </Head>

      <div className="min-h-screen bg-avito-bg">
        <AvitoHeader showSearch onSearch={handleSearch} />

        <main className="avito-container py-4">
          {/* Хлебные крошки */}
          <nav className="text-sm text-avito-text-secondary mb-4">
            <Link href="/" className="hover:text-avito-blue">Главная</Link>
            <span className="mx-2">›</span>
            <span className="text-avito-text">
              Поиск{queryString ? `: ${queryString}` : ''}
            </span>
          </nav>

          <div className="flex gap-6">
            {/* Сайдбар с категориями (десктоп) */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-avito-lg p-4 shadow-avito-card">
                <h2 className="text-base font-semibold text-avito-text mb-3">Фильтр по категории</h2>
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
              {/* Заголовок */}
              <div className="bg-white rounded-avito-lg p-4 shadow-avito-card mb-4">
                <h1 className="text-xl font-bold text-avito-text">
                  {queryString ? `Результаты поиска: ${queryString}` : 'Поиск объявлений'}
                </h1>
                <p className="text-sm text-avito-text-secondary mt-1">
                  {loading ? 'Поиск...' : `Найдено ${listings.length} объявлений`}
                  {selectedCategory && ` в категории "${selectedCategory}"`}
                </p>
              </div>

              {/* Мобильные категории */}
              <div className="lg:hidden mb-4">
                <AvitoCategoryGrid 
                  variant="horizontal" 
                  selected={selectedCategory}
                  onSelect={handleCategorySelect}
                />
              </div>

              {/* Результаты */}
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
                  <span className="text-5xl mb-4 block">🔍</span>
                  <h2 className="text-lg font-medium text-avito-text mb-2">
                    Ничего не найдено
                  </h2>
                  <p className="text-avito-text-secondary mb-4">
                    Попробуйте изменить поисковый запрос или выбрать другую категорию
                  </p>
                  <Link href="/catalog" className="avito-btn avito-btn-secondary">
                    Смотреть все объявления
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>

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
