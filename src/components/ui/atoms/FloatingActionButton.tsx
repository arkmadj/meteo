/**
 * Floating Action Button (FAB) Atom Component
 * A circular button that floats above the UI for quick access to primary actions
 * Fully theme-aware with support for accent colors and design tokens
 */

import React, { forwardRef, useState } from 'react';

import { useTheme } from '@/design-system/theme';
import { COLORS } from '@/design-system/tokens';
import { usePrefersReducedMotion } from '@/hooks/useMotion';

import type { BaseComponentProps, ComponentSize } from '../base/BaseComponent';
import { IconWrapper, Spinner, useComponentState } from '../base/BaseComponent';

// ============================================================================
// FAB SPECIFIC TYPES
// ============================================================================

export type FABSize = Exclude<ComponentSize, 'xs'>;
export type FABPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
export type FABVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error';

// ============================================================================
// FAB COMPONENT
// ============================================================================

export interface FloatingActionButtonProps
  extends
    Omit<BaseComponentProps, 'variant' | 'fullWidth'>,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  /** FAB variant/color */
  variant?: FABVariant;
  /** FAB size */
  size?: FABSize;
  /** FAB position on screen */
  position?: FABPosition;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Text label (for extended FAB) */
  label?: string;
  /** Whether to show a badge */
  badge?: number | string;
  /** Whether to show a tooltip */
  tooltip?: string;
  /** Whether to pulse on first load */
  pulse?: boolean;
  /** Whether this is a mini FAB */
  mini?: boolean;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
}

const FloatingActionButton = forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      position = 'bottom-right',
      icon,
      label,
      badge,
      tooltip,
      pulse = false,
      mini = false,
      disabled,
      loading,
      className,
      testId,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const {
      isDisabled,
      isLoading,
      testId: defaultTestId,
    } = useComponentState({
      disabled,
      loading,
      testId,
    });

    const [showTooltip, setShowTooltip] = useState(false);
    const { theme } = useTheme();
    const prefersReducedMotion = usePrefersReducedMotion();

    // ============================================================================
    // STYLES
    // ============================================================================

    const baseClasses = [
      'fixed',
      'z-40',
      'rounded-full',
      'flex items-center justify-center',
      'shadow-lg hover:shadow-2xl',
      prefersReducedMotion ? 'transition-none' : 'transition-all duration-300',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'border-none cursor-pointer',
      // Hardware acceleration
      'will-change-transform',
      'backface-visibility-hidden',
    ];

    // Position classes
    const positionClasses: Record<FABPosition, string> = {
      'bottom-left': 'bottom-6 left-6',
      'bottom-right': 'bottom-6 right-6',
      'top-left': 'top-6 left-6',
      'top-right': 'top-6 right-6',
    };

    // Get theme-aware variant styles
    const getVariantStyle = (): React.CSSProperties => {
      switch (variant) {
        case 'primary':
          return {
            backgroundColor: theme.accentColor,
            color: '#ffffff',
          };
        case 'secondary':
          return {
            backgroundColor: theme.isDark ? COLORS.neutral[700] : COLORS.neutral[600],
            color: '#ffffff',
          };
        case 'success':
          return {
            backgroundColor: COLORS.semantic.success[500],
            color: '#ffffff',
          };
        case 'warning':
          return {
            backgroundColor: COLORS.semantic.warning[500],
            color: '#ffffff',
          };
        case 'error':
          return {
            backgroundColor: COLORS.semantic.error[500],
            color: '#ffffff',
          };
        default:
          return {
            backgroundColor: theme.accentColor,
            color: '#ffffff',
          };
      }
    };

    // Get hover styles
    const _getHoverStyle = (): React.CSSProperties => {
      switch (variant) {
        case 'primary':
          return {
            filter: 'brightness(0.9)',
          };
        case 'secondary':
          return {
            backgroundColor: theme.isDark ? COLORS.neutral[800] : COLORS.neutral[700],
          };
        case 'success':
          return {
            backgroundColor: COLORS.semantic.success[600],
          };
        case 'warning':
          return {
            backgroundColor: COLORS.semantic.warning[600],
          };
        case 'error':
          return {
            backgroundColor: COLORS.semantic.error[600],
          };
        default:
          return {
            filter: 'brightness(0.9)',
          };
      }
    };

    // Size classes
    const sizeClasses: Record<FABSize, string> = {
      sm: mini ? 'w-10 h-10' : 'w-12 h-12',
      md: mini ? 'w-12 h-12' : 'w-14 h-14',
      lg: mini ? 'w-14 h-14' : 'w-16 h-16',
      xl: mini ? 'w-16 h-16' : 'w-20 h-20',
    };

    // Extended FAB (with label)
    const extendedClasses = label ? ['w-auto', 'px-6', 'rounded-full', 'gap-2'].join(' ') : '';

    // Interactive states
    const interactiveClasses = [
      isDisabled
        ? 'opacity-50 cursor-not-allowed'
        : prefersReducedMotion
          ? ''
          : 'hover:scale-110 active:scale-95',
      pulse && !isDisabled && !prefersReducedMotion ? 'animate-pulse' : '',
    ];

    // Combine all classes
    const classes = [
      ...baseClasses,
      positionClasses[position],
      sizeClasses[size],
      extendedClasses,
      ...interactiveClasses,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Combine inline styles
    const inlineStyles: React.CSSProperties = {
      ...getVariantStyle(),
    };

    // ============================================================================
    // RENDER
    // ============================================================================

    return (
      <>
        <button
          ref={ref}
          className={classes}
          style={inlineStyles}
          data-testid={testId || defaultTestId}
          disabled={isDisabled || isLoading}
          type={type}
          aria-label={tooltip || (typeof icon === 'string' ? icon : 'Action button')}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          {...props}
        >
          {/* Ripple effect overlay */}
          <span
            className={`absolute inset-0 rounded-full ${prefersReducedMotion ? '' : 'transition-opacity duration-200'}`}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              opacity: 0,
            }}
            onMouseEnter={e => {
              if (!isDisabled && !prefersReducedMotion) {
                (e.target as HTMLElement).style.opacity = '1';
              }
            }}
            onMouseLeave={e => {
              if (!prefersReducedMotion) {
                (e.target as HTMLElement).style.opacity = '0';
              }
            }}
          />

          {/* Loading Spinner */}
          {isLoading ? (
            <Spinner size={size === 'sm' ? 'sm' : 'md'} />
          ) : (
            <>
              {/* Icon */}
              {icon && (
                <IconWrapper size={size} className="relative z-10">
                  {icon}
                </IconWrapper>
              )}

              {/* Label for extended FAB */}
              {label && (
                <span className="relative z-10 font-semibold text-sm whitespace-nowrap">
                  {label}
                </span>
              )}
            </>
          )}

          {/* Badge */}
          {badge && !isLoading && (
            <span
              className="
                absolute -top-1 -right-1
                min-w-[20px] h-5 px-1.5
                flex items-center justify-center
                rounded-full
                border-2
                text-xs font-semibold
              "
              style={{
                backgroundColor: COLORS.semantic.error[500],
                color: '#ffffff',
                borderColor: theme.backgroundColor,
              }}
            >
              {badge}
            </span>
          )}

          {/* Tooltip */}
          {tooltip && showTooltip && !isLoading && (
            <span
              className={`
                absolute ${position.includes('left') ? 'left-full ml-3' : 'right-full mr-3'}
                top-1/2 -translate-y-1/2
                px-3 py-2
                rounded-lg shadow-lg
                text-sm whitespace-nowrap
                pointer-events-none
                ${prefersReducedMotion ? '' : 'transition-opacity duration-200'}
              `}
              style={{
                backgroundColor: theme.isDark ? COLORS.neutral[800] : COLORS.neutral[700],
                color: '#ffffff',
                opacity: 1,
              }}
              role="tooltip"
            >
              {tooltip}
            </span>
          )}
        </button>
      </>
    );
  }
);

FloatingActionButton.displayName = 'FloatingActionButton';

// ============================================================================
// EXPORTS
// ============================================================================

export default FloatingActionButton;
