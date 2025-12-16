import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { listingsAPI, favoritesAPI, chatAPI, transactionsAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  city: string;
  category: string;
  rating: number;
  reviewsCount: number;
  isSaved?: boolean;
  sellerId: {
    _id: string;
    name: string;
    rating: number;
    reviewsCount: number;
    city: string;
    phone: string;
    avatar?: string;
  };
  createdAt: string;
}

export default function ListingDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [favoriteSellerLoading, setFavoriteSellerLoading] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await listingsAPI.getById(id as string);
        setListing(response.data);
        // Устанавливаем состояние saved на основе данных с бэкенда
        setSaved(response.data.isSaved || false);
      } catch (error) {
        console.error('Failed to fetch listing:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  const handleSave = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    try {
      if (saved) {
        await listingsAPI.unsave(id as string);
      } else {
        await listingsAPI.save(id as string);
      }
      setSaved(!saved);
    } catch (error) {
      console.error('Failed to toggle save:', error);
    }
  };

  const handleContact = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (!listing?.sellerId._id) {
      console.error('Seller ID is missing');
      alert('Ошибка: не найден продавец');
      return;
    }

    try {
      console.log('Creating conversation:', { 
        listingId: listing._id, 
        sellerId: listing.sellerId._id 
      });
      
      // Создаем или получаем существующий чат
      const response = await chatAPI.getOrCreateConversation(
        listing._id,
        listing.sellerId._id
      );
      
      console.log('Conversation created:', response.data);
      
      // Переходим в чат
      router.push(`/messages/${response.data._id}`);
    } catch (error: any) {
      console.error('Failed to create conversation:', error);
      console.error('Error response:', error.response?.data);
      alert(`Не удалось открыть чат: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleAddToFavorites = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!listing?.sellerId._id) return;

    try {
      setFavoriteSellerLoading(true);
      await favoritesAPI.addSeller(listing.sellerId._id);
      alert('✅ Продавец добавлен в избранное!');
    } catch (error: any) {
      console.error('Failed to add seller to favorites:', error);
      if (error.response?.data?.error === 'Seller already in favorites') {
        alert('ℹ️ Продавец уже в избранном');
      } else {
        alert('❌ Не удалось добавить продавца в избранное');
      }
    } finally {
      setFavoriteSellerLoading(false);
    }
  };

  const handleCreateTransaction = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!listing) return;

    try {
      const response = await transactionsAPI.create(listing._id, listing.price);
      alert('✅ Безопасная сделка создана!');
      router.push(`/transactions/${response.data._id}`);
    } catch (error: any) {
      console.error('Failed to create transaction:', error);
      alert(`❌ ${error.response?.data?.error || 'Не удалось создать сделку'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Загрузка...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Объявление не найдено</p>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Все объявления
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              {/* Main Image */}
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                {listing.images?.[0] ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-lg">Нет фото</span>
                )}
              </div>

              {/* Gallery */}
              {listing.images && listing.images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {listing.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Gallery ${idx}`}
                      className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-75"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Listing Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {listing.title}
              </h1>

              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                <div>
                  <div className="text-4xl font-bold text-blue-600">
                    {listing.price} ₽
                  </div>
                  <div className="text-gray-600 text-sm">
                    📍 {listing.city} • {listing.category}
                  </div>
                </div>
                <button
                  onClick={handleSave}
                  className={`ml-auto text-4xl transition-colors ${
                    saved ? 'text-red-500' : 'text-gray-300'
                  }`}
                >
                  {saved ? '❤️' : '🤍'}
                </button>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3 text-gray-800">
                  📝 Описание
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {listing.description}
                </p>
              </div>

              <div className="text-sm text-gray-500 pt-4 border-t">
                Опубликовано: {new Date(listing.createdAt).toLocaleDateString('ru-RU')}
              </div>
            </div>
          </div>

          {/* Right Column - Seller Info */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                👤 Продавец
              </h2>

              <div className="mb-6">
                {listing.sellerId.avatar && (
                  <img
                    src={`http://localhost:5001${listing.sellerId.avatar}`}
                    alt={listing.sellerId.name}
                    className="w-20 h-20 rounded-full mb-3 object-cover"
                  />
                )}
                <h3 className="text-lg font-semibold text-gray-800">
                  {listing.sellerId.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span>⭐ {listing.sellerId.rating.toFixed(1)}</span>
                  <span>({listing.sellerId.reviewsCount} отзывов)</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Город: {listing.sellerId.city}
                </p>
                <Link
                  href={`/sellers/${listing.sellerId._id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                >
                  👤 Посмотреть профиль продавца →
                </Link>
              </div>

              {/* Показываем кнопки только если пользователь НЕ владелец */}
              {(!isAuthenticated || (user?.id !== listing.sellerId._id && user?._id !== listing.sellerId._id)) && (
                <>
                  <button
                    onClick={handleCreateTransaction}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors mb-3"
                  >
                    🔒 Безопасная сделка
                  </button>

                  <button
                    onClick={handleContact}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3"
                  >
                    💬 Написать продавцу
                  </button>

                  <a
                    href={`tel:${listing.sellerId.phone}`}
                    className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors mb-3 block text-center"
                  >
                    📞 Позвонить
                  </a>
                </>
              )}

              {/* Кнопка добавления продавца в избранное */}
              {isAuthenticated && user?.id !== listing.sellerId._id && user?._id !== listing.sellerId._id && (
                <button
                  onClick={handleAddToFavorites}
                  disabled={favoriteSellerLoading}
                  className="w-full border border-yellow-500 text-yellow-600 py-3 rounded-lg font-semibold hover:bg-yellow-50 transition-colors mb-3 disabled:opacity-50"
                >
                  {favoriteSellerLoading ? '⏳ Добавление...' : '⭐ Добавить продавца в избранное'}
                </button>
              )}

              {/* Показываем кнопки редактирования и удаления только владельцу */}
              {isAuthenticated && (user?.id === listing.sellerId._id || user?._id === listing.sellerId._id) && (
                <div className="mt-3 space-y-2">
                  <button
                    onClick={() => alert('Функция редактирования в разработке. Вы можете удалить объявление из профиля и создать новое.')}
                    className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ✏️ Редактировать
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Вы уверены, что хотите удалить это объявление?')) {
                        try {
                          await listingsAPI.delete(listing._id);
                          alert('Объявление удалено');
                          router.push('/auth/profile');
                        } catch (error) {
                          alert('Ошибка при удалении объявления');
                        }
                      }
                    }}
                    className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    🗑️ Удалить объявление
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
