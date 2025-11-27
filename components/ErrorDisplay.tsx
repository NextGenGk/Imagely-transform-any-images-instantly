'use client';

/**
 * Error Display Component
 * Displays user-friendly error messages
 * Requirements: 13.1, 13.3
 */

import { ErrorCode, getUserFriendlyMessage } from '@/lib/errors';

interface ErrorDisplayProps {
  error: string | {
    code?: ErrorCode | string;
    message?: string;
    details?: Record<string, any>;
  };
  onDismiss?: () => void;
  className?: string;
}

export default function ErrorDisplay({ error, onDismiss, className = '' }: ErrorDisplayProps) {
  // Parse error object
  const errorInfo = typeof error === 'string' 
    ? { message: error }
    : error;

  const errorCode = errorInfo.code as ErrorCode | undefined;
  const errorMessage = errorInfo.message || 'An error occurred';
  const errorDetails = errorInfo.details;

  // Get user-friendly message if error code is available
  const displayMessage = errorCode 
    ? getUserFriendlyMessage(errorCode)
    : errorMessage;

  // Determine if we should show technical details
  const showDetails = process.env.NODE_ENV === 'development' && errorDetails;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex">
        <div className="shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="text-sm text-red-700 mt-1">{displayMessage}</p>
          
          {showDetails && (
            <details className="mt-2">
              <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                Technical Details
              </summary>
              <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(errorDetails, null, 2)}
              </pre>
            </details>
          )}
        </div>
        {onDismiss && (
          <div className="ml-3">
            <button
              onClick={onDismiss}
              className="inline-flex text-red-400 hover:text-red-600 focus:outline-none"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
