/**
 * Environment variable validation
 * Validates all required environment variables on startup
 * Requirements: 8.1
 */

interface EnvConfig {
  // Database
  DATABASE_URL: string;

  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;

  // Google Gemini API
  GEMINI_API_KEY: string;

  // ImageKit.io
  IMAGEKIT_PUBLIC_KEY: string;
  IMAGEKIT_PRIVATE_KEY: string;
  IMAGEKIT_URL_ENDPOINT: string;
}

class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

/**
 * Validate that an environment variable exists and is non-empty
 */
function validateEnvVar(name: string, value: string | undefined): string {
  if (!value || value.trim().length === 0) {
    throw new EnvValidationError(
      `Missing required environment variable: ${name}`
    );
  }
  return value.trim();
}

/**
 * Validate URL format
 */
function validateUrl(name: string, value: string): string {
  try {
    new URL(value);
    return value;
  } catch (error) {
    throw new EnvValidationError(
      `Invalid URL format for environment variable: ${name}`
    );
  }
}

/**
 * Validate database URL format
 */
function validateDatabaseUrl(value: string): string {
  if (!value.startsWith('postgresql://') && !value.startsWith('postgres://')) {
    throw new EnvValidationError(
      'DATABASE_URL must be a valid PostgreSQL connection string'
    );
  }
  return value;
}

/**
 * Validate all required environment variables
 */
export function validateEnv(): EnvConfig {
  const errors: string[] = [];

  try {
    // Database
    const DATABASE_URL = validateEnvVar('DATABASE_URL', process.env.DATABASE_URL);
    validateDatabaseUrl(DATABASE_URL);

    // Clerk Authentication
    const NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = validateEnvVar(
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    );

    const CLERK_SECRET_KEY = validateEnvVar(
      'CLERK_SECRET_KEY',
      process.env.CLERK_SECRET_KEY
    );

    // Validate Clerk key formats
    if (!NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith('pk_')) {
      errors.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must start with "pk_"');
    }

    if (!CLERK_SECRET_KEY.startsWith('sk_')) {
      errors.push('CLERK_SECRET_KEY must start with "sk_"');
    }

    // Google Gemini API
    const GEMINI_API_KEY = validateEnvVar('GEMINI_API_KEY', process.env.GEMINI_API_KEY);

    // ImageKit.io
    const IMAGEKIT_PUBLIC_KEY = validateEnvVar(
      'IMAGEKIT_PUBLIC_KEY',
      process.env.IMAGEKIT_PUBLIC_KEY
    );

    const IMAGEKIT_PRIVATE_KEY = validateEnvVar(
      'IMAGEKIT_PRIVATE_KEY',
      process.env.IMAGEKIT_PRIVATE_KEY
    );

    const IMAGEKIT_URL_ENDPOINT = validateEnvVar(
      'IMAGEKIT_URL_ENDPOINT',
      process.env.IMAGEKIT_URL_ENDPOINT
    );

    // Validate ImageKit URL format
    validateUrl('IMAGEKIT_URL_ENDPOINT', IMAGEKIT_URL_ENDPOINT);

    if (errors.length > 0) {
      throw new EnvValidationError(
        `Environment validation failed:\n${errors.join('\n')}`
      );
    }

    return {
      DATABASE_URL,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      CLERK_SECRET_KEY,
      GEMINI_API_KEY,
      IMAGEKIT_PUBLIC_KEY,
      IMAGEKIT_PRIVATE_KEY,
      IMAGEKIT_URL_ENDPOINT,
    };
  } catch (error) {
    if (error instanceof EnvValidationError) {
      throw error;
    }
    throw new EnvValidationError(
      `Environment validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get validated environment configuration
 * Throws error if validation fails
 */
export function getEnvConfig(): EnvConfig {
  return validateEnv();
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in test environment
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}
