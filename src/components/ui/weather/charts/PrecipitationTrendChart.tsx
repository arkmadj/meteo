/**
 * PrecipitationTrendChart Component
 * A visual chart component for displaying rain and snow probability trends over time
 */

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/design-system/theme';
import type { ForecastDay, HourlyForecastItem } from '@/types/weather';

export interface PrecipitationDataPoint {
  time: string;
  rainProbability: number;
  snowProbability: number;
  precipitationAmount?: number;
  condition?: string;
}

export interface PrecipitationTrendChartProps {
  /** Hourly forecast data */
  hourlyData?: HourlyForecastItem[];
  /** Daily forecast data */
  dailyData?: ForecastDay[];
  /** Time range to display */
  timeRange?: '24h' | '7d';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show grid lines */
  showGrid?: boolean;
  /** Show trend lines */
  showTrendLine?: boolean;
  /** Show data points */
  showDataPoints?: boolean;
  /** Show legend */
  showLegend?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// Weather codes that indicate snow conditions (from Open-Meteo WMO codes)
const SNOW_WEATHER_CODES = [71, 73, 75, 77, 85, 86];
// Weather codes that indicate rain conditions
const RAIN_WEATHER_CODES = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82];

const PrecipitationTrendChart: React.FC<PrecipitationTrendChartProps> = ({
  hourlyData = [],
  dailyData = [],
  timeRange = '24h',
  size = 'md',
  showGrid = true,
  showTrendLine = true,
  showDataPoints = true,
  showLegend = true,
  className = '',
}) => {
  const { t } = useTranslation(['weather']);
  const { theme } = useTheme();

  // Size configurations
  const sizeConfig = {
    sm: {
      width: 320,
      height: 140,
      padding: { top: 12, right: 20, bottom: 25, left: 35 },
      fontSize: 'text-xs',
      pointRadius: 3,
    },
    md: {
      width: 400,
      height: 180,
      padding: { top: 15, right: 25, bottom: 30, left: 40 },
      fontSize: 'text-xs',
      pointRadius: 4,
    },
    lg: {
      width: 500,
      height: 220,
      padding: { top: 20, right: 30, bottom: 35, left: 45 },
      fontSize: 'text-sm',
      pointRadius: 5,
    },
  };

  const config = sizeConfig[size];
  const chartWidth = config.width - config.padding.left - config.padding.right;
  const chartHeight = config.height - config.padding.top - config.padding.bottom;

  // Transform data based on time range
  const chartData = useMemo((): PrecipitationDataPoint[] => {
    if (timeRange === '24h' && hourlyData.length > 0) {
      return hourlyData.slice(0, 24).map(hour => {
        const isSnowCondition = SNOW_WEATHER_CODES.includes(hour.condition.code);
        const isRainCondition = RAIN_WEATHER_CODES.includes(hour.condition.code);

        return {
          time: hour.time,
          rainProbability: isRainCondition
            ? hour.precipitationProbability
            : isSnowCondition
              ? 0
              : hour.precipitationProbability * 0.7,
          snowProbability: isSnowCondition
            ? hour.precipitationProbability
            : hour.condition.code >= 71
              ? hour.precipitationProbability * 0.3
              : 0,
          precipitationAmount: hour.precipitationAmount,
          condition: hour.condition.description,
        };
      });
    }

    if (timeRange === '7d' && dailyData.length > 0) {
      return dailyData.slice(0, 7).map(day => {
        const isSnowCondition = SNOW_WEATHER_CODES.includes(day.condition.code);
        const isRainCondition = RAIN_WEATHER_CODES.includes(day.condition.code);

        return {
          time: day.date,
          rainProbability: isRainCondition
            ? day.precipitationProbability
            : isSnowCondition
              ? 0
              : day.precipitationProbability * 0.7,
          snowProbability: isSnowCondition
            ? day.precipitationProbability
            : day.condition.code >= 71
              ? day.precipitationProbability * 0.3
              : 0,
          condition: day.condition.description,
        };
      });
    }

    return [];
  }, [hourlyData, dailyData, timeRange]);

  // Chart tokens for theming
  const chartTokens = useMemo(
    () => ({
      surfaceBackground: theme.isDark
        ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.7))'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(241, 245, 249, 0.65))',
      surfaceBorder: theme.isDark ? 'rgba(71, 85, 105, 0.55)' : 'rgba(226, 232, 240, 0.9)',
      surfaceShadow: theme.isDark
        ? '0 24px 48px rgba(2, 6, 23, 0.55)'
        : '0 18px 30px rgba(15, 23, 42, 0.12)',
      headerColor: theme.isDark ? 'rgba(248, 250, 252, 0.95)' : 'rgba(15, 23, 42, 0.92)',
      subheaderColor: theme.isDark ? 'rgba(203, 213, 225, 0.88)' : 'rgba(71, 85, 105, 0.85)',
      gridStroke: theme.isDark ? 'rgba(148, 163, 184, 0.28)' : 'rgba(148, 163, 184, 0.4)',
      gridLabel: theme.isDark ? 'rgba(226, 232, 240, 0.82)' : 'rgba(100, 116, 139, 0.82)',
      rainColor: theme.isDark ? 'rgba(59, 130, 246, 0.9)' : '#3b82f6',
      snowColor: theme.isDark ? 'rgba(147, 197, 253, 0.9)' : '#93c5fd',
      rainGradientStart: theme.isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)',
      rainGradientEnd: theme.isDark ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.05)',
      snowGradientStart: theme.isDark ? 'rgba(147, 197, 253, 0.4)' : 'rgba(147, 197, 253, 0.3)',
      snowGradientEnd: theme.isDark ? 'rgba(147, 197, 253, 0.05)' : 'rgba(147, 197, 253, 0.05)',
      dataPointStroke: theme.isDark ? 'rgba(15, 23, 42, 0.85)' : '#ffffff',
      tooltipBackground: theme.isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(30, 41, 59, 0.85)',
      tooltipText: 'rgba(248, 250, 252, 0.98)',
    }),
    [theme.isDark]
  );

  // Scale functions (0-100% for probability)
  const scaleX = (index: number) =>
    chartData.length <= 1 ? chartWidth / 2 : (index / (chartData.length - 1)) * chartWidth;
  const scaleY = (probability: number) => chartHeight - (probability / 100) * chartHeight;

  // Generate smooth path for trend lines
  const generatePath = (
    data: PrecipitationDataPoint[],
    getValue: (d: PrecipitationDataPoint) => number
  ) => {
    if (data.length === 0) return '';

    const points = data.map((d, index) => ({
      x: scaleX(index),
      y: scaleY(getValue(d)),
    }));

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      const controlPoint1X = prevPoint.x + (currentPoint.x - prevPoint.x) * 0.3;
      const controlPoint2X = currentPoint.x - (currentPoint.x - prevPoint.x) * 0.3;

      path += ` C ${controlPoint1X} ${prevPoint.y}, ${controlPoint2X} ${currentPoint.y}, ${currentPoint.x} ${currentPoint.y}`;
    }

    return path;
  };

  // Generate area path for filled regions
  const generateAreaPath = (
    data: PrecipitationDataPoint[],
    getValue: (d: PrecipitationDataPoint) => number
  ) => {
    if (data.length === 0) return '';

    const linePath = generatePath(data, getValue);
    const lastX = scaleX(data.length - 1);
    const firstX = scaleX(0);

    return `${linePath} L ${lastX} ${chartHeight} L ${firstX} ${chartHeight} Z`;
  };

  const rainPath = generatePath(chartData, d => d.rainProbability);
  const snowPath = generatePath(chartData, d => d.snowProbability);
  const rainAreaPath = generateAreaPath(chartData, d => d.rainProbability);
  const snowAreaPath = generateAreaPath(chartData, d => d.snowProbability);

  // Calculate statistics
  const maxRainProb = chartData.length > 0 ? Math.max(...chartData.map(d => d.rainProbability)) : 0;
  const maxSnowProb = chartData.length > 0 ? Math.max(...chartData.map(d => d.snowProbability)) : 0;
  const avgRainProb =
    chartData.length > 0
      ? chartData.reduce((sum, d) => sum + d.rainProbability, 0) / chartData.length
      : 0;
  const avgSnowProb =
    chartData.length > 0
      ? chartData.reduce((sum, d) => sum + d.snowProbability, 0) / chartData.length
      : 0;

  // Format time labels
  const formatTimeLabel = (time: string, _index: number) => {
    if (timeRange === '24h') {
      const date = new Date(time);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const date = new Date(time);
    return date.toLocaleDateString([], { weekday: 'short' });
  };

  // Generate grid lines
  const gridLines = useMemo(() => {
    const lines: React.ReactNode[] = [];

    // Horizontal grid lines (probability levels: 0%, 25%, 50%, 75%, 100%)
    for (let i = 0; i <= 4; i++) {
      const probability = i * 25;
      const y = scaleY(probability);
      lines.push(
        <g key={`h-grid-${i}`}>
          <line
            stroke={chartTokens.gridStroke}
            strokeDasharray="2,2"
            strokeWidth="1"
            x1={0}
            x2={chartWidth}
            y1={y}
            y2={y}
          />
          <text
            className={config.fontSize}
            fill={chartTokens.gridLabel}
            textAnchor="end"
            x={-8}
            y={y + 4}
          >
            {probability}%
          </text>
        </g>
      );
    }

    // Vertical grid lines (time intervals)
    const intervals =
      timeRange === '24h' ? Math.min(6, chartData.length - 1) : chartData.length - 1;
    for (let i = 0; i <= intervals; i++) {
      const dataIndex =
        timeRange === '24h' ? Math.floor((i / intervals) * (chartData.length - 1)) : i;
      const x = scaleX(dataIndex);
      const dataPoint = chartData[dataIndex];

      if (dataPoint) {
        lines.push(
          <g key={`v-grid-${i}`}>
            <line
              stroke={chartTokens.gridStroke}
              strokeDasharray="2,2"
              strokeWidth="1"
              x1={x}
              x2={x}
              y1={0}
              y2={chartHeight}
            />
            <text
              className={config.fontSize}
              fill={chartTokens.gridLabel}
              textAnchor="middle"
              x={x}
              y={chartHeight + 18}
            >
              {formatTimeLabel(dataPoint.time, dataIndex)}
            </text>
          </g>
        );
      }
    }

    return lines;
  }, [
    chartData,
    chartWidth,
    chartHeight,
    chartTokens,
    config.fontSize,
    timeRange,
    formatTimeLabel,
    scaleX,
    scaleY,
  ]);

  if (chartData.length === 0) {
    return (
      <div className={`precipitation-trend-chart ${className}`}>
        <div
          className="rounded-lg border p-4 text-center"
          style={{
            background: chartTokens.surfaceBackground,
            borderColor: chartTokens.surfaceBorder,
          }}
        >
          <p className={config.fontSize} style={{ color: chartTokens.subheaderColor }}>
            {t('weather:precipitation.noData', 'No precipitation data available')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`precipitation-trend-chart ${className}`}>
      <div className="space-y-4">
        {/* Chart Header */}
        <div className="flex items-center justify-between">
          <h4
            className={`font-semibold ${config.fontSize}`}
            style={{ color: chartTokens.headerColor }}
          >
            {t('weather:precipitation.trendChart', 'Precipitation Probability')} (
            {timeRange === '24h'
              ? t('weather:timeRange.24h', '24 Hours')
              : t('weather:timeRange.7d', '7 Days')}
            )
          </h4>

          {/* Legend */}
          {showLegend && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: chartTokens.rainColor }}
                />
                <span className={config.fontSize} style={{ color: chartTokens.subheaderColor }}>
                  {t('weather:precipitation.rain', 'Rain')}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: chartTokens.snowColor }}
                />
                <span className={config.fontSize} style={{ color: chartTokens.subheaderColor }}>
                  {t('weather:precipitation.snow', 'Snow')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* SVG Chart */}
        <div
          className="rounded-lg border p-3 backdrop-blur-sm transition-colors duration-300"
          data-testid="precipitation-chart-card"
          style={{
            background: chartTokens.surfaceBackground,
            borderColor: chartTokens.surfaceBorder,
            boxShadow: chartTokens.surfaceShadow,
          }}
        >
          <svg
            className="overflow-visible max-w-full"
            height={config.height}
            preserveAspectRatio="xMidYMid meet"
            viewBox={`0 0 ${config.width} ${config.height}`}
            width="100%"
          >
            {/* Gradient Definitions */}
            <defs>
              <linearGradient id="rainGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor={chartTokens.rainGradientStart} />
                <stop offset="100%" stopColor={chartTokens.rainGradientEnd} />
              </linearGradient>
              <linearGradient id="snowGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor={chartTokens.snowGradientStart} />
                <stop offset="100%" stopColor={chartTokens.snowGradientEnd} />
              </linearGradient>
            </defs>

            <g transform={`translate(${config.padding.left}, ${config.padding.top})`}>
              {/* Grid Lines */}
              {showGrid && gridLines}

              {/* Rain Area Fill */}
              {showTrendLine && rainAreaPath && (
                <path
                  className="transition-all duration-500"
                  d={rainAreaPath}
                  fill="url(#rainGradient)"
                />
              )}

              {/* Snow Area Fill */}
              {showTrendLine && snowAreaPath && (
                <path
                  className="transition-all duration-500"
                  d={snowAreaPath}
                  fill="url(#snowGradient)"
                />
              )}

              {/* Rain Trend Line */}
              {showTrendLine && rainPath && (
                <path
                  className="transition-all duration-500"
                  d={rainPath}
                  fill="none"
                  stroke={chartTokens.rainColor}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                />
              )}

              {/* Snow Trend Line */}
              {showTrendLine && snowPath && (
                <path
                  className="transition-all duration-500"
                  d={snowPath}
                  fill="none"
                  stroke={chartTokens.snowColor}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                />
              )}

              {/* Rain Data Points */}
              {showDataPoints &&
                chartData.map((point, index) => (
                  <g key={`rain-point-${index}`}>
                    <circle
                      className="transition-all duration-300"
                      cx={scaleX(index)}
                      cy={scaleY(point.rainProbability)}
                      fill={chartTokens.rainColor}
                      r={config.pointRadius}
                      stroke={chartTokens.dataPointStroke}
                      strokeWidth="2"
                    />
                  </g>
                ))}

              {/* Snow Data Points */}
              {showDataPoints &&
                chartData.map((point, index) => (
                  <g key={`snow-point-${index}`}>
                    <circle
                      className="transition-all duration-300"
                      cx={scaleX(index)}
                      cy={scaleY(point.snowProbability)}
                      fill={chartTokens.snowColor}
                      r={config.pointRadius}
                      stroke={chartTokens.dataPointStroke}
                      strokeWidth="2"
                    />
                  </g>
                ))}
            </g>
          </svg>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div
            className="rounded border p-2 transition-colors duration-300"
            style={{
              background: theme.isDark ? 'rgba(30, 41, 59, 0.65)' : '#f9fafb',
              borderColor: theme.isDark ? 'rgba(71, 85, 105, 0.4)' : 'rgba(226, 232, 240, 0.7)',
            }}
          >
            <div className={config.fontSize} style={{ color: chartTokens.subheaderColor }}>
              {t('weather:precipitation.maxRain', 'Max Rain')}
            </div>
            <div
              className={`font-bold ${config.fontSize}`}
              style={{ color: chartTokens.rainColor }}
            >
              {Math.round(maxRainProb)}%
            </div>
          </div>

          <div
            className="rounded border p-2 transition-colors duration-300"
            style={{
              background: theme.isDark ? 'rgba(30, 41, 59, 0.65)' : '#f9fafb',
              borderColor: theme.isDark ? 'rgba(71, 85, 105, 0.4)' : 'rgba(226, 232, 240, 0.7)',
            }}
          >
            <div className={config.fontSize} style={{ color: chartTokens.subheaderColor }}>
              {t('weather:precipitation.avgRain', 'Avg Rain')}
            </div>
            <div
              className={`font-bold ${config.fontSize}`}
              style={{ color: chartTokens.rainColor }}
            >
              {Math.round(avgRainProb)}%
            </div>
          </div>

          <div
            className="rounded border p-2 transition-colors duration-300"
            style={{
              background: theme.isDark ? 'rgba(30, 41, 59, 0.65)' : '#f9fafb',
              borderColor: theme.isDark ? 'rgba(71, 85, 105, 0.4)' : 'rgba(226, 232, 240, 0.7)',
            }}
          >
            <div className={config.fontSize} style={{ color: chartTokens.subheaderColor }}>
              {t('weather:precipitation.maxSnow', 'Max Snow')}
            </div>
            <div
              className={`font-bold ${config.fontSize}`}
              style={{ color: chartTokens.snowColor }}
            >
              {Math.round(maxSnowProb)}%
            </div>
          </div>

          <div
            className="rounded border p-2 transition-colors duration-300"
            style={{
              background: theme.isDark ? 'rgba(30, 41, 59, 0.65)' : '#f9fafb',
              borderColor: theme.isDark ? 'rgba(71, 85, 105, 0.4)' : 'rgba(226, 232, 240, 0.7)',
            }}
          >
            <div className={config.fontSize} style={{ color: chartTokens.subheaderColor }}>
              {t('weather:precipitation.avgSnow', 'Avg Snow')}
            </div>
            <div
              className={`font-bold ${config.fontSize}`}
              style={{ color: chartTokens.snowColor }}
            >
              {Math.round(avgSnowProb)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrecipitationTrendChart;
