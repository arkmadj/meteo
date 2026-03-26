/**
 * Tail Call Optimization via Continuation-Passing Style (CPS)
 *
 * This module provides utilities to simulate tail call optimization in TypeScript
 * by transforming recursive functions into continuation-passing style and using
 * a trampoline to execute them iteratively.
 *
 * @module tailCallOptimization
 */

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Represents a continuation - a function that describes what to do next
 */
export type Continuation<T> = (value: T) => Bounce<T>;

/**
 * Represents either a final value or a deferred computation (thunk)
 * This is the key to the trampoline pattern
 */
export type Bounce<T> = { type: 'done'; value: T } | { type: 'continue'; thunk: () => Bounce<T> };

/**
 * Helper to create a "done" bounce (final value)
 */
export const done = <T>(value: T): Bounce<T> => ({
  type: 'done',
  value,
});

/**
 * Helper to create a "continue" bounce (deferred computation)
 */
export const cont = <T>(thunk: () => Bounce<T>): Bounce<T> => ({
  type: 'continue',
  thunk,
});

// ============================================================================
// TRAMPOLINE
// ============================================================================

/**
 * Trampoline executor - runs bounces iteratively until a final value is reached
 * This is what prevents stack overflow by converting recursion to iteration
 *
 * @param bounce - Initial bounce to execute
 * @returns Final computed value
 *
 * @example
 * const result = trampoline(factorial(5, x => done(x)));
 * console.log(result); // 120
 */
export function trampoline<T>(bounce: Bounce<T>): T {
  let current = bounce;

  while (current.type === 'continue') {
    current = current.thunk();
  }

  return current.value;
}

// ============================================================================
// CPS TRANSFORMATION HELPERS
// ============================================================================

/**
 * Identity continuation - simply returns the value wrapped in "done"
 * This is the base continuation that terminates the computation
 */
export const identity = <T>(value: T): Bounce<T> => done(value);

/**
 * Compose two continuations in CPS style
 *
 * @param f - First continuation
 * @param g - Second continuation
 * @returns Composed continuation
 */
export const composeCont = <A, B, C>(
  f: (a: A) => Bounce<B>,
  g: (b: B) => Bounce<C>
): ((a: A) => Bounce<C>) => {
  return (a: A) =>
    cont(() => {
      const resultB = trampoline(f(a));
      return g(resultB);
    });
};

/**
 * Chain/bind operation for continuations (monadic bind)
 *
 * @param bounce - Current bounce
 * @param f - Function to apply to the value
 * @returns New bounce
 */
export const chain = <A, B>(bounce: Bounce<A>, f: (a: A) => Bounce<B>): Bounce<B> => {
  return cont(() => {
    if (bounce.type === 'done') {
      return f(bounce.value);
    }
    return chain(bounce.thunk(), f);
  });
};

// ============================================================================
// EXAMPLE: FACTORIAL IN CPS
// ============================================================================

/**
 * Factorial function in continuation-passing style
 * This demonstrates how to transform a recursive function to use CPS
 *
 * Traditional recursive: factorial(n) = n === 0 ? 1 : n * factorial(n - 1)
 * CPS version: factorial(n, k) = n === 0 ? k(1) : factorial(n - 1, x => k(n * x))
 *
 * @param n - Number to compute factorial of
 * @param k - Continuation (what to do with the result)
 * @returns Bounce representing the computation
 *
 * @example
 * const result = trampoline(factorialCPS(5, identity));
 * console.log(result); // 120
 *
 * @example
 * // Works with very large numbers without stack overflow
 * const result = trampoline(factorialCPS(10000, identity));
 */
export function factorialCPS(n: number, k: Continuation<number> = identity): Bounce<number> {
  if (n === 0) {
    return k(1);
  }

  // Defer the recursive call using cont()
  return cont(() => factorialCPS(n - 1, x => k(n * x)));
}

// ============================================================================
// EXAMPLE: FIBONACCI IN CPS
// ============================================================================

/**
 * Fibonacci function in continuation-passing style
 * Demonstrates CPS with multiple recursive calls
 *
 * @param n - Position in Fibonacci sequence
 * @param k - Continuation
 * @returns Bounce representing the computation
 *
 * @example
 * const result = trampoline(fibonacciCPS(10, identity));
 * console.log(result); // 55
 */
export function fibonacciCPS(n: number, k: Continuation<number> = identity): Bounce<number> {
  if (n <= 1) {
    return k(n);
  }

  // First recursive call
  return cont(() =>
    fibonacciCPS(n - 1, x =>
      // Second recursive call in the continuation
      cont(() => fibonacciCPS(n - 2, y => k(x + y)))
    )
  );
}

// ============================================================================
// EXAMPLE: SUM OF LIST IN CPS
// ============================================================================

/**
 * Sum a list of numbers in continuation-passing style
 * Demonstrates CPS with list processing using an accumulator
 *
 * @param list - Array of numbers to sum
 * @param acc - Accumulator (default 0)
 * @param k - Continuation
 * @returns Bounce representing the computation
 *
 * @example
 * const result = trampoline(sumListCPS([1, 2, 3, 4, 5], 0, identity));
 * console.log(result); // 15
 *
 * @example
 * // Works with very large arrays
 * const largeArray = Array.from({ length: 100000 }, (_, i) => i + 1);
 * const result = trampoline(sumListCPS(largeArray, 0, identity));
 */
export function sumListCPS(
  list: number[],
  acc: number = 0,
  k: Continuation<number> = identity
): Bounce<number> {
  if (list.length === 0) {
    return k(acc);
  }

  const [head, ...tail] = list;
  return cont(() => sumListCPS(tail, acc + head, k));
}

// ============================================================================
// EXAMPLE: MAP IN CPS
// ============================================================================

/**
 * Map function in continuation-passing style
 * Demonstrates CPS with higher-order functions
 *
 * @param list - Array to map over
 * @param fn - Mapping function
 * @param k - Continuation
 * @returns Bounce representing the computation
 *
 * @example
 * const result = trampoline(mapCPS([1, 2, 3], x => x * 2, identity));
 * console.log(result); // [2, 4, 6]
 */
export function mapCPS<A, B>(
  list: A[],
  fn: (a: A) => B,
  k: Continuation<B[]> = identity
): Bounce<B[]> {
  if (list.length === 0) {
    return k([]);
  }

  const [head, ...tail] = list;
  return cont(() => mapCPS(tail, fn, mappedTail => k([fn(head), ...mappedTail])));
}

// ============================================================================
// EXAMPLE: FILTER IN CPS
// ============================================================================

/**
 * Filter function in continuation-passing style
 *
 * @param list - Array to filter
 * @param predicate - Filter predicate
 * @param k - Continuation
 * @returns Bounce representing the computation
 *
 * @example
 * const result = trampoline(filterCPS([1, 2, 3, 4, 5], x => x % 2 === 0, identity));
 * console.log(result); // [2, 4]
 */
export function filterCPS<A>(
  list: A[],
  predicate: (a: A) => boolean,
  k: Continuation<A[]> = identity
): Bounce<A[]> {
  if (list.length === 0) {
    return k([]);
  }

  const [head, ...tail] = list;
  return cont(() =>
    filterCPS(tail, predicate, filteredTail =>
      k(predicate(head) ? [head, ...filteredTail] : filteredTail)
    )
  );
}

// ============================================================================
// EXAMPLE: TREE TRAVERSAL IN CPS
// ============================================================================

/**
 * Binary tree node
 */
export interface TreeNode<T> {
  value: T;
  left?: TreeNode<T>;
  right?: TreeNode<T>;
}

/**
 * In-order tree traversal in continuation-passing style
 * Demonstrates CPS with tree structures
 *
 * @param tree - Tree to traverse
 * @param k - Continuation
 * @returns Bounce representing the computation
 *
 * @example
 * const tree: TreeNode<number> = {
 *   value: 4,
 *   left: { value: 2, left: { value: 1 }, right: { value: 3 } },
 *   right: { value: 6, left: { value: 5 }, right: { value: 7 } }
 * };
 * const result = trampoline(inOrderCPS(tree, identity));
 * console.log(result); // [1, 2, 3, 4, 5, 6, 7]
 */
export function inOrderCPS<T>(
  tree: TreeNode<T> | undefined,
  k: Continuation<T[]> = identity
): Bounce<T[]> {
  if (!tree) {
    return k([]);
  }

  // Traverse left subtree
  return cont(() =>
    inOrderCPS(tree.left, leftValues =>
      // Traverse right subtree
      cont(() =>
        inOrderCPS(tree.right, rightValues =>
          // Combine: left + current + right
          k([...leftValues, tree.value, ...rightValues])
        )
      )
    )
  );
}

// ============================================================================
// ADVANCED: GENERIC CPS TRANSFORMER
// ============================================================================

/**
 * Type for a recursive function that can be transformed to CPS
 */
export type RecursiveFunction<Args extends unknown[], R> = (...args: Args) => R;

/**
 * Type for a CPS-transformed function
 */
export type CPSFunction<Args extends unknown[], R> = (
  ...args: [...Args, Continuation<R>]
) => Bounce<R>;

/**
 * Helper to create a CPS version of a simple recursive function
 * This is a simplified transformer for educational purposes
 *
 * @param baseCase - Function to check if we've reached the base case
 * @param baseCaseValue - Function to compute the base case value
 * @param recursiveStep - Function to perform the recursive step
 * @returns CPS-transformed function
 *
 * @example
 * // Create a CPS factorial
 * const factorialCPS = createCPS(
 *   (n: number) => n === 0,
 *   () => 1,
 *   (n: number, recurse: (n: number) => Bounce<number>) =>
 *     cont(() => chain(recurse(n - 1), x => done(n * x)))
 * );
 */
export function createCPS<Args extends unknown[], R>(
  baseCase: (...args: Args) => boolean,
  baseCaseValue: (...args: Args) => R,
  recursiveStep: (
    ...args: [...Args, (recurse: (...args: Args) => Bounce<R>) => Bounce<R>]
  ) => Bounce<R>
): CPSFunction<Args, R> {
  const cpsFunc = (...args: [...Args, Continuation<R>]): Bounce<R> => {
    const funcArgs = args.slice(0, -1) as Args;
    const k = args[args.length - 1] as Continuation<R>;

    if (baseCase(...funcArgs)) {
      return k(baseCaseValue(...funcArgs));
    }

    return recursiveStep(...funcArgs, (recurse: unknown) =>
      cont(() =>
        cpsFunc(...(Array.from([...(recurse as unknown[]), k]) as [...Args, Continuation<R>]))
      )
    );
  };

  return cpsFunc;
}

// ============================================================================
// ADVANCED: MUTUAL RECURSION IN CPS
// ============================================================================

/**
 * Even/Odd mutual recursion example in CPS
 * Demonstrates how CPS handles mutually recursive functions
 */

export function isEvenCPS(n: number, k: Continuation<boolean> = identity): Bounce<boolean> {
  if (n === 0) {
    return k(true);
  }
  return cont(() => isOddCPS(n - 1, k));
}

export function isOddCPS(n: number, k: Continuation<boolean> = identity): Bounce<boolean> {
  if (n === 0) {
    return k(false);
  }
  return cont(() => isEvenCPS(n - 1, k));
}

// ============================================================================
// ADVANCED: ACCUMULATOR-BASED CPS
// ============================================================================

/**
 * Factorial with accumulator in CPS (more efficient)
 * This version uses an accumulator to avoid building up large continuations
 *
 * @param n - Number to compute factorial of
 * @param acc - Accumulator (default 1)
 * @param k - Continuation
 * @returns Bounce representing the computation
 *
 * @example
 * const result = trampoline(factorialAccCPS(5, 1, identity));
 * console.log(result); // 120
 */
export function factorialAccCPS(
  n: number,
  acc: number = 1,
  k: Continuation<number> = identity
): Bounce<number> {
  if (n === 0) {
    return k(acc);
  }

  return cont(() => factorialAccCPS(n - 1, n * acc, k));
}

/**
 * Reverse a list with accumulator in CPS
 *
 * @param list - List to reverse
 * @param acc - Accumulator (default empty array)
 * @param k - Continuation
 * @returns Bounce representing the computation
 *
 * @example
 * const result = trampoline(reverseAccCPS([1, 2, 3, 4, 5], [], identity));
 * console.log(result); // [5, 4, 3, 2, 1]
 */
export function reverseAccCPS<T>(
  list: T[],
  acc: T[] = [],
  k: Continuation<T[]> = identity
): Bounce<T[]> {
  if (list.length === 0) {
    return k(acc);
  }

  const [head, ...tail] = list;
  return cont(() => reverseAccCPS(tail, [head, ...acc], k));
}

// ============================================================================
// UTILITY: PERFORMANCE COMPARISON
// ============================================================================

/**
 * Compare performance of regular recursion vs CPS with trampoline
 *
 * @param name - Name of the test
 * @param regularFn - Regular recursive function
 * @param cpsFn - CPS version of the function
 * @param input - Input to test with
 * @returns Performance comparison results
 *
 * @example
 * const comparison = comparePerformance(
 *   'Factorial',
 *   (n: number): number => n === 0 ? 1 : n * factorial(n - 1),
 *   (n: number) => trampoline(factorialCPS(n, identity)),
 *   100
 * );
 */
export function comparePerformance<T, R>(
  name: string,
  regularFn: (input: T) => R,
  cpsFn: (input: T) => R,
  input: T
): {
  name: string;
  regularTime: number;
  cpsTime: number;
  regularResult: R | Error;
  cpsResult: R | Error;
  speedup: number;
} {
  // Test regular function
  let regularTime = 0;
  let regularResult: R | Error;
  try {
    const start = performance.now();
    regularResult = regularFn(input);
    regularTime = performance.now() - start;
  } catch (error) {
    regularResult = error as Error;
  }

  // Test CPS function
  let cpsTime = 0;
  let cpsResult: R | Error;
  try {
    const start = performance.now();
    cpsResult = cpsFn(input);
    cpsTime = performance.now() - start;
  } catch (error) {
    cpsResult = error as Error;
  }

  return {
    name,
    regularTime,
    cpsTime,
    regularResult,
    cpsResult,
    speedup: regularTime / cpsTime,
  };
}
