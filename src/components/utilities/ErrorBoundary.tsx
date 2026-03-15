import type { ErrorInfo, ReactNode } from 'react';
import React, { Component, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { CSS_CLASSES } from '@/constants/ui';
import { useError } from '@/contexts/ErrorContext';
import type { AppError, ErrorBoundaryState } from '@/types/error';
import { ErrorCategory, ErrorSeverity, ErrorType } from '@/types/error';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (_error: AppError, _errorInfo: ErrorInfo) => void;
}

class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const appError: AppError = {
      id: `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: ErrorType.UNKNOWN_ERROR,
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.CRITICAL,
      message: error.message,
      userMessage: 'errors.messages.unknownError',
      timestamp: Date.now(),
      retryable: false,
      context: {
        componentStack: errorInfo.componentStack,
      },
      originalError: error,
    };

    this.setState({
      error: appError,
      errorInfo,
    });

    if (this.props.onError) {
      this.props.onError(appError, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: AppError | null;
  onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = React.memo(({ error, onReset }) => {
  const { t } = useTranslation(['common', 'errors']);
  const { dismissError } = useError();

  const handleDismiss = useCallback(() => {
    if (error) {
      dismissError(error.id);
    }
    onReset();
  }, [error, dismissError, onReset]);

  return (
    <div className={CSS_CLASSES.ERROR_BOUNDARY}>
      <div className={CSS_CLASSES.ERROR_BOUNDARY_CONTENT}>
        <div className={CSS_CLASSES.ERROR_BOUNDARY_ICON}>
          <i className="fas fa-exclamation-triangle"></i>
        </div>

        <h2 className={CSS_CLASSES.ERROR_BOUNDARY_TITLE}>{t('errors:boundary.title')}</h2>

        <p className={CSS_CLASSES.ERROR_BOUNDARY_MESSAGE}>{t('errors:boundary.message')}</p>

        {error && (
          <div className={CSS_CLASSES.ERROR_BOUNDARY_DETAILS}>
            <p className={CSS_CLASSES.ERROR_BOUNDARY_ERROR_TYPE}>
              {t('errors:boundary.errorType')}: {error.type}
            </p>
            <p className={CSS_CLASSES.ERROR_BOUNDARY_ERROR_MESSAGE}>
              {t('errors:boundary.errorMessage')}: {error.message}
            </p>
          </div>
        )}

        <div className={CSS_CLASSES.ERROR_BOUNDARY_ACTIONS}>
          <button className={CSS_CLASSES.ERROR_BOUNDARY_BUTTON} onClick={handleDismiss}>
            <i className="fas fa-redo"></i> {t('errors:boundary.retry')}
          </button>
        </div>
      </div>
    </div>
  );
});

ErrorFallback.displayName = 'ErrorFallback';

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = props => {
  const { handleError } = useError();

  const handleBoundaryError = (error: AppError, errorInfo: ErrorInfo) => {
    handleError(error, {
      source: 'error-boundary',
      componentStack: errorInfo.componentStack,
    });

    if (props.onError) {
      props.onError(error, errorInfo);
    }
  };

  return <ErrorBoundaryClass {...props} onError={handleBoundaryError} />;
};

export default ErrorBoundary;
