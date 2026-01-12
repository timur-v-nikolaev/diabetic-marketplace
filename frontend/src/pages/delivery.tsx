import Head from 'next/head';
import Link from 'next/link';
import AvitoHeader from '../components/ui/AvitoHeader';

export default function DeliveryPage() {
  return (
    <>
      <Head>
        <title>Доставка — Диабет Маркет</title>
        <meta name="description" content="Информация о способах доставки товаров на Диабет Маркет" />
      </Head>

      <div className="min-h-screen bg-avito-bg">
        <AvitoHeader showSearch={false} />

        <main className="avito-container py-8">
          {/* Хлебные крошки */}
          <nav className="text-sm text-avito-text-secondary mb-6">
            <Link href="/" className="hover:text-avito-blue">Главная</Link>
            <span className="mx-2">›</span>
            <span className="text-avito-text">Доставка</span>
          </nav>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-avito-lg p-6 md:p-8 shadow-avito-card">
              <div className="text-center mb-8">
                <span className="text-5xl mb-4 block">🚚</span>
                <h1 className="text-2xl md:text-3xl font-bold text-avito-text mb-2">
                  Доставка товаров
                </h1>
                <p className="text-avito-text-secondary">
                  Как получить товар на Диабет Маркет
                </p>
              </div>

              <div className="prose prose-sm max-w-none text-avito-text space-y-6">
                <div className="bg-avito-bg rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span>📍</span> Личная встреча
                  </h2>
                  <p className="text-avito-text-secondary">
                    Самый популярный способ. Договоритесь с продавцом о месте и времени встречи. 
                    Вы сможете осмотреть товар перед покупкой и оплатить на месте.
                  </p>
                </div>

                <div className="bg-avito-bg rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span>📦</span> Почта России
                  </h2>
                  <p className="text-avito-text-secondary">
                    Продавец может отправить товар Почтой России. Обсудите условия оплаты 
                    и стоимость доставки в чате. Рекомендуем использовать наложенный платёж 
                    для безопасности.
                  </p>
                </div>

                <div className="bg-avito-bg rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span>🚀</span> Курьерские службы
                  </h2>
                  <p className="text-avito-text-secondary">
                    СДЭК, Boxberry, DPD и другие курьерские службы. Быстрая доставка 
                    с возможностью отслеживания. Стоимость зависит от веса и расстояния.
                  </p>
                </div>

                <div className="border-t border-avito-border pt-6 mt-6">
                  <h2 className="text-lg font-semibold mb-3">⚠️ Важно</h2>
                  <ul className="list-disc pl-5 space-y-2 text-avito-text-secondary">
                    <li>Всегда проверяйте товар при получении</li>
                    <li>Сохраняйте чеки и квитанции об оплате</li>
                    <li>Для медицинских товаров убедитесь в соблюдении условий хранения при транспортировке</li>
                    <li>Тест-полоски и сенсоры чувствительны к температуре — уточняйте условия доставки</li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mt-6">
                  <h3 className="font-semibold text-avito-blue mb-2">💡 Совет</h3>
                  <p className="text-sm text-avito-text-secondary">
                    Перед покупкой внимательно читайте описание объявления и задавайте вопросы 
                    продавцу в чате. Обсудите способ доставки и оплаты до совершения сделки.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

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
