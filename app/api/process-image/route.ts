/**
 * POST /api/process-image
 * Upload and process an image using ImageKit.io
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 13.1, 13.2, 13.3, 13.4
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { ImageKitService } from '@/lib/imagekit.service';
import { DatabaseService } from '@/lib/database.service';

import { ProcessImageResponse, ImageProcessingSpec } from '@/lib/types';
import {
  AuthenticationError,
  ValidationError,
  ExternalServiceError,
  ErrorCode,
  logError,
  errorToResponse
} from '@/lib/errors';
import {
  validateFileType,
  validateFileSize,
  validateAndParseJSON,
  validateImageProcessingSpec
} from '@/lib/validation.utils';
import { processImageLimiter } from '@/lib/rate-limiter';
import { applyRateLimit, addSecurityHeaders, validateRequestSize } from '@/lib/security.middleware';
import { sanitizeFilename, validateContentType } from '@/lib/sanitization.utils';
import { applyCorsHeaders } from '@/lib/cors.config';

// Supported image MIME types
const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

// Max file size: 10MB
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Authenticate user with Clerk
    const { userId } = await auth();

    if (!userId) {
      throw new AuthenticationError();
    }

    // Apply rate limiting
    const rateLimitResult = applyRateLimit(request, userId, processImageLimiter);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return addSecurityHeaders(applyCorsHeaders(rateLimitResult.response, request));
    }

    // Validate request size
    validateRequestSize(request, MAX_FILE_SIZE_BYTES);

    // Parse form data
    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      throw new ValidationError('Request must be multipart/form-data', 'body');
    }

    // Extract image file
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      throw new ValidationError('Image file is required', 'image');
    }

    // Validate file type and size using validation utilities
    validateFileType(imageFile, SUPPORTED_MIME_TYPES);
    validateFileSize(imageFile, MAX_FILE_SIZE_BYTES);

    // Validate content type
    if (!validateContentType(imageFile.type, SUPPORTED_MIME_TYPES)) {
      throw new ValidationError(
        'Invalid file content type',
        'image',
        imageFile.type
      );
    }

    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(imageFile.name);

    // Extract specifications
    const specificationsStr = formData.get('specifications') as string | null;

    if (!specificationsStr) {
      throw new ValidationError('Image processing specifications are required', 'specifications');
    }

    // Parse and validate specifications
    const parsedSpec = validateAndParseJSON(specificationsStr, 'specifications');
    const specifications = validateImageProcessingSpec(parsedSpec);

    // Extract optional request ID for updating existing request
    const requestId = formData.get('requestId') as string | null;

    // Initialize services
    const imagekitService = new ImageKitService();
    const databaseService = new DatabaseService();

    // Convert file to buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);

    // Check if background removal/change is requested
    // This is now handled directly by ImageKit transformations
    const needsBackgroundProcessing =
      specifications.task_type === 'background_change' ||
      (specifications.background && specifications.background !== 'original');

    if (needsBackgroundProcessing) {
      console.log('Background processing requested, will be handled by ImageKit:', {
        background: specifications.background,
      });
    }

    // Upload image to ImageKit with sanitized filename
    let uploadedUrl: string;
    try {
      uploadedUrl = await imagekitService.uploadImage(buffer, sanitizedFilename);
    } catch (error) {
      logError(error, { userId, endpoint: '/api/process-image', operation: 'uploadImage' });
      throw new ExternalServiceError(
        'ImageKit',
        'Failed to upload image',
        error instanceof Error ? error : undefined
      );
    }

    // Apply transformations (resize, rotate, effects, etc.)
    let transformedUrl: string;
    try {
      transformedUrl = await imagekitService.transformImage(uploadedUrl, specifications);
    } catch (error) {
      logError(error, { userId, endpoint: '/api/process-image', operation: 'transformImage' });
      throw new ExternalServiceError(
        'ImageKit',
        'Failed to transform image',
        error instanceof Error ? error : undefined
      );
    }

    // Update database with processed image URL
    try {
      // Get user details to fetch email
      const user = await currentUser();
      const email = user?.emailAddresses[0]?.emailAddress || `${userId}@clerk.user`;

      // Ensure user exists in database
      const dbUserId = await databaseService.ensureUser(userId, email);

      if (requestId) {
        // If requestId is provided, we could update the existing request
        // For now, we'll create a new request with the processed URL
        await databaseService.saveRequest(
          dbUserId,
          `Processed image: ${imageFile.name}`,
          specifications,
          transformedUrl
        );
      } else {
        // Create new request with processed image
        await databaseService.saveRequest(
          dbUserId,
          `Processed image: ${imageFile.name}`,
          specifications,
          transformedUrl
        );
      }
    } catch (error) {
      // Log the database error but still return the processed image
      logError(error, { userId, endpoint: '/api/process-image', operation: 'saveRequest' });
      // We don't fail the request if database save fails
    }

    // Return successful response
    const response: ProcessImageResponse = {
      success: true,
      imageUrl: transformedUrl,
    };

    let jsonResponse = NextResponse.json(response, { status: 200 });
    jsonResponse = applyCorsHeaders(jsonResponse, request);
    jsonResponse = addSecurityHeaders(jsonResponse);

    return jsonResponse;

  } catch (error) {
    // Global error handler
    logError(error, { endpoint: '/api/process-image' });
    const { response, statusCode } = errorToResponse(error);
    let errorResponse = NextResponse.json(response, { status: statusCode });
    errorResponse = applyCorsHeaders(errorResponse, request);
    errorResponse = addSecurityHeaders(errorResponse);
    return errorResponse;
  }
}
