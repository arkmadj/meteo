/**
 * Custom hook for managing splash screen state
 * Handles timing, app readiness detection, and smooth transitions
 */

import { useEffect, useState } from 'react';

export interface UseSplashScreenOptions {
  /** Minimum duration to show splash screen in milliseconds */
  minDuration?: number;
  /** Maximum duration to show splash screen in milliseconds */
  maxDuration?: number;
  /** Whether the app is ready (data loaded, etc.) */
  isAppReady?: boolean;
  /** Enable splash screen */
  enabled?: boolean;
}

export interface UseSplashScreenReturn {
  /** Whether splash screen should be shown */
  showSplash: boolean;
  /** Whether splash screen has completed */
  isComplete: boolean;
  /** Manually hide splash screen */
  hideSplash: () => void;
  /** Reset splash screen state */
  resetSplash: () => void;
}

/**
 * Hook to manage splash screen visibility and timing
 *
 * @example
 * ```tsx
 * const { showSplash } = useSplashScreen({
 *   minDuration: 2000,
 *   isAppReady: !loading && !!data
 * });
 *
 * return (
 *   <>
 *     <SplashScreen show={showSplash} />
 *     <App />
 *   </>
 * );
 * ```
 */
export const useSplashScreen = ({
  minDuration = 2000,
  maxDuration = 5000,
  isAppReady = false,
  enabled = true,
}: UseSplashScreenOptions = {}): UseSplashScreenReturn => {
  const [showSplash, setShowSplash] = useState(enabled);
  const [isComplete, setIsComplete] = useState(!enabled);
  const [minDurationMet, setMinDurationMet] = useState(false);

  // Track minimum duration
  useEffect(() => {
    if (!enabled) {
      setMinDurationMet(true);
      return;
    }

    const minTimer = setTimeout(() => {
      setMinDurationMet(true);
    }, minDuration);

    return () => clearTimeout(minTimer);
  }, [minDuration, enabled]);

  // Track maximum duration (safety timeout)
  useEffect(() => {
    if (!enabled) return;

    const maxTimer = setTimeout(() => {
      setShowSplash(false);
      setIsComplete(true);
    }, maxDuration);

    return () => clearTimeout(maxTimer);
  }, [maxDuration, enabled]);

  // Hide splash when both conditions are met
  useEffect(() => {
    if (!enabled) {
      setShowSplash(false);
      setIsComplete(true);
      return;
    }

    if (minDurationMet && isAppReady) {
      // Add small delay for smooth transition
      const hideTimer = setTimeout(() => {
        setShowSplash(false);
        setIsComplete(true);
      }, 300);

      return () => clearTimeout(hideTimer);
    }
  }, [minDurationMet, isAppReady, enabled]);

  const hideSplash = () => {
    setShowSplash(false);
    setIsComplete(true);
  };

  const resetSplash = () => {
    setShowSplash(enabled);
    setIsComplete(!enabled);
    setMinDurationMet(false);
  };

  return {
    showSplash,
    isComplete,
    hideSplash,
    resetSplash,
  };
};

export default useSplashScreen;
