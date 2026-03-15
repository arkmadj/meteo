/**
 * useErrorDisplay Hook
 *
 * Simplified hook for displaying errors, warnings, success, and info messages
 * Automatically chooses the right display medium based on error characteristics
 */

import { useError } from '@/contexts/ErrorContext';
import { useSnackbar } from '@/contexts/SnackbarContext';
import type { AppError } from '@/types/error';
import {
  displayError as displayErrorHelper,
  displayInfo as displayInfoHelper,
  displaySuccess as displaySuccessHelper,
  displayWarning as displayWarningHelper,
  getUserFriendlyMessage,
  recommendDisplayMedium,
  type ErrorDisplayOptions,
} from '@/utils/errorDisplayHelper';
import { useCallback } from 'react';

/**
 * Hook return type
 */
export interface UseErrorDisplayReturn {
  /** Display an error using the appropriate medium */
  displayError: (error: AppError | Error | string, options?: ErrorDisplayOptions) => void;
  /** Display a success message */
  displaySuccess: (message: string, options?: { duration?: number; priority?: number }) => void;
  /** Display a warning message */
  displayWarning: (
    message: string,
    options?: { duration?: number; priority?: number; persistent?: boolean }
  ) => void;
  /** Display an info message */
  displayInfo: (message: string, options?: { duration?: number; priority?: number }) => void;
  /** Get recommendation for display medium */
  getRecommendation: (
    error: AppError | Error | string,
    options?: ErrorDisplayOptions
  ) => ReturnType<typeof recommendDisplayMedium>;
  /** Get user-friendly message from error */
  getFriendlyMessage: (error: unknown) => string;
}

/**
 * Custom hook for simplified error display
 *
 * @example
 * ```typescript
 * const { displayError, displaySuccess } = useErrorDisplay();
 *
 * try {
 *   await saveData();
 *   displaySuccess('Data saved successfully!');
 * } catch (error) {
 *   displayError(error); // Automatically chooses the right medium
 * }
 * ```
 */
export const useErrorDisplay = (): UseErrorDisplayReturn => {
  const snackbarContext = useSnackbar();
  const errorContext = useError();

  const displayError = useCallback(
    (error: AppError | Error | string, options: ErrorDisplayOptions = {}) => {
      displayErrorHelper(error, snackbarContext, errorContext, options);
    },
    [snackbarContext, errorContext]
  );

  const displaySuccess = useCallback(
    (message: string, options: { duration?: number; priority?: number } = {}) => {
      displaySuccessHelper(message, snackbarContext, options);
    },
    [snackbarContext]
  );

  const displayWarning = useCallback(
    (
      message: string,
      options: { duration?: number; priority?: number; persistent?: boolean } = {}
    ) => {
      displayWarningHelper(message, snackbarContext, options);
    },
    [snackbarContext]
  );

  const displayInfo = useCallback(
    (message: string, options: { duration?: number; priority?: number } = {}) => {
      displayInfoHelper(message, snackbarContext, options);
    },
    [snackbarContext]
  );

  const getRecommendation = useCallback(
    (error: AppError | Error | string, options: ErrorDisplayOptions = {}) => {
      return recommendDisplayMedium(error, options);
    },
    []
  );

  const getFriendlyMessage = useCallback((error: unknown) => {
    return getUserFriendlyMessage(error);
  }, []);

  return {
    displayError,
    displaySuccess,
    displayWarning,
    displayInfo,
    getRecommendation,
    getFriendlyMessage,
  };
};

/**
 * Hook for handling async operations with automatic error display
 *
 * @example
 * ```typescript
 * const { execute, isLoading, error } = useAsyncWithErrorDisplay(
 *   async () => await fetchWeather(city),
 *   {
 *     onSuccess: () => displaySuccess('Weather loaded!'),
 *     errorOptions: { showRetry: true }
 *   }
 * );
 *
 * <button onClick={execute}>Load Weather</button>
 * ```
 */
export const useAsyncWithErrorDisplay = <T = any>(
  asyncFn: () => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    errorOptions?: ErrorDisplayOptions;
  } = {}
) => {
  const { displayError } = useErrorDisplay();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      displayError(error, options.errorOptions);
      options.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [asyncFn, displayError, options]);

  return {
    execute,
    isLoading,
    error,
    data,
  };
};

// Re-export for convenience
export { type ErrorDisplayOptions } from '@/utils/errorDisplayHelper';
