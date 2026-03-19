/**
 * React Query Performance Monitoring Hook
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { usePerformance } from '@/contexts/PerformanceContext';

/**
 * Hook for monitoring React Query performance
 */
export const useQueryPerformance = () => {
  const queryClient = useQueryClient();
  const { refreshMetrics: _refreshMetrics } = usePerformance();
  const { t: _t } = useTranslation(['performance']);

  /**
   * Hook for performance-monitored queries
   */
  const usePerformanceQuery = <T>(
    queryKey: string[],
    queryFn: () => Promise<T>,
    options: {
      enabled?: boolean;
      staleTime?: number;
      gcTime?: number;
      retry?: boolean | number;
      retryDelay?: number;
      trackPerformance?: boolean;
      performanceKey?: string;
    } = {}
  ) => {
    const _performanceKey = options.performanceKey || queryKey.join('_');
    const startTime = React.useRef<number>(0);

    return useQuery({
      queryKey,
      queryFn: async () => {
        if (options.trackPerformance !== false) {
          startTime.current = performance.now();
        }

        try {
          const result = await queryFn();

          if (options.trackPerformance !== false) {
            const endTime = performance.now();
            const _duration = endTime - startTime.current;

            // no-op metrics (disabled)
          }

          return result;
        } catch (error) {
          if (options.trackPerformance !== false) {
            const endTime = performance.now();
            const _duration = endTime - startTime.current;

            // no-op metrics (disabled)
          }

          throw error;
        }
      },
      enabled: options.enabled ?? true,
      staleTime: options.staleTime ?? 5 * 60 * 1000,
      gcTime: options.gcTime ?? 30 * 60 * 1000,
      retry: options.retry ?? 3,
      retryDelay:
        options.retryDelay ??
        function (attemptIndex: number) {
          return Math.min(1000 * 2 ** attemptIndex, 30000);
        },
    });
  };

  /**
   * Hook for performance-monitored mutations
   */
  const usePerformanceMutation = <T, V = void>(
    mutationFn: (variables: V) => Promise<T>,
    options: {
      onMutate?: (variables: V) => Promise<T> | T;
      onError?: (error: Error, variables: V) => void;
      onSuccess?: (data: T, variables: V) => void;
      onSettled?: (data: T | undefined, error: Error | null, variables: V) => void;
      trackPerformance?: boolean;
      performanceKey?: string;
    } = {}
  ) => {
    const _performanceKey = options.performanceKey || 'mutation';
    const startTime = React.useRef<number>(0);

    return useMutation({
      mutationFn: async (variables: V) => {
        if (options.trackPerformance !== false) {
          startTime.current = performance.now();
        }

        try {
          const result = await mutationFn(variables);

          if (options.trackPerformance !== false) {
            const endTime = performance.now();
            const _duration = endTime - startTime.current;

            // no-op metrics (disabled)
          }

          return result;
        } catch (error) {
          if (options.trackPerformance !== false) {
            const endTime = performance.now();
            const _duration = endTime - startTime.current;

            // no-op metrics (disabled)
          }

          throw error;
        }
      },
      onMutate: options.onMutate,
      onError: options.onError,
      onSuccess: options.onSuccess,
      onSettled: options.onSettled,
    });
  };

  /**
   * Hook for query cache performance metrics
   */
  const useQueryCacheMetrics = () => {
    const [metrics, setMetrics] = React.useState({
      totalQueries: 0,
      activeQueries: 0,
      inactiveQueries: 0,
      cacheSize: 0,
      averageCacheTime: 0,
      hitRate: 0,
    });

    React.useEffect(() => {
      const updateMetrics = () => {
        const queryCache = queryClient.getQueryCache();
        const queries = queryCache.getAll();

        const totalQueries = queries.length;
        const activeQueries = queries.filter(q => q.isActive()).length;
        const inactiveQueries = queries.filter(q => !q.isActive()).length;

        // Calculate cache size (approximate)
        const cacheSize = queries.reduce((size, query) => {
          const data = query.state.data;
          return size + (data ? JSON.stringify(data).length : 0);
        }, 0);

        // Calculate average cache time
        const cacheTimes = queries.map(q => q.state.dataUpdatedAt);
        const averageCacheTime =
          cacheTimes.length > 0
            ? cacheTimes.reduce((sum, time) => sum + time, 0) / cacheTimes.length
            : 0;

        // Calculate hit rate (simplified)
        const hitRate =
          queries.filter(q => q.state.status === 'success').length / totalQueries || 0;

        setMetrics({
          totalQueries,
          activeQueries,
          inactiveQueries,
          cacheSize,
          averageCacheTime,
          hitRate,
        });

        // no-op metrics (disabled)
      };

      // Update metrics immediately
      updateMetrics();

      // Update metrics periodically
      const interval = setInterval(updateMetrics, 5000); // Every 5 seconds

      // Update metrics on query cache changes
      const unsubscribe = queryClient.getQueryCache().subscribe(updateMetrics);

      return () => {
        clearInterval(interval);
        unsubscribe();
      };
    }, []);

    return metrics;
  };

  /**
   * Hook for query performance analytics
   */
  const useQueryPerformanceAnalytics = () => {
    const [analytics, setAnalytics] = React.useState({
      slowestQueries: [] as Array<{
        key: readonly unknown[];
        duration: number;
        timestamp: number;
      }>,
      errorRate: 0,
      retryRate: 0,
      averageResponseTime: 0,
    });

    React.useEffect(() => {
      const updateAnalytics = () => {
        const queryCache = queryClient.getQueryCache();
        const queries = queryCache.getAll();

        // Calculate error rate
        const errorQueries = queries.filter(q => q.state.status === 'error');
        const errorRate = queries.length > 0 ? errorQueries.length / queries.length : 0;

        // Calculate retry rate
        const retriedQueries = queries.filter(q => q.state.fetchStatus === 'fetching');
        const retryRate = queries.length > 0 ? retriedQueries.length / queries.length : 0;

        // Calculate average response time (simplified)
        const responseTimes = queries.map(() => 0);
        const averageResponseTime =
          responseTimes.length > 0
            ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
            : 0;

        // Get slowest queries (simplified - using cache age as proxy)
        const slowestQueries = queries
          .map(q => ({
            key: q.queryKey as readonly unknown[],
            duration: Date.now() - q.state.dataUpdatedAt,
            timestamp: q.state.dataUpdatedAt,
          }))
          .sort((a, b) => b.duration - a.duration)
          .slice(0, 5);

        setAnalytics({
          slowestQueries,
          errorRate,
          retryRate,
          averageResponseTime,
        });

        // no-op metrics (disabled)
      };

      // Update analytics immediately
      updateAnalytics();

      // Update analytics periodically
      const interval = setInterval(updateAnalytics, 10000); // Every 10 seconds

      return () => {
        clearInterval(interval);
      };
    }, []);

    return analytics;
  };

  /**
   * Hook for performance-optimized queries
   */
  const useOptimizedQuery = <T>(
    queryKey: string[],
    queryFn: () => Promise<T>,
    options: {
      enabled?: boolean;
      staleTime?: number;
      cacheTime?: number;
      retry?: boolean | number;
      retryDelay?: number;
      prefetch?: boolean;
      backgroundRefresh?: boolean;
    } = {}
  ) => {
    const { prefetchQuery } = queryClient;

    // Prefetch query if requested
    React.useEffect(() => {
      if (options.prefetch) {
        void prefetchQuery({
          queryKey,
          queryFn,
          staleTime: options.staleTime ?? 5 * 60 * 1000,
          gcTime: (options as unknown).gcTime ?? 30 * 60 * 1000,
        });
      }
    }, [prefetchQuery, queryKey, queryFn, options.staleTime, options.cacheTime, options.prefetch]);

    // Background refresh
    React.useEffect(() => {
      if (options.backgroundRefresh) {
        const interval = setInterval(
          () => {
            void queryClient.refetchQueries({
              queryKey,
              type: 'active',
              stale: true,
            });
          },
          (options.staleTime ?? 5 * 60 * 1000) / 2
        ); // Refresh at half the stale time

        return () => clearInterval(interval);
      }
    }, [queryClient, queryKey, options.staleTime, options.backgroundRefresh]);

    return usePerformanceQuery(queryKey, queryFn, options);
  };

  return {
    usePerformanceQuery,
    usePerformanceMutation,
    useQueryCacheMetrics,
    useQueryPerformanceAnalytics,
    useOptimizedQuery,
  };
};

/**
 * Hook for React Query performance dashboard
 */
export const useQueryPerformanceDashboard = () => {
  const { useQueryCacheMetrics, useQueryPerformanceAnalytics } = useQueryPerformance();
  const cacheMetrics = useQueryCacheMetrics();
  const analytics = useQueryPerformanceAnalytics();

  const getPerformanceGrade = React.useCallback(() => {
    const { hitRate, averageCacheTime } = cacheMetrics;
    const { errorRate } = analytics;

    if (hitRate > 0.8 && errorRate < 0.1 && averageCacheTime < 1000) {
      return 'A';
    } else if (hitRate > 0.6 && errorRate < 0.2 && averageCacheTime < 2000) {
      return 'B';
    } else if (hitRate > 0.4 && errorRate < 0.3 && averageCacheTime < 3000) {
      return 'C';
    } else {
      return 'D';
    }
  }, [cacheMetrics, analytics]);

  const getPerformanceRecommendations = React.useCallback(() => {
    const recommendations: string[] = [];

    if (cacheMetrics.hitRate < 0.5) {
      recommendations.push('Consider increasing staleTime for better cache hit rate');
    }

    if (analytics.errorRate > 0.2) {
      recommendations.push('High error rate detected - check API endpoints and error handling');
    }

    if (analytics.averageResponseTime > 2000) {
      recommendations.push(
        'Slow response times - consider optimizing queries or using prefetching'
      );
    }

    if (cacheMetrics.activeQueries > 10) {
      recommendations.push('Many active queries - consider query batching or deduplication');
    }

    return recommendations;
  }, [cacheMetrics, analytics]);

  return {
    cacheMetrics,
    analytics,
    performanceGrade: getPerformanceGrade(),
    recommendations: getPerformanceRecommendations(),
  };
};
