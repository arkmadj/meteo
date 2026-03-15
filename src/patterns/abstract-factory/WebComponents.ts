/**
 * Abstract Factory Pattern - Web Platform Components
 *
 * Concrete implementations of UI components for the Web platform.
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
// WEB BUTTON COMPONENT
// ============================================================================

export class WebButton implements IButton {
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
    return 'web-button';
  }

  public getAttributes(): Record<string, any> {
    return {
      type: 'button',
      disabled: this.disabled,
      'data-variant': this.variant,
      'data-size': this.size,
      'aria-label': this.label,
    };
  }

  public handleInteraction(event: string): void {
    if (event === 'click' && !this.disabled && this.onClick) {
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
    const classes = ['web-button', `web-button--${this.variant}`, `web-button--${this.size}`];
    if (this.disabled) {
      classes.push('web-button--disabled');
    }
    return classes.join(' ');
  }

  private getAttributesString(): string {
    const attrs = this.getAttributes();
    return Object.entries(attrs)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
  }
}

// ============================================================================
// WEB INPUT COMPONENT
// ============================================================================

export class WebInput implements IInput {
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
    return 'web-input';
  }

  public getAttributes(): Record<string, any> {
    return {
      type: this.type,
      placeholder: this.placeholder,
      value: this.value,
      disabled: this.disabled,
      class: 'web-input',
      'aria-label': this.placeholder || 'Input field',
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

  private getAttributesString(): string {
    const attrs = this.getAttributes();
    return Object.entries(attrs)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
  }
}

// ============================================================================
// WEB CHECKBOX COMPONENT
// ============================================================================

export class WebCheckbox implements ICheckbox {
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
    return `<label class="web-checkbox"><input type="checkbox" ${attrs} /><span>${this.label}</span></label>`;
  }

  public getType(): string {
    return 'web-checkbox';
  }

  public getAttributes(): Record<string, any> {
    return {
      type: 'checkbox',
      checked: this.checked,
      disabled: this.disabled,
      'aria-label': this.label,
      'aria-checked': this.checked,
    };
  }

  public handleInteraction(event: string): void {
    if (event === 'change' && !this.disabled) {
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
