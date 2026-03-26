import React, { useEffect } from 'react';
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { preloadRouteChunks } from '@/components/lazy/chunkOptimizedIndex';
import QuickNav from '@/components/navigation/DevToolsNav';
import { RouteSuspense } from '@/components/ui';
import { KeyboardShortcutsProvider } from '@/contexts/KeyboardShortcutsContext';

// Lazy-loaded route components
const HomePage = React.lazy(() => import('@/pages/HomePage'));
const WeatherPage = React.lazy(() => import('@/pages/WeatherPage'));
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage'));
const CompareWeatherPage = React.lazy(() => import('@/pages/CompareWeatherPage'));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage'));
const AboutPage = React.lazy(() => import('@/pages/AboutPage'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));
const MapPage = React.lazy(() => import('@/pages/MapPage'));

// Lazy-loaded test routes (for development)
const TemperatureHeatmapPage = React.lazy(() => import('@/pages/TemperatureHeatmapPage'));
const AirQualityHeatmapPage = React.lazy(() => import('@/pages/AirQualityHeatmapPage'));
const RadarPlaybackPage = React.lazy(() => import('@/pages/RadarPlaybackPage'));

/**
 * Root layout component
 * Note: Providers (ErrorProvider, ThemeProvider, SnackbarProvider, QueryProvider)
 * are now initialized at the root level in main.tsx to prevent context loss
 * in error boundaries like the 404 page.
 *
 * KeyboardShortcutsProvider is added here because it requires Router context
 * for navigation shortcuts.
 */
const RootLayout: React.FC = () => {
  return (
    <KeyboardShortcutsProvider>
      <div className="min-h-screen">
        <Outlet />
        <QuickNav position="bottom-right" />
      </div>
    </KeyboardShortcutsProvider>
  );
};

/**
 * Route change handler for chunk preloading
 */
const RouteChangeHandler: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Preload chunks for the current route
    preloadRouteChunks(location.pathname);

    // Track route visit for behavior analysis (using public method)
    // Note: This would be implemented with a public method in the service
  }, [location.pathname]);

  return null;
};

/**
 * Layout wrapper for pages that need Suspense boundaries
 */
const PageLayout: React.FC<{ routeName: string }> = ({ routeName }) => {
  return (
    <RouteSuspense routeName={routeName}>
      <RouteChangeHandler />
      <Outlet />
    </RouteSuspense>
  );
};

/**
 * Error boundary wrapper for errorElement
 * Note: Providers are now at root level in main.tsx, so this wrapper
 * only needs to handle the error page rendering with proper Suspense boundary.
 */
const ErrorBoundaryWrapper: React.FC = () => {
  return (
    <RouteSuspense routeName="Error Page">
      <NotFoundPage />
    </RouteSuspense>
  );
};

/**
 * Router configuration with lazy-loaded routes
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorBoundaryWrapper />,
    children: [
      {
        index: true,
        element: (
          <RouteSuspense routeName="Home">
            <HomePage />
          </RouteSuspense>
        ),
      },
      {
        path: 'weather',
        element: <PageLayout routeName="Weather" />,
        children: [
          {
            index: true,
            element: <WeatherPage />,
          },
          {
            path: 'dashboard',
            element: (
              <RouteSuspense routeName="Weather Dashboard">
                <DashboardPage />
              </RouteSuspense>
            ),
          },
          {
            path: 'compare',
            element: (
              <RouteSuspense routeName="Compare Weather">
                <CompareWeatherPage />
              </RouteSuspense>
            ),
          },
        ],
      },
      {
        path: 'settings',
        element: (
          <RouteSuspense routeName="Settings">
            <SettingsPage />
          </RouteSuspense>
        ),
      },
      {
        path: 'about',
        element: (
          <RouteSuspense routeName="About">
            <AboutPage />
          </RouteSuspense>
        ),
      },
      {
        path: 'map',
        element: (
          <RouteSuspense routeName="Map">
            <MapPage />
          </RouteSuspense>
        ),
      },

      // Development/Demo routes (only in development)
      ...(import.meta.env.MODE === 'development'
        ? [
            {
              path: 'heatmap',
              element: (
                <RouteSuspense routeName="Temperature Heatmap">
                  <TemperatureHeatmapPage />
                </RouteSuspense>
              ),
            },
            {
              path: 'air-quality',
              element: (
                <RouteSuspense routeName="Air Quality Heatmap">
                  <AirQualityHeatmapPage />
                </RouteSuspense>
              ),
            },
            {
              path: 'radar-playback',
              element: (
                <RouteSuspense routeName="Radar Playback">
                  <RadarPlaybackPage />
                </RouteSuspense>
              ),
            },
          ]
        : []),
      // Catch-all route for 404
      {
        path: '*',
        element: (
          <RouteSuspense routeName="Page Not Found">
            <NotFoundPage />
          </RouteSuspense>
        ),
      },
    ],
  },
]);

/**
 * Main Router component
 */
export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

/**
 * Route preloading utilities for better UX
 */
export const preloadRoutes = {
  weather: () => import('@/pages/WeatherPage'),
  dashboard: () => import('@/pages/DashboardPage'),
  compare: () => import('@/pages/CompareWeatherPage'),
  settings: () => import('@/pages/SettingsPage'),
  about: () => import('@/pages/AboutPage'),
  map: () => import('@/pages/MapPage'),
};

/**
 * Hook for programmatic navigation with preloading
 */
export const useNavigateWithPreload = () => {
  const navigateFunction = useNavigate();

  const navigate = (to: string, options?: { replace?: boolean; state?: unknown }) => {
    // Preload the route before navigating
    const routeName = to.split('/')[1] as keyof typeof preloadRoutes;
    if (preloadRoutes[routeName]) {
      void preloadRoutes[routeName]();
    }

    // Use React Router's navigate
    void navigateFunction(to, options);
  };

  return { navigate };
};

/**
 * Route-based code splitting configuration
 */
export const routeConfig = {
  // Critical routes (loaded immediately)
  critical: ['/', '/weather'],

  // High priority routes (preloaded on user interaction)
  highPriority: ['/weather/dashboard', '/settings'],

  // Medium priority routes (loaded on demand)
  mediumPriority: ['/showcase'],

  // Low priority routes (loaded only when accessed)
  lowPriority: ['/about', '/map', '/demo'],
} as const;

export default AppRouter;
