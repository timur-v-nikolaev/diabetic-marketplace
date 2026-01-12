import Head from 'next/head';
import Link from 'next/link';
import AvitoHeader from '../components/ui/AvitoHeader';

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>О проекте — Диабет Маркет</title>
        <meta name="description" content="Диабет Маркет — маркетплейс товаров для диабетиков. Покупайте и продавайте глюкометры, тест-полоски, инсулиновые помпы и аксессуары." />
      </Head>

      <div className="min-h-screen bg-avito-bg">
        <AvitoHeader showSearch={false} />

        <main className="avito-container py-8">
          {/* Хлебные крошки */}
          <nav className="text-sm text-avito-text-secondary mb-6">
            <Link href="/" className="hover:text-avito-blue">Главная</Link>
            <span className="mx-2">›</span>
            <span className="text-avito-text">О проекте</span>
          </nav>

          <div className="max-w-3xl mx-auto">
            {/* Главный блок */}
            <div className="bg-white rounded-avito-lg p-6 md:p-8 shadow-avito-card mb-6">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-avito-teal rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">💊</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-avito-text mb-2">
                  Диабет Маркет
                </h1>
                <p className="text-avito-text-secondary">
                  Маркетплейс товаров для людей с диабетом
                </p>
              </div>

              <div className="prose prose-sm max-w-none text-avito-text">
                <h2 className="text-lg font-semibold mb-3">О проекте</h2>
                <p className="mb-4">
                  <strong>Диабет Маркет</strong> — это специализированная площадка для покупки и продажи 
                  товаров, необходимых людям с сахарным диабетом. Мы создали удобный сервис, где вы можете 
                  найти или продать глюкометры, тест-полоски, инсулиновые помпы, системы мониторинга 
                  и другие товары.
                </p>

                <h2 className="text-lg font-semibold mb-3">Наша миссия</h2>
                <p className="mb-4">
                  Помочь людям с диабетом находить необходимые товары по доступным ценам. 
                  Мы понимаем, что расходные материалы стоят дорого, и хотим дать возможность 
                  экономить, покупая б/у оборудование или товары с небольшим сроком годности 
                  по сниженным ценам.
                </p>

                <h2 className="text-lg font-semibold mb-3">Что можно купить и продать</h2>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                  <li>Глюкометры различных производителей</li>
                  <li>Тест-полоски для измерения сахара</li>
                  <li>Инсулиновые помпы и расходные материалы</li>
                  <li>Системы непрерывного мониторинга глюкозы (CGM)</li>
                  <li>Ланцеты и ручки-прокалыватели</li>
                  <li>Шприц-ручки и иглы</li>
                  <li>Аксессуары: чехлы, сумки, браслеты</li>
                </ul>

                <h2 className="text-lg font-semibold mb-3">Преимущества</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <strong>Бесплатное размещение</strong>
                      <p className="text-sm text-avito-text-secondary">Публикуйте объявления без комиссии</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🔒</span>
                    <div>
                      <strong>Безопасные сделки</strong>
                      <p className="text-sm text-avito-text-secondary">Защита покупателя и продавца</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💬</span>
                    <div>
                      <strong>Удобный чат</strong>
                      <p className="text-sm text-avito-text-secondary">Общайтесь напрямую с продавцами</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📱</span>
                    <div>
                      <strong>Мобильная версия</strong>
                      <p className="text-sm text-avito-text-secondary">Работает на любом устройстве</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Контакты */}
            <div className="bg-white rounded-avito-lg p-6 shadow-avito-card mb-6">
              <h2 className="text-lg font-semibold text-avito-text mb-4">Контакты</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📧</span>
                  <a href="mailto:support@diabet.market" className="text-avito-blue hover:underline">
                    support@diabet.market
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">💬</span>
                  <a href="https://t.me/diabetic_marketplace_bot" className="text-avito-blue hover:underline" target="_blank" rel="noopener noreferrer">
                    Telegram бот
                  </a>
                </div>
              </div>
            </div>

            {/* Ссылки */}
            <div className="bg-white rounded-avito-lg p-6 shadow-avito-card">
              <h2 className="text-lg font-semibold text-avito-text mb-4">Полезные ссылки</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Link href="/terms" className="text-avito-blue hover:underline">
                  Пользовательское соглашение
                </Link>
                <Link href="/privacy" className="text-avito-blue hover:underline">
                  Политика конфиденциальности
                </Link>
                <Link href="/catalog" className="text-avito-blue hover:underline">
                  Каталог товаров
                </Link>
                <Link href="/listings/create" className="text-avito-blue hover:underline">
                  Разместить объявление
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* Футер */}
        <footer className="bg-white border-t border-avito-border mt-8 py-6">
          <div className="avito-container">
            <div className="text-center text-sm text-avito-text-secondary">
              © 2026 Диабет Маркет — маркетплейс товаров для диабетиков
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
