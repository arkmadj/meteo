/**
 * Error Handling Example Component
 *
 * Demonstrates proper error handling with different display mediums:
 * - Snackbar for temporary notifications
 * - Alert for persistent warnings
 * - ErrorDisplay for retryable errors
 * - ErrorBoundary for component errors
 */

import { Alert } from '@/components/ui';
import { Button } from '@/components/ui/atoms';
import { ErrorBoundary } from '@/components/utilities/ErrorBoundary';
import { ErrorDisplay } from '@/components/utilities/ErrorDisplay';
import { useError, useErrors } from '@/contexts/ErrorContext';
import { CityNotFoundError } from '@/errors/domainErrors';
import { useErrorDisplay } from '@/hooks/useErrorDisplay';
import type { AppError } from '@/types/error';
import { ErrorCategory, ErrorSeverity, ErrorType } from '@/types/error';
import React, { useState } from 'react';

/**
 * Example 1: Using useErrorDisplay hook (Recommended)
 */
export const SimpleErrorHandlingExample: React.FC = () => {
  const { displayError, displaySuccess, displayWarning, displayInfo } = useErrorDisplay();

  const handleSuccess = () => {
    displaySuccess('Operation completed successfully!');
  };

  const handleWarning = () => {
    displayWarning('This action may take a few moments.');
  };

  const handleInfo = () => {
    displayInfo('Weather data was last updated 5 minutes ago.');
  };

  const handleSimpleError = () => {
    // Simple string error - will use snackbar
    displayError('Something went wrong. Please try again.');
  };

  const handleNetworkError = () => {
    // Network error - will use ErrorDisplay with retry
    const error = new Error('Failed to fetch weather data');
    displayError(error, { showRetry: true });
  };

  const handleCriticalError = () => {
    // Critical error - will use ErrorDisplay
    const criticalError: AppError = {
      id: `error-${Date.now()}`,
      type: ErrorType.WEATHER_DATA_ERROR,
      category: ErrorCategory.WEATHER,
      severity: ErrorSeverity.CRITICAL,
      message: 'Critical system error',
      userMessage: 'A critical error occurred. Please refresh the page.',
      timestamp: Date.now(),
      retryable: false,
    };
    displayError(criticalError);
  };

  return (
    <div className="space-y-4 p-6 bg-[var(--theme-surface)] rounded-lg">
      <h2 className="text-xl font-bold text-[var(--theme-text)]">
        Simple Error Handling (useErrorDisplay Hook)
      </h2>

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleSuccess} variant="primary">
          Show Success
        </Button>
        <Button onClick={handleWarning} variant="secondary">
          Show Warning
        </Button>
        <Button onClick={handleInfo} variant="secondary">
          Show Info
        </Button>
        <Button onClick={handleSimpleError} variant="error">
          Simple Error
        </Button>
        <Button onClick={handleNetworkError} variant="error">
          Network Error
        </Button>
        <Button onClick={handleCriticalError} variant="error">
          Critical Error
        </Button>
      </div>
    </div>
  );
};

/**
 * Example 2: Manual error handling with different mediums
 */
export const ManualErrorHandlingExample: React.FC = () => {
  const { displayError, displaySuccess } = useErrorDisplay();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [cityName, setCityName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation - show with Alert
    if (!cityName.trim()) {
      setValidationError('City name is required');
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (cityName.toLowerCase() === 'error') {
            reject(new CityNotFoundError(cityName));
          } else {
            resolve({ city: cityName, temp: 72 });
          }
        }, 1000);
      });

      displaySuccess(`Weather data loaded for ${cityName}!`);
      setCityName('');
    } catch (error) {
      if (error instanceof CityNotFoundError) {
        // Non-critical error - use snackbar
        displayError(`City "${cityName}" not found. Please try a different location.`);
      } else {
        // Unknown error - use error display
        displayError(error as Error, { showRetry: true });
      }
    }
  };

  return (
    <div className="space-y-4 p-6 bg-[var(--theme-surface)] rounded-lg">
      <h2 className="text-xl font-bold text-[var(--theme-text)]">
        Form with Validation (Alert for validation errors)
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Validation error shown with Alert */}
        {validationError && (
          <Alert variant="error" onClose={() => setValidationError(null)}>
            {validationError}
          </Alert>
        )}

        <div className="space-y-2">
          <label htmlFor="city" className="block text-sm font-medium text-[var(--theme-text)]">
            City Name (type "error" to simulate error)
          </label>
          <input
            id="city"
            type="text"
            value={cityName}
            onChange={e => setCityName(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-md bg-[var(--theme-bg)] text-[var(--theme-text)]"
            placeholder="Enter city name"
          />
        </div>

        <Button type="submit" variant="primary">
          Load Weather
        </Button>
      </form>
    </div>
  );
};

/**
 * Example 3: Error handling with ErrorDisplay component
 */
export const ErrorDisplayExample: React.FC = () => {
  const { handleError, removeError } = useError();
  const errors = useErrors();
  const [isLoading, setIsLoading] = useState(false);

  const simulateRetryableError = async () => {
    setIsLoading(true);
    try {
      // Simulate network error
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Network request failed'));
        }, 1000);
      });
    } catch (error) {
      handleError(error, {
        source: 'error-display-example',
        action: 'simulate-error',
        retryable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    // Clear errors and retry
    errors.forEach(error => removeError(error.id));
    await simulateRetryableError();
  };

  return (
    <div className="space-y-4 p-6 bg-[var(--theme-surface)] rounded-lg">
      <h2 className="text-xl font-bold text-[var(--theme-text)]">
        ErrorDisplay Component (for retryable errors)
      </h2>

      <Button onClick={simulateRetryableError} disabled={isLoading} variant="error">
        {isLoading ? 'Loading...' : 'Simulate Network Error'}
      </Button>

      {/* Show errors with ErrorDisplay */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map(error => (
            <ErrorDisplay
              key={error.id}
              error={error}
              onRetry={handleRetry}
              onDismiss={() => removeError(error.id)}
              showDetails={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Component that throws an error (for ErrorBoundary demo)
 */
const BuggyComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('This is a simulated component error!');
  }
  return <div className="text-[var(--theme-text)]">Component is working fine!</div>;
};

/**
 * Example 4: ErrorBoundary usage
 */
export const ErrorBoundaryExample: React.FC = () => {
  const [shouldThrow, setShouldThrow] = useState(false);
  const [key, setKey] = useState(0);

  const handleReset = () => {
    setShouldThrow(false);
    setKey(prev => prev + 1); // Force remount
  };

  return (
    <div className="space-y-4 p-6 bg-[var(--theme-surface)] rounded-lg">
      <h2 className="text-xl font-bold text-[var(--theme-text)]">
        ErrorBoundary (catches React component errors)
      </h2>

      <div className="flex gap-2">
        <Button onClick={() => setShouldThrow(true)} variant="error">
          Trigger Component Error
        </Button>
        <Button onClick={handleReset} variant="secondary">
          Reset
        </Button>
      </div>

      <ErrorBoundary
        key={key}
        fallback={
          <Alert variant="error">
            <div className="space-y-2">
              <p className="font-semibold">Something went wrong in this component.</p>
              <Button onClick={handleReset} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </Alert>
        }
      >
        <div className="p-4 border border-[var(--theme-border)] rounded-md">
          <BuggyComponent shouldThrow={shouldThrow} />
        </div>
      </ErrorBoundary>
    </div>
  );
};

/**
 * Main example component combining all examples
 */
export const ErrorHandlingExamples: React.FC = () => {
  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-[var(--theme-text)]">Error Handling Examples</h1>
        <p className="text-[var(--theme-text-secondary)]">
          Demonstrating different error handling patterns and display mediums
        </p>
      </div>

      <SimpleErrorHandlingExample />
      <ManualErrorHandlingExample />
      <ErrorDisplayExample />
      <ErrorBoundaryExample />

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Best Practices</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>Use Snackbar for temporary, non-critical feedback</li>
          <li>Use Alert for validation errors and persistent warnings</li>
          <li>Use ErrorDisplay for retryable errors with user actions</li>
          <li>Use ErrorBoundary to catch unexpected React component errors</li>
          <li>Always provide user-friendly, actionable error messages</li>
          <li>Include retry functionality for network and API errors</li>
        </ul>
      </div>
    </div>
  );
};

export default ErrorHandlingExamples;
