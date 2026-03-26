import type { ComponentType } from 'react';
import React, {
  Suspense,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Loading } from '@/components/ui';
import { useUserPreferencesContext } from '@/contexts/UserPreferencesContext';

/**
 * Conditional Lazy Loading Utilities
 * Load components only when they become visible, active, or needed
 */

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface ConditionalLazyLoadOptions {
  fallback?: ComponentType;
  errorFallback?: ComponentType<{ error: Error; retry: () => void }>;
  timeout?: number;
  loadingStrategy?: 'immediate' | 'visible' | 'hover' | 'click' | 'idle' | 'manual';
  intersectionOptions?: IntersectionObserverInit;
  hoverDelay?: number;
  idleDelay?: number;
  preloadOnHover?: boolean;
  preloadOnVisible?: boolean;
}

interface VisibilityTriggerProps {
  children: React.ReactNode;
  onVisible: () => void;
  options?: IntersectionObserverInit;
  once?: boolean;
}

interface HoverTriggerProps {
  children: React.ReactNode;
  onHover: () => void;
  delay?: number;
}

interface IdleTriggerProps {
  children: React.ReactNode;
  onIdle: () => void;
  delay?: number;
}

// ============================================================================
// VISIBILITY DETECTION HOOKS
// ============================================================================

/**
 * Hook to detect when an element becomes visible
 */
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {},
  once: boolean = true
) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsVisible(visible);

        if (visible && !hasBeenVisible) {
          setHasBeenVisible(true);
          if (once) {
            observer.disconnect();
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [options, once, hasBeenVisible]);

  return { elementRef, isVisible, hasBeenVisible };
};

/**
 * Hook to detect hover with delay
 */
export const useHoverWithDelay = (delay: number = 200) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hasBeenHovered, setHasBeenHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsHovered(true);
      setHasBeenHovered(true);
    }, delay);
  }, [delay]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovered(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isHovered,
    hasBeenHovered,
    hoverProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
};

/**
 * Hook to detect browser idle time
 */
export const useIdleDetection = (delay: number = 2000) => {
  const [isIdle, setIsIdle] = useState(false);
  const [hasBeenIdle, setHasBeenIdle] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const resetIdleTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsIdle(false);

    timeoutRef.current = setTimeout(() => {
      setIsIdle(true);
      setHasBeenIdle(true);
    }, delay);
  }, [delay]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });

    resetIdleTimer(); // Start the timer

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetIdleTimer]);

  return { isIdle, hasBeenIdle };
};

// ============================================================================
// TRIGGER COMPONENTS
// ============================================================================

/**
 * Visibility trigger component
 */
export const VisibilityTrigger: React.FC<VisibilityTriggerProps> = ({
  children,
  onVisible,
  options,
  once = true,
}) => {
  const { elementRef, hasBeenVisible } = useIntersectionObserver(options, once);

  useEffect(() => {
    if (hasBeenVisible) {
      onVisible();
    }
  }, [hasBeenVisible, onVisible]);

  return (
    <div ref={elementRef} className="w-full">
      {children}
    </div>
  );
};

/**
 * Hover trigger component
 */
export const HoverTrigger: React.FC<HoverTriggerProps> = ({ children, onHover, delay = 200 }) => {
  const { hasBeenHovered, hoverProps } = useHoverWithDelay(delay);

  useEffect(() => {
    if (hasBeenHovered) {
      onHover();
    }
  }, [hasBeenHovered, onHover]);

  return (
    <div {...hoverProps} className="w-full">
      {children}
    </div>
  );
};

/**
 * Idle trigger component
 */
export const IdleTrigger: React.FC<IdleTriggerProps> = ({ children, onIdle, delay = 2000 }) => {
  const { hasBeenIdle } = useIdleDetection(delay);

  useEffect(() => {
    if (hasBeenIdle) {
      onIdle();
    }
  }, [hasBeenIdle, onIdle]);

  return <div className="w-full">{children}</div>;
};

// ============================================================================
// CONDITIONAL LAZY COMPONENT FACTORY
// ============================================================================

/**
 * Create a conditionally lazy-loaded component
 */
export function createConditionalLazyComponent<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  options: ConditionalLazyLoadOptions = {}
) {
  const {
    fallback: CustomFallback,
    errorFallback: CustomErrorFallback,
    timeout = 10000,
    loadingStrategy = 'immediate',
    intersectionOptions,
    hoverDelay = 200,
    idleDelay = 2000,
    preloadOnHover = false,
    preloadOnVisible = false,
  } = options;

  // Create the lazy component
  let LazyComponent: React.LazyExoticComponent<T> | null = null;
  let importPromise: Promise<{ default: T }> | null = null;

  const createLazyComponent = () => {
    if (!LazyComponent) {
      LazyComponent = React.lazy(() => {
        if (!importPromise) {
          importPromise = Promise.race([
            importFn(),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Component load timeout')), timeout)
            ),
          ]);
        }
        return importPromise;
      });
    }
    return LazyComponent;
  };

  const preloadComponent = () => {
    if (!importPromise) {
      importPromise = importFn();
    }
    return importPromise;
  };

  // Default fallbacks
  const LoadingFallback =
    CustomFallback ||
    (() => (
      <div className="flex items-center justify-center p-4">
        <Loading size="md" text="Loading component..." />
      </div>
    ));

  const _ErrorFallback =
    CustomErrorFallback ||
    (({ retry }) => (
      <div className="flex flex-col items-center justify-center p-4 text-center">
        <div className="text-red-500 mb-2">⚠️</div>
        <p className="text-sm text-gray-600 mb-2">Failed to load component</p>
        <button
          onClick={retry}
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    ));

  const ConditionalLazyWrapper = forwardRef<unknown, Record<string, unknown>>((props, ref) => {
    const [shouldLoad, setShouldLoad] = useState(loadingStrategy === 'immediate');
    const [retryKey, setRetryKey] = useState(0);

    const handleLoad = useCallback(() => {
      setShouldLoad(true);
    }, []);

    const _handleRetry = useCallback(() => {
      setRetryKey(prev => prev + 1);
      setShouldLoad(true);
    }, []);

    // Preloading logic
    const handlePreload = useCallback(() => {
      preloadComponent();
    }, []);

    const renderContent = () => {
      if (!shouldLoad) {
        return (
          <div className="w-full h-32 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-gray-400 mb-2">📦</div>
              <p className="text-sm text-gray-500">Component ready to load</p>
            </div>
          </div>
        );
      }

      const Component = createLazyComponent();

      return (
        <Suspense fallback={<LoadingFallback />}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Component key={retryKey} {...({ ...props, ref } as any)} />
        </Suspense>
      );
    };

    const content = renderContent();

    // Apply loading strategy
    switch (loadingStrategy) {
      case 'visible':
        return (
          <VisibilityTrigger
            onVisible={preloadOnVisible ? handlePreload : handleLoad}
            options={intersectionOptions}
          >
            {(preloadOnVisible && (
              <VisibilityTrigger onVisible={handleLoad} options={{ threshold: 0.5 }}>
                {content}
              </VisibilityTrigger>
            )) ||
              content}
          </VisibilityTrigger>
        );

      case 'hover':
        return (
          <HoverTrigger onHover={preloadOnHover ? handlePreload : handleLoad} delay={hoverDelay}>
            {(preloadOnHover && (
              <HoverTrigger onHover={handleLoad} delay={0}>
                {content}
              </HoverTrigger>
            )) ||
              content}
          </HoverTrigger>
        );

      case 'click':
        return (
          <div onClick={handleLoad} className="cursor-pointer">
            {content}
          </div>
        );

      case 'idle':
        return (
          <IdleTrigger onIdle={handleLoad} delay={idleDelay}>
            {content}
          </IdleTrigger>
        );

      case 'manual':
        return (
          <div>
            {content}
            {!shouldLoad && (
              <button
                onClick={handleLoad}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Load Component
              </button>
            )}
          </div>
        );

      default:
        return content;
    }
  });

  ConditionalLazyWrapper.displayName = `ConditionalLazy(${importFn.toString().match(/import\(['"`](.+?)['"`]\)/)?.[1] || 'Component'})`;

  return ConditionalLazyWrapper;
}

// ============================================================================
// SPECIALIZED CONDITIONAL LAZY FACTORIES
// ============================================================================

/**
 * Create a visibility-based lazy component (loads when scrolled into view)
 */
export const createVisibilityLazyComponent = <T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  _componentName?: string
) =>
  createConditionalLazyComponent(importFn, {
    loadingStrategy: 'visible',
    preloadOnVisible: true,
    intersectionOptions: { threshold: 0.1, rootMargin: '100px' },
  });

/**
 * Create a hover-based lazy component (loads on hover)
 */
export const createHoverLazyComponent = <T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  _componentName?: string
) =>
  createConditionalLazyComponent(importFn, {
    loadingStrategy: 'hover',
    preloadOnHover: true,
    hoverDelay: 150,
  });

/**
 * Create an idle-based lazy component (loads when user is idle)
 */
export const createIdleLazyComponent = <T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  _componentName?: string
) =>
  createConditionalLazyComponent(importFn, {
    loadingStrategy: 'idle',
    idleDelay: 1500,
  });

/**
 * Create a click-based lazy component (loads on click)
 */
export const createClickLazyComponent = <T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  _componentName?: string
) =>
  createConditionalLazyComponent(importFn, {
    loadingStrategy: 'click',
  });

/**
 * Preference-aware lazy component factories
 * These respect user preferences for reduced motion, save data, etc.
 */

/**
 * Create a preference-aware lazy component that adapts loading strategy
 */
export const createPreferenceAwareLazyComponent = <T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  componentName?: string,
  fallbackStrategy: 'visible' | 'hover' | 'click' | 'idle' = 'visible'
) => {
  const PreferenceAwareComponent = forwardRef<unknown, Record<string, unknown>>((props, ref) => {
    // This will be wrapped by UserPreferencesProvider, so we can't use the hook here
    // Instead, we'll create a wrapper that uses the hook
    return (
      <PreferenceAwareWrapper
        importFn={importFn}
        componentName={componentName}
        fallbackStrategy={fallbackStrategy}
        props={props}
        forwardedRef={ref}
      />
    );
  });

  PreferenceAwareComponent.displayName = `PreferenceAware(${componentName || 'Component'})`;
  return PreferenceAwareComponent;
};

/**
 * Internal wrapper component that uses the preferences hook
 */
const PreferenceAwareWrapper = <T extends ComponentType<unknown>>({
  importFn,
  componentName: _componentName,
  fallbackStrategy,
  props,
  forwardedRef,
}: {
  importFn: () => Promise<{ default: T }>;
  componentName?: string;
  fallbackStrategy: 'visible' | 'hover' | 'click' | 'idle';
  props: Record<string, unknown>;
  forwardedRef: React.Ref<unknown>;
}) => {
  const { getLoadingStrategy, preferences } = useUserPreferencesContext();

  const strategy = getLoadingStrategy() || fallbackStrategy;

  const ConditionalComponent = useMemo(() => {
    const options: ConditionalLazyLoadOptions = {
      loadingStrategy: strategy,
    };

    // Adjust options based on strategy and preferences
    switch (strategy) {
      case 'visible':
        options.intersectionOptions = {
          threshold: preferences.saveData ? 0.3 : 0.1,
          rootMargin: preferences.saveData ? '50px' : '100px',
        };
        break;
      case 'hover':
        options.hoverDelay = preferences.saveData ? 500 : 200;
        break;
      case 'idle':
        options.idleDelay = preferences.saveData ? 5000 : 2000;
        break;
    }

    return createConditionalLazyComponent(importFn, options);
  }, [strategy, preferences.saveData, importFn]);

  return <ConditionalComponent {...(props as Record<string, unknown>)} ref={forwardedRef} />;
};

export default {
  createConditionalLazyComponent,
  createVisibilityLazyComponent,
  createHoverLazyComponent,
  createIdleLazyComponent,
  createClickLazyComponent,
  createPreferenceAwareLazyComponent,
  VisibilityTrigger,
  HoverTrigger,
  IdleTrigger,
  useIntersectionObserver,
  useHoverWithDelay,
  useIdleDetection,
};
