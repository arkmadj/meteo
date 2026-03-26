/**
 * Custom hook for weather-related side effects
 * Handles data fetching, error handling, intelligent prefetching,
 * and ARIA live region announcements for accessibility
 */

import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useCachedWeather, usePrefetchWeather, useRefreshWeather } from '@/hooks/useWeatherQuery';
import type { CurrentWeatherData, ForecastDay } from '@/types/weather';

import type { WeatherAnnouncement } from './useWeatherAnnouncement';
import { useWeatherAnnouncement } from './useWeatherAnnouncement';
import type { WeatherStateHook } from './useWeatherState';

export const BACKGROUND_REFRESH_STALE_THRESHOLD_MS = 3 * 60 * 1000;
const BACKGROUND_REFRESH_DEBOUNCE_MS = 750;

const isBrowserOnline = () => {
  if (typeof navigator === 'undefined' || typeof navigator.onLine === 'undefined') {
    return true;
  }

  return navigator.onLine;
};

export interface WeatherEffectsHook {
  /** Current ARIA announcement for screen readers */
  announcement: WeatherAnnouncement | null;
  /** Clear the current announcement */
  clearAnnouncement: () => void;
}

type WeatherQuerySnapshot = {
  data?: unknown;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  isFetching?: boolean;
  dataUpdatedAt?: number;
};

export const useWeatherEffects = (
  weatherState: WeatherStateHook,
  weatherQuery: WeatherQuerySnapshot
): WeatherEffectsHook => {
  const { t } = useTranslation(['errors']);
  const { prefetchWeather } = usePrefetchWeather();
  const { refreshWeather } = useRefreshWeather();

  // ARIA announcement hook for accessible weather updates
  const {
    currentAnnouncement,
    announceWeatherUpdate,
    announceError,
    announceOfflineStatus,
    clearAnnouncement,
  } = useWeatherAnnouncement({
    // Prevent rapid-fire announcements during background refreshes
    minAnnouncementInterval: 5000,
    debounceDelay: 2000,
    dedupeWindow: 60000, // Don't repeat same announcement within 1 minute
    temperatureChangeThreshold: 3, // Only announce if temp changes by 3+ degrees
    announceBackgroundRefresh: false, // Don't announce background refreshes
    announceInitialLoad: true,
  });

  const searchInitializedRef = useRef(false);
  const previousSearchRef = useRef<string | null>(null);
  const resumeRefreshRef = useRef(0);
  const isInitialLoadRef = useRef(true);

  const {
    setWeather,
    setLoading,
    setError,
    setOffline,
    searchQuery,
    isCelsius,
    weather: _weather,
  } = weatherState;
  const temperatureUnit = isCelsius ? 'celsius' : 'fahrenheit';

  const { getCachedWeather, getCachedForecast, hasCachedWeather } = useCachedWeather(
    searchQuery ?? '',
    temperatureUnit
  );

  const {
    data: weatherData,
    isLoading: isWeatherLoading,
    isError: isWeatherError,
    error: weatherError,
    isFetching: isWeatherFetching = false,
    dataUpdatedAt = 0,
  } = weatherQuery;

  // Update weather state when data changes and announce to screen readers
  useEffect(() => {
    if (weatherData) {
      const data = weatherData as { current: CurrentWeatherData; forecast: ForecastDay[] };
      setWeather({
        loading: false,
        data: data.current,
        forecast: data.forecast,
      });
      setLoading(false);
      setError(null);

      // Announce weather update for screen readers
      if (data.current && searchQuery) {
        const location = data.current.city || searchQuery;
        announceWeatherUpdate(data.current, location, isInitialLoadRef.current);
        isInitialLoadRef.current = false;
      }
      return;
    }

    if (!isWeatherError) {
      setLoading(false);
      setError(null);
    }
  }, [
    weatherData,
    isWeatherError,
    setWeather,
    setLoading,
    setError,
    searchQuery,
    announceWeatherUpdate,
  ]);

  // Track previous offline state to detect transitions
  const wasOfflineRef = useRef<boolean | null>(null);

  useEffect(() => {
    const updateOfflineState = () => {
      const online = isBrowserOnline();
      const offlineMessage = t('errors:messages.offlineUnavailable');
      const wasOffline = wasOfflineRef.current;

      setOffline(!online);

      if (!online && searchQuery) {
        const cachedCurrent = getCachedWeather();
        const cachedForecast = getCachedForecast(7);
        const hasCachedData =
          hasCachedWeather() || Boolean(cachedCurrent) || Boolean(cachedForecast?.length);

        if (hasCachedData) {
          if (cachedCurrent || cachedForecast?.length) {
            setWeather({
              loading: false,
              data: cachedCurrent ?? null,
              forecast: cachedForecast ?? [],
            });
          }

          setLoading(false);
          setError(null);

          // Announce offline status with cached data (only on transition)
          if (wasOffline !== true) {
            announceOfflineStatus(true, true);
          }
        } else {
          setLoading(false);
          setError(offlineMessage);

          // Announce offline status without cached data (only on transition)
          if (wasOffline !== true) {
            announceOfflineStatus(true, false);
          }
        }
      } else if (online && wasOffline === true) {
        // Announce back online (only on transition from offline to online)
        announceOfflineStatus(false);
      }

      wasOfflineRef.current = !online;
    };

    updateOfflineState();

    window.addEventListener('online', updateOfflineState);
    window.addEventListener('offline', updateOfflineState);

    return () => {
      window.removeEventListener('online', updateOfflineState);
      window.removeEventListener('offline', updateOfflineState);
    };
  }, [
    announceOfflineStatus,
    getCachedForecast,
    getCachedWeather,
    hasCachedWeather,
    searchQuery,
    setError,
    setLoading,
    setOffline,
    setWeather,
    t,
  ]);

  // Refresh weather when the app returns to focus after being idle
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    if (!searchQuery) {
      return;
    }

    const shouldTriggerRefresh = () => {
      if (!isBrowserOnline()) {
        return false;
      }

      if (isWeatherFetching) {
        return false;
      }

      if (!dataUpdatedAt) {
        return true;
      }

      const staleDuration = Date.now() - dataUpdatedAt;

      if (Number.isNaN(staleDuration)) {
        return true;
      }

      return staleDuration >= BACKGROUND_REFRESH_STALE_THRESHOLD_MS;
    };

    const triggerRefresh = () => {
      const now = Date.now();
      if (now - resumeRefreshRef.current < BACKGROUND_REFRESH_DEBOUNCE_MS) {
        return;
      }

      if (!shouldTriggerRefresh()) {
        return;
      }

      resumeRefreshRef.current = now;
      void refreshWeather(searchQuery, temperatureUnit).catch(() => undefined);
    };

    const handleFocus = () => {
      triggerRefresh();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        triggerRefresh();
      }
    };

    const handleReconnect = () => {
      triggerRefresh();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('online', handleReconnect);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('online', handleReconnect);
    };
  }, [dataUpdatedAt, isWeatherFetching, refreshWeather, searchQuery, temperatureUnit]);

  // Handle loading states
  useEffect(() => {
    setLoading(isWeatherLoading);
  }, [isWeatherLoading, setLoading]);

  // Handle errors and announce to screen readers
  useEffect(() => {
    if (!isWeatherError) {
      return;
    }

    const fallbackMessage = t('errors:messages.fetchFailed');
    const errorObj = weatherError as { message?: string } | null | undefined;
    const normalizedMessage =
      typeof errorObj?.message === 'string' && errorObj.message.trim().length > 0
        ? errorObj.message
        : fallbackMessage;

    setError(normalizedMessage);
    setLoading(false);

    // Announce error to screen readers
    announceError(normalizedMessage);
  }, [isWeatherError, weatherError, t, setError, setLoading, announceError]);
  // Invalidate cached weather whenever the user changes the active search
  useEffect(() => {
    if (!searchQuery) {
      previousSearchRef.current = null;
      return;
    }

    if (!searchInitializedRef.current) {
      searchInitializedRef.current = true;
      previousSearchRef.current = searchQuery;
      return;
    }

    if (previousSearchRef.current === searchQuery) {
      return;
    }

    previousSearchRef.current = searchQuery;

    void refreshWeather(searchQuery, temperatureUnit).catch(() => undefined);
  }, [refreshWeather, searchQuery, temperatureUnit]);

  // Prefetch weather data for common locations on mount
  useEffect(() => {
    if (!isBrowserOnline()) {
      return;
    }

    const commonLocations = ['London', 'New York', 'Tokyo', 'Paris', 'Sydney'];
    commonLocations.forEach(location => {
      void prefetchWeather(location, temperatureUnit);
    });
  }, [prefetchWeather, temperatureUnit]);

  // Return announcement state for the ARIA live region
  return {
    announcement: currentAnnouncement,
    clearAnnouncement,
  };
};
