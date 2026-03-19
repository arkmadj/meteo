/**
 * Switch Atom Component
 * An ARIA-compliant toggle switch component with full keyboard support and visible focus indicators
 *
 * Accessibility Features:
 * - WCAG 2.1 AA compliant with proper ARIA attributes
 * - Full keyboard navigation (Space, Enter, Arrow keys)
 * - Visible focus indicators with high contrast
 * - Screen reader announcements for state changes
 * - Disabled and loading state management
 * - Proper labeling and descriptions
 *
 * @example
 * ```tsx
 * <Switch
 *   label="Enable notifications"
 *   checked={isEnabled}
 *   onCheckedChange={setIsEnabled}
 *   description="Receive email notifications for updates"
 * />
 * ```
 */

import React, { forwardRef, useEffect, useRef, useState } from 'react';

import { useTheme } from '../../../design-system/theme';
import type { BaseComponentProps, ComponentSize } from '../base/BaseComponent';
import { IconWrapper, useComponentState } from '../base/BaseComponent';

// ============================================================================
// SWITCH SPECIFIC TYPES
// ============================================================================

export type SwitchSize = ComponentSize;
export type SwitchVariant = 'default' | 'filled' | 'outlined';

// ============================================================================
// SWITCH COMPONENT
// ============================================================================

export interface SwitchProps
  extends
    Omit<BaseComponentProps, 'variant'>,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Switch size */
  size?: SwitchSize;
  /** Switch variant */
  variant?: SwitchVariant;
  /** Switch label */
  label?: string | React.ReactNode;
  /** Whether the label should be hidden visually */
  hiddenLabel?: boolean;
  /** Description text */
  description?: string;
  /** Error message */
  errorMessage?: string;
  /** Whether the switch has an error */
  error?: boolean;
  /** Helper text */
  helperText?: string;
  /** Custom on icon */
  onIcon?: React.ReactNode;
  /** Custom off icon */
  offIcon?: React.ReactNode;
  /** Show icons in the switch */
  showIcons?: boolean;
  /** Controlled checked state */
  checked?: boolean;
  /** Default checked state */
  defaultChecked?: boolean;
  /** Change handler */
  onCheckedChange?: (checked: boolean) => void;
  /** Loading state */
  loading?: boolean;
  /** ARIA label for the switch (overrides label for screen readers) */
  'aria-label'?: string;
  /** ARIA labelledby for the switch */
  'aria-labelledby'?: string;
  /** Whether to auto-focus the switch on mount */
  autoFocus?: boolean;
  /** Custom focus ring color */
  focusRingColor?: string;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      size = 'md',
      variant = 'default',
      label,
      hiddenLabel = false,
      description,
      errorMessage,
      error = false,
      helperText,
      onIcon,
      offIcon,
      showIcons = false,
      checked,
      defaultChecked = false,
      disabled,
      loading = false,
      className,
      testId,
      onChange,
      onCheckedChange,
      autoFocus = false,
      focusRingColor,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...props
    },
    ref
  ) => {
    const { isDisabled } = useComponentState({
      disabled: disabled || loading,
      testId,
    });

    const { _theme } = useTheme();

    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const [isFocused, setIsFocused] = useState(false);
    const switchRef = useRef<HTMLDivElement>(null);
    const isControlled = checked !== undefined;
    const currentChecked = isControlled ? checked : internalChecked;

    // Auto-focus on mount if requested
    useEffect(() => {
      if (autoFocus && switchRef.current) {
        switchRef.current.focus();
      }
    }, [autoFocus]);

    // ============================================================================
    // STYLES
    // ============================================================================

    const containerClasses = [
      'inline-flex',
      'items-center',
      'gap-3',
      isDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
      'select-none',
    ].join(' ');

    // Enhanced focus ring with better visibility
    const focusRingClasses = isFocused
      ? [
          'ring-2',
          'ring-offset-2',
          focusRingColor ? `ring-[${focusRingColor}]` : 'ring-[var(--theme-accent)]',
          'ring-offset-[var(--theme-background)]',
        ].join(' ')
      : '';

    const switchWrapperClasses = [
      'relative',
      'inline-flex',
      'items-center',
      'transition-all',
      'duration-200',
      'ease-in-out',
      'rounded-full',
      'outline-none',
      focusRingClasses,
    ].join(' ');

    const switchTrackClasses = [
      'relative',
      'flex',
      'items-center',
      'transition-all',
      'duration-300',
      'ease-in-out',
      'rounded-full',
    ].join(' ');

    const switchThumbClasses = [
      'absolute',
      'flex',
      'items-center',
      'justify-center',
      'transition-all',
      'duration-300',
      'ease-in-out',
      'rounded-full',
      'shadow-sm',
    ].join(' ');

    const sizeClasses: Record<
      SwitchSize,
      {
        track: string;
        thumb: string;
        translate: string;
      }
    > = {
      xs: {
        track: 'w-8 h-4',
        thumb: 'w-3 h-3',
        translate: 'translate-x-4',
      },
      sm: {
        track: 'w-10 h-5',
        thumb: 'w-4 h-4',
        translate: 'translate-x-5',
      },
      md: {
        track: 'w-12 h-6',
        thumb: 'w-5 h-5',
        translate: 'translate-x-6',
      },
      lg: {
        track: 'w-14 h-7',
        thumb: 'w-6 h-6',
        translate: 'translate-x-7',
      },
      xl: {
        track: 'w-16 h-8',
        thumb: 'w-7 h-7',
        translate: 'translate-x-8',
      },
    };

    const variantClasses: Record<
      SwitchVariant,
      {
        trackOff: string;
        trackOn: string;
        thumbOff: string;
        thumbOn: string;
      }
    > = {
      default: {
        trackOff: 'bg-[var(--theme-border-light)]',
        trackOn: 'bg-[var(--theme-accent)]',
        thumbOff: 'bg-white dark:bg-gray-100',
        thumbOn: 'bg-white dark:bg-gray-100',
      },
      filled: {
        trackOff: 'bg-[var(--theme-border)]',
        trackOn: 'bg-[var(--theme-accent)]',
        thumbOff: 'bg-[var(--theme-surface)]',
        thumbOn: 'bg-white dark:bg-gray-100',
      },
      outlined: {
        trackOff: 'bg-transparent border-2 border-[var(--theme-border-light)]',
        trackOn: 'bg-[var(--theme-accent)] border-2 border-[var(--theme-accent)]',
        thumbOff: 'bg-[var(--theme-border)]',
        thumbOn: 'bg-white dark:bg-gray-100',
      },
    };

    const stateClasses = {
      error: {
        track: 'border-[var(--theme-error-text)]',
        focus: 'focus-within:ring-[var(--theme-error-text)]',
      },
      disabled: ['opacity-50', 'cursor-not-allowed'].join(' '),
      loading: ['animate-pulse', 'cursor-wait'].join(' '),
    };

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;

      if (!isControlled) {
        setInternalChecked(newChecked);
      }

      onCheckedChange?.(newChecked);
      onChange?.(e);
    };

    const handleClick = () => {
      if (!isDisabled && !loading) {
        const fakeEvent = {
          target: { checked: !currentChecked },
        } as React.ChangeEvent<HTMLInputElement>;
        handleChange(fakeEvent);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Prevent default for Space to avoid page scroll
      if (e.key === ' ') {
        e.preventDefault();
      }

      // Handle Space and Enter keys
      if ((e.key === ' ' || e.key === 'Enter') && !isDisabled && !loading) {
        e.preventDefault();
        handleClick();
      }

      // Handle Arrow keys for accessibility (optional enhancement)
      // ArrowRight/ArrowUp = turn on, ArrowLeft/ArrowDown = turn off
      if (!isDisabled && !loading) {
        if ((e.key === 'ArrowRight' || e.key === 'ArrowUp') && !currentChecked) {
          e.preventDefault();
          handleClick();
        } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowDown') && currentChecked) {
          e.preventDefault();
          handleClick();
        }
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    // ============================================================================
    // RENDER
    // ============================================================================

    const switchId = testId || `switch-${Math.random().toString(36).substr(2, 9)}`;

    const currentSize = sizeClasses?.[size];
    const currentVariant = variantClasses?.[variant];

    // Build track classes
    let trackClasses = `${switchTrackClasses} ${currentSize.track} transition-colors duration-200`;
    if (error) {
      trackClasses += ` ${stateClasses.error.track}`;
    } else {
      trackClasses += ` ${currentChecked ? currentVariant.trackOn : currentVariant.trackOff}`;
      // Add hover state for non-disabled switches
      if (!isDisabled && !loading) {
        trackClasses += ` hover:brightness-110`;
      }
    }

    if (isDisabled) {
      trackClasses += ` ${stateClasses.disabled}`;
    }

    if (loading) {
      trackClasses += ` ${stateClasses.loading}`;
    }

    // Build thumb classes
    let thumbClasses = `${switchThumbClasses} ${currentSize.thumb} transition-all duration-200`;
    thumbClasses += ` ${currentChecked ? currentVariant.thumbOn : currentVariant.thumbOff}`;
    thumbClasses += ` ${currentChecked ? currentSize.translate : 'translate-x-0.5'}`;
    // Add subtle shadow for active state
    if (currentChecked && !isDisabled && !loading) {
      thumbClasses += ' shadow-md';
    }

    // Build wrapper classes
    const wrapperClasses = `${switchWrapperClasses} ${currentSize.track}`;

    // Determine ARIA label
    const effectiveAriaLabel = ariaLabel || (typeof label === 'string' ? label : undefined);

    return (
      <div className={`${containerClasses} ${className ?? ''}`}>
        {/* Hidden Input for form integration */}
        <input
          ref={ref}
          aria-describedby={
            error && errorMessage
              ? `${switchId}-error`
              : helperText
                ? `${switchId}-helper`
                : description
                  ? `${switchId}-description`
                  : undefined
          }
          aria-invalid={error}
          checked={currentChecked}
          className="sr-only"
          data-testid={testId}
          disabled={isDisabled}
          id={switchId}
          type="checkbox"
          onChange={handleChange}
          {...props}
        />

        {/* Visual Switch with ARIA role */}
        <div
          ref={switchRef}
          aria-checked={currentChecked}
          aria-describedby={
            error && errorMessage
              ? `${switchId}-error`
              : helperText
                ? `${switchId}-helper`
                : description
                  ? `${switchId}-description`
                  : undefined
          }
          aria-disabled={isDisabled}
          aria-invalid={error}
          aria-label={effectiveAriaLabel}
          aria-labelledby={
            ariaLabelledBy || (label && !ariaLabel ? `${switchId}-label` : undefined)
          }
          className={wrapperClasses}
          role="switch"
          tabIndex={isDisabled ? -1 : 0}
          onBlur={handleBlur}
          onClick={handleClick}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
        >
          <div className={trackClasses}>
            <div className={thumbClasses}>
              {showIcons && (
                <IconWrapper
                  className={
                    currentChecked
                      ? 'text-white dark:text-gray-100'
                      : 'text-[var(--theme-text-secondary)]'
                  }
                  size="xs"
                >
                  {currentChecked
                    ? onIcon || (
                        <svg fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )
                    : offIcon || (
                        <svg fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                      )}
                </IconWrapper>
              )}
            </div>
          </div>
        </div>

        {/* Label and Description */}
        {(label || description || helperText || (error && errorMessage)) && (
          <div className="flex flex-col gap-1">
            {label && (
              <label
                className={`font-medium transition-colors duration-200 ${
                  hiddenLabel
                    ? 'sr-only'
                    : `${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:text-[var(--theme-text)]'}`
                }`}
                style={{
                  color: isDisabled ? 'var(--theme-text-secondary)' : 'var(--theme-text)',
                }}
                htmlFor={switchId}
                id={`${switchId}-label`}
              >
                {label}
              </label>
            )}

            {description && (
              <p
                className="text-sm transition-colors duration-200"
                style={{ color: 'var(--theme-text-secondary)' }}
                id={`${switchId}-description`}
              >
                {description}
              </p>
            )}

            {helperText && (
              <p
                className="text-sm transition-colors duration-200"
                style={{ color: 'var(--theme-text-secondary)' }}
                id={`${switchId}-helper`}
              >
                {helperText}
              </p>
            )}

            {error && errorMessage && (
              <p
                aria-live="polite"
                className="text-sm transition-colors duration-200"
                style={{ color: 'var(--theme-error-text)' }}
                id={`${switchId}-error`}
                role="alert"
              >
                {errorMessage}
              </p>
            )}
          </div>
        )}

        {/* Screen reader only live region for state announcements */}
        <div aria-atomic="true" aria-live="polite" className="sr-only">
          {loading && 'Loading'}
          {!loading && currentChecked && 'On'}
          {!loading && !currentChecked && 'Off'}
        </div>
      </div>
    );
  }
);

Switch.displayName = 'Switch';

export default Switch;
