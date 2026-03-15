/**
 * Input Component
 * Reusable input component following design system guidelines
 */

import React from 'react';

import { useTheme } from '@/design-system/theme';
import { COLORS, BORDER_RADIUS, COMPONENT_TOKENS } from '@/design-system/tokens';

export type InputVariant = 'default' | 'filled' | 'outlined';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
  error?: boolean;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  variant = 'default',
  size = 'md',
  error = false,
  helperText,
  startIcon,
  endIcon,
  className = '',
  fullWidth = false,
  ...props
}) => {
  const { theme } = useTheme();

  const baseClasses =
    'w-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    default: `border-[${COLORS.neutral[300]}] bg-white focus:border-[${theme.primaryColor}] focus:ring-[${theme.primaryColor}]`,
    filled: `border-transparent bg-[${COLORS.neutral[100]}] focus:bg-white focus:border-[${theme.primaryColor}] focus:ring-[${theme.primaryColor}]`,
    outlined: `border-[${COLORS.neutral[300]}] bg-transparent focus:border-[${theme.primaryColor}] focus:ring-[${theme.primaryColor}]`,
  };

  const sizeClasses = {
    sm: `px-[${COMPONENT_TOKENS.input.padding.sm}] py-[${COMPONENT_TOKENS.input.height.sm}] text-[${COMPONENT_TOKENS.input.fontSize.sm}] rounded-[${BORDER_RADIUS.md}]`,
    md: `px-[${COMPONENT_TOKENS.input.padding.md}] py-[${COMPONENT_TOKENS.input.height.md}] text-[${COMPONENT_TOKENS.input.fontSize.md}] rounded-[${BORDER_RADIUS.lg}]`,
    lg: `px-[${COMPONENT_TOKENS.input.padding.lg}] py-[${COMPONENT_TOKENS.input.height.lg}] text-[${COMPONENT_TOKENS.input.fontSize.lg}] rounded-[${BORDER_RADIUS.lg}]`,
  };

  const errorClasses = error
    ? `border-[${COLORS.semantic.error[500]}] focus:border-[${COLORS.semantic.error[500]}] focus:ring-[${COLORS.semantic.error[500]}]`
    : '';

  const widthClass = fullWidth ? 'w-full' : '';
  const iconPadding =
    startIcon || endIcon
      ? {
          sm: startIcon ? 'pl-10' : 'pr-10',
          md: startIcon ? 'pl-12' : 'pr-12',
          lg: startIcon ? 'pl-14' : 'pr-14',
        }?.[size]
      : '';

  const classes = `${baseClasses} ${variantClasses?.[variant]} ${sizeClasses?.[size]} ${errorClasses} ${iconPadding} ${widthClass} ${className}`;

  return (
    <div className="relative">
      {startIcon && (
        <div
          className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none ${
            size === 'sm' ? 'pl-3' : size === 'md' ? 'pl-4' : 'pl-6'
          }`}
        >
          <span className={`text-[${COLORS.neutral[400]}]`}>{startIcon}</span>
        </div>
      )}

      <input className={classes} {...props} />

      {endIcon && (
        <div
          className={`absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none ${
            size === 'sm' ? 'pr-3' : size === 'md' ? 'pr-4' : 'pr-6'
          }`}
        >
          <span className={`text-[${COLORS.neutral[400]}]`}>{endIcon}</span>
        </div>
      )}

      {helperText && (
        <p
          className={`mt-1 text-sm ${error ? `text-[${COLORS.semantic.error[600]}]` : `text-[${COLORS.neutral[500]}]`}`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
