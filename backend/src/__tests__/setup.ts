import mongoose from 'mongoose';

// Мокаем MongoDB для тестов
beforeAll(async () => {
  // Используем in-memory MongoDB или мок
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-for-testing-purposes';
});

afterAll(async () => {
  // Закрываем соединение после тестов
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

// Очищаем все моки после каждого теста
afterEach(() => {
  jest.clearAllMocks();
});

// Глобальный таймаут для тестов
jest.setTimeout(30000);

// Dummy test to prevent "test suite must contain at least one test" error
describe('Test Setup', () => {
  it('should have test environment configured', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});
