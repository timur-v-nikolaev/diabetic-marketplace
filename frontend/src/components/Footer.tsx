import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-warm-900 via-warm-800 to-warm-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* О проекте */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-medium">
                <span className="text-white text-xl">💊</span>
              </div>
              <h3 className="text-xl font-display font-bold">Диабет Маркет</h3>
            </div>
            <p className="text-warm-300 text-sm leading-relaxed">
              Площадка для покупки и продажи товаров для диабетиков. 
              Безопасные сделки и удобное общение между покупателями и продавцами.
            </p>
          </div>

          {/* Навигация */}
          <div>
            <h3 className="text-lg font-display font-semibold mb-4">Навигация</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-warm-300 hover:text-white transition-colors duration-200 flex items-center gap-2">
                  <span className="text-primary-400">→</span> Главная
                </Link>
              </li>
              <li>
                <Link href="/listings" className="text-warm-300 hover:text-white transition-colors duration-200 flex items-center gap-2">
                  <span className="text-primary-400">→</span> Объявления
                </Link>
              </li>
              <li>
                <Link href="/listings/create" className="text-warm-300 hover:text-white transition-colors duration-200 flex items-center gap-2">
                  <span className="text-primary-400">→</span> Создать объявление
                </Link>
              </li>
              <li>
                <Link href="/transactions" className="text-warm-300 hover:text-white transition-colors duration-200 flex items-center gap-2">
                  <span className="text-primary-400">→</span> Безопасные сделки
                </Link>
              </li>
            </ul>
          </div>

          {/* Юридическая информация */}
          <div>
            <h3 className="text-lg font-display font-semibold mb-4">Документы</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/privacy" className="text-warm-300 hover:text-white transition-colors duration-200 flex items-center gap-2">
                  <span className="text-primary-400">→</span> Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-warm-300 hover:text-white transition-colors duration-200 flex items-center gap-2">
                  <span className="text-primary-400">→</span> Пользовательское соглашение
                </Link>
              </li>
              <li>
                <Link href="/personal-data" className="text-warm-300 hover:text-white transition-colors duration-200 flex items-center gap-2">
                  <span className="text-primary-400">→</span> Согласие на обработку персональных данных
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-warm-700/30 mt-10 pt-8 text-center">
          <p className="text-warm-400 text-sm">&copy; {currentYear} Диабет Маркет. Все права защищены.</p>
          <p className="text-warm-500 text-xs mt-2">Сделано с заботой о вашем здоровье 🧡</p>
        </div>
      </div>
    </footer>
  );
}
