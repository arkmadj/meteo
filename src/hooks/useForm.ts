/**
 * Type-safe form management hook with validation
 * Provides reusable form state management with type safety
 */

import { useCallback, useMemo, useRef, useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type ValidationRule<T> = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
};

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

export type FormErrors<T> = {
  [K in keyof T]?: string;
};

export type TouchedFields<T> = {
  [K in keyof T]?: boolean;
};

export interface FormState<T> {
  values: T;
  errors: FormErrors<T>;
  touched: TouchedFields<T>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

export interface FormOptions<T> {
  /** Initial form values */
  initialValues: T;
  /** Validation rules for each field */
  validationRules?: ValidationRules<T>;
  /** Custom validation function */
  validate?: (values: T) => FormErrors<T>;
  /** Validate on change (default: true) */
  validateOnChange?: boolean;
  /** Validate on blur (default: true) */
  validateOnBlur?: boolean;
  /** Submit handler */
  onSubmit?: (values: T) => Promise<void> | void;
  /** Reset form after successful submit */
  resetOnSubmit?: boolean;
}

export interface FormActions<T> {
  /** Set value for a specific field */
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  /** Set multiple values at once */
  setValues: (values: Partial<T>) => void;
  /** Set error for a specific field */
  setError: <K extends keyof T>(field: K, error: string | null) => void;
  /** Set multiple errors at once */
  setErrors: (errors: FormErrors<T>) => void;
  /** Mark field as touched */
  setTouched: <K extends keyof T>(field: K, touched?: boolean) => void;
  /** Mark multiple fields as touched */
  setTouchedFields: (touched: TouchedFields<T>) => void;
  /** Reset form to initial state */
  reset: () => void;
  /** Submit form */
  submit: () => Promise<void>;
  /** Validate all fields */
  validate: () => FormErrors<T>;
  /** Validate specific field */
  validateField: <K extends keyof T>(field: K) => string | null;
  /** Get field props for input binding */
  getFieldProps: <K extends keyof T>(
    field: K
  ) => {
    value: T[K];
    onChange: (value: T[K]) => void;
    onBlur: () => void;
    error: string | undefined;
    touched: boolean | undefined;
  };
}

export type FormReturn<T> = FormState<T> & FormActions<T>;

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

function validateField<T>(value: T, rules: ValidationRule<T> = {}): string | null {
  const { required, minLength, maxLength, pattern, custom } = rules;

  // Required validation
  if (required && (value === null || value === undefined || value === '')) {
    return 'This field is required';
  }

  // Skip other validations if value is empty and not required
  if (!required && (value === null || value === undefined || value === '')) {
    return null;
  }

  // String-specific validations
  if (typeof value === 'string') {
    if (minLength && value.length < minLength) {
      return `Minimum length is ${minLength} characters`;
    }
    if (maxLength && value.length > maxLength) {
      return `Maximum length is ${maxLength} characters`;
    }
    if (pattern && !pattern.test(value)) {
      return 'Invalid format';
    }
  }

  // Custom validation
  if (custom) {
    return custom(value);
  }

  return null;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Custom hook for type-safe form management
 *
 * @param options - Form configuration options
 * @returns Object with form state and actions
 *
 * @example
 * ```tsx
 * interface LoginForm {
 *   email: string;
 *   password: string;
 * }
 *
 * const form = useForm<LoginForm>({
 *   initialValues: { email: '', password: '' },
 *   validationRules: {
 *     email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
 *     password: { required: true, minLength: 8 },
 *   },
 *   onSubmit: async (values) => {
 *     await login(values);
 *   },
 * });
 * ```
 */
export function useForm<T extends Record<string, any>>(options: FormOptions<T>): FormReturn<T> {
  const {
    initialValues,
    validationRules = {},
    validate: customValidate,
    validateOnChange = true,
    validateOnBlur = true,
    onSubmit,
    resetOnSubmit = false,
  } = options;

  // State management
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<FormErrors<T>>({});
  const [touched, setTouchedState] = useState<TouchedFields<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for stable references
  const initialValuesRef = useRef(initialValues);
  const customValidateRef = useRef(customValidate);
  customValidateRef.current = customValidate;

  // Computed state
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValuesRef.current);
  }, [values]);

  // Validation functions
  const validateField = useCallback(
    <K extends keyof T>(field: K): string | null => {
      const value = values[field];
      const rules = validationRules[field];
      return validateField(value, rules);
    },
    [values, validationRules]
  );

  const validateAllFields = useCallback((): FormErrors<T> => {
    const newErrors: FormErrors<T> = {};

    // Field-level validation
    Object.keys(values).forEach(key => {
      const field = key as keyof T;
      const error = validateField(field);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Custom validation
    if (customValidateRef.current) {
      const customErrors = customValidateRef.current(values);
      Object.assign(newErrors, customErrors);
    }

    return newErrors;
  }, [values, validateField]);

  // Actions
  const setValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValuesState(prev => ({ ...prev, [field]: value }));

      if (validateOnChange) {
        const error = validateField(field);
        setErrorsState(prev => ({
          ...prev,
          [field]: error,
        }));
      }
    },
    [validateOnChange, validateField]
  );

  const setValues = useCallback(
    (newValues: Partial<T>) => {
      setValuesState(prev => ({ ...prev, ...newValues }));

      if (validateOnChange) {
        const newErrors = validateAllFields();
        setErrorsState(newErrors);
      }
    },
    [validateOnChange, validateAllFields]
  );

  const setError = useCallback(<K extends keyof T>(field: K, error: string | null) => {
    setErrorsState(prev => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  const setErrors = useCallback((newErrors: FormErrors<T>) => {
    setErrorsState(newErrors);
  }, []);

  const setTouched = useCallback(
    <K extends keyof T>(field: K, isTouched = true) => {
      setTouchedState(prev => ({ ...prev, [field]: isTouched }));

      if (validateOnBlur && isTouched) {
        const error = validateField(field);
        setErrorsState(prev => ({
          ...prev,
          [field]: error,
        }));
      }
    },
    [validateOnBlur, validateField]
  );

  const setTouchedFields = useCallback((newTouched: TouchedFields<T>) => {
    setTouchedState(newTouched);
  }, []);

  const reset = useCallback(() => {
    setValuesState(initialValuesRef.current);
    setErrorsState({});
    setTouchedState({});
    setIsSubmitting(false);
  }, []);

  const submit = useCallback(async () => {
    if (!onSubmit) return;

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as TouchedFields<T>);
    setTouchedState(allTouched);

    // Validate all fields
    const validationErrors = validateAllFields();
    setErrorsState(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      if (resetOnSubmit) {
        reset();
      }
    } catch (error) {
      // Handle submit errors if needed
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, values, validateAllFields, resetOnSubmit, reset]);

  const getFieldProps = useCallback(
    <K extends keyof T>(field: K) => {
      return {
        value: values[field],
        onChange: (value: T[K]) => setValue(field, value),
        onBlur: () => setTouched(field, true),
        error: errors[field],
        touched: touched[field],
      };
    },
    [values, errors, touched, setValue, setTouched]
  );

  return {
    // State
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    isDirty,
    // Actions
    setValue,
    setValues,
    setError,
    setErrors,
    setTouched,
    setTouchedFields,
    reset,
    submit,
    validate: validateAllFields,
    validateField,
    getFieldProps,
  };
}
