/**
 * Performance Monitoring Hook
 * Monitors FPS and adjusts rendering quality dynamically
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { PerformanceMetrics, PerformanceTier } from '@/utils/devicePerformance';

export interface PerformanceMonitorConfig {
  /** Target FPS (default: 60) */
  targetFPS?: number;
  /** FPS threshold for degradation (default: 30) */
  degradationThreshold?: number;
  /** Number of frames to average (default: 60) */
  sampleSize?: number;
  /** Enable automatic quality adjustment (default: true) */
  autoAdjust?: boolean;
  /** Callback when performance degrades */
  onPerformanceDegraded?: (metrics: PerformanceMetrics) => void;
  /** Callback when performance improves */
  onPerformanceImproved?: (metrics: PerformanceMetrics) => void;
  /** Callback on metrics update */
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

export interface PerformanceMonitorResult {
  /** Current performance metrics */
  metrics: PerformanceMetrics;
  /** Current quality tier */
  qualityTier: PerformanceTier;
  /** Whether monitoring is active */
  isMonitoring: boolean;
  /** Start monitoring */
  startMonitoring: () => void;
  /** Stop monitoring */
  stopMonitoring: () => void;
  /** Reset metrics */
  resetMetrics: () => void;
  /** Manually adjust quality tier */
  setQualityTier: (tier: PerformanceTier) => void;
}

/**
 * Calculate FPS from frame times
 */
function calculateFPS(frameTimes: number[]): number {
  if (frameTimes.length === 0) return 60;

  const avgFrameTime = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
  return Math.round(1000 / avgFrameTime);
}

/**
 * Calculate average frame time
 */
function calculateAvgFrameTime(frameTimes: number[]): number {
  if (frameTimes.length === 0) return 16.67; // 60 FPS

  return frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
}

/**
 * Get memory usage if available
 */
function getMemoryUsage(): number | undefined {
  // @ts-ignore - performance.memory is non-standard
  if (performance.memory) {
    // @ts-ignore
    return Math.round(performance.memory.usedJSHeapSize / 1048576); // Convert to MB
  }
  return undefined;
}

/**
 * Estimate CPU usage based on frame time variance
 */
function estimateCPUUsage(frameTimes: number[]): number | undefined {
  if (frameTimes.length < 10) return undefined;

  const avgFrameTime = calculateAvgFrameTime(frameTimes);
  const variance =
    frameTimes.reduce((sum, time) => {
      return sum + Math.pow(time - avgFrameTime, 2);
    }, 0) / frameTimes.length;

  const stdDev = Math.sqrt(variance);

  // High variance indicates high CPU usage
  // Normalize to 0-1 range (assuming max stdDev of 50ms)
  return Math.min(stdDev / 50, 1);
}

/**
 * Determine quality tier based on FPS
 */
function determineQualityTier(fps: number, targetFPS: number): PerformanceTier {
  const ratio = fps / targetFPS;

  if (ratio >= 0.9) return 'high'; // 90%+ of target
  if (ratio >= 0.5) return 'medium'; // 50-90% of target
  return 'low'; // <50% of target
}

/**
 * Hook to monitor performance and adjust quality dynamically
 */
export function usePerformanceMonitor(
  config: PerformanceMonitorConfig = {}
): PerformanceMonitorResult {
  const {
    targetFPS = 60,
    degradationThreshold = 30,
    sampleSize = 60,
    autoAdjust = true,
    onPerformanceDegraded,
    onPerformanceImproved,
    onMetricsUpdate,
  } = config;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    isDegraded: false,
  });

  const [qualityTier, setQualityTier] = useState<PerformanceTier>('high');
  const [isMonitoring, setIsMonitoring] = useState(false);

  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const rafIdRef = useRef<number | null>(null);
  const wasDegradedRef = useRef(false);

  /**
   * Measure frame performance
   */
  const measureFrame = useCallback(() => {
    const now = performance.now();
    const frameTime = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;

    // Add to frame times buffer
    frameTimesRef.current.push(frameTime);
    if (frameTimesRef.current.length > sampleSize) {
      frameTimesRef.current.shift();
    }

    // Calculate metrics every 10 frames
    if (frameTimesRef.current.length % 10 === 0) {
      const fps = calculateFPS(frameTimesRef.current);
      const avgFrameTime = calculateAvgFrameTime(frameTimesRef.current);
      const memoryUsage = getMemoryUsage();
      const cpuUsage = estimateCPUUsage(frameTimesRef.current);
      const isDegraded = fps < degradationThreshold;

      const newMetrics: PerformanceMetrics = {
        fps,
        frameTime: avgFrameTime,
        memoryUsage,
        cpuUsage,
        isDegraded,
      };

      setMetrics(newMetrics);
      onMetricsUpdate?.(newMetrics);

      // Auto-adjust quality tier
      if (autoAdjust) {
        const newTier = determineQualityTier(fps, targetFPS);
        setQualityTier(newTier);
      }

      // Trigger callbacks
      if (isDegraded && !wasDegradedRef.current) {
        onPerformanceDegraded?.(newMetrics);
        wasDegradedRef.current = true;
      } else if (!isDegraded && wasDegradedRef.current) {
        onPerformanceImproved?.(newMetrics);
        wasDegradedRef.current = false;
      }
    }

    // Continue monitoring
    if (isMonitoring) {
      rafIdRef.current = requestAnimationFrame(measureFrame);
    }
  }, [
    isMonitoring,
    sampleSize,
    degradationThreshold,
    targetFPS,
    autoAdjust,
    onPerformanceDegraded,
    onPerformanceImproved,
    onMetricsUpdate,
  ]);

  /**
   * Start monitoring
   */
  const startMonitoring = useCallback(() => {
    if (!isMonitoring) {
      setIsMonitoring(true);
      lastFrameTimeRef.current = performance.now();
      rafIdRef.current = requestAnimationFrame(measureFrame);
    }
  }, [isMonitoring, measureFrame]);

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback(() => {
    if (isMonitoring) {
      setIsMonitoring(false);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    }
  }, [isMonitoring]);

  /**
   * Reset metrics
   */
  const resetMetrics = useCallback(() => {
    frameTimesRef.current = [];
    setMetrics({
      fps: 60,
      frameTime: 16.67,
      isDegraded: false,
    });
    wasDegradedRef.current = false;
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return {
    metrics,
    qualityTier,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    resetMetrics,
    setQualityTier,
  };
}

/**
 * Hook to get performance-adjusted settings
 */
export function usePerformanceSettings(qualityTier: PerformanceTier) {
  return {
    // Animation settings
    enableAnimations: qualityTier !== 'low',
    animationDuration: qualityTier === 'high' ? 300 : qualityTier === 'medium' ? 200 : 0,

    // Map settings
    tileSize: qualityTier === 'high' ? 512 : 256,
    maxMarkers: qualityTier === 'high' ? 100 : qualityTier === 'medium' ? 50 : 25,
    updateThrottle: qualityTier === 'high' ? 100 : qualityTier === 'medium' ? 200 : 300,

    // Rendering settings
    useCanvas: qualityTier === 'low',
    enableShadows: qualityTier === 'high',
    enableBlur: qualityTier !== 'low',
    imageQuality: qualityTier,

    // Interaction settings
    enableInertia: qualityTier !== 'low',
    wheelDebounce: qualityTier === 'high' ? 40 : qualityTier === 'medium' ? 60 : 100,
  };
}

/**
 * Hook to throttle updates based on performance
 */
export function usePerformanceThrottle(
  callback: (...args: unknown[]) => void,
  qualityTier: PerformanceTier
) {
  const throttleMs = qualityTier === 'high' ? 100 : qualityTier === 'medium' ? 200 : 300;
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: unknown[]) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      if (timeSinceLastCall >= throttleMs) {
        lastCallRef.current = now;
        callback(...args);
      } else {
        // Schedule for later
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          callback(...args);
        }, throttleMs - timeSinceLastCall);
      }
    },
    [callback, throttleMs]
  );
}
