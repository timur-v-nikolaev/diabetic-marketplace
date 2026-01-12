import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { favoritesAPI } from '../../services/api';
import MiniAppNav from '../../components/ui/MiniAppNav';
import { ProductCard, EmptyState, Loading } from '../../components/ui';
import type { Listing } from '../../types';

export default function VKFavorites() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await favoritesAPI.getAll();
      setFavorites(response.data);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      await favoritesAPI.toggle(id);
      setFavorites(favorites.filter(f => f._id !== id));
    } catch (err) {
      console.error('Ошибка:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 sticky top-0 z-50">
        <div className="px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
          >
            <span className="text-white text-xl">←</span>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Избранное</h1>
            <p className="text-blue-100 text-sm">{favorites.length} товаров</p>
          </div>
        </div>
      </header>

      <div className="p-4">
        {loading ? (
          <Loading type="page" />
        ) : favorites.length === 0 ? (
          <EmptyState
            icon="❤️"
            title="Нет избранных"
            description="Добавляйте понравившиеся товары в избранное"
            actionLabel="Смотреть товары"
            onAction={() => router.push('/vk')}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {favorites.map(listing => (
              <div key={listing._id} className="relative">
                <ProductCard
                  listing={listing}
                  onClick={() => router.push(`/vk/listings/${listing._id}`)}
                />
                <button
                  onClick={() => toggleFavorite(listing._id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg z-10"
                >
                  <span className="text-red-500">❤️</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <MiniAppNav prefix="/vk" />
    </div>
  );
}
