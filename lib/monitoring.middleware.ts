/**
 * Monitoring middleware for API routes
 * Integrates performance monitoring and structured logging
 * Requirements: 13.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger.service';
import { performanceMonitor } from './performance.service';
import { errorTracker } from './error-tracker.service';

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Wrap API route handler with monitoring
 */
export function withMonitoring<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  options?: {
    endpoint?: string;
    operation?: string;
  }
) {
  return async (...args: T): Promise<NextResponse> => {
    const request = args[0] as NextRequest;
    const requestId = generateRequestId();
    const endpoint = options?.endpoint || request.nextUrl.pathname;
    const method = request.method;
    
    // Extract userId if available (from Clerk auth)
    let userId: string | undefined;
    try {
      const { auth } = await import('@clerk/nextjs/server');
      const authResult = await auth();
      userId = authResult.userId || undefined;
    } catch (error) {
      // Auth not available or failed, continue without userId
    }

    // Log incoming request
    logger.logRequest(method, endpoint, {
      userId,
      requestId,
      metadata: {
        userAgent: request.headers.get('user-agent'),
        origin: request.headers.get('origin'),
      },
    });

    const startTime = Date.now();

    try {
      // Execute handler with performance monitoring
      const response = await performanceMonitor.measureAsync(
        `api.${endpoint.replace(/\//g, '.')}`,
        () => handler(...args),
        {
          userId,
          endpoint,
          metadata: {
            requestId,
            method,
          },
        }
      );

      const duration = Date.now() - startTime;
      const statusCode = response.status;

      // Log response
      logger.logResponse(method, endpoint, statusCode, duration, {
        userId,
        requestId,
      });

      // Add request ID to response headers
      response.headers.set('X-Request-ID', requestId);

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;

      // Track error
      errorTracker.trackError(error, {
        userId,
        endpoint,
        operation: options?.operation,
        requestId,
        metadata: {
          method,
          duration,
        },
      });

      // Log error response
      logger.logResponse(method, endpoint, 500, duration, {
        userId,
        requestId,
        metadata: {
          error: true,
        },
      });

      // Re-throw to let error handler deal with it
      throw error;
    }
  };
}

/**
 * Wrap external service calls with monitoring
 */
export async function monitorExternalService<T>(
  serviceName: string,
  operation: string,
  serviceCall: () => Promise<T>,
  context?: {
    userId?: string;
    metadata?: Record<string, any>;
  }
): Promise<T> {
  const startTime = Date.now();
  let success = false;

  try {
    const result = await serviceCall();
    success = true;
    return result;
  } catch (error) {
    success = false;
    throw error;
  } finally {
    const duration = Date.now() - startTime;
    
    logger.logExternalService(
      serviceName,
      operation,
      success,
      duration,
      context
    );
  }
}
