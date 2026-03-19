/**
 * Lazy Map Loader
 * Lazy loads Leaflet and react-leaflet libraries to reduce initial bundle size
 * Provides instant interactivity once loaded with preloading strategies
 */

import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useTheme } from '../../design-system/theme';
import MapLoadingOverlay from './MapLoadingOverlay';

// Track if map libraries have been preloaded
let isPreloaded = false;
let preloadPromise: Promise<void> | null = null;

/**
 * Preload map libraries without rendering
 * Can be called on user interaction (hover, scroll near map, etc.)
 */
export const preloadMapLibraries = (): Promise<void> => {
  if (isPreloaded) {
    return Promise.resolve();
  }

  if (preloadPromise) {
    return preloadPromise;
  }

  preloadPromise = Promise.all([
    // Preload Leaflet CSS
    new Promise<void>(resolve => {
      if (document.querySelector('link[href*="leaflet.css"]')) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      link.onload = () => resolve();
      link.onerror = () => resolve(); // Resolve anyway to not block
      document.head.appendChild(link);
    }),
    // Preload the component modules
    import('./BaseWeatherMap'),
    import('./LocationSearchMap'),
    import('leaflet'),
    import('react-leaflet'),
  ])
    .then(() => {
      isPreloaded = true;
    })
    .catch(error => {
      console.error('Failed to preload map libraries:', error);
      isPreloaded = true; // Mark as preloaded to avoid retry loops
    });

  return preloadPromise;
};

/**
 * Lazy-loaded BaseWeatherMap component
 */
const LazyBaseWeatherMap = lazy(() =>
  import('./BaseWeatherMap').then(module => ({
    default: module.default,
  }))
);

/**
 * Lazy-loaded LocationSearchMap component
 */
const LazyLocationSearchMap = lazy(() =>
  import('./LocationSearchMap').then(module => ({
    default: module.default,
  }))
);

/**
 * Map Loading Fallback Component
 */
interface MapLoadingFallbackProps {
  height?: string;
  message?: string;
}

const MapLoadingFallback: React.FC<MapLoadingFallbackProps> = ({
  height = '400px',
  message = 'Loading map...',
}) => {
  const { theme } = useTheme();

  return (
    <div
      className={`relative rounded-lg overflow-hidden ${
        theme.isDark ? 'bg-gray-800' : 'bg-gray-100'
      }`}
      style={{ height }}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <MapLoadingOverlay state="loading" message={message} />
    </div>
  );
};

/**
 * Lazy Map Wrapper Props
 */
interface LazyMapWrapperProps {
  /**
   * Preload strategy
   * - 'immediate': Load immediately when component mounts
   * - 'hover': Load when user hovers over the map area
   * - 'visible': Load when map area becomes visible (intersection observer)
   * - 'idle': Load when browser is idle
   * - 'manual': Only load when explicitly triggered
   */
  preloadStrategy?: 'immediate' | 'hover' | 'visible' | 'idle' | 'manual';

  /**
   * Height of the map container
   */
  height?: string;

  /**
   * Custom loading message
   */
  loadingMessage?: string;

  /**
   * Callback when map libraries are loaded
   */
  onLibrariesLoaded?: () => void;

  /**
   * Children to render (typically map component)
   */
  children: React.ReactNode;
}

/**
 * Lazy Map Wrapper Component
 * Handles preloading strategies and lazy loading of map libraries
 */
export const LazyMapWrapper: React.FC<LazyMapWrapperProps> = ({
  preloadStrategy = 'visible',
  height = '400px',
  loadingMessage = 'Loading interactive map...',
  onLibrariesLoaded,
  children,
}) => {
  const [shouldLoad, setShouldLoad] = useState(preloadStrategy === 'immediate');
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Handle immediate preload
  useEffect(() => {
    if (preloadStrategy === 'immediate') {
      preloadMapLibraries().then(() => {
        onLibrariesLoaded?.();
      });
    }
  }, [preloadStrategy, onLibrariesLoaded]);

  // Handle idle preload
  useEffect(() => {
    if (preloadStrategy === 'idle' && 'requestIdleCallback' in window) {
      const idleCallback = window.requestIdleCallback(
        () => {
          preloadMapLibraries().then(() => {
            setShouldLoad(true);
            onLibrariesLoaded?.();
          });
        },
        { timeout: 2000 }
      );

      return () => {
        window.cancelIdleCallback(idleCallback);
      };
    } else if (preloadStrategy === 'idle') {
      // Fallback for browsers without requestIdleCallback
      const timeout = setTimeout(() => {
        preloadMapLibraries().then(() => {
          setShouldLoad(true);
          onLibrariesLoaded?.();
        });
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [preloadStrategy, onLibrariesLoaded]);

  // Handle visible preload (Intersection Observer)
  useEffect(() => {
    if (preloadStrategy === 'visible' && containerRef.current) {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              preloadMapLibraries().then(() => {
                setShouldLoad(true);
                onLibrariesLoaded?.();
              });
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: '50px', // Start loading 50px before visible
          threshold: 0.1,
        }
      );

      observer.observe(containerRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [preloadStrategy, onLibrariesLoaded]);

  // Handle hover preload
  const handleMouseEnter = () => {
    if (preloadStrategy === 'hover' && !isHovered) {
      setIsHovered(true);
      preloadMapLibraries().then(() => {
        setShouldLoad(true);
        onLibrariesLoaded?.();
      });
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onFocus={handleMouseEnter}
      style={{ height }}
    >
      {shouldLoad ? (
        <Suspense fallback={<MapLoadingFallback height={height} message={loadingMessage} />}>
          {children}
        </Suspense>
      ) : (
        <MapLoadingFallback height={height} message={loadingMessage} />
      )}
    </div>
  );
};

/**
 * Lazy BaseWeatherMap with automatic preloading
 */
export interface LazyBaseWeatherMapProps {
  preloadStrategy?: 'immediate' | 'hover' | 'visible' | 'idle' | 'manual';
  onLibrariesLoaded?: () => void;
  [key: string]: unknown; // Pass through all other props
}

export const LazyBaseWeatherMapComponent: React.FC<LazyBaseWeatherMapProps> = ({
  preloadStrategy = 'visible',
  onLibrariesLoaded,
  height = '400px',
  ...mapProps
}) => {
  return (
    <LazyMapWrapper
      preloadStrategy={preloadStrategy}
      height={height}
      onLibrariesLoaded={onLibrariesLoaded}
    >
      <LazyBaseWeatherMap {...mapProps} height={height} />
    </LazyMapWrapper>
  );
};

/**
 * Lazy LocationSearchMap with automatic preloading
 */
export interface LazyLocationSearchMapProps {
  preloadStrategy?: 'immediate' | 'hover' | 'visible' | 'idle' | 'manual';
  onLibrariesLoaded?: () => void;
  [key: string]: unknown; // Pass through all other props
}

export const LazyLocationSearchMapComponent: React.FC<LazyLocationSearchMapProps> = ({
  preloadStrategy = 'visible',
  onLibrariesLoaded,
  height = '600px',
  ...mapProps
}) => {
  return (
    <LazyMapWrapper
      preloadStrategy={preloadStrategy}
      height={height}
      onLibrariesLoaded={onLibrariesLoaded}
    >
      <LazyLocationSearchMap {...mapProps} height={height} />
    </LazyMapWrapper>
  );
};

// Export lazy components as default exports for convenience
export {
  LazyBaseWeatherMapComponent as LazyBaseWeatherMap,
  LazyLocationSearchMapComponent as LazyLocationSearchMap,
};

export default LazyMapWrapper;
