/**
 * Design System Utilities
 * Helper functions for working with design tokens
 */

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, ANIMATION } from './tokens';

/**
 * Color Utility Functions
 */
export const colorUtils = {
  /**
   * Get a color value with optional shade
   * @param colorPath - Dot notation path (e.g., 'primary.500', 'semantic.success.500')
   * @param shade - Optional shade number
   * @returns Color value or fallback
   */
  get: (colorPath: string, shade?: number): string => {
    const parts = colorPath.split('.');
    let value: unknown = COLORS;

    for (const part of parts) {
      value = value?.[part];
    }

    if (shade !== undefined && typeof value === 'object') {
      return value?.[shade] || value;
    }

    return typeof value === 'string' ? value : colorPath;
  },

  /**
   * Get primary color with shade
   */
  primary: (shade: number = 500): string =>
    COLORS.primary?.[shade as keyof typeof COLORS.primary] || COLORS.primary[500],

  /**
   * Get semantic color
   */
  semantic: (type: 'success' | 'warning' | 'error' | 'info', shade: number = 500): string => {
    return (
      COLORS.semantic?.[type][shade as keyof (typeof COLORS.semantic)[typeof type]] ||
      COLORS.semantic?.[type][500]
    );
  },

  /**
   * Get neutral color
   */
  neutral: (shade: number = 500): string =>
    COLORS.neutral?.[shade as keyof typeof COLORS.neutral] || COLORS.neutral[500],

  /**
   * Get weather-specific color
   */
  weather: (condition: keyof typeof COLORS.weather): string => COLORS.weather?.[condition],

  /**
   * Generate RGBA color with opacity
   */
  rgba: (color: string, opacity: number): string => {
    // Remove # if present
    const hex = color.replace('#', '');

    // Convert hex to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },
};

/**
 * Typography Utility Functions
 */
export const typographyUtils = {
  /**
   * Get font family
   */
  fontFamily: (type: 'primary' | 'secondary' | 'mono' = 'primary'): string => {
    return TYPOGRAPHY.fontFamily?.[type].join(', ');
  },

  /**
   * Get font size with line height
   */
  fontSize: (
    size: keyof typeof TYPOGRAPHY.fontSize
  ): [string, { lineHeight: string; letterSpacing: string }] => {
    return TYPOGRAPHY.fontSize?.[size] as [string, { lineHeight: string; letterSpacing: string }];
  },

  /**
   * Get font weight
   */
  fontWeight: (weight: keyof typeof TYPOGRAPHY.fontWeight): string => {
    return TYPOGRAPHY.fontWeight?.[weight];
  },

  /**
   * Get letter spacing
   */
  letterSpacing: (spacing: keyof typeof TYPOGRAPHY.letterSpacing): string => {
    return TYPOGRAPHY.letterSpacing?.[spacing];
  },
};

/**
 * Spacing Utility Functions
 */
export const spacingUtils = {
  /**
   * Get spacing value
   */
  get: (key: keyof typeof SPACING): string => SPACING?.[key],

  /**
   * Calculate responsive spacing
   */
  responsive: (
    mobile: keyof typeof SPACING,
    tablet?: keyof typeof SPACING,
    desktop?: keyof typeof SPACING
  ): string => {
    const mobileValue = SPACING?.[mobile];
    const tabletValue = tablet ? SPACING?.[tablet] : mobileValue;
    const desktopValue = desktop ? SPACING?.[desktop] : tabletValue;

    return `${mobileValue} ${tabletValue} ${desktopValue}`;
  },
};

/**
 * Shadow Utility Functions
 */
export const shadowUtils = {
  /**
   * Get shadow value
   */
  get: (key: keyof typeof SHADOWS): string => SHADOWS?.[key],

  /**
   * Generate custom shadow
   */
  custom: (
    x: number,
    y: number,
    blur: number,
    spread: number,
    color: string,
    opacity: number = 0.1
  ): string => {
    return `${x}px ${y}px ${blur}px ${spread}px ${colorUtils.rgba(color, opacity)}`;
  },
};

/**
 * Animation Utility Functions
 */
export const animationUtils = {
  /**
   * Get animation duration
   */
  duration: (key: keyof typeof ANIMATION.duration): string => ANIMATION.duration?.[key],

  /**
   * Get easing function
   */
  easing: (key: keyof typeof ANIMATION.easing): string => ANIMATION.easing?.[key],

  /**
   * Get transition
   */
  transition: (key: keyof typeof ANIMATION.transition): string => ANIMATION.transition?.[key],

  /**
   * Create custom transition
   */
  custom: (
    property: string = 'all',
    duration: string = '300ms',
    easing: string = 'ease-out'
  ): string => {
    return `${property} ${duration} ${easing}`;
  },
};

// Export all utilities as a single object
export const designUtils = {
  color: colorUtils,
  typography: typographyUtils,
  spacing: spacingUtils,
  shadow: shadowUtils,
  animation: animationUtils,
};

export default designUtils;
