/**
 * Input validation utilities
 * Requirements: 13.1, 13.3
 */

import { ValidationError } from './errors';
import { ImageProcessingSpec, TaskType, Background, ImageFormat } from './types';

// ============================================================================
// String Validation
// ============================================================================

/**
 * Validate that a string is non-empty
 */
export function validateNonEmptyString(
  value: unknown,
  fieldName: string
): string {
  if (typeof value !== 'string') {
    throw new ValidationError(
      `${fieldName} must be a string`,
      fieldName,
      typeof value
    );
  }

  if (value.trim().length === 0) {
    throw new ValidationError(
      `${fieldName} cannot be empty`,
      fieldName,
      value
    );
  }

  return value;
}

/**
 * Validate string length
 */
export function validateStringLength(
  value: string,
  fieldName: string,
  minLength?: number,
  maxLength?: number
): void {
  if (minLength !== undefined && value.length < minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${minLength} characters`,
      fieldName,
      value.length
    );
  }

  if (maxLength !== undefined && value.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must be at most ${maxLength} characters`,
      fieldName,
      value.length
    );
  }
}

// ============================================================================
// Number Validation
// ============================================================================

/**
 * Validate that a value is a positive integer
 */
export function validatePositiveInteger(
  value: unknown,
  fieldName: string
): number {
  if (typeof value === 'string') {
    value = parseInt(value, 10);
  }

  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(
      `${fieldName} must be a number`,
      fieldName,
      value
    );
  }

  if (!Number.isInteger(value)) {
    throw new ValidationError(
      `${fieldName} must be an integer`,
      fieldName,
      value
    );
  }

  if (value < 1) {
    throw new ValidationError(
      `${fieldName} must be a positive integer`,
      fieldName,
      value
    );
  }

  return value;
}

/**
 * Validate number range
 */
export function validateNumberRange(
  value: number,
  fieldName: string,
  min?: number,
  max?: number
): void {
  if (min !== undefined && value < min) {
    throw new ValidationError(
      `${fieldName} must be at least ${min}`,
      fieldName,
      value
    );
  }

  if (max !== undefined && value > max) {
    throw new ValidationError(
      `${fieldName} must be at most ${max}`,
      fieldName,
      value
    );
  }
}

// ============================================================================
// File Validation
// ============================================================================

/**
 * Validate file type
 */
export function validateFileType(
  file: File,
  allowedTypes: string[]
): void {
  if (!allowedTypes.includes(file.type)) {
    throw new ValidationError(
      `Unsupported file type. Allowed types: ${allowedTypes.join(', ')}`,
      'file',
      file.type
    );
  }
}

/**
 * Validate file size
 */
export function validateFileSize(
  file: File,
  maxSizeBytes: number
): void {
  if (file.size > maxSizeBytes) {
    const maxSizeMB = maxSizeBytes / (1024 * 1024);
    const fileSizeMB = file.size / (1024 * 1024);
    
    throw new ValidationError(
      `File size exceeds ${maxSizeMB}MB limit (received ${fileSizeMB.toFixed(2)}MB)`,
      'file',
      { size: file.size, maxSize: maxSizeBytes }
    );
  }
}

// ============================================================================
// JSON Validation
// ============================================================================

/**
 * Validate and parse JSON string
 */
export function validateAndParseJSON<T = any>(
  jsonString: string,
  fieldName: string = 'JSON'
): T {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new ValidationError(
      `${fieldName} must be valid JSON`,
      fieldName,
      jsonString
    );
  }
}

// ============================================================================
// ImageProcessingSpec Validation
// ============================================================================

/**
 * Validate TaskType
 */
function validateTaskType(taskType: unknown): TaskType {
  const validTaskTypes: TaskType[] = [
    'passport_photo',
    'resize',
    'compress',
    'background_change',
    'enhance',
    'format_change',
    'custom',
  ];

  if (typeof taskType !== 'string' || !validTaskTypes.includes(taskType as TaskType)) {
    throw new ValidationError(
      `Invalid task_type. Must be one of: ${validTaskTypes.join(', ')}`,
      'task_type',
      taskType
    );
  }

  return taskType as TaskType;
}

/**
 * Validate Background
 */
function validateBackground(background: unknown): Background | null {
  if (background === null || background === undefined) {
    return null;
  }

  if (typeof background !== 'string') {
    throw new ValidationError(
      'Invalid background. Must be a string (color name or hex code) or null',
      'background',
      background
    );
  }

  // Allow any string value for background (color names, hex codes, etc.)
  // The ImageKit service will handle the conversion
  return background as Background;
}

/**
 * Validate ImageFormat
 */
function validateImageFormat(format: unknown): ImageFormat | null {
  if (format === null || format === undefined) {
    return null;
  }

  const validFormats: ImageFormat[] = ['jpg', 'jpeg', 'png', 'webp'];

  if (typeof format !== 'string' || !validFormats.includes(format as ImageFormat)) {
    throw new ValidationError(
      `Invalid format. Must be one of: ${validFormats.join(', ')} or null`,
      'format',
      format
    );
  }

  return format as ImageFormat;
}

/**
 * Validate complete ImageProcessingSpec
 */
export function validateImageProcessingSpec(spec: unknown): ImageProcessingSpec {
  if (typeof spec !== 'object' || spec === null) {
    throw new ValidationError(
      'Specifications must be an object',
      'specifications',
      spec
    );
  }

  const s = spec as any;

  // Validate required fields
  const taskType = validateTaskType(s.task_type);

  // Validate dimensions
  if (typeof s.dimensions !== 'object' || s.dimensions === null) {
    throw new ValidationError(
      'dimensions must be an object',
      'dimensions',
      s.dimensions
    );
  }

  // Validate optional fields
  const background = validateBackground(s.background);
  const format = validateImageFormat(s.format);

  // Validate numeric fields
  if (s.dpi !== null && s.dpi !== undefined) {
    if (typeof s.dpi !== 'number' || s.dpi <= 0) {
      throw new ValidationError(
        'dpi must be a positive number or null',
        'dpi',
        s.dpi
      );
    }
  }

  if (s.max_file_size_mb !== null && s.max_file_size_mb !== undefined) {
    if (typeof s.max_file_size_mb !== 'number' || s.max_file_size_mb <= 0) {
      throw new ValidationError(
        'max_file_size_mb must be a positive number or null',
        'max_file_size_mb',
        s.max_file_size_mb
      );
    }
  }

  return spec as ImageProcessingSpec;
}

// ============================================================================
// Query Parameter Validation
// ============================================================================

/**
 * Validate pagination parameters
 */
export function validatePaginationParams(
  page: unknown,
  limit: unknown
): { page: number; limit: number } {
  const validatedPage = validatePositiveInteger(page, 'page');
  const validatedLimit = validatePositiveInteger(limit, 'limit');

  validateNumberRange(validatedLimit, 'limit', 1, 100);

  return {
    page: validatedPage,
    limit: validatedLimit,
  };
}
