/**
 * Dropdown Atom Component
 * A versatile dropdown menu component following atomic design principles
 * Supports theme responsiveness and aligns with existing UI aesthetics
 */

import React, { forwardRef, useState, useRef, useEffect } from 'react';

import type { BaseComponentProps, ComponentSize } from '../base/BaseComponent';
import { useComponentState, IconWrapper } from '../base/BaseComponent';
import { useTheme } from '@/design-system/theme';

// ============================================================================
// DROPDOWN SPECIFIC TYPES
// ============================================================================

export type DropdownVariant = 'default' | 'primary' | 'secondary' | 'ghost';
export type DropdownSize = ComponentSize;
export type DropdownPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  divider?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

// ============================================================================
// DROPDOWN COMPONENT
// ============================================================================

export interface DropdownProps extends Omit<BaseComponentProps, 'variant'> {
  /** Dropdown variant */
  variant?: DropdownVariant;
  /** Dropdown size */
  size?: DropdownSize;
  /** Dropdown items */
  items: DropdownItem[];
  /** Trigger element (button content) */
  trigger?: React.ReactNode;
  /** Dropdown placement */
  placement?: DropdownPlacement;
  /** Whether dropdown is open (controlled) */
  open?: boolean;
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Callback when dropdown opens/closes */
  onOpenChange?: (open: boolean) => void;
  /** Custom trigger icon */
  triggerIcon?: React.ReactNode;
  /** Whether to show trigger icon */
  showTriggerIcon?: boolean;
  /** Close on item click */
  closeOnItemClick?: boolean;
  /** Maximum dropdown height */
  maxHeight?: string;
  /** Custom dropdown class */
  dropdownClassName?: string;
}

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      variant = 'default',
      size = 'md',
      items,
      trigger = 'Menu',
      placement = 'bottom-start',
      open,
      defaultOpen = false,
      onOpenChange,
      triggerIcon,
      showTriggerIcon = true,
      closeOnItemClick = true,
      maxHeight = '300px',
      dropdownClassName,
      disabled,
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
    const { theme } = useTheme();

    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const isOpen = open !== undefined ? open : internalOpen;

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================

    const handleToggle = () => {
      if (isDisabled) return;
      const newOpen = !isOpen;
      setInternalOpen(newOpen);
      onOpenChange?.(newOpen);
    };

    const handleItemClick = (item: DropdownItem) => {
      if (item.disabled || item.divider) return;
      item.onClick?.();
      if (closeOnItemClick) {
        setInternalOpen(false);
        onOpenChange?.(false);
      }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(event.target as Node)
        ) {
          setInternalOpen(false);
          onOpenChange?.(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen, onOpenChange]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (isDisabled) return;

      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setInternalOpen(false);
        onOpenChange?.(false);
        triggerRef.current?.focus();
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggle();
      }
    };

    // ============================================================================
    // STYLES
    // ============================================================================

    const containerClasses = ['relative', 'inline-block'].join(' ');

    const baseTriggerClasses = [
      'inline-flex',
      'items-center',
      'justify-center',
      'gap-2',
      'font-medium',
      'rounded-lg',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
    ].join(' ');

    const variantClasses: Record<DropdownVariant, string> = {
      default: ['transition-colors', 'duration-200'].join(' '),

      primary: ['transition-colors', 'duration-200'].join(' '),

      secondary: ['transition-colors', 'duration-200'].join(' '),

      ghost: ['transition-colors', 'duration-200'].join(' '),
    };

    const sizeClasses: Record<DropdownSize, string> = {
      xs: ['px-2.5', 'py-1.5', 'text-xs'].join(' '),
      sm: ['px-3', 'py-2', 'text-sm'].join(' '),
      md: ['px-4', 'py-2.5', 'text-base'].join(' '),
      lg: ['px-5', 'py-3', 'text-lg'].join(' '),
      xl: ['px-6', 'py-3.5', 'text-xl'].join(' '),
    };

    const dropdownBaseClasses = [
      'absolute',
      'z-50',
      'mt-2',
      'min-w-[12rem]',
      'overflow-hidden',
      'transition-all',
      'duration-200',
      'origin-top',
      'rounded-lg',
    ].join(' ');

    const placementClasses: Record<DropdownPlacement, string> = {
      'bottom-start': 'left-0',
      'bottom-end': 'right-0',
      'top-start': 'left-0 bottom-full mb-2 mt-0',
      'top-end': 'right-0 bottom-full mb-2 mt-0',
    };

    const itemBaseClasses = [
      'w-full',
      'px-4',
      'py-2.5',
      'text-left',
      'text-sm',
      'transition-colors',
      'duration-150',
      'flex',
      'items-center',
      'gap-2',
    ].join(' ');

    const _propsForClasses: BaseComponentProps = {
      size,
      disabled: isDisabled,
      className,
    };

    const triggerClasses = [
      baseTriggerClasses,
      variantClasses?.[variant],
      sizeClasses?.[size],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const dropdownClasses = [
      dropdownBaseClasses,
      placementClasses?.[placement],
      dropdownClassName,
      isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none',
    ]
      .filter(Boolean)
      .join(' ');

    // ============================================================================
    // RENDER
    // ============================================================================

    const defaultTriggerIcon = (
      <svg
        className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
      </svg>
    );

    // Dynamic theme-based styles for trigger button
    const getTriggerStyles = () => {
      const variantStyles = {
        default: {
          backgroundColor: 'var(--theme-surface)',
          color: 'var(--theme-text)',
          borderColor: 'var(--theme-border)',
          borderWidth: '1px',
          borderStyle: 'solid',
        },
        primary: {
          backgroundColor: 'var(--theme-accent)',
          color: '#ffffff',
          borderColor: 'var(--theme-accent)',
          borderWidth: '1px',
          borderStyle: 'solid',
        },
        secondary: {
          backgroundColor: 'var(--theme-surface)',
          color: 'var(--theme-text)',
          borderColor: 'var(--theme-border)',
          borderWidth: '1px',
          borderStyle: 'solid',
        },
        ghost: {
          backgroundColor: 'transparent',
          color: 'var(--theme-text)',
          borderColor: 'transparent',
          borderWidth: '1px',
          borderStyle: 'solid',
        },
      };

      return variantStyles[variant];
    };

    // Dynamic theme-based styles for dropdown menu
    const getDropdownStyles = () => ({
      backgroundColor: 'var(--theme-surface)',
      borderColor: 'var(--theme-border)',
      borderWidth: '1px',
      borderStyle: 'solid',
      boxShadow: theme.isHighContrast ? 'none' : 'var(--theme-shadow)',
    });

    // Dynamic theme-based styles for dropdown items
    const getItemStyles = (item: DropdownItem) => {
      if (item.disabled) {
        return {
          color: 'var(--theme-text-secondary)',
          opacity: '0.5',
        };
      }

      if (item.danger) {
        return {
          color: 'var(--theme-error-text)',
        };
      }

      return {
        color: 'var(--theme-text)',
      };
    };

    return (
      <div ref={ref} className={containerClasses} {...props}>
        {/* Trigger Button */}
        <button
          ref={triggerRef}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className={triggerClasses}
          data-testid={testId}
          disabled={isDisabled}
          type="button"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          style={getTriggerStyles()}
          onMouseEnter={e => {
            if (!isDisabled) {
              e.currentTarget.style.backgroundColor = 'var(--theme-hover)';
            }
          }}
          onMouseLeave={e => {
            if (!isDisabled) {
              const styles = getTriggerStyles();
              e.currentTarget.style.backgroundColor = styles.backgroundColor;
            }
          }}
          onFocus={e => {
            if (!isDisabled) {
              e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.isHighContrast ? 'var(--theme-focus)' : 'var(--theme-accent)'}20`;
              e.currentTarget.style.borderColor = 'var(--theme-focus)';
            }
          }}
          onBlur={e => {
            const styles = getTriggerStyles();
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = styles.borderColor;
          }}
        >
          <span>{trigger}</span>
          {showTriggerIcon && (
            <IconWrapper size={size}>{triggerIcon || defaultTriggerIcon}</IconWrapper>
          )}
        </button>

        {/* Dropdown Menu */}
        <div
          ref={dropdownRef}
          className={dropdownClasses}
          role="menu"
          style={{
            maxHeight,
            ...getDropdownStyles(),
          }}
        >
          <div className="py-1 overflow-y-auto" style={{ maxHeight }}>
            {items.map(item => {
              if (item.divider) {
                return (
                  <div
                    key={item.id}
                    className="my-1 border-t"
                    style={{ borderColor: 'var(--theme-border-light)' }}
                    role="separator"
                  />
                );
              }

              const itemStyles = getItemStyles(item);

              return (
                <button
                  key={item.id}
                  className={itemBaseClasses}
                  disabled={item.disabled}
                  role="menuitem"
                  type="button"
                  onClick={() => handleItemClick(item)}
                  style={{
                    ...itemStyles,
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={e => {
                    if (!item.disabled) {
                      if (item.danger) {
                        e.currentTarget.style.backgroundColor = 'var(--theme-error-bg)';
                      } else {
                        e.currentTarget.style.backgroundColor = 'var(--theme-hover)';
                      }
                    }
                  }}
                  onMouseLeave={e => {
                    if (!item.disabled) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {item.icon && <IconWrapper size="sm">{item.icon}</IconWrapper>}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

Dropdown.displayName = 'Dropdown';

export default Dropdown;
