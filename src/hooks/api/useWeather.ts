/**
 * Weather API Hooks
 *
 * Demonstrates best practices for React Query integration with TypeScript,
 * including proper error handling, caching strategies, and optimistic updates.
 */

import type { UseQueryOptions } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { WeatherService } from '../../api/services/weatherService';
import type {
  ApiError,
  CurrentWeather,
  ForecastRequestParams,
  HistoricalWeather,
  HistoricalWeatherParams,
  LocationSearchParams,
  LocationSearchResult,
  WeatherForecast,
  WeatherRequestParams,
} from '../../api/types/weather';

// Query key factory for consistent cache management
export const weatherKeys = {
  all: ['weather'] as const,
  current: () => [...weatherKeys.all, 'current'] as const,
  currentByLocation: (location: string, units?: string) =>
    [...weatherKeys.current(), location, units] as const,
  forecast: () => [...weatherKeys.all, 'forecast'] as const,
  forecastByLocation: (location: string, params?: Partial<ForecastRequestParams>) =>
    [...weatherKeys.forecast(), location, params] as const,
  search: () => [...weatherKeys.all, 'search'] as const,
  searchByQuery: (query: string, params?: Partial<LocationSearchParams>) =>
    [...weatherKeys.search(), query, params] as const,
  historical: () => [...weatherKeys.all, 'historical'] as const,
  historicalByLocation: (location: string, date: string, units?: string) =>
    [...weatherKeys.historical(), location, date, units] as const,
  batch: () => [...weatherKeys.all, 'batch'] as const,
  batchByLocations: (locations: string[], units?: string) =>
    [...weatherKeys.batch(), locations.sort(), units] as const,
};

// Default query options for weather data
const defaultWeatherQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  retry: (failureCount: number, error: ApiError) => {
    // Don't retry on client errors (4xx)
    if (error.status >= 400 && error.status < 500) {
      return false;
    }
    // Retry up to 3 times for server errors
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

/**
 * Hook for fetching current weather data
 */
export function useCurrentWeather(
  params: WeatherRequestParams,
  options?: Partial<UseQueryOptions<CurrentWeather, ApiError>>
) {
  return useQuery({
    queryKey: weatherKeys.currentByLocation(params.location, params.units),
    queryFn: () => WeatherService.getCurrentWeather(params),
    enabled: Boolean(params.location?.trim()),
    ...defaultWeatherQueryOptions,
    ...options,
  });
}

/**
 * Hook for fetching weather forecast
 */
export function useWeatherForecast(
  params: ForecastRequestParams,
  options?: Partial<UseQueryOptions<WeatherForecast, ApiError>>
) {
  return useQuery({
    queryKey: weatherKeys.forecastByLocation(params.location, params),
    queryFn: () => WeatherService.getForecast(params),
    enabled: Boolean(params.location?.trim()),
    ...defaultWeatherQueryOptions,
    ...options,
  });
}

/**
 * Hook for searching locations with debouncing
 */
export function useLocationSearch(
  params: LocationSearchParams,
  options?: Partial<UseQueryOptions<LocationSearchResult[], ApiError>>
) {
  return useQuery({
    queryKey: weatherKeys.searchByQuery(params.query, params),
    queryFn: () => WeatherService.searchLocations(params),
    enabled: Boolean(params.query?.trim() && params.query.length >= 2),
    staleTime: 0, // No caching - always fetch fresh
    gcTime: 0, // No caching
    ...options,
  });
}

/**
 * Hook for fetching historical weather data
 */
export function useHistoricalWeather(
  params: HistoricalWeatherParams,
  options?: Partial<UseQueryOptions<HistoricalWeather, ApiError>>
) {
  return useQuery({
    queryKey: weatherKeys.historicalByLocation(params.location, params.date, params.units),
    queryFn: () => WeatherService.getHistoricalWeather(params),
    enabled: Boolean(params.location?.trim() && params.date),
    staleTime: 60 * 60 * 1000, // 1 hour for historical data
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    ...options,
  });
}

/**
 * Hook for batch weather requests
 */
export function useBatchWeather(
  locations: string[],
  units?: 'metric' | 'imperial',
  options?: Partial<UseQueryOptions<CurrentWeather[], ApiError>>
) {
  return useQuery({
    queryKey: weatherKeys.batchByLocations(locations, units),
    queryFn: () => WeatherService.getBatchWeather(locations, units),
    enabled: locations.length > 0 && locations.length <= 10,
    ...defaultWeatherQueryOptions,
    ...options,
  });
}

/**
 * Mutation hook for refreshing weather data
 */
export function useRefreshWeather() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: WeatherRequestParams) => {
      // Invalidate existing data first
      await queryClient.invalidateQueries({
        queryKey: weatherKeys.currentByLocation(params.location, params.units),
      });

      // Fetch fresh data
      return WeatherService.getCurrentWeather(params);
    },
    onSuccess: (data, params) => {
      // Update cache with fresh data
      queryClient.setQueryData(weatherKeys.currentByLocation(params.location, params.units), data);
    },
  });
}

/**
 * Hook for prefetching weather data
 */
export function usePrefetchWeather() {
  const queryClient = useQueryClient();

  const prefetchCurrent = async (params: WeatherRequestParams) => {
    await queryClient.prefetchQuery({
      queryKey: weatherKeys.currentByLocation(params.location, params.units),
      queryFn: () => WeatherService.getCurrentWeather(params),
      ...defaultWeatherQueryOptions,
    });
  };

  const prefetchForecast = async (params: ForecastRequestParams) => {
    await queryClient.prefetchQuery({
      queryKey: weatherKeys.forecastByLocation(params.location, params),
      queryFn: () => WeatherService.getForecast(params),
      ...defaultWeatherQueryOptions,
    });
  };

  return { prefetchCurrent, prefetchForecast };
}

/**
 * Hook for managing weather data cache
 */
export function useWeatherCache() {
  const queryClient = useQueryClient();

  const clearWeatherCache = () => {
    queryClient.removeQueries({ queryKey: weatherKeys.all });
  };

  const clearLocationCache = (location: string) => {
    queryClient.removeQueries({
      predicate: query => {
        const queryKey = query.queryKey;
        return queryKey.includes('weather') && queryKey.includes(location);
      },
    });
  };

  const getWeatherFromCache = (location: string, units?: string): CurrentWeather | undefined => {
    return queryClient.getQueryData(weatherKeys.currentByLocation(location, units));
  };

  const setWeatherInCache = (location: string, data: CurrentWeather, units?: string) => {
    queryClient.setQueryData(weatherKeys.currentByLocation(location, units), data);
  };

  return {
    clearWeatherCache,
    clearLocationCache,
    getWeatherFromCache,
    setWeatherInCache,
  };
}

/**
 * Hook for weather data with automatic background refetch
 */
export function useWeatherWithAutoRefresh(
  params: WeatherRequestParams,
  refreshInterval = 5 * 60 * 1000 // 5 minutes
) {
  return useQuery({
    queryKey: weatherKeys.currentByLocation(params.location, params.units),
    queryFn: () => WeatherService.getCurrentWeather(params),
    enabled: Boolean(params.location?.trim()),
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: true,
    ...defaultWeatherQueryOptions,
  });
}

/**
 * Hook for optimistic weather updates (useful for user preferences)
 */
export function useOptimisticWeatherUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      location: _location,
      updates,
    }: {
      location: string;
      updates: Partial<CurrentWeather>;
    }) => {
      // Simulate API call for user preference updates
      await new Promise(resolve => setTimeout(resolve, 1000));
      return updates;
    },

    onMutate: async ({ location, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: weatherKeys.currentByLocation(location),
      });

      // Snapshot previous value
      const previousWeather = queryClient.getQueryData<CurrentWeather>(
        weatherKeys.currentByLocation(location)
      );

      // Optimistically update
      if (previousWeather) {
        queryClient.setQueryData<CurrentWeather>(weatherKeys.currentByLocation(location), {
          ...previousWeather,
          ...updates,
        });
      }

      return { previousWeather };
    },

    onError: (error, { location }, context) => {
      // Rollback on error
      if (context?.previousWeather) {
        queryClient.setQueryData(weatherKeys.currentByLocation(location), context.previousWeather);
      }
    },

    onSettled: (data, error, { location }) => {
      // Always refetch after mutation
      void queryClient.invalidateQueries({
        queryKey: weatherKeys.currentByLocation(location),
      });
    },
  });
}

/**
 * Custom hook for handling weather API errors
 */
export function useWeatherErrorHandler() {
  const handleWeatherError = (error: ApiError, context?: string) => {
    const errorMessage = getWeatherErrorMessage(error);

    // Log error for monitoring
    console.error(`Weather API Error${context ? ` (${context})` : ''}:`, {
      message: error.message,
      status: error.status,
      code: error.code,
      details: error.details,
    });

    // You can integrate with toast notifications here
    // toast.error(errorMessage);

    return errorMessage;
  };

  return { handleWeatherError };
}

// Helper function for user-friendly error messages
function getWeatherErrorMessage(error: ApiError): string {
  switch (error.status) {
    case 400:
      return 'Invalid location or parameters. Please check your input.';
    case 401:
      return 'API key is invalid or missing. Please check your configuration.';
    case 403:
      return 'Access denied. Your API plan may not support this feature.';
    case 404:
      return 'Location not found. Please try a different search term.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Weather service is temporarily unavailable. Please try again later.';
    case 0:
      return 'Network connection failed. Please check your internet connection.';
    default:
      return error.message || 'An unexpected error occurred while fetching weather data.';
  }
}
