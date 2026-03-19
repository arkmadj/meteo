/**
 * Notification Context for managing global notification state in the React Weather App
 *
 * Wraps the NotificationService singleton and provides a React-friendly API
 * for managing notifications, preferences, subscriptions, and history.
 */

import type { ReactNode } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';

import { NotificationContextUnavailableError } from '@/errors/domainErrors';
import {
  notificationSchedulerService,
  NotificationSchedulerService,
} from '@/services/notificationSchedulerService';
import { notificationService, NotificationService } from '@/services/notificationService';
import type {
  CategoryPreference,
  CreateNotificationOptions,
  NotificationCategory,
  NotificationChannel,
  NotificationEventCallback,
  NotificationEventType,
  NotificationHistoryQuery,
  NotificationItem,
  NotificationPreferences,
  NotificationResult,
  NotificationServiceState,
  NotificationStats,
  NotificationSubscription,
  ScheduledNotification,
} from '@/types/notification';
import type {
  CreateScheduledAlertOptions,
  ScheduledAlert,
  ScheduleFilterOptions,
  SchedulerEvent,
  SchedulerStatistics,
} from '@/types/notificationScheduler';
import type { PushPermissionStatus } from '@/types/pushNotification';

// ============================================================================
// STATE TYPES
// ============================================================================

/**
 * Notification context state
 */
export interface NotificationState {
  isInitialized: boolean;
  isInitializing: boolean;
  isSupported: boolean;
  permission: PushPermissionStatus;
  preferences: NotificationPreferences | null;
  subscriptions: NotificationSubscription[];
  history: NotificationItem[];
  scheduledNotifications: ScheduledNotification[];
  pendingCount: number;
  unreadCount: number;
  stats: NotificationStats | null;
  error: Error | null;
  // Scheduler state
  schedulerInitialized: boolean;
  schedulerRunning: boolean;
  scheduledAlerts: ScheduledAlert[];
  schedulerStats: SchedulerStatistics | null;
}

/**
 * Notification state action types
 */
type NotificationAction =
  | { type: 'INIT_START' }
  | { type: 'INIT_SUCCESS'; payload: NotificationServiceState }
  | { type: 'INIT_ERROR'; payload: Error }
  | { type: 'UPDATE_PERMISSION'; payload: PushPermissionStatus }
  | { type: 'UPDATE_PREFERENCES'; payload: NotificationPreferences }
  | { type: 'UPDATE_SUBSCRIPTIONS'; payload: NotificationSubscription[] }
  | { type: 'UPDATE_HISTORY'; payload: NotificationItem[] }
  | { type: 'UPDATE_SCHEDULED'; payload: ScheduledNotification[] }
  | { type: 'UPDATE_PENDING_COUNT'; payload: number }
  | { type: 'UPDATE_UNREAD_COUNT'; payload: number }
  | { type: 'UPDATE_STATS'; payload: NotificationStats }
  | { type: 'ADD_NOTIFICATION'; payload: NotificationItem }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_AS_UNREAD'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_ERROR'; payload: Error }
  // Scheduler actions
  | { type: 'SCHEDULER_INITIALIZED'; payload: boolean }
  | { type: 'SCHEDULER_RUNNING'; payload: boolean }
  | { type: 'UPDATE_SCHEDULED_ALERTS'; payload: ScheduledAlert[] }
  | { type: 'UPDATE_SCHEDULER_STATS'; payload: SchedulerStatistics };

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: NotificationState = {
  isInitialized: false,
  isInitializing: false,
  isSupported: false,
  permission: 'default',
  preferences: null,
  subscriptions: [],
  history: [],
  scheduledNotifications: [],
  pendingCount: 0,
  unreadCount: 0,
  stats: null,
  error: null,
  // Scheduler state
  schedulerInitialized: false,
  schedulerRunning: false,
  scheduledAlerts: [],
  schedulerStats: null,
};

// ============================================================================
// REDUCER
// ============================================================================

function notificationReducer(
  state: NotificationState,
  action: NotificationAction
): NotificationState {
  switch (action.type) {
    case 'INIT_START':
      return {
        ...state,
        isInitializing: true,
        error: null,
      };

    case 'INIT_SUCCESS': {
      const serviceState = action.payload;
      return {
        ...state,
        isInitialized: true,
        isInitializing: false,
        isSupported: serviceState.isSupported,
        permission: serviceState.permission,
        preferences: serviceState.preferences,
        subscriptions: serviceState.subscriptions,
        pendingCount: serviceState.pendingCount,
        error: null,
      };
    }

    case 'INIT_ERROR':
      return {
        ...state,
        isInitializing: false,
        error: action.payload,
      };

    case 'UPDATE_PERMISSION':
      return {
        ...state,
        permission: action.payload,
      };

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: action.payload,
      };

    case 'UPDATE_SUBSCRIPTIONS':
      return {
        ...state,
        subscriptions: action.payload,
      };

    case 'UPDATE_HISTORY':
      return {
        ...state,
        history: action.payload,
        unreadCount: action.payload.filter(n => !n.isRead).length,
      };

    case 'UPDATE_SCHEDULED':
      return {
        ...state,
        scheduledNotifications: action.payload,
      };

    case 'UPDATE_PENDING_COUNT':
      return {
        ...state,
        pendingCount: action.payload,
      };

    case 'UPDATE_UNREAD_COUNT':
      return {
        ...state,
        unreadCount: action.payload,
      };

    case 'UPDATE_STATS':
      return {
        ...state,
        stats: action.payload,
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        history: [action.payload, ...state.history],
        // New notifications start as unread (isRead: false)
        unreadCount: action.payload.isRead ? state.unreadCount : state.unreadCount + 1,
      };

    case 'REMOVE_NOTIFICATION': {
      const removedNotification = state.history.find(n => n.id === action.payload);
      const newHistory = state.history.filter(n => n.id !== action.payload);
      return {
        ...state,
        history: newHistory,
        // Adjust unread count if removed notification was unread
        unreadCount:
          removedNotification && !removedNotification.isRead
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
      };
    }

    case 'MARK_AS_READ': {
      const now = new Date();
      const updatedHistory = state.history.map(n =>
        n.id === action.payload && !n.isRead ? { ...n, isRead: true, readAt: now } : n
      );
      return {
        ...state,
        history: updatedHistory,
        unreadCount: updatedHistory.filter(n => !n.isRead).length,
      };
    }

    case 'MARK_AS_UNREAD': {
      const updatedHistory = state.history.map(n =>
        n.id === action.payload && n.isRead ? { ...n, isRead: false, readAt: undefined } : n
      );
      return {
        ...state,
        history: updatedHistory,
        unreadCount: updatedHistory.filter(n => !n.isRead).length,
      };
    }

    case 'MARK_ALL_AS_READ': {
      const now = new Date();
      const updatedHistory = state.history.map(n =>
        !n.isRead ? { ...n, isRead: true, readAt: now } : n
      );
      return {
        ...state,
        history: updatedHistory,
        unreadCount: 0,
      };
    }

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    // Scheduler actions
    case 'SCHEDULER_INITIALIZED':
      return {
        ...state,
        schedulerInitialized: action.payload,
      };

    case 'SCHEDULER_RUNNING':
      return {
        ...state,
        schedulerRunning: action.payload,
      };

    case 'UPDATE_SCHEDULED_ALERTS':
      return {
        ...state,
        scheduledAlerts: action.payload,
      };

    case 'UPDATE_SCHEDULER_STATS':
      return {
        ...state,
        schedulerStats: action.payload,
      };

    default:
      return state;
  }
}

// ============================================================================
// CONTEXT TYPES
// ============================================================================

/**
 * Notification context value type
 */
export interface NotificationContextType {
  // State
  state: NotificationState;

  // Initialization
  initialize: () => Promise<NotificationResult<void>>;

  // Permission
  requestPermission: () => Promise<NotificationResult<NotificationPermission>>;

  // Notification Actions
  notify: (options: CreateNotificationOptions) => Promise<NotificationResult<NotificationItem>>;
  scheduleNotification: (
    options: CreateNotificationOptions,
    scheduledFor: Date
  ) => Promise<NotificationResult<ScheduledNotification>>;
  cancelScheduledNotification: (id: string) => Promise<NotificationResult<void>>;

  // Subscription Management
  subscribeToPush: () => Promise<NotificationResult<PushSubscription>>;
  unsubscribeFromPush: () => Promise<NotificationResult<boolean>>;
  subscribeToTopic: (
    topic: string,
    category: NotificationCategory,
    channels?: NotificationChannel[]
  ) => Promise<NotificationResult<NotificationSubscription>>;
  unsubscribeFromTopic: (topic: string) => Promise<NotificationResult<void>>;

  // Preferences
  updatePreferences: (
    updates: Partial<NotificationPreferences>
  ) => Promise<NotificationResult<NotificationPreferences>>;
  updateCategoryPreference: (
    category: NotificationCategory,
    preference: Partial<CategoryPreference>
  ) => Promise<NotificationResult<void>>;

  // History Management
  getHistory: (query?: NotificationHistoryQuery) => NotificationItem[];
  markAsRead: (notificationId: string) => void;
  markAsUnread: (notificationId: string) => void;
  markAllAsRead: () => void;
  markAsDismissed: (notificationId: string) => void;
  clearHistory: () => Promise<NotificationResult<void>>;
  refreshHistory: () => void;
  refreshStats: () => void;
  getUnreadCount: () => number;

  // Event Handling
  addEventListener: (
    event: NotificationEventType,
    callback: NotificationEventCallback
  ) => () => void;

  // Convenience Methods
  notifyWeatherAlert: (
    title: string,
    body: string
  ) => Promise<NotificationResult<NotificationItem>>;
  notifyWeatherUpdate: (
    title: string,
    body: string
  ) => Promise<NotificationResult<NotificationItem>>;
  notifyForecast: (title: string, body: string) => Promise<NotificationResult<NotificationItem>>;
  notifySystem: (title: string, body: string) => Promise<NotificationResult<NotificationItem>>;

  // Scheduler Methods
  initializeScheduler: () => Promise<void>;
  startScheduler: () => void;
  stopScheduler: () => void;
  createScheduledAlert: (options: CreateScheduledAlertOptions) => Promise<ScheduledAlert>;
  updateScheduledAlert: (
    scheduleId: string,
    updates: Partial<CreateScheduledAlertOptions>
  ) => Promise<ScheduledAlert>;
  deleteScheduledAlert: (scheduleId: string) => Promise<void>;
  pauseScheduledAlert: (scheduleId: string) => Promise<void>;
  resumeScheduledAlert: (scheduleId: string) => Promise<void>;
  getScheduledAlerts: (options?: ScheduleFilterOptions) => ScheduledAlert[];
  refreshScheduledAlerts: () => void;
  refreshSchedulerStats: () => void;
  addSchedulerEventListener: (
    event: SchedulerEvent['type'],
    callback: (event: SchedulerEvent) => void
  ) => () => void;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const NotificationContext = createContext<NotificationContextType | null>(null);

// ============================================================================
// PROVIDER PROPS
// ============================================================================

interface NotificationProviderProps {
  children: ReactNode;
  /** Use a custom NotificationService instance (for testing) */
  service?: NotificationService;
  /** Use a custom NotificationSchedulerService instance (for testing) */
  schedulerService?: NotificationSchedulerService;
  /** Auto-initialize on mount */
  autoInitialize?: boolean;
  /** Auto-initialize scheduler on mount */
  autoInitializeScheduler?: boolean;
  /** Auto-start scheduler after initialization */
  autoStartScheduler?: boolean;
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

/**
 * Notification Provider Component
 *
 * Wraps the NotificationService and provides a React-friendly context API
 * for managing notifications throughout the application.
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  service = notificationService,
  schedulerService = notificationSchedulerService,
  autoInitialize = true,
  autoInitializeScheduler = true,
  autoStartScheduler = false,
}) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const serviceRef = useRef(service);
  const schedulerRef = useRef(schedulerService);

  // ---- Initialization ----
  const initialize = useCallback(async (): Promise<NotificationResult<void>> => {
    dispatch({ type: 'INIT_START' });

    const result = await serviceRef.current.initialize();

    if (result.success) {
      const serviceState = serviceRef.current.getState();
      dispatch({ type: 'INIT_SUCCESS', payload: serviceState });

      // Load initial history
      const history = serviceRef.current.getHistory();
      dispatch({ type: 'UPDATE_HISTORY', payload: history });

      // Load scheduled notifications
      const scheduled = serviceRef.current.getScheduledNotifications();
      dispatch({ type: 'UPDATE_SCHEDULED', payload: scheduled });

      // Load stats
      const stats = serviceRef.current.getStats();
      dispatch({ type: 'UPDATE_STATS', payload: stats });
    } else {
      dispatch({
        type: 'INIT_ERROR',
        payload: result.error || new Error('Failed to initialize notification service'),
      });
    }

    return result;
  }, []);

  // ---- Permission ----
  const requestPermission = useCallback(async (): Promise<
    NotificationResult<NotificationPermission>
  > => {
    const result = await serviceRef.current.requestPermission();
    if (result.success || result.data) {
      dispatch({ type: 'UPDATE_PERMISSION', payload: result.data || 'default' });
    }
    return result;
  }, []);

  // ---- Notification Actions ----
  const notify = useCallback(
    async (options: CreateNotificationOptions): Promise<NotificationResult<NotificationItem>> => {
      const result = await serviceRef.current.notify(options);
      if (result.success && result.data) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: result.data });
      }
      return result;
    },
    []
  );

  const scheduleNotification = useCallback(
    async (
      options: CreateNotificationOptions,
      scheduledFor: Date
    ): Promise<NotificationResult<ScheduledNotification>> => {
      const result = await serviceRef.current.scheduleNotification(options, scheduledFor);
      if (result.success) {
        const scheduled = serviceRef.current.getScheduledNotifications();
        dispatch({ type: 'UPDATE_SCHEDULED', payload: scheduled });
      }
      return result;
    },
    []
  );

  const cancelScheduledNotification = useCallback(
    async (id: string): Promise<NotificationResult<void>> => {
      const result = await serviceRef.current.cancelScheduledNotification(id);
      if (result.success) {
        const scheduled = serviceRef.current.getScheduledNotifications();
        dispatch({ type: 'UPDATE_SCHEDULED', payload: scheduled });
      }
      return result;
    },
    []
  );

  // ---- Subscription Management ----
  const subscribeToPush = useCallback(async (): Promise<NotificationResult<PushSubscription>> => {
    return serviceRef.current.subscribeToPush();
  }, []);

  const unsubscribeFromPush = useCallback(async (): Promise<NotificationResult<boolean>> => {
    return serviceRef.current.unsubscribeFromPush();
  }, []);

  const subscribeToTopic = useCallback(
    async (
      topic: string,
      category: NotificationCategory,
      channels?: NotificationChannel[]
    ): Promise<NotificationResult<NotificationSubscription>> => {
      const result = await serviceRef.current.subscribeToTopic(topic, category, channels);
      if (result.success) {
        dispatch({ type: 'UPDATE_SUBSCRIPTIONS', payload: serviceRef.current.getSubscriptions() });
      }
      return result;
    },
    []
  );

  const unsubscribeFromTopic = useCallback(
    async (topic: string): Promise<NotificationResult<void>> => {
      const result = await serviceRef.current.unsubscribeFromTopic(topic);
      if (result.success) {
        dispatch({ type: 'UPDATE_SUBSCRIPTIONS', payload: serviceRef.current.getSubscriptions() });
      }
      return result;
    },
    []
  );

  // ---- Preferences ----
  const updatePreferences = useCallback(
    async (
      updates: Partial<NotificationPreferences>
    ): Promise<NotificationResult<NotificationPreferences>> => {
      const result = await serviceRef.current.updatePreferences(updates);
      if (result.success && result.data) {
        dispatch({ type: 'UPDATE_PREFERENCES', payload: result.data });
      }
      return result;
    },
    []
  );

  const updateCategoryPreference = useCallback(
    async (
      category: NotificationCategory,
      preference: Partial<CategoryPreference>
    ): Promise<NotificationResult<void>> => {
      const result = await serviceRef.current.updateCategoryPreference(category, preference);
      if (result.success) {
        dispatch({ type: 'UPDATE_PREFERENCES', payload: serviceRef.current.getPreferences() });
      }
      return result;
    },
    []
  );

  // ---- History Management ----
  const getHistory = useCallback((query?: NotificationHistoryQuery): NotificationItem[] => {
    return serviceRef.current.getHistory(query);
  }, []);

  const markAsRead = useCallback((notificationId: string): void => {
    serviceRef.current.markAsRead(notificationId);
    dispatch({ type: 'MARK_AS_READ', payload: notificationId });
  }, []);

  const markAsUnread = useCallback((notificationId: string): void => {
    serviceRef.current.markAsUnread(notificationId);
    dispatch({ type: 'MARK_AS_UNREAD', payload: notificationId });
  }, []);

  const markAllAsRead = useCallback((): void => {
    serviceRef.current.markAllAsRead();
    dispatch({ type: 'MARK_ALL_AS_READ' });
  }, []);

  const markAsDismissed = useCallback((notificationId: string): void => {
    serviceRef.current.markAsDismissed(notificationId);
    const history = serviceRef.current.getHistory();
    dispatch({ type: 'UPDATE_HISTORY', payload: history });
  }, []);

  const clearHistory = useCallback(async (): Promise<NotificationResult<void>> => {
    const result = await serviceRef.current.clearHistory();
    if (result.success) {
      dispatch({ type: 'UPDATE_HISTORY', payload: [] });
    }
    return result;
  }, []);

  const refreshHistory = useCallback((): void => {
    const history = serviceRef.current.getHistory();
    dispatch({ type: 'UPDATE_HISTORY', payload: history });
  }, []);

  const refreshStats = useCallback((): void => {
    const stats = serviceRef.current.getStats();
    dispatch({ type: 'UPDATE_STATS', payload: stats });
  }, []);

  const getUnreadCount = useCallback((): number => {
    return serviceRef.current.getUnreadCount();
  }, []);

  // ---- Event Handling ----
  const addEventListener = useCallback(
    (event: NotificationEventType, callback: NotificationEventCallback): (() => void) => {
      return serviceRef.current.on(event, callback);
    },
    []
  );

  // ---- Convenience Methods ----
  const notifyWeatherAlert = useCallback(
    async (title: string, body: string): Promise<NotificationResult<NotificationItem>> => {
      return notify({
        title,
        body,
        category: 'weather-alert',
        priority: 'high',
        channel: 'push',
      });
    },
    [notify]
  );

  const notifyWeatherUpdate = useCallback(
    async (title: string, body: string): Promise<NotificationResult<NotificationItem>> => {
      return notify({
        title,
        body,
        category: 'weather-update',
        priority: 'normal',
        channel: 'push',
      });
    },
    [notify]
  );

  const notifyForecast = useCallback(
    async (title: string, body: string): Promise<NotificationResult<NotificationItem>> => {
      return notify({
        title,
        body,
        category: 'forecast',
        priority: 'normal',
        channel: 'in-app',
      });
    },
    [notify]
  );

  const notifySystem = useCallback(
    async (title: string, body: string): Promise<NotificationResult<NotificationItem>> => {
      return notify({
        title,
        body,
        category: 'system',
        priority: 'normal',
        channel: 'in-app',
      });
    },
    [notify]
  );

  // ---- Scheduler Methods ----
  const initializeScheduler = useCallback(async (): Promise<void> => {
    await schedulerRef.current.initialize();
    const status = schedulerRef.current.getStatus();
    dispatch({ type: 'SCHEDULER_INITIALIZED', payload: status.isInitialized });
    dispatch({ type: 'SCHEDULER_RUNNING', payload: status.isRunning });
    dispatch({ type: 'UPDATE_SCHEDULED_ALERTS', payload: schedulerRef.current.getSchedules() });
    dispatch({ type: 'UPDATE_SCHEDULER_STATS', payload: schedulerRef.current.getStatistics() });
  }, []);

  const startScheduler = useCallback((): void => {
    schedulerRef.current.start();
    dispatch({ type: 'SCHEDULER_RUNNING', payload: true });
  }, []);

  const stopScheduler = useCallback((): void => {
    schedulerRef.current.stop();
    dispatch({ type: 'SCHEDULER_RUNNING', payload: false });
  }, []);

  const refreshScheduledAlerts = useCallback((): void => {
    dispatch({ type: 'UPDATE_SCHEDULED_ALERTS', payload: schedulerRef.current.getSchedules() });
  }, []);

  const refreshSchedulerStats = useCallback((): void => {
    dispatch({ type: 'UPDATE_SCHEDULER_STATS', payload: schedulerRef.current.getStatistics() });
  }, []);

  const createScheduledAlert = useCallback(
    async (options: CreateScheduledAlertOptions): Promise<ScheduledAlert> => {
      const schedule = await schedulerRef.current.createSchedule(options);
      refreshScheduledAlerts();
      refreshSchedulerStats();
      return schedule;
    },
    [refreshScheduledAlerts, refreshSchedulerStats]
  );

  const updateScheduledAlert = useCallback(
    async (
      scheduleId: string,
      updates: Partial<CreateScheduledAlertOptions>
    ): Promise<ScheduledAlert> => {
      const schedule = await schedulerRef.current.updateSchedule(scheduleId, updates);
      refreshScheduledAlerts();
      return schedule;
    },
    [refreshScheduledAlerts]
  );

  const deleteScheduledAlert = useCallback(
    async (scheduleId: string): Promise<void> => {
      await schedulerRef.current.deleteSchedule(scheduleId);
      refreshScheduledAlerts();
      refreshSchedulerStats();
    },
    [refreshScheduledAlerts, refreshSchedulerStats]
  );

  const pauseScheduledAlert = useCallback(
    async (scheduleId: string): Promise<void> => {
      await schedulerRef.current.pauseSchedule(scheduleId);
      refreshScheduledAlerts();
      refreshSchedulerStats();
    },
    [refreshScheduledAlerts, refreshSchedulerStats]
  );

  const resumeScheduledAlert = useCallback(
    async (scheduleId: string): Promise<void> => {
      await schedulerRef.current.resumeSchedule(scheduleId);
      refreshScheduledAlerts();
      refreshSchedulerStats();
    },
    [refreshScheduledAlerts, refreshSchedulerStats]
  );

  const getScheduledAlerts = useCallback((options?: ScheduleFilterOptions): ScheduledAlert[] => {
    return schedulerRef.current.getSchedules(options);
  }, []);

  const addSchedulerEventListener = useCallback(
    (event: SchedulerEvent['type'], callback: (event: SchedulerEvent) => void): (() => void) => {
      return schedulerRef.current.on(event, callback);
    },
    []
  );

  // ---- Auto-initialization ----
  useEffect(() => {
    if (autoInitialize && !state.isInitialized && !state.isInitializing) {
      initialize();
    }
  }, [autoInitialize, state.isInitialized, state.isInitializing, initialize]);

  // ---- Scheduler auto-initialization ----
  useEffect(() => {
    if (autoInitializeScheduler && state.isInitialized && !state.schedulerInitialized) {
      initializeScheduler().then(() => {
        if (autoStartScheduler) {
          startScheduler();
        }
      });
    }
  }, [
    autoInitializeScheduler,
    autoStartScheduler,
    state.isInitialized,
    state.schedulerInitialized,
    initializeScheduler,
    startScheduler,
  ]);

  // ---- Scheduler event listeners ----
  useEffect(() => {
    if (!state.schedulerInitialized) return;

    const handleScheduleChange = () => {
      refreshScheduledAlerts();
      refreshSchedulerStats();
    };

    const unsubscribers: Array<() => void> = [];
    unsubscribers.push(schedulerRef.current.on('schedule:created', handleScheduleChange));
    unsubscribers.push(schedulerRef.current.on('schedule:updated', handleScheduleChange));
    unsubscribers.push(schedulerRef.current.on('schedule:deleted', handleScheduleChange));
    unsubscribers.push(schedulerRef.current.on('schedule:executed', handleScheduleChange));
    unsubscribers.push(schedulerRef.current.on('schedule:paused', handleScheduleChange));
    unsubscribers.push(schedulerRef.current.on('schedule:resumed', handleScheduleChange));

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [state.schedulerInitialized, refreshScheduledAlerts, refreshSchedulerStats]);

  // ---- Event listeners for service events ----
  useEffect(() => {
    if (!state.isInitialized) return;

    const unsubscribeCreated = serviceRef.current.on('notification:created', event => {
      if (event.notification) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: event.notification });
      }
    });

    const unsubscribeDelivered = serviceRef.current.on('notification:delivered', () => {
      refreshHistory();
      refreshStats();
    });

    const unsubscribeClicked = serviceRef.current.on('notification:clicked', event => {
      if (event.notification) {
        dispatch({ type: 'MARK_AS_READ', payload: event.notification.id });
      }
    });

    const unsubscribeDismissed = serviceRef.current.on('notification:dismissed', () => {
      refreshHistory();
    });

    const unsubscribePrefsChanged = serviceRef.current.on('preferences:changed', event => {
      if (event.data?.preferences) {
        dispatch({
          type: 'UPDATE_PREFERENCES',
          payload: event.data.preferences as NotificationPreferences,
        });
      }
    });

    const unsubscribePermission = serviceRef.current.on('permission:changed', event => {
      if (event.data?.permission) {
        dispatch({
          type: 'UPDATE_PERMISSION',
          payload: event.data.permission as PushPermissionStatus,
        });
      }
    });

    return () => {
      unsubscribeCreated();
      unsubscribeDelivered();
      unsubscribeClicked();
      unsubscribeDismissed();
      unsubscribePrefsChanged();
      unsubscribePermission();
    };
  }, [state.isInitialized, refreshHistory, refreshStats]);

  // ---- Context Value ----
  const contextValue: NotificationContextType = useMemo(
    () => ({
      state,
      initialize,
      requestPermission,
      notify,
      scheduleNotification,
      cancelScheduledNotification,
      subscribeToPush,
      unsubscribeFromPush,
      subscribeToTopic,
      unsubscribeFromTopic,
      updatePreferences,
      updateCategoryPreference,
      getHistory,
      markAsRead,
      markAsUnread,
      markAllAsRead,
      markAsDismissed,
      clearHistory,
      refreshHistory,
      refreshStats,
      getUnreadCount,
      addEventListener,
      notifyWeatherAlert,
      notifyWeatherUpdate,
      notifyForecast,
      notifySystem,
      // Scheduler methods
      initializeScheduler,
      startScheduler,
      stopScheduler,
      createScheduledAlert,
      updateScheduledAlert,
      deleteScheduledAlert,
      pauseScheduledAlert,
      resumeScheduledAlert,
      getScheduledAlerts,
      refreshScheduledAlerts,
      refreshSchedulerStats,
      addSchedulerEventListener,
    }),
    [
      state,
      initialize,
      requestPermission,
      notify,
      scheduleNotification,
      cancelScheduledNotification,
      subscribeToPush,
      unsubscribeFromPush,
      subscribeToTopic,
      unsubscribeFromTopic,
      updatePreferences,
      updateCategoryPreference,
      getHistory,
      markAsRead,
      markAsUnread,
      markAllAsRead,
      markAsDismissed,
      clearHistory,
      refreshHistory,
      refreshStats,
      getUnreadCount,
      addEventListener,
      notifyWeatherAlert,
      notifyWeatherUpdate,
      notifyForecast,
      notifySystem,
      // Scheduler methods
      initializeScheduler,
      startScheduler,
      stopScheduler,
      createScheduledAlert,
      updateScheduledAlert,
      deleteScheduledAlert,
      pauseScheduledAlert,
      resumeScheduledAlert,
      getScheduledAlerts,
      refreshScheduledAlerts,
      refreshSchedulerStats,
      addSchedulerEventListener,
    ]
  );

  return (
    <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>
  );
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to use notification context
 * @throws {NotificationContextUnavailableError} If used outside NotificationProvider
 */
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new NotificationContextUnavailableError(
      'useNotification must be used within a NotificationProvider'
    );
  }
  return context;
};

/**
 * Hook to get notification state only
 */
export const useNotificationState = (): NotificationState => {
  const { state } = useNotification();
  return state;
};

/**
 * Hook to get notification preferences
 */
export const useNotificationPreferences = (): NotificationPreferences | null => {
  const { state } = useNotification();
  return state.preferences;
};

/**
 * Hook to get notification history
 */
export const useNotificationHistory = (): NotificationItem[] => {
  const { state } = useNotification();
  return state.history;
};

/**
 * Hook to get unread notification count
 */
export const useUnreadNotificationCount = (): number => {
  const { state } = useNotification();
  return state.unreadCount;
};

/**
 * Hook to check if notifications are supported and initialized
 */
export const useNotificationStatus = (): {
  isSupported: boolean;
  isInitialized: boolean;
  permission: PushPermissionStatus;
} => {
  const { state } = useNotification();
  return {
    isSupported: state.isSupported,
    isInitialized: state.isInitialized,
    permission: state.permission,
  };
};

/**
 * Hook to get notification actions only
 */
export const useNotificationActions = () => {
  const context = useNotification();
  return {
    notify: context.notify,
    notifyWeatherAlert: context.notifyWeatherAlert,
    notifyWeatherUpdate: context.notifyWeatherUpdate,
    notifyForecast: context.notifyForecast,
    notifySystem: context.notifySystem,
    scheduleNotification: context.scheduleNotification,
    cancelScheduledNotification: context.cancelScheduledNotification,
    markAsRead: context.markAsRead,
    markAsUnread: context.markAsUnread,
    markAllAsRead: context.markAllAsRead,
    markAsDismissed: context.markAsDismissed,
    clearHistory: context.clearHistory,
  };
};

export default NotificationContext;
