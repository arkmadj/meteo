/**
 * Select Atom Component
 * A versatile select dropdown component following atomic design principles
 */

import React, { forwardRef, useState, useRef, useEffect } from 'react';

import { COLORS, COMPONENT_TOKENS, BORDER_RADIUS, TYPOGRAPHY } from '../../../design-system/tokens';
import type { BaseComponentProps, ComponentSize } from '../base/BaseComponent';
import { componentUtils, useComponentState, IconWrapper } from '../base/BaseComponent';

// ============================================================================
// SELECT SPECIFIC TYPES
// ============================================================================

export type SelectVariant = 'default' | 'filled' | 'outlined';
export type SelectSize = ComponentSize;

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

// ============================================================================
// SELECT COMPONENT
// ============================================================================

export interface SelectProps
  extends
    Omit<BaseComponentProps, 'variant'>,
    Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Select variant */
  variant?: SelectVariant;
  /** Select size */
  size?: SelectSize;
  /** Options array */
  options: SelectOption[];
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
  /** Whether the select is searchable */
  searchable?: boolean;
  /** Custom dropdown icon */
  dropdownIcon?: React.ReactNode;
  /** Maximum dropdown height */
  maxDropdownHeight?: string;
  /** Controlled value */
  value?: string;
  /** Default value */
  defaultValue?: string;
  /** Change handler */
  onValueChange?: (value: string) => void;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
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
      searchable = false,
      dropdownIcon,
      maxDropdownHeight = '200px',
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

    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentValue = value !== undefined ? value : internalValue;
    const selectedOption = options.find(option => option.value === currentValue);

    // Filter options for search
    const filteredOptions =
      searchable && searchTerm
        ? options.filter(
            option =>
              option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
              option.description?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : options;

    // ============================================================================
    // STYLES
    // ============================================================================

    const containerClasses = ['relative', 'w-full'].join(' ');

    const selectWrapperClasses = ['relative', 'flex', 'items-center', 'cursor-pointer'].join(' ');

    const baseSelectClasses = [
      'w-full',
      'appearance-none',
      'border',
      'transition-all',
      'duration-200',
      'focus:outline-hidden',
      'focus:ring-3',
      'focus:ring-offset-2',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'bg-white',
      'pr-10',
    ].join(' ');

    const variantClasses: Record<SelectVariant, string> = {
      default: [
        `border-[${COLORS.neutral[300]}]`,
        `focus:border-[${COLORS.primary[500]}]`,
        `focus:ring-3 focus:ring-[${COLORS.primary[500]}]`,
        `hover:border-[${COLORS.neutral[400]}]`,
      ].join(' '),

      filled: [
        'border-transparent',
        `bg-[${COLORS.neutral[100]}]`,
        'focus:bg-white',
        `focus:border-[${COLORS.primary[500]}]`,
        `focus:ring-3 focus:ring-[${COLORS.primary[500]}]`,
        `hover:bg-[${COLORS.neutral[200]}]`,
      ].join(' '),

      outlined: [
        `border-[${COLORS.neutral[300]}]`,
        'bg-transparent',
        `focus:border-[${COLORS.primary[500]}]`,
        `focus:ring-3 focus:ring-[${COLORS.primary[500]}]`,
        `hover:border-[${COLORS.neutral[400]}]`,
      ].join(' '),
    };

    const sizeClasses: Record<SelectSize, string> = {
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
          `focus:ring-3 focus:ring-[${COLORS.semantic.error[500]}]`,
        ].join(' ')
      : '';

    const dropdownClasses = [
      'absolute',
      'top-full',
      'left-0',
      'right-0',
      'z-50',
      'mt-1',
      'bg-white',
      `border border-[${COLORS.neutral[200]}]`,
      `rounded-[${BORDER_RADIUS.lg}]`,
      'shadow-lg',
      'overflow-auto',
    ].join(' ');

    const optionClasses = [
      'px-4',
      'py-2',
      'cursor-pointer',
      `hover:bg-[${COLORS.neutral[100]}]`,
      'transition-colors',
      'duration-150',
    ].join(' ');

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = e.target.value;

      if (value === undefined) {
        setInternalValue(newValue);
      }

      onValueChange?.(newValue);
      onChange?.(e);
    };

    const handleOptionClick = (optionValue: string) => {
      if (value === undefined) {
        setInternalValue(optionValue);
      }

      onValueChange?.(optionValue);
      setIsOpen(false);
      setSearchTerm('');
    };

    // ============================================================================
    // EFFECTS
    // ============================================================================

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchTerm('');
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

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

    const selectId = testId || `select-${Math.random().toString(36).substr(2, 9)}`;
    const listboxId = `${selectId}-listbox`;

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
          {/* Hidden Select for Form Compatibility */}
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
            className="sr-only"
            data-testid={testId}
            disabled={isDisabled}
            id={selectId}
            value={currentValue}
            onChange={handleSelectChange}
            {...props}
          >
            <option value="">{placeholder}</option>
            {options.map(option => (
              <option key={option.value} disabled={option.disabled} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom Select Display */}
          <div
            aria-controls={listboxId}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-labelledby={label ? `${selectId}-label` : undefined}
            className={selectClasses}
            role="combobox"
            tabIndex={isDisabled ? -1 : 0}
            onClick={() => !isDisabled && setIsOpen(!isOpen)}
            onKeyDown={e => {
              if (isDisabled) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsOpen(prev => !prev);
              }
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setIsOpen(true);
              }
            }}
          >
            <span
              className={
                currentValue ? `text-[${COLORS.neutral[900]}]` : `text-[${COLORS.neutral[400]}]`
              }
            >
              {selectedOption?.label || placeholder}
            </span>

            {/* Dropdown Icon */}
            <div className="absolute right-3 flex items-center pointer-events-none">
              <IconWrapper
                className={`text-[${COLORS.neutral[400]}] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                size="sm"
              >
                {dropdownIcon || (
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                )}
              </IconWrapper>
            </div>
          </div>

          {/* Dropdown */}
          {isOpen && (
            <div
              ref={dropdownRef}
              className={dropdownClasses}
              id={listboxId}
              role="listbox"
              style={{ maxHeight: maxDropdownHeight }}
            >
              {/* Search Input */}
              {searchable && (
                <div className="p-2 border-b border-gray-200">
                  <input
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-hidden focus:ring-3 focus:ring-blue-500"
                    placeholder="Search options..."
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              )}

              {/* Options */}
              <div className="py-1">
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-500">No options found</div>
                ) : (
                  filteredOptions.map(option => (
                    <div
                      key={option.value}
                      aria-selected={currentValue === option.value}
                      className={`${optionClasses} ${
                        option.disabled
                          ? 'opacity-50 cursor-not-allowed'
                          : currentValue === option.value
                            ? `bg-[${COLORS.primary[50]}] text-[${COLORS.primary[700]}]`
                            : ''
                      }`}
                      role="option"
                      tabIndex={option.disabled ? -1 : 0}
                      onClick={() => !option.disabled && handleOptionClick(option.value)}
                      onKeyDown={e => {
                        if (option.disabled) return;
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleOptionClick(option.value);
                        }
                      }}
                    >
                      <div className="font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
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

Select.displayName = 'Select';

export default Select;
