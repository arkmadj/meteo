/**
 * Conditionally Lazy-Loaded Components
 * Components that load only when visible, hovered, or needed
 */

import {
  createConditionalLazyComponent,
  createHoverLazyComponent,
} from '@/utils/conditionalLazyLoad';

// ============================================================================
// DASHBOARD COMPONENTS - Load on hover (when user shows interest)
// ============================================================================

export const CustomizableDashboard = createHoverLazyComponent(
  () => import('@/components/dashboard/CustomizableDashboard'),
  'Customizable Dashboard'
);

export const DashboardControls = createHoverLazyComponent(
  () => import('@/components/dashboard/DashboardControls'),
  'Dashboard Controls'
);

// WeatherMetricsGrid - component doesn't exist yet
// export const WeatherMetricsGrid = createHoverLazyComponent(
//   () => import('@/components/dashboard/WeatherMetricsGrid'),
//   'Weather Metrics Grid'
// );

// ============================================================================
// FORM COMPONENTS - Load on hover (when user approaches)
// ============================================================================

// UserProfileForm - removed (was in examples directory)
// export const UserProfileForm = createHoverLazyComponent(
//   () => import('@/components/examples/UserProfileForm'),
//   'User Profile Form'
// );

// AccessibleComponentsDemo - removed (was in examples directory)
// export const AccessibleComponentsDemo = createHoverLazyComponent(
//   () => import('@/components/ui/molecules/examples/AccessibleComponentsDemo'),
//   'Accessible Components Demo'
// );

// ============================================================================
// HEAVY COMPONENTS - Load on idle (when browser is not busy)
// ============================================================================

// WeatherDashboard - removed (was in examples directory)
// export const WeatherDashboard = createIdleLazyComponent(
//   () => import('@/components/examples/WeatherDashboard'),
//   'Weather Dashboard'
// );

// SuspenseShowcase - removed (was in examples directory)
// export const SuspenseShowcase = createIdleLazyComponent(
//   () => import('@/components/examples/SuspenseShowcase'),
//   'Suspense Showcase'
// );

// ============================================================================
// TEST COMPONENTS - Load conditionally based on environment and visibility
// ============================================================================

// Test components - these don't exist yet
// export const ThemeTestComponents = createConditionalLazyComponent(
//   () => import('@/components/ThemeTestComponents'),
//   {
//     loadingStrategy: process.env.NODE_ENV === 'development' ? 'visible' : 'manual',
//     intersectionOptions: { threshold: 0.3 },
//   }
// );

// export const AccessibilityTestComponents = createConditionalLazyComponent(
//   () => import('@/components/AccessibilityTestComponents'),
//   {
//     loadingStrategy: process.env.NODE_ENV === 'development' ? 'hover' : 'manual',
//     hoverDelay: 300,
//   }
// );

// export const PerformanceTestComponents = createConditionalLazyComponent(
//   () => import('@/components/PerformanceTestComponents'),
//   {
//     loadingStrategy: 'idle',
//     idleDelay: 3000,
//   }
// );

// ============================================================================
// SPECIALIZED CONDITIONAL COMPONENTS
// ============================================================================

/**
 * Feature-gated component that loads based on feature flags
 */
export const createFeatureGatedComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  featureFlag: string,
  fallbackComponent?: React.ComponentType
) => {
  return createConditionalLazyComponent(importFn, {
    loadingStrategy: 'manual',
    fallback:
      fallbackComponent ||
      (() => (
        <div className="p-4 text-center text-gray-500">
          <p>Feature "{featureFlag}" is not enabled</p>
        </div>
      )),
  });
};

/**
 * Performance-aware component that loads based on connection speed
 */
export const createPerformanceAwareComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) => {
  const getLoadingStrategy = () => {
    // Check connection speed if available
    const connection = (navigator as any).connection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        return 'click'; // Require user interaction on slow connections
      } else if (effectiveType === '3g') {
        return 'hover'; // Load on hover for medium connections
      }
    }
    return 'visible'; // Default to visibility-based loading
  };

  return createConditionalLazyComponent(importFn, {
    loadingStrategy: getLoadingStrategy(),
    intersectionOptions: { threshold: 0.2, rootMargin: '50px' },
    hoverDelay: 250,
  });
};

/**
 * User preference-aware component
 */
export const createPreferenceAwareComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) => {
  const getLoadingStrategy = () => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Check for data saver preference
    const connection = (navigator as any).connection;
    const saveData = connection?.saveData;

    if (saveData || prefersReducedMotion) {
      return 'click'; // Require explicit user action
    }

    return 'visible'; // Default behavior
  };

  return createConditionalLazyComponent(importFn, {
    loadingStrategy: getLoadingStrategy(),
    intersectionOptions: { threshold: 0.1, rootMargin: '100px' },
  });
};

// ============================================================================
// GROUPED EXPORTS FOR CONVENIENCE
// ============================================================================

export const DashboardComponents = {
  CustomizableDashboard,
  DashboardControls,
  // WeatherMetricsGrid, // Component doesn't exist yet
};

export const FormComponents = {
  // UserProfileForm, // removed
  // AccessibleComponentsDemo, // removed
};

export const HeavyComponents = {
  // WeatherDashboard, // removed
  // SuspenseShowcase, // removed
};

export const TestComponents = {
  // ThemeTestComponents, // Component doesn't exist yet
  // AccessibilityTestComponents, // Component doesn't exist yet
  // PerformanceTestComponents, // Component doesn't exist yet
};

export const ConditionalFactories = {
  createFeatureGatedComponent,
  createPerformanceAwareComponent,
  createPreferenceAwareComponent,
};

// Default export with all components
export default {
  ...DashboardComponents,
  ...FormComponents,
  ...HeavyComponents,
  ...TestComponents,
  ...ConditionalFactories,
};
