/**
 * 🎨 Design System Tokens
 *
 * Centralized design tokens for the React Weather App.
 * This file serves as the single source of truth for all design-related values,
 * ensuring consistency across components, themes, and user experiences.
 *
 * @version 1.0.0
 * @author Design System Team
 */

// ============================================================================
// 🎯 CORE DESIGN TOKENS
// ============================================================================

/**
 * Color Palette
 * Comprehensive color system with semantic meanings and accessibility considerations
 */
export const COLORS = {
  // Primary Brand Colors - Weather Blue Theme
  primary: {
    50: '#eff6ff', // Very light blue - backgrounds
    100: '#dbeafe', // Light blue - subtle backgrounds
    200: '#bfdbfe', // Lighter blue - hover states
    300: '#93c5fd', // Light blue - borders, dividers
    400: '#60a5fa', // Medium blue - secondary actions
    500: '#3b82f6', // Primary blue - main actions, links
    600: '#2563eb', // Darker blue - hover states
    700: '#1d4ed8', // Dark blue - active states
    800: '#1e40af', // Very dark blue - text on light backgrounds
    900: '#1e3a8a', // Darkest blue - headings
  } as const,

  // Semantic Colors - For status, feedback, and communication
  semantic: {
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      500: '#10b981', // Main success color
      600: '#059669',
      900: '#064e3b',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b', // Main warning color
      600: '#d97706',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444', // Main error color
      600: '#dc2626',
      900: '#7f1d1d',
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6', // Main info color
      600: '#2563eb',
      900: '#1e3a8a',
    },
  } as const,

  // Neutral Gray Scale - For text, backgrounds, and subtle elements
  neutral: {
    50: '#f9fafb', // Very light gray - page backgrounds
    100: '#f3f4f6', // Light gray - card backgrounds
    200: '#e5e7eb', // Light gray - borders, dividers
    300: '#d1d5db', // Medium light gray - disabled states
    400: '#9ca3af', // Medium gray - placeholder text
    500: '#6b7280', // Medium gray - secondary text
    600: '#4b5563', // Medium dark gray - body text
    700: '#374151', // Dark gray - headings
    800: '#1f2937', // Very dark gray - high contrast text
    900: '#111827', // Darkest gray - primary text
  } as const,

  // Weather-Specific Colors - For weather condition indicators
  weather: {
    sunny: '#fbbf24', // Bright yellow for sunny conditions
    partlyCloudy: '#d1d5db', // Light gray for partly cloudy
    cloudy: '#6b7280', // Medium gray for cloudy
    rainy: '#3b82f6', // Blue for rainy conditions
    snowy: '#e5e7eb', // Light gray for snowy
    stormy: '#374151', // Dark gray for stormy
    foggy: '#9ca3af', // Medium gray for foggy
    windy: '#60a5fa', // Light blue for windy
  } as const,

  // Special Purpose Colors
  special: {
    accent: '#f06789', // Accent color for highlights
    overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlays
    backdrop: 'rgba(255, 255, 255, 0.8)', // Backdrop blur
  } as const,

  // Glass Morphism Colors
  glass: {
    background: 'rgba(255, 255, 255, 0.9)', // Glass background
    border: 'rgba(255, 255, 255, 0.2)', // Glass border
    shadow: 'rgba(0, 0, 0, 0.1)', // Glass shadow
  } as const,

  // High Contrast Mode Colors - WCAG AAA Compliant (7:1 for normal text, 4.5:1 for large text)
  highContrast: {
    light: {
      // Text colors on light backgrounds
      text: {
        primary: '#000000', // Pure black - Maximum contrast (21:1 on white)
        secondary: '#1a1a1a', // Near black - High contrast (18.5:1 on white)
        tertiary: '#2d2d2d', // Dark gray - Strong contrast (14.5:1 on white)
        link: '#0000ee', // Classic blue link - High contrast (8.6:1 on white)
        linkVisited: '#551a8b', // Purple visited link - High contrast (7.3:1 on white)
      },
      // Background colors
      background: {
        primary: '#ffffff', // Pure white
        secondary: '#f5f5f5', // Very light gray
        surface: '#fafafa', // Off-white surface
        elevated: '#ffffff', // Elevated surfaces
      },
      // Border colors
      border: {
        primary: '#000000', // Pure black borders
        secondary: '#333333', // Dark gray borders (12.6:1 on white)
        focus: '#0000ff', // Blue focus indicator (8.6:1 on white)
      },
      // Interactive element colors
      interactive: {
        primary: '#0000cc', // Dark blue - High contrast (9.7:1 on white)
        primaryHover: '#0000aa', // Darker blue hover (11.4:1 on white)
        primaryActive: '#000088', // Darkest blue active (13.5:1 on white)
        secondary: '#1a1a1a', // Near black (18.5:1 on white)
        secondaryHover: '#000000', // Pure black hover (21:1 on white)
      },
      // Semantic colors with high contrast
      semantic: {
        success: '#006600', // Dark green (7.4:1 on white)
        successBg: '#e6ffe6', // Very light green background
        warning: '#664400', // Darker orange (7.5:1 on white)
        warningBg: '#fff9e6', // Very light yellow background
        error: '#990000', // Darker red (7.0:1 on white)
        errorBg: '#ffe6e6', // Very light red background
        info: '#0000cc', // Dark blue (9.7:1 on white)
        infoBg: '#e6e6ff', // Very light blue background
      },
    },
    dark: {
      // Text colors on dark backgrounds
      text: {
        primary: '#ffffff', // Pure white - Maximum contrast (21:1 on black)
        secondary: '#f0f0f0', // Near white - High contrast (17.8:1 on black)
        tertiary: '#e0e0e0', // Light gray - Strong contrast (14.1:1 on black)
        link: '#6699ff', // Light blue link - High contrast (9.2:1 on black)
        linkVisited: '#cc99ff', // Light purple visited link - High contrast (8.8:1 on black)
      },
      // Background colors
      background: {
        primary: '#000000', // Pure black
        secondary: '#0a0a0a', // Very dark gray
        surface: '#121212', // Dark surface
        elevated: '#1a1a1a', // Elevated surfaces
      },
      // Border colors
      border: {
        primary: '#ffffff', // Pure white borders
        secondary: '#cccccc', // Light gray borders (12.6:1 on black)
        focus: '#66b3ff', // Light blue focus indicator (10.5:1 on black)
      },
      // Interactive element colors
      interactive: {
        primary: '#6699ff', // Light blue - High contrast (9.2:1 on black)
        primaryHover: '#99bbff', // Lighter blue hover (12.5:1 on black)
        primaryActive: '#cce0ff', // Lightest blue active (16.2:1 on black)
        secondary: '#e0e0e0', // Light gray (14.1:1 on black)
        secondaryHover: '#ffffff', // Pure white hover (21:1 on black)
      },
      // Semantic colors with high contrast
      semantic: {
        success: '#66ff66', // Bright green (12.3:1 on black)
        successBg: '#003300', // Very dark green background
        warning: '#ffcc66', // Bright orange (13.8:1 on black)
        warningBg: '#332200', // Very dark orange background
        error: '#ff6666', // Bright red (8.3:1 on black)
        errorBg: '#330000', // Very dark red background
        info: '#6699ff', // Bright blue (9.2:1 on black)
        infoBg: '#000033', // Very dark blue background
      },
    },
  } as const,
} as const;

/**
 * Typography System
 * Comprehensive typography scale with consistent line heights and spacing
 */
export const TYPOGRAPHY = {
  // Font Families
  fontFamily: {
    primary: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    secondary: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'monospace'],
  } as const,

  // Font Sizes with corresponding line heights
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }], // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }], // 14px
    base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0em' }], // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }], // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }], // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em' }], // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }], // 36px
    '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.025em' }], // 48px
    '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.025em' }], // 60px
  } as const,

  // Font Weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  } as const,

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  } as const,

  // Text Transform
  textTransform: {
    uppercase: 'uppercase',
    lowercase: 'lowercase',
    capitalize: 'capitalize',
    none: 'none',
  } as const,
} as const;

/**
 * Spacing Scale
 * Consistent spacing system based on 4px increments
 */
export const SPACING = {
  // Absolute units
  px: '1px',
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  18: '4.5rem', // 72px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px

  // Semantic spacing
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
} as const;

/**
 * Border Radius Scale
 * Consistent border radius values for different use cases
 */
export const BORDER_RADIUS = {
  none: '0',
  xs: '0.0625rem', // 1px - very subtle
  sm: '0.125rem', // 2px - small elements
  DEFAULT: '0.25rem', // 4px - default for most elements
  md: '0.375rem', // 6px - medium elements
  lg: '0.5rem', // 8px - large elements
  xl: '0.75rem', // 12px - cards, modals
  '2xl': '1rem', // 16px - large cards
  '3xl': '1.5rem', // 24px - hero sections
  full: '9999px', // Fully rounded (pills, avatars)
} as const;

/**
 * Shadow System
 * Elevation system for depth and hierarchy
 */
export const SHADOWS = {
  none: 'none',
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)', // Subtle shadow
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', // Small shadow
  DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', // Default shadow
  md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', // Medium shadow
  lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Large shadow
  xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)', // Extra large shadow
  '2xl': '0 40px 80px -20px rgb(0 0 0 / 0.3)', // Maximum shadow

  // Inner shadows for inset effects
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  'inner-sm': 'inset 0 1px 2px 0 rgb(0 0 0 / 0.05)',

  // Colored shadows for specific use cases
  colored: '0 4px 6px -1px rgb(59 130 246 / 0.1), 0 2px 4px -2px rgb(59 130 246 / 0.1)',
  'colored-lg': '0 10px 15px -3px rgb(59 130 246 / 0.1), 0 4px 6px -4px rgb(59 130 246 / 0.1)',
} as const;

/**
 * Opacity Values
 * Consistent transparency levels
 */
export const OPACITY = {
  0: '0',
  5: '0.05',
  10: '0.1',
  15: '0.15',
  20: '0.2',
  25: '0.25',
  30: '0.3',
  40: '0.4',
  50: '0.5',
  60: '0.6',
  70: '0.7',
  80: '0.8',
  90: '0.9',
  95: '0.95',
  100: '1',
} as const;

/**
 * Z-Index Scale
 * Stacking context management
 */
export const Z_INDEX = {
  auto: 'auto',
  0: '0',
  10: '10', // Tooltips, dropdowns
  20: '20', // Modals, overlays
  30: '30', // Popovers, notifications
  40: '40', // Sticky elements
  50: '50', // Fixed headers
  60: '60', // Mobile menus
  70: '70', // Toasts
  80: '80', // Full-screen overlays
  90: '90', // Loading screens
  100: '100', // Maximum stacking
} as const;

/**
 * Animation & Transition Tokens
 * Consistent timing and easing functions
 */
export const ANIMATION = {
  // Duration
  duration: {
    instant: '0ms',
    fastest: '100ms',
    fast: '200ms',
    normal: '300ms',
    slow: '500ms',
    slowest: '700ms',
  } as const,

  // Easing functions
  easing: {
    linear: 'linear',
    in: 'ease-in',
    out: 'ease-out',
    inOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  } as const,

  // Common transitions
  transition: {
    fast: 'all 200ms ease-out',
    normal: 'all 300ms ease-out',
    slow: 'all 500ms ease-out',
    bounce: 'all 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  } as const,
} as const;

/**
 * Breakpoints
 * Responsive design breakpoints
 */
export const BREAKPOINTS = {
  xs: '475px', // Extra small devices
  sm: '640px', // Small devices (phones)
  md: '768px', // Medium devices (tablets)
  lg: '1024px', // Large devices (laptops)
  xl: '1280px', // Extra large devices (desktops)
  '2xl': '1536px', // 2X large devices (large desktops)
} as const;

// ============================================================================
// 🧩 COMPONENT-SPECIFIC TOKENS
// ============================================================================

/**
 * Component-Specific Design Tokens
 * Predefined values for consistent component styling
 */
export const COMPONENT_TOKENS = {
  // Button component tokens
  button: {
    height: {
      xs: '1.75rem', // 28px
      sm: '2rem', // 32px
      md: '2.5rem', // 40px
      lg: '3rem', // 48px
      xl: '3.5rem', // 56px
    },
    padding: {
      xs: '0.375rem 0.75rem', // 6px 12px
      sm: '0.5rem 1rem', // 8px 16px
      md: '0.625rem 1.25rem', // 10px 20px
      lg: '0.75rem 1.5rem', // 12px 24px
      xl: '1rem 2rem', // 16px 32px
    },
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      md: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
    },
    borderRadius: {
      xs: '0.25rem', // 4px
      sm: '0.375rem', // 6px
      md: '0.5rem', // 8px
      lg: '0.75rem', // 12px
      xl: '9999px', // Full
    },
  } as const,

  // Input component tokens
  input: {
    height: {
      xs: '1.75rem', // 28px
      sm: '2rem', // 32px
      md: '2.5rem', // 40px
      lg: '3rem', // 48px
    },
    padding: {
      xs: '0.375rem 0.75rem', // 6px 12px
      sm: '0.5rem 1rem', // 8px 16px
      md: '0.625rem 1.25rem', // 10px 20px
      lg: '0.75rem 1.5rem', // 12px 24px
    },
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      md: '1rem', // 16px
      lg: '1.125rem', // 18px
    },
  } as const,

  // Card component tokens
  card: {
    padding: {
      xs: '0.75rem', // 12px
      sm: '1rem', // 16px
      md: '1.5rem', // 24px
      lg: '2rem', // 32px
      xl: '3rem', // 48px
    },
    borderRadius: {
      xs: '0.25rem', // 4px
      sm: '0.375rem', // 6px
      md: '0.5rem', // 8px
      lg: '0.75rem', // 12px
      xl: '1rem', // 16px
    },
    shadow: {
      none: 'none',
      sm: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    },
  } as const,

  // Modal/Dialog component tokens
  modal: {
    maxWidth: {
      xs: '20rem', // 320px
      sm: '24rem', // 384px
      md: '28rem', // 448px
      lg: '32rem', // 512px
      xl: '36rem', // 576px
      '2xl': '42rem', // 672px
      '3xl': '48rem', // 768px
      '4xl': '56rem', // 896px
      '5xl': '64rem', // 1024px
      '6xl': '72rem', // 1152px
      '7xl': '80rem', // 1280px
    },
    padding: '1.5rem', // 24px
    borderRadius: '0.75rem', // 12px
  } as const,

  // Navigation component tokens
  navigation: {
    height: {
      mobile: '4rem', // 64px
      desktop: '5rem', // 80px
    },
    padding: {
      mobile: '0 1rem', // 0 16px
      desktop: '0 2rem', // 0 32px
    },
  } as const,
} as const;

// ============================================================================
// 🛠️ UTILITY FUNCTIONS
// ============================================================================

/**
 * Tailwind Class Mappings
 * Maps design tokens to actual Tailwind CSS classes
 */
export const TAILWIND_CLASSES = {
  colors: {
    primary: {
      50: 'bg-blue-50',
      100: 'bg-blue-100',
      200: 'bg-blue-200',
      300: 'bg-blue-300',
      400: 'bg-blue-400',
      500: 'bg-blue-500',
      600: 'bg-blue-600',
      700: 'bg-blue-700',
      800: 'bg-blue-800',
      900: 'bg-blue-900',
    },
    neutral: {
      50: 'bg-gray-50',
      100: 'bg-gray-100',
      200: 'bg-gray-200',
      300: 'bg-gray-300',
      400: 'bg-gray-400',
      500: 'bg-gray-500',
      600: 'bg-gray-600',
      700: 'bg-gray-700',
      800: 'bg-gray-800',
      900: 'bg-gray-900',
    },
  },
  text: {
    primary: {
      50: 'text-blue-50',
      100: 'text-blue-100',
      200: 'text-blue-200',
      300: 'text-blue-300',
      400: 'text-blue-400',
      500: 'text-blue-500',
      600: 'text-blue-600',
      700: 'text-blue-700',
      800: 'text-blue-800',
      900: 'text-blue-900',
    },
    neutral: {
      50: 'text-gray-50',
      100: 'text-gray-100',
      200: 'text-gray-200',
      300: 'text-gray-300',
      400: 'text-gray-400',
      500: 'text-gray-500',
      600: 'text-gray-600',
      700: 'text-gray-700',
      800: 'text-gray-800',
      900: 'text-gray-900',
    },
  },
  border: {
    primary: {
      50: 'border-blue-50',
      100: 'border-blue-100',
      200: 'border-blue-200',
      300: 'border-blue-300',
      400: 'border-blue-400',
      500: 'border-blue-500',
      600: 'border-blue-600',
      700: 'border-blue-700',
      800: 'border-blue-800',
      900: 'border-blue-900',
    },
    neutral: {
      50: 'border-gray-50',
      100: 'border-gray-100',
      200: 'border-gray-200',
      300: 'border-gray-300',
      400: 'border-gray-400',
      500: 'border-gray-500',
      600: 'border-gray-600',
      700: 'border-gray-700',
      800: 'border-gray-800',
      900: 'border-gray-900',
    },
  },
} as const;

/**
 * Utility Functions for Working with Design Tokens
 */
export const tokenUtils = {
  /**
   * Get a color value with optional shade
   */
  getColor: (colorPath: string, shade?: number): string => {
    const parts = colorPath.split('.');
    let value: unknown = COLORS;

    for (const part of parts) {
      value = value?.[part];
    }

    if (shade !== undefined && typeof value === 'object') {
      return value?.[shade] || value;
    }

    return value || colorPath;
  },

  /**
   * Get a Tailwind class for a color
   */
  getTailwindClass: (
    type: 'colors' | 'text' | 'border',
    colorPath: 'primary' | 'neutral',
    shade: number
  ): string => {
    return (
      TAILWIND_CLASSES?.[type]?.[colorPath]?.[
        shade as keyof typeof TAILWIND_CLASSES.colors.primary
      ] || ''
    );
  },

  /**
   * Get a spacing value
   */
  getSpacing: (key: keyof typeof SPACING): string => {
    return SPACING?.[key];
  },

  /**
   * Get a typography value
   */
  getTypography: (path: string): unknown => {
    const parts = path.split('.');
    let value: unknown = TYPOGRAPHY;

    for (const part of parts) {
      value = value?.[part];
    }

    return value;
  },

  /**
   * Get a component-specific token
   */
  getComponentToken: (component: keyof typeof COMPONENT_TOKENS, path: string): unknown => {
    const parts = path.split('.');
    let value: unknown = COMPONENT_TOKENS?.[component];

    for (const part of parts) {
      value = value?.[part];
    }

    return value;
  },

  /**
   * Generate CSS custom properties from tokens
   */
  generateCSSVariables: (prefix = '--ds'): string => {
    const variables: string[] = [];

    // Color variables
    Object.entries(COLORS).forEach(([category, shades]) => {
      if (typeof shades === 'object') {
        Object.entries(shades as Record<string, unknown>).forEach(([shade, value]) => {
          if (typeof value === 'string') {
            variables.push(`${prefix}-${category}-${shade}: ${value};`);
          } else if (typeof value === 'object') {
            Object.entries(value).forEach(([subShade, subValue]) => {
              variables.push(`${prefix}-${category}-${shade}-${subShade}: ${subValue};`);
            });
          }
        });
      }
    });

    // Spacing variables
    Object.entries(SPACING).forEach(([key, value]) => {
      variables.push(`${prefix}-spacing-${key}: ${value};`);
    });

    // Other token variables...
    Object.entries(BORDER_RADIUS).forEach(([key, value]) => {
      variables.push(`${prefix}-radius-${key}: ${value};`);
    });

    return `:root {\n  ${variables.join('\n  ')}\n}`;
  },
} as const;

// ============================================================================
// 📝 TYPE DEFINITIONS
// ============================================================================

/**
 * Type Definitions for Design Tokens
 */
export type ColorToken = typeof COLORS;
export type TypographyToken = typeof TYPOGRAPHY;
export type SpacingToken = typeof SPACING;
export type BorderRadiusToken = typeof BORDER_RADIUS;
export type ShadowToken = typeof SHADOWS;
export type OpacityToken = typeof OPACITY;
export type ZIndexToken = typeof Z_INDEX;
export type AnimationToken = typeof ANIMATION;
export type BreakpointToken = typeof BREAKPOINTS;
export type ComponentToken = typeof COMPONENT_TOKENS;

// Export everything as a single design system object
export const DESIGN_SYSTEM = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  opacity: OPACITY,
  zIndex: Z_INDEX,
  animation: ANIMATION,
  breakpoints: BREAKPOINTS,
  components: COMPONENT_TOKENS,
  utils: tokenUtils,
} as const;

export default DESIGN_SYSTEM;
