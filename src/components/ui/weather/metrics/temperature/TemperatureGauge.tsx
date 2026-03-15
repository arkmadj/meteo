/**
 * TemperatureGauge Component
 * Visual temperature gauge with progress bar and circular gauge for intuitive temperature understanding
 */

import { useTheme } from '@/design-system/theme';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface TemperatureGaugeProps {
  /** Current temperature */
  temperature: number;
  /** Temperature unit */
  unit: 'C' | 'F';
  /** Minimum temperature (optional) */
  minTemp?: number;
  /** Maximum temperature (optional) */
  maxTemp?: number;
  /** Size variant of the gauge */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show the numeric value */
  showValue?: boolean;
  /** Whether to show the comfort level indicator */
  showComfortLevel?: boolean;
  /** Whether to show the detailed gauge */
  showGauge?: boolean;
  /** Whether to show min/max range */
  showRange?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const TemperatureGauge: React.FC<TemperatureGaugeProps> = ({
  temperature,
  unit,
  minTemp,
  maxTemp,
  size = 'md',
  showValue = true,
  showComfortLevel = true,
  showGauge = true,
  showRange = true,
  className = '',
}) => {
  const { t } = useTranslation(['weather']);
  const { theme } = useTheme();

  // Temperature range for gauge (adjust based on unit)
  const tempRange = unit === 'C' ? { min: -20, max: 50 } : { min: -4, max: 122 };

  // Normalize temperature to 0-100 scale for gauge
  const normalizedTemp = Math.max(
    0,
    Math.min(100, ((temperature - tempRange.min) / (tempRange.max - tempRange.min)) * 100)
  );

  // Get temperature comfort level and color
  const getTemperatureInfo = (temp: number, tempUnit: 'C' | 'F') => {
    const celsius = tempUnit === 'C' ? temp : ((temp - 32) * 5) / 9;

    if (celsius < 0) {
      return {
        level: t('weather:temperature.freezing', 'Freezing'),
        color: 'text-blue-700',
        bgColor: 'bg-blue-600',
        description: t(
          'weather:temperature.freezingDescription',
          'Very cold - freezing conditions'
        ),
        comfort: 'poor',
      };
    } else if (celsius < 10) {
      return {
        level: t('weather:temperature.cold', 'Cold'),
        color: 'text-blue-600',
        bgColor: 'bg-blue-500',
        description: t('weather:temperature.coldDescription', 'Cold - dress warmly'),
        comfort: 'poor',
      };
    } else if (celsius < 18) {
      return {
        level: t('weather:temperature.cool', 'Cool'),
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-500',
        description: t('weather:temperature.coolDescription', 'Cool - light jacket recommended'),
        comfort: 'fair',
      };
    } else if (celsius >= 18 && celsius <= 25) {
      return {
        level: t('weather:temperature.comfortable', 'Comfortable'),
        color: 'text-green-600',
        bgColor: 'bg-green-500',
        description: t('weather:temperature.comfortableDescription', 'Perfect temperature'),
        comfort: 'excellent',
      };
    } else if (celsius <= 30) {
      return {
        level: t('weather:temperature.warm', 'Warm'),
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-500',
        description: t('weather:temperature.warmDescription', 'Warm - comfortable for most'),
        comfort: 'good',
      };
    } else if (celsius <= 35) {
      return {
        level: t('weather:temperature.hot', 'Hot'),
        color: 'text-orange-600',
        bgColor: 'bg-orange-500',
        description: t('weather:temperature.hotDescription', 'Hot - stay hydrated'),
        comfort: 'fair',
      };
    } else {
      return {
        level: t('weather:temperature.extreme', 'Extreme'),
        color: 'text-red-600',
        bgColor: 'bg-red-500',
        description: t(
          'weather:temperature.extremeDescription',
          'Extremely hot - take precautions'
        ),
        comfort: 'poor',
      };
    }
  };

  const hexToRgba = (hex: string, alpha: number) => {
    if (!hex) {
      return `rgba(0, 0, 0, ${alpha})`;
    }

    const sanitized = hex.replace('#', '');
    const normalized =
      sanitized.length === 3
        ? sanitized
            .split('')
            .map(char => `${char}${char}`)
            .join('')
        : sanitized;
    const value = Number.parseInt(normalized, 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const scaleCardBackground = theme.isDark
    ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.94), rgba(15, 23, 42, 0.88))'
    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(226, 232, 240, 0.85))';

  const scaleCardBorder = theme.isDark ? 'rgba(148, 163, 184, 0.28)' : 'rgba(203, 213, 225, 0.9)';
  const scaleCardShadow = theme.isDark
    ? '0 16px 32px rgba(8, 15, 26, 0.55)'
    : '0 12px 28px rgba(15, 23, 42, 0.12)';

  const temperatureScaleItems: Array<{
    id: string;
    range: string;
    label: string;
    accent: string;
  }> = [
    {
      id: 'cold',
      range: unit === 'C' ? '<10°C' : '<50°F',
      label: t('weather:temperature.coldRange', 'Cold'),
      accent: theme.isDark ? theme.colors.primary[400] : theme.colors.primary[500],
    },
    {
      id: 'ideal',
      range: unit === 'C' ? '18-25°C' : '64-77°F',
      label: t('weather:temperature.idealRange', 'Ideal'),
      accent: theme.isDark
        ? theme.colors.semantic.success[600]
        : theme.colors.semantic.success[500],
    },
    {
      id: 'warm',
      range: unit === 'C' ? '25-30°C' : '77-86°F',
      label: t('weather:temperature.warmRange', 'Warm'),
      accent: theme.isDark
        ? theme.colors.semantic.warning[600]
        : theme.colors.semantic.warning[500],
    },
    {
      id: 'hot',
      range: unit === 'C' ? '>35°C' : '>95°F',
      label: t('weather:temperature.hotRange', 'Hot'),
      accent: theme.isDark ? theme.colors.semantic.error[600] : theme.colors.semantic.error[500],
    },
  ];

  const tempInfo = getTemperatureInfo(temperature, unit);

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-24 h-24',
      strokeWidth: 6,
      fontSize: 'text-xs',
      valueSize: 'text-sm',
      progressHeight: 'h-2',
      iconSize: 'text-lg',
    },
    md: {
      container: 'w-32 h-32',
      strokeWidth: 8,
      fontSize: 'text-sm',
      valueSize: 'text-lg',
      progressHeight: 'h-3',
      iconSize: 'text-xl',
    },
    lg: {
      container: 'w-40 h-40',
      strokeWidth: 10,
      fontSize: 'text-base',
      valueSize: 'text-xl',
      progressHeight: 'h-4',
      iconSize: 'text-2xl',
    },
  };

  const config = sizeConfig?.[size];

  // Circular gauge calculations
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (normalizedTemp / 100) * circumference;

  // Temperature zones for the progress bar
  const getProgressBarSegments = () => {
    if (unit === 'C') {
      return [
        { start: 0, end: 14, color: 'bg-blue-500', label: 'Cold' }, // -20°C to 0°C
        { start: 14, end: 29, color: 'bg-cyan-400', label: 'Cool' }, // 0°C to 10°C
        { start: 29, end: 51, color: 'bg-green-400', label: 'Comfortable' }, // 10°C to 25°C
        { start: 51, end: 71, color: 'bg-yellow-400', label: 'Warm' }, // 25°C to 35°C
        { start: 71, end: 100, color: 'bg-red-400', label: 'Hot' }, // 35°C to 50°C
      ];
    } else {
      return [
        { start: 0, end: 25, color: 'bg-blue-500', label: 'Cold' }, // -4°F to 32°F
        { start: 25, end: 45, color: 'bg-cyan-400', label: 'Cool' }, // 32°F to 50°F
        { start: 45, end: 65, color: 'bg-green-400', label: 'Comfortable' }, // 50°F to 77°F
        { start: 65, end: 85, color: 'bg-yellow-400', label: 'Warm' }, // 77°F to 95°F
        { start: 85, end: 100, color: 'bg-red-400', label: 'Hot' }, // 95°F to 122°F
      ];
    }
  };

  return (
    <div className={`temperature-gauge ${className}`}>
      {/* Circular Gauge */}
      {showGauge && (
        <div className="flex justify-center mb-4">
          <div className={`relative ${config.container}`}>
            <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                className="text-gray-200"
                cx="50"
                cy="50"
                fill="transparent"
                r={radius}
                stroke="currentColor"
                strokeWidth={config.strokeWidth}
              />

              {/* Progress circle */}
              <circle
                className={`transition-all duration-1000 ease-out ${tempInfo.color.replace('text-', 'text-')}`}
                cx="50"
                cy="50"
                fill="transparent"
                r={radius}
                stroke="currentColor"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth={config.strokeWidth}
                style={{
                  filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.3))',
                }}
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`${config.iconSize} mb-1`}>🌡️</div>
              {showValue && (
                <div className={`font-bold ${tempInfo.color} ${config.valueSize}`}>
                  {Math.round(temperature)}°{unit}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Linear Progress Bar with Temperature Zones */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>
            {tempRange.min}°{unit}
          </span>
          <span>
            {Math.round((tempRange.min + tempRange.max) / 2)}°{unit}
          </span>
          <span>
            {tempRange.max}°{unit}
          </span>
        </div>

        <div
          className={`relative ${config.progressHeight} bg-gray-200 rounded-full overflow-hidden`}
        >
          {/* Temperature zone segments */}
          {getProgressBarSegments().map((segment, index) => (
            <div
              key={index}
              className={`absolute top-0 ${segment.color} opacity-30`}
              style={{
                left: `${segment.start}%`,
                width: `${segment.end - segment.start}%`,
                height: '100%',
              }}
            />
          ))}

          {/* Current temperature indicator */}
          <div
            className={`absolute top-0 ${tempInfo.bgColor} transition-all duration-1000 ease-out`}
            style={{
              width: `${normalizedTemp}%`,
              height: '100%',
              boxShadow: '0 0 8px rgba(59, 130, 246, 0.4)',
            }}
          />

          {/* Temperature pointer */}
          <div
            className="absolute top-0 w-1 h-full bg-white border border-gray-400 shadow-md transition-all duration-1000 ease-out"
            style={{
              left: `${normalizedTemp}%`,
              transform: 'translateX(-50%)',
            }}
          />
        </div>

        {/* Temperature zone labels */}
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Cold</span>
          <span>Comfortable</span>
          <span>Hot</span>
        </div>
      </div>

      {/* Min/Max Temperature Range */}
      {showRange && minTemp !== undefined && maxTemp !== undefined && (
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="flex items-center space-x-1 text-sm">
            <span className="text-blue-500">↓</span>
            <span className="font-medium text-gray-700">
              {Math.round(minTemp)}°{unit}
            </span>
            <span className="text-xs text-gray-500">Low</span>
          </div>
          <div className="flex items-center space-x-1 text-sm">
            <span className="text-red-500">↑</span>
            <span className="font-medium text-gray-700">
              {Math.round(maxTemp)}°{unit}
            </span>
            <span className="text-xs text-gray-500">High</span>
          </div>
        </div>
      )}

      {/* Comfort Level Indicator */}
      {showComfortLevel && (
        <div className="text-center" data-testid="comfort-indicator">
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${tempInfo.color} bg-opacity-10`}
            style={{ backgroundColor: `${tempInfo.bgColor.replace('bg-', '')}10` }}
          >
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${tempInfo.bgColor}`} />
              <span>{tempInfo.level}</span>
              {tempInfo.comfort === 'excellent' && <span>✨</span>}
              {tempInfo.comfort === 'good' && <span>👍</span>}
              {tempInfo.comfort === 'fair' && <span>👌</span>}
              {tempInfo.comfort === 'poor' && <span>⚠️</span>}
            </div>
          </div>
          <p className={`text-xs mt-1 ${tempInfo.color} opacity-80`}>{tempInfo.description}</p>
        </div>
      )}

      {/* Temperature Scale Reference */}
      <div
        data-testid="temperature-scale-card"
        className={`mt-4 rounded-xl border px-4 py-3 transition-[background,box-shadow,border-color] duration-300 ${
          theme.isDark ? 'backdrop-blur-sm' : 'backdrop-blur'
        }`}
        style={{
          background: scaleCardBackground,
          borderColor: scaleCardBorder,
          boxShadow: scaleCardShadow,
        }}
      >
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--theme-text)] opacity-80">
          {t('weather:temperature.comfortScale', 'Temperature Scale')}
        </h5>
        <div className="grid grid-cols-2 gap-3 text-xs text-[var(--theme-text-secondary)]">
          {temperatureScaleItems.map(item => {
            const accentColor = item.accent;
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-md px-1 py-1 transition-transform duration-300 hover:translate-x-0.5"
              >
                <span
                  className="inline-flex h-2.5 w-2.5 flex-none rounded-full ring-1 ring-white/40 dark:ring-white/10"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: theme.isDark
                      ? `0 0 0.85rem ${hexToRgba(accentColor, 0.55)}`
                      : `0 0 0.65rem ${hexToRgba(accentColor, 0.35)}`,
                  }}
                />
                <span className="text-[var(--theme-text-secondary)]">
                  {item.range}: {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TemperatureGauge;
