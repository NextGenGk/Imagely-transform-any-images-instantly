/**
 * Error tracking service
 * Requirements: 13.4
 */

import { logger } from './logger.service';
import { ErrorCode } from './errors';

export interface ErrorTrackingEntry {
  id: string;
  timestamp: string;
  errorCode?: ErrorCode;
  errorName: string;
  errorMessage: string;
  stack?: string;
  context?: {
    userId?: string;
    endpoint?: string;
    operation?: string;
    requestId?: string;
    metadata?: Record<string, any>;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorStats {
  totalErrors: number;
  errorsByCode: Record<string, number>;
  errorsByEndpoint: Record<string, number>;
  recentErrors: ErrorTrackingEntry[];
}

class ErrorTracker {
  private errors: ErrorTrackingEntry[] = [];
  private maxStoredErrors = 100; // Keep last 100 errors in memory

  /**
   * Track an error
   */
  trackError(
    error: Error | unknown,
    context?: {
      userId?: string;
      endpoint?: string;
      operation?: string;
      requestId?: string;
      metadata?: Record<string, any>;
    }
  ): void {
    const entry: ErrorTrackingEntry = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      errorCode: (error as any)?.code,
      context,
      severity: this.determineSeverity(error, context),
    };

    // Store error
    this.errors.push(entry);

    // Trim old errors if exceeding limit
    if (this.errors.length > this.maxStoredErrors) {
      this.errors = this.errors.slice(-this.maxStoredErrors);
    }

    // Log error with appropriate severity
    logger.error(
      `Error tracked: ${entry.errorName} - ${entry.errorMessage}`,
      error,
      {
        ...context,
        metadata: {
          ...context?.metadata,
          errorId: entry.id,
          severity: entry.severity,
        },
      }
    );

    // In production, this would send to external error tracking service
    // (e.g., Sentry, Rollbar, DataDog)
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(entry);
    }
  }

  /**
   * Determine error severity
   */
  private determineSeverity(
    error: Error | unknown,
    context?: ErrorTrackingEntry['context']
  ): ErrorTrackingEntry['severity'] {
    // Critical errors
    if (error instanceof Error) {
      if (error.name === 'DatabaseError') return 'critical';
      if (error.message.includes('ECONNREFUSED')) return 'critical';
      if (error.message.includes('Out of memory')) return 'critical';
    }

    // High severity errors
    const errorCode = (error as any)?.code;
    if (errorCode === ErrorCode.DATABASE_ERROR) return 'high';
    if (errorCode === ErrorCode.SERVICE_UNAVAILABLE) return 'high';
    if (errorCode === ErrorCode.INTERNAL_ERROR) return 'high';

    // Medium severity errors
    if (errorCode === ErrorCode.GEMINI_API_ERROR) return 'medium';
    if (errorCode === ErrorCode.IMAGEKIT_ERROR) return 'medium';
    if (errorCode === ErrorCode.PARSING_ERROR) return 'medium';

    // Low severity errors (validation, user errors)
    if (errorCode === ErrorCode.INVALID_INPUT) return 'low';
    if (errorCode === ErrorCode.UNAUTHORIZED) return 'low';
    if (errorCode === ErrorCode.INVALID_FILE_TYPE) return 'low';

    // Default to medium
    return 'medium';
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Send error to external tracking service
   */
  private sendToExternalService(entry: ErrorTrackingEntry): void {
    // Placeholder for external service integration
    // In production, integrate with services like:
    // - Sentry: Sentry.captureException()
    // - Rollbar: rollbar.error()
    // - DataDog: datadogLogs.logger.error()
    
    logger.debug('Error sent to external tracking service', {
      metadata: { errorId: entry.id },
    });
  }

  /**
   * Get error statistics
   */
  getErrorStats(): ErrorStats {
    const errorsByCode: Record<string, number> = {};
    const errorsByEndpoint: Record<string, number> = {};

    for (const error of this.errors) {
      // Count by error code
      const code = error.errorCode || 'UNKNOWN';
      errorsByCode[code] = (errorsByCode[code] || 0) + 1;

      // Count by endpoint
      if (error.context?.endpoint) {
        const endpoint = error.context.endpoint;
        errorsByEndpoint[endpoint] = (errorsByEndpoint[endpoint] || 0) + 1;
      }
    }

    return {
      totalErrors: this.errors.length,
      errorsByCode,
      errorsByEndpoint,
      recentErrors: this.errors.slice(-10), // Last 10 errors
    };
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorTrackingEntry['severity']): ErrorTrackingEntry[] {
    return this.errors.filter(error => error.severity === severity);
  }

  /**
   * Get errors by endpoint
   */
  getErrorsByEndpoint(endpoint: string): ErrorTrackingEntry[] {
    return this.errors.filter(error => error.context?.endpoint === endpoint);
  }

  /**
   * Get errors by user
   */
  getErrorsByUser(userId: string): ErrorTrackingEntry[] {
    return this.errors.filter(error => error.context?.userId === userId);
  }

  /**
   * Clear all tracked errors
   */
  clearErrors(): void {
    this.errors = [];
    logger.info('Error tracking history cleared');
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count: number = 10): ErrorTrackingEntry[] {
    return this.errors.slice(-count);
  }
}

// Export singleton instance
export const errorTracker = new ErrorTracker();
