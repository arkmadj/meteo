/**
 * TemperatureHeatmapLayer Component
 *
 * A custom Leaflet layer that renders a temperature heatmap overlay
 * using canvas for high-performance rendering. Supports both tile-based
 * weather services and custom temperature data rendering.
 */

import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

export interface TemperatureDataPoint {
  lat: number;
  lng: number;
  temperature: number;
}

export interface TemperatureHeatmapLayerProps {
  /** Temperature data points to render */
  data?: TemperatureDataPoint[];
  /** Opacity of the heatmap layer (0-1) */
  opacity?: number;
  /** Radius of influence for each data point in pixels */
  radius?: number;
  /** Blur amount for smoother gradients */
  blur?: number;
  /** Maximum temperature for color scale */
  maxTemperature?: number;
  /** Minimum temperature for color scale */
  minTemperature?: number;
  /** Whether to use OpenWeatherMap tile service */
  useWeatherTiles?: boolean;
  /** OpenWeatherMap API key (required if useWeatherTiles is true) */
  apiKey?: string;
  /** Weather tile layer type */
  tileLayer?: 'temp_new' | 'precipitation_new' | 'clouds_new' | 'wind_new';
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
 * Get color for temperature value using a gradient scale
 */
const getTemperatureColor = (
  temp: number,
  minTemp: number,
  maxTemp: number
): [number, number, number, number] => {
  // Normalize temperature to 0-1 range
  const normalized = Math.max(0, Math.min(1, (temp - minTemp) / (maxTemp - minTemp)));

  // Color stops for temperature gradient (cold to hot)
  const colorStops = [
    { pos: 0.0, color: [130, 22, 146, 255] }, // Purple (very cold)
    { pos: 0.2, color: [25, 84, 166, 255] }, // Blue (cold)
    { pos: 0.4, color: [58, 175, 185, 255] }, // Cyan (cool)
    { pos: 0.5, color: [87, 213, 111, 255] }, // Green (mild)
    { pos: 0.6, color: [255, 255, 0, 255] }, // Yellow (warm)
    { pos: 0.8, color: [255, 140, 0, 255] }, // Orange (hot)
    { pos: 1.0, color: [255, 0, 0, 255] }, // Red (very hot)
  ];

  // Find the two color stops to interpolate between
  let lowerStop = colorStops[0];
  let upperStop = colorStops[colorStops.length - 1];

  for (let i = 0; i < colorStops.length - 1; i++) {
    if (normalized >= colorStops[i].pos && normalized <= colorStops[i + 1].pos) {
      lowerStop = colorStops[i];
      upperStop = colorStops[i + 1];
      break;
    }
  }

  // Interpolate between the two colors
  const range = upperStop.pos - lowerStop.pos;
  const rangePct = range === 0 ? 0 : (normalized - lowerStop.pos) / range;

  const r = Math.round(lowerStop.color[0] + (upperStop.color[0] - lowerStop.color[0]) * rangePct);
  const g = Math.round(lowerStop.color[1] + (upperStop.color[1] - lowerStop.color[1]) * rangePct);
  const b = Math.round(lowerStop.color[2] + (upperStop.color[2] - lowerStop.color[2]) * rangePct);
  const a = Math.round(lowerStop.color[3] + (upperStop.color[3] - lowerStop.color[3]) * rangePct);

  return [r, g, b, a];
};

/**
 * Custom Leaflet Canvas Layer for Temperature Heatmap
 */
class TemperatureCanvasLayer extends L.Layer {
  private canvas: HTMLCanvasElement | null = null;
  private data: TemperatureDataPoint[];
  private layerOptions: Omit<
    TemperatureHeatmapLayerProps,
    'data' | 'useWeatherTiles' | 'apiKey' | 'tileLayer'
  >;

  constructor(
    data: TemperatureDataPoint[],
    options: Omit<TemperatureHeatmapLayerProps, 'data' | 'useWeatherTiles' | 'apiKey' | 'tileLayer'>
  ) {
    super();
    this.data = data;
    this.layerOptions = {
      opacity: options.opacity ?? 0.6,
      radius: options.radius ?? 25,
      blur: options.blur ?? 15,
      maxTemperature: options.maxTemperature ?? 40,
      minTemperature: options.minTemperature ?? -20,
      zIndex: options.zIndex ?? 400,
      onError: options.onError,
      onLoadStart: options.onLoadStart,
      onLoadComplete: options.onLoadComplete,
    };
  }

  onAdd(map: L.Map): this {
    if (!this.canvas) {
      this.canvas = L.DomUtil.create('canvas', 'temperature-heatmap-layer');
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

    // Draw each temperature point
    this.data.forEach(point => {
      const latLng = L.latLng(point.lat, point.lng);
      const pixelPoint = map.latLngToContainerPoint(latLng);

      // Get color for this temperature
      const [r, g, b, a] = getTemperatureColor(
        point.temperature,
        this.layerOptions.minTemperature,
        this.layerOptions.maxTemperature
      );

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
      gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${(a / 255) * 0.5})`);
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

  updateData(newData: TemperatureDataPoint[]) {
    this.data = newData;
    this.redraw();
  }

  updateOptions(
    newOptions: Partial<
      Omit<TemperatureHeatmapLayerProps, 'data' | 'useWeatherTiles' | 'apiKey' | 'tileLayer'>
    >
  ) {
    this.layerOptions = { ...this.layerOptions, ...newOptions };
    this.redraw();
  }
}

/**
 * React component wrapper for the temperature heatmap layer
 */
const TemperatureHeatmapLayer: React.FC<TemperatureHeatmapLayerProps> = ({
  data = [],
  opacity = 0.6,
  radius = 25,
  blur = 15,
  maxTemperature = 40,
  minTemperature = -20,
  useWeatherTiles = false,
  apiKey,
  tileLayer = 'temp_new',
  zIndex = 400,
  onLoadStart,
  onLoadComplete,
  onError,
}) => {
  const map = useMap();
  const canvasLayerRef = useRef<TemperatureCanvasLayer | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!map) return;

    try {
      onLoadStart?.();

      if (useWeatherTiles && apiKey) {
        // Use OpenWeatherMap tile service
        if (!tileLayerRef.current) {
          const tileUrl = `https://tile.openweathermap.org/map/${tileLayer}/{z}/{x}/{y}.png?appid=${apiKey}`;
          tileLayerRef.current = L.tileLayer(tileUrl, {
            attribution: 'Weather data © OpenWeatherMap',
            opacity,
            maxZoom: 18,
            zIndex,
          });

          // Add error handling for tile loading
          tileLayerRef.current.on('tileerror', (error: any) => {
            onError?.(
              new Error(`Failed to load temperature tile: ${error.tile?.src || 'unknown'}`)
            );
          });

          tileLayerRef.current.on('load', () => {
            onLoadComplete?.();
          });

          tileLayerRef.current.addTo(map);
        }
      } else {
        // Use custom canvas rendering
        if (!canvasLayerRef.current && data.length > 0) {
          canvasLayerRef.current = new TemperatureCanvasLayer(data, {
            opacity,
            radius,
            blur,
            maxTemperature,
            minTemperature,
            zIndex,
          });
          canvasLayerRef.current.addTo(map);
          onLoadComplete?.();
        } else if (data.length === 0) {
          onError?.(new Error('No temperature data available'));
        }
      }
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error('Failed to load temperature layer');
      onError?.(errorObj);
    }

    return () => {
      if (canvasLayerRef.current) {
        map.removeLayer(canvasLayerRef.current);
        canvasLayerRef.current = null;
      }
      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
        tileLayerRef.current = null;
      }
    };
  }, [map, useWeatherTiles, apiKey, tileLayer, zIndex]);

  // Update canvas layer when data or options change
  useEffect(() => {
    if (canvasLayerRef.current && !useWeatherTiles) {
      canvasLayerRef.current.updateData(data);
    }
  }, [data, useWeatherTiles]);

  useEffect(() => {
    if (canvasLayerRef.current && !useWeatherTiles) {
      canvasLayerRef.current.updateOptions({
        opacity,
        radius,
        blur,
        maxTemperature,
        minTemperature,
        zIndex,
      });
    }
  }, [opacity, radius, blur, maxTemperature, minTemperature, zIndex, useWeatherTiles]);

  // Update tile layer opacity
  useEffect(() => {
    if (tileLayerRef.current && useWeatherTiles) {
      tileLayerRef.current.setOpacity(opacity);
    }
  }, [opacity, useWeatherTiles]);

  return null;
};

export default TemperatureHeatmapLayer;
