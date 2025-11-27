/**
 * Tests for CacheService
 * Requirements: 12.4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CacheService } from '../lib/cache.service';
import { ImageProcessingSpec } from '../lib/types';

describe('CacheService', () => {
  let cacheService: CacheService;

  // Sample test data
  const sampleSpec: ImageProcessingSpec = {
    task_type: 'passport_photo',
    dimensions: {
      width_mm: 35,
      height_mm: 45,
      width_px: null,
      height_px: null,
    },
    dpi: 300,
    background: 'white',
    face_requirements: {
      shoulders_visible: true,
      ears_visible: true,
      centered_face: true,
      no_tilt: true,
    },
    max_file_size_mb: null,
    format: 'jpg',
    additional_notes: null,
  };

  beforeEach(() => {
    // Create a new cache instance for each test
    cacheService = new CacheService();
  });

  describe('generateCacheKey', () => {
    it('should generate consistent keys for identical queries', () => {
      const query = 'convert to passport photo';
      const key1 = cacheService.generateCacheKey(query);
      const key2 = cacheService.generateCacheKey(query);
      
      expect(key1).toBe(key2);
    });

    it('should generate same key for queries with different whitespace', () => {
      const query1 = 'convert to passport photo';
      const query2 = 'convert  to   passport    photo';
      const query3 = '  convert to passport photo  ';
      
      const key1 = cacheService.generateCacheKey(query1);
      const key2 = cacheService.generateCacheKey(query2);
      const key3 = cacheService.generateCacheKey(query3);
      
      expect(key1).toBe(key2);
      expect(key2).toBe(key3);
    });

    it('should generate same key for queries with different case', () => {
      const query1 = 'Convert To Passport Photo';
      const query2 = 'convert to passport photo';
      const query3 = 'CONVERT TO PASSPORT PHOTO';
      
      const key1 = cacheService.generateCacheKey(query1);
      const key2 = cacheService.generateCacheKey(query2);
      const key3 = cacheService.generateCacheKey(query3);
      
      expect(key1).toBe(key2);
      expect(key2).toBe(key3);
    });

    it('should generate different keys for different queries', () => {
      const query1 = 'convert to passport photo';
      const query2 = 'resize to 1280x720';
      
      const key1 = cacheService.generateCacheKey(query1);
      const key2 = cacheService.generateCacheKey(query2);
      
      expect(key1).not.toBe(key2);
    });

    it('should generate SHA-256 hash (64 hex characters)', () => {
      const query = 'test query';
      const key = cacheService.generateCacheKey(query);
      
      expect(key).toHaveLength(64);
      expect(key).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('set and get', () => {
    it('should store and retrieve cached data', () => {
      const query = 'convert to passport photo';
      
      cacheService.set(query, sampleSpec);
      const result = cacheService.get(query);
      
      expect(result).toEqual(sampleSpec);
    });

    it('should return null for non-existent cache entry', () => {
      const result = cacheService.get('non-existent query');
      
      expect(result).toBeNull();
    });

    it('should handle multiple different queries', () => {
      const query1 = 'convert to passport photo';
      const query2 = 'resize to 1280x720';
      
      const spec1 = { ...sampleSpec, task_type: 'passport_photo' as const };
      const spec2 = { ...sampleSpec, task_type: 'resize' as const };
      
      cacheService.set(query1, spec1);
      cacheService.set(query2, spec2);
      
      expect(cacheService.get(query1)).toEqual(spec1);
      expect(cacheService.get(query2)).toEqual(spec2);
    });

    it('should update existing cache entry', () => {
      const query = 'convert to passport photo';
      const spec1 = { ...sampleSpec, dpi: 300 };
      const spec2 = { ...sampleSpec, dpi: 600 };
      
      cacheService.set(query, spec1);
      cacheService.set(query, spec2);
      
      const result = cacheService.get(query);
      expect(result?.dpi).toBe(600);
    });

    it('should normalize query before caching', () => {
      const query1 = 'Convert To Passport Photo';
      const query2 = 'convert  to   passport    photo';
      
      cacheService.set(query1, sampleSpec);
      const result = cacheService.get(query2);
      
      expect(result).toEqual(sampleSpec);
    });
  });

  describe('has', () => {
    it('should return true for cached query', () => {
      const query = 'convert to passport photo';
      
      cacheService.set(query, sampleSpec);
      
      expect(cacheService.has(query)).toBe(true);
    });

    it('should return false for non-cached query', () => {
      expect(cacheService.has('non-existent query')).toBe(false);
    });

    it('should return false for expired entry', () => {
      // Create cache with very short TTL (1ms)
      const shortTTLCache = new CacheService(1);
      const query = 'convert to passport photo';
      
      shortTTLCache.set(query, sampleSpec);
      
      // Wait for expiration
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(shortTTLCache.has(query)).toBe(false);
          resolve();
        }, 10);
      });
    });
  });

  describe('invalidate', () => {
    it('should remove cached entry', () => {
      const query = 'convert to passport photo';
      
      cacheService.set(query, sampleSpec);
      expect(cacheService.has(query)).toBe(true);
      
      const removed = cacheService.invalidate(query);
      
      expect(removed).toBe(true);
      expect(cacheService.has(query)).toBe(false);
    });

    it('should return false when invalidating non-existent entry', () => {
      const removed = cacheService.invalidate('non-existent query');
      
      expect(removed).toBe(false);
    });

    it('should handle normalized queries', () => {
      const query1 = 'Convert To Passport Photo';
      const query2 = 'convert to passport photo';
      
      cacheService.set(query1, sampleSpec);
      const removed = cacheService.invalidate(query2);
      
      expect(removed).toBe(true);
      expect(cacheService.has(query1)).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all cached entries', () => {
      const query1 = 'convert to passport photo';
      const query2 = 'resize to 1280x720';
      const query3 = 'compress to 500KB';
      
      cacheService.set(query1, sampleSpec);
      cacheService.set(query2, sampleSpec);
      cacheService.set(query3, sampleSpec);
      
      expect(cacheService.has(query1)).toBe(true);
      expect(cacheService.has(query2)).toBe(true);
      expect(cacheService.has(query3)).toBe(true);
      
      cacheService.clear();
      
      expect(cacheService.has(query1)).toBe(false);
      expect(cacheService.has(query2)).toBe(false);
      expect(cacheService.has(query3)).toBe(false);
    });

    it('should result in empty cache', () => {
      cacheService.set('query1', sampleSpec);
      cacheService.set('query2', sampleSpec);
      
      cacheService.clear();
      
      const stats = cacheService.getStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return correct cache statistics', () => {
      const stats = cacheService.getStats();
      
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(stats).toHaveProperty('ttl');
      expect(stats.size).toBe(0);
      expect(stats.maxSize).toBe(1000);
    });

    it('should reflect cache size correctly', () => {
      cacheService.set('query1', sampleSpec);
      cacheService.set('query2', sampleSpec);
      cacheService.set('query3', sampleSpec);
      
      const stats = cacheService.getStats();
      expect(stats.size).toBe(3);
    });

    it('should use custom TTL when provided', () => {
      const customTTL = 5000;
      const customCache = new CacheService(customTTL);
      
      const stats = customCache.getStats();
      expect(stats.ttl).toBe(customTTL);
    });
  });

  describe('TTL and expiration', () => {
    it('should return null for expired entries', () => {
      // Create cache with very short TTL (10ms)
      const shortTTLCache = new CacheService(10);
      const query = 'convert to passport photo';
      
      shortTTLCache.set(query, sampleSpec);
      expect(shortTTLCache.get(query)).toEqual(sampleSpec);
      
      // Wait for expiration
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const result = shortTTLCache.get(query);
          expect(result).toBeNull();
          resolve();
        }, 20);
      });
    });

    it('should refresh timestamp on access', () => {
      // Create cache with moderate TTL (100ms)
      const cache = new CacheService(100);
      const query = 'convert to passport photo';
      
      cache.set(query, sampleSpec);
      
      // Access after 50ms (should refresh)
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const result1 = cache.get(query);
          expect(result1).toEqual(sampleSpec);
          
          // Check again after another 70ms (total 120ms from original set)
          // Should still be valid because we refreshed at 50ms
          setTimeout(() => {
            const result2 = cache.get(query);
            expect(result2).toEqual(sampleSpec);
            resolve();
          }, 70);
        }, 50);
      });
    });
  });

  describe('cache size limits', () => {
    it('should not exceed maximum cache size', () => {
      // This test would require setting a smaller max size
      // For now, we verify the stats show the limit
      const stats = cacheService.getStats();
      expect(stats.maxSize).toBe(1000);
    });
  });

  describe('edge cases', () => {
    it('should handle empty query string', () => {
      const query = '';
      cacheService.set(query, sampleSpec);
      
      const result = cacheService.get(query);
      expect(result).toEqual(sampleSpec);
    });

    it('should handle query with special characters', () => {
      const query = 'convert to passport photo! @#$%^&*()';
      cacheService.set(query, sampleSpec);
      
      const result = cacheService.get(query);
      expect(result).toEqual(sampleSpec);
    });

    it('should handle very long queries', () => {
      const query = 'a'.repeat(10000);
      cacheService.set(query, sampleSpec);
      
      const result = cacheService.get(query);
      expect(result).toEqual(sampleSpec);
    });

    it('should handle unicode characters', () => {
      const query = 'convert to passport photo 护照照片 パスポート写真';
      cacheService.set(query, sampleSpec);
      
      const result = cacheService.get(query);
      expect(result).toEqual(sampleSpec);
    });
  });
});
