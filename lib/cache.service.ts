/**
 * CacheService - In-memory caching for query results
 * Requirements: 12.4
 */

import { ImageProcessingSpec } from './types';
import crypto from 'crypto';

/**
 * Cache entry structure
 */
interface CacheEntry {
  data: ImageProcessingSpec;
  timestamp: number;
  accessCount: number;
}

/**
 * Service class for caching parsed query results
 */
export class CacheService {
  private cache: Map<string, CacheEntry>;
  private readonly DEFAULT_TTL = 3600000; // 1 hour in milliseconds
  private readonly MAX_CACHE_SIZE = 1000; // Maximum number of entries
  private ttl: number;

  constructor(ttl?: number) {
    this.cache = new Map();
    this.ttl = ttl || this.DEFAULT_TTL;
    
    // Set up periodic cleanup
    this.startCleanupInterval();
  }

  /**
   * Generate a cache key from a query string
   * Uses SHA-256 hash of normalized query for consistent keys
   * Requirements: 12.4
   */
  generateCacheKey(query: string): string {
    // Normalize the query: trim, lowercase, remove extra spaces
    const normalized = query.trim().toLowerCase().replace(/\s+/g, ' ');
    
    // Generate SHA-256 hash for consistent key generation
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Get cached result for a query
   * Returns null if not found or expired
   * Requirements: 12.4
   */
  get(query: string): ImageProcessingSpec | null {
    const key = this.generateCacheKey(query);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access count for LRU tracking
    entry.accessCount++;
    entry.timestamp = now; // Refresh timestamp on access

    return entry.data;
  }

  /**
   * Store a query result in cache
   * Requirements: 12.4
   */
  set(query: string, data: ImageProcessingSpec): void {
    const key = this.generateCacheKey(query);
    
    // Check if we need to evict entries
    if (this.cache.size >= this.MAX_CACHE_SIZE && !this.cache.has(key)) {
      this.evictLeastRecentlyUsed();
    }

    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      accessCount: 1,
    };

    this.cache.set(key, entry);
  }

  /**
   * Check if a query exists in cache and is not expired
   * Requirements: 12.4
   */
  has(query: string): boolean {
    return this.get(query) !== null;
  }

  /**
   * Invalidate (remove) a specific query from cache
   * Requirements: 12.4
   */
  invalidate(query: string): boolean {
    const key = this.generateCacheKey(query);
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   * Requirements: 12.4
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    ttl: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      ttl: this.ttl,
    };
  }

  /**
   * Evict least recently used entry when cache is full
   * Uses combination of timestamp and access count
   */
  private evictLeastRecentlyUsed(): void {
    let oldestKey: string | null = null;
    let oldestScore = Infinity;

    // Find entry with lowest score (oldest timestamp + lowest access count)
    for (const [key, entry] of this.cache.entries()) {
      // Score combines recency and frequency
      // Lower score = less valuable entry
      const score = entry.timestamp + (entry.accessCount * 60000); // 1 access = 1 minute of age
      
      if (score < oldestScore) {
        oldestScore = score;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanupInterval(): void {
    // Run cleanup every 5 minutes
    setInterval(() => {
      this.cleanupExpired();
    }, 300000);
  }

  /**
   * Remove all expired entries from cache
   */
  private cleanupExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }
}

// Singleton instance for application-wide use
let cacheInstance: CacheService | null = null;

/**
 * Get the singleton cache instance
 */
export function getCacheInstance(): CacheService {
  if (!cacheInstance) {
    cacheInstance = new CacheService();
  }
  return cacheInstance;
}
