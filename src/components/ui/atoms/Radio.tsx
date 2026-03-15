/**
 * Radio Atom Component
 * A versatile radio button component following atomic design principles
 */

import React, { forwardRef, useState } from 'react';

import { COLORS } from '../../../design-system/tokens';
import { useTheme } from '../../../design-system/theme';
import type { BaseComponentProps, ComponentSize } from '../base/BaseComponent';
import { useComponentState } from '../base/BaseComponent';

// ============================================================================
// RADIO SPECIFIC TYPES
// ============================================================================

export type RadioSize = ComponentSize;

// ============================================================================
// RADIO COMPONENT
// ============================================================================

export interface RadioProps
  extends BaseComponentProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Radio size */
  size?: RadioSize;
  /** Radio label */
  label?: string | React.ReactNode;
  /** Whether the label should be hidden visually */
  hiddenLabel?: boolean;
  /** Description text */
  description?: string;
  /** Error message */
  errorMessage?: string;
  /** Whether the radio has an error */
  error?: boolean;
  /** Radio value */
  value: string;
  /** Radio name (for grouping) */
  name?: string;
  /** Controlled checked state */
  checked?: boolean;
  /** Default checked state */
  defaultChecked?: boolean;
  /** Change handler */
  onCheckedChange?: (checked: boolean, value: string) => void;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      size = 'md',
      label,
      hiddenLabel = false,
      description,
      errorMessage,
      error = false,
      value,
      name,
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

    const radioWrapperClasses = [
      'relative',
      'flex',
      'items-center',
      'justify-center',
      'border-2',
      'transition-all',
      'duration-200',
      'rounded-full',
      'focus-within:ring-2',
      'focus-within:ring-offset-2',
    ].join(' ');

    const sizeClasses: Record<RadioSize, string> = {
      xs: 'w-4 h-4',
      sm: 'w-5 h-5',
      md: 'w-6 h-6',
      lg: 'w-7 h-7',
      xl: 'w-8 h-8',
    };

    const stateClasses = {
      default: [
        'transition-colors duration-200',
        'border-gray-300',
        'bg-white',
        'hover:border-primary-500',
        'focus-within:border-primary-600',
        'focus-within:ring-primary-600',
      ].join(' '),

      checked: [
        'transition-colors duration-200',
        'border-primary-600',
        'bg-white',
        'hover:border-primary-700',
        'focus-within:border-primary-700',
        'focus-within:ring-primary-700',
      ].join(' '),

      error: [
        'transition-colors duration-200',
        'border-red-500',
        'focus-within:border-red-500',
        'focus-within:ring-red-500',
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

      onCheckedChange?.(newChecked, value);
      onChange?.(e);
    };

    // ============================================================================
    // RENDER
    // ============================================================================

    const radioId = testId || `radio-${Math.random().toString(36).substr(2, 9)}`;

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

    const wrapperClasses = `${radioWrapperClasses} ${sizeClasses?.[size]} ${currentStateClasses} ${className || ''}`;

    return (
      <div className={containerClasses}>
        {/* Hidden Input */}
        <input
          ref={ref}
          aria-describedby={
            error && errorMessage
              ? `${radioId}-error`
              : description
                ? `${radioId}-description`
                : undefined
          }
          checked={currentChecked}
          className="sr-only"
          data-testid={testId}
          disabled={isDisabled}
          id={radioId}
          name={name}
          type="radio"
          value={value}
          onChange={handleChange}
          {...props}
        />

        {/* Visual Radio */}
        <div
          aria-checked={currentChecked}
          className={wrapperClasses}
          style={{
            backgroundColor: theme.isDark ? 'var(--theme-surface)' : 'white',
            borderColor: currentChecked
              ? 'var(--theme-primary)'
              : theme.isDark
                ? 'var(--theme-border)'
                : 'rgb(209 213 219)', // gray-300
            ringColor: 'var(--theme-primary)',
            ringOffsetColor: theme.isDark ? 'var(--theme-surface)' : 'white',
          }}
          role="radio"
          tabIndex={0}
          onClick={() => {
            if (!isDisabled && !currentChecked) {
              const fakeEvent = {
                target: { checked: true, value },
              } as React.ChangeEvent<HTMLInputElement>;
              handleChange(fakeEvent);
            }
          }}
          onKeyDown={e => {
            if ((e.key === ' ' || e.key === 'Enter') && !currentChecked) {
              e.preventDefault();
              const fakeEvent = {
                target: { checked: true, value },
              } as React.ChangeEvent<HTMLInputElement>;
              handleChange(fakeEvent);
            }
          }}
        >
          {/* Inner Circle */}
          {currentChecked && (
            <div
              className={`rounded-full transition-all duration-200 ${
                size === 'xs'
                  ? 'w-2 h-2'
                  : size === 'sm'
                    ? 'w-2.5 h-2.5'
                    : size === 'md'
                      ? 'w-3 h-3'
                      : size === 'lg'
                        ? 'w-3.5 h-3.5'
                        : 'w-4 h-4'
              }`}
              style={{ backgroundColor: 'var(--theme-primary)' }}
            />
          )}
        </div>

        {/* Label and Description */}
        {(label || description) && (
          <div className="flex flex-col gap-1">
            {label && (
              <label
                className={`font-medium cursor-pointer transition-colors duration-200 ${
                  hiddenLabel ? 'sr-only' : ''
                } ${isDisabled ? 'cursor-not-allowed' : ''}`}
                style={
                  !hiddenLabel
                    ? {
                        color: 'var(--theme-text)',
                      }
                    : undefined
                }
                onMouseEnter={e => {
                  if (!hiddenLabel && !isDisabled) {
                    e.currentTarget.style.color = 'var(--theme-text-secondary)';
                  }
                }}
                onMouseLeave={e => {
                  if (!hiddenLabel && !isDisabled) {
                    e.currentTarget.style.color = 'var(--theme-text)';
                  }
                }}
                htmlFor={radioId}
              >
                {label}
              </label>
            )}

            {description && (
              <p
                className="text-sm transition-colors duration-200"
                style={{ color: 'var(--theme-text-secondary)' }}
                id={`${radioId}-description`}
              >
                {description}
              </p>
            )}

            {error && errorMessage && (
              <p
                className="text-sm transition-colors duration-200"
                style={{ color: 'var(--theme-error-text)' }}
                id={`${radioId}-error`}
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

Radio.displayName = 'Radio';

export default Radio;
