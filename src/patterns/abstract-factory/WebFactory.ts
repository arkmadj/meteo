/**
 * Abstract Factory Pattern - Web Factory
 *
 * Concrete factory for creating Web platform UI components.
 */

import { BaseUIFactory } from './UIFactory';
import type {
  IButton,
  IButtonProps,
  ICheckbox,
  ICheckboxProps,
  IInput,
  IInputProps,
} from './UIComponent';
import { WebButton, WebCheckbox, WebInput } from './WebComponents';

// ============================================================================
// WEB FACTORY
// ============================================================================

/**
 * Concrete factory for creating Web platform components
 *
 * Creates components optimized for web browsers with:
 * - Standard HTML elements
 * - CSS classes for styling
 * - ARIA attributes for accessibility
 * - Event handlers for interactivity
 */
export class WebFactory extends BaseUIFactory {
  constructor() {
    super('web');
  }

  public createButton(props: IButtonProps): IButton {
    return new WebButton(props);
  }

  public createInput(props: IInputProps): IInput {
    return new WebInput(props);
  }

  public createCheckbox(props: ICheckboxProps): ICheckbox {
    return new WebCheckbox(props);
  }

  public getAccessibilityFeatures(): string[] {
    return [
      'ARIA labels',
      'Keyboard navigation',
      'Focus management',
      'Screen reader support',
      'Semantic HTML',
      'WCAG 2.1 AA compliance',
    ];
  }

  protected initializeTheme(): Record<string, unknown> {
    return {
      ...super.initializeTheme(),
      platform: 'web',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      borderRadius: {
        small: '4px',
        medium: '6px',
        large: '8px',
      },
      shadows: {
        small: '0 1px 2px rgba(0, 0, 0, 0.05)',
        medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
        large: '0 10px 15px rgba(0, 0, 0, 0.1)',
      },
      transitions: {
        fast: '150ms ease-in-out',
        medium: '300ms ease-in-out',
        slow: '500ms ease-in-out',
      },
    };
  }
}
