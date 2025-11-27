/**
 * Error handling utilities and custom error classes
 * Requirements: 13.1, 13.2, 13.3, 13.4
 */

// ============================================================================
// Error Codes
// ============================================================================

export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // Validation errors
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_JSON = 'INVALID_JSON',
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  INVALID_SPECIFICATIONS = 'INVALID_SPECIFICATIONS',
  MISSING_FILE = 'MISSING_FILE',
  MISSING_SPECIFICATIONS = 'MISSING_SPECIFICATIONS',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',

  // External service errors
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  GEMINI_API_ERROR = 'GEMINI_API_ERROR',
  IMAGEKIT_ERROR = 'IMAGEKIT_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',

  // Processing errors
  PARSING_ERROR = 'PARSING_ERROR',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  TRANSFORMATION_FAILED = 'TRANSFORMATION_FAILED',

  // Generic errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// ============================================================================
// Custom Error Classes
// ============================================================================

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

/**
 * Validation error for invalid inputs
 */
export class ValidationError extends AppError {
  constructor(message: string, field?: string, received?: any) {
    super(
      ErrorCode.INVALID_INPUT,
      message,
      400,
      field ? { field, received } : undefined
    );
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Authentication error for unauthorized access
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(ErrorCode.UNAUTHORIZED, message, 401);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * External service error for third-party API failures
 */
export class ExternalServiceError extends AppError {
  constructor(
    service: string,
    message: string,
    originalError?: Error
  ) {
    super(
      ErrorCode.SERVICE_UNAVAILABLE,
      message,
      503,
      {
        service,
        originalError: originalError?.message,
      }
    );
    this.name = 'ExternalServiceError';
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}

/**
 * Database error for data persistence failures
 */
export class DatabaseError extends AppError {
  constructor(message: string, operation?: string, originalError?: Error) {
    super(
      ErrorCode.DATABASE_ERROR,
      message,
      500,
      {
        operation,
        originalError: originalError?.message,
      }
    );
    this.name = 'DatabaseError';
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

// ============================================================================
// Error Response Builders
// ============================================================================

/**
 * Build a standardized error response
 */
export function buildErrorResponse(
  code: ErrorCode,
  message: string,
  statusCode: number = 500,
  details?: Record<string, any>
) {
  return {
    success: false as const,
    error: {
      code,
      message,
      details,
    },
    statusCode,
  };
}

/**
 * Convert any error to a standardized error response
 */
export function errorToResponse(error: unknown) {
  // Handle AppError instances
  if (error instanceof AppError) {
    return {
      response: error.toJSON(),
      statusCode: error.statusCode,
    };
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return {
      response: buildErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        error.message || 'An unexpected error occurred'
      ),
      statusCode: 500,
    };
  }

  // Handle unknown error types
  return {
    response: buildErrorResponse(
      ErrorCode.UNKNOWN_ERROR,
      'An unknown error occurred'
    ),
    statusCode: 500,
  };
}

// ============================================================================
// User-Friendly Error Messages
// ============================================================================

/**
 * Map error codes to user-friendly messages
 */
export const USER_FRIENDLY_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.UNAUTHORIZED]: 'Please sign in to continue',
  [ErrorCode.FORBIDDEN]: 'You do not have permission to perform this action',

  [ErrorCode.INVALID_INPUT]: 'The information you provided is invalid',
  [ErrorCode.INVALID_JSON]: 'The data format is incorrect',
  [ErrorCode.INVALID_PARAMETER]: 'One or more parameters are invalid',
  [ErrorCode.INVALID_FILE_TYPE]: 'The file type is not supported',
  [ErrorCode.INVALID_SPECIFICATIONS]: 'The image specifications are invalid',
  [ErrorCode.MISSING_FILE]: 'Please select a file to upload',
  [ErrorCode.MISSING_SPECIFICATIONS]: 'Image processing specifications are required',
  [ErrorCode.FILE_TOO_LARGE]: 'The file is too large',

  [ErrorCode.SERVICE_UNAVAILABLE]: 'The service is temporarily unavailable. Please try again later',
  [ErrorCode.GEMINI_API_ERROR]: 'Unable to process your request. Please try again',
  [ErrorCode.IMAGEKIT_ERROR]: 'Image processing service is unavailable. Please try again',
  [ErrorCode.DATABASE_ERROR]: 'Unable to save your data. Please try again',

  [ErrorCode.PARSING_ERROR]: 'Unable to understand your request. Please try rephrasing',
  [ErrorCode.UPLOAD_FAILED]: 'Failed to upload your image. Please try again',
  [ErrorCode.TRANSFORMATION_FAILED]: 'Failed to process your image. Please try again',

  [ErrorCode.INTERNAL_ERROR]: 'Something went wrong. Please try again',
  [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again',
};

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(code: ErrorCode): string {
  return USER_FRIENDLY_MESSAGES[code] || USER_FRIENDLY_MESSAGES[ErrorCode.UNKNOWN_ERROR];
}

// ============================================================================
// Error Logging
// ============================================================================

/**
 * Log error with context
 * Basic logging - enhanced logging is done via logger.service and error-tracker.service
 */
export function logError(
  error: unknown,
  context?: {
    userId?: string;
    endpoint?: string;
    operation?: string;
    metadata?: Record<string, any>;
  }
) {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
  };

  // Basic console logging
  console.error('[ERROR]', JSON.stringify(errorInfo, null, 2));
}
