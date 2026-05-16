/**
 * Error Monitoring and Analytics
 * Tracks error patterns and provides insights for debugging
 */

import type { AppError, ErrorCategory, ErrorType } from '@/types/error';
import { ErrorSeverity } from '@/types/error';
import { getLogger } from './logger';

const logger = getLogger('ErrorMonitoring');

export interface ErrorStats {
  totalErrors: number;
  errorsByType: Record<ErrorType, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorsByCategory: Record<ErrorCategory, number>;
  recentErrors: AppError[];
  topErrors: Array<{ error: string; count: number }>;
  errorRate: number; // errors per minute
  lastError: AppError | null;
}

export interface ErrorPattern {
  pattern: string;
  count: number;
  firstOccurrence: number;
  lastOccurrence: number;
  errors: AppError[];
}

const MAX_RECENT_ERRORS = 50;
const ERROR_RATE_WINDOW = 60000; // 1 minute

export class ErrorMonitor {
  private errors: AppError[] = [];
  private errorCounts: Map<string, number> = new Map();
  private patterns: Map<string, ErrorPattern> = new Map();
  private startTime: number = Date.now();

  /**
   * Record an error for monitoring
   */
  recordError(error: AppError): void {
    this.errors.push(error);

    // Update error counts
    const errorKey = `${error.type}:${error.message}`;
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);

    // Detect patterns
    this.detectPattern(error);

    // Trim old errors (keep last 1000)
    if (this.errors.length > 1000) {
      this.errors = this.errors.slice(-1000);
    }

    // Log high severity errors
    if (error.severity === ErrorSeverity.CRITICAL || error.severity === ErrorSeverity.HIGH) {
      logger.error('High severity error detected', {
        type: error.type,
        message: error.message,
        context: error.context,
      });
    }
  }

  /**
   * Detect error patterns (e.g., repeated errors)
   */
  private detectPattern(error: AppError): void {
    const patternKey = `${error.type}:${error.category}`;
    const existing = this.patterns.get(patternKey);

    if (existing) {
      existing.count++;
      existing.lastOccurrence = error.timestamp;
      existing.errors.push(error);

      // Keep only recent errors in pattern (last 10)
      if (existing.errors.length > 10) {
        existing.errors = existing.errors.slice(-10);
      }

      // Alert on repeated patterns
      if (existing.count === 5 || existing.count === 10 || existing.count % 50 === 0) {
        logger.warn(`Error pattern detected: ${patternKey}`, {
          count: existing.count,
          timeSinceFirst: error.timestamp - existing.firstOccurrence,
        });
      }
    } else {
      this.patterns.set(patternKey, {
        pattern: patternKey,
        count: 1,
        firstOccurrence: error.timestamp,
        lastOccurrence: error.timestamp,
        errors: [error],
      });
    }
  }

  /**
   * Get comprehensive error statistics
   */
  getStats(): ErrorStats {
    const now = Date.now();
    const recentWindow = now - ERROR_RATE_WINDOW;
    const recentErrors = this.errors.filter(e => e.timestamp > recentWindow);

    const errorsByType = {} as Record<ErrorType, number>;
    const errorsBySeverity = {} as Record<ErrorSeverity, number>;
    const errorsByCategory = {} as Record<ErrorCategory, number>;

    this.errors.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
      errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
    });

    const topErrors = Array.from(this.errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([error, count]) => ({ error, count }));

    return {
      totalErrors: this.errors.length,
      errorsByType,
      errorsBySeverity,
      errorsByCategory,
      recentErrors: this.errors.slice(-MAX_RECENT_ERRORS),
      topErrors,
      errorRate: recentErrors.length / (ERROR_RATE_WINDOW / 60000),
      lastError: this.errors.length > 0 ? this.errors[this.errors.length - 1] : null,
    };
  }

  /**
   * Get detected error patterns
   */
  getPatterns(): ErrorPattern[] {
    return Array.from(this.patterns.values()).sort((a, b) => b.count - a.count);
  }

  /**
   * Clear error history
   */
  clear(): void {
    this.errors = [];
    this.errorCounts.clear();
    this.patterns.clear();
    this.startTime = Date.now();
    logger.info('Error monitoring data cleared');
  }

  /**
   * Export error data for analysis
   */
  export(): { errors: AppError[]; stats: ErrorStats; patterns: ErrorPattern[] } {
    return {
      errors: this.errors,
      stats: this.getStats(),
      patterns: this.getPatterns(),
    };
  }
}

// Singleton instance
export const errorMonitor = new ErrorMonitor();
