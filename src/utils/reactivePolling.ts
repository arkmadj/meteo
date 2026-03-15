/**
 * Reactive Polling System
 *
 * A sophisticated polling system that observes a target condition and terminates
 * polling once the condition is fulfilled, ensuring efficient resource usage.
 *
 * Features:
 * - Condition-based termination
 * - Adaptive polling intervals with backoff
 * - Cancellation token support
 * - Timeout protection
 * - Resource cleanup
 * - Observable pattern integration
 */

import { CancellationToken, CancellationTokenSource } from './cancellationToken';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * Result of a polling operation
 */
export interface PollingResult<T> {
  /** The polled data */
  data: T;
  /** Whether the condition was met */
  conditionMet: boolean;
  /** Number of polling attempts made */
  attempts: number;
  /** Total time elapsed in milliseconds */
  elapsedMs: number;
  /** Whether polling was cancelled */
  cancelled: boolean;
  /** Whether polling timed out */
  timedOut: boolean;
}

/**
 * Configuration for reactive polling
 */
export interface ReactivePollingConfig<T> {
  /** Function to fetch data */
  pollFn: () => Promise<T>;

  /** Condition to check if polling should stop */
  conditionFn: (data: T, attempt: number) => boolean | Promise<boolean>;

  /** Initial polling interval in milliseconds (default: 1000) */
  initialInterval?: number;

  /** Maximum polling interval in milliseconds (default: 30000) */
  maxInterval?: number;

  /** Backoff multiplier for adaptive intervals (default: 1.5) */
  backoffMultiplier?: number;

  /** Maximum number of polling attempts (default: Infinity) */
  maxAttempts?: number;

  /** Maximum total time to poll in milliseconds (default: Infinity) */
  maxDuration?: number;

  /** Cancellation token for external cancellation */
  cancellationToken?: CancellationToken;

  /** Callback invoked on each poll attempt */
  onPoll?: (data: T, attempt: number) => void;

  /** Callback invoked when condition is met */
  onConditionMet?: (data: T, result: PollingResult<T>) => void;

  /** Callback invoked on error */
  onError?: (error: Error, attempt: number) => void;

  /** Whether to continue polling on errors (default: true) */
  continueOnError?: boolean;

  /** Whether to use exponential backoff (default: true) */
  useBackoff?: boolean;

  /** Jitter factor for randomizing intervals (default: 0.1) */
  jitterFactor?: number;
}

/**
 * Subscription for reactive polling
 */
export interface PollingSubscription {
  /** Unsubscribe from polling */
  unsubscribe: () => void;

  /** Check if polling is active */
  isActive: () => boolean;

  /** Get current polling statistics */
  getStats: () => {
    attempts: number;
    elapsedMs: number;
    isActive: boolean;
  };
}

// ============================================================================
// CORE POLLING FUNCTION
// ============================================================================

/**
 * Start reactive polling that terminates when a condition is met
 *
 * @param config - Polling configuration
 * @returns Promise that resolves when condition is met or polling is stopped
 *
 * @example
 * ```typescript
 * const result = await pollUntilCondition({
 *   pollFn: () => fetchJobStatus(jobId),
 *   conditionFn: (status) => status.state === 'completed',
 *   initialInterval: 1000,
 *   maxDuration: 60000,
 *   onPoll: (status, attempt) => {
 *     console.log(`Attempt ${attempt}: ${status.state}`);
 *   },
 * });
 * ```
 */
export async function pollUntilCondition<T>(
  config: ReactivePollingConfig<T>
): Promise<PollingResult<T>> {
  const {
    pollFn,
    conditionFn,
    initialInterval = 1000,
    maxInterval = 30000,
    backoffMultiplier = 1.5,
    maxAttempts = Infinity,
    maxDuration = Infinity,
    cancellationToken,
    onPoll,
    onConditionMet,
    onError,
    continueOnError = true,
    useBackoff = true,
    jitterFactor = 0.1,
  } = config;

  const startTime = Date.now();
  let attempts = 0;
  let currentInterval = initialInterval;
  let lastData: T | undefined;
  let cancelled = false;
  let timedOut = false;

  // Create internal cancellation token if not provided
  const internalTokenSource = new CancellationTokenSource();
  const effectiveToken = cancellationToken || internalTokenSource;

  try {
    while (attempts < maxAttempts) {
      // Check cancellation
      if (effectiveToken.isCancelled) {
        cancelled = true;
        break;
      }

      // Check timeout
      const elapsed = Date.now() - startTime;
      if (elapsed >= maxDuration) {
        timedOut = true;
        break;
      }

      attempts++;

      try {
        // Poll for data
        lastData = await pollFn();

        // Invoke poll callback
        if (onPoll) {
          onPoll(lastData, attempts);
        }

        // Check condition
        const conditionMet = await conditionFn(lastData, attempts);

        if (conditionMet) {
          const result: PollingResult<T> = {
            data: lastData,
            conditionMet: true,
            attempts,
            elapsedMs: Date.now() - startTime,
            cancelled: false,
            timedOut: false,
          };

          // Invoke condition met callback
          if (onConditionMet) {
            onConditionMet(lastData, result);
          }

          return result;
        }
      } catch (error) {
        // Handle polling error
        if (onError) {
          onError(error as Error, attempts);
        }

        if (!continueOnError) {
          throw error;
        }
      }

      // Calculate next interval with backoff and jitter
      if (useBackoff && attempts > 1) {
        currentInterval = Math.min(currentInterval * backoffMultiplier, maxInterval);
      }

      // Apply jitter to prevent thundering herd
      const jitter = currentInterval * jitterFactor * (Math.random() - 0.5) * 2;
      const nextInterval = Math.max(0, currentInterval + jitter);

      // Wait for next poll with cancellation support
      await sleep(nextInterval, effectiveToken);
    }

    // Polling stopped without condition being met
    return {
      data: lastData!,
      conditionMet: false,
      attempts,
      elapsedMs: Date.now() - startTime,
      cancelled,
      timedOut,
    };
  } finally {
    // Cleanup
    if (!cancellationToken) {
      internalTokenSource.cancel('Polling completed');
    }
  }
}

// ============================================================================
// SUBSCRIPTION-BASED POLLING
// ============================================================================

/**
 * Create a subscription-based polling system
 *
 * @param config - Polling configuration
 * @returns Subscription object for managing the polling
 *
 * @example
 * ```typescript
 * const subscription = createPollingSubscription({
 *   pollFn: () => fetchData(),
 *   conditionFn: (data) => data.ready,
 *   onPoll: (data) => console.log('Polled:', data),
 *   onConditionMet: (data) => console.log('Ready!', data),
 * });
 *
 * // Later, cancel polling
 * subscription.unsubscribe();
 * ```
 */
export function createPollingSubscription<T>(
  config: ReactivePollingConfig<T>
): PollingSubscription {
  const tokenSource = new CancellationTokenSource();
  const startTime = Date.now();
  let attempts = 0;
  let isActive = true;

  // Start polling in background
  const pollingPromise = pollUntilCondition({
    ...config,
    cancellationToken: tokenSource,
    onPoll: (data, attempt) => {
      attempts = attempt;
      config.onPoll?.(data, attempt);
    },
  }).finally(() => {
    isActive = false;
  });

  // Handle unhandled rejections
  pollingPromise.catch(() => {
    // Errors are handled by onError callback
  });

  return {
    unsubscribe: () => {
      if (isActive) {
        tokenSource.cancel('Unsubscribed');
        isActive = false;
      }
    },
    isActive: () => isActive,
    getStats: () => ({
      attempts,
      elapsedMs: Date.now() - startTime,
      isActive,
    }),
  };
}

// ============================================================================
// OBSERVABLE PATTERN INTEGRATION
// ============================================================================

/**
 * Observer interface for polling updates
 */
export interface PollingObserver<T> {
  next?: (data: T, attempt: number) => void;
  error?: (error: Error, attempt: number) => void;
  complete?: (result: PollingResult<T>) => void;
}

/**
 * Create an observable polling system
 *
 * @param config - Polling configuration
 * @returns Observable-like object
 *
 * @example
 * ```typescript
 * const observable = createPollingObservable({
 *   pollFn: () => fetchStatus(),
 *   conditionFn: (status) => status.complete,
 * });
 *
 * const subscription = observable.subscribe({
 *   next: (data) => console.log('Update:', data),
 *   error: (err) => console.error('Error:', err),
 *   complete: (result) => console.log('Done:', result),
 * });
 * ```
 */
export function createPollingObservable<T>(
  config: Omit<ReactivePollingConfig<T>, 'onPoll' | 'onError' | 'onConditionMet'>
) {
  return {
    subscribe: (observer: PollingObserver<T>): PollingSubscription => {
      return createPollingSubscription({
        ...config,
        onPoll: observer.next,
        onError: observer.error,
        onConditionMet: (data, result) => {
          observer.complete?.(result);
        },
      });
    },
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Sleep with cancellation support
 */
async function sleep(ms: number, cancellationToken?: CancellationToken): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      resolve();
    }, ms);

    // Register cancellation callback
    if (cancellationToken) {
      const unregister = cancellationToken.register(() => {
        clearTimeout(timeoutId);
        reject(new Error('Sleep cancelled'));
      });

      // Cleanup registration when sleep completes
      const originalResolve = resolve;
      resolve = () => {
        unregister();
        originalResolve();
      };
    }
  });
}

// ============================================================================
// PRECONFIGURED POLLING STRATEGIES
// ============================================================================

/**
 * Poll with linear backoff (constant intervals)
 */
export function pollWithLinearBackoff<T>(
  pollFn: () => Promise<T>,
  conditionFn: (data: T) => boolean | Promise<boolean>,
  intervalMs: number = 1000,
  maxAttempts: number = 30
): Promise<PollingResult<T>> {
  return pollUntilCondition({
    pollFn,
    conditionFn,
    initialInterval: intervalMs,
    maxInterval: intervalMs,
    useBackoff: false,
    maxAttempts,
  });
}

/**
 * Poll with exponential backoff
 */
export function pollWithExponentialBackoff<T>(
  pollFn: () => Promise<T>,
  conditionFn: (data: T) => boolean | Promise<boolean>,
  initialIntervalMs: number = 1000,
  maxIntervalMs: number = 30000,
  maxDurationMs: number = 300000
): Promise<PollingResult<T>> {
  return pollUntilCondition({
    pollFn,
    conditionFn,
    initialInterval: initialIntervalMs,
    maxInterval: maxIntervalMs,
    maxDuration: maxDurationMs,
    useBackoff: true,
    backoffMultiplier: 2,
  });
}

/**
 * Poll with aggressive backoff for quick operations
 */
export function pollQuick<T>(
  pollFn: () => Promise<T>,
  conditionFn: (data: T) => boolean | Promise<boolean>,
  maxDurationMs: number = 30000
): Promise<PollingResult<T>> {
  return pollUntilCondition({
    pollFn,
    conditionFn,
    initialInterval: 100,
    maxInterval: 2000,
    maxDuration: maxDurationMs,
    useBackoff: true,
    backoffMultiplier: 1.5,
  });
}
