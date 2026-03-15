/**
 * CheckboxGroup Atom Component
 * A group of checkboxes that can be managed together with select all functionality
 */

import React, { useState, useCallback, useMemo } from 'react';

import { COLORS } from '../../../design-system/tokens';
import type { BaseComponentProps, ComponentSize } from '../base/BaseComponent';
import { useComponentState } from '../base/BaseComponent';

import Checkbox from './Checkbox';

// ============================================================================
// CHECKBOX GROUP SPECIFIC TYPES
// ============================================================================

export type CheckboxGroupSize = ComponentSize;

export interface CheckboxGroupOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

// ============================================================================
// CHECKBOX GROUP COMPONENT
// ============================================================================

export interface CheckboxGroupProps extends BaseComponentProps {
  /** Group size */
  size?: CheckboxGroupSize;
  /** Group label */
  label?: string;
  /** Whether the label should be hidden visually */
  hiddenLabel?: boolean;
  /** Array of checkbox options */
  options: CheckboxGroupOption[];
  /** Controlled selected values */
  value?: string[];
  /** Default selected values */
  defaultValue?: string[];
  /** Change handler */
  onChange?: (values: string[]) => void;
  /** Minimum number of selections required */
  minSelections?: number;
  /** Maximum number of selections allowed */
  maxSelections?: number;
  /** Whether to show select all checkbox */
  showSelectAll?: boolean;
  /** Custom select all label */
  selectAllLabel?: string;
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
}

const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(
  (
    {
      size = 'md',
      label,
      hiddenLabel = false,
      options,
      value,
      defaultValue = [],
      onChange,
      minSelections,
      maxSelections,
      showSelectAll = false,
      selectAllLabel = 'Select All',
      direction = 'vertical',
      errorMessage,
      error = false,
      helperText,
      disabled = false,
      required = false,
      className: _className,
      testId,
    },
    ref
  ) => {
    const { isDisabled } = useComponentState({
      disabled,
      testId,
    });

    const [internalValue, setInternalValue] = useState<string[]>(defaultValue);
    const isControlled = value !== undefined;
    const selectedValues = isControlled ? value : internalValue;

    // ============================================================================
    // COMPUTED VALUES
    // ============================================================================

    const availableValues = useMemo(
      () => options.filter(option => !option.disabled).map(option => option.value),
      [options]
    );

    const isAllSelected = useMemo(
      () =>
        availableValues.length > 0 && availableValues.every(val => selectedValues.includes(val)),
      [availableValues, selectedValues]
    );

    const isIndeterminate = useMemo(
      () => availableValues.some(val => selectedValues.includes(val)) && !isAllSelected,
      [availableValues, selectedValues, isAllSelected]
    );

    const selectedCount = selectedValues.length;
    const hasMinError = minSelections !== undefined && selectedCount < minSelections;
    const hasMaxError = maxSelections !== undefined && selectedCount > maxSelections;
    const hasValidationError = hasMinError || hasMaxError;

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================

    const handleCheckboxChange = useCallback(
      (optionValue: string, checked: boolean) => {
        let newValues: string[];

        if (checked) {
          // Prevent exceeding max selections
          if (maxSelections !== undefined && selectedValues.length >= maxSelections) {
            return;
          }
          newValues = [...selectedValues, optionValue];
        } else {
          // Prevent going below min selections
          if (minSelections !== undefined && selectedValues.length <= minSelections) {
            return;
          }
          newValues = selectedValues.filter(val => val !== optionValue);
        }

        if (!isControlled) {
          setInternalValue(newValues);
        }

        onChange?.(newValues);
      },
      [selectedValues, maxSelections, minSelections, isControlled, onChange]
    );

    const handleSelectAllChange = useCallback(
      (checked: boolean) => {
        let newValues: string[];

        if (checked) {
          // Select all available options, respecting max selections
          if (maxSelections !== undefined) {
            newValues = [
              ...selectedValues,
              ...availableValues.slice(0, maxSelections - selectedValues.length),
            ];
          } else {
            newValues = [...new Set([...selectedValues, ...availableValues])];
          }
        } else {
          // Deselect all, respecting min selections
          if (minSelections !== undefined && selectedValues.length <= minSelections) {
            return;
          }
          newValues = selectedValues.filter(val => !availableValues.includes(val));
        }

        if (!isControlled) {
          setInternalValue(newValues);
        }

        onChange?.(newValues);
      },
      [selectedValues, availableValues, maxSelections, minSelections, isControlled, onChange]
    );

    // ============================================================================
    // STYLES
    // ============================================================================

    const containerClasses = ['space-y-4'].join(' ');

    const groupClasses = [
      'space-y-3',
      direction === 'horizontal' ? 'flex flex-wrap gap-4' : '',
    ].join(' ');

    const selectAllClasses = ['pb-2', 'border-b border-gray-200'].join(' ');

    // ============================================================================
    // RENDER
    // ============================================================================

    const groupId = testId || `checkbox-group-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div ref={ref} className={containerClasses} data-testid={testId}>
        {/* Group Label */}
        {label && (
          <div className="flex items-center gap-2">
            <label
              className={`text-sm font-medium ${
                hiddenLabel ? 'sr-only' : `text-[${COLORS.neutral[700]}]`
              }`}
              id={`${groupId}-label`}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* Selection Count */}
            {selectedCount > 0 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {selectedCount} selected
              </span>
            )}
          </div>
        )}

        {/* Select All Checkbox */}
        {showSelectAll && availableValues.length > 1 && (
          <div className={selectAllClasses}>
            <Checkbox
              checked={isAllSelected}
              disabled={isDisabled}
              indeterminate={isIndeterminate}
              label={selectAllLabel}
              size={size}
              testId={`${testId}-select-all`}
              onCheckedChange={handleSelectAllChange}
            />
          </div>
        )}

        {/* Checkbox Options */}
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
          role="group"
        >
          {options.map(option => {
            const isSelected = selectedValues.includes(option.value);
            const isOptionDisabled = isDisabled || option.disabled;

            return (
              <Checkbox
                key={option.value}
                checked={isSelected}
                description={option.description}
                disabled={isOptionDisabled}
                error={hasValidationError && error}
                label={option.label}
                size={size}
                testId={`${testId}-option-${option.value}`}
                onCheckedChange={checked => handleCheckboxChange(option.value, checked)}
              />
            );
          })}
        </div>

        {/* Validation Messages */}
        {hasMinError && (
          <p
            className={`text-sm text-[${COLORS.semantic.error[600]}]`}
            id={`${groupId}-error`}
            role="alert"
          >
            Please select at least {minSelections} option{minSelections !== 1 ? 's' : ''}.
          </p>
        )}

        {hasMaxError && (
          <p
            className={`text-sm text-[${COLORS.semantic.error[600]}]`}
            id={`${groupId}-error`}
            role="alert"
          >
            Please select no more than {maxSelections} option{maxSelections !== 1 ? 's' : ''}.
          </p>
        )}

        {/* Error Message */}
        {error && errorMessage && !hasValidationError && (
          <p
            className={`text-sm text-[${COLORS.semantic.error[600]}]`}
            id={`${groupId}-error`}
            role="alert"
          >
            {errorMessage}
          </p>
        )}

        {/* Helper Text */}
        {helperText && (
          <p className={`text-sm text-[${COLORS.neutral[500]}]`} id={`${groupId}-helper`}>
            {helperText}
          </p>
        )}

        {/* Selection Limits Info */}
        {(minSelections !== undefined || maxSelections !== undefined) && (
          <div className="text-xs text-gray-500 mt-2">
            {minSelections !== undefined && maxSelections !== undefined ? (
              <span>
                Select between {minSelections} and {maxSelections} options
              </span>
            ) : minSelections !== undefined ? (
              <span>
                Select at least {minSelections} option{minSelections !== 1 ? 's' : ''}
              </span>
            ) : maxSelections !== undefined ? (
              <span>
                Select up to {maxSelections} option{maxSelections !== 1 ? 's' : ''}
              </span>
            ) : null}
          </div>
        )}
      </div>
    );
  }
);

CheckboxGroup.displayName = 'CheckboxGroup';

export default CheckboxGroup;
