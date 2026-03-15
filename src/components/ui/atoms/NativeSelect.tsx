/**
 * NativeSelect Atom Component
 * A lightweight select component using native browser select element
 * Perfect for simple use cases where custom dropdown isn't needed
 */

import React, { forwardRef } from 'react';

import { COLORS, COMPONENT_TOKENS, BORDER_RADIUS, TYPOGRAPHY } from '../../../design-system/tokens';
import type { BaseComponentProps, ComponentSize } from '../base/BaseComponent';
import { componentUtils, useComponentState, IconWrapper } from '../base/BaseComponent';

// ============================================================================
// NATIVE SELECT SPECIFIC TYPES
// ============================================================================

export type NativeSelectVariant = 'default' | 'filled' | 'outlined';
export type NativeSelectSize = ComponentSize;

export interface NativeSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// ============================================================================
// NATIVE SELECT COMPONENT
// ============================================================================

export interface NativeSelectProps
  extends Omit<BaseComponentProps, 'variant'>,
    Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Select variant */
  variant?: NativeSelectVariant;
  /** Select size */
  size?: NativeSelectSize;
  /** Options array */
  options: NativeSelectOption[];
  /** Placeholder text */
  placeholder?: string;
  /** Label text */
  label?: string;
  /** Whether the label should be hidden visually */
  hiddenLabel?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Whether the select has an error */
  error?: boolean;
  /** Helper text */
  helperText?: string;
  /** Custom dropdown icon */
  dropdownIcon?: React.ReactNode;
  /** Controlled value */
  value?: string;
  /** Default value */
  defaultValue?: string;
  /** Change handler */
  onValueChange?: (value: string) => void;
}

const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  (
    {
      variant = 'default',
      size = 'md',
      options,
      placeholder = 'Select an option...',
      label,
      hiddenLabel = false,
      errorMessage,
      error = false,
      helperText,
      dropdownIcon,
      value,
      defaultValue,
      disabled,
      className,
      testId,
      onChange,
      onValueChange,
      ...props
    },
    ref
  ) => {
    const { isDisabled } = useComponentState({
      disabled,
      testId,
    });

    // ============================================================================
    // STYLES
    // ============================================================================

    const containerClasses = ['relative', 'w-full'].join(' ');

    const selectWrapperClasses = ['relative', 'flex', 'items-center'].join(' ');

    const baseSelectClasses = [
      'w-full',
      'appearance-none',
      'border',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'bg-white',
      'pr-10',
      'cursor-pointer',
    ].join(' ');

    const variantClasses: Record<NativeSelectVariant, string> = {
      default: [
        `border-[${COLORS.neutral[300]}]`,
        `focus:border-[${COLORS.primary[500]}]`,
        `focus:ring-[${COLORS.primary[500]}]`,
        `hover:border-[${COLORS.neutral[400]}]`,
      ].join(' '),

      filled: [
        'border-transparent',
        `bg-[${COLORS.neutral[100]}]`,
        'focus:bg-white',
        `focus:border-[${COLORS.primary[500]}]`,
        `focus:ring-[${COLORS.primary[500]}]`,
        `hover:bg-[${COLORS.neutral[200]}]`,
      ].join(' '),

      outlined: [
        `border-[${COLORS.neutral[300]}]`,
        'bg-transparent',
        `focus:border-[${COLORS.primary[500]}]`,
        `focus:ring-[${COLORS.primary[500]}]`,
        `hover:border-[${COLORS.neutral[400]}]`,
      ].join(' '),
    };

    const sizeClasses: Record<NativeSelectSize, string> = {
      xs: [
        `px-[${COMPONENT_TOKENS.input.padding.xs}]`,
        `py-[${COMPONENT_TOKENS.input.height.xs}]`,
        `text-[${COMPONENT_TOKENS.input.fontSize.xs}]`,
        `rounded-[${BORDER_RADIUS.sm}]`,
      ].join(' '),

      sm: [
        `px-[${COMPONENT_TOKENS.input.padding.sm}]`,
        `py-[${COMPONENT_TOKENS.input.height.sm}]`,
        `text-[${COMPONENT_TOKENS.input.fontSize.sm}]`,
        `rounded-[${BORDER_RADIUS.md}]`,
      ].join(' '),

      md: [
        `px-[${COMPONENT_TOKENS.input.padding.md}]`,
        `py-[${COMPONENT_TOKENS.input.height.md}]`,
        `text-[${COMPONENT_TOKENS.input.fontSize.md}]`,
        `rounded-[${BORDER_RADIUS.lg}]`,
      ].join(' '),

      lg: [
        `px-[${COMPONENT_TOKENS.input.padding.lg}]`,
        `py-[${COMPONENT_TOKENS.input.height.lg}]`,
        `text-[${COMPONENT_TOKENS.input.fontSize.lg}]`,
        `rounded-[${BORDER_RADIUS.lg}]`,
      ].join(' '),

      xl: [
        'px-6',
        'py-4',
        `text-[${TYPOGRAPHY.fontSize.lg[0]}]`,
        `rounded-[${BORDER_RADIUS.xl}]`,
      ].join(' '),
    };

    const errorClasses = error
      ? [
          `border-[${COLORS.semantic.error[500]}]`,
          `focus:border-[${COLORS.semantic.error[500]}]`,
          `focus:ring-[${COLORS.semantic.error[500]}]`,
        ].join(' ')
      : '';

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = e.target.value;
      onValueChange?.(newValue);
      onChange?.(e);
    };

    // ============================================================================
    // RENDER
    // ============================================================================

    const propsForClasses: BaseComponentProps = {
      size,
      disabled: isDisabled,
      className,
    };

    const coreSelectClasses = componentUtils.generateClasses(
      baseSelectClasses,
      propsForClasses,
      undefined,
      sizeClasses
    );

    const selectClasses = [coreSelectClasses, variantClasses?.[variant], error ? errorClasses : '']
      .filter(Boolean)
      .join(' ');

    const selectId = testId || `native-select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={containerClasses}>
        {/* Label */}
        {label && (
          <label
            className={`block text-sm font-medium mb-2 ${
              hiddenLabel ? 'sr-only' : `text-[${COLORS.neutral[700]}]`
            }`}
            htmlFor={selectId}
          >
            {label}
          </label>
        )}

        {/* Select Wrapper */}
        <div className={selectWrapperClasses}>
          {/* Native Select */}
          <select
            ref={ref}
            aria-describedby={
              error && errorMessage
                ? `${selectId}-error`
                : helperText
                  ? `${selectId}-helper`
                  : undefined
            }
            aria-invalid={error}
            className={selectClasses}
            data-testid={testId}
            defaultValue={defaultValue}
            disabled={isDisabled}
            id={selectId}
            value={value}
            onChange={handleSelectChange}
            {...props}
          >
            {placeholder && (
              <option disabled value="">
                {placeholder}
              </option>
            )}
            {options.map(option => (
              <option key={option.value} disabled={option.disabled} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom Dropdown Icon */}
          <div className="absolute right-3 flex items-center pointer-events-none">
            <IconWrapper className={`text-[${COLORS.neutral[400]}]`} size="sm">
              {dropdownIcon || (
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              )}
            </IconWrapper>
          </div>
        </div>

        {/* Helper/Error Text */}
        {(helperText || (error && errorMessage)) && (
          <div className="mt-2">
            {error && errorMessage ? (
              <p
                className={`text-sm text-[${COLORS.semantic.error[600]}]`}
                id={`${selectId}-error`}
                role="alert"
              >
                {errorMessage}
              </p>
            ) : helperText ? (
              <p className={`text-sm text-[${COLORS.neutral[500]}]`} id={`${selectId}-helper`}>
                {helperText}
              </p>
            ) : null}
          </div>
        )}
      </div>
    );
  }
);

NativeSelect.displayName = 'NativeSelect';

export default NativeSelect;
