import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { listingsAPI } from '../../services/api';

const CATEGORIES = [
  { id: 'glucometers', name: 'Глюкометры', icon: '🩸' },
  { id: 'test-strips', name: 'Тест-полоски', icon: '📊' },
  { id: 'syringes', name: 'Шприцы', icon: '💉' },
  { id: 'pumps', name: 'Инсулиновые помпы', icon: '⚙️' },
  { id: 'monitors', name: 'Глюкозные мониторы', icon: '📱' },
  { id: 'lancets', name: 'Ланцеты', icon: '📍' },
  { id: 'tablets', name: 'Таблетки', icon: '💊' },
  { id: 'other', name: 'Другое', icon: '📦' },
];

export default function CreateListing() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700 flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
          <span className="text-4xl">🔒</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Требуется авторизация</h1>
        <p className="text-blue-100 text-center mb-8">
          Войдите для создания объявления
        </p>
        <Link
          href="/auth/login"
          className="px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl shadow-lg"
        >
          Войти в аккаунт
        </Link>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCategorySelect = (categoryName: string) => {
    setFormData({ ...formData, category: categoryName });
    setStep(2);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length >= 3) {
      setError('Максимум 3 фотографии');
      return;
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const filesToProcess = Math.min(files.length, 3 - images.length);

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      
      if (file.size > MAX_FILE_SIZE) {
        setError(`Файл слишком большой. Максимум 5MB`);
        continue;
      }
      
      if (!file.type.startsWith('image/')) {
        setError(`Файл не является изображением`);
        continue;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.title || !formData.description || !formData.category || !formData.price || !formData.city) {
        setError('Заполните все обязательные поля');
        setLoading(false);
        return;
      }

      if (parseInt(formData.price) <= 0) {
        setError('Цена должна быть больше нуля');
        setLoading(false);
        return;
      }

      const response = await listingsAPI.create({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseInt(formData.price),
        city: formData.city,
        images,
      });

      router.push(`/listings/${response.data._id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка при создании объявления');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 2 && (!formData.title || !formData.description)) {
      setError('Заполните название и описание');
      return;
    }
    if (step === 3 && (!formData.price || !formData.city)) {
      setError('Укажите цену и город');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => step === 1 ? router.back() : prevStep()}
            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
          >
            <span className="text-xl">←</span>
          </button>
          <div className="flex-1">
            <h1 className="font-bold">Создать объявление</h1>
            <p className="text-blue-100 text-sm">Шаг {step} из 4</p>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="h-1 bg-white/20">
          <div 
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Step 1: Category */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Выберите категорию</h2>
            <p className="text-gray-500 mb-6">Это поможет покупателям найти ваш товар</p>
            
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`p-4 rounded-2xl text-left transition-all ${
                    formData.category === cat.name
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-white shadow-sm hover:shadow-md'
                  }`}
                >
                  <span className="text-3xl mb-2 block">{cat.icon}</span>
                  <span className={`font-semibold ${
                    formData.category === cat.name ? 'text-white' : 'text-gray-800'
                  }`}>
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Опишите товар</h2>
            <p className="text-gray-500 mb-6">Подробное описание увеличит шансы на продажу</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Название *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Например: Глюкометр Accu-Chek"
                  maxLength={100}
                  className="w-full px-4 py-3.5 bg-white border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-gray-900"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{formData.title.length}/100</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Описание *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Опишите состояние, особенности, причину продажи..."
                  maxLength={1000}
                  rows={5}
                  className="w-full px-4 py-3.5 bg-white border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-gray-900 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{formData.description.length}/1000</p>
              </div>
            </div>

            <button
              onClick={nextStep}
              className="w-full mt-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30"
            >
              Далее →
            </button>
          </div>
        )}

        {/* Step 3: Price & Location */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Цена и местоположение</h2>
            <p className="text-gray-500 mb-6">Укажите стоимость и ваш город</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Цена (₽) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="1000"
                    min="1"
                    className="w-full px-4 py-3.5 bg-white border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-gray-900 text-2xl font-bold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">₽</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Город *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Москва"
                  className="w-full px-4 py-3.5 bg-white border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-gray-900"
                />
              </div>
            </div>

            <button
              onClick={nextStep}
              className="w-full mt-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30"
            >
              Далее →
            </button>
          </div>
        )}

        {/* Step 4: Photos & Submit */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Добавьте фото</h2>
            <p className="text-gray-500 mb-6">Хорошие фото увеличивают продажи на 50%</p>
            
            {/* Images Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-2xl overflow-hidden">
                    <img src={img} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {images.length < 3 && (
              <label className="block w-full aspect-video bg-white border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-blue-500 transition-all">
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <div className="h-full flex flex-col items-center justify-center">
                  <span className="text-5xl mb-3">📷</span>
                  <p className="text-gray-800 font-semibold">Добавить фото</p>
                  <p className="text-gray-400 text-sm">{images.length}/3 загружено</p>
                </div>
              </label>
            )}

            {/* Summary */}
            <div className="mt-6 p-4 bg-blue-50 rounded-2xl">
              <h3 className="font-bold text-gray-800 mb-3">Проверьте данные:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Категория:</span>
                  <span className="font-semibold text-gray-800">{formData.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Название:</span>
                  <span className="font-semibold text-gray-800 truncate max-w-[200px]">{formData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Цена:</span>
                  <span className="font-bold text-blue-600">{parseInt(formData.price || '0').toLocaleString()} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Город:</span>
                  <span className="font-semibold text-gray-800">{formData.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Фото:</span>
                  <span className="font-semibold text-gray-800">{images.length} шт.</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Создание...</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>Опубликовать</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 safe-area-pb">
        <div className="max-w-2xl mx-auto flex justify-around">
          <Link href="/" className="flex flex-col items-center gap-1 text-gray-400">
            <span className="text-xl">🏠</span>
            <span className="text-xs">Главная</span>
          </Link>
          <Link href="/listings" className="flex flex-col items-center gap-1 text-gray-400">
            <span className="text-xl">📋</span>
            <span className="text-xs">Объявления</span>
          </Link>
          <div className="flex flex-col items-center gap-1 text-blue-500">
            <div className="w-12 h-12 -mt-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">+</span>
            </div>
          </div>
          <Link href="/messages" className="flex flex-col items-center gap-1 text-gray-400">
            <span className="text-xl">💬</span>
            <span className="text-xs">Сообщения</span>
          </Link>
          <Link href="/auth/profile" className="flex flex-col items-center gap-1 text-gray-400">
            <span className="text-xl">👤</span>
            <span className="text-xs">Профиль</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
