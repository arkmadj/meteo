/**
 * Graceful Degradation Hook
 * Provides fallback data and offline support for API calls
 */

import { useCallback, useEffect, useState } from 'react';

import { useOnlineStatus } from '@/contexts/OnlineStatusContext';
import type { AppError } from '@/types/error';
import { ErrorCategory, ErrorSeverity, ErrorType } from '@/types/error';
import { getLogger } from '@/utils/logger';
import { offlineFallback } from '@/utils/offlineFallback';

const logger = getLogger('GracefulDegradation');

export interface GracefulOptions<T> {
  /** Cache key for offline storage */
  cacheKey: string;
  /** Maximum age of cached data in ms */
  maxAge?: number;
  /** Fallback data to use if cache is empty */
  defaultData?: T;
  /** Whether to use stale data while revalidating */
  staleWhileRevalidate?: boolean;
  /** Callback when using fallback data */
  onFallback?: (reason: string) => void;
}

export interface GracefulResult<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
  isOffline: boolean;
  isFallback: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook for graceful degradation with offline support
 */
export function useGracefulDegradation<T>(
  fetchFn: () => Promise<T>,
  options: GracefulOptions<T>
): GracefulResult<T> {
  const {
    cacheKey,
    maxAge = 3600000, // 1 hour default
    defaultData,
    staleWhileRevalidate: _staleWhileRevalidate = true,
    onFallback,
  } = options;

  const isOnline = useOnlineStatus();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  /**
   * Fetch data with fallback support
   */
  const fetchWithFallback = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // If offline, use cached data immediately
      if (!isOnline) {
        const cached = offlineFallback.get<T>(cacheKey, { maxAge, staleWhileRevalidate: true });

        if (cached) {
          logger.info(`Using cached data (offline): ${cacheKey}`);
          setData(cached);
          setIsFallback(true);
          onFallback?.('offline');
        } else if (defaultData) {
          logger.info(`Using default data (offline, no cache): ${cacheKey}`);
          setData(defaultData);
          setIsFallback(true);
          onFallback?.('offline-no-cache');
        } else {
          throw {
            id: 'offline-no-cache',
            type: ErrorType.NETWORK_ERROR,
            category: 'network' as const,
            severity: 'medium' as const,
            message: 'No internet connection and no cached data available',
            userMessage: 'You are offline and no cached data is available',
            timestamp: Date.now(),
            retryable: true,
          };
        }
        setLoading(false);
        return;
      }

      // Try to fetch fresh data
      try {
        const freshData = await fetchFn();

        // Cache the fresh data
        offlineFallback.set(cacheKey, freshData, maxAge);

        setData(freshData);
        setIsFallback(false);
        logger.info(`Fetched fresh data: ${cacheKey}`);
      } catch (fetchError) {
        // Fetch failed, try cache
        const cached = offlineFallback.get<T>(cacheKey, { maxAge, staleWhileRevalidate: true });

        if (cached) {
          logger.warn(`Fetch failed, using cached data: ${cacheKey}`);
          setData(cached);
          setIsFallback(true);
          onFallback?.('fetch-error-cached');
        } else if (defaultData) {
          logger.warn(`Fetch failed, using default data: ${cacheKey}`);
          setData(defaultData);
          setIsFallback(true);
          onFallback?.('fetch-error-default');
        } else {
          // No fallback available
          throw fetchError;
        }
      }
    } catch (err) {
      const appError: AppError = {
        id: `fetch-${Date.now()}`,
        type: ErrorType.API_ERROR,
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        message: err instanceof Error ? err.message : 'Failed to fetch data',
        userMessage: 'Unable to load data',
        timestamp: Date.now(),
        retryable: true,
        originalError: err,
      };

      setError(appError);
      logger.error(`Graceful degradation failed: ${cacheKey}`, { error: appError });
    } finally {
      setLoading(false);
    }
  }, [fetchFn, cacheKey, maxAge, defaultData, isOnline, onFallback]);

  /**
   * Refresh data
   */
  const refresh = useCallback(async (): Promise<void> => {
    await fetchWithFallback();
  }, [fetchWithFallback]);

  // Initial fetch
  useEffect(() => {
    void fetchWithFallback();
  }, [fetchWithFallback]);

  return {
    data,
    loading,
    error,
    isOffline: !isOnline,
    isFallback,
    refresh,
  };
}

export default useGracefulDegradation;
