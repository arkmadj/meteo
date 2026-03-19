/**
 * Badge Component
 * Small status indicators and labels
 */

import React from 'react';

import { COLORS, BORDER_RADIUS } from '@/design-system/tokens';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
  className?: string;
  onClick?: () => void;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = false,
  className = '',
  onClick,
}) => {
  const baseClasses = 'inline-flex items-center font-medium transition-colors duration-200';

  const variantClasses = {
    default: `bg-[${COLORS.neutral[100]}] text-[${COLORS.neutral[800]}]`,
    primary: 'bg-[var(--theme-accent-bg,#eff6ff)] text-[var(--theme-accent-text,#1d4ed8)]',
    secondary: `bg-[${COLORS.neutral[100]}] text-[${COLORS.neutral[600]}]`,
    success: `bg-[${COLORS.semantic.success[100]}] text-[${COLORS.semantic.success[900]}]`,
    warning: `bg-[${COLORS.semantic.warning[100]}] text-[${COLORS.semantic.warning[900]}]`,
    error: `bg-[${COLORS.semantic.error[100]}] text-[${COLORS.semantic.error[900]}]`,
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base',
  };

  const roundedClass = rounded
    ? `rounded-[${BORDER_RADIUS.full}]`
    : `rounded-[${BORDER_RADIUS.md}]`;
  const clickClass = onClick ? 'cursor-pointer hover:opacity-80' : '';

  const classes = `${baseClasses} ${variantClasses?.[variant]} ${sizeClasses?.[size]} ${roundedClass} ${clickClass} ${className}`;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <span
      className={classes}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onKeyUp={e => {
        if (onClick && e.key === ' ') {
          e.preventDefault();
        }
      }}
    >
      {children}
    </span>
  );
};

export default Badge;
