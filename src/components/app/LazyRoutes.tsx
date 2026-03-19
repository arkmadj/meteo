import type { ReactNode } from 'react';
import React, { Component, Suspense } from 'react';

import { Loading } from '@/components/ui';
import { createRouteLazyComponent } from '@/utils/lazyLoad';

/**
 * Route-based lazy loading components
 * This file defines lazy-loaded routes for better code splitting
 */

/**
 * Simple Error Boundary for lazy routes
 */
interface RouteErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
}

class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): RouteErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ============================================================================
// MAIN APPLICATION ROUTES
// ============================================================================

// Main App component (for route-based loading)
export const MainApp = createRouteLazyComponent(
  () => import('@/components/app/App'),
  'Weather App'
);

// Alternative App with Query (for testing/development)
export const AppWithQuery = createRouteLazyComponent(
  () => import('@/components/app/AppWithQuery'),
  'App with Query'
);

// ============================================================================
// DASHBOARD ROUTES
// ============================================================================

// Weather Dashboard (using DashboardPage)
export const WeatherDashboard = createRouteLazyComponent(
  () => import('@/pages/DashboardPage'),
  'Weather Dashboard'
);

// Weather Dashboard with Cards (heavy component)
export const WeatherDashboardWithCards = createRouteLazyComponent(
  () => import('@/components/weather/WeatherDashboardWithCards'),
  'Weather Dashboard with Cards'
);

// Showcase Route (using AboutPage as showcase)
export const ShowcaseRoute = createRouteLazyComponent(
  () => import('@/pages/AboutPage'),
  'Showcase'
);

// ============================================================================
// ROUTE WRAPPER COMPONENTS
// ============================================================================

/**
 * Wrapper component for lazy routes with enhanced loading states
 */
export const LazyRouteWrapper: React.FC<{
  children: React.ReactNode;
  routeName?: string;
  minHeight?: string;
}> = ({ children, routeName = 'Page', minHeight = '400px' }) => (
  <Suspense
    fallback={
      <div className="flex items-center justify-center p-8" style={{ minHeight }}>
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-gray-600">Loading {routeName}...</p>
        </div>
      </div>
    }
  >
    <RouteErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center p-8" style={{ minHeight }}>
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
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
          <p className="text-gray-600 mb-6">An error occurred while loading this page.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Reload Page
          </button>
        </div>
      }
    >
      {children}
    </RouteErrorBoundary>
  </Suspense>
);

/**
 * Higher-order component for creating lazy routes
 */
export const withLazyRoute = <P extends object>(
  Component: React.ComponentType<P>,
  routeName: string,
  minHeight = '400px'
) => {
  const LazyRoute = React.forwardRef<unknown, P>((props, ref) => (
    <LazyRouteWrapper routeName={routeName} minHeight={minHeight}>
      <Component {...props} ref={ref} />
    </LazyRouteWrapper>
  ));

  LazyRoute.displayName = `LazyRoute(${Component.displayName || Component.name || 'Component'})`;

  return LazyRoute;
};

// ============================================================================
// CONDITIONAL LAZY LOADING
// ============================================================================

/**
 * Conditionally lazy load components based on environment or feature flags
 */
export const ConditionalLazyComponent: React.FC<{
  condition: boolean;
  lazyComponent: React.LazyExoticComponent<React.ComponentType<Record<string, unknown>>>;
  fallbackComponent: React.ComponentType<Record<string, unknown>>;
  props?: Record<string, unknown>;
}> = ({
  condition,
  lazyComponent: LazyComponent,
  fallbackComponent: FallbackComponent,
  props = {},
}) => {
  if (condition) {
    return (
      <Suspense fallback={<Loading />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  }

  return <FallbackComponent {...props} />;
};

// ============================================================================
// PRELOADING UTILITIES
// ============================================================================

/**
 * Preload route components for better UX
 */
export const preloadRoutes = {};

/**
 * Hook to preload routes on user interaction
 */
export const useRoutePreloader = () => {
  const preloadRoute = React.useCallback((routeName: keyof typeof preloadRoutes) => {
    if (preloadRoutes[routeName]) {
      preloadRoutes[routeName]().catch(() => {
        // Silently fail preloading
      });
    }
  }, []);

  return { preloadRoute };
};

// ============================================================================
// ROUTE CONFIGURATION
// ============================================================================

/**
 * Route configuration for lazy loading
 */
export const lazyRouteConfig = {
  main: {
    component: MainApp,
    preload: false,
    priority: 'high' as const,
  },
  dashboard: {
    component: WeatherDashboard,
    preload: true,
    priority: 'medium' as const,
  },
  showcase: {
    component: ShowcaseRoute,
    preload: false,
    priority: 'low' as const,
  },
} as const;

export type LazyRouteKey = keyof typeof lazyRouteConfig;

// Default export for compatibility
export default {
  MainApp,
  AppWithQuery,
  WeatherDashboard,
  WeatherDashboardWithCards,
  ShowcaseRoute,
  LazyRouteWrapper,
  lazyRouteConfig,
  preloadRoutes,
};
