import type { ComponentType, ReactNode } from 'react';
import React, { Component, forwardRef, Suspense } from 'react';

import { Loading } from '@/components/ui';

/**
 * Enhanced lazy loading utility with error boundaries and loading states
 */

interface LazyLoadOptions {
  fallback?: ComponentType;
  errorFallback?: ComponentType<{ error: Error; retry: () => void }>;
  preload?: boolean;
  timeout?: number;
}

/**
 * Default error fallback component
 */
const DefaultErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="text-red-500 mb-4">
      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load component</h3>
    <p className="text-gray-600 mb-4 max-w-md">
      {error.message || 'An error occurred while loading this component.'}
    </p>
    <button
      onClick={retry}
      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
    >
      Try Again
    </button>
  </div>
);

/**
 * Default loading fallback component
 */
const DefaultLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <Loading />
  </div>
);

/**
 * Error Boundary class component for catching errors in lazy-loaded components
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

/**
 * Create a lazy-loaded component with enhanced error handling and loading states
 */
export const createLazyComponent = <T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
) => {
  const {
    fallback: LoadingFallback = DefaultLoadingFallback,
    errorFallback: ErrorFallback = DefaultErrorFallback,
    preload = false,
    timeout = 10000,
  } = options;

  // Create the lazy component
  const LazyComponent = React.lazy(() => {
    const importPromise = importFn();

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Component loading timeout')), timeout);
    });

    return Promise.race([importPromise, timeoutPromise]);
  });

  // Preload the component if requested
  if (preload) {
    importFn().catch(() => {
      // Silently fail preloading
    });
  }

  // Create the wrapper component with error boundary
  const LazyWrapper = forwardRef<unknown, Record<string, unknown>>((props, ref) => {
    const [error, setError] = React.useState<Error | null>(null);
    const [retryKey, setRetryKey] = React.useState(0);

    const retry = React.useCallback(() => {
      setError(null);
      setRetryKey(prev => prev + 1);
    }, []);

    if (error) {
      return <ErrorFallback error={error} retry={retry} />;
    }

    return (
      <ErrorBoundary
        fallback={<ErrorFallback error={new Error('Component render error')} retry={retry} />}
        onError={setError}
      >
        <Suspense fallback={<LoadingFallback />}>
          <LazyComponent key={retryKey} {...(props as Record<string, unknown>)} ref={ref} />
        </Suspense>
      </ErrorBoundary>
    );
  });

  LazyWrapper.displayName = `LazyWrapper(${(LazyComponent as React.LazyExoticComponent<T> & { displayName?: string }).displayName || 'Component'})`;

  return LazyWrapper;
};

/**
 * Create a lazy component with route-based loading
 */
export const createRouteLazyComponent = <T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  routeName: string
) => {
  return createLazyComponent(importFn, {
    fallback: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-gray-600">Loading {routeName}...</p>
        </div>
      </div>
    ),
    errorFallback: ({ error, retry }) => (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-red-500 mb-4">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load {routeName}</h2>
        <p className="text-gray-600 mb-6 max-w-md text-center">
          {error.message || `An error occurred while loading the ${routeName} page.`}
        </p>
        <button
          onClick={retry}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          Reload {routeName}
        </button>
      </div>
    ),
    preload: false,
    timeout: 15000, // Longer timeout for routes
  });
};

/**
 * Create a lazy component for showcase/demo components
 */
export const createShowcaseLazyComponent = <T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string
) => {
  return createLazyComponent(importFn, {
    fallback: () => (
      <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading {componentName}...</p>
        </div>
      </div>
    ),
    errorFallback: ({ error: _error, retry }) => (
      <div className="flex flex-col items-center justify-center p-6 border-2 border-red-200 rounded-lg bg-red-50">
        <div className="text-red-500 mb-2">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01"
            />
          </svg>
        </div>
        <p className="text-sm text-red-700 mb-3 text-center">Failed to load {componentName}</p>
        <button
          onClick={retry}
          className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Retry
        </button>
      </div>
    ),
    timeout: 8000,
  });
};

/**
 * Preload a lazy component
 */
export const preloadComponent = (importFn: () => Promise<{ default: ComponentType<unknown> }>) => {
  return importFn().catch(() => {
    // Silently fail preloading
  });
};

/**
 * Hook to preload components on user interaction
 */
export const usePreloadOnHover = (importFn: () => Promise<{ default: ComponentType<unknown> }>) => {
  const [preloaded, setPreloaded] = React.useState(false);

  const preload = React.useCallback(() => {
    if (!preloaded) {
      preloadComponent(importFn);
      setPreloaded(true);
    }
  }, [importFn, preloaded]);

  return {
    onMouseEnter: preload,
    onFocus: preload,
  };
};

/**
 * Hook to preload components on viewport intersection
 */
export const usePreloadOnIntersection = (
  importFn: () => Promise<{ default: ComponentType<unknown> }>,
  options: IntersectionObserverInit = {}
) => {
  const [preloaded, setPreloaded] = React.useState(false);
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (preloaded || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          preloadComponent(importFn);
          setPreloaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px', ...options }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [importFn, preloaded, options]);

  return ref;
};
