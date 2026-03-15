/**
 * Notification Service Types
 * Type definitions for the unified notification service including categories,
 * preferences, scheduling, history, and delivery management.
 */

import type { PushNotificationData, PushPermissionStatus } from './pushNotification';

/**
 * Notification channel types
 */
export type NotificationChannel = 'push' | 'in-app' | 'email' | 'sms';

/**
 * Notification category for grouping and filtering
 */
export type NotificationCategory =
  | 'weather-alert'
  | 'weather-update'
  | 'forecast'
  | 'system'
  | 'reminder'
  | 'promotional';

/**
 * Notification priority levels
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Notification delivery status
 */
export type NotificationStatus =
  | 'pending'
  | 'scheduled'
  | 'delivered'
  | 'clicked'
  | 'dismissed'
  | 'expired'
  | 'failed';

/**
 * Notification item stored in history
 */
export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  channel: NotificationChannel;
  status: NotificationStatus;
  /** Whether the notification has been read by the user */
  isRead: boolean;
  createdAt: Date;
  deliveredAt?: Date;
  /** Timestamp when the notification was marked as read */
  readAt?: Date;
  clickedAt?: Date;
  dismissedAt?: Date;
  expiresAt?: Date;
  scheduledFor?: Date;
  data?: PushNotificationData;
  icon?: string;
  badge?: string;
  tag?: string;
  actions?: NotificationAction[];
  metadata?: Record<string, unknown>;
}

/**
 * Action button for notifications
 */
export interface NotificationAction {
  id: string;
  label: string;
  icon?: string;
  action: string;
}

/**
 * Options for creating a notification
 */
export interface CreateNotificationOptions {
  title: string;
  body: string;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  channel?: NotificationChannel;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  data?: PushNotificationData;
  actions?: NotificationAction[];
  expiresAt?: Date;
  scheduledFor?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Category-specific notification preferences
 */
export interface CategoryPreference {
  enabled: boolean;
  channels: NotificationChannel[];
  priority?: NotificationPriority;
  sound?: boolean;
  vibration?: boolean;
}

/**
 * User notification preferences
 */
export interface NotificationPreferences {
  enabled: boolean;
  categories: Record<NotificationCategory, CategoryPreference>;
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
    allowUrgent: boolean;
  };
  defaultSound: boolean;
  defaultVibration: boolean;
  groupNotifications: boolean;
  maxNotificationsPerHour?: number;
}

/**
 * Notification subscription for a specific topic
 */
export interface NotificationSubscription {
  id: string;
  topic: string;
  category: NotificationCategory;
  channels: NotificationChannel[];
  subscribedAt: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Notification service state
 */
export interface NotificationServiceState {
  isSupported: boolean;
  permission: PushPermissionStatus;
  isInitialized: boolean;
  pendingCount: number;
  preferences: NotificationPreferences;
  subscriptions: NotificationSubscription[];
}

/**
 * Result of notification operations
 */
export interface NotificationResult<T = void> {
  success: boolean;
  data?: T;
  error?: Error;
  errorCode?: NotificationErrorCode;
}

/**
 * Error codes for notification operations
 */
export type NotificationErrorCode =
  | 'UNSUPPORTED'
  | 'PERMISSION_DENIED'
  | 'NOT_INITIALIZED'
  | 'INVALID_OPTIONS'
  | 'QUOTA_EXCEEDED'
  | 'SCHEDULING_FAILED'
  | 'DELIVERY_FAILED'
  | 'SUBSCRIPTION_FAILED'
  | 'STORAGE_ERROR'
  | 'UNKNOWN';

/**
 * Event types emitted by the notification service
 */
export type NotificationEventType =
  | 'notification:created'
  | 'notification:delivered'
  | 'notification:clicked'
  | 'notification:dismissed'
  | 'notification:expired'
  | 'notification:failed'
  | 'permission:changed'
  | 'preferences:changed'
  | 'subscription:added'
  | 'subscription:removed';

/**
 * Event payload for notification events
 */
export interface NotificationEvent {
  type: NotificationEventType;
  notification?: NotificationItem;
  timestamp: Date;
  data?: Record<string, unknown>;
}

/**
 * Callback for notification events
 */
export type NotificationEventCallback = (event: NotificationEvent) => void;

/**
 * History query options
 */
export interface NotificationHistoryQuery {
  category?: NotificationCategory;
  status?: NotificationStatus;
  channel?: NotificationChannel;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Notification statistics
 */
export interface NotificationStats {
  total: number;
  delivered: number;
  clicked: number;
  dismissed: number;
  failed: number;
  pending: number;
  byCategory: Record<NotificationCategory, number>;
  byChannel: Record<NotificationChannel, number>;
}

/**
 * Scheduled notification task
 */
export interface ScheduledNotification {
  id: string;
  notification: CreateNotificationOptions;
  scheduledFor: Date;
  createdAt: Date;
  status: 'pending' | 'executed' | 'cancelled';
}

/**
 * Notification queue item
 */
export interface QueuedNotification {
  id: string;
  notification: CreateNotificationOptions;
  addedAt: Date;
  priority: NotificationPriority;
  attempts: number;
  lastAttemptAt?: Date;
  errorMessage?: string;
}

/**
 * Configuration for the notification service
 */
export interface NotificationServiceConfig {
  /** Storage key prefix for persisted data */
  storageKeyPrefix?: string;
  /** Maximum notifications to keep in history */
  maxHistorySize?: number;
  /** Maximum scheduled notifications allowed */
  maxScheduledNotifications?: number;
  /** Retry attempts for failed notifications */
  maxRetryAttempts?: number;
  /** Delay between retry attempts in ms */
  retryDelayMs?: number;
  /** Default notification preferences */
  defaultPreferences?: Partial<NotificationPreferences>;
  /** Enable debug logging */
  debug?: boolean;
}

// ============================================================================
// NOTIFICATION HISTORY TYPES
// ============================================================================

/**
 * Sort options for notification history
 */
export type NotificationHistorySortField =
  | 'createdAt'
  | 'title'
  | 'category'
  | 'priority'
  | 'status';
export type NotificationHistorySortDirection = 'asc' | 'desc';

/**
 * Extended history query with search and sorting
 */
export interface NotificationHistoryQueryExtended extends NotificationHistoryQuery {
  /** Search term for filtering by title or body */
  searchTerm?: string;
  /** Sort field */
  sortBy?: NotificationHistorySortField;
  /** Sort direction */
  sortDirection?: NotificationHistorySortDirection;
  /** Filter by priority */
  priority?: NotificationPriority;
  /** Include only read notifications */
  readOnly?: boolean;
  /** Include only unread notifications */
  unreadOnly?: boolean;
}

/**
 * Paginated notification history result
 */
export interface NotificationHistoryPage {
  /** Notification items for current page */
  items: NotificationItem[];
  /** Total number of items matching the query */
  totalItems: number;
  /** Total number of pages */
  totalPages: number;
  /** Current page number (1-based) */
  currentPage: number;
  /** Number of items per page */
  pageSize: number;
  /** Whether there are more items */
  hasMore: boolean;
  /** Whether this is the first page */
  isFirstPage: boolean;
  /** Whether this is the last page */
  isLastPage: boolean;
}

/**
 * Notification history filter state
 */
export interface NotificationHistoryFilters {
  /** Active category filter */
  category: NotificationCategory | 'all';
  /** Active status filter */
  status: NotificationStatus | 'all';
  /** Active channel filter */
  channel: NotificationChannel | 'all';
  /** Active priority filter */
  priority: NotificationPriority | 'all';
  /** Search term */
  searchTerm: string;
  /** Start date filter */
  startDate: Date | null;
  /** End date filter */
  endDate: Date | null;
  /** Read status filter */
  readStatus: 'all' | 'read' | 'unread';
}

/**
 * Default history filters
 */
export const DEFAULT_NOTIFICATION_HISTORY_FILTERS: NotificationHistoryFilters = {
  category: 'all',
  status: 'all',
  channel: 'all',
  priority: 'all',
  searchTerm: '',
  startDate: null,
  endDate: null,
  readStatus: 'all',
};

/**
 * Notification action type for history operations
 */
export type NotificationHistoryAction =
  | 'view'
  | 'mark-read'
  | 'mark-unread'
  | 'dismiss'
  | 'delete'
  | 'archive'
  | 'restore';

/**
 * Bulk action options for history
 */
export interface NotificationBulkActionOptions {
  /** Action to perform */
  action: NotificationHistoryAction;
  /** IDs of notifications to act on */
  notificationIds: string[];
}

/**
 * Extended notification stats with history metrics
 */
export interface NotificationHistoryStats extends NotificationStats {
  /** Number of archived notifications */
  archived: number;
  /** Notifications received today */
  today: number;
  /** Notifications received this week */
  thisWeek: number;
  /** Notifications received this month */
  thisMonth: number;
  /** Average read time in seconds (if tracked) */
  averageReadTime?: number;
  /** Most active category */
  mostActiveCategory: NotificationCategory | null;
  /** Click-through rate (clicked / delivered) */
  clickThroughRate: number;
}

/**
 * Date range preset for filtering
 */
export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'custom';

/**
 * Date range filter option
 */
export interface DateRangeOption {
  /** Preset identifier */
  preset: DateRangePreset;
  /** Display label */
  label: string;
  /** Start date calculator */
  getStartDate: () => Date;
  /** End date calculator */
  getEndDate: () => Date;
}
