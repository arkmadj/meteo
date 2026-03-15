/**
 * Error handling utilities for the React Weather App
 */

import type { AppError, ErrorHandler, ErrorLogger } from '@/types/error';
import { ErrorCategory, ErrorSeverity, ErrorType } from '@/types/error';
import { getLogger } from '@/utils/logger';
import { sanitizeAnalyticsPayload } from '@/utils/sanitizer';

// Error ID generator
const generateErrorId = (): string => {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const errorLogger = getLogger('Errors:Handler');

// Default error logger
const defaultErrorLogger: ErrorLogger = (error: AppError) => {
  const structuredPayload = {
    id: error.id,
    type: error.type,
    category: error.category,
    severity: error.severity,
    userMessage: error.userMessage,
    timestamp: error.timestamp,
    retryable: error.retryable,
    context: error.context,
    originalError: error.originalError,
  };

  const sanitizedPayload = sanitizeAnalyticsPayload(structuredPayload);

  errorLogger.error(error.message, sanitizedPayload);
};

// Error classification utilities
const classifyError = (
  error: any
): { type: ErrorType; category: ErrorCategory; severity: ErrorSeverity } => {
  // Network errors
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return {
      type: ErrorType.NETWORK_ERROR,
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.HIGH,
    };
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return {
      type: ErrorType.TIMEOUT_ERROR,
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.MEDIUM,
    };
  }

  // Axios API errors
  if (error.response) {
    const status = error.response.status;

    // Rate limiting
    if (status === 429) {
      return {
        type: ErrorType.RATE_LIMIT_ERROR,
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
      };
    }

    // API errors
    if (status >= 400 && status < 500) {
      return {
        type: ErrorType.API_ERROR,
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
      };
    }

    // Server errors
    if (status >= 500) {
      return {
        type: ErrorType.API_ERROR,
        category: ErrorCategory.API,
        severity: ErrorSeverity.HIGH,
      };
    }
  }

  // Geocoding errors
  if (error.message?.includes('not found') || error.message?.includes('No results')) {
    return {
      type: ErrorType.CITY_NOT_FOUND,
      category: ErrorCategory.GEOCODING,
      severity: ErrorSeverity.LOW,
    };
  }

  // Weather data errors
  if (error.message?.includes('weather') || error.message?.includes('forecast')) {
    return {
      type: ErrorType.WEATHER_DATA_ERROR,
      category: ErrorCategory.WEATHER,
      severity: ErrorSeverity.MEDIUM,
    };
  }

  // Default unknown error
  return {
    type: ErrorType.UNKNOWN_ERROR,
    category: ErrorCategory.UNKNOWN,
    severity: ErrorSeverity.MEDIUM,
  };
};

// Error message mapping
const getErrorMessage = (type: ErrorType, originalError?: any): string => {
  switch (type) {
    case ErrorType.NETWORK_ERROR:
      return 'Network connection failed';
    case ErrorType.TIMEOUT_ERROR:
      return 'Request timed out';
    case ErrorType.RATE_LIMIT_ERROR:
      return 'API rate limit exceeded';
    case ErrorType.API_ERROR:
      return 'API request failed';
    case ErrorType.CITY_NOT_FOUND:
      return 'City not found';
    case ErrorType.DEFAULT_CITY_NOT_FOUND:
      return 'Default city not found';
    case ErrorType.INVALID_COORDINATES:
      return 'Invalid coordinates provided';
    case ErrorType.WEATHER_DATA_ERROR:
      return 'Failed to fetch weather data';
    case ErrorType.GEOCODING_ERROR:
      return 'Failed to get city coordinates';
    case ErrorType.PARSING_ERROR:
      return 'Failed to parse response data';
    default:
      return originalError?.message || 'An unknown error occurred';
  }
};

// Determine if error is retryable
const isRetryable = (type: ErrorType): boolean => {
  const retryableTypes = [
    ErrorType.NETWORK_ERROR,
    ErrorType.TIMEOUT_ERROR,
    ErrorType.API_ERROR,
    ErrorType.RATE_LIMIT_ERROR,
    ErrorType.WEATHER_DATA_ERROR,
    ErrorType.GEOCODING_ERROR,
  ];

  return retryableTypes.includes(type);
};

// Main error handler factory
export const createErrorHandler = (logger: ErrorLogger = defaultErrorLogger): ErrorHandler => {
  return (error: any, context: Record<string, any> = {}): AppError => {
    const classification = classifyError(error);
    const errorId = generateErrorId();

    const appError: AppError = {
      id: errorId,
      type: classification.type,
      category: classification.category,
      severity: classification.severity,
      message: getErrorMessage(classification.type, error),
      userMessage: getErrorMessage(classification.type, error), // This will be overridden by i18n
      timestamp: Date.now(),
      retryable: isRetryable(classification.type),
      context,
      originalError: error,
    };

    // Log the error
    logger(appError);

    return appError;
  };
};

// Error retry utility with exponential backoff
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  backoffFactor: number = 2
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw error;
      }

      const delay = baseDelay * Math.pow(backoffFactor, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Error filtering utilities
export const filterErrorsByType = (errors: AppError[], type: ErrorType): AppError[] => {
  return errors.filter(error => error.type === type);
};

export const filterErrorsByCategory = (errors: AppError[], category: ErrorCategory): AppError[] => {
  return errors.filter(error => error.category === category);
};

export const filterErrorsBySeverity = (errors: AppError[], severity: ErrorSeverity): AppError[] => {
  return errors.filter(error => error.severity === severity);
};

// Error aggregation utilities
export const getMostRecentError = (errors: AppError[]): AppError | null => {
  if (errors.length === 0) return null;

  return errors.reduce((mostRecent, current) =>
    current.timestamp > mostRecent.timestamp ? current : mostRecent
  );
};

export const getHighestSeverityError = (errors: AppError[]): AppError | null => {
  if (errors.length === 0) return null;

  const severityOrder = {
    [ErrorSeverity.LOW]: 1,
    [ErrorSeverity.MEDIUM]: 2,
    [ErrorSeverity.HIGH]: 3,
    [ErrorSeverity.CRITICAL]: 4,
  };

  return errors.reduce((highest, current) =>
    severityOrder?.[current.severity] > severityOrder?.[highest.severity] ? current : highest
  );
};

// Error cleanup utilities
export const removeOldErrors = (errors: AppError[], maxAge: number = 300000): AppError[] => {
  const now = Date.now();
  return errors.filter(error => now - error.timestamp < maxAge);
};

export const removeDismissedErrors = (errors: AppError[], dismissedIds: string[]): AppError[] => {
  return errors.filter(error => !dismissedIds.includes(error.id));
};
