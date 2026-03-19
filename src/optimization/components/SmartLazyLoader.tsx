/**
 * Smart Lazy Loader Component
 *
 * Advanced lazy loading component that combines multiple optimization strategies
 * for optimal performance and user experience.
 */

import React, { Suspense, useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface SmartLazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;

  // Loading strategies
  strategy?: 'immediate' | 'intersection' | 'hover' | 'click' | 'idle';

  // Intersection observer options
  rootMargin?: string;
  threshold?: number;

  // Performance options
  preload?: boolean;
  priority?: 'high' | 'low';
  timeout?: number;

  // Error handling
  maxRetries?: number;
  retryDelay?: number;

  // Analytics
  onLoadStart?: () => void;
  onLoadComplete?: (loadTime: number) => void;
  onLoadError?: (error: Error) => void;
}

/**
 * Smart Lazy Loader with multiple loading strategies and performance optimizations
 */
export function SmartLazyLoader({
  children,
  fallback = <div className="loading-placeholder">Loading...</div>,
  strategy = 'intersection',
  rootMargin = '50px',
  threshold = 0.1,
  preload = false,
  priority = 'low',
  timeout = 10000,
  maxRetries = 3,
  retryDelay = 1000,
  onLoadStart,
  onLoadComplete,
  onLoadError,
}: SmartLazyLoaderProps) {
  const [shouldLoad, setShouldLoad] = useState(strategy === 'immediate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [loadTime, setLoadTime] = useState<number | null>(null);

  const ref = useRef<HTMLDivElement>(null);
  const loadStartTime = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Intersection Observer for viewport-based loading
  useEffect(() => {
    if (strategy !== 'intersection' || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [strategy, shouldLoad, rootMargin, threshold]);

  // Idle loading strategy
  useEffect(() => {
    if (strategy !== 'idle' || shouldLoad) return;

    const loadOnIdle = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => setShouldLoad(true));
      } else {
        setTimeout(() => setShouldLoad(true), 100);
      }
    };

    loadOnIdle();
  }, [strategy, shouldLoad]);

  // Preloading logic
  useEffect(() => {
    if (!preload || shouldLoad) return;

    const preloadTimer =
      priority === 'high'
        ? setTimeout(() => setShouldLoad(true), 100)
        : requestIdleCallback
          ? requestIdleCallback(() => setShouldLoad(true))
          : setTimeout(() => setShouldLoad(true), 2000);

    return () => {
      if (typeof preloadTimer === 'number') {
        clearTimeout(preloadTimer);
      }
    };
  }, [preload, shouldLoad, priority]);

  // Timeout handling
  useEffect(() => {
    if (!isLoading) return;

    timeoutRef.current = setTimeout(() => {
      const timeoutError = new Error(`Component loading timed out after ${timeout}ms`);
      setError(timeoutError);
      onLoadError?.(timeoutError);
    }, timeout);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, timeout, onLoadError]);

  // Handle loading start
  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    loadStartTime.current = performance.now();
    onLoadStart?.();
  }, [onLoadStart]);

  // Handle loading complete
  const handleLoadComplete = useCallback(() => {
    setIsLoading(false);
    if (loadStartTime.current) {
      const duration = performance.now() - loadStartTime.current;
      setLoadTime(duration);
      onLoadComplete?.(duration);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [onLoadComplete]);

  // Handle loading error
  const handleLoadError = useCallback(
    (error: Error) => {
      setIsLoading(false);
      setError(error);
      onLoadError?.(error);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    [onLoadError]
  );

  // Retry logic
  const handleRetry = useCallback(() => {
    if (retryCount < maxRetries) {
      setError(null);
      setRetryCount(prev => prev + 1);

      setTimeout(() => {
        setShouldLoad(false);
        setTimeout(() => setShouldLoad(true), 100);
      }, retryDelay);
    }
  }, [retryCount, maxRetries, retryDelay]);

  // Event handlers for different strategies
  const eventHandlers = useMemo(() => {
    const handlers: Record<string, () => void> = {};

    if (strategy === 'hover') {
      handlers.onMouseEnter = () => setShouldLoad(true);
    }

    if (strategy === 'click') {
      handlers.onClick = () => setShouldLoad(true);
    }

    return handlers;
  }, [strategy]);

  // Render error state
  if (error && retryCount >= maxRetries) {
    return (
      <div className="lazy-loader-error" ref={ref}>
        <div className="error-content">
          <h3>Failed to load content</h3>
          <p>{error.message}</p>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
      </div>
    );
  }

  // Render retry state
  if (error && retryCount < maxRetries) {
    return (
      <div className="lazy-loader-retry" ref={ref}>
        <div className="retry-content">
          <p>
            Loading failed. Retrying... ({retryCount + 1}/{maxRetries})
          </p>
          <button onClick={handleRetry}>Retry Now</button>
        </div>
      </div>
    );
  }

  // Render loading trigger for click/hover strategies
  if (!shouldLoad && (strategy === 'click' || strategy === 'hover')) {
    return (
      <div className={`lazy-loader-trigger lazy-loader-${strategy}`} ref={ref} {...eventHandlers}>
        <div className="trigger-content">
          <p>{strategy === 'click' ? 'Click to load content' : 'Hover to load content'}</p>
          {fallback}
        </div>
      </div>
    );
  }

  // Render placeholder while waiting to load
  if (!shouldLoad) {
    return (
      <div className="lazy-loader-placeholder" ref={ref}>
        {fallback}
      </div>
    );
  }

  // Render lazy content with Suspense
  return (
    <div className="lazy-loader-content" ref={ref}>
      <Suspense
        fallback={
          <div className="lazy-loader-suspense">
            {fallback}
            {process.env.NODE_ENV === 'development' && loadTime && (
              <div className="load-time-debug">Previous load: {loadTime.toFixed(2)}ms</div>
            )}
          </div>
        }
      >
        <LoadingWrapper
          onLoadStart={handleLoadStart}
          onLoadComplete={handleLoadComplete}
          onLoadError={handleLoadError}
        >
          {children}
        </LoadingWrapper>
      </Suspense>
    </div>
  );
}

/**
 * Wrapper component to track loading lifecycle
 */
interface LoadingWrapperProps {
  children: React.ReactNode;
  onLoadStart: () => void;
  onLoadComplete: () => void;
  onLoadError: (error: Error) => void;
}

function LoadingWrapper({
  children,
  onLoadStart,
  onLoadComplete,
  onLoadError,
}: LoadingWrapperProps) {
  useEffect(() => {
    onLoadStart();

    // Simulate component mount completion
    const timer = setTimeout(() => {
      onLoadComplete();
    }, 0);

    return () => clearTimeout(timer);
  }, [onLoadStart, onLoadComplete]);

  return <ErrorBoundary onError={onLoadError}>{children}</ErrorBoundary>;
}

/**
 * Error Boundary for catching component errors
 */
interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError: (error: Error) => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="component-error">
          <p>Component failed to render</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SmartLazyLoader;
