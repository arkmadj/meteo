/**
 * Higher-Order Component for Error Boundary
 * Wraps components with error boundaries for isolated error handling
 */

import type { ComponentType } from 'react';
import React from 'react';

import EnhancedErrorDisplay from '@/components/utilities/EnhancedErrorDisplay';
import ErrorBoundary from '@/components/utilities/ErrorBoundary';
import type { AppError } from '@/types/error';
import { getLogger } from '@/utils/logger';

const logger = getLogger('ErrorBoundaryHOC');

export interface WithErrorBoundaryOptions {
  /** Custom fallback component */
  fallback?: React.ReactNode;
  /** Error handler callback */
  onError?: (error: AppError, errorInfo: React.ErrorInfo) => void;
  /** Component name for logging */
  componentName?: string;
  /** Whether to show retry button */
  showRetry?: boolean;
  /** Whether to show error details */
  showDetails?: boolean;
  /** Custom error message */
  errorMessage?: string;
}

/**
 * HOC that wraps a component with an error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
): ComponentType<P> {
  const {
    fallback,
    onError,
    componentName,
    showRetry = true,
    showDetails = false,
    errorMessage,
  } = options;

  const WrappedComponent: React.FC<P> = props => {
    const handleError = (error: AppError, errorInfo: React.ErrorInfo) => {
      logger.error(`Error in ${componentName || Component.displayName || 'Component'}`, {
        error: error.message,
        componentStack: errorInfo.componentStack,
      });

      onError?.(error, errorInfo);
    };

    return (
      <ErrorBoundary
        onError={handleError}
        fallback={fallback || <DefaultFallback onReset={() => {}} />}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  const DefaultFallback: React.FC<{ onReset: () => void }> = ({ onReset }) => {
    const [currentError] = React.useState<AppError>(() => ({
      id: 'unknown',
      type: 'unknown_error' as never,
      category: 'unknown' as never,
      severity: 'high' as never,
      message: errorMessage || 'An error occurred in this component',
      userMessage: errorMessage || 'An error occurred',
      timestamp: Date.now(),
      retryable: showRetry,
    }));

    return (
      <EnhancedErrorDisplay
        error={currentError}
        onRetry={showRetry ? onReset : undefined}
        showDetails={showDetails}
      />
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${componentName || Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}

/**
 * Error boundary for async components (Suspense fallbacks)
 */
export const AsyncErrorBoundary: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => {
  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <div className="flex items-center justify-center p-8">
            <EnhancedErrorDisplay
              error={{
                id: 'async-error',
                type: 'unknown_error' as never,
                category: 'unknown' as never,
                severity: 'medium' as never,
                message: 'Failed to load component',
                userMessage: 'Failed to load this section',
                timestamp: Date.now(),
                retryable: true,
              }}
              onRetry={() => window.location.reload()}
              showSuggestions={true}
            />
          </div>
        )
      }
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * Error boundary specifically for routes
 */
export const RouteErrorBoundary: React.FC<{
  children: React.ReactNode;
  routeName?: string;
}> = ({ children, routeName }) => {
  return (
    <ErrorBoundary
      onError={error => {
        logger.error(`Error in route: ${routeName}`, { error });
      }}
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <EnhancedErrorDisplay
              error={{
                id: 'route-error',
                type: 'unknown_error' as never,
                category: 'unknown' as never,
                severity: 'high' as never,
                message: `Error loading ${routeName || 'page'}`,
                userMessage: 'Page failed to load',
                timestamp: Date.now(),
                retryable: true,
              }}
              onRetry={() => window.location.reload()}
              showSuggestions={true}
              showDetails={import.meta.env.DEV}
            />
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export default withErrorBoundary;
