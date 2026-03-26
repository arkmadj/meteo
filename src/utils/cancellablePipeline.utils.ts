/**
 * Pipeline Utilities and Helper Classes for Cooperative Cancellation
 *
 * Provides utility functions, helper classes, and common patterns for
 * building cancellable async task pipelines.
 */

import type { CancellationPolicy, PipelineEvents, TaskStage } from './cancellablePipeline';
import { CancellationError, CancellationPropagationStrategy } from './cancellablePipeline';
import type { CancellationToken } from './cancellationToken';
import { CancellationTokenSource } from './cancellationToken';

// ============================================================================
// UTILITY TASK STAGES
// ============================================================================

/**
 * Simple function-based task stage
 */
export class FunctionStage<TInput = unknown, TOutput = unknown> implements TaskStage<
  TInput,
  TOutput
> {
  constructor(
    public readonly id: string,
    public readonly name: string,
    private executor: (input: TInput, token: CancellationToken) => Promise<TOutput>,
    public readonly isInterruptible: boolean = true,
    public readonly estimatedDuration?: number,
    private cleanupFn?: (reason?: unknown) => Promise<void>
  ) {}

  async execute(input: TInput, token: CancellationToken): Promise<TOutput> {
    return this.executor(input, token);
  }

  async onCancel(reason?: unknown): Promise<void> {
    if (this.cleanupFn) {
      await this.cleanupFn(reason);
    }
  }

  validate?(_input: TInput): Promise<boolean> {
    return Promise.resolve(true);
  }
}

/**
 * Retry-aware task stage with cancellation support
 */
export class RetryStage<TInput = unknown, TOutput = unknown> implements TaskStage<TInput, TOutput> {
  private attemptCount = 0;

  constructor(
    public readonly id: string,
    public readonly name: string,
    private executor: (
      input: TInput,
      token: CancellationToken,
      attempt: number
    ) => Promise<TOutput>,
    public readonly isInterruptible: boolean = true,
    public readonly estimatedDuration?: number,
    private maxRetries: number = 3,
    private retryDelay: number = 1000
  ) {}

  async execute(input: TInput, token: CancellationToken): Promise<TOutput> {
    this.attemptCount = 0;

    while (this.attemptCount <= this.maxRetries) {
      try {
        if (token.isCancellationRequested) {
          throw new CancellationError(token.reason);
        }

        const result = await this.executor(input, token, this.attemptCount);
        return result;
      } catch (error) {
        this.attemptCount++;

        if (this.attemptCount > this.maxRetries || error instanceof CancellationError) {
          throw error;
        }

        // Wait before retry, but check for cancellation
        await this.delayWithCancellation(this.retryDelay, token);
      }
    }

    throw new Error(`Stage ${this.name} failed after ${this.maxRetries} retries`);
  }

  private async delayWithCancellation(ms: number, token: CancellationToken): Promise<void> {
    return new Promise((resolve, reject) => {
      let settled = false;
      let timeoutId: ReturnType<typeof setTimeout>;
      let unsubscribe: (() => void) | undefined;

      const cleanup = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        unsubscribe?.();
      };

      timeoutId = setTimeout(() => {
        cleanup();
        resolve();
      }, ms);

      // If the token is already cancelled, short-circuit immediately.
      if (token.isCancellationRequested) {
        cleanup();
        reject(new CancellationError(token.reason));
        return;
      }

      unsubscribe = token.onCancelled(reason => {
        cleanup();
        reject(new CancellationError(reason));
      });
    });
  }
}

/**
 * Timeout-aware task stage
 */
export class TimeoutStage<TInput = unknown, TOutput = unknown> implements TaskStage<
  TInput,
  TOutput
> {
  constructor(
    public readonly id: string,
    public readonly name: string,
    private executor: (input: TInput, token: CancellationToken) => Promise<TOutput>,
    public readonly isInterruptible: boolean = true,
    public readonly estimatedDuration?: number,
    private timeoutMs: number = 30000
  ) {}

  async execute(input: TInput, token: CancellationToken): Promise<TOutput> {
    const timeoutSource = new CancellationTokenSource();
    const compositeToken = this.createCompositeToken(token, timeoutSource);

    // Set timeout
    const timeoutId = setTimeout(() => {
      timeoutSource.cancel(`Stage ${this.name} timed out after ${this.timeoutMs}ms`);
    }, this.timeoutMs);

    try {
      const result = await this.executor(input, compositeToken);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private createCompositeToken(
    token1: CancellationToken,
    token2: CancellationTokenSource
  ): CancellationToken {
    // Simple composite implementation - cancels when either token cancels
    const composite = new CancellationTokenSource();

    token1.onCancelled(reason => composite.cancel(reason));
    token2.onCancelled(reason => composite.cancel(reason));

    return composite;
  }
}

// ============================================================================
// PIPELINE BUILDERS
// ============================================================================

/**
 * Fluent pipeline builder for easier pipeline construction
 */
export class PipelineBuilder<TInput = unknown, TOutput = unknown> {
  private stages: TaskStage[] = [];
  private policy: Partial<CancellationPolicy> = {};
  private eventHandlers: Partial<PipelineEvents> = {};

  /**
   * Add a function-based stage
   */
  addStage<TStageInput, TStageOutput>(
    id: string,
    name: string,
    executor: (input: TStageInput, token: CancellationToken) => Promise<TStageOutput>,
    options: {
      isInterruptible?: boolean;
      estimatedDuration?: number;
      cleanup?: (reason?: unknown) => Promise<void>;
    } = {}
  ): PipelineBuilder<TInput, TStageOutput> {
    const stage = new FunctionStage(
      id,
      name,
      executor,
      options.isInterruptible,
      options.estimatedDuration,
      options.cleanup
    );
    this.stages.push(stage);
    return this as any;
  }

  /**
   * Add a retry-aware stage
   */
  addRetryStage<TStageInput, TStageOutput>(
    id: string,
    name: string,
    executor: (
      input: TStageInput,
      token: CancellationToken,
      attempt: number
    ) => Promise<TStageOutput>,
    options: {
      isInterruptible?: boolean;
      estimatedDuration?: number;
      maxRetries?: number;
      retryDelay?: number;
    } = {}
  ): PipelineBuilder<TInput, TStageOutput> {
    const stage = new RetryStage(
      id,
      name,
      executor,
      options.isInterruptible,
      options.estimatedDuration,
      options.maxRetries,
      options.retryDelay
    );
    this.stages.push(stage);
    return this as any;
  }

  /**
   * Add a timeout-aware stage
   */
  addTimeoutStage<TStageInput, TStageOutput>(
    id: string,
    name: string,
    executor: (input: TStageInput, token: CancellationToken) => Promise<TStageOutput>,
    options: {
      isInterruptible?: boolean;
      estimatedDuration?: number;
      timeout?: number;
    } = {}
  ): PipelineBuilder<TInput, TStageOutput> {
    const stage = new TimeoutStage(
      id,
      name,
      executor,
      options.isInterruptible,
      options.estimatedDuration,
      options.timeout
    );
    this.stages.push(stage);
    return this as any;
  }

  /**
   * Set cancellation policy
   */
  withPolicy(policy: Partial<CancellationPolicy>): PipelineBuilder<TInput, TOutput> {
    this.policy = { ...this.policy, ...policy };
    return this;
  }

  /**
   * Register pipeline event handlers to be attached when the pipeline is
   * built. This keeps the fluent builder API while delegating actual
   * dispatching to CancellableTaskPipeline.
   */
  on<K extends keyof PipelineEvents>(
    event: K,
    handler: PipelineEvents[K]
  ): PipelineBuilder<TInput, TOutput> {
    this.eventHandlers[event] = handler;
    return this;
  }

  /**
   * Build the pipeline
   */
  build(): any {
    const { CancellableTaskPipeline } = require('./cancellablePipeline');
    const pipeline = new CancellableTaskPipeline();

    this.stages.forEach(stage => pipeline.addStage(stage));

    if (Object.keys(this.policy).length > 0) {
      pipeline.withPolicy(this.policy);
    }

    // Attach any registered event handlers
    Object.entries(this.eventHandlers).forEach(([event, handler]) => {
      if (handler) {
        pipeline.on(event as keyof PipelineEvents, handler as unknown);
      }
    });

    return pipeline;
  }
}

// ============================================================================
// CANCELLATION POLICY PRESETS
// ============================================================================

export const CancellationPolicies = {
  /**
   * Cancel immediately - best for user-initiated cancellations
   */
  immediate: (): Partial<CancellationPolicy> => ({
    strategy: CancellationPropagationStrategy.IMMEDIATE,
  }),

  /**
   * Graceful cancellation with timeout - best for cleanup operations
   */
  graceful: (timeoutMs = 5000): Partial<CancellationPolicy> => ({
    strategy: CancellationPropagationStrategy.GRACEFUL,
    gracefulTimeout: timeoutMs,
  }),

  /**
   * Selective cancellation - protect critical stages
   */
  selective: (criticalStageIds: string[]): Partial<CancellationPolicy> => ({
    strategy: CancellationPropagationStrategy.SELECTIVE,
    criticalStageIds,
  }),

  /**
   * Drain mode - let current work finish
   */
  drain: (): Partial<CancellationPolicy> => ({
    strategy: CancellationPropagationStrategy.DRAIN,
  }),
};

// ============================================================================
// PIPELINE MONITORING
// ============================================================================

export interface PipelineMetrics {
  totalStages: number;
  completedStages: number;
  failedStages: number;
  currentStage?: string;
  executionTime: number;
  isCancelled: boolean;
  cancellationReason?: unknown;
}

export class PipelineMonitor {
  private metrics: Partial<PipelineMetrics> = {};
  private startTime?: number;

  onStageStart(stage: TaskStage): void {
    this.metrics.currentStage = stage.name;
    this.metrics.totalStages = (this.metrics.totalStages || 0) + 1;
  }

  onStageComplete(_stage: TaskStage): void {
    this.metrics.completedStages = (this.metrics.completedStages || 0) + 1;
  }

  onStageError(_stage: TaskStage, _error: Error): void {
    this.metrics.failedStages = (this.metrics.failedStages || 0) + 1;
  }

  onPipelineStart(): void {
    this.startTime = Date.now();
  }

  onPipelineComplete(): PipelineMetrics {
    const executionTime = this.startTime ? Date.now() - this.startTime : 0;
    return {
      totalStages: this.metrics.totalStages || 0,
      completedStages: this.metrics.completedStages || 0,
      failedStages: this.metrics.failedStages || 0,
      currentStage: this.metrics.currentStage,
      executionTime,
      isCancelled: false,
    };
  }

  onPipelineCancelled(reason: unknown): PipelineMetrics {
    const executionTime = this.startTime ? Date.now() - this.startTime : 0;
    return {
      totalStages: this.metrics.totalStages || 0,
      completedStages: this.metrics.completedStages || 0,
      failedStages: this.metrics.failedStages || 0,
      currentStage: this.metrics.currentStage,
      executionTime,
      isCancelled: true,
      cancellationReason: reason,
    };
  }
}
