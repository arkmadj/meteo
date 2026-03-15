/**
 * Throttled Map Interactions Component
 * Optimizes map interactions for low-performance devices
 */

import { useEffect, useRef, useCallback } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { PerformanceTier } from '@/utils/devicePerformance';

export interface ThrottledMapInteractionsProps {
  /** Performance tier */
  performanceTier?: PerformanceTier;
  /** Callback when map moves */
  onMove?: (center: L.LatLng, zoom: number, bounds: L.LatLngBounds) => void;
  /** Callback when map zoom changes */
  onZoom?: (zoom: number) => void;
  /** Callback when map is clicked */
  onClick?: (latlng: L.LatLng) => void;
  /** Custom throttle delay in ms */
  throttleDelay?: number;
  /** Enable interaction throttling */
  enableThrottling?: boolean;
}

/**
 * Throttle function
 */
function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return function throttled(...args: Parameters<T>) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= delay) {
      lastCall = now;
      func(...args);
    } else {
      // Schedule for later
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func(...args);
      }, delay - timeSinceLastCall);
    }
  };
}

/**
 * Debounce function
 */
function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

/**
 * Get throttle delay based on performance tier
 */
function getThrottleDelay(tier: PerformanceTier): number {
  switch (tier) {
    case 'high':
      return 100;
    case 'medium':
      return 200;
    case 'low':
      return 300;
    default:
      return 200;
  }
}

/**
 * Throttled Map Interactions Component
 */
const ThrottledMapInteractions: React.FC<ThrottledMapInteractionsProps> = ({
  performanceTier = 'medium',
  onMove,
  onZoom,
  onClick,
  throttleDelay,
  enableThrottling = true,
}) => {
  const map = useMap();
  const effectiveDelay = throttleDelay || getThrottleDelay(performanceTier);

  // Create throttled callbacks
  const throttledOnMove = useRef(
    throttle((center: L.LatLng, zoom: number, bounds: L.LatLngBounds) => {
      onMove?.(center, zoom, bounds);
    }, effectiveDelay)
  );

  const throttledOnZoom = useRef(
    throttle((zoom: number) => {
      onZoom?.(zoom);
    }, effectiveDelay)
  );

  const debouncedOnClick = useRef(
    debounce((latlng: L.LatLng) => {
      onClick?.(latlng);
    }, 100)
  );

  // Update throttle delay when it changes
  useEffect(() => {
    throttledOnMove.current = throttle((center: L.LatLng, zoom: number, bounds: L.LatLngBounds) => {
      onMove?.(center, zoom, bounds);
    }, effectiveDelay);

    throttledOnZoom.current = throttle((zoom: number) => {
      onZoom?.(zoom);
    }, effectiveDelay);
  }, [effectiveDelay, onMove, onZoom]);

  // Handle map events
  useMapEvents({
    moveend: useCallback(() => {
      if (!enableThrottling) {
        const center = map.getCenter();
        const zoom = map.getZoom();
        const bounds = map.getBounds();
        onMove?.(center, zoom, bounds);
        return;
      }

      const center = map.getCenter();
      const zoom = map.getZoom();
      const bounds = map.getBounds();
      throttledOnMove.current(center, zoom, bounds);
    }, [map, onMove, enableThrottling]),

    zoomend: useCallback(() => {
      if (!enableThrottling) {
        const zoom = map.getZoom();
        onZoom?.(zoom);
        return;
      }

      const zoom = map.getZoom();
      throttledOnZoom.current(zoom);
    }, [map, onZoom, enableThrottling]),

    click: useCallback(
      (e: L.LeafletMouseEvent) => {
        if (!enableThrottling) {
          onClick?.(e.latlng);
          return;
        }

        debouncedOnClick.current(e.latlng);
      },
      [onClick, enableThrottling]
    ),
  });

  // Apply performance optimizations to map
  useEffect(() => {
    if (!map) return;

    // Disable animations for low-end devices
    if (performanceTier === 'low') {
      map.options.zoomAnimation = false;
      map.options.fadeAnimation = false;
      map.options.markerZoomAnimation = false;
      map.options.inertia = false;
    } else {
      map.options.zoomAnimation = true;
      map.options.fadeAnimation = true;
      map.options.markerZoomAnimation = true;
      map.options.inertia = true;
    }

    // Adjust wheel debounce time
    if (performanceTier === 'low') {
      map.options.wheelDebounceTime = 100;
    } else if (performanceTier === 'medium') {
      map.options.wheelDebounceTime = 60;
    } else {
      map.options.wheelDebounceTime = 40;
    }

    // Adjust inertia deceleration
    if (performanceTier === 'low') {
      map.options.inertiaDeceleration = 1500;
    } else if (performanceTier === 'medium') {
      map.options.inertiaDeceleration = 2500;
    } else {
      map.options.inertiaDeceleration = 3000;
    }
  }, [map, performanceTier]);

  return null;
};

export default ThrottledMapInteractions;

/**
 * Hook for throttled map interactions
 */
export function useThrottledMapInteractions(
  performanceTier: PerformanceTier = 'medium',
  throttleDelay?: number
) {
  const map = useMap();
  const effectiveDelay = throttleDelay || getThrottleDelay(performanceTier);

  const throttledSetView = useCallback(
    throttle((center: L.LatLngExpression, zoom?: number) => {
      map.setView(center, zoom);
    }, effectiveDelay),
    [map, effectiveDelay]
  );

  const throttledFlyTo = useCallback(
    throttle((latlng: L.LatLngExpression, zoom?: number) => {
      if (performanceTier === 'low') {
        // Use instant setView for low-end devices
        map.setView(latlng, zoom);
      } else {
        map.flyTo(latlng, zoom);
      }
    }, effectiveDelay),
    [map, effectiveDelay, performanceTier]
  );

  const throttledPanTo = useCallback(
    throttle((latlng: L.LatLngExpression) => {
      if (performanceTier === 'low') {
        map.setView(latlng, map.getZoom());
      } else {
        map.panTo(latlng);
      }
    }, effectiveDelay),
    [map, effectiveDelay, performanceTier]
  );

  const throttledSetZoom = useCallback(
    throttle((zoom: number) => {
      map.setZoom(zoom);
    }, effectiveDelay),
    [map, effectiveDelay]
  );

  return {
    setView: throttledSetView,
    flyTo: throttledFlyTo,
    panTo: throttledPanTo,
    setZoom: throttledSetZoom,
  };
}

/**
 * Hook for performance-aware map updates
 */
export function usePerformanceAwareMapUpdates(performanceTier: PerformanceTier = 'medium') {
  const shouldAnimate = performanceTier !== 'low';
  const updateDelay = getThrottleDelay(performanceTier);

  return {
    shouldAnimate,
    updateDelay,
    shouldUseCanvas: performanceTier === 'low',
    shouldCluster: performanceTier !== 'high',
    maxMarkers: performanceTier === 'high' ? 100 : performanceTier === 'medium' ? 50 : 25,
  };
}

