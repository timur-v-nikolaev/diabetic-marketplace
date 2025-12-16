import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { authAPI, listingsAPI, verificationAPI, favoritesAPI } from '../../services/api';
import NotificationsList from '../../components/NotificationsList';

export default function Profile() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [userListings, setUserListings] = useState<any[]>([]);
  const [savedListings, setSavedListings] = useState<any[]>([]);
  const [favoriteSellers, setFavoriteSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<string>('none');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'listings' | 'saved' | 'sellers'>('listings');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    city: '',
  });
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [stats, setStats] = useState({
    totalListings: 0,
    totalReviews: 0,
    averageRating: 0,
    shipmentsSent: 0,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Получить товары пользователя
        // MongoDB использует _id, а не id
        const userId = user?.id || user?._id;
        
        console.log('Данные пользователя:', { user, userId });
        
        if (userId) {
          // Загрузка объявлений пользователя
          const listingsResponse = await listingsAPI.getByUserId(userId);
          const listings = Array.isArray(listingsResponse.data) ? listingsResponse.data : [];
          setUserListings(listings);
          
          // Загрузка сохраненных товаров
          try {
            const savedResponse = await listingsAPI.getSaved();
            setSavedListings(savedResponse.data || []);
          } catch (err) {
            console.error('Ошибка загрузки избранных товаров:', err);
          }
          
          // Загрузка избранных продавцов
          try {
            const sellersResponse = await favoritesAPI.getSellers();
            setFavoriteSellers(sellersResponse.data || []);
          } catch (err) {
            console.error('Ошибка загрузки избранных продавцов:', err);
          }
          
          console.log('Загружено товаров:', listings.length, 'для пользователя:', userId);
          
          // Получить статус верификации
          try {
            const verificationResponse = await verificationAPI.getStatus();
            setVerificationStatus(verificationResponse.data?.verificationStatus || 'none');
          } catch (err) {
            console.error('Ошибка загрузки статуса верификации:', err);
          }
          
          // Подсчитать статистику
          setStats({
            totalListings: listings.length,
            totalReviews: 0,
            averageRating: user?.rating || 0,
            shipmentsSent: 0,
          });
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных профиля:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.id) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, user?._id]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это объявление?')) {
      return;
    }

    try {
      setDeletingId(listingId);
      await listingsAPI.delete(listingId);
      
      // Обновить список товаров
      setUserListings(prev => prev.filter(listing => listing._id !== listingId));
      
      // Обновить статистику
      setStats(prev => ({
        ...prev,
        totalListings: prev.totalListings - 1,
      }));
      
      alert('Объявление успешно удалено');
    } catch (error) {
      console.error('Ошибка при удалении объявления:', error);
      alert('Не удалось удалить объявление. Попробуйте снова.');
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = () => {
    setEditForm({
      name: user?.name || '',
      phone: user?.phone || '',
      city: user?.city || '',
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsEditModalOpen(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверка типа файла
      if (!file.type.startsWith('image/')) {
        alert('❌ Пожалуйста, выберите файл изображения');
        return;
      }
      
      // Проверка размера файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('❌ Размер файла не должен превышать 5MB');
        return;
      }
      
      setAvatarFile(file);
      
      // Создаем превью
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      // Сначала загружаем аватар, если выбран новый файл
      if (avatarFile) {
        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        await authAPI.uploadAvatar(formData);
        setUploadingAvatar(false);
      }
      
      // Затем обновляем профиль
      await authAPI.updateProfile(editForm);
      
      setIsEditModalOpen(false);
      alert('✅ Профиль успешно обновлён!');
      
      // Перезагружаем страницу для обновления данных
      window.location.reload();
    } catch (error) {
      console.error('Ошибка при сохранении профиля:', error);
      alert('❌ Ошибка при сохранении профиля. Попробуйте снова.');
    } finally {
      setSaving(false);
      setUploadingAvatar(false);
    }
  };

  const handleRemoveFavoriteSeller = async (sellerId: string) => {
    if (!confirm('Удалить продавца из избранного?')) {
      return;
    }

    try {
      await favoritesAPI.removeSeller(sellerId);
      setFavoriteSellers(prev => prev.filter(seller => seller._id !== sellerId));
      alert('✅ Продавец удалён из избранного');
    } catch (error) {
      console.error('Ошибка при удалении продавца:', error);
      alert('❌ Не удалось удалить продавца из избранного');
    }
  };

  // Защита маршрута
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-diabetes-50 via-white to-health-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-warm-900 mb-4">
            Необходима авторизация
          </h1>
          <p className="text-warm-600 mb-8">
            Пожалуйста, войдите в аккаунт для просмотра профиля
          </p>
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:shadow-medium transition-all"
          >
            Войти в аккаунт
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-diabetes-50 via-white to-health-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p className="text-warm-600 font-medium">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-diabetes-50 via-white to-health-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-soft border-b-4 border-diabetes-600">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-health-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">💊</span>
            </div>
            <h1 className="text-2xl font-bold text-warm-900">Диабет Маркет</h1>
          </Link>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-health-500 text-white rounded-lg hover:bg-health-600 transition-colors font-medium"
          >
            Выход
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-medium border border-warm-200 p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary-600 to-health-500 flex items-center justify-center text-5xl shadow-soft border-4 border-white">
                {user?.avatar ? (
                  <img 
                    src={`http://localhost:5001${user.avatar}`} 
                    alt={user?.name || 'User'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-warm-900">
                    {user?.name || 'Пользователь'}
                  </h1>
                  {verificationStatus === 'verified' && (
                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
                      ✅ Верифицирован
                    </div>
                  )}
                  {verificationStatus === 'pending' && (
                    <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold flex items-center gap-1">
                      ⏳ Проверяется
                    </div>
                  )}
                </div>
                <p className="text-warm-600 mb-1">📧 {user?.email}</p>
                <p className="text-warm-600 mb-1">📱 {user?.phone || 'Не указано'}</p>
                <p className="text-warm-600">🏙️ {user?.city || 'Не указано'}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block px-4 py-2 bg-warm-50 rounded-lg">
                <div className="text-3xl font-bold text-warm-900">
                  {user?.rating || 0}⭐
                </div>
                <p className="text-sm text-warm-600">Рейтинг продавца</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-soft border border-warm-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-warm-600 font-medium">Активные объявления</p>
                <p className="text-3xl font-bold text-warm-900 mt-2">
                  {stats.totalListings}
                </p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft border border-warm-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-warm-600 font-medium">Отзывов получено</p>
                <p className="text-3xl font-bold text-warm-900 mt-2">
                  {stats.totalReviews}
                </p>
              </div>
              <div className="text-4xl">⭐</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft border border-warm-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-warm-600 font-medium">Посылок отправлено</p>
                <p className="text-3xl font-bold text-warm-900 mt-2">
                  {stats.shipmentsSent}
                </p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft border border-warm-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-warm-600 font-medium">Средняя оценка</p>
                <p className="text-3xl font-bold text-warm-900 mt-2">
                  {stats.averageRating.toFixed(1)}
                </p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <Link
            href="/listings/create"
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:shadow-medium transition-all flex items-center gap-2"
          >
            <span>➕</span> Создать объявление
          </Link>
          {verificationStatus === 'none' || verificationStatus === 'rejected' ? (
            <Link
              href="/verification"
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
            >
              <span>✅</span> Стать верифицированным продавцом
            </Link>
          ) : null}
          <button 
            onClick={openEditModal}
            className="px-6 py-3 border-2 border-primary-300 text-warm-900 font-semibold rounded-lg hover:bg-warm-50 transition-all"
          >
            ⚙️ Редактировать профиль
          </button>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-2xl shadow-medium border border-warm-200 mb-8">
          {/* Tab Navigation */}
          <div className="flex border-b border-warm-300">
            <button
              onClick={() => setActiveTab('listings')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'listings'
                  ? 'text-warm-700 border-b-4 border-diabetes-600 bg-warm-50'
                  : 'text-diabetes-500 hover:text-warm-700 hover:bg-warm-50'
              }`}
            >
              📋 Мои объявления ({stats.totalListings})
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'saved'
                  ? 'text-warm-700 border-b-4 border-diabetes-600 bg-warm-50'
                  : 'text-diabetes-500 hover:text-warm-700 hover:bg-warm-50'
              }`}
            >
              ❤️ Избранные товары ({savedListings.length})
            </button>
            <button
              onClick={() => setActiveTab('sellers')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'sellers'
                  ? 'text-warm-700 border-b-4 border-diabetes-600 bg-warm-50'
                  : 'text-diabetes-500 hover:text-warm-700 hover:bg-warm-50'
              }`}
            >
              👥 Избранные продавцы ({favoriteSellers.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* My Listings Tab */}
            {activeTab === 'listings' && (
              <>
                {userListings.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-warm-600 text-lg mb-4">
                      У вас пока нет активных объявлений
                    </p>
                    <Link
                      href="/listings/create"
                      className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:shadow-medium transition-all inline-block"
                    >
                      Создать первое объявление
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userListings.map((listing: any) => (
                      <div
                        key={listing._id}
                        className="border-2 border-warm-300 rounded-lg p-4 hover:shadow-soft transition-all hover:border-diabetes-400"
                      >
                        <div className="bg-gradient-to-br from-diabetes-100 to-health-100 h-40 rounded-lg mb-4 flex items-center justify-center text-4xl">
                          {listing.images?.length > 0 ? '🖼️' : '📷'}
                        </div>
                        <h3 className="font-bold text-warm-900 mb-2 line-clamp-2">
                    {listing.title}
                  </h3>
                  <p className="text-2xl font-bold text-primary-600 mb-3">
                    ₽{listing.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-warm-600 mb-1">
                    📂 {listing.category}
                  </p>
                  <p className="text-sm text-warm-600 mb-4">
                    👁️ {listing.views || 0} просмотров
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href={`/listings/${listing._id}`}
                      className="flex-1 px-3 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-all text-sm text-center"
                    >
                      Просмотр
                    </Link>
                    <button 
                      onClick={() => handleDeleteListing(listing._id)}
                      disabled={deletingId === listing._id}
                      className="flex-1 px-3 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === listing._id ? 'Удаление...' : 'Удалить'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

            {/* Saved Listings Tab */}
            {activeTab === 'saved' && (
              <>
                {savedListings.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-warm-600 text-lg mb-4">
                      У вас пока нет избранных товаров
                    </p>
                    <Link
                      href="/"
                      className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:shadow-medium transition-all inline-block"
                    >
                      Найти товары
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedListings.map((listing: any) => (
                      <Link
                        key={listing._id}
                        href={`/listings/${listing._id}`}
                        className="border-2 border-warm-300 rounded-lg p-4 hover:shadow-soft transition-all hover:border-diabetes-400 block"
                      >
                        <div className="bg-gradient-to-br from-diabetes-100 to-health-100 h-40 rounded-lg mb-4 flex items-center justify-center text-4xl">
                          {listing.images?.length > 0 ? '🖼️' : '📷'}
                        </div>
                        <h3 className="font-bold text-warm-900 mb-2 line-clamp-2">
                          {listing.title}
                        </h3>
                        <p className="text-2xl font-bold text-primary-600 mb-3">
                          ₽{listing.price.toLocaleString()}
                        </p>
                        <p className="text-sm text-warm-600 mb-1">
                          📍 {listing.city}
                        </p>
                        <p className="text-sm text-warm-600">
                          👤 {listing.sellerId?.name || 'Неизвестно'}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Favorite Sellers Tab */}
            {activeTab === 'sellers' && (
              <>
                {favoriteSellers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-warm-600 text-lg mb-4">
                      У вас пока нет избранных продавцов
                    </p>
                    <Link
                      href="/"
                      className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:shadow-medium transition-all inline-block"
                    >
                      Найти продавцов
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteSellers.map((seller: any) => (
                      <div
                        key={seller._id}
                        className="border-2 border-warm-300 rounded-lg p-6 hover:shadow-soft transition-all"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-primary-600 to-health-500 flex items-center justify-center text-white text-2xl font-bold">
                            {seller.avatar ? (
                              <img 
                                src={`http://localhost:5001${seller.avatar}`} 
                                alt={seller.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{seller.name.charAt(0)}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-warm-900 text-lg flex items-center gap-2">
                              {seller.name}
                              {seller.verificationStatus === 'verified' && (
                                <span className="text-green-600" title="Верифицированный продавец">✅</span>
                              )}
                            </h3>
                            <p className="text-sm text-warm-600">📍 {seller.city}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">⭐</span>
                            <span className="font-semibold text-warm-800">
                              {seller.rating?.toFixed(1) || '0.0'}
                            </span>
                          </div>
                          <span className="text-sm text-warm-600">
                            {seller.reviewsCount || 0} отзывов
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            href={`/sellers/${seller._id}`}
                            className="flex-1 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-all text-center text-sm"
                          >
                            Профиль
                          </Link>
                          <button
                            onClick={() => handleRemoveFavoriteSeller(seller._id)}
                            className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-all text-sm"
                          >
                            ❌
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Notifications Section */}
        <div className="mb-8">
          <NotificationsList />
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-medium border border-warm-200 p-8">
          <h2 className="text-2xl font-bold text-warm-900 mb-6 flex items-center gap-2">
            <span>⭐</span> Отзывы о вас ({stats.totalReviews})
          </h2>

          <div className="text-center py-12">
            <p className="text-warm-600 text-lg">
              У вас пока нет отзывов
            </p>
            <p className="text-diabetes-500 text-sm mt-2">
              Отзывы будут появляться здесь, когда покупатели оценят ваши товары
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-warm-900 mb-6">
              ⚙️ Редактировать профиль
            </h2>

            <div className="space-y-4">
              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-2">
                  Фотография профиля
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-warm-100 flex items-center justify-center border-2 border-primary-300">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                    ) : user?.avatar ? (
                      <img src={`http://localhost:5001${user.avatar}`} alt="Current avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">👤</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="cursor-pointer inline-block px-4 py-2 bg-warm-100 text-warm-900 rounded-lg hover:bg-diabetes-200 transition-colors font-medium"
                    >
                      📷 Выбрать фото
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG, GIF. Макс. 5MB
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-700 mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-warm-300 rounded-lg focus:border-primary-500 focus:outline-none"
                  placeholder="Ваше имя"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-700 mb-2">
                  Телефон
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-warm-300 rounded-lg focus:border-primary-500 focus:outline-none"
                  placeholder="+7 (900) 123-45-67"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-700 mb-2">
                  Город
                </label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-warm-300 rounded-lg focus:border-primary-500 focus:outline-none"
                  placeholder="Ваш город"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setIsEditModalOpen(false)}
                disabled={saving}
                className="flex-1 px-6 py-3 border-2 border-primary-300 text-warm-900 font-semibold rounded-lg hover:bg-warm-50 transition-all disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving || uploadingAvatar}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:shadow-medium transition-all disabled:opacity-50"
              >
                {saving || uploadingAvatar ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
