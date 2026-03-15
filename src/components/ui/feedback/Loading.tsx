/**
 * Loading Component
 * Loading spinner and loading states
 */

import React from 'react';

import { useTheme } from '@/design-system/theme';
import { COLORS } from '@/design-system/tokens';

export type LoadingSize = 'sm' | 'md' | 'lg';
export type LoadingColor = 'primary' | 'neutral' | 'white';

export interface LoadingProps {
  size?: LoadingSize;
  color?: LoadingColor;
  className?: string;
  text?: string;
  inline?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  text,
  inline = false,
}) => {
  const { theme } = useTheme();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const colorClasses = {
    primary: `text-[${theme.primaryColor}]`,
    neutral: `text-[${COLORS.neutral[500]}]`,
    white: 'text-white',
  };

  const spinnerClasses = `animate-spin rounded-full border-2 border-current border-t-transparent ${sizeClasses?.[size]} ${colorClasses?.[color]} ${className}`;

  if (inline) {
    return <div className={spinnerClasses} />;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className={spinnerClasses} />
      {text && (
        <p
          className={`text-sm ${color === 'white' ? 'text-white' : `text-[${COLORS.neutral[600]}]`}`}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default Loading;
