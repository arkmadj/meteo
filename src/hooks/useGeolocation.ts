/**
 * Geolocation Hook with Snackbar Integration
 * Handles browser geolocation with automatic error notifications
 * Enhanced with permission checking, retry logic, caching, and improved error handling
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { useSnackbar } from '@/contexts/SnackbarContext';
import { cacheLocation, getCachedLocation, isCachedLocationValid } from '@/utils/locationCache';

export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface GeoError {
  code: number;
  message: string;
  permissionState?: PermissionState;
}

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
  onSuccess?: (position: GeoPosition) => void;
  onError?: (error: GeoError) => void;
  showNotifications?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  checkPermissionFirst?: boolean;
  useCache?: boolean;
  cacheDuration?: number;
}

export interface UseGeolocationReturn {
  position: GeoPosition | null;
  error: GeoError | null;
  loading: boolean;
  getCurrentPosition: () => Promise<void>;
  requestPermission: () => Promise<PermissionState>;
  clearError: () => void;
  isSupported: boolean;
  permissionState: PermissionState | null;
  retryCount: number;
}

/**
 * Check if Permissions API is supported and query geolocation permission status
 */
const checkPermissionStatus = async (): Promise<PermissionState | null> => {
  try {
    if ('permissions' in navigator) {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state;
    }
    return null;
  } catch (error) {
    // Permissions API may not be supported or may fail
    console.warn('Failed to check permission status:', error);
    return null;
  }
};

/**
 * Hook for accessing browser geolocation with automatic snackbar notifications
 */
export const useGeolocation = (options: UseGeolocationOptions = {}): UseGeolocationReturn => {
  const {
    enableHighAccuracy = true,
    timeout = 15000,
    maximumAge = 0,
    watch = false,
    onSuccess,
    onError,
    showNotifications = true,
    retryAttempts = 1, // 1 retry after initial = 2 total attempts
    retryDelay = 2000,
    checkPermissionFirst = true,
    useCache = true,
    cacheDuration = 5 * 60 * 1000, // 5 minutes
  } = options;

  const { showError, showWarning, showSuccess, showInfo } = useSnackbar();

  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<GeoError | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const currentRetryCount = useRef(0);

  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  const handleSuccess = useCallback(
    (pos: GeolocationPosition) => {
      const geoPosition: GeoPosition = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: pos.timestamp,
      };

      setPosition(geoPosition);
      setError(null);
      setLoading(false);
      setRetryCount(0);
      currentRetryCount.current = 0; // Reset retry counter

      // Cache the location if caching is enabled
      if (useCache) {
        cacheLocation(
          geoPosition.latitude,
          geoPosition.longitude,
          geoPosition.accuracy,
          cacheDuration
        );
      }

      if (showNotifications) {
        showSuccess('Location detected successfully', 2000);
      }

      onSuccess?.(geoPosition);
    },
    [onSuccess, showSuccess, showNotifications, useCache, cacheDuration]
  );

  const handleError = useCallback(
    (err: GeolocationPositionError, attemptRetry = true) => {
      void (async () => {
        const currentPermissionState = await checkPermissionStatus();

        const geoError: GeoError = {
          code: err.code,
          message: err.message,
          permissionState: currentPermissionState || undefined,
        };

        // Use ref to get current retry count
        const currentRetries = currentRetryCount.current;

        // Determine if we should retry
        // POSITION_UNAVAILABLE (code 2) includes kCLErrorLocationUnknown on iOS/macOS
        const shouldRetry =
          attemptRetry &&
          currentRetries < retryAttempts &&
          (err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE);

        if (shouldRetry) {
          // Increment retry count
          currentRetryCount.current += 1;
          setRetryCount(currentRetryCount.current);

          if (showNotifications) {
            const errorType = err.code === err.TIMEOUT ? 'timeout' : 'location unavailable';
            showInfo(
              `Retrying (${errorType}) - attempt ${currentRetryCount.current}/${retryAttempts}...`
            );
          }

          // Use exponential backoff for retries
          const backoffDelay = retryDelay * Math.pow(1.5, currentRetries);

          // Clear any existing timeout
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
          }

          // Schedule retry
          retryTimeoutRef.current = setTimeout(() => {
            if (isSupported && navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(handleSuccess, e => handleError(e, true), {
                enableHighAccuracy,
                timeout: timeout + currentRetries * 2000, // Increase timeout on each retry
                maximumAge,
              });
            }
          }, backoffDelay);

          return;
        }

        // No retry, set error state
        setError(geoError);
        setLoading(false);

        if (showNotifications) {
          switch (err.code) {
            case err.PERMISSION_DENIED:
              showError(
                'Location access denied. Please enable location permissions in your browser settings.',
                5000
              );
              break;
            case err.POSITION_UNAVAILABLE:
              showWarning(
                'Unable to determine location. Try:\n• Moving to an area with better GPS signal\n• Enabling Wi-Fi for location services\n• Checking Location Services are enabled in system settings',
                6000
              );
              break;
            case err.TIMEOUT:
              showWarning(
                `Location request timed out after ${retryAttempts} attempts. Try:\n• Moving to an area with better signal\n• Increasing timeout duration`,
                5000
              );
              break;
            default:
              showError('Unable to get your location. Please try again.', 4000);
          }
        }

        onError?.(geoError);
      })();
    },
    [
      onError,
      showError,
      showWarning,
      showInfo,
      showNotifications,
      retryAttempts,
      retryDelay,
      handleSuccess,
      isSupported,
      enableHighAccuracy,
      timeout,
      maximumAge,
    ]
  );

  const getCurrentPosition = useCallback(async () => {
    if (!isSupported) {
      const notSupportedError: GeoError = {
        code: 0,
        message: 'Geolocation is not supported by your browser',
      };
      setError(notSupportedError);

      if (showNotifications) {
        showError(
          'Geolocation is not supported by your browser. Please use a modern browser.',
          5000
        );
      }

      onError?.(notSupportedError);
      return;
    }

    // Check cache first if enabled
    if (useCache) {
      const cached = getCachedLocation();
      if (cached && isCachedLocationValid(cacheDuration, 100)) {
        const cachedPosition: GeoPosition = {
          latitude: cached.latitude,
          longitude: cached.longitude,
          accuracy: cached.accuracy,
          timestamp: cached.timestamp,
        };

        setPosition(cachedPosition);
        setError(null);
        setLoading(false);

        if (showNotifications) {
          showSuccess('Using cached location', 2000);
        }

        onSuccess?.(cachedPosition);
        return;
      }
    }

    // Check permission status first if enabled
    if (checkPermissionFirst) {
      const currentPermissionState = await checkPermissionStatus();
      setPermissionState(currentPermissionState);

      if (currentPermissionState === 'denied') {
        const deniedError: GeoError = {
          code: 1, // PERMISSION_DENIED
          message: 'Location permission has been denied',
          permissionState: 'denied',
        };
        setError(deniedError);
        setLoading(false);

        if (showNotifications) {
          showError(
            'Location permission denied. Please enable location access in your browser settings.',
            6000
          );
        }

        onError?.(deniedError);
        return;
      }

      if (currentPermissionState === 'prompt' && showNotifications) {
        showInfo('Please allow location access when prompted by your browser.', 3000);
      }
    }

    setLoading(true);
    setError(null);
    setRetryCount(0);
    currentRetryCount.current = 0; // Reset retry counter

    navigator.geolocation.getCurrentPosition(handleSuccess, e => handleError(e, true), {
      enableHighAccuracy,
      timeout,
      maximumAge,
    });
  }, [
    isSupported,
    useCache,
    cacheDuration,
    checkPermissionFirst,
    enableHighAccuracy,
    timeout,
    maximumAge,
    handleSuccess,
    handleError,
    showNotifications,
    showError,
    showInfo,
    showSuccess,
    onError,
    onSuccess,
  ]);

  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
    currentRetryCount.current = 0;
  }, []);

  /**
   * Request location permission explicitly
   * This triggers the browser's permission prompt without getting location
   */
  const requestPermission = useCallback(async (): Promise<PermissionState> => {
    if (!isSupported) {
      if (showNotifications) {
        showError('Geolocation is not supported by your browser.', 3000);
      }
      return 'denied';
    }

    // Check current permission state
    const currentState = await checkPermissionStatus();
    setPermissionState(currentState);

    if (currentState === 'granted') {
      if (showNotifications) {
        showSuccess('Location permission already granted', 2000);
      }
      return 'granted';
    }

    if (currentState === 'denied') {
      if (showNotifications) {
        showError(
          'Location permission is blocked. Please enable it in your browser settings.',
          5000
        );
      }
      return 'denied';
    }

    // Permission is 'prompt' or 'unknown' - trigger the permission request
    if (showNotifications) {
      showInfo('Please allow location access when prompted...', 3000);
    }

    return new Promise(resolve => {
      // Make a quick getCurrentPosition call just to trigger permission prompt
      // We don't care about the result, just the permission state
      navigator.geolocation.getCurrentPosition(
        () => {
          // Permission granted
          setPermissionState('granted');
          if (showNotifications) {
            showSuccess('Location permission granted!', 2000);
          }
          resolve('granted');
        },
        err => {
          void (async () => {
            // Check what happened
            if (err.code === 1) {
              // User denied permission
              setPermissionState('denied');
              if (showNotifications) {
                showError('Location permission denied.', 3000);
              }
              resolve('denied');
            } else {
              // Other error (timeout, unavailable) - permission might be granted
              const newState = await checkPermissionStatus();
              setPermissionState(newState);
              resolve(newState || 'prompt');
            }
          })();
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: Infinity, // Use any cached position
        }
      );
    });
  }, [isSupported, showNotifications, showError, showSuccess, showInfo]);

  // Watch position if enabled
  useEffect(() => {
    if (!watch || !isSupported) {
      return;
    }

    setLoading(true);

    const watchId = navigator.geolocation.watchPosition(handleSuccess, e => handleError(e, false), {
      enableHighAccuracy,
      timeout,
      maximumAge,
    });

    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    watchIdRef.current = watchId;

    return () => {
      navigator.geolocation.clearWatch(watchId);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [watch, isSupported, enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError]);

  // Check permission status on mount
  useEffect(() => {
    if (checkPermissionFirst && isSupported) {
      void checkPermissionStatus().then(state => {
        setPermissionState(state);
      });
    }
  }, [checkPermissionFirst, isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    position,
    error,
    loading,
    getCurrentPosition,
    requestPermission,
    clearError,
    isSupported,
    permissionState,
    retryCount,
  };
};

/**
 * Hook for getting current position once
 */
export const useCurrentPosition = (options: UseGeolocationOptions = {}) => {
  const geolocation = useGeolocation({ ...options, watch: false });

  useEffect(() => {
    if (options.watch !== false) {
      void geolocation.getCurrentPosition();
    }
  }, [geolocation, options.watch]);

  return geolocation;
};

/**
 * Hook for watching position continuously
 */
export const useWatchPosition = (options: UseGeolocationOptions = {}) => {
  return useGeolocation({ ...options, watch: true });
};

export default useGeolocation;
