/**
 * Global API error handler
 * Standardizes error handling across API routes
 * Requirements: 13.1, 13.2, 13.4
 */

import { NextResponse } from 'next/server';
import { AppError, errorToResponse, logError } from './errors';

/**
 * Wrap API route handler with error handling
 */
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  context?: {
    endpoint?: string;
    operation?: string;
  }
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      // Log the error with context
      logError(error, {
        endpoint: context?.endpoint,
        operation: context?.operation,
      });

      // Convert error to standardized response
      const { response, statusCode } = errorToResponse(error);

      return NextResponse.json(response, { status: statusCode });
    }
  };
}

/**
 * Handle async operations with error catching
 */
export async function handleAsync<T>(
  operation: () => Promise<T>,
  errorMessage: string,
  context?: {
    userId?: string;
    operation?: string;
  }
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logError(error, context);
    throw error instanceof AppError 
      ? error 
      : new Error(errorMessage);
  }
}

/**
 * Validate request body exists
 */
export async function parseRequestBody(request: Request): Promise<any> {
  try {
    return await request.json();
  } catch (error) {
    throw new AppError(
      'INVALID_JSON' as any,
      'Request body must be valid JSON',
      400
    );
  }
}
