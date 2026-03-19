import type {
  NotificationFrequency,
  NotificationSettings,
  NotificationTypes,
  PreferenceConfig,
  QuietHours,
  UserPreferences,
} from '@/hooks/useUserPreferences';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import type { ReactNode } from 'react';
import React, { createContext, useContext } from 'react';

/**
 * Context value type
 */
interface UserPreferencesContextValue {
  preferences: UserPreferences;
  config: PreferenceConfig;

  // Utility functions
  getAnimationDuration: (defaultDuration: number) => number;
  shouldUseReducedAnimations: () => boolean;
  getLoadingStrategy: () => 'visible' | 'hover' | 'click';
  getImageQuality: () => 'low' | 'medium' | 'high';
  getMaxParallelRequests: () => number;
  shouldPreloadContent: () => boolean;
  getTransitionClasses: (baseClasses: string) => string;
  updatePreferences: () => void;
  updateWindSpeedUnit: (unit: 'ms' | 'kmh' | 'mph' | 'knots') => void;
  updateVisibilityUnit: (unit: 'm' | 'km' | 'mi' | 'nm') => void;
  updateFontSize: (fontSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => void;
  getUpdateFrequencyInterval: () => number | false;
  updateUpdateFrequency: (frequency: 'off' | 'low' | 'medium' | 'high' | 'realtime') => void;

  // Notification functions
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  toggleNotifications: (enabled?: boolean) => void;
  toggleNotificationSound: (enabled?: boolean) => void;
  toggleNotificationVibration: (enabled?: boolean) => void;
  updateNotificationTypes: (types: Partial<NotificationTypes>) => void;
  updateQuietHours: (quietHours: Partial<QuietHours>) => void;
  updateNotificationFrequency: (frequency: NotificationFrequency) => void;
  isInQuietHours: () => boolean;
  shouldShowNotifications: () => boolean;
}

/**
 * User preferences context
 */
const UserPreferencesContext = createContext<UserPreferencesContextValue | null>(null);

/**
 * Props for the preferences provider
 */
interface UserPreferencesProviderProps {
  children: ReactNode;
  config?: Partial<PreferenceConfig>;
}

/**
 * User preferences provider component
 */
export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = ({
  children,
  config = {},
}) => {
  const preferencesHook = useUserPreferences(config);

  return (
    <UserPreferencesContext.Provider value={preferencesHook}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

/**
 * Hook to use user preferences context
 */
export const useUserPreferencesContext = (): UserPreferencesContextValue => {
  const context = useContext(UserPreferencesContext);

  if (!context) {
    throw new Error('useUserPreferencesContext must be used within a UserPreferencesProvider');
  }

  return context;
};

/**
 * HOC to inject user preferences into a component
 */
export const withUserPreferences = <P extends object>(
  Component: React.ComponentType<P & { userPreferences: UserPreferencesContextValue }>
) => {
  const WithUserPreferencesComponent = (props: P) => {
    const userPreferences = useUserPreferencesContext();

    return <Component {...props} userPreferences={userPreferences} />;
  };

  WithUserPreferencesComponent.displayName = `withUserPreferences(${Component.displayName || Component.name})`;

  return WithUserPreferencesComponent;
};

/**
 * Component to conditionally render based on preferences
 */
interface ConditionalRenderProps {
  children: ReactNode;
  when?: {
    reducedMotion?: boolean;
    saveData?: boolean;
    highContrast?: boolean;
    darkMode?: boolean;
    touchSupported?: boolean;
    keyboardNavigation?: boolean;
  };
  fallback?: ReactNode;
}

export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  children,
  when = {},
  fallback = null,
}) => {
  const { preferences } = useUserPreferencesContext();

  const shouldRender = Object.entries(when).every(([key, expectedValue]) => {
    switch (key) {
      case 'reducedMotion':
        return preferences.prefersReducedMotion === expectedValue;
      case 'saveData':
        return preferences.saveData === expectedValue;
      case 'highContrast':
        return preferences.prefersHighContrast === expectedValue;
      case 'darkMode':
        return (preferences.colorScheme === 'dark') === expectedValue;
      case 'touchSupported':
        return preferences.touchSupported === expectedValue;
      case 'keyboardNavigation':
        return preferences.prefersKeyboardNavigation === expectedValue;
      default:
        return true;
    }
  });

  return shouldRender ? <>{children}</> : <>{fallback}</>;
};

/**
 * Component to apply preference-aware CSS classes
 */
interface PreferenceAwareClassesProps {
  children: (classes: string) => ReactNode;
  baseClasses: string;
  reducedMotionClasses?: string;
  saveDataClasses?: string;
  highContrastClasses?: string;
  darkModeClasses?: string;
  touchClasses?: string;
}

export const PreferenceAwareClasses: React.FC<PreferenceAwareClassesProps> = ({
  children,
  baseClasses,
  reducedMotionClasses = '',
  saveDataClasses = '',
  highContrastClasses = '',
  darkModeClasses = '',
  touchClasses = '',
}) => {
  const { preferences, getTransitionClasses } = useUserPreferencesContext();

  let classes = getTransitionClasses(baseClasses);

  if (preferences.prefersReducedMotion && reducedMotionClasses) {
    classes += ` ${reducedMotionClasses}`;
  }

  if (preferences.saveData && saveDataClasses) {
    classes += ` ${saveDataClasses}`;
  }

  if (preferences.prefersHighContrast && highContrastClasses) {
    classes += ` ${highContrastClasses}`;
  }

  if (preferences.colorScheme === 'dark' && darkModeClasses) {
    classes += ` ${darkModeClasses}`;
  }

  if (preferences.touchSupported && touchClasses) {
    classes += ` ${touchClasses}`;
  }

  return <>{children(classes.trim())}</>;
};

/**
 * Hook for preference-aware animations
 */
export const usePreferenceAwareAnimation = () => {
  const { getAnimationDuration, shouldUseReducedAnimations } = useUserPreferencesContext();

  const createAnimation = (
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options: KeyframeAnimationOptions
  ) => {
    if (shouldUseReducedAnimations()) {
      // Return a no-op animation for reduced motion
      return {
        play: () => {},
        pause: () => {},
        cancel: () => {},
        finish: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
      };
    }

    const adjustedOptions = {
      ...options,
      duration: getAnimationDuration((options.duration as number) || 300),
    };

    return { keyframes, options: adjustedOptions };
  };

  return { createAnimation, shouldUseReducedAnimations, getAnimationDuration };
};

/**
 * Hook for preference-aware loading strategies
 */
export const usePreferenceAwareLoading = () => {
  const {
    getLoadingStrategy,
    getImageQuality,
    getMaxParallelRequests,
    shouldPreloadContent,
    preferences,
  } = useUserPreferencesContext();

  const getOptimalLoadingConfig = () => ({
    strategy: getLoadingStrategy(),
    imageQuality: getImageQuality(),
    maxParallelRequests: getMaxParallelRequests(),
    shouldPreload: shouldPreloadContent(),
    respectSaveData: preferences.saveData,
    respectReducedMotion: preferences.prefersReducedMotion,
  });

  return {
    getLoadingStrategy,
    getImageQuality,
    getMaxParallelRequests,
    shouldPreloadContent,
    getOptimalLoadingConfig,
  };
};

/**
 * Debug component to show current preferences
 */
export const PreferencesDebugPanel: React.FC<{ show?: boolean }> = ({ show = false }) => {
  const { preferences, config } = useUserPreferencesContext();

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">User Preferences Debug</h3>

      <div className="space-y-1">
        <div>Reduced Motion: {preferences.prefersReducedMotion ? '✅' : '❌'}</div>
        <div>Save Data: {preferences.saveData ? '✅' : '❌'}</div>
        <div>High Contrast: {preferences.prefersHighContrast ? '✅' : '❌'}</div>
        <div>Color Scheme: {preferences.colorScheme}</div>
        <div>Connection: {preferences.effectiveType}</div>
        <div>Touch: {preferences.touchSupported ? '✅' : '❌'}</div>
        <div>Hover: {preferences.hoverSupported ? '✅' : '❌'}</div>
        <div>Keyboard Nav: {preferences.prefersKeyboardNavigation ? '✅' : '❌'}</div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-600">
        <div className="text-xs opacity-75">
          Config: Motion={config.respectReducedMotion ? '✅' : '❌'}, Data=
          {config.respectSaveData ? '✅' : '❌'}
        </div>
      </div>
    </div>
  );
};

export default UserPreferencesContext;
