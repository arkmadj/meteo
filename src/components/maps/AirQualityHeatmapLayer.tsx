/**
 * AirQualityHeatmapLayer Component
 *
 * A custom Leaflet layer that renders an air quality heatmap overlay
 * using canvas for high-performance rendering. Dynamically reflects AQI
 * intensity using color gradients based on European or US AQI standards.
 */

import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

import type { AQIStandard } from '@/types/airQuality';
import { EUROPEAN_AQI_LEVELS, US_AQI_LEVELS } from '@/types/airQuality';

export interface AirQualityDataPoint {
  lat: number;
  lng: number;
  aqi: number;
}

export interface AirQualityHeatmapLayerProps {
  /** Air quality data points to render */
  data?: AirQualityDataPoint[];
  /** AQI standard to use for color mapping */
  standard?: AQIStandard;
  /** Opacity of the heatmap layer (0-1) */
  opacity?: number;
  /** Radius of influence for each data point in pixels */
  radius?: number;
  /** Blur amount for smoother gradients */
  blur?: number;
  /** Z-index for the layer */
  zIndex?: number;
  /** Callback when layer loading starts */
  onLoadStart?: () => void;
  /** Callback when layer loading completes */
  onLoadComplete?: () => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
}

/**
 * Get color for AQI value using standard-specific color gradients
 */
const getAQIColor = (
  aqi: number,
  standard: AQIStandard = 'european'
): [number, number, number, number] => {
  const levels = standard === 'european' ? EUROPEAN_AQI_LEVELS : US_AQI_LEVELS;

  // Find the appropriate level for this AQI value
  const level = levels.find(l => aqi >= l.min && aqi <= l.max) || levels[0];

  // Convert hex color to RGB
  const hex = level.color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate alpha based on AQI severity
  // Higher AQI = more opaque
  const maxAQI = standard === 'european' ? 100 : 500;
  const normalizedAQI = Math.min(aqi / maxAQI, 1);
  const alpha = Math.round(150 + normalizedAQI * 105); // Range: 150-255

  return [r, g, b, alpha];
};

/**
 * Custom Leaflet Canvas Layer for Air Quality Heatmap
 */
class AirQualityCanvasLayer extends L.Layer {
  private canvas: HTMLCanvasElement | null = null;
  private data: AirQualityDataPoint[];
  private layerOptions: Omit<AirQualityHeatmapLayerProps, 'data'>;

  constructor(data: AirQualityDataPoint[], options: Omit<AirQualityHeatmapLayerProps, 'data'>) {
    super();
    this.data = data;
    this.layerOptions = {
      standard: options.standard ?? 'european',
      opacity: options.opacity ?? 0.6,
      radius: options.radius ?? 35,
      blur: options.blur ?? 20,
      zIndex: options.zIndex ?? 400,
      onLoadStart: options.onLoadStart,
      onLoadComplete: options.onLoadComplete,
      onError: options.onError,
    };
  }

  onAdd(map: L.Map): this {
    if (!this.canvas) {
      this.canvas = L.DomUtil.create('canvas', 'air-quality-heatmap-layer');
      this.canvas.style.position = 'absolute';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = this.layerOptions.zIndex.toString();

      const size = map.getSize();
      this.canvas.width = size.x;
      this.canvas.height = size.y;

      const pane = map.getPanes().overlayPane;
      if (pane) {
        pane.appendChild(this.canvas);
      }
    }

    map.on('moveend', this.redraw, this);
    map.on('zoomend', this.redraw, this);
    map.on('resize', this.resize, this);

    this.redraw();
    return this;
  }

  onRemove(map: L.Map): this {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    map.off('moveend', this.redraw, this);
    map.off('zoomend', this.redraw, this);
    map.off('resize', this.resize, this);

    return this;
  }

  private resize = () => {
    const map = this._map;
    if (!map || !this.canvas) return;

    const size = map.getSize();
    this.canvas.width = size.x;
    this.canvas.height = size.y;
    this.redraw();
  };

  private redraw = () => {
    const map = this._map;
    if (!map || !this.canvas) return;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Set global opacity
    ctx.globalAlpha = this.layerOptions.opacity;

    // Draw each AQI data point
    this.data.forEach(point => {
      const latLng = L.latLng(point.lat, point.lng);
      const pixelPoint = map.latLngToContainerPoint(latLng);

      // Get color for this AQI value
      const [r, g, b, a] = getAQIColor(point.aqi, this.layerOptions.standard);

      // Create radial gradient
      const gradient = ctx.createRadialGradient(
        pixelPoint.x,
        pixelPoint.y,
        0,
        pixelPoint.x,
        pixelPoint.y,
        this.layerOptions.radius
      );

      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a / 255})`);
      gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${(a / 255) * 0.6})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(
        pixelPoint.x - this.layerOptions.radius,
        pixelPoint.y - this.layerOptions.radius,
        this.layerOptions.radius * 2,
        this.layerOptions.radius * 2
      );
    });

    // Apply blur for smoother appearance
    if (this.layerOptions.blur > 0) {
      ctx.filter = `blur(${this.layerOptions.blur}px)`;
      ctx.drawImage(this.canvas, 0, 0);
      ctx.filter = 'none';
    }
  };

  updateData(newData: AirQualityDataPoint[]) {
    this.data = newData;
    this.redraw();
  }

  updateOptions(newOptions: Partial<Omit<AirQualityHeatmapLayerProps, 'data'>>) {
    this.layerOptions = { ...this.layerOptions, ...newOptions };
    this.redraw();
  }
}

/**
 * React component wrapper for the air quality heatmap layer
 */
const AirQualityHeatmapLayer: React.FC<AirQualityHeatmapLayerProps> = ({
  data = [],
  standard = 'european',
  opacity = 0.6,
  radius = 35,
  blur = 20,
  zIndex = 400,
  onLoadStart,
  onLoadComplete,
  onError,
}) => {
  const map = useMap();
  const canvasLayerRef = useRef<AirQualityCanvasLayer | null>(null);

  useEffect(() => {
    if (!map) return;

    try {
      onLoadStart?.();

      if (data.length === 0) {
        onError?.(new Error('No air quality data available'));
        return;
      }

      // Create canvas layer if it doesn't exist
      if (!canvasLayerRef.current) {
        canvasLayerRef.current = new AirQualityCanvasLayer(data, {
          standard,
          opacity,
          radius,
          blur,
          zIndex,
        });
        canvasLayerRef.current.addTo(map);
        onLoadComplete?.();
      }
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error('Failed to load air quality layer');
      onError?.(errorObj);
    }

    return () => {
      if (canvasLayerRef.current) {
        map.removeLayer(canvasLayerRef.current);
        canvasLayerRef.current = null;
      }
    };
  }, [map, zIndex, onLoadStart, onLoadComplete, onError]);

  // Update canvas layer when data changes
  useEffect(() => {
    if (canvasLayerRef.current) {
      canvasLayerRef.current.updateData(data);
    }
  }, [data]);

  // Update canvas layer when options change
  useEffect(() => {
    if (canvasLayerRef.current) {
      canvasLayerRef.current.updateOptions({
        standard,
        opacity,
        radius,
        blur,
        zIndex,
      });
    }
  }, [standard, opacity, radius, blur, zIndex]);

  return null;
};

export default AirQualityHeatmapLayer;
