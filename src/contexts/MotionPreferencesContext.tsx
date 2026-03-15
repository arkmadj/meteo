/**
 * Motion Preferences Context
 * Manages global reduced motion preferences from both system settings and manual user toggle
 * Integrates with UserPreferencesContext for comprehensive motion control
 */

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'motion-preferences';

/**
 * Motion preferences state
 */
export interface MotionPreferences {
  // Manual toggle from Settings (overrides system preference)
  manualReducedMotion: boolean | null; // null = use system preference
  
  // System preference (from prefers-reduced-motion media query)
  systemReducedMotion: boolean;
  
  // Computed effective state (manual override OR system preference)
  effectiveReducedMotion: boolean;
  
  // Individual motion effect toggles
  disableTransitions: boolean;
  disableParallax: boolean;
  disableAnimations: boolean;
}

/**
 * Context value type
 */
interface MotionPreferencesContextValue {
  preferences: MotionPreferences;
  
  // Actions
  setManualReducedMotion: (enabled: boolean | null) => void;
  enableReducedMotion: () => void;
  disableReducedMotion: () => void;
  resetToSystemPreference: () => void;
  
  // Utility functions
  shouldReduceMotion: () => boolean;
  shouldDisableTransitions: () => boolean;
  shouldDisableParallax: () => boolean;
  shouldDisableAnimations: () => boolean;
}

/**
 * Motion preferences context
 */
const MotionPreferencesContext = createContext<MotionPreferencesContextValue | null>(null);

/**
 * Props for the motion preferences provider
 */
interface MotionPreferencesProviderProps {
  children: ReactNode;
}

/**
 * Load preferences from localStorage
 */
function loadPreferencesFromStorage(): { manualReducedMotion: boolean | null } {
  if (typeof window === 'undefined') {
    return { manualReducedMotion: null };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        manualReducedMotion: parsed.manualReducedMotion ?? null,
      };
    }
  } catch (error) {
    console.warn('Failed to load motion preferences from storage:', error);
  }

  return { manualReducedMotion: null };
}

/**
 * Save preferences to localStorage
 */
function savePreferencesToStorage(manualReducedMotion: boolean | null): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ manualReducedMotion })
    );
  } catch (error) {
    console.warn('Failed to save motion preferences to storage:', error);
  }
}

/**
 * Motion preferences provider component
 */
export const MotionPreferencesProvider: React.FC<MotionPreferencesProviderProps> = ({
  children,
}) => {
  // Load initial state from localStorage
  const [manualReducedMotion, setManualReducedMotionState] = useState<boolean | null>(() => {
    const stored = loadPreferencesFromStorage();
    return stored.manualReducedMotion;
  });

  // Track system preference
  const [systemReducedMotion, setSystemReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Compute effective reduced motion state
  const effectiveReducedMotion = manualReducedMotion !== null 
    ? manualReducedMotion 
    : systemReducedMotion;

  // Build preferences object
  const preferences: MotionPreferences = {
    manualReducedMotion,
    systemReducedMotion,
    effectiveReducedMotion,
    disableTransitions: effectiveReducedMotion,
    disableParallax: effectiveReducedMotion,
    disableAnimations: effectiveReducedMotion,
  };

  // Actions
  const setManualReducedMotion = useCallback((enabled: boolean | null) => {
    setManualReducedMotionState(enabled);
    savePreferencesToStorage(enabled);
    
    // Apply CSS class to document root for global CSS control
    if (typeof document !== 'undefined') {
      if (enabled === true) {
        document.documentElement.classList.add('reduce-motion');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    }
  }, []);

  const enableReducedMotion = useCallback(() => {
    setManualReducedMotion(true);
  }, [setManualReducedMotion]);

  const disableReducedMotion = useCallback(() => {
    setManualReducedMotion(false);
  }, [setManualReducedMotion]);

  const resetToSystemPreference = useCallback(() => {
    setManualReducedMotion(null);
  }, [setManualReducedMotion]);

  // Utility functions
  const shouldReduceMotion = useCallback(() => {
    return effectiveReducedMotion;
  }, [effectiveReducedMotion]);

  const shouldDisableTransitions = useCallback(() => {
    return preferences.disableTransitions;
  }, [preferences.disableTransitions]);

  const shouldDisableParallax = useCallback(() => {
    return preferences.disableParallax;
  }, [preferences.disableParallax]);

  const shouldDisableAnimations = useCallback(() => {
    return preferences.disableAnimations;
  }, [preferences.disableAnimations]);

  // Apply CSS class on mount and when effective state changes
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (effectiveReducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [effectiveReducedMotion]);

  const contextValue: MotionPreferencesContextValue = {
    preferences,
    setManualReducedMotion,
    enableReducedMotion,
    disableReducedMotion,
    resetToSystemPreference,
    shouldReduceMotion,
    shouldDisableTransitions,
    shouldDisableParallax,
    shouldDisableAnimations,
  };

  return (
    <MotionPreferencesContext.Provider value={contextValue}>
      {children}
    </MotionPreferencesContext.Provider>
  );
};

/**
 * Hook to use motion preferences context
 */
export const useMotionPreferences = (): MotionPreferencesContextValue => {
  const context = useContext(MotionPreferencesContext);
  
  if (!context) {
    throw new Error('useMotionPreferences must be used within a MotionPreferencesProvider');
  }
  
  return context;
};

/**
 * Hook to check if reduced motion is enabled (convenience hook)
 */
export const useReducedMotion = (): boolean => {
  const { preferences } = useMotionPreferences();
  return preferences.effectiveReducedMotion;
};

export default MotionPreferencesContext;

