/**
 * Wind Speed Unit Selector Component
 * Provides smooth switching between wind speed units with improved UI clarity
 * and consistent styling across the React Weather App
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/design-system/theme';

export interface WindSpeedUnitSelectorProps {
  /** Current wind speed unit */
  windSpeedUnit: 'ms' | 'kmh' | 'mph' | 'knots';
  /** Function to change wind speed unit */
  onUnitChange: (unit: 'ms' | 'kmh' | 'mph' | 'knots') => void;
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

type WindSpeedUnit = 'ms' | 'kmh' | 'mph' | 'knots';

const UNIT_METADATA: Record<
  WindSpeedUnit,
  { labelKey: string; fallbackLabel: string; symbol: string; descriptionKey: string }
> = {
  ms: {
    labelKey: 'common:settings.options.windSpeedUnits.ms',
    fallbackLabel: 'm/s (meters per second)',
    symbol: 'm/s',
    descriptionKey: 'weather:windSpeedUnits.ms',
  },
  kmh: {
    labelKey: 'common:settings.options.windSpeedUnits.kmh',
    fallbackLabel: 'km/h (kilometers per hour)',
    symbol: 'km/h',
    descriptionKey: 'weather:windSpeedUnits.kmh',
  },
  mph: {
    labelKey: 'common:settings.options.windSpeedUnits.mph',
    fallbackLabel: 'mph (miles per hour)',
    symbol: 'mph',
    descriptionKey: 'weather:windSpeedUnits.mph',
  },
  knots: {
    labelKey: 'common:settings.options.windSpeedUnits.knots',
    fallbackLabel: 'knots',
    symbol: 'knots',
    descriptionKey: 'weather:windSpeedUnits.knots',
  },
};

const VARIANT_STYLES: Record<
  NonNullable<WindSpeedUnitSelectorProps['variant']>,
  {
    container: string;
    option: string;
    unitText: string;
    labelText: string;
    descriptionText: string;
  }
> = {
  default: {
    container: 'min-w-[12rem] p-1.5 gap-2',
    option: 'py-2 px-3.5',
    unitText: 'text-lg font-semibold',
    labelText: 'text-xs',
    descriptionText: 'text-[0.65rem]',
  },
  compact: {
    container: 'min-w-[8rem] p-1 gap-1.5',
    option: 'py-1.5 px-2.5',
    unitText: 'text-sm font-semibold',
    labelText: 'text-xs',
    descriptionText: 'text-[0.6rem]',
  },
  detailed: {
    container: 'min-w-[14rem] p-2 gap-2',
    option: 'py-2.5 px-4',
    unitText: 'text-xl font-semibold',
    labelText: 'text-sm',
    descriptionText: 'text-xs',
  },
};

const WindSpeedUnitSelector: React.FC<WindSpeedUnitSelectorProps> = ({
  windSpeedUnit,
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
  const [hoveredUnit, setHoveredUnit] = useState<WindSpeedUnit | null>(null);

  const styles = VARIANT_STYLES[variant];

  const handleUnitChange = (unit: WindSpeedUnit) => {
    if (!disabled && !loading) {
      onUnitChange(unit);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, unit: WindSpeedUnit) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleUnitChange(unit);
    }
  };

  return (
    <div
      className={`
        inline-flex rounded-lg transition-all duration-200 border
        ${styles.container}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${loading ? 'animate-pulse' : ''}
        ${className}
      `}
      style={{
        backgroundColor: `var(--theme-surface, ${theme.surfaceColor})`,
        borderColor: `var(--theme-border, ${theme.isDark ? '#374151' : '#e5e7eb'})`,
        color: theme.textColor,
      }}
      role="radiogroup"
      aria-label={t('common:settings.options.windSpeedUnits.label')}
    >
      {(Object.keys(UNIT_METADATA) as WindSpeedUnit[]).map(unit => {
        const metadata = UNIT_METADATA[unit];
        const isActive = windSpeedUnit === unit;
        const isHovered = hoveredUnit === unit;

        return (
          <button
            key={unit}
            type="button"
            disabled={disabled || loading}
            className={`
              flex-1 flex flex-col items-center justify-center rounded-md
              transition-all duration-200 ease-in-out
              ${styles.option}
              ${!disabled && !loading ? 'cursor-pointer' : 'cursor-not-allowed'}
            `}
            style={{
              backgroundColor: isActive
                ? `var(--theme-accent, ${theme.accentColor})`
                : isHovered && !isActive
                  ? `var(--theme-hover, ${theme.isDark ? '#374151' : '#f3f4f6'})`
                  : 'transparent',
              color: isActive ? '#ffffff' : theme.textColor,
              boxShadow: isActive ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
            }}
            onClick={() => handleUnitChange(unit)}
            onKeyDown={e => handleKeyDown(e, unit)}
            onMouseEnter={() => setHoveredUnit(unit)}
            onMouseLeave={() => setHoveredUnit(null)}
            role="radio"
            aria-checked={isActive}
            aria-label={`${t(metadata.labelKey, { fallback: metadata.fallbackLabel })} ${isActive ? t('common:settings.options.units.currentSelection') : ''}`}
            tabIndex={isActive ? 0 : -1}
          >
            <span className={styles.unitText}>{metadata.symbol}</span>

            {showLabels && (
              <span
                className={`mt-1 ${styles.labelText}`}
                style={{
                  color: isActive ? 'rgba(255, 255, 255, 0.9)' : theme.textSecondaryColor,
                }}
              >
                {t(metadata.labelKey, { fallback: metadata.fallbackLabel })}
              </span>
            )}

            {showDescriptions && variant === 'detailed' && (
              <span
                className={`mt-1 text-center ${styles.descriptionText}`}
                style={{
                  color: isActive ? 'rgba(255, 255, 255, 0.8)' : theme.textSecondaryColor,
                  opacity: isActive ? 0.9 : 0.7,
                }}
              >
                {t(metadata.descriptionKey)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

WindSpeedUnitSelector.displayName = 'WindSpeedUnitSelector';

export default WindSpeedUnitSelector;
