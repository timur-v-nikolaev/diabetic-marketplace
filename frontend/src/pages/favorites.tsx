import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AvitoHeader from '../components/ui/AvitoHeader';
import AvitoProductCard from '../components/ui/AvitoProductCard';
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

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    
    setIsAuthenticated(true);
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/favorites');
      setFavorites(response.data.favorites || response.data || []);
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/catalog?q=${encodeURIComponent(query)}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Избранное — Диабет Маркет</title>
        </Head>

        <div className="min-h-screen bg-avito-bg">
          <AvitoHeader showSearch onSearch={handleSearch} />

          <main className="avito-container py-8">
            <div className="max-w-md mx-auto text-center">
              <div className="bg-white rounded-avito-lg p-8 shadow-avito-card">
                <span className="text-5xl mb-4 block">❤️</span>
                <h1 className="text-xl font-bold text-avito-text mb-2">Избранное</h1>
                <p className="text-avito-text-secondary mb-6">
                  Войдите, чтобы просматривать избранные объявления
                </p>
                <Link href="/auth/login" className="avito-btn avito-btn-primary">
                  Войти
                </Link>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Избранное — Диабет Маркет</title>
        <meta name="description" content="Ваши избранные объявления на Диабет Маркет" />
      </Head>

      <div className="min-h-screen bg-avito-bg">
        <AvitoHeader showSearch onSearch={handleSearch} />

        <main className="avito-container py-4">
          {/* Хлебные крошки */}
          <nav className="text-sm text-avito-text-secondary mb-4">
            <Link href="/" className="hover:text-avito-blue">Главная</Link>
            <span className="mx-2">›</span>
            <span className="text-avito-text">Избранное</span>
          </nav>

          <div className="bg-white rounded-avito-lg p-4 shadow-avito-card mb-4">
            <h1 className="text-xl font-bold text-avito-text">Избранное</h1>
            <p className="text-sm text-avito-text-secondary mt-1">
              {loading ? 'Загрузка...' : `${favorites.length} объявлений`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-avito-lg overflow-hidden shadow-avito-card animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-3">
                    <div className="h-5 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {favorites.map((listing) => (
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
              <span className="text-5xl mb-4 block">💔</span>
              <h2 className="text-lg font-medium text-avito-text mb-2">
                В избранном пока пусто
              </h2>
              <p className="text-avito-text-secondary mb-4">
                Добавляйте понравившиеся объявления, нажимая на сердечко
              </p>
              <Link href="/catalog" className="avito-btn avito-btn-primary">
                Перейти в каталог
              </Link>
            </div>
          )}
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
