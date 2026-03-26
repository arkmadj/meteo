/**
 * IndexedDB Storage Layer for Push Subscriptions
 * Provides low-level IndexedDB operations with automatic schema upgrades
 */

import {
  SUBSCRIPTION_STORAGE_VERSION,
  type SecureStoredSubscription,
  type StorageMigrationRecord,
  type StorageOperationResult,
  type SubscriptionStorageConfig,
} from '@/types/subscriptionStorage';

/**
 * Default IndexedDB configuration
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
 * Store names in the database
 */
const STORES = {
  SUBSCRIPTIONS: 'subscriptions',
  MIGRATIONS: 'migrations',
  METADATA: 'metadata',
} as const;

/**
 * Metadata keys
 */
const _METADATA_KEYS = {
  LAST_CLEANUP: 'lastCleanup',
  LAST_SYNC: 'lastSync',
  SCHEMA_VERSION: 'schemaVersion',
} as const;

/**
 * IndexedDB Storage Class
 * Handles low-level database operations
 */
class SubscriptionIndexedDB {
  private db: IDBDatabase | null = null;
  private config: SubscriptionStorageConfig;
  private initPromise: Promise<boolean> | null = null;

  constructor(config: Partial<SubscriptionStorageConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if IndexedDB is supported
   */
  public isSupported(): boolean {
    return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
  }

  /**
   * Initialize the database
   */
  public async initialize(): Promise<boolean> {
    if (this.db) {
      return true;
    }

    if (this.initPromise !== null) {
      return this.initPromise;
    }

    this.initPromise = this.openDatabase();
    return this.initPromise;
  }

  /**
   * Open the IndexedDB database with schema upgrades
   */
  private openDatabase(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        this.log('IndexedDB is not supported');
        resolve(false);
        return;
      }

      const request = indexedDB.open(this.config.dbName, SUBSCRIPTION_STORAGE_VERSION);

      request.onerror = () => {
        this.log('Failed to open database:', request.error);
        reject(new Error(`Failed to open database: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.log('Database opened successfully');
        resolve(true);
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        const oldVersion = event.oldVersion;
        const newVersion = event.newVersion || SUBSCRIPTION_STORAGE_VERSION;

        this.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);
        this.performUpgrade(db, oldVersion, newVersion);
      };
    });
  }

  /**
   * Perform database schema upgrade
   */
  private performUpgrade(db: IDBDatabase, oldVersion: number, newVersion: number): void {
    // Create subscriptions store if it doesn't exist
    if (!db.objectStoreNames.contains(STORES.SUBSCRIPTIONS)) {
      const subscriptionStore = db.createObjectStore(STORES.SUBSCRIPTIONS, {
        keyPath: 'id',
      });

      // Create indexes for efficient queries
      subscriptionStore.createIndex('endpoint', 'endpoint', { unique: true });
      subscriptionStore.createIndex('endpointHash', 'endpointHash', { unique: true });
      subscriptionStore.createIndex('status', 'status', { unique: false });
      subscriptionStore.createIndex('syncStatus', 'syncStatus', { unique: false });
      subscriptionStore.createIndex('locationId', 'locationId', { unique: false });
      subscriptionStore.createIndex('createdAt', 'createdAt', { unique: false });
      subscriptionStore.createIndex('updatedAt', 'updatedAt', { unique: false });

      this.log('Created subscriptions store with indexes');
    }

    // Create migrations store for tracking schema changes
    if (!db.objectStoreNames.contains(STORES.MIGRATIONS)) {
      db.createObjectStore(STORES.MIGRATIONS, { keyPath: 'toVersion' });
      this.log('Created migrations store');
    }

    // Create metadata store for app-level data
    if (!db.objectStoreNames.contains(STORES.METADATA)) {
      db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
      this.log('Created metadata store');
    }

    // Run version-specific migrations
    for (let v = oldVersion + 1; v <= newVersion; v++) {
      this.runMigration(db, v);
    }
  }

  /**
   * Run specific version migration
   */
  private runMigration(_db: IDBDatabase, version: number): void {
    this.log(`Running migration for version ${version}`);
    // Add version-specific migrations here as needed
    // Example: if (version === 2) { /* add new index */ }
  }

  /**
   * Get a transaction for the specified stores
   */
  private getTransaction(
    storeNames: string | string[],
    mode: IDBTransactionMode = 'readonly'
  ): IDBTransaction {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db.transaction(storeNames, mode);
  }

  /**
   * Add a subscription to the store
   */
  public async add(
    subscription: SecureStoredSubscription
  ): Promise<StorageOperationResult<SecureStoredSubscription>> {
    try {
      await this.initialize();

      return new Promise(resolve => {
        const tx = this.getTransaction(STORES.SUBSCRIPTIONS, 'readwrite');
        const store = tx.objectStore(STORES.SUBSCRIPTIONS);
        const request = store.add(subscription);

        request.onsuccess = () => {
          this.log('Subscription added:', subscription.id);
          resolve({ success: true, data: subscription });
        };

        request.onerror = () => {
          const isDuplicate = request.error?.name === 'ConstraintError';
          this.log('Failed to add subscription:', request.error);
          resolve({
            success: false,
            error: request.error || new Error('Failed to add subscription'),
            errorCode: isDuplicate ? 'DUPLICATE_SUBSCRIPTION' : 'UNKNOWN_ERROR',
          });
        };
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Update a subscription in the store
   */
  public async update(
    subscription: SecureStoredSubscription
  ): Promise<StorageOperationResult<SecureStoredSubscription>> {
    try {
      await this.initialize();

      return new Promise(resolve => {
        const tx = this.getTransaction(STORES.SUBSCRIPTIONS, 'readwrite');
        const store = tx.objectStore(STORES.SUBSCRIPTIONS);
        const request = store.put(subscription);

        request.onsuccess = () => {
          this.log('Subscription updated:', subscription.id);
          resolve({ success: true, data: subscription });
        };

        request.onerror = () => {
          this.log('Failed to update subscription:', request.error);
          resolve({
            success: false,
            error: request.error || new Error('Failed to update subscription'),
            errorCode: 'UNKNOWN_ERROR',
          });
        };
      });
    } catch (error) {
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
  public async getById(id: string): Promise<StorageOperationResult<SecureStoredSubscription>> {
    try {
      await this.initialize();

      return new Promise(resolve => {
        const tx = this.getTransaction(STORES.SUBSCRIPTIONS, 'readonly');
        const store = tx.objectStore(STORES.SUBSCRIPTIONS);
        const request = store.get(id);

        request.onsuccess = () => {
          if (request.result) {
            resolve({ success: true, data: request.result });
          } else {
            resolve({ success: false, errorCode: 'SUBSCRIPTION_NOT_FOUND' });
          }
        };

        request.onerror = () => {
          this.log('Failed to get subscription:', request.error);
          resolve({
            success: false,
            error: request.error || new Error('Failed to get subscription'),
            errorCode: 'UNKNOWN_ERROR',
          });
        };
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Get a subscription by endpoint hash
   */
  public async getByEndpointHash(
    endpointHash: string
  ): Promise<StorageOperationResult<SecureStoredSubscription>> {
    try {
      await this.initialize();

      return new Promise(resolve => {
        const tx = this.getTransaction(STORES.SUBSCRIPTIONS, 'readonly');
        const store = tx.objectStore(STORES.SUBSCRIPTIONS);
        const index = store.index('endpointHash');
        const request = index.get(endpointHash);

        request.onsuccess = () => {
          if (request.result) {
            resolve({ success: true, data: request.result });
          } else {
            resolve({ success: false, errorCode: 'SUBSCRIPTION_NOT_FOUND' });
          }
        };

        request.onerror = () => {
          this.log('Failed to get subscription by endpoint hash:', request.error);
          resolve({
            success: false,
            error: request.error || new Error('Failed to get subscription'),
            errorCode: 'UNKNOWN_ERROR',
          });
        };
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Delete a subscription by ID
   */
  public async delete(id: string): Promise<StorageOperationResult<void>> {
    try {
      await this.initialize();

      return new Promise(resolve => {
        const tx = this.getTransaction(STORES.SUBSCRIPTIONS, 'readwrite');
        const store = tx.objectStore(STORES.SUBSCRIPTIONS);
        const request = store.delete(id);

        request.onsuccess = () => {
          this.log('Subscription deleted:', id);
          resolve({ success: true });
        };

        request.onerror = () => {
          this.log('Failed to delete subscription:', request.error);
          resolve({
            success: false,
            error: request.error || new Error('Failed to delete subscription'),
            errorCode: 'UNKNOWN_ERROR',
          });
        };
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Get all subscriptions
   */
  public async getAll(): Promise<StorageOperationResult<SecureStoredSubscription[]>> {
    try {
      await this.initialize();

      return new Promise(resolve => {
        const tx = this.getTransaction(STORES.SUBSCRIPTIONS, 'readonly');
        const store = tx.objectStore(STORES.SUBSCRIPTIONS);
        const request = store.getAll();

        request.onsuccess = () => {
          resolve({ success: true, data: request.result || [] });
        };

        request.onerror = () => {
          this.log('Failed to get all subscriptions:', request.error);
          resolve({
            success: false,
            error: request.error || new Error('Failed to get subscriptions'),
            errorCode: 'UNKNOWN_ERROR',
          });
        };
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Get subscriptions by index
   */
  public async getByIndex(
    indexName: string,
    value: IDBValidKey
  ): Promise<StorageOperationResult<SecureStoredSubscription[]>> {
    try {
      await this.initialize();

      return new Promise(resolve => {
        const tx = this.getTransaction(STORES.SUBSCRIPTIONS, 'readonly');
        const store = tx.objectStore(STORES.SUBSCRIPTIONS);
        const index = store.index(indexName);
        const request = index.getAll(value);

        request.onsuccess = () => {
          resolve({ success: true, data: request.result || [] });
        };

        request.onerror = () => {
          this.log(`Failed to get subscriptions by index ${indexName}:`, request.error);
          resolve({
            success: false,
            error: request.error || new Error('Failed to get subscriptions'),
            errorCode: 'UNKNOWN_ERROR',
          });
        };
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Count subscriptions
   */
  public async count(): Promise<StorageOperationResult<number>> {
    try {
      await this.initialize();

      return new Promise(resolve => {
        const tx = this.getTransaction(STORES.SUBSCRIPTIONS, 'readonly');
        const store = tx.objectStore(STORES.SUBSCRIPTIONS);
        const request = store.count();

        request.onsuccess = () => {
          resolve({ success: true, data: request.result });
        };

        request.onerror = () => {
          this.log('Failed to count subscriptions:', request.error);
          resolve({
            success: false,
            error: request.error || new Error('Failed to count subscriptions'),
            errorCode: 'UNKNOWN_ERROR',
          });
        };
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Clear all subscriptions
   */
  public async clear(): Promise<StorageOperationResult<void>> {
    try {
      await this.initialize();

      return new Promise(resolve => {
        const tx = this.getTransaction(STORES.SUBSCRIPTIONS, 'readwrite');
        const store = tx.objectStore(STORES.SUBSCRIPTIONS);
        const request = store.clear();

        request.onsuccess = () => {
          this.log('All subscriptions cleared');
          resolve({ success: true });
        };

        request.onerror = () => {
          this.log('Failed to clear subscriptions:', request.error);
          resolve({
            success: false,
            error: request.error || new Error('Failed to clear subscriptions'),
            errorCode: 'UNKNOWN_ERROR',
          });
        };
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Store metadata value
   */
  public async setMetadata(key: string, value: unknown): Promise<StorageOperationResult<void>> {
    try {
      await this.initialize();

      return new Promise(resolve => {
        const tx = this.getTransaction(STORES.METADATA, 'readwrite');
        const store = tx.objectStore(STORES.METADATA);
        const request = store.put({ key, value, updatedAt: Date.now() });

        request.onsuccess = () => {
          resolve({ success: true });
        };

        request.onerror = () => {
          this.log('Failed to set metadata:', request.error);
          resolve({
            success: false,
            error: request.error || new Error('Failed to set metadata'),
            errorCode: 'UNKNOWN_ERROR',
          });
        };
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Get metadata value
   */
  public async getMetadata<T>(key: string): Promise<StorageOperationResult<T | undefined>> {
    try {
      await this.initialize();

      return new Promise(resolve => {
        const tx = this.getTransaction(STORES.METADATA, 'readonly');
        const store = tx.objectStore(STORES.METADATA);
        const request = store.get(key);

        request.onsuccess = () => {
          resolve({ success: true, data: request.result?.value });
        };

        request.onerror = () => {
          this.log('Failed to get metadata:', request.error);
          resolve({
            success: false,
            error: request.error || new Error('Failed to get metadata'),
            errorCode: 'UNKNOWN_ERROR',
          });
        };
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Record a migration
   */
  public async recordMigration(
    migration: StorageMigrationRecord
  ): Promise<StorageOperationResult<void>> {
    try {
      await this.initialize();

      return new Promise(resolve => {
        const tx = this.getTransaction(STORES.MIGRATIONS, 'readwrite');
        const store = tx.objectStore(STORES.MIGRATIONS);
        const request = store.put(migration);

        request.onsuccess = () => {
          this.log('Migration recorded:', migration);
          resolve({ success: true });
        };

        request.onerror = () => {
          this.log('Failed to record migration:', request.error);
          resolve({
            success: false,
            error: request.error || new Error('Failed to record migration'),
            errorCode: 'UNKNOWN_ERROR',
          });
        };
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Close the database connection
   */
  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
      this.log('Database connection closed');
    }
  }

  /**
   * Delete the entire database
   */
  public async deleteDatabase(): Promise<StorageOperationResult<void>> {
    this.close();

    return new Promise(resolve => {
      const request = indexedDB.deleteDatabase(this.config.dbName);

      request.onsuccess = () => {
        this.log('Database deleted');
        resolve({ success: true });
      };

      request.onerror = () => {
        this.log('Failed to delete database:', request.error);
        resolve({
          success: false,
          error: request.error || new Error('Failed to delete database'),
          errorCode: 'UNKNOWN_ERROR',
        });
      };
    });
  }

  /**
   * Debug logging
   */
  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log('[SubscriptionIndexedDB]', ...args);
    }
  }
}

// Export singleton instance with default configuration
export const subscriptionIndexedDB = new SubscriptionIndexedDB();

// Export class for custom configurations
export { SubscriptionIndexedDB };
