import { Loading } from '@/components/ui';
import { useUserPreferencesContext } from '@/contexts/UserPreferencesContext';
import type { ComponentType } from 'react';
import React, { forwardRef, Suspense, useMemo } from 'react';

/**
 * Chunk-optimized lazy loading utilities
 * Groups related components into strategic Webpack chunks for optimal performance
 */

/**
 * Chunk loading strategies based on UI sections
 */
export type ChunkLoadingStrategy =
  | 'critical' // Load immediately (core app functionality)
  | 'above-fold' // Load on app startup (visible content)
  | 'below-fold' // Load when scrolled into view
  | 'interaction' // Load on user interaction (hover/click)
  | 'route-based' // Load when route is accessed
  | 'feature-based' // Load when feature is used
  | 'development'; // Load only in development mode

/**
 * Chunk configuration for different UI sections
 */
interface ChunkConfig {
  strategy: ChunkLoadingStrategy;
  priority: 'high' | 'medium' | 'low';
  preload?: boolean;
  chunkName: string;
  dependencies?: string[];
}

/**
 * UI section chunk configurations
 */
export const CHUNK_CONFIGS: Record<string, ChunkConfig> = {
  // Core app chunks (critical)
  'app-core': {
    strategy: 'critical',
    priority: 'high',
    preload: true,
    chunkName: 'app-core',
    dependencies: ['react-core', 'router-core'],
  },

  'layout-core': {
    strategy: 'critical',
    priority: 'high',
    preload: true,
    chunkName: 'layout-components',
    dependencies: ['ui-atoms'],
  },

  'navigation-core': {
    strategy: 'critical',
    priority: 'high',
    preload: true,
    chunkName: 'navigation-components',
    dependencies: ['router-core'],
  },

  // Weather functionality (above-fold)
  'weather-display': {
    strategy: 'above-fold',
    priority: 'high',
    preload: true,
    chunkName: 'weather-components',
    dependencies: ['ui-atoms', 'api-hooks'],
  },

  'weather-forecast': {
    strategy: 'above-fold',
    priority: 'medium',
    preload: true,
    chunkName: 'weather-components',
    dependencies: ['weather-display'],
  },

  // Dashboard (route-based)
  'dashboard-widgets': {
    strategy: 'route-based',
    priority: 'medium',
    preload: false,
    chunkName: 'dashboard-components',
    dependencies: ['charts-vendor', 'ui-molecules'],
  },

  'dashboard-controls': {
    strategy: 'route-based',
    priority: 'medium',
    preload: false,
    chunkName: 'dashboard-components',
    dependencies: ['form-components'],
  },

  // Showcase components (route-based, low priority)
  'showcase-weather': {
    strategy: 'route-based',
    priority: 'low',
    preload: false,
    chunkName: 'showcase-components',
    dependencies: ['weather-components'],
  },

  'showcase-ui': {
    strategy: 'route-based',
    priority: 'low',
    preload: false,
    chunkName: 'showcase-components',
    dependencies: ['ui-components'],
  },

  // Demo components (development only)
  'demo-components': {
    strategy: 'development',
    priority: 'low',
    preload: false,
    chunkName: 'demo-components',
    dependencies: [],
  },

  // Accessibility features (feature-based)
  'accessibility-tools': {
    strategy: 'feature-based',
    priority: 'medium',
    preload: false,
    chunkName: 'accessibility-components',
    dependencies: ['ui-components'],
  },

  // Performance monitoring (feature-based)
  'performance-tools': {
    strategy: 'feature-based',
    priority: 'low',
    preload: false,
    chunkName: 'performance-utils',
    dependencies: [],
  },

  // Form components (interaction-based)
  'form-controls': {
    strategy: 'interaction',
    priority: 'medium',
    preload: false,
    chunkName: 'form-components',
    dependencies: ['ui-atoms', 'validation-utils'],
  },

  // Chart components (below-fold)
  'data-visualization': {
    strategy: 'below-fold',
    priority: 'medium',
    preload: false,
    chunkName: 'chart-components',
    dependencies: ['charts-vendor'],
  },
};

/**
 * Enhanced lazy component factory with chunk optimization
 */
export function createChunkOptimizedLazyComponent<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  chunkSection: keyof typeof CHUNK_CONFIGS,
  componentName?: string
) {
  const config = CHUNK_CONFIGS[chunkSection];

  if (!config) {
    console.warn(`Unknown chunk section: ${chunkSection}`);
    return createBasicLazyComponent(importFn, componentName);
  }

  // Skip development-only components in production
  if (config.strategy === 'development' && process.env.NODE_ENV === 'production') {
    return () => null;
  }

  const LazyComponent = React.lazy(importFn);

  const ChunkOptimizedWrapper = forwardRef<unknown, unknown>((props, ref) => {
    const { preferences, getLoadingStrategy } = useUserPreferencesContext();

    // Adapt loading strategy based on user preferences
    const _adaptedStrategy = useMemo(() => {
      const userStrategy = getLoadingStrategy();

      // Override strategy based on user preferences
      if (preferences.saveData && config.strategy === 'above-fold') {
        return 'interaction';
      }

      if (preferences.prefersReducedMotion && config.strategy === 'below-fold') {
        return 'interaction';
      }

      // Respect user's preferred loading strategy for non-critical chunks
      if (config.strategy !== 'critical' && config.strategy !== 'above-fold') {
        if (userStrategy === 'click') return 'interaction';
        if (userStrategy === 'hover') return 'interaction';
      }

      return config.strategy;
    }, [preferences.saveData, preferences.prefersReducedMotion, getLoadingStrategy]);

    // Determine loading component based on chunk priority
    const LoadingComponent = useMemo(() => {
      switch (config.priority) {
        case 'high':
          return () => <Loading size="lg" text={`Loading ${componentName || 'component'}...`} />;
        case 'medium':
          return () => <Loading size="md" text="Loading..." />;
        case 'low':
          return () => <Loading size="sm" />;
        default:
          return Loading;
      }
    }, [config.priority, componentName]);

    return (
      <Suspense fallback={<LoadingComponent />}>
        <LazyComponent {...props} ref={ref} />
      </Suspense>
    );
  });

  ChunkOptimizedWrapper.displayName = `ChunkOptimized(${componentName || 'Component'})`;

  // Add chunk metadata for debugging
  (ChunkOptimizedWrapper as unknown).__chunkConfig = config;
  (ChunkOptimizedWrapper as unknown).__chunkSection = chunkSection;

  return ChunkOptimizedWrapper;
}

/**
 * Basic lazy component factory (fallback)
 */
function createBasicLazyComponent<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  componentName?: string
) {
  const LazyComponent = React.lazy(importFn);

  const BasicWrapper = forwardRef<unknown, unknown>((props, ref) => (
    <Suspense fallback={<Loading text={`Loading ${componentName || 'component'}...`} />}>
      <LazyComponent {...props} ref={ref} />
    </Suspense>
  ));

  BasicWrapper.displayName = `Basic(${componentName || 'Component'})`;
  return BasicWrapper;
}

/**
 * Preload chunks based on strategy and user preferences
 */
export function usePreloadChunks(sections: (keyof typeof CHUNK_CONFIGS)[]) {
  const { preferences } = useUserPreferencesContext();

  sections.forEach(section => {
    const config = CHUNK_CONFIGS[section];

    if (!config || !config.preload) return;

    // Skip preloading if user has save-data preference
    if (preferences.saveData && config.priority !== 'high') return;

    // Skip development chunks in production
    if (config.strategy === 'development' && process.env.NODE_ENV === 'production') return;

    // Preload dependencies first
    if (config.dependencies) {
      config.dependencies.forEach(dep => {
        // This would trigger Webpack to preload the chunk
        import(/* @vite-ignore */ /* webpackChunkName: "[request]" */ `@/${dep}`).catch(() => {
          // Silently fail - chunk might not exist
        });
      });
    }
  });
}

/**
 * Chunk performance monitoring
 */
export function getChunkMetrics() {
  const chunks = Object.entries(CHUNK_CONFIGS).map(([section, config]) => ({
    section,
    strategy: config.strategy,
    priority: config.priority,
    chunkName: config.chunkName,
    preload: config.preload,
    dependencies: config.dependencies || [],
  }));

  return {
    totalChunks: chunks.length,
    criticalChunks: chunks.filter(c => c.strategy === 'critical').length,
    preloadChunks: chunks.filter(c => c.preload).length,
    lazyChunks: chunks.filter(c => !c.preload).length,
    chunks,
  };
}

/**
 * Hook for chunk-aware component loading
 */
export function useChunkOptimizedLoading() {
  const { preferences, getLoadingStrategy } = useUserPreferencesContext();

  const shouldPreloadChunk = (section: keyof typeof CHUNK_CONFIGS) => {
    const config = CHUNK_CONFIGS[section];
    if (!config) return false;

    // Don't preload if user has save-data preference
    if (preferences.saveData && config.priority !== 'high') return false;

    // Don't preload development chunks in production
    if (config.strategy === 'development' && process.env.NODE_ENV === 'production') return false;

    return config.preload;
  };

  const getOptimalLoadingStrategy = (section: keyof typeof CHUNK_CONFIGS) => {
    const config = CHUNK_CONFIGS[section];
    if (!config) return 'interaction';

    const userStrategy = getLoadingStrategy();

    // Override for save-data users
    if (preferences.saveData && config.strategy === 'above-fold') {
      return 'interaction';
    }

    // Override for reduced-motion users
    if (preferences.prefersReducedMotion && config.strategy === 'below-fold') {
      return 'interaction';
    }

    // Respect user preferences for non-critical chunks
    if (config.strategy !== 'critical' && config.strategy !== 'above-fold') {
      if (userStrategy === 'click') return 'interaction';
      if (userStrategy === 'hover') return 'interaction';
    }

    return config.strategy;
  };

  return {
    shouldPreloadChunk,
    getOptimalLoadingStrategy,
    chunkMetrics: getChunkMetrics(),
  };
}

export default {
  createChunkOptimizedLazyComponent,
  usePreloadChunks,
  getChunkMetrics,
  useChunkOptimizedLoading,
  CHUNK_CONFIGS,
};
