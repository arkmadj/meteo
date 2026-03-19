/**
 * Offline Support Hook for React Query
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useError } from '@/contexts/ErrorContext';
import { ErrorCategory, ErrorSeverity, ErrorType } from '@/types/error';

/**
 * Hook for offline support with React Query
 */
export const useOfflineSupport = () => {
  const queryClient = useQueryClient();
  const { addError } = useError();
  const { t } = useTranslation(['errors']);

  /**
   * Check if the browser is online
   */
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  /**
   * Hook for online/offline status
   */
  const useOnlineStatus = () => {
    const [online, setOnline] = React.useState(isOnline);

    React.useEffect(() => {
      const handleOnline = () => {
        setOnline(true);
        // Retry failed queries when coming back online
        void queryClient.refetchQueries({
          type: 'active',
          stale: true,
        });
      };

      const handleOffline = () => {
        setOnline(false);
        // Add offline notification
        addError({
          id: `offline-${Date.now()}`,
          type: ErrorType.NETWORK_ERROR,
          category: ErrorCategory.NETWORK,
          severity: ErrorSeverity.LOW,
          message: t('errors:messages.offline'),
          userMessage: t('errors:messages.offline'),
          retryable: false,
          timestamp: Date.now(),
        } as unknown);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }, []);

    return online;
  };

  /**
   * Hook for offline data persistence
   */
  const useOfflineData = (key: string) => {
    const [offlineData, setOfflineData] = React.useState<unknown>(null);

    React.useEffect(() => {
      // Load data from localStorage on mount
      try {
        const stored = localStorage.getItem(`offline_${key}`);
        if (stored) {
          setOfflineData(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load offline data:', error);
      }
    }, [key]);

    const saveOfflineData = React.useCallback(
      (data: unknown) => {
        try {
          localStorage.setItem(`offline_${key}`, JSON.stringify(data));
          setOfflineData(data);
        } catch (error) {
          console.error('Failed to save offline data:', error);
          addError({
            id: `offline-storage-${Date.now()}`,
            type: ErrorType.UNKNOWN_ERROR,
            category: ErrorCategory.UNKNOWN,
            severity: ErrorSeverity.LOW,
            message: t('errors:messages.offlineStorageFailed'),
            userMessage: t('errors:messages.offlineStorageFailed'),
            retryable: false,
            timestamp: Date.now(),
          } as unknown);
        }
      },
      [key, addError, t]
    );

    const clearOfflineData = React.useCallback(() => {
      try {
        localStorage.removeItem(`offline_${key}`);
        setOfflineData(null);
      } catch (error) {
        console.error('Failed to clear offline data:', error);
      }
    }, [key]);

    return { offlineData, saveOfflineData, clearOfflineData };
  };

  /**
   * Hook for offline weather data
   */
  const useOfflineWeather = (location: string) => {
    const { offlineData, saveOfflineData, clearOfflineData } = useOfflineData(
      `weather_${location}`
    );

    React.useEffect(() => {
      // Save weather data to offline storage when it changes
      const unsubscribe = queryClient.getQueryCache().subscribe(event => {
        if (
          event.type === 'updated' &&
          (event as unknown).action === 'success' &&
          event.query.queryKey?.[0] === 'weather' &&
          event.query.queryKey.includes(location)
        ) {
          const data = event.query.state.data;
          if (data) {
            saveOfflineData({
              data,
              timestamp: Date.now(),
              location,
            });
          }
        }
      });

      return () => {
        unsubscribe();
      };
    }, [location, saveOfflineData]);

    return { offlineData, clearOfflineData };
  };

  /**
   * Hook for offline forecast data
   */
  const useOfflineForecast = (location: string, days: number = 7) => {
    const { offlineData, saveOfflineData, clearOfflineData } = useOfflineData(
      `forecast_${location}_${days}`
    );

    React.useEffect(() => {
      // Save forecast data to offline storage when it changes
      const unsubscribe = queryClient.getQueryCache().subscribe(event => {
        if (
          event.type === 'updated' &&
          (event as unknown).action === 'success' &&
          event.query.queryKey?.[0] === 'weather' &&
          event.query.queryKey.includes('forecast') &&
          event.query.queryKey.includes(location)
        ) {
          const data = event.query.state.data;
          if (data) {
            saveOfflineData({
              data,
              timestamp: Date.now(),
              location,
              days,
            });
          }
        }
      });

      return () => {
        unsubscribe();
      };
    }, [location, days, saveOfflineData]);

    return { offlineData, clearOfflineData };
  };

  /**
   * Hook for offline mutations queue
   */
  const useOfflineMutationQueue = () => {
    const [queue, setQueue] = React.useState<
      Array<{
        id: string;
        mutationFn: () => Promise<unknown>;
        variables: unknown;
        timestamp: number;
        retryCount: number;
      }>
    >([]);

    // Load queue from localStorage on mount
    React.useEffect(() => {
      try {
        const stored = localStorage.getItem('offline_mutation_queue');
        if (stored) {
          setQueue(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load offline mutation queue:', error);
      }
    }, []);

    // Save queue to localStorage when it changes
    React.useEffect(() => {
      try {
        localStorage.setItem('offline_mutation_queue', JSON.stringify(queue));
      } catch (error) {
        console.error('Failed to save offline mutation queue:', error);
      }
    }, [queue]);

    const addToQueue = React.useCallback(
      (mutationFn: () => Promise<unknown>, variables: unknown) => {
        const newMutation = {
          id: Date.now().toString(),
          mutationFn,
          variables,
          timestamp: Date.now(),
          retryCount: 0,
        };
        setQueue(prev => [...prev, newMutation]);
      },
      []
    );

    const processQueue = React.useCallback(async () => {
      if (queue.length === 0 || !navigator.onLine) return;

      const queueCopy = [...queue];
      setQueue([]);

      for (const mutation of queueCopy) {
        try {
          await mutation.mutationFn();
          // Remove from queue on success
          setQueue(prev => prev.filter(m => m.id !== mutation.id));
        } catch {
          // Add back to queue with increased retry count
          setQueue(prev => [
            ...prev,
            {
              ...mutation,
              retryCount: mutation.retryCount + 1,
            },
          ]);

          // Stop processing if offline
          if (!navigator.onLine) break;
        }
      }
    }, [queue]);

    // Process queue when coming online
    React.useEffect(() => {
      const handleOnline = () => {
        void processQueue();
      };

      window.addEventListener('online', handleOnline);
      return () => {
        window.removeEventListener('online', handleOnline);
      };
    }, [processQueue]);

    return { queue, addToQueue, processQueue };
  };

  /**
   * Hook for offline cache management
   */
  const useOfflineCache = () => {
    const clearOfflineCache = React.useCallback(() => {
      // Clear all offline data
      const keys = Object.keys(localStorage);
      const offlineKeys = keys.filter(key => key.startsWith('offline_'));
      offlineKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      // Clear mutation queue
      localStorage.removeItem('offline_mutation_queue');

      // Clear React Query cache
      queryClient.clear();
    }, []);

    const getOfflineCacheSize = React.useCallback(() => {
      let size = 0;
      const keys = Object.keys(localStorage);
      const offlineKeys = keys.filter(key => key.startsWith('offline_'));

      offlineKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          size += data.length;
        }
      });

      return size;
    }, []);

    const getOfflineCacheInfo = React.useCallback(() => {
      const keys = Object.keys(localStorage);
      const offlineKeys = keys.filter(key => key.startsWith('offline_'));

      const info = {
        totalItems: offlineKeys.length,
        totalSize: 0,
        items: [] as Array<{
          key: string;
          size: number;
          timestamp?: number;
        }>,
      };

      offlineKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          const size = data.length;
          info.totalSize += size;

          try {
            const parsed = JSON.parse(data);
            info.items.push({
              key,
              size,
              timestamp: parsed.timestamp,
            });
          } catch {
            info.items.push({
              key,
              size,
            });
          }
        }
      });

      return info;
    }, []);

    return { clearOfflineCache, getOfflineCacheSize, getOfflineCacheInfo };
  };

  /**
   * Hook for offline-first queries
   */
  const useOfflineFirstQuery = <T>(
    queryKey: string[],
    queryFn: () => Promise<T>,
    options: {
      offlineKey?: string;
      staleTime?: number;
      gcTime?: number;
      enabled?: boolean;
    } = {}
  ) => {
    const { offlineData } = useOfflineData(options.offlineKey || queryKey.join('_'));

    return useQuery({
      queryKey,
      queryFn,
      enabled: options.enabled ?? true,
      staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
      gcTime: options.gcTime ?? 30 * 60 * 1000, // 30 minutes
      initialData: offlineData?.data,
      initialDataUpdatedAt: offlineData?.timestamp,
      networkMode: 'offlineFirst' as const,
      retry: (failureCount, _error) => {
        // Don't retry if offline
        if (!navigator.onLine) return false;
        return failureCount < 3;
      },
    });
  };

  return {
    useOnlineStatus,
    useOfflineData,
    useOfflineWeather,
    useOfflineForecast,
    useOfflineMutationQueue,
    useOfflineCache,
    useOfflineFirstQuery,
  };
};

/**
 * Offline-first query hook with automatic fallback
 */
export const useOfflineFirstWeatherQuery = (location: string) => {
  const { useOfflineFirstQuery } = useOfflineSupport();

  return useOfflineFirstQuery(
    ['weather', 'current', location],
    async () => {
      const { fetchCompleteWeatherData } = await import('@/services/weatherService');
      const result = await fetchCompleteWeatherData(location);
      return result.current;
    },
    {
      offlineKey: `weather_${location}`,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    }
  );
};

/**
 * Offline-first forecast query hook with automatic fallback
 */
export const useOfflineFirstForecastQuery = (location: string, days: number = 7) => {
  const { useOfflineFirstQuery } = useOfflineSupport();

  return useOfflineFirstQuery(
    ['weather', 'forecast', location, String(days)],
    async () => {
      const { fetchCompleteWeatherData } = await import('@/services/weatherService');
      const result = await fetchCompleteWeatherData(location, days);
      return result.forecast.slice(0, days);
    },
    {
      offlineKey: `forecast_${location}_${days}`,
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    }
  );
};
