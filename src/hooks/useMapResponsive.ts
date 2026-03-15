/**
 * useMapResponsive Hook
 * Provides responsive utilities for map components including
 * touch detection, viewport sizing, and orientation handling
 */

import { useState, useEffect, useMemo } from 'react';
import { useBreakpoint, useWindowSize, useIsMobile } from './useBreakpoint';

export interface MapResponsiveConfig {
  /** Current breakpoint */
  breakpoint: 'mobile' | 'tablet' | 'desktop';
  /** Is touch device */
  isTouch: boolean;
  /** Window dimensions */
  windowSize: { width: number; height: number };
  /** Is mobile viewport */
  isMobile: boolean;
  /** Is tablet viewport */
  isTablet: boolean;
  /** Is desktop viewport */
  isDesktop: boolean;
  /** Is landscape orientation */
  isLandscape: boolean;
  /** Is portrait orientation */
  isPortrait: boolean;
  /** Safe area insets (for notched devices) */
  safeAreaInsets: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  /** Recommended control sizes */
  controlSizes: {
    buttonSize: number;
    iconSize: number;
    fontSize: number;
    padding: number;
  };
  /** Recommended map control positions */
  positions: {
    legend: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
    overlay: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
    controls: 'top' | 'bottom';
  };
}

/**
 * Get safe area insets for notched devices
 */
function getSafeAreaInsets() {
  if (typeof window === 'undefined' || !CSS.supports('padding: env(safe-area-inset-top)')) {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const computedStyle = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0', 10),
    right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0', 10),
    bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0', 10),
    left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0', 10),
  };
}

/**
 * Get recommended control sizes based on breakpoint
 */
function getControlSizes(breakpoint: 'mobile' | 'tablet' | 'desktop', isTouch: boolean) {
  if (breakpoint === 'mobile' || isTouch) {
    return {
      buttonSize: 44, // iOS minimum touch target
      iconSize: 20,
      fontSize: 14,
      padding: 12,
    };
  }

  if (breakpoint === 'tablet') {
    return {
      buttonSize: 40,
      iconSize: 18,
      fontSize: 14,
      padding: 10,
    };
  }

  return {
    buttonSize: 36,
    iconSize: 16,
    fontSize: 14,
    padding: 8,
  };
}

/**
 * Get recommended control positions based on breakpoint
 */
function getControlPositions(breakpoint: 'mobile' | 'tablet' | 'desktop'): MapResponsiveConfig['positions'] {
  if (breakpoint === 'mobile') {
    return {
      legend: 'bottomLeft',
      overlay: 'topLeft',
      controls: 'bottom',
    };
  }

  return {
    legend: 'topRight',
    overlay: 'topLeft',
    controls: 'bottom',
  };
}

/**
 * Hook to get responsive configuration for map components
 * 
 * @returns MapResponsiveConfig object with responsive utilities
 * 
 * @example
 * ```tsx
 * function MapComponent() {
 *   const responsive = useMapResponsive();
 *   
 *   return (
 *     <div>
 *       <MapLegend 
 *         position={responsive.positions.legend}
 *         compact={responsive.isMobile}
 *       />
 *       <button style={{ minHeight: responsive.controlSizes.buttonSize }}>
 *         Control
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useMapResponsive(): MapResponsiveConfig {
  const breakpoint = useBreakpoint();
  const windowSize = useWindowSize();
  const isTouch = useIsMobile();
  const [safeAreaInsets, setSafeAreaInsets] = useState(getSafeAreaInsets());
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // Update safe area insets on resize
  useEffect(() => {
    const handleResize = () => {
      setSafeAreaInsets(getSafeAreaInsets());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Track orientation changes
  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  const config = useMemo<MapResponsiveConfig>(() => {
    const isMobile = breakpoint === 'mobile';
    const isTablet = breakpoint === 'tablet';
    const isDesktop = breakpoint === 'desktop';

    return {
      breakpoint,
      isTouch,
      windowSize,
      isMobile,
      isTablet,
      isDesktop,
      isLandscape: orientation === 'landscape',
      isPortrait: orientation === 'portrait',
      safeAreaInsets,
      controlSizes: getControlSizes(breakpoint, isTouch),
      positions: getControlPositions(breakpoint),
    };
  }, [breakpoint, isTouch, windowSize, orientation, safeAreaInsets]);

  return config;
}

/**
 * Hook to get responsive map height based on viewport
 * 
 * @param defaultHeight - Default height in pixels
 * @returns Responsive height string
 * 
 * @example
 * ```tsx
 * function MapComponent() {
 *   const height = useMapHeight(500);
 *   return <div style={{ height }}><Map /></div>;
 * }
 * ```
 */
export function useMapHeight(defaultHeight: number = 500): string {
  const { isMobile, isTablet, windowSize, isLandscape } = useMapResponsive();

  return useMemo(() => {
    if (isMobile) {
      // On mobile, use viewport-based height
      if (isLandscape) {
        return '60vh'; // Smaller in landscape to leave room for controls
      }
      return '50vh';
    }

    if (isTablet) {
      return '400px';
    }

    return `${defaultHeight}px`;
  }, [isMobile, isTablet, isLandscape, defaultHeight]);
}

/**
 * Hook to determine if map controls should be compact
 * 
 * @returns Boolean indicating if controls should be compact
 * 
 * @example
 * ```tsx
 * function MapLegend() {
 *   const compact = useMapCompactMode();
 *   return <Legend compact={compact} />;
 * }
 * ```
 */
export function useMapCompactMode(): boolean {
  const { isMobile, windowSize } = useMapResponsive();
  
  return useMemo(() => {
    // Use compact mode on mobile or small viewports
    return isMobile || windowSize.width < 768;
  }, [isMobile, windowSize.width]);
}

/**
 * Hook to get touch-optimized event handlers
 * 
 * @returns Object with touch event utilities
 * 
 * @example
 * ```tsx
 * function MapButton() {
 *   const touch = useMapTouchHandlers();
 *   return (
 *     <button
 *       onTouchStart={touch.handleTouchStart}
 *       onTouchEnd={touch.handleTouchEnd}
 *     >
 *       Button
 *     </button>
 *   );
 * }
 * ```
 */
export function useMapTouchHandlers() {
  const { isTouch } = useMapResponsive();
  const [isTouching, setIsTouching] = useState(false);

  const handleTouchStart = useMemo(() => {
    if (!isTouch) return undefined;
    
    return () => {
      setIsTouching(true);
    };
  }, [isTouch]);

  const handleTouchEnd = useMemo(() => {
    if (!isTouch) return undefined;
    
    return () => {
      setIsTouching(false);
    };
  }, [isTouch]);

  return {
    isTouch,
    isTouching,
    handleTouchStart,
    handleTouchEnd,
  };
}

/**
 * Hook to get responsive map zoom levels
 * 
 * @param defaultZoom - Default zoom level
 * @returns Responsive zoom level
 * 
 * @example
 * ```tsx
 * function Map() {
 *   const zoom = useMapZoom(12);
 *   return <MapContainer zoom={zoom} />;
 * }
 * ```
 */
export function useMapZoom(defaultZoom: number = 12): number {
  const { isMobile, isTablet } = useMapResponsive();

  return useMemo(() => {
    if (isMobile) {
      // Zoom out slightly on mobile to show more context
      return Math.max(defaultZoom - 1, 3);
    }

    if (isTablet) {
      return defaultZoom;
    }

    return defaultZoom;
  }, [isMobile, isTablet, defaultZoom]);
}

