/**
 * Network Monitor
 * Monitors network status and connection quality
 */

import { getLogger } from './logger';

const logger = getLogger('NetworkMonitor');

export interface NetworkStatus {
  online: boolean;
  effectiveType?: string; // '4g', '3g', '2g', 'slow-2g'
  downlink?: number; // Mbps
  rtt?: number; // Round-trip time in ms
  saveData?: boolean;
  lastCheck: number;
}

export type NetworkStatusCallback = (status: NetworkStatus) => void;

export class NetworkMonitor {
  private listeners: Set<NetworkStatusCallback> = new Set();
  private currentStatus: NetworkStatus;
  private checkInterval?: NodeJS.Timeout;

  constructor() {
    this.currentStatus = this.getNetworkStatus();
    this.setupListeners();
  }

  /**
   * Get current network status
   */
  private getNetworkStatus(): NetworkStatus {
    const online = typeof navigator !== 'undefined' ? navigator.onLine : true;

    // Use Network Information API if available
    const connection = (
      navigator as Navigator & {
        connection?: {
          effectiveType?: string;
          downlink?: number;
          rtt?: number;
          saveData?: boolean;
        };
      }
    ).connection;

    return {
      online,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      saveData: connection?.saveData,
      lastCheck: Date.now(),
    };
  }

  /**
   * Setup event listeners for network changes
   */
  private setupListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Listen to connection changes if API is available
    const connection = (
      navigator as Navigator & {
        connection?: EventTarget;
      }
    ).connection;

    if (connection) {
      connection.addEventListener('change', this.handleConnectionChange);
    }

    // Start periodic checks
    this.startPeriodicChecks();
  }

  /**
   * Handle online event
   */
  private handleOnline = (): void => {
    logger.info('Network connection restored');
    this.updateStatus();
  };

  /**
   * Handle offline event
   */
  private handleOffline = (): void => {
    logger.warn('Network connection lost');
    this.updateStatus();
  };

  /**
   * Handle connection property changes
   */
  private handleConnectionChange = (): void => {
    logger.info('Network connection properties changed');
    this.updateStatus();
  };

  /**
   * Update network status and notify listeners
   */
  private updateStatus(): void {
    const newStatus = this.getNetworkStatus();
    const statusChanged = JSON.stringify(this.currentStatus) !== JSON.stringify(newStatus);

    if (statusChanged) {
      this.currentStatus = newStatus;
      this.notifyListeners(newStatus);

      logger.info('Network status updated', {
        online: newStatus.online,
        effectiveType: newStatus.effectiveType,
        rtt: newStatus.rtt,
      });
    }
  }

  /**
   * Start periodic network checks
   */
  private startPeriodicChecks(interval: number = 30000): void {
    this.checkInterval = setInterval(() => {
      this.updateStatus();
    }, interval);
  }

  /**
   * Stop periodic checks
   */
  private stopPeriodicChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }
  }

  /**
   * Subscribe to network status changes
   */
  subscribe(callback: NetworkStatusCallback): () => void {
    this.listeners.add(callback);

    // Immediately notify with current status
    callback(this.currentStatus);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(status: NetworkStatus): void {
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        logger.error('Error in network status listener', { error });
      }
    });
  }

  /**
   * Get current status
   */
  getStatus(): NetworkStatus {
    return { ...this.currentStatus };
  }

  /**
   * Check if connection is good quality
   */
  isGoodConnection(): boolean {
    const status = this.getStatus();

    if (!status.online) return false;

    // Consider connection good if:
    // - RTT is less than 200ms
    // - Effective type is 4g
    const hasGoodRTT = !status.rtt || status.rtt < 200;
    const hasGoodType = !status.effectiveType || status.effectiveType === '4g';

    return hasGoodRTT && hasGoodType;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (typeof window === 'undefined') return;

    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);

    const connection = (
      navigator as Navigator & {
        connection?: EventTarget;
      }
    ).connection;

    if (connection) {
      connection.removeEventListener('change', this.handleConnectionChange);
    }

    this.stopPeriodicChecks();
    this.listeners.clear();
  }
}

// Singleton instance
export const networkMonitor = new NetworkMonitor();
