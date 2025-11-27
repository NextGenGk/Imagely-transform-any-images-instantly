# Monitoring and Logging System

This document describes the monitoring and logging infrastructure for the NLP Image Processor application.

## Overview

The monitoring system provides:
- **Structured Logging**: JSON-formatted logs with context
- **Performance Monitoring**: Track operation durations and identify slow operations
- **Error Tracking**: Centralized error tracking with severity levels
- **Health Checks**: System health status endpoint

## Components

### 1. Logger Service (`logger.service.ts`)

Provides structured logging with different log levels.

**Usage:**
```typescript
import { logger } from '@/lib/logger.service';

// Log info message
logger.info('User logged in', {
  userId: 'user_123',
  endpoint: '/api/auth',
});

// Log error
logger.error('Failed to process image', error, {
  userId: 'user_123',
  endpoint: '/api/process-image',
  operation: 'uploadImage',
});

// Log API request
logger.logRequest('POST', '/api/parse-query', {
  userId: 'user_123',
  requestId: 'req_abc',
});

// Log API response
logger.logResponse('POST', '/api/parse-query', 200, 1234, {
  userId: 'user_123',
  requestId: 'req_abc',
});

// Log external service call
logger.logExternalService('Gemini', 'parseQuery', true, 2500, {
  userId: 'user_123',
});
```

**Log Levels:**
- `DEBUG`: Detailed information for debugging (only in development)
- `INFO`: General informational messages
- `WARN`: Warning messages for potential issues
- `ERROR`: Error messages for failures

### 2. Performance Monitor (`performance.service.ts`)

Tracks operation durations and identifies slow operations.

**Usage:**
```typescript
import { performanceMonitor } from '@/lib/performance.service';

// Measure async operation
const result = await performanceMonitor.measureAsync(
  'gemini.parseQuery',
  async () => {
    return await geminiService.parseQuery(query);
  },
  {
    userId: 'user_123',
    endpoint: '/api/parse-query',
  }
);

// Measure sync operation
const parsed = performanceMonitor.measure(
  'parsing.dimensions',
  () => parseDimensions(input),
  { userId: 'user_123' }
);

// Manual timing
performanceMonitor.startTimer('operation-id');
// ... do work ...
const duration = performanceMonitor.endTimer('operation-id');
```

**Performance Thresholds:**
- Gemini API: 5000ms
- ImageKit upload: 10000ms
- ImageKit transform: 5000ms
- Database operations: 1000ms
- API endpoints: 2000-3000ms

Operations exceeding thresholds are logged as warnings.

### 3. Error Tracker (`error-tracker.service.ts`)

Centralized error tracking with severity classification.

**Usage:**
```typescript
import { errorTracker } from '@/lib/error-tracker.service';

// Track error
errorTracker.trackError(error, {
  userId: 'user_123',
  endpoint: '/api/parse-query',
  operation: 'parseQuery',
  requestId: 'req_abc',
});

// Get error statistics
const stats = errorTracker.getErrorStats();
console.log(stats.totalErrors);
console.log(stats.errorsByCode);
console.log(stats.errorsByEndpoint);

// Get errors by severity
const criticalErrors = errorTracker.getErrorsBySeverity('critical');

// Get recent errors
const recentErrors = errorTracker.getRecentErrors(10);
```

**Error Severity Levels:**
- `low`: Validation errors, user errors (400-level)
- `medium`: External service errors, parsing errors
- `high`: Database errors, service unavailable
- `critical`: System failures, out of memory, connection refused

### 4. Monitoring Middleware (`monitoring.middleware.ts`)

Wraps API routes with automatic monitoring.

**Usage:**
```typescript
import { withMonitoring } from '@/lib/monitoring.middleware';

export const POST = withMonitoring(
  async (request: NextRequest) => {
    // Your handler code
    return NextResponse.json({ success: true });
  },
  {
    endpoint: '/api/parse-query',
    operation: 'parseQuery',
  }
);
```

**Features:**
- Automatic request/response logging
- Performance tracking
- Error tracking
- Request ID generation
- User context extraction

### 5. Health Check Endpoint (`/api/health`)

System health status endpoint for monitoring.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123456,
  "checks": {
    "database": {
      "status": "up",
      "responseTime": 45
    },
    "gemini": {
      "status": "up",
      "configured": true
    },
    "imagekit": {
      "status": "up",
      "configured": true
    },
    "clerk": {
      "status": "up",
      "configured": true
    }
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

**Status Codes:**
- `200`: System is healthy or degraded
- `503`: System is unhealthy

**Health Status:**
- `healthy`: All systems operational
- `degraded`: Some non-critical services down
- `unhealthy`: Critical services down or critical errors present

## Integration Examples

### Example 1: API Route with Full Monitoring

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withMonitoring, monitorExternalService } from '@/lib/monitoring.middleware';
import { logger } from '@/lib/logger.service';

export const POST = withMonitoring(
  async (request: NextRequest) => {
    const body = await request.json();
    
    // Call external service with monitoring
    const result = await monitorExternalService(
      'Gemini',
      'parseQuery',
      () => geminiService.parseQuery(body.query),
      { userId: body.userId }
    );
    
    return NextResponse.json({ success: true, data: result });
  },
  {
    endpoint: '/api/parse-query',
    operation: 'parseQuery',
  }
);
```

### Example 2: Service with Performance Monitoring

```typescript
import { performanceMonitor } from '@/lib/performance.service';
import { logger } from '@/lib/logger.service';

export class MyService {
  async processData(data: any, userId: string) {
    return await performanceMonitor.measureAsync(
      'myservice.processData',
      async () => {
        logger.info('Processing data', { userId, operation: 'processData' });
        
        // Process data
        const result = await this.doProcessing(data);
        
        logger.info('Data processed successfully', { userId });
        return result;
      },
      { userId }
    );
  }
}
```

### Example 3: Error Handling with Tracking

```typescript
import { errorTracker } from '@/lib/error-tracker.service';
import { logger } from '@/lib/logger.service';

try {
  await riskyOperation();
} catch (error) {
  // Error is automatically tracked via logError
  logger.error('Operation failed', error, {
    userId: 'user_123',
    endpoint: '/api/endpoint',
    operation: 'riskyOperation',
  });
  
  throw error;
}
```

## Production Considerations

### External Service Integration

In production, integrate with external monitoring services:

**Error Tracking:**
- Sentry
- Rollbar
- DataDog

**Logging:**
- CloudWatch (AWS)
- Stackdriver (GCP)
- Azure Monitor

**Performance Monitoring:**
- New Relic
- DataDog APM
- Dynatrace

### Configuration

Set environment variables for external services:

```env
# Sentry
SENTRY_DSN=https://...

# DataDog
DD_API_KEY=...
DD_APP_KEY=...

# New Relic
NEW_RELIC_LICENSE_KEY=...
```

### Log Retention

Configure log retention policies:
- Development: 7 days
- Staging: 30 days
- Production: 90 days

### Alerting

Set up alerts for:
- Critical errors (immediate)
- High error rates (5 minutes)
- Slow operations (15 minutes)
- Service degradation (5 minutes)
- Health check failures (immediate)

## Best Practices

1. **Always log with context**: Include userId, endpoint, operation
2. **Use appropriate log levels**: Don't log everything as ERROR
3. **Monitor performance**: Track slow operations
4. **Track errors**: Use error tracker for all errors
5. **Check health regularly**: Monitor /api/health endpoint
6. **Review metrics**: Regularly review error statistics
7. **Set up alerts**: Configure alerts for critical issues
8. **Sanitize logs**: Never log sensitive data (passwords, tokens)

## Troubleshooting

### High Error Rates

```typescript
// Check error statistics
const stats = errorTracker.getErrorStats();
console.log('Total errors:', stats.totalErrors);
console.log('Errors by code:', stats.errorsByCode);
console.log('Errors by endpoint:', stats.errorsByEndpoint);

// Get critical errors
const critical = errorTracker.getErrorsBySeverity('critical');
console.log('Critical errors:', critical);
```

### Slow Operations

```typescript
// Check performance metrics
const metrics = performanceMonitor.getMetricsSnapshot();
console.log('Current operations:', metrics);
```

### System Health

```bash
# Check health endpoint
curl http://localhost:3000/api/health

# Check specific service
curl http://localhost:3000/api/health | jq '.checks.database'
```
