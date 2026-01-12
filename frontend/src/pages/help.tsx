import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import AvitoHeader from '../components/ui/AvitoHeader';

const FAQ_ITEMS = [
  {
    question: 'Как разместить объявление?',
    answer: 'Нажмите кнопку "Разместить объявление" в правом верхнем углу. Заполните форму: добавьте фото, название, описание, цену и выберите категорию. После проверки модератором объявление появится в каталоге.'
  },
  {
    question: 'Сколько стоит размещение?',
    answer: 'Размещение объявлений на Диабет Маркет полностью бесплатное. Мы не берём комиссию с продаж.'
  },
  {
    question: 'Как связаться с продавцом?',
    answer: 'На странице объявления нажмите кнопку "Написать продавцу". Откроется чат, где вы сможете задать вопросы и договориться о сделке.'
  },
  {
    question: 'Как оплатить товар?',
    answer: 'Способ оплаты и доставки обсуждается напрямую с продавцом. Мы рекомендуем использовать безопасные способы оплаты и проверять товар при получении.'
  },
  {
    question: 'Можно ли продавать б/у товары?',
    answer: 'Да, можно продавать как новые, так и б/у товары. Обязательно указывайте состояние товара в описании.'
  },
  {
    question: 'Какие товары запрещено продавать?',
    answer: 'Запрещено продавать: инсулин и другие лекарства, товары с истёкшим сроком годности, поддельные товары, а также любые товары, не связанные с диабетом.'
  },
  {
    question: 'Как удалить объявление?',
    answer: 'Войдите в свой профиль, перейдите в раздел "Мои объявления" и нажмите кнопку удаления рядом с нужным объявлением.'
  },
  {
    question: 'Что делать, если товар не соответствует описанию?',
    answer: 'Свяжитесь с продавцом через чат. Если решить вопрос не удаётся, напишите в поддержку — мы поможем разобраться в ситуации.'
  },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <Head>
        <title>Помощь — Диабет Маркет</title>
        <meta name="description" content="Ответы на частые вопросы о Диабет Маркет. Как размещать объявления, покупать товары и связываться с продавцами." />
      </Head>

      <div className="min-h-screen bg-avito-bg">
        <AvitoHeader showSearch={false} />

        <main className="avito-container py-8">
          {/* Хлебные крошки */}
          <nav className="text-sm text-avito-text-secondary mb-6">
            <Link href="/" className="hover:text-avito-blue">Главная</Link>
            <span className="mx-2">›</span>
            <span className="text-avito-text">Помощь</span>
          </nav>

          <div className="max-w-3xl mx-auto">
            {/* Заголовок */}
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-avito-text mb-2">
                Центр помощи
              </h1>
              <p className="text-avito-text-secondary">
                Ответы на частые вопросы
              </p>
            </div>

            {/* Быстрые действия */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <Link 
                href="/listings/create"
                className="bg-white rounded-avito-lg p-4 shadow-avito-card hover:shadow-md transition-shadow text-center"
              >
                <span className="text-3xl mb-2 block">📝</span>
                <span className="text-sm font-medium text-avito-text">Разместить объявление</span>
              </Link>
              <Link 
                href="/catalog"
                className="bg-white rounded-avito-lg p-4 shadow-avito-card hover:shadow-md transition-shadow text-center"
              >
                <span className="text-3xl mb-2 block">🔍</span>
                <span className="text-sm font-medium text-avito-text">Найти товар</span>
              </Link>
              <Link 
                href="/auth/profile"
                className="bg-white rounded-avito-lg p-4 shadow-avito-card hover:shadow-md transition-shadow text-center"
              >
                <span className="text-3xl mb-2 block">👤</span>
                <span className="text-sm font-medium text-avito-text">Мой профиль</span>
              </Link>
              <Link 
                href="/messages"
                className="bg-white rounded-avito-lg p-4 shadow-avito-card hover:shadow-md transition-shadow text-center"
              >
                <span className="text-3xl mb-2 block">💬</span>
                <span className="text-sm font-medium text-avito-text">Сообщения</span>
              </Link>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-avito-lg shadow-avito-card overflow-hidden mb-8">
              <h2 className="text-lg font-semibold text-avito-text p-4 border-b border-avito-border">
                Частые вопросы
              </h2>
              <div className="divide-y divide-avito-border">
                {FAQ_ITEMS.map((item, index) => (
                  <div key={index}>
                    <button
                      onClick={() => setOpenIndex(openIndex === index ? null : index)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-avito-bg-hover transition-colors"
                    >
                      <span className="font-medium text-avito-text pr-4">{item.question}</span>
                      <svg 
                        className={`w-5 h-5 text-avito-text-secondary flex-shrink-0 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openIndex === index && (
                      <div className="px-4 pb-4 text-avito-text-secondary text-sm">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Контакт поддержки */}
            <div className="bg-white rounded-avito-lg p-6 shadow-avito-card text-center">
              <h2 className="text-lg font-semibold text-avito-text mb-2">
                Не нашли ответ?
              </h2>
              <p className="text-avito-text-secondary mb-4">
                Напишите нам, и мы поможем разобраться
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a 
                  href="mailto:support@diabet.market"
                  className="avito-btn avito-btn-primary"
                >
                  📧 Написать на почту
                </a>
                <a 
                  href="https://t.me/diabetic_marketplace_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="avito-btn avito-btn-secondary"
                >
                  💬 Telegram бот
                </a>
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
