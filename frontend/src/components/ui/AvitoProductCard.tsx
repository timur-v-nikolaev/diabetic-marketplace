import Link from 'next/link';
import { useState } from 'react';

interface Listing {
  _id: string;
  title: string;
  price: number;
  city?: string;
  images?: string[];
  category?: string;
  createdAt?: string;
  views?: number;
}

interface AvitoProductCardProps {
  listing: Listing;
  href?: string;
  onClick?: () => void;
  showFavorite?: boolean;
  showDelivery?: boolean;
}

export default function AvitoProductCard({ 
  listing, 
  href, 
  onClick,
  showFavorite = true,
  showDelivery = false,
}: AvitoProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const linkHref = href || `/listings/${listing._id}`;
  
  // Форматирование цены как на Авито
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  // Форматирование даты как на Авито
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дн. назад`;
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const CardContent = (
    <article className="relative bg-white rounded avito-card group">
      {/* Изображение */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t">
        {listing.images && listing.images.length > 0 ? (
          <img 
            src={listing.images[0]} 
            alt={listing.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-avito-bg">
            <svg className="w-12 h-12 text-avito-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Бейджи */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {showDelivery && (
            <span className="px-1.5 py-0.5 bg-avito-teal text-white text-[10px] font-medium rounded">
              Доставка
            </span>
          )}
        </div>

        {/* Счётчик фото */}
        {listing.images && listing.images.length > 1 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-0.5 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span>{listing.images.length}</span>
          </div>
        )}

        {/* Кнопка избранного */}
        {showFavorite && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
          >
            <svg 
              className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-avito-text-secondary'}`}
              fill={isFavorite ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
      </div>

      {/* Контент карточки */}
      <div className="p-2.5">
        {/* Цена - крупная и чёрная как на Авито */}
        <p className="avito-price mb-1">
          {formatPrice(listing.price)} ₽
        </p>

        {/* Название - обычный шрифт, макс 2 строки */}
        <h3 className="text-[14px] leading-[18px] text-avito-text line-clamp-2 mb-2">
          {listing.title}
        </h3>

        {/* Локация и дата - мелкий серый текст */}
        <div className="avito-meta">
          {listing.city && (
            <p className="truncate">{listing.city}</p>
          )}
          {listing.createdAt && (
            <p>{formatDate(listing.createdAt)}</p>
          )}
        </div>
      </div>
    </article>
  );

  if (onClick) {
    return (
      <div onClick={onClick} className="cursor-pointer">
        {CardContent}
      </div>
    );
  }

  return (
    <Link href={linkHref} className="block">
      {CardContent}
    </Link>
  );
}
