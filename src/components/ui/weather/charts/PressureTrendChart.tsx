/**
 * PressureTrendChart Component
 * A visual chart component for displaying atmospheric pressure trends and historical comparisons
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/design-system/theme';
import type { PressureHistory, PressureReading } from '@/types/weather';

interface PressureTrendChartProps {
  pressureHistory: PressureHistory;
  timeRange?: '24h' | '7d';
  size?: 'sm' | 'md' | 'lg';
  showGrid?: boolean;
  showTrendLine?: boolean;
  showDataPoints?: boolean;
  showComparison?: boolean;
  className?: string;
}

const PressureTrendChart: React.FC<PressureTrendChartProps> = ({
  pressureHistory,
  timeRange = '24h',
  size = 'md',
  showGrid = true,
  showTrendLine = true,
  showDataPoints = true,
  showComparison = true,
  className = '',
}) => {
  const { t } = useTranslation(['weather']);
  const { theme } = useTheme();

  // Size configurations - Made more compact for better fit
  const sizeConfig = {
    sm: {
      width: 280,
      height: 100,
      padding: { top: 8, right: 15, bottom: 15, left: 25 },
      fontSize: 'text-xs',
      pointRadius: 1.5,
    },
    md: {
      width: 350,
      height: 130,
      padding: { top: 12, right: 20, bottom: 20, left: 30 },
      fontSize: 'text-xs',
      pointRadius: 2,
    },
    lg: {
      width: 450,
      height: 160,
      padding: { top: 15, right: 25, bottom: 25, left: 35 },
      fontSize: 'text-sm',
      pointRadius: 3,
    },
  };

  const config = sizeConfig?.[size];
  const chartWidth = config.width - config.padding.left - config.padding.right;
  const chartHeight = config.height - config.padding.top - config.padding.bottom;

  // Get data based on time range
  const rawData = timeRange === '24h' ? pressureHistory.last24Hours : pressureHistory.last7Days;
  const chartData =
    rawData.length > 0
      ? rawData
      : [
          {
            timestamp: '1970-01-01T00:00:00Z',
            pressure: pressureHistory.current,
            trend: pressureHistory.trend,
          },
        ];

  // Calculate pressure range for scaling
  const pressures = chartData.map(d => d.pressure);
  const highestPressure = Math.max(...pressures);
  const lowestPressure = Math.min(...pressures);
  const pressureRangeValue = highestPressure - lowestPressure;
  const minPressure = lowestPressure - 2;

  const chartTokens = React.useMemo(
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
      comparisonStandard: theme.isDark ? 'rgba(52, 211, 153, 0.9)' : '#10b981',
      comparisonStandardLabel: theme.isDark ? 'rgba(134, 239, 172, 0.9)' : '#16a34a',
      comparisonAverage: theme.isDark ? 'rgba(148, 163, 184, 0.6)' : '#6b7280',
      statSurface: theme.isDark ? 'rgba(30, 41, 59, 0.65)' : '#f9fafb',
      statBorder: theme.isDark ? 'rgba(71, 85, 105, 0.4)' : 'rgba(226, 232, 240, 0.7)',
      statLabel: theme.isDark ? 'rgba(148, 163, 184, 0.85)' : 'rgba(100, 116, 139, 0.9)',
      statValue: theme.isDark ? 'rgba(248, 250, 252, 0.95)' : 'rgba(15, 23, 42, 0.92)',
      tooltipBackground: theme.isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(30, 41, 59, 0.85)',
      tooltipText: 'rgba(248, 250, 252, 0.98)',
      currentLabel: theme.isDark ? 'rgba(248, 250, 252, 0.9)' : 'rgba(15, 23, 42, 0.9)',
      dataPointStroke: theme.isDark ? 'rgba(15, 23, 42, 0.85)' : '#ffffff',
    }),
    [theme.isDark]
  );

  const maxPressure = highestPressure + 2;
  const pressureRange = maxPressure - minPressure;

  // Scale functions
  const scaleX = (index: number) =>
    chartData.length <= 1 ? chartWidth / 2 : (index / (chartData.length - 1)) * chartWidth;
  const scaleY = (pressure: number) =>
    chartHeight - ((pressure - minPressure) / pressureRange) * chartHeight;

  // Generate path for trend line
  const generatePath = (readings: PressureReading[]) => {
    if (readings.length === 0) return '';

    const points = readings.map((reading, index) => ({
      x: scaleX(index),
      y: scaleY(reading.pressure),
    }));

    let path = `M ${points?.[0].x} ${points?.[0].y}`;

    // Use smooth curves for better visual appeal
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points?.[i - 1];
      const currentPoint = points?.[i];
      const controlPoint1X = prevPoint.x + (currentPoint.x - prevPoint.x) * 0.3;
      const controlPoint2X = currentPoint.x - (currentPoint.x - prevPoint.x) * 0.3;

      path += ` C ${controlPoint1X} ${prevPoint.y}, ${controlPoint2X} ${currentPoint.y}, ${currentPoint.x} ${currentPoint.y}`;
    }

    return path;
  };

  const trendPath = generatePath(chartData);

  // Get trend color based on overall trend and theme contrast
  const getTrendColor = (trend: string) => {
    const palette: Record<string, string> = theme.isDark
      ? {
          rising: 'rgba(52, 211, 153, 0.9)',
          falling: 'rgba(248, 113, 113, 0.9)',
          stable: 'rgba(96, 165, 250, 0.95)',
          default: 'rgba(148, 163, 184, 0.85)',
        }
      : {
          rising: '#10b981',
          falling: '#ef4444',
          stable: '#3b82f6',
          default: '#6b7280',
        };

    return palette[trend] ?? palette.default;
  };

  const trendColor = getTrendColor(pressureHistory.trend);

  // Generate grid lines
  const gridLines = [];
  const numGridLines = 5;

  // Horizontal grid lines (pressure levels)
  for (let i = 0; i <= numGridLines; i++) {
    const pressure = minPressure + (pressureRange * i) / numGridLines;
    const y = scaleY(pressure);
    gridLines.push(
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
          x={-5}
          y={y + 3}
        >
          {pressure.toFixed(0)}
        </text>
      </g>
    );
  }

  // Vertical grid lines (time intervals)
  const timeIntervals = timeRange === '24h' ? 6 : 7; // 4-hour intervals for 24h, daily for 7d
  for (let i = 0; i <= timeIntervals; i++) {
    const x = (i / timeIntervals) * chartWidth;
    const dataIndex = Math.floor((i / timeIntervals) * (chartData.length - 1));
    const reading = chartData?.[dataIndex];

    if (reading) {
      const timeLabel =
        timeRange === '24h'
          ? new Date(reading.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : new Date(reading.timestamp).toLocaleDateString([], { weekday: 'short' });

      gridLines.push(
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
            y={chartHeight + 15}
          >
            {timeLabel}
          </text>
        </g>
      );
    }
  }

  // Calculate average pressure for comparison
  const averagePressure = pressures.reduce((sum, p) => sum + p, 0) / pressures.length;
  const standardPressure = 1013.25;

  return (
    <div className={`pressure-trend-chart ${className}`}>
      <div className="space-y-4">
        {/* Chart Header */}
        <div className="flex items-center justify-between">
          <h4
            className={`font-semibold ${config.fontSize}`}
            style={{ color: chartTokens.headerColor }}
          >
            {t('weather:pressure.trendChart', 'Pressure Trend')} (
            {timeRange === '24h' ? '24 Hours' : '7 Days'})
          </h4>
          <div className="flex items-center space-x-4">
            {/* Trend Indicator */}
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: trendColor }} />
              <span
                className={`${config.fontSize} capitalize`}
                style={{ color: chartTokens.subheaderColor }}
              >
                {t(`weather:pressure.${pressureHistory.trend}`, pressureHistory.trend)}
              </span>
            </div>

            {/* Change Rate */}
            <div className={config.fontSize} style={{ color: chartTokens.subheaderColor }}>
              {pressureHistory.changeRate > 0 ? '+' : ''}
              {pressureHistory.changeRate.toFixed(1)} hPa/h
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div
          className="rounded-lg border p-2 backdrop-blur-sm transition-colors duration-300"
          data-chart-surface={chartTokens.surfaceBackground}
          data-testid="pressure-chart-card"
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
            <g transform={`translate(${config.padding.left}, ${config.padding.top})`}>
              {/* Grid Lines */}
              {showGrid && gridLines}

              {/* Standard Pressure Reference Line */}
              {showComparison && (
                <g>
                  <line
                    opacity="0.6"
                    stroke={chartTokens.comparisonStandard}
                    strokeDasharray="5,5"
                    strokeWidth="2"
                    x1={0}
                    x2={chartWidth}
                    y1={scaleY(standardPressure)}
                    y2={scaleY(standardPressure)}
                  />
                  <text
                    className={`${config.fontSize} font-medium`}
                    fill={chartTokens.comparisonStandardLabel}
                    textAnchor="end"
                    x={chartWidth - 5}
                    y={scaleY(standardPressure) - 5}
                  >
                    {t('weather:pressure.standardPressure', 'Standard (1013 hPa)')}
                  </text>
                </g>
              )}

              {/* Average Pressure Line */}
              {showComparison && (
                <g>
                  <line
                    opacity="0.5"
                    stroke={chartTokens.comparisonAverage}
                    strokeDasharray="3,3"
                    strokeWidth="1"
                    x1={0}
                    x2={chartWidth}
                    y1={scaleY(averagePressure)}
                    y2={scaleY(averagePressure)}
                  />
                  <text
                    className={config.fontSize}
                    fill={chartTokens.gridLabel}
                    x={5}
                    y={scaleY(averagePressure) - 5}
                  >
                    {t('weather:pressure.average', 'Avg')} ({averagePressure.toFixed(1)})
                  </text>
                </g>
              )}

              {/* Trend Line */}
              {showTrendLine && (
                <path
                  className="transition-all duration-1000"
                  d={trendPath}
                  fill="none"
                  stroke={trendColor}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                />
              )}

              {/* Data Points */}
              {showDataPoints &&
                chartData.map((reading, index) => (
                  <g key={index}>
                    <circle
                      className="transition-all duration-300 hover:r-6"
                      cx={scaleX(index)}
                      cy={scaleY(reading.pressure)}
                      fill={trendColor}
                      r={config.pointRadius}
                      stroke={chartTokens.dataPointStroke}
                      strokeWidth="2"
                    />

                    {/* Tooltip on hover */}
                    <g className="opacity-0 transition-opacity duration-200 hover:opacity-100">
                      <rect
                        fill={chartTokens.tooltipBackground}
                        height="25"
                        rx="4"
                        width="50"
                        x={scaleX(index) - 25}
                        y={scaleY(reading.pressure) - 35}
                      />
                      <text
                        className="text-xs font-medium"
                        fill={chartTokens.tooltipText}
                        textAnchor="middle"
                        x={scaleX(index)}
                        y={scaleY(reading.pressure) - 20}
                      >
                        {reading.pressure.toFixed(1)}
                      </text>
                      <text
                        className="text-xs"
                        fill={chartTokens.tooltipText}
                        textAnchor="middle"
                        x={scaleX(index)}
                        y={scaleY(reading.pressure) - 12}
                      >
                        hPa
                      </text>
                    </g>
                  </g>
                ))}

              {/* Current Pressure Highlight */}
              <g>
                <circle
                  className="animate-pulse"
                  cx={scaleX(chartData.length - 1)}
                  cy={scaleY(pressureHistory.current)}
                  fill={trendColor}
                  r={config.pointRadius + 2}
                  stroke={chartTokens.dataPointStroke}
                  strokeWidth="3"
                />
                <text
                  className={`${config.fontSize} font-bold`}
                  fill={chartTokens.currentLabel}
                  textAnchor="middle"
                  x={scaleX(chartData.length - 1)}
                  y={scaleY(pressureHistory.current) - 15}
                >
                  {t('weather:pressure.current', 'Current')}
                </text>
              </g>
            </g>
          </svg>
        </div>

        {/* Chart Statistics */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div
            className="rounded border p-2 transition-colors duration-300"
            data-testid="pressure-stat-card"
            style={{
              background: chartTokens.statSurface,
              borderColor: chartTokens.statBorder,
            }}
          >
            <div className={config.fontSize} style={{ color: chartTokens.statLabel }}>
              {t('weather:pressure.highest', 'High')}
            </div>
            <div
              className={`font-bold ${config.fontSize}`}
              style={{ color: chartTokens.statValue }}
            >
              {`${highestPressure.toFixed(1)} hPa`}
            </div>
          </div>

          <div
            className="rounded border p-2 transition-colors duration-300"
            data-testid="pressure-stat-card"
            style={{
              background: chartTokens.statSurface,
              borderColor: chartTokens.statBorder,
            }}
          >
            <div className={config.fontSize} style={{ color: chartTokens.statLabel }}>
              {t('weather:pressure.lowest', 'Low')}
            </div>
            <div
              className={`font-bold ${config.fontSize}`}
              style={{ color: chartTokens.statValue }}
            >
              {`${lowestPressure.toFixed(1)} hPa`}
            </div>
          </div>

          <div
            className="rounded border p-2 transition-colors duration-300"
            data-testid="pressure-stat-card"
            style={{
              background: chartTokens.statSurface,
              borderColor: chartTokens.statBorder,
            }}
          >
            <div className={config.fontSize} style={{ color: chartTokens.statLabel }}>
              {t('weather:pressure.range', 'Range')}
            </div>
            <div
              className={`font-bold ${config.fontSize}`}
              style={{ color: chartTokens.statValue }}
            >
              {`${pressureRangeValue.toFixed(1)} hPa`}
            </div>
          </div>

          <div
            className="rounded border p-2 transition-colors duration-300"
            data-testid="pressure-stat-card"
            style={{
              background: chartTokens.statSurface,
              borderColor: chartTokens.statBorder,
            }}
          >
            <div className={config.fontSize} style={{ color: chartTokens.statLabel }}>
              {t('weather:pressure.average', 'Avg')}
            </div>
            <div
              className={`font-bold ${config.fontSize}`}
              style={{ color: chartTokens.statValue }}
            >
              {`${averagePressure.toFixed(1)} hPa`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PressureTrendChart;
