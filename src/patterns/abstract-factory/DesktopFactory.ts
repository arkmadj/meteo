/**
 * Abstract Factory Pattern - Desktop Factory
 * 
 * Concrete factory for creating Desktop platform UI components.
 */

import { BaseUIFactory } from './UIFactory';
import type { IButton, IButtonProps, ICheckbox, ICheckboxProps, IInput, IInputProps } from './UIComponent';
import { DesktopButton, DesktopCheckbox, DesktopInput } from './DesktopComponents';

// ============================================================================
// DESKTOP FACTORY
// ============================================================================

/**
 * Concrete factory for creating Desktop platform components
 * 
 * Creates components optimized for desktop applications with:
 * - Full keyboard navigation support
 * - Keyboard shortcuts
 * - Context menus
 * - Hover states
 * - Native desktop UI patterns
 * - Multi-window support
 */
export class DesktopFactory extends BaseUIFactory {
  constructor() {
    super('desktop');
  }

  public createButton(props: IButtonProps): IButton {
    return new DesktopButton(props);
  }

  public createInput(props: IInputProps): IInput {
    return new DesktopInput(props);
  }

  public createCheckbox(props: ICheckboxProps): ICheckbox {
    return new DesktopCheckbox(props);
  }

  public getAccessibilityFeatures(): string[] {
    return [
      'Full keyboard navigation',
      'Keyboard shortcuts',
      'Tab order management',
      'Focus indicators',
      'Screen reader support',
      'High contrast themes',
      'Zoom support',
      'Context menus',
      'Tooltips',
    ];
  }

  protected initializeTheme(): Record<string, any> {
    return {
      ...super.initializeTheme(),
      platform: 'desktop',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: {
        small: '12px',
        medium: '14px',
        large: '16px',
      },
      spacing: {
        small: '4px',
        medium: '8px',
        large: '12px',
      },
      borderRadius: {
        small: '3px',
        medium: '5px',
        large: '7px',
      },
      shadows: {
        small: '0 1px 3px rgba(0, 0, 0, 0.12)',
        medium: '0 2px 6px rgba(0, 0, 0, 0.16)',
        large: '0 4px 12px rgba(0, 0, 0, 0.2)',
      },
      transitions: {
        fast: '100ms ease-in-out',
        medium: '200ms ease-in-out',
        slow: '300ms ease-in-out',
      },
      keyboardShortcuts: {
        save: 'Ctrl+S',
        copy: 'Ctrl+C',
        paste: 'Ctrl+V',
        undo: 'Ctrl+Z',
        redo: 'Ctrl+Y',
        find: 'Ctrl+F',
      },
    };
  }
}

