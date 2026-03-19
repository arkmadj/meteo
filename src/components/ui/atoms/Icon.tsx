/**
 * Icon Atom Component
 * A versatile icon component with consistent sizing and theming
 */

import React, { forwardRef } from 'react';

import { COLORS } from '../../../design-system/tokens';
import type { BaseComponentProps, ComponentSize, ComponentVariant } from '../base/BaseComponent';
import { componentUtils } from '../base/BaseComponent';

// ============================================================================
// ICON SPECIFIC TYPES
// ============================================================================

export type IconSize = ComponentSize | 'inherit';
export type IconColor = ComponentVariant | 'inherit' | 'current';

// Predefined icon names (you can extend this)
export type IconName =
  | 'search'
  | 'close'
  | 'check'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'chevron-right'
  | 'menu'
  | 'user'
  | 'settings'
  | 'home'
  | 'heart'
  | 'star'
  | 'plus'
  | 'minus'
  | 'edit'
  | 'delete'
  | 'info'
  | 'warning'
  | 'error'
  | 'success'
  | 'loading';

// ============================================================================
// ICON COMPONENT
// ============================================================================

export interface IconProps
  extends Omit<BaseComponentProps, 'size'>, Omit<React.SVGProps<SVGSVGElement>, 'size'> {
  /** Icon name or custom SVG */
  name?: IconName;
  /** Custom SVG content */
  children?: React.ReactNode;
  /** Icon size */
  size?: IconSize;
  /** Icon color */
  color?: IconColor;
  /** Whether the icon should spin (for loading states) */
  spin?: boolean;
  /** Rotation angle in degrees */
  rotate?: number;
  /** Flip direction */
  flip?: 'horizontal' | 'vertical' | 'both';
  /**
   * Whether the icon is purely decorative (hides from screen readers)
   * Use this when icon is next to text or doesn't convey unique information
   */
  decorative?: boolean;
  /**
   * Accessible label for the icon (for meaningful icons without adjacent text)
   * Automatically sets role="img" and creates a <title> element
   */
  label?: string;
}

// Icon SVG definitions
const iconDefinitions: Record<IconName, string> = {
  search: `
    <path d="M21 21l-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0z"/>
  `,
  close: `
    <path d="M18 6L6 18M6 6l12 12"/>
  `,
  check: `
    <path d="M20 6L9 17l-5-5"/>
  `,
  'chevron-down': `
    <path d="M6 9l6 6 6-6"/>
  `,
  'chevron-up': `
    <path d="M18 15l-6-6-6 6"/>
  `,
  'chevron-left': `
    <path d="M15 18l-6-6 6-6"/>
  `,
  'chevron-right': `
    <path d="M9 18l6-6-6-6"/>
  `,
  menu: `
    <path d="M4 6h16M4 12h16M4 18h16"/>
  `,
  user: `
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  `,
  settings: `
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  `,
  home: `
    <path d="M3 12l2 2 7-7 7 7 2-2"/>
    <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>
    <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"/>
  `,
  heart: `
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  `,
  star: `
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  `,
  plus: `
    <path d="M12 5v14M5 12h14"/>
  `,
  minus: `
    <path d="M5 12h14"/>
  `,
  edit: `
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  `,
  delete: `
    <path d="M3 6h18"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <path d="M10 11v6"/>
    <path d="M14 11v6"/>
  `,
  info: `
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4"/>
    <path d="M12 8h.01"/>
  `,
  warning: `
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <path d="M12 9v4"/>
    <path d="M12 17h.01"/>
  `,
  error: `
    <circle cx="12" cy="12" r="10"/>
    <path d="M15 9l-6 6"/>
    <path d="M9 9l6 6"/>
  `,
  success: `
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22,4 12,14.01 9,11.01"/>
  `,
  loading: `
    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
  `,
};

const Icon = forwardRef<SVGSVGElement, IconProps>(
  (
    {
      name,
      children,
      size = 'md',
      color = 'current',
      spin = false,
      rotate,
      flip,
      decorative = false,
      label,
      disabled: _disabled,
      className,
      testId,
      ...props
    },
    ref
  ) => {
    // ============================================================================
    // STYLES
    // ============================================================================

    const sizeClasses: Record<IconSize, string> = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-8 h-8',
      inherit: 'w-auto h-auto',
    };

    const colorClasses: Record<IconColor, string> = {
      default: `text-[${COLORS.neutral[600]}]`,
      primary: `text-[${COLORS.primary[500]}]`,
      secondary: `text-[${COLORS.neutral[500]}]`,
      success: `text-[${COLORS.semantic.success[500]}]`,
      warning: `text-[${COLORS.semantic.warning[500]}]`,
      error: `text-[${COLORS.semantic.error[500]}]`,
      info: `text-[${COLORS.semantic.info[500]}]`,
      current: 'text-current',
      inherit: 'text-inherit',
    };

    const baseClasses = ['inline-block', 'flex-shrink-0', 'transition-colors', 'duration-200'].join(
      ' '
    );

    // ============================================================================
    // TRANSFORMS
    // ============================================================================

    const transforms = [];

    if (spin) {
      transforms.push('animate-spin');
    }

    if (rotate) {
      transforms.push(`rotate-[${rotate}deg]`);
    }

    if (flip) {
      if (flip === 'horizontal') {
        transforms.push('scale-x-[-1]');
      } else if (flip === 'vertical') {
        transforms.push('scale-y-[-1]');
      } else if (flip === 'both') {
        transforms.push('scale-[-1]');
      }
    }

    const transformClass = transforms.length > 0 ? transforms.join(' ') : '';

    // ============================================================================
    // RENDER
    // ============================================================================

    const coreClasses = componentUtils.generateClasses(
      baseClasses,
      { className } as BaseComponentProps,
      undefined,
      undefined
    );

    const classes =
      `${coreClasses} ${sizeClasses?.[size]} ${colorClasses?.[color]} ${transformClass}`.trim();

    const iconContent = children || (name ? iconDefinitions?.[name] : null);

    if (!iconContent) {
      console.warn('Icon component requires either a name prop or children');
      return null;
    }

    // ============================================================================
    // ACCESSIBILITY
    // ============================================================================

    // Determine accessibility attributes
    const isDecorative = decorative || (!label && !props['aria-label']);
    const accessibleLabel = label || props['aria-label'];
    const titleId = accessibleLabel ? `icon-title-${name || 'custom'}` : undefined;

    // Build accessibility props
    const a11yProps: React.SVGProps<SVGSVGElement> = {
      'aria-hidden': isDecorative ? true : undefined,
      'aria-labelledby': accessibleLabel && titleId ? titleId : undefined,
      role: accessibleLabel ? 'img' : undefined,
    };

    return (
      <svg
        ref={ref}
        className={classes}
        data-testid={testId}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        {...a11yProps}
        {...props}
      >
        {accessibleLabel && titleId && <title id={titleId}>{accessibleLabel}</title>}
        {typeof iconContent === 'string' ? (
          <g dangerouslySetInnerHTML={{ __html: iconContent }} />
        ) : (
          iconContent
        )}
      </svg>
    );
  }
);

Icon.displayName = 'Icon';

export default Icon;
