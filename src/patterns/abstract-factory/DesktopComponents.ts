/**
 * Abstract Factory Pattern - Desktop Platform Components
 *
 * Concrete implementations of UI components for the Desktop platform.
 * Optimized for mouse/keyboard interactions and larger screens.
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
// DESKTOP BUTTON COMPONENT
// ============================================================================

export class DesktopButton implements IButton {
  private label: string;
  private variant: 'primary' | 'secondary' | 'danger';
  private size: 'small' | 'medium' | 'large';
  private disabled: boolean;
  private onClick?: () => void;

  constructor(props: IButtonProps) {
    this.label = props.label;
    this.variant = props.variant || 'primary';
    this.size = props.size || 'medium';
    this.disabled = props.disabled || false;
    this.onClick = props.onClick;
  }

  public render(): string {
    const classes = this.getClasses();
    const attrs = this.getAttributesString();
    return `<button class="${classes}" ${attrs}>${this.label}</button>`;
  }

  public getType(): string {
    return 'desktop-button';
  }

  public getAttributes(): Record<string, unknown> {
    return {
      type: 'button',
      disabled: this.disabled,
      'data-variant': this.variant,
      'data-size': this.size,
      'aria-label': this.label,
      tabindex: this.disabled ? -1 : 0,
      'data-keyboard-shortcut': this.getKeyboardShortcut(),
    };
  }

  public handleInteraction(event: string): void {
    if (
      (event === 'click' || event === 'enter' || event === 'space') &&
      !this.disabled &&
      this.onClick
    ) {
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
      'desktop-button',
      `desktop-button--${this.variant}`,
      `desktop-button--${this.size}`,
      'desktop-button--keyboard-accessible',
    ];
    if (this.disabled) {
      classes.push('desktop-button--disabled');
    }
    return classes.join(' ');
  }

  private getKeyboardShortcut(): string {
    // Desktop buttons can have keyboard shortcuts
    if (this.variant === 'primary') {
      return 'Ctrl+Enter';
    }
    return '';
  }

  private getAttributesString(): string {
    const attrs = this.getAttributes();
    return Object.entries(attrs)
      .filter(([, value]) => value !== '' && value !== undefined)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
  }
}

// ============================================================================
// DESKTOP INPUT COMPONENT
// ============================================================================

export class DesktopInput implements IInput {
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
    return `<input ${attrs} />`;
  }

  public getType(): string {
    return 'desktop-input';
  }

  public getAttributes(): Record<string, unknown> {
    return {
      type: this.type,
      placeholder: this.placeholder,
      value: this.value,
      disabled: this.disabled,
      class: 'desktop-input desktop-input--keyboard-accessible',
      'aria-label': this.placeholder || 'Input field',
      tabindex: this.disabled ? -1 : 0,
      autocomplete: this.getAutocomplete(),
      spellcheck: this.type === 'text' ? 'true' : 'false',
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

  private getAutocomplete(): string {
    const autocompleteMap: Record<string, string> = {
      email: 'email',
      password: 'current-password',
      text: 'on',
      number: 'off',
    };
    return autocompleteMap[this.type] || 'off';
  }

  private getAttributesString(): string {
    const attrs = this.getAttributes();
    return Object.entries(attrs)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
  }
}

// ============================================================================
// DESKTOP CHECKBOX COMPONENT
// ============================================================================

export class DesktopCheckbox implements ICheckbox {
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
    return `<label class="desktop-checkbox"><input type="checkbox" ${attrs} /><span class="desktop-checkbox__label">${this.label}</span></label>`;
  }

  public getType(): string {
    return 'desktop-checkbox';
  }

  public getAttributes(): Record<string, unknown> {
    return {
      type: 'checkbox',
      checked: this.checked,
      disabled: this.disabled,
      'aria-label': this.label,
      'aria-checked': this.checked,
      tabindex: this.disabled ? -1 : 0,
      'data-keyboard-accessible': 'true',
    };
  }

  public handleInteraction(event: string): void {
    if ((event === 'change' || event === 'space') && !this.disabled) {
      this.checked = !this.checked;
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

  private getAttributesString(): string {
    const attrs = this.getAttributes();
    return Object.entries(attrs)
      .filter(([key]) => key !== 'aria-checked') // aria-checked is for the label
      .map(([key, value]) => {
        if (typeof value === 'boolean') {
          return value ? key : '';
        }
        return `${key}="${value}"`;
      })
      .filter(Boolean)
      .join(' ');
  }
}
