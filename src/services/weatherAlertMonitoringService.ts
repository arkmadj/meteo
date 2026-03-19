/**
 * Weather Alert Monitoring Service
 *
 * Continuously monitors weather conditions for specified locations,
 * fetches updates at configurable intervals, and triggers alert evaluations.
 * Supports multiple location monitoring with independent refresh cycles.
 */

import type { AlertEvent, WeatherEvaluationInput } from '@/types/weatherAlert';
import type {
  LocationMonitorConfig,
  MonitoredLocation,
  MonitoringEvent,
  MonitoringEventCallback,
  MonitoringEventType,
  MonitoringServiceConfig,
  MonitoringStatistics,
  RefreshResult,
} from '@/types/weatherAlertMonitoring';

import { getLogger } from '@/utils/logger';
import { weatherAlertService } from './weatherAlertService';
import { fetchCompleteWeatherData } from './weatherService';

// Logger instance
const logger = getLogger('WeatherAlertMonitoringService');

// Default configuration
const DEFAULT_CONFIG: Required<MonitoringServiceConfig> = {
  defaultRefreshIntervalMs: 5 * 60 * 1000, // 5 minutes
  minRefreshIntervalMs: 60 * 1000, // 1 minute minimum
  maxLocations: 10,
  enableBackgroundSync: true,
  retryOnFailure: true,
  maxRetries: 3,
  retryDelayMs: 30 * 1000, // 30 seconds
  debug: false,
  forecastDays: 7,
};

/**
 * Generate unique monitor ID
 */
const generateMonitorId = (): string =>
  `monitor_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

/**
 * Weather Alert Monitoring Service
 * Singleton service for continuous weather monitoring
 */
class WeatherAlertMonitoringService {
  private static instance: WeatherAlertMonitoringService;
  private config: Required<MonitoringServiceConfig>;
  private isInitialized = false;
  private isRunning = false;
  private locations: Map<string, MonitoredLocation> = new Map();
  private refreshIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();
  private eventListeners: Map<MonitoringEventType, Set<MonitoringEventCallback>> = new Map();
  private alertEventUnsubscribe: (() => void) | null = null;
  private statistics: MonitoringStatistics;

  private constructor(config: MonitoringServiceConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config } as Required<MonitoringServiceConfig>;
    this.statistics = this.initializeStatistics();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: MonitoringServiceConfig): WeatherAlertMonitoringService {
    if (!WeatherAlertMonitoringService.instance) {
      WeatherAlertMonitoringService.instance = new WeatherAlertMonitoringService(config);
    }
    return WeatherAlertMonitoringService.instance;
  }

  /**
   * Reset singleton instance (for testing)
   */
  public static resetInstance(): void {
    if (WeatherAlertMonitoringService.instance) {
      WeatherAlertMonitoringService.instance.destroy();
      WeatherAlertMonitoringService.instance = null as unknown as WeatherAlertMonitoringService;
    }
  }

  /**
   * Initialize the monitoring service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.log('Initializing weather alert monitoring service...');

    // Initialize the alert service if not already
    await weatherAlertService.initialize();

    // Subscribe to alert events
    this.alertEventUnsubscribe = weatherAlertService.on('alert:created', (event: AlertEvent) => {
      this.emitEvent('alert:triggered', { alert: event.alert });
    });

    this.isInitialized = true;
    this.log('Weather alert monitoring service initialized');
  }

  /**
   * Destroy the service and clean up resources
   */
  public destroy(): void {
    this.stopAll();

    if (this.alertEventUnsubscribe) {
      this.alertEventUnsubscribe();
      this.alertEventUnsubscribe = null;
    }

    this.eventListeners.clear();
    this.locations.clear();
    this.isInitialized = false;
    this.isRunning = false;

    this.log('Weather alert monitoring service destroyed');
  }

  private initializeStatistics(): MonitoringStatistics {
    return {
      totalLocationsMonitored: 0,
      activeLocations: 0,
      totalRefreshes: 0,
      successfulRefreshes: 0,
      failedRefreshes: 0,
      totalAlertsTriggered: 0,
      averageRefreshTimeMs: 0,
      lastRefreshAt: undefined,
      uptime: 0,
      startedAt: undefined,
    };
  }

  /**
   * Add a location to monitor
   */
  public addLocation(config: LocationMonitorConfig): string {
    this.ensureInitialized();

    if (this.locations.size >= this.config.maxLocations) {
      throw new Error(`Maximum locations limit (${this.config.maxLocations}) reached`);
    }

    const id = generateMonitorId();
    const refreshInterval = Math.max(
      config.refreshIntervalMs ?? this.config.defaultRefreshIntervalMs,
      this.config.minRefreshIntervalMs
    );

    const location: MonitoredLocation = {
      id,
      query: config.query,
      label: config.label ?? config.query,
      refreshIntervalMs: refreshInterval,
      enabled: config.enabled ?? true,
      status: 'idle',
      lastWeatherData: undefined,
      lastForecast: undefined,
      lastRefreshAt: undefined,
      lastError: undefined,
      refreshCount: 0,
      errorCount: 0,
      consecutiveErrors: 0,
    };

    this.locations.set(id, location);
    this.statistics.totalLocationsMonitored++;

    this.emitEvent('location:added', { locationId: id, location });
    this.log('Location added:', config.query, id);

    // Start monitoring if service is running
    if (this.isRunning && location.enabled) {
      this.startLocationMonitoring(id);
    }

    return id;
  }

  /**
   * Remove a location from monitoring
   */
  public removeLocation(locationId: string): boolean {
    const location = this.locations.get(locationId);
    if (!location) {
      return false;
    }

    this.stopLocationMonitoring(locationId);
    this.locations.delete(locationId);

    this.emitEvent('location:removed', { locationId, location });
    this.log('Location removed:', locationId);

    return true;
  }

  /**
   * Get a monitored location by ID
   */
  public getLocation(locationId: string): MonitoredLocation | undefined {
    return this.locations.get(locationId);
  }

  /**
   * Get all monitored locations
   */
  public getLocations(): MonitoredLocation[] {
    return Array.from(this.locations.values());
  }

  /**
   * Update location configuration
   */
  public updateLocation(
    locationId: string,
    updates: Partial<LocationMonitorConfig>
  ): MonitoredLocation | undefined {
    const location = this.locations.get(locationId);
    if (!location) {
      return undefined;
    }

    const wasEnabled = location.enabled;

    if (updates.query !== undefined) {
      location.query = updates.query;
    }
    if (updates.label !== undefined) {
      location.label = updates.label;
    }
    if (updates.refreshIntervalMs !== undefined) {
      location.refreshIntervalMs = Math.max(
        updates.refreshIntervalMs,
        this.config.minRefreshIntervalMs
      );
      // Restart monitoring with new interval
      if (this.isRunning && location.enabled) {
        this.stopLocationMonitoring(locationId);
        this.startLocationMonitoring(locationId);
      }
    }
    if (updates.enabled !== undefined) {
      location.enabled = updates.enabled;
      if (this.isRunning) {
        if (updates.enabled && !wasEnabled) {
          this.startLocationMonitoring(locationId);
        } else if (!updates.enabled && wasEnabled) {
          this.stopLocationMonitoring(locationId);
        }
      }
    }

    this.emitEvent('location:updated', { locationId, location });
    return location;
  }

  /**
   * Start monitoring all enabled locations
   */
  public start(): void {
    if (this.isRunning) {
      return;
    }

    this.ensureInitialized();
    this.isRunning = true;
    this.statistics.startedAt = new Date();

    for (const [id, location] of this.locations) {
      if (location.enabled) {
        this.startLocationMonitoring(id);
      }
    }

    this.emitEvent('monitoring:started', {});
    this.log('Monitoring started');
  }

  /**
   * Stop all monitoring
   */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.stopAll();
    this.isRunning = false;

    this.emitEvent('monitoring:stopped', {});
    this.log('Monitoring stopped');
  }

  /**
   * Stop all location monitoring intervals
   */
  private stopAll(): void {
    for (const [id] of this.refreshIntervals) {
      this.stopLocationMonitoring(id);
    }
  }

  /**
   * Start monitoring a specific location
   */
  private startLocationMonitoring(locationId: string): void {
    const location = this.locations.get(locationId);
    if (!location) {
      return;
    }

    // Clear existing interval if any
    this.stopLocationMonitoring(locationId);

    // Perform initial refresh
    this.refreshLocation(locationId);

    // Set up interval for subsequent refreshes
    const interval = setInterval(() => {
      this.refreshLocation(locationId);
    }, location.refreshIntervalMs);

    this.refreshIntervals.set(locationId, interval);
    location.status = 'active';
    this.statistics.activeLocations++;

    this.log('Started monitoring location:', locationId);
  }

  /**
   * Stop monitoring a specific location
   */
  private stopLocationMonitoring(locationId: string): void {
    const interval = this.refreshIntervals.get(locationId);
    if (interval) {
      clearInterval(interval);
      this.refreshIntervals.delete(locationId);
    }

    const location = this.locations.get(locationId);
    if (location && location.status === 'active') {
      location.status = 'paused';
      this.statistics.activeLocations = Math.max(0, this.statistics.activeLocations - 1);
    }
  }

  /**
   * Refresh weather data for a location
   */
  public async refreshLocation(locationId: string): Promise<RefreshResult> {
    const location = this.locations.get(locationId);
    if (!location) {
      return {
        success: false,
        locationId,
        error: new Error('Location not found'),
        durationMs: 0,
        timestamp: new Date(),
      };
    }

    const startTime = Date.now();
    location.status = 'refreshing';
    this.emitEvent('refresh:started', { locationId, location });

    try {
      const result = await fetchCompleteWeatherData(
        location.query,
        this.config.forecastDays,
        'celsius'
      );

      const durationMs = Date.now() - startTime;
      location.lastWeatherData = result.current;
      location.lastForecast = result.forecast;
      location.lastRefreshAt = new Date();
      location.refreshCount++;
      location.consecutiveErrors = 0;
      location.status = 'active';
      location.lastError = undefined;

      // Update statistics
      this.statistics.totalRefreshes++;
      this.statistics.successfulRefreshes++;
      this.statistics.lastRefreshAt = new Date();
      this.updateAverageRefreshTime(durationMs);

      // Trigger alert evaluation
      const input: WeatherEvaluationInput = {
        current: result.current,
        forecast: result.forecast,
      };
      const evaluation = weatherAlertService.evaluate(input);

      if (evaluation.alertsTriggered > 0) {
        this.statistics.totalAlertsTriggered += evaluation.alertsTriggered;
      }

      const refreshResult: RefreshResult = {
        success: true,
        locationId,
        weatherData: result.current,
        forecast: result.forecast,
        evaluation,
        durationMs,
        timestamp: new Date(),
      };

      this.emitEvent('refresh:completed', {
        locationId,
        location,
        weatherData: result.current,
        forecast: result.forecast,
        evaluation,
      });

      this.emitEvent('evaluation:completed', {
        locationId,
        location,
        evaluation,
      });

      this.log('Refresh completed for:', location.query);
      return refreshResult;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      location.errorCount++;
      location.consecutiveErrors++;
      location.lastError = error instanceof Error ? error : new Error(String(error));
      location.status = 'error';

      this.statistics.totalRefreshes++;
      this.statistics.failedRefreshes++;

      const refreshResult: RefreshResult = {
        success: false,
        locationId,
        error: location.lastError,
        durationMs,
        timestamp: new Date(),
      };

      this.emitEvent('refresh:failed', {
        locationId,
        location,
        error: location.lastError,
      });

      this.emitEvent('error:occurred', {
        locationId,
        location,
        error: location.lastError,
      });

      this.log('Refresh failed for:', location.query, error);

      // Handle retry logic
      if (this.config.retryOnFailure && location.consecutiveErrors < this.config.maxRetries) {
        setTimeout(() => {
          if (this.isRunning && location.enabled) {
            this.refreshLocation(locationId);
          }
        }, this.config.retryDelayMs);
      }

      return refreshResult;
    }
  }

  /**
   * Manually trigger refresh for all locations
   */
  public async refreshAll(): Promise<RefreshResult[]> {
    const results: RefreshResult[] = [];

    for (const [id, location] of this.locations) {
      if (location.enabled) {
        const result = await this.refreshLocation(id);
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Get monitoring statistics
   */
  public getStatistics(): MonitoringStatistics {
    const now = Date.now();
    const uptime = this.statistics.startedAt ? now - this.statistics.startedAt.getTime() : 0;

    return {
      ...this.statistics,
      uptime,
    };
  }

  /**
   * Get current monitoring status
   */
  public getStatus(): {
    isInitialized: boolean;
    isRunning: boolean;
    locationsCount: number;
    activeLocationsCount: number;
  } {
    return {
      isInitialized: this.isInitialized,
      isRunning: this.isRunning,
      locationsCount: this.locations.size,
      activeLocationsCount: this.statistics.activeLocations,
    };
  }

  // Event handling methods
  /**
   * Add event listener
   */
  public on(event: MonitoringEventType, callback: MonitoringEventCallback): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);

    return () => {
      this.eventListeners.get(event)?.delete(callback);
    };
  }

  /**
   * Remove event listener
   */
  public off(event: MonitoringEventType, callback: MonitoringEventCallback): void {
    this.eventListeners.get(event)?.delete(callback);
  }

  /**
   * Emit an event
   */
  private emitEvent(
    type: MonitoringEventType,
    data: Omit<MonitoringEvent, 'type' | 'timestamp'>
  ): void {
    const event: MonitoringEvent = {
      type,
      ...data,
      timestamp: new Date(),
    };

    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          this.log('Event listener error:', error);
        }
      });
    }
  }

  // Private helper methods
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Weather alert monitoring service not initialized');
    }
  }

  private updateAverageRefreshTime(newDuration: number): void {
    const total = this.statistics.successfulRefreshes;
    if (total === 1) {
      this.statistics.averageRefreshTimeMs = newDuration;
    } else {
      // Running average
      this.statistics.averageRefreshTimeMs =
        (this.statistics.averageRefreshTimeMs * (total - 1) + newDuration) / total;
    }
  }

  private log(...args: unknown[]): void {
    if (this.config.debug) {
      logger.debug(args.map(String).join(' '));
    }
  }
}

// Export type for RefreshResult
export type { RefreshResult } from '@/types/weatherAlertMonitoring';

// Export singleton instance
export const weatherAlertMonitoringService = WeatherAlertMonitoringService.getInstance();

// Export class for testing or custom instances
export { WeatherAlertMonitoringService };
