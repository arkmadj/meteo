/**
 * Abstract Factory Pattern - UI Component Interfaces
 *
 * Defines the abstract interfaces for UI components that can be created
 * by different platform-specific factories.
 */

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Base interface for all UI components
 */
export interface IUIComponent {
  /**
   * Render the component to a string representation
   */
  render(): string;

  /**
   * Get the component type
   */
  getType(): string;

  /**
   * Get platform-specific attributes
   */
  getAttributes(): Record<string, any>;

  /**
   * Handle component interaction
   */
  handleInteraction(event: string): void;
}

// ============================================================================
// BUTTON INTERFACE
// ============================================================================

export interface IButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
}

export interface IButton extends IUIComponent {
  /**
   * Get button label
   */
  getLabel(): string;

  /**
   * Set button label
   */
  setLabel(label: string): void;

  /**
   * Check if button is disabled
   */
  isDisabled(): boolean;

  /**
   * Enable or disable the button
   */
  setDisabled(disabled: boolean): void;
}

// ============================================================================
// INPUT INTERFACE
// ============================================================================

export interface IInputProps {
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  value?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

export interface IInput extends IUIComponent {
  /**
   * Get input value
   */
  getValue(): string;

  /**
   * Set input value
   */
  setValue(value: string): void;

  /**
   * Get input placeholder
   */
  getPlaceholder(): string;

  /**
   * Check if input is disabled
   */
  isDisabled(): boolean;

  /**
   * Enable or disable the input
   */
  setDisabled(disabled: boolean): void;
}

// ============================================================================
// CHECKBOX INTERFACE
// ============================================================================

export interface ICheckboxProps {
  label: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

export interface ICheckbox extends IUIComponent {
  /**
   * Get checkbox label
   */
  getLabel(): string;

  /**
   * Check if checkbox is checked
   */
  isChecked(): boolean;

  /**
   * Set checkbox checked state
   */
  setChecked(checked: boolean): void;

  /**
   * Check if checkbox is disabled
   */
  isDisabled(): boolean;

  /**
   * Enable or disable the checkbox
   */
  setDisabled(disabled: boolean): void;
}
