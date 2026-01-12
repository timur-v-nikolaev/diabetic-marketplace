interface LoadingProps {
  text?: string;
  type?: 'inline' | 'page' | 'fullscreen';
}

export default function Loading({ text = 'Загрузка...', type = 'inline' }: LoadingProps) {
  if (type === 'fullscreen') {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-blue-500 to-blue-700 flex flex-col items-center justify-center z-50">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
          <span className="text-4xl">💊</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">Диабет Маркет</h1>
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (type === 'page') {
    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500">{text}</p>
    </div>
  );
}
