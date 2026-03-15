/**
 * UVIndexMeter Component
 * Visual UV Index meter with circular gauge and progress bar for intuitive UV level understanding
 */

import { useTheme } from '@/design-system/theme';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface UVIndexMeterProps {
  /** UV Index value (0-11+) */
  uvIndex: number;
  /** Size variant of the meter */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show the numeric value */
  showValue?: boolean;
  /** Whether to show the risk level indicator */
  showRiskLevel?: boolean;
  /** Whether to show the detailed gauge */
  showGauge?: boolean;
  /** Whether to show protection recommendations */
  showRecommendations?: boolean;
  /** Whether to show the progress bar */
  showProgressBar?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6 || Number.isNaN(Number.parseInt(normalized, 16))) {
    return hex;
  }

  const bigint = Number.parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const UVIndexMeter: React.FC<UVIndexMeterProps> = ({
  uvIndex,
  size = 'md',
  showValue = true,
  showRiskLevel = true,
  showGauge = true,
  showRecommendations = false,
  showProgressBar = true,
  className = '',
}) => {
  const { t } = useTranslation(['weather']);
  const { theme } = useTheme();

  // Clamp UV Index between 0 and 12 (extended scale)
  const clampedUVIndex = Math.max(0, Math.min(12, uvIndex));

  // Get UV Index risk level, color, and recommendations
  const getUVIndexInfo = (value: number) => {
    if (value <= 2) {
      return {
        level: t('weather:uvIndex.low', 'Low'),
        color: 'text-green-600',
        bgColor: 'bg-green-500',
        accentHex: '#22c55e',
        description: t('weather:uvIndex.lowDescription', 'Minimal risk - no protection needed'),
        recommendation: t('weather:uvIndex.lowRecommendation', 'Safe to be outside'),
        risk: 'minimal',
        icon: '🟢',
      };
    } else if (value <= 5) {
      return {
        level: t('weather:uvIndex.moderate', 'Moderate'),
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-500',
        accentHex: '#eab308',
        description: t(
          'weather:uvIndex.moderateDescription',
          'Low risk - some protection recommended'
        ),
        recommendation: t(
          'weather:uvIndex.moderateRecommendation',
          'Wear sunglasses on bright days'
        ),
        risk: 'low',
        icon: '🟡',
      };
    } else if (value <= 7) {
      return {
        level: t('weather:uvIndex.high', 'High'),
        color: 'text-orange-600',
        bgColor: 'bg-orange-500',
        accentHex: '#f97316',
        description: t('weather:uvIndex.highDescription', 'Moderate risk - protection essential'),
        recommendation: t(
          'weather:uvIndex.highRecommendation',
          'Wear sunscreen, hat, and sunglasses'
        ),
        risk: 'moderate',
        icon: '🟠',
      };
    } else if (value <= 10) {
      return {
        level: t('weather:uvIndex.veryHigh', 'Very High'),
        color: 'text-red-600',
        bgColor: 'bg-red-500',
        accentHex: '#ef4444',
        description: t(
          'weather:uvIndex.veryHighDescription',
          'High risk - extra protection required'
        ),
        recommendation: t(
          'weather:uvIndex.veryHighRecommendation',
          'Avoid sun 10am-4pm, use SPF 30+'
        ),
        risk: 'high',
        icon: '🔴',
      };
    } else {
      return {
        level: t('weather:uvIndex.extreme', 'Extreme'),
        color: 'text-purple-600',
        bgColor: 'bg-purple-500',
        accentHex: '#a855f7',
        description: t('weather:uvIndex.extremeDescription', 'Very high risk - avoid sun exposure'),
        recommendation: t('weather:uvIndex.extremeRecommendation', 'Stay indoors, use SPF 50+'),
        risk: 'extreme',
        icon: '🟣',
      };
    }
  };
  const uvInfo = getUVIndexInfo(clampedUVIndex);

  const protectionCardTokens = React.useMemo(() => {
    const accent = uvInfo.accentHex ?? '#facc15';
    const accentLayer = hexToRgba(accent, theme.isDark ? 0.32 : 0.18);
    const borderColor = hexToRgba(accent, theme.isDark ? 0.45 : 0.28);
    const baseSurface = theme.isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.94)';
    const iconBackground = hexToRgba(accent, theme.isDark ? 0.24 : 0.15);
    const gradientSurface = `linear-gradient(135deg, ${baseSurface}, ${accentLayer})`;

    const cardStyles = {
      background: gradientSurface,
      borderColor,
      boxShadow: theme.isDark
        ? '0 20px 40px rgba(2, 6, 23, 0.55)'
        : `0 18px 32px ${hexToRgba(accent, 0.22)}`,
    } as const;

    return {
      card: cardStyles,
      headingColor: theme.isDark ? 'rgba(226, 232, 240, 0.78)' : 'rgba(71, 85, 105, 0.9)',
      titleColor: theme.isDark ? 'rgba(248, 250, 252, 0.96)' : 'rgba(15, 23, 42, 0.92)',
      bodyColor: theme.isDark ? 'rgba(203, 213, 225, 0.9)' : 'rgba(30, 41, 59, 0.75)',
      iconBadge: {
        background: iconBackground,
        borderColor,
        boxShadow: theme.isDark
          ? `0 12px 24px ${hexToRgba(accent, 0.3)}`
          : `0 12px 24px ${hexToRgba(accent, 0.18)}`,
      },
      iconColor: theme.isDark ? 'rgba(248, 250, 252, 0.95)' : 'rgba(15, 23, 42, 0.9)',
    } as const;
  }, [theme.isDark, uvInfo.accentHex]);

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

  // Circular gauge calculations (0-12 scale)
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (clampedUVIndex / 12) * circumference;

  // UV Index zones for the progress bar
  const getProgressBarSegments = () => {
    return [
      { start: 0, end: 16.67, color: 'bg-green-400', label: 'Low', range: '0-2' },
      { start: 16.67, end: 41.67, color: 'bg-yellow-400', label: 'Moderate', range: '3-5' },
      { start: 41.67, end: 58.33, color: 'bg-orange-400', label: 'High', range: '6-7' },
      { start: 58.33, end: 83.33, color: 'bg-red-400', label: 'Very High', range: '8-10' },
      { start: 83.33, end: 100, color: 'bg-purple-400', label: 'Extreme', range: '11+' },
    ];
  };

  // Get sun protection icon based on UV level
  const getSunProtectionIcon = () => {
    if (clampedUVIndex <= 2) return '😎';
    if (clampedUVIndex <= 5) return '🕶️';
    if (clampedUVIndex <= 7) return '🧴';
    if (clampedUVIndex <= 10) return '🏖️';
    return '🚫';
  };

  return (
    <div className={`uv-index-meter ${className}`}>
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
                className={`transition-all duration-1000 ease-out ${uvInfo.color.replace('text-', 'text-')}`}
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
                  filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.4))',
                }}
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`${config.iconSize} mb-1`}>☀️</div>
              {showValue && (
                <div
                  className={`font-bold ${uvInfo.color} ${config.valueSize}`}
                  data-testid="uv-gauge-value"
                >
                  {clampedUVIndex.toFixed(1)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {showProgressBar && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>UV Index Scale</span>
            <span data-testid="uv-scale-value">{clampedUVIndex.toFixed(1)}</span>
          </div>

          <div
            className={`relative ${config.progressHeight} bg-gray-200 rounded-full overflow-hidden`}
          >
            {/* UV Index zone segments */}
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

            {/* Current UV Index indicator */}
            <div
              className={`absolute top-0 ${uvInfo.bgColor} transition-all duration-1000 ease-out`}
              style={{
                width: `${(clampedUVIndex / 12) * 100}%`,
                height: '100%',
                boxShadow: '0 0 8px rgba(251, 191, 36, 0.4)',
              }}
            />

            {/* UV Index pointer */}
            <div
              className="absolute top-0 w-1 h-full bg-white border border-gray-400 shadow-md transition-all duration-1000 ease-out"
              style={{
                left: `${(clampedUVIndex / 12) * 100}%`,
                transform: 'translateX(-50%)',
              }}
            />
          </div>

          {/* UV Index zone labels */}
          <div
            className="flex justify-between text-xs text-gray-400 mt-1"
            data-testid="uv-zone-labels"
          >
            <span>Low</span>
            <span>Moderate</span>
            <span>High</span>
            <span>Extreme</span>
          </div>
        </div>
      )}

      {/* Risk Level Information */}
      {showRiskLevel && (
        <div className="text-center mb-3">
          <div
            className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${uvInfo.bgColor} bg-opacity-10 border border-current border-opacity-20`}
            data-testid="uv-risk-pill"
          >
            <span className="text-sm">{uvInfo.icon}</span>
            <span className={`font-semibold ${uvInfo.color} ${config.fontSize}`}>
              {uvInfo.level}
            </span>
          </div>
          <p
            className={`text-xs text-gray-600 mt-1 ${config.fontSize}`}
            data-testid="uv-risk-description"
          >
            {uvInfo.description}
          </p>
        </div>
      )}

      {/* Protection Recommendations */}
      {showRecommendations && (
        <div
          data-testid="uv-protection-card"
          data-gradient-surface={protectionCardTokens.card.background}
          className="mt-4 rounded-xl border px-4 py-4 transition-[background,box-shadow,border-color] duration-300 backdrop-blur-sm"
          style={protectionCardTokens.card}
        >
          <div className="mb-3 flex items-center gap-3">
            <div
              aria-hidden="true"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border"
              style={protectionCardTokens.iconBadge}
              data-testid="uv-protection-icon"
            >
              <span className="text-xl" style={{ color: protectionCardTokens.iconColor }}>
                {getSunProtectionIcon()}
              </span>
            </div>
            <div className="space-y-0.5">
              <span
                className="block text-xs font-semibold uppercase tracking-wide"
                style={{ color: protectionCardTokens.headingColor }}
              >
                {t('weather:uvIndex.protectionAdvice', 'Protection Advice')}
              </span>
              <span
                className="block text-sm font-medium"
                style={{ color: protectionCardTokens.titleColor }}
              >
                {uvInfo.level}
              </span>
            </div>
          </div>
          <p
            className="text-sm leading-relaxed"
            data-testid="uv-protection-text"
            style={{ color: protectionCardTokens.bodyColor }}
          >
            {uvInfo.recommendation}
          </p>
        </div>
      )}
    </div>
  );
};

export default UVIndexMeter;
