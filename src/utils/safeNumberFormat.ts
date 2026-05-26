/**
 * Safe Number Formatting Utilities
 *
 * Provides safe wrappers for number formatting operations that handle null/undefined values
 * and prevent runtime errors when calling methods like toFixed() on invalid values.
 */

/**
 * Safely formats a number with a fixed number of decimal places.
 * Returns a fallback value if the input is null, undefined, or NaN.
 *
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 1)
 * @param fallback - Fallback value to return for invalid input (default: '0')
 * @returns Formatted number string or fallback value
 *
 * @example
 * safeToFixed(123.456, 2) // "123.46"
 * safeToFixed(null, 2) // "0"
 * safeToFixed(undefined, 2, 'N/A') // "N/A"
 * safeToFixed(NaN, 2) // "0"
 */
export function safeToFixed(
  value: number | null | undefined,
  decimals: number = 1,
  fallback: string = '0'
): string {
  // Check for null, undefined, or NaN
  if (value == null || Number.isNaN(value) || !Number.isFinite(value)) {
    return fallback;
  }

  return value.toFixed(decimals);
}

/**
 * Safely formats a number with a fixed number of decimal places and returns as a number.
 * Returns a fallback number if the input is null, undefined, or NaN.
 *
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 1)
 * @param fallback - Fallback number to return for invalid input (default: 0)
 * @returns Formatted number or fallback value
 *
 * @example
 * safeToFixedNumber(123.456, 2) // 123.46
 * safeToFixedNumber(null, 2) // 0
 * safeToFixedNumber(undefined, 2, -1) // -1
 */
export function safeToFixedNumber(
  value: number | null | undefined,
  decimals: number = 1,
  fallback: number = 0
): number {
  if (value == null || Number.isNaN(value) || !Number.isFinite(value)) {
    return fallback;
  }

  return Number(value.toFixed(decimals));
}

/**
 * Safely formats a coordinate (latitude or longitude) with appropriate precision.
 * Returns a fallback value if the input is null, undefined, or NaN.
 *
 * @param value - The coordinate value to format
 * @param precision - Number of decimal places (default: 4)
 * @param fallback - Fallback value to return for invalid input (default: '0.0000')
 * @returns Formatted coordinate string or fallback value
 *
 * @example
 * safeFormatCoordinate(40.7128) // "40.7128"
 * safeFormatCoordinate(null) // "0.0000"
 * safeFormatCoordinate(undefined, 6) // "0.000000"
 */
export function safeFormatCoordinate(
  value: number | null | undefined,
  precision: number = 4,
  fallback?: string
): string {
  const defaultFallback = fallback ?? '0.' + '0'.repeat(precision);
  return safeToFixed(value, precision, defaultFallback);
}

/**
 * Safely formats a temperature value with one decimal place.
 * Returns a fallback value if the input is null, undefined, or NaN.
 *
 * @param value - The temperature value to format
 * @param fallback - Fallback value to return for invalid input (default: '--')
 * @returns Formatted temperature string or fallback value
 *
 * @example
 * safeFormatTemperature(23.456) // "23.5"
 * safeFormatTemperature(null) // "--"
 * safeFormatTemperature(undefined, 'N/A') // "N/A"
 */
export function safeFormatTemperature(
  value: number | null | undefined,
  fallback: string = '--'
): string {
  return safeToFixed(value, 1, fallback);
}

/**
 * Safely formats a percentage value with specified decimal places.
 * Returns a fallback value if the input is null, undefined, or NaN.
 *
 * @param value - The percentage value to format (0-100)
 * @param decimals - Number of decimal places (default: 0)
 * @param fallback - Fallback value to return for invalid input (default: '0')
 * @returns Formatted percentage string or fallback value
 *
 * @example
 * safeFormatPercentage(85.6) // "86"
 * safeFormatPercentage(85.6, 1) // "85.6"
 * safeFormatPercentage(null) // "0"
 */
export function safeFormatPercentage(
  value: number | null | undefined,
  decimals: number = 0,
  fallback: string = '0'
): string {
  return safeToFixed(value, decimals, fallback);
}

/**
 * Checks if a value is a valid number (not null, undefined, or NaN).
 *
 * @param value - The value to check
 * @returns true if the value is a valid number, false otherwise
 *
 * @example
 * isValidNumber(123) // true
 * isValidNumber(null) // false
 * isValidNumber(NaN) // false
 * isValidNumber(undefined) // false
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && !Number.isNaN(value);
}
