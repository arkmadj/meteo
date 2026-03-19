/**
 * Weather Service
 *
 * Demonstrates best practices for API service layer implementation
 * with comprehensive error handling and type safety.
 */

import httpClient, { ApiError } from '../clients/httpClient';
import {
  CurrentWeather,
  CurrentWeatherResponse,
  ForecastRequestParams,
  ForecastResponse,
  HistoricalWeather,
  HistoricalWeatherParams,
  HistoricalWeatherResponse,
  isApiError,
  isCurrentWeather,
  isWeatherForecast,
  LocationSearchParams,
  LocationSearchResponse,
  LocationSearchResult,
  WeatherForecast,
  WeatherRequestParams,
} from '../types/weather';

/**
 * Weather API Service Class
 *
 * Provides type-safe methods for interacting with weather APIs.
 * Implements proper error handling, request validation, and response transformation.
 */
export class WeatherService {
  private static readonly BASE_PATH = '/weather';
  private static readonly DEFAULT_TIMEOUT = 10000;

  /**
   * Get current weather for a location
   */
  static async getCurrentWeather(params: WeatherRequestParams): Promise<CurrentWeather> {
    try {
      this.validateLocation(params.location);

      const response = await httpClient.get<CurrentWeatherResponse>(`${this.BASE_PATH}/current`, {
        params: this.sanitizeParams(params),
        timeout: this.DEFAULT_TIMEOUT,
      });

      const weatherData = response.data.data;

      if (!isCurrentWeather(weatherData)) {
        throw this.createValidationError('Invalid weather data format received');
      }

      return weatherData;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch current weather');
    }
  }

  /**
   * Get weather forecast for a location
   */
  static async getForecast(params: ForecastRequestParams): Promise<WeatherForecast> {
    try {
      this.validateLocation(params.location);
      this.validateForecastParams(params);

      const response = await httpClient.get<ForecastResponse>(`${this.BASE_PATH}/forecast`, {
        params: this.sanitizeParams(params),
        timeout: this.DEFAULT_TIMEOUT,
      });

      const forecastData = response.data.data;

      if (!isWeatherForecast(forecastData)) {
        throw this.createValidationError('Invalid forecast data format received');
      }

      return forecastData;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch weather forecast');
    }
  }

  /**
   * Search for locations
   */
  static async searchLocations(params: LocationSearchParams): Promise<LocationSearchResult[]> {
    try {
      this.validateSearchQuery(params.query);

      const response = await httpClient.get<LocationSearchResponse>(`${this.BASE_PATH}/search`, {
        params: {
          q: params.query.trim(),
          limit: Math.min(params.limit || 10, 50), // Cap at 50 results
          country: params.country,
        },
        timeout: this.DEFAULT_TIMEOUT,
      });

      return response.data.data || [];
    } catch (error) {
      throw this.handleError(error, 'Failed to search locations');
    }
  }

  /**
   * Get historical weather data
   */
  static async getHistoricalWeather(params: HistoricalWeatherParams): Promise<HistoricalWeather> {
    try {
      this.validateLocation(params.location);
      this.validateDate(params.date);

      const response = await httpClient.get<HistoricalWeatherResponse>(
        `${this.BASE_PATH}/history`,
        {
          params: this.sanitizeParams(params),
          timeout: this.DEFAULT_TIMEOUT,
        }
      );

      return response.data.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch historical weather');
    }
  }

  /**
   * Get weather for multiple locations (batch request)
   */
  static async getBatchWeather(
    locations: string[],
    units?: 'metric' | 'imperial'
  ): Promise<CurrentWeather[]> {
    try {
      if (!locations.length || locations.length > 10) {
        throw this.createValidationError('Batch requests must include 1-10 locations');
      }

      locations.forEach(location => this.validateLocation(location));

      const response = await httpClient.post<{ data: CurrentWeather[] }>(
        `${this.BASE_PATH}/batch`,
        {
          locations: locations.map(loc => loc.trim()),
          units: units || 'metric',
        },
        {
          timeout: this.DEFAULT_TIMEOUT * 2, // Longer timeout for batch requests
        }
      );

      return response.data.data || [];
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch batch weather data');
    }
  }

  // Private validation methods
  private static validateLocation(location: string): void {
    if (!location || typeof location !== 'string' || location.trim().length < 2) {
      throw this.createValidationError('Location must be at least 2 characters long');
    }

    if (location.length > 100) {
      throw this.createValidationError('Location must be less than 100 characters');
    }
  }

  private static validateForecastParams(params: ForecastRequestParams): void {
    if (params.days && (params.days < 1 || params.days > 10)) {
      throw this.createValidationError('Forecast days must be between 1 and 10');
    }

    if (params.hours && (params.hours < 1 || params.hours > 24)) {
      throw this.createValidationError('Forecast hours must be between 1 and 24');
    }
  }

  private static validateSearchQuery(query: string): void {
    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      throw this.createValidationError('Search query must be at least 2 characters long');
    }

    if (query.length > 100) {
      throw this.createValidationError('Search query must be less than 100 characters');
    }
  }

  private static validateDate(date: string): void {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw this.createValidationError('Date must be in YYYY-MM-DD format');
    }

    const parsedDate = new Date(date);
    const now = new Date();
    const maxHistoricalDate = new Date();
    maxHistoricalDate.setFullYear(now.getFullYear() - 1); // 1 year back

    if (parsedDate > now) {
      throw this.createValidationError('Historical date cannot be in the future');
    }

    if (parsedDate < maxHistoricalDate) {
      throw this.createValidationError('Historical data is only available for the past year');
    }
  }

  // Private utility methods
  private static sanitizeParams(params: any): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string') {
          sanitized[key] = value.trim();
        } else {
          sanitized[key] = value;
        }
      }
    });

    return sanitized;
  }

  private static createValidationError(message: string): ApiError {
    return {
      message,
      code: 'VALIDATION_ERROR',
      status: 400,
      details: {
        type: 'validation',
        source: 'client',
      },
    };
  }

  private static handleError(error: unknown, context: string): ApiError {
    // If it's already an ApiError, enhance it with context
    if (isApiError(error)) {
      return {
        ...error,
        message: `${context}: ${error.message}`,
      };
    }

    // Handle network errors
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          message: `${context}: Request was cancelled`,
          code: 'REQUEST_CANCELLED',
          status: 0,
        };
      }

      if (error.message.includes('timeout')) {
        return {
          message: `${context}: Request timed out`,
          code: 'TIMEOUT_ERROR',
          status: 408,
        };
      }

      if (error.message.includes('Network Error')) {
        return {
          message: `${context}: Network connection failed`,
          code: 'NETWORK_ERROR',
          status: 0,
        };
      }
    }

    // Fallback for unknown errors
    return {
      message: `${context}: An unexpected error occurred`,
      code: 'UNKNOWN_ERROR',
      status: 500,
      details: {
        originalError: error instanceof Error ? error.message : String(error),
      },
    };
  }

  /**
   * Utility method to check API health
   */
  static async checkHealth(): Promise<{ status: 'healthy' | 'unhealthy'; timestamp: string }> {
    try {
      const response = await httpClient.get('/health', {
        timeout: 5000,
      });

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
