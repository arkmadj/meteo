/**
 * Async Generator to Observable Conversion
 *
 * Type-safe conversion patterns for transforming async generators into consumable Observables
 * without requiring external libraries like RxJS.
 */

// ============================================================================
// BASIC OBSERVABLE IMPLEMENTATION
// ============================================================================

/**
 * Minimal Observable interface for demonstration
 */
export interface Observable<T> {
  subscribe(observer: Observer<T>): Subscription;
  subscribe(
    next?: (value: T) => void,
    error?: (error: Error) => void,
    complete?: () => void
  ): Subscription;
}

export interface Observer<T> {
  next: (value: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
}

export interface Subscription {
  unsubscribe(): void;
}

// ============================================================================
// ASYNC GENERATOR TO OBSERVABLE CONVERTER
// ============================================================================

/**
 * Converts an async generator to an Observable
 *
 * @param generator - The async generator function
 * @returns Observable that emits values from the generator
 *
 * @example
 * ```typescript
 * async function* fetchPages() {
 *   for (let page = 1; page <= 3; page++) {
 *     yield await fetchPage(page);
 *   }
 * }
 *
 * const observable = fromAsyncGenerator(fetchPages);
 * observable.subscribe({
 *   next: (data) => console.log('Received:', data),
 *   error: (err) => console.error('Error:', err),
 *   complete: () => console.log('Done!')
 * });
 * ```
 */
export function fromAsyncGenerator<T, TReturn = void, TNext = unknown>(
  generator: AsyncGenerator<T, TReturn, TNext>
): Observable<T> {
  return {
    subscribe(observerOrNext, error?, complete?): Subscription {
      // Handle different overload signatures
      const observer: Observer<T> =
        typeof observerOrNext === 'function'
          ? { next: observerOrNext, error, complete }
          : observerOrNext;

      let isCancelled = false;
      let isRunning = false;

      const run = async () => {
        if (isCancelled || isRunning) return;
        isRunning = true;

        try {
          for await (const value of generator) {
            if (isCancelled) break;
            observer.next(value);
          }

          if (!isCancelled) {
            observer.complete?.();
          }
        } catch (err) {
          if (!isCancelled) {
            observer.error?.(err instanceof Error ? err : new Error(String(err)));
          }
        } finally {
          isRunning = false;
        }
      };

      // Start the generator
      run().catch(console.error);

      return {
        unsubscribe() {
          isCancelled = true;
        },
      };
    },
  };
}

// ============================================================================
// TYPE-SAFE GENERATOR FACTORY
// ============================================================================

/**
 * Type-safe factory for creating async generators that can be converted to Observables
 */
export function createAsyncObservable<T>(generatorFn: () => AsyncGenerator<T>): Observable<T> {
  return fromAsyncGenerator(generatorFn());
}

// ============================================================================
// ADVANCED PATTERNS
// ============================================================================

/**
 * Creates an Observable from an async generator with cancellation support
 */
export function fromAsyncGeneratorWithCancellation<T>(
  generator: AsyncGenerator<T>,
  cancellationToken: { isCancelled: boolean }
): Observable<T> {
  return {
    subscribe(observerOrNext, error?, complete?): Subscription {
      const observer: Observer<T> =
        typeof observerOrNext === 'function'
          ? { next: observerOrNext, error, complete }
          : observerOrNext;

      let isRunning = false;

      const run = async () => {
        if (cancellationToken.isCancelled || isRunning) return;
        isRunning = true;

        try {
          for await (const value of generator) {
            if (cancellationToken.isCancelled) break;
            observer.next(value);
          }

          if (!cancellationToken.isCancelled) {
            observer.complete?.();
          }
        } catch (err) {
          if (!cancellationToken.isCancelled) {
            observer.error?.(err instanceof Error ? err : new Error(String(err)));
          }
        } finally {
          isRunning = false;
        }
      };

      run().catch(console.error);

      return {
        unsubscribe() {
          cancellationToken.isCancelled = true;
        },
      };
    },
  };
}

/**
 * Observable with backpressure support
 */
export function fromAsyncGeneratorWithBackpressure<T>(
  generator: AsyncGenerator<T>,
  bufferSize: number = 10
): Observable<T> {
  return {
    subscribe(observerOrNext, error?, complete?): Subscription {
      const observer: Observer<T> =
        typeof observerOrNext === 'function'
          ? { next: observerOrNext, error, complete }
          : observerOrNext;

      let isCancelled = false;
      let isRunning = false;
      let isPaused = false;
      const buffer: T[] = [];

      const flushBuffer = () => {
        while (buffer.length > 0 && !isPaused && !isCancelled) {
          const value = buffer.shift()!;
          observer.next(value);
        }
      };

      const run = async () => {
        if (isCancelled || isRunning) return;
        isRunning = true;

        try {
          for await (const value of generator) {
            if (isCancelled) break;

            if (buffer.length < bufferSize) {
              buffer.push(value);
              flushBuffer();
            } else {
              // Buffer full, wait for space
              await new Promise<void>(resolve => {
                const checkBuffer = setInterval(() => {
                  if (buffer.length < bufferSize || isCancelled) {
                    clearInterval(checkBuffer);
                    resolve();
                  }
                }, 10);
              });

              if (!isCancelled) {
                buffer.push(value);
                flushBuffer();
              }
            }
          }

          // Flush remaining items
          flushBuffer();

          if (!isCancelled) {
            observer.complete?.();
          }
        } catch (err) {
          if (!isCancelled) {
            observer.error?.(err instanceof Error ? err : new Error(String(err)));
          }
        } finally {
          isRunning = false;
        }
      };

      run().catch(console.error);

      return {
        unsubscribe() {
          isCancelled = true;
          isPaused = false;
        },
        pause() {
          isPaused = true;
        },
        resume() {
          isPaused = false;
          flushBuffer();
        },
      } as Subscription & { pause(): void; resume(): void };
    },
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract the yielded type from an async generator
 */
export type AsyncGeneratorYield<T> = T extends AsyncGenerator<infer Y, any, any> ? Y : never;

/**
 * Extract the return type from an async generator
 */
export type AsyncGeneratorReturn<T> = T extends AsyncGenerator<any, infer R, any> ? R : never;

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example async generator that fetches paginated data
 */
export async function* fetchPaginatedData<T>(
  endpoint: string,
  maxPages?: number
): AsyncGenerator<T[], void, unknown> {
  let page = 1;
  let hasMore = true;

  while (hasMore && (maxPages === undefined || page <= maxPages)) {
    const response = await fetch(`${endpoint}?page=${page}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: T[] = await response.json();
    yield data;

    hasMore = data.length > 0;
    page++;
  }
}

/**
 * Example usage with type safety
 */
export function exampleUsage() {
  const observable = fromAsyncGenerator(
    fetchPaginatedData<{ id: number; name: string }>('/api/users', 5)
  );

  const subscription = observable.subscribe({
    next: users => {
      console.log(`Received ${users.length} users`);
      users.forEach(user => console.log(`- ${user.name}`));
    },
    error: err => console.error('Failed to fetch users:', err),
    complete: () => console.log('All users loaded'),
  });

  // Cancel after 10 seconds
  setTimeout(() => subscription.unsubscribe(), 10000);
}
