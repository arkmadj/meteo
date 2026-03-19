/**
 * Abstract Factory Pattern - Mobile Platform Components
 *
 * Concrete implementations of UI components for the Mobile platform.
 * Optimized for touch interactions and smaller screens.
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
// MOBILE BUTTON COMPONENT
// ============================================================================

export class MobileButton implements IButton {
  private label: string;
  private variant: 'primary' | 'secondary' | 'danger';
  private size: 'small' | 'medium' | 'large';
  private disabled: boolean;
  private onClick?: () => void;

  constructor(props: IButtonProps) {
    this.label = props.label;
    this.variant = props.variant || 'primary';
    this.size = props.size || 'large'; // Default to large for touch targets
    this.disabled = props.disabled || false;
    this.onClick = props.onClick;
  }

  public render(): string {
    const classes = this.getClasses();
    const attrs = this.getAttributesString();
    return `<TouchableOpacity class="${classes}" ${attrs}><Text>${this.label}</Text></TouchableOpacity>`;
  }

  public getType(): string {
    return 'mobile-button';
  }

  public getAttributes(): Record<string, unknown> {
    return {
      disabled: this.disabled,
      'data-variant': this.variant,
      'data-size': this.size,
      'data-touch-target': 'button',
      'aria-label': this.label,
      'data-haptic-feedback': 'light',
    };
  }

  public handleInteraction(event: string): void {
    if (event === 'press' && !this.disabled && this.onClick) {
      // Trigger haptic feedback on mobile
      this.triggerHapticFeedback();
      this.onClick();
    }
  }

  public getLabel(): string {
    return this.label;
  }

  public setLabel(label: string): void {
    this.label = label;
  }

  public isDisabled(): boolean {
    return this.disabled;
  }

  public setDisabled(disabled: boolean): void {
    this.disabled = disabled;
  }

  private getClasses(): string {
    const classes = [
      'mobile-button',
      `mobile-button--${this.variant}`,
      `mobile-button--${this.size}`,
      'mobile-button--touch-optimized',
    ];
    if (this.disabled) {
      classes.push('mobile-button--disabled');
    }
    return classes.join(' ');
  }

  private getAttributesString(): string {
    const attrs = this.getAttributes();
    return Object.entries(attrs)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
  }

  private triggerHapticFeedback(): void {
    // Simulate haptic feedback trigger
    console.log('[Mobile] Haptic feedback triggered');
  }
}

// ============================================================================
// MOBILE INPUT COMPONENT
// ============================================================================

export class MobileInput implements IInput {
  private placeholder: string;
  private type: 'text' | 'email' | 'password' | 'number';
  private value: string;
  private disabled: boolean;
  private onChange?: (value: string) => void;

  constructor(props: IInputProps) {
    this.placeholder = props.placeholder || '';
    this.type = props.type || 'text';
    this.value = props.value || '';
    this.disabled = props.disabled || false;
    this.onChange = props.onChange;
  }

  public render(): string {
    const attrs = this.getAttributesString();
    return `<TextInput ${attrs} />`;
  }

  public getType(): string {
    return 'mobile-input';
  }

  public getAttributes(): Record<string, unknown> {
    return {
      type: this.type,
      placeholder: this.placeholder,
      value: this.value,
      disabled: this.disabled,
      class: 'mobile-input mobile-input--touch-optimized',
      'aria-label': this.placeholder || 'Input field',
      'data-keyboard-type': this.getKeyboardType(),
      'data-autocorrect': this.type === 'text' ? 'on' : 'off',
    };
  }

  public handleInteraction(event: string): void {
    if (event.startsWith('change:') && !this.disabled && this.onChange) {
      const newValue = event.split(':')[1];
      this.value = newValue;
      this.onChange(newValue);
    }
  }

  public getValue(): string {
    return this.value;
  }

  public setValue(value: string): void {
    this.value = value;
  }

  public getPlaceholder(): string {
    return this.placeholder;
  }

  public isDisabled(): boolean {
    return this.disabled;
  }

  public setDisabled(disabled: boolean): void {
    this.disabled = disabled;
  }

  private getKeyboardType(): string {
    const keyboardMap: Record<string, string> = {
      email: 'email-address',
      number: 'numeric',
      password: 'default',
      text: 'default',
    };
    return keyboardMap[this.type] || 'default';
  }

  private getAttributesString(): string {
    const attrs = this.getAttributes();
    return Object.entries(attrs)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
  }
}

// ============================================================================
// MOBILE CHECKBOX COMPONENT
// ============================================================================

export class MobileCheckbox implements ICheckbox {
  private label: string;
  private checked: boolean;
  private disabled: boolean;
  private onChange?: (checked: boolean) => void;

  constructor(props: ICheckboxProps) {
    this.label = props.label;
    this.checked = props.checked || false;
    this.disabled = props.disabled || false;
    this.onChange = props.onChange;
  }

  public render(): string {
    const attrs = this.getAttributesString();
    const icon = this.checked ? '☑' : '☐';
    return `<TouchableOpacity class="mobile-checkbox" ${attrs}><Text class="mobile-checkbox__icon">${icon}</Text><Text class="mobile-checkbox__label">${this.label}</Text></TouchableOpacity>`;
  }

  public getType(): string {
    return 'mobile-checkbox';
  }

  public getAttributes(): Record<string, unknown> {
    return {
      disabled: this.disabled,
      'data-checked': this.checked,
      'data-touch-target': 'checkbox',
      'aria-label': this.label,
      'aria-checked': this.checked,
      'data-haptic-feedback': 'selection',
    };
  }

  public handleInteraction(event: string): void {
    if (event === 'press' && !this.disabled) {
      this.checked = !this.checked;
      this.triggerHapticFeedback();
      if (this.onChange) {
        this.onChange(this.checked);
      }
    }
  }

  public getLabel(): string {
    return this.label;
  }

  public isChecked(): boolean {
    return this.checked;
  }

  public setChecked(checked: boolean): void {
    this.checked = checked;
  }

  public isDisabled(): boolean {
    return this.disabled;
  }

  public setDisabled(disabled: boolean): void {
    this.disabled = disabled;
  }

  private triggerHapticFeedback(): void {
    // Simulate haptic feedback trigger
    console.log('[Mobile] Haptic feedback triggered (selection)');
  }

  private getAttributesString(): string {
    const attrs = this.getAttributes();
    return Object.entries(attrs)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
  }
}
