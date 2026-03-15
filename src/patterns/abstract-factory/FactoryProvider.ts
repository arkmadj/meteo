/**
 * Abstract Factory Pattern - Factory Provider
 * 
 * Provides a centralized way to get the appropriate factory based on platform.
 * Implements the Singleton pattern to ensure only one factory per platform.
 */

import type { IUIFactory, Platform } from './UIFactory';
import { DesktopFactory } from './DesktopFactory';
import { MobileFactory } from './MobileFactory';
import { WebFactory } from './WebFactory';

// ============================================================================
// FACTORY PROVIDER
// ============================================================================

/**
 * Factory Provider - Manages factory instances and provides platform detection
 */
export class FactoryProvider {
  private static instance: FactoryProvider;
  private factories: Map<Platform, IUIFactory>;
  private currentPlatform: Platform;

  private constructor() {
    this.factories = new Map();
    this.currentPlatform = this.detectPlatform();
    this.initializeFactories();
  }

  /**
   * Get the singleton instance of FactoryProvider
   */
  public static getInstance(): FactoryProvider {
    if (!FactoryProvider.instance) {
      FactoryProvider.instance = new FactoryProvider();
    }
    return FactoryProvider.instance;
  }

  /**
   * Get the factory for the current platform
   */
  public getFactory(): IUIFactory {
    return this.getFactoryForPlatform(this.currentPlatform);
  }

  /**
   * Get the factory for a specific platform
   */
  public getFactoryForPlatform(platform: Platform): IUIFactory {
    const factory = this.factories.get(platform);
    if (!factory) {
      throw new Error(`Factory not found for platform: ${platform}`);
    }
    return factory;
  }

  /**
   * Get the current platform
   */
  public getCurrentPlatform(): Platform {
    return this.currentPlatform;
  }

  /**
   * Set the current platform (useful for testing or manual override)
   */
  public setCurrentPlatform(platform: Platform): void {
    if (!this.factories.has(platform)) {
      throw new Error(`Factory not registered for platform: ${platform}`);
    }
    this.currentPlatform = platform;
  }

  /**
   * Register a custom factory for a platform
   */
  public registerFactory(platform: Platform, factory: IUIFactory): void {
    this.factories.set(platform, factory);
  }

  /**
   * Get all available platforms
   */
  public getAvailablePlatforms(): Platform[] {
    return Array.from(this.factories.keys());
  }

  /**
   * Initialize default factories for all platforms
   */
  private initializeFactories(): void {
    this.factories.set('web', new WebFactory());
    this.factories.set('mobile', new MobileFactory());
    this.factories.set('desktop', new DesktopFactory());
  }

  /**
   * Detect the current platform based on environment
   */
  private detectPlatform(): Platform {
    // Check if running in Node.js environment
    if (typeof window === 'undefined') {
      return 'desktop';
    }

    // Check for mobile devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMobile =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

    if (isMobile) {
      return 'mobile';
    }

    // Check for Electron or other desktop frameworks
    const isElectron = userAgent.includes('electron');
    if (isElectron) {
      return 'desktop';
    }

    // Default to web
    return 'web';
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Get the factory for the current platform
 */
export function getFactory(): IUIFactory {
  return FactoryProvider.getInstance().getFactory();
}

/**
 * Get the factory for a specific platform
 */
export function getFactoryForPlatform(platform: Platform): IUIFactory {
  return FactoryProvider.getInstance().getFactoryForPlatform(platform);
}

/**
 * Get the current platform
 */
export function getCurrentPlatform(): Platform {
  return FactoryProvider.getInstance().getCurrentPlatform();
}

