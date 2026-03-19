/**
 * Abstract Factory Pattern - UI Factory Interface
 *
 * Defines the abstract factory interface for creating platform-specific UI components.
 */

import type {
  IButton,
  IButtonProps,
  ICheckbox,
  ICheckboxProps,
  IInput,
  IInputProps,
} from './UIComponent';

// ============================================================================
// PLATFORM TYPES
// ============================================================================

export type Platform = 'web' | 'mobile' | 'desktop';

// ============================================================================
// ABSTRACT FACTORY INTERFACE
// ============================================================================

/**
 * Abstract factory interface for creating UI components
 *
 * Each concrete factory implementation will create components
 * specific to a particular platform (Web, Mobile, Desktop)
 */
export interface IUIFactory {
  /**
   * Get the platform this factory creates components for
   */
  getPlatform(): Platform;

  /**
   * Create a button component
   */
  createButton(props: IButtonProps): IButton;

  /**
   * Create an input component
   */
  createInput(props: IInputProps): IInput;

  /**
   * Create a checkbox component
   */
  createCheckbox(props: ICheckboxProps): ICheckbox;

  /**
   * Get platform-specific theme configuration
   */
  getTheme(): Record<string, unknown>;

  /**
   * Get platform-specific accessibility features
   */
  getAccessibilityFeatures(): string[];
}

// ============================================================================
// BASE ABSTRACT FACTORY CLASS
// ============================================================================

/**
 * Base abstract class providing common functionality for all factories
 */
export abstract class BaseUIFactory implements IUIFactory {
  protected platform: Platform;
  protected theme: Record<string, unknown>;

  constructor(platform: Platform) {
    this.platform = platform;
    this.theme = this.initializeTheme();
  }

  public getPlatform(): Platform {
    return this.platform;
  }

  public getTheme(): Record<string, unknown> {
    return { ...this.theme };
  }

  public abstract createButton(props: IButtonProps): IButton;
  public abstract createInput(props: IInputProps): IInput;
  public abstract createCheckbox(props: ICheckboxProps): ICheckbox;
  public abstract getAccessibilityFeatures(): string[];

  /**
   * Initialize platform-specific theme
   * Override in concrete factories for custom themes
   */
  protected initializeTheme(): Record<string, unknown> {
    return {
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      dangerColor: '#dc3545',
      fontSize: {
        small: '12px',
        medium: '14px',
        large: '16px',
      },
      spacing: {
        small: '4px',
        medium: '8px',
        large: '16px',
      },
    };
  }
}
