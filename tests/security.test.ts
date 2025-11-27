/**
 * Security utilities tests
 * Tests for rate limiting, sanitization, and environment validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimiter } from '../lib/rate-limiter';
import {
  sanitizeString,
  sanitizeFilename,
  sanitizeQueryParam,
  sanitizeObject,
  detectSuspiciousPatterns,
  validateContentType,
} from '../lib/sanitization.utils';

describe('Rate Limiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      maxRequests: 5,
      windowMs: 1000,
    });
  });

  it('should allow requests within limit', () => {
    const result1 = rateLimiter.check('user1');
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(4);

    const result2 = rateLimiter.check('user1');
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(3);
  });

  it('should block requests exceeding limit', () => {
    // Use up all requests
    for (let i = 0; i < 5; i++) {
      rateLimiter.check('user1');
    }

    // Next request should be blocked
    const result = rateLimiter.check('user1');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should track different users separately', () => {
    rateLimiter.check('user1');
    rateLimiter.check('user1');

    const result1 = rateLimiter.check('user1');
    expect(result1.remaining).toBe(2);

    const result2 = rateLimiter.check('user2');
    expect(result2.remaining).toBe(4);
  });

  it('should reset after window expires', async () => {
    // Use up all requests
    for (let i = 0; i < 5; i++) {
      rateLimiter.check('user1');
    }

    // Should be blocked
    const blocked = rateLimiter.check('user1');
    expect(blocked.allowed).toBe(false);

    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Should be allowed again
    const allowed = rateLimiter.check('user1');
    expect(allowed.allowed).toBe(true);
  });

  it('should allow reset of specific user', () => {
    // Use up all requests
    for (let i = 0; i < 5; i++) {
      rateLimiter.check('user1');
    }

    // Should be blocked
    const blocked = rateLimiter.check('user1');
    expect(blocked.allowed).toBe(false);

    // Reset user
    rateLimiter.reset('user1');

    // Should be allowed again
    const allowed = rateLimiter.check('user1');
    expect(allowed.allowed).toBe(true);
  });
});

describe('Input Sanitization', () => {
  describe('sanitizeString', () => {
    it('should remove null bytes', () => {
      const input = 'hello\0world';
      const result = sanitizeString(input);
      expect(result).toBe('helloworld');
    });

    it('should trim whitespace', () => {
      const input = '  hello world  ';
      const result = sanitizeString(input);
      expect(result).toBe('hello world');
    });

    it('should limit length', () => {
      const input = 'a'.repeat(20000);
      const result = sanitizeString(input);
      expect(result.length).toBe(10000);
    });

    it('should handle non-string input', () => {
      const result = sanitizeString(123 as any);
      expect(result).toBe('');
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove path separators', () => {
      const input = '../../../etc/passwd';
      const result = sanitizeFilename(input);
      expect(result).not.toContain('/');
      expect(result).not.toContain('\\');
      expect(result).not.toContain('..');
    });

    it('should remove leading dots', () => {
      const input = '...hidden.txt';
      const result = sanitizeFilename(input);
      expect(result).toBe('hidden.txt');
    });

    it('should handle empty filename', () => {
      const input = '';
      const result = sanitizeFilename(input);
      expect(result).toBe('unnamed');
    });

    it('should preserve file extension', () => {
      const input = 'document.pdf';
      const result = sanitizeFilename(input);
      expect(result).toBe('document.pdf');
    });

    it('should limit filename length', () => {
      const input = 'a'.repeat(300) + '.txt';
      const result = sanitizeFilename(input);
      expect(result.length).toBeLessThanOrEqual(255);
      expect(result).toContain('.txt');
    });
  });

  describe('sanitizeQueryParam', () => {
    it('should sanitize string parameters', () => {
      const input = '  test\0value  ';
      const result = sanitizeQueryParam(input);
      expect(result).toBe('testvalue');
    });

    it('should handle null parameters', () => {
      const result = sanitizeQueryParam(null);
      expect(result).toBe(null);
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize string values in object', () => {
      const input = {
        name: '  John\0Doe  ',
        age: 30,
        nested: {
          value: '  test  ',
        },
      };

      const result = sanitizeObject(input);
      expect(result.name).toBe('JohnDoe');
      expect(result.age).toBe(30);
      expect(result.nested.value).toBe('test');
    });

    it('should handle arrays', () => {
      const input = ['  test1  ', '  test2\0  '];
      const result = sanitizeObject(input);
      expect(result[0]).toBe('test1');
      expect(result[1]).toBe('test2');
    });

    it('should handle null and undefined', () => {
      const result1 = sanitizeObject(null as any);
      expect(result1).toBe(null);

      const result2 = sanitizeObject(undefined as any);
      expect(result2).toBe(undefined);
    });
  });

  describe('detectSuspiciousPatterns', () => {
    it('should detect script tags', () => {
      const input = '<script>alert(1)</script>';
      const result = detectSuspiciousPatterns(input);
      expect(result).toBe(true);
    });

    it('should detect javascript protocol', () => {
      const input = 'javascript:alert(1)';
      const result = detectSuspiciousPatterns(input);
      expect(result).toBe(true);
    });

    it('should detect event handlers', () => {
      const input = '<img onerror="alert(1)">';
      const result = detectSuspiciousPatterns(input);
      expect(result).toBe(true);
    });

    it('should detect iframe tags', () => {
      const input = '<iframe src="evil.com"></iframe>';
      const result = detectSuspiciousPatterns(input);
      expect(result).toBe(true);
    });

    it('should not flag normal text', () => {
      const input = 'This is a normal query about resizing images';
      const result = detectSuspiciousPatterns(input);
      expect(result).toBe(false);
    });
  });

  describe('validateContentType', () => {
    it('should validate allowed content types', () => {
      const result = validateContentType('image/jpeg', ['image/jpeg', 'image/png']);
      expect(result).toBe(true);
    });

    it('should reject disallowed content types', () => {
      const result = validateContentType('application/pdf', ['image/jpeg', 'image/png']);
      expect(result).toBe(false);
    });

    it('should handle content type with parameters', () => {
      const result = validateContentType('image/jpeg; charset=utf-8', ['image/jpeg']);
      expect(result).toBe(true);
    });

    it('should be case insensitive', () => {
      const result = validateContentType('IMAGE/JPEG', ['image/jpeg']);
      expect(result).toBe(true);
    });

    it('should handle invalid input', () => {
      const result = validateContentType(123 as any, ['image/jpeg']);
      expect(result).toBe(false);
    });
  });
});
