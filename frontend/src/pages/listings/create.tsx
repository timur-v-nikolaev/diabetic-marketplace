import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { listingsAPI } from '../../services/api';

const CATEGORIES = [
  'Глюкометры',
  'Тест-полоски',
  'Шприцы',
  'Инсулиновые помпы',
  'Глюкозные мониторы',
  'Ланцеты',
  'Таблетки',
  'Другое',
];

export default function CreateListing() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Глюкометры',
    price: '',
    city: '',
  });
  const [images, setImages] = useState<string[]>([]);

  // Защита маршрута - только авторизованные пользователи
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-diabetes-50 via-white to-health-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-warm-900 mb-4">
            Необходима авторизация
          </h1>
          <p className="text-warm-600 mb-8">
            Пожалуйста, войдите в аккаунт для создания объявления
          </p>
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:shadow-medium transition-all"
          >
            Войти в аккаунт
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Проверяем максимальное количество фотографий
    if (images.length >= 3) {
      setError('Можно загрузить максимум 3 фотографии');
      return;
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const newImages: string[] = [];
    const filesToProcess = Math.min(files.length, 3 - images.length);

    let processed = 0;
    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      
      // Проверка размера файла
      if (file.size > MAX_FILE_SIZE) {
        setError(`Файл ${file.name} слишком большой. Максимум 5MB`);
        continue;
      }
      
      // Проверка типа файла
      if (!file.type.startsWith('image/')) {
        setError(`Файл ${file.name} не является изображением`);
        continue;
      }
      
      const reader = new FileReader();
      
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        processed++;
        
        if (processed === filesToProcess) {
          setImages([...images, ...newImages]);
          setError('');
        }
      };
      
      reader.onerror = () => {
        setError('Ошибка при чтении файла');
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
      // Валидация
      if (
        !formData.title ||
        !formData.description ||
        !formData.category ||
        !formData.price ||
        !formData.city
      ) {
        setError('Пожалуйста, заполните все обязательные поля');
        setLoading(false);
        return;
      }

      if (parseInt(formData.price) <= 0) {
        setError('Цена должна быть больше нуля');
        setLoading(false);
        return;
      }

      console.log('Создаю объявление:', { ...formData, images });

      const response = await listingsAPI.createListing({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseInt(formData.price),
        city: formData.city,
        images,
      });

      console.log('Объявление создано:', response);

      // Перенаправляем на страницу объявления
      router.push(`/listings/${response.data._id}`);
    } catch (err: any) {
      console.error('Ошибка при создании объявления:', err);
      setError(
        err.response?.data?.error || 'Ошибка при создании объявления'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-diabetes-50 via-white to-health-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-warm-600 hover:text-warm-700 font-medium mb-4 inline-flex items-center gap-2"
          >
            ← На главную
          </Link>
          <h1 className="text-4xl font-bold text-warm-900 mb-2">
            Создать объявление
          </h1>
          <p className="text-warm-600">
            Продайте свой товар или услугу для людей с диабетом
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-medium border border-warm-200 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <span className="text-red-600 mt-1">⚠️</span>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-warm-900 mb-2"
              >
                Название объявления *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Например: Глюкометр Accu-Chek"
                maxLength={100}
                className="w-full px-4 py-3 border-2 border-primary-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
              />
              <p className="text-xs text-warm-600 mt-1">
                {formData.title.length}/100 символов
              </p>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-warm-900 mb-2"
              >
                Описание *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Опишите состояние товара, его особенности, причину продажи и т.д."
                maxLength={1000}
                rows={5}
                className="w-full px-4 py-3 border-2 border-primary-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all resize-none"
              />
              <p className="text-xs text-warm-600 mt-1">
                {formData.description.length}/1000 символов
              </p>
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-semibold text-warm-900 mb-2"
              >
                Категория *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-primary-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-semibold text-warm-900 mb-2"
              >
                Цена (руб.) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="1000"
                min="1"
                className="w-full px-4 py-3 border-2 border-primary-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
              />
            </div>

            {/* City */}
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-semibold text-warm-900 mb-2"
              >
                Город *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Москва"
                className="w-full px-4 py-3 border-2 border-primary-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-warm-900 mb-2">
                Фотографии товара (до 3 штук)
              </label>
              
              {/* Превью загруженных изображений */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-primary-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Кнопка загрузки */}
              {images.length < 3 && (
                <div className="border-2 border-dashed border-primary-300 rounded-lg p-6 text-center hover:border-diabetes-600 transition-all cursor-pointer">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    onChange={handleImageChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <label htmlFor="image" className="cursor-pointer">
                    <p className="text-2xl mb-2">📷</p>
                    <p className="text-warm-900 font-medium">
                      Нажмите для загрузки фото
                    </p>
                    <p className="text-xs text-warm-600 mt-1">
                      или перетащите файлы сюда ({images.length}/3)
                    </p>
                  </label>
                </div>
              )}

              {images.length === 3 && (
                <p className="text-sm text-primary-600 font-medium mt-2">
                  ✓ Загружено максимальное количество фотографий
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-warm-50 border border-warm-300 rounded-lg p-4">
              <p className="text-sm text-warm-700">
                <span className="font-semibold">ℹ️ Совет:</span> Добавьте четкие
                фотографии товара и укажите все детали, чтобы увеличить шансы
                на продажу.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:shadow-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  Создание объявления...
                </>
              ) : (
                <>
                  <span>📋</span>
                  Создать объявление
                </>
              )}
            </button>

            {/* Cancel Button */}
            <Link
              href="/"
              className="w-full px-6 py-3 border-2 border-primary-300 text-warm-900 font-semibold rounded-lg hover:bg-warm-50 transition-all text-center"
            >
              Отмена
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
