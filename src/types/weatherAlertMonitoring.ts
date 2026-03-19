/**
 * Weather Alert Monitoring Types
 * Type definitions for the weather alert monitoring service including
 * location monitoring, refresh cycles, and monitoring events.
 */

import type { CurrentWeatherData, ForecastDay } from './weather';
import type { AlertEvaluationSummary, WeatherAlert } from './weatherAlert';

/**
 * Monitoring status for a location
 */
export type MonitoringStatus = 'idle' | 'refreshing' | 'active' | 'paused' | 'error';

/**
 * Configuration for monitoring a specific location
 */
export interface LocationMonitorConfig {
  /** Location query (city name, coordinates, etc.) */
  query: string;
  /** Optional human-readable label */
  label?: string;
  /** Refresh interval in milliseconds */
  refreshIntervalMs?: number;
  /** Whether monitoring is enabled */
  enabled?: boolean;
  /** Temperature unit preference */
  temperatureUnit?: 'celsius' | 'fahrenheit';
}

/**
 * State of a monitored location
 */
export interface MonitoredLocation {
  /** Unique monitor identifier */
  id: string;
  /** Location query */
  query: string;
  /** Display label */
  label: string;
  /** Refresh interval in milliseconds */
  refreshIntervalMs: number;
  /** Whether monitoring is enabled */
  enabled: boolean;
  /** Current monitoring status */
  status: MonitoringStatus;
  /** Latest weather data */
  lastWeatherData?: CurrentWeatherData;
  /** Latest forecast data */
  lastForecast?: ForecastDay[];
  /** Last successful refresh timestamp */
  lastRefreshAt?: Date;
  /** Last error encountered */
  lastError?: Error;
  /** Total refresh count */
  refreshCount: number;
  /** Total error count */
  errorCount: number;
  /** Consecutive errors (resets on success) */
  consecutiveErrors: number;
}

/**
 * Configuration for the monitoring service
 */
export interface MonitoringServiceConfig {
  /** Default refresh interval in milliseconds */
  defaultRefreshIntervalMs?: number;
  /** Minimum allowed refresh interval */
  minRefreshIntervalMs?: number;
  /** Maximum number of locations to monitor */
  maxLocations?: number;
  /** Enable background sync when tab is hidden */
  enableBackgroundSync?: boolean;
  /** Retry on failure */
  retryOnFailure?: boolean;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Delay between retries in milliseconds */
  retryDelayMs?: number;
  /** Enable debug logging */
  debug?: boolean;
  /** Number of forecast days to fetch */
  forecastDays?: number;
}

/**
 * Monitoring event types
 */
export type MonitoringEventType =
  | 'monitoring:started'
  | 'monitoring:stopped'
  | 'location:added'
  | 'location:removed'
  | 'location:updated'
  | 'refresh:started'
  | 'refresh:completed'
  | 'refresh:failed'
  | 'alert:triggered'
  | 'evaluation:completed'
  | 'error:occurred';

/**
 * Monitoring event payload
 */
export interface MonitoringEvent {
  /** Event type */
  type: MonitoringEventType;
  /** Location ID (if applicable) */
  locationId?: string;
  /** Location data (if applicable) */
  location?: MonitoredLocation;
  /** Weather data (if applicable) */
  weatherData?: CurrentWeatherData;
  /** Forecast data (if applicable) */
  forecast?: ForecastDay[];
  /** Alert data (if applicable) */
  alert?: WeatherAlert;
  /** Evaluation summary (if applicable) */
  evaluation?: AlertEvaluationSummary;
  /** Error (if applicable) */
  error?: Error;
  /** Event timestamp */
  timestamp: Date;
  /** Additional data */
  data?: Record<string, unknown>;
}

/**
 * Monitoring event callback
 */
export type MonitoringEventCallback = (event: MonitoringEvent) => void;

/**
 * Monitoring statistics
 */
export interface MonitoringStatistics {
  /** Total locations ever monitored */
  totalLocationsMonitored: number;
  /** Currently active locations */
  activeLocations: number;
  /** Total refresh attempts */
  totalRefreshes: number;
  /** Successful refreshes */
  successfulRefreshes: number;
  /** Failed refreshes */
  failedRefreshes: number;
  /** Total alerts triggered */
  totalAlertsTriggered: number;
  /** Average refresh time in milliseconds */
  averageRefreshTimeMs: number;
  /** Last refresh timestamp */
  lastRefreshAt?: Date;
  /** Service uptime in milliseconds */
  uptime: number;
  /** When monitoring started */
  startedAt?: Date;
}

/**
 * Result of a location refresh
 */
export interface RefreshResult {
  /** Whether refresh was successful */
  success: boolean;
  /** Location ID */
  locationId: string;
  /** Weather data (if successful) */
  weatherData?: CurrentWeatherData;
  /** Forecast data (if successful) */
  forecast?: ForecastDay[];
  /** Alert evaluation summary (if performed) */
  evaluation?: AlertEvaluationSummary;
  /** Error (if failed) */
  error?: Error;
  /** Duration in milliseconds */
  durationMs: number;
  /** Timestamp */
  timestamp: Date;
}
