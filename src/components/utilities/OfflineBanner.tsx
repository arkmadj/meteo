import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { queryKeys } from '@/config/queryClient';
import { useOnlineStatus } from '@/contexts/OnlineStatusContext';
import { useDateI18n } from '@/i18n/hooks/useDateI18n';
import type { TemperatureUnit } from '@/services/weatherService';
import { loadWeatherBuffer } from '@/utils/weatherBuffer';

interface OfflineCacheMeta {
  timestamp: number;
  expired: boolean;
  location?: string;
}

const parseForecastDays = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const normalizeUnit = (value: unknown): TemperatureUnit => {
  return value === 'fahrenheit' ? 'fahrenheit' : 'celsius';
};

const OfflineBanner = () => {
  const isOnline = useOnlineStatus();
  const queryClient = useQueryClient();
  const { t } = useTranslation(['common']);
  const { formatDate } = useDateI18n();
  const [cacheMeta, setCacheMeta] = useState<OfflineCacheMeta | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const readLatestBufferEntry = (): OfflineCacheMeta | null => {
      const queries = queryClient.getQueryCache().findAll({ queryKey: queryKeys.weather.all });

      let latest: OfflineCacheMeta | null = null;

      queries.forEach(query => {
        const key = query.queryKey;
        if (!Array.isArray(key) || key[0] !== 'weather') {
          return;
        }

        const type = key[1];
        if (typeof type !== 'string') {
          return;
        }

        let location: string | undefined;
        let unit: TemperatureUnit = 'celsius';
        let days: number | null = null;

        if (type === 'current') {
          location = typeof key[2] === 'string' ? key[2] : undefined;
          unit = normalizeUnit(key[3]);

          const completeIndex = key.findIndex(part => part === 'complete');
          if (completeIndex !== -1) {
            days = parseForecastDays(key[completeIndex + 1]);
          }
        } else if (type === 'forecast') {
          location = typeof key[2] === 'string' ? key[2] : undefined;
          days = parseForecastDays(key[3]);
          unit = normalizeUnit(key[4]);
        } else {
          return;
        }

        if (!location) {
          return;
        }

        const resolvedDays = days ?? 7;

        const entry = loadWeatherBuffer({
          query: location,
          unit,
          days: resolvedDays,
          allowExpired: true,
        });

        if (!entry) {
          return;
        }

        if (!latest || entry.timestamp > latest.timestamp) {
          latest = {
            timestamp: entry.timestamp,
            expired: entry.expired,
            location: entry.payload.current?.city ?? location,
          };
        }
      });

      return latest;
    };

    const updateMeta = () => {
      if (isOnline) {
        setCacheMeta(null);
        return;
      }

      setCacheMeta(readLatestBufferEntry());
    };

    updateMeta();
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      // Defer state update to avoid updating during another component's render
      queueMicrotask(() => {
        updateMeta();
      });
    });

    return () => {
      unsubscribe();
    };
  }, [isOnline, queryClient]);

  const formattedTimestamp = useMemo(() => {
    if (!cacheMeta) {
      return null;
    }

    const date = new Date(cacheMeta.timestamp);

    return {
      date: formatDate(date, 'short'),
      time: formatDate(date, 'time'),
    };
  }, [cacheMeta, formatDate]);

  const lastUpdatedMessage = useMemo(() => {
    if (!cacheMeta || !formattedTimestamp) {
      return null;
    }

    const locationSuffix = cacheMeta.location ? ` - ${cacheMeta.location}` : '';
    return t('common:status.offlineBannerCachedAt', {
      date: formattedTimestamp.date,
      time: formattedTimestamp.time,
      location: locationSuffix,
    });
  }, [cacheMeta, formattedTimestamp, t]);

  if (isOnline) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[1100] flex justify-center px-3 sm:px-4">
      {/*
        Visual offline indicator only - ARIA announcements are handled by
        the centralized WeatherLiveRegion component to prevent duplicate
        screen reader output
      */}
      <div
        className="pointer-events-auto flex w-full max-w-3xl items-start gap-3 rounded-lg border border-amber-500/80 bg-amber-50/95 px-4 py-3 text-amber-900 shadow-lg backdrop-blur-sm transition-all dark:border-amber-400/50 dark:bg-amber-950/80 dark:text-amber-100"
        role="status"
        data-testid="offline-banner"
      >
        <span
          aria-hidden="true"
          className="mt-0.5 inline-flex h-2.5 w-2.5 flex-none animate-pulse rounded-full bg-amber-500 sm:mt-0"
        />
        <div className="flex flex-col gap-1 text-sm sm:text-base">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
            <span className="font-semibold">{t('common:status.offlineBannerTitle')}</span>
            <span className="text-xs text-amber-900/80 dark:text-amber-100/80 sm:text-sm">
              {t('common:status.offlineBannerMessage')}
            </span>
          </div>
          {lastUpdatedMessage && (
            <span className="text-xs text-amber-900/70 dark:text-amber-100/70 sm:text-sm">
              {lastUpdatedMessage}
              {cacheMeta?.expired && (
                <span className="ml-1 font-medium text-amber-900/80 dark:text-amber-100/80">
                  {t('common:status.offlineBannerCachedExpired')}
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineBanner;
