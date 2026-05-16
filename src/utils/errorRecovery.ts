/**
 * Error Recovery Service
 * Provides strategies for recovering from errors with fallback mechanisms
 */

import type { AppError } from '@/types/error';
import { ErrorType } from '@/types/error';
import { getLogger } from './logger';

const logger = getLogger('ErrorRecovery');

export interface RecoveryStrategy<T> {
  name: string;
  canHandle: (error: AppError) => boolean;
  execute: (error: AppError, context?: RecoveryContext) => Promise<RecoveryResult<T>>;
  priority: number; // Lower = higher priority
}

export interface RecoveryContext {
  /** Original function that failed */
  originalFunction?: () => Promise<unknown>;
  /** Number of recovery attempts already made */
  attemptCount?: number;
  /** Additional context data */
  data?: Record<string, unknown>;
}

export interface RecoveryResult<T> {
  success: boolean;
  data?: T;
  error?: AppError;
  strategy?: string;
  fallbackUsed?: boolean;
}

export class ErrorRecoveryService {
  private strategies: RecoveryStrategy<unknown>[] = [];

  /**
   * Register a recovery strategy
   */
  registerStrategy<T>(strategy: RecoveryStrategy<T>): void {
    this.strategies.push(strategy as RecoveryStrategy<unknown>);
    // Sort by priority
    this.strategies.sort((a, b) => a.priority - b.priority);
    logger.info(`Registered recovery strategy: ${strategy.name}`);
  }

  /**
   * Attempt to recover from an error
   */
  async recover<T>(error: AppError, context?: RecoveryContext): Promise<RecoveryResult<T>> {
    logger.info('Attempting error recovery', {
      errorType: error.type,
      errorMessage: error.message,
      strategies: this.strategies.length,
    });

    // Find applicable strategies
    const applicableStrategies = this.strategies.filter(s => s.canHandle(error));

    if (applicableStrategies.length === 0) {
      logger.warn('No recovery strategy found for error', { errorType: error.type });
      return {
        success: false,
        error,
      };
    }

    // Try each strategy in order of priority
    for (const strategy of applicableStrategies) {
      try {
        logger.info(`Trying recovery strategy: ${strategy.name}`);
        const result = await strategy.execute(error, context);

        if (result.success) {
          logger.info(`Recovery successful with strategy: ${strategy.name}`);
          return {
            ...result,
            strategy: strategy.name,
          } as RecoveryResult<T>;
        }
      } catch (recoveryError) {
        logger.warn(`Recovery strategy failed: ${strategy.name}`, {
          error: recoveryError instanceof Error ? recoveryError.message : String(recoveryError),
        });
      }
    }

    return {
      success: false,
      error,
    };
  }

  /**
   * Get registered strategies
   */
  getStrategies(): ReadonlyArray<RecoveryStrategy<unknown>> {
    return this.strategies;
  }

  /**
   * Clear all strategies
   */
  clearStrategies(): void {
    this.strategies = [];
    logger.info('Cleared all recovery strategies');
  }
}

// Default recovery strategies

/**
 * Retry strategy - attempts to re-execute the original function
 */
export const retryStrategy: RecoveryStrategy<unknown> = {
  name: 'retry',
  priority: 1,
  canHandle: (error: AppError) => error.retryable === true,
  execute: async (error: AppError, context?: RecoveryContext) => {
    const maxAttempts = 3;
    const attemptCount = context?.attemptCount || 0;

    if (attemptCount >= maxAttempts || !context?.originalFunction) {
      return { success: false, error };
    }

    try {
      const data = await context.originalFunction();
      return { success: true, data };
    } catch {
      return { success: false, error };
    }
  },
};

/**
 * Cache fallback strategy - uses cached data if available
 */
export const cacheFallbackStrategy: RecoveryStrategy<unknown> = {
  name: 'cache-fallback',
  priority: 2,
  canHandle: (error: AppError) => {
    return [ErrorType.NETWORK_ERROR, ErrorType.TIMEOUT_ERROR, ErrorType.API_ERROR].includes(
      error.type
    );
  },
  execute: async (_error: AppError, context?: RecoveryContext) => {
    const cachedData = context?.data?.cached;
    if (cachedData) {
      logger.info('Using cached data as fallback');
      return { success: true, data: cachedData, fallbackUsed: true };
    }
    return { success: false };
  },
};

// Create singleton instance
export const errorRecoveryService = new ErrorRecoveryService();

// Register default strategies
errorRecoveryService.registerStrategy(retryStrategy);
errorRecoveryService.registerStrategy(cacheFallbackStrategy);
