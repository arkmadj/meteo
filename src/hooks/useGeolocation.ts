/**
 * Geolocation Hook with Snackbar Integration
 * Handles browser geolocation with automatic error notifications
 */

import { useCallback, useEffect, useState } from 'react';

import { useSnackbar } from '@/contexts/SnackbarContext';

export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface GeoError {
  code: number;
  message: string;
}

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
  onSuccess?: (position: GeoPosition) => void;
  onError?: (error: GeoError) => void;
  showNotifications?: boolean;
}

export interface UseGeolocationReturn {
  position: GeoPosition | null;
  error: GeoError | null;
  loading: boolean;
  getCurrentPosition: () => void;
  clearError: () => void;
  isSupported: boolean;
}

/**
 * Hook for accessing browser geolocation with automatic snackbar notifications
 */
export const useGeolocation = (options: UseGeolocationOptions = {}): UseGeolocationReturn => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watch = false,
    onSuccess,
    onError,
    showNotifications = true,
  } = options;

  const { showError, showWarning, showSuccess } = useSnackbar();

  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<GeoError | null>(null);
  const [loading, setLoading] = useState(false);

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

      if (showNotifications) {
        showSuccess('Location detected successfully', 2000);
      }

      onSuccess?.(geoPosition);
    },
    [onSuccess, showSuccess, showNotifications]
  );

  const handleError = useCallback(
    (err: GeolocationPositionError) => {
      const geoError: GeoError = {
        code: err.code,
        message: err.message,
      };

      setError(geoError);
      setLoading(false);

      if (showNotifications) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            showError(
              'Location access denied. Please enable location permissions in your browser settings.'
            );
            break;
          case err.POSITION_UNAVAILABLE:
            showWarning('Location information is unavailable. Please try again.');
            break;
          case err.TIMEOUT:
            showWarning('Location request timed out. Please try again.');
            break;
          default:
            showError('Unable to get your location. Please try again.');
        }
      }

      onError?.(geoError);
    },
    [onError, showError, showWarning, showNotifications]
  );

  const getCurrentPosition = useCallback(() => {
    if (!isSupported) {
      const notSupportedError = {
        code: 0,
        message: 'Geolocation is not supported by your browser',
      } as GeolocationPositionError;
      setError(notSupportedError);

      if (showNotifications) {
        showError('Geolocation is not supported by your browser');
      }

      onError?.(notSupportedError);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy,
      timeout,
      maximumAge,
    });
  }, [
    isSupported,
    enableHighAccuracy,
    timeout,
    maximumAge,
    handleSuccess,
    handleError,
    showNotifications,
    showError,
    onError,
  ]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Watch position if enabled
  useEffect(() => {
    if (!watch || !isSupported) {
      return;
    }

    setLoading(true);

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy,
      timeout,
      maximumAge,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [watch, isSupported, enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError]);

  return {
    position,
    error,
    loading,
    getCurrentPosition,
    clearError,
    isSupported,
  };
};

/**
 * Hook for getting current position once
 */
export const useCurrentPosition = (options: UseGeolocationOptions = {}) => {
  const geolocation = useGeolocation({ ...options, watch: false });

  useEffect(() => {
    if (options.watch !== false) {
      geolocation.getCurrentPosition();
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
