/**
 * Weather App Example: Enhanced Task Orchestration with Custom Cancellation Tokens
 *
 * This example demonstrates how custom cancellation tokens can improve
 * the weather app's async operations compared to basic AbortController usage.
 */

import { useCallback, useEffect, useRef } from 'react';

import { ErrorType } from '../types/error';
import { Semaphore } from './asyncConcurrency';
import {
  anyToken,
  CancellationTokenSource,
  withTimeout,
  type CancellationToken,
} from './cancellationToken';
import { safeRetry } from './retry';

// ============================================================================
// ENHANCED WEATHER SERVICE WITH CANCELLATION TOKENS
// ============================================================================

export class EnhancedWeatherService {
  private apiSemaphore: Semaphore;
  private globalTokenSource: CancellationTokenSource;

  constructor(maxConcurrentApiCalls: number = 3) {
    this.apiSemaphore = new Semaphore(maxConcurrentApiCalls);
    this.globalTokenSource = new CancellationTokenSource();
  }

  /**
   * Fetch weather data with comprehensive cancellation support
   */
  async fetchWeatherData(
    location: string,
    options: {
      timeout?: number;
      enableRetry?: boolean;
      priority?: 'high' | 'normal' | 'low';
    } = {}
  ): Promise<unknown> {
    // Create operation-specific token
    const operationToken = this.globalTokenSource.createChild();

    // Create timeout token if specified
    const timeoutToken = options.timeout
      ? withTimeout(options.timeout, `Weather fetch timeout for ${location}`)
      : null;

    // Composite token - cancels if ANY source cancels
    const compositeToken = timeoutToken ? anyToken(operationToken, timeoutToken) : operationToken;

    // Apply semaphore for rate limiting
    await this.apiSemaphore.acquire();

    try {
      // Check cancellation before making request
      if (compositeToken.isCancellationRequested) {
        throw new Error(`Weather fetch cancelled: ${compositeToken.reason}`);
      }

      // Enhanced fetch with retry and cancellation
      const result = await this.fetchWithRetryAndCancellation(
        location,
        compositeToken,
        options.enableRetry !== false
      );

      return result;
    } finally {
      this.apiSemaphore.release();
    }
  }

  private async fetchWithRetryAndCancellation(
    location: string,
    token: CancellationToken,
    enableRetry: boolean = true
  ): Promise<unknown> {
    const fetchFunction = async () => {
      // Check cancellation before each attempt
      if (token.isCancellationRequested) {
        throw new Error(`Request cancelled: ${token.reason}`);
      }

      // Convert token to AbortSignal for fetch
      const abortSignal = this.toAbortSignal(token);

      const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`, {
        signal: abortSignal,
        headers: {
          Accept: 'application/json',
          'X-Priority': 'normal',
        },
      });

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    };

    if (enableRetry) {
      return safeRetry(fetchFunction, {
        maxRetries: 2,
        baseDelay: 1000,
        timeout: 15000, // Per-attempt timeout
        retryableErrors: [
          ErrorType.NETWORK_ERROR,
          ErrorType.TIMEOUT_ERROR,
          ErrorType.RATE_LIMIT_ERROR,
        ],
      });
    } else {
      return fetchFunction();
    }
  }

  private toAbortSignal(token: CancellationToken): AbortSignal {
    const controller = new AbortController();

    token.onCancelled(reason => {
      controller.abort(reason);
    });

    return controller.signal;
  }

  /**
   * Batch fetch multiple locations with coordinated cancellation
   */
  async fetchBatchWeatherData(
    locations: string[],
    options: {
      timeout?: number;
      maxConcurrent?: number;
      failFast?: boolean;
    } = {}
  ): Promise<Map<string, unknown>> {
    const batchToken = this.globalTokenSource.createChild();
    const timeoutToken = options.timeout
      ? withTimeout(options.timeout, 'Batch operation timeout')
      : null;

    const compositeToken = timeoutToken ? anyToken(batchToken, timeoutToken) : batchToken;

    const results = new Map<string, unknown>();
    const errors = new Map<string, Error>();

    // Use semaphore for concurrency control
    const semaphore = new Semaphore(options.maxConcurrent || 3);

    const promises = locations.map(async location => {
      await semaphore.acquire();

      try {
        const data = await this.fetchWeatherData(location, {
          timeout: 10000, // Individual request timeout
          enableRetry: true,
        });

        results.set(location, data);

        // Check cancellation after each success
        if (options.failFast && compositeToken.isCancellationRequested) {
          throw new Error(`Batch cancelled: ${compositeToken.reason}`);
        }
      } catch (error) {
        errors.set(location, error as Error);

        // Fail fast on first error if requested
        if (options.failFast) {
          batchToken.cancel(`Batch failed due to error in ${location}`);
        }
      } finally {
        semaphore.release();
      }
    });

    await Promise.all(promises);

    if (errors.size > 0 && results.size === 0) {
      // All requests failed
      throw new Error(
        `All weather requests failed: ${Array.from(errors.values())
          .map(e => e.message)
          .join(', ')}`
      );
    }

    return results;
  }

  /**
   * Cancel all ongoing operations
   */
  cancelAllOperations(reason: string = 'User requested cancellation'): void {
    this.globalTokenSource.cancel(reason);
  }

  /**
   * Reset the global token source for reuse
   */
  reset(): void {
    if (this.globalTokenSource.isCancellationCompleted) {
      this.globalTokenSource.reset();
    }
  }
}

// ============================================================================
// REACT HOOK WITH ENHANCED CANCELLATION
// ============================================================================

export function useEnhancedWeatherFetch() {
  const serviceRef = useRef<EnhancedWeatherService>();
  const operationTokensRef = useRef<Map<string, CancellationTokenSource>>(new Map());

  // Initialize service
  useEffect(() => {
    serviceRef.current = new EnhancedWeatherService(3);

    return () => {
      serviceRef.current?.cancelAllOperations('Component unmounted');
    };
  }, []);

  const fetchWeather = useCallback(
    async (
      location: string,
      options?: {
        timeout?: number;
        enableRetry?: boolean;
      }
    ) => {
      if (!serviceRef.current) {
        throw new Error('Weather service not initialized');
      }

      // Cancel previous request for this location
      const previousToken = operationTokensRef.current.get(location);
      if (previousToken && !previousToken.isCancellationCompleted) {
        previousToken.cancel('New request started');
      }

      // Create new operation token
      const operationToken = new CancellationTokenSource();
      operationTokensRef.current.set(location, operationToken);

      try {
        const result = await serviceRef.current.fetchWeatherData(location, options);

        // Clean up completed token
        operationTokensRef.current.delete(location);

        return result;
      } catch (error) {
        // Clean up token on error
        operationTokensRef.current.delete(location);
        throw error;
      }
    },
    []
  );

  const cancelLocation = useCallback((location: string) => {
    const token = operationTokensRef.current.get(location);
    if (token) {
      token.cancel('Location request cancelled');
      operationTokensRef.current.delete(location);
    }
  }, []);

  const cancelAll = useCallback(() => {
    serviceRef.current?.cancelAllOperations('User cancelled all requests');
    operationTokensRef.current.clear();
  }, []);

  return {
    fetchWeather,
    cancelLocation,
    cancelAll,
  };
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

export async function demonstrateWeatherService() {
  const service = new EnhancedWeatherService(2);

  try {
    // Single location fetch with timeout
    console.log('Fetching weather for New York...');
    const nyWeather = await service.fetchWeatherData('New York', {
      timeout: 5000,
      enableRetry: true,
    });
    console.log('NY Weather:', nyWeather);

    // Batch fetch with fail-fast
    console.log('Fetching batch weather data...');
    const locations = ['London', 'Tokyo', 'Paris', 'Sydney'];

    const batchResults = await service.fetchBatchWeatherData(locations, {
      timeout: 15000,
      maxConcurrent: 2,
      failFast: false, // Continue even if some fail
    });

    console.log('Batch Results:', batchResults);

    // Demonstrate cancellation
    console.log('Starting long operation...');
    const longOperation = service.fetchWeatherData('Remote Location', {
      timeout: 30000,
    });

    // Cancel after 2 seconds
    setTimeout(() => {
      service.cancelAllOperations('Demo cancellation');
    }, 2000);

    try {
      await longOperation;
    } catch (error) {
      console.log('Operation cancelled as expected:', (error as Error).message);
    }
  } catch (error) {
    console.error('Weather service error:', error);
  } finally {
    service.reset();
  }
}
