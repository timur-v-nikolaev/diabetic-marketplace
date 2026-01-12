import Link from 'next/link';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  actionHref,
  onAction 
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-4xl">{icon}</span>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-6">{description}</p>
      )}
      {actionLabel && (actionHref || onAction) && (
        actionHref ? (
          <Link
            href={actionHref}
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg"
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg"
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}
