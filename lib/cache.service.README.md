# Cache Service

## Overview

The `CacheService` provides in-memory caching for parsed query results to improve application performance and reduce API calls to the Gemini service.

## Features

- **In-memory caching**: Fast access to frequently used query results
- **Automatic key generation**: SHA-256 hash-based cache keys with query normalization
- **TTL (Time To Live)**: Configurable expiration for cache entries (default: 1 hour)
- **LRU eviction**: Least Recently Used eviction when cache reaches maximum size
- **Automatic cleanup**: Periodic removal of expired entries
- **Query normalization**: Case-insensitive, whitespace-normalized cache keys

## Usage

### Basic Usage

```typescript
import { getCacheInstance } from '@/lib/cache.service';

const cache = getCacheInstance();

// Store a result
cache.set(query, parsedSpec);

// Retrieve a result
const result = cache.get(query);

// Check if cached
if (cache.has(query)) {
  // Use cached result
}

// Invalidate a specific entry
cache.invalidate(query);

// Clear all cache
cache.clear();
```

### Integration with API Routes

The cache service is integrated into the `/api/parse-query` route:

```typescript
// Check cache first
let parsedSpec = cacheService.get(query);

if (parsedSpec) {
  // Cache hit - return cached result
  return NextResponse.json({ success: true, data: parsedSpec });
}

// Cache miss - parse query using Gemini
parsedSpec = await geminiService.parseQuery(query);

// Store result in cache
cacheService.set(query, parsedSpec);
```

## Configuration

### Custom TTL

```typescript
import { CacheService } from '@/lib/cache.service';

// Create cache with 30-minute TTL
const cache = new CacheService(1800000);
```

### Cache Statistics

```typescript
const stats = cache.getStats();
console.log(stats);
// {
//   size: 42,        // Current number of entries
//   maxSize: 1000,   // Maximum capacity
//   ttl: 3600000     // TTL in milliseconds
// }
```

## Cache Key Generation

Cache keys are generated using SHA-256 hashing with query normalization:

1. **Trim whitespace**: Leading and trailing spaces removed
2. **Lowercase conversion**: All characters converted to lowercase
3. **Whitespace normalization**: Multiple spaces collapsed to single space
4. **SHA-256 hashing**: Normalized query hashed for consistent keys

This ensures that queries like:
- `"Convert To Passport Photo"`
- `"convert  to   passport    photo"`
- `"  convert to passport photo  "`

All generate the same cache key and retrieve the same cached result.

## Cache Invalidation Strategy

### Automatic Expiration

Entries automatically expire after the configured TTL (default: 1 hour). Expired entries are:
- Removed on access (lazy deletion)
- Periodically cleaned up every 5 minutes

### Manual Invalidation

```typescript
// Invalidate specific query
cache.invalidate('convert to passport photo');

// Clear entire cache
cache.clear();
```

### LRU Eviction

When the cache reaches maximum capacity (1000 entries), the least recently used entry is evicted. The eviction algorithm considers:
- **Timestamp**: When the entry was last accessed
- **Access count**: How many times the entry has been accessed
- **Score**: `timestamp + (accessCount * 60000)` - higher score = more valuable

## Performance Characteristics

- **Get operation**: O(1) - constant time lookup
- **Set operation**: O(1) - constant time insertion (O(n) when eviction needed)
- **Key generation**: O(n) - linear in query length for hashing
- **Memory usage**: ~1KB per cached entry (varies by spec complexity)

## Best Practices

1. **Use the singleton instance**: Call `getCacheInstance()` for application-wide caching
2. **Monitor cache size**: Check `getStats()` to ensure cache is effective
3. **Adjust TTL**: Set appropriate TTL based on how often specs change
4. **Clear on updates**: Invalidate cache when parsing logic changes

## Requirements Validation

This implementation satisfies **Requirement 12.4**:
> THE System SHALL implement caching for repeated identical queries to improve response time

### Property 26: Query caching
*For any* identical query submitted multiple times, the system returns the same cached result without re-processing.

## Testing

Comprehensive tests cover:
- Cache key generation and normalization
- Storage and retrieval
- TTL and expiration
- Invalidation and clearing
- Edge cases (empty queries, special characters, unicode)
- LRU eviction
- Statistics tracking

Run tests:
```bash
npm test -- cache.service.test.ts
```

## Future Enhancements

Potential improvements for production use:

1. **Redis integration**: Replace in-memory cache with Redis for distributed caching
2. **Cache warming**: Pre-populate cache with common queries
3. **Metrics**: Track hit rate, miss rate, eviction rate
4. **Compression**: Compress cached values to reduce memory usage
5. **Persistence**: Save cache to disk on shutdown, restore on startup
