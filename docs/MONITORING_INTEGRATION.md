# Monitoring Integration Guide

This guide shows how to integrate the monitoring and logging system into your API routes and services.

## Quick Start

### 1. Basic API Route with Monitoring

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withMonitoring } from '@/lib/monitoring.middleware';
import { logger } from '@/lib/logger.service';

export const POST = withMonitoring(
  async (request: NextRequest) => {
    const body = await request.json();
    
    logger.info('Processing request', {
      endpoint: '/api/example',
      metadata: { action: body.action },
    });
    
    // Your business logic here
    const result = { success: true };
    
    return NextResponse.json(result);
  },
  {
    endpoint: '/api/example',
    operation: 'processRequest',
  }
);
```

### 2. Service with Performance Monitoring

```typescript
// lib/my-service.ts
import { performanceMonitor } from '@/lib/performance.service';
import { logger } from '@/lib/logger.service';

export class MyService {
  async processData(data: any, userId: string) {
    return await performanceMonitor.measureAsync(
      'myservice.processData',
      async () => {
        logger.info('Starting data processing', { userId });
        
        // Your processing logic
        const result = await this.doWork(data);
        
        logger.info('Data processing complete', { userId });
        return result;
      },
      { userId }
    );
  }
}
```

### 3. External Service Call Monitoring

```typescript
import { monitorExternalService } from '@/lib/monitoring.middleware';

// Monitor Gemini API call
const result = await monitorExternalService(
  'Gemini',
  'parseQuery',
  async () => {
    return await geminiService.parseQuery(query);
  },
  { userId }
);

// Monitor ImageKit upload
const imageUrl = await monitorExternalService(
  'ImageKit',
  'uploadImage',
  async () => {
    return await imagekitService.uploadImage(buffer, filename);
  },
  { userId }
);
```

### 4. Error Handling with Tracking

```typescript
import { logger } from '@/lib/logger.service';
import { errorTracker } from '@/lib/error-tracker.service';

try {
  await riskyOperation();
} catch (error) {
  // Errors are automatically tracked via logError
  logger.error('Operation failed', error, {
    userId,
    endpoint: '/api/endpoint',
    operation: 'riskyOperation',
  });
  
  throw error;
}
```

## Health Check Endpoint

The health check endpoint is available at `/api/health`:

```bash
# Check system health
curl http://localhost:3000/api/health

# Example response
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123456,
  "checks": {
    "database": { "status": "up", "responseTime": 45 },
    "gemini": { "status": "up", "configured": true },
    "imagekit": { "status": "up", "configured": true },
    "clerk": { "status": "up", "configured": true }
  },
  "metrics": {
    "totalErrors": 5,
    "criticalErrors": 0,
    "recentErrors": 2
  },
  "version": "1.0.0",
  "environment": "production"
}
```

## Monitoring Dashboard

### View Error Statistics

```typescript
import { errorTracker } from '@/lib/error-tracker.service';

// Get overall statistics
const stats = errorTracker.getErrorStats();
console.log('Total errors:', stats.totalErrors);
console.log('Errors by code:', stats.errorsByCode);
console.log('Errors by endpoint:', stats.errorsByEndpoint);

// Get critical errors
const criticalErrors = errorTracker.getErrorsBySeverity('critical');

// Get recent errors
const recentErrors = errorTracker.getRecentErrors(10);
```

### View Performance Metrics

```typescript
import { performanceMonitor } from '@/lib/performance.service';

// Get current operations
const metrics = performanceMonitor.getMetricsSnapshot();
console.log('Active operations:', metrics);
```

## Log Levels

- **DEBUG**: Detailed debugging information (development only)
- **INFO**: General informational messages
- **WARN**: Warning messages for potential issues
- **ERROR**: Error messages for failures

## Best Practices

1. **Always include context**: Add userId, endpoint, and operation to logs
2. **Use appropriate log levels**: Don't log everything as ERROR
3. **Monitor external services**: Wrap all external API calls with monitoring
4. **Track performance**: Use performance monitoring for slow operations
5. **Check health regularly**: Monitor the /api/health endpoint
6. **Review error statistics**: Regularly check error rates and patterns

## Production Setup

### Environment Variables

Ensure these are set in production:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
GEMINI_API_KEY=...
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
```

### External Service Integration

For production, integrate with external monitoring services:

- **Sentry** for error tracking
- **DataDog** for APM and logging
- **New Relic** for performance monitoring
- **CloudWatch** for AWS deployments

### Alerting

Set up alerts for:
- Critical errors (immediate notification)
- High error rates (> 10 errors/minute)
- Slow operations (> threshold)
- Health check failures
- Service degradation

## Troubleshooting

### High Error Rates

```typescript
// Check what's causing errors
const stats = errorTracker.getErrorStats();
console.log('Errors by endpoint:', stats.errorsByEndpoint);
console.log('Errors by code:', stats.errorsByCode);

// Get recent errors for investigation
const recent = errorTracker.getRecentErrors(20);
recent.forEach(error => {
  console.log(`${error.timestamp}: ${error.errorMessage}`);
  console.log('Context:', error.context);
});
```

### Slow Operations

```typescript
// Check current operations
const metrics = performanceMonitor.getMetricsSnapshot();
console.log('Long-running operations:', metrics);
```

### Service Health Issues

```bash
# Check health endpoint
curl http://localhost:3000/api/health | jq '.'

# Check specific service
curl http://localhost:3000/api/health | jq '.checks.database'
```
