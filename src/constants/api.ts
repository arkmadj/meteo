/**
 * API-related constants for Meteo
 */

// Open-Meteo API endpoints
export const API_ENDPOINTS = {
  GEOCODING: 'https://geocoding-api.open-meteo.com/v1/search',
  WEATHER: 'https://api.open-meteo.com/v1/forecast',
  HISTORICAL: 'https://archive-api.open-meteo.com/v1/archive',
} as const;

// API parameters
export const API_PARAMS = {
  COUNT: 1, // Number of results to return from geocoding
  CURRENT_WEATHER: 'true',
  TIMEZONE_AUTO: 'auto',
} as const;

// API query parameters
export const WEATHER_QUERY_PARAMS = [
  'weathercode',
  'temperature_2m_max',
  'temperature_2m_min',
  'wind_speed_10m_max',
  'relative_humidity_2m_mean',
  'pressure_msl_mean',
  'visibility_mean',
  'uv_index_max',
  'precipitation_probability_max',
  'sunrise',
  'sunset',
] as const;
// Debounce delay for search (in milliseconds)
export const DEBOUNCE_DELAY = 500;

// Default values
export const DEFAULT_VALUES = {
  CITY: 'Rabat',
} as const;
