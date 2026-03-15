import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/design-system/theme';
import { COLORS } from '@/design-system/tokens';

export interface VisibilityUnitSelectorProps {
  /** Current visibility unit */
  visibilityUnit: 'm' | 'km' | 'mi' | 'nm';
  /** Function to change visibility unit */
  onUnitChange: (unit: 'm' | 'km' | 'mi' | 'nm') => void;
  /** Component variant */
  variant?: 'default' | 'compact' | 'detailed';
  /** Show unit labels */
  showLabels?: boolean;
  /** Show description of units */
  showDescriptions?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Custom className */
  className?: string;
  /** Loading state for smooth transitions */
  loading?: boolean;
}

type VisibilityUnit = 'm' | 'km' | 'mi' | 'nm';

// Unit metadata for display and translation
const UNIT_METADATA: Record<
  VisibilityUnit,
  { labelKey: string; fallbackLabel: string; symbol: string; descriptionKey: string }
> = {
  m: {
    labelKey: 'common:settings.options.visibilityUnits.m',
    fallbackLabel: 'm (meters)',
    symbol: 'm',
    descriptionKey: 'weather:visibilityUnits.m',
  },
  km: {
    labelKey: 'common:settings.options.visibilityUnits.km',
    fallbackLabel: 'km (kilometers)',
    symbol: 'km',
    descriptionKey: 'weather:visibilityUnits.km',
  },
  mi: {
    labelKey: 'common:settings.options.visibilityUnits.mi',
    fallbackLabel: 'mi (miles)',
    symbol: 'mi',
    descriptionKey: 'weather:visibilityUnits.mi',
  },
  nm: {
    labelKey: 'common:settings.options.visibilityUnits.nm',
    fallbackLabel: 'nm (nautical miles)',
    symbol: 'nm',
    descriptionKey: 'weather:visibilityUnits.nm',
  },
};

// Theme-aware color utilities
const getThemeColors = (theme: any) => {
  const isDark = theme.isDark;
  const isHighContrast = theme.isHighContrast;

  // Surface colors for different states
  const surfaceColors = {
    default: isDark ? COLORS.neutral[800] : COLORS.neutral[100],
    hover: isDark ? COLORS.neutral[700] : COLORS.neutral[200],
    active: isDark ? COLORS.neutral[600] : COLORS.neutral[300],
  };

  // Border colors
  const borderColors = {
    default: isDark ? COLORS.neutral[700] : COLORS.neutral[200],
    hover: isDark ? COLORS.neutral[600] : COLORS.neutral[300],
    active: theme.primaryColor,
  };

  // Text colors
  const textColors = {
    primary: theme.textColor,
    secondary: theme.textSecondaryColor,
    active: 'rgba(255, 255, 255, 0.9)',
    disabled: isDark ? COLORS.neutral[500] : COLORS.neutral[400],
  };

  return {
    surfaceColors,
    borderColors,
    textColors,
    primaryColor: theme.primaryColor,
    accentColor: theme.accentColor,
    isDark,
    isHighContrast,
  };
};

// Component variant styles with theme-aware colors
const getVariantStyles = (theme: any) => {
  const colors = getThemeColors(theme);

  return {
    default: {
      container: {
        backgroundColor: colors.surfaceColors.default,
        borderColor: colors.borderColors.default,
        padding: '0.25rem',
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
      button: {
        padding: '0.5rem 0.75rem',
        fontSize: '0.875rem',
        fontWeight: '500',
        borderRadius: '0.375rem',
        transition: 'all 0.2s',
      },
      unitText: {
        fontSize: '1.125rem',
        fontWeight: '600',
      },
      labelText: {
        fontSize: '0.75rem',
      },
    },
    compact: {
      container: {
        backgroundColor: colors.surfaceColors.default,
        borderColor: colors.borderColors.default,
        padding: '0.125rem',
        borderRadius: '0.375rem',
      },
      button: {
        padding: '0.25rem 0.5rem',
        fontSize: '0.75rem',
        fontWeight: '500',
        borderRadius: '0.25rem',
        transition: 'all 0.2s',
      },
      unitText: {
        fontSize: '0.875rem',
        fontWeight: '600',
      },
      labelText: {
        fontSize: '0.75rem',
      },
    },
    detailed: {
      container: {
        backgroundColor: colors.surfaceColors.default,
        borderColor: colors.borderColors.default,
        padding: '0.5rem',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        borderRadius: '0.5rem',
      },
      button: {
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        fontWeight: '500',
        borderRadius: '0.5rem',
        transition: 'all 0.2s',
        flexDirection: 'column',
        alignItems: 'center',
      },
      unitText: {
        fontSize: '1.25rem',
        fontWeight: '700',
      },
      labelText: {
        fontSize: '0.75rem',
        marginTop: '0.25rem',
      },
    },
  };
};

const VisibilityUnitSelector: React.FC<VisibilityUnitSelectorProps> = ({
  visibilityUnit,
  onUnitChange,
  variant = 'default',
  showLabels = true,
  showDescriptions = false,
  disabled = false,
  className = '',
  loading = false,
}) => {
  const { t } = useTranslation(['common', 'weather']);
  const { theme } = useTheme();
  const [hoveredUnit, setHoveredUnit] = useState<VisibilityUnit | null>(null);
  const [focusedUnit, setFocusedUnit] = useState<VisibilityUnit | null>(null);

  const styles = getVariantStyles(theme)[variant];
  const colors = getThemeColors(theme);

  const handleUnitChange = (unit: VisibilityUnit) => {
    if (!disabled && !loading) {
      onUnitChange(unit);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, unit: VisibilityUnit) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleUnitChange(unit);
    }
  };

  const getButtonStyles = (isActive: boolean, isHovered: boolean, isFocused: boolean) => {
    const baseStyles = {
      ...styles.button,
      display: styles.button.flexDirection === 'column' ? 'flex' : 'inline-flex',
      alignItems: styles.button.alignItems || 'center',
      justifyContent: 'center',
      border: '1px solid transparent',
      outline: 'none',
      position: 'relative' as const,
    };

    if (disabled || loading) {
      return {
        ...baseStyles,
        backgroundColor: colors.surfaceColors.default,
        color: colors.textColors.disabled,
        cursor: 'not-allowed',
        opacity: 0.6,
      };
    }

    if (isActive) {
      return {
        ...baseStyles,
        backgroundColor: colors.primaryColor,
        color: colors.textColors.active,
        borderColor: colors.primaryColor,
        boxShadow: `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px 0 rgb(0 0 0 / 0.06)`,
        transform: 'scale(1.02)',
      };
    }

    const isInteractive = isHovered || isFocused;
    if (isInteractive) {
      return {
        ...baseStyles,
        backgroundColor: colors.surfaceColors.hover,
        color: colors.textColors.primary,
        borderColor: colors.borderColors.hover,
        boxShadow: `0 1px 2px 0 rgb(0 0 0 / 0.05)`,
      };
    }

    return {
      ...baseStyles,
      backgroundColor: 'transparent',
      color: colors.textColors.primary,
      borderColor: 'transparent',
    };
  };

  return (
    <div
      className={`inline-flex rounded-lg transition-all duration-200 ${className}`}
      style={{
        backgroundColor: styles.container.backgroundColor,
        borderColor: styles.container.borderColor,
        padding: styles.container.padding,
        boxShadow: styles.container.boxShadow,
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
      role="radiogroup"
      aria-label={t('common:settings.options.visibilityUnits.label')}
    >
      {(Object.keys(UNIT_METADATA) as VisibilityUnit[]).map(unit => {
        const metadata = UNIT_METADATA[unit];
        const isActive = visibilityUnit === unit;
        const isHovered = hoveredUnit === unit;
        const isFocused = focusedUnit === unit;

        return (
          <button
            key={unit}
            style={getButtonStyles(isActive, isHovered, isFocused)}
            onClick={() => handleUnitChange(unit)}
            onKeyDown={e => handleKeyDown(e, unit)}
            onMouseEnter={() => setHoveredUnit(unit)}
            onMouseLeave={() => setHoveredUnit(null)}
            onFocus={() => setFocusedUnit(unit)}
            onBlur={() => setFocusedUnit(null)}
            role="radio"
            aria-checked={isActive}
            aria-label={`${t(metadata.labelKey, { fallback: metadata.fallbackLabel })} ${isActive ? t('common:settings.options.units.currentSelection') : ''}`}
            tabIndex={isActive ? 0 : -1}
          >
            <span style={styles.unitText}>{metadata.symbol}</span>

            {showLabels && (
              <span
                style={{
                  ...styles.labelText,
                  marginTop: styles.labelText.marginTop || '0.25rem',
                  color: isActive ? colors.textColors.active : colors.textColors.secondary,
                }}
              >
                {t(metadata.labelKey, { fallback: metadata.fallbackLabel })}
              </span>
            )}

            {showDescriptions && (
              <span
                style={{
                  fontSize: '0.75rem',
                  marginTop: '0.25rem',
                  display: 'block',
                  maxWidth: '12rem',
                  color: colors.textColors.secondary,
                }}
              >
                {t(metadata.descriptionKey, { fallback: '' })}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default VisibilityUnitSelector;
