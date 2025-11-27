/**
 * Tests for error handling utilities
 * Requirements: 13.1, 13.2, 13.3, 13.4
 */

import { describe, it, expect } from 'vitest';
import {
  ErrorCode,
  AppError,
  ValidationError,
  AuthenticationError,
  ExternalServiceError,
  DatabaseError,
  buildErrorResponse,
  errorToResponse,
  getUserFriendlyMessage,
  logError,
} from '../lib/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an AppError with all properties', () => {
      const error = new AppError(
        ErrorCode.INVALID_INPUT,
        'Test error',
        400,
        { field: 'test' }
      );

      expect(error.code).toBe(ErrorCode.INVALID_INPUT);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ field: 'test' });
      expect(error.name).toBe('AppError');
    });

    it('should convert to JSON format', () => {
      const error = new AppError(
        ErrorCode.INVALID_INPUT,
        'Test error',
        400,
        { field: 'test' }
      );

      const json = error.toJSON();

      expect(json).toEqual({
        success: false,
        error: {
          code: ErrorCode.INVALID_INPUT,
          message: 'Test error',
          details: { field: 'test' },
        },
      });
    });

    it('should default to status code 500', () => {
      const error = new AppError(ErrorCode.INTERNAL_ERROR, 'Test error');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError with field and received value', () => {
      const error = new ValidationError('Invalid input', 'email', 'not-an-email');

      expect(error.code).toBe(ErrorCode.INVALID_INPUT);
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ field: 'email', received: 'not-an-email' });
      expect(error.name).toBe('ValidationError');
    });

    it('should create a ValidationError without details', () => {
      const error = new ValidationError('Invalid input');

      expect(error.details).toBeUndefined();
    });
  });

  describe('AuthenticationError', () => {
    it('should create an AuthenticationError with default message', () => {
      const error = new AuthenticationError();

      expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(error.message).toBe('Authentication required');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    });

    it('should create an AuthenticationError with custom message', () => {
      const error = new AuthenticationError('Custom auth error');

      expect(error.message).toBe('Custom auth error');
    });
  });

  describe('ExternalServiceError', () => {
    it('should create an ExternalServiceError', () => {
      const originalError = new Error('Connection timeout');
      const error = new ExternalServiceError(
        'Gemini API',
        'Service unavailable',
        originalError
      );

      expect(error.code).toBe(ErrorCode.SERVICE_UNAVAILABLE);
      expect(error.message).toBe('Service unavailable');
      expect(error.statusCode).toBe(503);
      expect(error.details).toEqual({
        service: 'Gemini API',
        originalError: 'Connection timeout',
      });
      expect(error.name).toBe('ExternalServiceError');
    });
  });

  describe('DatabaseError', () => {
    it('should create a DatabaseError', () => {
      const originalError = new Error('Connection lost');
      const error = new DatabaseError(
        'Failed to save data',
        'saveRequest',
        originalError
      );

      expect(error.code).toBe(ErrorCode.DATABASE_ERROR);
      expect(error.message).toBe('Failed to save data');
      expect(error.statusCode).toBe(500);
      expect(error.details).toEqual({
        operation: 'saveRequest',
        originalError: 'Connection lost',
      });
      expect(error.name).toBe('DatabaseError');
    });
  });
});

describe('Error Response Builders', () => {
  describe('buildErrorResponse', () => {
    it('should build a standardized error response', () => {
      const response = buildErrorResponse(
        ErrorCode.INVALID_INPUT,
        'Test error',
        400,
        { field: 'test' }
      );

      expect(response).toEqual({
        success: false,
        error: {
          code: ErrorCode.INVALID_INPUT,
          message: 'Test error',
          details: { field: 'test' },
        },
        statusCode: 400,
      });
    });

    it('should default to status code 500', () => {
      const response = buildErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        'Test error'
      );

      expect(response.statusCode).toBe(500);
    });
  });

  describe('errorToResponse', () => {
    it('should convert AppError to response', () => {
      const error = new AppError(
        ErrorCode.INVALID_INPUT,
        'Test error',
        400,
        { field: 'test' }
      );

      const { response, statusCode } = errorToResponse(error);

      expect(statusCode).toBe(400);
      expect(response).toEqual({
        success: false,
        error: {
          code: ErrorCode.INVALID_INPUT,
          message: 'Test error',
          details: { field: 'test' },
        },
      });
    });

    it('should convert standard Error to response', () => {
      const error = new Error('Standard error');

      const { response, statusCode } = errorToResponse(error);

      expect(statusCode).toBe(500);
      expect(response.success).toBe(false);
      expect(response.error.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(response.error.message).toBe('Standard error');
    });

    it('should handle unknown error types', () => {
      const error = 'string error';

      const { response, statusCode } = errorToResponse(error);

      expect(statusCode).toBe(500);
      expect(response.success).toBe(false);
      expect(response.error.code).toBe(ErrorCode.UNKNOWN_ERROR);
    });
  });
});

describe('User-Friendly Messages', () => {
  it('should return user-friendly message for known error code', () => {
    const message = getUserFriendlyMessage(ErrorCode.UNAUTHORIZED);
    expect(message).toBe('Please sign in to continue');
  });

  it('should return user-friendly message for validation errors', () => {
    const message = getUserFriendlyMessage(ErrorCode.INVALID_INPUT);
    expect(message).toBe('The information you provided is invalid');
  });

  it('should return user-friendly message for service errors', () => {
    const message = getUserFriendlyMessage(ErrorCode.SERVICE_UNAVAILABLE);
    expect(message).toBe('The service is temporarily unavailable. Please try again later');
  });

  it('should return default message for unknown error code', () => {
    const message = getUserFriendlyMessage('UNKNOWN_CODE' as ErrorCode);
    expect(message).toBe('An unexpected error occurred. Please try again');
  });
});

describe('Error Logging', () => {
  it('should log error without throwing', () => {
    const error = new Error('Test error');
    
    // Should not throw
    expect(() => {
      logError(error, {
        userId: 'user123',
        endpoint: '/api/test',
        operation: 'testOperation',
      });
    }).not.toThrow();
  });

  it('should log non-Error objects', () => {
    const error = { message: 'Custom error object' };
    
    // Should not throw
    expect(() => {
      logError(error);
    }).not.toThrow();
  });
});
