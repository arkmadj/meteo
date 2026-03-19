import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'user-preferences';

/**
 * Default notification settings
 */
const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  sound: true,
  vibration: true,
  types: {
    severeWeatherAlerts: true,
    dailyForecast: false,
    precipitationAlerts: true,
    temperatureAlerts: false,
    airQualityAlerts: false,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '07:00',
  },
  frequency: 'realtime',
};

/**
 * Load preferences from localStorage
 */
function loadPreferencesFromStorage(): Partial<UserPreferences> | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        fontSize: parsed.fontSize ?? 'md',
        windSpeedUnit: parsed.windSpeedUnit ?? 'ms',
        visibilityUnit: parsed.visibilityUnit ?? 'km',
        updateFrequency: parsed.updateFrequency ?? 'medium',
        notifications: parsed.notifications
          ? {
              ...DEFAULT_NOTIFICATION_SETTINGS,
              ...parsed.notifications,
              types: {
                ...DEFAULT_NOTIFICATION_SETTINGS.types,
                ...parsed.notifications.types,
              },
              quietHours: {
                ...DEFAULT_NOTIFICATION_SETTINGS.quietHours,
                ...parsed.notifications.quietHours,
              },
            }
          : DEFAULT_NOTIFICATION_SETTINGS,
      };
    }
  } catch (error) {
    console.warn('Failed to load user preferences from storage:', error);
  }

  return null;
}

/**
 * Save preferences to localStorage
 */
function savePreferencesToStorage(preferences: Partial<UserPreferences>): void {
  if (typeof window === 'undefined') return;

  try {
    const toSave = {
      fontSize: preferences.fontSize,
      windSpeedUnit: preferences.windSpeedUnit,
      visibilityUnit: preferences.visibilityUnit,
      updateFrequency: preferences.updateFrequency,
      notifications: preferences.notifications,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.warn('Failed to save user preferences to storage:', error);
  }
}

/**
 * Notification type settings - which notifications the user wants to receive
 */
export interface NotificationTypes {
  severeWeatherAlerts: boolean;
  dailyForecast: boolean;
  precipitationAlerts: boolean;
  temperatureAlerts: boolean;
  airQualityAlerts: boolean;
}

/**
 * Quiet hours configuration for notifications
 */
export interface QuietHours {
  enabled: boolean;
  start: string; // Time in HH:mm format (24-hour)
  end: string; // Time in HH:mm format (24-hour)
}

/**
 * Notification frequency options
 */
export type NotificationFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly';

/**
 * Comprehensive notification settings
 */
export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  types: NotificationTypes;
  quietHours: QuietHours;
  frequency: NotificationFrequency;
}

/**
 * User preferences detected from browser settings
 */
export interface UserPreferences {
  // Motion preferences
  prefersReducedMotion: boolean;
  prefersReducedData: boolean;
  prefersReducedTransparency: boolean;
  prefersHighContrast: boolean;

  // Connection preferences
  saveData: boolean;
  connectionType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  downlink: number;

  // Display preferences
  colorScheme: 'light' | 'dark' | 'no-preference';
  forcedColors: 'active' | 'none';

  // Interaction preferences
  prefersKeyboardNavigation: boolean;
  touchSupported: boolean;
  hoverSupported: boolean;

  // Measurement preferences
  windSpeedUnit: 'ms' | 'kmh' | 'mph' | 'knots';
  visibilityUnit: 'm' | 'km' | 'mi' | 'nm';

  // Typography preferences
  fontSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  // Data refresh preferences
  updateFrequency: 'off' | 'low' | 'medium' | 'high' | 'realtime';

  // Notification preferences
  notifications: NotificationSettings;
}

/**
 * Configuration for applying preferences
 */
export interface PreferenceConfig {
  // Animation settings
  respectReducedMotion: boolean;
  respectSaveData: boolean;
  respectHighContrast: boolean;

  // Performance settings
  adaptToConnection: boolean;
  optimizeForTouch: boolean;

  // Loading behavior
  adjustLoadingStrategies: boolean;
  reduceImageQuality: boolean;
  limitParallelRequests: boolean;
}

/**
 * Default preference configuration
 */
const DEFAULT_CONFIG: PreferenceConfig = {
  respectReducedMotion: true,
  respectSaveData: true,
  respectHighContrast: true,
  adaptToConnection: true,
  optimizeForTouch: true,
  adjustLoadingStrategies: true,
  reduceImageQuality: true,
  limitParallelRequests: true,
};

/**
 * Hook to detect and respond to user preferences
 */
export const useUserPreferences = (config: Partial<PreferenceConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const stored = loadPreferencesFromStorage();
    return {
      prefersReducedMotion: false,
      prefersReducedData: false,
      prefersReducedTransparency: false,
      prefersHighContrast: false,
      saveData: false,
      connectionType: 'unknown',
      effectiveType: 'unknown',
      downlink: 0,
      colorScheme: 'no-preference',
      forcedColors: 'none',
      prefersKeyboardNavigation: false,
      touchSupported: false,
      hoverSupported: false,
      windSpeedUnit: stored?.windSpeedUnit ?? 'ms',
      visibilityUnit: stored?.visibilityUnit ?? 'km',
      fontSize: stored?.fontSize ?? 'md',
      updateFrequency: stored?.updateFrequency ?? 'medium',
      notifications: stored?.notifications ?? DEFAULT_NOTIFICATION_SETTINGS,
    };
  });

  // Detect media query preferences
  const detectMediaQueryPreferences = useCallback(() => {
    const updates: Partial<UserPreferences> = {};

    // Motion preferences
    if (finalConfig.respectReducedMotion) {
      updates.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // Data preferences (non-standard but supported by some browsers)
    updates.prefersReducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches;

    // Transparency preferences
    updates.prefersReducedTransparency = window.matchMedia(
      '(prefers-reduced-transparency: reduce)'
    ).matches;

    // Contrast preferences
    if (finalConfig.respectHighContrast) {
      updates.prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    }

    // Color scheme
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      updates.colorScheme = 'dark';
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      updates.colorScheme = 'light';
    } else {
      updates.colorScheme = 'no-preference';
    }

    // Forced colors (Windows High Contrast mode)
    updates.forcedColors = window.matchMedia('(forced-colors: active)').matches ? 'active' : 'none';

    return updates;
  }, [finalConfig.respectReducedMotion, finalConfig.respectHighContrast]);

  // Detect connection preferences
  const detectConnectionPreferences = useCallback(() => {
    const updates: Partial<UserPreferences> = {};

    if (finalConfig.adaptToConnection && 'connection' in navigator) {
      const connection = (navigator as unknown).connection;

      if (connection) {
        updates.saveData = connection.saveData || false;
        updates.connectionType = connection.type || 'unknown';
        updates.effectiveType = connection.effectiveType || 'unknown';
        updates.downlink = connection.downlink || 0;
      }
    }

    return updates;
  }, [finalConfig.adaptToConnection]);

  // Detect interaction preferences
  const detectInteractionPreferences = useCallback(() => {
    const updates: Partial<UserPreferences> = {};

    // Touch support
    if (finalConfig.optimizeForTouch) {
      updates.touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    // Hover support (indicates mouse/trackpad)
    updates.hoverSupported = window.matchMedia('(hover: hover)').matches;

    // Keyboard navigation preference (heuristic based on no hover + no touch)
    updates.prefersKeyboardNavigation = !updates.hoverSupported && !updates.touchSupported;

    return updates;
  }, [finalConfig.optimizeForTouch]);

  // Update wind speed unit preference
  const updateWindSpeedUnit = useCallback((unit: 'ms' | 'kmh' | 'mph' | 'knots') => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        windSpeedUnit: unit,
      };
      savePreferencesToStorage(updated);
      return updated;
    });
  }, []);

  // Update visibility unit preference
  const updateVisibilityUnit = useCallback((unit: 'm' | 'km' | 'mi' | 'nm') => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        visibilityUnit: unit,
      };
      savePreferencesToStorage(updated);
      return updated;
    });
  }, []);

  // Update font size preference
  const updateFontSize = useCallback((fontSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        fontSize,
      };
      savePreferencesToStorage(updated);
      return updated;
    });
  }, []);

  // Apply font size to document root
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Font size scale mapping
    const fontSizeScale: Record<string, number> = {
      xs: 0.75,
      sm: 0.875,
      md: 1,
      lg: 1.125,
      xl: 1.25,
    };

    const scale = fontSizeScale[preferences.fontSize];

    // Apply CSS custom property for font size scaling
    root.style.setProperty('--font-size-scale', scale.toString());

    // Apply font size to root element
    root.style.setProperty('--theme-font-size-base', `${scale}rem`);

    // Apply scaled font sizes for different text elements
    root.style.setProperty('--theme-font-size-xs', `${scale * 0.75}rem`);
    root.style.setProperty('--theme-font-size-sm', `${scale * 0.875}rem`);
    root.style.setProperty('--theme-font-size-base', `${scale * 1}rem`);
    root.style.setProperty('--theme-font-size-lg', `${scale * 1.125}rem`);
    root.style.setProperty('--theme-font-size-xl', `${scale * 1.25}rem`);
    root.style.setProperty('--theme-font-size-2xl', `${scale * 1.5}rem`);
    root.style.setProperty('--theme-font-size-3xl', `${scale * 1.875}rem`);
    root.style.setProperty('--theme-font-size-4xl', `${scale * 2.25}rem`);
    root.style.setProperty('--theme-font-size-5xl', `${scale * 3}rem`);
    root.style.setProperty('--theme-font-size-6xl', `${scale * 3.75}rem`);
  }, [preferences.fontSize]);

  // Update all preferences
  const updatePreferences = useCallback(() => {
    const mediaQueryUpdates = detectMediaQueryPreferences();
    const connectionUpdates = detectConnectionPreferences();
    const interactionUpdates = detectInteractionPreferences();

    setPreferences(prev => ({
      ...prev,
      ...mediaQueryUpdates,
      ...connectionUpdates,
      ...interactionUpdates,
    }));
  }, [detectMediaQueryPreferences, detectConnectionPreferences, detectInteractionPreferences]);

  // Set up media query listeners
  useEffect(() => {
    const mediaQueries = [
      '(prefers-reduced-motion: reduce)',
      '(prefers-reduced-data: reduce)',
      '(prefers-reduced-transparency: reduce)',
      '(prefers-contrast: high)',
      '(prefers-color-scheme: dark)',
      '(prefers-color-scheme: light)',
      '(forced-colors: active)',
      '(hover: hover)',
    ];

    const listeners: Array<{ query: MediaQueryList; handler: () => void }> = [];

    mediaQueries.forEach(query => {
      const mediaQuery = window.matchMedia(query);
      const handler = () => updatePreferences();

      mediaQuery.addEventListener('change', handler);
      listeners.push({ query: mediaQuery, handler });
    });

    // Initial detection
    updatePreferences();

    // Connection change listener
    let connectionHandler: (() => void) | null = null;
    if ('connection' in navigator) {
      connectionHandler = () => updatePreferences();
      (navigator as unknown).connection?.addEventListener('change', connectionHandler);
    }

    return () => {
      listeners.forEach(({ query, handler }) => {
        query.removeEventListener('change', handler);
      });

      if (connectionHandler && 'connection' in navigator) {
        (navigator as unknown).connection?.removeEventListener('change', connectionHandler);
      }
    };
  }, [updatePreferences]);

  // Utility functions for applying preferences
  const getAnimationDuration = useCallback(
    (defaultDuration: number) => {
      if (preferences.prefersReducedMotion && finalConfig.respectReducedMotion) {
        return 0;
      }
      if (preferences.saveData && finalConfig.respectSaveData) {
        return Math.min(defaultDuration, 150); // Reduce animation duration
      }
      return defaultDuration;
    },
    [
      preferences.prefersReducedMotion,
      preferences.saveData,
      finalConfig.respectReducedMotion,
      finalConfig.respectSaveData,
    ]
  );

  const shouldUseReducedAnimations = useCallback(() => {
    return (
      (preferences.prefersReducedMotion && finalConfig.respectReducedMotion) ||
      (preferences.saveData && finalConfig.respectSaveData)
    );
  }, [
    preferences.prefersReducedMotion,
    preferences.saveData,
    finalConfig.respectReducedMotion,
    finalConfig.respectSaveData,
  ]);

  const getLoadingStrategy = useCallback(() => {
    if (!finalConfig.adjustLoadingStrategies) return 'visible';

    // Respect save-data preference
    if (preferences.saveData) return 'click';

    // Respect reduced motion preference
    if (preferences.prefersReducedMotion) return 'click';

    // Adapt to connection speed
    if (preferences.effectiveType === 'slow-2g' || preferences.effectiveType === '2g') {
      return 'click';
    }

    if (preferences.effectiveType === '3g') {
      return 'hover';
    }

    return 'visible';
  }, [
    preferences.saveData,
    preferences.prefersReducedMotion,
    preferences.effectiveType,
    finalConfig.adjustLoadingStrategies,
  ]);

  const getImageQuality = useCallback(() => {
    if (!finalConfig.reduceImageQuality) return 'high';

    if (preferences.saveData) return 'low';

    if (preferences.effectiveType === 'slow-2g' || preferences.effectiveType === '2g') {
      return 'low';
    }

    if (preferences.effectiveType === '3g') {
      return 'medium';
    }

    return 'high';
  }, [preferences.saveData, preferences.effectiveType, finalConfig.reduceImageQuality]);

  const getMaxParallelRequests = useCallback(() => {
    if (!finalConfig.limitParallelRequests) return 6;

    if (preferences.saveData) return 2;

    if (preferences.effectiveType === 'slow-2g') return 1;
    if (preferences.effectiveType === '2g') return 2;
    if (preferences.effectiveType === '3g') return 4;

    return 6;
  }, [preferences.saveData, preferences.effectiveType, finalConfig.limitParallelRequests]);

  const shouldPreloadContent = useCallback(() => {
    if (preferences.saveData && finalConfig.respectSaveData) return false;
    if (preferences.effectiveType === 'slow-2g' || preferences.effectiveType === '2g') return false;
    return true;
  }, [preferences.saveData, preferences.effectiveType, finalConfig.respectSaveData]);

  const getTransitionClasses = useCallback(
    (baseClasses: string) => {
      if (shouldUseReducedAnimations()) {
        // Remove transition classes or use reduced versions
        return baseClasses.replace(/transition-\w+/g, '').replace(/duration-\w+/g, '');
      }
      return baseClasses;
    },
    [shouldUseReducedAnimations]
  );

  const getUpdateFrequencyInterval = useCallback(() => {
    switch (preferences.updateFrequency) {
      case 'off':
        return false; // No auto-refresh
      case 'low':
        return 30 * 60 * 1000; // 30 minutes
      case 'medium':
        return 10 * 60 * 1000; // 10 minutes
      case 'high':
        return 5 * 60 * 1000; // 5 minutes
      case 'realtime':
        return 60 * 1000; // 1 minute
      default:
        return 10 * 60 * 1000; // Default to 10 minutes
    }
  }, [preferences.updateFrequency]);

  const updateUpdateFrequency = useCallback((frequency: UserPreferences['updateFrequency']) => {
    setPreferences(prev => ({ ...prev, updateFrequency: frequency }));
  }, []);

  // Update all notification settings at once
  const updateNotificationSettings = useCallback((settings: Partial<NotificationSettings>) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        notifications: {
          ...prev.notifications,
          ...settings,
          types: {
            ...prev.notifications.types,
            ...(settings.types || {}),
          },
          quietHours: {
            ...prev.notifications.quietHours,
            ...(settings.quietHours || {}),
          },
        },
      };
      savePreferencesToStorage(updated);
      return updated;
    });
  }, []);

  // Toggle notifications on/off
  const toggleNotifications = useCallback((enabled?: boolean) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        notifications: {
          ...prev.notifications,
          enabled: enabled ?? !prev.notifications.enabled,
        },
      };
      savePreferencesToStorage(updated);
      return updated;
    });
  }, []);

  // Toggle notification sound
  const toggleNotificationSound = useCallback((enabled?: boolean) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        notifications: {
          ...prev.notifications,
          sound: enabled ?? !prev.notifications.sound,
        },
      };
      savePreferencesToStorage(updated);
      return updated;
    });
  }, []);

  // Toggle notification vibration
  const toggleNotificationVibration = useCallback((enabled?: boolean) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        notifications: {
          ...prev.notifications,
          vibration: enabled ?? !prev.notifications.vibration,
        },
      };
      savePreferencesToStorage(updated);
      return updated;
    });
  }, []);

  // Update notification types
  const updateNotificationTypes = useCallback((types: Partial<NotificationTypes>) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        notifications: {
          ...prev.notifications,
          types: {
            ...prev.notifications.types,
            ...types,
          },
        },
      };
      savePreferencesToStorage(updated);
      return updated;
    });
  }, []);

  // Update quiet hours settings
  const updateQuietHours = useCallback((quietHours: Partial<QuietHours>) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        notifications: {
          ...prev.notifications,
          quietHours: {
            ...prev.notifications.quietHours,
            ...quietHours,
          },
        },
      };
      savePreferencesToStorage(updated);
      return updated;
    });
  }, []);

  // Update notification frequency
  const updateNotificationFrequency = useCallback((frequency: NotificationFrequency) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        notifications: {
          ...prev.notifications,
          frequency,
        },
      };
      savePreferencesToStorage(updated);
      return updated;
    });
  }, []);

  // Check if currently in quiet hours
  const isInQuietHours = useCallback(() => {
    const { quietHours } = preferences.notifications;
    if (!quietHours.enabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const start = quietHours.start;
    const end = quietHours.end;

    // Handle overnight quiet hours (e.g., 22:00 to 07:00)
    if (start > end) {
      return currentTime >= start || currentTime < end;
    }

    // Same-day quiet hours (e.g., 14:00 to 18:00)
    return currentTime >= start && currentTime < end;
  }, [preferences.notifications]);

  // Check if notifications should be shown (enabled and not in quiet hours)
  const shouldShowNotifications = useCallback(() => {
    return preferences.notifications.enabled && !isInQuietHours();
  }, [preferences.notifications.enabled, isInQuietHours]);

  return {
    preferences,
    config: finalConfig,

    // Utility functions
    getAnimationDuration,
    shouldUseReducedAnimations,
    getLoadingStrategy,
    getImageQuality,
    getMaxParallelRequests,
    shouldPreloadContent,
    getTransitionClasses,

    // Manual refresh
    updatePreferences,
    updateWindSpeedUnit,
    updateVisibilityUnit,
    updateFontSize,
    getUpdateFrequencyInterval,
    updateUpdateFrequency,

    // Notification functions
    updateNotificationSettings,
    toggleNotifications,
    toggleNotificationSound,
    toggleNotificationVibration,
    updateNotificationTypes,
    updateQuietHours,
    updateNotificationFrequency,
    isInQuietHours,
    shouldShowNotifications,
  };
};

export default useUserPreferences;
