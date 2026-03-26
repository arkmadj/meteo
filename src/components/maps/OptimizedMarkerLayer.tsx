/**
 * Optimized Marker Layer Component
 * GPU-friendly marker rendering with clustering and throttling
 */

import type { PerformanceTier } from '@/utils/devicePerformance';
import L from 'leaflet';
import React, { useEffect, useMemo, useRef } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';

export interface MarkerData {
  id: string | number;
  lat: number;
  lng: number;
  title?: string;
  description?: string;
  icon?: L.Icon;
  [key: string]: unknown;
}

export interface OptimizedMarkerLayerProps {
  /** Marker data */
  markers: MarkerData[];
  /** Performance tier */
  performanceTier?: PerformanceTier;
  /** Maximum markers to render */
  maxMarkers?: number;
  /** Enable clustering */
  enableClustering?: boolean;
  /** Cluster radius in pixels */
  clusterRadius?: number;
  /** Callback when marker is clicked */
  onMarkerClick?: (marker: MarkerData) => void;
  /** Custom marker icon */
  markerIcon?: L.Icon;
  /** Enable marker animations */
  enableAnimations?: boolean;
}

/**
 * Simple clustering algorithm for markers
 */
function clusterMarkers(
  markers: MarkerData[],
  radius: number,
  map: L.Map
): Array<{ markers: MarkerData[]; center: [number, number] }> {
  const clusters: Array<{ markers: MarkerData[]; center: [number, number] }> = [];
  const processed = new Set<string | number>();

  markers.forEach(marker => {
    if (processed.has(marker.id)) return;

    const cluster: MarkerData[] = [marker];
    processed.add(marker.id);

    const markerPoint = map.latLngToLayerPoint([marker.lat, marker.lng]);

    // Find nearby markers
    markers.forEach(other => {
      if (processed.has(other.id)) return;

      const otherPoint = map.latLngToLayerPoint([other.lat, other.lng]);
      const distance = markerPoint.distanceTo(otherPoint);

      if (distance <= radius) {
        cluster.push(other);
        processed.add(other.id);
      }
    });

    // Calculate cluster center
    const centerLat = cluster.reduce((sum, m) => sum + m.lat, 0) / cluster.length;
    const centerLng = cluster.reduce((sum, m) => sum + m.lng, 0) / cluster.length;

    clusters.push({
      markers: cluster,
      center: [centerLat, centerLng],
    });
  });

  return clusters;
}

/**
 * Create cluster icon
 */
function createClusterIcon(count: number): L.DivIcon {
  const size = Math.min(40 + Math.log(count) * 5, 60);

  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${Math.min(14 + Math.log(count), 20)}px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        ${count}
      </div>
    `,
    className: 'marker-cluster',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/**
 * Default marker icon
 */
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/**
 * Optimized Marker Layer Component
 */
const OptimizedMarkerLayer: React.FC<OptimizedMarkerLayerProps> = ({
  markers,
  performanceTier = 'medium',
  maxMarkers,
  enableClustering = false,
  clusterRadius = 80,
  onMarkerClick,
  markerIcon = defaultIcon,
  enableAnimations: _enableAnimations = true,
}) => {
  const map = useMap();
  const canvasLayerRef = useRef<L.Canvas | null>(null);

  // Determine max markers based on performance tier
  const effectiveMaxMarkers = useMemo(() => {
    if (maxMarkers !== undefined) return maxMarkers;

    switch (performanceTier) {
      case 'high':
        return 100;
      case 'medium':
        return 50;
      case 'low':
        return 25;
      default:
        return 50;
    }
  }, [maxMarkers, performanceTier]);

  // Limit markers
  const limitedMarkers = useMemo(() => {
    return markers.slice(0, effectiveMaxMarkers);
  }, [markers, effectiveMaxMarkers]);

  // Cluster markers if enabled
  const clusters = useMemo(() => {
    if (!enableClustering || !map) {
      return limitedMarkers.map(marker => ({
        markers: [marker],
        center: [marker.lat, marker.lng] as [number, number],
      }));
    }

    return clusterMarkers(limitedMarkers, clusterRadius, map);
  }, [limitedMarkers, enableClustering, clusterRadius, map]);

  // Use Canvas renderer for low-end devices
  useEffect(() => {
    if (performanceTier === 'low' && !canvasLayerRef.current) {
      canvasLayerRef.current = L.canvas({ padding: 0.5 });
    }
  }, [performanceTier]);

  // Render clusters
  return (
    <>
      {clusters.map((cluster, index) => {
        const isCluster = cluster.markers.length > 1;
        const icon = isCluster ? createClusterIcon(cluster.markers.length) : markerIcon;

        return (
          <Marker
            key={`cluster-${index}`}
            position={cluster.center}
            icon={icon}
            eventHandlers={{
              click: () => {
                if (!isCluster && onMarkerClick) {
                  onMarkerClick(cluster.markers[0]);
                }
              },
            }}
          >
            {isCluster ? (
              <Popup>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                    {cluster.markers.length} Locations
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {cluster.markers.slice(0, 10).map(marker => (
                      <li
                        key={marker.id}
                        style={{
                          padding: '4px 0',
                          borderBottom: '1px solid #e5e7eb',
                          cursor: 'pointer',
                        }}
                        onClick={() => onMarkerClick?.(marker)}
                      >
                        {marker.title || `Location ${marker.id}`}
                      </li>
                    ))}
                    {cluster.markers.length > 10 && (
                      <li style={{ padding: '4px 0', color: '#6b7280' }}>
                        +{cluster.markers.length - 10} more...
                      </li>
                    )}
                  </ul>
                </div>
              </Popup>
            ) : (
              <Popup>
                <div>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {cluster.markers[0].title || 'Location'}
                  </h3>
                  {cluster.markers[0].description && (
                    <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                      {cluster.markers[0].description}
                    </p>
                  )}
                </div>
              </Popup>
            )}
          </Marker>
        );
      })}
    </>
  );
};

export default OptimizedMarkerLayer;
