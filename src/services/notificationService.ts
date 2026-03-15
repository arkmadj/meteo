/**
 * Notification Service
 * Unified service for managing push subscriptions, permissions, delivery,
 * scheduling, preferences, and notification history.
 */

import type {
  CategoryPreference,
  CreateNotificationOptions,
  NotificationCategory,
  NotificationChannel,
  NotificationErrorCode,
  NotificationEvent,
  NotificationEventCallback,
  NotificationEventType,
  NotificationHistoryQuery,
  NotificationItem,
  NotificationPreferences,
  NotificationPriority,
  NotificationResult,
  NotificationServiceConfig,
  NotificationServiceState,
  NotificationStats,
  NotificationSubscription,
  QueuedNotification,
  ScheduledNotification,
} from '@/types/notification';
import type { PushPermissionStatus } from '@/types/pushNotification';

import { pushNotificationService } from './pushNotificationService';

// Default configuration
const DEFAULT_CONFIG: Required<NotificationServiceConfig> = {
  storageKeyPrefix: 'notification_service_',
  maxHistorySize: 100,
  maxScheduledNotifications: 50,
  maxRetryAttempts: 3,
  retryDelayMs: 5000,
  defaultPreferences: {},
  debug: false,
};

// Default preferences for each category
const DEFAULT_CATEGORY_PREFERENCE: CategoryPreference = {
  enabled: true,
  channels: ['push', 'in-app'],
  sound: true,
  vibration: true,
};

// Default notification preferences
const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  categories: {
    'weather-alert': { ...DEFAULT_CATEGORY_PREFERENCE, priority: 'high' },
    'weather-update': { ...DEFAULT_CATEGORY_PREFERENCE, priority: 'normal' },
    forecast: { ...DEFAULT_CATEGORY_PREFERENCE, priority: 'normal' },
    system: { ...DEFAULT_CATEGORY_PREFERENCE, priority: 'normal' },
    reminder: { ...DEFAULT_CATEGORY_PREFERENCE, priority: 'normal' },
    promotional: { ...DEFAULT_CATEGORY_PREFERENCE, enabled: false, priority: 'low' },
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '07:00',
    allowUrgent: true,
  },
  defaultSound: true,
  defaultVibration: true,
  groupNotifications: true,
  maxNotificationsPerHour: 10,
};

/**
 * Generate a unique ID for notifications
 */
const generateId = (): string => {
  return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Notification Service Class
 * Singleton service for unified notification management
 */
class NotificationService {
  private static instance: NotificationService;
  private config: Required<NotificationServiceConfig>;
  private isInitialized = false;
  private preferences: NotificationPreferences;
  private subscriptions: NotificationSubscription[] = [];
  private history: NotificationItem[] = [];
  private scheduledNotifications: ScheduledNotification[] = [];
  private queue: QueuedNotification[] = [];
  private eventListeners: Map<NotificationEventType, Set<NotificationEventCallback>> = new Map();
  private schedulerInterval: ReturnType<typeof setInterval> | null = null;
  private queueProcessorInterval: ReturnType<typeof setInterval> | null = null;

  private constructor(config: NotificationServiceConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config } as Required<NotificationServiceConfig>;
    this.preferences = {
      ...DEFAULT_PREFERENCES,
      ...this.config.defaultPreferences,
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: NotificationServiceConfig): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService(config);
    }
    return NotificationService.instance;
  }

  /**
   * Reset singleton instance (for testing)
   */
  public static resetInstance(): void {
    if (NotificationService.instance) {
      NotificationService.instance.destroy();
      NotificationService.instance = null as unknown as NotificationService;
    }
  }

  /**
   * Initialize the notification service
   */
  public async initialize(): Promise<NotificationResult<void>> {
    if (this.isInitialized) {
      return { success: true };
    }

    try {
      this.log('Initializing notification service...');

      // Load persisted data from storage
      await this.loadFromStorage();

      // Start background processors
      this.startScheduler();
      this.startQueueProcessor();

      // Set up push notification callbacks
      this.setupPushCallbacks();

      this.isInitialized = true;
      this.log('Notification service initialized successfully');

      return { success: true };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.log('Initialization failed:', err.message);
      return {
        success: false,
        error: err,
        errorCode: 'UNKNOWN',
      };
    }
  }

  /**
   * Destroy the service and clean up resources
   */
  public destroy(): void {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
    if (this.queueProcessorInterval) {
      clearInterval(this.queueProcessorInterval);
      this.queueProcessorInterval = null;
    }
    this.eventListeners.clear();
    this.isInitialized = false;
    this.log('Notification service destroyed');
  }

  // ============================================
  // Permission Management
  // ============================================

  /**
   * Check if notifications are supported
   */
  public isSupported(): boolean {
    return pushNotificationService.isSupported();
  }

  /**
   * Get current permission status
   */
  public getPermissionStatus(): PushPermissionStatus {
    return pushNotificationService.getPermissionStatus();
  }

  /**
   * Request notification permission
   */
  public async requestPermission(): Promise<NotificationResult<NotificationPermission>> {
    const result = await pushNotificationService.requestPermission();
    if (result.success || result.data) {
      this.emitEvent('permission:changed', undefined, { permission: result.data });
    }
    return {
      success: result.success,
      data: result.data,
      error: result.error,
      errorCode: result.errorCode as NotificationErrorCode,
    };
  }

  // ============================================
  // Subscription Management
  // ============================================

  /**
   * Subscribe to push notifications
   */
  public async subscribeToPush(): Promise<NotificationResult<PushSubscription>> {
    if (!this.isInitialized) {
      return {
        success: false,
        errorCode: 'NOT_INITIALIZED',
        error: new Error('Notification service not initialized'),
      };
    }

    const result = await pushNotificationService.subscribe();
    if (result.success) {
      await this.saveToStorage();
    }
    return {
      success: result.success,
      data: result.data,
      error: result.error,
      errorCode: result.errorCode as NotificationErrorCode,
    };
  }

  /**
   * Unsubscribe from push notifications
   */
  public async unsubscribeFromPush(): Promise<NotificationResult<boolean>> {
    const result = await pushNotificationService.unsubscribe();
    if (result.success) {
      await this.saveToStorage();
    }
    return {
      success: result.success,
      data: result.data,
      error: result.error,
      errorCode: result.errorCode as NotificationErrorCode,
    };
  }

  /**
   * Subscribe to a notification topic
   */
  public async subscribeToTopic(
    topic: string,
    category: NotificationCategory,
    channels: NotificationChannel[] = ['push', 'in-app']
  ): Promise<NotificationResult<NotificationSubscription>> {
    if (!this.isInitialized) {
      return {
        success: false,
        errorCode: 'NOT_INITIALIZED',
        error: new Error('Notification service not initialized'),
      };
    }

    // Check if already subscribed
    const existing = this.subscriptions.find(s => s.topic === topic);
    if (existing) {
      return { success: true, data: existing };
    }

    const subscription: NotificationSubscription = {
      id: generateId(),
      topic,
      category,
      channels,
      subscribedAt: new Date(),
    };

    this.subscriptions.push(subscription);
    await this.saveToStorage();

    this.emitEvent('subscription:added', undefined, { subscription });
    this.log('Subscribed to topic:', topic);

    return { success: true, data: subscription };
  }

  /**
   * Unsubscribe from a notification topic
   */
  public async unsubscribeFromTopic(topic: string): Promise<NotificationResult<void>> {
    const index = this.subscriptions.findIndex(s => s.topic === topic);
    if (index === -1) {
      return { success: true }; // Already unsubscribed
    }

    const [removed] = this.subscriptions.splice(index, 1);
    await this.saveToStorage();

    this.emitEvent('subscription:removed', undefined, { subscription: removed });
    this.log('Unsubscribed from topic:', topic);

    return { success: true };
  }

  /**
   * Get all active subscriptions
   */
  public getSubscriptions(): NotificationSubscription[] {
    return [...this.subscriptions];
  }

  // ============================================
  // Notification Delivery
  // ============================================

  /**
   * Create and deliver a notification
   */
  public async notify(
    options: CreateNotificationOptions
  ): Promise<NotificationResult<NotificationItem>> {
    if (!this.isInitialized) {
      return {
        success: false,
        errorCode: 'NOT_INITIALIZED',
        error: new Error('Notification service not initialized'),
      };
    }

    // Check if notifications are enabled
    if (!this.preferences.enabled) {
      this.log('Notifications are disabled');
      return {
        success: false,
        errorCode: 'PERMISSION_DENIED',
        error: new Error('Notifications are disabled in preferences'),
      };
    }

    // Check category preferences
    const category = options.category || 'system';
    const categoryPref = this.preferences.categories[category];
    if (categoryPref && !categoryPref.enabled) {
      this.log(`Category ${category} is disabled`);
      return {
        success: false,
        errorCode: 'PERMISSION_DENIED',
        error: new Error(`Notifications for category ${category} are disabled`),
      };
    }

    // Check quiet hours - only queue non-urgent notifications during quiet hours
    const isUrgent = options.priority === 'urgent';
    if (this.isInQuietHours() && !isUrgent) {
      if (!this.preferences.quietHours?.allowUrgent) {
        this.log('In quiet hours, notification queued');
        return this.queueNotification(options);
      }
    }

    // Create notification item
    const notification = this.createNotificationItem(options);

    // Emit created event
    this.emitEvent('notification:created', notification);

    // Deliver based on channel
    const channel = options.channel || 'push';
    let deliveryResult: NotificationResult;

    switch (channel) {
      case 'push':
        deliveryResult = await this.deliverPushNotification(notification);
        break;
      case 'in-app':
        deliveryResult = await this.deliverInAppNotification(notification);
        break;
      default:
        deliveryResult = { success: true };
    }

    // Update notification status
    if (deliveryResult.success) {
      notification.status = 'delivered';
      notification.deliveredAt = new Date();
      this.emitEvent('notification:delivered', notification);
    } else {
      notification.status = 'failed';
      this.emitEvent('notification:failed', notification, {
        error: deliveryResult.error?.message,
      });
    }

    // Add to history
    this.addToHistory(notification);

    return {
      success: deliveryResult.success,
      data: notification,
      error: deliveryResult.error,
      errorCode: deliveryResult.errorCode as NotificationErrorCode,
    };
  }

  /**
   * Schedule a notification for future delivery
   */
  public async scheduleNotification(
    options: CreateNotificationOptions,
    scheduledFor: Date
  ): Promise<NotificationResult<ScheduledNotification>> {
    if (!this.isInitialized) {
      return {
        success: false,
        errorCode: 'NOT_INITIALIZED',
        error: new Error('Notification service not initialized'),
      };
    }

    if (scheduledFor <= new Date()) {
      // Deliver immediately if scheduled time is in the past
      const result = await this.notify(options);
      if (result.success && result.data) {
        return {
          success: true,
          data: {
            id: result.data.id,
            notification: options,
            scheduledFor,
            createdAt: new Date(),
            status: 'executed',
          },
        };
      }
      return {
        success: false,
        error: result.error,
        errorCode: result.errorCode,
      };
    }

    if (this.scheduledNotifications.length >= this.config.maxScheduledNotifications) {
      return {
        success: false,
        errorCode: 'QUOTA_EXCEEDED',
        error: new Error('Maximum scheduled notifications limit reached'),
      };
    }

    const scheduled: ScheduledNotification = {
      id: generateId(),
      notification: options,
      scheduledFor,
      createdAt: new Date(),
      status: 'pending',
    };

    this.scheduledNotifications.push(scheduled);
    await this.saveToStorage();

    this.log('Notification scheduled for:', scheduledFor.toISOString());

    return { success: true, data: scheduled };
  }

  /**
   * Cancel a scheduled notification
   */
  public async cancelScheduledNotification(id: string): Promise<NotificationResult<void>> {
    const index = this.scheduledNotifications.findIndex(s => s.id === id);
    if (index === -1) {
      return { success: true }; // Already cancelled or doesn't exist
    }

    this.scheduledNotifications[index].status = 'cancelled';
    this.scheduledNotifications.splice(index, 1);
    await this.saveToStorage();

    this.log('Scheduled notification cancelled:', id);

    return { success: true };
  }

  /**
   * Get all scheduled notifications
   */
  public getScheduledNotifications(): ScheduledNotification[] {
    return this.scheduledNotifications.filter(s => s.status === 'pending');
  }

  // ============================================
  // Preferences Management
  // ============================================

  /**
   * Get current notification preferences
   */
  public getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Update notification preferences
   */
  public async updatePreferences(
    updates: Partial<NotificationPreferences>
  ): Promise<NotificationResult<NotificationPreferences>> {
    this.preferences = {
      ...this.preferences,
      ...updates,
      categories: {
        ...this.preferences.categories,
        ...(updates.categories || {}),
      },
    };

    await this.saveToStorage();
    this.emitEvent('preferences:changed', undefined, { preferences: this.preferences });

    this.log('Preferences updated');

    return { success: true, data: this.preferences };
  }

  /**
   * Update category-specific preferences
   */
  public async updateCategoryPreference(
    category: NotificationCategory,
    preference: Partial<CategoryPreference>
  ): Promise<NotificationResult<void>> {
    this.preferences.categories[category] = {
      ...this.preferences.categories[category],
      ...preference,
    };

    await this.saveToStorage();
    this.emitEvent('preferences:changed', undefined, { preferences: this.preferences });

    return { success: true };
  }

  // ============================================
  // History Management
  // ============================================

  /**
   * Get notification history
   */
  public getHistory(query?: NotificationHistoryQuery): NotificationItem[] {
    let results = [...this.history];

    if (query) {
      if (query.category) {
        results = results.filter(n => n.category === query.category);
      }
      if (query.status) {
        results = results.filter(n => n.status === query.status);
      }
      if (query.channel) {
        results = results.filter(n => n.channel === query.channel);
      }
      if (query.startDate) {
        results = results.filter(n => n.createdAt >= query.startDate!);
      }
      if (query.endDate) {
        results = results.filter(n => n.createdAt <= query.endDate!);
      }

      // Apply pagination
      const offset = query.offset || 0;
      const limit = query.limit || results.length;
      results = results.slice(offset, offset + limit);
    }

    return results;
  }

  /**
   * Get notification statistics
   */
  public getStats(): NotificationStats {
    const stats: NotificationStats = {
      total: this.history.length,
      delivered: 0,
      clicked: 0,
      dismissed: 0,
      failed: 0,
      pending: 0,
      byCategory: {
        'weather-alert': 0,
        'weather-update': 0,
        forecast: 0,
        system: 0,
        reminder: 0,
        promotional: 0,
      },
      byChannel: {
        push: 0,
        'in-app': 0,
        email: 0,
        sms: 0,
      },
    };

    for (const notification of this.history) {
      // Count by status
      switch (notification.status) {
        case 'delivered':
          stats.delivered++;
          break;
        case 'clicked':
          stats.clicked++;
          break;
        case 'dismissed':
          stats.dismissed++;
          break;
        case 'failed':
          stats.failed++;
          break;
        case 'pending':
        case 'scheduled':
          stats.pending++;
          break;
      }

      // Count by category
      stats.byCategory[notification.category]++;

      // Count by channel
      stats.byChannel[notification.channel]++;
    }

    return stats;
  }

  /**
   * Clear notification history
   */
  public async clearHistory(): Promise<NotificationResult<void>> {
    this.history = [];
    await this.saveToStorage();
    this.log('History cleared');
    return { success: true };
  }

  /**
   * Mark notification as clicked
   */
  public markAsClicked(notificationId: string): void {
    const notification = this.history.find(n => n.id === notificationId);
    if (notification) {
      notification.status = 'clicked';
      notification.clickedAt = new Date();
      this.emitEvent('notification:clicked', notification);
      this.saveToStorage();
    }
  }

  /**
   * Mark notification as dismissed
   */
  public markAsDismissed(notificationId: string): void {
    const notification = this.history.find(n => n.id === notificationId);
    if (notification) {
      notification.status = 'dismissed';
      notification.dismissedAt = new Date();
      this.emitEvent('notification:dismissed', notification);
      this.saveToStorage();
    }
  }

  /**
   * Mark notification as read
   */
  public markAsRead(notificationId: string): void {
    const notification = this.history.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      this.emitEvent('notification:clicked', notification);
      this.saveToStorage();
    }
  }

  /**
   * Mark notification as unread
   */
  public markAsUnread(notificationId: string): void {
    const notification = this.history.find(n => n.id === notificationId);
    if (notification && notification.isRead) {
      notification.isRead = false;
      notification.readAt = undefined;
      this.saveToStorage();
    }
  }

  /**
   * Mark all notifications as read
   */
  public markAllAsRead(): void {
    const now = new Date();
    let hasChanges = false;
    for (const notification of this.history) {
      if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = now;
        hasChanges = true;
      }
    }
    if (hasChanges) {
      this.saveToStorage();
    }
  }

  /**
   * Get the count of unread notifications
   */
  public getUnreadCount(): number {
    return this.history.filter(n => !n.isRead).length;
  }

  /**
   * Check if a notification is read
   */
  public isNotificationRead(notificationId: string): boolean {
    const notification = this.history.find(n => n.id === notificationId);
    return notification?.isRead ?? false;
  }

  // ============================================
  // Event Handling
  // ============================================

  /**
   * Add event listener
   */
  public on(event: NotificationEventType, callback: NotificationEventCallback): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.eventListeners.get(event)?.delete(callback);
    };
  }

  /**
   * Remove event listener
   */
  public off(event: NotificationEventType, callback: NotificationEventCallback): void {
    this.eventListeners.get(event)?.delete(callback);
  }

  // ============================================
  // Service State
  // ============================================

  /**
   * Get current service state
   */
  public getState(): NotificationServiceState {
    return {
      isSupported: this.isSupported(),
      permission: this.getPermissionStatus(),
      isInitialized: this.isInitialized,
      pendingCount: this.queue.length,
      preferences: this.getPreferences(),
      subscriptions: this.getSubscriptions(),
    };
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  /**
   * Create a notification item from options
   */
  private createNotificationItem(options: CreateNotificationOptions): NotificationItem {
    return {
      id: generateId(),
      title: options.title,
      body: options.body,
      category: options.category || 'system',
      priority: options.priority || 'normal',
      channel: options.channel || 'push',
      status: 'pending',
      isRead: false,
      createdAt: new Date(),
      expiresAt: options.expiresAt,
      scheduledFor: options.scheduledFor,
      data: options.data,
      icon: options.icon,
      badge: options.badge,
      tag: options.tag,
      actions: options.actions,
      metadata: options.metadata,
    };
  }

  /**
   * Queue a notification for later delivery
   */
  private async queueNotification(
    options: CreateNotificationOptions
  ): Promise<NotificationResult<NotificationItem>> {
    const queuedItem: QueuedNotification = {
      id: generateId(),
      notification: options,
      addedAt: new Date(),
      priority: options.priority || 'normal',
      attempts: 0,
    };

    this.queue.push(queuedItem);
    this.sortQueue();
    await this.saveToStorage();

    const notification = this.createNotificationItem(options);
    notification.status = 'pending';

    return { success: true, data: notification };
  }

  /**
   * Sort queue by priority
   */
  private sortQueue(): void {
    const priorityOrder: Record<NotificationPriority, number> = {
      urgent: 0,
      high: 1,
      normal: 2,
      low: 3,
    };

    this.queue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  /**
   * Deliver a push notification
   */
  private async deliverPushNotification(
    notification: NotificationItem
  ): Promise<NotificationResult> {
    const result = await pushNotificationService.showNotification({
      title: notification.title,
      body: notification.body,
      icon: notification.icon,
      badge: notification.badge,
      tag: notification.tag,
      data: notification.data,
      actions: notification.actions?.map(a => ({
        action: a.action,
        title: a.label,
        icon: a.icon,
      })),
    });

    return {
      success: result.success,
      error: result.error,
      errorCode: result.errorCode as NotificationErrorCode,
    };
  }

  /**
   * Deliver an in-app notification (placeholder - integrate with snackbar or similar)
   */
  private async deliverInAppNotification(
    _notification: NotificationItem
  ): Promise<NotificationResult> {
    // This would integrate with the app's UI notification system (e.g., snackbar)
    // For now, just return success
    this.log('In-app notification delivery (integration point)');
    return { success: true };
  }

  /**
   * Add notification to history
   */
  private addToHistory(notification: NotificationItem): void {
    this.history.unshift(notification);

    // Trim history if it exceeds max size
    if (this.history.length > this.config.maxHistorySize) {
      this.history = this.history.slice(0, this.config.maxHistorySize);
    }

    this.saveToStorage();
  }

  /**
   * Check if currently in quiet hours
   */
  private isInQuietHours(): boolean {
    if (!this.preferences.quietHours?.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const { start, end } = this.preferences.quietHours;

    // Handle overnight quiet hours (e.g., 22:00 - 07:00)
    if (start > end) {
      return currentTime >= start || currentTime < end;
    }

    return currentTime >= start && currentTime < end;
  }

  /**
   * Emit an event to all listeners
   */
  private emitEvent(
    type: NotificationEventType,
    notification?: NotificationItem,
    data?: Record<string, unknown>
  ): void {
    const event: NotificationEvent = {
      type,
      notification,
      timestamp: new Date(),
      data,
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

  /**
   * Set up push notification callbacks
   */
  private setupPushCallbacks(): void {
    pushNotificationService.setOnNotificationClick((action, data) => {
      const notificationId = data?.notificationId as string | undefined;
      if (notificationId) {
        this.markAsClicked(notificationId);
      }
      this.emitEvent('notification:clicked', undefined, { action, data });
    });

    pushNotificationService.setOnNotificationClose((tag, data) => {
      const notificationId = data?.notificationId as string | undefined;
      if (notificationId) {
        this.markAsDismissed(notificationId);
      }
      this.emitEvent('notification:dismissed', undefined, { tag, data });
    });
  }

  /**
   * Start the scheduler for processing scheduled notifications
   */
  private startScheduler(): void {
    // Check every minute for scheduled notifications
    this.schedulerInterval = setInterval(() => {
      this.processScheduledNotifications();
    }, 60000);
  }

  /**
   * Process scheduled notifications that are due
   */
  private async processScheduledNotifications(): Promise<void> {
    const now = new Date();
    const dueNotifications = this.scheduledNotifications.filter(
      s => s.status === 'pending' && s.scheduledFor <= now
    );

    for (const scheduled of dueNotifications) {
      scheduled.status = 'executed';
      await this.notify(scheduled.notification);
    }

    // Remove executed notifications
    this.scheduledNotifications = this.scheduledNotifications.filter(s => s.status === 'pending');

    if (dueNotifications.length > 0) {
      await this.saveToStorage();
    }
  }

  /**
   * Start the queue processor for retrying failed notifications
   */
  private startQueueProcessor(): void {
    // Process queue every 30 seconds
    this.queueProcessorInterval = setInterval(() => {
      this.processQueue();
    }, 30000);
  }

  /**
   * Process the notification queue
   */
  private async processQueue(): Promise<void> {
    // Skip if in quiet hours
    if (this.isInQuietHours()) {
      return;
    }

    const toProcess = [...this.queue];
    this.queue = [];

    for (const queued of toProcess) {
      queued.attempts++;
      queued.lastAttemptAt = new Date();

      const result = await this.notify(queued.notification);

      if (!result.success && queued.attempts < this.config.maxRetryAttempts) {
        queued.errorMessage = result.error?.message;
        this.queue.push(queued);
      }
    }

    if (toProcess.length > 0) {
      await this.saveToStorage();
    }
  }

  /**
   * Load data from storage
   */
  private async loadFromStorage(): Promise<void> {
    try {
      const preferencesKey = `${this.config.storageKeyPrefix}preferences`;
      const historyKey = `${this.config.storageKeyPrefix}history`;
      const subscriptionsKey = `${this.config.storageKeyPrefix}subscriptions`;
      const scheduledKey = `${this.config.storageKeyPrefix}scheduled`;
      const queueKey = `${this.config.storageKeyPrefix}queue`;

      const storedPreferences = localStorage.getItem(preferencesKey);
      if (storedPreferences) {
        this.preferences = { ...this.preferences, ...JSON.parse(storedPreferences) };
      }

      const storedHistory = localStorage.getItem(historyKey);
      if (storedHistory) {
        this.history = JSON.parse(storedHistory).map((n: NotificationItem) => ({
          ...n,
          // Ensure isRead defaults to false for backward compatibility
          isRead: n.isRead ?? false,
          createdAt: new Date(n.createdAt),
          deliveredAt: n.deliveredAt ? new Date(n.deliveredAt) : undefined,
          readAt: n.readAt ? new Date(n.readAt) : undefined,
          clickedAt: n.clickedAt ? new Date(n.clickedAt) : undefined,
          dismissedAt: n.dismissedAt ? new Date(n.dismissedAt) : undefined,
          expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined,
        }));
      }

      const storedSubscriptions = localStorage.getItem(subscriptionsKey);
      if (storedSubscriptions) {
        this.subscriptions = JSON.parse(storedSubscriptions).map((s: NotificationSubscription) => ({
          ...s,
          subscribedAt: new Date(s.subscribedAt),
        }));
      }

      const storedScheduled = localStorage.getItem(scheduledKey);
      if (storedScheduled) {
        this.scheduledNotifications = JSON.parse(storedScheduled).map(
          (s: ScheduledNotification) => ({
            ...s,
            scheduledFor: new Date(s.scheduledFor),
            createdAt: new Date(s.createdAt),
          })
        );
      }

      const storedQueue = localStorage.getItem(queueKey);
      if (storedQueue) {
        this.queue = JSON.parse(storedQueue).map((q: QueuedNotification) => ({
          ...q,
          addedAt: new Date(q.addedAt),
          lastAttemptAt: q.lastAttemptAt ? new Date(q.lastAttemptAt) : undefined,
        }));
      }

      this.log('Data loaded from storage');
    } catch (error) {
      this.log('Failed to load from storage:', error);
    }
  }

  /**
   * Save data to storage
   */
  private async saveToStorage(): Promise<void> {
    try {
      const preferencesKey = `${this.config.storageKeyPrefix}preferences`;
      const historyKey = `${this.config.storageKeyPrefix}history`;
      const subscriptionsKey = `${this.config.storageKeyPrefix}subscriptions`;
      const scheduledKey = `${this.config.storageKeyPrefix}scheduled`;
      const queueKey = `${this.config.storageKeyPrefix}queue`;

      localStorage.setItem(preferencesKey, JSON.stringify(this.preferences));
      localStorage.setItem(historyKey, JSON.stringify(this.history));
      localStorage.setItem(subscriptionsKey, JSON.stringify(this.subscriptions));
      localStorage.setItem(scheduledKey, JSON.stringify(this.scheduledNotifications));
      localStorage.setItem(queueKey, JSON.stringify(this.queue));
    } catch (error) {
      this.log('Failed to save to storage:', error);
    }
  }

  /**
   * Debug logging
   */
  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log('[NotificationService]', ...args);
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// Export class for testing or custom instances
export { NotificationService };
