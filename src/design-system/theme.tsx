/**
 * Theme Provider and Context
 * Manages theme state and provides theme utilities throughout the app
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { ThemeContextError } from '@/errors/domainErrors';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from './tokens';

// Helper function to convert hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// Helper function to adjust color brightness
const adjustColorBrightness = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = percent > 0 ? 1 + percent / 100 : 1 + percent / 100;
  const r = Math.min(255, Math.max(0, Math.round(rgb.r * factor)));
  const g = Math.min(255, Math.max(0, Math.round(rgb.g * factor)));
  const b = Math.min(255, Math.max(0, Math.round(rgb.b * factor)));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface Theme {
  mode: ThemeMode;
  colors: typeof COLORS;
  typography: typeof TYPOGRAPHY;
  spacing: typeof SPACING;
  borderRadius: typeof BORDER_RADIUS;
  shadows: typeof SHADOWS;
  // Computed values based on mode
  isDark: boolean;
  isHighContrast: boolean;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textSecondaryColor: string;
}

const defaultTheme: Theme = {
  mode: 'light',
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  isDark: false,
  isHighContrast: false,
  primaryColor: COLORS.primary[500],
  accentColor: COLORS.special.accent,
  backgroundColor: COLORS.neutral[50],
  surfaceColor: COLORS.neutral[100],
  textColor: COLORS.neutral[900],
  textSecondaryColor: COLORS.neutral[600],
};

const ThemeContext = createContext<{
  theme: Theme;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isHighContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
}>({
  theme: defaultTheme,
  setThemeMode: () => {},
  toggleTheme: () => {},
  isHighContrast: false,
  setHighContrast: () => {},
  accentColor: COLORS.special.accent,
  setAccentColor: () => {},
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new ThemeContextError('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, defaultMode = 'auto' }) => {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [userSetHighContrast, setUserSetHighContrast] = useState<boolean | null>(null);
  const [accentColor, setAccentColorState] = useState<string>(COLORS.special.accent);

  // Detect system preference for auto mode
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Detect high contrast preference
  const detectHighContrast = (): boolean => {
    if (typeof window !== 'undefined') {
      // Check for prefers-contrast: high
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      // Check for forced-colors (Windows High Contrast Mode)
      const forcedColors = window.matchMedia('(forced-colors: active)').matches;
      return prefersHighContrast || forcedColors;
    }
    return false;
  };

  // Compute actual theme based on mode and high contrast preference
  const computeTheme = useCallback(
    (currentMode: ThemeMode, highContrast: boolean, customAccentColor: string): Theme => {
      const actualMode = currentMode === 'auto' ? getSystemTheme() : currentMode;
      const isDark = actualMode === 'dark';

      // Use high contrast colors when enabled
      if (highContrast) {
        const hcColors = isDark ? COLORS.highContrast.dark : COLORS.highContrast.light;
        return {
          ...defaultTheme,
          mode: currentMode,
          isDark,
          isHighContrast: true,
          primaryColor: hcColors.interactive.primary,
          accentColor: customAccentColor,
          backgroundColor: hcColors.background.primary,
          surfaceColor: hcColors.background.surface,
          textColor: hcColors.text.primary,
          textSecondaryColor: hcColors.text.secondary,
        };
      }

      // Standard theme colors
      return {
        ...defaultTheme,
        mode: currentMode,
        isDark,
        isHighContrast: false,
        primaryColor: isDark ? COLORS.primary[400] : COLORS.primary[500],
        accentColor: customAccentColor,
        backgroundColor: isDark ? COLORS.neutral[900] : COLORS.neutral[50],
        surfaceColor: isDark ? COLORS.neutral[800] : COLORS.neutral[100],
        textColor: isDark ? COLORS.neutral[100] : COLORS.neutral[900],
        textSecondaryColor: isDark ? COLORS.neutral[400] : COLORS.neutral[600],
      };
    },
    []
  );

  const [theme, setTheme] = useState<Theme>(() => computeTheme(mode, isHighContrast, accentColor));

  // Update theme when mode, high contrast, or accent color changes
  useEffect(() => {
    setTheme(computeTheme(mode, isHighContrast, accentColor));
  }, [mode, isHighContrast, accentColor, computeTheme]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => setTheme(computeTheme('auto', isHighContrast, accentColor));

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [mode, isHighContrast, accentColor, computeTheme]);

  // Listen for high contrast preference changes (only if user hasn't manually set it)
  useEffect(() => {
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const forcedColorsQuery = window.matchMedia('(forced-colors: active)');

    const handleContrastChange = () => {
      // Only update if user hasn't manually set high contrast
      if (userSetHighContrast === null) {
        const newHighContrast = detectHighContrast();
        setIsHighContrast(newHighContrast);
      }
    };

    // Initial detection (only if user hasn't manually set it)
    if (userSetHighContrast === null) {
      setIsHighContrast(detectHighContrast());
    }

    // Add listeners
    contrastQuery.addEventListener('change', handleContrastChange);
    forcedColorsQuery.addEventListener('change', handleContrastChange);

    return () => {
      contrastQuery.removeEventListener('change', handleContrastChange);
      forcedColorsQuery.removeEventListener('change', handleContrastChange);
    };
  }, [userSetHighContrast]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    // Get high contrast colors if enabled
    const hcColors = theme.isHighContrast
      ? theme.isDark
        ? COLORS.highContrast.dark
        : COLORS.highContrast.light
      : null;

    // Set comprehensive CSS custom properties
    root.style.setProperty('--theme-primary', theme.primaryColor);
    root.style.setProperty('--theme-background', theme.backgroundColor);
    root.style.setProperty('--theme-surface', theme.surfaceColor);
    root.style.setProperty('--theme-text', theme.textColor);
    root.style.setProperty('--theme-text-secondary', theme.textSecondaryColor);
    root.style.setProperty('--theme-accent', theme.accentColor);

    // Additional theme properties for better consistency
    if (hcColors) {
      // High contrast mode
      root.style.setProperty('--theme-border', hcColors.border.primary);
      root.style.setProperty('--theme-border-light', hcColors.border.secondary);
      root.style.setProperty('--theme-hover', hcColors.background.secondary);
      root.style.setProperty('--theme-active', hcColors.background.elevated);
      root.style.setProperty('--theme-shadow', 'transparent'); // No shadows in high contrast
      root.style.setProperty('--theme-focus', hcColors.border.focus);

      // Primary color variants for interactive elements
      root.style.setProperty('--theme-primary-bg', hcColors.background.surface);
      root.style.setProperty('--theme-primary-bg-hover', hcColors.background.secondary);
      root.style.setProperty('--theme-primary-border', hcColors.border.primary);
      root.style.setProperty('--theme-primary-text', hcColors.interactive.primary);
      root.style.setProperty('--theme-primary-text-hover', hcColors.interactive.primaryHover);

      // Semantic colors for badges and status indicators
      root.style.setProperty('--theme-success-bg', hcColors.semantic.successBg);
      root.style.setProperty('--theme-success-text', hcColors.semantic.success);
      root.style.setProperty('--theme-warning-bg', hcColors.semantic.warningBg);
      root.style.setProperty('--theme-warning-text', hcColors.semantic.warning);
      root.style.setProperty('--theme-error-bg', hcColors.semantic.errorBg);
      root.style.setProperty('--theme-error-text', hcColors.semantic.error);
      root.style.setProperty('--theme-info-bg', hcColors.semantic.infoBg);
      root.style.setProperty('--theme-info-text', hcColors.semantic.info);

      // Link colors
      root.style.setProperty('--theme-link', hcColors.text.link);
      root.style.setProperty('--theme-link-visited', hcColors.text.linkVisited);
    } else {
      // Standard theme
      root.style.setProperty(
        '--theme-border',
        theme.isDark ? COLORS.neutral[700] : COLORS.neutral[200]
      );
      root.style.setProperty(
        '--theme-border-light',
        theme.isDark ? COLORS.neutral[600] : COLORS.neutral[300]
      );
      root.style.setProperty(
        '--theme-hover',
        theme.isDark ? COLORS.neutral[700] : COLORS.neutral[100]
      );
      root.style.setProperty(
        '--theme-active',
        theme.isDark ? COLORS.neutral[600] : COLORS.neutral[200]
      );
      root.style.setProperty(
        '--theme-shadow',
        theme.isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'
      );
      root.style.setProperty(
        '--theme-focus',
        theme.isDark ? COLORS.primary[400] : COLORS.primary[500]
      );

      // Primary color variants for interactive elements
      root.style.setProperty(
        '--theme-primary-bg',
        theme.isDark ? COLORS.primary[900] : COLORS.primary[50]
      );
      root.style.setProperty(
        '--theme-primary-bg-hover',
        theme.isDark ? COLORS.primary[800] : COLORS.primary[100]
      );
      root.style.setProperty(
        '--theme-primary-border',
        theme.isDark ? COLORS.primary[700] : COLORS.primary[500]
      );
      root.style.setProperty(
        '--theme-primary-text',
        theme.isDark ? COLORS.primary[300] : COLORS.primary[700]
      );
      root.style.setProperty(
        '--theme-primary-text-hover',
        theme.isDark ? COLORS.primary[200] : COLORS.primary[800]
      );

      // Additional primary color variants for navigation
      root.style.setProperty(
        '--theme-primary-light',
        theme.isDark ? COLORS.primary[900] : COLORS.primary[100]
      );
      root.style.setProperty(
        '--theme-primary-dark',
        theme.isDark ? COLORS.primary[300] : COLORS.primary[700]
      );

      // Semantic colors for badges and status indicators
      root.style.setProperty(
        '--theme-success-bg',
        theme.isDark ? COLORS.semantic.success[900] : COLORS.semantic.success[100]
      );
      root.style.setProperty(
        '--theme-success-text',
        theme.isDark ? COLORS.semantic.success[100] : COLORS.semantic.success[600]
      );
      root.style.setProperty(
        '--theme-warning-bg',
        theme.isDark ? COLORS.semantic.warning[900] : COLORS.semantic.warning[100]
      );
      root.style.setProperty(
        '--theme-warning-text',
        theme.isDark ? COLORS.semantic.warning[100] : COLORS.semantic.warning[600]
      );
      root.style.setProperty(
        '--theme-error-bg',
        theme.isDark ? COLORS.semantic.error[900] : COLORS.semantic.error[100]
      );
      root.style.setProperty(
        '--theme-error-text',
        theme.isDark ? COLORS.semantic.error[100] : COLORS.semantic.error[600]
      );
      root.style.setProperty(
        '--theme-info-bg',
        theme.isDark ? COLORS.semantic.info[900] : COLORS.semantic.info[100]
      );
      root.style.setProperty(
        '--theme-info-text',
        theme.isDark ? COLORS.semantic.info[100] : COLORS.semantic.info[600]
      );

      // Link colors
      root.style.setProperty(
        '--theme-link',
        theme.isDark ? COLORS.primary[400] : COLORS.primary[600]
      );
      root.style.setProperty(
        '--theme-link-visited',
        theme.isDark ? COLORS.primary[300] : COLORS.primary[700]
      );
    }

    // Backdrop overlay
    root.style.setProperty(
      '--theme-backdrop',
      theme.isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.2)'
    );

    // Apply custom accent color
    root.style.setProperty('--theme-accent', theme.accentColor);

    // Convert accent color to RGB for use with opacity
    const rgb = hexToRgb(theme.accentColor);
    if (rgb) {
      root.style.setProperty('--theme-accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }

    // Generate hover color (darker version of accent)
    const hoverColor = adjustColorBrightness(theme.accentColor, -20);
    root.style.setProperty('--theme-accent-hover', hoverColor);

    // Set data attributes for CSS selectors
    root.setAttribute('data-theme', theme.isDark ? 'dark' : 'light');
    root.setAttribute('data-high-contrast', theme.isHighContrast ? 'true' : 'false');

    // Also set classes for easier CSS targeting
    root.classList.toggle('dark', theme.isDark);
    root.classList.toggle('light', !theme.isDark);
    root.classList.toggle('high-contrast', theme.isHighContrast);
  }, [theme]);

  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);
    try {
      localStorage.setItem('weather-app-theme', newMode);
    } catch (error) {
      // Silently handle localStorage errors (quota exceeded, access denied, etc.)
      console.warn('Failed to save theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  };

  const setHighContrastMode = (enabled: boolean) => {
    setIsHighContrast(enabled);
    setUserSetHighContrast(enabled);
    try {
      localStorage.setItem('weather-app-high-contrast', JSON.stringify(enabled));
    } catch (error) {
      console.warn('Failed to save high contrast preference:', error);
    }
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    try {
      localStorage.setItem('weather-app-accent-color', color);
    } catch (error) {
      console.warn('Failed to save accent color preference:', error);
    }
  };

  // Load saved theme and high contrast preference on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('weather-app-theme') as ThemeMode;
      if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
        setMode(savedTheme);
      }

      const savedHighContrast = localStorage.getItem('weather-app-high-contrast');
      if (savedHighContrast !== null) {
        try {
          const enabled = JSON.parse(savedHighContrast);
          setIsHighContrast(enabled);
          setUserSetHighContrast(enabled);
        } catch {
          // Invalid value, ignore and use system preference
        }
      }

      const savedAccentColor = localStorage.getItem('weather-app-accent-color');
      if (savedAccentColor) {
        setAccentColorState(savedAccentColor);
      }
    } catch (error) {
      console.warn('Failed to load theme preferences:', error);
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setThemeMode,
        toggleTheme,
        isHighContrast,
        setHighContrast: setHighContrastMode,
        accentColor,
        setAccentColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Theme utilities
export const themeUtils = {
  // Get color with theme awareness
  getColor: (colorPath: string, theme: Theme): string => {
    const parts = colorPath.split('.');
    let value: unknown = theme.colors;

    for (const part of parts) {
      value = value?.[part];
    }

    return (value as string) || colorPath;
  },

  // Get spacing value
  getSpacing: (spacing: keyof typeof SPACING, theme: Theme): string => {
    return theme.spacing?.[spacing];
  },

  // Get typography value
  getTypography: (path: string, theme: Theme): unknown => {
    const parts = path.split('.');
    let value: unknown = theme.typography;

    for (const part of parts) {
      value = value?.[part];
    }

    return value;
  },
};
