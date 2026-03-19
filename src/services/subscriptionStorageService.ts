/**
 * Subscription Storage Service
 * High-level service for secure, scalable push notification subscription storage
 * Combines IndexedDB storage with encryption, sync capabilities, and audit logging
 */

import {
  SUBSCRIPTION_STORAGE_VERSION,
  type EncryptedSubscriptionKeys,
  type SecureStoredSubscription,
  type StorageOperationResult,
  type SubscriptionAlertType,
  type SubscriptionAuditEntry,
  type SubscriptionDeviceInfo,
  type SubscriptionKeys,
  type SubscriptionQueryFilters,
  type SubscriptionStatus,
  type SubscriptionStorageConfig,
  type SubscriptionStorageStats,
  type TransmittableSubscription,
} from '@/types/subscriptionStorage';
import {
  decryptSubscriptionKeys,
  encryptSubscriptionKeys,
  generateChecksum,
  generateSubscriptionId,
  hashEndpoint,
  isCryptoSupported,
  verifyChecksum,
} from '@/utils/subscriptionEncryption';

import { subscriptionIndexedDB } from './subscriptionIndexedDB';

/**
 * Default storage configuration
 */
const DEFAULT_CONFIG: SubscriptionStorageConfig = {
  dbName: 'WeatherAppPushSubscriptions',
  storeName: 'subscriptions',
  encryptionEnabled: true,
  maxAuditLogEntries: 10,
  autoCleanupEnabled: true,
  cleanupIntervalMs: 24 * 60 * 60 * 1000, // 24 hours
  maxSubscriptions: 100,
  maxSyncRetries: 3,
  debug: false,
};

/**
 * Parse device information from user agent
 */
const parseDeviceInfo = (): SubscriptionDeviceInfo => {
  const ua = navigator.userAgent;

  // Simple browser detection
  let browser = 'Unknown';
  let browserVersion = '';
  if (ua.includes('Chrome')) {
    browser = 'Chrome';
    browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || '';
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
    browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || '';
  } else if (ua.includes('Safari')) {
    browser = 'Safari';
    browserVersion = ua.match(/Version\/(\d+)/)?.[1] || '';
  } else if (ua.includes('Edge')) {
    browser = 'Edge';
    browserVersion = ua.match(/Edge\/(\d+)/)?.[1] || '';
  }

  // Simple OS detection
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  // Device type detection
  let deviceType: SubscriptionDeviceInfo['deviceType'] = 'desktop';
  if (/Mobile|Android|iPhone|iPad|iPod/.test(ua)) {
    deviceType = /iPad|Tablet/.test(ua) ? 'tablet' : 'mobile';
  }

  return {
    userAgent: ua,
    browser,
    browserVersion,
    os,
    deviceType,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
  };
};

/**
 * Create an audit entry
 */
const createAuditEntry = (
  action: SubscriptionAuditEntry['action'],
  source: SubscriptionAuditEntry['source'],
  details?: string
): SubscriptionAuditEntry => ({
  timestamp: Date.now(),
  action,
  source,
  details,
});

/**
 * Subscription Storage Service Class
 */
class SubscriptionStorageService {
  private config: SubscriptionStorageConfig;
  private isInitialized = false;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<SubscriptionStorageConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize the storage service
   */
  public async initialize(): Promise<StorageOperationResult<void>> {
    if (this.isInitialized) {
      return { success: true };
    }

    try {
      const dbInitialized = await subscriptionIndexedDB.initialize();
      if (!dbInitialized) {
        return {
          success: false,
          errorCode: 'STORAGE_NOT_SUPPORTED',
          error: new Error('IndexedDB is not supported'),
        };
      }

      // Start auto-cleanup if enabled
      if (this.config.autoCleanupEnabled) {
        this.startAutoCleanup();
      }

      this.isInitialized = true;
      this.log('Storage service initialized');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Store a new push subscription securely
   */
  public async storeSubscription(
    browserSubscription: PushSubscription,
    options: {
      alertTypes?: SubscriptionAlertType[];
      locationId?: string;
      locationName?: string;
      userId?: string;
    } = {}
  ): Promise<StorageOperationResult<SecureStoredSubscription>> {
    await this.initialize();

    try {
      const endpoint = browserSubscription.endpoint;
      const endpointHash = await hashEndpoint(endpoint);

      // Check if subscription already exists
      const existing = await subscriptionIndexedDB.getByEndpointHash(endpointHash);
      if (existing.success && existing.data) {
        // Update existing subscription
        return this.updateSubscription(existing.data.id, {
          alertTypes: options.alertTypes,
          locationId: options.locationId,
          locationName: options.locationName,
          status: 'active',
        });
      }

      // Extract and encrypt keys
      const p256dhKey = browserSubscription.getKey('p256dh');
      const authKey = browserSubscription.getKey('auth');

      if (!p256dhKey || !authKey) {
        return {
          success: false,
          errorCode: 'INVALID_DATA',
          error: new Error('Missing subscription keys'),
        };
      }

      const keys: SubscriptionKeys = {
        p256dh: btoa(String.fromCharCode(...new Uint8Array(p256dhKey))),
        auth: btoa(String.fromCharCode(...new Uint8Array(authKey))),
      };

      let encryptedKeys: EncryptedSubscriptionKeys;
      if (this.config.encryptionEnabled && isCryptoSupported()) {
        encryptedKeys = await encryptSubscriptionKeys(keys);
      } else {
        // Store without encryption (fallback)
        encryptedKeys = {
          encryptedP256dh: keys.p256dh,
          encryptedAuth: keys.auth,
          iv: '',
          algorithm: 'AES-GCM',
          keyDerivation: { algorithm: 'PBKDF2', iterations: 0, salt: '' },
        };
      }

      const now = Date.now();
      const id = generateSubscriptionId();

      const subscription: SecureStoredSubscription = {
        id,
        endpoint,
        endpointHash,
        keys: encryptedKeys,
        expirationTime: browserSubscription.expirationTime,
        status: 'active',
        alertTypes: options.alertTypes || ['general'],
        locationId: options.locationId,
        locationName: options.locationName,
        userId: options.userId,
        deviceInfo: parseDeviceInfo(),
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending',
        notificationCount: 0,
        auditLog: [createAuditEntry('created', 'user')],
        schemaVersion: SUBSCRIPTION_STORAGE_VERSION,
        checksum: '',
      };

      // Generate checksum
      subscription.checksum = await generateChecksum(
        JSON.stringify({
          endpoint: subscription.endpoint,
          status: subscription.status,
          alertTypes: subscription.alertTypes,
        })
      );

      return subscriptionIndexedDB.add(subscription);
    } catch (error) {
      this.log('Failed to store subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        errorCode: this.config.encryptionEnabled ? 'ENCRYPTION_FAILED' : 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Update an existing subscription
   */
  public async updateSubscription(
    id: string,
    updates: Partial<{
      alertTypes: SubscriptionAlertType[];
      locationId: string;
      locationName: string;
      status: SubscriptionStatus;
      syncStatus: SecureStoredSubscription['syncStatus'];
      serverId: string;
      lastNotifiedAt: number;
    }>
  ): Promise<StorageOperationResult<SecureStoredSubscription>> {
    await this.initialize();

    try {
      const result = await subscriptionIndexedDB.getById(id);
      if (!result.success || !result.data) {
        return { success: false, errorCode: 'SUBSCRIPTION_NOT_FOUND' };
      }

      const subscription = result.data;
      const now = Date.now();

      // Apply updates
      const updated: SecureStoredSubscription = {
        ...subscription,
        ...updates,
        updatedAt: now,
        auditLog: [
          createAuditEntry('updated', 'user', `Updated: ${Object.keys(updates).join(', ')}`),
          ...subscription.auditLog.slice(0, this.config.maxAuditLogEntries - 1),
        ],
      };

      // Regenerate checksum
      updated.checksum = await generateChecksum(
        JSON.stringify({
          endpoint: updated.endpoint,
          status: updated.status,
          alertTypes: updated.alertTypes,
        })
      );

      return subscriptionIndexedDB.update(updated);
    } catch (error) {
      this.log('Failed to update subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Get a subscription by ID
   */
  public async getSubscription(
    id: string
  ): Promise<StorageOperationResult<SecureStoredSubscription>> {
    await this.initialize();
    return subscriptionIndexedDB.getById(id);
  }

  /**
   * Get a subscription by endpoint
   */
  public async getByEndpoint(
    endpoint: string
  ): Promise<StorageOperationResult<SecureStoredSubscription>> {
    await this.initialize();
    const hash = await hashEndpoint(endpoint);
    return subscriptionIndexedDB.getByEndpointHash(hash);
  }

  /**
   * Get all subscriptions with optional filters
   */
  public async getSubscriptions(
    filters: SubscriptionQueryFilters = {}
  ): Promise<StorageOperationResult<SecureStoredSubscription[]>> {
    await this.initialize();

    const result = await subscriptionIndexedDB.getAll();
    if (!result.success || !result.data) {
      return result as StorageOperationResult<SecureStoredSubscription[]>;
    }

    let subscriptions = result.data;

    // Apply filters
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      subscriptions = subscriptions.filter(s => statuses.includes(s.status));
    }
    if (filters.syncStatus) {
      subscriptions = subscriptions.filter(s => s.syncStatus === filters.syncStatus);
    }
    if (filters.locationId) {
      subscriptions = subscriptions.filter(s => s.locationId === filters.locationId);
    }
    if (filters.alertTypes?.length) {
      subscriptions = subscriptions.filter(s =>
        filters.alertTypes!.some(type => s.alertTypes.includes(type))
      );
    }
    if (filters.createdAfter) {
      subscriptions = subscriptions.filter(s => s.createdAt >= filters.createdAfter!);
    }
    if (filters.createdBefore) {
      subscriptions = subscriptions.filter(s => s.createdAt <= filters.createdBefore!);
    }

    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || subscriptions.length;
    subscriptions = subscriptions.slice(offset, offset + limit);

    return { success: true, data: subscriptions };
  }

  /**
   * Delete a subscription
   */
  public async deleteSubscription(id: string): Promise<StorageOperationResult<void>> {
    await this.initialize();
    return subscriptionIndexedDB.delete(id);
  }

  /**
   * Delete a subscription by endpoint
   */
  public async deleteByEndpoint(endpoint: string): Promise<StorageOperationResult<void>> {
    await this.initialize();
    const hash = await hashEndpoint(endpoint);
    const result = await subscriptionIndexedDB.getByEndpointHash(hash);
    if (result.success && result.data) {
      return subscriptionIndexedDB.delete(result.data.id);
    }
    return { success: true }; // Already deleted or doesn't exist
  }

  /**
   * Get decrypted subscription keys for transmission to server
   */
  public async getDecryptedKeys(
    subscriptionId: string
  ): Promise<StorageOperationResult<SubscriptionKeys>> {
    await this.initialize();

    const result = await subscriptionIndexedDB.getById(subscriptionId);
    if (!result.success || !result.data) {
      return { success: false, errorCode: 'SUBSCRIPTION_NOT_FOUND' };
    }

    try {
      const encryptedKeys = result.data.keys;

      // Check if keys are actually encrypted
      if (encryptedKeys.iv && encryptedKeys.keyDerivation.salt) {
        const decryptedKeys = await decryptSubscriptionKeys(encryptedKeys);
        return { success: true, data: decryptedKeys };
      }

      // Keys were stored unencrypted (fallback mode)
      return {
        success: true,
        data: {
          p256dh: encryptedKeys.encryptedP256dh,
          auth: encryptedKeys.encryptedAuth,
        },
      };
    } catch (error) {
      this.log('Failed to decrypt keys:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        errorCode: 'DECRYPTION_FAILED',
      };
    }
  }

  /**
   * Convert stored subscription to transmittable format for server sync
   */
  public async toTransmittable(
    subscriptionId: string
  ): Promise<StorageOperationResult<TransmittableSubscription>> {
    const subResult = await this.getSubscription(subscriptionId);
    if (!subResult.success || !subResult.data) {
      return { success: false, errorCode: 'SUBSCRIPTION_NOT_FOUND' };
    }

    const keysResult = await this.getDecryptedKeys(subscriptionId);
    if (!keysResult.success || !keysResult.data) {
      return keysResult as unknown as StorageOperationResult<TransmittableSubscription>;
    }

    const sub = subResult.data;
    return {
      success: true,
      data: {
        endpoint: sub.endpoint,
        keys: keysResult.data,
        expirationTime: sub.expirationTime,
        userId: sub.userId,
        locationId: sub.locationId,
        alertTypes: sub.alertTypes,
        userAgent: sub.deviceInfo.userAgent,
      },
    };
  }

  /**
   * Verify subscription data integrity
   */
  public async verifyIntegrity(subscriptionId: string): Promise<StorageOperationResult<boolean>> {
    await this.initialize();

    const result = await subscriptionIndexedDB.getById(subscriptionId);
    if (!result.success || !result.data) {
      return { success: false, errorCode: 'SUBSCRIPTION_NOT_FOUND' };
    }

    try {
      const sub = result.data;
      const _expectedChecksum = await generateChecksum(
        JSON.stringify({
          endpoint: sub.endpoint,
          status: sub.status,
          alertTypes: sub.alertTypes,
        })
      );

      const isValid = await verifyChecksum(
        JSON.stringify({
          endpoint: sub.endpoint,
          status: sub.status,
          alertTypes: sub.alertTypes,
        }),
        sub.checksum
      );

      if (!isValid) {
        this.log('Integrity check failed for subscription:', subscriptionId);
      }

      return { success: true, data: isValid };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        errorCode: 'INTEGRITY_CHECK_FAILED',
      };
    }
  }

  /**
   * Get storage statistics
   */
  public async getStats(): Promise<StorageOperationResult<SubscriptionStorageStats>> {
    await this.initialize();

    const allResult = await subscriptionIndexedDB.getAll();
    if (!allResult.success || !allResult.data) {
      return {
        success: false,
        error: allResult.error,
        errorCode: allResult.errorCode,
      };
    }

    const subscriptions = allResult.data;
    const stats: SubscriptionStorageStats = {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
      pendingSyncCount: subscriptions.filter(s => s.syncStatus === 'pending').length,
      failedSyncCount: subscriptions.filter(s => s.syncStatus === 'failed').length,
      storageSizeBytes: new Blob([JSON.stringify(subscriptions)]).size,
    };

    // Get metadata
    const lastCleanup = await subscriptionIndexedDB.getMetadata<number>('lastCleanup');
    const lastSync = await subscriptionIndexedDB.getMetadata<number>('lastSync');

    if (lastCleanup.success && lastCleanup.data) {
      stats.lastCleanupAt = lastCleanup.data;
    }
    if (lastSync.success && lastSync.data) {
      stats.lastFullSyncAt = lastSync.data;
    }

    return { success: true, data: stats };
  }

  /**
   * Clean up expired and revoked subscriptions
   */
  public async cleanup(): Promise<StorageOperationResult<number>> {
    await this.initialize();

    try {
      const result = await subscriptionIndexedDB.getAll();
      if (!result.success || !result.data) {
        return { success: false, errorCode: result.errorCode };
      }

      const now = Date.now();
      let cleanedCount = 0;

      for (const sub of result.data) {
        // Remove expired subscriptions
        const shouldRemove =
          sub.status === 'expired' ||
          sub.status === 'revoked' ||
          (sub.expirationTime && sub.expirationTime < now);

        if (shouldRemove) {
          await subscriptionIndexedDB.delete(sub.id);
          cleanedCount++;
        }
      }

      // Record cleanup timestamp
      await subscriptionIndexedDB.setMetadata('lastCleanup', now);

      this.log(`Cleanup completed: removed ${cleanedCount} subscriptions`);
      return { success: true, data: cleanedCount };
    } catch (error) {
      this.log('Cleanup failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Mark subscription notification received
   */
  public async recordNotification(subscriptionId: string): Promise<StorageOperationResult<void>> {
    await this.initialize();

    const result = await subscriptionIndexedDB.getById(subscriptionId);
    if (!result.success || !result.data) {
      return { success: false, errorCode: 'SUBSCRIPTION_NOT_FOUND' };
    }

    const sub = result.data;
    const updated: SecureStoredSubscription = {
      ...sub,
      lastNotifiedAt: Date.now(),
      notificationCount: sub.notificationCount + 1,
      updatedAt: Date.now(),
    };

    await subscriptionIndexedDB.update(updated);
    return { success: true };
  }

  /**
   * Start auto-cleanup interval
   */
  private startAutoCleanup(): void {
    if (this.cleanupInterval) {
      return;
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup().catch(err => this.log('Auto-cleanup error:', err));
    }, this.config.cleanupIntervalMs);

    this.log('Auto-cleanup started');
  }

  /**
   * Stop auto-cleanup interval
   */
  public stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      this.log('Auto-cleanup stopped');
    }
  }

  /**
   * Clear all subscription data
   */
  public async clearAll(): Promise<StorageOperationResult<void>> {
    await this.initialize();
    return subscriptionIndexedDB.clear();
  }

  /**
   * Debug logging
   */
  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log('[SubscriptionStorageService]', ...args);
    }
  }
}

// Export singleton instance
export const subscriptionStorageService = new SubscriptionStorageService();

// Export class for custom configurations
export { SubscriptionStorageService };
