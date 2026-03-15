/**
 * PressureGauge Component
 * A visual gauge component for displaying atmospheric pressure with barometric trends and weather implications
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

import type { PressureHistory } from '@/types/weather';

import PressureTrendChart from '@/components/ui/weather/charts/PressureTrendChart';
import PressureHistoryComparison from '@/components/ui/weather/comparison/PressureHistoryComparison';
import { useTheme } from '@/design-system/theme';

interface PressureGaugeProps {
  pressure: number;
  pressureHistory?: PressureHistory;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  showTrend?: boolean;
  showWeatherImplications?: boolean;
  showGauge?: boolean;
  showScale?: boolean;
  showTrendChart?: boolean;
  showHistoricalComparison?: boolean;
  trendChartTimeRange?: '24h' | '7d';
  className?: string;
}

type PressureLevel = 'VeryLow' | 'Low' | 'BelowNormal' | 'Normal' | 'High' | 'VeryHigh';

interface WeatherImplicationModeTokens {
  background: string;
  borderColor: string;
  titleColor: string;
  descriptionColor: string;
  iconBackground: string;
  iconColor: string;
  iconShadow: string;
  cardShadow: string;
}

const PressureGauge: React.FC<PressureGaugeProps> = ({
  pressure,
  pressureHistory,
  size = 'md',
  showValue = true,
  showTrend = true,
  showWeatherImplications = true,
  showGauge = true,
  showScale = true,
  showTrendChart = false,
  showHistoricalComparison = false,
  trendChartTimeRange = '24h',
  className = '',
}) => {
  const { t } = useTranslation(['weather']);
  const { theme } = useTheme();

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'h-20',
      gauge: 'w-20 h-20',
      text: 'text-xs',
      valueText: 'text-sm',
      spacing: 'space-y-2',
    },
    md: {
      container: 'h-24',

      gauge: 'w-24 h-24',
      text: 'text-sm',
      valueText: 'text-base',
      spacing: 'space-y-3',
    },
    lg: {
      container: 'h-28',
      gauge: 'w-28 h-28',
      text: 'text-base',
      valueText: 'text-lg',
      spacing: 'space-y-4',
    },
  };

  const config = sizeConfig?.[size];

  // Pressure classification and analysis
  const getPressureInfo = (pressure: number) => {
    if (pressure < 980) {
      return {
        level: 'VeryLow',
        category: t('weather:pressure.veryLow', 'Very Low'),
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        gaugeColor: '#dc2626',
        trend: 'falling',
        weatherImplication: t('weather:pressure.veryLowImplication', 'Stormy weather likely'),
        icon: '🌩️',
        description: t('weather:pressure.veryLowDescription', 'Severe weather conditions expected'),
      };
    } else if (pressure < 1000) {
      return {
        level: 'Low',
        category: t('weather:pressure.low', 'Low'),
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        gaugeColor: '#ea580c',
        trend: 'falling',
        weatherImplication: t('weather:pressure.lowImplication', 'Unsettled weather'),
        icon: '🌧️',
        description: t('weather:pressure.lowDescription', 'Cloudy with possible precipitation'),
      };
    } else if (pressure < 1013) {
      return {
        level: 'BelowNormal',
        category: t('weather:pressure.belowNormal', 'Below Normal'),
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        gaugeColor: '#ca8a04',
        trend: 'falling',
        weatherImplication: t('weather:pressure.belowNormalImplication', 'Changing conditions'),
        icon: '⛅',
        description: t('weather:pressure.belowNormalDescription', 'Variable weather conditions'),
      };
    } else if (pressure <= 1025) {
      return {
        level: 'Normal',
        category: t('weather:pressure.normal', 'Normal'),
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        gaugeColor: '#16a34a',
        trend: 'stable',
        weatherImplication: t('weather:pressure.normalImplication', 'Fair weather'),
        icon: '☀️',
        description: t('weather:pressure.normalDescription', 'Stable weather conditions'),
      };
    } else if (pressure <= 1040) {
      return {
        level: 'High',
        category: t('weather:pressure.high', 'High'),
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        gaugeColor: '#2563eb',
        trend: 'rising',
        weatherImplication: t('weather:pressure.highImplication', 'Clear skies'),
        icon: '🌤️',
        description: t('weather:pressure.highDescription', 'Clear and stable weather'),
      };
    } else {
      return {
        level: 'VeryHigh',
        category: t('weather:pressure.veryHigh', 'Very High'),
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        gaugeColor: '#9333ea',
        trend: 'rising',
        weatherImplication: t('weather:pressure.veryHighImplication', 'Very clear conditions'),
        icon: '☀️',
        description: t('weather:pressure.veryHighDescription', 'Exceptionally clear and dry'),
      };
    }
  };

  const pressureInfo = getPressureInfo(pressure);

  const getFontMetrics = React.useCallback(
    (className: string) => {
      const fontSizeKeyMap = {
        'text-xs': 'xs',
        'text-sm': 'sm',
        'text-base': 'base',
        'text-lg': 'lg',
      } as const;

      const fallbackKey = 'sm';
      const mappedKey = fontSizeKeyMap[className as keyof typeof fontSizeKeyMap] ?? fallbackKey;
      const key = mappedKey as keyof typeof theme.typography.fontSize;
      const [fontSize, meta] = theme.typography.fontSize[key];

      return {
        fontSize,
        lineHeight: meta?.lineHeight ?? '1.5',
        letterSpacing: meta?.letterSpacing ?? '0em',
      };
    },
    [theme.typography.fontSize]
  );

  const primaryFontFamily = React.useMemo(
    () => theme.typography.fontFamily.primary.join(', '),
    [theme.typography.fontFamily.primary]
  );

  const weatherImplicationTokens = React.useMemo<
    WeatherImplicationModeTokens & { level: PressureLevel; mode: 'light' | 'dark' }
  >(() => {
    const mode = theme.isDark ? 'dark' : 'light';
    const level = (pressureInfo.level as PressureLevel) ?? 'Normal';

    const palette: Record<
      PressureLevel,
      { light: WeatherImplicationModeTokens; dark: WeatherImplicationModeTokens }
    > = {
      VeryLow: {
        light: {
          background:
            'linear-gradient(135deg, rgba(254, 226, 226, 0.94), rgba(254, 202, 202, 0.62))',
          borderColor: 'rgba(248, 113, 113, 0.45)',
          titleColor: theme.colors.semantic.error[600],
          descriptionColor: theme.colors.neutral[700],
          iconBackground: 'rgba(248, 113, 113, 0.18)',
          iconColor: theme.colors.semantic.error[600],
          iconShadow: '0 10px 18px rgba(220, 38, 38, 0.25)',
          cardShadow: '0 14px 28px rgba(15, 23, 42, 0.08)',
        },
        dark: {
          background: 'linear-gradient(135deg, rgba(76, 5, 25, 0.75), rgba(127, 29, 29, 0.58))',
          borderColor: 'rgba(248, 113, 113, 0.5)',
          titleColor: theme.colors.semantic.error[100],
          descriptionColor: theme.colors.neutral[200],
          iconBackground: 'rgba(248, 113, 113, 0.22)',
          iconColor: theme.colors.semantic.error[50],
          iconShadow: '0 18px 32px rgba(8, 47, 73, 0.55)',
          cardShadow: '0 24px 36px rgba(2, 6, 23, 0.55)',
        },
      },
      Low: {
        light: {
          background:
            'linear-gradient(135deg, rgba(254, 243, 199, 0.92), rgba(253, 230, 138, 0.58))',
          borderColor: 'rgba(251, 191, 36, 0.45)',
          titleColor: theme.colors.semantic.warning[600],
          descriptionColor: theme.colors.neutral[700],
          iconBackground: 'rgba(251, 191, 36, 0.22)',
          iconColor: theme.colors.semantic.warning[600],
          iconShadow: '0 10px 18px rgba(217, 119, 6, 0.22)',
          cardShadow: '0 14px 28px rgba(15, 23, 42, 0.08)',
        },
        dark: {
          background: 'linear-gradient(135deg, rgba(69, 26, 3, 0.78), rgba(180, 83, 9, 0.55))',
          borderColor: 'rgba(251, 191, 36, 0.4)',
          titleColor: theme.colors.semantic.warning[100],
          descriptionColor: theme.colors.neutral[300],
          iconBackground: 'rgba(253, 186, 116, 0.24)',
          iconColor: theme.colors.semantic.warning[50],
          iconShadow: '0 18px 32px rgba(8, 47, 73, 0.55)',
          cardShadow: '0 24px 36px rgba(2, 6, 23, 0.5)',
        },
      },
      BelowNormal: {
        light: {
          background:
            'linear-gradient(135deg, rgba(254, 249, 195, 0.9), rgba(254, 240, 138, 0.55))',
          borderColor: 'rgba(234, 179, 8, 0.4)',
          titleColor: theme.colors.semantic.warning[600],
          descriptionColor: theme.colors.neutral[700],
          iconBackground: 'rgba(234, 179, 8, 0.18)',
          iconColor: theme.colors.semantic.warning[600],
          iconShadow: '0 10px 18px rgba(202, 138, 4, 0.2)',
          cardShadow: '0 14px 28px rgba(15, 23, 42, 0.08)',
        },
        dark: {
          background: 'linear-gradient(135deg, rgba(68, 60, 3, 0.8), rgba(161, 98, 7, 0.55))',
          borderColor: 'rgba(234, 179, 8, 0.35)',
          titleColor: theme.colors.semantic.warning[100],
          descriptionColor: theme.colors.neutral[300],
          iconBackground: 'rgba(234, 179, 8, 0.22)',
          iconColor: theme.colors.semantic.warning[50],
          iconShadow: '0 18px 32px rgba(8, 47, 73, 0.5)',
          cardShadow: '0 24px 36px rgba(2, 6, 23, 0.5)',
        },
      },
      Normal: {
        light: {
          background:
            'linear-gradient(135deg, rgba(236, 253, 245, 0.95), rgba(209, 250, 229, 0.62))',
          borderColor: 'rgba(16, 185, 129, 0.4)',
          titleColor: theme.colors.semantic.success[600],
          descriptionColor: theme.colors.neutral[700],
          iconBackground: 'rgba(16, 185, 129, 0.18)',
          iconColor: theme.colors.semantic.success[600],
          iconShadow: '0 10px 18px rgba(16, 185, 129, 0.22)',
          cardShadow: '0 14px 28px rgba(15, 23, 42, 0.08)',
        },
        dark: {
          background: 'linear-gradient(135deg, rgba(6, 95, 70, 0.75), rgba(15, 118, 110, 0.6))',
          borderColor: 'rgba(45, 212, 191, 0.45)',
          titleColor: theme.colors.semantic.success[100],
          descriptionColor: theme.colors.neutral[200],
          iconBackground: 'rgba(45, 212, 191, 0.24)',
          iconColor: theme.colors.semantic.success[50],
          iconShadow: '0 18px 32px rgba(8, 47, 73, 0.45)',
          cardShadow: '0 24px 36px rgba(2, 6, 23, 0.55)',
        },
      },
      High: {
        light: {
          background:
            'linear-gradient(135deg, rgba(219, 234, 254, 0.92), rgba(191, 219, 254, 0.58))',
          borderColor: 'rgba(96, 165, 250, 0.38)',
          titleColor: theme.colors.primary[600],
          descriptionColor: theme.colors.neutral[700],
          iconBackground: 'rgba(96, 165, 250, 0.22)',
          iconColor: theme.colors.primary[600],
          iconShadow: '0 10px 18px rgba(37, 99, 235, 0.2)',
          cardShadow: '0 14px 28px rgba(15, 23, 42, 0.08)',
        },
        dark: {
          background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.8), rgba(37, 99, 235, 0.6))',
          borderColor: 'rgba(147, 197, 253, 0.45)',
          titleColor: theme.colors.primary[100],
          descriptionColor: theme.colors.neutral[200],
          iconBackground: 'rgba(96, 165, 250, 0.28)',
          iconColor: theme.colors.primary[50],
          iconShadow: '0 18px 32px rgba(8, 47, 73, 0.5)',
          cardShadow: '0 24px 36px rgba(2, 6, 23, 0.5)',
        },
      },
      VeryHigh: {
        light: {
          background: 'linear-gradient(135deg, rgba(237, 233, 254, 0.9), rgba(221, 214, 254, 0.6))',
          borderColor: 'rgba(168, 85, 247, 0.38)',
          titleColor: '#7c3aed',
          descriptionColor: theme.colors.neutral[700],
          iconBackground: 'rgba(168, 85, 247, 0.22)',
          iconColor: '#7c3aed',
          iconShadow: '0 10px 18px rgba(124, 58, 237, 0.2)',
          cardShadow: '0 14px 28px rgba(15, 23, 42, 0.08)',
        },
        dark: {
          background: 'linear-gradient(135deg, rgba(76, 29, 149, 0.8), rgba(88, 28, 135, 0.6))',
          borderColor: 'rgba(196, 181, 253, 0.5)',
          titleColor: '#c4b5fd',
          descriptionColor: theme.colors.neutral[200],
          iconBackground: 'rgba(196, 181, 253, 0.24)',
          iconColor: '#ede9fe',
          iconShadow: '0 18px 32px rgba(8, 47, 73, 0.55)',
          cardShadow: '0 24px 36px rgba(2, 6, 23, 0.55)',
        },
      },
    };

    const tone = palette[level] ?? palette.Normal;
    return {
      ...tone[mode],
      level,
      mode,
    };
  }, [pressureInfo.level, theme]);

  const implicationTitleMetrics = React.useMemo(
    () => getFontMetrics(config?.text ?? 'text-sm'),
    [config?.text, getFontMetrics]
  );

  const implicationDescriptionMetrics = React.useMemo(() => {
    const baseClass = config?.text === 'text-xs' ? 'text-xs' : 'text-sm';
    return getFontMetrics(baseClass);
  }, [config?.text, getFontMetrics]);

  // Calculate gauge position (pressure range: 950-1050 hPa)
  const minPressure = 950;
  const maxPressure = 1050;
  const normalizedPressure = Math.max(
    0,
    Math.min(100, ((pressure - minPressure) / (maxPressure - minPressure)) * 100)
  );

  // Calculate circular gauge angle (180° arc from left to right)
  const gaugeAngle = (normalizedPressure / 100) * 180 - 90; // -90° to +90°

  return (
    <div className={`pressure-gauge ${className}`}>
      <div className="space-y-2">
        {/* Pressure Value Display */}
        {showValue && (
          <div className="text-center">
            <div className={`font-bold ${pressureInfo.color} ${config.valueText}`}>
              {pressure.toFixed(1)} hPa
            </div>
            <div className={`${config.text} text-gray-600 font-medium`}>
              {pressureInfo.category}
            </div>
          </div>
        )}

        {/* Circular Pressure Gauge */}
        {showGauge && (
          <div className="flex justify-center">
            <div className="relative">
              <svg
                className={`${config.gauge} transform transition-transform duration-1000`}
                data-pressure-gauge
                viewBox="0 0 120 80"
              >
                {/* Background Arc */}
                <path
                  d="M 20 60 A 40 40 0 0 1 100 60"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeLinecap="round"
                  strokeWidth="8"
                />

                {/* Pressure Level Arc */}
                <path
                  className="transition-all duration-1000 ease-out"
                  d="M 20 60 A 40 40 0 0 1 100 60"
                  fill="none"
                  stroke={pressureInfo.gaugeColor}
                  strokeDasharray={`${(normalizedPressure / 100) * 125.66} 125.66`}
                  strokeLinecap="round"
                  strokeWidth="6"
                />

                {/* Gauge Markers */}
                {[0, 25, 50, 75, 100].map(percent => {
                  const angle = (percent / 100) * 180 - 90;
                  const x1 = 60 + 35 * Math.cos((angle * Math.PI) / 180);
                  const y1 = 60 + 35 * Math.sin((angle * Math.PI) / 180);
                  const x2 = 60 + 40 * Math.cos((angle * Math.PI) / 180);
                  const y2 = 60 + 40 * Math.sin((angle * Math.PI) / 180);

                  return (
                    <line
                      key={percent}
                      stroke="#9ca3af"
                      strokeWidth={percent === 50 ? '2' : '1'}
                      x1={x1}
                      x2={x2}
                      y1={y1}
                      y2={y2}
                    />
                  );
                })}

                {/* Pressure Needle */}
                <g transform={`rotate(${gaugeAngle} 60 60)`}>
                  <line
                    className="transition-all duration-1000"
                    stroke={pressureInfo.gaugeColor}
                    strokeLinecap="round"
                    strokeWidth="3"
                    x1="60"
                    x2="60"
                    y1="60"
                    y2="30"
                  />
                  <circle
                    className="transition-all duration-1000"
                    cx="60"
                    cy="60"
                    fill={pressureInfo.gaugeColor}
                    r="3"
                  />
                </g>

                {/* Center Label */}
                <text
                  className={`fill-gray-600 ${config.text} font-medium`}
                  textAnchor="middle"
                  x="60"
                  y="75"
                >
                  hPa
                </text>
              </svg>
            </div>
          </div>
        )}

        {/* Pressure Scale */}
        {showScale && (
          <div className="relative">
            {/* Scale Bar */}
            <div className="w-full h-3 bg-gray-100 rounded-full relative overflow-hidden">
              {/* Pressure Zones */}
              <div className="absolute inset-0 flex">
                <div className="flex-1 bg-red-200" style={{ width: '30%' }} />
                <div className="flex-1 bg-yellow-200" style={{ width: '20%' }} />
                <div className="flex-1 bg-green-200" style={{ width: '25%' }} />
                <div className="flex-1 bg-blue-200" style={{ width: '25%' }} />
              </div>

              {/* Current Pressure Indicator */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-gray-800 rounded-full transition-all duration-1000"
                style={{ left: `${normalizedPressure}%` }}
              />
            </div>

            {/* Scale Labels */}
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>950</span>
              <span>1000</span>
              <span className="font-semibold text-green-600">1013</span>
              <span>1040</span>
              <span>1050</span>
            </div>
          </div>
        )}

        {/* Weather Implications */}
        {showWeatherImplications && (
          <div
            className="rounded-lg border p-3 transition-all duration-300"
            data-weather-implication-level={weatherImplicationTokens.level}
            data-weather-implication-mode={weatherImplicationTokens.mode}
            data-weather-implication-surface={weatherImplicationTokens.background}
            style={{
              background: weatherImplicationTokens.background,
              borderColor: weatherImplicationTokens.borderColor,
              boxShadow: weatherImplicationTokens.cardShadow,
            }}
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-full text-2xl"
                data-weather-implication-icon
                style={{
                  background: weatherImplicationTokens.iconBackground,
                  boxShadow: weatherImplicationTokens.iconShadow,
                  color: weatherImplicationTokens.iconColor,
                }}
              >
                {pressureInfo.icon}
              </span>
              <div className="flex-1">
                <div
                  className="font-semibold"
                  style={{
                    color: weatherImplicationTokens.titleColor,
                    fontFamily: primaryFontFamily,
                    fontSize: implicationTitleMetrics.fontSize,
                    letterSpacing: implicationTitleMetrics.letterSpacing,
                    lineHeight: implicationTitleMetrics.lineHeight,
                  }}
                >
                  {pressureInfo.weatherImplication}
                </div>
                <div
                  className="mt-1"
                  style={{
                    color: weatherImplicationTokens.descriptionColor,
                    fontFamily: primaryFontFamily,
                    fontSize: implicationDescriptionMetrics.fontSize,
                    letterSpacing: implicationDescriptionMetrics.letterSpacing,
                    lineHeight: implicationDescriptionMetrics.lineHeight,
                  }}
                >
                  {pressureInfo.description}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Barometric Trend */}
        {showTrend && (
          <div className="flex items-center justify-center space-x-4 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${pressureInfo.bgColor.replace('bg-', 'bg-').replace('-50', '-400')}`}
              />
              <span className={`${config.text} text-gray-600`}>
                {t('weather:pressure.barometricPressure', 'Barometric Pressure')}
              </span>
            </div>

            <div className="flex items-center space-x-1">
              {pressureInfo.trend === 'rising' && (
                <>
                  <svg
                    className="w-4 h-4 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M7 17l9.2-9.2M17 17V7H7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className={`${config.text} text-green-600 font-medium`}>
                    {t('weather:pressure.rising', 'Rising')}
                  </span>
                </>
              )}
              {pressureInfo.trend === 'falling' && (
                <>
                  <svg
                    className="w-4 h-4 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M17 7l-9.2 9.2M7 7v10h10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className={`${config.text} text-red-600 font-medium`}>
                    {t('weather:pressure.falling', 'Falling')}
                  </span>
                </>
              )}
              {pressureInfo.trend === 'stable' && (
                <>
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className={`${config.text} text-blue-600 font-medium`}>
                    {t('weather:pressure.stable', 'Stable')}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Pressure Information */}
        <div className={`${config.text} text-gray-500 text-center italic`}>
          {pressure < 980
            ? t('weather:pressure.stormWarning', 'Storm conditions - take precautions')
            : pressure < 1000
              ? t('weather:pressure.unsettledInfo', 'Unsettled weather - expect changes')
              : pressure > 1040
                ? t('weather:pressure.highPressureInfo', 'High pressure - very stable conditions')
                : t('weather:pressure.normalInfo', 'Normal atmospheric conditions')}
        </div>

        {/* Pressure Trend Chart */}
        {showTrendChart && pressureHistory && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <PressureTrendChart
              className="w-full"
              pressureHistory={pressureHistory}
              showComparison={true}
              showDataPoints={true}
              showGrid={true}
              showTrendLine={true}
              size={size}
              timeRange={trendChartTimeRange}
            />
          </div>
        )}

        {/* Historical Comparison */}
        {showHistoricalComparison && pressureHistory && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <PressureHistoryComparison
              className="w-full"
              pressureHistory={pressureHistory}
              showPercentiles={false}
              showSeasonalComparison={false}
              size={size}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PressureGauge;
