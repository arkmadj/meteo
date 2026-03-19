/**
 * Motion Accessibility Hooks
 * Provides hooks for respecting user motion preferences and reducing motion sickness
 * Integrates with MotionPreferencesContext for manual toggle support
 */

import { useEffect, useState } from 'react';

/**
 * Check if user prefers reduced motion
 * Respects both system-level accessibility preference AND manual toggle from Settings
 *
 * This hook checks:
 * 1. Manual toggle via .reduce-motion class on document.documentElement
 * 2. System preference via prefers-reduced-motion media query
 *
 * Priority: Manual toggle > System preference
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    // SSR-safe: Check if window is available
    if (typeof window === 'undefined') return false;

    // Check manual toggle first (set by MotionPreferencesContext)
    const hasManualToggle = document.documentElement.classList.contains('reduce-motion');
    if (hasManualToggle) return true;

    // Fall back to system preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    return mediaQuery.matches;
  });

  useEffect(() => {
    // Watch for changes to the .reduce-motion class on document.documentElement
    const observer = new MutationObserver(() => {
      const hasManualToggle = document.documentElement.classList.contains('reduce-motion');
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const systemPreference = mediaQuery.matches;

      // Update state: manual toggle OR system preference
      setPrefersReduced(hasManualToggle || systemPreference);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Also watch for system preference changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (event: MediaQueryListEvent) => {
      const hasManualToggle = document.documentElement.classList.contains('reduce-motion');
      setPrefersReduced(hasManualToggle || event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    }
    // Legacy browsers
    else {
      mediaQuery.addListener(handler);
    }

    return () => {
      observer.disconnect();
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, []);

  return prefersReduced;
}

/**
 * Animation duration configuration
 */
export const ANIMATION_DURATION = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

/**
 * Animation easing functions
 */
export const ANIMATION_EASING = {
  easeOut: 'cubic-bezier(0.33, 1, 0.68, 1)',
  easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  easeIn: 'cubic-bezier(0.32, 0, 0.67, 0)',
} as const;

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration: number;
  distance: number;
  easing: string;
  enabled: boolean;
}

/**
 * Get adaptive animation configuration based on user preference
 */
export function useAdaptiveAnimation(config: AnimationConfig): AnimationConfig {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (!prefersReducedMotion) {
    return config;
  }

  // Reduce motion: shorter duration, less distance
  return {
    duration: Math.min(config.duration * 0.3, 100), // Max 100ms
    distance: config.distance * 0.1, // 10% of original distance
    easing: ANIMATION_EASING.easeOut,
    enabled: config.enabled,
  };
}

/**
 * Get animation duration based on user preference
 */
export function useAnimationDuration(
  duration: number,
  options: { min?: number; max?: number } = {}
): number {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { min = 0, max = Infinity } = options;

  if (prefersReducedMotion) {
    // Reduce by 70% but respect min/max
    const reduced = duration * 0.3;
    return Math.max(min, Math.min(max, reduced));
  }

  return duration;
}

/**
 * Motion settings from user preferences
 */
export interface MotionSettings {
  enabled: boolean;
  duration: 'instant' | 'fast' | 'normal';
  effects: {
    transitions: boolean;
    parallax: boolean;
    autoplay: boolean;
    hover: boolean;
  };
}

/**
 * Default motion settings
 */
const DEFAULT_MOTION_SETTINGS: MotionSettings = {
  enabled: true,
  duration: 'fast',
  effects: {
    transitions: true,
    parallax: true,
    autoplay: true,
    hover: true,
  },
};

/**
 * Get motion settings from localStorage
 */
function getStoredMotionSettings(): MotionSettings {
  if (typeof window === 'undefined') return DEFAULT_MOTION_SETTINGS;

  try {
    const stored = localStorage.getItem('motionSettings');
    if (stored) {
      return { ...DEFAULT_MOTION_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn('Failed to load motion settings:', error);
  }

  return DEFAULT_MOTION_SETTINGS;
}

/**
 * Save motion settings to localStorage
 */
function saveMotionSettings(settings: MotionSettings): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('motionSettings', JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save motion settings:', error);
  }
}

/**
 * Hook for managing user motion settings
 */
export function useMotionSettings(): [MotionSettings, (settings: MotionSettings) => void] {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [settings, setSettings] = useState<MotionSettings>(() => {
    const stored = getStoredMotionSettings();

    // If system prefers reduced motion, override settings
    if (prefersReducedMotion) {
      return {
        ...stored,
        enabled: false,
        duration: 'instant',
        effects: {
          transitions: false,
          parallax: false,
          autoplay: false,
          hover: false,
        },
      };
    }

    return stored;
  });

  const updateSettings = (newSettings: MotionSettings) => {
    setSettings(newSettings);
    saveMotionSettings(newSettings);
  };

  // Update settings when system preference changes
  useEffect(() => {
    if (prefersReducedMotion) {
      setSettings(prev => ({
        ...prev,
        enabled: false,
        duration: 'instant',
        effects: {
          transitions: false,
          parallax: false,
          autoplay: false,
          hover: false,
        },
      }));
    }
  }, [prefersReducedMotion]);

  return [settings, updateSettings];
}

/**
 * Check if specific motion effect should be enabled
 */
export function useMotionEffect(effect: keyof MotionSettings['effects']): boolean {
  const [settings] = useMotionSettings();
  return settings.enabled && settings.effects[effect];
}

/**
 * Get transition CSS based on motion settings
 */
export function useTransition(
  property: string,
  duration: number = ANIMATION_DURATION.fast,
  easing: string = ANIMATION_EASING.easeOut
): string {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [settings] = useMotionSettings();

  if (prefersReducedMotion || !settings.enabled || !settings.effects.transitions) {
    return 'none';
  }

  const actualDuration =
    settings.duration === 'instant' ? 0 : settings.duration === 'fast' ? duration * 0.7 : duration;

  return `${property} ${actualDuration}ms ${easing}`;
}

/**
 * Get safe animation properties for reduced motion
 */
export interface SafeAnimationProps {
  initial: Record<string, unknown>;
  animate: Record<string, unknown>;
  transition: Record<string, unknown>;
}

export function useSafeAnimation(
  fullAnimation: SafeAnimationProps,
  type: 'slide' | 'fade' | 'scale' = 'fade'
): SafeAnimationProps {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (!prefersReducedMotion) {
    return fullAnimation;
  }

  // Reduced motion: only use opacity
  const reducedAnimations = {
    slide: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.1 },
    },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.1 },
    },
    scale: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.1 },
    },
  };

  return reducedAnimations[type];
}

/**
 * Check if animations should be disabled entirely
 */
export function useDisableAnimations(): boolean {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [settings] = useMotionSettings();

  return prefersReducedMotion || !settings.enabled;
}

/**
 * Export all hooks
 */
export const motionHooks = {
  usePrefersReducedMotion,
  useAdaptiveAnimation,
  useAnimationDuration,
  useMotionSettings,
  useMotionEffect,
  useTransition,
  useSafeAnimation,
  useDisableAnimations,
};
