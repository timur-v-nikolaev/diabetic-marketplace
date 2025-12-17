import { sanitizeSearchQuery, isValidObjectId, isStrongPassword } from '../utils/validators';

describe('Validators', () => {
  describe('sanitizeSearchQuery', () => {
    it('should escape regex special characters', () => {
      expect(sanitizeSearchQuery('test.*query')).toBe('test\\.\\*query');
      expect(sanitizeSearchQuery('hello+world')).toBe('hello\\+world');
      expect(sanitizeSearchQuery('test[123]')).toBe('test\\[123\\]');
    });

    it('should return empty string for invalid input', () => {
      expect(sanitizeSearchQuery('')).toBe('');
      expect(sanitizeSearchQuery(null as any)).toBe('');
      expect(sanitizeSearchQuery(undefined as any)).toBe('');
    });

    it('should not modify normal strings', () => {
      expect(sanitizeSearchQuery('normal text')).toBe('normal text');
      expect(sanitizeSearchQuery('инсулин')).toBe('инсулин');
    });
  });

  describe('isValidObjectId', () => {
    it('should return true for valid ObjectId', () => {
      expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
      expect(isValidObjectId('5f50c31e8577ac0017b0f00a')).toBe(true);
    });

    it('should return false for invalid ObjectId', () => {
      expect(isValidObjectId('invalid')).toBe(false);
      expect(isValidObjectId('123')).toBe(false);
      expect(isValidObjectId('')).toBe(false);
      expect(isValidObjectId('zzzzzzzzzzzzzzzzzzzzzzzz')).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    it('should accept strong passwords', () => {
      expect(isStrongPassword('Password123')).toEqual({ valid: true });
      expect(isStrongPassword('MySecure1Pass')).toEqual({ valid: true });
      expect(isStrongPassword('Test1234ABC')).toEqual({ valid: true });
    });

    it('should reject short passwords', () => {
      const result = isStrongPassword('Pass1');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('8 characters');
    });

    it('should reject passwords without uppercase', () => {
      const result = isStrongPassword('password123');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('uppercase');
    });

    it('should reject passwords without lowercase', () => {
      const result = isStrongPassword('PASSWORD123');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('lowercase');
    });

    it('should reject passwords without numbers', () => {
      const result = isStrongPassword('PasswordABC');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('number');
    });
  });
});
