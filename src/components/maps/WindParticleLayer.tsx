/**
 * WindParticleLayer Component
 *
 * A custom Leaflet layer that renders animated wind particles using HTML5 Canvas.
 * Particles flow in the direction of wind, with speed determining their velocity.
 * Respects user preferences for reduced motion.
 */

import { useUserPreferencesContext } from '@/contexts/UserPreferencesContext';
import { useTheme } from '@/design-system/theme';
import L from 'leaflet';
import { useCallback, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

export interface WindDataPoint {
  lat: number;
  lng: number;
  speed: number; // Wind speed in m/s
  direction: number; // Wind direction in degrees (0-360, where 0 is North)
}

export interface WindParticleLayerProps {
  /** Wind data points to generate particles from */
  data?: WindDataPoint[];
  /** Number of particles to render */
  particleCount?: number;
  /** Particle trail length (0-1) */
  trailLength?: number;
  /** Particle opacity (0-1) */
  opacity?: number;
  /** Particle line width in pixels */
  lineWidth?: number;
  /** Speed multiplier for animation */
  speedMultiplier?: number;
  /** Particle color (CSS color string or 'auto' for theme-aware) */
  color?: string;
  /** Z-index for the layer */
  zIndex?: number;
  /** Callback when layer loading starts */
  onLoadStart?: () => void;
  /** Callback when layer loading completes */
  onLoadComplete?: () => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
}

interface Particle {
  x: number;
  y: number;
  age: number;
  maxAge: number;
  vx: number;
  vy: number;
  originLat: number;
  originLng: number;
}

/**
 * Convert wind direction (meteorological) to mathematical angle
 * Meteorological: 0° = North, 90° = East, 180° = South, 270° = West
 * Wind direction indicates where wind is coming FROM, so we add 180° to get flow direction
 */
const windDirectionToAngle = (direction: number): number => {
  // Convert from "coming from" to "going to" by adding 180
  // Convert from meteorological (0=N, clockwise) to mathematical (0=E, counter-clockwise)
  const flowDirection = (direction + 180) % 360;
  const mathAngle = (90 - flowDirection) * (Math.PI / 180);
  return mathAngle;
};

/**
 * Interpolate wind data at a given point using inverse distance weighting
 */
const interpolateWind = (
  lat: number,
  lng: number,
  windData: WindDataPoint[]
): { speed: number; direction: number } => {
  if (windData.length === 0) {
    return { speed: 0, direction: 0 };
  }

  if (windData.length === 1) {
    return { speed: windData[0].speed, direction: windData[0].direction };
  }

  let totalWeight = 0;
  let speedSum = 0;
  let sinSum = 0;
  let cosSum = 0;

  windData.forEach(point => {
    const dx = point.lng - lng;
    const dy = point.lat - lat;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Avoid division by zero
    if (distance < 0.0001) {
      return { speed: point.speed, direction: point.direction };
    }

    const weight = 1 / (distance * distance);
    totalWeight += weight;
    speedSum += point.speed * weight;

    // Average directions using vector components
    const radians = point.direction * (Math.PI / 180);
    sinSum += Math.sin(radians) * weight;
    cosSum += Math.cos(radians) * weight;
  });

  if (totalWeight === 0) {
    return { speed: 0, direction: 0 };
  }

  const avgSpeed = speedSum / totalWeight;
  const avgDirection =
    ((Math.atan2(sinSum / totalWeight, cosSum / totalWeight) * 180) / Math.PI + 360) % 360;

  return { speed: avgSpeed, direction: avgDirection };
};

/**
 * Get color based on wind speed
 */
const getWindSpeedColor = (speed: number, baseColor: string): string => {
  if (baseColor !== 'auto') return baseColor;

  // Color gradient based on Beaufort scale approximation
  if (speed < 1) return 'rgba(200, 200, 200, 0.6)'; // Calm
  if (speed < 4) return 'rgba(100, 180, 255, 0.7)'; // Light breeze
  if (speed < 8) return 'rgba(50, 150, 255, 0.8)'; // Moderate breeze
  if (speed < 14) return 'rgba(0, 120, 255, 0.85)'; // Fresh breeze
  if (speed < 20) return 'rgba(0, 80, 200, 0.9)'; // Strong breeze
  return 'rgba(0, 40, 150, 0.95)'; // Gale+
};

/**
 * Custom Leaflet Canvas Layer for Wind Particles
 */
class WindCanvasLayer extends L.Layer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animationFrameId: number | null = null;
  private data: WindDataPoint[];
  private layerOptions: Required<
    Omit<WindParticleLayerProps, 'data' | 'onLoadStart' | 'onLoadComplete' | 'onError'>
  >;
  private isPaused: boolean = false;
  private baseColor: string;

  constructor(
    data: WindDataPoint[],
    options: Omit<WindParticleLayerProps, 'data' | 'onLoadStart' | 'onLoadComplete' | 'onError'>
  ) {
    super();
    this.data = data;
    this.layerOptions = {
      particleCount: options.particleCount ?? 2000,
      trailLength: options.trailLength ?? 0.95,
      opacity: options.opacity ?? 0.8,
      lineWidth: options.lineWidth ?? 1.5,
      speedMultiplier: options.speedMultiplier ?? 0.3,
      color: options.color ?? 'auto',
      zIndex: options.zIndex ?? 450,
    };
    this.baseColor = this.layerOptions.color;
  }

  onAdd(map: L.Map): this {
    if (!this.canvas) {
      this.canvas = L.DomUtil.create('canvas', 'wind-particle-layer');
      this.canvas.style.position = 'absolute';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = this.layerOptions.zIndex.toString();

      const size = map.getSize();
      this.canvas.width = size.x;
      this.canvas.height = size.y;

      this.ctx = this.canvas.getContext('2d');

      const pane = map.getPanes().overlayPane;
      if (pane) {
        pane.appendChild(this.canvas);
      }
    }

    this.initParticles();

    map.on('movestart', this.pause, this);
    map.on('moveend', this.resume, this);
    map.on('zoomstart', this.pause, this);
    map.on('zoomend', this.resume, this);
    map.on('resize', this.resize, this);

    this.animate();
    return this;
  }

  onRemove(map: L.Map): this {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    map.off('movestart', this.pause, this);
    map.off('moveend', this.resume, this);
    map.off('zoomstart', this.pause, this);
    map.off('zoomend', this.resume, this);
    map.off('resize', this.resize, this);

    return this;
  }

  private pause = () => {
    this.isPaused = true;
  };

  private resume = () => {
    this.isPaused = false;
    this.initParticles();
    if (!this.animationFrameId) {
      this.animate();
    }
  };

  private resize = () => {
    const map = this._map;
    if (!map || !this.canvas) return;

    const size = map.getSize();
    this.canvas.width = size.x;
    this.canvas.height = size.y;
    this.initParticles();
  };

  private initParticles() {
    const map = this._map;
    if (!map || !this.canvas) return;

    const bounds = map.getBounds();
    this.particles = [];

    for (let i = 0; i < this.layerOptions.particleCount; i++) {
      const lat = bounds.getSouth() + Math.random() * (bounds.getNorth() - bounds.getSouth());
      const lng = bounds.getWest() + Math.random() * (bounds.getEast() - bounds.getWest());

      const wind = interpolateWind(lat, lng, this.data);
      const angle = windDirectionToAngle(wind.direction);
      const speed = wind.speed * this.layerOptions.speedMultiplier;

      const point = map.latLngToContainerPoint([lat, lng]);

      this.particles.push({
        x: point.x,
        y: point.y,
        age: Math.floor(Math.random() * 100),
        maxAge: 80 + Math.floor(Math.random() * 40),
        vx: Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed, // Negative because canvas Y is inverted
        originLat: lat,
        originLng: lng,
      });
    }
  }

  private animate = () => {
    if (!this._map || !this.canvas || !this.ctx) {
      this.animationFrameId = null;
      return;
    }

    if (!this.isPaused) {
      this.draw();
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private draw() {
    const map = this._map;
    if (!map || !this.canvas || !this.ctx) return;

    const ctx = this.ctx;
    const bounds = map.getBounds();
    const topLeft = map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this.canvas, topLeft);

    // Fade previous frame for trail effect
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = `rgba(0, 0, 0, ${this.layerOptions.trailLength})`;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.globalCompositeOperation = 'source-over';

    // Draw particles
    ctx.lineWidth = this.layerOptions.lineWidth;
    ctx.lineCap = 'round';
    ctx.globalAlpha = this.layerOptions.opacity;

    this.particles.forEach(particle => {
      particle.age++;

      // Reset particle if too old or out of bounds
      if (
        particle.age > particle.maxAge ||
        particle.x < -10 ||
        particle.x > this.canvas!.width + 10 ||
        particle.y < -10 ||
        particle.y > this.canvas!.height + 10
      ) {
        // Respawn at random position within bounds
        const lat = bounds.getSouth() + Math.random() * (bounds.getNorth() - bounds.getSouth());
        const lng = bounds.getWest() + Math.random() * (bounds.getEast() - bounds.getWest());

        const wind = interpolateWind(lat, lng, this.data);
        const angle = windDirectionToAngle(wind.direction);
        const speed = wind.speed * this.layerOptions.speedMultiplier;

        const point = map.latLngToContainerPoint([lat, lng]);

        particle.x = point.x;
        particle.y = point.y;
        particle.age = 0;
        particle.maxAge = 80 + Math.floor(Math.random() * 40);
        particle.vx = Math.cos(angle) * speed;
        particle.vy = -Math.sin(angle) * speed;
        particle.originLat = lat;
        particle.originLng = lng;
        return;
      }

      const oldX = particle.x;
      const oldY = particle.y;

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Update velocity based on current position wind
      const latLng = map.containerPointToLatLng([particle.x, particle.y]);
      const wind = interpolateWind(latLng.lat, latLng.lng, this.data);
      const angle = windDirectionToAngle(wind.direction);
      const speed = wind.speed * this.layerOptions.speedMultiplier;

      particle.vx = Math.cos(angle) * speed;
      particle.vy = -Math.sin(angle) * speed;

      // Draw particle trail
      const color = getWindSpeedColor(wind.speed, this.baseColor);
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(oldX, oldY);
      ctx.lineTo(particle.x, particle.y);
      ctx.stroke();
    });
  }

  updateData(newData: WindDataPoint[]) {
    this.data = newData;
    this.initParticles();
  }

  updateOptions(
    newOptions: Partial<
      Omit<WindParticleLayerProps, 'data' | 'onLoadStart' | 'onLoadComplete' | 'onError'>
    >
  ) {
    this.layerOptions = { ...this.layerOptions, ...newOptions };
    if (newOptions.color) {
      this.baseColor = newOptions.color;
    }
    if (newOptions.particleCount && newOptions.particleCount !== this.particles.length) {
      this.initParticles();
    }
  }

  setColor(color: string) {
    this.baseColor = color;
  }
}

/**
 * React component wrapper for the wind particle layer
 */
const WindParticleLayer: React.FC<WindParticleLayerProps> = ({
  data = [],
  particleCount = 2000,
  trailLength = 0.95,
  opacity = 0.8,
  lineWidth = 1.5,
  speedMultiplier = 0.3,
  color = 'auto',
  zIndex = 450,
  onLoadStart,
  onLoadComplete,
  onError,
}) => {
  const map = useMap();
  const canvasLayerRef = useRef<WindCanvasLayer | null>(null);
  const { preferences } = useUserPreferencesContext();
  const { theme } = useTheme();

  // Determine particle color based on theme if auto
  const effectiveColor = useCallback(() => {
    if (color !== 'auto') return color;
    return theme.isDark ? 'rgba(100, 180, 255, 0.8)' : 'auto';
  }, [color, theme.isDark]);

  useEffect(() => {
    if (!map) return;

    // Skip animation if user prefers reduced motion
    if (preferences.prefersReducedMotion) {
      onError?.(new Error('Animation disabled due to reduced motion preference'));
      return;
    }

    try {
      onLoadStart?.();

      if (data.length === 0) {
        onError?.(new Error('No wind data available'));
        return;
      }

      // Create canvas layer if it doesn't exist
      if (!canvasLayerRef.current) {
        canvasLayerRef.current = new WindCanvasLayer(data, {
          particleCount,
          trailLength,
          opacity,
          lineWidth,
          speedMultiplier,
          color: effectiveColor(),
          zIndex,
        });
        canvasLayerRef.current.addTo(map);
        onLoadComplete?.();
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Failed to load wind layer');
      onError?.(errorObj);
    }

    return () => {
      if (canvasLayerRef.current) {
        map.removeLayer(canvasLayerRef.current);
        canvasLayerRef.current = null;
      }
    };
  }, [map, preferences.prefersReducedMotion, zIndex, onLoadStart, onLoadComplete, onError]);

  // Update canvas layer when data changes
  useEffect(() => {
    if (canvasLayerRef.current) {
      canvasLayerRef.current.updateData(data);
    }
  }, [data]);

  // Update canvas layer options when they change
  useEffect(() => {
    if (canvasLayerRef.current) {
      canvasLayerRef.current.updateOptions({
        particleCount,
        trailLength,
        opacity,
        lineWidth,
        speedMultiplier,
        color: effectiveColor(),
        zIndex,
      });
    }
  }, [particleCount, trailLength, opacity, lineWidth, speedMultiplier, effectiveColor, zIndex]);

  return null;
};

export default WindParticleLayer;
