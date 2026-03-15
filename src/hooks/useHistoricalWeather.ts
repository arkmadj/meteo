/**
 * Custom hook for fetching historical weather data using React Query
 *
 * Provides last-week and last-month weather comparisons for a location.
 */

import { useQuery, useQueries, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys, QUERY_CONFIG } from '@/config/queryClient';
import type { TemperatureUnit } from '@/services/weatherService';
import { fetchHistoricalWeatherData } from '@/services/weatherService';
import type { HistoricalPeriod, HistoricalWeatherData } from '@/types/weather';

/**
 * Options for useHistoricalWeather hook
 */
export interface UseHistoricalWeatherOptions {
  /** Temperature unit for the data */
  temperatureUnit?: TemperatureUnit;
  /** Whether the query should be enabled */
  enabled?: boolean;
  /** Stale time override in milliseconds */
  staleTime?: number;
}

/**
 * Hook for fetching historical weather data for a specific period
 */
export function useHistoricalWeather(
  location: string,
  period: HistoricalPeriod,
  options: UseHistoricalWeatherOptions = {}
): UseQueryResult<HistoricalWeatherData, Error> {
  const { temperatureUnit = 'celsius', enabled = true, staleTime } = options;

  return useQuery({
    queryKey: queryKeys.weather.historical(location, period, temperatureUnit),
    queryFn: () => fetchHistoricalWeatherData(location, period, temperatureUnit),
    enabled: enabled && Boolean(location?.trim()),
    staleTime: staleTime ?? QUERY_CONFIG.STALE_TIME * 2, // Historical data changes less frequently
    gcTime: QUERY_CONFIG.CACHE_TIME,
    retry: (failureCount, error) => {
      // Don't retry on 4xx client errors
      if (error.message?.includes('404') || error.message?.includes('Location not found')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

/**
 * Result type for useHistoricalWeatherComparison
 */
export interface HistoricalWeatherComparisonResult {
  lastWeek: UseQueryResult<HistoricalWeatherData, Error>;
  lastMonth: UseQueryResult<HistoricalWeatherData, Error>;
  isLoading: boolean;
  isError: boolean;
  hasAnyData: boolean;
}

/**
 * Hook for fetching both last-week and last-month historical data
 * Useful for comparison views
 */
export function useHistoricalWeatherComparison(
  location: string,
  options: UseHistoricalWeatherOptions = {}
): HistoricalWeatherComparisonResult {
  const { temperatureUnit = 'celsius', enabled = true } = options;

  const queries = useQueries({
    queries: [
      {
        queryKey: queryKeys.weather.historical(location, 'last-week', temperatureUnit),
        queryFn: () => fetchHistoricalWeatherData(location, 'last-week', temperatureUnit),
        enabled: enabled && Boolean(location?.trim()),
        staleTime: QUERY_CONFIG.STALE_TIME * 2,
        gcTime: QUERY_CONFIG.CACHE_TIME,
      },
      {
        queryKey: queryKeys.weather.historical(location, 'last-month', temperatureUnit),
        queryFn: () => fetchHistoricalWeatherData(location, 'last-month', temperatureUnit),
        enabled: enabled && Boolean(location?.trim()),
        staleTime: QUERY_CONFIG.STALE_TIME * 2,
        gcTime: QUERY_CONFIG.CACHE_TIME,
      },
    ],
  });

  const [lastWeekQuery, lastMonthQuery] = queries;

  return {
    lastWeek: lastWeekQuery as UseQueryResult<HistoricalWeatherData, Error>,
    lastMonth: lastMonthQuery as UseQueryResult<HistoricalWeatherData, Error>,
    isLoading: lastWeekQuery.isLoading || lastMonthQuery.isLoading,
    isError: lastWeekQuery.isError || lastMonthQuery.isError,
    hasAnyData: Boolean(lastWeekQuery.data || lastMonthQuery.data),
  };
}

/**
 * Utility function to calculate temperature change between current and historical
 */
export function calculateTemperatureChange(
  currentTemp: number,
  historicalAvgTemp: number
): { difference: number; trend: 'warmer' | 'cooler' | 'similar' } {
  const difference = currentTemp - historicalAvgTemp;
  const threshold = 2; // Temperature difference threshold in degrees

  let trend: 'warmer' | 'cooler' | 'similar';
  if (difference > threshold) {
    trend = 'warmer';
  } else if (difference < -threshold) {
    trend = 'cooler';
  } else {
    trend = 'similar';
  }

  return { difference, trend };
}

/**
 * Utility function to format historical period label
 */
export function formatHistoricalPeriodLabel(
  period: HistoricalPeriod,
  locale?: string
): string {
  const labels: Record<HistoricalPeriod, Record<string, string>> = {
    'last-week': {
      en: 'Last Week',
      es: 'Última Semana',
      fr: 'Semaine Dernière',
      de: 'Letzte Woche',
      ar: 'الأسبوع الماضي',
    },
    'last-month': {
      en: 'Last Month',
      es: 'Último Mes',
      fr: 'Mois Dernier',
      de: 'Letzter Monat',
      ar: 'الشهر الماضي',
    },
  };

  const lang = locale?.split('-')[0] || 'en';
  return labels[period][lang] || labels[period]['en'];
}

export default useHistoricalWeather;

