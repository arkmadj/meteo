/**
 * Intelligent Tomorrow's Forecast Prefetching Hook
 *
 * This hook implements smart prefetching for tomorrow's forecast data based on
 * current-day views. It improves perceived performance by fetching data ahead
 * of user navigation while respecting data-saving preferences.
 *
 * Features:
 * - Automatic prefetching when viewing current day's weather
 * - Connection quality awareness (respects save-data and slow connections)
 * - Idle-time prefetching using requestIdleCallback
 * - View-time based triggering (prefetch after user engagement threshold)
 * - Cache-aware to avoid redundant fetches
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/config/queryClient';
import type { TemperatureUnit } from '@/services/weatherService';
import { fetchCompleteWeatherData } from '@/services/weatherService';
import type { ForecastDay } from '@/types/weather';

/** Configuration for prefetching behavior */
export interface TomorrowPrefetchConfig {
  /** Minimum view time (ms) before triggering prefetch. Default: 2000ms */
  viewTimeThreshold?: number;
  /** Whether to use idle callback for non-blocking prefetch. Default: true */
  useIdleCallback?: boolean;
  /** Idle callback timeout (ms). Default: 3000ms */
  idleTimeout?: number;
  /** Whether to respect data-saving preferences. Default: true */
  respectDataSaver?: boolean;
  /** Connection types that allow prefetching. Default: ['4g', '3g', 'wifi'] */
  allowedConnectionTypes?: string[];
  /** Stale time for prefetched data (ms). Default: 15 minutes */
  prefetchStaleTime?: number;
  /** Whether prefetching is enabled. Default: true */
  enabled?: boolean;
}

interface ConnectionInfo {
  effectiveType?: string;
  saveData?: boolean;
  downlink?: number;
}

interface PrefetchMetrics {
  prefetchAttempts: number;
  prefetchSuccesses: number;
  prefetchSkipped: number;
  lastPrefetchTime: number | null;
  averagePrefetchDuration: number;
}

const DEFAULT_CONFIG: Required<TomorrowPrefetchConfig> = {
  viewTimeThreshold: 2000,
  useIdleCallback: true,
  idleTimeout: 3000,
  respectDataSaver: true,
  allowedConnectionTypes: ['4g', '3g', 'wifi'],
  prefetchStaleTime: 15 * 60 * 1000, // 15 minutes
  enabled: true,
};

/**
 * Get current connection information
 */
const getConnectionInfo = (): ConnectionInfo => {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return { effectiveType: '4g', saveData: false };
  }

  const connection = (navigator as Navigator & { connection?: ConnectionInfo }).connection;
  return {
    effectiveType: connection?.effectiveType ?? '4g',
    saveData: connection?.saveData ?? false,
    downlink: connection?.downlink,
  };
};

/**
 * Check if prefetching should be allowed based on connection and preferences
 */
const shouldAllowPrefetch = (
  config: Required<TomorrowPrefetchConfig>,
  connectionInfo: ConnectionInfo
): boolean => {
  // Check if explicitly disabled
  if (!config.enabled) return false;

  // Respect data saver preference
  if (config.respectDataSaver && connectionInfo.saveData) {
    return false;
  }

  // Check connection type
  const effectiveType = connectionInfo.effectiveType ?? '4g';
  if (!config.allowedConnectionTypes.includes(effectiveType)) {
    return false;
  }

  return true;
};

/**
 * Get tomorrow's date string in YYYY-MM-DD format
 */
const getTomorrowDateString = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

/**
 * Hook for intelligently prefetching tomorrow's forecast data
 */
export const useTomorrowForecastPrefetch = (
  location: string,
  temperatureUnit: TemperatureUnit = 'celsius',
  config: TomorrowPrefetchConfig = {}
) => {
  const queryClient = useQueryClient();
  const mergedConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);

  const viewStartTimeRef = useRef<number | null>(null);
  const prefetchScheduledRef = useRef(false);
  const idleCallbackIdRef = useRef<number | null>(null);
  const metricsRef = useRef<PrefetchMetrics>({
    prefetchAttempts: 0,
    prefetchSuccesses: 0,
    prefetchSkipped: 0,
    lastPrefetchTime: null,
    averagePrefetchDuration: 0,
  });

  /**
   * Check if tomorrow's forecast is already cached
   */
  const isTomorrowCached = useCallback((): boolean => {
    const forecastData = queryClient.getQueryData<ForecastDay[]>(
      queryKeys.weather.forecast(location, 7, temperatureUnit)
    );

    if (!forecastData || forecastData.length < 2) return false;

    const tomorrowDate = getTomorrowDateString();
    return forecastData.some(day => day.date === tomorrowDate);
  }, [queryClient, location, temperatureUnit]);

  /**
   * Perform the actual prefetch operation
   */
  const prefetchTomorrow = useCallback(async (): Promise<boolean> => {
    const startTime = performance.now();
    metricsRef.current.prefetchAttempts++;

    try {
      // Prefetch forecast data that includes tomorrow
      await queryClient.prefetchQuery({
        queryKey: queryKeys.weather.forecast(location, 7, temperatureUnit),
        queryFn: async () => {
          const { forecast } = await fetchCompleteWeatherData(location, 7, temperatureUnit);
          return forecast.slice(0, 7);
        },
        staleTime: mergedConfig.prefetchStaleTime,
      });
      const duration = performance.now() - startTime;
      metricsRef.current.prefetchSuccesses++;
      metricsRef.current.lastPrefetchTime = Date.now();

      // Update average duration
      const totalDuration =
        metricsRef.current.averagePrefetchDuration * (metricsRef.current.prefetchSuccesses - 1) +
        duration;
      metricsRef.current.averagePrefetchDuration =
        totalDuration / metricsRef.current.prefetchSuccesses;

      return true;
    } catch (error) {
      // Silently fail - prefetching is optional optimization
      if (process.env.NODE_ENV === 'development') {
        console.debug('[TomorrowPrefetch] Prefetch failed:', error);
      }
      return false;
    }
  }, [queryClient, location, temperatureUnit, mergedConfig.prefetchStaleTime]);

  /**
   * Schedule prefetch using requestIdleCallback or setTimeout
   */
  const schedulePrefetch = useCallback(() => {
    if (prefetchScheduledRef.current) return;

    const connectionInfo = getConnectionInfo();
    if (!shouldAllowPrefetch(mergedConfig, connectionInfo)) {
      metricsRef.current.prefetchSkipped++;
      return;
    }

    // Skip if already cached
    if (isTomorrowCached()) {
      metricsRef.current.prefetchSkipped++;
      return;
    }

    prefetchScheduledRef.current = true;

    const executePrefetch = () => {
      void prefetchTomorrow();
      prefetchScheduledRef.current = false;
    };

    if (mergedConfig.useIdleCallback && 'requestIdleCallback' in window) {
      idleCallbackIdRef.current = window.requestIdleCallback(executePrefetch, {
        timeout: mergedConfig.idleTimeout,
      });
    } else {
      // Fallback to setTimeout for browsers without requestIdleCallback
      setTimeout(executePrefetch, mergedConfig.idleTimeout);
    }
  }, [mergedConfig, isTomorrowCached, prefetchTomorrow]);

  /**
   * Trigger prefetch when view time threshold is met
   */
  const triggerViewBasedPrefetch = useCallback(() => {
    if (!viewStartTimeRef.current) {
      viewStartTimeRef.current = Date.now();
    }

    const viewDuration = Date.now() - viewStartTimeRef.current;

    if (viewDuration >= mergedConfig.viewTimeThreshold) {
      schedulePrefetch();
    }
  }, [mergedConfig.viewTimeThreshold, schedulePrefetch]);

  /**
   * Effect to handle view-time based prefetching
   */
  useEffect(() => {
    if (!location || !mergedConfig.enabled) return;

    // Reset view start time when location changes
    viewStartTimeRef.current = Date.now();
    prefetchScheduledRef.current = false;

    // Check periodically if view threshold is met
    const checkInterval = setInterval(() => {
      triggerViewBasedPrefetch();
    }, 500);

    return () => {
      clearInterval(checkInterval);
      if (idleCallbackIdRef.current && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleCallbackIdRef.current);
      }
    };
  }, [location, mergedConfig.enabled, triggerViewBasedPrefetch]);

  /**
   * Manually trigger prefetch (for imperative usage)
   */
  const prefetchNow = useCallback(async () => {
    const connectionInfo = getConnectionInfo();
    if (!shouldAllowPrefetch(mergedConfig, connectionInfo)) {
      return false;
    }
    return prefetchTomorrow();
  }, [mergedConfig, prefetchTomorrow]);

  /**
   * Get current prefetch metrics
   */
  const getMetrics = useCallback((): PrefetchMetrics => {
    return { ...metricsRef.current };
  }, []);

  /**
   * Check if prefetching is currently allowed
   */
  const isPrefetchAllowed = useCallback((): boolean => {
    const connectionInfo = getConnectionInfo();
    return shouldAllowPrefetch(mergedConfig, connectionInfo);
  }, [mergedConfig]);

  return {
    prefetchNow,
    isTomorrowCached,
    isPrefetchAllowed,
    getMetrics,
  };
};

/**
 * Hook for prefetching next day's data when hovering/focusing on forecast days
 */
export const useForecastDayPrefetch = (
  location: string,
  temperatureUnit: TemperatureUnit = 'celsius',
  config: TomorrowPrefetchConfig = {}
) => {
  const queryClient = useQueryClient();
  const mergedConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Prefetch data for a specific forecast day index
   */
  const prefetchForDay = useCallback(
    async (dayIndex: number) => {
      const connectionInfo = getConnectionInfo();
      if (!shouldAllowPrefetch(mergedConfig, connectionInfo)) {
        return false;
      }

      try {
        // Ensure we have enough days in the forecast
        const daysNeeded = Math.max(dayIndex + 1, 7);

        await queryClient.prefetchQuery({
          queryKey: queryKeys.weather.forecast(location, daysNeeded, temperatureUnit),
          queryFn: async () => {
            const { forecast } = await fetchCompleteWeatherData(
              location,
              daysNeeded,
              temperatureUnit
            );
            return forecast.slice(0, daysNeeded);
          },
          staleTime: mergedConfig.prefetchStaleTime,
        });

        return true;
      } catch {
        return false;
      }
    },
    [queryClient, location, temperatureUnit, mergedConfig]
  );

  /**
   * Handler for when user hovers over a forecast day card
   * Delays prefetch to avoid unnecessary fetches on quick hover-overs
   */
  const onForecastDayHover = useCallback(
    (dayIndex: number) => {
      // Clear any existing timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }

      // Prefetch after a short delay (300ms) to avoid fetching on quick passes
      hoverTimeoutRef.current = setTimeout(() => {
        void prefetchForDay(dayIndex);
      }, 300);
    },
    [prefetchForDay]
  );

  /**
   * Handler for when user leaves a forecast day card
   */
  const onForecastDayLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  /**
   * Handler for when user focuses on a forecast day (keyboard navigation)
   */
  const onForecastDayFocus = useCallback(
    (dayIndex: number) => {
      // Immediately prefetch on focus for better keyboard navigation experience
      void prefetchForDay(dayIndex);
    },
    [prefetchForDay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return {
    onForecastDayHover,
    onForecastDayLeave,
    onForecastDayFocus,
    prefetchForDay,
  };
};

export default useTomorrowForecastPrefetch;
