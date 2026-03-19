/**
 * Custom Cancellation Token System
 *
 * Addresses limitations of native AbortController:
 * - Reusable tokens
 * - Hierarchical cancellation
 * - Composite cancellation sources
 * - Rich cancellation reasons
 * - Cancellation state inspection
 */

import { scheduleEventDispatch } from './eventDispatcher';

// ============================================================================
// CORE CANCELLATION TOKEN INTERFACE
// ============================================================================

export interface CancellationToken {
  /** Whether cancellation has been requested */
  readonly isCancellationRequested: boolean;
  /** Whether cancellation has completed */
  readonly isCancellationCompleted: boolean;
  /** The cancellation reason, if any */
  readonly reason?: unknown;
  /** Promise that resolves when cancellation is requested */
  readonly cancellationRequested: Promise<void>;
  /** Promise that resolves when cancellation is completed */
  readonly cancellationCompleted: Promise<void>;

  /** Subscribe to cancellation events */
  onCancelled(callback: (reason?: unknown) => void): () => void;
  /** Create a child token that inherits cancellation */
  createChild(): CancellationToken;
  /** Check if cancellation can be cancelled */
  canBeCancelled(): boolean;
}

// ============================================================================
// CANCELLATION SOURCE
// ============================================================================

export class CancellationTokenSource implements CancellationToken {
  private _isCancellationRequested = false;
  private _isCancellationCompleted = false;
  private _reason?: unknown;
  private _callbacks: Array<(reason?: unknown) => void> = [];
  private _children: CancellationTokenSource[] = [];
  private _parent?: CancellationTokenSource;

  // Promise resolvers
  private _resolveRequested!: () => void;
  private _resolveCompleted!: () => void;

  public readonly cancellationRequested: Promise<void>;
  public readonly cancellationCompleted: Promise<void>;

  constructor(parent?: CancellationToken) {
    this.cancellationRequested = new Promise(resolve => {
      this._resolveRequested = resolve;
    });

    this.cancellationCompleted = new Promise(resolve => {
      this._resolveCompleted = resolve;
    });

    // Inherit from parent if provided
    if (parent) {
      parent.onCancelled(reason => this.cancel(reason));
    }
  }

  get isCancellationRequested(): boolean {
    return this._isCancellationRequested;
  }

  get isCancellationCompleted(): boolean {
    return this._isCancellationCompleted;
  }

  get reason(): unknown {
    return this._reason;
  }

  cancel(reason?: unknown): void {
    if (this._isCancellationRequested) return; // Already cancelled

    this._isCancellationRequested = true;
    this._reason = reason;

    const callbacks = [...this._callbacks];
    this._callbacks = [];

    // Notify callbacks in a microtask to respect React timing while
    // preserving same-macrotask semantics.
    if (callbacks.length > 0) {
      scheduleEventDispatch(() => {
        callbacks.forEach(callback => {
          try {
            callback(reason);
          } catch (error) {
            console.error('Error in cancellation callback:', error);
          }
        });
      });
    }

    // Cancel all children synchronously; their own callbacks will also be
    // scheduled via scheduleEventDispatch.
    this._children.forEach(child => child.cancel(reason));

    // Resolve promises
    this._resolveRequested();

    // Mark as completed
    this._isCancellationCompleted = true;
    this._resolveCompleted();
  }

  onCancelled(callback: (reason?: unknown) => void): () => void {
    if (this._isCancellationRequested) {
      const reason = this._reason;
      scheduleEventDispatch(() => {
        try {
          callback(reason);
        } catch (error) {
          console.error('Error in cancellation callback:', error);
        }
      });
      return () => {}; // No-op
    }

    this._callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this._callbacks.indexOf(callback);
      if (index >= 0) {
        this._callbacks.splice(index, 1);
      }
    };
  }

  createChild(): CancellationTokenSource {
    const child = new CancellationTokenSource(this);
    this._children.push(child);
    return child;
  }

  canBeCancelled(): boolean {
    return !this._isCancellationRequested;
  }

  /** Reset the token for reuse */
  reset(): void {
    if (this._isCancellationRequested && !this._isCancellationCompleted) {
      throw new Error('Cannot reset a token that is currently being cancelled');
    }

    this._isCancellationRequested = false;
    this._isCancellationCompleted = false;
    this._reason = undefined;
    this._callbacks = [];
    this._children = [];

    // Create new promises
    this.cancellationRequested.then(
      () => {},
      () => {}
    ); // Consume old promise
    this.cancellationCompleted.then(
      () => {},
      () => {}
    ); // Consume old promise
  }
}

// ============================================================================
// COMPOSITE CANCELLATION TOKEN
// ============================================================================

export class CompositeCancellationToken implements CancellationToken {
  private _sources: CancellationToken[];
  private _isCompleted = false;
  private _callbacks: Array<(reason?: unknown) => void> = [];
  private _reason?: unknown;

  constructor(...sources: CancellationToken[]) {
    this._sources = sources;

    // Subscribe to all sources
    sources.forEach(source => {
      source.onCancelled(reason => {
        if (!this._isCompleted) {
          this._isCompleted = true;
          this._reason = reason;
          const callbacks = [...this._callbacks];
          callbacks.forEach(cb => {
            try {
              cb(reason);
            } catch (error) {
              console.error('Error in composite cancellation callback:', error);
            }
          });
        }
      });
    });
  }

  get isCancellationRequested(): boolean {
    return this._sources.some(s => s.isCancellationRequested);
  }

  get isCancellationCompleted(): boolean {
    return this._isCompleted;
  }

  get reason(): unknown {
    return this._reason;
  }

  get cancellationRequested(): Promise<void> {
    const firstSource = this._sources.find(s => s.isCancellationRequested);
    return firstSource ? firstSource.cancellationRequested : new Promise(() => {});
  }

  get cancellationCompleted(): Promise<void> {
    if (this._isCompleted) {
      return Promise.resolve();
    }

    return new Promise(resolve => {
      this.onCancelled(() => resolve());
    });
  }

  onCancelled(callback: (reason?: unknown) => void): () => void {
    if (this._isCompleted) {
      const reason = this._reason;
      scheduleEventDispatch(() => {
        try {
          callback(reason);
        } catch (error) {
          console.error('Error in composite cancellation callback:', error);
        }
      });
      return () => {};
    }

    this._callbacks.push(callback);
    return () => {
      const index = this._callbacks.indexOf(callback);
      if (index >= 0) {
        this._callbacks.splice(index, 1);
      }
    };
  }

  createChild(): CancellationToken {
    return new CancellationTokenSource(this);
  }

  canBeCancelled(): boolean {
    return this._sources.some(s => s.canBeCancelled());
  }
}

// ============================================================================
// TIMEOUT CANCELLATION TOKEN
// ============================================================================

export class TimeoutCancellationTokenSource extends CancellationTokenSource {
  private _timeoutId?: NodeJS.Timeout;

  constructor(timeoutMs: number, reason = 'Operation timed out') {
    super();

    this._timeoutId = setTimeout(() => {
      this.cancel(reason);
    }, timeoutMs);
  }

  cancel(reason?: unknown): void {
    if (this._timeoutId) {
      clearTimeout(this._timeoutId);
      this._timeoutId = undefined;
    }
    super.cancel(reason);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a token that cancels after a specified timeout
 */
export function withTimeout(timeoutMs: number, reason?: string): CancellationTokenSource {
  return new TimeoutCancellationTokenSource(timeoutMs, reason);
}

/**
 * Create a composite token that cancels when any source cancels
 */
export function anyToken(...sources: CancellationToken[]): CancellationToken {
  return new CompositeCancellationToken(...sources);
}

/**
 * Create a token that only cancels when all sources cancel
 */
export function allTokens(...sources: CancellationToken[]): CancellationToken {
  return new CompositeCancellationToken(...sources);
}

/**
 * Create a token that never cancels
 */
export function neverCancels(): CancellationToken {
  return new CancellationTokenSource();
}

/**
 * Convert AbortController signal to CancellationToken
 */
export function fromAbortSignal(signal: AbortSignal): CancellationToken {
  const source = new CancellationTokenSource();

  if (signal.aborted) {
    source.cancel('Already aborted');
  } else {
    signal.addEventListener(
      'abort',
      () => {
        source.cancel('Aborted via AbortSignal');
      },
      { once: true }
    );
  }

  return source;
}

/**
 * Convert CancellationToken to AbortSignal
 */
export function toAbortSignal(token: CancellationToken): AbortSignal {
  const controller = new AbortController();

  token.onCancelled(() => {
    controller.abort(token.reason);
  });

  return controller.signal;
}
