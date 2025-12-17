/**
 * In-Memory Cache with TTL and LRU eviction
 * Для production рекомендуется использовать Redis
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  lastAccessed: number;
}

interface CacheOptions {
  maxSize?: number;        // Максимальное количество записей
  defaultTTL?: number;     // TTL по умолчанию (ms)
  checkInterval?: number;  // Интервал очистки истёкших записей (ms)
}

export class MemoryCache<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private maxSize: number;
  private defaultTTL: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 1000;
    this.defaultTTL = options.defaultTTL || 60000; // 1 минута
    
    // Периодическая очистка истёкших записей
    if (options.checkInterval !== 0) {
      this.cleanupInterval = setInterval(
        () => this.cleanup(),
        options.checkInterval || 30000 // 30 секунд
      );
    }
  }

  /**
   * Получение значения из кэша
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Проверяем TTL
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Обновляем время последнего доступа (для LRU)
    entry.lastAccessed = Date.now();
    
    return entry.value;
  }

  /**
   * Сохранение значения в кэш
   */
  set(key: string, value: T, ttl?: number): void {
    // LRU eviction если превышен размер
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttl || this.defaultTTL),
      lastAccessed: Date.now(),
    });
  }

  /**
   * Удаление из кэша
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Проверка наличия ключа
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Очистка всего кэша
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Получение размера кэша
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Получение статистики кэша
   */
  stats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }

  /**
   * Удаление наименее используемой записи (LRU)
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Очистка истёкших записей
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Остановка автоматической очистки
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }
}

// Создаём глобальные экземпляры кэша для разных целей
export const statsCache = new MemoryCache<any>({
  maxSize: 100,
  defaultTTL: 30000, // 30 секунд для статистики
});

export const listingsCache = new MemoryCache<any>({
  maxSize: 500,
  defaultTTL: 60000, // 1 минута для листингов
});

export const userCache = new MemoryCache<any>({
  maxSize: 200,
  defaultTTL: 300000, // 5 минут для пользователей
});

/**
 * Декоратор для кэширования результатов функции
 */
export function cached<T>(
  cache: MemoryCache<T>,
  keyGenerator: (...args: any[]) => string,
  ttl?: number
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = keyGenerator(...args);
      
      // Проверяем кэш
      const cached = cache.get(key);
      if (cached !== null) {
        return cached;
      }

      // Выполняем оригинальный метод
      const result = await originalMethod.apply(this, args);
      
      // Сохраняем в кэш
      cache.set(key, result, ttl);
      
      return result;
    };

    return descriptor;
  };
}

/**
 * Helper для кэширования с async/await
 */
export async function withCache<T>(
  cache: MemoryCache<T>,
  key: string,
  factory: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = cache.get(key);
  if (cached !== null) {
    return cached;
  }

  const result = await factory();
  cache.set(key, result, ttl);
  
  return result;
}
