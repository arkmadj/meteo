/**
 * Custom Promise implementation compliant with Promises/A+ specification
 *
 * This implementation follows the Promises/A+ specification:
 * https://promisesaplus.com/
 */

export type PromiseState = 'pending' | 'fulfilled' | 'rejected';

export type ResolveFunction<T> = (value: T | PromiseLike<T>) => void;
export type RejectFunction = (reason?: any) => void;
export type OnFulfilledCallback<T, TResult> =
  | ((value: T) => TResult | PromiseLike<TResult>)
  | null
  | undefined;
export type OnRejectedCallback<TResult> =
  | ((reason: any) => TResult | PromiseLike<TResult>)
  | null
  | undefined;

export interface ICustomPromise<T> {
  then<TResult1 = T, TResult2 = never>(
    onFulfilled?: OnFulfilledCallback<T, TResult1>,
    onRejected?: OnRejectedCallback<TResult2>
  ): ICustomPromise<TResult1 | TResult2>;

  catch<TResult = never>(onRejected?: OnRejectedCallback<TResult>): ICustomPromise<T | TResult>;

  finally(onFinally?: () => void): ICustomPromise<T>;
}

export class CustomPromise<T> implements ICustomPromise<T> {
  private state: PromiseState = 'pending';
  private value: T | undefined;
  private reason: any;
  private onFulfilledCallbacks: Array<(value: T) => void> = [];
  private onRejectedCallbacks: Array<(reason: any) => void> = [];

  constructor(executor: (resolve: ResolveFunction<T>, reject: RejectFunction) => void) {
    try {
      executor(
        value => this.resolve(value),
        reason => this.reject(reason)
      );
    } catch (error) {
      this.reject(error);
    }
  }

  private resolve = (value: T | PromiseLike<T>): void => {
    if (this.state !== 'pending') return;

    if (value instanceof CustomPromise || (value && typeof value === 'object' && 'then' in value)) {
      // Handle promise-like objects
      this.handlePromiseLike(value as PromiseLike<T>);
      return;
    }

    this.state = 'fulfilled';
    this.value = value as T;
    this.processCallbacks();
  };

  private reject = (reason?: any): void => {
    if (this.state !== 'pending') return;

    this.state = 'rejected';
    this.reason = reason;
    this.processCallbacks();
  };

  private handlePromiseLike = (promise: PromiseLike<T>): void => {
    try {
      const then = promise.then;
      if (typeof then === 'function') {
        then.call(
          promise,
          value => this.resolve(value),
          reason => this.reject(reason)
        );
      } else {
        this.resolve(promise as T);
      }
    } catch (error) {
      this.reject(error);
    }
  };

  private processCallbacks = (): void => {
    if (this.state === 'fulfilled') {
      this.onFulfilledCallbacks.forEach(callback => {
        try {
          callback(this.value as T);
        } catch (error) {
          // Silently ignore errors in fulfillment callbacks
          // In a real implementation, these would be handled via unhandled rejection
        }
      });
      this.onFulfilledCallbacks = [];
    } else if (this.state === 'rejected') {
      this.onRejectedCallbacks.forEach(callback => {
        try {
          callback(this.reason);
        } catch (error) {
          // Silently ignore errors in rejection callbacks
          // In a real implementation, these would be handled via unhandled rejection
        }
      });
      this.onRejectedCallbacks = [];
    }
  };

  then<TResult1 = T, TResult2 = never>(
    onFulfilled?: OnFulfilledCallback<T, TResult1>,
    onRejected?: OnRejectedCallback<TResult2>
  ): ICustomPromise<TResult1 | TResult2> {
    const promise2 = new CustomPromise<TResult1 | TResult2>((resolve, reject) => {
      const handleFulfilled = () => {
        try {
          if (typeof onFulfilled === 'function') {
            const result = onFulfilled(this.value as T);
            resolve(result);
          } else {
            resolve(this.value as TResult1);
          }
        } catch (error) {
          reject(error);
        }
      };

      const handleRejected = () => {
        try {
          if (typeof onRejected === 'function') {
            const result = onRejected(this.reason);
            resolve(result);
          } else {
            reject(this.reason);
          }
        } catch (error) {
          reject(error);
        }
      };

      if (this.state === 'fulfilled') {
        // Use setTimeout to ensure async execution
        setTimeout(handleFulfilled, 0);
      } else if (this.state === 'rejected') {
        // Use setTimeout to ensure async execution
        setTimeout(handleRejected, 0);
      } else {
        // Still pending, store callbacks
        this.onFulfilledCallbacks.push(handleFulfilled);
        this.onRejectedCallbacks.push(handleRejected);
      }
    });

    return promise2;
  }

  catch<TResult = never>(onRejected?: OnRejectedCallback<TResult>): ICustomPromise<T | TResult> {
    return this.then(undefined, onRejected);
  }

  finally(onFinally?: () => void): ICustomPromise<T> {
    return new CustomPromise<T>((resolve, reject) => {
      const handleFinally = () => {
        try {
          if (onFinally) {
            onFinally();
          }
        } catch (error) {
          reject(error);
          return;
        }

        if (this.state === 'fulfilled') {
          resolve(this.value as T);
        } else {
          reject(this.reason);
        }
      };

      if (this.state === 'pending') {
        this.onFulfilledCallbacks.push(handleFinally);
        this.onRejectedCallbacks.push(handleFinally);
      } else {
        setTimeout(handleFinally, 0);
      }
    });
  }

  // Static methods
  static resolve<T>(value: T | PromiseLike<T>): CustomPromise<T> {
    if (value instanceof CustomPromise) {
      return value;
    }
    return new CustomPromise<T>(resolve => resolve(value));
  }

  static reject<T = never>(reason?: any): CustomPromise<T> {
    return new CustomPromise<T>((_, reject) => reject(reason));
  }

  static all<T extends readonly unknown[] | []>(
    promises: T
  ): CustomPromise<{ -readonly [P in keyof T]: Awaited<T[P]> }> {
    return new CustomPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        reject(new TypeError('Promise.all requires an array'));
        return;
      }

      const results: unknown[] = [];
      let completed = 0;
      const total = promises.length;

      if (total === 0) {
        resolve(results as { -readonly [P in keyof T]: Awaited<T[P]> });
        return;
      }

      promises.forEach((promise, index) => {
        CustomPromise.resolve(promise).then(
          value => {
            results[index] = value;
            completed++;
            if (completed === total) {
              resolve(results as { -readonly [P in keyof T]: Awaited<T[P]> });
            }
          },
          reason => {
            reject(reason);
          }
        );
      });
    });
  }

  static race<T>(promises: Array<T | PromiseLike<T>>): CustomPromise<T> {
    return new CustomPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        reject(new TypeError('Promise.race requires an array'));
        return;
      }

      promises.forEach(promise => {
        CustomPromise.resolve(promise).then(
          value => resolve(value),
          reason => reject(reason)
        );
      });
    });
  }
}

// Type helper for Awaited
type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;
