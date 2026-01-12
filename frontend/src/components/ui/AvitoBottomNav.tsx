import Link from 'next/link';

interface AvitoBottomNavProps {
  activeTab?: 'home' | 'favorites' | 'create' | 'messages' | 'profile';
  prefix?: string; // For VK/TG mini apps: '/vk' or '/tg'
}

export default function AvitoBottomNav({ activeTab = 'home', prefix = '' }: AvitoBottomNavProps) {
  const tabs = [
    {
      id: 'home' as const,
      label: 'Главная',
      href: `${prefix}/`,
      icon: (active: boolean) => (
        <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
    },
    {
      id: 'favorites' as const,
      label: 'Избранное',
      href: `${prefix}/favorites`,
      icon: (active: boolean) => (
        <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      ),
    },
    {
      id: 'create' as const,
      label: '',
      href: `${prefix}/create`,
      icon: () => (
        <div className="w-14 h-14 -mt-7 bg-avito-green rounded-full flex items-center justify-center shadow-lg border-4 border-white">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
      ),
    },
    {
      id: 'messages' as const,
      label: 'Сообщения',
      href: `${prefix}/messages`,
      icon: (active: boolean) => (
        <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      ),
    },
    {
      id: 'profile' as const,
      label: 'Профиль',
      href: `${prefix}/cabinet`,
      icon: (active: boolean) => (
        <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-avito-border z-50 md:hidden">
      <div className="flex justify-around items-end h-16 px-2 pb-1 safe-area-pb">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex flex-col items-center justify-center flex-1 pt-2 ${
              tab.id === 'create' ? 'relative' : ''
            }`}
          >
            <span className={activeTab === tab.id ? 'text-avito-blue' : 'text-avito-text-secondary'}>
              {tab.icon(activeTab === tab.id)}
            </span>
            {tab.label && (
              <span className={`text-[10px] mt-0.5 ${
                activeTab === tab.id ? 'text-avito-blue font-medium' : 'text-avito-text-secondary'
              }`}>
                {tab.label}
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
