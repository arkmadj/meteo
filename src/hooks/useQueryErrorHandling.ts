/**
 * React Query Error Handling Integration Hook
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useError, useErrors } from '@/contexts/ErrorContext';
import type { AppError } from '@/types/error';
import { ErrorCategory, ErrorSeverity, ErrorType } from '@/types/error';

/**
 * Hook for handling React Query errors with the existing error context
 */
export const useQueryErrorHandling = () => {
  const { addError, removeError } = useError();
  const errors = useErrors();
  const { t } = useTranslation(['errors']);
  const queryClient = useQueryClient();

  /**
   * Convert React Query errors to AppError format
   */
  const convertToAppError = (
    error: Error,
    context?: {
      source?: string;
      location?: string;
      action?: string;
    }
  ): AppError => {
    const errorMessage = error.message || t('errors:messages.unknownError');

    // Determine error category based on error message or type
    let category: AppError['category'] = ErrorCategory.NETWORK;
    let severity: AppError['severity'] = ErrorSeverity.HIGH;
    let retryable: boolean = true;

    if (error.message.includes('Network Error') || error.message.includes('fetch')) {
      category = ErrorCategory.NETWORK;
      severity = ErrorSeverity.HIGH;
      retryable = true;
    } else if (error.message.includes('404') || error.message.includes('not found')) {
      category = ErrorCategory.GEOCODING;
      severity = ErrorSeverity.MEDIUM;
      retryable = false;
    } else if (error.message.includes('401') || error.message.includes('403')) {
      category = ErrorCategory.UNKNOWN;
      severity = ErrorSeverity.HIGH;
      retryable = false;
    } else if (error.message.includes('429') || error.message.includes('rate limit')) {
      category = ErrorCategory.API;
      severity = ErrorSeverity.MEDIUM;
      retryable = true;
    } else if (error.message.includes('timeout')) {
      category = ErrorCategory.NETWORK;
      severity = ErrorSeverity.MEDIUM;
      retryable = true;
    } else if (error.message.includes('validation') || error.message.includes('invalid')) {
      category = ErrorCategory.VALIDATION;
      severity = ErrorSeverity.MEDIUM;
      retryable = false;
    }

    return {
      id: `rq-${Date.now()}`,
      type: ErrorType.UNKNOWN_ERROR,
      category,
      severity,
      message: errorMessage,
      userMessage: errorMessage,
      retryable,
      timestamp: Date.now(),
      context: {
        source: context?.source || 'react-query',
        location: context?.location,
        action: context?.action,
        originalError: error,
      },
    } as AppError;
  };

  /**
   * Hook for queries with automatic error handling
   */
  const useQueryWithErrorHandling = <T>(
    queryKey: string[],
    queryFn: () => Promise<T>,
    options: {
      enabled?: boolean;
      staleTime?: number;
      gcTime?: number;
      retry?: boolean | number;
      retryDelay?: number;
      onError?: (error: Error) => void;
      onSuccess?: (data: T) => void;
      errorContext?: {
        source?: string;
        location?: string;
        action?: string;
      };
    } = {}
  ) => {
    return useQuery({
      queryKey,
      queryFn,
      enabled: options.enabled ?? true,
      staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
      gcTime: options.gcTime ?? 30 * 60 * 1000, // 30 minutes
      retry: options.retry ?? 3,
      retryDelay:
        options.retryDelay ??
        function (attemptIndex: number) {
          return Math.min(1000 * 2 ** attemptIndex, 30000);
        },
    });
  };

  /**
   * Hook for mutations with automatic error handling
   */
  const useMutationWithErrorHandling = <T, V = void>(
    mutationFn: (variables: V) => Promise<T>,
    options: {
      onMutate?: (variables: V) => Promise<T> | T;
      onError?: (error: Error, variables: V) => void;
      onSuccess?: (data: T, variables: V) => void;
      onSettled?: (data: T | undefined, error: Error | null, variables: V) => void;
      errorContext?: {
        source?: string;
        location?: string;
        action?: string;
      };
    } = {}
  ) => {
    return useMutation({
      mutationFn,
      onMutate: options.onMutate,
      onError: (error: Error, variables: V) => {
        // Convert to AppError and add to error context
        const appError = convertToAppError(error, options.errorContext);
        addError(appError);

        // Call custom onError if provided
        options.onError?.(error, variables);
      },
      onSuccess: (data: T, variables: V) => {
        // Remove any existing errors for this mutation
        const mutationErrors = errors.filter(
          err =>
            err.context?.source === options.errorContext?.source &&
            err.context?.action === options.errorContext?.action
        );
        mutationErrors.forEach(err => removeError(err.id));

        // Call custom onSuccess if provided
        options.onSuccess?.(data, variables);
      },
      onSettled: options.onSettled,
    });
  };

  /**
   * Hook for handling query-specific errors
   */
  const useQueryErrors = (queryKey: string[]) => {
    return useQuery({
      queryKey: [...queryKey, 'errors'],
      queryFn: () => {
        // Return errors related to this query
        return errors.filter(
          err =>
            err.context?.source === 'react-query' &&
            JSON.stringify(err.context?.queryKey || []).includes(JSON.stringify(queryKey))
        );
      },
      enabled: false,
      initialData: [],
    });
  };

  /**
   * Hook for retrying failed queries
   */
  const useRetryQuery = (queryKey: string[]) => {
    return useMutation({
      mutationFn: async () => {
        await queryClient.refetchQueries({
          queryKey,
          type: 'active',
        });
      },
      onSuccess: () => {
        // Remove errors for this query
        const queryErrors = errors.filter(
          err =>
            err.context?.source === 'react-query' &&
            JSON.stringify(err.context?.queryKey || []).includes(JSON.stringify(queryKey))
        );
        queryErrors.forEach(err => removeError(err.id));
      },
    });
  };

  /**
   * Hook for clearing query errors
   */
  const useClearQueryErrors = (queryKey: string[]) => {
    return useMutation({
      mutationFn: () => {
        const queryErrors = errors.filter(
          err =>
            err.context?.source === 'react-query' &&
            JSON.stringify(err.context?.queryKey || []).includes(JSON.stringify(queryKey))
        );
        queryErrors.forEach(err => removeError(err.id));
      },
    });
  };

  /**
   * Hook for global error handling
   */
  const useGlobalErrorHandler = () => {
    const handleQueryError = (error: Error, query: unknown) => {
      const queryWithKey = query as { queryKey: string[] };
      const appError = convertToAppError(error, {
        source: 'react-query',
        action: 'query',
        location: queryWithKey.queryKey.join(','),
      });
      addError(appError);
    };

    const handleMutationError = (error: Error, _variables: unknown, context: unknown) => {
      const contextWithKey = context as { mutationKey?: string[] };
      const appError = convertToAppError(error, {
        source: 'react-query',
        action: 'mutation',
        location: contextWithKey?.mutationKey?.join(','),
      });
      addError(appError);
    };

    return {
      handleQueryError,
      handleMutationError,
    };
  };

  /**
   * Hook for error statistics
   */
  const useErrorStats = () => {
    return useQuery({
      queryKey: ['error-stats'],
      queryFn: () => {
        const stats = {
          total: errors.length,
          byCategory: {} as Record<string, number>,
          bySeverity: {} as Record<string, number>,
          bySource: {} as Record<string, number>,
          retryable: 0,
          nonRetryable: 0,
        };

        errors.forEach(error => {
          // By category
          stats.byCategory[error.category] = (stats.byCategory[error.category] ?? 0) + 1;

          // By severity
          stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] ?? 0) + 1;

          // By source
          const source =
            ((error.context as Record<string, unknown>)?.source as string) || 'unknown';
          stats.bySource[source] = (stats.bySource[source] ?? 0) + 1;

          // By retryable
          if (error.retryable) {
            stats.retryable++;
          } else {
            stats.nonRetryable++;
          }
        });

        return stats;
      },
      enabled: false,
      initialData: {
        total: 0,
        byCategory: {},
        bySeverity: {},
        bySource: {},
        retryable: 0,
        nonRetryable: 0,
      },
    });
  };

  return {
    useQueryWithErrorHandling,
    useMutationWithErrorHandling,
    useQueryErrors,
    useRetryQuery,
    useClearQueryErrors,
    useGlobalErrorHandler,
    useErrorStats,
    convertToAppError,
  };
};

/**
 * Higher-order component for error boundary integration
 */
export const withQueryErrorHandling = (Component: React.ComponentType<unknown>) => {
  return function WithQueryErrorHandling(props: unknown) {
    const { handleQueryError, handleMutationError } =
      useQueryErrorHandling().useGlobalErrorHandler();
    const queryClient = useQueryClient();

    React.useEffect(() => {
      // Set up global error handlers
      const unsubscribe = queryClient.getQueryCache().subscribe(event => {
        const eventWithAction = event as {
          type: string;
          action?: string;
          query: { state: { error: Error } };
        };
        if (event.type === 'updated' && eventWithAction.action === 'error') {
          handleQueryError(event.query.state.error, event.query);
        }
      });

      const unsubscribeMutations = queryClient.getMutationCache().subscribe(event => {
        const eventWithAction = event as {
          type: string;
          action?: string;
          mutation: { state: { error: Error; variables: unknown } };
        };
        if (event.type === 'updated' && eventWithAction.action === 'error') {
          handleMutationError(
            event.mutation.state.error,
            event.mutation.state.variables,
            event.mutation.state.context
          );
        }
      });

      return () => {
        unsubscribe();
        unsubscribeMutations();
      };
    }, [queryClient, handleQueryError, handleMutationError]);

    return React.createElement(Component as React.ComponentType<unknown>, props as unknown);
  };
};
