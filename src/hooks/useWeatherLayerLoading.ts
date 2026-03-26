/**
 * useWeatherLayerLoading Hook
 *
 * Custom hook for managing weather layer data loading with error handling,
 * retry logic, and caching.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export type WeatherLayerType = 'temperature' | 'airQuality' | 'precipitation' | 'wind';

export interface WeatherLayerState<T = unknown> {
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  data: T | null;
  lastUpdated: Date | null;
  retryCount: number;
  isCached: boolean;
}

export interface UseWeatherLayerLoadingOptions<T> {
  /** Layer type for identification */
  layerType: WeatherLayerType;
  /** Function to fetch layer data */
  fetchData: () => Promise<T>;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Retry delay in milliseconds */
  retryDelay?: number;
  /** Cache duration in milliseconds */
  cacheDuration?: number;
  /** Auto-fetch on mount */
  autoFetch?: boolean;
  /** Callback when loading starts */
  onLoadStart?: () => void;
  /** Callback when loading completes */
  onLoadComplete?: (data: T) => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
}

export interface UseWeatherLayerLoadingReturn<T> {
  state: WeatherLayerState<T>;
  fetch: () => Promise<void>;
  retry: () => void;
  reset: () => void;
  clearCache: () => void;
}

const createInitialState = <T>(): WeatherLayerState<T> => ({
  isLoading: false,
  hasError: false,
  errorMessage: null,
  data: null,
  lastUpdated: null,
  retryCount: 0,
  isCached: false,
});

/**
 * Hook for managing weather layer loading
 */
export const useWeatherLayerLoading = <T = unknown>(
  options: UseWeatherLayerLoadingOptions<T>
): UseWeatherLayerLoadingReturn<T> => {
  const {
    layerType,
    fetchData,
    maxRetries = 3,
    retryDelay = 2000,
    cacheDuration = 5 * 60 * 1000, // 5 minutes
    autoFetch = false,
    onLoadStart,
    onLoadComplete,
    onError,
  } = options;

  const [state, setState] = useState<WeatherLayerState<T>>(createInitialState<T>());
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<{ data: T; timestamp: number } | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  /**
   * Check if cached data is still valid
   */
  const isCacheValid = useCallback(() => {
    if (!cacheRef.current) return false;
    const now = Date.now();
    return now - cacheRef.current.timestamp < cacheDuration;
  }, [cacheDuration]);

  /**
   * Fetch layer data
   */
  const fetch = useCallback(async () => {
    // Check cache first
    if (isCacheValid() && cacheRef.current) {
      setState(prev => ({
        ...prev,
        data: cacheRef.current!.data,
        lastUpdated: new Date(cacheRef.current!.timestamp),
        isCached: true,
        hasError: false,
        errorMessage: null,
      }));
      return;
    }

    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isLoading: true,
      hasError: false,
      errorMessage: null,
      isCached: false,
    }));

    onLoadStart?.();

    try {
      const data = await fetchData();

      // Cache the data
      cacheRef.current = {
        data,
        timestamp: Date.now(),
      };

      setState(prev => ({
        ...prev,
        isLoading: false,
        hasError: false,
        errorMessage: null,
        data,
        lastUpdated: new Date(),
        retryCount: 0,
        isCached: false,
      }));

      onLoadComplete?.(data);
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Failed to load weather layer';
      const errorObj = error instanceof Error ? error : new Error(errorMessage);

      setState(prev => ({
        ...prev,
        isLoading: false,
        hasError: true,
        errorMessage: `${layerType} layer: ${errorMessage}`,
      }));

      onError?.(errorObj);
    }
  }, [fetchData, layerType, isCacheValid, onLoadStart, onLoadComplete, onError]);

  /**
   * Retry loading with exponential backoff
   */
  const retry = useCallback(() => {
    setState(prev => {
      if (prev.retryCount >= maxRetries) {
        return {
          ...prev,
          hasError: true,
          errorMessage: `${layerType} layer: Failed after ${maxRetries} attempts. Please try again later.`,
        };
      }

      // Schedule retry with exponential backoff
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      const delay = retryDelay * Math.pow(2, prev.retryCount);

      retryTimeoutRef.current = setTimeout(() => {
        void fetch();
      }, delay);

      return {
        ...prev,
        retryCount: prev.retryCount + 1,
        hasError: false,
        errorMessage: null,
      };
    });
  }, [maxRetries, retryDelay, layerType, fetch]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setState(createInitialState<T>());
  }, []);

  /**
   * Clear cache
   */
  const clearCache = useCallback(() => {
    cacheRef.current = null;
    setState(prev => ({
      ...prev,
      isCached: false,
    }));
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      void fetch();
    }
  }, [autoFetch, fetch]); // Only run on mount

  return {
    state,
    fetch,
    retry,
    reset,
    clearCache,
  };
};

export default useWeatherLayerLoading;
