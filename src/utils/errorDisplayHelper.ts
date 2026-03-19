/**
 * Error Display Helper
 *
 * Utility to automatically choose the right error display medium based on error characteristics.
 * Simplifies error handling by providing a single interface that routes to the appropriate display method.
 */

import type { ErrorContextType } from '@/contexts/ErrorContext';
import type { SnackbarContextType } from '@/contexts/SnackbarContext';
import type { AppError } from '@/types/error';
import { ErrorCategory, ErrorSeverity } from '@/types/error';

/**
 * Error display options
 */
export interface ErrorDisplayOptions {
  /** Force a specific display medium */
  medium?: 'snackbar' | 'alert' | 'error-display' | 'auto';
  /** Duration for snackbar (milliseconds) */
  duration?: number;
  /** Whether to show retry button */
  showRetry?: boolean;
  /** Custom retry function */
  onRetry?: () => Promise<void> | void;
  /** Custom dismiss callback */
  onDismiss?: () => void;
  /** Whether to show technical details */
  showDetails?: boolean;
  /** Priority for snackbar (higher = shown first) */
  priority?: number;
}

/**
 * Display medium recommendation based on error characteristics
 */
export interface DisplayMediumRecommendation {
  medium: 'snackbar' | 'alert' | 'error-display';
  variant: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  showRetry: boolean;
  reason: string;
}

/**
 * Determine the best display medium for an error
 */
export const recommendDisplayMedium = (
  error: AppError | Error | string,
  options: ErrorDisplayOptions = {}
): DisplayMediumRecommendation => {
  // If medium is explicitly specified, use it
  if (options.medium && options.medium !== 'auto') {
    return {
      medium: options.medium,
      variant: 'error',
      showRetry: options.showRetry ?? false,
      reason: 'Explicitly specified by caller',
    };
  }

  // Handle string errors (simple messages)
  if (typeof error === 'string') {
    return {
      medium: 'snackbar',
      variant: 'error',
      duration: 5000,
      showRetry: false,
      reason: 'Simple string error message',
    };
  }

  // Handle native Error objects
  if (error instanceof Error && !('severity' in error)) {
    return {
      medium: 'snackbar',
      variant: 'error',
      duration: 6000,
      showRetry: false,
      reason: 'Native Error object without severity',
    };
  }

  // Handle AppError objects
  const appError = error as AppError;

  // Critical errors should use ErrorDisplay or ErrorBoundary
  if (appError.severity === ErrorSeverity.CRITICAL) {
    return {
      medium: 'error-display',
      variant: 'error',
      showRetry: appError.retryable,
      reason: 'Critical severity requires prominent display',
    };
  }

  // High severity errors
  if (appError.severity === ErrorSeverity.HIGH) {
    return {
      medium: appError.retryable ? 'error-display' : 'alert',
      variant: 'error',
      showRetry: appError.retryable,
      reason: appError.retryable
        ? 'High severity with retry capability'
        : 'High severity without retry',
    };
  }

  // Medium severity errors
  if (appError.severity === ErrorSeverity.MEDIUM) {
    // Network errors are often retryable
    if (appError.category === ErrorCategory.NETWORK && appError.retryable) {
      return {
        medium: 'error-display',
        variant: 'error',
        showRetry: true,
        reason: 'Network error with retry capability',
      };
    }

    return {
      medium: 'alert',
      variant: 'warning',
      showRetry: false,
      reason: 'Medium severity warrants persistent alert',
    };
  }

  // Low severity errors - use snackbar
  return {
    medium: 'snackbar',
    variant: appError.severity === ErrorSeverity.LOW ? 'warning' : 'error',
    duration: 5000,
    showRetry: false,
    reason: 'Low severity suitable for temporary notification',
  };
};

/**
 * Display an error using the appropriate medium
 */
export const displayError = (
  error: AppError | Error | string,
  snackbarContext: SnackbarContextType,
  errorContext?: ErrorContextType,
  options: ErrorDisplayOptions = {}
): void => {
  const recommendation = recommendDisplayMedium(error, options);

  // Get error message
  const message =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : (error as AppError).userMessage || (error as AppError).message;

  switch (recommendation.medium) {
    case 'snackbar': {
      const { showError, showWarning, showInfo } = snackbarContext;
      const duration = options.duration ?? recommendation.duration ?? 5000;
      const priority = options.priority ?? 0;

      if (recommendation.variant === 'error') {
        showError(message, duration, priority);
      } else if (recommendation.variant === 'warning') {
        showWarning(message, duration, priority);
      } else {
        showInfo(message, duration, priority);
      }
      break;
    }

    case 'alert':
    case 'error-display': {
      // For alert and error-display, we use the ErrorContext
      if (errorContext && typeof error !== 'string') {
        const appError =
          error instanceof Error && !('severity' in error)
            ? errorContext.handleError(error, { source: 'error-display-helper' })
            : (error as AppError);

        errorContext.addError(appError);
      } else {
        console.warn('ErrorContext not provided for alert/error-display medium');
        // Fallback to snackbar
        snackbarContext.showError(message, 6000);
      }
      break;
    }

    default:
      console.warn(`Unknown display medium: ${recommendation.medium}`);
      snackbarContext.showError(message);
  }

  // Call custom dismiss callback if provided
  if (options.onDismiss) {
    options.onDismiss();
  }
};

/**
 * Hook for simplified error display
 */
export const useErrorDisplay = () => {
  // This will be implemented as a custom hook
  // For now, return the helper functions
  return {
    displayError,
    recommendDisplayMedium,
  };
};

/**
 * Success message helper
 */
export const displaySuccess = (
  message: string,
  snackbarContext: SnackbarContextType,
  options: { duration?: number; priority?: number } = {}
): void => {
  const duration = options.duration ?? 4000;
  const priority = options.priority ?? 0;
  snackbarContext.showSuccess(message, duration, priority);
};

/**
 * Warning message helper
 */
export const displayWarning = (
  message: string,
  snackbarContext: SnackbarContextType,
  options: { duration?: number; priority?: number; persistent?: boolean } = {}
): void => {
  if (options.persistent) {
    // For persistent warnings, we'd need to use Alert component
    // This would require ErrorContext
    console.warn('Persistent warnings require Alert component integration');
  }

  const duration = options.duration ?? 6000;
  const priority = options.priority ?? 5;
  snackbarContext.showWarning(message, duration, priority);
};

/**
 * Info message helper
 */
export const displayInfo = (
  message: string,
  snackbarContext: SnackbarContextType,
  options: { duration?: number; priority?: number } = {}
): void => {
  const duration = options.duration ?? 4000;
  const priority = options.priority ?? 0;
  snackbarContext.showInfo(message, duration, priority);
};

/**
 * Get user-friendly error message from various error types
 */
export const getUserFriendlyMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    // Check if it's an AppError with userMessage
    if ('userMessage' in error && typeof (error as unknown).userMessage === 'string') {
      return (error as unknown).userMessage;
    }

    // Map common error messages to user-friendly versions
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return 'Unable to connect. Please check your internet connection.';
    }

    if (message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }

    if (message.includes('not found') || message.includes('404')) {
      return 'The requested resource was not found.';
    }

    if (message.includes('unauthorized') || message.includes('401')) {
      return 'You are not authorized to perform this action.';
    }

    if (message.includes('forbidden') || message.includes('403')) {
      return 'Access denied.';
    }

    if (message.includes('rate limit') || message.includes('429')) {
      return 'Too many requests. Please wait a moment and try again.';
    }

    if (message.includes('server') || message.includes('500')) {
      return 'Server error. Please try again later.';
    }

    // Return original message if no mapping found
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Classify error severity from native Error
 */
export const classifyErrorSeverity = (error: Error): ErrorSeverity => {
  const message = error.message.toLowerCase();

  // Critical errors
  if (message.includes('critical') || message.includes('fatal') || message.includes('crash')) {
    return ErrorSeverity.CRITICAL;
  }

  // High severity
  if (message.includes('server error') || message.includes('500') || message.includes('database')) {
    return ErrorSeverity.HIGH;
  }

  // Medium severity
  if (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('unauthorized') ||
    message.includes('forbidden')
  ) {
    return ErrorSeverity.MEDIUM;
  }

  // Default to low
  return ErrorSeverity.LOW;
};

/**
 * Check if error is retryable
 */
export const isErrorRetryable = (error: Error | AppError): boolean => {
  // If it's an AppError, use its retryable property
  if ('retryable' in error) {
    return error.retryable;
  }

  const message = error.message.toLowerCase();

  // Network errors are usually retryable
  if (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('fetch') ||
    message.includes('connection')
  ) {
    return true;
  }

  // Rate limit errors are retryable after waiting
  if (message.includes('rate limit') || message.includes('429')) {
    return true;
  }

  // Server errors might be retryable
  if (message.includes('500') || message.includes('503')) {
    return true;
  }

  // Client errors (4xx except 429) are usually not retryable
  if (
    message.includes('400') ||
    message.includes('401') ||
    message.includes('403') ||
    message.includes('404')
  ) {
    return false;
  }

  // Default to not retryable
  return false;
};
