interface Category {
  id: string;
  name: string;
  icon: string;
}

export const CATEGORIES: Category[] = [
  { id: 'glucometers', name: 'Глюкометры', icon: '🩸' },
  { id: 'test-strips', name: 'Тест-полоски', icon: '📊' },
  { id: 'syringes', name: 'Шприцы', icon: '💉' },
  { id: 'pumps', name: 'Помпы', icon: '⚙️' },
  { id: 'monitors', name: 'Мониторы', icon: '📱' },
  { id: 'lancets', name: 'Ланцеты', icon: '📍' },
  { id: 'tablets', name: 'Таблетки', icon: '💊' },
  { id: 'other', name: 'Другое', icon: '📦' },
];

interface CategoryGridProps {
  onSelect?: (category: string) => void;
  selected?: string;
  compact?: boolean;
}

export default function CategoryGrid({ onSelect, selected, compact = false }: CategoryGridProps) {
  if (compact) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <button
          onClick={() => onSelect?.('')}
          className={`flex-shrink-0 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
            !selected 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Все
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect?.(cat.name)}
            className={`flex-shrink-0 px-4 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-1.5 ${
              selected === cat.name 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect?.(cat.name)}
          className={`p-4 rounded-2xl text-center transition-all ${
            selected === cat.name
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
              : 'bg-white shadow-sm hover:shadow-md'
          }`}
        >
          <span className="text-2xl block mb-1">{cat.icon}</span>
          <span className={`text-xs font-semibold ${
            selected === cat.name ? 'text-white' : 'text-gray-700'
          }`}>
            {cat.name}
          </span>
        </button>
      ))}
    </div>
  );
}
