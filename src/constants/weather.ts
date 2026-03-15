/**
 * Weather-related constants for the React Weather App
 */

// Temperature conversion constants
export const TEMPERATURE_CONVERSION = {
  FAHRENHEIT_MULTIPLIER: 9,
  FAHRENHEIT_DIVISOR: 5,
  FAHRENHEIT_OFFSET: 32,
} as const;

// Temperature units
export const TEMPERATURE_UNITS = {
  CELSIUS: '°C',
  FAHRENHEIT: '°F',
} as const;

// Wind speed unit
export const WIND_SPEED_UNIT = 'm/s';

// Humidity unit
export const HUMIDITY_UNIT = '%';

// Default weather state values
export const DEFAULT_WEATHER_STATE = {
  CITY: '',
  COUNTRY: '',
  LATITUDE: 0,
  LONGITUDE: 0,
  WEATHER_CODE: 0,
  DESCRIPTION: '',
  ICON: 'CLEAR_DAY',
  TEMP_CURRENT: 0,
  TEMP_MAX: 0,
  TEMP_MIN: 0,
  WIND_SPEED: 0,
  WIND_DIRECTION: 0,
  TIMEZONE: '',
} as const;

// Array indices for first element access
export const ARRAY_INDICES = {
  FIRST: 0,
} as const;
