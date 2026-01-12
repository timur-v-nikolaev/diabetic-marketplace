import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

interface AvitoHeaderProps {
  showSearch?: boolean;
  showBack?: boolean;
  backHref?: string;
  title?: string;
  onSearch?: (query: string) => void;
  minimal?: boolean;
}

// Категории как на Авито
const HEADER_CATEGORIES = [
  { id: 'all', name: 'Все категории', icon: '☰' },
  { id: 'glucometers', name: 'Глюкометры', href: '/catalog?category=Глюкометры' },
  { id: 'test-strips', name: 'Тест-полоски', href: '/catalog?category=Тест-полоски' },
  { id: 'pumps', name: 'Инсулиновые помпы', href: '/catalog?category=Инсулиновые помпы' },
  { id: 'lancets', name: 'Ланцеты', href: '/catalog?category=Ланцеты' },
  { id: 'accessories', name: 'Аксессуары', href: '/catalog?category=Аксессуары' },
];

export default function AvitoHeader({ 
  showSearch = true, 
  showBack = false,
  backHref,
  title,
  onSearch,
  minimal = false,
}: AvitoHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  // Минимальный хедер для мобильных/мини-аппов
  if (minimal) {
    return (
      <header className="sticky top-0 z-50 bg-white shadow-avito-header">
        <div className="flex items-center h-14 px-4 gap-3">
          {showBack ? (
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-8 h-8 -ml-2"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          ) : (
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-avito-teal rounded flex items-center justify-center">
                <span className="text-white text-sm">💊</span>
              </div>
            </Link>
          )}
          
          {title ? (
            <h1 className="flex-1 text-base font-medium text-avito-text truncate">{title}</h1>
          ) : showSearch ? (
            <form onSubmit={handleSearch} className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск"
                className="w-full h-9 px-3 bg-avito-bg border-0 rounded text-sm avito-search"
              />
            </form>
          ) : (
            <span className="flex-1 font-medium text-avito-text">Диабет Маркет</span>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-avito-header">
      {/* Верхняя строка хедера */}
      <div className="border-b border-avito-border-light">
        <div className="avito-container">
          <div className="flex items-center h-14 gap-4">
            {/* Логотип */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 bg-avito-teal rounded flex items-center justify-center">
                <span className="text-white text-lg">💊</span>
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-base font-semibold text-avito-text leading-tight">
                  Диабет Маркет
                </span>
                <span className="text-[11px] text-avito-text-secondary leading-tight">
                  товары для диабетиков
                </span>
              </div>
            </Link>

            {/* Поиск */}
            {showSearch && (
              <form onSubmit={handleSearch} className="flex-1 max-w-xl">
                <div className="flex">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по объявлениям"
                    className="flex-1 h-10 px-4 bg-avito-bg border border-avito-border rounded-l text-sm focus:outline-none focus:border-avito-blue focus:bg-white transition-colors"
                  />
                  <button 
                    type="submit"
                    className="h-10 px-5 bg-avito-blue text-white rounded-r hover:bg-avito-blue-hover transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </form>
            )}

            {/* Правая часть */}
            <div className="flex items-center gap-1">
              {/* Избранное */}
              <Link 
                href="/favorites"
                className="hidden sm:flex flex-col items-center justify-center w-16 h-12 rounded hover:bg-avito-bg-hover transition-colors"
              >
                <svg className="w-6 h-6 text-avito-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-[11px] text-avito-text-secondary mt-0.5">Избранное</span>
              </Link>

              {/* Сообщения */}
              <Link 
                href="/messages"
                className="hidden sm:flex flex-col items-center justify-center w-16 h-12 rounded hover:bg-avito-bg-hover transition-colors"
              >
                <svg className="w-6 h-6 text-avito-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-[11px] text-avito-text-secondary mt-0.5">Сообщения</span>
              </Link>

              {/* Вход */}
              <Link 
                href="/auth/login"
                className="hidden sm:flex flex-col items-center justify-center w-16 h-12 rounded hover:bg-avito-bg-hover transition-colors"
              >
                <svg className="w-6 h-6 text-avito-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-[11px] text-avito-text-secondary mt-0.5">Вход</span>
              </Link>

              {/* Кнопка разместить */}
              <Link 
                href="/listings/create"
                className="ml-2 avito-btn avito-btn-green"
              >
                <span className="hidden sm:inline">Разместить объявление</span>
                <span className="sm:hidden">+</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Строка категорий */}
      <div className="hidden md:block bg-white">
        <div className="avito-container">
          <nav className="flex items-center gap-1 h-11 overflow-x-auto scrollbar-hide">
            {HEADER_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={cat.href || '/catalog'}
                className="flex items-center gap-1.5 px-3 h-8 rounded text-sm text-avito-text hover:bg-avito-bg-hover transition-colors whitespace-nowrap"
              >
                {cat.icon && <span>{cat.icon}</span>}
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
