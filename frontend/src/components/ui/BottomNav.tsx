import Link from 'next/link';
import { useRouter } from 'next/router';

export default function BottomNav() {
  const router = useRouter();
  const path = router.pathname;

  const isActive = (href: string) => {
    if (href === '/') return path === '/';
    return path.startsWith(href);
  };

  const navItems = [
    { href: '/', icon: '🏠', label: 'Главная' },
    { href: '/listings', icon: '📋', label: 'Товары' },
    { href: '/listings/create', icon: '+', label: '', isCreate: true },
    { href: '/messages', icon: '💬', label: 'Чаты' },
    { href: '/auth/profile', icon: '👤', label: 'Профиль' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-area-pb">
      <div className="max-w-4xl mx-auto px-2 py-2 flex justify-around items-end">
        {navItems.map((item) => (
          item.isCreate ? (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex flex-col items-center"
            >
              <div className="w-14 h-14 -mt-7 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40">
                <span className="text-white text-3xl font-light">+</span>
              </div>
            </Link>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                isActive(item.href) 
                  ? 'text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className={`text-[10px] ${isActive(item.href) ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          )
        ))}
      </div>
    </nav>
  );
}
