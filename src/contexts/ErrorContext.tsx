/**
 * Error Context for managing global error state in the React Weather App
 */

import type { ReactNode } from 'react';
import React, { createContext, useContext, useMemo, useReducer } from 'react';

import { ErrorContextUnavailableError } from '@/errors/domainErrors';
import type { AppError, ErrorAction, ErrorState } from '@/types/error';
import { createErrorHandler } from '@/utils/errorHandler';

// Initial error state
const initialErrorState: ErrorState = {
  errors: [],
  hasError: false,
  lastError: null,
};

// Error reducer
const errorReducer = (state: ErrorState, action: ErrorAction): ErrorState => {
  switch (action.type) {
    case 'ADD_ERROR': {
      const newErrors = [...state.errors, action.payload];
      return {
        errors: newErrors,
        hasError: true,
        lastError: action.payload,
      };
    }

    case 'REMOVE_ERROR': {
      const filteredErrors = state.errors.filter(error => error.id !== action.payload);
      return {
        errors: filteredErrors,
        hasError: filteredErrors.length > 0,
        lastError: filteredErrors.length > 0 ? filteredErrors?.[filteredErrors.length - 1] : null,
      };
    }

    case 'CLEAR_ERRORS':
      return {
        errors: [],
        hasError: false,
        lastError: null,
      };

    case 'DISMISS_ERROR': {
      const remainingErrors = state.errors.filter(error => error.id !== action.payload);
      return {
        errors: remainingErrors,
        hasError: remainingErrors.length > 0,
        lastError:
          remainingErrors.length > 0 ? remainingErrors?.[remainingErrors.length - 1] : null,
      };
    }

    default:
      return state;
  }
};

// Error context interface
export interface ErrorContextType {
  errorState: ErrorState;
  addError: (error: AppError) => void;
  removeError: (errorId: string) => void;
  clearErrors: () => void;
  dismissError: (errorId: string) => void;
  handleError: (error: any, context?: Record<string, any>) => AppError;
}

// Create error context
const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

// Error context provider component
interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [errorState, dispatch] = useReducer(errorReducer, initialErrorState);

  // Create error handler
  const handleError = (error: any, context?: Record<string, any>): AppError => {
    const handler = createErrorHandler();
    const appError = handler(error, context);
    dispatch({ type: 'ADD_ERROR', payload: appError });
    return appError;
  };

  // Add error to state
  const addError = (error: AppError) => {
    dispatch({ type: 'ADD_ERROR', payload: error });
  };

  // Remove error from state
  const removeError = (errorId: string) => {
    dispatch({ type: 'REMOVE_ERROR', payload: errorId });
  };

  // Clear all errors
  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  // Dismiss error (user action)
  const dismissError = (errorId: string) => {
    dispatch({ type: 'DISMISS_ERROR', payload: errorId });
  };

  const contextValue: ErrorContextType = {
    errorState,
    addError,
    removeError,
    clearErrors,
    dismissError,
    handleError,
  };

  return <ErrorContext.Provider value={contextValue}>{children}</ErrorContext.Provider>;
};

// Hook to use error context
export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new ErrorContextUnavailableError('useError must be used within an ErrorProvider');
  }
  return context;
};

// Hook to get current errors
export const useErrors = (): AppError[] => {
  const { errorState } = useError();
  return errorState.errors;
};

// Hook to get last error
export const useLastError = (): AppError | null => {
  const { errorState } = useError();
  return errorState.lastError;
};

// Hook to check if there are errors
export const useHasError = (): boolean => {
  const { errorState } = useError();
  return errorState.hasError;
};

// Hook to get errors by type - memoized to prevent unnecessary recalculations
export const useErrorsByType = (type: string): AppError[] => {
  const errors = useErrors();
  return useMemo(() => {
    return errors.filter(error => error.type === type);
  }, [errors, type]);
};

// Hook to get errors by category - memoized to prevent unnecessary recalculations
export const useErrorsByCategory = (category: string): AppError[] => {
  const errors = useErrors();
  return useMemo(() => {
    return errors.filter(error => error.category === category);
  }, [errors, category]);
};

// Hook to get errors by severity - memoized to prevent unnecessary recalculations
export const useErrorsBySeverity = (severity: string): AppError[] => {
  const errors = useErrors();
  return useMemo(() => {
    return errors.filter(error => error.severity === severity);
  }, [errors, severity]);
};

export default ErrorContext;
