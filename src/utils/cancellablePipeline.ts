/**
 * Cooperative Cancellation System for Async Task Pipelines
 *
 * Provides a comprehensive architecture for managing cancellation across
 * complex async task pipelines with granular control and graceful degradation.
 */

import type { CancellationToken } from './cancellationToken';
import { CancellationTokenSource } from './cancellationToken';
import { scheduleEventDispatch } from './eventDispatcher';

// ============================================================================
// PIPELINE STAGE INTERFACE
// ============================================================================

export interface TaskStage<TInput = unknown, TOutput = unknown> {
  /** Unique stage identifier */
  readonly id: string;
  /** Stage name for debugging and logging */
  readonly name: string;
  /** Whether this stage can be safely interrupted */
  readonly isInterruptible: boolean;
  /** Estimated execution time for timeout calculations */
  readonly estimatedDuration?: number;

  /** Execute the stage with cancellation support */
  execute(input: TInput, token: CancellationToken): Promise<TOutput>;

  /** Optional cleanup when stage is cancelled */
  onCancel?(reason?: unknown): Promise<void>;

  /** Optional validation before stage execution */
  validate?(input: TInput): Promise<boolean>;
}

// ============================================================================
// CANCELLATION PROPAGATION STRATEGIES
// ============================================================================

export enum CancellationPropagationStrategy {
  /** Cancel immediately, don't wait for current stages to finish */
  IMMEDIATE = 'immediate',
  /** Allow current stages to finish, but don't start new ones */
  GRACEFUL = 'graceful',
  /** Wait for critical stages to finish, cancel non-critical ones */
  SELECTIVE = 'selective',
  /** Wait for all currently executing stages to finish */
  DRAIN = 'drain',
}

export interface CancellationPolicy {
  /** How cancellation propagates through the pipeline */
  strategy: CancellationPropagationStrategy;
  /** Maximum time to wait for graceful cancellation */
  gracefulTimeout?: number;
  /** Which stage IDs are considered critical */
  criticalStageIds?: string[];
  /** Custom cancellation logic per stage */
  stagePolicies?: Record<string, Partial<CancellationPolicy>>;
}

// ============================================================================
// PIPELINE EXECUTION CONTEXT
// ============================================================================

export interface PipelineExecutionContext {
  /** Unique execution identifier */
  readonly executionId: string;
  /** Root cancellation token for this execution */
  readonly cancellationToken: CancellationToken;
  /** Pipeline-wide cancellation policy */
  readonly policy: CancellationPolicy;
  /** Start time of the execution */
  readonly startTime: number;

  /** Current stage being executed */
  currentStage?: TaskStage;
  /** Completed stages in order */
  completedStages: string[];
  /** Failed stages with their errors */
  failedStages: Array<{ stageId: string; error: Error }>;

  /** Custom metadata for the execution */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// PIPELINE EVENTS
// ============================================================================

export interface PipelineEvents {
  /** Fired when a stage starts execution */
  stageStart: (stage: TaskStage, context: PipelineExecutionContext) => void;
  /** Fired when a stage completes successfully */
  stageComplete: (stage: TaskStage, result: unknown, context: PipelineExecutionContext) => void;
  /** Fired when a stage fails */
  stageError: (stage: TaskStage, error: Error, context: PipelineExecutionContext) => void;
  /** Fired when a stage is cancelled */
  stageCancelled: (stage: TaskStage, reason: unknown, context: PipelineExecutionContext) => void;
  /** Fired when the entire pipeline completes */
  pipelineComplete: (results: unknown[], context: PipelineExecutionContext) => void;
  /** Fired when the pipeline fails */
  pipelineError: (error: Error, context: PipelineExecutionContext) => void;
  /** Fired when the pipeline is cancelled */
  pipelineCancelled: (reason: unknown, context: PipelineExecutionContext) => void;
}

// ============================================================================
// CORE PIPELINE IMPLEMENTATION
// ============================================================================

export class CancellableTaskPipeline<TInput = unknown, TOutput = unknown> {
  private stages: TaskStage[] = [];
  private eventHandlers: Partial<PipelineEvents> = {};
  private defaultPolicy: CancellationPolicy = {
    strategy: CancellationPropagationStrategy.GRACEFUL,
    gracefulTimeout: 5000,
  };

  /**
   * Add a stage to the pipeline
   */
  addStage<TStageInput, TStageOutput>(stage: TaskStage<TStageInput, TStageOutput>): this {
    this.stages.push(stage);
    return this;
  }

  /**
   * Set the default cancellation policy for the pipeline
   */
  withPolicy(policy: Partial<CancellationPolicy>): this {
    this.defaultPolicy = { ...this.defaultPolicy, ...policy };
    return this;
  }

  /**
   * Register event handlers
   */
  on<K extends keyof PipelineEvents>(event: K, handler: PipelineEvents[K]): this {
    this.eventHandlers[event] = handler;
    return this;
  }

  /**
   * Emit a pipeline event in a React-friendly way. Handlers are invoked in a
   * microtask, which preserves same-macrotask semantics while avoiding
   * re-entrant React updates.
   */
  private emit<K extends keyof PipelineEvents>(
    event: K,
    ...args: Parameters<PipelineEvents[K]>
  ): void {
    const handler = this.eventHandlers[event];
    if (!handler) {
      return;
    }

    scheduleEventDispatch(() => {
      try {
        (handler as PipelineEvents[K])(...args);
      } catch (error) {
        console.error(`Error in pipeline event handler for ${String(event)}:`, error);
      }
    });
  }

  /**
   * Execute the pipeline with cancellation support
   */
  async execute(
    input: TInput,
    options: {
      cancellationToken?: CancellationToken;
      policy?: Partial<CancellationPolicy>;
      metadata?: Record<string, unknown>;
    } = {}
  ): Promise<TOutput> {
    const {
      cancellationToken: externalToken = new CancellationTokenSource(),
      policy: policyOverride = {},
      metadata = {},
    } = options;

    const policy = { ...this.defaultPolicy, ...policyOverride };
    const executionId = this.generateExecutionId();

    const context: PipelineExecutionContext = {
      executionId,
      cancellationToken: externalToken,
      policy,
      startTime: Date.now(),
      completedStages: [],
      failedStages: [],
      metadata,
    };

    try {
      // Create pipeline coordinator for this execution
      const coordinator = new PipelineCancellationCoordinator(context, this.eventHandlers);

      // Execute stages with cancellation coordination
      const result = await this.executeStages(input, context, coordinator);

      this.emit('pipelineComplete', result, context);
      return result;
    } catch (error) {
      if (error instanceof CancellationError) {
        this.emit('pipelineCancelled', error.reason, context);
        throw error;
      } else {
        this.emit('pipelineError', error as Error, context);
        throw error;
      }
    }
  }

  private async executeStages(
    input: TInput,
    context: PipelineExecutionContext,
    coordinator: PipelineCancellationCoordinator
  ): Promise<TOutput> {
    let currentResult: unknown = input;

    for (const stage of this.stages) {
      // Check for cancellation before starting each stage
      if (context.cancellationToken.isCancellationRequested) {
        throw new CancellationError(context.cancellationToken.reason);
      }

      // Validate input if stage provides validation
      if (stage.validate && !(await stage.validate(currentResult))) {
        throw new Error(`Validation failed for stage: ${stage.name}`);
      }

      context.currentStage = stage;

      try {
        this.emit('stageStart', stage, context);

        // Create stage-specific cancellation token
        const stageToken = coordinator.createStageToken(stage);

        // Execute the stage with cancellation support
        const stageResult = await stage.execute(currentResult, stageToken);

        context.completedStages.push(stage.id);
        currentResult = stageResult;

        this.emit('stageComplete', stage, stageResult, context);
      } catch (error) {
        if (error instanceof CancellationError) {
          this.emit('stageCancelled', stage, error.reason, context);
          coordinator.handleStageCancellation(stage, error.reason);
        } else {
          context.failedStages.push({ stageId: stage.id, error: error as Error });
          this.emit('stageError', stage, error as Error, context);

          // Best-effort cleanup for non-cancellation errors. Any errors thrown
          // by cleanup should be logged but must not replace the original
          // stage error. This keeps the failure surface predictable while
          // still allowing stages to release resources.
          if (stage.onCancel) {
            try {
              await stage.onCancel(error);
            } catch (cleanupError) {
              console.error(`Error during cleanup of failed stage ${stage.id}:`, cleanupError);
            }
          }
        }
        throw error;
      }
    }

    return currentResult as TOutput;
  }

  private generateExecutionId(): string {
    return `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// CANCELLATION ERROR
// ============================================================================

export class CancellationError extends Error {
  constructor(public readonly reason?: unknown) {
    super(`Operation cancelled: ${reason || 'No reason provided'}`);
    this.name = 'CancellationError';
  }
}

// ============================================================================
// PIPELINE CANCELLATION COORDINATOR
// ============================================================================

class PipelineCancellationCoordinator {
  private stageTokens = new Map<string, CancellationTokenSource>();
  private activeStages = new Set<TaskStage>();

  constructor(
    private context: PipelineExecutionContext,
    private eventHandlers: Partial<PipelineEvents>
  ) {
    // Setup cancellation handling
    this.context.cancellationToken.onCancelled(reason => {
      this.handlePipelineCancellation(reason);
    });
  }

  createStageToken(stage: TaskStage): CancellationToken {
    const source = new CancellationTokenSource(this.context.cancellationToken);
    this.stageTokens.set(stage.id, source);
    this.activeStages.add(stage);
    return source;
  }

  private handlePipelineCancellation(reason: unknown): void {
    const { strategy, gracefulTimeout, criticalStageIds } = this.context.policy;

    switch (strategy) {
      case CancellationPropagationStrategy.IMMEDIATE:
        this.cancelAllStages(reason);
        break;

      case CancellationPropagationStrategy.GRACEFUL:
        this.gracefulCancellation(reason, gracefulTimeout);
        break;

      case CancellationPropagationStrategy.SELECTIVE:
        this.selectiveCancellation(reason, criticalStageIds || []);
        break;

      case CancellationPropagationStrategy.DRAIN:
        // Let active stages finish naturally
        break;
    }
  }

  private cancelAllStages(reason: unknown): void {
    this.stageTokens.forEach(token => token.cancel(reason));
    this.activeStages.forEach(stage => {
      stage.onCancel?.(reason);
    });
  }

  private async gracefulCancellation(reason: unknown, timeout?: number): Promise<void> {
    const promises = Array.from(this.activeStages).map(async stage => {
      try {
        await stage.onCancel?.(reason);
      } catch (error) {
        console.error(`Error during graceful cancellation of stage ${stage.id}:`, error);
      }
    });

    if (timeout) {
      await Promise.race([
        Promise.all(promises),
        new Promise(resolve => setTimeout(resolve, timeout)),
      ]);
    } else {
      await Promise.all(promises);
    }

    this.cancelAllStages(reason);
  }

  private selectiveCancellation(reason: unknown, criticalStageIds: string[]): void {
    this.activeStages.forEach(stage => {
      if (criticalStageIds.includes(stage.id)) {
        // Critical stage - let it finish
        return;
      }

      const token = this.stageTokens.get(stage.id);
      if (token) {
        token.cancel(reason);
      }
    });
  }

  handleStageCancellation(stage: TaskStage, _reason: unknown): void {
    this.activeStages.delete(stage);
    this.stageTokens.delete(stage.id);
  }
}
