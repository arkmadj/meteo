/**
 * Device Performance Detection Utilities
 * Detects device capabilities and performance characteristics for adaptive rendering
 */

/**
 * Performance tier classification
 */
export type PerformanceTier = 'high' | 'medium' | 'low';

/**
 * Device capabilities
 */
export interface DeviceCapabilities {
  /** Performance tier (high/medium/low) */
  tier: PerformanceTier;
  /** Number of logical CPU cores */
  cores: number;
  /** Device memory in GB (if available) */
  memory?: number;
  /** GPU tier (high/medium/low) */
  gpuTier: PerformanceTier;
  /** Connection type (4g, 3g, 2g, slow-2g, unknown) */
  connectionType?: string;
  /** Effective connection type */
  effectiveType?: string;
  /** Whether device prefers reduced motion */
  prefersReducedMotion: boolean;
  /** Whether device prefers reduced data */
  prefersReducedData: boolean;
  /** Whether device is on battery power */
  isOnBattery: boolean;
  /** Battery level (0-1) if available */
  batteryLevel?: number;
  /** Whether device supports hardware acceleration */
  supportsHardwareAcceleration: boolean;
  /** Maximum texture size for WebGL */
  maxTextureSize?: number;
  /** Device pixel ratio */
  devicePixelRatio: number;
  /** Screen size category */
  screenSize: 'small' | 'medium' | 'large';
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  /** Frames per second */
  fps: number;
  /** Frame time in milliseconds */
  frameTime: number;
  /** Memory usage in MB (if available) */
  memoryUsage?: number;
  /** CPU usage estimate (0-1) */
  cpuUsage?: number;
  /** Whether performance is degraded */
  isDegraded: boolean;
}

/**
 * Detect number of CPU cores
 */
export function detectCPUCores(): number {
  return navigator.hardwareConcurrency || 4; // Default to 4 if unavailable
}

/**
 * Detect device memory in GB
 */
export function detectDeviceMemory(): number | undefined {
  // @ts-ignore - navigator.deviceMemory is experimental
  return navigator.deviceMemory;
}

/**
 * Detect GPU tier using WebGL
 */
export function detectGPUTier(): PerformanceTier {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return 'low';
    }

    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = (gl as WebGLRenderingContext).getParameter(
        debugInfo.UNMASKED_RENDERER_WEBGL
      );
      
      // High-end GPUs
      if (
        /nvidia|geforce|radeon|amd|intel iris|apple m[1-9]/i.test(renderer) &&
        !/intel hd|intel uhd/i.test(renderer)
      ) {
        return 'high';
      }
      
      // Low-end GPUs
      if (/mali|adreno [1-4]|powervr|videocore/i.test(renderer)) {
        return 'low';
      }
    }
    
    return 'medium';
  } catch {
    return 'medium';
  }
}

/**
 * Detect connection type
 */
export function detectConnectionType(): {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
} {
  // @ts-ignore - navigator.connection is experimental
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) {
    return {};
  }
  
  return {
    type: connection.type,
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
  };
}

/**
 * Detect if device prefers reduced motion
 */
export function detectPrefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Detect if device prefers reduced data
 */
export function detectPrefersReducedData(): boolean {
  return window.matchMedia('(prefers-reduced-data: reduce)').matches;
}

/**
 * Detect battery status
 */
export async function detectBatteryStatus(): Promise<{
  isOnBattery: boolean;
  level?: number;
  charging?: boolean;
}> {
  try {
    // @ts-ignore - navigator.getBattery is experimental
    if ('getBattery' in navigator) {
      // @ts-ignore
      const battery = await navigator.getBattery();
      return {
        isOnBattery: !battery.charging,
        level: battery.level,
        charging: battery.charging,
      };
    }
  } catch {
    // Battery API not supported
  }
  
  return { isOnBattery: false };
}

/**
 * Detect hardware acceleration support
 */
export function detectHardwareAcceleration(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

/**
 * Detect maximum WebGL texture size
 */
export function detectMaxTextureSize(): number | undefined {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (gl) {
      return (gl as WebGLRenderingContext).getParameter(
        (gl as WebGLRenderingContext).MAX_TEXTURE_SIZE
      );
    }
  } catch {
    // WebGL not supported
  }
  
  return undefined;
}

/**
 * Detect screen size category
 */
export function detectScreenSize(): 'small' | 'medium' | 'large' {
  const width = window.innerWidth;
  
  if (width < 768) return 'small';
  if (width < 1024) return 'medium';
  return 'large';
}

/**
 * Calculate performance tier based on device capabilities
 */
export function calculatePerformanceTier(capabilities: Partial<DeviceCapabilities>): PerformanceTier {
  let score = 0;
  
  // CPU cores (0-3 points)
  const cores = capabilities.cores || 4;
  if (cores >= 8) score += 3;
  else if (cores >= 4) score += 2;
  else score += 1;
  
  // Memory (0-3 points)
  const memory = capabilities.memory || 4;
  if (memory >= 8) score += 3;
  else if (memory >= 4) score += 2;
  else score += 1;
  
  // GPU tier (0-3 points)
  const gpuTier = capabilities.gpuTier || 'medium';
  if (gpuTier === 'high') score += 3;
  else if (gpuTier === 'medium') score += 2;
  else score += 1;
  
  // Connection (0-2 points)
  const effectiveType = capabilities.effectiveType;
  if (effectiveType === '4g') score += 2;
  else if (effectiveType === '3g') score += 1;
  
  // Screen size (0-1 point)
  if (capabilities.screenSize === 'large') score += 1;
  
  // Total: 0-12 points
  if (score >= 9) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

/**
 * Detect comprehensive device capabilities
 */
export async function detectDeviceCapabilities(): Promise<DeviceCapabilities> {
  const cores = detectCPUCores();
  const memory = detectDeviceMemory();
  const gpuTier = detectGPUTier();
  const connection = detectConnectionType();
  const prefersReducedMotion = detectPrefersReducedMotion();
  const prefersReducedData = detectPrefersReducedData();
  const battery = await detectBatteryStatus();
  const supportsHardwareAcceleration = detectHardwareAcceleration();
  const maxTextureSize = detectMaxTextureSize();
  const devicePixelRatio = window.devicePixelRatio || 1;
  const screenSize = detectScreenSize();
  
  const capabilities: DeviceCapabilities = {
    tier: 'medium', // Will be calculated
    cores,
    memory,
    gpuTier,
    connectionType: connection.type,
    effectiveType: connection.effectiveType,
    prefersReducedMotion,
    prefersReducedData,
    isOnBattery: battery.isOnBattery,
    batteryLevel: battery.level,
    supportsHardwareAcceleration,
    maxTextureSize,
    devicePixelRatio,
    screenSize,
  };
  
  // Calculate overall performance tier
  capabilities.tier = calculatePerformanceTier(capabilities);
  
  return capabilities;
}

/**
 * Get performance recommendations based on device capabilities
 */
export function getPerformanceRecommendations(capabilities: DeviceCapabilities) {
  const recommendations = {
    // Map rendering
    maxMarkers: 100,
    tileSize: 512,
    enableAnimations: true,
    enableTransitions: true,
    useCanvas: false,
    maxZoom: 18,
    updateThrottle: 100,
    
    // Layer rendering
    maxLayers: 5,
    layerOpacity: 1,
    enableClustering: false,
    clusterRadius: 80,
    
    // Interaction
    enableInertia: true,
    inertiaDeceleration: 3000,
    wheelDebounce: 40,
    
    // Quality
    imageQuality: 'high' as 'high' | 'medium' | 'low',
    enableShadows: true,
    enableBlur: true,
  };
  
  // Adjust based on performance tier
  if (capabilities.tier === 'low') {
    recommendations.maxMarkers = 25;
    recommendations.tileSize = 256;
    recommendations.enableAnimations = false;
    recommendations.enableTransitions = false;
    recommendations.useCanvas = true;
    recommendations.maxZoom = 16;
    recommendations.updateThrottle = 300;
    recommendations.maxLayers = 2;
    recommendations.layerOpacity = 0.8;
    recommendations.enableClustering = true;
    recommendations.clusterRadius = 120;
    recommendations.enableInertia = false;
    recommendations.wheelDebounce = 100;
    recommendations.imageQuality = 'low';
    recommendations.enableShadows = false;
    recommendations.enableBlur = false;
  } else if (capabilities.tier === 'medium') {
    recommendations.maxMarkers = 50;
    recommendations.enableClustering = true;
    recommendations.updateThrottle = 200;
    recommendations.maxLayers = 3;
    recommendations.imageQuality = 'medium';
  }
  
  // Adjust for reduced motion
  if (capabilities.prefersReducedMotion) {
    recommendations.enableAnimations = false;
    recommendations.enableTransitions = false;
    recommendations.enableInertia = false;
  }
  
  // Adjust for reduced data
  if (capabilities.prefersReducedData) {
    recommendations.tileSize = 256;
    recommendations.imageQuality = 'low';
    recommendations.maxLayers = 2;
  }
  
  // Adjust for battery
  if (capabilities.isOnBattery && capabilities.batteryLevel && capabilities.batteryLevel < 0.2) {
    recommendations.enableAnimations = false;
    recommendations.updateThrottle = 500;
    recommendations.imageQuality = 'low';
  }
  
  return recommendations;
}

