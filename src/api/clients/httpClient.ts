/**
 * HTTP Client
 *
 * A centralized HTTP client with interceptors, error handling,
 * circuit breaker protection, and request/response transformation capabilities.
 */

import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import axios from 'axios';

import type { CircuitState } from '@/utils/circuitBreaker';
import { CircuitBreaker } from '@/utils/circuitBreaker';
import { getLogger } from '@/utils/logger';

const logger = getLogger('HttpClient');

/**
 * API Error interface
 */
export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, unknown>;
  retryable?: boolean;
  circuitState?: CircuitState;
}

/**
 * HTTP Client Configuration
 */
interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
  retryDelay?: number;
  enableCircuitBreaker?: boolean;
  circuitBreakerConfig?: {
    failureThreshold: number;
    minimumRequests: number;
    resetTimeout: number;
    windowSize: number;
  };
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: HttpClientConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  retries: 3,
  retryDelay: 1000,
};

/**
 * HTTP Client Class
 *
 * Provides a centralized HTTP client with interceptors for:
 * - Request logging and authentication
 * - Response transformation
 * - Error handling and retries
 * - Timeout management
 * - Circuit breaker protection
 */
class HttpClient {
  private axiosInstance: AxiosInstance;
  private config: HttpClientConfig;
  private circuitBreaker?: CircuitBreaker;

  constructor(config: HttpClientConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.config.headers,
    });

    // Initialize circuit breaker if enabled
    if (this.config.enableCircuitBreaker) {
      const cbConfig = this.config.circuitBreakerConfig || {
        failureThreshold: 50,
        minimumRequests: 5,
        resetTimeout: 60000,
        windowSize: 120000,
      };
      this.circuitBreaker = new CircuitBreaker({
        ...cbConfig,
        name: `HTTP-${this.config.baseURL || 'default'}`,
      });
      logger.info('Circuit breaker enabled for HTTP client', { config: cbConfig });
    }

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add request timestamp
        config.metadata = { startTime: new Date() };

        // Log request in development
        if (import.meta.env.DEV) {
          console.log(`🚀 HTTP Request: ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data,
          });
        }

        return config;
      },
      (error: AxiosError) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(this.createApiError(error));
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Calculate request duration
        const duration = new Date().getTime() - response.config.metadata?.startTime?.getTime();

        // Log response in development
        if (import.meta.env.DEV) {
          console.log(
            `✅ HTTP Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
            {
              status: response.status,
              duration: `${duration}ms`,
            }
          );
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Retry logic for network errors
        if (!originalRequest._retry && this.shouldRetry(error)) {
          originalRequest._retry = true;

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay || 1000));

          return this.axiosInstance(originalRequest);
        }

        console.error(
          `❌ Response Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
          {
            status: error.response?.status,
            message: error.message,
          }
        );

        return Promise.reject(this.createApiError(error));
      }
    );
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetry(error: AxiosError): boolean {
    if (!this.config.retries) return false;

    // Retry on network errors
    if (!error.response) return true;

    // Retry on 5xx server errors
    return error.response.status >= 500;
  }

  /**
   * Create standardized API error
   */
  private createApiError(error: AxiosError): ApiError {
    const circuitState = this.circuitBreaker?.getState();

    if (error.response) {
      // Server responded with error status
      const data = error.response.data as Record<string, unknown>;
      const status = error.response.status;
      return {
        message: (data?.message as string) || 'Server error occurred',
        code: (data?.code as string) || 'SERVER_ERROR',
        status,
        details: data?.details as Record<string, unknown> | undefined,
        retryable: status >= 500 || status === 429,
        circuitState,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - no response received',
        code: 'NETWORK_ERROR',
        status: 0,
        retryable: true,
        circuitState,
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'Unknown error occurred',
        code: 'UNKNOWN_ERROR',
        status: 500,
        retryable: false,
        circuitState,
      };
    }
  }

  /**
   * Get circuit breaker statistics
   */
  getCircuitBreakerStats() {
    return this.circuitBreaker?.getStats();
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker() {
    this.circuitBreaker?.reset();
  }

  /**
   * GET request
   */
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }

  /**
   * Set authorization header
   */
  setAuthToken(token: string): void {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authorization header
   */
  clearAuthToken(): void {
    delete this.axiosInstance.defaults.headers.common['Authorization'];
  }

  /**
   * Set default headers
   */
  setHeaders(headers: Record<string, string>): void {
    Object.assign(this.axiosInstance.defaults.headers, headers);
  }
}

// Extend axios config type to include metadata
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: Date;
    };
  }
}

// Create and export singleton instance
export const httpClient = new HttpClient();

// Export types
export { httpClient as default };
export type { AxiosRequestConfig, AxiosResponse };
