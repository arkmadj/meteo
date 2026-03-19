/**
 * MarkerFlyweightFactory
 *
 * Factory class that manages the creation and reuse of MarkerFlyweight instances.
 * Ensures that only one flyweight exists for each unique combination of intrinsic state.
 *
 * This is the core of the Flyweight pattern - it maintains a pool of shared objects
 * and returns existing instances when possible, creating new ones only when necessary.
 */

import type { IMarkerIntrinsicState } from './MarkerFlyweight';
import { MarkerFlyweight } from './MarkerFlyweight';

/**
 * Factory for creating and managing marker flyweights
 */
export class MarkerFlyweightFactory {
  private flyweights: Map<string, MarkerFlyweight> = new Map();
  private static instance: MarkerFlyweightFactory | null = null;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {}

  /**
   * Get the singleton instance of the factory
   */
  public static getInstance(): MarkerFlyweightFactory {
    if (!MarkerFlyweightFactory.instance) {
      MarkerFlyweightFactory.instance = new MarkerFlyweightFactory();
    }
    return MarkerFlyweightFactory.instance;
  }

  /**
   * Get or create a flyweight for the given intrinsic state
   */
  public getFlyweight(intrinsicState: IMarkerIntrinsicState): MarkerFlyweight {
    const key = MarkerFlyweight.getKey(intrinsicState);

    if (!this.flyweights.has(key)) {
      this.flyweights.set(key, new MarkerFlyweight(intrinsicState));
      console.log(`[Flyweight] Created new flyweight: ${key}`);
    }

    return this.flyweights.get(key)!;
  }

  /**
   * Get the number of flyweights currently in the pool
   */
  public getFlyweightCount(): number {
    return this.flyweights.size;
  }

  /**
   * Clear all flyweights from the pool
   */
  public clear(): void {
    this.flyweights.clear();
  }

  /**
   * Get statistics about flyweight usage
   */
  public getStats(): {
    totalFlyweights: number;
    flyweightTypes: string[];
    memoryEstimate: string;
  } {
    const types = Array.from(this.flyweights.keys());
    const totalFlyweights = this.flyweights.size;

    // Rough estimate: each flyweight saves ~1KB per marker instance
    const memorySavedPerMarker = 1; // KB
    const memoryEstimate = `~${memorySavedPerMarker * totalFlyweights}KB saved per 1000 markers`;

    return {
      totalFlyweights,
      flyweightTypes: types,
      memoryEstimate,
    };
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static resetInstance(): void {
    if (MarkerFlyweightFactory.instance) {
      MarkerFlyweightFactory.instance.clear();
      MarkerFlyweightFactory.instance = null;
    }
  }
}

/**
 * Predefined marker types for common use cases
 */
export const MARKER_TYPES = {
  WEATHER_STATION: {
    type: 'weather-station',
    color: '#3b82f6',
    size: 30,
    iconHtml: `
      <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `,
    borderColor: '#ffffff',
    borderWidth: 2,
  },
  TEMPERATURE_HOT: {
    type: 'temperature-hot',
    color: '#ef4444',
    size: 25,
    iconHtml: `
      <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
        <path d="M15 13V5c0-1.66-1.34-3-3-3S9 3.34 9 5v8c-1.21.91-2 2.37-2 4 0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.63-.79-3.09-2-4zm-4-8c0-.55.45-1 1-1s1 .45 1 1h-1v1h1v2h-1v1h1v2h-2V5z"/>
      </svg>
    `,
    borderColor: '#ffffff',
    borderWidth: 2,
  },
  TEMPERATURE_COLD: {
    type: 'temperature-cold',
    color: '#3b82f6',
    size: 25,
    iconHtml: `
      <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
        <path d="M22 11h-4.17l3.24-3.24-1.41-1.42L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 2.93 6.34 4.34 11 9v2H9L4.34 6.34 2.93 7.76 6.17 11H2v2h4.17l-3.24 3.24 1.41 1.42L9 13h2v2l-4.66 4.66 1.42 1.41L11 17.83V22h2v-4.17l3.24 3.24 1.42-1.41L13 15v-2h2l4.66 4.66 1.41-1.42L17.83 13H22z"/>
      </svg>
    `,
    borderColor: '#ffffff',
    borderWidth: 2,
  },
  TEMPERATURE_MODERATE: {
    type: 'temperature-moderate',
    color: '#10b981',
    size: 25,
    iconHtml: `
      <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
        <path d="M15 13V5c0-1.66-1.34-3-3-3S9 3.34 9 5v8c-1.21.91-2 2.37-2 4 0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.63-.79-3.09-2-4z"/>
      </svg>
    `,
    borderColor: '#ffffff',
    borderWidth: 2,
  },
  HUMIDITY_HIGH: {
    type: 'humidity-high',
    color: '#0ea5e9',
    size: 25,
    iconHtml: `
      <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
      </svg>
    `,
    borderColor: '#ffffff',
    borderWidth: 2,
  },
  SEARCH_RESULT: {
    type: 'search-result',
    color: '#8b5cf6',
    size: 25,
    iconHtml: `
      <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `,
    borderColor: '#ffffff',
    borderWidth: 2,
  },
} as const;
