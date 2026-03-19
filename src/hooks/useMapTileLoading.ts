/**
 * useMapTileLoading Hook
 *
 * Custom hook for managing map tile loading states and error handling
 * with retry logic and progress tracking.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface TileLoadingState {
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  progress: number;
  tilesLoaded: number;
  tilesTotal: number;
  retryCount: number;
}

export interface UseMapTileLoadingOptions {
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Retry delay in milliseconds */
  retryDelay?: number;
  /** Timeout for tile loading in milliseconds */
  timeout?: number;
  /** Callback when loading starts */
  onLoadStart?: () => void;
  /** Callback when loading completes */
  onLoadComplete?: () => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
}

export interface UseMapTileLoadingReturn {
  state: TileLoadingState;
  startLoading: () => void;
  completeLoading: () => void;
  reportError: (error: Error | string) => void;
  retry: () => void;
  reset: () => void;
  updateProgress: (loaded: number, total: number) => void;
}

const initialState: TileLoadingState = {
  isLoading: false,
  hasError: false,
  errorMessage: null,
  progress: 0,
  tilesLoaded: 0,
  tilesTotal: 0,
  retryCount: 0,
};

/**
 * Hook for managing map tile loading states
 */
export const useMapTileLoading = (
  options: UseMapTileLoadingOptions = {}
): UseMapTileLoadingReturn => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    timeout = 30000,
    onLoadStart,
    onLoadComplete,
    onError,
  } = options;

  const [state, setState] = useState<TileLoadingState>(initialState);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, []);

  /**
   * Start loading
   */
  const startLoading = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      hasError: false,
      errorMessage: null,
      progress: 0,
      tilesLoaded: 0,
      tilesTotal: 0,
    }));

    onLoadStart?.();

    // Set timeout for loading
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setState(prev => {
        if (prev.isLoading) {
          const error = new Error('Map tile loading timeout');
          onError?.(error);
          return {
            ...prev,
            isLoading: false,
            hasError: true,
            errorMessage: 'Loading timeout. Please check your connection.',
          };
        }
        return prev;
      });
    }, timeout);
  }, [timeout, onLoadStart, onError]);

  /**
   * Complete loading
   */
  const completeLoading = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setState(prev => ({
      ...prev,
      isLoading: false,
      hasError: false,
      errorMessage: null,
      progress: 100,
      retryCount: 0,
    }));

    onLoadComplete?.();
  }, [onLoadComplete]);

  /**
   * Report error
   */
  const reportError = useCallback(
    (error: Error | string) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      const errorMessage = typeof error === 'string' ? error : error.message;
      const errorObj = typeof error === 'string' ? new Error(error) : error;

      setState(prev => ({
        ...prev,
        isLoading: false,
        hasError: true,
        errorMessage,
      }));

      onError?.(errorObj);
    },
    [onError]
  );

  /**
   * Retry loading
   */
  const retry = useCallback(() => {
    setState(prev => {
      if (prev.retryCount >= maxRetries) {
        return {
          ...prev,
          hasError: true,
          errorMessage: `Failed after ${maxRetries} attempts. Please try again later.`,
        };
      }

      // Schedule retry with delay
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = setTimeout(
        () => {
          startLoading();
        },
        retryDelay * (prev.retryCount + 1)
      ); // Exponential backoff

      return {
        ...prev,
        retryCount: prev.retryCount + 1,
        hasError: false,
        errorMessage: null,
      };
    });
  }, [maxRetries, retryDelay, startLoading]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    setState(initialState);
  }, []);

  /**
   * Update progress
   */
  const updateProgress = useCallback((loaded: number, total: number) => {
    setState(prev => {
      const progress = total > 0 ? (loaded / total) * 100 : 0;
      return {
        ...prev,
        tilesLoaded: loaded,
        tilesTotal: total,
        progress,
      };
    });
  }, []);

  return {
    state,
    startLoading,
    completeLoading,
    reportError,
    retry,
    reset,
    updateProgress,
  };
};

export default useMapTileLoading;
