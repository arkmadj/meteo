/**
 * Adaptive Map Rendering Hook
 * Automatically adjusts map rendering quality based on device performance
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  detectDeviceCapabilities,
  getPerformanceRecommendations,
  type DeviceCapabilities,
  type PerformanceTier,
} from '@/utils/devicePerformance';
import { usePerformanceMonitor, usePerformanceSettings } from './usePerformanceMonitor';

export interface AdaptiveRenderingConfig {
  /** Enable automatic quality adjustment (default: true) */
  autoAdjust?: boolean;
  /** Initial quality tier override */
  initialTier?: PerformanceTier;
  /** Enable performance monitoring (default: true) */
  enableMonitoring?: boolean;
  /** Callback when quality tier changes */
  onTierChange?: (tier: PerformanceTier) => void;
}

export interface MapRenderingSettings {
  /** Tile layer settings */
  tiles: {
    size: number;
    maxZoom: number;
    updateThrottle: number;
  };
  /** Marker settings */
  markers: {
    maxCount: number;
    enableClustering: boolean;
    clusterRadius: number;
  };
  /** Animation settings */
  animations: {
    enabled: boolean;
    duration: number;
    enableTransitions: boolean;
    enableInertia: boolean;
  };
  /** Rendering settings */
  rendering: {
    useCanvas: boolean;
    enableShadows: boolean;
    enableBlur: boolean;
    layerOpacity: number;
    maxLayers: number;
  };
  /** Interaction settings */
  interactions: {
    wheelDebounce: number;
    inertiaDeceleration: number;
    enableSmoothing: boolean;
  };
}

export interface AdaptiveRenderingResult {
  /** Current performance tier */
  tier: PerformanceTier;
  /** Device capabilities */
  capabilities: DeviceCapabilities | null;
  /** Map rendering settings */
  settings: MapRenderingSettings;
  /** Whether capabilities are loading */
  isLoading: boolean;
  /** Current FPS */
  fps: number;
  /** Whether performance is degraded */
  isDegraded: boolean;
  /** Manually set quality tier */
  setTier: (tier: PerformanceTier) => void;
  /** Force recalculation of capabilities */
  recalculate: () => Promise<void>;
}

/**
 * Get default rendering settings for a performance tier
 */
function getDefaultSettings(tier: PerformanceTier): MapRenderingSettings {
  const baseSettings: MapRenderingSettings = {
    tiles: {
      size: 512,
      maxZoom: 18,
      updateThrottle: 100,
    },
    markers: {
      maxCount: 100,
      enableClustering: false,
      clusterRadius: 80,
    },
    animations: {
      enabled: true,
      duration: 300,
      enableTransitions: true,
      enableInertia: true,
    },
    rendering: {
      useCanvas: false,
      enableShadows: true,
      enableBlur: true,
      layerOpacity: 1,
      maxLayers: 5,
    },
    interactions: {
      wheelDebounce: 40,
      inertiaDeceleration: 3000,
      enableSmoothing: true,
    },
  };

  if (tier === 'low') {
    return {
      tiles: {
        size: 256,
        maxZoom: 16,
        updateThrottle: 300,
      },
      markers: {
        maxCount: 25,
        enableClustering: true,
        clusterRadius: 120,
      },
      animations: {
        enabled: false,
        duration: 0,
        enableTransitions: false,
        enableInertia: false,
      },
      rendering: {
        useCanvas: true,
        enableShadows: false,
        enableBlur: false,
        layerOpacity: 0.8,
        maxLayers: 2,
      },
      interactions: {
        wheelDebounce: 100,
        inertiaDeceleration: 1500,
        enableSmoothing: false,
      },
    };
  }

  if (tier === 'medium') {
    return {
      tiles: {
        size: 512,
        maxZoom: 18,
        updateThrottle: 200,
      },
      markers: {
        maxCount: 50,
        enableClustering: true,
        clusterRadius: 80,
      },
      animations: {
        enabled: true,
        duration: 200,
        enableTransitions: true,
        enableInertia: true,
      },
      rendering: {
        useCanvas: false,
        enableShadows: false,
        enableBlur: true,
        layerOpacity: 0.9,
        maxLayers: 3,
      },
      interactions: {
        wheelDebounce: 60,
        inertiaDeceleration: 2500,
        enableSmoothing: true,
      },
    };
  }

  return baseSettings;
}

/**
 * Hook for adaptive map rendering based on device performance
 */
export function useAdaptiveMapRendering(
  config: AdaptiveRenderingConfig = {}
): AdaptiveRenderingResult {
  const { autoAdjust = true, initialTier, enableMonitoring = true, onTierChange } = config;

  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [manualTier, setManualTier] = useState<PerformanceTier | null>(
    initialTier || null
  );

  // Performance monitoring
  const {
    metrics,
    qualityTier: monitoredTier,
    startMonitoring,
    stopMonitoring,
  } = usePerformanceMonitor({
    autoAdjust: autoAdjust && enableMonitoring,
    targetFPS: 60,
    degradationThreshold: 30,
    onPerformanceDegraded: metrics => {
      console.warn('Map performance degraded:', metrics);
    },
    onPerformanceImproved: metrics => {
      console.log('Map performance improved:', metrics);
    },
  });

  // Determine current tier
  const currentTier = useMemo(() => {
    if (manualTier) return manualTier;
    if (enableMonitoring && autoAdjust) return monitoredTier;
    if (capabilities) return capabilities.tier;
    return 'medium';
  }, [manualTier, enableMonitoring, autoAdjust, monitoredTier, capabilities]);

  // Get rendering settings
  const settings = useMemo(() => {
    let baseSettings = getDefaultSettings(currentTier);

    // Apply capability-specific adjustments
    if (capabilities) {
      const recommendations = getPerformanceRecommendations(capabilities);

      baseSettings = {
        tiles: {
          size: recommendations.tileSize,
          maxZoom: recommendations.maxZoom,
          updateThrottle: recommendations.updateThrottle,
        },
        markers: {
          maxCount: recommendations.maxMarkers,
          enableClustering: recommendations.enableClustering,
          clusterRadius: recommendations.clusterRadius,
        },
        animations: {
          enabled: recommendations.enableAnimations,
          duration: recommendations.enableAnimations ? 300 : 0,
          enableTransitions: recommendations.enableTransitions,
          enableInertia: recommendations.enableInertia,
        },
        rendering: {
          useCanvas: recommendations.useCanvas,
          enableShadows: recommendations.enableShadows,
          enableBlur: recommendations.enableBlur,
          layerOpacity: recommendations.layerOpacity,
          maxLayers: recommendations.maxLayers,
        },
        interactions: {
          wheelDebounce: recommendations.wheelDebounce,
          inertiaDeceleration: recommendations.inertiaDeceleration,
          enableSmoothing: currentTier !== 'low',
        },
      };

      // Override animations if reduced motion is preferred
      if (capabilities.prefersReducedMotion) {
        baseSettings.animations.enabled = false;
        baseSettings.animations.enableTransitions = false;
        baseSettings.animations.enableInertia = false;
      }
    }

    return baseSettings;
  }, [currentTier, capabilities]);

  /**
   * Detect device capabilities
   */
  const detectCapabilities = useCallback(async () => {
    setIsLoading(true);
    try {
      const caps = await detectDeviceCapabilities();
      setCapabilities(caps);
      console.log('Device capabilities detected:', caps);
    } catch (error) {
      console.error('Failed to detect device capabilities:', error);
      // Fallback to medium tier
      setCapabilities({
        tier: 'medium',
        cores: 4,
        gpuTier: 'medium',
        prefersReducedMotion: false,
        prefersReducedData: false,
        isOnBattery: false,
        supportsHardwareAcceleration: true,
        devicePixelRatio: 1,
        screenSize: 'medium',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initialize capabilities detection
   */
  useEffect(() => {
    detectCapabilities();
  }, [detectCapabilities]);

  /**
   * Start/stop performance monitoring
   */
  useEffect(() => {
    if (enableMonitoring && !isLoading) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [enableMonitoring, isLoading, startMonitoring, stopMonitoring]);

  /**
   * Notify tier changes
   */
  useEffect(() => {
    onTierChange?.(currentTier);
  }, [currentTier, onTierChange]);

  /**
   * Manually set quality tier
   */
  const setTier = useCallback(
    (tier: PerformanceTier) => {
      setManualTier(tier);
      console.log('Manual quality tier set:', tier);
    },
    []
  );

  return {
    tier: currentTier,
    capabilities,
    settings,
    isLoading,
    fps: metrics.fps,
    isDegraded: metrics.isDegraded,
    setTier,
    recalculate: detectCapabilities,
  };
}

