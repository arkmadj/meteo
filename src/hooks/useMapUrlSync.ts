/**
 * Hook for synchronizing map state with URL query parameters
 * Allows users to share and revisit exact map views
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type L from 'leaflet';

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapViewState {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  bounds?: MapBounds;
}

export interface UseMapUrlSyncOptions {
  /**
   * Whether to sync URL on map changes
   * @default true
   */
  enabled?: boolean;

  /**
   * Debounce delay for URL updates (ms)
   * @default 500
   */
  debounceMs?: number;

  /**
   * Whether to replace history instead of pushing
   * @default true
   */
  replaceHistory?: boolean;

  /**
   * Callback when URL state is loaded
   */
  onUrlStateLoad?: (state: MapViewState) => void;

  /**
   * Callback when URL state is updated
   */
  onUrlStateUpdate?: (state: MapViewState) => void;

  /**
   * Custom parameter names
   */
  paramNames?: {
    lat?: string;
    lng?: string;
    zoom?: string;
    bounds?: string;
  };

  /**
   * Precision for coordinates (decimal places)
   * @default 4
   */
  precision?: number;
}

export interface UseMapUrlSyncReturn {
  /**
   * Current map view state from URL
   */
  viewState: MapViewState | null;

  /**
   * Update URL with new map state
   */
  updateUrl: (state: MapViewState) => void;

  /**
   * Sync map instance with URL
   */
  syncMapWithUrl: (map: L.Map) => void;

  /**
   * Get shareable URL for current map view
   */
  getShareableUrl: () => string;

  /**
   * Clear map parameters from URL
   */
  clearMapParams: () => void;

  /**
   * Check if URL has map parameters
   */
  hasMapParams: boolean;
}

const DEFAULT_PARAM_NAMES = {
  lat: 'lat',
  lng: 'lng',
  zoom: 'zoom',
  bounds: 'bounds',
};

/**
 * Parse map view state from URL search params
 */
function parseMapStateFromUrl(
  searchParams: URLSearchParams,
  paramNames: typeof DEFAULT_PARAM_NAMES,
  precision: number
): MapViewState | null {
  const lat = searchParams.get(paramNames.lat);
  const lng = searchParams.get(paramNames.lng);
  const zoom = searchParams.get(paramNames.zoom);
  const boundsStr = searchParams.get(paramNames.bounds);

  if (!lat || !lng) {
    return null;
  }

  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  const parsedZoom = zoom ? parseInt(zoom, 10) : 10;

  if (isNaN(parsedLat) || isNaN(parsedLng) || isNaN(parsedZoom)) {
    return null;
  }

  const state: MapViewState = {
    center: {
      lat: parseFloat(parsedLat.toFixed(precision)),
      lng: parseFloat(parsedLng.toFixed(precision)),
    },
    zoom: parsedZoom,
  };

  // Parse bounds if available
  if (boundsStr) {
    try {
      const [north, south, east, west] = boundsStr.split(',').map(parseFloat);
      if (!isNaN(north) && !isNaN(south) && !isNaN(east) && !isNaN(west)) {
        state.bounds = { north, south, east, west };
      }
    } catch {
      // Invalid bounds format, ignore
    }
  }

  return state;
}

/**
 * Encode map view state to URL search params
 */
function encodeMapStateToUrl(
  state: MapViewState,
  paramNames: typeof DEFAULT_PARAM_NAMES,
  precision: number
): Record<string, string> {
  const params: Record<string, string> = {
    [paramNames.lat]: state.center.lat.toFixed(precision),
    [paramNames.lng]: state.center.lng.toFixed(precision),
    [paramNames.zoom]: state.zoom.toString(),
  };

  if (state.bounds) {
    const { north, south, east, west } = state.bounds;
    params[paramNames.bounds] = [
      north.toFixed(precision),
      south.toFixed(precision),
      east.toFixed(precision),
      west.toFixed(precision),
    ].join(',');
  }

  return params;
}

/**
 * Hook for synchronizing map state with URL query parameters
 */
export const useMapUrlSync = (options: UseMapUrlSyncOptions = {}): UseMapUrlSyncReturn => {
  const {
    enabled = true,
    debounceMs = 500,
    replaceHistory = true,
    onUrlStateLoad,
    onUrlStateUpdate,
    paramNames: customParamNames,
    precision = 4,
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();
  const [viewState, setViewState] = useState<MapViewState | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);

  const paramNames = { ...DEFAULT_PARAM_NAMES, ...customParamNames };

  // Check if URL has map parameters
  const hasMapParams =
    searchParams.has(paramNames.lat) &&
    searchParams.has(paramNames.lng) &&
    searchParams.has(paramNames.zoom);

  /**
   * Load initial state from URL
   */
  useEffect(() => {
    if (!enabled || !isInitialLoadRef.current) return;

    const state = parseMapStateFromUrl(searchParams, paramNames, precision);
    if (state) {
      setViewState(state);
      onUrlStateLoad?.(state);
    }

    isInitialLoadRef.current = false;
  }, [enabled, searchParams, paramNames, precision, onUrlStateLoad]);

  /**
   * Update URL with new map state
   */
  const updateUrl = useCallback(
    (state: MapViewState) => {
      if (!enabled) return;

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce URL updates
      debounceTimerRef.current = setTimeout(() => {
        const newParams = new URLSearchParams(searchParams);
        const encodedState = encodeMapStateToUrl(state, paramNames, precision);

        // Update map parameters
        Object.entries(encodedState).forEach(([key, value]) => {
          newParams.set(key, value);
        });

        setSearchParams(newParams, { replace: replaceHistory });
        setViewState(state);
        onUrlStateUpdate?.(state);
      }, debounceMs);
    },
    [
      enabled,
      debounceMs,
      replaceHistory,
      searchParams,
      setSearchParams,
      paramNames,
      precision,
      onUrlStateUpdate,
    ]
  );

  /**
   * Sync map instance with URL state
   */
  const syncMapWithUrl = useCallback(
    (map: L.Map) => {
      if (!enabled || !viewState) return;

      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();

      // Only update if state is different
      const isDifferent =
        Math.abs(currentCenter.lat - viewState.center.lat) > 0.0001 ||
        Math.abs(currentCenter.lng - viewState.center.lng) > 0.0001 ||
        currentZoom !== viewState.zoom;

      if (isDifferent) {
        map.setView([viewState.center.lat, viewState.center.lng], viewState.zoom, {
          animate: true,
          duration: 0.5,
        });
      }
    },
    [enabled, viewState]
  );

  /**
   * Get shareable URL for current map view
   */
  const getShareableUrl = useCallback((): string => {
    if (!viewState) {
      return window.location.href;
    }

    const url = new URL(window.location.href);
    const encodedState = encodeMapStateToUrl(viewState, paramNames, precision);

    Object.entries(encodedState).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    return url.toString();
  }, [viewState, paramNames, precision]);

  /**
   * Clear map parameters from URL
   */
  const clearMapParams = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(paramNames.lat);
    newParams.delete(paramNames.lng);
    newParams.delete(paramNames.zoom);
    newParams.delete(paramNames.bounds);

    setSearchParams(newParams, { replace: true });
    setViewState(null);
  }, [searchParams, setSearchParams, paramNames]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    viewState,
    updateUrl,
    syncMapWithUrl,
    getShareableUrl,
    clearMapParams,
    hasMapParams,
  };
};
