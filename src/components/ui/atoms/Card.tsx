/**
 * Card Atom Component
 * A versatile container component for grouping related content and actions
 */

import React from 'react';

import { COLORS, SHADOWS } from '../../../design-system/tokens';
import type { BaseComponentProps, ComponentSize, ComponentVariant } from '../base/BaseComponent';
import { useComponentState } from '../base/BaseComponent';

// ============================================================================
// CARD SPECIFIC TYPES
// ============================================================================

export type CardSize = ComponentSize;
export type CardVariant = ComponentVariant | 'outlined' | 'filled';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type CardShadow = 'none' | 'sm' | 'md' | 'lg' | 'xl';

// ============================================================================
// CARD COMPONENT
// ============================================================================

export interface CardProps
  extends
    Omit<BaseComponentProps, 'variant'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  /** Card size */
  size?: CardSize;
  /** Card variant */
  variant?: CardVariant;
  /** Card padding */
  padding?: CardPadding;
  /** Card shadow/elevation */
  shadow?: CardShadow;
  /** Whether the card is clickable */
  clickable?: boolean;
  /** Whether the card is disabled */
  disabled?: boolean;
  /** Whether the card is selected/highlighted */
  selected?: boolean;
  /** Click handler for clickable cards */
  onClick?: () => void;
  /** Card header content */
  header?: React.ReactNode;
  /** Card footer content */
  footer?: React.ReactNode;
  /** Card content/body */
  children?: React.ReactNode;
}

// ============================================================================
// CARD SUB-COMPONENTS
// ============================================================================

interface CardHeaderProps extends BaseComponentProps {
  children?: React.ReactNode;
  /** Whether to show a border below the header */
  bordered?: boolean;
}

const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  bordered = true,
  className,
  ...props
}) => {
  const classes = [
    'px-3 py-2.5 sm:px-4 sm:py-3',
    bordered ? 'border-b border-[var(--theme-border)]' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

interface CardBodyProps extends BaseComponentProps {
  children?: React.ReactNode;
}

const CardBody: React.FC<CardBodyProps> = ({ children, className, ...props }) => {
  const classes = ['px-3 py-3 sm:px-4 sm:py-4', className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

interface CardFooterProps extends BaseComponentProps {
  children?: React.ReactNode;
  /** Whether to show a border above the footer */
  bordered?: boolean;
}

const CardFooter: React.FC<CardFooterProps> = ({
  children,
  bordered = true,
  className,
  ...props
}) => {
  const classes = [
    'px-3 py-2.5 sm:px-4 sm:py-3',
    bordered ? 'border-t border-[var(--theme-border)]' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// ============================================================================
// MAIN CARD COMPONENT
// ============================================================================

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      size = 'md',
      variant = 'default',
      padding = 'md',
      shadow = 'md',
      clickable = false,
      disabled = false,
      selected = false,
      onClick,
      header,
      footer,
      children,
      className,
      testId,
      ...props
    },
    ref
  ) => {
    const { isDisabled } = useComponentState({
      disabled,
      testId,
    });

    // ============================================================================
    // STYLES
    // ============================================================================

    const baseClasses = [
      'bg-[var(--theme-surface)]',
      'rounded-lg',
      'transition-all duration-200',
      'relative',
    ];

    // Variant styles
    const variantClasses = {
      default: [
        'border border-[var(--theme-border)]',
        selected ? 'ring-2 ring-[var(--theme-accent)] border-[var(--theme-accent)]' : '',
      ],
      primary: [
        `bg-[${COLORS.primary[50]}]`,
        `border border-[${COLORS.primary[200]}]`,
        selected ? `ring-2 ring-[var(--theme-accent)] border-[var(--theme-accent)]` : '',
      ],
      secondary: [
        `bg-[${COLORS.neutral[50]}]`,
        `border border-[${COLORS.neutral[200]}]`,
        selected ? `ring-2 ring-[var(--theme-accent)] border-[var(--theme-accent)]` : '',
      ],
      success: [
        `bg-[${COLORS.semantic.success[50]}]`,
        `border border-[${COLORS.semantic.success[500]}]`,
        selected ? `ring-2 ring-[var(--theme-accent)] border-[var(--theme-accent)]` : '',
      ],
      warning: [
        `bg-[${COLORS.semantic.warning[50]}]`,
        `border border-[${COLORS.semantic.warning[500]}]`,
        selected
          ? `ring-2 ring-[${COLORS.semantic.warning[500]}] border-[${COLORS.semantic.warning[500]}]`
          : '',
      ],
      error: [
        `bg-[${COLORS.semantic.error[50]}]`,
        `border border-[${COLORS.semantic.error[500]}]`,
        selected
          ? `ring-2 ring-[${COLORS.semantic.error[500]}] border-[${COLORS.semantic.error[500]}]`
          : '',
      ],
      info: [
        `bg-[${COLORS.semantic.info[50]}]`,
        `border border-[${COLORS.semantic.info[500]}]`,
        selected
          ? `ring-2 ring-[${COLORS.semantic.info[500]}] border-[${COLORS.semantic.info[500]}]`
          : '',
      ],
      outlined: [
        'border-2 border-[var(--theme-border)] bg-transparent',
        selected ? 'ring-2 ring-[var(--theme-accent)] border-[var(--theme-accent)]' : '',
      ],
      filled: [
        'bg-[var(--theme-hover)] border border-[var(--theme-border)]',
        selected
          ? 'ring-2 ring-[var(--theme-accent)] border-[var(--theme-accent)] bg-[var(--theme-accent)]/10'
          : '',
      ],
    };

    // Shadow styles
    const shadowClasses = {
      none: '',
      sm: SHADOWS.sm,
      md: SHADOWS.md,
      lg: SHADOWS.lg,
      xl: SHADOWS.xl,
    };

    // Size styles (affects border radius)
    const sizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    };

    // Padding styles (only applied when no header/footer) - responsive
    const paddingClasses = {
      none: '',
      sm: 'p-2 sm:p-3',
      md: 'p-3 sm:p-4',
      lg: 'p-4 sm:p-6',
      xl: 'p-6 sm:p-8',
    };

    // Interactive styles
    const interactiveClasses = clickable
      ? [
          'cursor-pointer',
          'hover:shadow-lg',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          isDisabled ? 'cursor-not-allowed opacity-60' : 'hover:-translate-y-0.5',
        ]
      : [];

    // Combine all classes
    const cardClasses = [
      ...baseClasses,
      ...(variantClasses?.[variant] || variantClasses.default),
      shadowClasses?.[shadow],
      sizeClasses?.[size],
      // Only apply padding if no header/footer (they handle their own padding)
      !(header || footer) ? paddingClasses?.[padding] : '',
      ...interactiveClasses,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================

    const handleClick = () => {
      if (clickable && !isDisabled && onClick) {
        onClick();
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (clickable && !isDisabled && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onClick?.();
      }
    };

    // ============================================================================
    // RENDER
    // ============================================================================

    const cardContent = (
      <>
        {header && <CardHeader>{header}</CardHeader>}
        {children && (
          <CardBody className={header || footer ? '' : paddingClasses?.[padding]}>
            {children}
          </CardBody>
        )}
        {footer && <CardFooter>{footer}</CardFooter>}
      </>
    );

    if (clickable) {
      return (
        <div
          ref={ref}
          aria-disabled={isDisabled}
          className={cardClasses}
          data-testid={testId}
          role="button"
          tabIndex={isDisabled ? -1 : 0}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          {...props}
        >
          {cardContent}
        </div>
      );
    }

    return (
      <div ref={ref} className={cardClasses} data-testid={testId} {...props}>
        {cardContent}
      </div>
    );
  }
);

Card.displayName = 'Card';

// ============================================================================
// EXPORTS
// ============================================================================

export default Card;
export { CardBody, CardFooter, CardHeader };
export type { CardBodyProps, CardFooterProps, CardHeaderProps };
