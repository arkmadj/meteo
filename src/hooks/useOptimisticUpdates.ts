/**
 * Optimistic Updates Hook for React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { queryKeys } from '@/config/queryClient';
import { useError } from '@/contexts/ErrorContext';
import type { CurrentWeatherData, ForecastDay } from '@/types';
import { ErrorCategory, ErrorSeverity, ErrorType } from '@/types/error';

/**
 * Hook for optimistic weather updates
 */
export const useOptimisticWeatherUpdate = () => {
  const queryClient = useQueryClient();
  const { addError } = useError();
  const { t } = useTranslation(['errors']);

  const useUpdateWeatherOptimistically = (
    location: string,
    updateFn: (oldData: CurrentWeatherData) => CurrentWeatherData,
    options: {
      onMutate?: (data: CurrentWeatherData) => void;
      onError?: (error: Error, oldData: CurrentWeatherData) => void;
      onSuccess?: (data: CurrentWeatherData) => void;
      onSettled?: () => void;
    } = {}
  ) => {
    const mutation = useMutation({
      mutationFn: async () => {
        // This is a simulated optimistic update
        // In a real app, this would make an actual API call
        return new Promise<CurrentWeatherData>(resolve => {
          setTimeout(() => {
            const currentData = queryClient.getQueryData<CurrentWeatherData>(
              queryKeys.weather.current(location)
            );
            if (currentData) {
              const updatedData = updateFn(currentData);
              resolve(updatedData);
            } else {
              resolve({} as CurrentWeatherData);
            }
          }, 1000);
        });
      },
      onMutate: async () => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: queryKeys.weather.current(location),
        });

        // Snapshot the previous value
        const previousData = queryClient.getQueryData<CurrentWeatherData>(
          queryKeys.weather.current(location)
        );

        // Optimistically update to the new value
        if (previousData) {
          const optimisticData = updateFn(previousData);
          queryClient.setQueryData(queryKeys.weather.current(location), optimisticData);

          // Call onMutate callback if provided
          options.onMutate?.(optimisticData);
        }

        return { previousData };
      },
      onError: (error, _variables, context) => {
        // If the mutation fails, use the context returned from onMutate to roll back
        if (context?.previousData) {
          queryClient.setQueryData(queryKeys.weather.current(location), context.previousData);
        }

        // Add error to error context
        addError({
          id: `optimistic-${Date.now()}`,
          type: ErrorType.UNKNOWN_ERROR,
          category: ErrorCategory.NETWORK,
          severity: ErrorSeverity.MEDIUM,
          message: t('errors:messages.optimisticUpdateFailed'),
          userMessage: t('errors:messages.optimisticUpdateFailed'),
          retryable: true,
          timestamp: Date.now(),
        } as unknown);

        // Call onError callback if provided
        options.onError?.(error, context?.previousData!);
      },
      onSettled: () => {
        // Always refetch after error or success
        void queryClient.invalidateQueries({
          queryKey: queryKeys.weather.current(location),
        });

        // Call onSettled callback if provided
        options.onSettled?.();
      },
      onSuccess: data => {
        // Call onSuccess callback if provided
        options.onSuccess?.(data);
      },
    });

    return mutation;
  };

  const useUpdateForecastOptimistically = (
    location: string,
    days: number,
    updateFn: (oldData: ForecastDay[]) => ForecastDay[],
    options: {
      onMutate?: (data: ForecastDay[]) => void;
      onError?: (error: Error, oldData: ForecastDay[]) => void;
      onSuccess?: (data: ForecastDay[]) => void;
      onSettled?: () => void;
    } = {}
  ) => {
    const mutation = useMutation({
      mutationFn: async () => {
        // This is a simulated optimistic update
        return new Promise<ForecastDay[]>(resolve => {
          setTimeout(() => {
            const currentData = queryClient.getQueryData<ForecastDay[]>(
              queryKeys.weather.forecast(location, days)
            );
            if (currentData) {
              const updatedData = updateFn(currentData);
              resolve(updatedData);
            } else {
              resolve([]);
            }
          }, 1000);
        });
      },
      onMutate: async () => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: queryKeys.weather.forecast(location, days),
        });

        // Snapshot the previous value
        const previousData = queryClient.getQueryData<ForecastDay[]>(
          queryKeys.weather.forecast(location, days)
        );

        // Optimistically update to the new value
        if (previousData) {
          const optimisticData = updateFn(previousData);
          queryClient.setQueryData(queryKeys.weather.forecast(location, days), optimisticData);

          // Call onMutate callback if provided
          options.onMutate?.(optimisticData);
        }

        return { previousData };
      },
      onError: (error, _variables, context) => {
        // If the mutation fails, use the context returned from onMutate to roll back
        if (context?.previousData) {
          queryClient.setQueryData(
            queryKeys.weather.forecast(location, days),
            context.previousData
          );
        }

        // Add error to error context
        addError({
          id: `optimistic-${Date.now()}`,
          type: ErrorType.UNKNOWN_ERROR,
          category: ErrorCategory.NETWORK,
          severity: ErrorSeverity.MEDIUM,
          message: t('errors:messages.optimisticUpdateFailed'),
          userMessage: t('errors:messages.optimisticUpdateFailed'),
          retryable: true,
          timestamp: Date.now(),
        } as unknown);

        // Call onError callback if provided
        options.onError?.(error, context?.previousData!);
      },
      onSettled: () => {
        // Always refetch after error or success
        void queryClient.invalidateQueries({
          queryKey: queryKeys.weather.forecast(location, days),
        });

        // Call onSettled callback if provided
        options.onSettled?.();
      },
      onSuccess: data => {
        // Call onSuccess callback if provided
        options.onSuccess?.(data);
      },
    });

    return mutation;
  };

  const useUpdateTemperatureUnitOptimistically = (
    location: string,
    isCelsius: boolean,
    options: {
      onMutate?: (data: CurrentWeatherData) => void;
      onError?: (error: Error, oldData: CurrentWeatherData) => void;
      onSuccess?: (data: CurrentWeatherData) => void;
      onSettled?: () => void;
    } = {}
  ) => {
    return useUpdateWeatherOptimistically(
      location,
      oldData => {
        return {
          ...oldData,
          temperature: {
            ...oldData.temperature,
            unit: isCelsius ? 'celsius' : 'fahrenheit',
          },
        };
      },
      options
    );
  };

  const useUpdateWeatherConditionOptimistically = (
    location: string,
    condition: {
      code: number;
      description: string;
      icon: string;
    },
    options: {
      onMutate?: (data: CurrentWeatherData) => void;
      onError?: (error: Error, oldData: CurrentWeatherData) => void;
      onSuccess?: (data: CurrentWeatherData) => void;
      onSettled?: () => void;
    } = {}
  ) => {
    return useUpdateWeatherOptimistically(
      location,
      oldData => {
        return {
          ...oldData,
          condition,
          lastUpdated: new Date().toISOString(),
        };
      },
      options
    );
  };

  const useRefreshWeatherOptimistically = (
    location: string,
    options: {
      onMutate?: (data: CurrentWeatherData) => void;
      onError?: (error: Error, oldData: CurrentWeatherData) => void;
      onSuccess?: (data: CurrentWeatherData) => void;
      onSettled?: () => void;
    } = {}
  ) => {
    return useUpdateWeatherOptimistically(
      location,
      oldData => {
        return {
          ...oldData,
          lastUpdated: new Date().toISOString(),
        };
      },
      options
    );
  };

  return {
    useUpdateWeatherOptimistically,
    useUpdateForecastOptimistically,
    useUpdateTemperatureUnitOptimistically,
    useUpdateWeatherConditionOptimistically,
    useRefreshWeatherOptimistically,
  };
};

/**
 * Hook for batch optimistic updates
 */
export const useBatchOptimisticUpdate = () => {
  const queryClient = useQueryClient();
  const { addError } = useError();
  const { t } = useTranslation(['errors']);

  const useUpdateMultipleLocationsOptimistically = (
    updates: Array<{
      location: string;
      updateFn: (oldData: CurrentWeatherData) => CurrentWeatherData;
    }>,
    options: {
      onMutate?: (data: CurrentWeatherData[]) => void;
      onError?: (error: Error, oldData: CurrentWeatherData[]) => void;
      onSuccess?: (data: CurrentWeatherData[]) => void;
      onSettled?: () => void;
    } = {}
  ) => {
    const mutation = useMutation({
      mutationFn: async () => {
        // Simulate batch optimistic update
        return new Promise<CurrentWeatherData[]>(resolve => {
          setTimeout(() => {
            const results = updates.map(({ location, updateFn }) => {
              const currentData = queryClient.getQueryData<CurrentWeatherData>(
                queryKeys.weather.current(location)
              );
              return currentData ? updateFn(currentData) : ({} as CurrentWeatherData);
            });
            resolve(results);
          }, 1000);
        });
      },
      onMutate: async () => {
        // Cancel all outgoing refetches
        const cancelPromises = updates.map(({ location }) =>
          queryClient.cancelQueries({
            queryKey: queryKeys.weather.current(location),
          })
        );
        await Promise.all(cancelPromises);

        // Snapshot all previous values
        const previousDataMap = new Map<string, CurrentWeatherData>();
        updates.forEach(({ location }) => {
          const data = queryClient.getQueryData<CurrentWeatherData>(
            queryKeys.weather.current(location)
          );
          if (data) {
            previousDataMap.set(location, data);
          }
        });

        // Optimistically update all values
        const optimisticData: CurrentWeatherData[] = [];
        updates.forEach(({ location, updateFn }) => {
          const previousData = previousDataMap.get(location);
          if (previousData) {
            const optimisticUpdate = updateFn(previousData);
            queryClient.setQueryData(queryKeys.weather.current(location), optimisticUpdate);
            optimisticData.push(optimisticUpdate);
          }
        });

        // Call onMutate callback if provided
        options.onMutate?.(optimisticData);

        return { previousDataMap };
      },
      onError: (error, _variables, context) => {
        // Roll back all updates on error
        if (context?.previousDataMap) {
          context.previousDataMap.forEach((data, location) => {
            queryClient.setQueryData(queryKeys.weather.current(location), data);
          });
        }

        // Add error to error context
        addError({
          id: `batch-optimistic-${Date.now()}`,
          type: ErrorType.UNKNOWN_ERROR,
          category: ErrorCategory.NETWORK,
          severity: ErrorSeverity.MEDIUM,
          message: t('errors:messages.batchUpdateFailed'),
          userMessage: t('errors:messages.batchUpdateFailed'),
          retryable: true,
          timestamp: Date.now(),
        } as unknown);

        // Call onError callback if provided
        options.onError?.(error, Array.from(context?.previousDataMap?.values() || []));
      },
      onSettled: () => {
        // Refetch all queries after error or success
        updates.forEach(({ location }) => {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.weather.current(location),
          });
        });

        // Call onSettled callback if provided
        options.onSettled?.();
      },
      onSuccess: data => {
        // Call onSuccess callback if provided
        options.onSuccess?.(data);
      },
    });

    return mutation;
  };

  return {
    useUpdateMultipleLocationsOptimistically,
  };
};

/**
 * Hook for optimistic UI updates with loading states
 */
export const useOptimisticUI = () => {
  const queryClient = useQueryClient();
  const { addError } = useError();
  const { t } = useTranslation(['errors']);

  const useUpdateWithLoadingState = (
    location: string,
    updateFn: (oldData: CurrentWeatherData) => CurrentWeatherData,
    options: {
      loadingKey?: string;
      onMutate?: (data: CurrentWeatherData) => void;
      onError?: (error: Error, oldData: CurrentWeatherData) => void;
      onSuccess?: (data: CurrentWeatherData) => void;
      onSettled?: () => void;
    } = {}
  ) => {
    const loadingKey = options.loadingKey || `${location}_loading`;

    const mutation = useMutation({
      mutationFn: async () => {
        // Simulate API call
        return new Promise<CurrentWeatherData>(resolve => {
          setTimeout(() => {
            const currentData = queryClient.getQueryData<CurrentWeatherData>(
              queryKeys.weather.current(location)
            );
            if (currentData) {
              const updatedData = updateFn(currentData);
              resolve(updatedData);
            } else {
              resolve({} as CurrentWeatherData);
            }
          }, 1000);
        });
      },
      onMutate: async () => {
        // Set loading state
        queryClient.setQueryData(['loading', loadingKey], true);

        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: queryKeys.weather.current(location),
        });

        // Snapshot the previous value
        const previousData = queryClient.getQueryData<CurrentWeatherData>(
          queryKeys.weather.current(location)
        );

        // Optimistically update to the new value
        if (previousData) {
          const optimisticData = updateFn(previousData);
          queryClient.setQueryData(queryKeys.weather.current(location), optimisticData);

          // Call onMutate callback if provided
          options.onMutate?.(optimisticData);
        }

        return { previousData };
      },
      onError: (error, _variables, context) => {
        // Roll back on error
        if (context?.previousData) {
          queryClient.setQueryData(queryKeys.weather.current(location), context.previousData);
        }

        // Add error to error context
        addError({
          id: `optimistic-ui-${Date.now()}`,
          type: ErrorType.UNKNOWN_ERROR,
          category: ErrorCategory.NETWORK,
          severity: ErrorSeverity.MEDIUM,
          message: t('errors:messages.optimisticUIFailed'),
          userMessage: t('errors:messages.optimisticUIFailed'),
          retryable: true,
          timestamp: Date.now(),
        } as unknown);

        // Call onError callback if provided
        options.onError?.(error, context?.previousData!);
      },
      onSettled: () => {
        // Clear loading state
        queryClient.setQueryData(['loading', loadingKey], false);

        // Always refetch after error or success
        void queryClient.invalidateQueries({
          queryKey: queryKeys.weather.current(location),
        });

        // Call onSettled callback if provided
        options.onSettled?.();
      },
      onSuccess: data => {
        // Call onSuccess callback if provided
        options.onSuccess?.(data);
      },
    });

    return mutation;
  };

  const useLoadingState = (key: string) => {
    return useQuery({
      queryKey: ['loading', key],
      queryFn: () => false,
      enabled: false,
      initialData: false,
    });
  };

  return {
    useUpdateWithLoadingState,
    useLoadingState,
  };
};
