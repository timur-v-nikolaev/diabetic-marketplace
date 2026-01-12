import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { listingsAPI } from '@/services/api';
import MiniAppNav from '@/components/ui/MiniAppNav';
import { CATEGORIES } from '@/components/ui';

// Telegram WebApp SDK hook
const useTelegram = () => {
  const [tg, setTg] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const telegram = (window as any).Telegram.WebApp;
      telegram.ready();
      setTg(telegram);
    }
  }, []);

  const hapticFeedback = (_type: 'success' | 'error' | 'warning') => {
    tg?.HapticFeedback?.impactOccurred('medium');
  };

  return { tg, hapticFeedback };
};

export default function TGCreate() {
  const router = useRouter();
  const { hapticFeedback } = useTelegram();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    city: '',
  });
  const [images, setImages] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategorySelect = (category: string) => {
    hapticFeedback('success');
    setFormData({ ...formData, category });
    setStep(2);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || images.length >= 3) return;

    Array.from(files).slice(0, 3 - images.length).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const nextStep = () => {
    if (step === 2 && (!formData.title || !formData.description)) {
      setError('Заполните все поля');
      return;
    }
    if (step === 3 && (!formData.price || !formData.city)) {
      setError('Заполните все поля');
      return;
    }
    setError('');
    hapticFeedback('success');
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    hapticFeedback('success');
    try {
      const response = await listingsAPI.create({
        ...formData,
        price: parseInt(formData.price),
        images,
      });
      router.push(`/tg/listings/${response.data._id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка создания');
      hapticFeedback('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Создать объявление - Диабет Маркет</title>
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </Head>

      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-500 to-blue-600 sticky top-0 z-50">
          <div className="px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => step === 1 ? router.back() : setStep(step - 1)}
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
            >
              <span className="text-white text-xl">←</span>
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white">Новое объявление</h1>
              <p className="text-blue-100 text-sm">Шаг {step} из 4</p>
            </div>
          </div>
          <div className="h-1 bg-white/20">
            <div className="h-full bg-white transition-all" style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>
        </header>

        <div className="px-4 py-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Category */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Выберите категорию</h2>
              <p className="text-gray-500 mb-6 text-sm">Это поможет покупателям найти ваш товар</p>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.name)}
                    className={`p-4 rounded-2xl text-left transition-all ${
                      formData.category === cat.name
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-white shadow-sm'
                    }`}
                  >
                    <span className="text-3xl block mb-2">{cat.icon}</span>
                    <span className={`font-semibold ${formData.category === cat.name ? 'text-white' : 'text-gray-800'}`}>
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Опишите товар</h2>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Название</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Например: Глюкометр Accu-Chek"
                  className="w-full px-4 py-3.5 bg-white border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Описание</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Опишите состояние, особенности..."
                  rows={4}
                  className="w-full px-4 py-3.5 bg-white border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <button onClick={nextStep} className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg">
                Далее →
              </button>
            </div>
          )}

          {/* Step 3: Price */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Цена и город</h2>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Цена (₽)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="1000"
                  className="w-full px-4 py-3.5 bg-white border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 text-2xl font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Город</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Москва"
                  className="w-full px-4 py-3.5 bg-white border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
              <button onClick={nextStep} className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg">
                Далее →
              </button>
            </div>
          )}

          {/* Step 4: Photos */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Добавьте фото</h2>
              
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden relative">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {images.length < 3 && (
                <label className="block w-full aspect-video bg-white border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" multiple />
                  <div className="h-full flex flex-col items-center justify-center">
                    <span className="text-4xl mb-2">📷</span>
                    <p className="text-gray-600 font-semibold">Добавить фото</p>
                    <p className="text-gray-400 text-sm">{images.length}/3</p>
                  </div>
                </label>
              )}

              {/* Summary */}
              <div className="p-4 bg-blue-50 rounded-2xl">
                <h3 className="font-bold text-gray-800 mb-2">Проверьте:</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Категория:</span>
                    <span className="font-semibold">{formData.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Название:</span>
                    <span className="font-semibold truncate max-w-[180px]">{formData.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Цена:</span>
                    <span className="font-bold text-blue-600">{parseInt(formData.price || '0').toLocaleString()} ₽</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>✓ Опубликовать</>
                )}
              </button>
            </div>
          )}
        </div>

        <MiniAppNav prefix="/tg" />
      </div>
    </>
  );
}
