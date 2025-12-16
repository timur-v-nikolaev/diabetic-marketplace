/**
 * Кэширующая утилита для API запросов
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class ApiCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 минут

  /**
   * Получить данные из кэша или выполнить запрос
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  /**
   * Инвалидировать кэш по ключу
   */
  invalidate(key: string) {
    this.cache.delete(key);
  }

  /**
   * Инвалидировать кэш по паттерну
   */
  invalidatePattern(pattern: string) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Очистить весь кэш
   */
  clear() {
    this.cache.clear();
  }
}

export const apiCache = new ApiCache();
