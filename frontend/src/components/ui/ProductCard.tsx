import Link from 'next/link';

interface Listing {
  _id: string;
  title: string;
  price: number;
  city?: string;
  images?: string[];
  category?: string;
  views?: number;
  status?: string;
}

interface ProductCardProps {
  listing: Listing;
  compact?: boolean;
  showStatus?: boolean;
  onDelete?: (id: string) => void;
  onClick?: () => void;
  href?: string;
}

export default function ProductCard({ listing, compact = false, showStatus = false, onDelete, onClick, href }: ProductCardProps) {
  const linkHref = href || `/listings/${listing._id}`;
  
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (onClick) {
      return (
        <button onClick={onClick} className="block w-full text-left">
          {children}
        </button>
      );
    }
    return (
      <Link href={linkHref} className="block">
        {children}
      </Link>
    );
  };

  if (compact) {
    return (
      <CardWrapper>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all active:scale-[0.98]">
          <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 relative">
            {listing.images && listing.images.length > 0 ? (
              <img 
                src={listing.images[0]} 
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl">📷</span>
              </div>
            )}
            {showStatus && listing.status && (
              <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                listing.status === 'active' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
              }`}>
                {listing.status === 'active' ? '✓' : '⏸'}
              </span>
            )}
          </div>
          <div className="p-3">
            <p className="text-lg font-bold text-blue-600">{listing.price?.toLocaleString()} ₽</p>
            <p className="text-sm text-gray-800 line-clamp-2 mt-1">{listing.title}</p>
            {listing.city && (
              <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                <span>📍</span> {listing.city}
              </p>
            )}
          </div>
        </div>
      </CardWrapper>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all">
      <CardWrapper>
        <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 relative">
          {listing.images && listing.images.length > 0 ? (
            <img 
              src={listing.images[0]} 
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl">📷</span>
            </div>
          )}
          {showStatus && listing.status && (
            <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-bold ${
              listing.status === 'active' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
            }`}>
              {listing.status === 'active' ? '✅ Активно' : '⏸ Продано'}
            </span>
          )}
        </div>
      </CardWrapper>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold text-blue-600">{listing.price?.toLocaleString()} ₽</p>
            <CardWrapper>
              <h3 className="text-gray-800 font-semibold mt-1 line-clamp-2 hover:text-blue-600 transition-colors">
                {listing.title}
              </h3>
            </CardWrapper>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
          {listing.city && (
            <span className="flex items-center gap-1">
              <span>📍</span> {listing.city}
            </span>
          )}
          {listing.views !== undefined && (
            <span className="flex items-center gap-1">
              <span>👁</span> {listing.views}
            </span>
          )}
          {listing.category && (
            <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
              {listing.category}
            </span>
          )}
        </div>

        {onDelete && (
          <div className="flex gap-2 mt-4">
            <CardWrapper>
              <span className="flex-1 py-2.5 bg-blue-50 text-blue-600 font-semibold rounded-xl text-center text-sm block">
                Открыть
              </span>
            </CardWrapper>
            <button 
              onClick={() => onDelete(listing._id)}
              className="py-2.5 px-4 bg-red-50 text-red-500 rounded-xl text-sm"
            >
              🗑
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
