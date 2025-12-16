import Image from 'next/image';
import Link from 'next/link';
import { useState, memo } from 'react';
import { listingsAPI } from '../services/api';

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  city: string;
  category?: string;
  rating?: number;
  seller: {
    name: string;
    rating: number;
    verificationStatus?: string;
  };
  isSaved?: boolean;
  onSaveToggle?: (isSaved: boolean) => void;
}

export const ListingCard = ({
  id,
  title,
  price,
  image,
  city,
  category,
  seller,
  isSaved = false,
  onSaveToggle,
}: ListingCardProps) => {
  const [saved, setSaved] = useState(isSaved);
  const [loading, setLoading] = useState(false);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (saved) {
        await listingsAPI.unsave(id);
      } else {
        await listingsAPI.save(id);
      }
      setSaved(!saved);
      onSaveToggle?.(!saved);
    } catch (error) {
      console.error('Failed to toggle save:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link href={`/listings/${id}`}>
      <div className="bg-white rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden border border-warm-200 hover:border-primary-300 cursor-pointer group">
        <div className="relative w-full aspect-square bg-gradient-to-br from-warm-100 to-primary-100 overflow-hidden">
          {image && (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          )}
          <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow">
            <button
              onClick={handleSaveToggle}
              disabled={loading}
              className="text-xl transition-colors"
            >
              {saved ? '❤️' : '🤍'}
            </button>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-warm-900 truncate mb-2 group-hover:text-primary-700 transition-colors">
            {title}
          </h3>

          {category && (
            <div className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full mb-3">
              {category}
            </div>
          )}

          <div className="flex items-baseline gap-2 mb-3">
            <div className="text-3xl font-bold text-primary-600">
              {price}
            </div>
            <span className="text-primary-500 font-semibold">₽</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-warm-600 mb-4">
            <span>📍</span>
            <span>{city}</span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-warm-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-diabetes-600 to-health-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {seller.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-medium text-warm-900 truncate">
                    {seller.name}
                  </p>
                  {seller.verificationStatus === 'verified' && (
                    <span className="text-green-600 text-xs" title="Верифицированный продавец">
                      ✅
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-diabetes-50 px-2 py-1 rounded-lg">
              <span className="text-yellow-500">⭐</span>
              <span className="text-sm font-semibold text-diabetes-800">
                {seller.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Мемоизация компонента для предотвращения лишних ререндеров
export default memo(ListingCard, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.isSaved === nextProps.isSaved &&
    prevProps.price === nextProps.price &&
    prevProps.title === nextProps.title
  );
});
