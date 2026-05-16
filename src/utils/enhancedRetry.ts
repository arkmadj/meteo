/**
 * Enhanced Retry Strategies with Circuit Breaker Integration
 * Provides sophisticated retry mechanisms with exponential backoff and jitter
 */

import { CircuitBreaker, type CircuitBreakerConfig } from './circuitBreaker';
import { getLogger } from './logger';

const logger = getLogger('EnhancedRetry');

export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Initial delay in ms */
  initialDelay: number;
  /** Maximum delay in ms */
  maxDelay: number;
  /** Backoff multiplier */
  backoffMultiplier: number;
  /** Add random jitter to prevent thundering herd */
  jitter: boolean;
  /** Function to determine if error is retryable */
  isRetryable?: (error: unknown) => boolean;
  /** Callback before each retry */
  onRetry?: (attempt: number, error: unknown) => void;
  /** Circuit breaker configuration */
  circuitBreaker?: CircuitBreakerConfig;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: unknown;
  attempts: number;
  totalDuration: number;
}

const defaultRetryConfig: Partial<RetryConfig> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
};

/**
 * Check if an error is retryable by default
 */
const defaultIsRetryable = (error: unknown): boolean => {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  // HTTP errors
  if (typeof error === 'object' && error !== null) {
    const status = (error as { status?: number }).status;
    // Retry on 5xx server errors and 429 rate limit
    return status ? status >= 500 || status === 429 : false;
  }

  return false;
};

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  multiplier: number,
  useJitter: boolean
): number {
  const exponentialDelay = Math.min(initialDelay * Math.pow(multiplier, attempt - 1), maxDelay);

  if (!useJitter) {
    return exponentialDelay;
  }

  // Add jitter: random value between 0.5x and 1.5x of calculated delay
  const jitter = 0.5 + Math.random();
  return Math.min(exponentialDelay * jitter, maxDelay);
}

/**
 * Sleep for specified duration
 */
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Execute a function with retry logic and optional circuit breaker
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<RetryResult<T>> {
  const mergedConfig: RetryConfig = {
    ...defaultRetryConfig,
    ...config,
    isRetryable: config.isRetryable || defaultIsRetryable,
  } as RetryConfig;

  const startTime = Date.now();
  let lastError: unknown;
  let circuitBreaker: CircuitBreaker | undefined;

  // Create circuit breaker if configured
  if (mergedConfig.circuitBreaker) {
    circuitBreaker = new CircuitBreaker(mergedConfig.circuitBreaker);
  }

  for (let attempt = 1; attempt <= mergedConfig.maxAttempts; attempt++) {
    try {
      // Execute with or without circuit breaker
      const result = circuitBreaker ? await circuitBreaker.execute(fn) : await fn();

      return {
        success: true,
        data: result,
        attempts: attempt,
        totalDuration: Date.now() - startTime,
      };
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      const isRetryable = mergedConfig.isRetryable?.(error) ?? false;

      logger.warn(`Attempt ${attempt}/${mergedConfig.maxAttempts} failed`, {
        error: error instanceof Error ? error.message : String(error),
        retryable: isRetryable,
      });

      // If not retryable or last attempt, fail immediately
      if (!isRetryable || attempt === mergedConfig.maxAttempts) {
        break;
      }

      // Call retry callback
      mergedConfig.onRetry?.(attempt, error);

      // Calculate delay for next attempt
      const delay = calculateDelay(
        attempt,
        mergedConfig.initialDelay,
        mergedConfig.maxDelay,
        mergedConfig.backoffMultiplier,
        mergedConfig.jitter
      );

      logger.info(`Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: mergedConfig.maxAttempts,
    totalDuration: Date.now() - startTime,
  };
}

/**
 * Retry decorator for async functions
 */
export function retryable<T extends (...args: unknown[]) => Promise<unknown>>(
  config: Partial<RetryConfig> = {}
) {
  return function (_target: unknown, _propertyKey: string, descriptor: TypedPropertyDescriptor<T>) {
    const originalMethod = descriptor.value;

    if (!originalMethod) {
      return descriptor;
    }

    descriptor.value = async function (this: unknown, ...args: Parameters<T>) {
      const result = await withRetry(() => originalMethod.apply(this, args), config);

      if (!result.success) {
        throw result.error;
      }

      return result.data;
    } as T;

    return descriptor;
  };
}
