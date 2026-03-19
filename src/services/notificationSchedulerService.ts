/**
 * Notification Scheduler Service
 *
 * Manages scheduled and automated weather alerts with support for:
 * - Time-based triggers (specific times, intervals)
 * - Weather condition-based triggers
 * - Sunrise/sunset-based triggers
 * - Recurring schedules (daily, weekly, monthly, custom)
 * - Preset schedules (daily summaries, severe weather alerts)
 */

import type {
  ConditionTrigger,
  CreateScheduledAlertOptions,
  DayOfWeek,
  RecurrencePattern,
  ScheduledAlert,
  ScheduleExecution,
  ScheduleFilterOptions,
  SchedulerEvent,
  SchedulerEventCallback,
  SchedulerEventType,
  SchedulerServiceConfig,
  SchedulerStatistics,
  ScheduleTrigger,
} from '@/types/notificationScheduler';
import type { CurrentWeatherData } from '@/types/weather';

import { getLogger } from '@/utils/logger';
import { notificationService } from './notificationService';
import { weatherAlertService } from './weatherAlertService';

// Logger instance
const logger = getLogger('NotificationSchedulerService');

// Default configuration
const DEFAULT_CONFIG: Required<SchedulerServiceConfig> = {
  storageKeyPrefix: 'notification_scheduler_',
  maxSchedules: 50,
  maxExecutionHistory: 100,
  tickIntervalMs: 60 * 1000, // 1 minute
  debug: false,
  defaultConditionCheckIntervalMs: 5 * 60 * 1000, // 5 minutes
};

// Default recurrence pattern
const DEFAULT_RECURRENCE: RecurrencePattern = {
  frequency: 'once',
  interval: 1,
};

/**
 * Generate unique ID
 */
const generateId = (): string =>
  `sched_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

/**
 * Day of week to number mapping (0 = Sunday)
 */
const DAY_OF_WEEK_MAP: Record<DayOfWeek, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

/**
 * Notification Scheduler Service
 * Singleton service for managing scheduled notifications
 */
class NotificationSchedulerService {
  private static instance: NotificationSchedulerService;
  private config: Required<SchedulerServiceConfig>;
  private isInitialized = false;
  private isRunning = false;
  private schedules: Map<string, ScheduledAlert> = new Map();
  private executionHistory: Map<string, ScheduleExecution[]> = new Map();
  private eventListeners: Map<SchedulerEventType, Set<SchedulerEventCallback>> = new Map();
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private conditionCheckIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();
  private currentWeatherData: Map<string, CurrentWeatherData> = new Map();

  private constructor(config: SchedulerServiceConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config } as Required<SchedulerServiceConfig>;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: SchedulerServiceConfig): NotificationSchedulerService {
    if (!NotificationSchedulerService.instance) {
      NotificationSchedulerService.instance = new NotificationSchedulerService(config);
    }
    return NotificationSchedulerService.instance;
  }

  /**
   * Reset singleton instance (for testing)
   */
  public static resetInstance(): void {
    if (NotificationSchedulerService.instance) {
      NotificationSchedulerService.instance.destroy();
      NotificationSchedulerService.instance = null as unknown as NotificationSchedulerService;
    }
  }

  /**
   * Initialize the scheduler service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.log('Initializing notification scheduler service...');

    await this.loadFromStorage();
    this.updateNextExecutionTimes();
    this.isInitialized = true;

    this.log('Notification scheduler service initialized');
  }

  /**
   * Destroy the service and clean up resources
   */
  public destroy(): void {
    this.stop();
    this.eventListeners.clear();
    this.schedules.clear();
    this.executionHistory.clear();
    this.currentWeatherData.clear();
    this.isInitialized = false;
    this.log('Notification scheduler service destroyed');
  }

  /**
   * Start the scheduler
   */
  public start(): void {
    if (this.isRunning) {
      return;
    }

    this.ensureInitialized();
    this.log('Starting scheduler...');

    // Start main tick interval
    this.tickInterval = setInterval(() => {
      this.tick();
    }, this.config.tickIntervalMs);

    // Start condition check intervals for condition-based schedules
    this.startConditionChecks();

    this.isRunning = true;
    this.emitEvent('scheduler:started');
    this.log('Scheduler started');
  }

  /**
   * Stop the scheduler
   */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }

    this.stopConditionChecks();
    this.isRunning = false;
    this.emitEvent('scheduler:stopped');
    this.log('Scheduler stopped');
  }

  // ============================================
  // Schedule Management
  // ============================================

  /**
   * Create a new scheduled alert
   */
  public async createSchedule(options: CreateScheduledAlertOptions): Promise<ScheduledAlert> {
    this.ensureInitialized();

    if (this.schedules.size >= this.config.maxSchedules) {
      throw new Error('Maximum number of schedules reached');
    }

    const now = new Date();
    const recurrence: RecurrencePattern = {
      ...DEFAULT_RECURRENCE,
      ...options.recurrence,
    };

    const schedule: ScheduledAlert = {
      id: generateId(),
      name: options.name,
      description: options.description,
      enabled: options.enabled ?? true,
      status: 'active',
      trigger: options.trigger,
      recurrence,
      notification: {
        title: options.notification.title,
        body: options.notification.body,
        category: options.notification.category || 'weather-alert',
        priority: options.notification.priority || 'normal',
        icon: options.notification.icon,
        data: options.notification.data,
      },
      locations: options.locations,
      minimumSeverity: options.minimumSeverity,
      metadata: options.metadata,
      createdAt: now,
      updatedAt: now,
      executionCount: 0,
    };

    // Calculate next execution time
    schedule.nextExecutionAt = this.calculateNextExecution(schedule);

    this.schedules.set(schedule.id, schedule);
    this.executionHistory.set(schedule.id, []);

    // Start condition check if needed
    if (schedule.trigger.type === 'condition' && schedule.enabled && this.isRunning) {
      this.startConditionCheck(schedule);
    }

    await this.saveToStorage();
    this.emitEvent('schedule:created', { schedule });
    this.log('Schedule created:', schedule.id);

    return schedule;
  }

  /**
   * Update an existing schedule
   */
  public async updateSchedule(
    scheduleId: string,
    updates: Partial<CreateScheduledAlertOptions>
  ): Promise<ScheduledAlert> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule not found: ${scheduleId}`);
    }

    // Stop existing condition check if trigger is changing
    if (updates.trigger && schedule.trigger.type === 'condition') {
      this.stopConditionCheck(scheduleId);
    }

    // Apply updates
    if (updates.name) schedule.name = updates.name;
    if (updates.description !== undefined) schedule.description = updates.description;
    if (updates.trigger) schedule.trigger = updates.trigger;
    if (updates.recurrence) {
      schedule.recurrence = { ...schedule.recurrence, ...updates.recurrence };
    }
    if (updates.notification) {
      schedule.notification = { ...schedule.notification, ...updates.notification };
    }
    if (updates.locations) schedule.locations = updates.locations;
    if (updates.minimumSeverity) schedule.minimumSeverity = updates.minimumSeverity;
    if (updates.metadata) schedule.metadata = { ...schedule.metadata, ...updates.metadata };
    if (updates.enabled !== undefined) schedule.enabled = updates.enabled;

    schedule.updatedAt = new Date();
    schedule.nextExecutionAt = this.calculateNextExecution(schedule);

    // Restart condition check if needed
    if (schedule.trigger.type === 'condition' && schedule.enabled && this.isRunning) {
      this.startConditionCheck(schedule);
    }

    await this.saveToStorage();
    this.emitEvent('schedule:updated', { schedule });
    this.log('Schedule updated:', scheduleId);

    return schedule;
  }

  /**
   * Delete a schedule
   */
  public async deleteSchedule(scheduleId: string): Promise<void> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      return;
    }

    this.stopConditionCheck(scheduleId);
    this.schedules.delete(scheduleId);
    this.executionHistory.delete(scheduleId);

    await this.saveToStorage();
    this.emitEvent('schedule:deleted', { schedule });
    this.log('Schedule deleted:', scheduleId);
  }

  /**
   * Pause a schedule
   */
  public async pauseSchedule(scheduleId: string): Promise<void> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule not found: ${scheduleId}`);
    }

    schedule.enabled = false;
    schedule.status = 'paused';
    schedule.updatedAt = new Date();

    this.stopConditionCheck(scheduleId);
    await this.saveToStorage();
    this.emitEvent('schedule:paused', { schedule });
    this.log('Schedule paused:', scheduleId);
  }

  /**
   * Resume a schedule
   */
  public async resumeSchedule(scheduleId: string): Promise<void> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule not found: ${scheduleId}`);
    }

    schedule.enabled = true;
    schedule.status = 'active';
    schedule.updatedAt = new Date();
    schedule.nextExecutionAt = this.calculateNextExecution(schedule);

    if (schedule.trigger.type === 'condition' && this.isRunning) {
      this.startConditionCheck(schedule);
    }

    await this.saveToStorage();
    this.emitEvent('schedule:resumed', { schedule });
    this.log('Schedule resumed:', scheduleId);
  }

  /**
   * Get a schedule by ID
   */
  public getSchedule(scheduleId: string): ScheduledAlert | undefined {
    return this.schedules.get(scheduleId);
  }

  /**
   * Get all schedules with optional filtering
   */
  public getSchedules(options?: ScheduleFilterOptions): ScheduledAlert[] {
    let results = Array.from(this.schedules.values());

    if (options) {
      if (options.status?.length) {
        results = results.filter(s => options.status!.includes(s.status));
      }
      if (options.triggerType?.length) {
        results = results.filter(s => options.triggerType!.includes(s.trigger.type));
      }
      if (options.frequency?.length) {
        results = results.filter(s => options.frequency!.includes(s.recurrence.frequency));
      }
      if (options.enabled !== undefined) {
        results = results.filter(s => s.enabled === options.enabled);
      }
      if (options.locationId) {
        results = results.filter(s => s.locations?.some(loc => loc.id === options.locationId));
      }

      const offset = options.offset || 0;
      const limit = options.limit || results.length;
      results = results.slice(offset, offset + limit);
    }

    return results;
  }

  /**
   * Get execution history for a schedule
   */
  public getExecutionHistory(scheduleId: string, limit?: number): ScheduleExecution[] {
    const history = this.executionHistory.get(scheduleId) || [];
    return limit ? history.slice(0, limit) : history;
  }

  // ============================================
  // Execution Logic
  // ============================================

  /**
   * Main scheduler tick - check and execute due schedules
   */
  private tick(): void {
    const now = new Date();
    this.emitEvent('scheduler:tick', { data: { timestamp: now } });

    for (const schedule of this.schedules.values()) {
      if (!schedule.enabled || schedule.status !== 'active') {
        continue;
      }

      // Skip condition-based triggers (handled separately)
      if (schedule.trigger.type === 'condition') {
        continue;
      }

      // Check if schedule is due
      if (schedule.nextExecutionAt && schedule.nextExecutionAt <= now) {
        this.executeSchedule(schedule);
      }
    }
  }

  /**
   * Execute a schedule
   */
  private async executeSchedule(schedule: ScheduledAlert): Promise<void> {
    const executionId = generateId();
    const now = new Date();

    this.log('Executing schedule:', schedule.id);

    try {
      // Send notification
      const result = await notificationService.notify({
        title: schedule.notification.title,
        body: schedule.notification.body,
        category: schedule.notification.category,
        priority: schedule.notification.priority,
        icon: schedule.notification.icon,
        data: {
          ...schedule.notification.data,
          scheduleId: schedule.id,
          scheduleName: schedule.name,
        },
      });

      // Record execution
      const execution: ScheduleExecution = {
        id: executionId,
        scheduleId: schedule.id,
        executedAt: now,
        success: result.success,
        notificationId: result.data?.id,
        errorMessage: result.error?.message,
      };

      this.recordExecution(schedule.id, execution);

      // Update schedule
      schedule.lastExecutedAt = now;
      schedule.executionCount++;
      schedule.nextExecutionAt = this.calculateNextExecution(schedule);

      // Check if schedule should be marked as completed
      if (this.isScheduleCompleted(schedule)) {
        schedule.status = 'completed';
        schedule.enabled = false;
      }

      await this.saveToStorage();
      this.emitEvent('schedule:executed', { schedule, execution });
      this.log('Schedule executed successfully:', schedule.id);
    } catch (error) {
      const execution: ScheduleExecution = {
        id: executionId,
        scheduleId: schedule.id,
        executedAt: now,
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      };

      this.recordExecution(schedule.id, execution);
      schedule.status = 'error';
      schedule.errorMessage = execution.errorMessage;

      await this.saveToStorage();
      this.emitEvent('schedule:failed', { schedule, execution });
      this.log('Schedule execution failed:', schedule.id, error);
    }
  }

  /**
   * Record an execution in history
   */
  private recordExecution(scheduleId: string, execution: ScheduleExecution): void {
    let history = this.executionHistory.get(scheduleId);
    if (!history) {
      history = [];
      this.executionHistory.set(scheduleId, history);
    }

    history.unshift(execution);

    // Trim history
    if (history.length > this.config.maxExecutionHistory) {
      history.splice(this.config.maxExecutionHistory);
    }
  }

  /**
   * Check if a schedule has completed all occurrences
   */
  private isScheduleCompleted(schedule: ScheduledAlert): boolean {
    const { recurrence } = schedule;

    // Check max occurrences
    if (recurrence.maxOccurrences && schedule.executionCount >= recurrence.maxOccurrences) {
      return true;
    }

    // Check end date
    if (recurrence.endDate && new Date() >= recurrence.endDate) {
      return true;
    }

    // One-time schedules complete after first execution
    if (recurrence.frequency === 'once') {
      return true;
    }

    return false;
  }

  // ============================================
  // Condition-Based Triggers
  // ============================================

  /**
   * Update weather data for condition checking
   */
  public updateWeatherData(locationId: string, data: CurrentWeatherData): void {
    this.currentWeatherData.set(locationId, data);
  }

  /**
   * Start condition checks for all condition-based schedules
   */
  private startConditionChecks(): void {
    for (const schedule of this.schedules.values()) {
      if (schedule.trigger.type === 'condition' && schedule.enabled) {
        this.startConditionCheck(schedule);
      }
    }
  }

  /**
   * Stop all condition checks
   */
  private stopConditionChecks(): void {
    for (const intervalId of this.conditionCheckIntervals.values()) {
      clearInterval(intervalId);
    }
    this.conditionCheckIntervals.clear();
  }

  /**
   * Start condition check for a specific schedule
   */
  private startConditionCheck(schedule: ScheduledAlert): void {
    if (schedule.trigger.type !== 'condition') return;

    // Stop existing interval if any
    this.stopConditionCheck(schedule.id);

    const trigger = schedule.trigger as ConditionTrigger;
    const intervalMs = trigger.checkIntervalMs || this.config.defaultConditionCheckIntervalMs;

    const intervalId = setInterval(() => {
      this.checkConditionTrigger(schedule);
    }, intervalMs);

    this.conditionCheckIntervals.set(schedule.id, intervalId);
    this.log('Started condition check for schedule:', schedule.id);
  }

  /**
   * Stop condition check for a specific schedule
   */
  private stopConditionCheck(scheduleId: string): void {
    const intervalId = this.conditionCheckIntervals.get(scheduleId);
    if (intervalId) {
      clearInterval(intervalId);
      this.conditionCheckIntervals.delete(scheduleId);
    }
  }

  /**
   * Check if a condition trigger is met
   */
  private checkConditionTrigger(schedule: ScheduledAlert): void {
    if (schedule.trigger.type !== 'condition') return;

    const trigger = schedule.trigger as ConditionTrigger;

    // Check all locations (or use first available weather data)
    const locations = schedule.locations || [];
    const locationIds =
      locations.length > 0 ? locations.map(l => l.id) : Array.from(this.currentWeatherData.keys());

    for (const locationId of locationIds) {
      const weatherData = this.currentWeatherData.get(locationId);
      if (!weatherData) continue;

      const value = this.extractWeatherValue(trigger.conditionType, weatherData);
      const isTriggered = this.evaluateCondition(value, trigger);

      if (isTriggered) {
        this.executeSchedule(schedule);
        break; // Only execute once per check cycle
      }
    }
  }

  /**
   * Extract weather value for condition type
   */
  private extractWeatherValue(conditionType: string, data: CurrentWeatherData): number {
    // Delegate to weather alert service for consistency
    return (
      weatherAlertService['extractValueForCondition']?.(
        conditionType as import('@/types/weatherAlert').AlertConditionType,
        data
      ) ?? 0
    );
  }

  /**
   * Evaluate if a condition is met
   */
  private evaluateCondition(value: number, trigger: ConditionTrigger): boolean {
    switch (trigger.operator) {
      case 'gt':
        return value > trigger.threshold;
      case 'gte':
        return value >= trigger.threshold;
      case 'lt':
        return value < trigger.threshold;
      case 'lte':
        return value <= trigger.threshold;
      case 'eq':
        return value === trigger.threshold;
      default:
        return false;
    }
  }

  // ============================================
  // Time Calculation
  // ============================================

  /**
   * Calculate the next execution time for a schedule
   */
  private calculateNextExecution(schedule: ScheduledAlert): Date | undefined {
    const now = new Date();
    const { trigger, recurrence } = schedule;

    // Condition triggers don't have a fixed next execution time
    if (trigger.type === 'condition') {
      return undefined;
    }

    // Get base time from trigger
    let nextTime = this.getBaseTriggerTime(trigger, now);

    // If base time is in the past, calculate next occurrence
    if (nextTime <= now) {
      nextTime = this.getNextOccurrence(nextTime, recurrence, now);
    }

    // Check recurrence constraints
    if (recurrence.endDate && nextTime > recurrence.endDate) {
      return undefined;
    }

    if (recurrence.maxOccurrences && schedule.executionCount >= recurrence.maxOccurrences) {
      return undefined;
    }

    return nextTime;
  }

  /**
   * Get the base trigger time for a schedule
   */
  private getBaseTriggerTime(trigger: ScheduleTrigger, referenceDate: Date): Date {
    switch (trigger.type) {
      case 'time': {
        const [hours, minutes] = trigger.time.split(':').map(Number);
        const result = new Date(referenceDate);
        result.setHours(hours, minutes, 0, 0);
        return result;
      }
      case 'interval': {
        const startFrom = trigger.startFrom || new Date();
        const elapsed = Date.now() - startFrom.getTime();
        const intervals = Math.ceil(elapsed / trigger.intervalMs);
        return new Date(startFrom.getTime() + intervals * trigger.intervalMs);
      }
      case 'sunrise':
      case 'sunset': {
        // Simplified sunrise/sunset calculation
        // In production, use a proper astronomical calculation library
        const baseHour = trigger.type === 'sunrise' ? 6 : 18;
        const result = new Date(referenceDate);
        result.setHours(baseHour, 0, 0, 0);
        result.setMinutes(result.getMinutes() + trigger.offsetMinutes);
        return result;
      }
      default:
        return referenceDate;
    }
  }

  /**
   * Get the next occurrence based on recurrence pattern
   */
  private getNextOccurrence(baseTime: Date, recurrence: RecurrencePattern, after: Date): Date {
    const interval = recurrence.interval || 1;
    let next = new Date(baseTime);

    while (next <= after) {
      switch (recurrence.frequency) {
        case 'once':
          // No next occurrence
          return next;

        case 'daily':
          next.setDate(next.getDate() + interval);
          break;

        case 'weekly':
          if (recurrence.daysOfWeek?.length) {
            next = this.getNextWeeklyOccurrence(next, recurrence.daysOfWeek, after);
          } else {
            next.setDate(next.getDate() + 7 * interval);
          }
          break;

        case 'monthly':
          next.setMonth(next.getMonth() + interval);
          if (recurrence.dayOfMonth) {
            next.setDate(recurrence.dayOfMonth);
          }
          break;

        case 'custom':
          // Custom frequency defaults to daily
          next.setDate(next.getDate() + interval);
          break;

        default:
          next.setDate(next.getDate() + 1);
      }
    }

    return next;
  }

  /**
   * Get the next weekly occurrence based on specified days
   */
  private getNextWeeklyOccurrence(from: Date, daysOfWeek: DayOfWeek[], after: Date): Date {
    const dayNumbers = daysOfWeek.map(d => DAY_OF_WEEK_MAP[d]).sort((a, b) => a - b);
    const current = new Date(from);

    // Find the next matching day
    for (let i = 0; i < 14; i++) {
      current.setDate(current.getDate() + 1);
      if (dayNumbers.includes(current.getDay()) && current > after) {
        return current;
      }
    }

    return current;
  }

  /**
   * Update next execution times for all schedules
   */
  private updateNextExecutionTimes(): void {
    for (const schedule of this.schedules.values()) {
      if (schedule.enabled && schedule.status === 'active') {
        schedule.nextExecutionAt = this.calculateNextExecution(schedule);
      }
    }
  }

  // ============================================
  // Statistics
  // ============================================

  /**
   * Get scheduler statistics
   */
  public getStatistics(): SchedulerStatistics {
    const stats: SchedulerStatistics = {
      totalSchedules: this.schedules.size,
      activeSchedules: 0,
      pausedSchedules: 0,
      byTriggerType: {
        time: 0,
        condition: 0,
        sunrise: 0,
        sunset: 0,
        interval: 0,
      },
      byFrequency: {
        once: 0,
        daily: 0,
        weekly: 0,
        monthly: 0,
        custom: 0,
      },
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
    };

    let earliestNext: Date | undefined;

    for (const schedule of this.schedules.values()) {
      // Count by status
      if (schedule.status === 'active' && schedule.enabled) {
        stats.activeSchedules++;
      } else if (schedule.status === 'paused') {
        stats.pausedSchedules++;
      }

      // Count by trigger type
      stats.byTriggerType[schedule.trigger.type]++;

      // Count by frequency
      stats.byFrequency[schedule.recurrence.frequency]++;

      // Track earliest next execution
      if (schedule.nextExecutionAt) {
        if (!earliestNext || schedule.nextExecutionAt < earliestNext) {
          earliestNext = schedule.nextExecutionAt;
        }
      }
    }

    // Count executions
    for (const history of this.executionHistory.values()) {
      for (const execution of history) {
        stats.totalExecutions++;
        if (execution.success) {
          stats.successfulExecutions++;
        } else {
          stats.failedExecutions++;
        }
      }
    }

    stats.nextScheduledExecution = earliestNext;
    return stats;
  }

  /**
   * Get service status
   */
  public getStatus(): { isInitialized: boolean; isRunning: boolean } {
    return {
      isInitialized: this.isInitialized,
      isRunning: this.isRunning,
    };
  }

  // ============================================
  // Event Handling
  // ============================================

  /**
   * Add event listener
   */
  public on(event: SchedulerEventType, callback: SchedulerEventCallback): () => void {
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
  public off(event: SchedulerEventType, callback: SchedulerEventCallback): void {
    this.eventListeners.get(event)?.delete(callback);
  }

  /**
   * Emit an event
   */
  private emitEvent(type: SchedulerEventType, data?: Partial<SchedulerEvent>): void {
    const event: SchedulerEvent = {
      type,
      schedule: data?.schedule,
      execution: data?.execution,
      timestamp: new Date(),
      data: data?.data,
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

  // ============================================
  // Storage
  // ============================================

  /**
   * Load data from storage
   */
  private async loadFromStorage(): Promise<void> {
    try {
      const schedulesKey = `${this.config.storageKeyPrefix}schedules`;
      const historyKey = `${this.config.storageKeyPrefix}history`;

      const storedSchedules = localStorage.getItem(schedulesKey);
      if (storedSchedules) {
        const parsed = JSON.parse(storedSchedules) as ScheduledAlert[];
        for (const schedule of parsed) {
          schedule.createdAt = new Date(schedule.createdAt);
          schedule.updatedAt = new Date(schedule.updatedAt);
          if (schedule.nextExecutionAt) {
            schedule.nextExecutionAt = new Date(schedule.nextExecutionAt);
          }
          if (schedule.lastExecutedAt) {
            schedule.lastExecutedAt = new Date(schedule.lastExecutedAt);
          }
          if (schedule.recurrence.endDate) {
            schedule.recurrence.endDate = new Date(schedule.recurrence.endDate);
          }
          this.schedules.set(schedule.id, schedule);
        }
      }

      const storedHistory = localStorage.getItem(historyKey);
      if (storedHistory) {
        const parsed = JSON.parse(storedHistory) as Record<string, ScheduleExecution[]>;
        for (const [scheduleId, executions] of Object.entries(parsed)) {
          this.executionHistory.set(
            scheduleId,
            executions.map(e => ({
              ...e,
              executedAt: new Date(e.executedAt),
            }))
          );
        }
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
      const schedulesKey = `${this.config.storageKeyPrefix}schedules`;
      const historyKey = `${this.config.storageKeyPrefix}history`;

      localStorage.setItem(schedulesKey, JSON.stringify(Array.from(this.schedules.values())));
      localStorage.setItem(
        historyKey,
        JSON.stringify(Object.fromEntries(this.executionHistory.entries()))
      );
    } catch (error) {
      this.log('Failed to save to storage:', error);
    }
  }

  // ============================================
  // Private Helpers
  // ============================================

  /**
   * Ensure service is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Notification scheduler service not initialized');
    }
  }

  /**
   * Debug logging
   */
  private log(...args: unknown[]): void {
    if (this.config.debug) {
      logger.debug(args.map(String).join(' '));
    }
  }
}

// Export singleton instance
export const notificationSchedulerService = NotificationSchedulerService.getInstance();

// Export class for testing or custom instances
export { NotificationSchedulerService };
