/**
 * Centralized lazy-loaded components
 * This file contains all lazy-loaded components organized by category
 */

import { LoadingWithSkeleton } from '@/components/ui';
import { createLazyComponent, createShowcaseLazyComponent } from '@/utils/lazyLoad';

// ============================================================================
// DASHBOARD COMPONENTS (Heavy Interactive Components)
// ============================================================================

export const CustomizableDashboard = createLazyComponent(
  () => import('@/components/dashboard/CustomizableDashboard'),
  {
    fallback: () => (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    ),
    timeout: 12000,
  }
);

export const DashboardControls = createLazyComponent(
  () => import('@/components/dashboard/DashboardControls'),
  {
    fallback: () => (
      <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-300 h-6 w-6"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    ),
  }
);

export const WidgetSidePanel = createLazyComponent(
  () => import('@/components/dashboard/WidgetSidePanel'),
  {
    fallback: () => (
      <div className="w-80 h-full bg-white border-l border-gray-200 animate-pulse">
        <div className="p-4 space-y-4">
          <div className="h-6 bg-gray-300 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            <div className="h-4 bg-gray-300 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    ),
  }
);

// ============================================================================
// LARGE RARELY USED COMPONENTS
// ============================================================================

export const WeatherDashboardWithCards = createLazyComponent(
  () => import('@/components/weather/WeatherDashboardWithCards'),
  {
    fallback: () => (
      <LoadingWithSkeleton
        message="Loading Weather Dashboard..."
        showSkeleton={true}
        variant="weather"
      />
    ),
    timeout: 15000,
  }
);

export const AppWithQuery = createLazyComponent(() => import('@/components/app/AppWithQuery'), {
  fallback: () => (
    <LoadingWithSkeleton message="Loading Application..." showSkeleton={true} variant="weather" />
  ),
  timeout: 20000,
});

// ============================================================================
// EXAMPLES AND FORMS
// ============================================================================

// WeatherDashboard - removed (was in examples directory)
// export const WeatherDashboard = createRouteLazyComponent(
//   () => import('@/components/examples/WeatherDashboard'),
//   'Weather Dashboard'
// );

// UserProfileForm - removed (was in examples directory)
// export const UserProfileForm = createLazyComponent(
//   () => import('@/components/examples/UserProfileForm'),
//   {
//     fallback: () => <WeatherCardSkeleton variant="detailed" />,
//   }
// );

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

export const AriaLiveDebugPanel = createShowcaseLazyComponent(
  () => import('@/components/utilities/AriaLiveDebugPanel'),
  'Aria Live Debug Panel'
);

export const GlobalEventHandler = createLazyComponent(
  () => import('@/components/utilities/GlobalEventHandler')
);

// ============================================================================
// EXPORT GROUPS FOR CONVENIENCE
// ============================================================================

export const DashboardComponents = {
  CustomizableDashboard,
  DashboardControls,
  WidgetSidePanel,
};

export const HeavyComponents = {
  WeatherDashboardWithCards,
  AppWithQuery,
  // WeatherDashboard, // removed
  // UserProfileForm, // removed
};
