/**
 * Enhanced Error Display Component
 * Provides rich error display with contextual help, suggestions, and illustrations
 */

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert } from '@/components/ui';
import { Button } from '@/components/ui/atoms';
import { useTheme } from '@/design-system/theme';
import type { AppError } from '@/types/error';
import { ErrorSeverity, ErrorType } from '@/types/error';

interface EnhancedErrorDisplayProps {
  error: AppError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  showSuggestions?: boolean;
  className?: string;
}

/**
 * Get error illustration emoji
 */
const getErrorIllustration = (type: ErrorType): string => {
  const illustrations: Record<ErrorType, string> = {
    [ErrorType.NETWORK_ERROR]: '📡',
    [ErrorType.TIMEOUT_ERROR]: '⏱️',
    [ErrorType.API_ERROR]: '🔌',
    [ErrorType.RATE_LIMIT_ERROR]: '🚦',
    [ErrorType.CITY_NOT_FOUND]: '🔍',
    [ErrorType.DEFAULT_CITY_NOT_FOUND]: '🏙️',
    [ErrorType.INVALID_COORDINATES]: '📍',
    [ErrorType.WEATHER_DATA_ERROR]: '🌤️',
    [ErrorType.GEOCODING_ERROR]: '🗺️',
    [ErrorType.PARSING_ERROR]: '⚙️',
    [ErrorType.UNKNOWN_ERROR]: '❓',
  };
  return illustrations[type] || '⚠️';
};

/**
 * Get contextual help suggestions for each error type
 */
const getErrorSuggestions = (type: ErrorType): string[] => {
  const suggestions: Record<ErrorType, string[]> = {
    [ErrorType.NETWORK_ERROR]: [
      'Check your internet connection',
      'Try refreshing the page',
      'Disable any VPN or proxy temporarily',
      'Check if your firewall is blocking the connection',
    ],
    [ErrorType.TIMEOUT_ERROR]: [
      'Your connection may be slow',
      'Try again in a few moments',
      'Check your internet speed',
    ],
    [ErrorType.API_ERROR]: [
      'The weather service may be temporarily unavailable',
      'Try again in a few minutes',
      'Check the service status page',
    ],
    [ErrorType.RATE_LIMIT_ERROR]: [
      'Too many requests made recently',
      'Please wait a moment before trying again',
      'Consider reducing the frequency of requests',
    ],
    [ErrorType.CITY_NOT_FOUND]: [
      'Check the spelling of the city name',
      'Try including the country name (e.g., "Paris, France")',
      'Use a larger nearby city',
      'Verify the location exists in our database',
    ],
    [ErrorType.DEFAULT_CITY_NOT_FOUND]: [
      'The default location could not be loaded',
      'Try searching for a specific city',
      'Check your browser location permissions',
    ],
    [ErrorType.INVALID_COORDINATES]: [
      'The location coordinates are invalid',
      'Try searching by city name instead',
      'Enable location services in your browser',
    ],
    [ErrorType.WEATHER_DATA_ERROR]: [
      'Weather data is temporarily unavailable',
      'Try a different location',
      'Refresh the page',
    ],
    [ErrorType.GEOCODING_ERROR]: [
      'Location service is having issues',
      'Try entering coordinates manually',
      'Use a more specific location name',
    ],
    [ErrorType.PARSING_ERROR]: [
      'There was an issue processing the data',
      'Try refreshing the page',
      'Clear your browser cache',
    ],
    [ErrorType.UNKNOWN_ERROR]: [
      'An unexpected error occurred',
      'Try refreshing the page',
      'If the problem persists, contact support',
    ],
  };
  return suggestions[type] || [];
};

const EnhancedErrorDisplay: React.FC<EnhancedErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  showSuggestions = true,
  className = '',
}) => {
  const { t } = useTranslation(['errors', 'common']);
  const { theme } = useTheme();

  const illustration = getErrorIllustration(error.type);
  const suggestions = useMemo(() => getErrorSuggestions(error.type), [error.type]);

  const variant = useMemo(() => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warning';
      default:
        return 'info';
    }
  }, [error.severity]);

  return (
    <Alert variant={variant} className={className}>
      <div className="space-y-4">
        {/* Error header with illustration */}
        <div className="flex items-start space-x-3">
          <span className="text-4xl" role="img" aria-label={error.type}>
            {illustration}
          </span>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{t(error.userMessage)}</h3>
            <p className={`text-sm ${theme.isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {error.message}
            </p>
          </div>
        </div>

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className={`rounded-md p-3 ${theme.isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <h4 className="font-medium text-sm mb-2">💡 {t('common:suggestions')}</h4>
            <ul className="space-y-1 text-sm">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Error details (expandable) */}
        {showDetails && error.context && (
          <details className={`text-xs ${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <summary className="cursor-pointer font-medium mb-1">
              {t('common:technicalDetails')}
            </summary>
            <pre className="mt-2 overflow-auto p-2 rounded bg-black/10">
              {JSON.stringify(error.context, null, 2)}
            </pre>
          </details>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {onRetry && error.retryable && (
            <Button onClick={onRetry} size="sm" variant="primary">
              🔄 {t('common:retry')}
            </Button>
          )}
          {onDismiss && (
            <Button onClick={onDismiss} size="sm" variant="outline">
              {t('common:dismiss')}
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
};

export default EnhancedErrorDisplay;
