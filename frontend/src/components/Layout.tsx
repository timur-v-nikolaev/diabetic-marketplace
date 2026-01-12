import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import Footer from './Footer';
import CookieBanner from './CookieBanner';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Проверяем, находимся ли мы на странице Telegram Mini App
  const isTelegramPage = router.pathname.startsWith('/tg');

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Для Telegram страниц показываем только контент без навигации
  if (isTelegramPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-primary-50/30 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-soft sticky top-0 z-50 border-b border-warm-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-medium group-hover:shadow-large transition-all duration-300 group-hover:scale-105">
                <span className="text-white text-xl">💊</span>
              </div>
              <span className="text-xl font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Диабет Маркет
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/listings"
                className="text-warm-700 hover:text-primary-600 font-medium transition-colors duration-200"
              >
                Объявления
              </Link>
              <Link
                href="/listings/create"
                className="text-warm-700 hover:text-primary-600 font-medium transition-colors duration-200"
              >
                Создать объявление
              </Link>
            </div>

            {/* Desktop Right Side - Auth & User Menu */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/transactions"
                    className="text-warm-700 hover:text-primary-600 font-medium transition-colors duration-200"
                  >
                    🔒 Сделки
                  </Link>
                  <Link
                    href="/messages"
                    className="text-warm-700 hover:text-primary-600 font-medium relative transition-colors duration-200"
                  >
                    💬 Сообщения
                  </Link>
                  <Link
                    href="/auth/profile"
                    className="text-warm-700 hover:text-primary-600 font-medium transition-colors duration-200"
                  >
                    👤 {user?.name || 'Профиль'}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-warm-600 hover:text-red-600 font-medium transition-colors duration-200"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-warm-700 hover:text-primary-600 font-medium transition-colors duration-200"
                  >
                    Войти
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 font-semibold shadow-soft hover:shadow-medium transition-all duration-200"
                  >
                    Регистрация
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-700 hover:text-blue-600 p-2"
              aria-label="Меню"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-3">
                <Link
                  href="/listings"
                  className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Объявления
                </Link>
                <Link
                  href="/listings/create"
                  className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Создать объявление
                </Link>
                
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/transactions"
                      className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      🔒 Сделки
                    </Link>
                    <Link
                      href="/messages"
                      className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      💬 Сообщения
                    </Link>
                    <Link
                      href="/auth/profile"
                      className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      👤 {user?.name || 'Профиль'}
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="text-left text-red-600 hover:text-red-700 font-medium px-4 py-2"
                    >
                      Выйти
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Войти
                    </Link>
                    <Link
                      href="/auth/register"
                      className="text-blue-600 hover:text-blue-700 font-medium px-4 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Регистрация
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <Footer />

      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  );
}
