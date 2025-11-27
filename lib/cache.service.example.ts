/**
 * Example usage of CacheService
 * This file demonstrates how the caching layer works
 */

import { getCacheInstance } from './cache.service';
import { ImageProcessingSpec } from './types';

// Example: Using cache in application code
async function exampleCacheUsage() {
  const cache = getCacheInstance();
  
  // Example query
  const query = 'convert to passport photo 300 dpi';
  
  // Check if result is cached
  let result = cache.get(query);
  
  if (result) {
    console.log('Cache hit! Returning cached result');
    return result;
  }
  
  console.log('Cache miss. Processing query...');
  
  // Simulate processing (in real app, this would call GeminiService)
  const processedResult: ImageProcessingSpec = {
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
  
  // Store in cache for future requests
  cache.set(query, processedResult);
  
  return processedResult;
}

// Example: Cache statistics monitoring
function monitorCacheStats() {
  const cache = getCacheInstance();
  const stats = cache.getStats();
  
  console.log('Cache Statistics:');
  console.log(`- Current size: ${stats.size} entries`);
  console.log(`- Maximum size: ${stats.maxSize} entries`);
  console.log(`- TTL: ${stats.ttl / 1000} seconds`);
  console.log(`- Usage: ${((stats.size / stats.maxSize) * 100).toFixed(2)}%`);
}

// Example: Cache invalidation
function invalidateCache(query: string) {
  const cache = getCacheInstance();
  
  const removed = cache.invalidate(query);
  
  if (removed) {
    console.log(`Cache entry for "${query}" has been invalidated`);
  } else {
    console.log(`No cache entry found for "${query}"`);
  }
}

// Example: Query normalization demonstration
function demonstrateNormalization() {
  const cache = getCacheInstance();
  
  const queries = [
    'Convert To Passport Photo',
    'convert  to   passport    photo',
    '  CONVERT TO PASSPORT PHOTO  ',
  ];
  
  // All these queries will generate the same cache key
  const keys = queries.map(q => cache.generateCacheKey(q));
  
  console.log('Query normalization:');
  queries.forEach((q, i) => {
    console.log(`Query: "${q}"`);
    console.log(`Key: ${keys[i]}`);
  });
  
  console.log('\nAll keys are identical:', keys.every(k => k === keys[0]));
}

// Example: Performance comparison
async function comparePerformance() {
  const cache = getCacheInstance();
  const query = 'convert to passport photo';
  
  // First request (cache miss)
  const start1 = Date.now();
  await exampleCacheUsage();
  const time1 = Date.now() - start1;
  
  // Second request (cache hit)
  const start2 = Date.now();
  cache.get(query);
  const time2 = Date.now() - start2;
  
  console.log('Performance comparison:');
  console.log(`First request (cache miss): ${time1}ms`);
  console.log(`Second request (cache hit): ${time2}ms`);
  console.log(`Speed improvement: ${((time1 - time2) / time1 * 100).toFixed(2)}%`);
}

// Export examples for demonstration
export {
  exampleCacheUsage,
  monitorCacheStats,
  invalidateCache,
  demonstrateNormalization,
  comparePerformance,
};
