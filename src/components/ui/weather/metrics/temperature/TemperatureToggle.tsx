/**
 * Enhanced Temperature Toggle Component
 * Provides smooth switching between Celsius and Fahrenheit with improved UI clarity
 * and consistent styling across Meteo
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

export interface TemperatureToggleProps {
  /** Current temperature unit */
  temperatureUnit: 'C' | 'F';
  /** Function to toggle temperature unit */
  onToggle: () => void;
  /** Component variant */
  variant?: 'default' | 'compact' | 'detailed' | 'minimal';
  /** Show unit labels */
  showLabels?: boolean;
  /** Show preview of alternate unit */
  showPreview?: boolean;
  /** Temperature value for preview (optional) */
  previewTemperature?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Custom className */
  className?: string;
  /** Loading state for smooth transitions */
  loading?: boolean;
}

type TemperatureUnit = 'C' | 'F';

const UNIT_METADATA: Record<
  TemperatureUnit,
  { labelKey: string; fallbackLabel: string; symbol: string }
> = {
  C: { labelKey: 'weather:labels.celsius', fallbackLabel: 'Celsius', symbol: '°C' },
  F: { labelKey: 'weather:labels.fahrenheit', fallbackLabel: 'Fahrenheit', symbol: '°F' },
};

const VARIANT_STYLES: Record<
  NonNullable<TemperatureToggleProps['variant']>,
  {
    container: string;
    option: string;
    unitText: string;
    labelText: string;
    previewText: string;
    statusText: string;
  }
> = {
  minimal: {
    container: 'min-w-[6.5rem] p-1 gap-1',
    option: 'py-1.5 px-2',
    unitText: 'text-sm font-semibold',
    labelText: 'text-[0.6rem]',
    previewText: 'text-[0.6rem]',
    statusText: 'text-[0.55rem]',
  },
  compact: {
    container: 'min-w-[7.5rem] p-1.5 gap-1',
    option: 'py-1.5 px-3',
    unitText: 'text-base font-semibold',
    labelText: 'text-[0.7rem]',
    previewText: 'text-[0.65rem]',
    statusText: 'text-[0.6rem]',
  },
  default: {
    container: 'min-w-[9rem] p-1.5 gap-2',
    option: 'py-2 px-3.5',
    unitText: 'text-lg font-semibold',
    labelText: 'text-xs',
    previewText: 'text-[0.7rem]',
    statusText: 'text-[0.65rem]',
  },
  detailed: {
    container: 'min-w-[10.5rem] p-2 gap-2',
    option: 'py-2.5 px-4',
    unitText: 'text-xl font-semibold',
    labelText: 'text-sm',
    previewText: 'text-xs',
    statusText: 'text-[0.7rem]',
  },
};

const convertBetweenUnits = (value: number, from: TemperatureUnit, to: TemperatureUnit) => {
  if (Number.isNaN(value)) return value;
  if (from === to) return value;
  return to === 'F' ? (value * 9) / 5 + 32 : ((value - 32) * 5) / 9;
};

const formatTemperature = (value: number, unit: TemperatureUnit) => {
  if (Number.isNaN(value)) return '';
  return `${Math.round(value)}°${unit}`;
};

const TemperatureToggle: React.FC<TemperatureToggleProps> = ({
  temperatureUnit,
  onToggle,
  variant = 'default',
  showLabels = true,
  showPreview = false,
  previewTemperature,
  disabled = false,
  className = '',
  loading = false,
}) => {
  const { t } = useTranslation(['common', 'weather']);
  const config = VARIANT_STYLES[variant];
  const groupLabel = t('weather:labels.temperatureUnitToggle', {
    defaultValue: 'Temperature unit toggle',
  });
  const isDisabled = disabled || loading;

  const baseButtonClasses = [
    'relative flex flex-1 flex-col items-center justify-center rounded-full border transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--theme-primary)]',
    'focus-visible:ring-offset-[color:var(--theme-surface,#ffffff)]/80',
    config.option,
  ].join(' ');

  const containerClasses = [
    'relative grid grid-cols-2 rounded-full border bg-[var(--theme-surface)]/85 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-[var(--theme-surface)]/70 transition-colors',
    'border-[var(--theme-border-strong,var(--theme-border))]',
    config.container,
  ].join(' ');

  const getPreviewForUnit = (unit: TemperatureUnit) => {
    if (!showPreview || previewTemperature === undefined || previewTemperature === null) {
      return null;
    }
    const converted = convertBetweenUnits(previewTemperature, temperatureUnit, unit);
    if (Number.isNaN(converted)) return null;
    return formatTemperature(converted, unit);
  };

  const handleSelect = (unit: TemperatureUnit) => {
    if (isDisabled || unit === temperatureUnit) return;
    onToggle();
  };

  const handleKeyNavigation = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    unit: TemperatureUnit
  ) => {
    if (isDisabled) return;

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      handleSelect('C');
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      handleSelect('F');
    } else if (event.key === 'Enter' || event.key === ' ') {
      // Support keyboard activation via Enter/Space in environments
      // where the default button click behavior is not simulated
      event.preventDefault();
      handleSelect(unit);
    }
  };

  const renderStatus = (isActive: boolean) => {
    if (!isActive || !showLabels) return null;
    return (
      <span
        className={`${config.statusText} mt-1 uppercase tracking-[0.12em] text-[var(--theme-primary)]`}
      >
        {t('weather:labels.currentSelection', { defaultValue: 'Current' })}
      </span>
    );
  };

  const renderPreview = (unit: TemperatureUnit, isActive: boolean) => {
    if (!showPreview) return null;
    const previewValue = getPreviewForUnit(unit);
    if (!previewValue) return null;
    return (
      <span
        className={`${config.previewText} ${
          isActive ? 'text-[var(--theme-text-secondary)]' : 'text-[var(--theme-primary)]'
        }`}
      >
        {previewValue}
      </span>
    );
  };

  const renderButton = (unit: TemperatureUnit) => {
    const isActive = unit === temperatureUnit;
    const meta = UNIT_METADATA[unit];
    const label = t(meta.labelKey, { defaultValue: meta.fallbackLabel });
    const ariaLabel = isActive
      ? `${t('weather:labels.currentUnit', { defaultValue: 'Current unit' })} ${label}`
      : `${t('weather:labels.switchTo', { defaultValue: 'Switch to' })} ${label}`;

    return (
      <button
        key={unit}
        type="button"
        data-unit={unit}
        className={`${baseButtonClasses} ${
          isActive
            ? 'border-[var(--theme-primary)]/40 bg-[var(--theme-primary)]/20 text-[var(--theme-text)] shadow-sm'
            : 'border-transparent text-[var(--theme-text-secondary)] hover:bg-[var(--theme-hover)]/60 hover:text-[var(--theme-text)]'
        } ${isDisabled ? 'cursor-not-allowed opacity-70' : ''}`}
        aria-pressed={isActive}
        aria-current={isActive ? 'true' : undefined}
        aria-label={ariaLabel}
        title={ariaLabel}
        disabled={isDisabled}
        data-active={isActive ? 'true' : 'false'}
        onClick={() => handleSelect(unit)}
        onKeyDown={event => handleKeyNavigation(event, unit)}
      >
        <span className={config.unitText}>{meta.symbol}</span>
        {showLabels && (
          <span
            className={`${config.labelText} ${
              isActive ? 'text-[var(--theme-text)]' : 'text-[var(--theme-text-secondary)]'
            }`}
          >
            {label}
          </span>
        )}
        {renderPreview(unit, isActive)}
        {renderStatus(isActive)}
      </button>
    );
  };

  return (
    <div className={`relative inline-flex ${className}`} data-temperature-toggle>
      <div
        className={containerClasses}
        role="group"
        aria-label={groupLabel}
        aria-disabled={isDisabled ? 'true' : undefined}
      >
        {(['C', 'F'] as TemperatureUnit[]).map(renderButton)}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-[var(--theme-surface)]/65">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--theme-primary)] border-t-transparent" />
          </div>
        )}
      </div>
    </div>
  );
};

export default TemperatureToggle;
