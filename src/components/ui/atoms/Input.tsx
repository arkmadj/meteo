/**
 * Input Atom Component
 * A versatile input component following atomic design principles
 */

import { XMarkIcon } from '@heroicons/react/24/outline';
import React, { forwardRef, useState } from 'react';

import { BORDER_RADIUS, COLORS, COMPONENT_TOKENS, TYPOGRAPHY } from '../../../design-system/tokens';
import type { BaseComponentProps, ComponentSize } from '../base/BaseComponent';
import { componentUtils, IconWrapper, useComponentState } from '../base/BaseComponent';

// ============================================================================
// INPUT SPECIFIC TYPES
// ============================================================================

export type InputVariant = 'default' | 'filled' | 'outlined' | 'underlined';
export type InputSize = ComponentSize;
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

// ============================================================================
// INPUT COMPONENT
// ============================================================================

export interface InputProps
  extends
    Omit<BaseComponentProps, 'variant'>,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input variant */
  variant?: InputVariant;
  /** Input size */
  size?: InputSize;
  /** Input type */
  type?: InputType;
  /** Placeholder text */
  placeholder?: string;
  /** Input value */
  value?: string;
  /** Default value */
  defaultValue?: string;
  /** Whether the input has an error */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Helper text */
  helperText?: string;
  /** Label text */
  label?: string;
  /** Whether the label should be hidden visually */
  hiddenLabel?: boolean;
  /** Left icon */
  startIcon?: React.ReactNode;
  /** Right icon */
  endIcon?: React.ReactNode;
  /** Clear button icon */
  clearIcon?: React.ReactNode;
  /** Whether to show clear button */
  clearable?: boolean;
  /** Maximum length */
  maxLength?: number;
  /** Minimum length */
  minLength?: number;
  /** Pattern for validation */
  pattern?: string;
  /** Whether input is required */
  required?: boolean;
  /** Whether input is read-only */
  readOnly?: boolean;
  /** Auto complete */
  autoComplete?: string;
  /** Input mode for mobile */
  inputMode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      size = 'md',
      type = 'text',
      placeholder,
      value,
      defaultValue,
      error = false,
      errorMessage,
      helperText,
      label,
      hiddenLabel = false,
      startIcon,
      endIcon,
      clearIcon,
      clearable = false,
      maxLength,
      minLength,
      pattern,
      required,
      readOnly,
      autoComplete,
      inputMode,
      disabled,
      className,
      testId,
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const { isDisabled } = useComponentState({
      disabled,
      testId,
    });

    const [internalValue, setInternalValue] = useState(defaultValue || '');

    const currentValue = value !== undefined ? value : internalValue;
    const hasValue = currentValue.length > 0;
    const showClearButton = clearable && hasValue && !isDisabled && !readOnly;

    // ============================================================================
    // STYLES
    // ============================================================================

    const containerClasses = ['relative', 'w-full'].join(' ');

    const inputWrapperClasses = [
      'relative',
      'flex',
      'items-center',
      'transition-all',
      'duration-200',
    ].join(' ');

    const baseInputClasses = [
      'w-full',
      'border',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'read-only:bg-gray-50',
      'read-only:cursor-not-allowed',
      'placeholder:text-gray-400',
      'bg-transparent',
    ].join(' ');

    const variantClasses: Record<InputVariant, string> = {
      default: [
        `border-[${COLORS.neutral[300]}]`,
        'bg-white',
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

      underlined: [
        'border-0',
        'border-b-2',
        `border-b-[${COLORS.neutral[300]}]`,
        'bg-transparent',
        'rounded-none',
        `focus:border-b-[${COLORS.primary[500]}]`,
        'focus:ring-0',
        'focus:ring-offset-0',
        `hover:border-b-[${COLORS.neutral[400]}]`,
        'px-0',
      ].join(' '),
    };

    const sizeClasses: Record<InputSize, string> = {
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(e);
    };

    const handleClear = () => {
      const fakeEvent = {
        target: { value: '' },
        currentTarget: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;

      if (value === undefined) {
        setInternalValue('');
      }
      onChange?.(fakeEvent);
    };

    // ============================================================================
    // RENDER
    // ============================================================================

    const propsForClasses: BaseComponentProps = {
      size,
      disabled: isDisabled,
      className,
    };

    const coreInputClasses = componentUtils.generateClasses(
      baseInputClasses,
      propsForClasses,
      undefined,
      sizeClasses
    );

    const inputClasses = [coreInputClasses, variantClasses?.[variant], error ? errorClasses : '']
      .filter(Boolean)
      .join(' ');

    const inputId = testId || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={containerClasses}>
        {/* Label */}
        {label && (
          <label
            className={`block text-sm font-medium mb-2 ${
              hiddenLabel ? 'sr-only' : `text-[${COLORS.neutral[700]}]`
            }`}
            htmlFor={inputId}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Wrapper */}
        <div className={inputWrapperClasses}>
          {/* Start Icon */}
          {startIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none z-10">
              <IconWrapper className={`text-[${COLORS.neutral[400]}]`} size={size}>
                {startIcon}
              </IconWrapper>
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            aria-describedby={
              error && errorMessage
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            aria-invalid={error}
            autoComplete={autoComplete}
            className={`${inputClasses} ${startIcon ? 'pl-10' : ''} ${showClearButton || endIcon ? 'pr-10' : ''}`}
            data-testid={testId}
            disabled={isDisabled}
            id={inputId}
            inputMode={inputMode}
            maxLength={maxLength}
            minLength={minLength}
            pattern={pattern}
            placeholder={placeholder}
            readOnly={readOnly}
            required={required}
            type={type}
            value={currentValue}
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            {...props}
          />

          {/* End Icon or Clear Button */}
          {(endIcon || showClearButton) && (
            <div className="absolute right-3 flex items-center z-10">
              {showClearButton ? (
                <button
                  aria-label="Clear input"
                  className={`p-1 rounded-full hover:bg-[${COLORS.neutral[200]}] transition-colors duration-200`}
                  type="button"
                  onClick={handleClear}
                >
                  <IconWrapper className={`text-[${COLORS.neutral[400]}]`} size="sm">
                    {clearIcon || <XMarkIcon className="h-4 w-4" />}
                  </IconWrapper>
                </button>
              ) : endIcon ? (
                <IconWrapper className={`text-[${COLORS.neutral[400]}]`} size={size}>
                  {endIcon}
                </IconWrapper>
              ) : null}
            </div>
          )}
        </div>

        {/* Helper/Error Text */}
        {(helperText || (error && errorMessage)) && (
          <div className="mt-2">
            {error && errorMessage ? (
              <p
                className={`text-sm text-[${COLORS.semantic.error[600]}]`}
                id={`${inputId}-error`}
                role="alert"
              >
                {errorMessage}
              </p>
            ) : helperText ? (
              <p className={`text-sm text-[${COLORS.neutral[500]}]`} id={`${inputId}-helper`}>
                {helperText}
              </p>
            ) : null}
          </div>
        )}

        {/* Character Count */}
        {maxLength && (
          <div className="mt-1 text-right">
            <span className={`text-xs text-[${COLORS.neutral[400]}]`}>
              {currentValue.length}/{maxLength}
            </span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
