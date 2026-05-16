/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by stopping requests to failing services
 */

import { getLogger } from './logger';

const logger = getLogger('CircuitBreaker');

export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Failing, reject requests immediately
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

export interface CircuitBreakerConfig {
  /** Failure threshold percentage to open circuit (0-100) */
  failureThreshold: number;
  /** Minimum number of requests before evaluating */
  minimumRequests: number;
  /** Time in ms to wait before attempting recovery */
  resetTimeout: number;
  /** Time window in ms for tracking failures */
  windowSize: number;
  /** Name for logging purposes */
  name?: string;
}

interface RequestRecord {
  success: boolean;
  timestamp: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: RequestRecord[] = [];
  private successes: RequestRecord[] = [];
  private nextAttempt: number = 0;
  private readonly config: Required<CircuitBreakerConfig>;

  constructor(config: CircuitBreakerConfig) {
    this.config = {
      failureThreshold: config.failureThreshold,
      minimumRequests: config.minimumRequests,
      resetTimeout: config.resetTimeout,
      windowSize: config.windowSize,
      name: config.name || 'CircuitBreaker',
    };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      // Check if enough time has passed to try again
      if (Date.now() < this.nextAttempt) {
        throw new Error(
          `Circuit breaker "${this.config.name}" is OPEN. Service temporarily unavailable.`
        );
      }
      // Transition to half-open to test recovery
      this.state = CircuitState.HALF_OPEN;
      logger.info(`Circuit breaker "${this.config.name}" transitioning to HALF_OPEN`);
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Record a successful request
   */
  private recordSuccess(): void {
    const now = Date.now();
    this.successes.push({ success: true, timestamp: now });
    this.cleanOldRecords();

    if (this.state === CircuitState.HALF_OPEN) {
      // Successful request in half-open state, close circuit
      this.state = CircuitState.CLOSED;
      this.failures = [];
      logger.info(`Circuit breaker "${this.config.name}" closed - service recovered`);
    }
  }

  /**
   * Record a failed request
   */
  private recordFailure(): void {
    const now = Date.now();
    this.failures.push({ success: false, timestamp: now });
    this.cleanOldRecords();

    if (this.state === CircuitState.HALF_OPEN) {
      // Failure in half-open state, reopen circuit
      this.openCircuit();
      return;
    }

    // Check if we should open the circuit
    const totalRequests = this.failures.length + this.successes.length;
    if (totalRequests >= this.config.minimumRequests) {
      const failureRate = (this.failures.length / totalRequests) * 100;
      if (failureRate >= this.config.failureThreshold) {
        this.openCircuit();
      }
    }
  }

  /**
   * Open the circuit breaker
   */
  private openCircuit(): void {
    this.state = CircuitState.OPEN;
    this.nextAttempt = Date.now() + this.config.resetTimeout;
    logger.warn(
      `Circuit breaker "${this.config.name}" opened due to ${this.failures.length} failures. ` +
        `Will retry in ${this.config.resetTimeout}ms`
    );
  }

  /**
   * Remove old records outside the window
   */
  private cleanOldRecords(): void {
    const cutoff = Date.now() - this.config.windowSize;
    this.failures = this.failures.filter(r => r.timestamp > cutoff);
    this.successes = this.successes.filter(r => r.timestamp > cutoff);
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get circuit statistics
   */
  getStats() {
    const total = this.failures.length + this.successes.length;
    return {
      state: this.state,
      totalRequests: total,
      failures: this.failures.length,
      successes: this.successes.length,
      failureRate: total > 0 ? (this.failures.length / total) * 100 : 0,
      nextAttempt: this.state === CircuitState.OPEN ? new Date(this.nextAttempt) : null,
    };
  }

  /**
   * Force reset the circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = [];
    this.successes = [];
    this.nextAttempt = 0;
    logger.info(`Circuit breaker "${this.config.name}" manually reset`);
  }
}
