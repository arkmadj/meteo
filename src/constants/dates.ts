/**
 * Date and time constants for Meteo
 */

// Locale for date formatting
export const LOCALE = 'en-US' as const;

// Date formatting options
export const DATE_FORMAT_OPTIONS = {
  WEEKDAY_SHORT: { weekday: 'short' as const },
  DATE_FULL: {
    weekday: 'long' as const,
    day: 'numeric' as const,
    month: 'long' as const,
    year: 'numeric' as const,
  },
} as const;

// Month names
export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

// Day names
export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

// Forecast days limit
export const FORECAST_DAYS_LIMIT = 7;
