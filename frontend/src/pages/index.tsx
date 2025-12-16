import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { listingsAPI } from '../services/api';
import { ListingCard } from '../components/ListingCard';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ activeListings: 0, sellers: 0 });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    search: '',
  });

  const handleFilter = useCallback(async (page = 1) => {
    setLoading(true);
    
    try {
      const response = await listingsAPI.getAll({ ...filters, page, limit: 9 });
      setListings(response.data.listings || []);
      setPagination({
        page: response.data.page || 1,
        totalPages: response.data.totalPages || 1,
        total: response.data.total || 0
      });
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const scrollToSearch = useCallback(() => {
    const searchSection = document.getElementById('search');
    if (searchSection) {
      const offset = 80;
      const elementPosition = searchSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5001/api/stats');
      const data = await response.json();
      setStats({
        activeListings: data.activeListings || 0,
        sellers: data.sellers || 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    handleFilter();
    fetchStats();

    // Обновляем статистику каждые 30 секунд
    const statsInterval = setInterval(fetchStats, 30000);

    return () => clearInterval(statsInterval);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/30">
            <span className="text-2xl">💊</span>
            <span className="font-semibold">Надежная площадка для диабетиков</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 leading-tight">
            Товары для здоровья<br/>
            <span className="text-accent-200">в одном месте</span>
          </h1>
          <p className="text-white/90 text-xl mb-10 max-w-3xl mx-auto leading-relaxed">
            Безопасная торговая площадка для покупки и продажи товаров диабетикам. 
            Проверенные продавцы, честные цены и забота о вашем здоровье.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={scrollToSearch}
              className="px-8 py-4 bg-white text-primary-600 rounded-xl hover:bg-warm-50 transition-all font-bold text-lg shadow-large hover:shadow-xl hover:scale-105 transform duration-200 cursor-pointer"
            >
              🛍️ Начать покупку
            </button>
            {isAuthenticated ? (
              <Link
                href="/listings/create"
                className="px-8 py-4 bg-primary-700/30 backdrop-blur-md text-white border-2 border-white/50 rounded-xl hover:bg-primary-700/50 transition-all font-bold text-lg"
              >
                ➕ Создать объявление
              </Link>
            ) : (
              <Link
                href="/listings/create"
                className="px-8 py-4 bg-primary-700/30 backdrop-blur-md text-white border-2 border-white/50 rounded-xl hover:bg-primary-700/50 transition-all font-bold text-lg"
              >
                🚀 Начать продажу
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features and Statistics Combined Section */}
      <section className="bg-gradient-to-br from-warm-50 via-primary-50/20 to-warm-50 border-b border-warm-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Features Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-soft border border-warm-200 p-8 hover:shadow-large hover:-translate-y-2 transition-all duration-500 animate-[fadeInUp_0.6s_ease-out]">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-medium hover:scale-110 hover:rotate-6 transition-transform duration-300">
                ✓
              </div>
              <h3 className="text-xl font-bold text-warm-900 mb-4 text-center">Проверенные продавцы</h3>
              <p className="text-warm-600 text-center">
                Все продавцы проходят верификацию и имеют рейтинг надежности
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-soft border border-warm-200 p-8 hover:shadow-large hover:-translate-y-2 transition-all duration-500 animate-[fadeInUp_0.6s_ease-out_0.2s] opacity-0 [animation-fill-mode:forwards]">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-medium hover:scale-110 hover:rotate-6 transition-transform duration-300">
                🛡️
              </div>
              <h3 className="text-xl font-bold text-warm-900 mb-4 text-center">Безопасность данных</h3>
              <p className="text-warm-600 text-center">
                Защита данных и безопасные платежи гарантированы
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-soft border border-warm-200 p-8 hover:shadow-large hover:-translate-y-2 transition-all duration-500 animate-[fadeInUp_0.6s_ease-out_0.4s] opacity-0 [animation-fill-mode:forwards]">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-main to-accent-dark text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-medium hover:scale-110 hover:rotate-6 transition-transform duration-300">
                💬
              </div>
              <h3 className="text-xl font-bold text-warm-900 mb-4 text-center">Круглосуточная поддержка</h3>
              <p className="text-warm-600 text-center">
                Помощь в любой момент. Обратитесь к нашей команде
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section id="search" className="bg-white/80 backdrop-blur-md border-b border-warm-200 sticky top-16 z-40 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-semibold text-warm-900 flex items-center gap-2">
              <span className="text-primary-500">🔍</span> Поиск товаров
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-200">
                <span className="text-primary-600 font-bold text-lg">{stats.activeListings}</span>
                <span className="text-warm-600 text-xs font-medium">товаров</span>
              </div>
              <div className="flex items-center gap-2 bg-secondary-50 px-3 py-1.5 rounded-lg border border-secondary-200">
                <span className="text-secondary-600 font-bold text-lg">{stats.sellers}</span>
                <span className="text-warm-600 text-xs font-medium">продавцов</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-3 border-2 border-warm-300 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
            />
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-3 border-2 border-warm-300 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
            >
              <option value="">Все категории</option>
              <option value="Глюкометры и тест-полоски">🩸 Глюкометры и тест-полоски</option>
              <option value="Медицинские принадлежности">💉 Медицинские принадлежности</option>
              <option value="Системы мониторинга">📊 Системы мониторинга</option>
              <option value="Инсулиновые помпы">⚕️ Инсулиновые помпы</option>
              <option value="Уход за кожей">🧴 Уход за кожей</option>
              <option value="Гигиена полости рта">🦷 Гигиена полости рта</option>
              <option value="Спец. питание">🍎 Спец. питание</option>
              <option value="Витамины и БАДы">💊 Витамины и БАДы</option>
            </select>
            <input
              type="text"
              placeholder="Город"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="px-4 py-3 border-2 border-warm-300 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
            />
            <input
              type="number"
              placeholder="От ₽"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="px-4 py-3 border-2 border-warm-300 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
            />
            <button
              onClick={handleFilter}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-semibold shadow-soft hover:shadow-medium"
            >
              Поиск
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-warm-700 font-medium">Загрузка товаров...</p>
            </div>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-warm-50 border-2 border-dashed border-primary-200 rounded-lg p-12 text-center">
            <p className="text-warm-700 text-lg font-medium mb-4">📦 Товаров не найдено</p>
            <p className="text-warm-600 mb-6">Попробуйте изменить параметры поиска или вернитесь позже</p>
            <Link
              href="/auth/register"
              className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-health-600 transition-colors font-semibold"
            >
              Опубликовать объявление
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <p className="text-warm-700 font-medium">
                Найдено товаров: <span className="text-2xl font-bold text-warm-900">{pagination.total}</span>
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard
                  key={listing._id}
                  id={listing._id}
                  title={listing.title}
                  price={listing.price}
                  image={listing.images?.[0]}
                  city={listing.city}
                  category={listing.category}
                  rating={listing.rating}
                  isSaved={listing.isSaved || false}
                  seller={{
                    name: listing.sellerId?.name || 'Unknown',
                    rating: listing.sellerId?.rating || 0,
                    verificationStatus: listing.sellerId?.verificationStatus || 'none',
                  }}
                />
              ))}
            </div>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  onClick={() => handleFilter(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-lg border-2 border-warm-300 text-warm-700 font-semibold hover:bg-warm-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  ← Назад
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 4) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 3) {
                      pageNum = pagination.totalPages - 6 + i;
                    } else {
                      pageNum = pagination.page - 3 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handleFilter(pageNum)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          pagination.page === pageNum
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-medium'
                            : 'border-2 border-warm-300 text-warm-700 hover:bg-warm-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handleFilter(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 rounded-lg border-2 border-warm-300 text-warm-700 font-semibold hover:bg-warm-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Вперед →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Рекламный баннер для продавцов */}
      <section className="bg-gradient-to-r from-primary-500 via-diabetes-600 to-health-500 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12 border-2 border-white/20 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Левая часть - Текст */}
              <div className="text-white">
                <div className="inline-block bg-yellow-400 text-warm-900 px-4 py-2 rounded-full text-sm font-bold mb-4">
                  🎯 ДЛЯ ПРОДАВЦОВ
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Продавайте свои товары тысячам покупателей!
                </h2>
                <p className="text-white/80 text-lg mb-6">
                  Разместите объявление бесплатно и начните продавать уже сегодня. 
                  Более 10,000 активных покупателей ждут ваших предложений.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-3xl font-bold">0₽</div>
                    <div className="text-sm text-white/70">За размещение</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-3xl font-bold">24/7</div>
                    <div className="text-sm text-white/70">Доступность</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  {isAuthenticated ? (
                    <Link
                      href="/listings/create"
                      className="px-8 py-4 bg-white text-warm-700 rounded-lg hover:bg-warm-50 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      🚀 Создать объявление
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/auth/register"
                        className="px-8 py-4 bg-white text-warm-700 rounded-lg hover:bg-warm-50 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Зарегистрироваться
                      </Link>
                      <Link
                        href="/auth/login"
                        className="px-8 py-4 bg-diabetes-900/30 text-white border-2 border-white rounded-lg hover:bg-diabetes-900/50 transition-all font-bold text-lg backdrop-blur-sm"
                      >
                        Войти
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Правая часть - Преимущества */}
              <div className="space-y-4">
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30 hover:bg-white/30 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">💰</div>
                    <div>
                      <h3 className="text-white font-bold text-xl mb-2">Бесплатное размещение</h3>
                      <p className="text-white/80">Никаких скрытых платежей. Размещайте столько объявлений, сколько хотите</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30 hover:bg-white/30 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">👥</div>
                    <div>
                      <h3 className="text-white font-bold text-xl mb-2">Целевая аудитория</h3>
                      <p className="text-white/80">Ваши товары увидят только заинтересованные покупатели</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30 hover:bg-white/30 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">⚡</div>
                    <div>
                      <h3 className="text-white font-bold text-xl mb-2">Быстрая продажа</h3>
                      <p className="text-white/80">В среднем товары продаются за 3-5 дней</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
