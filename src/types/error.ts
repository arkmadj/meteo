/**
 * Error handling types for the React Weather App
 */

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error categories
export enum ErrorCategory {
  NETWORK = 'network',
  API = 'api',
  VALIDATION = 'validation',
  GEOCODING = 'geocoding',
  WEATHER = 'weather',
  UNKNOWN = 'unknown',
}

// Error types
export enum ErrorType {
  NETWORK_ERROR = 'network_error',
  TIMEOUT_ERROR = 'timeout_error',
  API_ERROR = 'api_error',
  RATE_LIMIT_ERROR = 'rate_limit_error',
  CITY_NOT_FOUND = 'city_not_found',
  DEFAULT_CITY_NOT_FOUND = 'default_city_not_found',
  INVALID_COORDINATES = 'invalid_coordinates',
  WEATHER_DATA_ERROR = 'weather_data_error',
  GEOCODING_ERROR = 'geocoding_error',
  PARSING_ERROR = 'parsing_error',
  UNKNOWN_ERROR = 'unknown_error',
}

// Error interface
export interface AppError {
  id: string;
  type: ErrorType;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  timestamp: number;
  retryable: boolean;
  context?: Record<string, any>;
  originalError?: any;
}

// Error state interface
export interface ErrorState {
  errors: AppError[];
  hasError: boolean;
  lastError: AppError | null;
}

// Error action types
export type ErrorAction =
  | { type: 'ADD_ERROR'; payload: AppError }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'DISMISS_ERROR'; payload: string };

// Error handler function type
export type ErrorHandler = (error: any, context?: Record<string, any>) => AppError;

// Error logger function type
export type ErrorLogger = (error: AppError) => void;

// Retry function type
export type RetryFunction = () => Promise<any>;

// Error boundary state
export interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
  errorInfo: React.ErrorInfo | null;
}
