/**
 * Weather API Types
 *
 * Comprehensive TypeScript definitions for weather API responses,
 * demonstrating best practices for API type safety.
 */

// Base API response wrapper
export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
  timestamp: string;
}

// Error response structure
export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: {
    field?: string;
    reason?: string;
    [key: string]: unknown;
  };
}

// Weather data types
export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface Temperature {
  current: number;
  feels_like: number;
  min: number;
  max: number;
  unit: 'celsius' | 'fahrenheit';
}

export interface Wind {
  speed: number;
  direction: number;
  gust?: number;
  unit: 'kmh' | 'mph' | 'ms';
}

export interface Precipitation {
  probability: number; // 0-100
  amount?: number;
  type?: 'rain' | 'snow' | 'sleet';
}

export interface AirQuality {
  aqi: number; // Air Quality Index 1-5
  co: number;
  no2: number;
  o3: number;
  pm2_5: number;
  pm10: number;
}

export interface Location {
  name: string;
  country: string;
  region?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  localtime: string;
}

// Current weather response
export interface CurrentWeather {
  location: Location;
  temperature: Temperature;
  condition: WeatherCondition;
  humidity: number;
  pressure: number;
  visibility: number;
  uv_index: number;
  wind: Wind;
  precipitation: Precipitation;
  air_quality?: AirQuality;
  last_updated: string;
}

// Hourly forecast item
export interface HourlyForecast {
  time: string;
  temperature: number;
  condition: WeatherCondition;
  precipitation: Precipitation;
  wind: Wind;
  humidity: number;
}

// Daily forecast item
export interface DailyForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
    unit: 'celsius' | 'fahrenheit';
  };
  condition: WeatherCondition;
  precipitation: Precipitation;
  wind: Wind;
  humidity: number;
  sunrise: string;
  sunset: string;
  moon_phase: string;
}

// Complete forecast response
export interface WeatherForecast {
  location: Location;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  alerts?: WeatherAlert[];
}

// Weather alerts
export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  urgency: 'immediate' | 'expected' | 'future';
  areas: string[];
  effective: string;
  expires: string;
  sender: string;
}

// Search location response
export interface LocationSearchResult {
  id: string;
  name: string;
  region?: string;
  country: string;
  latitude: number;
  longitude: number;
  population?: number;
  timezone: string;
}

// API request parameters
export interface WeatherRequestParams {
  location: string;
  units?: 'metric' | 'imperial';
  lang?: string;
  include_alerts?: boolean;
  include_air_quality?: boolean;
}

export interface ForecastRequestParams extends WeatherRequestParams {
  days?: number; // 1-10
  hours?: number; // 1-24
}

export interface LocationSearchParams {
  query: string;
  limit?: number;
  country?: string;
}

// Historical weather request
export interface HistoricalWeatherParams {
  location: string;
  date: string; // YYYY-MM-DD
  units?: 'metric' | 'imperial';
}

export interface HistoricalWeather {
  location: Location;
  date: string;
  temperature: {
    min: number;
    max: number;
    avg: number;
    unit: 'celsius' | 'fahrenheit';
  };
  condition: WeatherCondition;
  precipitation: {
    total: number;
    hours: number;
  };
  wind: {
    max_speed: number;
    avg_speed: number;
    direction: number;
    unit: 'kmh' | 'mph' | 'ms';
  };
  humidity: {
    min: number;
    max: number;
    avg: number;
  };
  pressure: {
    min: number;
    max: number;
    avg: number;
  };
  sunrise: string;
  sunset: string;
}

// Utility types for API responses
export type WeatherApiResponse<T> = ApiResponse<T>;
export type CurrentWeatherResponse = WeatherApiResponse<CurrentWeather>;
export type ForecastResponse = WeatherApiResponse<WeatherForecast>;
export type LocationSearchResponse = WeatherApiResponse<LocationSearchResult[]>;
export type HistoricalWeatherResponse = WeatherApiResponse<HistoricalWeather>;

// Type guards for runtime type checking
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'status' in error &&
    typeof (error as ApiError).message === 'string' &&
    typeof (error as ApiError).status === 'number'
  );
}

export function isCurrentWeather(data: unknown): data is CurrentWeather {
  return (
    typeof data === 'object' &&
    data !== null &&
    'location' in data &&
    'temperature' in data &&
    'condition' in data
  );
}

export function isWeatherForecast(data: unknown): data is WeatherForecast {
  return (
    typeof data === 'object' &&
    data !== null &&
    'location' in data &&
    'current' in data &&
    'hourly' in data &&
    'daily' in data &&
    Array.isArray((data as WeatherForecast).hourly) &&
    Array.isArray((data as WeatherForecast).daily)
  );
}

// Enum-like constants for better type safety
export const WEATHER_UNITS = {
  METRIC: 'metric',
  IMPERIAL: 'imperial',
} as const;

export const ALERT_SEVERITY = {
  MINOR: 'minor',
  MODERATE: 'moderate',
  SEVERE: 'severe',
  EXTREME: 'extreme',
} as const;

export const ALERT_URGENCY = {
  IMMEDIATE: 'immediate',
  EXPECTED: 'expected',
  FUTURE: 'future',
} as const;

export type WeatherUnits = (typeof WEATHER_UNITS)[keyof typeof WEATHER_UNITS];
export type AlertSeverity = (typeof ALERT_SEVERITY)[keyof typeof ALERT_SEVERITY];
export type AlertUrgency = (typeof ALERT_URGENCY)[keyof typeof ALERT_URGENCY];
