import Link from 'next/link';

interface AvitoEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function AvitoEmptyState({ 
  icon,
  title, 
  description, 
  actionLabel, 
  actionHref,
  onAction 
}: AvitoEmptyStateProps) {
  const defaultIcon = (
    <svg className="w-16 h-16 text-avito-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4">
        {icon || defaultIcon}
      </div>
      <h3 className="text-lg font-semibold text-avito-text mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-avito-text-secondary mb-6 max-w-sm">{description}</p>
      )}
      {actionLabel && (actionHref || onAction) && (
        actionHref ? (
          <Link 
            href={actionHref}
            className="avito-btn avito-btn-primary"
          >
            {actionLabel}
          </Link>
        ) : (
          <button 
            onClick={onAction}
            className="avito-btn avito-btn-primary"
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}
