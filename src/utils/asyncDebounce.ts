/**
 * Advanced async debouncing utilities with race condition protection
 * for operations that have side effects
 */

import { CancellationTokenSource } from './cancellationToken';

// ============================================================================
// BASIC ASYNC DEBOUNCE
// ============================================================================

/**
 * Debounces an async function, cancelling previous executions
 * to prevent race conditions with side effects
 */
export function debounceAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  func: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let cancelSource: CancellationTokenSource | undefined;

  return function (this: unknown, ...args: Parameters<T>): Promise<ReturnType<T>> {
    // Cancel previous operation
    if (cancelSource) {
      cancelSource.cancel('Debounced - new operation started');
    }
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Create new cancellation token
    cancelSource = new CancellationTokenSource();

    return new Promise<ReturnType<T>>((resolve, reject) => {
      timeoutId = setTimeout(() => {
        void (async () => {
          try {
            const result = await func.apply(this, args);
            if (!cancelSource.isCancellationRequested) {
              resolve(result);
            }
          } catch (error) {
            if (!cancelSource.isCancellationRequested) {
              reject(error);
            }
          }
        })();
      }, delay);
    });
  };
}

// ============================================================================
// LEADING/TRAILING DEBOUNCE
// ============================================================================

export interface DebounceAsyncOptions {
  /** Execute on leading edge instead of trailing */
  leading?: boolean;
  /** Maximum time to wait before executing (for long-running operations) */
  maxWait?: number;
  /** Custom cancellation token source */
  tokenSource?: () => CancellationTokenSource;
}

/**
 * Advanced async debounce with leading/trailing edge execution
 */
export function createAsyncDebounce<T extends (...args: unknown[]) => Promise<unknown>>(
  func: T,
  delay: number,
  options: DebounceAsyncOptions = {}
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  const { leading = false, maxWait, tokenSource } = options;

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let maxTimeoutId: ReturnType<typeof setTimeout> | undefined;
  let cancelSource: CancellationTokenSource | undefined;
  let _lastCallTime: number;
  let lastInvokeTime = 0;
  let lastArgs: Parameters<T> | undefined;
  let lastThis: unknown;
  let result: ReturnType<T>;

  return function (this: unknown, ...args: Parameters<T>): Promise<ReturnType<T>> {
    const time = Date.now();
    const isInvoking = time - lastInvokeTime > delay;

    lastArgs = args;
    lastThis = this;
    _lastCallTime = time;

    // Cancel previous operation
    if (cancelSource) {
      cancelSource.cancel('New operation started');
    }
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Create new cancellation source
    cancelSource = tokenSource ? tokenSource() : new CancellationTokenSource();

    const invokeFunc = async () => {
      if (!cancelSource?.isCancellationRequested && lastArgs) {
        try {
          result = await func.apply(lastThis, lastArgs);
          lastInvokeTime = Date.now();
          return result;
        } catch (error) {
          if (!cancelSource?.isCancellationRequested) {
            throw error;
          }
        }
      }
    };

    // Leading edge execution
    if (leading && isInvoking) {
      return invokeFunc();
    }

    // Trailing edge execution
    return new Promise<ReturnType<T>>((resolve, reject) => {
      timeoutId = setTimeout(
        () => {
          void (async () => {
            try {
              const result = await invokeFunc();
              if (!cancelSource?.isCancellationRequested) {
                resolve(result);
              }
            } catch (error) {
              if (!cancelSource?.isCancellationRequested) {
                reject(error);
              }
            }
          })();
        },
        delay - (time - lastInvokeTime)
      );

      // Max wait timeout
      if (maxWait && !maxTimeoutId) {
        maxTimeoutId = setTimeout(
          () => {
            void (async () => {
              if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = undefined;
              }
              try {
                const result = await invokeFunc();
                if (!cancelSource?.isCancellationRequested) {
                  resolve(result);
                }
              } catch (error) {
                if (!cancelSource?.isCancellationRequested) {
                  reject(error);
                }
              } finally {
                maxTimeoutId = undefined;
              }
            })();
          },
          maxWait - (time - lastInvokeTime)
        );
      }
    });
  };
}

// ============================================================================
// SIDE EFFECT MANAGER
// ============================================================================

export interface SideEffectManager<T> {
  /** Execute the operation with side effects */
  execute(...args: unknown[]): Promise<T>;
  /** Cancel any pending operations */
  cancel(): void;
  /** Check if there are pending operations */
  isPending(): boolean;
}

/**
 * Creates a side effect manager that ensures only one operation
 * completes successfully, preventing race conditions
 */
export function createSideEffectManager<T>(
  asyncFunction: (...args: unknown[]) => Promise<T>,
  options: {
    debounceDelay?: number;
    onSuccess?: (result: T) => void;
    onError?: (error: Error) => void;
    onCancel?: () => void;
  } = {}
): SideEffectManager<T> {
  const { debounceDelay = 300, onSuccess, onError, onCancel } = options;

  let currentOperation: Promise<T> | null = null;
  let cancelSource: CancellationTokenSource | null = null;
  let isPending = false;

  const execute = async (...args: unknown[]): Promise<T> => {
    // Cancel previous operation
    if (cancelSource) {
      cancelSource.cancel('New operation started');
      onCancel?.();
    }

    // Create new cancellation source
    cancelSource = new CancellationTokenSource();
    isPending = true;

    try {
      // Debounce the execution
      const debouncedFunc = debounceAsync(asyncFunction, debounceDelay);
      const operation = debouncedFunc(...args) as Promise<T>;
      currentOperation = operation;

      const result = await currentOperation;

      // Only process result if not cancelled
      if (!cancelSource.isCancellationRequested) {
        onSuccess?.(result);
        return result;
      }
    } catch (error) {
      if (cancelSource && !cancelSource.isCancellationRequested) {
        onError?.(error as Error);
        throw error;
      }
    } finally {
      isPending = false;
      cancelSource = null;
      currentOperation = null;
    }

    throw new Error('Operation was cancelled');
  };

  return {
    execute,
    cancel: () => {
      if (cancelSource) {
        cancelSource.cancel('Manually cancelled');
        onCancel?.();
      }
    },
    isPending: () => isPending,
  };
}
