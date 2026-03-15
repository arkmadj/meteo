/**
 * Button Atom Component
 * A versatile button component following atomic design principles
 */

import React, { forwardRef } from 'react';

import type { BaseComponentProps, ComponentSize, ComponentVariant } from '../base/BaseComponent';
import { componentUtils, IconWrapper, Spinner, useComponentState } from '../base/BaseComponent';

// ============================================================================
// BUTTON SPECIFIC TYPES
// ============================================================================

export type ButtonVariant = ComponentVariant | 'outline' | 'ghost' | 'link';
export type ButtonSize = ComponentSize;

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

export interface ButtonProps
  extends Omit<BaseComponentProps, 'variant'>,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  /** Button variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Button content */
  children: React.ReactNode;
  /** Left icon */
  startIcon?: React.ReactNode;
  /** Right icon */
  endIcon?: React.ReactNode;
  /** Loading text (shown when loading) */
  loadingText?: string;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      children,
      startIcon,
      endIcon,
      loadingText,
      type = 'button',
      disabled,
      loading,
      fullWidth,
      className,
      testId,
      ...props
    },
    ref
  ) => {
    const {
      theme,
      isDisabled,
      isLoading,
      testId: defaultTestId,
    } = useComponentState({
      disabled,
      loading,
      fullWidth,
      testId,
    });

    // ============================================================================
    // STYLES
    // ============================================================================

    const baseClasses = [
      'inline-flex',
      'items-center',
      'justify-center',
      'font-medium',
      'rounded-lg',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'focus:ring-offset-white',
      'dark:focus:ring-offset-gray-900',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'relative',
      'overflow-hidden',
    ].join(' ');

    const variantClasses: Record<ButtonVariant, string> = {
      primary: [
        'bg-[var(--theme-accent,#3b82f6)]',
        'hover:bg-[var(--theme-accent-hover,#2563eb)]',
        'text-white',
        'focus:ring-[var(--theme-accent,#3b82f6)]',
        'shadow-sm',
        'hover:shadow-md',
        'active:scale-[0.98]',
      ].join(' '),

      secondary: [
        'bg-gray-100',
        'hover:bg-gray-200',
        'dark:bg-gray-700',
        'dark:hover:bg-gray-600',
        'text-gray-900',
        'dark:text-gray-100',
        'border',
        'border-gray-300',
        'dark:border-gray-600',
        'focus:ring-gray-500',
        'dark:focus:ring-gray-400',
        'hover:shadow-sm',
      ].join(' '),

      outline: [
        'border-2',
        'border-[var(--theme-accent,#3b82f6)]',
        'text-[var(--theme-accent,#3b82f6)]',
        'bg-transparent',
        'hover:bg-[rgba(var(--theme-accent-rgb,59,130,246),0.1)]',
        'dark:hover:bg-[rgba(var(--theme-accent-rgb,59,130,246),0.15)]',
        'focus:ring-[var(--theme-accent,#3b82f6)]',
        'hover:shadow-sm',
      ].join(' '),

      ghost: [
        'text-[var(--theme-accent,#3b82f6)]',
        'bg-transparent',
        'hover:bg-[rgba(var(--theme-accent-rgb,59,130,246),0.1)]',
        'dark:hover:bg-[rgba(var(--theme-accent-rgb,59,130,246),0.15)]',
        'focus:ring-[var(--theme-accent,#3b82f6)]',
        'hover:shadow-sm',
      ].join(' '),

      link: [
        'text-[var(--theme-accent,#3b82f6)]',
        'bg-transparent',
        'hover:text-[var(--theme-accent-hover,#2563eb)]',
        'hover:underline',
        'focus:ring-[var(--theme-accent,#3b82f6)]',
        'p-0',
        'shadow-none',
      ].join(' '),

      success: [
        'bg-green-500',
        'hover:bg-green-600',
        'dark:bg-green-600',
        'dark:hover:bg-green-700',
        'text-white',
        'focus:ring-green-500',
        'dark:focus:ring-green-400',
        'shadow-sm',
        'hover:shadow-md',
      ].join(' '),

      warning: [
        'bg-yellow-500',
        'hover:bg-yellow-600',
        'dark:bg-yellow-600',
        'dark:hover:bg-yellow-700',
        'text-white',
        'focus:ring-yellow-500',
        'dark:focus:ring-yellow-400',
        'shadow-sm',
        'hover:shadow-md',
      ].join(' '),

      error: [
        'bg-red-500',
        'hover:bg-red-600',
        'dark:bg-red-600',
        'dark:hover:bg-red-700',
        'text-white',
        'focus:ring-red-500',
        'dark:focus:ring-red-400',
        'shadow-sm',
        'hover:shadow-md',
      ].join(' '),

      info: [
        'bg-blue-500',
        'hover:bg-blue-600',
        'dark:bg-blue-600',
        'dark:hover:bg-blue-700',
        'text-white',
        'focus:ring-blue-500',
        'dark:focus:ring-blue-400',
        'shadow-sm',
        'hover:shadow-md',
      ].join(' '),

      default: [
        'bg-gray-500',
        'hover:bg-gray-600',
        'dark:bg-gray-600',
        'dark:hover:bg-gray-700',
        'text-white',
        'focus:ring-gray-500',
        'dark:focus:ring-gray-400',
        'shadow-sm',
        'hover:shadow-md',
      ].join(' '),
    };

    const sizeClasses: Record<ButtonSize, string> = {
      xs: ['px-3', 'py-1.5', 'text-xs', 'gap-1'].join(' '),

      sm: ['px-4', 'py-2', 'text-sm', 'gap-1.5'].join(' '),

      md: ['px-5', 'py-2.5', 'text-base', 'gap-2'].join(' '),

      lg: ['px-6', 'py-3', 'text-lg', 'gap-2'].join(' '),

      xl: ['px-8', 'py-4', 'text-xl', 'gap-3'].join(' '),
    };

    // ============================================================================
    // RENDER
    // ============================================================================

    const propsForClasses: BaseComponentProps = {
      size,
      disabled: isDisabled,
      loading: isLoading,
      fullWidth,
      className,
    };

    const coreClasses = componentUtils.generateClasses(
      baseClasses,
      propsForClasses,
      undefined,
      sizeClasses
    );

    const classes = [coreClasses, variantClasses?.[variant]].filter(Boolean).join(' ');

    const displayContent = isLoading && loadingText ? loadingText : children;

    return (
      <button
        ref={ref}
        className={classes}
        data-testid={testId || defaultTestId}
        disabled={isDisabled || isLoading}
        type={type}
        {...props}
      >
        {/* Loading Spinner */}
        {isLoading && !loadingText && (
          <Spinner className="mr-2" size={size === 'xs' ? 'xs' : 'sm'} />
        )}

        {/* Start Icon */}
        {startIcon && !isLoading && (
          <IconWrapper className="mr-2" size={size}>
            {startIcon}
          </IconWrapper>
        )}

        {/* Content */}
        <span className="relative z-10">{displayContent}</span>

        {/* End Icon */}
        {endIcon && !isLoading && (
          <IconWrapper className="ml-2" size={size}>
            {endIcon}
          </IconWrapper>
        )}

        {/* Ripple Effect Overlay */}
        <span className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-200 rounded-lg" />
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
