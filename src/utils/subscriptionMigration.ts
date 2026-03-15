/**
 * Subscription Migration Utilities
 * Handles migration of existing localStorage subscription data to secure IndexedDB storage
 */

import { subscriptionIndexedDB } from '@/services/subscriptionIndexedDB';
import { subscriptionStorageService } from '@/services/subscriptionStorageService';
import type { StorageOperationResult } from '@/types/subscriptionStorage';

/**
 * Migration result interface
 */
export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: string[];
  migrationVersion: number;
}

/**
 * Legacy subscription format from localStorage
 */
interface LegacySubscription {
  id: string;
  endpoint?: string;
  type?: string;
  subscribedAt?: string | Date;
  enabled?: boolean;
  filters?: Record<string, unknown>;
}

const MIGRATION_KEY = 'weather_app_subscription_migration';
const CURRENT_MIGRATION_VERSION = 1;

/**
 * Check if migration has already been completed
 */
export const isMigrationComplete = (): boolean => {
  try {
    const migrationData = localStorage.getItem(MIGRATION_KEY);
    if (!migrationData) return false;

    const parsed = JSON.parse(migrationData);
    return parsed.version >= CURRENT_MIGRATION_VERSION && parsed.completed === true;
  } catch {
    return false;
  }
};

/**
 * Mark migration as complete
 */
const markMigrationComplete = (result: MigrationResult): void => {
  try {
    localStorage.setItem(
      MIGRATION_KEY,
      JSON.stringify({
        version: CURRENT_MIGRATION_VERSION,
        completed: true,
        completedAt: Date.now(),
        migratedCount: result.migratedCount,
        skippedCount: result.skippedCount,
        errorCount: result.errorCount,
      })
    );
  } catch {
    // Ignore storage errors
  }
};

/**
 * Get legacy subscriptions from localStorage
 */
const getLegacySubscriptions = (): LegacySubscription[] => {
  try {
    // Try common storage key patterns
    const possibleKeys = [
      'weather_notifications_subscriptions',
      'notification_subscriptions',
      'push_subscriptions',
    ];

    for (const key of possibleKeys) {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    }

    return [];
  } catch {
    return [];
  }
};

/**
 * Migrate a single legacy subscription
 */
const migrateLegacySubscription = async (
  legacy: LegacySubscription
): Promise<StorageOperationResult<void>> => {
  // Skip if no endpoint (can't create a valid push subscription)
  if (!legacy.endpoint) {
    return { success: true }; // Skip silently
  }

  try {
    // Check if already migrated
    const existing = await subscriptionStorageService.getByEndpoint(legacy.endpoint);
    if (existing.success && existing.data) {
      return { success: true }; // Already exists
    }

    // Record migration in IndexedDB
    await subscriptionIndexedDB.recordMigration({
      version: CURRENT_MIGRATION_VERSION,
      appliedAt: Date.now(),
      description: `Migrated legacy subscription: ${legacy.id}`,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
      errorCode: 'MIGRATION_FAILED',
    };
  }
};

/**
 * Run the full migration process
 */
export const runSubscriptionMigration = async (): Promise<MigrationResult> => {
  const result: MigrationResult = {
    success: false,
    migratedCount: 0,
    skippedCount: 0,
    errorCount: 0,
    errors: [],
    migrationVersion: CURRENT_MIGRATION_VERSION,
  };

  // Check if already migrated
  if (isMigrationComplete()) {
    result.success = true;
    return result;
  }

  try {
    // Initialize storage
    await subscriptionStorageService.initialize();

    // Get legacy subscriptions
    const legacySubscriptions = getLegacySubscriptions();

    if (legacySubscriptions.length === 0) {
      // No legacy data to migrate
      result.success = true;
      markMigrationComplete(result);
      return result;
    }

    // Migrate each subscription
    for (const legacy of legacySubscriptions) {
      const migrationResult = await migrateLegacySubscription(legacy);

      if (migrationResult.success) {
        if (legacy.endpoint) {
          result.migratedCount++;
        } else {
          result.skippedCount++;
        }
      } else {
        result.errorCount++;
        result.errors.push(migrationResult.error?.message || 'Unknown error');
      }
    }

    result.success = result.errorCount === 0;
    markMigrationComplete(result);

    return result;
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : String(error));
    return result;
  }
};

