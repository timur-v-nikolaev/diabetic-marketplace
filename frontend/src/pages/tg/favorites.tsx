import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AvitoHeader from '../../components/ui/AvitoHeader';
import AvitoBottomNav from '../../components/ui/AvitoBottomNav';
import AvitoProductCard from '../../components/ui/AvitoProductCard';
import api from '../../services/api';

interface Listing {
  _id: string;
  title: string;
  price: number;
  images: string[];
  city: string;
  category: string;
  createdAt: string;
}

export default function TGFavoritesPage() {
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

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Избранное — Telegram Mini App</title>
        </Head>
        <div className="min-h-screen bg-avito-bg pb-20">
          <AvitoHeader minimal title="Избранное" />
          <div className="p-4 text-center">
            <span className="text-5xl block mb-4">❤️</span>
            <h1 className="text-lg font-bold mb-2">Избранное</h1>
            <p className="text-avito-text-secondary mb-4">Войдите, чтобы видеть избранное</p>
            <Link href="/tg/cabinet" className="avito-btn avito-btn-primary">
              Войти
            </Link>
          </div>
          <AvitoBottomNav activeTab="favorites" prefix="/tg" />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Избранное — Telegram Mini App</title>
      </Head>
      <div className="min-h-screen bg-avito-bg pb-20">
        <AvitoHeader minimal title="Избранное" />

        <main className="p-4">
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-avito-lg overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-3">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {favorites.map((listing) => (
                <AvitoProductCard
                  key={listing._id}
                  listing={listing}
                  href={`/tg/listings/${listing._id}`}
                  showFavorite
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-5xl block mb-4">💔</span>
              <h2 className="text-lg font-medium mb-2">Пока пусто</h2>
              <p className="text-avito-text-secondary mb-4">
                Добавляйте понравившиеся товары
              </p>
              <Link href="/tg" className="avito-btn avito-btn-secondary">
                Перейти к товарам
              </Link>
            </div>
          )}
        </main>

        <AvitoBottomNav activeTab="favorites" prefix="/tg" />
      </div>
    </>
  );
}
