/**
 * Structured logging service
 * Requirements: 13.4
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: {
    userId?: string;
    endpoint?: string;
    operation?: string;
    requestId?: string;
    duration?: number;
    metadata?: Record<string, any>;
  };
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Format log entry as structured JSON
   */
  private formatLogEntry(entry: LogEntry): string {
    return JSON.stringify(entry, null, this.isDevelopment ? 2 : 0);
  }

  /**
   * Write log to appropriate output
   */
  private write(entry: LogEntry): void {
    const formatted = this.formatLogEntry(entry);

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formatted);
        }
        break;
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogEntry['context']): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      message,
      context,
    });
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogEntry['context']): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message,
      context,
    });
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogEntry['context']): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      message,
      context,
    });
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, context?: LogEntry['context']): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      context,
    };

    if (error instanceof Error) {
      logEntry.error = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
        code: (error as any).code,
      };
    } else if (error) {
      logEntry.error = {
        name: 'UnknownError',
        message: String(error),
      };
    }

    this.write(logEntry);
  }

  /**
   * Log API request
   */
  logRequest(
    method: string,
    endpoint: string,
    context?: {
      userId?: string;
      requestId?: string;
      metadata?: Record<string, any>;
    }
  ): void {
    this.info(`${method} ${endpoint}`, {
      endpoint,
      ...context,
      metadata: {
        ...context?.metadata,
        method,
      },
    });
  }

  /**
   * Log API response
   */
  logResponse(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    context?: {
      userId?: string;
      requestId?: string;
      metadata?: Record<string, any>;
    }
  ): void {
    const level = statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: `${method} ${endpoint} ${statusCode} ${duration}ms`,
      context: {
        endpoint,
        duration,
        ...context,
        metadata: {
          ...context?.metadata,
          method,
          statusCode,
        },
      },
    };

    this.write(logEntry);
  }

  /**
   * Log external service call
   */
  logExternalService(
    service: string,
    operation: string,
    success: boolean,
    duration: number,
    context?: {
      userId?: string;
      metadata?: Record<string, any>;
    }
  ): void {
    const level = success ? LogLevel.INFO : LogLevel.ERROR;
    
    this.write({
      timestamp: new Date().toISOString(),
      level,
      message: `External service: ${service}.${operation} ${success ? 'succeeded' : 'failed'} in ${duration}ms`,
      context: {
        operation: `${service}.${operation}`,
        duration,
        ...context,
        metadata: {
          ...context?.metadata,
          service,
          success,
        },
      },
    });
  }
}

// Export singleton instance
export const logger = new Logger();
