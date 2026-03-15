/**
 * Result<T, E> Pattern and Discriminated Unions for Async Error Handling
 *
 * This file implements functional programming patterns for handling async operations
 * in a strongly-typed way without throwing exceptions.
 */

// ============================================================================
// BASIC RESULT TYPE (DISCRIMINATED UNION)
// ============================================================================

export type Result<T, E = Error> =
  | {
      readonly success: true;
      readonly data: T;
      readonly error?: never;
    }
  | {
      readonly success: false;
      readonly data?: never;
      readonly error: E;
    };

// Type guards for discriminated union
export const isSuccess = <T, E>(result: Result<T, E>): result is { success: true; data: T } =>
  result.success;

export const isFailure = <T, E>(result: Result<T, E>): result is { success: false; error: E } =>
  !result.success;

// ============================================================================
// ASYNC RESULT TYPE
// ============================================================================

export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

// ============================================================================
// RESULT CONSTRUCTORS
// ============================================================================

export const Ok = <T>(data: T): Result<T, never> => ({
  success: true,
  data,
});

export const Err = <E>(error: E): Result<never, E> => ({
  success: false,
  error,
});

// ============================================================================
// RESULT COMBINATORS (FUNCTIONAL PROGRAMMING)
// ============================================================================

/**
 * Map over the success value of a Result
 */
export const map = <T, U, E>(result: Result<T, E>, fn: (data: T) => U): Result<U, E> =>
  result.success ? Ok(fn(result.data)) : (result as Result<U, E>);

/**
 * Map over the error value of a Result
 */
export const mapError = <T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> =>
  result.success ? result : Err(fn(result.error));

/**
 * Chain operations that can fail
 */
export const flatMap = <T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>
): Result<U, E> => (result.success ? fn(result.data) : (result as Result<U, E>));

/**
 * Apply a function to a Result if it's successful
 */
export const fold = <T, U, E>(
  result: Result<T, E>,
  onSuccess: (data: T) => U,
  onFailure: (error: E) => U
): U => (result.success ? onSuccess(result.data) : onFailure(result.error));

/**
 * Get the value or provide a default
 */
export const getOrElse = <T, E>(result: Result<T, E>, defaultValue: T): T =>
  result.success ? result.data : defaultValue;

/**
 * Get the value or throw the error
 */
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (result.success) {
    return result.data;
  }
  throw result.error;
};

// ============================================================================
// ASYNC RESULT HELPERS
// ============================================================================

/**
 * Wrap an async function that might throw into a Result
 */
export const fromAsync = async <T, E = Error>(
  fn: () => Promise<T>,
  errorTransformer?: (error: unknown) => E
): Promise<Result<T, E>> => {
  try {
    const data = await fn();
    return Ok(data);
  } catch (error) {
    return Err(errorTransformer ? errorTransformer(error) : (error as E));
  }
};

/**
 * Wrap a sync function that might throw into a Result
 */
export const fromSync = <T, E = Error>(
  fn: () => T,
  errorTransformer?: (error: unknown) => E
): Result<T, E> => {
  try {
    const data = fn();
    return Ok(data);
  } catch (error) {
    return Err(errorTransformer ? errorTransformer(error) : (error as E));
  }
};

/**
 * Convert a Promise<T> to AsyncResult<T, E>
 */
export const fromPromise = <T, E = Error>(
  promise: Promise<T>,
  errorTransformer?: (error: unknown) => E
): Promise<Result<T, E>> => fromAsync(() => promise, errorTransformer);

// ============================================================================
// PARALLEL OPERATIONS
// ============================================================================

/**
 * Wait for all Results to complete, returning a Result of array
 */
export const all = async <T, E>(results: Promise<Result<T, E>>[]): Promise<Result<T[], E>> => {
  const settled = await Promise.allSettled(results);

  const values: T[] = [];
  for (const result of settled) {
    if (result.status === 'fulfilled') {
      if (result.value.success) {
        values.push(result.value.data);
      } else {
        return Err(result.value.error);
      }
    } else {
      return Err(result.reason as E);
    }
  }

  return Ok(values);
};

/**
 * Wait for any Result to complete successfully
 */
export const any = async <T, E>(results: Promise<Result<T, E>>[]): Promise<Result<T, E[]>> => {
  const settled = await Promise.allSettled(results);
  const errors: E[] = [];

  for (const result of settled) {
    if (result.status === 'fulfilled') {
      if (result.value.success) {
        return Ok(result.value.data);
      } else {
        errors.push(result.value.error);
      }
    } else {
      errors.push(result.reason as E);
    }
  }

  return Err(errors);
};
