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
  const [activeTab, setActiveTab] = useState<'listings' | 'saved' | 'sellers' | 'notifications'>('listings');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    city: '',
  });
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
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
        const userId = user?.id || user?._id;
        
        if (userId) {
          const listingsResponse = await listingsAPI.getByUserId(userId);
          const listings = Array.isArray(listingsResponse.data) ? listingsResponse.data : [];
          setUserListings(listings);
          
          try {
            const savedResponse = await listingsAPI.getSaved();
            setSavedListings(savedResponse.data || []);
          } catch (err) {
            console.error('Ошибка загрузки избранных товаров:', err);
          }
          
          try {
            const sellersResponse = await favoritesAPI.getSellers();
            setFavoriteSellers(sellersResponse.data || []);
          } catch (err) {
            console.error('Ошибка загрузки избранных продавцов:', err);
          }
          
          try {
            const verificationResponse = await verificationAPI.getStatus();
            setVerificationStatus(verificationResponse.data?.verificationStatus || 'none');
          } catch (err) {
            console.error('Ошибка загрузки статуса верификации:', err);
          }
          
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
  }, [isAuthenticated, user?.id, user?._id, user?.rating]);

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
      setUserListings(prev => prev.filter(listing => listing._id !== listingId));
      setStats(prev => ({
        ...prev,
        totalListings: prev.totalListings - 1,
      }));
    } catch (error) {
      console.error('Ошибка при удалении объявления:', error);
      alert('Не удалось удалить объявление');
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
      if (!file.type.startsWith('image/')) {
        alert('Выберите файл изображения');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB');
        return;
      }
      setAvatarFile(file);
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
      
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        await authAPI.uploadAvatar(formData);
      }
      
      await authAPI.updateProfile(editForm);
      setIsEditModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Ошибка при сохранении профиля:', error);
      alert('Ошибка при сохранении профиля');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFavoriteSeller = async (sellerId: string) => {
    if (!confirm('Удалить продавца из избранного?')) {
      return;
    }
    try {
      await favoritesAPI.removeSeller(sellerId);
      setFavoriteSellers(prev => prev.filter(seller => seller._id !== sellerId));
    } catch (error) {
      console.error('Ошибка при удалении продавца:', error);
    }
  };

  const handleRemoveSavedListing = async (listingId: string) => {
    try {
      await listingsAPI.unsave(listingId);
      setSavedListings(prev => prev.filter(listing => listing._id !== listingId));
    } catch (error) {
      console.error('Ошибка при удалении из избранного:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700 flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
          <span className="text-4xl">🔒</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Требуется авторизация</h1>
        <p className="text-blue-100 text-center mb-8">
          Войдите в аккаунт для просмотра профиля
        </p>
        <Link
          href="/auth/login"
          className="px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl shadow-lg"
        >
          Войти в аккаунт
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-b from-blue-500 to-blue-600 h-48"></div>
        <div className="flex flex-col items-center justify-center -mt-24">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Profile Header */}
      <div className="bg-gradient-to-b from-blue-500 to-blue-600 pt-6 pb-24 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">←</span>
          </Link>
          <h1 className="text-lg font-bold text-white">Профиль</h1>
          <button
            onClick={handleLogout}
            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
          >
            <span className="text-xl">🚪</span>
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="max-w-4xl mx-auto px-4 -mt-16">
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              {user?.avatar ? (
                <img 
                  src={`http://localhost:5001${user.avatar}`} 
                  alt={user?.name || 'User'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl text-white">👤</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-gray-800">{user?.name || 'Пользователь'}</h2>
                {verificationStatus === 'verified' && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs font-semibold">✓ Верифицирован</span>
                )}
              </div>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <p className="text-gray-500 text-sm">{user?.city || 'Город не указан'}</p>
            </div>
            <button
              onClick={openEditModal}
              className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"
            >
              <span>✏️</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-blue-50 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.totalListings}</p>
              <p className="text-xs text-gray-500 mt-1">Объявлений</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.totalReviews}</p>
              <p className="text-xs text-gray-500 mt-1">Отзывов</p>
            </div>
            <div className="bg-orange-50 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.shipmentsSent}</p>
              <p className="text-xs text-gray-500 mt-1">Отправок</p>
            </div>
            <div className="bg-purple-50 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.averageRating.toFixed(1)}⭐</p>
              <p className="text-xs text-gray-500 mt-1">Рейтинг</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link
            href="/listings/create"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-blue-500/30"
          >
            <span className="text-2xl">➕</span>
            <div>
              <p className="font-bold">Создать</p>
              <p className="text-xs text-blue-100">Новое объявление</p>
            </div>
          </Link>
          {verificationStatus !== 'verified' && (
            <Link
              href="/verification"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-green-500/30"
            >
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-bold">Верификация</p>
                <p className="text-xs text-green-100">Стать продавцом</p>
              </div>
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm p-2 mb-4 flex gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('listings')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === 'listings' ? 'bg-blue-500 text-white' : 'text-gray-600'
            }`}
          >
            📋 Мои товары
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === 'saved' ? 'bg-blue-500 text-white' : 'text-gray-600'
            }`}
          >
            ❤️ Избранное
          </button>
          <button
            onClick={() => setActiveTab('sellers')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === 'sellers' ? 'bg-blue-500 text-white' : 'text-gray-600'
            }`}
          >
            👥 Продавцы
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === 'notifications' ? 'bg-blue-500 text-white' : 'text-gray-600'
            }`}
          >
            🔔 Уведомления
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-sm">
          {/* My Listings */}
          {activeTab === 'listings' && (
            <div className="p-4">
              {userListings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📦</span>
                  </div>
                  <p className="text-gray-500 mb-4">У вас пока нет объявлений</p>
                  <Link
                    href="/listings/create"
                    className="inline-block px-6 py-3 bg-blue-500 text-white font-bold rounded-xl"
                  >
                    Создать первое
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {userListings.map((listing: any) => (
                    <div key={listing._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">📷</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">{listing.title}</h3>
                        <p className="text-blue-600 font-bold">{listing.price?.toLocaleString()} ₽</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>👁️ {listing.views || 0}</span>
                          <span className={listing.status === 'active' ? 'text-green-600' : 'text-orange-600'}>
                            {listing.status === 'active' ? '✅ Активно' : '✓ Продано'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/listings/${listing._id}`} className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                          👁️
                        </Link>
                        <button
                          onClick={() => handleDeleteListing(listing._id)}
                          disabled={deletingId === listing._id}
                          className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center disabled:opacity-50"
                        >
                          {deletingId === listing._id ? '...' : '🗑️'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Saved Listings */}
          {activeTab === 'saved' && (
            <div className="p-4">
              {savedListings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">❤️</span>
                  </div>
                  <p className="text-gray-500">Нет сохранённых товаров</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedListings.map((listing: any) => (
                    <div key={listing._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-red-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">❤️</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">{listing.title}</h3>
                        <p className="text-blue-600 font-bold">{listing.price?.toLocaleString()} ₽</p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/listings/${listing._id}`} className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                          👁️
                        </Link>
                        <button
                          onClick={() => handleRemoveSavedListing(listing._id)}
                          className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Favorite Sellers */}
          {activeTab === 'sellers' && (
            <div className="p-4">
              {favoriteSellers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">👥</span>
                  </div>
                  <p className="text-gray-500">Нет избранных продавцов</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {favoriteSellers.map((seller: any) => (
                    <div key={seller._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-2xl text-white">👤</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800">{seller.name}</h3>
                        <p className="text-sm text-gray-500">{seller.city} • ⭐ {seller.rating || 0}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/sellers/${seller._id}`} className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                          👁️
                        </Link>
                        <button
                          onClick={() => handleRemoveFavoriteSeller(seller._id)}
                          className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="p-4">
              <NotificationsList />
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Редактировать профиль</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Avatar Upload */}
            <div className="flex justify-center mb-6">
              <label className="cursor-pointer">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center relative">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : user?.avatar ? (
                    <img src={`http://localhost:5001${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl text-white">👤</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-2xl">📷</span>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Имя</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Телефон</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Город</label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>✓</span>
                    <span>Сохранить</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 safe-area-pb">
        <div className="max-w-4xl mx-auto flex justify-around">
          <Link href="/" className="flex flex-col items-center gap-1 text-gray-400">
            <span className="text-xl">🏠</span>
            <span className="text-xs">Главная</span>
          </Link>
          <Link href="/listings" className="flex flex-col items-center gap-1 text-gray-400">
            <span className="text-xl">📋</span>
            <span className="text-xs">Объявления</span>
          </Link>
          <Link href="/listings/create" className="flex flex-col items-center gap-1 text-gray-400">
            <div className="w-12 h-12 -mt-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">+</span>
            </div>
          </Link>
          <Link href="/messages" className="flex flex-col items-center gap-1 text-gray-400">
            <span className="text-xl">💬</span>
            <span className="text-xs">Сообщения</span>
          </Link>
          <Link href="/auth/profile" className="flex flex-col items-center gap-1 text-blue-500">
            <span className="text-xl">👤</span>
            <span className="text-xs font-semibold">Профиль</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
