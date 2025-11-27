/**
 * Performance monitoring service
 * Requirements: 13.4
 */

import { logger } from './logger.service';

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: string;
  context?: {
    userId?: string;
    endpoint?: string;
    operation?: string;
    metadata?: Record<string, any>;
  };
}

class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();

  /**
   * Start timing an operation
   */
  startTimer(operationId: string): void {
    this.metrics.set(operationId, Date.now());
  }

  /**
   * End timing and return duration
   */
  endTimer(operationId: string): number {
    const startTime = this.metrics.get(operationId);
    
    if (!startTime) {
      logger.warn(`Timer not found for operation: ${operationId}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.metrics.delete(operationId);
    
    return duration;
  }

  /**
   * Measure and log operation duration
   */
  async measureAsync<T>(
    operationName: string,
    operation: () => Promise<T>,
    context?: {
      userId?: string;
      endpoint?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<T> {
    const operationId = `${operationName}-${Date.now()}-${Math.random()}`;
    this.startTimer(operationId);

    try {
      const result = await operation();
      const duration = this.endTimer(operationId);

      this.logMetric({
        name: operationName,
        duration,
        timestamp: new Date().toISOString(),
        context: {
          ...context,
          operation: operationName,
        },
      });

      return result;
    } catch (error) {
      const duration = this.endTimer(operationId);
      
      this.logMetric({
        name: `${operationName} (failed)`,
        duration,
        timestamp: new Date().toISOString(),
        context: {
          ...context,
          operation: operationName,
          metadata: {
            ...context?.metadata,
            error: true,
          },
        },
      });

      throw error;
    }
  }

  /**
   * Measure synchronous operation
   */
  measure<T>(
    operationName: string,
    operation: () => T,
    context?: {
      userId?: string;
      endpoint?: string;
      metadata?: Record<string, any>;
    }
  ): T {
    const startTime = Date.now();

    try {
      const result = operation();
      const duration = Date.now() - startTime;

      this.logMetric({
        name: operationName,
        duration,
        timestamp: new Date().toISOString(),
        context: {
          ...context,
          operation: operationName,
        },
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logMetric({
        name: `${operationName} (failed)`,
        duration,
        timestamp: new Date().toISOString(),
        context: {
          ...context,
          operation: operationName,
          metadata: {
            ...context?.metadata,
            error: true,
          },
        },
      });

      throw error;
    }
  }

  /**
   * Log performance metric
   */
  private logMetric(metric: PerformanceMetric): void {
    // Log slow operations as warnings
    const threshold = this.getThreshold(metric.name);
    
    if (metric.duration > threshold) {
      logger.warn(`Slow operation detected: ${metric.name} took ${metric.duration}ms`, {
        ...metric.context,
        duration: metric.duration,
        metadata: {
          ...metric.context?.metadata,
          threshold,
          exceeded: metric.duration - threshold,
        },
      });
    } else {
      logger.debug(`Performance: ${metric.name} completed in ${metric.duration}ms`, {
        ...metric.context,
        duration: metric.duration,
      });
    }
  }

  /**
   * Get performance threshold for operation type
   */
  private getThreshold(operationName: string): number {
    // Define thresholds for different operation types (in milliseconds)
    const thresholds: Record<string, number> = {
      'gemini.parseQuery': 5000,
      'imagekit.uploadImage': 10000,
      'imagekit.transformImage': 5000,
      'database.saveRequest': 1000,
      'database.getUserHistory': 1000,
      'api.parse-query': 3000,
      'api.process-image': 15000,
      'api.history': 2000,
    };

    // Find matching threshold
    for (const [key, threshold] of Object.entries(thresholds)) {
      if (operationName.includes(key)) {
        return threshold;
      }
    }

    // Default threshold
    return 5000;
  }

  /**
   * Get current metrics snapshot
   */
  getMetricsSnapshot(): Record<string, number> {
    const snapshot: Record<string, number> = {};
    
    for (const [operationId, startTime] of this.metrics.entries()) {
      snapshot[operationId] = Date.now() - startTime;
    }

    return snapshot;
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
