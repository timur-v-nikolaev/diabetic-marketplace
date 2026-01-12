import { useRouter } from 'next/router';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  rightContent?: React.ReactNode;
  transparent?: boolean;
}

export default function Header({ 
  title, 
  subtitle, 
  showBack = true, 
  backHref,
  rightContent,
  transparent = false 
}: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header className={`sticky top-0 z-50 ${
      transparent 
        ? 'bg-transparent' 
        : 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg'
    }`}>
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                onClick={handleBack}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
              >
                <span className="text-white text-xl">←</span>
              </button>
            )}
            <div>
              <h1 className="text-lg font-bold text-white">{title}</h1>
              {subtitle && (
                <p className="text-blue-100 text-sm">{subtitle}</p>
              )}
            </div>
          </div>
          {rightContent}
        </div>
      </div>
    </header>
  );
}
