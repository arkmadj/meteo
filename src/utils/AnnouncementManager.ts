/**
 * Announcement Manager
 * Centralized system for managing ARIA live announcements
 * Prevents conflicts, duplicates, and rapid-fire announcements
 */

/**
 * Throttler - Prevents rapid-fire announcements
 */
export class AnnouncementThrottler {
  private lastAnnouncement: number = 0;
  private minInterval: number;
  private queue: Array<() => void> = [];
  private processing: boolean = false;

  constructor(minInterval: number = 500) {
    this.minInterval = minInterval;
  }

  announce(callback: () => void): void {
    const now = Date.now();
    const timeSinceLastAnnouncement = now - this.lastAnnouncement;

    if (timeSinceLastAnnouncement >= this.minInterval) {
      // Announce immediately
      callback();
      this.lastAnnouncement = now;
    } else {
      // Queue for later
      this.queue.push(callback);
      this.processQueue();
    }
  }

  private processQueue(): void {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const delay = this.minInterval - (Date.now() - this.lastAnnouncement);

    setTimeout(
      () => {
        const callback = this.queue.shift();
        if (callback) {
          callback();
          this.lastAnnouncement = Date.now();
        }
        this.processing = false;
        this.processQueue();
      },
      Math.max(0, delay)
    );
  }

  clear(): void {
    this.queue = [];
    this.processing = false;
  }

  getQueueLength(): number {
    return this.queue.length;
  }
}

/**
 * Deduplicator - Prevents duplicate announcements
 */
export class AnnouncementDeduplicator {
  private recentAnnouncements: Map<string, number> = new Map();
  private dedupeWindow: number;

  constructor(dedupeWindow: number = 2000) {
    this.dedupeWindow = dedupeWindow;
  }

  shouldAnnounce(message: string): boolean {
    const now = Date.now();
    const lastAnnouncement = this.recentAnnouncements.get(message);

    if (lastAnnouncement && now - lastAnnouncement < this.dedupeWindow) {
      return false; // Skip duplicate
    }

    this.recentAnnouncements.set(message, now);
    this.cleanup();

    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [message, timestamp] of this.recentAnnouncements.entries()) {
      if (now - timestamp > this.dedupeWindow) {
        this.recentAnnouncements.delete(message);
      }
    }
  }

  clear(): void {
    this.recentAnnouncements.clear();
  }
}

/**
 * Priority Queue - Manages announcement priority
 */
export interface QueuedAnnouncement {
  message: string;
  priority: number;
  ariaLive: 'polite' | 'assertive';
  timestamp: number;
  callback: () => void;
}

export class AnnouncementPriorityQueue {
  private queue: QueuedAnnouncement[] = [];
  private isProcessing: boolean = false;
  private processingDelay: number;

  constructor(processingDelay: number = 1000) {
    this.processingDelay = processingDelay;
  }

  add(
    message: string,
    priority: number,
    ariaLive: 'polite' | 'assertive',
    callback: () => void
  ): void {
    this.queue.push({
      message,
      priority,
      ariaLive,
      timestamp: Date.now(),
      callback,
    });

    // Sort by priority (high to low), then by timestamp (old to new)
    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.timestamp - b.timestamp;
    });

    this.process();
  }

  private async process(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const announcement = this.queue.shift()!;

    // Execute callback
    announcement.callback();

    // Wait before processing next
    await new Promise(resolve => setTimeout(resolve, this.processingDelay));

    this.isProcessing = false;
    this.process();
  }

  clear(): void {
    this.queue = [];
    this.isProcessing = false;
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  getQueue(): QueuedAnnouncement[] {
    return [...this.queue];
  }
}

/**
 * Debouncer - Debounces rapid updates
 */
export class AnnouncementDebouncer {
  private timeoutId: NodeJS.Timeout | null = null;
  private pendingMessage: string = '';
  private pendingCallback: (() => void) | null = null;
  private delay: number;

  constructor(delay: number = 300) {
    this.delay = delay;
  }

  announce(message: string, callback: () => void): void {
    this.pendingMessage = message;
    this.pendingCallback = callback;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      if (this.pendingCallback) {
        this.pendingCallback();
      }
      this.timeoutId = null;
      this.pendingCallback = null;
    }, this.delay);
  }

  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
      this.pendingCallback = null;
    }
  }

  flush(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.pendingCallback) {
      this.pendingCallback();
      this.pendingCallback = null;
    }
  }
}

/**
 * Screen Reader Detector
 */
export class ScreenReaderDetector {
  detect(): 'nvda' | 'jaws' | 'voiceover' | 'narrator' | 'talkback' | 'unknown' {
    const userAgent = navigator.userAgent.toLowerCase();

    // Check for specific screen reader indicators
    if (userAgent.includes('nvda')) return 'nvda';
    if (userAgent.includes('jaws')) return 'jaws';

    // Check for macOS (likely VoiceOver)
    if (navigator.platform.toLowerCase().includes('mac')) {
      return 'voiceover';
    }

    // Check for Android (likely TalkBack)
    if (userAgent.includes('android')) {
      return 'talkback';
    }

    // Check for Windows (might be Narrator)
    if (navigator.platform.toLowerCase().includes('win')) {
      return 'narrator';
    }

    return 'unknown';
  }

  getOptimalDelay(screenReader?: ReturnType<typeof this.detect>): number {
    const detected = screenReader || this.detect();

    switch (detected) {
      case 'nvda':
        return 100;
      case 'jaws':
        return 200;
      case 'voiceover':
        return 150;
      case 'narrator':
        return 250;
      case 'talkback':
        return 200;
      default:
        return 200;
    }
  }

  getOptimalThrottle(screenReader?: ReturnType<typeof this.detect>): number {
    const detected = screenReader || this.detect();

    switch (detected) {
      case 'nvda':
        return 500;
      case 'jaws':
        return 600;
      case 'voiceover':
        return 550;
      case 'narrator':
        return 700;
      case 'talkback':
        return 600;
      default:
        return 600;
    }
  }
}

/**
 * Centralized Announcement Manager
 * Combines all utilities for conflict-free announcements
 */
export class AnnouncementManager {
  private throttler: AnnouncementThrottler;
  private deduplicator: AnnouncementDeduplicator;
  private priorityQueue: AnnouncementPriorityQueue;
  private debouncer: AnnouncementDebouncer;
  private detector: ScreenReaderDetector;

  constructor() {
    this.detector = new ScreenReaderDetector();
    const optimalThrottle = this.detector.getOptimalThrottle();

    this.throttler = new AnnouncementThrottler(optimalThrottle);
    this.deduplicator = new AnnouncementDeduplicator(2000);
    this.priorityQueue = new AnnouncementPriorityQueue(1000);
    this.debouncer = new AnnouncementDebouncer(300);
  }

  /**
   * Announce with automatic conflict prevention
   */
  announce(
    message: string,
    options: {
      priority?: number;
      ariaLive?: 'polite' | 'assertive';
      skipDedupe?: boolean;
      skipThrottle?: boolean;
    } = {}
  ): void {
    const { priority = 0, ariaLive = 'polite', skipDedupe = false, skipThrottle = false } = options;

    // Check for duplicates
    if (!skipDedupe && !this.deduplicator.shouldAnnounce(message)) {
      console.log('[AnnouncementManager] Skipped duplicate:', message);
      return;
    }

    const callback = () => {
      console.log(`[AnnouncementManager] Announcing [${ariaLive}]:`, message);
      // Actual announcement logic would go here
      // This would typically update a live region in the DOM
    };

    // Use priority queue for high-priority messages
    if (priority > 5) {
      this.priorityQueue.add(message, priority, ariaLive, callback);
    } else if (skipThrottle) {
      // Announce immediately
      callback();
    } else {
      // Throttle normal announcements
      this.throttler.announce(callback);
    }
  }

  /**
   * Debounced announce (for rapid updates)
   */
  announceDebounced(message: string, callback: () => void): void {
    this.debouncer.announce(message, callback);
  }

  /**
   * Clear all queues and state
   */
  clear(): void {
    this.throttler.clear();
    this.deduplicator.clear();
    this.priorityQueue.clear();
    this.debouncer.cancel();
  }

  /**
   * Get current state
   */
  getState(): {
    throttleQueue: number;
    priorityQueue: number;
    screenReader: string;
  } {
    return {
      throttleQueue: this.throttler.getQueueLength(),
      priorityQueue: this.priorityQueue.getQueueLength(),
      screenReader: this.detector.detect(),
    };
  }
}

// Singleton instance
let managerInstance: AnnouncementManager | null = null;

/**
 * Get or create manager instance
 */
export function getAnnouncementManager(): AnnouncementManager {
  if (!managerInstance) {
    managerInstance = new AnnouncementManager();
  }
  return managerInstance;
}
