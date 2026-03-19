/**
 * Abstract Factory Pattern - Mobile Factory
 *
 * Concrete factory for creating Mobile platform UI components.
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
import { MobileButton, MobileCheckbox, MobileInput } from './MobileComponents';

// ============================================================================
// MOBILE FACTORY
// ============================================================================

/**
 * Concrete factory for creating Mobile platform components
 *
 * Creates components optimized for mobile devices with:
 * - Touch-optimized targets (minimum 44x44 points)
 * - Haptic feedback support
 * - Mobile-specific keyboard types
 * - Gesture recognition
 * - Native mobile UI patterns
 */
export class MobileFactory extends BaseUIFactory {
  constructor() {
    super('mobile');
  }

  public createButton(props: IButtonProps): IButton {
    return new MobileButton(props);
  }

  public createInput(props: IInputProps): IInput {
    return new MobileInput(props);
  }

  public createCheckbox(props: ICheckboxProps): ICheckbox {
    return new MobileCheckbox(props);
  }

  public getAccessibilityFeatures(): string[] {
    return [
      'Touch target optimization (44x44 minimum)',
      'Haptic feedback',
      'VoiceOver/TalkBack support',
      'Dynamic type support',
      'High contrast mode',
      'Reduced motion support',
      'Screen reader gestures',
    ];
  }

  protected initializeTheme(): Record<string, unknown> {
    return {
      ...super.initializeTheme(),
      platform: 'mobile',
      fontFamily: 'System',
      fontSize: {
        small: '14px',
        medium: '16px',
        large: '18px',
      },
      spacing: {
        small: '8px',
        medium: '16px',
        large: '24px',
      },
      touchTarget: {
        minimum: '44px',
        recommended: '48px',
      },
      borderRadius: {
        small: '8px',
        medium: '12px',
        large: '16px',
      },
      shadows: {
        small: '0 2px 4px rgba(0, 0, 0, 0.1)',
        medium: '0 4px 8px rgba(0, 0, 0, 0.15)',
        large: '0 8px 16px rgba(0, 0, 0, 0.2)',
      },
      haptics: {
        light: 'UIImpactFeedbackStyleLight',
        medium: 'UIImpactFeedbackStyleMedium',
        heavy: 'UIImpactFeedbackStyleHeavy',
        selection: 'UISelectionFeedbackGenerator',
      },
    };
  }
}
