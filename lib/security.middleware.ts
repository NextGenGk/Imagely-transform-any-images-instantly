/**
 * Security middleware utilities
 * Combines rate limiting, CORS, and input sanitization
 * Requirements: 8.1, 10.1
 */

import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter } from './rate-limiter';
import { applyCorsHeaders, CorsOptions } from './cors.config';
import { ValidationError } from './errors';

export interface SecurityMiddlewareOptions {
  rateLimiter?: RateLimiter;
  corsOptions?: CorsOptions;
  requireAuth?: boolean;
}

/**
 * Apply rate limiting to request
 */
export function applyRateLimit(
  request: NextRequest,
  identifier: string,
  rateLimiter: RateLimiter
): { allowed: boolean; response?: NextResponse } {
  const result = rateLimiter.check(identifier);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    
    const response = NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
          retryAfter,
        },
      },
      { status: 429 }
    );

    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
    response.headers.set('Retry-After', retryAfter.toString());

    return { allowed: false, response };
  }

  return { allowed: true };
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders<T = any>(response: NextResponse<T>): NextResponse<T> {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy (basic)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    );
  }
  
  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
}

/**
 * Validate request size
 */
export function validateRequestSize(
  request: NextRequest,
  maxSizeBytes: number = 10 * 1024 * 1024 // 10MB default
): void {
  const contentLength = request.headers.get('content-length');
  
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    
    if (size > maxSizeBytes) {
      throw new ValidationError(
        `Request size exceeds maximum allowed size of ${maxSizeBytes} bytes`,
        'content-length',
        size
      );
    }
  }
}

/**
 * Validate content type
 */
export function validateRequestContentType(
  request: NextRequest,
  allowedTypes: string[]
): void {
  const contentType = request.headers.get('content-type');
  
  if (!contentType) {
    throw new ValidationError(
      'Content-Type header is required',
      'content-type',
      null
    );
  }

  const normalizedType = contentType.split(';')[0].trim().toLowerCase();
  
  if (!allowedTypes.some(type => normalizedType === type.toLowerCase())) {
    throw new ValidationError(
      `Invalid Content-Type. Allowed types: ${allowedTypes.join(', ')}`,
      'content-type',
      contentType
    );
  }
}

/**
 * Create security middleware wrapper
 */
export function withSecurity(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: SecurityMiddlewareOptions = {}
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Apply rate limiting if configured
      if (options.rateLimiter) {
        // Use user ID or IP address as identifier
        const identifier = request.headers.get('x-forwarded-for') || 
                          request.headers.get('x-real-ip') || 
                          'anonymous';
        
        const rateLimitResult = applyRateLimit(request, identifier, options.rateLimiter);
        
        if (!rateLimitResult.allowed && rateLimitResult.response) {
          return rateLimitResult.response;
        }
      }

      // Execute handler
      let response = await handler(request);

      // Apply CORS headers
      if (options.corsOptions) {
        response = applyCorsHeaders(response, request, options.corsOptions);
      }

      // Add security headers
      response = addSecurityHeaders(response);

      return response;
    } catch (error) {
      // Error will be handled by the route's error handler
      throw error;
    }
  };
}
