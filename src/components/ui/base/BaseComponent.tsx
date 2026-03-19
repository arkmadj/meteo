/**
 * Base Component System
 * Provides common functionality and utilities for all UI components
 */

import React from 'react';

import { useTheme } from '@/design-system/theme';

// ============================================================================
// COMMON TYPES
// ============================================================================

export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ComponentVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';
export type ComponentState = 'default' | 'hover' | 'focus' | 'active' | 'disabled';

// ============================================================================
// BASE COMPONENT PROPS
// ============================================================================

export interface BaseComponentProps {
  /** Additional CSS classes */
  className?: string;
  /** Component size variant */
  size?: ComponentSize;
  /** Component visual variant */
  variant?: ComponentVariant;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Whether the component is in a loading state */
  loading?: boolean;
  /** Whether the component should take full width */
  fullWidth?: boolean;
  /** Test ID for testing */
  testId?: string;
}

// ============================================================================
// COMPONENT UTILITIES
// ============================================================================

export const componentUtils = {
  /**
   * Generate component classes based on props
   */
  generateClasses: (
    baseClasses: string,
    props: BaseComponentProps,
    variantClasses?: Record<ComponentVariant, string>,
    sizeClasses?: Record<ComponentSize, string>
  ): string => {
    const classes = [baseClasses];

    // Add variant classes
    if (props.variant && variantClasses) {
      classes.push(variantClasses?.[props.variant]);
    }

    // Add size classes
    if (props.size && sizeClasses) {
      classes.push(sizeClasses?.[props.size]);
    }

    // Add state classes
    if (props.disabled) {
      classes.push('opacity-50 cursor-not-allowed');
    }

    if (props.loading) {
      classes.push('cursor-wait');
    }

    // Add width class
    if (props.fullWidth) {
      classes.push('w-full');
    }

    // Add custom classes
    if (props.className) {
      classes.push(props.className);
    }

    return classes.filter(Boolean).join(' ');
  },

  /**
   * Get color value from theme
   */
  getColor: (colorPath: string, theme: unknown): string => {
    const parts = colorPath.split('.');
    let value: unknown = theme.colors;

    for (const part of parts) {
      value = value?.[part];
    }

    return value || colorPath;
  },

  /**
   * Get spacing value
   */
  getSpacing: (key: string, theme: unknown): string => {
    return theme.spacing?.[key] || key;
  },

  /**
   * Generate test ID
   */
  getTestId: (baseId: string, props: BaseComponentProps): string => {
    return props.testId || baseId;
  },

  /**
   * Handle common component events
   */
  createEventHandlers: <T extends Record<string, unknown>>(handlers: T, disabled?: boolean): T => {
    if (disabled) {
      return Object.keys(handlers).reduce((acc, key) => {
        (acc as unknown)[key] = (e: unknown) => {
          e.preventDefault();
          e.stopPropagation();
        };
        return acc;
      }, {} as T);
    }
    return handlers;
  },
};

// ============================================================================
// BASE COMPONENT HOOK
// ============================================================================

export const useComponentState = (props: BaseComponentProps) => {
  const { theme } = useTheme();

  return {
    theme,
    isDisabled: props.disabled || false,
    isLoading: props.loading || false,
    testId: componentUtils.getTestId('component', props),
  };
};

// ============================================================================
// COMMON COMPONENT PATTERNS
// ============================================================================

/**
 * Icon wrapper component for consistent icon sizing
 */
export interface IconWrapperProps {
  children: React.ReactNode;
  size?: ComponentSize;
  className?: string;
}

export const IconWrapper: React.FC<IconWrapperProps> = ({
  children,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  return (
    <span className={`inline-flex items-center justify-center ${sizeClasses?.[size]} ${className}`}>
      {children}
    </span>
  );
};

/**
 * Loading spinner component
 */
export interface SpinnerProps {
  size?: ComponentSize;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses?.[size]} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        fill="currentColor"
      />
    </svg>
  );
};

export default {
  componentUtils,
  useComponentState,
  IconWrapper,
  Spinner,
};
