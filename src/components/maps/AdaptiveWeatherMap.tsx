/**
 * Adaptive Weather Map Component
 * Automatically adjusts rendering quality based on device performance
 */

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import type L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useAdaptiveMapRendering } from '@/hooks/useAdaptiveMapRendering';
import { useUserPreferencesContext } from '@/contexts/UserPreferencesContext';
import type { PerformanceTier } from '@/utils/devicePerformance';

interface MapLocation {
  lat: number;
  lng: number;
  name?: string;
}

export interface AdaptiveWeatherMapProps {
  /** Default map center */
  defaultLocation?: MapLocation;
  /** Default zoom level */
  zoom?: number;
  /** Map height */
  height?: string;
  /** Callback when location changes */
  onLocationChange?: (location: MapLocation) => void;
  /** Callback when map is ready */
  onMapReady?: (map: L.Map) => void;
  /** Additional CSS classes */
  className?: string;
  /** Child components (markers, layers, etc.) */
  children?: React.ReactNode;
  /** Enable adaptive rendering (default: true) */
  enableAdaptive?: boolean;
  /** Initial quality tier override */
  initialTier?: PerformanceTier;
  /** Show performance overlay (default: false) */
  showPerformanceOverlay?: boolean;
}

/**
 * Performance Overlay Component
 */
interface PerformanceOverlayProps {
  tier: PerformanceTier;
  fps: number;
  isDegraded: boolean;
}

const PerformanceOverlay: React.FC<PerformanceOverlayProps> = ({ tier, fps, isDegraded }) => {
  const tierColors = {
    high: '#10b981',
    medium: '#f59e0b',
    low: '#ef4444',
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontFamily: 'monospace',
        pointerEvents: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: tierColors[tier],
          }}
        />
        <div>
          <div>Quality: {tier.toUpperCase()}</div>
          <div>FPS: {fps}</div>
          {isDegraded && <div style={{ color: '#ef4444' }}>⚠️ Degraded</div>}
        </div>
      </div>
    </div>
  );
};

/**
 * Map Configuration Component
 * Applies adaptive settings to the map
 */
interface MapConfiguratorProps {
  settings: ReturnType<typeof useAdaptiveMapRendering>['settings'];
  onMapReady?: (map: L.Map) => void;
}

const MapConfigurator: React.FC<MapConfiguratorProps> = ({ settings, onMapReady }) => {
  const map = useMap();
  const isConfiguredRef = useRef(false);

  useEffect(() => {
    if (!map || isConfiguredRef.current) return;

    // Configure map options
    map.options.zoomAnimation = settings.animations.enabled;
    map.options.fadeAnimation = settings.animations.enabled;
    map.options.markerZoomAnimation = settings.animations.enabled;
    map.options.inertia = settings.animations.enableInertia;
    map.options.inertiaDeceleration = settings.interactions.inertiaDeceleration;
    map.options.wheelDebounceTime = settings.interactions.wheelDebounce;

    // Set renderer preference
    if (settings.rendering.useCanvas && !map.options.preferCanvas) {
      console.log('Switching to Canvas renderer for better performance');
      map.options.preferCanvas = true;
    }

    isConfiguredRef.current = true;
    onMapReady?.(map);
  }, [map, settings, onMapReady]);

  // Update map options when settings change
  useEffect(() => {
    if (!map) return;

    map.options.zoomAnimation = settings.animations.enabled;
    map.options.fadeAnimation = settings.animations.enabled;
    map.options.markerZoomAnimation = settings.animations.enabled;
    map.options.inertia = settings.animations.enableInertia;
    map.options.inertiaDeceleration = settings.interactions.inertiaDeceleration;
    map.options.wheelDebounceTime = settings.interactions.wheelDebounce;
  }, [map, settings]);

  return null;
};

/**
 * Adaptive Weather Map Component
 */
const AdaptiveWeatherMap: React.FC<AdaptiveWeatherMapProps> = ({
  defaultLocation = { lat: 40.7128, lng: -74.006, name: 'New York' },
  zoom = 10,
  height = '400px',
  onLocationChange,
  onMapReady,
  className = '',
  children,
  enableAdaptive = true,
  initialTier,
  showPerformanceOverlay = false,
}) => {
  const [mapCenter, setMapCenter] = useState<MapLocation>(defaultLocation);
  const [currentZoom, _setCurrentZoom] = useState<number>(zoom);
  const mapRef = useRef<L.Map | null>(null);

  const { preferences } = useUserPreferencesContext();

  // Adaptive rendering
  const { tier, settings, isLoading, fps, isDegraded, capabilities } = useAdaptiveMapRendering({
    autoAdjust: enableAdaptive,
    initialTier,
    enableMonitoring: enableAdaptive,
    onTierChange: newTier => {
      console.log('Map quality tier changed:', newTier);
    },
  });

  /**
   * Get tile layer URL based on settings
   */
  const getTileLayerUrl = useCallback(() => {
    // Use appropriate tile server based on quality
    if (settings.tiles.size === 256 || preferences.saveData) {
      return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  }, [settings.tiles.size, preferences.saveData]);

  /**
   * Handle map ready
   */
  const handleMapReady = useCallback(
    (map: L.Map) => {
      mapRef.current = map;
      onMapReady?.(map);
    },
    [onMapReady]
  );

  /**
   * Handle location change
   */
  const _handleLocationChange = useCallback(
    (location: MapLocation) => {
      setMapCenter(location);
      onLocationChange?.(location);
    },
    [onLocationChange]
  );

  // Memoize map options
  const mapOptions = useMemo(
    () => ({
      zoomControl: true,
      scrollWheelZoom: !preferences.prefersReducedMotion && settings.animations.enabled,
      doubleClickZoom: true,
      dragging: true,
      animate: settings.animations.enabled,
      zoomAnimation: settings.animations.enabled,
      fadeAnimation: settings.animations.enabled,
      markerZoomAnimation: settings.animations.enabled,
      inertia: settings.animations.enableInertia,
      inertiaDeceleration: settings.interactions.inertiaDeceleration,
      wheelDebounceTime: settings.interactions.wheelDebounce,
      preferCanvas: settings.rendering.useCanvas,
    }),
    [preferences.prefersReducedMotion, settings]
  );

  if (isLoading) {
    return (
      <div
        className={`map-container relative bg-gray-100 rounded-lg overflow-hidden ${className}`}
        style={{ height }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Optimizing map for your device...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`map-container relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      {/* Performance Overlay */}
      {showPerformanceOverlay && (
        <PerformanceOverlay tier={tier} fps={fps} isDegraded={isDegraded} />
      )}

      {/* Capability Info (Development) */}
      {process.env.NODE_ENV === 'development' && capabilities && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '11px',
            fontFamily: 'monospace',
            maxWidth: '200px',
          }}
        >
          <div>Cores: {capabilities.cores}</div>
          <div>GPU: {capabilities.gpuTier}</div>
          <div>Memory: {capabilities.memory || 'N/A'}GB</div>
          <div>Canvas: {settings.rendering.useCanvas ? 'Yes' : 'No'}</div>
          <div>Tile Size: {settings.tiles.size}px</div>
        </div>
      )}

      {/* Map Container */}
      <div style={{ height }} className="w-full">
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={currentZoom}
          style={{ height: '100%', width: '100%' }}
          {...mapOptions}
        >
          {/* Tile Layer with adaptive settings */}
          <TileLayer
            url={getTileLayerUrl()}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={settings.tiles.maxZoom}
            tileSize={settings.tiles.size}
            zoomOffset={settings.tiles.size === 512 ? -1 : 0}
            updateWhenIdle={tier === 'low'}
            updateWhenZooming={tier !== 'low'}
            keepBuffer={tier === 'high' ? 2 : 1}
          />

          {/* Map Configurator */}
          <MapConfigurator settings={settings} onMapReady={handleMapReady} />

          {/* Children (markers, layers, etc.) */}
          {children}
        </MapContainer>
      </div>
    </div>
  );
};

export default AdaptiveWeatherMap;
