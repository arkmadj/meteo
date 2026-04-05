/**
 * Location Cache Utility
 * Caches geolocation data to reduce API calls and improve performance
 */

export interface CachedLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  expiresAt: number;
}

const STORAGE_KEY = 'meteo_cached_location';
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Save location to cache
 */
export const cacheLocation = (
  latitude: number,
  longitude: number,
  accuracy: number,
  cacheDuration: number = DEFAULT_CACHE_DURATION
): void => {
  try {
    const now = Date.now();
    const cachedData: CachedLocation = {
      latitude,
      longitude,
      accuracy,
      timestamp: now,
      expiresAt: now + cacheDuration,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedData));
  } catch (error) {
    console.warn('Failed to cache location:', error);
  }
};

/**
 * Get cached location if it exists and is not expired
 */
export const getCachedLocation = (): CachedLocation | null => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) {
      return null;
    }

    const data: CachedLocation = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is expired
    if (data.expiresAt < now) {
      clearLocationCache();
      return null;
    }

    return data;
  } catch (error) {
    console.warn('Failed to get cached location:', error);
    return null;
  }
};

/**
 * Check if cached location exists and is valid
 */
export const hasCachedLocation = (): boolean => {
  return getCachedLocation() !== null;
};

/**
 * Clear cached location
 */
export const clearLocationCache = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear location cache:', error);
  }
};

/**
 * Check if cached location is still accurate enough
 * @param maxAge Maximum age in milliseconds
 * @param maxAccuracy Maximum acceptable accuracy in meters
 */
export const isCachedLocationValid = (maxAge: number = DEFAULT_CACHE_DURATION, maxAccuracy: number = 100): boolean => {
  const cached = getCachedLocation();
  if (!cached) {
    return false;
  }

  const now = Date.now();
  const age = now - cached.timestamp;

  return age < maxAge && cached.accuracy <= maxAccuracy;
};

/**
 * Get time remaining until cache expires (in milliseconds)
 */
export const getCacheTimeRemaining = (): number => {
  const cached = getCachedLocation();
  if (!cached) {
    return 0;
  }

  const now = Date.now();
  return Math.max(0, cached.expiresAt - now);
};

/**
 * Update cache expiration time without changing location data
 */
export const extendCacheExpiration = (additionalTime: number = DEFAULT_CACHE_DURATION): boolean => {
  try {
    const cached = getCachedLocation();
    if (!cached) {
      return false;
    }

    cached.expiresAt = Date.now() + additionalTime;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
    return true;
  } catch (error) {
    console.warn('Failed to extend cache expiration:', error);
    return false;
  }
};
