/**
 * Input sanitization utilities
 * Sanitizes user inputs to prevent injection attacks
 * Requirements: 8.1, 10.1
 */

/**
 * Sanitize string input by removing potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length to prevent DoS
  const MAX_LENGTH = 10000;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }

  return sanitized;
}

/**
 * Sanitize filename to prevent path traversal attacks
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') {
    return 'unnamed';
  }

  // Remove path separators and null bytes
  let sanitized = filename
    .replace(/\0/g, '')
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '')
    .trim();

  // Remove leading dots
  sanitized = sanitized.replace(/^\.+/, '');

  // If empty after sanitization, use default
  if (sanitized.length === 0) {
    return 'unnamed';
  }

  // Limit length
  const MAX_LENGTH = 255;
  if (sanitized.length > MAX_LENGTH) {
    const ext = sanitized.split('.').pop() || '';
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
    sanitized = nameWithoutExt.substring(0, MAX_LENGTH - ext.length - 1) + '.' + ext;
  }

  return sanitized;
}

/**
 * Sanitize query parameters
 */
export function sanitizeQueryParam(param: string | null): string | null {
  if (param === null || param === undefined) {
    return null;
  }

  return sanitizeString(param);
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    throw new Error('URL must be a string');
  }

  // Basic URL validation
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid URL protocol');
    }

    return parsed.toString();
  } catch (error) {
    throw new Error('Invalid URL format');
  }
}

/**
 * Sanitize object by recursively sanitizing string values
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sanitized: any = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized as T;
}

/**
 * Validate content type for file uploads
 */
export function validateContentType(contentType: string, allowedTypes: string[]): boolean {
  if (typeof contentType !== 'string') {
    return false;
  }

  // Normalize content type (remove parameters)
  const normalizedType = contentType.split(';')[0].trim().toLowerCase();

  return allowedTypes.some(allowed => 
    normalizedType === allowed.toLowerCase()
  );
}

/**
 * Check for suspicious patterns in input
 */
export function detectSuspiciousPatterns(input: string): boolean {
  if (typeof input !== 'string') {
    return false;
  }

  // Patterns that might indicate injection attempts
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /data:text\/html/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(input));
}
