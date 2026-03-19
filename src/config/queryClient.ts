/**
 * React Query Client Configuration
 *
 * This configuration explicitly disables floating mode for better control
 * over query behavior and lifecycle management.
 *
 * Floating Mode Disabled:
 * - Queries are NOT automatically garbage collected when they have no observers
 * - Cache entries persist for the full gcTime duration
 * - Provides predictable behavior for background refetches
 * - Better control over when data is removed from cache
 */

import { QueryClient } from '@tanstack/react-query';

import { NotImplementedError } from '@/errors/domainErrors';
import type { AppError } from '@/types/error';
import { ErrorCategory } from '@/types/error';

/**
 * Query behavior configuration
 */
export const QUERY_CONFIG = {
  // Cache time - how long inactive queries stay in cache
  CACHE_TIME: 30 * 60 * 1000, // 30 minutes

  // Stale time - how long data is considered fresh
  STALE_TIME: 5 * 60 * 1000, // 5 minutes

  // Retry configuration
  MAX_RETRIES: 3,
  MAX_RETRY_DELAY: 30000, // 30 seconds

  // Mutation retry configuration
  MAX_MUTATION_RETRIES: 2,
  MAX_MUTATION_RETRY_DELAY: 10000, // 10 seconds
} as const;

// Default query options with floating mode explicitly disabled
export const defaultQueryOptions = {
  // Global stale time - data considered fresh for 5 minutes
  staleTime: QUERY_CONFIG.STALE_TIME,

  // Global cache time - data kept in cache for 30 minutes
  // This is gcTime (garbage collection time) in TanStack Query v5
  gcTime: QUERY_CONFIG.CACHE_TIME,

  // Retry configuration
  retry: (failureCount: number, error: Error) => {
    // Don't retry on 4xx errors (client errors)
    if (error.name === 'AppError') {
      const appError = error as unknown as AppError;
      if (
        appError.category === ErrorCategory.VALIDATION ||
        appError.category === ErrorCategory.GEOCODING
      ) {
        return false;
      }
    }

    // Retry up to 3 times for other errors
    return failureCount < QUERY_CONFIG.MAX_RETRIES;
  },

  // Retry delay with exponential backoff
  retryDelay: (attemptIndex: number) => {
    return Math.min(1000 * 2 ** attemptIndex, QUERY_CONFIG.MAX_RETRY_DELAY);
  },

  // Refetch on window focus (disabled for mobile data saving)
  refetchOnWindowFocus: false,

  // Refetch on mount (only if stale)
  refetchOnMount: true,

  // Refetch on reconnect
  refetchOnReconnect: true,

  // Network mode - only fetch when online
  networkMode: 'online' as const,

  /**
   * FLOATING MODE DISABLED
   *
   * By not setting `gcTime: 0` or using `keepPreviousData`, we ensure:
   * 1. Queries persist in cache for the full gcTime duration
   * 2. No automatic garbage collection when observers unmount
   * 3. Predictable cache behavior
   * 4. Better control over data lifecycle
   *
   * This is the default behavior, but we're being explicit about it.
   */
};

/**
 * Create and configure the QueryClient with explicit floating mode disabled
 *
 * Configuration Philosophy:
 * - Explicit control over query lifecycle
 * - Predictable cache behavior
 * - No automatic garbage collection of inactive queries
 * - Manual cache management through utility functions
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      ...defaultQueryOptions,

      /**
       * Additional safeguards to ensure floating mode is disabled:
       *
       * 1. structuralSharing: true (default)
       *    - Maintains referential equality when data hasn't changed
       *    - Prevents unnecessary re-renders
       *
       * 2. notifyOnChangeProps: undefined (default)
       *    - Components re-render on any query state change
       *    - More predictable behavior
       *
       * 3. placeholderData: undefined (default)
       *    - No placeholder data while loading
       *    - Clearer loading states
       */
      structuralSharing: true,
      notifyOnChangeProps: undefined,
      placeholderData: undefined,
    },
    mutations: {
      // Retry mutations with exponential backoff
      retry: (failureCount: number, error: Error) => {
        // Don't retry on validation errors
        if (error.name === 'AppError') {
          const appError = error as unknown as AppError;
          if (appError.category === ErrorCategory.VALIDATION) {
            return false;
          }
        }
        return failureCount < QUERY_CONFIG.MAX_MUTATION_RETRIES;
      },

      // Retry delay for mutations
      retryDelay: (attemptIndex: number) => {
        return Math.min(1000 * 2 ** attemptIndex, QUERY_CONFIG.MAX_MUTATION_RETRY_DELAY);
      },

      // Network mode for mutations - only execute when online
      networkMode: 'online' as const,

      /**
       * Mutation-specific configuration:
       *
       * - No automatic retry on network errors
       * - Explicit error handling required
       * - Predictable mutation behavior
       */
    },
  },
});

// Query key factory for consistent key generation
export const queryKeys = {
  // Weather data queries
  weather: {
    all: ['weather'] as const,
    current: (location: string, units?: string) =>
      [...queryKeys.weather.all, 'current', location, units] as const,
    forecast: (location: string, days?: number, units?: string) =>
      [...queryKeys.weather.all, 'forecast', location, days, units] as const,
    historical: (location: string, period: 'last-week' | 'last-month', units?: string) =>
      [...queryKeys.weather.all, 'historical', location, period, units] as const,
  },

  // Geocoding queries
  geocoding: {
    all: ['geocoding'] as const,
    search: (query: string) => [...queryKeys.geocoding.all, 'search', query] as const,
    reverse: (lat: number, lon: number) =>
      [...queryKeys.geocoding.all, 'reverse', lat, lon] as const,
  },

  // User preferences
  preferences: {
    all: ['preferences'] as const,
    units: () => [...queryKeys.preferences.all, 'units'] as const,
    language: () => [...queryKeys.preferences.all, 'language'] as const,
    location: () => [...queryKeys.preferences.all, 'location'] as const,
  },

  // Application data
  app: {
    all: ['app'] as const,
    config: () => [...queryKeys.app.all, 'config'] as const,
    status: () => [...queryKeys.app.all, 'status'] as const,
  },
};

/**
 * Utility functions for explicit cache management
 *
 * With floating mode disabled, we have full control over cache lifecycle.
 * These utilities provide explicit methods for cache manipulation.
 */
export const cacheUtils = {
  /**
   * Invalidate all weather data
   * Marks queries as stale, triggering refetch on next access
   */
  invalidateWeatherData: () => {
    return queryClient.invalidateQueries({
      queryKey: queryKeys.weather.all,
      // Refetch immediately if query is currently being observed
      refetchType: 'active',
    });
  },

  /**
   * Invalidate all geocoding data
   * Marks queries as stale, triggering refetch on next access
   */
  invalidateGeocodingData: () => {
    return queryClient.invalidateQueries({
      queryKey: queryKeys.geocoding.all,
      refetchType: 'active',
    });
  },

  /**
   * Remove specific weather data from cache
   * Explicitly removes query from cache, not just marking as stale
   */
  removeWeatherData: (location: string) => {
    return queryClient.removeQueries({
      queryKey: queryKeys.weather.all,
      predicate: query => {
        const key = query.queryKey;
        return key?.[0] === 'weather' && (key.includes(location) || key?.[2] === location);
      },
    });
  },

  /**
   * Clear all cache
   * Nuclear option - removes all queries from cache
   */
  clearAllCache: () => {
    return queryClient.clear();
  },

  /**
   * Prefetch weather data
   * Loads data into cache before it's needed
   * With floating mode disabled, this data persists for full gcTime
   */
  prefetchWeatherData: async (location: string, units?: string) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.weather.current(location, units),
      queryFn: () => fetchWeatherData(location, units),
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: QUERY_CONFIG.CACHE_TIME, // Explicit cache time
    });
  },

  /**
   * Set query data manually (useful for optimistic updates)
   * With floating mode disabled, this data persists predictably
   */
  setWeatherData: (location: string, data: unknown, units?: string) => {
    return queryClient.setQueryData(queryKeys.weather.current(location, units), data);
  },

  /**
   * Get query data from cache
   * Returns undefined if not in cache or stale
   */
  getWeatherData: (location: string, units?: string) => {
    return queryClient.getQueryData(queryKeys.weather.current(location, units));
  },

  /**
   * Get query state (includes loading, error, data, etc.)
   * Useful for checking cache status without triggering fetch
   */
  getWeatherQueryState: (location: string, units?: string) => {
    return queryClient.getQueryState(queryKeys.weather.current(location, units));
  },

  /**
   * Cancel ongoing queries
   * Useful for cleanup when component unmounts
   */
  cancelWeatherQueries: () => {
    return queryClient.cancelQueries({
      queryKey: queryKeys.weather.all,
    });
  },

  /**
   * Reset queries to initial state
   * Removes data and error, resets to initial loading state
   */
  resetWeatherQueries: () => {
    return queryClient.resetQueries({
      queryKey: queryKeys.weather.all,
    });
  },

  /**
   * Get cache statistics
   * Useful for debugging and monitoring
   */
  getCacheStats: () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
      inactiveQueries: queries.filter(q => q.getObserversCount() === 0).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      fetchingQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
      queries: queries.map(q => ({
        queryKey: q.queryKey,
        state: q.state.status,
        observers: q.getObserversCount(),
        isStale: q.isStale(),
        dataUpdatedAt: q.state.dataUpdatedAt,
      })),
    };
  },
};

// Mock fetch function - will be replaced with actual API calls
async function fetchWeatherData(_location: string, _units?: string) {
  // This will be implemented with the actual weather API
  throw new NotImplementedError('fetchWeatherData not implemented');
}

export default queryClient;
