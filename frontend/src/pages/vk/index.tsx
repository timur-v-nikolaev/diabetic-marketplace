import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { listingsAPI } from '../../services/api';
import { useVK } from '../../hooks/useVK';
import { 
  AvitoProductCard, 
  AvitoCategoryGrid, 
  AvitoEmptyState,
  AvitoLoading,
  AvitoBottomNav,
} from '../../components/ui';

interface Listing {
  _id: string;
  title: string;
  price: number;
  city: string;
  images: string[];
  category: string;
  createdAt?: string;
}

export default function VKHome() {
  const router = useRouter();
  const { isInVK } = useVK();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await listingsAPI.getAll({});
      setListings(response.data?.listings || response.data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(listing => {
    if (selectedCategory && listing.category !== selectedCategory) return false;
    if (search && !listing.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleListingClick = (id: string) => {
    router.push(`/vk/listings/${id}`);
  };

  return (
    <>
      <Head>
        <title>Диабет Маркет — VK Mini App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
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
                <p className="text-[11px] text-avito-text-secondary">
                  {isInVK ? 'VK Mini App' : 'товары для диабетиков'}
                </p>
              </div>
            </div>
          </div>

          {/* Поиск */}
          <div className="px-4 pb-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
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
          </div>
        </header>

        {/* Категории */}
        <div className="bg-white border-b border-avito-border px-4 py-3">
          <AvitoCategoryGrid 
            variant="horizontal"
            selected={selectedCategory} 
            onSelect={setSelectedCategory} 
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
                onClick={() => setSelectedCategory('')}
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
              title="Нет объявлений"
              description={selectedCategory 
                ? `В категории «${selectedCategory}» пока нет товаров` 
                : 'Будьте первым продавцом!'
              }
              actionLabel="Разместить"
              actionHref="/vk/listings/create"
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredListings.map((listing) => (
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

        <AvitoBottomNav activeTab="home" prefix="/vk" />
      </div>
    </>
  );
}
