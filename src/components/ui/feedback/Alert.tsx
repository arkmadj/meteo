/**
 * Alert Component
 * Status messages and notifications with full theme support
 */

import React from 'react';

import { useTheme } from '@/design-system/theme';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  children: React.ReactNode;
  variant?: AlertVariant;
  className?: string;
  onClose?: () => void;
  title?: string;
  dismissible?: boolean;
}

const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  className = '',
  onClose,
  title,
  dismissible = true,
}) => {
  const { theme } = useTheme();

  // Base classes with theme-aware styling, mobile responsive padding and bottom margin
  const baseClasses =
    'p-3 sm:p-4 mb-4 rounded-md border-l-4 flex items-start gap-2 sm:gap-3 transition-colors duration-200';

  // Theme-aware variant classes using CSS custom properties
  const variantClasses = {
    info: theme.isDark
      ? 'bg-blue-900/30 border-blue-400 text-blue-100 dark:bg-blue-950/40 dark:border-blue-500'
      : 'bg-blue-50 border-blue-500 text-blue-900',
    success: theme.isDark
      ? 'bg-green-900/30 border-green-400 text-green-100 dark:bg-green-950/40 dark:border-green-500'
      : 'bg-green-50 border-green-500 text-green-900',
    warning: theme.isDark
      ? 'bg-amber-900/30 border-amber-400 text-amber-100 dark:bg-amber-950/40 dark:border-amber-500'
      : 'bg-amber-50 border-amber-500 text-amber-900',
    error: theme.isDark
      ? 'bg-red-900/30 border-red-400 text-red-100 dark:bg-red-950/40 dark:border-red-500'
      : 'bg-red-50 border-red-500 text-red-900',
  };

  const classes = `${baseClasses} ${variantClasses?.[variant]} ${className}`;

  return (
    <div className={classes} role="alert" aria-live="polite" aria-atomic="true">
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold mb-1 text-sm sm:text-base" style={{ color: 'inherit' }}>
            {title}
          </h4>
        )}
        <div className="text-xs sm:text-sm break-words" style={{ color: 'inherit' }}>
          {children}
        </div>
      </div>
      {dismissible && onClose && (
        <button
          type="button"
          aria-label="Close alert"
          className="text-current hover:opacity-75 transition-opacity flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded p-1 -mr-1 sm:mr-0 sm:p-0"
          onClick={onClose}
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M6 18L18 6M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Alert;
