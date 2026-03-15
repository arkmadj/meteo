/**
 * Utility functions for encoding/decoding map state to/from URL parameters
 */

export interface MapLocation {
  lat: number;
  lng: number;
  name?: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapUrlState {
  center?: MapLocation;
  zoom?: number;
  bounds?: MapBounds;
  layer?: string;
}

/**
 * Encode map bounds to compact string format
 * Format: "north,south,east,west"
 */
export function encodeBounds(bounds: MapBounds, precision: number = 4): string {
  return [
    bounds.north.toFixed(precision),
    bounds.south.toFixed(precision),
    bounds.east.toFixed(precision),
    bounds.west.toFixed(precision),
  ].join(',');
}

/**
 * Decode bounds from string format
 */
export function decodeBounds(boundsStr: string): MapBounds | null {
  try {
    const parts = boundsStr.split(',').map(parseFloat);
    if (parts.length !== 4 || parts.some(isNaN)) {
      return null;
    }

    const [north, south, east, west] = parts;
    return { north, south, east, west };
  } catch {
    return null;
  }
}

/**
 * Encode map location to URL parameters
 */
export function encodeLocation(location: MapLocation, precision: number = 4): Record<string, string> {
  const params: Record<string, string> = {
    lat: location.lat.toFixed(precision),
    lng: location.lng.toFixed(precision),
  };

  if (location.name) {
    params.name = encodeURIComponent(location.name);
  }

  return params;
}

/**
 * Decode location from URL parameters
 */
export function decodeLocation(params: URLSearchParams): MapLocation | null {
  const lat = params.get('lat');
  const lng = params.get('lng');

  if (!lat || !lng) {
    return null;
  }

  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);

  if (isNaN(parsedLat) || isNaN(parsedLng)) {
    return null;
  }

  const location: MapLocation = {
    lat: parsedLat,
    lng: parsedLng,
  };

  const name = params.get('name');
  if (name) {
    location.name = decodeURIComponent(name);
  }

  return location;
}

/**
 * Validate latitude value
 */
export function isValidLatitude(lat: number): boolean {
  return !isNaN(lat) && lat >= -90 && lat <= 90;
}

/**
 * Validate longitude value
 */
export function isValidLongitude(lng: number): boolean {
  return !isNaN(lng) && lng >= -180 && lng <= 180;
}

/**
 * Validate zoom level
 */
export function isValidZoom(zoom: number): boolean {
  return !isNaN(zoom) && zoom >= 0 && zoom <= 20;
}

/**
 * Validate map bounds
 */
export function isValidBounds(bounds: MapBounds): boolean {
  return (
    isValidLatitude(bounds.north) &&
    isValidLatitude(bounds.south) &&
    isValidLongitude(bounds.east) &&
    isValidLongitude(bounds.west) &&
    bounds.north > bounds.south
  );
}

/**
 * Create shareable URL with map state
 */
export function createShareableUrl(
  baseUrl: string,
  state: MapUrlState,
  precision: number = 4
): string {
  const url = new URL(baseUrl);

  if (state.center) {
    url.searchParams.set('lat', state.center.lat.toFixed(precision));
    url.searchParams.set('lng', state.center.lng.toFixed(precision));
    if (state.center.name) {
      url.searchParams.set('name', encodeURIComponent(state.center.name));
    }
  }

  if (state.zoom !== undefined) {
    url.searchParams.set('zoom', state.zoom.toString());
  }

  if (state.bounds) {
    url.searchParams.set('bounds', encodeBounds(state.bounds, precision));
  }

  if (state.layer) {
    url.searchParams.set('layer', state.layer);
  }

  return url.toString();
}

/**
 * Parse map state from URL
 */
export function parseMapStateFromUrl(url: string | URL): MapUrlState {
  const urlObj = typeof url === 'string' ? new URL(url) : url;
  const params = urlObj.searchParams;

  const state: MapUrlState = {};

  // Parse center
  const location = decodeLocation(params);
  if (location) {
    state.center = location;
  }

  // Parse zoom
  const zoom = params.get('zoom');
  if (zoom) {
    const parsedZoom = parseInt(zoom, 10);
    if (isValidZoom(parsedZoom)) {
      state.zoom = parsedZoom;
    }
  }

  // Parse bounds
  const boundsStr = params.get('bounds');
  if (boundsStr) {
    const bounds = decodeBounds(boundsStr);
    if (bounds && isValidBounds(bounds)) {
      state.bounds = bounds;
    }
  }

  // Parse layer
  const layer = params.get('layer');
  if (layer) {
    state.layer = layer;
  }

  return state;
}

/**
 * Compare two map locations for equality
 */
export function areLocationsEqual(
  loc1: MapLocation,
  loc2: MapLocation,
  precision: number = 4
): boolean {
  const factor = Math.pow(10, precision);
  const lat1 = Math.round(loc1.lat * factor);
  const lat2 = Math.round(loc2.lat * factor);
  const lng1 = Math.round(loc1.lng * factor);
  const lng2 = Math.round(loc2.lng * factor);

  return lat1 === lat2 && lng1 === lng2;
}

/**
 * Calculate distance between two locations (Haversine formula)
 * Returns distance in kilometers
 */
export function calculateDistance(loc1: MapLocation, loc2: MapLocation): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(loc2.lat - loc1.lat);
  const dLng = toRadians(loc2.lng - loc1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(loc1.lat)) *
      Math.cos(toRadians(loc2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(
  lat: number,
  lng: number,
  precision: number = 4
): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';

  return `${Math.abs(lat).toFixed(precision)}°${latDir}, ${Math.abs(lng).toFixed(precision)}°${lngDir}`;
}

/**
 * Sanitize map state to ensure valid values
 */
export function sanitizeMapState(state: MapUrlState): MapUrlState {
  const sanitized: MapUrlState = {};

  if (state.center) {
    const { lat, lng, name } = state.center;
    if (isValidLatitude(lat) && isValidLongitude(lng)) {
      sanitized.center = { lat, lng, name };
    }
  }

  if (state.zoom !== undefined && isValidZoom(state.zoom)) {
    sanitized.zoom = state.zoom;
  }

  if (state.bounds && isValidBounds(state.bounds)) {
    sanitized.bounds = state.bounds;
  }

  if (state.layer) {
    sanitized.layer = state.layer;
  }

  return sanitized;
}

/**
 * Get default map state
 */
export function getDefaultMapState(): MapUrlState {
  return {
    center: {
      lat: 40.7128,
      lng: -74.006,
      name: 'New York, NY',
    },
    zoom: 10,
  };
}

