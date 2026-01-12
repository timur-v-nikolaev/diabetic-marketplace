import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  icon: string;
  color?: string;
}

// Категории для маркетплейса диабетических товаров
export const AVITO_CATEGORIES: Category[] = [
  { id: 'glucometers', name: 'Глюкометры', icon: '🩸', color: '#e74c3c' },
  { id: 'test-strips', name: 'Тест-полоски', icon: '📊', color: '#3498db' },
  { id: 'pumps', name: 'Инсулиновые помпы', icon: '⚙️', color: '#9b59b6' },
  { id: 'cgm', name: 'Мониторинг', icon: '📱', color: '#1abc9c' },
  { id: 'lancets', name: 'Ланцеты', icon: '📍', color: '#e67e22' },
  { id: 'syringes', name: 'Шприцы и ручки', icon: '💉', color: '#2ecc71' },
  { id: 'accessories', name: 'Аксессуары', icon: '🎒', color: '#34495e' },
  { id: 'other', name: 'Другое', icon: '📦', color: '#95a5a6' },
];

interface AvitoCategoryGridProps {
  onSelect?: (category: string) => void;
  selected?: string;
  variant?: 'horizontal' | 'grid' | 'list';
  showAll?: boolean;
}

export default function AvitoCategoryGrid({ 
  onSelect, 
  selected, 
  variant = 'horizontal',
  showAll = true,
}: AvitoCategoryGridProps) {
  
  // Горизонтальный скролл как на главной Авито
  if (variant === 'horizontal') {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
        {showAll && (
          <button
            onClick={() => onSelect?.('')}
            className={`avito-chip flex-shrink-0 ${!selected ? 'avito-chip-active' : ''}`}
          >
            Все товары
          </button>
        )}
        {AVITO_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect?.(cat.name)}
            className={`avito-chip flex-shrink-0 gap-1.5 ${
              selected === cat.name ? 'avito-chip-active' : ''
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    );
  }

  // Сетка категорий как на Авито (десктоп)
  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
        {AVITO_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/catalog?category=${encodeURIComponent(cat.name)}`}
            onClick={() => onSelect?.(cat.name)}
            className={`flex flex-col items-center p-3 rounded-lg hover:bg-avito-bg transition-colors text-center ${
              selected === cat.name ? 'bg-avito-blue-light' : ''
            }`}
          >
            <span className="text-2xl mb-1">{cat.icon}</span>
            <span className="text-xs text-avito-text leading-tight">{cat.name}</span>
          </Link>
        ))}
      </div>
    );
  }

  // Список категорий (боковое меню)
  return (
    <nav className="space-y-1">
      {showAll && (
        <button
          onClick={() => onSelect?.('')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-left transition-colors ${
            !selected ? 'bg-avito-blue-light text-avito-blue font-medium' : 'hover:bg-avito-bg'
          }`}
        >
          <span className="w-6 text-center">☰</span>
          <span>Все категории</span>
        </button>
      )}
      {AVITO_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect?.(cat.name)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-left transition-colors ${
            selected === cat.name 
              ? 'bg-avito-blue-light text-avito-blue font-medium' 
              : 'hover:bg-avito-bg text-avito-text'
          }`}
        >
          <span className="w-6 text-center">{cat.icon}</span>
          <span>{cat.name}</span>
        </button>
      ))}
    </nav>
  );
}

// Экспорт для обратной совместимости
export const CATEGORIES = AVITO_CATEGORIES;
