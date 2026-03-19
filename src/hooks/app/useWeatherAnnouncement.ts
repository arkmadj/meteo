/**
 * useWeatherAnnouncement Hook
 *
 * Manages ARIA live region announcements for weather updates.
 * Prevents redundant or disruptive screen reader output by:
 * - Debouncing rapid updates
 * - Deduplicating identical announcements
 * - Prioritizing meaningful changes over minor data refreshes
 * - Using appropriate aria-live politeness levels
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { CurrentWeatherData } from '@/types/weather';
import { AnnouncementDebouncer, AnnouncementDeduplicator } from '@/utils/AnnouncementManager';

export interface WeatherAnnouncementConfig {
  /** Minimum interval between announcements in ms (default: 3000) */
  minAnnouncementInterval?: number;
  /** Debounce delay for rapid updates in ms (default: 1500) */
  debounceDelay?: number;
  /** Deduplication window in ms (default: 30000) */
  dedupeWindow?: number;
  /** Temperature change threshold to trigger announcement (default: 2) */
  temperatureChangeThreshold?: number;
  /** Whether to announce background refreshes (default: false) */
  announceBackgroundRefresh?: boolean;
  /** Whether to announce initial load (default: true) */
  announceInitialLoad?: boolean;
}

export interface WeatherAnnouncement {
  message: string;
  politeness: 'polite' | 'assertive';
  timestamp: number;
}

export interface UseWeatherAnnouncementReturn {
  /** Current announcement to display in live region */
  currentAnnouncement: WeatherAnnouncement | null;
  /** Announce weather data loaded/updated */
  announceWeatherUpdate: (
    weather: CurrentWeatherData,
    location: string,
    isInitialLoad?: boolean
  ) => void;
  /** Announce weather error */
  announceError: (errorMessage: string) => void;
  /** Announce offline status */
  announceOfflineStatus: (isOffline: boolean, hasCachedData?: boolean) => void;
  /** Announce loading state change */
  announceLoadingState: (isLoading: boolean, location?: string) => void;
  /** Clear current announcement */
  clearAnnouncement: () => void;
}

const DEFAULT_CONFIG: Required<WeatherAnnouncementConfig> = {
  minAnnouncementInterval: 3000,
  debounceDelay: 1500,
  dedupeWindow: 30000,
  temperatureChangeThreshold: 2,
  announceBackgroundRefresh: false,
  announceInitialLoad: true,
};

export const useWeatherAnnouncement = (
  config: WeatherAnnouncementConfig = {}
): UseWeatherAnnouncementReturn => {
  const { t } = useTranslation(['weather', 'common', 'errors']);

  // Memoize config to prevent infinite loops in dependent useCallbacks
  const mergedConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);

  const [currentAnnouncement, setCurrentAnnouncement] = useState<WeatherAnnouncement | null>(null);

  // Refs for tracking state between renders
  const lastAnnouncementTimeRef = useRef<number>(0);
  const previousWeatherRef = useRef<CurrentWeatherData | null>(null);
  const debouncerRef = useRef<AnnouncementDebouncer>(
    new AnnouncementDebouncer(mergedConfig.debounceDelay)
  );
  const deduplicatorRef = useRef<AnnouncementDeduplicator>(
    new AnnouncementDeduplicator(mergedConfig.dedupeWindow)
  );

  // Cleanup on unmount
  useEffect(() => {
    const debouncer = debouncerRef.current;
    return () => {
      debouncer.cancel();
    };
  }, []);

  /**
   * Core announcement function with throttling and deduplication
   */
  const announce = useCallback(
    (message: string, politeness: 'polite' | 'assertive' = 'polite', skipDedupe = false) => {
      const now = Date.now();

      // Skip if too soon after last announcement (except for assertive messages)
      if (
        politeness !== 'assertive' &&
        now - lastAnnouncementTimeRef.current < mergedConfig.minAnnouncementInterval
      ) {
        return;
      }

      // Skip duplicates
      if (!skipDedupe && !deduplicatorRef.current.shouldAnnounce(message)) {
        return;
      }

      lastAnnouncementTimeRef.current = now;
      setCurrentAnnouncement({
        message,
        politeness,
        timestamp: now,
      });
    },
    [mergedConfig.minAnnouncementInterval]
  );

  /**
   * Determine if weather change is significant enough to announce
   */
  const isSignificantChange = useCallback(
    (current: CurrentWeatherData, previous: CurrentWeatherData | null): boolean => {
      if (!previous) return true;

      // Temperature change threshold
      const tempDiff = Math.abs(current.temperature.current - previous.temperature.current);
      if (tempDiff >= mergedConfig.temperatureChangeThreshold) return true;

      // Weather condition change
      if (current.condition.code !== previous.condition.code) return true;

      // Significant humidity change (>15%)
      if (Math.abs(current.humidity - previous.humidity) > 15) return true;

      return false;
    },
    [mergedConfig.temperatureChangeThreshold]
  );

  /**
   * Announce weather update with smart change detection
   */
  const announceWeatherUpdate = useCallback(
    (weather: CurrentWeatherData, location: string, isInitialLoad = false) => {
      const previousWeather = previousWeatherRef.current;

      // Skip announcement for background refreshes with no significant change
      if (!isInitialLoad && !mergedConfig.announceBackgroundRefresh) {
        if (!isSignificantChange(weather, previousWeather)) {
          previousWeatherRef.current = weather;
          return;
        }
      }

      // Skip initial load announcement if disabled
      if (isInitialLoad && !mergedConfig.announceInitialLoad) {
        previousWeatherRef.current = weather;
        return;
      }

      const tempDisplay = `${Math.round(weather.temperature.current)}°`;
      const condition = weather.condition.description || t('weather:condition.unknown', 'Unknown');

      const message = isInitialLoad
        ? t('weather:announcements.loaded', {
            defaultValue: 'Weather loaded for {{location}}. {{temp}}, {{condition}}.',
            location,
            temp: tempDisplay,
            condition,
          })
        : t('weather:announcements.updated', {
            defaultValue: 'Weather updated: {{temp}}, {{condition}}.',
            temp: tempDisplay,
            condition,
          });

      debouncerRef.current.announce(message, () => {
        announce(message, 'polite');
      });

      previousWeatherRef.current = weather;
    },
    [announce, isSignificantChange, mergedConfig, t]
  );

  // Part 2 continues in str-replace-editor...
  /**
   * Announce error with assertive politeness
   */
  const announceError = useCallback(
    (errorMessage: string) => {
      const message = t('errors:announcements.weatherError', {
        defaultValue: 'Weather error: {{error}}',
        error: errorMessage,
      });
      announce(message, 'assertive', true);
    },
    [announce, t]
  );

  /**
   * Announce offline/online status
   */
  const announceOfflineStatus = useCallback(
    (isOffline: boolean, hasCachedData = false) => {
      const message = isOffline
        ? hasCachedData
          ? t('common:announcements.offlineWithCache', {
              defaultValue: 'You are offline. Showing cached weather data.',
            })
          : t('common:announcements.offline', {
              defaultValue: 'You are offline. Weather data unavailable.',
            })
        : t('common:announcements.online', {
            defaultValue: 'You are back online.',
          });

      announce(message, isOffline ? 'assertive' : 'polite');
    },
    [announce, t]
  );

  /**
   * Announce loading state (only for explicit user-initiated searches)
   */
  const announceLoadingState = useCallback(
    (isLoading: boolean, location?: string) => {
      // Only announce start of loading, not completion (weather update handles that)
      if (!isLoading) return;

      const message = location
        ? t('common:announcements.loadingLocation', {
            defaultValue: 'Loading weather for {{location}}...',
            location,
          })
        : t('common:announcements.loading', {
            defaultValue: 'Loading weather data...',
          });

      announce(message, 'polite');
    },
    [announce, t]
  );

  /**
   * Clear current announcement
   */
  const clearAnnouncement = useCallback(() => {
    setCurrentAnnouncement(null);
  }, []);

  return {
    currentAnnouncement,
    announceWeatherUpdate,
    announceError,
    announceOfflineStatus,
    announceLoadingState,
    clearAnnouncement,
  };
};

export default useWeatherAnnouncement;
