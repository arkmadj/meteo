/**
 * Integration of Result<T, E> patterns with existing error handling system
 * This bridges the new Result patterns with the existing AppError system
 */

import type { AppError } from '../types/error';
import { ErrorType } from '../types/error';
import type { AsyncResult, Result } from '../types/result';
import { Err, fromAsync, Ok } from '../types/result';
import { createErrorHandler } from '../utils/errorHandler';

// ============================================================================
// INTEGRATION TYPES
// ============================================================================

export type AppResult<T> = Result<T, AppError>;
export type AsyncAppResult<T> = AsyncResult<T, AppError>;

// ============================================================================
// APPERROR RESULT HELPERS
// ============================================================================

/**
 * Create a successful AppResult
 */
export const AppOk = <T>(data: T): AppResult<T> => Ok(data);

/**
 * Create a failed AppResult from an AppError
 */
export const AppErr = <T>(error: AppError): AppResult<T> => Err(error);

/**
 * Create a failed AppResult from an unknown error
 */
export const AppErrFrom = <T>(error: unknown, context?: Record<string, unknown>): AppResult<T> => {
  const errorHandler = createErrorHandler();
  return Err(errorHandler(error, context));
};

/**
 * Wrap an async operation with AppResult
 */
export const withAppError = async <T>(
  operation: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<Result<T, AppError>> => {
  return fromAsync(operation, error => {
    const errorHandler = createErrorHandler();
    return errorHandler(error, context);
  });
};

// ============================================================================
// WEATHER SERVICE EXAMPLES
// ============================================================================

export interface WeatherData {
  temperature: number;
  humidity: number;
  conditions: string;
  location: string;
  timestamp: Date;
}

export class WeatherService {
  /**
   * Fetch weather data with Result pattern
   */
  async fetchWeatherData(city: string): Promise<Result<WeatherData, AppError>> {
    return withAppError(
      async () => {
        const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return this.transformWeatherData(data, city);
      },
      { city, operation: 'fetchWeatherData' }
    );
  }

  /**
   * Fetch multiple cities with parallel error handling
   */
  async fetchMultipleCities(cities: string[]): Promise<Result<WeatherData[], AppError>> {
    const results = await Promise.allSettled(cities.map(city => this.fetchWeatherData(city)));

    const weatherData: WeatherData[] = [];
    const errors: AppError[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const city = cities[i];

      if (result.status === 'fulfilled') {
        if (result.value.success) {
          weatherData.push(result.value.data);
        } else {
          errors.push(result.value.error);
        }
      } else {
        const errorHandler = createErrorHandler();
        errors.push(
          errorHandler(result.reason, {
            city,
            operation: 'fetchWeatherData',
          })
        );
      }
    }

    if (errors.length > 0 && weatherData.length === 0) {
      // All requests failed
      return Err({
        id: `multi-fail-${Date.now()}`,
        type: ErrorType.WEATHER_DATA_ERROR,
        category: ErrorCategory.API,
        severity: ErrorSeverity.HIGH,
        message: `Failed to fetch weather data for all cities. Errors: ${errors.map(e => e.message).join(', ')}`,
        userMessage: 'Unable to fetch weather data for any of the requested cities',
        timestamp: Date.now(),
        retryable: true,
        context: { cities, errors },
        originalError: errors,
      });
    }

    if (errors.length > 0) {
      // Some requests failed, but we have partial success
      // You could return partial success or handle differently based on requirements
      console.warn('Partial failure in weather data fetch:', errors);
    }

    return Ok(weatherData);
  }

  /**
   * Validate and process weather data
   */
  async processWeatherData(input: unknown): Promise<Result<WeatherData, AppError>> {
    return withAppError(
      async () => {
        // Validate input
        if (!input || typeof input !== 'object') {
          throw new Error('Invalid weather data input');
        }

        const data = input as Record<string, unknown>;

        // Validate required fields
        if (!data.temperature || typeof data.temperature !== 'number') {
          throw new Error('Temperature is required and must be a number');
        }

        if (!data.location || typeof data.location !== 'string') {
          throw new Error('Location is required and must be a string');
        }

        return this.transformWeatherData(data, data.location);
      },
      { operation: 'processWeatherData' }
    );
  }

  private transformWeatherData(data: Record<string, unknown>, location: string): WeatherData {
    return {
      temperature: data.temperature as number,
      humidity: (data.humidity as number) || 0,
      conditions: (data.conditions as string) || 'Unknown',
      location,
      timestamp: new Date(),
    };
  }
}

// ============================================================================
// REACT HOOK INTEGRATION (TypeScript interfaces only)
// ============================================================================

export interface AppResultState<T> {
  data: T | null;
  error: AppError | null;
  isLoading: boolean;
  reset: () => void;
}

export declare const useAppResult: <T>(
  operation: () => AsyncAppResult<T>,
  dependencies: unknown[]
) => AppResultState<T>;

// ============================================================================
// SERVICE LAYER EXAMPLES
// ============================================================================

export class WeatherServiceWithResults {
  async getWeatherWithErrors(city: string): Promise<Result<WeatherData, AppError>> {
    return withAppError(
      async () => {
        const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return this.transformWeatherData(data, city);
      },
      { city, operation: 'getWeatherWithErrors' }
    );
  }

  async getMultipleCitiesWithResults(cities: string[]): Promise<Result<WeatherData[], AppError>> {
    const results = await Promise.allSettled(cities.map(city => this.getWeatherWithErrors(city)));

    const weatherData: WeatherData[] = [];
    const errors: AppError[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const city = cities[i];

      if (result.status === 'fulfilled') {
        if (result.value.success) {
          weatherData.push(result.value.data);
        } else {
          errors.push(result.value.error);
        }
      } else {
        const errorHandler = createErrorHandler();
        errors.push(
          errorHandler(result.reason, {
            city,
            operation: 'getWeatherWithErrors',
          })
        );
      }
    }

    if (errors.length > 0 && weatherData.length === 0) {
      return Err({
        id: `multi-fail-${Date.now()}`,
        type: ErrorType.WEATHER_DATA_ERROR,
        category: ErrorCategory.API,
        severity: ErrorSeverity.HIGH,
        message: `Failed to fetch weather data for all cities`,
        userMessage: 'Unable to fetch weather data for any of the requested cities',
        timestamp: Date.now(),
        retryable: true,
        context: { cities, errors },
        originalError: errors,
      });
    }

    return Ok(weatherData);
  }

  private transformWeatherData(data: Record<string, unknown>, location: string): WeatherData {
    return {
      temperature: data.temperature as number,
      humidity: (data.humidity as number) || 0,
      conditions: (data.conditions as string) || 'Unknown',
      location,
      timestamp: new Date(),
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert legacy async functions to Result pattern
 */
export const adaptLegacyFunction = async <T>(
  legacyFn: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<Result<T, AppError>> => {
  return withAppError(legacyFn, context);
};

/**
 * Batch operations with error aggregation
 */
export const batchOperations = async <T>(
  operations: Array<() => Promise<Result<T, AppError>>>,
  context?: Record<string, unknown>
): Promise<Result<T[], AppError>> => {
  const results = await Promise.allSettled(operations.map(op => op()));

  const successful: T[] = [];
  const failed: AppError[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];

    if (result.status === 'fulfilled') {
      if (result.value.success) {
        successful.push(result.value.data);
      } else {
        failed.push(result.value.error);
      }
    } else {
      const errorHandler = createErrorHandler();
      failed.push(errorHandler(result.reason, { ...context, index: i }));
    }
  }

  if (failed.length === 0) {
    return Ok(successful);
  }

  if (successful.length === 0) {
    return Err({
      id: `batch-fail-${Date.now()}`,
      type: ErrorType.UNKNOWN_ERROR,
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.HIGH,
      message: `All batch operations failed. Errors: ${failed.map(e => e.message).join(', ')}`,
      userMessage: 'All operations failed',
      timestamp: Date.now(),
      retryable: true,
      context: { ...context, failed },
      originalError: failed,
    });
  }

  // Partial success - return successful results with warning
  console.warn('Batch operation partially succeeded:', failed);
  return Ok(successful);
};
