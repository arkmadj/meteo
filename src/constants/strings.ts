/**
 * String constants for Meteo
 */

// Input and form related strings
export const INPUT_STRINGS = {
  TYPE: 'text',
  PLACEHOLDER: 'enter city name',
  NAME: 'query',
  ENTER_KEY: 'Enter',
} as const;

// Weather and forecast strings
export const WEATHER_STRINGS = {
  FORECAST_TITLE: '5-Day Forecast:',
  WIND_SPEED_LABEL: 'Wind speed',
  HUMIDITY_LABEL: 'Humidity',
  UNKNOWN_DESCRIPTION: 'Unknown',
  DEFAULT_ICON: 'CLEAR_DAY',
} as const;

// Status and error messages
export const STATUS_MESSAGES = {
  SEARCHING: 'Searching...',
  CITY_NOT_FOUND: 'City not found',
  DEFAULT_CITY_NOT_FOUND: 'Default city not found',
  CITY_NOT_FOUND_MESSAGE: 'Sorry, city not found. Please try again.',
  UNKNOWN_DESCRIPTION: 'Unknown',
} as const;

// Weather icon names
export const WEATHER_ICONS = {
  CLEAR_DAY: 'CLEAR_DAY',
  PARTLY_CLOUDY_DAY: 'PARTLY_CLOUDY_DAY',
  CLOUDY: 'CLOUDY',
  FOG: 'FOG',
  RAIN: 'RAIN',
  SLEET: 'SLEET',
  SNOW: 'SNOW',
  WIND: 'WIND',
} as const;
