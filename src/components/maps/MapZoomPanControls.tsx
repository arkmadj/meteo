/**
 * MapZoomPanControls Component
 *
 * Enhanced zoom and pan interaction controls for Leaflet maps with constraints
 * to prevent extreme zooming and improve usability.
 */

import { useEffect, useCallback } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

export interface MapZoomPanConstraints {
  /** Minimum zoom level (default: 3) */
  minZoom?: number;
  /** Maximum zoom level (default: 18) */
  maxZoom?: number;
  /** Maximum bounds for panning (world bounds by default) */
  maxBounds?: L.LatLngBoundsExpression;
  /** Padding around max bounds in pixels (default: 0) */
  maxBoundsViscosity?: number;
  /** Enable smooth zoom animation (default: true) */
  smoothZoom?: boolean;
  /** Zoom animation duration in ms (default: 250) */
  zoomAnimationDuration?: number;
  /** Enable inertia for panning (default: true) */
  inertia?: boolean;
  /** Inertia deceleration in pixels/second² (default: 3000) */
  inertiaDeceleration?: number;
  /** Maximum inertia speed in pixels/second (default: 1500) */
  inertiaMaxSpeed?: number;
  /** Enable zoom on double click (default: true) */
  doubleClickZoom?: boolean;
  /** Enable zoom with scroll wheel (default: true) */
  scrollWheelZoom?: boolean;
  /** Scroll wheel zoom speed (default: 1) */
  wheelDebounceTime?: number;
  /** Enable touch zoom (default: true) */
  touchZoom?: boolean;
  /** Enable box zoom with shift+drag (default: true) */
  boxZoom?: boolean;
  /** Enable keyboard navigation (default: true) */
  keyboard?: boolean;
  /** Keyboard pan distance in pixels (default: 80) */
  keyboardPanDelta?: number;
  /** Prevent zoom beyond max bounds (default: true) */
  bounceAtZoomLimits?: boolean;
}

export interface MapZoomPanControlsProps extends MapZoomPanConstraints {
  /** Callback when zoom level changes */
  onZoomChange?: (zoom: number) => void;
  /** Callback when map is panned */
  onPan?: (center: L.LatLng) => void;
  /** Callback when zoom/pan limits are reached */
  onLimitReached?: (type: 'zoom-min' | 'zoom-max' | 'bounds') => void;
  /** Show visual feedback when limits are reached (default: true) */
  showLimitFeedback?: boolean;
}

/**
 * MapZoomPanControls Component
 * Applies enhanced zoom and pan constraints to a Leaflet map
 */
const MapZoomPanControls: React.FC<MapZoomPanControlsProps> = ({
  minZoom = 3,
  maxZoom = 18,
  maxBounds,
  maxBoundsViscosity = 1.0,
  smoothZoom = true,
  inertia = true,
  inertiaDeceleration = 3000,
  inertiaMaxSpeed = 1500,
  doubleClickZoom = true,
  scrollWheelZoom = true,
  wheelDebounceTime = 40,
  touchZoom = true,
  boxZoom = true,
  keyboard = true,
  keyboardPanDelta = 80,
  bounceAtZoomLimits = true,
  onZoomChange,
  onPan,
  onLimitReached,
  showLimitFeedback = true,
}) => {
  const map = useMap();

  // Apply zoom and pan constraints
  useEffect(() => {
    if (!map) return;

    // Set zoom constraints
    map.setMinZoom(minZoom);
    map.setMaxZoom(maxZoom);

    // Set max bounds if provided
    if (maxBounds) {
      map.setMaxBounds(maxBounds);
      map.options.maxBoundsViscosity = maxBoundsViscosity;
    }

    // Configure zoom animation
    if (smoothZoom) {
      map.options.zoomAnimation = true;
      map.options.zoomAnimationThreshold = 4;
    }

    // Configure inertia
    map.options.inertia = inertia;
    if (inertia) {
      map.options.inertiaDeceleration = inertiaDeceleration;
      map.options.inertiaMaxSpeed = inertiaMaxSpeed;
    }

    // Configure interaction options
    if (doubleClickZoom) {
      map.doubleClickZoom.enable();
    } else {
      map.doubleClickZoom.disable();
    }

    if (scrollWheelZoom) {
      map.scrollWheelZoom.enable();
      map.options.wheelDebounceTime = wheelDebounceTime;
    } else {
      map.scrollWheelZoom.disable();
    }

    if (touchZoom) {
      map.touchZoom.enable();
    } else {
      map.touchZoom.disable();
    }

    if (boxZoom) {
      map.boxZoom.enable();
    } else {
      map.boxZoom.disable();
    }

    if (keyboard) {
      map.keyboard.enable();
      map.options.keyboardPanDelta = keyboardPanDelta;
    } else {
      map.keyboard.disable();
    }

    // Bounce at zoom limits
    map.options.bounceAtZoomLimits = bounceAtZoomLimits;

    // Ensure current zoom is within bounds
    const currentZoom = map.getZoom();
    if (currentZoom < minZoom) {
      map.setZoom(minZoom);
    } else if (currentZoom > maxZoom) {
      map.setZoom(maxZoom);
    }

    // Ensure current center is within bounds
    if (maxBounds) {
      const bounds = Array.isArray(maxBounds) ? L.latLngBounds(maxBounds) : maxBounds;
      const center = map.getCenter();
      if (!bounds.contains(center)) {
        map.panInsideBounds(bounds, { animate: smoothZoom });
      }
    }
  }, [
    map,
    minZoom,
    maxZoom,
    maxBounds,
    maxBoundsViscosity,
    smoothZoom,
    inertia,
    inertiaDeceleration,
    inertiaMaxSpeed,
    doubleClickZoom,
    scrollWheelZoom,
    wheelDebounceTime,
    touchZoom,
    boxZoom,
    keyboard,
    keyboardPanDelta,
    bounceAtZoomLimits,
  ]);

  // Handle zoom limit feedback
  const handleZoomLimit = useCallback(
    (type: 'min' | 'max') => {
      if (showLimitFeedback) {
        // Add visual feedback class
        const container = map.getContainer();
        container.classList.add('map-zoom-limit-reached');
        setTimeout(() => {
          container.classList.remove('map-zoom-limit-reached');
        }, 300);
      }
      onLimitReached?.(type === 'min' ? 'zoom-min' : 'zoom-max');
    },
    [map, showLimitFeedback, onLimitReached]
  );

  // Handle bounds limit feedback
  const handleBoundsLimit = useCallback(() => {
    if (showLimitFeedback) {
      const container = map.getContainer();
      container.classList.add('map-bounds-limit-reached');
      setTimeout(() => {
        container.classList.remove('map-bounds-limit-reached');
      }, 300);
    }
    onLimitReached?.('bounds');
  }, [map, showLimitFeedback, onLimitReached]);

  // Map event handlers
  useMapEvents({
    zoomend: () => {
      const zoom = map.getZoom();
      onZoomChange?.(zoom);

      // Check if zoom limit was reached
      if (zoom <= minZoom) {
        handleZoomLimit('min');
      } else if (zoom >= maxZoom) {
        handleZoomLimit('max');
      }
    },
    moveend: () => {
      const center = map.getCenter();
      onPan?.(center);

      // Check if bounds limit was reached
      if (maxBounds) {
        const bounds = Array.isArray(maxBounds) ? L.latLngBounds(maxBounds) : maxBounds;
        const mapBounds = map.getBounds();

        // Check if map is at the edge of max bounds
        if (
          !bounds.contains(mapBounds.getNorthEast()) ||
          !bounds.contains(mapBounds.getSouthWest())
        ) {
          handleBoundsLimit();
        }
      }
    },
    drag: () => {
      // Enforce bounds during drag
      if (maxBounds && maxBoundsViscosity === 1.0) {
        const bounds = Array.isArray(maxBounds) ? L.latLngBounds(maxBounds) : maxBounds;
        const center = map.getCenter();

        if (!bounds.contains(center)) {
          map.panInsideBounds(bounds, { animate: false });
        }
      }
    },
  });

  // Add CSS for visual feedback
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .map-zoom-limit-reached {
        animation: map-shake 0.3s ease-in-out;
      }

      .map-bounds-limit-reached {
        animation: map-bounce 0.3s ease-in-out;
      }

      @keyframes map-shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }

      @keyframes map-bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(0.98); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

export default MapZoomPanControls;
