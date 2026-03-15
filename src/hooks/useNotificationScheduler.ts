/**
 * useNotificationScheduler Hook
 *
 * React hook for managing scheduled weather notifications.
 * Provides a convenient interface to the NotificationSchedulerService.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type {
  CreateScheduledAlertOptions,
  ScheduledAlert,
  ScheduleExecution,
  ScheduleFilterOptions,
  SchedulerEvent,
  SchedulerStatistics,
} from '@/types/notificationScheduler';

import {
  notificationSchedulerService,
  NotificationSchedulerService,
} from '@/services/notificationSchedulerService';

/**
 * Hook options
 */
export interface UseNotificationSchedulerOptions {
  /** Auto-initialize on mount */
  autoInitialize?: boolean;
  /** Auto-start scheduler on mount */
  autoStart?: boolean;
  /** Custom service instance (for testing) */
  service?: NotificationSchedulerService;
}

/**
 * Hook return type
 */
export interface UseNotificationSchedulerReturn {
  // State
  isInitialized: boolean;
  isRunning: boolean;
  isLoading: boolean;
  error: Error | null;
  schedules: ScheduledAlert[];
  statistics: SchedulerStatistics | null;

  // Lifecycle
  initialize: () => Promise<void>;
  start: () => void;
  stop: () => void;

  // Schedule Management
  createSchedule: (options: CreateScheduledAlertOptions) => Promise<ScheduledAlert>;
  updateSchedule: (
    scheduleId: string,
    updates: Partial<CreateScheduledAlertOptions>
  ) => Promise<ScheduledAlert>;
  deleteSchedule: (scheduleId: string) => Promise<void>;
  pauseSchedule: (scheduleId: string) => Promise<void>;
  resumeSchedule: (scheduleId: string) => Promise<void>;
  getSchedule: (scheduleId: string) => ScheduledAlert | undefined;
  getSchedules: (options?: ScheduleFilterOptions) => ScheduledAlert[];
  getExecutionHistory: (scheduleId: string, limit?: number) => ScheduleExecution[];

  // Convenience Methods
  createDailyWeatherAlert: (
    time: string,
    title: string,
    body: string,
    locations?: Array<{ id: string; name: string; latitude: number; longitude: number }>
  ) => Promise<ScheduledAlert>;
  createConditionAlert: (
    conditionType: string,
    threshold: number,
    operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq',
    title: string,
    body: string
  ) => Promise<ScheduledAlert>;

  // Event Handling
  addEventListener: (
    event: SchedulerEvent['type'],
    callback: (event: SchedulerEvent) => void
  ) => () => void;

  // Refresh
  refreshSchedules: () => void;
  refreshStatistics: () => void;
}

/**
 * Hook for managing notification schedules
 */
export function useNotificationScheduler(
  options: UseNotificationSchedulerOptions = {}
): UseNotificationSchedulerReturn {
  const {
    autoInitialize = true,
    autoStart = false,
    service = notificationSchedulerService,
  } = options;

  const serviceRef = useRef(service);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [schedules, setSchedules] = useState<ScheduledAlert[]>([]);
  const [statistics, setStatistics] = useState<SchedulerStatistics | null>(null);

  // Initialize service
  const initialize = useCallback(async () => {
    if (isInitialized) return;

    setIsLoading(true);
    setError(null);

    try {
      await serviceRef.current.initialize();
      const status = serviceRef.current.getStatus();
      setIsInitialized(status.isInitialized);
      setIsRunning(status.isRunning);
      setSchedules(serviceRef.current.getSchedules());
      setStatistics(serviceRef.current.getStatistics());
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Start scheduler
  const start = useCallback(() => {
    serviceRef.current.start();
    setIsRunning(true);
  }, []);

  // Stop scheduler
  const stop = useCallback(() => {
    serviceRef.current.stop();
    setIsRunning(false);
  }, []);

  // Refresh schedules
  const refreshSchedules = useCallback(() => {
    setSchedules(serviceRef.current.getSchedules());
  }, []);

  // Refresh statistics
  const refreshStatistics = useCallback(() => {
    setStatistics(serviceRef.current.getStatistics());
  }, []);

  // Create schedule
  const createSchedule = useCallback(
    async (opts: CreateScheduledAlertOptions): Promise<ScheduledAlert> => {
      const schedule = await serviceRef.current.createSchedule(opts);
      refreshSchedules();
      refreshStatistics();
      return schedule;
    },
    [refreshSchedules, refreshStatistics]
  );

  // Update schedule
  const updateSchedule = useCallback(
    async (
      scheduleId: string,
      updates: Partial<CreateScheduledAlertOptions>
    ): Promise<ScheduledAlert> => {
      const schedule = await serviceRef.current.updateSchedule(scheduleId, updates);
      refreshSchedules();
      return schedule;
    },
    [refreshSchedules]
  );

  // Delete schedule
  const deleteSchedule = useCallback(
    async (scheduleId: string): Promise<void> => {
      await serviceRef.current.deleteSchedule(scheduleId);
      refreshSchedules();
      refreshStatistics();
    },
    [refreshSchedules, refreshStatistics]
  );

  // Pause schedule
  const pauseSchedule = useCallback(
    async (scheduleId: string): Promise<void> => {
      await serviceRef.current.pauseSchedule(scheduleId);
      refreshSchedules();
      refreshStatistics();
    },
    [refreshSchedules, refreshStatistics]
  );

  // Resume schedule
  const resumeSchedule = useCallback(
    async (scheduleId: string): Promise<void> => {
      await serviceRef.current.resumeSchedule(scheduleId);
      refreshSchedules();
      refreshStatistics();
    },
    [refreshSchedules, refreshStatistics]
  );

  // Get schedule
  const getSchedule = useCallback((scheduleId: string): ScheduledAlert | undefined => {
    return serviceRef.current.getSchedule(scheduleId);
  }, []);

  // Get schedules with filter
  const getSchedules = useCallback((opts?: ScheduleFilterOptions): ScheduledAlert[] => {
    return serviceRef.current.getSchedules(opts);
  }, []);

  // Get execution history
  const getExecutionHistory = useCallback(
    (scheduleId: string, limit?: number): ScheduleExecution[] => {
      return serviceRef.current.getExecutionHistory(scheduleId, limit);
    },
    []
  );

  // Create daily weather alert (convenience method)
  const createDailyWeatherAlert = useCallback(
    async (
      time: string,
      title: string,
      body: string,
      locations?: Array<{ id: string; name: string; latitude: number; longitude: number }>
    ): Promise<ScheduledAlert> => {
      return createSchedule({
        name: `Daily Weather Alert - ${time}`,
        trigger: { type: 'time', time },
        recurrence: { frequency: 'daily' },
        notification: { title, body, category: 'weather-alert', priority: 'normal' },
        locations,
      });
    },
    [createSchedule]
  );

  // Create condition-based alert (convenience method)
  const createConditionAlert = useCallback(
    async (
      conditionType: string,
      threshold: number,
      operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq',
      title: string,
      body: string
    ): Promise<ScheduledAlert> => {
      return createSchedule({
        name: `${conditionType} Alert`,
        trigger: {
          type: 'condition',
          conditionType: conditionType as CreateScheduledAlertOptions['trigger'] extends {
            conditionType: infer T;
          }
            ? T
            : never,
          threshold,
          operator,
        },
        recurrence: { frequency: 'once' },
        notification: { title, body, category: 'weather-alert', priority: 'high' },
      });
    },
    [createSchedule]
  );

  // Add event listener
  const addEventListener = useCallback(
    (event: SchedulerEvent['type'], callback: (event: SchedulerEvent) => void): (() => void) => {
      return serviceRef.current.on(event, callback);
    },
    []
  );

  // Auto-initialize on mount
  useEffect(() => {
    if (autoInitialize) {
      initialize();
    }
  }, [autoInitialize, initialize]);

  // Auto-start on mount (after initialization)
  useEffect(() => {
    if (autoStart && isInitialized && !isRunning) {
      start();
    }
  }, [autoStart, isInitialized, isRunning, start]);

  // Subscribe to scheduler events for state updates
  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    const handleScheduleChange = () => {
      refreshSchedules();
      refreshStatistics();
    };

    unsubscribers.push(serviceRef.current.on('schedule:created', handleScheduleChange));
    unsubscribers.push(serviceRef.current.on('schedule:updated', handleScheduleChange));
    unsubscribers.push(serviceRef.current.on('schedule:deleted', handleScheduleChange));
    unsubscribers.push(serviceRef.current.on('schedule:executed', handleScheduleChange));
    unsubscribers.push(serviceRef.current.on('schedule:paused', handleScheduleChange));
    unsubscribers.push(serviceRef.current.on('schedule:resumed', handleScheduleChange));

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [refreshSchedules, refreshStatistics]);

  // Memoize return value
  return useMemo(
    () => ({
      // State
      isInitialized,
      isRunning,
      isLoading,
      error,
      schedules,
      statistics,

      // Lifecycle
      initialize,
      start,
      stop,

      // Schedule Management
      createSchedule,
      updateSchedule,
      deleteSchedule,
      pauseSchedule,
      resumeSchedule,
      getSchedule,
      getSchedules,
      getExecutionHistory,

      // Convenience Methods
      createDailyWeatherAlert,
      createConditionAlert,

      // Event Handling
      addEventListener,

      // Refresh
      refreshSchedules,
      refreshStatistics,
    }),
    [
      isInitialized,
      isRunning,
      isLoading,
      error,
      schedules,
      statistics,
      initialize,
      start,
      stop,
      createSchedule,
      updateSchedule,
      deleteSchedule,
      pauseSchedule,
      resumeSchedule,
      getSchedule,
      getSchedules,
      getExecutionHistory,
      createDailyWeatherAlert,
      createConditionAlert,
      addEventListener,
      refreshSchedules,
      refreshStatistics,
    ]
  );
}
