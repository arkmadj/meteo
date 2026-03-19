/**
 * Curry utility for TypeScript with support for variadic arguments
 * Transforms a function into a series of functions that each take a single argument
 * and return either another curried function or the final result.
 */

/**
 * Represents a curried function that can accept arguments one at a time
 * or multiple arguments at once, returning either another curried function
 * or the final result.
 */
type CurriedFunction<T extends (...args: unknown[]) => unknown> = (
  ...args: Parameters<T>
) => ReturnType<T> | CurriedFunction<T>;

/**
 * Curries a function, allowing it to be called with fewer arguments than it expects.
 * The curried function can be called with any number of arguments (including all at once)
 * and will return either the result or another curried function waiting for more arguments.
 *
 * @template T - The function type to curry
 * @param fn - The function to curry
 * @param arity - Optional: the number of arguments the function expects (defaults to fn.length)
 * @returns A curried version of the function
 *
 * @example
 * // Basic usage with a simple function
 * const add = (a: number, b: number, c: number) => a + b + c;
 * const curriedAdd = curry(add);
 *
 * // Can be called with all arguments at once
 * curriedAdd(1, 2, 3); // 6
 *
 * // Or one at a time
 * curriedAdd(1)(2)(3); // 6
 *
 * // Or any combination
 * curriedAdd(1, 2)(3); // 6
 * curriedAdd(1)(2, 3); // 6
 *
 * @example
 * // With variadic arguments
 * const sum = (...nums: number[]) => nums.reduce((a, b) => a + b, 0);
 * const curriedSum = curry(sum, 3); // Specify arity for variadic functions
 *
 * curriedSum(1)(2)(3); // 6
 * curriedSum(1, 2)(3); // 6
 */
export function curry<T extends (...args: unknown[]) => unknown>(
  fn: T,
  arity: number = fn.length
): CurriedFunction<T> {
  // Handle edge case where arity is 0
  if (arity === 0) {
    return fn as CurriedFunction<T>;
  }

  return function curried(...args: unknown[]): ReturnType<T> | CurriedFunction<T> {
    // If we have enough arguments, call the original function
    if (args.length >= arity) {
      return fn(...args.slice(0, arity));
    }

    // Otherwise, return a new curried function waiting for more arguments
    return (...nextArgs: unknown[]) => curried(...args, ...nextArgs);
  };
}

/**
 * Partially applies arguments to a function, returning a new function
 * that expects the remaining arguments.
 *
 * @template T - The function type
 * @param fn - The function to partially apply
 * @param ...args - The arguments to partially apply
 * @returns A new function expecting the remaining arguments
 *
 * @example
 * const add = (a: number, b: number, c: number) => a + b + c;
 * const addOne = partial(add, 1);
 * addOne(2, 3); // 6
 *
 * const addOneTwo = partial(addOne, 2);
 * addOneTwo(3); // 6
 */
export function partial<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ...args: unknown[]
): (...remainingArgs: unknown[]) => ReturnType<T> {
  return (...nextArgs: unknown[]) => fn(...args, ...nextArgs);
}

/**
 * Composes multiple functions from right to left, creating a pipeline.
 * The rightmost function is called first with the provided arguments,
 * and its result is passed to the next function, and so on.
 *
 * @template T - The return type of the composed function
 * @param ...fns - Functions to compose (applied right to left)
 * @returns A new function that applies all composed functions
 *
 * @example
 * const add = (a: number, b: number) => a + b;
 * const multiply = (a: number) => a * 2;
 * const subtract = (a: number) => a - 5;
 *
 * const pipeline = compose(subtract, multiply, add);
 * pipeline(2, 3); // ((2 + 3) * 2) - 5 = 5
 */
export function compose<T>(...fns: Array<(arg: unknown) => unknown>): (...args: unknown[]) => T {
  return (...args: unknown[]) => {
    let result = fns[fns.length - 1].apply(null, args);
    for (let i = fns.length - 2; i >= 0; i--) {
      result = fns[i](result);
    }
    return result;
  };
}

/**
 * Pipes multiple functions from left to right, creating a pipeline.
 * The leftmost function is called first with the provided arguments,
 * and its result is passed to the next function, and so on.
 *
 * @template T - The return type of the piped function
 * @param ...fns - Functions to pipe (applied left to right)
 * @returns A new function that applies all piped functions
 *
 * @example
 * const add = (a: number, b: number) => a + b;
 * const multiply = (a: number) => a * 2;
 * const subtract = (a: number) => a - 5;
 *
 * const pipeline = pipe(add, multiply, subtract);
 * pipeline(2, 3); // ((2 + 3) * 2) - 5 = 5
 */
export function pipe<T>(...fns: Array<(arg: unknown) => unknown>): (...args: unknown[]) => T {
  return (...args: unknown[]) => {
    let result = fns[0].apply(null, args);
    for (let i = 1; i < fns.length; i++) {
      result = fns[i](result);
    }
    return result;
  };
}

/**
 * Uncurries a curried function back to its original form.
 * Takes a curried function and returns a function that accepts all arguments at once.
 *
 * @template T - The original function type
 * @param fn - The curried function to uncurry
 * @param arity - The number of arguments the original function expects
 * @returns The uncurried function
 *
 * @example
 * const add = (a: number, b: number, c: number) => a + b + c;
 * const curriedAdd = curry(add);
 * const uncurriedAdd = uncurry(curriedAdd, 3);
 *
 * uncurriedAdd(1, 2, 3); // 6
 */
export function uncurry<T extends (...args: unknown[]) => unknown>(
  fn: CurriedFunction<T>,
  arity: number
): T {
  return ((...args: unknown[]) => {
    let result: unknown = fn;
    for (const arg of args.slice(0, arity)) {
      result = result(arg);
    }
    return result;
  }) as T;
}

export default curry;
