/**
 * Application initialization
 * Validates environment and performs startup checks
 * Requirements: 8.1
 */

import { validateEnv } from './env-validator';

let isInitialized = false;
let initError: Error | null = null;

/**
 * Initialize application
 * Validates environment variables and performs startup checks
 */
export function initializeApp(): void {
  if (isInitialized) {
    return;
  }

  try {
    // Validate environment variables
    validateEnv();

    console.log('✓ Environment variables validated successfully');
    
    isInitialized = true;
  } catch (error) {
    initError = error instanceof Error ? error : new Error('Unknown initialization error');
    console.error('✗ Application initialization failed:', initError.message);
    
    // Note: Cannot use process.exit() in Edge Runtime (middleware)
    // The error will be thrown and handled by the runtime
    
    throw initError;
  }
}

/**
 * Check if application is initialized
 */
export function isAppInitialized(): boolean {
  return isInitialized;
}

/**
 * Get initialization error if any
 */
export function getInitError(): Error | null {
  return initError;
}

/**
 * Reset initialization state (useful for testing)
 */
export function resetInitialization(): void {
  isInitialized = false;
  initError = null;
}
