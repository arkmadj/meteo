/**
 * Type-safe async state management hook
 * Handles loading, error, and success states with proper cleanup
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
}

export interface AsyncStateOptions<T> {
  /** Initial data value */
  initialData?: T | null;
  /** Whether to execute immediately on mount */
  immediate?: boolean;
  /** Custom error handler */
  onError?: (error: Error) => void;
  /** Custom success handler */
  onSuccess?: (data: T) => void;
  /** Retry configuration */
  retry?: {
    attempts: number;
    delay: number;
  };
  /** Cache duration in milliseconds */
  cacheDuration?: number;
}

export interface AsyncStateActions<T> {
  /** Execute the async operation */
  execute: () => Promise<void>;
  /** Reset state to initial values */
  reset: () => void;
  /** Set data directly */
  setData: (data: T | null) => void;
  /** Set error directly */
  setError: (error: Error | null) => void;
  /** Retry the last operation */
  retry: () => Promise<void>;
}

export type AsyncStateReturn<T> = AsyncState<T> & AsyncStateActions<T>;

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Custom hook for managing async operations with type safety
 * 
 * @param asyncFunction - The async function to execute
 * @param dependencies - Dependencies that trigger re-execution
 * @param options - Configuration options
 * @returns Object with state and actions
 * 
 * @example
 * ```tsx
 * const { data, loading, error, execute } = useAsyncState(
 *   () => fetchUser(userId),
 *   [userId],
 *   { immediate: true }
 * );
 * ```
 */
export function useAsyncState<T>(
  asyncFunction: () => Promise<T>,
  dependencies: React.DependencyList = [],
  options: AsyncStateOptions<T> = {}
): AsyncStateReturn<T> {
  const {
    initialData = null,
    immediate = false,
    onError,
    onSuccess,
    retry: retryConfig,
    cacheDuration,
  } = options;

  // State management
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  // Refs for cleanup and retry
  const cancelRef = useRef<boolean>(false);
  const retryCountRef = useRef<number>(0);
  const lastAsyncFunctionRef = useRef(asyncFunction);
  const cacheRef = useRef<{ data: T; timestamp: number } | null>(null);

  // Update function ref when it changes
  lastAsyncFunctionRef.current = asyncFunction;

  // Check if cached data is still valid
  const isCacheValid = useCallback(() => {
    if (!cacheDuration || !cacheRef.current) return false;
    return Date.now() - cacheRef.current.timestamp < cacheDuration;
  }, [cacheDuration]);

  // Execute async operation with proper error handling and cleanup
  const execute = useCallback(async (): Promise<void> => {
    // Check cache first
    if (isCacheValid() && cacheRef.current) {
      setState(prev => ({
        ...prev,
        data: cacheRef.current!.data,
        loading: false,
        error: null,
        lastUpdated: new Date(cacheRef.current!.timestamp),
      }));
      return;
    }

    cancelRef.current = false;
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await lastAsyncFunctionRef.current();
      
      // Check if component is still mounted and operation wasn't cancelled
      if (!cancelRef.current) {
        const now = new Date();
        
        // Update cache
        if (cacheDuration) {
          cacheRef.current = { data: result, timestamp: now.getTime() };
        }

        setState({
          data: result,
          loading: false,
          error: null,
          lastUpdated: now,
        });

        // Call success handler
        onSuccess?.(result);
        retryCountRef.current = 0;
      }
    } catch (error) {
      if (!cancelRef.current) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorObj,
          lastUpdated: new Date(),
        }));

        // Call error handler
        onError?.(errorObj);
      }
    }
  }, [isCacheValid, cacheDuration, onSuccess, onError]);

  // Retry with exponential backoff
  const retry = useCallback(async (): Promise<void> => {
    if (!retryConfig || retryCountRef.current >= retryConfig.attempts) {
      return execute();
    }

    retryCountRef.current += 1;
    const delay = retryConfig.delay * Math.pow(2, retryCountRef.current - 1);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return execute();
  }, [execute, retryConfig]);

  // Reset state to initial values
  const reset = useCallback(() => {
    cancelRef.current = true;
    retryCountRef.current = 0;
    cacheRef.current = null;
    setState({
      data: initialData,
      loading: false,
      error: null,
      lastUpdated: null,
    });
  }, [initialData]);

  // Set data directly
  const setData = useCallback((data: T | null) => {
    setState(prev => ({
      ...prev,
      data,
      lastUpdated: new Date(),
    }));
  }, []);

  // Set error directly
  const setError = useCallback((error: Error | null) => {
    setState(prev => ({
      ...prev,
      error,
      lastUpdated: new Date(),
    }));
  }, []);

  // Execute on dependency change
  useEffect(() => {
    if (immediate) {
      execute();
    }

    // Cleanup function
    return () => {
      cancelRef.current = true;
    };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  return {
    // State
    data: state.data,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    // Actions
    execute,
    reset,
    setData,
    setError,
    retry,
  };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Simplified version for basic async operations
 */
export function useSimpleAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: React.DependencyList = []
) {
  return useAsyncState(asyncFunction, dependencies, { immediate: true });
}

/**
 * Version with automatic retry on error
 */
export function useAsyncWithRetry<T>(
  asyncFunction: () => Promise<T>,
  dependencies: React.DependencyList = [],
  maxRetries: number = 3
) {
  return useAsyncState(asyncFunction, dependencies, {
    immediate: true,
    retry: { attempts: maxRetries, delay: 1000 },
  });
}
