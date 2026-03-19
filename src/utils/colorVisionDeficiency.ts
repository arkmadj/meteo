/**
 * Color Vision Deficiency (CVD) Utilities
 * Provides CVD-safe color palettes, patterns, and accessibility helpers
 */

/**
 * CVD types
 */
export type CVDType = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'achromatopsia';

/**
 * CVD-safe color palette
 * These colors are distinguishable for all types of color vision deficiency
 */
export const CVD_SAFE_COLORS = {
  // Primary colors - safe for all CVD types
  blue: '#0077BB',
  orange: '#EE7733',
  teal: '#009988',
  magenta: '#CC3377',
  yellow: '#CCBB44',
  cyan: '#33BBEE',
  red: '#CC3311',
  gray: '#BBBBBB',

  // Semantic colors - adjusted for CVD safety
  success: '#009988', // Teal instead of pure green
  warning: '#EE7733', // Orange instead of yellow
  error: '#CC3311', // Red-orange
  info: '#0077BB', // Blue

  // Background colors
  successBg: '#E6F7F5',
  warningBg: '#FFF4E6',
  errorBg: '#FFE6E6',
  infoBg: '#E6F2FF',
} as const;

/**
 * Pattern types for visual differentiation
 */
export type PatternType = 'solid' | 'stripes' | 'dots' | 'grid' | 'diagonal' | 'crosshatch';

/**
 * Get SVG pattern definition
 */
export function getPatternSVG(type: PatternType, color: string): string {
  const patterns: Record<PatternType, string> = {
    solid: '',
    stripes: `
      <pattern id="stripes-${color}" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="${color}" />
        <path d="M0,0 l8,8 M-2,6 l4,4 M6,-2 l4,4" stroke="white" strokeWidth="2" />
      </pattern>
    `,
    dots: `
      <pattern id="dots-${color}" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="${color}" />
        <circle cx="4" cy="4" r="2" fill="white" />
      </pattern>
    `,
    grid: `
      <pattern id="grid-${color}" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="${color}" />
        <path d="M0,0 L8,0 L8,8 L0,8 Z" stroke="white" strokeWidth="1" fill="none" />
      </pattern>
    `,
    diagonal: `
      <pattern id="diagonal-${color}" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="${color}" />
        <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="white" strokeWidth="2" />
      </pattern>
    `,
    crosshatch: `
      <pattern id="crosshatch-${color}" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="${color}" />
        <path d="M0,0 l8,8 M0,8 l8,-8" stroke="white" strokeWidth="1" />
      </pattern>
    `,
  };

  return patterns[type] || '';
}

/**
 * Get CSS pattern background
 */
export function getPatternCSS(type: PatternType, color: string): string {
  const patterns: Record<PatternType, string> = {
    solid: `background: ${color};`,
    stripes: `
      background: linear-gradient(
        45deg,
        ${color} 25%,
        transparent 25%,
        transparent 75%,
        ${color} 75%,
        ${color}
      );
      background-size: 10px 10px;
    `,
    dots: `
      background-image: radial-gradient(circle, white 2px, transparent 2px);
      background-size: 8px 8px;
      background-color: ${color};
    `,
    grid: `
      background-image: 
        linear-gradient(${color} 1px, transparent 1px),
        linear-gradient(90deg, ${color} 1px, transparent 1px);
      background-size: 8px 8px;
    `,
    diagonal: `
      background: repeating-linear-gradient(
        45deg,
        ${color},
        ${color} 5px,
        transparent 5px,
        transparent 10px
      );
    `,
    crosshatch: `
      background-image:
        linear-gradient(45deg, transparent 40%, ${color} 40%, ${color} 60%, transparent 60%),
        linear-gradient(-45deg, transparent 40%, ${color} 40%, ${color} 60%, transparent 60%);
      background-size: 8px 8px;
    `,
  };

  return patterns[type] || patterns.solid;
}

/**
 * Status indicator configuration
 */
export interface StatusConfig {
  color: string;
  backgroundColor: string;
  icon: string;
  pattern: PatternType;
  label: string;
  ariaLabel: string;
}

/**
 * Get CVD-safe status configuration
 */
export function getStatusConfig(
  status: 'success' | 'warning' | 'error' | 'info',
  usePatterns = false
): StatusConfig {
  const configs: Record<string, StatusConfig> = {
    success: {
      color: CVD_SAFE_COLORS.success,
      backgroundColor: CVD_SAFE_COLORS.successBg,
      icon: '✓',
      pattern: usePatterns ? 'stripes' : 'solid',
      label: 'Success',
      ariaLabel: 'Success status',
    },
    warning: {
      color: CVD_SAFE_COLORS.warning,
      backgroundColor: CVD_SAFE_COLORS.warningBg,
      icon: '⚠',
      pattern: usePatterns ? 'dots' : 'solid',
      label: 'Warning',
      ariaLabel: 'Warning status',
    },
    error: {
      color: CVD_SAFE_COLORS.error,
      backgroundColor: CVD_SAFE_COLORS.errorBg,
      icon: '✗',
      pattern: usePatterns ? 'diagonal' : 'solid',
      label: 'Error',
      ariaLabel: 'Error status',
    },
    info: {
      color: CVD_SAFE_COLORS.info,
      backgroundColor: CVD_SAFE_COLORS.infoBg,
      icon: 'ℹ',
      pattern: usePatterns ? 'grid' : 'solid',
      label: 'Info',
      ariaLabel: 'Information status',
    },
  };

  return configs[status];
}

/**
 * Calculate luminance of a color
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    const normalized = val / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG standards
 */
export function meetsContrastRequirement(
  color1: string,
  color2: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(color1, color2);
  const required = level === 'AAA' ? (isLargeText ? 4.5 : 7) : isLargeText ? 3 : 4.5;

  return ratio >= required;
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Simulate color vision deficiency
 * Based on Brettel, Viénot and Mollon JPEG algorithm
 */
export function simulateCVD(hex: string, type: CVDType): string {
  if (type === 'none') return hex;

  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  // Simplified simulation matrices
  if (type === 'deuteranopia' || type === 'protanopia') {
    // Red-green deficiency
    const newR = 0.625 * r + 0.375 * g;
    const newG = 0.7 * r + 0.3 * g;
    r = newR;
    g = newG;
  } else if (type === 'tritanopia') {
    // Blue-yellow deficiency
    const newG = 0.95 * g + 0.05 * b;
    const newB = 0.433 * g + 0.567 * b;
    g = newG;
    b = newB;
  } else if (type === 'achromatopsia') {
    // Complete color blindness (grayscale)
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    r = g = b = gray;
  }

  // Convert back to hex
  const toHex = (val: number) => {
    const hex = Math.round(val * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Get recommended text color (black or white) for a background
 */
export function getTextColor(backgroundColor: string): string {
  const luminance = getLuminance(backgroundColor);
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Check if two colors are distinguishable for CVD users
 */
export function areColorsDistinguishable(
  color1: string,
  color2: string,
  cvdType: CVDType = 'deuteranopia'
): boolean {
  const simulated1 = simulateCVD(color1, cvdType);
  const simulated2 = simulateCVD(color2, cvdType);

  // Check if simulated colors have sufficient contrast
  const ratio = getContrastRatio(simulated1, simulated2);
  return ratio >= 3; // Minimum for UI components
}

/**
 * Export utility functions
 */
export const cvdUtils = {
  getPatternSVG,
  getPatternCSS,
  getStatusConfig,
  getLuminance,
  getContrastRatio,
  meetsContrastRequirement,
  simulateCVD,
  getTextColor,
  areColorsDistinguishable,
};
