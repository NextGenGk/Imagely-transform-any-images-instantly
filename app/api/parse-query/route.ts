/**
 * POST /api/parse-query
 * Parse natural language query into structured JSON specification
 * Requirements: 1.1, 1.2, 1.3, 7.1, 7.2, 8.1, 9.1, 13.1, 13.2, 13.3, 13.4
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/gemini.service';
import { DatabaseService } from '@/lib/database.service';
import { getCacheInstance } from '@/lib/cache.service';
import { ParseQueryResponse } from '@/lib/types';
import { 
  AuthenticationError, 
  ValidationError, 
  ExternalServiceError,
  DatabaseError,
  logError,
  errorToResponse 
} from '@/lib/errors';
import { validateNonEmptyString } from '@/lib/validation.utils';
import { parseQueryLimiter } from '@/lib/rate-limiter';
import { applyRateLimit, addSecurityHeaders } from '@/lib/security.middleware';
import { sanitizeString, detectSuspiciousPatterns } from '@/lib/sanitization.utils';
import { applyCorsHeaders } from '@/lib/cors.config';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user with Clerk
    const { userId } = await auth();
    
    if (!userId) {
      throw new AuthenticationError();
    }

    // Apply rate limiting
    const rateLimitResult = applyRateLimit(request, userId, parseQueryLimiter);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return addSecurityHeaders(applyCorsHeaders(rateLimitResult.response, request));
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw new ValidationError('Request body must be valid JSON', 'body');
    }

    const { query } = body;

    // Validate query field using validation utility
    let validatedQuery = validateNonEmptyString(query, 'query');
    
    // Sanitize input
    validatedQuery = sanitizeString(validatedQuery);
    
    // Check for suspicious patterns
    if (detectSuspiciousPatterns(validatedQuery)) {
      throw new ValidationError(
        'Query contains potentially malicious content',
        'query',
        'suspicious_pattern'
      );
    }

    // Initialize services
    const geminiService = new GeminiService();
    const databaseService = new DatabaseService();
    const cacheService = getCacheInstance();

    // Check cache first
    let parsedSpec = cacheService.get(validatedQuery);
    
    if (parsedSpec) {
      // Cache hit - return cached result
      const response: ParseQueryResponse = {
        success: true,
        data: parsedSpec,
      };
      return NextResponse.json(response, { status: 200 });
    }

    // Cache miss - parse query using Gemini
    try {
      parsedSpec = await geminiService.parseQuery(validatedQuery);
      
      // Store result in cache
      cacheService.set(validatedQuery, parsedSpec);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logError(error, { userId, endpoint: '/api/parse-query', operation: 'parseQuery' });
      
      throw new ExternalServiceError(
        'Gemini API',
        'Failed to parse query using natural language processing',
        error instanceof Error ? error : undefined
      );
    }

    // Save request to database
    try {
      // Use userId for email since Clerk v6 auth() doesn't return user object
      const email = `${userId}@clerk.user`;
      
      // Ensure user exists in database
      const dbUserId = await databaseService.ensureUser(userId, email);
      
      // Save the request
      await databaseService.saveRequest(dbUserId, validatedQuery, parsedSpec);
    } catch (error) {
      // Log the database error but still return the parsed result
      logError(error, { userId, endpoint: '/api/parse-query', operation: 'saveRequest' });
      // We don't fail the request if database save fails
    }

    // Return successful response
    const response: ParseQueryResponse = {
      success: true,
      data: parsedSpec,
    };

    let jsonResponse = NextResponse.json(response, { status: 200 });
    jsonResponse = applyCorsHeaders(jsonResponse, request);
    jsonResponse = addSecurityHeaders(jsonResponse);
    
    return jsonResponse;

  } catch (error) {
    // Global error handler
    logError(error, { endpoint: '/api/parse-query' });
    const { response, statusCode } = errorToResponse(error);
    let errorResponse = NextResponse.json(response, { status: statusCode });
    errorResponse = applyCorsHeaders(errorResponse, request);
    errorResponse = addSecurityHeaders(errorResponse);
    return errorResponse;
  }
}
