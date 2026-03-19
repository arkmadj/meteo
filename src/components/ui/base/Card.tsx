import React from 'react';

import { useTheme } from '@/design-system/theme';
import { COLORS, BORDER_RADIUS, COMPONENT_TOKENS } from '@/design-system/tokens';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardShadow = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: CardPadding;
  shadow?: CardShadow;
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  hover = false,
  onClick,
}) => {
  const { theme } = useTheme();

  const baseClasses = `bg-[${theme.surfaceColor}] rounded-[${BORDER_RADIUS.xl}] border border-[${COLORS.neutral[200]}] transition-all duration-200`;

  const paddingClasses = {
    none: '',
    sm: `p-[${COMPONENT_TOKENS.card.padding.sm}]`,
    md: `p-[${COMPONENT_TOKENS.card.padding.md}]`,
    lg: `p-[${COMPONENT_TOKENS.card.padding.lg}]`,
  };

  const shadowClasses = {
    none: '',
    sm: `shadow-[${COMPONENT_TOKENS.card.shadow.sm}]`,
    md: `shadow-[${COMPONENT_TOKENS.card.shadow.md}]`,
    lg: `shadow-[${COMPONENT_TOKENS.card.shadow.lg}]`,
  };

  const hoverClass = hover ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';
  const clickClass = onClick ? 'cursor-pointer' : '';

  const classes = `${baseClasses} ${paddingClasses?.[padding]} ${shadowClasses?.[shadow]} ${hoverClass} ${clickClass} ${className}`;

  return (
    <div
      className={classes}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={e => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      onKeyUp={e => {
        if (onClick && e.key === ' ') {
          e.preventDefault();
        }
      }}
    >
      {children}
    </div>
  );
};

export default Card;
