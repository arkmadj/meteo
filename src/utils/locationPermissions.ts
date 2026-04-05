/**
 * Location Permissions Utility
 * Provides helpers for checking and managing geolocation permissions
 */

export type LocationPermissionState = 'granted' | 'denied' | 'prompt' | 'unknown';

export interface LocationPermissionStatus {
  state: LocationPermissionState;
  isSupported: boolean;
  canRequest: boolean;
  message: string;
}

/**
 * Check if geolocation is supported by the browser
 */
export const isGeolocationSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
};

/**
 * Check if Permissions API is supported
 */
export const isPermissionsAPISupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'permissions' in navigator;
};

/**
 * Query the current geolocation permission status
 */
export const queryLocationPermission = async (): Promise<LocationPermissionState> => {
  if (!isPermissionsAPISupported()) {
    return 'unknown';
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state as LocationPermissionState;
  } catch (error) {
    console.warn('Failed to query location permission:', error);
    return 'unknown';
  }
};

/**
 * Get comprehensive location permission status with actionable information
 */
export const getLocationPermissionStatus = async (): Promise<LocationPermissionStatus> => {
  if (!isGeolocationSupported()) {
    return {
      state: 'unknown',
      isSupported: false,
      canRequest: false,
      message: 'Geolocation is not supported by your browser. Please use a modern browser.',
    };
  }

  const permissionState = await queryLocationPermission();

  switch (permissionState) {
    case 'granted':
      return {
        state: 'granted',
        isSupported: true,
        canRequest: true,
        message: 'Location access is enabled.',
      };

    case 'denied':
      return {
        state: 'denied',
        isSupported: true,
        canRequest: false,
        message:
          'Location access has been blocked. Please enable it in your browser settings:\n' +
          '• Chrome/Edge: Click the lock icon in the address bar → Site settings → Location\n' +
          '• Firefox: Click the lock icon → Connection secure → More information → Permissions\n' +
          '• Safari: Safari → Preferences → Websites → Location',
      };

    case 'prompt':
      return {
        state: 'prompt',
        isSupported: true,
        canRequest: true,
        message: 'You will be asked to allow location access.',
      };

    default:
      return {
        state: 'unknown',
        isSupported: true,
        canRequest: true,
        message: 'Location permission status is unknown. Click to request access.',
      };
  }
};

/**
 * Listen for permission changes
 */
export const watchLocationPermission = (
  callback: (state: LocationPermissionState) => void
): (() => void) => {
  if (!isPermissionsAPISupported()) {
    return () => {}; // No cleanup needed
  }

  let permissionStatus: PermissionStatus | null = null;

  const setupWatcher = async () => {
    try {
      permissionStatus = await navigator.permissions.query({ name: 'geolocation' });

      const handleChange = () => {
        callback(permissionStatus!.state as LocationPermissionState);
      };

      permissionStatus.addEventListener('change', handleChange);

      return () => {
        if (permissionStatus) {
          permissionStatus.removeEventListener('change', handleChange);
        }
      };
    } catch (error) {
      console.warn('Failed to watch location permission:', error);
      return () => {};
    }
  };

  let cleanup: (() => void) | null = null;
  void setupWatcher().then(cleanupFn => {
    cleanup = cleanupFn;
  });

  return () => {
    if (cleanup) {
      cleanup();
    }
  };
};

/**
 * Get browser-specific instructions for enabling location permissions
 */
export const getBrowserLocationInstructions = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();

  if (
    userAgent.includes('chrome') ||
    userAgent.includes('chromium') ||
    userAgent.includes('edge')
  ) {
    return (
      'Chrome/Edge Instructions:\n' +
      '1. Click the lock icon (🔒) in the address bar\n' +
      '2. Click "Site settings"\n' +
      '3. Find "Location" and change it to "Allow"'
    );
  }

  if (userAgent.includes('firefox')) {
    return (
      'Firefox Instructions:\n' +
      '1. Click the lock icon (🔒) in the address bar\n' +
      '2. Click "Connection secure" → "More information"\n' +
      '3. Go to the "Permissions" tab\n' +
      '4. Uncheck "Use Default" next to "Access Your Location" and select "Allow"'
    );
  }

  if (userAgent.includes('safari')) {
    return (
      'Safari Instructions:\n' +
      '1. Open Safari → Preferences (⌘,)\n' +
      '2. Go to the "Websites" tab\n' +
      '3. Select "Location" from the left sidebar\n' +
      '4. Find this website and set it to "Allow"'
    );
  }

  return (
    'Browser Settings:\n' +
    '1. Look for a lock icon or info icon in the address bar\n' +
    '2. Find location or site permissions settings\n' +
    '3. Change location permission to "Allow"'
  );
};
