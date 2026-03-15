/**
 * HumidityMeter Component
 * Visual humidity meter with progress bar and gauge for intuitive humidity level understanding
 */

import { useTheme } from '@/design-system/theme';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface HumidityMeterProps {
  /** Humidity percentage (0-100) */
  humidity: number;
  /** Size variant of the meter */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show the numeric value */
  showValue?: boolean;
  /** Whether to show the comfort level indicator */
  showComfortLevel?: boolean;
  /** Whether to show the detailed gauge */
  showGauge?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const HumidityMeter: React.FC<HumidityMeterProps> = ({
  humidity,
  size = 'md',
  showValue = true,
  showComfortLevel = true,
  showGauge = true,
  className = '',
}) => {
  const { t } = useTranslation(['weather']);
  const { theme } = useTheme();

  // Clamp humidity between 0 and 100
  const clampedHumidity = Math.max(0, Math.min(100, humidity));

  // Get humidity comfort level and color
  const getHumidityInfo = (value: number) => {
    if (value < 30) {
      return {
        level: t('weather:humidity.low', 'Low'),
        color: 'text-orange-600',
        bgColor: 'bg-orange-500',
        description: t('weather:humidity.lowDescription', 'Too dry - may cause discomfort'),
        comfort: 'poor',
      };
    } else if (value > 70) {
      return {
        level: t('weather:humidity.high', 'High'),
        color: 'text-blue-600',
        bgColor: 'bg-blue-500',
        description: t('weather:humidity.highDescription', 'Too humid - may feel sticky'),
        comfort: 'poor',
      };
    } else if (value >= 40 && value <= 60) {
      return {
        level: t('weather:humidity.optimal', 'Optimal'),
        color: 'text-green-600',
        bgColor: 'bg-green-500',
        description: t('weather:humidity.optimalDescription', 'Perfect comfort level'),
        comfort: 'excellent',
      };
    } else {
      return {
        level: t('weather:humidity.normal', 'Normal'),
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-500',
        description: t('weather:humidity.normalDescription', 'Comfortable level'),
        comfort: 'good',
      };
    }
  };

  const comfortScaleBackground = theme.isDark
    ? 'linear-gradient(145deg, rgba(30,41,59,0.92), rgba(15,23,42,0.85))'
    : 'linear-gradient(145deg, rgba(255,255,255,0.96), rgba(226,232,240,0.85))';
  const comfortScaleBorder = theme.isDark
    ? 'rgba(148, 163, 184, 0.35)'
    : 'rgba(148, 163, 184, 0.25)';
  const comfortScaleShadow = theme.isDark
    ? '0 16px 32px rgba(2, 6, 23, 0.45)'
    : '0 16px 32px rgba(148, 163, 184, 0.28)';

  const humidityScaleItems = [
    {
      id: 'tooLow',
      range: '0-30%',
      label: t('weather:humidity.tooLow', 'Too Low'),
      accent: '#f97316',
    },
    {
      id: 'ideal',
      range: '40-60%',
      label: t('weather:humidity.ideal', 'Ideal'),
      accent: '#34d399',
    },
    {
      id: 'comfortable',
      range: '30-70%',
      label: t('weather:humidity.comfortable', 'Comfortable'),
      accent: '#22d3ee',
    },
    {
      id: 'tooHigh',
      range: '70%+',
      label: t('weather:humidity.tooHigh', 'Too High'),
      accent: '#38bdf8',
    },
  ];

  const humidityInfo = getHumidityInfo(clampedHumidity);

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
  const strokeDashoffset = circumference - (clampedHumidity / 100) * circumference;

  // Comfort zones for the progress bar
  const getProgressBarSegments = () => {
    return [
      { start: 0, end: 30, color: 'bg-orange-400', label: 'Low' },
      { start: 30, end: 40, color: 'bg-yellow-400', label: 'Fair' },
      { start: 40, end: 60, color: 'bg-green-400', label: 'Optimal' },
      { start: 60, end: 70, color: 'bg-cyan-400', label: 'Good' },
      { start: 70, end: 100, color: 'bg-blue-400', label: 'High' },
    ];
  };

  return (
    <div className={`humidity-meter ${className}`}>
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
                className={`transition-all duration-1000 ease-out ${humidityInfo.color.replace('text-', 'text-')}`}
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
              <div className={`${config.iconSize} mb-1`}>💧</div>
              {showValue && (
                <div
                  className={`font-bold ${humidityInfo.color} ${config.valueSize}`}
                  data-testid="humidity-value"
                >
                  {clampedHumidity}%
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Linear Progress Bar with Comfort Zones */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>

        <div
          className={`relative ${config.progressHeight} bg-gray-200 rounded-full overflow-hidden`}
        >
          {/* Comfort zone segments */}
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

          {/* Current humidity indicator */}
          <div
            className={`absolute top-0 ${humidityInfo.bgColor} transition-all duration-1000 ease-out`}
            style={{
              width: `${clampedHumidity}%`,
              height: '100%',
              boxShadow: '0 0 8px rgba(59, 130, 246, 0.4)',
            }}
          />

          {/* Humidity pointer */}
          <div
            className="absolute top-0 w-1 h-full bg-white border border-gray-400 shadow-md transition-all duration-1000 ease-out"
            style={{
              left: `${clampedHumidity}%`,
              transform: 'translateX(-50%)',
            }}
          />
        </div>

        {/* Comfort zone labels */}
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Dry</span>
          <span>Optimal</span>
          <span>Humid</span>
        </div>
      </div>

      {/* Comfort Level Indicator */}
      {showComfortLevel && (
        <div className="text-center" data-testid="humidity-comfort-indicator">
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${humidityInfo.color} bg-opacity-10`}
            style={{ backgroundColor: `${humidityInfo.bgColor.replace('bg-', '')}10` }}
          >
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${humidityInfo.bgColor}`} />
              <span>{humidityInfo.level}</span>
              {humidityInfo.comfort === 'excellent' && <span>✨</span>}
              {humidityInfo.comfort === 'good' && <span>👍</span>}
              {humidityInfo.comfort === 'poor' && <span>⚠️</span>}
            </div>
          </div>
          <p className={`text-xs mt-1 ${humidityInfo.color} opacity-80`}>
            {humidityInfo.description}
          </p>
        </div>
      )}

      {/* Humidity Scale Reference */}
      <div
        data-testid="humidity-comfort-scale-card"
        className={`mt-4 rounded-xl border px-4 py-3 transition-[background,box-shadow,border-color] duration-300 ${
          theme.isDark ? 'backdrop-blur-sm' : 'backdrop-blur'
        }`}
        style={{
          background: comfortScaleBackground,
          borderColor: comfortScaleBorder,
          boxShadow: comfortScaleShadow,
        }}
      >
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--theme-text)] opacity-80">
          {t('weather:humidity.comfortScale', 'Comfort Scale')}
        </h5>
        <div className="grid grid-cols-2 gap-3 text-xs text-[var(--theme-text-secondary)]">
          {humidityScaleItems.map(item => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-md px-1 py-1 transition-transform duration-300 hover:translate-x-0.5"
            >
              <span
                className="inline-flex h-2.5 w-2.5 flex-none rounded-full ring-1 ring-white/40 dark:ring-white/10"
                style={{ backgroundColor: item.accent }}
              />
              <span className="text-[var(--theme-text-secondary)]">
                {item.range}: {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HumidityMeter;
