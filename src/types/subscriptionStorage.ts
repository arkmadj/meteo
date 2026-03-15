/**
 * Secure Subscription Storage Types
 * Type definitions for encrypted, scalable push notification subscription storage
 */

/**
 * Storage schema version for migrations
 */
export const SUBSCRIPTION_STORAGE_VERSION = 1;

/**
 * Push subscription encryption keys
 */
export interface SubscriptionKeys {
  /** Base64-encoded p256dh key for message encryption */
  p256dh: string;
  /** Base64-encoded authentication secret */
  auth: string;
}

/**
 * Encrypted subscription keys wrapper
 */
export interface EncryptedSubscriptionKeys {
  /** Encrypted p256dh key */
  encryptedP256dh: string;
  /** Encrypted auth secret */
  encryptedAuth: string;
  /** Initialization vector for decryption */
  iv: string;
  /** Algorithm used for encryption */
  algorithm: 'AES-GCM';
  /** Key derivation info */
  keyDerivation: {
    algorithm: 'PBKDF2';
    iterations: number;
    salt: string;
  };
}

/**
 * Alert subscription preferences
 */
export type SubscriptionAlertType =
  | 'weather-warning'
  | 'severe-weather'
  | 'temperature-alert'
  | 'precipitation-alert'
  | 'air-quality'
  | 'uv-index'
  | 'daily-forecast'
  | 'general';

/**
 * Subscription status
 */
export type SubscriptionStatus = 'active' | 'paused' | 'expired' | 'revoked';

/**
 * Device information for subscription management
 */
export interface SubscriptionDeviceInfo {
  /** User agent string */
  userAgent?: string;
  /** Browser name */
  browser?: string;
  /** Browser version */
  browserVersion?: string;
  /** Operating system */
  os?: string;
  /** Device type */
  deviceType?: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  /** Screen resolution */
  screenResolution?: string;
}

/**
 * Subscription audit entry
 */
export interface SubscriptionAuditEntry {
  /** Timestamp of the action */
  timestamp: number;
  /** Type of action */
  action: 'created' | 'updated' | 'paused' | 'resumed' | 'synced' | 'refreshed' | 'expired';
  /** Additional action details */
  details?: string;
  /** Source of the action */
  source: 'user' | 'system' | 'server';
}

/**
 * Stored push subscription with security features
 */
export interface SecureStoredSubscription {
  /** Unique local identifier */
  id: string;
  /** Server-assigned identifier (if synced) */
  serverId?: string;
  /** Push service endpoint URL */
  endpoint: string;
  /** Endpoint hash for quick lookups without exposing full URL */
  endpointHash: string;
  /** Encryption keys (encrypted at rest) */
  keys: EncryptedSubscriptionKeys;
  /** Subscription expiration time from push service */
  expirationTime: number | null;
  /** Current subscription status */
  status: SubscriptionStatus;
  /** Subscribed alert types */
  alertTypes: SubscriptionAlertType[];
  /** Associated location identifier */
  locationId?: string;
  /** Location name for display */
  locationName?: string;
  /** User identifier (anonymous ID if not logged in) */
  userId?: string;
  /** Device information */
  deviceInfo: SubscriptionDeviceInfo;
  /** Creation timestamp */
  createdAt: number;
  /** Last update timestamp */
  updatedAt: number;
  /** Last successful notification timestamp */
  lastNotifiedAt?: number;
  /** Last sync with server timestamp */
  lastSyncedAt?: number;
  /** Sync status */
  syncStatus: 'pending' | 'synced' | 'failed' | 'local-only';
  /** Number of successful notifications received */
  notificationCount: number;
  /** Audit trail (limited to recent entries) */
  auditLog: SubscriptionAuditEntry[];
  /** Storage schema version */
  schemaVersion: number;
  /** Checksum for integrity verification */
  checksum: string;
}

/**
 * Unencrypted subscription for API transmission
 */
export interface TransmittableSubscription {
  endpoint: string;
  keys: SubscriptionKeys;
  expirationTime?: number | null;
  userId?: string;
  locationId?: string;
  alertTypes: SubscriptionAlertType[];
  userAgent?: string;
}

/**
 * Subscription storage statistics
 */
export interface SubscriptionStorageStats {
  /** Total number of subscriptions */
  totalSubscriptions: number;
  /** Active subscriptions */
  activeSubscriptions: number;
  /** Pending sync count */
  pendingSyncCount: number;
  /** Failed sync count */
  failedSyncCount: number;
  /** Storage size in bytes */
  storageSizeBytes: number;
  /** Last cleanup timestamp */
  lastCleanupAt?: number;
  /** Last full sync timestamp */
  lastFullSyncAt?: number;
}

/**
 * Subscription query filters
 */
export interface SubscriptionQueryFilters {
  /** Filter by status */
  status?: SubscriptionStatus | SubscriptionStatus[];
  /** Filter by alert types */
  alertTypes?: SubscriptionAlertType[];
  /** Filter by location */
  locationId?: string;
  /** Filter by sync status */
  syncStatus?: SecureStoredSubscription['syncStatus'];
  /** Filter by creation date range */
  createdAfter?: number;
  createdBefore?: number;
  /** Filter by last notification date */
  lastNotifiedAfter?: number;
  lastNotifiedBefore?: number;
  /** Limit results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Subscription storage configuration
 */
export interface SubscriptionStorageConfig {
  /** IndexedDB database name */
  dbName: string;
  /** Store name within the database */
  storeName: string;
  /** Enable encryption for sensitive data */
  encryptionEnabled: boolean;
  /** Maximum audit log entries per subscription */
  maxAuditLogEntries: number;
  /** Auto-cleanup expired subscriptions */
  autoCleanupEnabled: boolean;
  /** Cleanup interval in milliseconds */
  cleanupIntervalMs: number;
  /** Maximum subscriptions to store */
  maxSubscriptions: number;
  /** Sync retry attempts */
  maxSyncRetries: number;
  /** Enable debug logging */
  debug: boolean;
}

/**
 * Storage operation result
 */
export interface StorageOperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: Error;
  errorCode?: SubscriptionStorageErrorCode;
}

/**
 * Error codes for storage operations
 */
export type SubscriptionStorageErrorCode =
  | 'STORAGE_NOT_SUPPORTED'
  | 'STORAGE_QUOTA_EXCEEDED'
  | 'ENCRYPTION_FAILED'
  | 'DECRYPTION_FAILED'
  | 'INTEGRITY_CHECK_FAILED'
  | 'SUBSCRIPTION_NOT_FOUND'
  | 'DUPLICATE_SUBSCRIPTION'
  | 'SYNC_FAILED'
  | 'MIGRATION_FAILED'
  | 'INVALID_DATA'
  | 'UNKNOWN_ERROR';

/**
 * Migration record for schema upgrades
 */
export interface StorageMigrationRecord {
  /** Version being migrated from */
  fromVersion: number;
  /** Version being migrated to */
  toVersion: number;
  /** Migration timestamp */
  migratedAt: number;
  /** Number of records migrated */
  recordsMigrated: number;
  /** Migration status */
  status: 'completed' | 'failed' | 'rolled-back';
  /** Error message if failed */
  errorMessage?: string;
}

/**
 * Subscription change event for sync
 */
export interface SubscriptionChangeEvent {
  type: 'created' | 'updated' | 'deleted';
  subscriptionId: string;
  timestamp: number;
  data?: Partial<SecureStoredSubscription>;
}

/**
 * Sync batch request
 */
export interface SubscriptionSyncBatch {
  /** Subscriptions to create on server */
  create: TransmittableSubscription[];
  /** Subscriptions to update on server */
  update: Array<{ endpoint: string; updates: Partial<TransmittableSubscription> }>;
  /** Endpoints to delete on server */
  delete: string[];
  /** Client timestamp for conflict resolution */
  clientTimestamp: number;
}

/**
 * Sync response from server
 */
export interface SubscriptionSyncResponse {
  success: boolean;
  /** Server timestamp for next sync reference */
  serverTimestamp: number;
  /** Successfully processed subscription IDs */
  processed: string[];
  /** Failed operations with reasons */
  failed: Array<{ id: string; reason: string }>;
  /** Server-side updates to apply locally */
  serverUpdates?: Array<{ endpoint: string; serverId: string; updatedAt: number }>;
}
