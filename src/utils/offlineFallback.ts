/**
 * Offline Fallback Service
 * Provides cached data and degraded functionality when offline
 */

import { getLogger } from './logger';

const logger = getLogger('OfflineFallback');

export interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface FallbackOptions {
  maxAge?: number; // Maximum age of cached data in ms
  staleWhileRevalidate?: boolean; // Return stale data while fetching fresh
}

export class OfflineFallbackService {
  private cache: Map<string, CachedData<unknown>> = new Map();
  private readonly STORAGE_KEY = 'meteo_offline_cache';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Store data in cache for offline use
   */
  set<T>(key: string, data: T, maxAge: number = 3600000): void {
    const now = Date.now();
    const cached: CachedData<T> = {
      data,
      timestamp: now,
      expiresAt: now + maxAge,
    };

    this.cache.set(key, cached);
    this.saveToStorage();

    logger.info(`Cached data for offline use: ${key}`);
  }

  /**
   * Get data from cache
   */
  get<T>(key: string, options: FallbackOptions = {}): T | null {
    const cached = this.cache.get(key) as CachedData<T> | undefined;

    if (!cached) {
      logger.warn(`No cached data found for: ${key}`);
      return null;
    }

    const now = Date.now();
    const isExpired = now > cached.expiresAt;

    // Check if data is too old
    if (options.maxAge && now - cached.timestamp > options.maxAge) {
      logger.warn(`Cached data too old for: ${key}`);
      return null;
    }

    // Return stale data if allowed
    if (isExpired && !options.staleWhileRevalidate) {
      logger.warn(`Cached data expired for: ${key}`);
      return null;
    }

    if (isExpired) {
      logger.info(`Returning stale cached data for: ${key}`);
    }

    return cached.data;
  }

  /**
   * Check if cached data exists and is valid
   */
  has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;

    const now = Date.now();
    return now <= cached.expiresAt;
  }

  /**
   * Remove data from cache
   */
  remove(key: string): void {
    this.cache.delete(key);
    this.saveToStorage();
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
    this.saveToStorage();
    logger.info('Cleared offline cache');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());

    return {
      totalEntries: entries.length,
      validEntries: entries.filter(([_, v]) => now <= v.expiresAt).length,
      expiredEntries: entries.filter(([_, v]) => now > v.expiresAt).length,
      totalSize: this.estimateSize(),
    };
  }

  /**
   * Estimate cache size in bytes
   */
  private estimateSize(): number {
    try {
      const serialized = JSON.stringify(Array.from(this.cache.entries()));
      return new Blob([serialized]).size;
    } catch {
      return 0;
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const entries = Array.from(this.cache.entries());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      logger.error('Failed to save offline cache to storage', { error });
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const entries = JSON.parse(stored) as Array<[string, CachedData<unknown>]>;
        this.cache = new Map(entries);

        // Clean expired entries
        this.cleanExpired();

        logger.info(`Loaded offline cache with ${this.cache.size} entries`);
      }
    } catch (error) {
      logger.error('Failed to load offline cache from storage', { error });
    }
  }

  /**
   * Remove expired entries
   */
  private cleanExpired(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`Cleaned ${cleaned} expired entries from cache`);
      this.saveToStorage();
    }
  }
}

// Singleton instance
export const offlineFallback = new OfflineFallbackService();
