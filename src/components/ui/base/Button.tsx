import React from 'react';

import { useTheme } from '@/design-system/theme';
import { COLORS, COMPONENT_TOKENS } from '@/design-system/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  fullWidth = false,
  loading = false,
  disabled,
  ...props
}) => {
  const { theme } = useTheme();

  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: `bg-[${theme.primaryColor}] hover:bg-[${COLORS.primary[600]}] text-white focus:ring-[${theme.primaryColor}]`,
    secondary: `bg-[${COLORS.neutral[500]}] hover:bg-[${COLORS.neutral[600]}] text-white focus:ring-[${COLORS.neutral[500]}]`,
    outline: `border border-[${COLORS.neutral[300]}] bg-[${theme.surfaceColor}] hover:bg-[${COLORS.neutral[50]}] text-[${theme.textColor}] focus:ring-[${theme.primaryColor}]`,
  };

  const sizeClasses = {
    sm: `px-[${COMPONENT_TOKENS.button.padding.sm}] py-[${COMPONENT_TOKENS.button.height.sm}] text-[${COMPONENT_TOKENS.button.fontSize.sm}]`,
    md: `px-[${COMPONENT_TOKENS.button.padding.md}] py-[${COMPONENT_TOKENS.button.height.md}] text-[${COMPONENT_TOKENS.button.fontSize.md}]`,
    lg: `px-[${COMPONENT_TOKENS.button.padding.lg}] py-[${COMPONENT_TOKENS.button.height.lg}] text-[${COMPONENT_TOKENS.button.fontSize.lg}]`,
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const classes = `${baseClasses} ${variantClasses?.[variant]} ${sizeClasses?.[size]} ${widthClass} ${className}`;

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            fill="currentColor"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
