/**
 * useMapLazyLoad Hook
 * Manages lazy loading state and preloading strategies for map components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { preloadMapLibraries } from '@/components/maps/LazyMap';

export interface UseMapLazyLoadOptions {
  /**
   * Preload strategy
   * - 'immediate': Load immediately when hook is called
   * - 'hover': Load when user hovers (call triggerLoad on hover)
   * - 'visible': Load when element becomes visible (requires ref)
   * - 'idle': Load when browser is idle
   * - 'manual': Only load when explicitly triggered
   * - 'delay': Load after a delay
   */
  strategy?: 'immediate' | 'hover' | 'visible' | 'idle' | 'manual' | 'delay';

  /**
   * Delay in milliseconds (only for 'delay' strategy)
   */
  delay?: number;

  /**
   * Intersection observer options (only for 'visible' strategy)
   */
  intersectionOptions?: IntersectionObserverInit;

  /**
   * Callback when libraries are loaded
   */
  onLoaded?: () => void;

  /**
   * Callback when loading fails
   */
  onError?: (error: Error) => void;
}

export interface UseMapLazyLoadReturn {
  /**
   * Whether the map libraries are loaded
   */
  isLoaded: boolean;

  /**
   * Whether the map libraries are currently loading
   */
  isLoading: boolean;

  /**
   * Error if loading failed
   */
  error: Error | null;

  /**
   * Manually trigger loading
   */
  triggerLoad: () => Promise<void>;

  /**
   * Ref to attach to the container element (for 'visible' strategy)
   */
  containerRef: React.RefObject<HTMLElement>;

  /**
   * Props to spread on the container element
   */
  containerProps: {
    ref: React.RefObject<HTMLElement>;
    onMouseEnter?: () => void;
    onFocus?: () => void;
  };
}

/**
 * Hook for managing map lazy loading
 */
export const useMapLazyLoad = (options: UseMapLazyLoadOptions = {}): UseMapLazyLoadReturn => {
  const {
    strategy = 'visible',
    delay = 1000,
    intersectionOptions = {
      rootMargin: '50px',
      threshold: 0.1,
    },
    onLoaded,
    onError,
  } = options;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const containerRef = useRef<HTMLElement>(null);
  const hasTriggeredRef = useRef(false);

  /**
   * Load map libraries
   */
  const loadLibraries = useCallback(async () => {
    if (hasTriggeredRef.current) {
      return;
    }

    hasTriggeredRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      await preloadMapLibraries();
      setIsLoaded(true);
      setIsLoading(false);
      onLoaded?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load map libraries');
      setError(error);
      setIsLoading(false);
      onError?.(error);
    }
  }, [onLoaded, onError]);

  /**
   * Trigger loading manually
   */
  const triggerLoad = useCallback(async () => {
    if (!hasTriggeredRef.current) {
      await loadLibraries();
    }
  }, [loadLibraries]);

  // Handle immediate strategy
  useEffect(() => {
    if (strategy === 'immediate') {
      loadLibraries();
    }
  }, [strategy, loadLibraries]);

  // Handle delay strategy
  useEffect(() => {
    if (strategy === 'delay') {
      const timeout = setTimeout(() => {
        loadLibraries();
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [strategy, delay, loadLibraries]);

  // Handle idle strategy
  useEffect(() => {
    if (strategy === 'idle') {
      if ('requestIdleCallback' in window) {
        const idleCallback = window.requestIdleCallback(
          () => {
            loadLibraries();
          },
          { timeout: 2000 }
        );

        return () => {
          window.cancelIdleCallback(idleCallback);
        };
      } else {
        // Fallback for browsers without requestIdleCallback
        const timeout = setTimeout(() => {
          loadLibraries();
        }, 1000);

        return () => clearTimeout(timeout);
      }
    }
  }, [strategy, loadLibraries]);

  // Handle visible strategy (Intersection Observer)
  useEffect(() => {
    if (strategy === 'visible' && containerRef.current) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasTriggeredRef.current) {
            loadLibraries();
            observer.disconnect();
          }
        });
      }, intersectionOptions);

      observer.observe(containerRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [strategy, intersectionOptions, loadLibraries]);

  // Container props for hover strategy
  const containerProps = {
    ref: containerRef,
    ...(strategy === 'hover' && {
      onMouseEnter: triggerLoad,
      onFocus: triggerLoad,
    }),
  };

  return {
    isLoaded,
    isLoading,
    error,
    triggerLoad,
    containerRef,
    containerProps,
  };
};

/**
 * Hook for preloading map libraries on user intent
 * Useful for preloading when user shows intent to interact with map
 */
export const useMapPreload = () => {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);

  const preload = useCallback(async () => {
    if (isPreloaded || isPreloading) {
      return;
    }

    setIsPreloading(true);

    try {
      await preloadMapLibraries();
      setIsPreloaded(true);
    } catch (error) {
      console.error('Failed to preload map libraries:', error);
    } finally {
      setIsPreloading(false);
    }
  }, [isPreloaded, isPreloading]);

  return {
    isPreloaded,
    isPreloading,
    preload,
  };
};

/**
 * Hook for progressive map loading
 * Loads map in stages for better perceived performance
 */
export interface UseProgressiveMapLoadOptions {
  /**
   * Delay between stages in milliseconds
   */
  stageDelay?: number;

  /**
   * Callback when each stage completes
   */
  onStageComplete?: (stage: number) => void;
}

export interface UseProgressiveMapLoadReturn {
  /**
   * Current loading stage
   * 0: Not started
   * 1: CSS loaded
   * 2: Core libraries loaded
   * 3: Map components loaded
   * 4: Fully loaded
   */
  stage: number;

  /**
   * Whether loading is complete
   */
  isComplete: boolean;

  /**
   * Start progressive loading
   */
  startLoading: () => void;
}

export const useProgressiveMapLoad = (
  options: UseProgressiveMapLoadOptions = {}
): UseProgressiveMapLoadReturn => {
  const { stageDelay = 100, onStageComplete } = options;
  const [stage, setStage] = useState(0);

  const startLoading = useCallback(async () => {
    if (stage > 0) return;

    // Stage 1: Load CSS
    setStage(1);
    onStageComplete?.(1);

    await new Promise(resolve => setTimeout(resolve, stageDelay));

    // Stage 2: Load core libraries
    setStage(2);
    onStageComplete?.(2);

    await new Promise(resolve => setTimeout(resolve, stageDelay));

    // Stage 3: Load map components
    setStage(3);
    onStageComplete?.(3);

    try {
      await preloadMapLibraries();

      await new Promise(resolve => setTimeout(resolve, stageDelay));

      // Stage 4: Fully loaded
      setStage(4);
      onStageComplete?.(4);
    } catch (error) {
      console.error('Failed to load map libraries:', error);
    }
  }, [stage, stageDelay, onStageComplete]);

  return {
    stage,
    isComplete: stage === 4,
    startLoading,
  };
};

export default useMapLazyLoad;
