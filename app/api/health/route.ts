/**
 * GET /api/health
 * Health check endpoint for monitoring system status
 * Requirements: 13.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database.service';
import { errorTracker } from '@/lib/error-tracker.service';
import { performanceMonitor } from '@/lib/performance.service';
import { logger } from '@/lib/logger.service';

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
    gemini: {
      status: 'up' | 'down' | 'unknown';
      configured: boolean;
    };
    imagekit: {
      status: 'up' | 'down' | 'unknown';
      configured: boolean;
    };
    clerk: {
      status: 'up' | 'down' | 'unknown';
      configured: boolean;
    };
  };
  metrics?: {
    totalErrors: number;
    criticalErrors: number;
    recentErrors: number;
  };
  version: string;
  environment: string;
}

// Track application start time
const startTime = Date.now();

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startCheck = Date.now();
  
  try {
    logger.info('Health check requested', {
      endpoint: '/api/health',
    });

    // Check database connectivity
    const databaseCheck = await checkDatabase();

    // Check external service configurations
    const geminiCheck = checkGeminiConfig();
    const imagekitCheck = checkImageKitConfig();
    const clerkCheck = checkClerkConfig();

    // Get error metrics
    const errorStats = errorTracker.getErrorStats();
    const criticalErrors = errorTracker.getErrorsBySeverity('critical');

    // Determine overall health status
    const overallStatus = determineOverallStatus({
      database: databaseCheck.status,
      gemini: geminiCheck.status,
      imagekit: imagekitCheck.status,
      clerk: clerkCheck.status,
      criticalErrorCount: criticalErrors.length,
    });

    const response: HealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - startTime,
      checks: {
        database: databaseCheck,
        gemini: geminiCheck,
        imagekit: imagekitCheck,
        clerk: clerkCheck,
      },
      metrics: {
        totalErrors: errorStats.totalErrors,
        criticalErrors: criticalErrors.length,
        recentErrors: errorStats.recentErrors.length,
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    const checkDuration = Date.now() - startCheck;
    
    logger.info(`Health check completed in ${checkDuration}ms`, {
      endpoint: '/api/health',
      duration: checkDuration,
      metadata: {
        status: overallStatus,
      },
    });

    // Return appropriate status code based on health
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(response, { status: statusCode });

  } catch (error) {
    logger.error('Health check failed', error, {
      endpoint: '/api/health',
    });

    const errorResponse: HealthCheckResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - startTime,
      checks: {
        database: { status: 'down', error: 'Health check failed' },
        gemini: { status: 'unknown', configured: false },
        imagekit: { status: 'unknown', configured: false },
        clerk: { status: 'unknown', configured: false },
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    return NextResponse.json(errorResponse, { status: 503 });
  }
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<HealthCheckResponse['checks']['database']> {
  try {
    const databaseService = new DatabaseService();
    const startTime = Date.now();
    
    // Perform a simple database query to check connectivity
    await performanceMonitor.measureAsync(
      'health.database',
      async () => {
        // Try to get a count of users (lightweight query)
        await databaseService.healthCheck();
      }
    );

    const responseTime = Date.now() - startTime;

    return {
      status: 'up',
      responseTime,
    };
  } catch (error) {
    logger.error('Database health check failed', error);
    
    return {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check Gemini API configuration
 */
function checkGeminiConfig(): HealthCheckResponse['checks']['gemini'] {
  const apiKey = process.env.GEMINI_API_KEY;
  
  return {
    status: apiKey ? 'up' : 'down',
    configured: !!apiKey,
  };
}

/**
 * Check ImageKit configuration
 */
function checkImageKitConfig(): HealthCheckResponse['checks']['imagekit'] {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
  
  const configured = !!(publicKey && privateKey && urlEndpoint);
  
  return {
    status: configured ? 'up' : 'down',
    configured,
  };
}

/**
 * Check Clerk configuration
 */
function checkClerkConfig(): HealthCheckResponse['checks']['clerk'] {
  const secretKey = process.env.CLERK_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  const configured = !!(secretKey && publishableKey);
  
  return {
    status: configured ? 'up' : 'down',
    configured,
  };
}

/**
 * Determine overall system health status
 */
function determineOverallStatus(checks: {
  database: 'up' | 'down';
  gemini: 'up' | 'down' | 'unknown';
  imagekit: 'up' | 'down' | 'unknown';
  clerk: 'up' | 'down' | 'unknown';
  criticalErrorCount: number;
}): 'healthy' | 'degraded' | 'unhealthy' {
  // System is unhealthy if database or auth is down
  if (checks.database === 'down' || checks.clerk === 'down') {
    return 'unhealthy';
  }

  // System is unhealthy if there are critical errors
  if (checks.criticalErrorCount > 0) {
    return 'unhealthy';
  }

  // System is degraded if any external service is down
  if (checks.gemini === 'down' || checks.imagekit === 'down') {
    return 'degraded';
  }

  // System is healthy
  return 'healthy';
}
