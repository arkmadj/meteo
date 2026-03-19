/**
 * Push Notification Service
 * Handles service worker registration, push subscription management, and notification permissions
 */

import {
  getVapidConfig,
  getVapidPublicKeyForSubscription,
  isVapidConfigured,
  logVapidConfigStatus,
  type VapidConfig,
} from '@/config/vapid';
import type {
  LocalNotificationOptions,
  NotificationClickCallback,
  NotificationCloseCallback,
  PushNotificationConfig,
  PushNotificationResult,
  PushPermissionStatus,
  PushSubscriptionState,
  ServiceWorkerMessage,
  SubscriptionChangeCallback,
  VapidStatus,
  WeatherAlertNotificationOptions,
} from '@/types/pushNotification';
import type { SubscriptionAlertType } from '@/types/subscriptionStorage';

import { subscriptionStorageService } from './subscriptionStorageService';

// Default configuration
const DEFAULT_CONFIG: PushNotificationConfig = {
  swPath: '/sw.js',
  swScope: '/',
  autoConfigureVapid: true,
};

/**
 * Push Notification Service Class
 * Singleton service for managing push notifications
 */
class PushNotificationService {
  private static instance: PushNotificationService;
  private config: PushNotificationConfig;
  private vapidConfig: VapidConfig | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private onNotificationClick: NotificationClickCallback | null = null;
  private onNotificationClose: NotificationCloseCallback | null = null;
  private onSubscriptionChange: SubscriptionChangeCallback | null = null;

  private constructor(config: PushNotificationConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupMessageListener();
    this.initializeVapidConfig();
  }

  /**
   * Initialize VAPID configuration from environment or config
   */
  private initializeVapidConfig(): void {
    if (this.config.autoConfigureVapid !== false) {
      this.vapidConfig = getVapidConfig();

      if (process.env.NODE_ENV === 'development') {
        logVapidConfigStatus();
      }
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: PushNotificationConfig): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService(config);
    }
    return PushNotificationService.instance;
  }

  /**
   * Get VAPID configuration status
   */
  public getVapidStatus(): VapidStatus {
    const config = this.vapidConfig || getVapidConfig();

    return {
      isConfigured: config.isConfigured,
      publicKey: config.isConfigured ? config.publicKey : undefined,
      subject: config.subject,
      errors: config.validationErrors,
    };
  }

  /**
   * Check if VAPID is properly configured
   */
  public isVapidConfigured(): boolean {
    return this.vapidConfig?.isConfigured ?? isVapidConfigured();
  }

  /**
   * Get the effective VAPID public key for subscription
   * Prioritizes config values over environment variables
   */
  private getEffectiveVapidKey(): string | undefined {
    // First check explicit config values
    if (this.config.applicationServerKey) {
      return this.config.applicationServerKey;
    }
    if (this.config.vapidPublicKey) {
      return this.config.vapidPublicKey;
    }

    // Fall back to environment-based configuration
    return getVapidPublicKeyForSubscription();
  }

  /**
   * Check if push notifications are supported
   */
  public isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  /**
   * Get current permission status
   */
  public getPermissionStatus(): PushPermissionStatus {
    if (!this.isSupported()) {
      return 'unsupported';
    }
    return Notification.permission as PushPermissionStatus;
  }

  /**
   * Get current subscription state
   */
  public async getSubscriptionState(): Promise<PushSubscriptionState> {
    const isSupported = this.isSupported();
    const permission = this.getPermissionStatus();

    if (!isSupported || !this.registration) {
      return {
        isSupported,
        permission,
        subscription: null,
        isSubscribed: false,
      };
    }

    const subscription = await this.registration.pushManager.getSubscription();
    this.subscription = subscription;

    return {
      isSupported,
      permission,
      subscription,
      isSubscribed: subscription !== null,
    };
  }

  /**
   * Register service worker
   */
  public async registerServiceWorker(): Promise<PushNotificationResult<ServiceWorkerRegistration>> {
    if (!this.isSupported()) {
      return {
        success: false,
        errorCode: 'UNSUPPORTED',
        error: new Error('Push notifications are not supported in this browser'),
      };
    }

    try {
      console.log('[PushService] Registering service worker...');
      const registration = await navigator.serviceWorker.register(this.config.swPath!, {
        scope: this.config.swScope,
      });

      this.registration = registration;

      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('[PushService] Service worker registered successfully');

      return {
        success: true,
        data: registration,
      };
    } catch (error) {
      console.error('[PushService] Service worker registration failed:', error);
      return {
        success: false,
        errorCode: 'REGISTRATION_FAILED',
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Request notification permission
   */
  public async requestPermission(): Promise<PushNotificationResult<NotificationPermission>> {
    if (!this.isSupported()) {
      return {
        success: false,
        errorCode: 'UNSUPPORTED',
        error: new Error('Push notifications are not supported'),
      };
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('[PushService] Permission result:', permission);

      if (permission === 'denied') {
        return {
          success: false,
          data: permission,
          errorCode: 'PERMISSION_DENIED',
          error: new Error('Notification permission denied'),
        };
      }

      return {
        success: permission === 'granted',
        data: permission,
      };
    } catch (error) {
      console.error('[PushService] Permission request failed:', error);
      return {
        success: false,
        errorCode: 'UNKNOWN',
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Subscribe to push notifications
   */
  public async subscribe(): Promise<PushNotificationResult<PushSubscription>> {
    if (!this.isSupported()) {
      return {
        success: false,
        errorCode: 'UNSUPPORTED',
        error: new Error('Push notifications are not supported'),
      };
    }

    // Ensure service worker is registered
    if (!this.registration) {
      const regResult = await this.registerServiceWorker();
      if (!regResult.success) {
        return {
          success: false,
          errorCode: regResult.errorCode,
          error: regResult.error,
        };
      }
    }

    // Request permission if not granted
    const permission = this.getPermissionStatus();
    if (permission === 'default') {
      const permResult = await this.requestPermission();
      if (!permResult.success) {
        return {
          success: false,
          errorCode: permResult.errorCode,
          error: permResult.error,
        };
      }
    } else if (permission === 'denied') {
      return {
        success: false,
        errorCode: 'PERMISSION_DENIED',
        error: new Error('Notification permission denied'),
      };
    }

    try {
      const subscribeOptions: PushSubscriptionOptionsInit = {
        userVisibleOnly: true,
      };

      // Get VAPID public key from config or environment
      const vapidKey = this.getEffectiveVapidKey();

      if (vapidKey) {
        console.log('[PushService] Using VAPID key for subscription');
        subscribeOptions.applicationServerKey = this.urlBase64ToUint8Array(
          vapidKey
        ) as BufferSource;
      } else {
        console.warn(
          '[PushService] No VAPID key configured - subscription may fail with some push services'
        );
      }

      console.log('[PushService] Subscribing to push notifications...');
      const subscription = await this.registration!.pushManager.subscribe(subscribeOptions);
      this.subscription = subscription;

      console.log('[PushService] Push subscription successful:', subscription.endpoint);

      // Log subscription details for debugging (endpoint only, not keys)
      if (process.env.NODE_ENV === 'development') {
        console.log('[PushService] Subscription endpoint:', subscription.endpoint);
      }

      // Store subscription in secure storage
      const storeResult = await subscriptionStorageService.storeSubscription(subscription);
      if (!storeResult.success) {
        console.warn('[PushService] Failed to store subscription securely:', storeResult.error);
      }

      return {
        success: true,
        data: subscription,
      };
    } catch (error) {
      console.error('[PushService] Push subscription failed:', error);

      // Provide more helpful error messages
      const errorMessage = error instanceof Error ? error.message : String(error);
      let userFriendlyError = errorMessage;

      if (errorMessage.includes('applicationServerKey')) {
        userFriendlyError = 'Invalid VAPID key configuration. Please check your VAPID public key.';
      } else if (errorMessage.includes('permission')) {
        userFriendlyError = 'Push notification permission was denied.';
      }

      return {
        success: false,
        errorCode: 'SUBSCRIPTION_FAILED',
        error: new Error(userFriendlyError),
      };
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  public async unsubscribe(): Promise<PushNotificationResult<boolean>> {
    if (!this.subscription) {
      const state = await this.getSubscriptionState();
      if (!state.subscription) {
        return { success: true, data: true }; // Already unsubscribed
      }
      this.subscription = state.subscription;
    }

    try {
      // Remove from secure storage first
      const deleteResult = await subscriptionStorageService.deleteByEndpoint(
        this.subscription.endpoint
      );
      if (!deleteResult.success) {
        console.warn(
          '[PushService] Failed to remove subscription from storage:',
          deleteResult.error
        );
      }

      const result = await this.subscription.unsubscribe();
      this.subscription = null;
      console.log('[PushService] Unsubscribed successfully');
      return { success: true, data: result };
    } catch (error) {
      console.error('[PushService] Unsubscribe failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Subscribe with additional options for secure storage
   */
  public async subscribeWithOptions(options: {
    alertTypes?: SubscriptionAlertType[];
    locationId?: string;
    locationName?: string;
    userId?: string;
  }): Promise<PushNotificationResult<PushSubscription>> {
    // First, perform the standard subscription
    const result = await this.subscribe();
    if (!result.success || !result.data) {
      return result;
    }

    // Update the stored subscription with additional options
    const updateResult = await subscriptionStorageService.storeSubscription(result.data, options);
    if (!updateResult.success) {
      console.warn('[PushService] Failed to update subscription options:', updateResult.error);
    }

    return result;
  }

  /**
   * Get stored subscription data from secure storage
   */
  public async getStoredSubscription() {
    if (!this.subscription) {
      return null;
    }
    const result = await subscriptionStorageService.getByEndpoint(this.subscription.endpoint);
    return result.success ? result.data : null;
  }

  /**
   * Update subscription alert preferences
   */
  public async updateAlertPreferences(
    alertTypes: SubscriptionAlertType[]
  ): Promise<PushNotificationResult<void>> {
    const stored = await this.getStoredSubscription();
    if (!stored) {
      return {
        success: false,
        errorCode: 'UNKNOWN' as const,
        error: new Error('No stored subscription found'),
      };
    }

    const result = await subscriptionStorageService.updateSubscription(stored.id, { alertTypes });
    return {
      success: result.success,
      error: result.error,
      errorCode:
        (result.errorCode as
          | 'UNSUPPORTED'
          | 'PERMISSION_DENIED'
          | 'SUBSCRIPTION_FAILED'
          | 'REGISTRATION_FAILED'
          | 'UNKNOWN') || 'UNKNOWN',
    };
  }

  /**
   * Show a local notification
   */
  public async showNotification(
    options: LocalNotificationOptions
  ): Promise<PushNotificationResult> {
    if (!this.isSupported()) {
      return {
        success: false,
        errorCode: 'UNSUPPORTED',
        error: new Error('Notifications are not supported'),
      };
    }

    if (this.getPermissionStatus() !== 'granted') {
      return {
        success: false,
        errorCode: 'PERMISSION_DENIED',
        error: new Error('Notification permission not granted'),
      };
    }

    if (!this.registration) {
      const regResult = await this.registerServiceWorker();
      if (!regResult.success) {
        return regResult as unknown as PushNotificationResult<void>;
      }
    }

    try {
      const { title, ...notificationOptions } = options;
      await this.registration!.showNotification(title, {
        icon: '/favicon-32x32.png',
        badge: '/favicon-16x16.png',
        ...notificationOptions,
      });
      return { success: true };
    } catch (error) {
      console.error('[PushService] Show notification failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Show a weather alert notification
   */
  public async showWeatherAlert(
    alert: WeatherAlertNotificationOptions
  ): Promise<PushNotificationResult> {
    const severityIcons: Record<string, string> = {
      info: 'ℹ️',
      warning: '⚠️',
      severe: '🔴',
      critical: '🚨',
    };

    const icon = severityIcons[alert.severity] || '🌤️';

    return this.showNotification({
      title: `${icon} ${alert.alertType} - ${alert.locationName}`,
      body: alert.headline,
      tag: `weather-alert-${alert.severity}`,
      requireInteraction: alert.severity === 'severe' || alert.severity === 'critical',
      data: {
        type: 'weather-alert',
        severity: alert.severity,
        locationName: alert.locationName,
        url: alert.url,
        expiresAt: alert.expiresAt?.getTime(),
      },
    });
  }

  /**
   * Set callback for notification click events
   */
  public setOnNotificationClick(callback: NotificationClickCallback | null): void {
    this.onNotificationClick = callback;
  }

  /**
   * Set callback for notification close events
   */
  public setOnNotificationClose(callback: NotificationCloseCallback | null): void {
    this.onNotificationClose = callback;
  }

  /**
   * Set callback for subscription change events
   */
  public setOnSubscriptionChange(callback: SubscriptionChangeCallback | null): void {
    this.onSubscriptionChange = callback;
  }

  /**
   * Get the current push subscription
   */
  public getSubscription(): PushSubscription | null {
    return this.subscription;
  }

  /**
   * Get the service worker registration
   */
  public getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  /**
   * Setup message listener for service worker messages
   */
  private setupMessageListener(): void {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.addEventListener('message', event => {
      const message = event.data as ServiceWorkerMessage;

      switch (message.type) {
        case 'NOTIFICATION_ACTION':
          if (this.onNotificationClick) {
            this.onNotificationClick(message.action || null, message.data || {});
          }
          break;

        case 'NOTIFICATION_CLOSED':
          if (this.onNotificationClose) {
            this.onNotificationClose(message.tag || '', message.data || {});
          }
          break;

        case 'PUSH_SUBSCRIPTION_CHANGED':
          if (this.onSubscriptionChange) {
            this.onSubscriptionChange(
              message.oldSubscription || null,
              message.newSubscription || null
            );
          }
          break;

        default:
          console.log('[PushService] Unknown message type:', message.type);
      }
    });
  }

  /**
   * Convert URL-safe base64 string to Uint8Array for VAPID key
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance();

// Export class for testing or custom instances
export { PushNotificationService };
