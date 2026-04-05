/**
 * Main App Component with React Query Integration
 */

import '@fortawesome/fontawesome-free/css/all.min.css';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useQueryClient } from '@tanstack/react-query';

import LanguageSelector from '@/components/language/LanguageSelector';
import SearchEngine from '@/components/search/SearchEngine';
import { LoadingWithSkeleton } from '@/components/ui';
import ErrorBoundary from '@/components/utilities/ErrorBoundary';
import ErrorDisplay from '@/components/utilities/ErrorDisplay';
import Forecast from '@/components/weather/Forecast';

import { queryKeys } from '@/config/queryClient';

import { DEBOUNCE_DELAY, DEFAULT_VALUES } from '@/constants/api';
import { CSS_CLASSES } from '@/constants/ui';
import { useError, useErrors } from '@/contexts/ErrorContext';
import { useUserPreferencesContext } from '@/contexts/UserPreferencesContext';
import { useTomorrowForecastPrefetch } from '@/hooks/useTomorrowForecastPrefetch';
import {
  useCompleteWeatherQuery,
  usePrefetchWeather,
  useRefreshWeather,
} from '@/hooks/useWeatherQuery';
import '@/i18n/config';
import { useDateI18n } from '@/i18n/hooks/useDateI18n';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { useWeatherI18n } from '@/i18n/hooks/useWeatherI18n';
import type { TemperatureUnit } from '@/services/weatherService';
import '@/styles.css';
import { ErrorCategory, ErrorSeverity, ErrorType } from '@/types/error';
import type { CurrentWeatherData, ForecastDay, WeatherState } from '@/types/weather';
import { DEFAULT_WEATHER_STATE } from '@/types/weather';
import debounce from '@/utils/debounce';

const DEFAULT_FORECAST_DAYS = 7;

const convertTemperatureValue = (
  value: number,
  sourceUnit: TemperatureUnit,
  targetUnit: TemperatureUnit
): number => {
  if (sourceUnit === targetUnit) {
    return value;
  }

  return targetUnit === 'fahrenheit' ? (value * 9) / 5 + 32 : ((value - 32) * 5) / 9;
};

const convertOptionalTemperatureValue = (
  value: number | null | undefined,
  sourceUnit: TemperatureUnit,
  targetUnit: TemperatureUnit
): number | undefined => {
  if (value == null) {
    return value ?? undefined;
  }

  return convertTemperatureValue(value, sourceUnit, targetUnit);
};

const convertCurrentWeatherData = (
  data: CurrentWeatherData,
  sourceUnit: TemperatureUnit,
  targetUnit: TemperatureUnit
): CurrentWeatherData => {
  if (sourceUnit === targetUnit) {
    return data;
  }

  return {
    ...data,
    temperature: {
      ...data.temperature,
      current: convertTemperatureValue(data.temperature.current, sourceUnit, targetUnit),
      feels_like: convertOptionalTemperatureValue(
        data.temperature.feels_like,
        sourceUnit,
        targetUnit
      ),
      max: convertOptionalTemperatureValue(data.temperature.max, sourceUnit, targetUnit),
      min: convertOptionalTemperatureValue(data.temperature.min, sourceUnit, targetUnit),
    },
  };
};

const convertForecastData = (
  forecast: ForecastDay[],
  sourceUnit: TemperatureUnit,
  targetUnit: TemperatureUnit
): ForecastDay[] => {
  if (sourceUnit === targetUnit) {
    return forecast;
  }

  return forecast.map(day => ({
    ...day,
    temperature: {
      ...day.temperature,
      minimum: convertTemperatureValue(day.temperature.minimum, sourceUnit, targetUnit),
      maximum: convertTemperatureValue(day.temperature.maximum, sourceUnit, targetUnit),
    },
  }));
};

const App = React.memo(() => {
  const { t } = useTranslation(['common', 'weather', 'errors']);
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();
  const { getWeatherDescription, getLocalizedTemperature } = useWeatherI18n();
  const { formatDate: _formatDate, formatWeekday } = useDateI18n();
  const { addError } = useError();
  const { getUpdateFrequencyInterval } = useUserPreferencesContext();
  const queryClient = useQueryClient();

  const errors = useErrors();

  // State management
  const [query, setQuery] = useState<string>(DEFAULT_VALUES.CITY);
  const [searchQuery, setSearchQuery] = useState<string>(DEFAULT_VALUES.CITY);
  const [isCelsius, setIsCelsius] = useState<boolean>(true);
  const [weather, setWeather] = useState<WeatherState>(DEFAULT_WEATHER_STATE);
  const temperatureUnit = isCelsius ? 'celsius' : 'fahrenheit';

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get user's preferred update frequency
  const userRefreshInterval = getUpdateFrequencyInterval();

  // React Query hooks
  const {
    data: weatherData,
    isLoading: isWeatherLoading,
    isError: isWeatherError,
    error: weatherError,
    isFetching: isWeatherFetching,
  } = useCompleteWeatherQuery(searchQuery, DEFAULT_FORECAST_DAYS, {
    enabled: !!searchQuery,
    staleWhileRevalidate: true,
    autoRefresh: userRefreshInterval !== false,
    temperatureUnit,
    refetchInterval: userRefreshInterval,
    minAutoRefreshGapMs: 2 * 60 * 1000,
    maxAutoRefreshIntervalMs: 30 * 60 * 1000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  }) as {
    data: { current: CurrentWeatherData; forecast: ForecastDay[] } | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    isFetching: boolean;
  };

  const { refreshWeather } = useRefreshWeather();
  const { prefetchWeather, prefetchForecast } = usePrefetchWeather();

  // Intelligent prefetching for tomorrow's forecast based on current-day views
  // This automatically prefetches tomorrow's data when user views current weather
  useTomorrowForecastPrefetch(
    searchQuery,
    temperatureUnit === 'celsius' ? 'celsius' : 'fahrenheit',
    {
      enabled: !!searchQuery && !isWeatherLoading,
      viewTimeThreshold: 2000, // Prefetch after 2 seconds of viewing
      respectDataSaver: true, // Don't prefetch if user has data-saver enabled
    }
  );

  // Debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((searchTerm: string) => {
        if (searchTerm.trim()) {
          setSearchQuery(searchTerm);
          setError(null);
        }
      }, DEBOUNCE_DELAY),
    []
  );

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
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
    [query]
  );

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    try {
      await refreshWeather(searchQuery, temperatureUnit);
    } catch {
      addError({
        id: `refresh-${Date.now()}`,
        type: ErrorType.NETWORK_ERROR,
        message: t('errors:messages.refreshFailed'),
        userMessage: t('errors:messages.refreshFailed'),
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        retryable: true,
        timestamp: Date.now(),
      });
    }
  }, [searchQuery, refreshWeather, addError, t, temperatureUnit]);

  // Toggle temperature unit with optimistic conversion
  const toggleTemperatureUnit = useCallback(() => {
    const nextUnit: TemperatureUnit = isCelsius ? 'fahrenheit' : 'celsius';
    const currentUnit: TemperatureUnit = temperatureUnit;
    const location = searchQuery;

    const forecastDays =
      weatherData?.forecast?.length ?? weather.forecast?.length ?? DEFAULT_FORECAST_DAYS;

    const nextCurrentKey = queryKeys.weather.current(location, nextUnit);
    let nextCurrent = queryClient.getQueryData<CurrentWeatherData>(nextCurrentKey);

    const sourceCurrent = weatherData?.current ?? (!weather.loading ? weather.data : undefined);

    if (!nextCurrent && sourceCurrent) {
      nextCurrent = convertCurrentWeatherData(sourceCurrent, currentUnit, nextUnit);
      queryClient.setQueryData(nextCurrentKey, nextCurrent);
    }

    const nextForecastKey = queryKeys.weather.forecast(location, forecastDays, nextUnit);
    let nextForecast = queryClient.getQueryData<ForecastDay[]>(nextForecastKey);
    const sourceForecast =
      weatherData?.forecast ?? (!weather.loading ? (weather.forecast ?? []) : []);

    if (!nextForecast && sourceForecast.length > 0) {
      nextForecast = convertForecastData(sourceForecast, currentUnit, nextUnit);
      queryClient.setQueryData(nextForecastKey, nextForecast);
    }

    if (nextCurrent) {
      queryClient.setQueryData([...nextCurrentKey, 'complete', forecastDays], {
        current: nextCurrent,
        forecast: nextForecast ?? [],
      });
    }

    if (nextCurrent || nextForecast) {
      setWeather(prev => ({
        ...prev,
        data: nextCurrent ?? prev.data,
        forecast: nextForecast ?? prev.forecast,
      }));
    }

    setIsCelsius(prev => !prev);

    if (location) {
      void prefetchWeather(location, nextUnit).catch(() => undefined);
      void prefetchForecast(location, forecastDays, nextUnit).catch(() => undefined);
      void refreshWeather(location, nextUnit).catch(() => undefined);
    }
  }, [
    isCelsius,
    temperatureUnit,
    searchQuery,
    weather,
    weatherData,
    queryClient,
    prefetchForecast,
    prefetchWeather,
    refreshWeather,
  ]);

  // Update weather state when data changes
  useEffect(() => {
    if (weatherData) {
      setWeather({
        loading: false,
        data: weatherData.current,
        forecast: weatherData.forecast,
      });
      setLoading(false);
      setError(null);
    }
  }, [weatherData]);

  // Handle loading states
  useEffect(() => {
    setLoading(isWeatherLoading);
  }, [isWeatherLoading]);

  // Handle errors
  useEffect(() => {
    if (isWeatherError && weatherError) {
      setError(weatherError.message || t('errors:messages.fetchFailed'));
      setLoading(false);
    }
  }, [isWeatherError, weatherError, t]);

  // Memoized values
  const memoizedWeather = useMemo(() => weather, [weather]);
  const memoizedLoading = useMemo(() => loading, [loading]);
  const memoizedError = useMemo(() => error, [error]);

  return (
    <div className="app">
      <div className="container">
        <header className={CSS_CLASSES.HEADER}>
          <h1 className="title">{t('common:title')}</h1>
          <p className="subtitle">{t('common:subtitle')}</p>
        </header>

        <ErrorBoundary>
          <main className="main">
            {/* Search Section */}
            <section className="search-section">
              <SearchEngine
                loading={isWeatherFetching}
                query={query}
                search={handleSearch}
                setQuery={setQuery}
                weather={weather}
                onSearchChange={handleSearchChange}
              />
            </section>

            {/* Error Display */}
            {errors.length > 0 && (
              <section className="error-section">
                <ErrorDisplay
                  error={errors[errors.length - 1]}
                  onDismiss={() => setError(null)}
                  onRetry={handleRefresh}
                />
              </section>
            )}

            {/* Weather Content */}
            <section className="weather-section">
              {memoizedLoading && !memoizedError && (
                <LoadingWithSkeleton
                  message={t('common:loading')}
                  showSkeleton={true}
                  variant="weather"
                />
              )}

              {!memoizedLoading && !memoizedError && memoizedWeather && (
                <Forecast
                  formatWeekday={(date, fmt) => formatWeekday(date, fmt)}
                  getLocalizedTemperature={temp =>
                    isCelsius
                      ? getLocalizedTemperature(temp, 'celsius')
                      : getLocalizedTemperature(temp, 'fahrenheit')
                  }
                  getLocalizedWeatherDescription={code => getWeatherDescription(code)}
                  temperatureUnit={isCelsius ? 'C' : 'F'}
                  toggleTemperatureUnit={toggleTemperatureUnit}
                  weather={memoizedWeather}
                />
              )}
            </section>

            {/* Language Selector */}
            <section className={CSS_CLASSES.LANGUAGE_SELECTOR}>
              <LanguageSelector
                changeLanguage={changeLanguage}
                currentLanguage={currentLanguage}
                supportedLanguages={supportedLanguages}
              />
            </section>
          </main>
        </ErrorBoundary>

        <footer className="footer">
          <p>{t('common:footer')}</p>
        </footer>
      </div>
    </div>
  );
});

App.displayName = 'App';

export default App;
