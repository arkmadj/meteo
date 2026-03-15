/**
 * Notification Scheduler Types
 * Type definitions for scheduled weather alerts, recurring notifications,
 * and automated alert rules.
 */

import type { NotificationCategory, NotificationPriority } from './notification';
import type { AlertConditionType, AlertSeverity } from './weatherAlert';

/**
 * Recurrence frequency for scheduled notifications
 */
export type RecurrenceFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';

/**
 * Days of the week for weekly schedules
 */
export type DayOfWeek =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

/**
 * Schedule trigger types
 */
export type ScheduleTriggerType =
  | 'time' // Triggered at specific times
  | 'condition' // Triggered by weather conditions
  | 'sunrise' // Triggered relative to sunrise
  | 'sunset' // Triggered relative to sunset
  | 'interval'; // Triggered at regular intervals

/**
 * Schedule status
 */
export type ScheduleStatus = 'active' | 'paused' | 'completed' | 'expired' | 'error';

/**
 * Time-based trigger configuration
 */
export interface TimeTrigger {
  type: 'time';
  /** Time in HH:mm format */
  time: string;
  /** Timezone (defaults to user's local timezone) */
  timezone?: string;
}

/**
 * Interval-based trigger configuration
 */
export interface IntervalTrigger {
  type: 'interval';
  /** Interval in milliseconds */
  intervalMs: number;
  /** Start time for interval calculation */
  startFrom?: Date;
}

/**
 * Sunrise/Sunset-based trigger configuration
 */
export interface SunEventTrigger {
  type: 'sunrise' | 'sunset';
  /** Offset in minutes (negative for before, positive for after) */
  offsetMinutes: number;
  /** Location for sun calculations */
  location: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Weather condition-based trigger configuration
 */
export interface ConditionTrigger {
  type: 'condition';
  /** Weather condition to monitor */
  conditionType: AlertConditionType;
  /** Threshold value */
  threshold: number;
  /** Comparison operator */
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
  /** Optional secondary threshold for range checks */
  secondaryThreshold?: number;
  /** Check frequency in milliseconds */
  checkIntervalMs?: number;
}

/**
 * Union type for all trigger types
 */
export type ScheduleTrigger = TimeTrigger | IntervalTrigger | SunEventTrigger | ConditionTrigger;

/**
 * Recurrence pattern configuration
 */
export interface RecurrencePattern {
  /** Frequency of recurrence */
  frequency: RecurrenceFrequency;
  /** Interval between occurrences (e.g., every 2 days) */
  interval?: number;
  /** Specific days for weekly recurrence */
  daysOfWeek?: DayOfWeek[];
  /** Specific day of month for monthly recurrence */
  dayOfMonth?: number;
  /** Maximum number of occurrences */
  maxOccurrences?: number;
  /** End date for recurrence */
  endDate?: Date;
  /** Custom cron expression (for advanced schedules) */
  cronExpression?: string;
}

/**
 * Scheduled alert/notification definition
 */
export interface ScheduledAlert {
  /** Unique identifier */
  id: string;
  /** User-friendly name */
  name: string;
  /** Description */
  description?: string;
  /** Whether this schedule is enabled */
  enabled: boolean;
  /** Current status */
  status: ScheduleStatus;
  /** Trigger configuration */
  trigger: ScheduleTrigger;
  /** Recurrence pattern */
  recurrence: RecurrencePattern;
  /** Notification content */
  notification: {
    title: string;
    body: string;
    category: NotificationCategory;
    priority: NotificationPriority;
    icon?: string;
    data?: Record<string, unknown>;
  };
  /** Locations this schedule applies to */
  locations?: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  }>;
  /** Minimum severity to trigger (for condition-based) */
  minimumSeverity?: AlertSeverity;
  /** Metadata */
  metadata?: Record<string, unknown>;
  /** Creation timestamp */
  createdAt: Date;
  /** Last updated timestamp */
  updatedAt: Date;
  /** Next scheduled execution */
  nextExecutionAt?: Date;
  /** Last execution timestamp */
  lastExecutedAt?: Date;
  /** Total execution count */
  executionCount: number;
  /** Error message if status is 'error' */
  errorMessage?: string;
}

/**
 * Scheduler execution record
 */
export interface ScheduleExecution {
  /** Execution ID */
  id: string;
  /** Schedule ID */
  scheduleId: string;
  /** Execution timestamp */
  executedAt: Date;
  /** Whether execution was successful */
  success: boolean;
  /** Notification ID if notification was sent */
  notificationId?: string;
  /** Error message if execution failed */
  errorMessage?: string;
  /** Trigger data at time of execution */
  triggerData?: Record<string, unknown>;
}

/**
 * Scheduler service configuration
 */
export interface SchedulerServiceConfig {
  /** Storage key prefix */
  storageKeyPrefix?: string;
  /** Maximum schedules allowed */
  maxSchedules?: number;
  /** Maximum execution history per schedule */
  maxExecutionHistory?: number;
  /** Scheduler tick interval in milliseconds */
  tickIntervalMs?: number;
  /** Enable debug logging */
  debug?: boolean;
  /** Default check interval for condition triggers */
  defaultConditionCheckIntervalMs?: number;
}

/**
 * Scheduler statistics
 */
export interface SchedulerStatistics {
  /** Total schedules */
  totalSchedules: number;
  /** Active schedules */
  activeSchedules: number;
  /** Paused schedules */
  pausedSchedules: number;
  /** Schedules by trigger type */
  byTriggerType: Record<ScheduleTriggerType, number>;
  /** Schedules by frequency */
  byFrequency: Record<RecurrenceFrequency, number>;
  /** Total executions */
  totalExecutions: number;
  /** Successful executions */
  successfulExecutions: number;
  /** Failed executions */
  failedExecutions: number;
  /** Next scheduled execution */
  nextScheduledExecution?: Date;
}

/**
 * Scheduler event types
 */
export type SchedulerEventType =
  | 'schedule:created'
  | 'schedule:updated'
  | 'schedule:deleted'
  | 'schedule:paused'
  | 'schedule:resumed'
  | 'schedule:executed'
  | 'schedule:failed'
  | 'schedule:expired'
  | 'scheduler:started'
  | 'scheduler:stopped'
  | 'scheduler:tick';

/**
 * Scheduler event payload
 */
export interface SchedulerEvent {
  /** Event type */
  type: SchedulerEventType;
  /** Schedule data */
  schedule?: ScheduledAlert;
  /** Execution data */
  execution?: ScheduleExecution;
  /** Event timestamp */
  timestamp: Date;
  /** Additional data */
  data?: Record<string, unknown>;
}

/**
 * Scheduler event callback
 */
export type SchedulerEventCallback = (event: SchedulerEvent) => void;

/**
 * Options for creating a scheduled alert
 */
export interface CreateScheduledAlertOptions {
  /** User-friendly name */
  name: string;
  /** Description */
  description?: string;
  /** Trigger configuration */
  trigger: ScheduleTrigger;
  /** Recurrence pattern */
  recurrence?: Partial<RecurrencePattern>;
  /** Notification content */
  notification: {
    title: string;
    body: string;
    category?: NotificationCategory;
    priority?: NotificationPriority;
    icon?: string;
    data?: Record<string, unknown>;
  };
  /** Locations this schedule applies to */
  locations?: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  }>;
  /** Minimum severity to trigger (for condition-based) */
  minimumSeverity?: AlertSeverity;
  /** Metadata */
  metadata?: Record<string, unknown>;
  /** Start immediately */
  enabled?: boolean;
}

/**
 * Filter options for querying schedules
 */
export interface ScheduleFilterOptions {
  /** Filter by status */
  status?: ScheduleStatus[];
  /** Filter by trigger type */
  triggerType?: ScheduleTriggerType[];
  /** Filter by frequency */
  frequency?: RecurrenceFrequency[];
  /** Filter by enabled state */
  enabled?: boolean;
  /** Filter by location ID */
  locationId?: string;
  /** Limit results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Daily weather summary schedule preset
 */
export interface DailyWeatherSummaryPreset {
  type: 'daily-summary';
  /** Time to send summary (HH:mm format) */
  time: string;
  /** Include forecast */
  includeForecast: boolean;
  /** Number of forecast days */
  forecastDays: number;
  /** Locations to include */
  locations: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  }>;
}

/**
 * Severe weather alert schedule preset
 */
export interface SevereWeatherAlertPreset {
  type: 'severe-weather';
  /** Conditions to monitor */
  conditions: AlertConditionType[];
  /** Minimum severity to alert */
  minimumSeverity: AlertSeverity;
  /** Locations to monitor */
  locations: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  }>;
}

/**
 * Schedule preset union type
 */
export type SchedulePreset = DailyWeatherSummaryPreset | SevereWeatherAlertPreset;
