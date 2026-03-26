/**
 * Global Error Handlers
 * Utilities for setting up global error handling in different environments
 */

import type { AppError } from '../types/error';
import { ErrorCategory, ErrorSeverity, ErrorType } from '../types/error';

/**
 * Setup global error handlers for Node.js environment
 */
export function setupNodeGlobalHandlers(
  onError?: (error: AppError) => void,
  onWarning?: (message: string) => void
): () => void {
  // Store original handlers to restore later
  const originalHandlers = {
    uncaughtException: process.listeners('uncaughtException'),
    unhandledRejection: process.listeners('unhandledRejection'),
  };

  // Handle uncaught exceptions
  const handleUncaughtException = (error: Error) => {
    console.error('Uncaught Exception:', error);

    const appError: AppError = {
      id: `uncaught-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: ErrorType.UNKNOWN_ERROR,
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.CRITICAL,
      message: error.message,
      userMessage: 'A critical system error occurred',
      timestamp: Date.now(),
      retryable: false,
      context: {
        source: 'uncaught-exception',
        stack: error.stack,
      },
      originalError: error,
    };

    if (onError) {
      onError(appError);
    }

    // In production, you might want to exit gracefully
    if (process.env.NODE_ENV === 'production') {
      onWarning?.('Application will restart due to critical error');
      process.exit(1);
    }
  };

  // Handle unhandled promise rejections
  const handleUnhandledRejection = (reason: unknown, promise: Promise<unknown>) => {
    console.error('Unhandled Promise Rejection at:', promise, 'reason:', reason);

    const appError: AppError = {
      id: `unhandled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: ErrorType.UNKNOWN_ERROR,
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.HIGH,
      message: (reason as { message?: string })?.message || 'Unhandled promise rejection',
      userMessage: 'An unexpected error occurred',
      timestamp: Date.now(),
      retryable: false,
      context: {
        source: 'unhandled-rejection',
        promise,
        reason,
      },
      originalError: reason,
    };

    if (onError) {
      onError(appError);
    }
  };

  // Register handlers
  process.on('uncaughtException', handleUncaughtException);
  process.on('unhandledRejection', handleUnhandledRejection);

  // Return cleanup function
  return () => {
    process.removeListener('uncaughtException', handleUncaughtException);
    process.removeListener('unhandledRejection', handleUnhandledRejection);

    // Restore original handlers
    originalHandlers.uncaughtException.forEach(handler => {
      process.on('uncaughtException', handler);
    });
    originalHandlers.unhandledRejection.forEach(handler => {
      process.on('unhandledRejection', handler);
    });
  };
}

/**
 * Setup global error handlers for browser environment
 */
export function setupBrowserGlobalHandlers(
  onError?: (error: AppError) => void,
  _onWarning?: (message: string) => void
): () => void {
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    event.preventDefault();
    console.error('Unhandled promise rejection:', event.reason);

    const appError: AppError = {
      id: `unhandled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: ErrorType.UNKNOWN_ERROR,
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.HIGH,
      message: event.reason?.message || 'Unhandled promise rejection',
      userMessage: 'An unexpected error occurred',
      timestamp: Date.now(),
      retryable: false,
      context: {
        source: 'unhandled-rejection',
        promise: event.promise,
        reason: event.reason,
      },
      originalError: event.reason,
    };

    if (onError) {
      onError(appError);
    }
  };

  const handleError = (event: ErrorEvent) => {
    event.preventDefault();
    console.error('Global error:', event.error);

    const appError: AppError = {
      id: `global-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: ErrorType.UNKNOWN_ERROR,
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.HIGH,
      message: event.error?.message || 'An unexpected error occurred',
      userMessage: 'An unexpected error occurred',
      timestamp: Date.now(),
      retryable: false,
      context: {
        source: 'global-error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        message: event.message,
      },
      originalError: event.error,
    };

    if (onError) {
      onError(appError);
    }
  };

  // Add event listeners
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
  window.addEventListener('error', handleError);

  // Return cleanup function
  return () => {
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    window.removeEventListener('error', handleError);
  };
}

/**
 * Safe async wrapper that prevents unhandled rejections
 */
export async function safeAsync<T>(
  asyncFn: () => Promise<T>,
  onError?: (error: Error) => void
): Promise<T | null> {
  try {
    const result = await asyncFn();
    return result;
  } catch (error) {
    if (onError) {
      onError(error as Error);
    } else {
      console.error('Caught error in safeAsync:', error);
    }
    return null;
  }
}

/**
 * Create a safe version of any async function
 */
export function makeSafe<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  onError?: (error: Error, args: T) => void
): (...args: T) => Promise<R | null> {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (onError) {
        onError(error as Error, args);
      } else {
        console.error('Caught error in safe function:', error);
      }
      return null;
    }
  };
}
