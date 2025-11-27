/**
 * CORS configuration
 * Configures Cross-Origin Resource Sharing for API routes
 * Requirements: 8.1
 */

import { NextResponse } from 'next/server';

export interface CorsOptions {
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Default CORS configuration
 */
const defaultCorsOptions: CorsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || false
    : true, // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
  ],
  exposedHeaders: ['X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string | null, allowedOrigins: string | string[] | boolean): boolean {
  if (!origin) {
    return false;
  }

  if (allowedOrigins === true) {
    return true;
  }

  if (allowedOrigins === false) {
    return false;
  }

  if (typeof allowedOrigins === 'string') {
    return origin === allowedOrigins;
  }

  if (Array.isArray(allowedOrigins)) {
    return allowedOrigins.includes(origin);
  }

  return false;
}

/**
 * Apply CORS headers to response
 */
export function applyCorsHeaders<T = any>(
  response: NextResponse<T>,
  request: Request,
  options: CorsOptions = defaultCorsOptions
): NextResponse<T> {
  const origin = request.headers.get('origin');
  const mergedOptions = { ...defaultCorsOptions, ...options };

  // Set Access-Control-Allow-Origin
  if (mergedOptions.origin === true) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*');
  } else if (origin && isOriginAllowed(origin, mergedOptions.origin || false)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  // Set Access-Control-Allow-Methods
  if (mergedOptions.methods) {
    response.headers.set('Access-Control-Allow-Methods', mergedOptions.methods.join(', '));
  }

  // Set Access-Control-Allow-Headers
  if (mergedOptions.allowedHeaders) {
    response.headers.set('Access-Control-Allow-Headers', mergedOptions.allowedHeaders.join(', '));
  }

  // Set Access-Control-Expose-Headers
  if (mergedOptions.exposedHeaders) {
    response.headers.set('Access-Control-Expose-Headers', mergedOptions.exposedHeaders.join(', '));
  }

  // Set Access-Control-Allow-Credentials
  if (mergedOptions.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Set Access-Control-Max-Age
  if (mergedOptions.maxAge) {
    response.headers.set('Access-Control-Max-Age', mergedOptions.maxAge.toString());
  }

  return response;
}

/**
 * Handle OPTIONS preflight request
 */
export function handleCorsPreflightRequest(
  request: Request,
  options: CorsOptions = defaultCorsOptions
): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return applyCorsHeaders(response, request, options);
}

/**
 * Create CORS-enabled response
 */
export function createCorsResponse(
  data: any,
  request: Request,
  status: number = 200,
  options: CorsOptions = defaultCorsOptions
): NextResponse {
  const response = NextResponse.json(data, { status });
  return applyCorsHeaders(response, request, options);
}
