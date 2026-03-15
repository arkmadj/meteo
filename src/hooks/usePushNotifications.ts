/**
 * usePushNotifications Hook
 * React hook for integrating push notifications in components
 */

import { useCallback, useEffect, useState } from 'react';

import { pushNotificationService } from '@/services/pushNotificationService';
import type {
  LocalNotificationOptions,
  NotificationClickCallback,
  NotificationCloseCallback,
  PushNotificationData,
  PushPermissionStatus,
  VapidStatus,
  WeatherAlertNotificationOptions,
} from '@/types/pushNotification';

/**
 * Hook return type
 */
interface UsePushNotificationsReturn {
  /** Whether push notifications are supported in this browser */
  isSupported: boolean;
  /** Current notification permission status */
  permission: PushPermissionStatus;
  /** Whether the user is currently subscribed to push notifications */
  isSubscribed: boolean;
  /** Whether an operation is currently loading */
  isLoading: boolean;
  /** Error message if any operation failed */
  error: string | null;
  /** The current push subscription, if any */
  subscription: PushSubscription | null;
  /** VAPID configuration status */
  vapidStatus: VapidStatus;
  /** Request notification permission from the user */
  requestPermission: () => Promise<boolean>;
  /** Subscribe to push notifications */
  subscribe: () => Promise<boolean>;
  /** Unsubscribe from push notifications */
  unsubscribe: () => Promise<boolean>;
  /** Show a local notification */
  showNotification: (options: LocalNotificationOptions) => Promise<boolean>;
  /** Show a weather alert notification */
  showWeatherAlert: (alert: WeatherAlertNotificationOptions) => Promise<boolean>;
  /** Clear the current error */
  clearError: () => void;
}

/**
 * Hook options
 */
interface UsePushNotificationsOptions {
  /** Callback when a notification is clicked */
  onNotificationClick?: NotificationClickCallback;
  /** Callback when a notification is closed */
  onNotificationClose?: NotificationCloseCallback;
  /** Auto-register service worker on mount */
  autoRegister?: boolean;
}

/**
 * Hook for managing push notifications
 */
export function usePushNotifications(
  options: UsePushNotificationsOptions = {}
): UsePushNotificationsReturn {
  const { onNotificationClick, onNotificationClose, autoRegister = true } = options;

  const [isSupported] = useState(() => pushNotificationService.isSupported());
  const [permission, setPermission] = useState<PushPermissionStatus>(() =>
    pushNotificationService.getPermissionStatus()
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register service worker and get initial subscription state on mount
  useEffect(() => {
    if (!isSupported || !autoRegister) return;

    const initialize = async () => {
      // Register service worker
      await pushNotificationService.registerServiceWorker();

      // Get current subscription state
      const state = await pushNotificationService.getSubscriptionState();
      setPermission(state.permission);
      setIsSubscribed(state.isSubscribed);
      setSubscription(state.subscription);
    };

    initialize();
  }, [isSupported, autoRegister]);

  // Setup notification callbacks
  useEffect(() => {
    if (!isSupported) return;

    pushNotificationService.setOnNotificationClick(
      onNotificationClick ||
        ((action: string | null, data: PushNotificationData) => {
          console.log('[usePushNotifications] Notification clicked:', action, data);
        })
    );

    pushNotificationService.setOnNotificationClose(
      onNotificationClose ||
        ((tag: string, data: PushNotificationData) => {
          console.log('[usePushNotifications] Notification closed:', tag, data);
        })
    );

    return () => {
      pushNotificationService.setOnNotificationClick(null);
      pushNotificationService.setOnNotificationClose(null);
    };
  }, [isSupported, onNotificationClick, onNotificationClose]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications are not supported');
      return false;
    }

    setIsLoading(true);
    setError(null);

    const result = await pushNotificationService.requestPermission();
    setPermission(pushNotificationService.getPermissionStatus());
    setIsLoading(false);

    if (!result.success && result.error) {
      setError(result.error.message);
    }

    return result.success;
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications are not supported');
      return false;
    }

    setIsLoading(true);
    setError(null);

    const result = await pushNotificationService.subscribe();
    setPermission(pushNotificationService.getPermissionStatus());
    setIsLoading(false);

    if (result.success && result.data) {
      setIsSubscribed(true);
      setSubscription(result.data);
      return true;
    }

    if (result.error) {
      setError(result.error.message);
    }
    return false;
  }, [isSupported]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications are not supported');
      return false;
    }

    setIsLoading(true);
    setError(null);

    const result = await pushNotificationService.unsubscribe();
    setIsLoading(false);

    if (result.success) {
      setIsSubscribed(false);
      setSubscription(null);
      return true;
    }

    if (result.error) {
      setError(result.error.message);
    }
    return false;
  }, [isSupported]);

  const showNotification = useCallback(
    async (notificationOptions: LocalNotificationOptions): Promise<boolean> => {
      if (!isSupported) {
        setError('Push notifications are not supported');
        return false;
      }

      setError(null);
      const result = await pushNotificationService.showNotification(notificationOptions);

      if (!result.success && result.error) {
        setError(result.error.message);
      }

      return result.success;
    },
    [isSupported]
  );

  const showWeatherAlert = useCallback(
    async (alert: WeatherAlertNotificationOptions): Promise<boolean> => {
      if (!isSupported) {
        setError('Push notifications are not supported');
        return false;
      }

      setError(null);
      const result = await pushNotificationService.showWeatherAlert(alert);

      if (!result.success && result.error) {
        setError(result.error.message);
      }

      return result.success;
    },
    [isSupported]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get VAPID configuration status
  const vapidStatus = pushNotificationService.getVapidStatus();

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscription,
    vapidStatus,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
    showWeatherAlert,
    clearError,
  };
}
