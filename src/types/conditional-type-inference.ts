/**
 * Advanced Conditional Type Inference for Nested Async Functions
 *
 * This file demonstrates sophisticated TypeScript patterns for inferring
 * inner resolved types from deeply nested async functions using conditional types.
 */

// ============================================================================
// BASIC AWAITED TYPE INFERENCE
// ============================================================================

// TypeScript's built-in Awaited type (simplified version)
type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

// Basic usage
type StringPromise = Promise<string>;
type ResolvedString = Awaited<StringPromise>; // string

// Nested Promise inference
type NestedPromise = Promise<Promise<Promise<number>>>;
type DeeplyResolved = Awaited<NestedPromise>; // number

// ============================================================================
// ADVANCED FUNCTION RETURN TYPE INFERENCE
// ============================================================================

// Extract return type from async function
type AsyncFunctionReturnType<T extends (...args: any[]) => any> = T extends (
  ...args: any[]
) => Promise<infer R>
  ? R
  : never;

// Extract deeply nested return type
type DeepAsyncReturnType<T extends (...args: any[]) => any> = Awaited<AsyncFunctionReturnType<T>>;

// Usage examples
declare function fetchUser(id: string): Promise<{ id: string; name: string }>;
declare function fetchPosts(userId: string): Promise<Promise<{ id: number; title: string }[]>>;

type User = DeepAsyncReturnType<typeof fetchUser>; // { id: string; name: string }
type Posts = DeepAsyncReturnType<typeof fetchPosts>; // { id: number; title: string }[]

// ============================================================================
// RECURSIVE CONDITIONAL TYPES FOR DEEP NESTING
// ============================================================================

// Recursive type that unwraps any level of Promise nesting
type UnwrapPromise<T> =
  T extends PromiseLike<infer U> ? (U extends PromiseLike<any> ? UnwrapPromise<U> : U) : T;

// Alternative recursive implementation with safe depth (simplified for TS compatibility)
// We rely on TypeScript's recursion limit instead of manual arithmetic on the Depth type.
type UnwrapPromiseRecursive<T> = T extends PromiseLike<infer U> ? UnwrapPromiseRecursive<U> : T;

// ============================================================================
// GENERIC ASYNC FUNCTION TYPE INFERENCE
// ============================================================================

// Infer the resolved type from any async function
type InferAsyncResolved<T> = T extends (...args: infer A) => Promise<infer R>
  ? (...args: A) => R
  : never;

// Apply to function parameters
function processAsyncResult<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  ...args: Parameters<T>
): Promise<DeepAsyncReturnType<T>> {
  return fn(...args) as Promise<DeepAsyncReturnType<T>>;
}

// ============================================================================
// CONDITIONAL TYPES FOR MIXED SYNC/ASYNC FUNCTIONS
// ============================================================================

// Handle both sync and async functions
type FunctionReturnType<T> = T extends (...args: any[]) => Promise<infer R>
  ? R
  : T extends (...args: any[]) => infer R
    ? R
    : never;

type UnwrappedFunctionReturn<T> = T extends (...args: any[]) => any
  ? Awaited<FunctionReturnType<T>>
  : never;

// ============================================================================
// PRACTICAL EXAMPLES WITH NESTED ASYNC OPERATIONS
// ============================================================================

// Example: Complex nested async operations
declare class DataService {
  async fetchUser(id: string): Promise<{ id: string; name: string; email: string }> {
    // Implementation
    return {} as any;
  }

  async fetchUserPreferences(userId: string): Promise<
    Promise<{
      theme: 'light' | 'dark';
      notifications: boolean;
    }>
  > {
    // Implementation
    return {} as any;
  }

  async fetchCompleteProfile(id: string): Promise<{
    user: ReturnType<typeof this.fetchUser> extends Promise<infer U> ? U : never;
    preferences: Awaited<ReturnType<typeof this.fetchUserPreferences>>;
  }> {
    const [user, preferences] = await Promise.all([
      this.fetchUser(id),
      this.fetchUserPreferences(id),
    ]);

    return { user, preferences };
  }
}

// Type inference for the complex profile
type CompleteProfile = DeepAsyncReturnType<DataService['fetchCompleteProfile']>;

// ============================================================================
// CONDITIONAL TYPE UTILITIES
// ============================================================================

// Utility to check if type is a Promise
type IsPromise<T> = T extends PromiseLike<any> ? true : false;

// Utility to get Promise depth
type PromiseDepth<T, Depth extends number = 0> =
  T extends PromiseLike<infer U>
    ? U extends PromiseLike<any>
      ? PromiseDepth<
          U,
          Depth extends 0
            ? 1
            : Depth extends 1
              ? 2
              : Depth extends 2
                ? 3
                : Depth extends 3
                  ? 4
                  : Depth extends 4
                    ? 5
                    : Depth extends 5
                      ? 6
                      : Depth extends 6
                        ? 7
                        : Depth extends 7
                          ? 8
                          : Depth extends 8
                            ? 9
                            : 10
        >
      : Depth
    : Depth;

// Utility to unwrap to specific depth
type UnwrapToDepth<
  T,
  TargetDepth extends number,
  CurrentDepth extends number = 0,
> = CurrentDepth extends TargetDepth
  ? T
  : T extends PromiseLike<infer U>
    ? UnwrapToDepth<
        U,
        TargetDepth,
        CurrentDepth extends 0
          ? 1
          : CurrentDepth extends 1
            ? 2
            : CurrentDepth extends 2
              ? 3
              : CurrentDepth extends 3
                ? 4
                : CurrentDepth extends 4
                  ? 5
                  : CurrentDepth extends 5
                    ? 6
                    : CurrentDepth extends 6
                      ? 7
                      : CurrentDepth extends 7
                        ? 8
                        : CurrentDepth extends 8
                          ? 9
                          : CurrentDepth extends 9
                            ? 10
                            : 11
      >
    : T;

// ============================================================================
// REAL-WORLD USAGE EXAMPLES
// ============================================================================

// Example 1: API response chaining
declare function fetchApiData<T>(endpoint: string): Promise<Promise<T>>;

type ApiResponse<T> = DeepAsyncReturnType<typeof fetchApiData<T>>;

// Example 2: Cache layer with nested promises
declare function getCachedData<T>(key: string): Promise<Promise<T> | Promise<Promise<T>>>;

type CachedData<T> = UnwrapPromiseRecursive<ReturnType<typeof getCachedData<T>>>;

// Example 3: Batch operations
declare function batchFetch<T>(ids: string[]): Promise<{
  results: Promise<Promise<T>>[];
  metadata: Promise<{
    total: number;
    processed: Promise<number>;
  }>;
}>;

type BatchResults<T> = {
  results: T[];
  metadata: {
    total: number;
    processed: number;
  };
};

// ============================================================================
// TESTING THE TYPES
// ============================================================================

// Test function with multiple nesting levels
async function complexNestedOperation(): Promise<
  Promise<{
    data: Promise<{
      items: Promise<string[]>;
      count: Promise<number>;
    }>;
    status: Promise<'pending' | 'complete'>;
  }>
> {
  return {} as any;
}

// Inferred types
type ComplexResult = DeepAsyncReturnType<typeof complexNestedOperation>;
// Should equal:
// {
//   data: {
//     items: string[];
//     count: number;
//   };
//   status: 'pending' | 'complete';
// }

// ============================================================================
// TYPE GUARDS AND RUNTIME UTILITIES
// ============================================================================

// Runtime utility to check if something is a Promise
function isPromise(value: unknown): value is PromiseLike<unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    'then' in value &&
    typeof (value as any).then === 'function'
  );
}

// Runtime utility to resolve nested promises
async function resolveNested<T>(value: T): Promise<Awaited<T>> {
  if (isPromise(value)) {
    const resolved = await value;
    return await resolveNested(resolved);
  }
  return value as Awaited<T>;
}

// Example usage
const nestedPromise = Promise.resolve(Promise.resolve(Promise.resolve(42)));
const resolved = await resolveNested(nestedPromise); // 42
