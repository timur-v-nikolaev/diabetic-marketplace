import Link from 'next/link';
import { useRouter } from 'next/router';

interface MiniAppNavProps {
  prefix: string; // '/vk' или '/tg'
}

export default function MiniAppNav({ prefix }: MiniAppNavProps) {
  const router = useRouter();
  const path = router.pathname;

  const isActive = (href: string) => path === href || path.startsWith(href + '/');

  const navItems = [
    { href: `${prefix}`, icon: '🏠', label: 'Главная', exact: true },
    { href: `${prefix}/favorites`, icon: '❤️', label: 'Избранное' },
    { href: `${prefix}/create`, icon: '+', label: '', isCreate: true },
    { href: `${prefix}/messages`, icon: '💬', label: 'Чаты' },
    { href: `${prefix}/cabinet`, icon: '👤', label: 'Профиль' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-area-pb">
      <div className="flex justify-around items-end px-2 py-2">
        {navItems.map((item) => {
          const active = item.exact ? path === item.href : isActive(item.href);
          
          if (item.isCreate) {
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center">
                <div className="w-14 h-14 -mt-7 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40">
                  <span className="text-white text-3xl font-light">+</span>
                </div>
              </Link>
            );
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-all ${
                active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className={`text-[10px] ${active ? 'font-semibold' : ''}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
