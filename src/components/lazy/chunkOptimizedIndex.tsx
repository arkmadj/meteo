/**
 * Chunk-optimized lazy-loaded components
 * Groups components into strategic Webpack chunks for optimal performance
 */

import { createChunkOptimizedLazyComponent } from '@/utils/chunkOptimizedLazyLoad';

// ============================================================================
// WEATHER COMPONENTS (Above-fold, high priority)
// ============================================================================

// Core weather display components
export const CurrentWeatherDetails = createChunkOptimizedLazyComponent(
  () => import('@/components/weather/CurrentWeatherDetails'),
  'weather-display',
  'Current Weather Details'
);

export const Forecast = createChunkOptimizedLazyComponent(
  () => import('@/components/weather/Forecast'),
  'weather-forecast',
  'Weather Forecast'
);

export const EnhancedForecast = createChunkOptimizedLazyComponent(
  () => import('@/components/weather/EnhancedForecast'),
  'weather-forecast',
  'Enhanced Forecast'
);

// ============================================================================
// DASHBOARD COMPONENTS (Route-based, medium priority)
// ============================================================================

export const CustomizableDashboard = createChunkOptimizedLazyComponent(
  () => import('@/components/dashboard/CustomizableDashboard'),
  'dashboard-widgets',
  'Customizable Dashboard'
);

export const DashboardControls = createChunkOptimizedLazyComponent(
  () => import('@/components/dashboard/DashboardControls'),
  'dashboard-controls',
  'Dashboard Controls'
);

// ============================================================================
// FORM COMPONENTS (Interaction-based, medium priority)
// ============================================================================

// UserProfileForm - removed (was in examples directory)
// export const UserProfileForm = createChunkOptimizedLazyComponent(
//   () => import('@/components/examples/UserProfileForm'),
//   'form-controls',
//   'User Profile Form'
// );

export const SearchEngine = createChunkOptimizedLazyComponent(
  () => import('@/components/search/SearchEngine'),
  'form-controls',
  'Search Engine'
);

export const LanguageSelector = createChunkOptimizedLazyComponent(
  () => import('@/components/language/LanguageSelector'),
  'form-controls',
  'Language Selector'
);

// ============================================================================
// ACCESSIBILITY COMPONENTS (Feature-based, medium priority)
// ============================================================================

export const AriaLiveDebugPanel = createChunkOptimizedLazyComponent(
  () => import('@/components/utilities/AriaLiveDebugPanel'),
  'accessibility-tools',
  'ARIA Live Debug Panel'
);

// ============================================================================
// CHUNK PRELOADING UTILITIES
// ============================================================================

/**
 * Preload critical chunks for better performance
 */
export const preloadCriticalChunks = () => {
  // This will be called on app startup to preload essential chunks
  if (typeof window !== 'undefined') {
    // Preload weather components (likely to be used)
    import('@/components/weather/CurrentWeatherDetails').catch(() => {});
    import('@/components/weather/Forecast').catch(() => {});

    // Preload form components (interactive elements)
    import('@/components/search/SearchEngine').catch(() => {});
    import('@/components/language/LanguageSelector').catch(() => {});
  }
};

/**
 * Preload route-specific chunks
 */
export const preloadRouteChunks = (route: string) => {
  switch (route) {
    case '/dashboard':
      import('@/components/dashboard/CustomizableDashboard').catch(() => {});
      import('@/components/dashboard/DashboardControls').catch(() => {});
      break;
  }
};

export default {
  // Weather components
  CurrentWeatherDetails,
  Forecast,
  EnhancedForecast,

  // Dashboard components
  CustomizableDashboard,
  DashboardControls,

  // Form components
  SearchEngine,
  LanguageSelector,

  // Accessibility components
  AriaLiveDebugPanel,

  // Utilities
  preloadCriticalChunks,
  preloadRouteChunks,
};
