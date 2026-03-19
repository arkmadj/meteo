/**
 * Label Atom Component
 * A versatile label component for form inputs and other UI elements
 */

import React, { forwardRef } from 'react';

import { COLORS, TYPOGRAPHY } from '../../../design-system/tokens';
import type { BaseComponentProps, ComponentSize } from '../base/BaseComponent';
import { componentUtils, useComponentState } from '../base/BaseComponent';

// ============================================================================
// LABEL SPECIFIC TYPES
// ============================================================================

export type LabelVariant = 'default' | 'bold' | 'muted' | 'error' | 'success';
export type LabelSize = ComponentSize;

// ============================================================================
// LABEL COMPONENT
// ============================================================================

export interface LabelProps
  extends Omit<BaseComponentProps, 'variant'>, React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Label variant */
  variant?: LabelVariant;
  /** Label size */
  size?: LabelSize;
  /** Label content */
  children: React.ReactNode;
  /** Whether the label is required (shows asterisk) */
  required?: boolean;
  /** Whether the label is optional (shows optional text) */
  optional?: boolean;
  /** Custom required indicator */
  requiredIndicator?: React.ReactNode;
  /** Custom optional indicator */
  optionalIndicator?: React.ReactNode;
  /** Associated input ID */
  htmlFor?: string;
  /** Whether to show tooltip on hover */
  tooltip?: string;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      variant = 'default',
      size = 'md',
      children,
      required = false,
      optional = false,
      requiredIndicator,
      optionalIndicator,
      htmlFor,
      tooltip,
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

    // ============================================================================
    // STYLES
    // ============================================================================

    const baseClasses = [
      'inline-block',
      'font-medium',
      'transition-colors',
      'duration-200',
      'cursor-pointer',
      'select-none',
    ].join(' ');

    const variantClasses: Record<LabelVariant, string> = {
      default: `text-[${COLORS.neutral[700]}]`,
      bold: `text-[${COLORS.neutral[900]}] font-semibold`,
      muted: `text-[${COLORS.neutral[500]}]`,
      error: `text-[${COLORS.semantic.error[600]}]`,
      success: `text-[${COLORS.semantic.success[600]}]`,
    };

    const sizeClasses: Record<LabelSize, string> = {
      xs: `text-[${TYPOGRAPHY.fontSize.xs[0]}]`,
      sm: `text-[${TYPOGRAPHY.fontSize.sm[0]}]`,
      md: `text-[${TYPOGRAPHY.fontSize.base[0]}]`,
      lg: `text-[${TYPOGRAPHY.fontSize.lg[0]}]`,
      xl: `text-[${TYPOGRAPHY.fontSize.xl[0]}]`,
    };

    const disabledClasses = isDisabled ? ['opacity-50', 'cursor-not-allowed'].join(' ') : '';

    // ============================================================================
    // RENDER
    // ============================================================================

    const propsForClasses: BaseComponentProps = {
      size,
      disabled: isDisabled,
      className,
    };

    const coreClasses = componentUtils.generateClasses(
      baseClasses,
      propsForClasses,
      undefined,
      sizeClasses
    );

    const classes = [coreClasses, variantClasses?.[variant], disabledClasses]
      .filter(Boolean)
      .join(' ');

    return (
      <label
        ref={ref}
        className={classes}
        data-testid={testId}
        htmlFor={htmlFor}
        title={tooltip}
        {...props}
      >
        {/* Label Content */}
        <span className="flex items-center gap-1">
          {children}

          {/* Required Indicator */}
          {required && (
            <span
              aria-label="required"
              className={`text-[${COLORS.semantic.error[500]}] font-normal`}
            >
              {requiredIndicator || '*'}
            </span>
          )}

          {/* Optional Indicator */}
          {optional && !required && (
            <span
              aria-label="optional"
              className={`text-[${COLORS.neutral[400]}] font-normal text-xs`}
            >
              {optionalIndicator || '(optional)'}
            </span>
          )}
        </span>
      </label>
    );
  }
);

Label.displayName = 'Label';

export default Label;
