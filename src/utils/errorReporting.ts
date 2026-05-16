/**
 * Error Reporting Utilities
 * Export and share error reports for debugging
 */

import type { AppError } from '@/types/error';
import { errorMonitor } from './errorMonitoring';
import { getLogger } from './logger';

const logger = getLogger('ErrorReporting');

export interface ErrorReport {
  timestamp: number;
  appVersion: string;
  userAgent: string;
  url: string;
  stats: ReturnType<typeof errorMonitor.getStats>;
  patterns: ReturnType<typeof errorMonitor.getPatterns>;
  errors: AppError[];
  systemInfo: {
    platform: string;
    language: string;
    online: boolean;
    cookiesEnabled: boolean;
    screenResolution: string;
  };
}

/**
 * Generate comprehensive error report
 */
export function generateErrorReport(): ErrorReport {
  const stats = errorMonitor.getStats();
  const patterns = errorMonitor.getPatterns();

  return {
    timestamp: Date.now(),
    appVersion: import.meta.env.VITE_APP_VERSION || 'unknown',
    userAgent: navigator.userAgent,
    url: window.location.href,
    stats,
    patterns,
    errors: stats.recentErrors,
    systemInfo: {
      platform: navigator.platform,
      language: navigator.language,
      online: navigator.onLine,
      cookiesEnabled: navigator.cookieEnabled,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
    },
  };
}

/**
 * Export error report as JSON file
 */
export function exportErrorReport(): void {
  try {
    const report = generateErrorReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `error-report-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    logger.info('Error report exported');
  } catch (error) {
    logger.error('Failed to export error report', { error });
  }
}

/**
 * Copy error report to clipboard
 */
export async function copyErrorReportToClipboard(): Promise<boolean> {
  try {
    const report = generateErrorReport();
    await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    logger.info('Error report copied to clipboard');
    return true;
  } catch (error) {
    logger.error('Failed to copy error report to clipboard', { error });
    return false;
  }
}

/**
 * Generate shareable error summary
 */
export function generateErrorSummary(): string {
  const stats = errorMonitor.getStats();
  const patterns = errorMonitor.getPatterns();

  let summary = '# Error Report Summary\n\n';
  summary += `Generated: ${new Date().toISOString()}\n`;
  summary += `App Version: ${import.meta.env.VITE_APP_VERSION || 'unknown'}\n\n`;

  summary += '## Statistics\n';
  summary += `- Total Errors: ${stats.totalErrors}\n`;
  summary += `- Error Rate: ${stats.errorRate.toFixed(2)}/min\n`;
  summary += `- Recent Errors: ${stats.recentErrors.length}\n\n`;

  summary += '## Errors by Type\n';
  Object.entries(stats.errorsByType).forEach(([type, count]) => {
    summary += `- ${type}: ${count}\n`;
  });
  summary += '\n';

  summary += '## Errors by Severity\n';
  Object.entries(stats.errorsBySeverity).forEach(([severity, count]) => {
    summary += `- ${severity}: ${count}\n`;
  });
  summary += '\n';

  if (stats.topErrors.length > 0) {
    summary += '## Top Errors\n';
    stats.topErrors.forEach((err, idx) => {
      summary += `${idx + 1}. ${err.error} (${err.count}x)\n`;
    });
    summary += '\n';
  }

  if (patterns.length > 0) {
    summary += '## Detected Patterns\n';
    patterns.slice(0, 5).forEach((pattern, idx) => {
      summary += `${idx + 1}. ${pattern.pattern} - ${pattern.count} occurrences\n`;
      summary += `   First: ${new Date(pattern.firstOccurrence).toLocaleString()}\n`;
      summary += `   Last: ${new Date(pattern.lastOccurrence).toLocaleString()}\n`;
    });
  }

  return summary;
}

/**
 * Send error report to monitoring service (placeholder)
 */
export async function sendErrorReport(endpoint?: string): Promise<boolean> {
  try {
    const report = generateErrorReport();

    // In production, send to actual monitoring service
    const url = endpoint || import.meta.env.VITE_ERROR_REPORTING_URL;

    if (!url) {
      logger.warn('No error reporting endpoint configured');
      return false;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(report),
    });

    if (response.ok) {
      logger.info('Error report sent successfully');
      return true;
    } else {
      logger.error('Failed to send error report', {
        status: response.status,
      });
      return false;
    }
  } catch (error) {
    logger.error('Failed to send error report', { error });
    return false;
  }
}
