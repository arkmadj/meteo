/**
 * Type definitions for the retry mechanism
 */

import type { AppError, ErrorType } from '@/types/error';

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Base delay in milliseconds between retries */
  baseDelay: number;
  /** Maximum delay in milliseconds (optional) */
  maxDelay?: number;
  /** Backoff multiplier factor (default: 2 for exponential) */
  backoffFactor: number;
  /** Whether to add jitter to prevent thundering herd */
  jitter?: boolean;
  /** Jitter factor as a percentage of delay (default: 0.1) */
  jitterFactor?: number;
  /** Specific error types that are retryable */
  retryableErrors?: ErrorType[];
  /** Callback called before each retry attempt */
  onRetry?: (attempt: number, error: unknown) => void;
  /** Custom function to determine if retry should occur */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  /** Timeout in milliseconds for each attempt */
  timeout?: number;
}

export interface RetryResult<T> {
  /** Whether the operation succeeded */
  success: boolean;
  /** The successful result data (if success) */
  data?: T;
  /** The error that occurred (if failure) */
  error?: AppError;
  /** Number of attempts made */
  attempts: number;
  /** Total time spent in milliseconds */
  totalTime: number;
}

export type BackoffStrategy = 'exponential' | 'linear' | 'fixed';

// ============================================================================
// FUNCTION TYPES
// ============================================================================

export type RetryFunction<T = unknown> = () => Promise<T>;

export type RetryWithConfigFunction<T = unknown> = (
  fn: RetryFunction<T>,
  config?: Partial<RetryConfig>
) => Promise<T>;

export type RetryWithResultFunction<T = unknown> = (
  fn: RetryFunction<T>,
  config?: Partial<RetryConfig>
) => Promise<RetryResult<T>>;

// ============================================================================
// PRECONFIGURED RETRY FUNCTIONS
// ============================================================================

export interface NetworkRetryConfig extends Omit<RetryConfig, 'retryableErrors'> {
  /** Network-specific retry configuration */
}

export interface ApiRetryConfig extends Omit<RetryConfig, 'retryableErrors'> {
  /** API-specific retry configuration */
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type RetryableErrorType =
  | ErrorType.NETWORK_ERROR
  | ErrorType.TIMEOUT_ERROR
  | ErrorType.API_ERROR
  | ErrorType.RATE_LIMIT_ERROR
  | ErrorType.WEATHER_DATA_ERROR
  | ErrorType.GEOCODING_ERROR;

export type NonRetryableErrorType =
  | ErrorType.CITY_NOT_FOUND
  | ErrorType.DEFAULT_CITY_NOT_FOUND
  | ErrorType.INVALID_COORDINATES
  | ErrorType.PARSING_ERROR
  | ErrorType.UNKNOWN_ERROR;

/**
 * Type guard for retryable errors
 */
export function isRetryableErrorType(type: ErrorType): type is RetryableErrorType {
  const retryableTypes: Set<ErrorType> = new Set([
    ErrorType.NETWORK_ERROR,
    ErrorType.TIMEOUT_ERROR,
    ErrorType.API_ERROR,
    ErrorType.RATE_LIMIT_ERROR,
    ErrorType.WEATHER_DATA_ERROR,
    ErrorType.GEOCODING_ERROR,
  ]);

  return retryableTypes.has(type);
}

/**
 * Type guard for non-retryable errors
 */
export function isNonRetryableErrorType(type: ErrorType): type is NonRetryableErrorType {
  return !isRetryableErrorType(type);
}

// ============================================================================
// CIRCUIT BREAKER TYPES
// ============================================================================

export interface CircuitBreakerConfig {
  /** Number of failures before opening circuit */
  failureThreshold: number;
  /** Time in milliseconds to attempt recovery */
  recoveryTimeout: number;
  /** Time window in milliseconds to track failures */
  monitoringPeriod: number;
}

export interface CircuitBreakerState {
  /** Current state of the circuit breaker */
  state: 'closed' | 'open' | 'half-open';
  /** Number of failures in current window */
  failureCount: number;
  /** Timestamp of last failure */
  lastFailureTime?: number;
  /** Timestamp when circuit opened */
  openedAt?: number;
}

// ============================================================================
// ADVANCED RETRY TYPES
// ============================================================================

export interface RetryContext {
  /** Current attempt number */
  attempt: number;
  /** Maximum retry attempts */
  maxRetries: number;
  /** Total elapsed time in milliseconds */
  elapsedTime: number;
  /** Last error that occurred */
  lastError?: unknown;
}

export interface RetryCondition {
  /** Function to determine if retry should occur */
  condition: (error: unknown, context: RetryContext) => boolean;
  /** Optional error message for why retry won't occur */
  message?: string;
}

export interface RetryStrategy {
  /** Strategy name for identification */
  name: string;
  /** Configuration for this strategy */
  config: RetryConfig;
  /** Custom retry conditions */
  conditions?: RetryCondition[];
}

/**
 * Predefined retry strategies
 */
export const RetryStrategies = {
  /** Conservative strategy for critical operations */
  conservative: {
    name: 'conservative',
    config: {
      maxRetries: 2,
      baseDelay: 1000,
      maxDelay: 5000,
      backoffFactor: 2,
      jitter: true,
    },
  },

  /** Aggressive strategy for non-critical operations */
  aggressive: {
    name: 'aggressive',
    config: {
      maxRetries: 5,
      baseDelay: 200,
      maxDelay: 2000,
      backoffFactor: 1.5,
      jitter: true,
    },
  },

  /** Quick strategy for user-facing operations */
  quick: {
    name: 'quick',
    config: {
      maxRetries: 3,
      baseDelay: 100,
      maxDelay: 1000,
      backoffFactor: 2,
      jitter: false,
    },
  },
} as const;
