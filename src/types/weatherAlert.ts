/**
 * Weather Alert Types
 * Type definitions for the weather alert processing service including
 * severity levels, alert conditions, thresholds, and evaluation results.
 */

import type { CurrentWeatherData, ForecastDay } from './weather';

/**
 * Alert severity levels ordered by intensity
 */
export type AlertSeverity = 'info' | 'warning' | 'severe' | 'critical';

/**
 * Alert status in the lifecycle
 */
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'expired';

/**
 * Weather condition types that can trigger alerts
 */
export type AlertConditionType =
  | 'temperature_high'
  | 'temperature_low'
  | 'wind_speed'
  | 'wind_gust'
  | 'humidity_high'
  | 'humidity_low'
  | 'pressure_change'
  | 'uv_index'
  | 'visibility_low'
  | 'precipitation'
  | 'thunderstorm'
  | 'snow'
  | 'freezing'
  | 'heat_wave'
  | 'cold_snap'
  | 'fog'
  | 'custom';

/**
 * Comparison operators for threshold evaluation
 */
export type ThresholdOperator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'between' | 'outside';

/**
 * Threshold definition for alert conditions
 */
export interface AlertThreshold {
  /** Comparison operator */
  operator: ThresholdOperator;
  /** Primary threshold value */
  value: number;
  /** Secondary value for 'between' and 'outside' operators */
  secondaryValue?: number;
  /** Unit of measurement (for display) */
  unit?: string;
}

/**
 * Weather alert condition configuration
 */
export interface AlertCondition {
  /** Unique identifier for the condition */
  id: string;
  /** Type of weather condition to monitor */
  type: AlertConditionType;
  /** Human-readable name */
  name: string;
  /** Description of the condition */
  description?: string;
  /** Thresholds mapped by severity level */
  thresholds: Partial<Record<AlertSeverity, AlertThreshold>>;
  /** Whether this condition is enabled */
  enabled: boolean;
  /** Minimum duration (ms) condition must persist before alerting */
  persistenceDuration?: number;
  /** Cooldown period (ms) between repeated alerts */
  cooldownPeriod?: number;
  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Result of evaluating a single condition
 */
export interface ConditionEvaluationResult {
  /** The condition that was evaluated */
  conditionId: string;
  /** Whether the condition triggered */
  triggered: boolean;
  /** Severity level if triggered */
  severity?: AlertSeverity;
  /** Current measured value */
  currentValue: number;
  /** Threshold that was exceeded */
  threshold?: AlertThreshold;
  /** Timestamp of evaluation */
  evaluatedAt: Date;
  /** Additional context about the evaluation */
  context?: Record<string, unknown>;
}

/**
 * Weather alert instance
 */
export interface WeatherAlert {
  /** Unique alert identifier */
  id: string;
  /** Condition that triggered the alert */
  conditionId: string;
  /** Type of condition */
  conditionType: AlertConditionType;
  /** Alert severity */
  severity: AlertSeverity;
  /** Alert title */
  title: string;
  /** Detailed message */
  message: string;
  /** Current alert status */
  status: AlertStatus;
  /** Location information */
  location: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  /** Weather values that triggered the alert */
  triggerValues: {
    current: number;
    threshold: number;
    unit?: string;
  };
  /** When the alert was created */
  createdAt: Date;
  /** When the alert was last updated */
  updatedAt: Date;
  /** When the alert expires (if applicable) */
  expiresAt?: Date;
  /** When the alert was acknowledged */
  acknowledgedAt?: Date;
  /** When the alert was resolved */
  resolvedAt?: Date;
  /** Whether notification was sent */
  notificationSent: boolean;
  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Alert rule combining multiple conditions
 */
export interface AlertRule {
  /** Unique rule identifier */
  id: string;
  /** Rule name */
  name: string;
  /** Rule description */
  description?: string;
  /** Conditions to evaluate (combined with AND/OR logic) */
  conditions: string[];
  /** Logic operator for combining conditions */
  logic: 'and' | 'or';
  /** Whether the rule is enabled */
  enabled: boolean;
  /** Priority for ordering rules */
  priority: number;
  /** Locations this rule applies to (empty = all locations) */
  locations?: string[];
}

/**
 * Configuration for the weather alert service
 */
export interface WeatherAlertServiceConfig {
  /** Evaluation interval in milliseconds */
  evaluationIntervalMs?: number;
  /** Default cooldown between repeated alerts */
  defaultCooldownMs?: number;
  /** Maximum alerts to keep in history */
  maxAlertHistory?: number;
  /** Enable debug logging */
  debug?: boolean;
  /** Storage key prefix for persistence */
  storageKeyPrefix?: string;
  /** Auto-expire alerts after duration (ms) */
  alertExpirationMs?: number;
}

/**
 * Input data for weather condition evaluation
 */
export interface WeatherEvaluationInput {
  /** Current weather data */
  current: CurrentWeatherData;
  /** Forecast data (optional) */
  forecast?: ForecastDay[];
  /** Previous weather data for trend analysis */
  previous?: CurrentWeatherData;
}

/**
 * Alert evaluation summary
 */
export interface AlertEvaluationSummary {
  /** Timestamp of evaluation */
  evaluatedAt: Date;
  /** Number of conditions evaluated */
  conditionsEvaluated: number;
  /** Number of alerts triggered */
  alertsTriggered: number;
  /** Individual evaluation results */
  results: ConditionEvaluationResult[];
  /** New alerts generated */
  newAlerts: WeatherAlert[];
  /** Location evaluated */
  location: {
    city: string;
    country: string;
  };
}

/**
 * Alert statistics
 */
export interface AlertStatistics {
  /** Total alerts created */
  totalAlerts: number;
  /** Active alerts count */
  activeAlerts: number;
  /** Alerts by severity */
  bySeverity: Record<AlertSeverity, number>;
  /** Alerts by condition type */
  byConditionType: Partial<Record<AlertConditionType, number>>;
  /** Alerts by status */
  byStatus: Record<AlertStatus, number>;
  /** Most recent alert */
  lastAlertAt?: Date;
}

/**
 * Alert filter options for querying
 */
export interface AlertFilterOptions {
  /** Filter by severity levels */
  severity?: AlertSeverity[];
  /** Filter by status */
  status?: AlertStatus[];
  /** Filter by condition types */
  conditionTypes?: AlertConditionType[];
  /** Filter by location */
  location?: string;
  /** Filter by date range start */
  startDate?: Date;
  /** Filter by date range end */
  endDate?: Date;
  /** Limit number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Event types emitted by the alert service
 */
export type AlertEventType =
  | 'alert:created'
  | 'alert:updated'
  | 'alert:acknowledged'
  | 'alert:resolved'
  | 'alert:expired'
  | 'alert:notification_sent'
  | 'condition:evaluated'
  | 'evaluation:complete';

/**
 * Alert event payload
 */
export interface AlertEvent {
  /** Event type */
  type: AlertEventType;
  /** Alert data (if applicable) */
  alert?: WeatherAlert;
  /** Evaluation summary (for evaluation events) */
  evaluation?: AlertEvaluationSummary;
  /** Event timestamp */
  timestamp: Date;
  /** Additional event data */
  data?: Record<string, unknown>;
}

/**
 * Alert event callback
 */
export type AlertEventCallback = (event: AlertEvent) => void;

/**
 * User alert preferences
 */
export interface AlertPreferences {
  /** Enable alert notifications */
  enabled: boolean;
  /** Minimum severity to notify */
  minimumSeverity: AlertSeverity;
  /** Enable specific condition types */
  enabledConditions: Partial<Record<AlertConditionType, boolean>>;
  /** Quiet hours configuration */
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
    allowCritical: boolean;
  };
  /** Sound enabled for alerts */
  soundEnabled: boolean;
  /** Custom thresholds (overrides defaults) */
  customThresholds?: Partial<
    Record<AlertConditionType, Partial<Record<AlertSeverity, AlertThreshold>>>
  >;
}
