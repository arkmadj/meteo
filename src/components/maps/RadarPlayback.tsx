/**
 * RadarPlayback Component
 *
 * Animated radar playback displaying precipitation movement over time
 * using frame-based radar tiles with timeline controls.
 *
 * Performance optimizations:
 * - Tile layer caching with reuse
 * - Memoized callbacks to prevent re-renders
 * - requestAnimationFrame for smooth 60fps
 * - Efficient opacity switching instead of layer recreation
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

import { usePrefersReducedMotion } from '@/hooks/useMotion';

export interface RadarFrame {
  /** Timestamp of the radar frame */
  timestamp: number;
  /** Tile URL template for this frame */
  tileUrl: string;
  /** Human-readable time label */
  label: string;
}

export interface RadarPlaybackProps {
  /** Array of radar frames to animate */
  frames: RadarFrame[];
  /** Opacity of radar overlay (0-1) */
  opacity?: number;
  /** Playback speed in frames per second */
  fps?: number;
  /** Auto-play on mount */
  autoPlay?: boolean;
  /** Loop playback */
  loop?: boolean;
  /** Z-index for the layer */
  zIndex?: number;
  /** Enable tile caching for better performance */
  enableCaching?: boolean;
  /** Callback when frame changes */
  onFrameChange?: (frameIndex: number, frame: RadarFrame) => void;
  /** Callback when playback starts */
  onPlaybackStart?: () => void;
  /** Callback when playback stops */
  onPlaybackStop?: () => void;
  /** Callback when playback completes */
  onPlaybackComplete?: () => void;
}

/**
 * RadarPlayback Component (Optimized)
 */
const RadarPlayback: React.FC<RadarPlaybackProps> = React.memo(
  ({
    frames,
    opacity = 0.7,
    fps = 2,
    autoPlay = false,
    loop = true,
    zIndex = 500,
    enableCaching = true,
    onFrameChange,
    onPlaybackStart,
    onPlaybackStop,
    onPlaybackComplete,
  }) => {
    const map = useMap();
    const prefersReducedMotion = usePrefersReducedMotion();

    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(autoPlay && !prefersReducedMotion);

    const tileLayersRef = useRef<Map<number, L.TileLayer>>(new Map());
    const animationFrameRef = useRef<number | null>(null);
    const lastFrameTimeRef = useRef<number>(0);
    const frameHashRef = useRef<string>('');

    /**
     * Memoize frame hash to detect changes
     */
    const frameHash = useMemo(() => {
      return frames.map(f => f.tileUrl).join('|');
    }, [frames]);

    /**
     * Create tile layer for a specific frame with caching
     */
    const createTileLayer = useCallback(
      (frame: RadarFrame, frameIndex: number): L.TileLayer => {
        const layer = L.tileLayer(frame.tileUrl, {
          opacity: 0,
          maxZoom: 18,
          minZoom: 3,
          zIndex: zIndex + frameIndex,
          attribution: 'Radar data',
          // Performance optimizations
          updateWhenIdle: true,
          updateWhenZooming: false,
          keepBuffer: 2,
          // Enable tile caching
          ...(enableCaching && {
            crossOrigin: 'anonymous',
            className: 'radar-tile-cached',
          }),
        });

        return layer;
      },
      [zIndex, enableCaching]
    );

    /**
     * Initialize tile layers for all frames (optimized with caching)
     */
    useEffect(() => {
      if (!map || frames.length === 0) return;

      // Check if frames have changed
      const hasFramesChanged = frameHash !== frameHashRef.current;
      frameHashRef.current = frameHash;

      // Only recreate layers if frames changed
      if (hasFramesChanged) {
        // Clear old layers
        tileLayersRef.current.forEach(layer => {
          if (map.hasLayer(layer)) {
            map.removeLayer(layer);
          }
        });
        tileLayersRef.current.clear();

        // Create new tile layers for all frames
        frames.forEach((frame, index) => {
          const layer = createTileLayer(frame, index);
          layer.addTo(map);
          tileLayersRef.current.set(index, layer);
        });
      }

      // Show first frame
      const firstLayer = tileLayersRef.current.get(0);
      if (firstLayer) {
        firstLayer.setOpacity(opacity);
      }

      // Cleanup
      return () => {
        tileLayersRef.current.forEach(layer => {
          if (map.hasLayer(layer)) {
            map.removeLayer(layer);
          }
        });
        tileLayersRef.current.clear();
      };
    }, [map, frames, createTileLayer, opacity, frameHash]);

    /**
     * Update visible frame
     */
    const showFrame = useCallback(
      (frameIndex: number) => {
        // Hide all layers
        tileLayersRef.current.forEach((layer, index) => {
          if (index === frameIndex) {
            layer.setOpacity(opacity);
          } else {
            layer.setOpacity(0);
          }
        });

        setCurrentFrameIndex(frameIndex);

        if (frames[frameIndex]) {
          onFrameChange?.(frameIndex, frames[frameIndex]);
        }
      },
      [frames, opacity, onFrameChange]
    );

    /**
     * Animation loop
     */
    const animate = useCallback(
      (timestamp: number) => {
        if (!isPlaying) return;

        const frameInterval = 1000 / fps;

        if (timestamp - lastFrameTimeRef.current >= frameInterval) {
          setCurrentFrameIndex(prevIndex => {
            const nextIndex = prevIndex + 1;

            if (nextIndex >= frames.length) {
              if (loop) {
                showFrame(0);
                return 0;
              } else {
                setIsPlaying(false);
                onPlaybackComplete?.();
                return prevIndex;
              }
            }

            showFrame(nextIndex);
            return nextIndex;
          });

          lastFrameTimeRef.current = timestamp;
        }

        animationFrameRef.current = requestAnimationFrame(animate);
      },
      [isPlaying, fps, frames.length, loop, showFrame, onPlaybackComplete]
    );

    /**
     * Start/stop animation
     */
    useEffect(() => {
      if (isPlaying && !prefersReducedMotion) {
        lastFrameTimeRef.current = performance.now();
        animationFrameRef.current = requestAnimationFrame(animate);
        onPlaybackStart?.();
      } else {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        if (!isPlaying) {
          onPlaybackStop?.();
        }
      }

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [isPlaying, animate, prefersReducedMotion, onPlaybackStart, onPlaybackStop]);

    /**
     * Update opacity when prop changes
     */
    useEffect(() => {
      const currentLayer = tileLayersRef.current.get(currentFrameIndex);
      if (currentLayer) {
        currentLayer.setOpacity(opacity);
      }
    }, [opacity, currentFrameIndex]);

    /**
     * Public API for controlling playback
     */
    useEffect(() => {
      // Expose control methods via ref if needed
      const controls = {
        play: () => setIsPlaying(true),
        pause: () => setIsPlaying(false),
        stop: () => {
          setIsPlaying(false);
          showFrame(0);
        },
        goToFrame: (index: number) => {
          if (index >= 0 && index < frames.length) {
            showFrame(index);
          }
        },
        nextFrame: () => {
          const nextIndex = (currentFrameIndex + 1) % frames.length;
          showFrame(nextIndex);
        },
        previousFrame: () => {
          const prevIndex = currentFrameIndex === 0 ? frames.length - 1 : currentFrameIndex - 1;
          showFrame(prevIndex);
        },
      };

      // Store controls on window for external access if needed
      (window as any).__radarPlaybackControls = controls;

      return () => {
        delete (window as any).__radarPlaybackControls;
      };
    }, [currentFrameIndex, frames.length, showFrame]);

    return null;
  },
  (prevProps, nextProps) => {
    // Custom comparison for React.memo optimization
    return (
      prevProps.opacity === nextProps.opacity &&
      prevProps.fps === nextProps.fps &&
      prevProps.autoPlay === nextProps.autoPlay &&
      prevProps.loop === nextProps.loop &&
      prevProps.zIndex === nextProps.zIndex &&
      prevProps.enableCaching === nextProps.enableCaching &&
      prevProps.frames.length === nextProps.frames.length &&
      prevProps.frames.every((frame, i) => frame.tileUrl === nextProps.frames[i]?.tileUrl)
    );
  }
);

RadarPlayback.displayName = 'RadarPlayback';

export default RadarPlayback;
