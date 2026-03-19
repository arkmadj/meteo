/**
 * Intelligent chunk preloading service
 * Preloads chunks based on user behavior, preferences, and connection speed
 */

import { CHUNK_CONFIGS } from '@/utils/chunkOptimizedLazyLoad';

interface PreloadingConfig {
  enabled: boolean;
  respectSaveData: boolean;
  respectReducedMotion: boolean;
  maxConcurrentPreloads: number;
  preloadDelay: number;
  connectionThreshold: 'slow-2g' | '2g' | '3g' | '4g';
}

interface ChunkPreloadMetrics {
  chunkName: string;
  preloadStartTime: number;
  preloadEndTime?: number;
  success: boolean;
  size?: number;
  error?: string;
}

interface UserBehaviorData {
  visitedRoutes: string[];
  interactionPatterns: Record<string, number>;
  sessionDuration: number;
  lastActivity: number;
}

class ChunkPreloadingService {
  private config: PreloadingConfig;
  private metrics: ChunkPreloadMetrics[] = [];
  private preloadQueue: string[] = [];
  private activePreloads = new Set<string>();
  private userBehavior: UserBehaviorData;
  private connectionInfo: unknown;

  constructor(config: Partial<PreloadingConfig> = {}) {
    this.config = {
      enabled: true,
      respectSaveData: true,
      respectReducedMotion: true,
      maxConcurrentPreloads: 3,
      preloadDelay: 1000,
      connectionThreshold: '3g',
      ...config,
    };

    this.userBehavior = {
      visitedRoutes: [],
      interactionPatterns: {},
      sessionDuration: 0,
      lastActivity: Date.now(),
    };

    this.connectionInfo = this.getConnectionInfo();
    this.initializeService();
  }

  /**
   * Initialize the preloading service
   */
  private initializeService() {
    if (!this.config.enabled) return;

    // Monitor user behavior
    this.setupBehaviorTracking();

    // Monitor connection changes
    this.setupConnectionMonitoring();

    // Start preloading critical chunks
    this.preloadCriticalChunks();

    // Setup idle preloading
    this.setupIdlePreloading();
  }

  /**
   * Get connection information
   */
  private getConnectionInfo() {
    if (!('connection' in navigator)) {
      return { effectiveType: '4g', saveData: false };
    }

    const connection = (navigator as unknown as Record<string, unknown>).connection as
      | { effectiveType?: string; saveData?: boolean; downlink?: number; rtt?: number }
      | undefined;
    return {
      effectiveType: connection?.effectiveType || '4g',
      saveData: connection?.saveData || false,
      downlink: connection?.downlink || 10,
      rtt: connection?.rtt || 100,
    };
  }

  /**
   * Setup behavior tracking
   */
  private setupBehaviorTracking() {
    // Track route changes
    window.addEventListener('popstate', () => {
      this.trackRouteVisit(window.location.pathname);
    });

    // Track user interactions
    ['click', 'hover', 'focus'].forEach(event => {
      document.addEventListener(event, e => {
        this.trackInteraction(e.target as Element);
      });
    });

    // Track session duration
    setInterval(() => {
      this.userBehavior.sessionDuration += 1000;
    }, 1000);
  }

  /**
   * Setup connection monitoring
   */
  private setupConnectionMonitoring() {
    if ('connection' in navigator) {
      const connection = (navigator as unknown as Record<string, unknown>).connection as
        | { addEventListener?: (event: string, handler: () => void) => void }
        | undefined;
      connection?.addEventListener?.('change', () => {
        this.connectionInfo = this.getConnectionInfo();
        this.adjustPreloadingStrategy();
      });
    }
  }

  /**
   * Track route visits
   */
  private trackRouteVisit(route: string) {
    if (!this.userBehavior.visitedRoutes.includes(route)) {
      this.userBehavior.visitedRoutes.push(route);
    }

    this.userBehavior.lastActivity = Date.now();
    this.predictAndPreloadChunks(route);
  }

  /**
   * Track user interactions
   */
  private trackInteraction(element: Element) {
    const componentName = this.getComponentNameFromElement(element);
    if (componentName) {
      this.userBehavior.interactionPatterns[componentName] =
        (this.userBehavior.interactionPatterns[componentName] || 0) + 1;
    }

    this.userBehavior.lastActivity = Date.now();
  }

  /**
   * Get component name from DOM element
   */
  private getComponentNameFromElement(element: Element): string | null {
    // Look for data attributes or class names that indicate component type
    const dataComponent = element.getAttribute('data-component');
    if (dataComponent) return dataComponent;

    const className = element.className;
    if (typeof className === 'string') {
      // Extract component hints from class names
      if (className.includes('dashboard')) return 'dashboard';
      if (className.includes('weather')) return 'weather';
      if (className.includes('form')) return 'form';
      if (className.includes('chart')) return 'chart';
    }

    return null;
  }

  /**
   * Preload critical chunks immediately
   */
  private preloadCriticalChunks() {
    const criticalSections = Object.entries(CHUNK_CONFIGS)
      .filter(([_, config]) => config.strategy === 'critical' || config.preload)
      .map(([section]) => section);

    criticalSections.forEach(section => {
      this.queueChunkPreload(CHUNK_CONFIGS[section].chunkName);
    });
  }

  /**
   * Setup idle preloading
   */
  private setupIdlePreloading() {
    let idleTimer: NodeJS.Timeout;

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        this.preloadIdleChunks();
      }, 5000); // 5 seconds of inactivity
    };

    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });

    resetIdleTimer();
  }

  /**
   * Preload chunks during idle time
   */
  private preloadIdleChunks() {
    if (!this.shouldPreload()) return;

    // Preload chunks based on user behavior patterns
    const predictedChunks = this.predictNextChunks();
    predictedChunks.forEach(chunkName => {
      this.queueChunkPreload(chunkName);
    });
  }

  /**
   * Predict next chunks based on user behavior
   */
  private predictNextChunks(): string[] {
    const predictions: string[] = [];

    // Based on visited routes
    if (this.userBehavior.visitedRoutes.includes('/')) {
      predictions.push('weather-components');
    }

    if (this.userBehavior.visitedRoutes.includes('/dashboard')) {
      predictions.push('dashboard-components', 'chart-components');
    }

    if (this.userBehavior.visitedRoutes.includes('/showcase')) {
      predictions.push('showcase-components');
    }

    // Based on interaction patterns
    const topInteractions = Object.entries(this.userBehavior.interactionPatterns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([component]) => component);

    topInteractions.forEach(component => {
      switch (component) {
        case 'dashboard':
          predictions.push('dashboard-components');
          break;
        case 'weather':
          predictions.push('weather-components');
          break;
        case 'form':
          predictions.push('form-components');
          break;
        case 'chart':
          predictions.push('chart-components');
          break;
      }
    });

    return [...new Set(predictions)]; // Remove duplicates
  }

  /**
   * Predict and preload chunks for a specific route
   */
  private predictAndPreloadChunks(route: string) {
    const routeChunkMap: Record<string, string[]> = {
      '/': ['weather-components'],
      '/weather': ['weather-components'],
      '/dashboard': ['dashboard-components', 'chart-components'],
      '/showcase': ['showcase-components'],
      '/accessibility': ['accessibility-components'],
      '/demo': ['demo-components'],
      '/performance': ['performance-utils'],
    };

    const chunks = routeChunkMap[route] || [];
    chunks.forEach(chunkName => {
      this.queueChunkPreload(chunkName);
    });
  }

  /**
   * Queue chunk for preloading
   */
  private queueChunkPreload(chunkName: string) {
    if (this.activePreloads.has(chunkName) || this.preloadQueue.includes(chunkName)) {
      return;
    }

    if (!this.shouldPreload()) return;

    this.preloadQueue.push(chunkName);
    this.processPreloadQueue();
  }

  /**
   * Process the preload queue
   */
  private async processPreloadQueue() {
    while (
      this.preloadQueue.length > 0 &&
      this.activePreloads.size < this.config.maxConcurrentPreloads
    ) {
      const chunkName = this.preloadQueue.shift()!;
      this.preloadChunkInternal(chunkName);
    }
  }

  /**
   * Preload a specific chunk (internal method)
   */
  private async preloadChunkInternal(chunkName: string) {
    if (this.activePreloads.has(chunkName)) return;

    this.activePreloads.add(chunkName);

    const metric: ChunkPreloadMetrics = {
      chunkName,
      preloadStartTime: performance.now(),
      success: false,
    };

    try {
      // Add delay to avoid blocking main thread
      await new Promise(resolve => setTimeout(resolve, this.config.preloadDelay));

      // Attempt to preload the chunk
      const _module = await this.importChunk(chunkName);

      metric.preloadEndTime = performance.now();
      metric.success = true;

      console.log(
        `✅ Preloaded chunk: ${chunkName} (${(metric.preloadEndTime - metric.preloadStartTime).toFixed(2)}ms)`
      );
    } catch (error) {
      metric.preloadEndTime = performance.now();
      metric.success = false;
      metric.error = error instanceof Error ? error.message : 'Unknown error';

      console.warn(`❌ Failed to preload chunk: ${chunkName}`, error);
    } finally {
      this.metrics.push(metric);
      this.activePreloads.delete(chunkName);

      // Continue processing queue
      this.processPreloadQueue();
    }
  }

  /**
   * Import chunk dynamically
   */
  private async importChunk(chunkName: string) {
    // Map chunk names to actual import paths
    const chunkImportMap: Record<string, () => Promise<unknown>> = {
      'weather-components': () => import('@/components/weather/CurrentWeatherDetails'),
      'dashboard-components': () => import('@/components/dashboard/CustomizableDashboard'),
      'accessibility-components': () => import('@/components/utilities/AriaLiveDebugPanel'),
      'form-components': () => import('@/components/search/SearchEngine'),
    };

    const importFn = chunkImportMap[chunkName];
    if (!importFn) {
      throw new Error(`Unknown chunk: ${chunkName}`);
    }

    return await importFn();
  }

  /**
   * Check if preloading should be performed
   */
  private shouldPreload(): boolean {
    if (!this.config.enabled) return false;

    // Respect save-data preference
    if (this.config.respectSaveData && this.connectionInfo.saveData) {
      return false;
    }

    // Respect reduced motion preference
    if (
      this.config.respectReducedMotion &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return false;
    }

    // Check connection speed
    const connectionOrder = ['slow-2g', '2g', '3g', '4g'];
    const currentIndex = connectionOrder.indexOf(this.connectionInfo.effectiveType);
    const thresholdIndex = connectionOrder.indexOf(this.config.connectionThreshold);

    return currentIndex >= thresholdIndex;
  }

  /**
   * Adjust preloading strategy based on connection changes
   */
  private adjustPreloadingStrategy() {
    if (this.connectionInfo.saveData || this.connectionInfo.effectiveType === 'slow-2g') {
      // Pause all preloading
      this.preloadQueue.length = 0;
      this.config.maxConcurrentPreloads = 0;
    } else if (this.connectionInfo.effectiveType === '2g') {
      this.config.maxConcurrentPreloads = 1;
      this.config.preloadDelay = 2000;
    } else if (this.connectionInfo.effectiveType === '3g') {
      this.config.maxConcurrentPreloads = 2;
      this.config.preloadDelay = 1000;
    } else {
      this.config.maxConcurrentPreloads = 3;
      this.config.preloadDelay = 500;
    }
  }

  /**
   * Get preloading metrics
   */
  public getMetrics() {
    const successful = this.metrics.filter(m => m.success);
    const failed = this.metrics.filter(m => !m.success);

    return {
      totalPreloads: this.metrics.length,
      successful: successful.length,
      failed: failed.length,
      successRate: this.metrics.length > 0 ? (successful.length / this.metrics.length) * 100 : 0,
      averageLoadTime:
        successful.length > 0
          ? successful.reduce((sum, m) => sum + (m.preloadEndTime! - m.preloadStartTime), 0) /
            successful.length
          : 0,
      activePreloads: this.activePreloads.size,
      queuedPreloads: this.preloadQueue.length,
      userBehavior: this.userBehavior,
      connectionInfo: this.connectionInfo,
    };
  }

  /**
   * Manually trigger chunk preload
   */
  public preloadChunk(chunkName: string) {
    this.queueChunkPreload(chunkName);
  }

  /**
   * Clear preload queue
   */
  public clearQueue() {
    this.preloadQueue.length = 0;
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<PreloadingConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Global instance
export const chunkPreloadingService = new ChunkPreloadingService();

export default chunkPreloadingService;
