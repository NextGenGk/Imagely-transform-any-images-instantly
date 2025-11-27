/**
 * GET /api/history
 * Retrieve user's processing history with pagination
 * Requirements: 9.3, 13.1, 13.2, 13.3, 13.4
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database.service';
import { HistoryResponse } from '@/lib/types';
import {
  AuthenticationError,
  DatabaseError,
  logError,
  errorToResponse
} from '@/lib/errors';
import { validatePaginationParams } from '@/lib/validation.utils';
import { historyLimiter } from '@/lib/rate-limiter';
import { applyRateLimit, addSecurityHeaders } from '@/lib/security.middleware';
import { sanitizeQueryParam } from '@/lib/sanitization.utils';
import { applyCorsHeaders } from '@/lib/cors.config';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user with Clerk
    const { userId } = await auth();
    
    if (!userId) {
      throw new AuthenticationError();
    }

    // Apply rate limiting
    const rateLimitResult = applyRateLimit(request, userId, historyLimiter);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return addSecurityHeaders(applyCorsHeaders(rateLimitResult.response, request));
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const pageParam = sanitizeQueryParam(searchParams.get('page')) || '1';
    const limitParam = sanitizeQueryParam(searchParams.get('limit')) || '10';

    // Validate pagination parameters using validation utility
    const { page, limit } = validatePaginationParams(pageParam, limitParam);

    // Initialize database service
    const databaseService = new DatabaseService();

    // Fetch user history
    let history;
    let total;
    try {
      history = await databaseService.getUserHistory(userId, page, limit);
      total = await databaseService.getUserRequestCount(userId);
    } catch (error) {
      logError(error, { userId, endpoint: '/api/history', operation: 'getUserHistory' });
      throw new DatabaseError(
        'Failed to retrieve history',
        'getUserHistory',
        error instanceof Error ? error : undefined
      );
    }

    // Return successful response
    const response: HistoryResponse = {
      success: true,
      data: history,
      total: total,
    };

    let jsonResponse = NextResponse.json(response, { status: 200 });
    jsonResponse = applyCorsHeaders(jsonResponse, request);
    jsonResponse = addSecurityHeaders(jsonResponse);
    
    return jsonResponse;

  } catch (error) {
    // Global error handler
    logError(error, { endpoint: '/api/history' });
    const { response, statusCode } = errorToResponse(error);
    let errorResponse = NextResponse.json(response, { status: statusCode });
    errorResponse = applyCorsHeaders(errorResponse, request);
    errorResponse = addSecurityHeaders(errorResponse);
    return errorResponse;
  }
}
