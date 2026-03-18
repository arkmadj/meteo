/**
 * Error Display component for showing user-friendly error messages with retry functionality
 * Fully theme-aware with proper dark and light mode support
 */

import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert } from '@/components/ui';
import { Button } from '@/components/ui/atoms';
import { useError } from '@/contexts/ErrorContext';
import { useTheme } from '@/design-system/theme';
import type { AppError, RetryFunction } from '@/types/error';
import { ErrorSeverity } from '@/types/error';

interface ErrorDisplayProps {
  error: AppError;
  onRetry?: RetryFunction;
  onDismiss?: () => void;
  showDetails?: boolean;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = React.memo(
  ({ error, onRetry, onDismiss, showDetails = false, className = '' }) => {
    const { t } = useTranslation(['common', 'errors']);
    const { dismissError } = useError();
    const { theme } = useTheme();
    const [isRetrying, setIsRetrying] = useState(false);
    const [expanded, setExpanded] = useState(false);

    // Memoize getSeverityVariant to prevent recreation on every render
    const getSeverityVariant = useMemo(() => {
      return (severity: ErrorSeverity): 'info' | 'warning' | 'error' => {
        switch (severity) {
          case ErrorSeverity.LOW:
            return 'info';
          case ErrorSeverity.MEDIUM:
            return 'warning';
          case ErrorSeverity.HIGH:
          case ErrorSeverity.CRITICAL:
            return 'error';
          default:
            return 'error';
        }
      };
    }, []);

    // Memoize getLocalizedErrorMessage to prevent recreation on every render
    const getLocalizedErrorMessage = useMemo(() => {
      return (error: AppError): string => {
        // Map error types to i18n keys
        const errorKeyMap: Record<string, string> = {
          network_error: 'errors:messages.networkError',
          timeout_error: 'errors:messages.timeoutError',
          api_error: 'errors:messages.apiError',
          rate_limit_error: 'errors:messages.rateLimitError',
          city_not_found: 'errors:messages.cityNotFound',
          default_city_not_found: 'errors:messages.defaultCityNotFound',
          invalid_coordinates: 'errors:messages.invalidCoordinates',
          weather_data_error: 'errors:messages.weatherDataError',
          geocoding_error: 'errors:messages.geocodingError',
          parsing_error: 'errors:messages.parsingError',
          unknown_error: 'errors:messages.unknownError',
        };

        const key = errorKeyMap?.[error.type] || 'errors:messages.unknownError';
        return t(key, { defaultValue: error.userMessage });
      };
    }, [t]);

    // Memoize handleRetry to prevent recreation on every render
    const handleRetry = useCallback(async () => {
      if (!onRetry) return;

      setIsRetrying(true);
      try {
        await onRetry();
        // If retry is successful, dismiss the error
        dismissError(error.id);
      } catch (retryError) {
        // If retry fails, a new error will be created by the error handler
        console.error('Retry failed:', retryError);
      } finally {
        setIsRetrying(false);
      }
    }, [onRetry, dismissError, error.id]);

    // Memoize handleDismiss to prevent recreation on every render
    const handleDismiss = useCallback(() => {
      if (onDismiss) {
        onDismiss();
      } else {
        dismissError(error.id);
      }
    }, [onDismiss, dismissError, error.id]);

    // Memoize toggleExpanded to prevent recreation on every render
    const toggleExpanded = useCallback(() => {
      setExpanded(!expanded);
    }, [expanded]);

    const severityVariant = getSeverityVariant(error.severity);
    const errorMessage = getLocalizedErrorMessage(error);

    const actions = (
      <div className="flex gap-2 mt-3">
        {error.retryable && onRetry && (
          <Button disabled={isRetrying} size="sm" variant="outline" onClick={handleRetry}>
            {isRetrying ? (
              <i className="fas fa-spinner fa-spin mr-2"></i>
            ) : (
              <i className="fas fa-redo mr-2"></i>
            )}
            {t('errors:display.retry')}
          </Button>
        )}

        {showDetails && (
          <Button size="sm" variant="outline" onClick={toggleExpanded}>
            <i className={`fas fa-chevron-${expanded ? 'up' : 'down'} mr-2`}></i>
            {expanded ? t('errors:display.hideDetails') : t('errors:display.showDetails')}
          </Button>
        )}
      </div>
    );

    // Theme-aware styles for expanded details section
    const detailsContainerClasses = theme.isDark
      ? 'mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700'
      : 'mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200';

    const detailsTextClasses = theme.isDark
      ? 'space-y-2 text-sm text-gray-200'
      : 'space-y-2 text-sm text-gray-900';

    const detailsLabelClasses = theme.isDark ? 'text-gray-300 font-semibold' : 'font-semibold';

    const codeBlockClasses = theme.isDark
      ? 'mt-1 text-xs bg-gray-900/70 text-gray-300 p-2 rounded overflow-x-auto border border-gray-700'
      : 'mt-1 text-xs bg-gray-100 text-gray-800 p-2 rounded overflow-x-auto border border-gray-200';

    return (
      <div className={className}>
        <Alert title={t('errors:display.title')} variant={severityVariant} onClose={handleDismiss}>
          <div>
            <p>{errorMessage}</p>
            {actions}
          </div>
        </Alert>

        {expanded && showDetails && (
          <div className={detailsContainerClasses}>
            <div className={detailsTextClasses}>
              <div>
                <strong className={detailsLabelClasses}>{t('errors:display.type')}:</strong>{' '}
                {error.type}
              </div>
              <div>
                <strong className={detailsLabelClasses}>{t('errors:display.category')}:</strong>{' '}
                {error.category}
              </div>
              <div>
                <strong className={detailsLabelClasses}>{t('errors:display.severity')}:</strong>{' '}
                {error.severity}
              </div>
              <div>
                <strong className={detailsLabelClasses}>{t('errors:display.timestamp')}:</strong>{' '}
                {new Date(error.timestamp).toLocaleString()}
              </div>
              <div>
                <strong className={detailsLabelClasses}>{t('errors:display.retryable')}:</strong>{' '}
                {error.retryable ? t('errors:common.yes') : t('errors:common.no')}
              </div>
              {error.context && Object.keys(error.context).length > 0 && (
                <div>
                  <strong className={detailsLabelClasses}>{t('errors:display.context')}:</strong>
                  <pre className={codeBlockClasses}>{JSON.stringify(error.context, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

ErrorDisplay.displayName = 'ErrorDisplay';

// Error List component for displaying multiple errors
interface ErrorListProps {
  errors: AppError[];
  onRetry?: (_error: AppError) => Promise<any>;
  onDismiss?: (_error: AppError) => void;
  showDetails?: boolean;
  maxErrors?: number;
  className?: string;
}

export const ErrorList: React.FC<ErrorListProps> = ({
  errors,
  onRetry,
  onDismiss,
  showDetails = false,
  maxErrors = 5,
  className = '',
}) => {
  const { t } = useTranslation(['common', 'errors']);
  const { theme } = useTheme();

  if (errors.length === 0) {
    return null;
  }

  const displayErrors = errors.slice(-maxErrors);
  const hasMoreErrors = errors.length > maxErrors;

  // Theme-aware text color for "more errors" message
  const moreErrorsTextClasses = theme.isDark ? 'text-sm text-gray-400' : 'text-sm text-gray-600';

  return (
    <div className={className}>
      <Alert title={t('errors:list.title', { count: errors.length })} variant="warning">
        <div className="space-y-4">
          {displayErrors.map(error => (
            <ErrorDisplay
              key={error.id}
              error={error}
              showDetails={showDetails}
              onDismiss={onDismiss ? () => onDismiss(error) : undefined}
              onRetry={onRetry ? () => onRetry(error) : undefined}
            />
          ))}

          {hasMoreErrors && (
            <p className={moreErrorsTextClasses}>
              {t('errors:list.more', { count: errors.length - maxErrors })}
            </p>
          )}
        </div>
      </Alert>
    </div>
  );
};

export { ErrorDisplay };
export default ErrorDisplay;
