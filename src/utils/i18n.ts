/**
 * Internationalization utility functions
 * Helper functions for safely handling i18n translations with type safety
 */

/**
 * Safely retrieves a translation as an array with fallback
 * @param t - The translation function
 * @param key - The translation key
 * @param fallback - Optional fallback array if translation is not an array
 * @returns Array of translated strings or fallback
 */
export function getTranslationAsArray(
  t: (key: string, options?: any) => any,
  key: string,
  fallback: string[] = []
): string[] {
  try {
    const result = t(key, { returnObjects: true });
    return Array.isArray(result) ? result : fallback;
  } catch (error) {
    console.error(`Error getting translation as array for key: ${key}`, error);
    return fallback;
  }
}

/**
 * Safely maps over translation items with error handling
 * @param t - The translation function
 * @param key - The translation key
 * @param renderItem - Function to render each item
 * @param fallback - Optional fallback array if translation is not an array
 * @returns JSX elements array or empty array
 */
export function mapTranslationItems<T = string>(
  t: (key: string, options?: any) => any,
  key: string,
  renderItem: (item: T, index: number) => React.ReactNode,
  fallback: T[] = []
): React.ReactNode[] {
  const items = getTranslationAsArray(t, key, fallback);
  return items.map((item, index) => renderItem(item as T, index));
}

/**
 * Type-safe wrapper for getting translation objects
 * @param t - The translation function
 * @param key - The translation key
 * @param expectedType - Expected type of the translation
 * @returns Translation value or null if type mismatch
 */
export function getTranslationSafely<T>(
  t: (key: string, options?: any) => any,
  key: string,
  expectedType: 'string' | 'array' | 'object' = 'string'
): T | null {
  try {
    const result = t(key, { returnObjects: true });
    
    switch (expectedType) {
      case 'array':
        return Array.isArray(result) ? (result as T) : null;
      case 'object':
        return typeof result === 'object' && result !== null && !Array.isArray(result)
          ? (result as T)
          : null;
      case 'string':
      default:
        return typeof result === 'string' ? (result as T) : null;
    }
  } catch (error) {
    console.error(`Error getting translation safely for key: ${key}`, error);
    return null;
  }
}
