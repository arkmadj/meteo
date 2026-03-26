/**
 * useWeatherAlertMonitoring Hook
 *
 * React hook for integrating with the Weather Alert Monitoring Service.
 * Provides reactive state management for weather monitoring, alerts, and statistics.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { CurrentWeatherData, ForecastDay } from '@/types/weather';
import type { AlertEvaluationSummary, WeatherAlert } from '@/types/weatherAlert';
import type {
  LocationMonitorConfig,
  MonitoredLocation,
  MonitoringEvent,
  MonitoringStatistics,
  RefreshResult,
} from '@/types/weatherAlertMonitoring';

import type { WeatherAlertMonitoringService } from '@/services/weatherAlertMonitoringService';
import { weatherAlertMonitoringService } from '@/services/weatherAlertMonitoringService';
import { weatherAlertService } from '@/services/weatherAlertService';

/**
 * Hook configuration options
 */
export interface UseWeatherAlertMonitoringOptions {
  /** Auto-initialize on mount */
  autoInitialize?: boolean;
  /** Auto-start monitoring on mount */
  autoStart?: boolean;
  /** Initial locations to monitor */
  initialLocations?: LocationMonitorConfig[];
  /** Use custom service instance (for testing) */
  serviceInstance?: WeatherAlertMonitoringService;
}

/**
 * Hook return type
 */
export interface UseWeatherAlertMonitoringReturn {
  // State
  isInitialized: boolean;
  isRunning: boolean;
  isLoading: boolean;
  locations: MonitoredLocation[];
  activeAlerts: WeatherAlert[];
  statistics: MonitoringStatistics | null;
  lastEvaluation: AlertEvaluationSummary | null;
  error: Error | null;

  // Actions
  initialize: () => Promise<void>;
  start: () => void;
  stop: () => void;
  addLocation: (config: LocationMonitorConfig) => string | null;
  removeLocation: (locationId: string) => boolean;
  updateLocation: (locationId: string, updates: Partial<LocationMonitorConfig>) => void;
  refreshLocation: (locationId: string) => Promise<RefreshResult | null>;
  refreshAll: () => Promise<RefreshResult[]>;
  clearAlerts: () => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;

  // Utilities
  getLocationWeather: (locationId: string) => CurrentWeatherData | undefined;
  getLocationForecast: (locationId: string) => ForecastDay[] | undefined;
}

/**
 * Weather Alert Monitoring Hook
 */
export function useWeatherAlertMonitoring(
  options: UseWeatherAlertMonitoringOptions = {}
): UseWeatherAlertMonitoringReturn {
  const {
    autoInitialize = true,
    autoStart = false,
    initialLocations = [],
    serviceInstance,
  } = options;

  // Use provided service or default singleton
  const service = useMemo(
    () => serviceInstance ?? weatherAlertMonitoringService,
    [serviceInstance]
  );

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState<MonitoredLocation[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<WeatherAlert[]>([]);
  const [statistics, setStatistics] = useState<MonitoringStatistics | null>(null);
  const [lastEvaluation, setLastEvaluation] = useState<AlertEvaluationSummary | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Track if we've added initial locations
  const initialLocationsAdded = useRef(false);

  // Sync state from service
  const syncState = useCallback(() => {
    const status = service.getStatus();
    setIsInitialized(status.isInitialized);
    setIsRunning(status.isRunning);
    setLocations(service.getLocations());
    setActiveAlerts(weatherAlertService.getActiveAlerts());
    setStatistics(service.getStatistics());
  }, [service]);

  // Initialize service
  const initialize = useCallback(async () => {
    if (isInitialized) return;

    setIsLoading(true);
    setError(null);

    try {
      await service.initialize();
      syncState();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, service, syncState]);

  // Start monitoring
  const start = useCallback(() => {
    try {
      service.start();
      syncState();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [service, syncState]);

  // Stop monitoring
  const stop = useCallback(() => {
    service.stop();
    syncState();
  }, [service, syncState]);

  // Add location
  const addLocation = useCallback(
    (config: LocationMonitorConfig): string | null => {
      try {
        const id = service.addLocation(config);
        syncState();
        return id;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return null;
      }
    },
    [service, syncState]
  );

  // Remove location
  const removeLocation = useCallback(
    (locationId: string): boolean => {
      const result = service.removeLocation(locationId);
      syncState();
      return result;
    },
    [service, syncState]
  );

  // Update location
  const updateLocation = useCallback(
    (locationId: string, updates: Partial<LocationMonitorConfig>) => {
      service.updateLocation(locationId, updates);
      syncState();
    },
    [service, syncState]
  );

  // Refresh location
  const refreshLocation = useCallback(
    async (locationId: string): Promise<RefreshResult | null> => {
      setIsLoading(true);
      try {
        const result = await service.refreshLocation(locationId);
        syncState();
        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [service, syncState]
  );

  // Refresh all locations
  const refreshAll = useCallback(async (): Promise<RefreshResult[]> => {
    setIsLoading(true);
    try {
      const results = await service.refreshAll();
      syncState();
      return results;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [service, syncState]);

  // Clear all alerts
  const clearAlerts = useCallback(() => {
    weatherAlertService.clearAlerts();
    setActiveAlerts([]);
  }, []);

  // Acknowledge alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    try {
      weatherAlertService.acknowledgeAlert(alertId);
      setActiveAlerts(weatherAlertService.getActiveAlerts());
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  // Resolve alert
  const resolveAlert = useCallback((alertId: string) => {
    try {
      weatherAlertService.resolveAlert(alertId);
      setActiveAlerts(weatherAlertService.getActiveAlerts());
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  // Get location weather data
  const getLocationWeather = useCallback(
    (locationId: string): CurrentWeatherData | undefined => {
      return service.getLocation(locationId)?.lastWeatherData;
    },
    [service]
  );

  // Get location forecast data
  const getLocationForecast = useCallback(
    (locationId: string): ForecastDay[] | undefined => {
      return service.getLocation(locationId)?.lastForecast;
    },
    [service]
  );

  // Subscribe to service events
  useEffect(() => {
    const handleEvent = (event: MonitoringEvent) => {
      // Update state based on event type
      syncState();

      if (event.evaluation) {
        setLastEvaluation(event.evaluation);
      }

      if (event.error) {
        setError(event.error);
      }
    };

    // Subscribe to all relevant events
    const unsubscribers = [
      service.on('monitoring:started', handleEvent),
      service.on('monitoring:stopped', handleEvent),
      service.on('location:added', handleEvent),
      service.on('location:removed', handleEvent),
      service.on('location:updated', handleEvent),
      service.on('refresh:completed', handleEvent),
      service.on('refresh:failed', handleEvent),
      service.on('evaluation:completed', handleEvent),
      service.on('alert:triggered', handleEvent),
      service.on('error:occurred', handleEvent),
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [service, syncState]);

  // Auto-initialize on mount
  useEffect(() => {
    if (autoInitialize && !isInitialized) {
      void initialize();
    }
  }, [autoInitialize, isInitialized, initialize]);

  // Add initial locations after initialization
  useEffect(() => {
    if (isInitialized && !initialLocationsAdded.current && initialLocations.length > 0) {
      initialLocationsAdded.current = true;
      initialLocations.forEach(config => {
        service.addLocation(config);
      });
      syncState();
    }
  }, [isInitialized, initialLocations, service, syncState]);

  // Auto-start after initialization if configured
  useEffect(() => {
    if (isInitialized && autoStart && !isRunning) {
      start();
    }
  }, [isInitialized, autoStart, isRunning, start]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't destroy the singleton service on unmount
      // Just sync state one last time
    };
  }, []);

  return {
    // State
    isInitialized,
    isRunning,
    isLoading,
    locations,
    activeAlerts,
    statistics,
    lastEvaluation,
    error,

    // Actions
    initialize,
    start,
    stop,
    addLocation,
    removeLocation,
    updateLocation,
    refreshLocation,
    refreshAll,
    clearAlerts,
    acknowledgeAlert,
    resolveAlert,

    // Utilities
    getLocationWeather,
    getLocationForecast,
  };
}

export default useWeatherAlertMonitoring;
