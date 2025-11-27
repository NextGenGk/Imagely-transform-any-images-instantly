/**
 * Rate limiting middleware
 * Implements token bucket algorithm for rate limiting
 * Requirements: 8.1
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry>;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.store = new Map();
    this.config = config;
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if request is allowed for given identifier
   */
  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    // No entry or expired entry - allow request
    if (!entry || now >= entry.resetTime) {
      const resetTime = now + this.config.windowMs;
      this.store.set(identifier, {
        count: 1,
        resetTime,
      });

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime,
      };
    }

    // Entry exists and not expired
    if (entry.count < this.config.maxRequests) {
      entry.count++;
      this.store.set(identifier, entry);

      return {
        allowed: true,
        remaining: this.config.maxRequests - entry.count,
        resetTime: entry.resetTime,
      };
    }

    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Reset rate limit for identifier (useful for testing)
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
  }
}

// Create rate limiter instances for different endpoints
const parseQueryLimiter = new RateLimiter({
  maxRequests: 30, // 30 requests
  windowMs: 60000, // per minute
});

const processImageLimiter = new RateLimiter({
  maxRequests: 10, // 10 requests
  windowMs: 60000, // per minute
});

const historyLimiter = new RateLimiter({
  maxRequests: 60, // 60 requests
  windowMs: 60000, // per minute
});

export { RateLimiter, parseQueryLimiter, processImageLimiter, historyLimiter };
