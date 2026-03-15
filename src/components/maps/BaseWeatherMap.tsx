/**
 * Base Weather Map Component
 * Interactive map with user location detection and weather integration
 */

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';

import { Button } from '@/components/ui/atoms';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { useUserPreferencesContext } from '@/contexts/UserPreferencesContext';
import { useTheme } from '@/design-system/theme';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useMapResponsive, useMapZoom } from '@/hooks/useMapResponsive';
import { useMapUrlSync } from '@/hooks/useMapUrlSync';
import MapShareButton from './MapShareButton';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapLocation {
  lat: number;
  lng: number;
  name?: string;
}

interface BaseWeatherMapProps {
  defaultLocation?: MapLocation;
  zoom?: number;
  height?: string;
  onLocationChange?: (location: MapLocation) => void;
  onMapReady?: (map: L.Map) => void;
  showUserLocation?: boolean;
  enableLocationSearch?: boolean;
  className?: string;
  children?: React.ReactNode;
  /**
   * Enable URL synchronization for map state
   * @default true
   */
  enableUrlSync?: boolean;
  /**
   * Callback when URL state is loaded
   */
  onUrlStateLoad?: (state: { center: MapLocation; zoom: number }) => void;
}

// Default locations for fallback
const DEFAULT_LOCATIONS: Record<string, MapLocation> = {
  'New York': { lat: 40.7128, lng: -74.006, name: 'New York, NY' },
  London: { lat: 51.5074, lng: -0.1278, name: 'London, UK' },
  Tokyo: { lat: 35.6762, lng: 139.6503, name: 'Tokyo, Japan' },
  Lagos: { lat: 6.5244, lng: 3.3792, name: 'Lagos, Nigeria' },
};

/**
 * Component to handle map events and location updates
 */
const MapEventHandler: React.FC<{
  onLocationChange?: (location: MapLocation) => void;
  userLocation: MapLocation | null;
  onMapMove?: (center: MapLocation, zoom: number, bounds: L.LatLngBounds) => void;
}> = ({ onLocationChange, userLocation, onMapMove }) => {
  const map = useMap();

  useMapEvents({
    click: e => {
      const { lat, lng } = e.latlng;
      onLocationChange?.({ lat, lng, name: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
    },
    moveend: () => {
      if (onMapMove) {
        const center = map.getCenter();
        const zoom = map.getZoom();
        const bounds = map.getBounds();
        onMapMove({ lat: center.lat, lng: center.lng }, zoom, bounds);
      }
    },
    zoomend: () => {
      if (onMapMove) {
        const center = map.getCenter();
        const zoom = map.getZoom();
        const bounds = map.getBounds();
        onMapMove({ lat: center.lat, lng: center.lng }, zoom, bounds);
      }
    },
  });

  // Center map on user location when available
  useEffect(() => {
    if (userLocation && map) {
      map.setView([userLocation.lat, userLocation.lng], 12, {
        animate: true,
        duration: 1,
      });
    }
  }, [userLocation, map]);

  return null;
};

/**
 * Component to add user location marker
 */
const UserLocationMarker: React.FC<{
  location: MapLocation;
}> = ({ location }) => {
  const userIcon = L.divIcon({
    className: 'user-location-marker',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: -5px;
          left: -5px;
          width: 30px;
          height: 30px;
          background: rgba(59, 130, 246, 0.3);
          border-radius: 50%;
          animation: pulse 2s infinite;
        "></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  return (
    <Marker position={[location.lat, location.lng]} icon={userIcon}>
      <Popup>
        <div className="text-center">
          <div className="font-semibold text-blue-600">📍 Your Location</div>
          <div className="text-sm text-gray-600 mt-1">
            {location.name || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

/**
 * Base Weather Map Component
 */
const BaseWeatherMap: React.FC<BaseWeatherMapProps> = ({
  defaultLocation = DEFAULT_LOCATIONS['New York'],
  zoom = 10,
  height = '400px',
  onLocationChange,
  onMapReady,
  showUserLocation = true,
  enableLocationSearch = true, // eslint-disable-line @typescript-eslint/no-unused-vars
  className = '',
  children,
  enableUrlSync = true,
  onUrlStateLoad,
}) => {
  const [mapCenter, setMapCenter] = useState<MapLocation>(defaultLocation);
  const [currentZoom, setCurrentZoom] = useState<number>(zoom);
  const [userLocation, setUserLocation] = useState<MapLocation | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [lastSearchedLocation, setLastSearchedLocation] = useState<MapLocation | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const isUrlStateLoadedRef = useRef(false);

  const { preferences } = useUserPreferencesContext();
  const { showError, showSuccess, showInfo } = useSnackbar();
  const { theme } = useTheme();
  const responsive = useMapResponsive();
  const responsiveZoom = useMapZoom(zoom);

  // Theme-aware colors for map controls
  const controlBgColor = theme.isDark ? '#1f2937' : '#ffffff';
  const controlTextColor = theme.isDark ? '#f3f4f6' : '#111827';
  const controlBorderColor = theme.isDark ? '#374151' : '#e5e7eb';
  const controlHoverBgColor = theme.isDark ? '#374151' : '#f3f4f6';
  const loadingOverlayBgColor = theme.isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)';

  // URL synchronization
  const { viewState, updateUrl, syncMapWithUrl, hasMapParams } = useMapUrlSync({
    enabled: enableUrlSync,
    debounceMs: 500,
    replaceHistory: true,
    onUrlStateLoad: state => {
      if (!isUrlStateLoadedRef.current) {
        setMapCenter(state.center);
        setCurrentZoom(state.zoom);
        onUrlStateLoad?.(state);
        isUrlStateLoadedRef.current = true;
      }
    },
  });

  // Geolocation hook with error handling
  const {
    position,
    error: geoError,
    loading: geoLoading,
    getCurrentPosition,
    isSupported: geoSupported,
  } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 300000, // 5 minutes
    showNotifications: false, // We'll handle notifications manually
    onSuccess: pos => {
      const location: MapLocation = {
        lat: pos.latitude,
        lng: pos.longitude,
        name: 'Your Location',
      };
      setUserLocation(location);
      setMapCenter(location);
      showSuccess('📍 Location detected successfully!');
      onLocationChange?.(location);
    },
    onError: err => {
      console.warn('Geolocation error:', err);
      handleGeolocationFallback();
    },
  });

  /**
   * Handle geolocation fallback
   */
  const handleGeolocationFallback = useCallback(() => {
    // Try to use last searched location
    if (lastSearchedLocation) {
      setMapCenter(lastSearchedLocation);
      showInfo('📍 Unable to detect location. Showing results for your last search.');
      onLocationChange?.(lastSearchedLocation);
      return;
    }

    // Fall back to Lagos, Nigeria as ultimate default
    const fallbackLocation = DEFAULT_LOCATIONS['Lagos'];
    setMapCenter(fallbackLocation);
    showInfo('📍 Unable to detect location. Showing results for Lagos, Nigeria.');
    onLocationChange?.(fallbackLocation);
  }, [lastSearchedLocation, showInfo, onLocationChange]);

  /**
   * Request user location
   */
  const requestLocation = useCallback(() => {
    if (!geoSupported) {
      showError('🚫 Geolocation is not supported by your browser');
      handleGeolocationFallback();
      return;
    }

    getCurrentPosition();
  }, [geoSupported, getCurrentPosition, showError, handleGeolocationFallback]);

  /**
   * Handle manual location selection
   */
  const handleLocationSelect = useCallback(
    (location: MapLocation) => {
      setLastSearchedLocation(location);
      setMapCenter(location);
      onLocationChange?.(location);
    },
    [onLocationChange]
  );

  /**
   * Handle map movement and update URL
   */
  const handleMapMove = useCallback(
    (center: MapLocation, zoom: number, bounds: L.LatLngBounds) => {
      if (enableUrlSync && isMapReady) {
        const boundsObj = {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        };

        updateUrl({
          center,
          zoom,
          bounds: boundsObj,
        });
      }
    },
    [enableUrlSync, isMapReady, updateUrl]
  );

  /**
   * Initialize map and request location on mount
   */
  useEffect(() => {
    if (showUserLocation && !userLocation && !geoLoading) {
      // Small delay to ensure map is ready
      const timer = setTimeout(() => {
        requestLocation();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showUserLocation, userLocation, geoLoading, requestLocation]);

  /**
   * Sync map with URL state when map is ready
   */
  useEffect(() => {
    if (isMapReady && mapRef.current && viewState && hasMapParams) {
      syncMapWithUrl(mapRef.current);
    }
  }, [isMapReady, viewState, hasMapParams, syncMapWithUrl]);

  /**
   * Handle map ready event
   */
  const handleMapReady = useCallback(
    (map: L.Map) => {
      mapRef.current = map;
      setIsMapReady(true);
      onMapReady?.(map);

      // Add custom CSS for user location marker animation
      if (!document.getElementById('leaflet-custom-styles')) {
        const style = document.createElement('style');
        style.id = 'leaflet-custom-styles';
        style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        .user-location-marker {
          background: transparent !important;
          border: none !important;
        }
      `;
        document.head.appendChild(style);
      }
    },
    [onMapReady]
  );

  /**
   * Get tile layer URL based on user preferences
   */
  const getTileLayerUrl = useCallback(() => {
    // Use lower quality tiles for save-data preference
    if (preferences.saveData) {
      return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }

    // Use high-quality tiles for normal usage
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  }, [preferences.saveData]);

  /**
   * Get map attribution
   */
  const getAttribution = () => {
    return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  };

  return (
    <div className={`map-container relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      {/* Map Container */}
      <div style={{ height }} className="w-full">
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={currentZoom}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          whenReady={() => {
            if (mapRef.current) {
              handleMapReady(mapRef.current);
            }
          }}
          zoomControl={!responsive.isMobile}
          scrollWheelZoom={!preferences.prefersReducedMotion}
          doubleClickZoom={true}
          dragging={true}
          animate={!preferences.prefersReducedMotion}
          touchZoom={responsive.isTouch}
        >
          {/* Base Tile Layer */}
          <TileLayer
            url={getTileLayerUrl()}
            attribution={getAttribution()}
            maxZoom={18}
            tileSize={preferences.saveData ? 256 : 512}
            zoomOffset={preferences.saveData ? 0 : -1}
          />

          {/* Map Event Handler */}
          <MapEventHandler
            onLocationChange={handleLocationSelect}
            userLocation={userLocation}
            onMapMove={handleMapMove}
          />

          {/* User Location Marker */}
          {userLocation && showUserLocation && <UserLocationMarker location={userLocation} />}

          {/* Additional children (weather layers, markers, etc.) */}
          {children}
        </MapContainer>
      </div>

      {/* Loading Overlay */}
      {geoLoading && (
        <div
          className="map-loading-overlay absolute inset-0 flex items-center justify-center z-[2000]"
          style={{ backgroundColor: loadingOverlayBgColor }}
        >
          <div
            className="map-loading-content rounded-lg p-4 flex items-center space-x-3 shadow-lg"
            style={{
              backgroundColor: controlBgColor,
              color: controlTextColor,
            }}
          >
            <div
              className="map-loading-spinner animate-spin rounded-full h-6 w-6 border-b-2"
              style={{ borderBottomColor: theme.accentColor }}
            ></div>
            <span>Detecting your location...</span>
          </div>
        </div>
      )}

      {/* Location Controls */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        {/* Share Map Button */}
        {enableUrlSync && (
          <MapShareButton variant="ghost" size="sm" showLabel={false} className="shadow-lg" />
        )}

        {/* Get Location Button */}
        {geoSupported && (
          <Button
            variant="secondary"
            size="sm"
            onClick={requestLocation}
            disabled={geoLoading}
            className="p-2 shadow-lg transition-colors"
            style={{
              backgroundColor: controlBgColor,
              color: controlTextColor,
              border: `1px solid ${controlBorderColor}`,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = controlHoverBgColor;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = controlBgColor;
            }}
            title="Get my location"
          >
            {geoLoading ? (
              <div
                className="animate-spin rounded-full h-5 w-5 border-b-2"
                style={{ borderBottomColor: theme.accentColor }}
              ></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
          </Button>
        )}
      </div>

      {/* Map Info */}
      <div
        className="absolute bottom-4 left-4 z-[1000] rounded-lg shadow-lg p-3 max-w-xs border"
        style={{
          backgroundColor: controlBgColor,
          color: controlTextColor,
          borderColor: controlBorderColor,
        }}
      >
        <div className="text-sm">
          <div className="font-semibold mb-1">📍 {mapCenter.name || 'Selected Location'}</div>
          <div className="text-xs" style={{ color: theme.isDark ? '#9ca3af' : '#6b7280' }}>
            {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
          </div>
          {userLocation && (
            <div className="text-xs mt-1" style={{ color: theme.accentColor }}>
              🎯 Your location detected
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BaseWeatherMap;
