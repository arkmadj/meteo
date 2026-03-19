/**
 * Checkbox Atom Component
 * A versatile checkbox component following atomic design principles
 */

import React, { forwardRef, useState } from 'react';

import { useTheme } from '../../../design-system/theme';
import { COLORS } from '../../../design-system/tokens';
import type { BaseComponentProps, ComponentSize } from '../base/BaseComponent';
import { IconWrapper, useComponentState } from '../base/BaseComponent';

// ============================================================================
// CHECKBOX SPECIFIC TYPES
// ============================================================================

export type CheckboxSize = ComponentSize;

// ============================================================================
// CHECKBOX COMPONENT
// ============================================================================

export interface CheckboxProps
  extends BaseComponentProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Checkbox size */
  size?: CheckboxSize;
  /** Checkbox label */
  label?: string | React.ReactNode;
  /** Whether the label should be hidden visually */
  hiddenLabel?: boolean;
  /** Description text */
  description?: string;
  /** Error message */
  errorMessage?: string;
  /** Whether the checkbox has an error */
  error?: boolean;
  /** Custom checked icon */
  checkedIcon?: React.ReactNode;
  /** Custom unchecked icon */
  uncheckedIcon?: React.ReactNode;
  /** Indeterminate state */
  indeterminate?: boolean;
  /** Controlled checked state */
  checked?: boolean;
  /** Default checked state */
  defaultChecked?: boolean;
  /** Change handler */
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      size = 'md',
      label,
      hiddenLabel = false,
      description,
      errorMessage,
      error = false,
      checkedIcon,
      uncheckedIcon,
      indeterminate = false,
      checked,
      defaultChecked = false,
      disabled,
      className,
      testId,
      onChange,
      onCheckedChange,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const { isDisabled } = useComponentState({
      disabled,
      testId,
    });

    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isControlled = checked !== undefined;
    const currentChecked = isControlled ? checked : internalChecked;

    // ============================================================================
    // STYLES
    // ============================================================================

    const containerClasses = [
      'inline-flex',
      'items-start',
      'gap-3',
      'cursor-pointer',
      'select-none',
    ].join(' ');

    const checkboxWrapperClasses = [
      'relative',
      'flex',
      'items-center',
      'justify-center',
      'border-2',
      'transition-all',
      'duration-200',
      'rounded',
      'focus-within:ring-2',
      theme.isDark
        ? 'focus-within:ring-offset-[var(--theme-surface,#1f2937)]'
        : 'focus-within:ring-offset-[var(--theme-surface,#ffffff)]',
    ].join(' ');

    const sizeClasses: Record<CheckboxSize, string> = {
      xs: 'w-4 h-4',
      sm: 'w-5 h-5',
      md: 'w-6 h-6',
      lg: 'w-7 h-7',
      xl: 'w-8 h-8',
    };

    const stateClasses = {
      default: [
        theme.isDark
          ? 'border-[var(--theme-border,#374151)] bg-[var(--theme-surface,#1f2937)]'
          : 'border-[var(--theme-border,#d1d5db)] bg-[var(--theme-surface,#ffffff)]',
        `hover:border-[var(--theme-accent,#3b82f6)]`,
        `focus-within:border-[var(--theme-accent,#3b82f6)]`,
        `focus-within:ring-[var(--theme-accent,#3b82f6)]`,
      ].join(' '),

      checked: [
        `border-[var(--theme-accent,#3b82f6)]`,
        `bg-[var(--theme-accent,#3b82f6)]`,
        `hover:border-[var(--theme-accent-hover,#2563eb)]`,
        `hover:bg-[var(--theme-accent-hover,#2563eb)]`,
        `focus-within:border-[var(--theme-accent-hover,#2563eb)]`,
        `focus-within:bg-[var(--theme-accent-hover,#2563eb)]`,
      ].join(' '),

      error: [
        `border-[${COLORS.semantic.error[500]}]`,
        `focus-within:border-[${COLORS.semantic.error[500]}]`,
        `focus-within:ring-[${COLORS.semantic.error[500]}]`,
      ].join(' '),

      disabled: ['opacity-50', 'cursor-not-allowed'].join(' '),
    };

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;

      if (!isControlled) {
        setInternalChecked(newChecked);
      }

      onCheckedChange?.(newChecked);
      onChange?.(e);
    };

    // ============================================================================
    // RENDER
    // ============================================================================

    const checkboxId = testId || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    // Determine current state
    let currentStateClasses = stateClasses.default;
    if (error) {
      currentStateClasses = stateClasses.error;
    } else if (currentChecked) {
      currentStateClasses = stateClasses.checked;
    }
    if (isDisabled) {
      currentStateClasses += ` ${stateClasses.disabled}`;
    }

    const wrapperClasses = `${checkboxWrapperClasses} ${sizeClasses?.[size]} ${currentStateClasses} ${className || ''}`;

    return (
      <div className={containerClasses}>
        {/* Hidden Input */}
        <input
          ref={ref}
          aria-describedby={
            error && errorMessage
              ? `${checkboxId}-error`
              : description
                ? `${checkboxId}-description`
                : undefined
          }
          aria-invalid={error}
          checked={currentChecked}
          className="sr-only"
          data-testid={testId}
          disabled={isDisabled}
          id={checkboxId}
          type="checkbox"
          onChange={handleChange}
          {...props}
        />

        {/* Visual Checkbox */}
        <div
          aria-checked={indeterminate ? 'mixed' : currentChecked}
          aria-label={typeof label === 'string' ? label : undefined}
          className={wrapperClasses}
          role="checkbox"
          tabIndex={0}
          onClick={() => {
            if (!isDisabled) {
              const fakeEvent = {
                target: { checked: !currentChecked },
              } as React.ChangeEvent<HTMLInputElement>;
              handleChange(fakeEvent);
            }
          }}
          onKeyDown={e => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              const fakeEvent = {
                target: { checked: !currentChecked },
              } as React.ChangeEvent<HTMLInputElement>;
              handleChange(fakeEvent);
            }
          }}
        >
          {/* Icon */}
          {currentChecked && !indeterminate && (
            <IconWrapper className="text-white" size="xs">
              {checkedIcon || (
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </IconWrapper>
          )}

          {indeterminate && (
            <IconWrapper className="text-white" size="xs">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13H5v-2h14v2z" />
              </svg>
            </IconWrapper>
          )}

          {!currentChecked && !indeterminate && uncheckedIcon ? (
            <IconWrapper
              className={
                theme.isDark
                  ? 'text-[var(--theme-text-secondary,#9ca3af)]'
                  : 'text-[var(--theme-text-secondary,#6b7280)]'
              }
              size="xs"
            >
              {uncheckedIcon}
            </IconWrapper>
          ) : null}
        </div>

        {/* Label and Description */}
        {(label || description) && (
          <div className="flex flex-col gap-1">
            {label && (
              <label
                className={`font-medium cursor-pointer ${
                  hiddenLabel
                    ? 'sr-only'
                    : theme.isDark
                      ? 'text-[var(--theme-text,#f9fafb)] hover:text-[var(--theme-text-hover,#ffffff)]'
                      : 'text-[var(--theme-text,#111827)] hover:text-[var(--theme-text-hover,#000000)]'
                } ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
                htmlFor={checkboxId}
              >
                {label}
              </label>
            )}

            {description && (
              <p
                className={`text-sm ${
                  theme.isDark
                    ? 'text-[var(--theme-text-secondary,#9ca3af)]'
                    : 'text-[var(--theme-text-secondary,#6b7280)]'
                }`}
                id={`${checkboxId}-description`}
              >
                {description}
              </p>
            )}

            {error && errorMessage && (
              <p
                className={`text-sm text-[${COLORS.semantic.error[600]}]`}
                id={`${checkboxId}-error`}
                role="alert"
              >
                {errorMessage}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
