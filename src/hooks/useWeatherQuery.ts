/**
 * Custom hooks for weather data using React Query
 */

import { useMutation, useQuery, useQueryClient, type Query } from '@tanstack/react-query';
import { useCallback } from 'react';

import { queryKeys } from '@/config/queryClient';
import { CityNotFoundError, GeocodingError, WeatherServiceError } from '@/errors/domainErrors';
import type { TemperatureUnit } from '@/services/weatherService';
import {
  fetchCompleteWeatherData,
  fetchGeocodingData,
  searchCities,
} from '@/services/weatherService';

const MANUAL_RETRY_MAX_ATTEMPTS = 3;
const MANUAL_RETRY_BASE_DELAY_MS = 1_000;
const MANUAL_RETRY_MAX_DELAY_MS = 15_000;
const AUTO_REFRESH_RETRY_MAX_ATTEMPTS = 5;
const AUTO_REFRESH_RETRY_BASE_DELAY_MS = 1_500;
const AUTO_REFRESH_RETRY_MAX_DELAY_MS = 60_000;

type WeatherRetryStrategy = {
  shouldRetry: (failureCount: number, error: Error) => boolean;
  getDelay: (attemptIndex: number) => number;
};

const extractStatusCode = (error: unknown): number | undefined => {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const details = (error as { details?: unknown }).details;
  if (details && typeof details === 'object') {
    const status = (details as Record<string, unknown>).status;
    if (typeof status === 'number') {
      return status;
    }
    if (typeof status === 'string') {
      const parsed = Number(status);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  const cause = (error as { cause?: unknown }).cause;
  if (cause && typeof cause === 'object') {
    const status = (cause as Record<string, unknown>).status;
    if (typeof status === 'number') {
      return status;
    }
    if (typeof status === 'string') {
      const parsed = Number(status);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
};

const isRetryableWeatherError = (error: unknown): boolean => {
  if (!error) {
    return true;
  }

  if (error instanceof CityNotFoundError) {
    return false;
  }

  const statusCode = extractStatusCode(error);

  if (typeof statusCode === 'number') {
    if (statusCode === 408 || statusCode === 429) {
      return true;
    }

    if (statusCode >= 500) {
      return true;
    }

    if (statusCode >= 400 && statusCode < 500) {
      return false;
    }
  }

  if (error instanceof GeocodingError) {
    return false;
  }

  if (error instanceof WeatherServiceError) {
    return true;
  }

  if (error instanceof Error) {
    const normalizedMessage = error.message?.toLowerCase?.() ?? '';
    if (normalizedMessage.includes('not found') || normalizedMessage.includes('invalid')) {
      return false;
    }
  }

  return true;
};

const createWeatherRetryStrategy = (options: { autoRefresh: boolean }): WeatherRetryStrategy => {
  const { autoRefresh } = options;
  const maxAttempts = autoRefresh ? AUTO_REFRESH_RETRY_MAX_ATTEMPTS : MANUAL_RETRY_MAX_ATTEMPTS;
  const baseDelay = autoRefresh ? AUTO_REFRESH_RETRY_BASE_DELAY_MS : MANUAL_RETRY_BASE_DELAY_MS;
  const maxDelay = autoRefresh ? AUTO_REFRESH_RETRY_MAX_DELAY_MS : MANUAL_RETRY_MAX_DELAY_MS;

  return {
    shouldRetry: (failureCount: number, error: Error) => {
      if (!isRetryableWeatherError(error)) {
        return false;
      }

      return failureCount < maxAttempts;
    },
    getDelay: (attemptIndex: number) => {
      const delay = baseDelay * 2 ** attemptIndex;
      return Math.min(delay, maxDelay);
    },
  };
};

import type { CurrentWeatherData, ForecastDay } from '@/types';

const WEATHER_AUTO_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes
const WEATHER_AUTO_REFRESH_MIN_GAP = 2 * 60 * 1000; // 2-minute safeguard
const WEATHER_AUTO_REFRESH_MAX_INTERVAL = 30 * 60 * 1000; // 30-minute ceiling

const isClientOnline = () => {
  if (typeof navigator === 'undefined' || typeof navigator.onLine === 'undefined') {
    return true;
  }
  return navigator.onLine;
};

export const createAdaptiveWeatherRefetchInterval = (config?: {
  baseIntervalMs?: number;
  minIntervalMs?: number;
  maxIntervalMs?: number;
}) => {
  const baseInterval = config?.baseIntervalMs ?? WEATHER_AUTO_REFRESH_INTERVAL;
  const minInterval = config?.minIntervalMs ?? WEATHER_AUTO_REFRESH_MIN_GAP;
  const maxInterval = config?.maxIntervalMs ?? WEATHER_AUTO_REFRESH_MAX_INTERVAL;

  return (query: Query<unknown, unknown, unknown, readonly unknown[]>) => {
    if (!isClientOnline()) {
      return false;
    }

    const { data, dataUpdatedAt, fetchFailureCount, fetchStatus } = query.state;
    const isFetching = fetchStatus === 'fetching';

    if (!data || isFetching) {
      return false;
    }

    const elapsed = dataUpdatedAt ? Date.now() - dataUpdatedAt : 0;

    if (Number.isNaN(elapsed) || elapsed < 0) {
      return baseInterval;
    }

    const maxMultiplier = Math.max(Math.floor(maxInterval / baseInterval), 1);
    const failureMultiplier =
      fetchFailureCount > 0 ? Math.min(2 ** fetchFailureCount, maxMultiplier) : 1;

    const targetInterval = Math.min(baseInterval * failureMultiplier, maxInterval);
    const remaining = targetInterval - elapsed;

    if (remaining <= 0) {
      return Math.max(minInterval, targetInterval);
    }

    return Math.max(minInterval, Math.min(remaining, maxInterval));
  };
};

type RefetchIntervalOption =
  | number
  | false
  | ((query: Query<unknown, unknown, unknown, readonly unknown[]>) => number | false);

type BaseWeatherQueryOptions = {
  enabled?: boolean;
  staleTime?: number;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  retry?: boolean | number;
  retryDelay?: number;
  autoRefresh?: boolean;
  autoRefreshIntervalMs?: number;
  minAutoRefreshGapMs?: number;
  maxAutoRefreshIntervalMs?: number;
  refetchInterval?: RefetchIntervalOption;
  refetchIntervalInBackground?: boolean;
  temperatureUnit?: TemperatureUnit;
  staleWhileRevalidate?: boolean;
};

type WeatherQueryOptions = BaseWeatherQueryOptions & {
  cacheTime?: number;
};

type CompleteWeatherQueryOptions = BaseWeatherQueryOptions & {
  gcTime?: number;
};

const resolveWeatherRefetchInterval = (options: {
  autoRefresh?: boolean;
  autoRefreshIntervalMs?: number;
  minAutoRefreshGapMs?: number;
  maxAutoRefreshIntervalMs?: number;
  refetchInterval?: RefetchIntervalOption;
}): RefetchIntervalOption => {
  if (options.refetchInterval !== undefined) {
    return options.refetchInterval;
  }

  if (options.autoRefresh === false) {
    return false;
  }

  return createAdaptiveWeatherRefetchInterval({
    baseIntervalMs: options.autoRefreshIntervalMs,
    minIntervalMs: options.minAutoRefreshGapMs,
    maxIntervalMs: options.maxAutoRefreshIntervalMs,
  });
};

const resolveStaleWhileRevalidateConfig = (
  options: BaseWeatherQueryOptions,
  defaults: { staleTime: number; refetchOnWindowFocus: boolean }
) => {
  const swrEnabled = options.staleWhileRevalidate ?? false;

  return {
    staleTime: options.staleTime ?? (swrEnabled ? 0 : defaults.staleTime),
    refetchOnMount: options.refetchOnMount ?? true,
    refetchOnWindowFocus:
      options.refetchOnWindowFocus ?? (swrEnabled ? true : defaults.refetchOnWindowFocus),
    refetchOnReconnect: options.refetchOnReconnect ?? true,
    swrEnabled,
  } as const;
};

/**
 * Hook for fetching current weather data
 */
export const useWeatherQuery = (location: string, options: WeatherQueryOptions = {}) => {
  const autoRefreshEnabled = options.autoRefresh ?? false;
  const refetchInterval = resolveWeatherRefetchInterval({
    autoRefresh: autoRefreshEnabled,
    autoRefreshIntervalMs: options.autoRefreshIntervalMs,
    minAutoRefreshGapMs: options.minAutoRefreshGapMs,
    maxAutoRefreshIntervalMs: options.maxAutoRefreshIntervalMs,
    refetchInterval: options.refetchInterval,
  });

  const lifecycle = resolveStaleWhileRevalidateConfig(options, {
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const temperatureUnit: TemperatureUnit = options.temperatureUnit ?? 'celsius';
  const retryStrategy = createWeatherRetryStrategy({ autoRefresh: autoRefreshEnabled });

  return useQuery({
    queryKey: queryKeys.weather.current(location, temperatureUnit),
    queryFn: async () => {
      const { current } = await fetchCompleteWeatherData(location, 7, temperatureUnit);
      return current;
    },
    enabled: !!location && (options.enabled ?? true),
    staleTime: 0, // No caching - always fetch fresh
    gcTime: 0, // No caching
    refetchOnMount: lifecycle.refetchOnMount,
    refetchOnWindowFocus: lifecycle.refetchOnWindowFocus,
    refetchOnReconnect: lifecycle.refetchOnReconnect,
    retry: options.retry ?? retryStrategy.shouldRetry,
    retryDelay: options.retryDelay ?? retryStrategy.getDelay,
    refetchInterval,
    refetchIntervalInBackground: options.refetchIntervalInBackground ?? false,
    meta: {
      staleWhileRevalidate: lifecycle.swrEnabled,
      autoRefresh: autoRefreshEnabled,
    },
  });
};

/**
 * Hook for fetching forecast data
 */
export const useForecastQuery = (
  location: string,
  days: number = 7,
  options: WeatherQueryOptions = {}
) => {
  const autoRefreshEnabled = options.autoRefresh ?? false;
  const refetchInterval = resolveWeatherRefetchInterval({
    autoRefresh: autoRefreshEnabled,
    autoRefreshIntervalMs: options.autoRefreshIntervalMs,
    minAutoRefreshGapMs: options.minAutoRefreshGapMs,
    maxAutoRefreshIntervalMs: options.maxAutoRefreshIntervalMs,
    refetchInterval: options.refetchInterval,
  });

  const lifecycle = resolveStaleWhileRevalidateConfig(options, {
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const temperatureUnit: TemperatureUnit = options.temperatureUnit ?? 'celsius';
  const retryStrategy = createWeatherRetryStrategy({ autoRefresh: autoRefreshEnabled });

  return useQuery({
    queryKey: queryKeys.weather.forecast(location, days, temperatureUnit),
    queryFn: async () => {
      const { forecast } = await fetchCompleteWeatherData(location, days, temperatureUnit);
      return forecast.slice(0, days);
    },
    enabled: !!location && (options.enabled ?? true),
    staleTime: 0, // No caching - always fetch fresh
    gcTime: 0, // No caching
    refetchOnMount: lifecycle.refetchOnMount,
    refetchOnWindowFocus: lifecycle.refetchOnWindowFocus,
    refetchOnReconnect: lifecycle.refetchOnReconnect,
    retry: options.retry ?? retryStrategy.shouldRetry,
    retryDelay: options.retryDelay ?? retryStrategy.getDelay,
    refetchInterval,
    refetchIntervalInBackground: options.refetchIntervalInBackground ?? false,
    meta: {
      staleWhileRevalidate: lifecycle.swrEnabled,
      autoRefresh: autoRefreshEnabled,
    },
  });
};

/**
 * Hook for fetching complete weather data (current + forecast)
 */
export const useCompleteWeatherQuery = (
  location: string,
  forecastDays: number = 7,
  options: CompleteWeatherQueryOptions = {}
) => {
  const autoRefreshEnabled = options.autoRefresh ?? true;
  const refetchInterval = resolveWeatherRefetchInterval({
    autoRefresh: autoRefreshEnabled,
    autoRefreshIntervalMs: options.autoRefreshIntervalMs,
    minAutoRefreshGapMs: options.minAutoRefreshGapMs,
    maxAutoRefreshIntervalMs: options.maxAutoRefreshIntervalMs,
    refetchInterval: options.refetchInterval,
  });

  const lifecycle = resolveStaleWhileRevalidateConfig(options, {
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const temperatureUnit: TemperatureUnit = options.temperatureUnit ?? 'celsius';
  const retryStrategy = createWeatherRetryStrategy({ autoRefresh: autoRefreshEnabled });

  return useQuery({
    queryKey: [...queryKeys.weather.current(location, temperatureUnit), 'complete', forecastDays],
    queryFn: async () => {
      const result = await fetchCompleteWeatherData(location, forecastDays, temperatureUnit);
      return {
        current: result.current,
        forecast: result.forecast.slice(0, forecastDays),
      };
    },
    enabled: !!location && (options.enabled ?? true),
    staleTime: 0, // No caching - always fetch fresh
    gcTime: 0, // No caching
    refetchOnMount: lifecycle.refetchOnMount,
    refetchOnWindowFocus: lifecycle.refetchOnWindowFocus,
    refetchOnReconnect: lifecycle.refetchOnReconnect,
    retry: options.retry ?? retryStrategy.shouldRetry,
    retryDelay: options.retryDelay ?? retryStrategy.getDelay,
    refetchInterval,
    refetchIntervalInBackground: options.refetchIntervalInBackground ?? false,
    meta: {
      staleWhileRevalidate: lifecycle.swrEnabled,
      autoRefresh: autoRefreshEnabled,
    },
  });
};

/**
 * Hook for geocoding (searching cities)
 */
export const useGeocodingQuery = (
  query: string,
  options: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
    retry?: boolean | number;
    retryDelay?: number;
  } = {}
) => {
  return useQuery({
    queryKey: queryKeys.geocoding.search(query),
    queryFn: () => searchCities(query),
    enabled: !!query.trim() && (options.enabled ?? true),
    staleTime: 0, // No caching - always fetch fresh
    gcTime: 0, // No caching
    retry: options.retry ?? 2,
    retryDelay:
      options.retryDelay ??
      function (attemptIndex: number) {
        return Math.min(1000 * 2 ** attemptIndex, 10000);
      },
  });
};

/**
 * Hook for reverse geocoding (coordinates to location name)
 */
export const useReverseGeocodingQuery = (
  latitude: number,
  longitude: number,
  options: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
    retry?: boolean | number;
    retryDelay?: number;
  } = {}
) => {
  return useQuery({
    queryKey: queryKeys.geocoding.reverse(latitude, longitude),
    queryFn: () => fetchGeocodingData(`${latitude},${longitude}`),
    enabled: !!latitude && !!longitude && (options.enabled ?? true),
    staleTime: 0, // No caching - always fetch fresh
    gcTime: 0, // No caching
    retry: options.retry ?? 2,
    retryDelay:
      options.retryDelay ??
      function (attemptIndex: number) {
        return Math.min(1000 * 2 ** attemptIndex, 10000);
      },
  });
};

/**
 * Hook for refreshing weather data
 */
export const useRefreshWeather = () => {
  const queryClient = useQueryClient();

  const refreshWeather = async (location: string, temperatureUnit?: TemperatureUnit) => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.weather.all,
      predicate: query => {
        const key = query.queryKey;
        if (!Array.isArray(key) || key[0] !== 'weather') {
          return false;
        }

        const normalizedLocation = location.toLocaleLowerCase();
        const matchesLocation = key.some(part => {
          if (typeof part !== 'string') {
            return false;
          }
          return part.toLocaleLowerCase() === normalizedLocation;
        });

        if (!matchesLocation) {
          return false;
        }

        if (!temperatureUnit) {
          return true;
        }

        return key.some(part => part === temperatureUnit);
      },
    });
  };

  const refreshAllWeather = async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.weather.all,
    });
  };

  return { refreshWeather, refreshAllWeather };
};

/**
 * Hook for prefetching weather data
 */
export const usePrefetchWeather = () => {
  const queryClient = useQueryClient();

  const prefetchWeather = async (
    location: string,
    temperatureUnit: TemperatureUnit = 'celsius'
  ) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.weather.current(location, temperatureUnit),
      queryFn: async () => {
        const { current } = await fetchCompleteWeatherData(location, 7, temperatureUnit);
        return current;
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  const prefetchForecast = async (
    location: string,
    days: number = 7,
    temperatureUnit: TemperatureUnit = 'celsius'
  ) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.weather.forecast(location, days, temperatureUnit),
      queryFn: async () => {
        const { forecast } = await fetchCompleteWeatherData(location, days, temperatureUnit);
        return forecast.slice(0, days);
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  return { prefetchWeather, prefetchForecast };
};

/**
 * Hook for optimistic weather updates
 */
export const useOptimisticWeatherUpdate = () => {
  const queryClient = useQueryClient();

  const updateWeatherOptimistically = (
    location: string,
    updateFn: (oldData: CurrentWeatherData) => CurrentWeatherData,
    temperatureUnit: TemperatureUnit = 'celsius'
  ) => {
    queryClient.setQueryData(queryKeys.weather.current(location, temperatureUnit), updateFn);
  };

  const updateForecastOptimistically = (
    location: string,
    days: number,
    updateFn: (oldData: ForecastDay[]) => ForecastDay[],
    temperatureUnit: TemperatureUnit = 'celsius'
  ) => {
    queryClient.setQueryData(queryKeys.weather.forecast(location, days, temperatureUnit), updateFn);
  };

  return { updateWeatherOptimistically, updateForecastOptimistically };
};

/**
 * Hook for weather data mutations
 */
export const useWeatherMutation = () => {
  const queryClient = useQueryClient();

  type RefetchWeatherInput =
    | string
    | {
        location: string;
        temperatureUnit?: TemperatureUnit;
        forecastDays?: number;
      };

  const normalizeInput = (input: RefetchWeatherInput) => {
    if (typeof input === 'string') {
      return {
        location: input,
        temperatureUnit: 'celsius' as TemperatureUnit,
        forecastDays: 7,
      } as const;
    }

    return {
      location: input.location,
      temperatureUnit: input.temperatureUnit ?? ('celsius' as TemperatureUnit),
      forecastDays: input.forecastDays ?? 7,
    } as const;
  };

  const refetchWeather = useMutation({
    mutationFn: async (variables: RefetchWeatherInput) => {
      const { location, temperatureUnit, forecastDays } = normalizeInput(variables);
      return fetchCompleteWeatherData(location, forecastDays, temperatureUnit);
    },
    onSuccess: (data, variables) => {
      const { location, temperatureUnit, forecastDays } = normalizeInput(variables);

      queryClient.setQueryData(queryKeys.weather.current(location, temperatureUnit), data.current);

      queryClient.setQueryData(
        queryKeys.weather.forecast(location, forecastDays, temperatureUnit),
        data.forecast.slice(0, forecastDays)
      );

      queryClient.setQueryData(
        [...queryKeys.weather.current(location, temperatureUnit), 'complete', forecastDays],
        {
          current: data.current,
          forecast: data.forecast.slice(0, forecastDays),
        }
      );

      void queryClient.invalidateQueries({
        queryKey: queryKeys.weather.all,
        predicate: query => {
          const key = query.queryKey;
          if (!Array.isArray(key) || key[0] !== 'weather') {
            return false;
          }

          const normalizedLocation = location.toLocaleLowerCase();
          const matchesLocation = key.some(part => {
            if (typeof part !== 'string') {
              return false;
            }
            return part.toLocaleLowerCase() === normalizedLocation;
          });

          if (!matchesLocation) {
            return false;
          }

          return key.some(part => part === temperatureUnit);
        },
      });
    },
    onError: (error, variables) => {
      const { location } = normalizeInput(variables);
      console.error(`Failed to refetch weather data for ${location}:`, error);
    },
  });

  return { refetchWeather };
};

/**
 * Hook for getting cached weather data
 */
export const useCachedWeather = (
  location: string,
  temperatureUnit: TemperatureUnit = 'celsius'
) => {
  const queryClient = useQueryClient();

  const getCachedWeather = useCallback(() => {
    return queryClient.getQueryData<CurrentWeatherData>(
      queryKeys.weather.current(location, temperatureUnit)
    );
  }, [queryClient, location, temperatureUnit]);

  const getCachedForecast = useCallback(
    (days: number = 7) => {
      return queryClient.getQueryData<ForecastDay[]>(
        queryKeys.weather.forecast(location, days, temperatureUnit)
      );
    },
    [queryClient, location, temperatureUnit]
  );

  const hasCachedWeather = useCallback(() => {
    return (
      queryClient.getQueryState(queryKeys.weather.current(location, temperatureUnit))?.status ===
      'success'
    );
  }, [queryClient, location, temperatureUnit]);

  return { getCachedWeather, getCachedForecast, hasCachedWeather };
};
