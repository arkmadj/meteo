/**
 * ARIA Live Region Debugger
 * Monitors and logs all aria-live announcements in real-time
 * Helps debug conflicting announcements from multiple screen readers
 */

export interface AriaAnnouncement {
  id: string;
  timestamp: number;
  message: string;
  ariaLive: 'polite' | 'assertive' | 'off';
  role: string;
  source: string;
  element: string;
}

export interface AnnouncementConflict {
  type: 'duplicate' | 'rapid-fire' | 'interruption' | 'nested';
  announcements: AriaAnnouncement[];
  description: string;
}

export class AriaLiveDebugger {
  private announcements: AriaAnnouncement[] = [];
  private observer: MutationObserver | null = null;
  private listeners: Array<(announcement: AriaAnnouncement) => void> = [];
  private conflictListeners: Array<(conflict: AnnouncementConflict) => void> = [];
  private isEnabled: boolean = false;
  private maxHistory: number = 100;

  /**
   * Start monitoring aria-live regions
   */
  start(): void {
    if (this.isEnabled) return;

    this.isEnabled = true;
    this.observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        this.handleMutation(mutation);
      });
    });

    // Observe entire document
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['aria-live', 'role'],
    });

    console.log('[AriaLiveDebugger] Started monitoring');
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (!this.isEnabled) return;

    this.isEnabled = false;
    this.observer?.disconnect();
    this.observer = null;

    console.log('[AriaLiveDebugger] Stopped monitoring');
  }

  /**
   * Handle DOM mutations
   */
  private handleMutation(mutation: MutationRecord): void {
    const target = mutation.target as HTMLElement;

    // Skip if not an element node
    if (target.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    // Check if element or ancestor has aria-live
    const liveRegion = this.findLiveRegion(target);
    if (!liveRegion) return;

    const ariaLive = liveRegion.getAttribute('aria-live') as 'polite' | 'assertive' | 'off';
    if (!ariaLive || ariaLive === 'off') return;

    // Get message content
    const message = this.extractMessage(liveRegion);
    if (!message || message.trim() === '') return;

    // Create announcement record
    const announcement: AriaAnnouncement = {
      id: this.generateId(),
      timestamp: Date.now(),
      message: message.trim(),
      ariaLive,
      role: liveRegion.getAttribute('role') || 'none',
      source: liveRegion.className || 'unknown',
      element: this.getElementDescription(liveRegion),
    };

    // Add to history
    this.announcements.push(announcement);
    if (this.announcements.length > this.maxHistory) {
      this.announcements.shift();
    }

    // Notify listeners
    this.notifyListeners(announcement);

    // Check for conflicts
    this.detectConflicts(announcement);
  }

  /**
   * Find the nearest aria-live region
   */
  private findLiveRegion(element: HTMLElement): HTMLElement | null {
    let current: HTMLElement | null = element;

    while (current) {
      if (current.hasAttribute('aria-live')) {
        return current;
      }
      current = current.parentElement;
    }

    return null;
  }

  /**
   * Extract message from element
   */
  private extractMessage(element: HTMLElement): string {
    // Use aria-label if available
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // Otherwise use text content
    return element.textContent || '';
  }

  /**
   * Get element description for debugging
   */
  private getElementDescription(element: HTMLElement): string {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const classes = element.className ? `.${element.className.split(' ').join('.')}` : '';
    return `${tag}${id}${classes}`;
  }

  /**
   * Detect conflicts between announcements
   */
  private detectConflicts(announcement: AriaAnnouncement): void {
    const recentAnnouncements = this.getRecentAnnouncements(2000); // Last 2 seconds

    // Check for duplicates
    const duplicates = recentAnnouncements.filter(
      a => a.id !== announcement.id && a.message === announcement.message
    );

    if (duplicates.length > 0) {
      this.notifyConflict({
        type: 'duplicate',
        announcements: [announcement, ...duplicates],
        description: `Duplicate announcement: "${announcement.message}" announced ${duplicates.length + 1} times`,
      });
    }

    // Check for rapid-fire (3+ announcements within 1 second)
    const rapidFire = this.getRecentAnnouncements(1000);
    if (rapidFire.length >= 3) {
      this.notifyConflict({
        type: 'rapid-fire',
        announcements: rapidFire,
        description: `Rapid-fire: ${rapidFire.length} announcements within 1 second`,
      });
    }

    // Check for interruptions (assertive after polite)
    if (announcement.ariaLive === 'assertive') {
      const recentPolite = recentAnnouncements.filter(
        a => a.ariaLive === 'polite' && a.timestamp < announcement.timestamp
      );

      if (recentPolite.length > 0) {
        this.notifyConflict({
          type: 'interruption',
          announcements: [recentPolite[recentPolite.length - 1], announcement],
          description: `Assertive announcement interrupted polite announcement`,
        });
      }
    }
  }

  /**
   * Get recent announcements within time window
   */
  private getRecentAnnouncements(windowMs: number): AriaAnnouncement[] {
    const now = Date.now();
    return this.announcements.filter(a => now - a.timestamp <= windowMs);
  }

  /**
   * Subscribe to announcements
   */
  onAnnouncement(listener: (announcement: AriaAnnouncement) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Subscribe to conflicts
   */
  onConflict(listener: (conflict: AnnouncementConflict) => void): () => void {
    this.conflictListeners.push(listener);
    return () => {
      this.conflictListeners = this.conflictListeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify listeners of new announcement
   */
  private notifyListeners(announcement: AriaAnnouncement): void {
    this.listeners.forEach(listener => {
      try {
        listener(announcement);
      } catch (error) {
        console.error('[AriaLiveDebugger] Listener error:', error);
      }
    });
  }

  /**
   * Notify listeners of conflict
   */
  private notifyConflict(conflict: AnnouncementConflict): void {
    this.conflictListeners.forEach(listener => {
      try {
        listener(conflict);
      } catch (error) {
        console.error('[AriaLiveDebugger] Conflict listener error:', error);
      }
    });
  }

  /**
   * Get all announcements
   */
  getAnnouncements(): AriaAnnouncement[] {
    return [...this.announcements];
  }

  /**
   * Clear history
   */
  clear(): void {
    this.announcements = [];
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    total: number;
    byType: Record<string, number>;
    byRole: Record<string, number>;
    averageInterval: number;
  } {
    const total = this.announcements.length;

    const byType: Record<string, number> = {};
    const byRole: Record<string, number> = {};

    this.announcements.forEach(a => {
      byType[a.ariaLive] = (byType[a.ariaLive] || 0) + 1;
      byRole[a.role] = (byRole[a.role] || 0) + 1;
    });

    // Calculate average interval between announcements
    let totalInterval = 0;
    for (let i = 1; i < this.announcements.length; i++) {
      totalInterval += this.announcements[i].timestamp - this.announcements[i - 1].timestamp;
    }
    const averageInterval =
      this.announcements.length > 1 ? totalInterval / (this.announcements.length - 1) : 0;

    return {
      total,
      byType,
      byRole,
      averageInterval,
    };
  }
}

// Singleton instance
let ariaDebuggerInstance: AriaLiveDebugger | null = null;

/**
 * Get or create debugger instance
 */
export function getAriaLiveDebugger(): AriaLiveDebugger {
  if (!ariaDebuggerInstance) {
    ariaDebuggerInstance = new AriaLiveDebugger();
  }
  return ariaDebuggerInstance;
}

/**
 * React hook for using the debugger
 */
export function useAriaLiveDebugger() {
  const ariaDebugger = getAriaLiveDebugger();

  return {
    start: () => ariaDebugger.start(),
    stop: () => ariaDebugger.stop(),
    clear: () => ariaDebugger.clear(),
    getAnnouncements: () => ariaDebugger.getAnnouncements(),
    getStatistics: () => ariaDebugger.getStatistics(),
    onAnnouncement: (listener: (announcement: AriaAnnouncement) => void) =>
      ariaDebugger.onAnnouncement(listener),
    onConflict: (listener: (conflict: AnnouncementConflict) => void) =>
      ariaDebugger.onConflict(listener),
  };
}
