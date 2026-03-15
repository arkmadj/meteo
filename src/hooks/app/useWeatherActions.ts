/**
 * Custom hook for weather-related actions and event handlers
 * Provides memoized event handlers for weather interactions
 */

import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DEBOUNCE_DELAY } from '@/constants/api';
import { useError } from '@/contexts/ErrorContext';
import { useRefreshWeather } from '@/hooks/useWeatherQuery';
import { ErrorCategory, ErrorSeverity, ErrorType } from '@/types/error';
import debounce from '@/utils/debounce';

import type { WeatherStateHook } from './useWeatherState';

export interface WeatherActionsHook {
  debouncedSearch: (searchTerm: string) => void;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearch: (e?: React.FormEvent | React.KeyboardEvent) => void;
  handleRefresh: () => Promise<void>;
  toggleTemperatureUnit: () => void;
}

export const useWeatherActions = (weatherState: WeatherStateHook): WeatherActionsHook => {
  const { t } = useTranslation(['errors']);
  const { addError } = useError();
  const { refreshWeather } = useRefreshWeather();

  const { query, setQuery, setSearchQuery, setError, isCelsius, setIsCelsius, searchQuery } =
    weatherState;

  const temperatureUnit = isCelsius ? 'celsius' : 'fahrenheit';

  // Debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((searchTerm: string) => {
        if (searchTerm.trim()) {
          setSearchQuery(searchTerm);
          setError(null);
        }
      }, DEBOUNCE_DELAY),
    [setSearchQuery, setError]
  );

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      debouncedSearch(value);
    },
    [setQuery, debouncedSearch]
  );

  // Handle search submission
  const handleSearch = useCallback(
    (e?: React.FormEvent | React.KeyboardEvent) => {
      e?.preventDefault();
      if (query.trim()) {
        setSearchQuery(query);
        setError(null);
      }
    },
    [query, setSearchQuery, setError]
  );

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    try {
      await refreshWeather(searchQuery, temperatureUnit);
    } catch {
      addError({
        id: `refresh-${Date.now()}`,
        type: ErrorType.NETWORK_ERROR,
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        message: t('errors:messages.refreshFailed'),
        userMessage: t('errors:messages.refreshFailed'),
        retryable: true,
        timestamp: Date.now(),
      });
    }
  }, [searchQuery, refreshWeather, addError, t, temperatureUnit]);

  // Toggle temperature unit with smooth transition
  const toggleTemperatureUnit = useCallback(() => {
    // Add slight delay for smooth visual feedback
    setTimeout(() => {
      setIsCelsius(!isCelsius);
    }, 50);
  }, [isCelsius, setIsCelsius]);

  return {
    debouncedSearch,
    handleSearchChange,
    handleSearch,
    handleRefresh,
    toggleTemperatureUnit,
  };
};
