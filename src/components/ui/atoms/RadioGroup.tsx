/**
 * RadioGroup Atom Component
 * A group of radio buttons that can be managed together with validation
 */

import React, { useState, useCallback } from 'react';

import { useTheme } from '../../../design-system/theme';
import type { BaseComponentProps, ComponentSize } from '../base/BaseComponent';
import { useComponentState } from '../base/BaseComponent';

import Radio from './Radio';

// ============================================================================
// RADIO GROUP SPECIFIC TYPES
// ============================================================================

export type RadioGroupSize = ComponentSize;

export interface RadioGroupOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

// ============================================================================
// RADIO GROUP COMPONENT
// ============================================================================

export interface RadioGroupProps extends BaseComponentProps {
  /** Group size */
  size?: RadioGroupSize;
  /** Group label */
  label?: string;
  /** Whether the label should be hidden visually */
  hiddenLabel?: boolean;
  /** Array of radio options */
  options: RadioGroupOption[];
  /** Controlled selected value */
  value?: string;
  /** Default selected value */
  defaultValue?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Layout direction */
  direction?: 'vertical' | 'horizontal';
  /** Error message */
  errorMessage?: string;
  /** Whether the group has an error */
  error?: boolean;
  /** Helper text */
  helperText?: string;
  /** Whether the entire group is disabled */
  disabled?: boolean;
  /** Whether the entire group is required */
  required?: boolean;
  /** Name attribute for the radio group */
  name?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      size = 'md',
      label,
      hiddenLabel = false,
      options,
      value,
      defaultValue,
      onChange,
      direction = 'vertical',
      errorMessage,
      error = false,
      helperText,
      disabled = false,
      required = false,
      name,
      className: _className,
      testId,
    },
    ref
  ) => {
    const { _theme } = useTheme();
    const { isDisabled } = useComponentState({
      disabled,
      testId,
    });

    const [internalValue, setInternalValue] = useState<string>(defaultValue || '');
    const isControlled = value !== undefined;
    const selectedValue = isControlled ? value : internalValue;

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================

    const handleRadioChange = useCallback(
      (optionValue: string) => {
        if (!isControlled) {
          setInternalValue(optionValue);
        }

        onChange?.(optionValue);
      },
      [isControlled, onChange]
    );

    // ============================================================================
    // STYLES
    // ============================================================================

    const containerClasses = ['space-y-4'].join(' ');

    const groupClasses = [
      'space-y-3',
      direction === 'horizontal' ? 'flex flex-wrap gap-4' : '',
    ].join(' ');

    // ============================================================================
    // RENDER
    // ============================================================================

    const groupId = testId || `radio-group-${Math.random().toString(36).substr(2, 9)}`;
    const groupName = name || `radio-group-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div ref={ref} className={containerClasses} data-testid={testId}>
        {/* Group Label */}
        {label && (
          <div className="flex items-center gap-2">
            <label
              className={`text-sm font-medium transition-colors duration-200 ${
                hiddenLabel ? 'sr-only' : ''
              }`}
              style={!hiddenLabel ? { color: 'var(--theme-text)' } : undefined}
              id={`${groupId}-label`}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
        )}

        {/* Radio Options */}
        <div
          aria-describedby={
            error && errorMessage
              ? `${groupId}-error`
              : helperText
                ? `${groupId}-helper`
                : undefined
          }
          aria-labelledby={label ? `${groupId}-label` : undefined}
          className={groupClasses}
          role="radiogroup"
        >
          {options.map(option => {
            const isSelected = selectedValue === option.value;
            const isOptionDisabled = isDisabled || option.disabled;

            return (
              <Radio
                key={option.value}
                checked={isSelected}
                description={option.description}
                disabled={isOptionDisabled}
                error={error}
                label={option.label}
                name={groupName}
                size={size}
                testId={`${testId}-option-${option.value}`}
                value={option.value}
                onCheckedChange={() => handleRadioChange(option.value)}
              />
            );
          })}
        </div>

        {/* Error Message */}
        {error && errorMessage && (
          <p
            className="text-sm transition-colors duration-200"
            style={{ color: 'var(--theme-error-text)' }}
            id={`${groupId}-error`}
            role="alert"
          >
            {errorMessage}
          </p>
        )}

        {/* Helper Text */}
        {helperText && (
          <p
            className="text-sm transition-colors duration-200"
            style={{ color: 'var(--theme-text-secondary)' }}
            id={`${groupId}-helper`}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;
