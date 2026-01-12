interface AvitoLoadingProps {
  type?: 'spinner' | 'skeleton' | 'page';
  count?: number;
}

export default function AvitoLoading({ type = 'spinner', count = 6 }: AvitoLoadingProps) {
  if (type === 'spinner') {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-8 h-8 border-3 border-avito-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (type === 'page') {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-avito-blue border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-avito-text-secondary">Загрузка...</span>
        </div>
      </div>
    );
  }

  // Skeleton cards
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-avito overflow-hidden animate-pulse">
          <div className="aspect-[4/3] bg-avito-bg-secondary" />
          <div className="p-3 space-y-2">
            <div className="h-5 bg-avito-bg-secondary rounded w-2/3" />
            <div className="h-4 bg-avito-bg-secondary rounded w-full" />
            <div className="h-4 bg-avito-bg-secondary rounded w-3/4" />
            <div className="h-3 bg-avito-bg-secondary rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
