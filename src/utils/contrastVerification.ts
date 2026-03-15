/**
 * Contrast Ratio Verification Utility
 * 
 * Provides utilities to verify color contrast ratios meet WCAG accessibility standards.
 * Supports WCAG AA (4.5:1 for normal text, 3:1 for large text) and 
 * WCAG AAA (7:1 for normal text, 4.5:1 for large text).
 * 
 * @see https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 * @see https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html
 */

/**
 * WCAG conformance levels
 */
export type WCAGLevel = 'AA' | 'AAA';

/**
 * Text size categories
 */
export type TextSize = 'normal' | 'large';

/**
 * Contrast check result
 */
export interface ContrastCheckResult {
  ratio: number;
  passes: boolean;
  level: WCAGLevel;
  textSize: TextSize;
  foreground: string;
  background: string;
  recommendation?: string;
}

/**
 * Theme contrast verification result
 */
export interface ThemeContrastResult {
  theme: 'light' | 'dark';
  mode: 'standard' | 'highContrast';
  checks: ContrastCheckResult[];
  allPass: boolean;
  failedChecks: ContrastCheckResult[];
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Handle 3-digit hex
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  }
  
  // Handle 6-digit hex
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }
  
  return null;
}

/**
 * Calculate relative luminance of a color
 * @see https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  // Convert RGB to sRGB
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;
  
  // Apply gamma correction
  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  // Calculate relative luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * @see https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 */
export function getContrastRatio(foreground: string, background: string): number {
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get minimum required contrast ratio for WCAG level and text size
 */
export function getRequiredRatio(level: WCAGLevel, textSize: TextSize): number {
  if (level === 'AAA') {
    return textSize === 'large' ? 4.5 : 7;
  }
  // AA level
  return textSize === 'large' ? 3 : 4.5;
}

/**
 * Check if contrast ratio meets WCAG requirements
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  level: WCAGLevel = 'AA',
  textSize: TextSize = 'normal'
): ContrastCheckResult {
  const ratio = getContrastRatio(foreground, background);
  const required = getRequiredRatio(level, textSize);
  const passes = ratio >= required;
  
  let recommendation: string | undefined;
  if (!passes) {
    const diff = required - ratio;
    recommendation = `Contrast ratio is ${ratio.toFixed(2)}:1, needs to be at least ${required}:1. ` +
      `Increase contrast by ${diff.toFixed(2)} to meet ${level} standards.`;
  }
  
  return {
    ratio,
    passes,
    level,
    textSize,
    foreground,
    background,
    recommendation,
  };
}

/**
 * Verify all color combinations in a theme meet WCAG standards
 */
export function verifyThemeContrast(
  theme: 'light' | 'dark',
  mode: 'standard' | 'highContrast',
  colors: {
    text: string;
    textSecondary: string;
    background: string;
    surface: string;
    primary: string;
    border: string;
    link: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  },
  level: WCAGLevel = 'AAA'
): ThemeContrastResult {
  const checks: ContrastCheckResult[] = [];
  
  // Primary text on background
  checks.push(
    meetsContrastRequirement(colors.text, colors.background, level, 'normal')
  );
  
  // Secondary text on background
  checks.push(
    meetsContrastRequirement(colors.textSecondary, colors.background, level, 'normal')
  );
  
  // Primary text on surface
  checks.push(
    meetsContrastRequirement(colors.text, colors.surface, level, 'normal')
  );
  
  // Secondary text on surface
  checks.push(
    meetsContrastRequirement(colors.textSecondary, colors.surface, level, 'normal')
  );
  
  // Primary color on background (for buttons, links)
  checks.push(
    meetsContrastRequirement(colors.primary, colors.background, level, 'large')
  );
  
  // Border on background
  checks.push(
    meetsContrastRequirement(colors.border, colors.background, level, 'large')
  );
  
  // Link on background
  checks.push(
    meetsContrastRequirement(colors.link, colors.background, level, 'normal')
  );
  
  // Semantic colors on background
  checks.push(
    meetsContrastRequirement(colors.success, colors.background, level, 'normal')
  );
  checks.push(
    meetsContrastRequirement(colors.warning, colors.background, level, 'normal')
  );
  checks.push(
    meetsContrastRequirement(colors.error, colors.background, level, 'normal')
  );
  checks.push(
    meetsContrastRequirement(colors.info, colors.background, level, 'normal')
  );
  
  const failedChecks = checks.filter(check => !check.passes);
  const allPass = failedChecks.length === 0;
  
  return {
    theme,
    mode,
    checks,
    allPass,
    failedChecks,
  };
}

/**
 * Generate a contrast report for console logging
 */
export function generateContrastReport(result: ThemeContrastResult): string {
  const lines: string[] = [];
  
  lines.push(`\n${'='.repeat(80)}`);
  lines.push(`Contrast Verification Report`);
  lines.push(`Theme: ${result.theme} | Mode: ${result.mode}`);
  lines.push(`${'='.repeat(80)}\n`);
  
  if (result.allPass) {
    lines.push(`✅ All contrast checks passed!`);
    lines.push(`Total checks: ${result.checks.length}`);
  } else {
    lines.push(`❌ ${result.failedChecks.length} of ${result.checks.length} checks failed\n`);
    
    result.failedChecks.forEach((check, index) => {
      lines.push(`Failed Check #${index + 1}:`);
      lines.push(`  Foreground: ${check.foreground}`);
      lines.push(`  Background: ${check.background}`);
      lines.push(`  Ratio: ${check.ratio.toFixed(2)}:1`);
      lines.push(`  Level: ${check.level} (${check.textSize} text)`);
      lines.push(`  ${check.recommendation}`);
      lines.push('');
    });
  }
  
  lines.push(`\nPassing Checks:`);
  result.checks
    .filter(check => check.passes)
    .forEach((check, index) => {
      lines.push(
        `  ✓ ${check.foreground} on ${check.background}: ${check.ratio.toFixed(2)}:1`
      );
    });
  
  lines.push(`\n${'='.repeat(80)}\n`);
  
  return lines.join('\n');
}

/**
 * Suggest a color adjustment to meet contrast requirements
 */
export function suggestColorAdjustment(
  foreground: string,
  background: string,
  targetRatio: number
): string {
  const currentRatio = getContrastRatio(foreground, background);
  
  if (currentRatio >= targetRatio) {
    return foreground; // Already meets requirement
  }
  
  const fgLuminance = getLuminance(foreground);
  const bgLuminance = getLuminance(background);
  
  // Determine if we should lighten or darken the foreground
  const shouldLighten = fgLuminance < bgLuminance;
  
  // Binary search for the right adjustment
  let low = 0;
  let high = 255;
  let bestColor = foreground;
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const adjustment = shouldLighten ? mid : 255 - mid;
    const testColor = `#${adjustment.toString(16).padStart(2, '0').repeat(3)}`;
    const testRatio = getContrastRatio(testColor, background);
    
    if (testRatio >= targetRatio) {
      bestColor = testColor;
      if (shouldLighten) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    } else {
      if (shouldLighten) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
  }
  
  return bestColor;
}

