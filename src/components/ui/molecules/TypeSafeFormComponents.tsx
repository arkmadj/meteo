/**
 * Type-Safe Form Components
 *
 * A collection of form components that leverage TypeScript for type safety
 * while maintaining full accessibility compliance.
 *
 * Features:
 * - Generic type support for form data
 * - Compile-time type checking for field names and values
 * - Automatic validation with type-safe error handling
 * - ARIA attributes and screen reader support
 * - Keyboard navigation and focus management
 * - Custom validation rules with TypeScript inference
 */

import React, { useCallback, useMemo } from 'react';
import type { DropdownOption } from './AccessibleDropdown';
import { AccessibleDropdown } from './AccessibleDropdown';

// ============================================================================
// CORE TYPES
// ============================================================================

export type ValidationRule<T> = {
  validate: (value: T) => boolean | string;
  message?: string;
};

export type FieldError = string | null;

export type FormErrors<T> = {
  [K in keyof T]?: FieldError;
};

export type FormTouched<T> = {
  [K in keyof T]?: boolean;
};

export interface FormFieldProps<T, K extends keyof T> {
  /** Field name (type-safe key of form data) */
  name: K;
  /** Current field value */
  value: T[K];
  /** Change handler with type-safe value */
  onChange: (name: K, value: T[K]) => void;
  /** Field label */
  label: string;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Field error message */
  error?: FieldError;
  /** Whether field has been touched */
  touched?: boolean;
  /** Help text */
  helpText?: string;
  /** CSS class name */
  className?: string;
  /** Validation rules */
  validationRules?: ValidationRule<T[K]>[];
  /** Callback when field is blurred */
  onBlur?: (name: K) => void;
  /** Callback when field is focused */
  onFocus?: (name: K) => void;
}

// ============================================================================
// TYPE-SAFE TEXT INPUT
// ============================================================================

export interface TypeSafeTextInputProps<T, K extends keyof T> extends FormFieldProps<T, K> {
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';
  /** Placeholder text */
  placeholder?: string;
  /** Maximum length */
  maxLength?: number;
  /** Minimum length */
  minLength?: number;
  /** Input pattern for validation */
  pattern?: string;
  /** Autocomplete attribute */
  autoComplete?: string;
}

export function TypeSafeTextInput<T, K extends keyof T>({
  name,
  value,
  onChange,
  label,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  error,
  touched = false,
  helpText,
  className = '',
  validationRules = [],
  maxLength,
  minLength,
  pattern,
  autoComplete,
  onBlur,
  onFocus,
}: TypeSafeTextInputProps<T, K>) {
  const fieldId = `field-${String(name)}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const helpId = helpText ? `${fieldId}-help` : undefined;

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value as T[K];
      onChange(name, newValue);
    },
    [name, onChange]
  );

  const handleBlur = useCallback(() => {
    onBlur?.(name);
  }, [name, onBlur]);

  const handleFocus = useCallback(() => {
    onFocus?.(name);
  }, [name, onFocus]);

  // Validate field value
  const validationError = useMemo(() => {
    if (!touched || !validationRules.length) return null;

    for (const rule of validationRules) {
      const result = rule.validate(value);
      if (result !== true) {
        return typeof result === 'string' ? result : rule.message || 'Invalid value';
      }
    }
    return null;
  }, [value, validationRules, touched]);

  const displayError = error || validationError;

  return (
    <div className={`form-field ${className} ${displayError ? 'error' : ''}`}>
      <label htmlFor={fieldId} className="form-label">
        {label}
        {required && (
          <span className="required-indicator" aria-label="required">
            *
          </span>
        )}
      </label>

      <input
        id={fieldId}
        type={type}
        value={value as string}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
        autoComplete={autoComplete}
        className={`form-input ${displayError ? 'error' : ''}`}
        aria-invalid={!!displayError}
        aria-describedby={[errorId, helpId].filter(Boolean).join(' ') || undefined}
      />

      {displayError && (
        <div id={errorId} className="form-error" role="alert" aria-live="polite">
          {displayError}
        </div>
      )}

      {helpText && (
        <div id={helpId} className="form-help">
          {helpText}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TYPE-SAFE SELECT/DROPDOWN
// ============================================================================

export interface TypeSafeSelectProps<T, K extends keyof T, V = T[K]> extends FormFieldProps<T, K> {
  /** Select options */
  options: DropdownOption<V>[];
  /** Whether multiple selections are allowed */
  multiple?: boolean;
  /** Whether the select is searchable */
  searchable?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Custom option renderer */
  renderOption?: (
    option: DropdownOption<V>,
    isHighlighted: boolean,
    isSelected: boolean
  ) => React.ReactNode;
  /** Custom value renderer */
  renderValue?: (
    option: DropdownOption<V> | DropdownOption<V>[],
    placeholder: string
  ) => React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Empty message */
  emptyMessage?: string;
}

export function TypeSafeSelect<T, K extends keyof T, V = T[K]>({
  name,
  value,
  onChange,
  label,
  options,
  multiple = false,
  searchable = false,
  placeholder = 'Select an option...',
  required = false,
  disabled = false,
  error,
  touched = false,
  helpText,
  className = '',
  validationRules = [],
  renderOption,
  renderValue,
  loading = false,
  emptyMessage = 'No options available',
  onBlur,
  onFocus,
}: TypeSafeSelectProps<T, K, V>) {
  const fieldId = `field-${String(name)}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const helpId = helpText ? `${fieldId}-help` : undefined;

  const handleChange = useCallback(
    (newValue: V | V[], _selectedOption: DropdownOption<V> | DropdownOption<V>[]) => {
      onChange(name, newValue as T[K]);
    },
    [name, onChange]
  );

  const _handleBlur = useCallback(() => {
    onBlur?.(name);
  }, [name, onBlur]);

  const _handleFocus = useCallback(() => {
    onFocus?.(name);
  }, [name, onFocus]);

  // Validate field value
  const validationError = useMemo(() => {
    if (!touched || !validationRules.length) return null;

    for (const rule of validationRules) {
      const result = rule.validate(value);
      if (result !== true) {
        return typeof result === 'string' ? result : rule.message || 'Invalid selection';
      }
    }
    return null;
  }, [value, validationRules, touched]);

  const displayError = error || validationError;

  return (
    <div className={`form-field ${className} ${displayError ? 'error' : ''}`}>
      <AccessibleDropdown
        id={fieldId}
        label={label}
        options={options}
        value={value as V | V[]}
        onChange={handleChange}
        multiple={multiple}
        searchable={searchable}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        error={displayError}
        helpText={helpText}
        renderOption={renderOption}
        renderValue={renderValue}
        loading={loading}
        emptyMessage={emptyMessage}
        ariaDescribedBy={[errorId, helpId].filter(Boolean).join(' ') || undefined}
      />
    </div>
  );
}

// ============================================================================
// TYPE-SAFE CHECKBOX
// ============================================================================

export interface TypeSafeCheckboxProps<T, K extends keyof T> extends FormFieldProps<T, K> {
  /** Checkbox description/content */
  description?: string;
  /** Whether checkbox is indeterminate */
  indeterminate?: boolean;
}

export function TypeSafeCheckbox<T, K extends keyof T>({
  name,
  value,
  onChange,
  label,
  description,
  required = false,
  disabled = false,
  error,
  touched = false,
  helpText,
  className = '',
  validationRules = [],
  indeterminate = false,
  onBlur,
  onFocus,
}: TypeSafeCheckboxProps<T, K>) {
  const fieldId = `field-${String(name)}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const helpId = helpText ? `${fieldId}-help` : undefined;
  const descId = description ? `${fieldId}-desc` : undefined;

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.checked as T[K];
      onChange(name, newValue);
    },
    [name, onChange]
  );

  const handleBlur = useCallback(() => {
    onBlur?.(name);
  }, [name, onBlur]);

  const handleFocus = useCallback(() => {
    onFocus?.(name);
  }, [name, onFocus]);

  // Validate field value
  const validationError = useMemo(() => {
    if (!touched || !validationRules.length) return null;

    for (const rule of validationRules) {
      const result = rule.validate(value);
      if (result !== true) {
        return typeof result === 'string' ? result : rule.message || 'Invalid selection';
      }
    }
    return null;
  }, [value, validationRules, touched]);

  const displayError = error || validationError;

  return (
    <div className={`form-field checkbox-field ${className} ${displayError ? 'error' : ''}`}>
      <div className="checkbox-wrapper">
        <input
          id={fieldId}
          type="checkbox"
          checked={value as boolean}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          required={required}
          disabled={disabled}
          className={`form-checkbox ${displayError ? 'error' : ''}`}
          aria-invalid={!!displayError}
          aria-describedby={[descId, errorId, helpId].filter(Boolean).join(' ') || undefined}
          ref={input => {
            if (input) {
              input.indeterminate = indeterminate;
            }
          }}
        />

        <label htmlFor={fieldId} className="checkbox-label">
          {label}
          {required && (
            <span className="required-indicator" aria-label="required">
              *
            </span>
          )}
        </label>
      </div>

      {description && (
        <div id={descId} className="checkbox-description">
          {description}
        </div>
      )}

      {displayError && (
        <div id={errorId} className="form-error" role="alert" aria-live="polite">
          {displayError}
        </div>
      )}

      {helpText && (
        <div id={helpId} className="form-help">
          {helpText}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TYPE-SAFE FORM HOOK
// ============================================================================

export interface UseFormOptions<T> {
  /** Initial form values */
  initialValues: T;
  /** Validation rules for each field */
  validationRules?: Partial<{
    [K in keyof T]: ValidationRule<T[K]>[];
  }>;
  /** Callback when form is submitted */
  onSubmit?: (values: T) => void | Promise<void>;
  /** Whether to validate on change */
  validateOnChange?: boolean;
  /** Whether to validate on blur */
  validateOnBlur?: boolean;
}

export interface UseFormReturn<T> {
  /** Current form values */
  values: T;
  /** Form errors */
  errors: FormErrors<T>;
  /** Touched fields */
  touched: FormTouched<T>;
  /** Whether form is submitting */
  isSubmitting: boolean;
  /** Whether form is valid */
  isValid: boolean;
  /** Set field value */
  setValue: <K extends keyof T>(name: K, value: T[K]) => void;
  /** Set field error */
  setError: <K extends keyof T>(name: K, error: FieldError) => void;
  /** Set field touched */
  setTouched: <K extends keyof T>(name: K, touched?: boolean) => void;
  /** Handle field change */
  handleChange: <K extends keyof T>(name: K, value: T[K]) => void;
  /** Handle field blur */
  handleBlur: <K extends keyof T>(name: K) => void;
  /** Handle form submission */
  handleSubmit: (event?: React.FormEvent) => void;
  /** Reset form to initial values */
  reset: () => void;
  /** Validate entire form */
  validate: () => boolean;
  /** Get field props for easy spreading */
  getFieldProps: <K extends keyof T>(
    name: K
  ) => {
    name: K;
    value: T[K];
    onChange: (name: K, value: T[K]) => void;
    onBlur: (name: K) => void;
    error: FieldError;
    touched: boolean;
  };
}

export function useForm<T extends Record<string, unknown>>({
  initialValues,
  validationRules = {},
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = React.useState<T>(initialValues);
  const [errors, setErrors] = React.useState<FormErrors<T>>({});
  const [touched, setTouchedState] = React.useState<FormTouched<T>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Validate a single field
  const validateField = useCallback(
    <K extends keyof T>(name: K, value: T[K]): FieldError => {
      const rules = validationRules[name];
      if (!rules || !rules.length) return null;

      for (const rule of rules) {
        const result = rule.validate(value);
        if (result !== true) {
          return typeof result === 'string' ? result : rule.message || 'Invalid value';
        }
      }
      return null;
    },
    [validationRules]
  );

  // Validate entire form
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors<T> = {};
    let isValid = true;

    for (const name in values) {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [values, validateField]);

  // Set field value
  const setValue = useCallback(
    <K extends keyof T>(name: K, value: T[K]) => {
      setValues(prev => ({ ...prev, [name]: value }));

      if (validateOnChange) {
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
      }
    },
    [validateOnChange, validateField]
  );

  // Set field error
  const setError = useCallback(<K extends keyof T>(name: K, error: FieldError) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  // Set field touched
  const setTouched = useCallback(<K extends keyof T>(name: K, isTouched = true) => {
    setTouchedState(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  // Handle field change
  const handleChange = useCallback(
    <K extends keyof T>(name: K, value: T[K]) => {
      setValue(name, value);
    },
    [setValue]
  );

  // Handle field blur
  const handleBlur = useCallback(
    <K extends keyof T>(name: K) => {
      setTouched(name, true);

      if (validateOnBlur) {
        const error = validateField(name, values[name]);
        setErrors(prev => ({ ...prev, [name]: error }));
      }
    },
    [validateOnBlur, validateField, values, setTouched]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault();

      if (!onSubmit) return;

      const isValid = validate();
      if (!isValid) return;

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, validate, values]
  );

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouchedState({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Get field props
  const getFieldProps = useCallback(
    <K extends keyof T>(name: K) => ({
      name,
      value: values[name],
      onChange: handleChange,
      onBlur: handleBlur,
      error: errors[name] || null,
      touched: touched[name] || false,
    }),
    [values, handleChange, handleBlur, errors, touched]
  );

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.values(errors).every(error => !error);
  }, [errors]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setError,
    setTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    validate,
    getFieldProps,
  };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export const ValidationRules = {
  required: function <T>(message = 'This field is required'): ValidationRule<T> {
    return {
      validate: value => {
        if (value === null || value === undefined || value === '') {
          return message;
        }
        if (Array.isArray(value) && value.length === 0) {
          return message;
        }
        return true;
      },
    };
  },

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: value => {
      if (typeof value === 'string' && value.length < min) {
        return message || `Must be at least ${min} characters`;
      }
      return true;
    },
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: value => {
      if (typeof value === 'string' && value.length > max) {
        return message || `Must be no more than ${max} characters`;
      }
      return true;
    },
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule<string> => ({
    validate: value => {
      if (typeof value === 'string' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) || message;
      }
      return true;
    },
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule<string> => ({
    validate: value => {
      if (typeof value === 'string' && value) {
        return regex.test(value) || message;
      }
      return true;
    },
  }),

  min: (min: number, message?: string): ValidationRule<number> => ({
    validate: value => {
      if (typeof value === 'number' && value < min) {
        return message || `Must be at least ${min}`;
      }
      return true;
    },
  }),

  max: (max: number, message?: string): ValidationRule<number> => ({
    validate: value => {
      if (typeof value === 'number' && value > max) {
        return message || `Must be no more than ${max}`;
      }
      return true;
    },
  }),
};
