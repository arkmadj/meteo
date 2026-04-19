/**
 * PressureHistoryComparison Component
 * A component for comparing current pressure with historical data and patterns
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/design-system/theme';
import type { PressureHistory } from '@/types/weather';

interface PressureHistoryComparisonProps {
  pressureHistory: PressureHistory;
  size?: 'sm' | 'md' | 'lg';
  showPercentiles?: boolean;
  showSeasonalComparison?: boolean;
  className?: string;
}

const PressureHistoryComparison: React.FC<PressureHistoryComparisonProps> = ({
  pressureHistory,
  size = 'md',
  showPercentiles = true,
  showSeasonalComparison = true,
  className = '',
}) => {
  // Suppress unused parameter warnings for removed features
  void showPercentiles;
  void showSeasonalComparison;
  const { t } = useTranslation(['weather']);
  const { theme } = useTheme();

  // Size configurations - Made more compact
  const sizeConfig = {
    sm: {
      fontSize: 'text-xs',
      titleSize: 'text-xs',
      spacing: 'space-y-1',
      padding: 'p-2',
    },
    md: {
      fontSize: 'text-xs',
      titleSize: 'text-sm',
      spacing: 'space-y-2',
      padding: 'p-3',
    },
    lg: {
      fontSize: 'text-sm',
      titleSize: 'text-base',
      spacing: 'space-y-3',
      padding: 'p-4',
    },
  };

  const config = sizeConfig?.[size];

  // Calculate historical statistics
  const allPressures = pressureHistory.readings.map(r => r.pressure);
  const currentPressure = pressureHistory.current;

  // Statistical calculations
  const mean = allPressures.reduce((sum, p) => sum + p, 0) / allPressures.length;
  const min = Math.min(...allPressures);
  const max = Math.max(...allPressures);
  const stdDev = Math.sqrt(
    allPressures.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / allPressures.length
  );

  // Percentile calculations
  const getPercentile = (value: number, data: number[]) => {
    const sorted = [...data].sort((a, b) => a - b);
    const index = sorted.findIndex(p => p >= value);
    return index === -1 ? 100 : (index / sorted.length) * 100;
  };

  const currentPercentile = getPercentile(currentPressure, allPressures);

  // Pressure categories for comparison - theme-aware
  const getPressureCategory = (pressure: number) => {
    if (pressure < 980)
      return {
        level: 'Very Low',
        color: theme.isDark ? 'text-red-400' : 'text-red-600',
        bgColor: theme.isDark ? 'bg-red-900/20' : 'bg-red-50',
      };
    if (pressure < 1000)
      return {
        level: 'Low',
        color: theme.isDark ? 'text-orange-400' : 'text-orange-600',
        bgColor: theme.isDark ? 'bg-orange-900/20' : 'bg-orange-50',
      };
    if (pressure < 1013)
      return {
        level: 'Below Normal',
        color: theme.isDark ? 'text-yellow-400' : 'text-yellow-600',
        bgColor: theme.isDark ? 'bg-yellow-900/20' : 'bg-yellow-50',
      };
    if (pressure <= 1025)
      return {
        level: 'Normal',
        color: theme.isDark ? 'text-green-400' : 'text-green-600',
        bgColor: theme.isDark ? 'bg-green-900/20' : 'bg-green-50',
      };
    if (pressure <= 1040)
      return {
        level: 'High',
        color: theme.isDark ? 'text-blue-400' : 'text-blue-600',
        bgColor: theme.isDark ? 'bg-blue-900/20' : 'bg-blue-50',
      };
    return {
      level: 'Very High',
      color: theme.isDark ? 'text-purple-400' : 'text-purple-600',
      bgColor: theme.isDark ? 'bg-purple-900/20' : 'bg-purple-50',
    };
  };

  const currentCategory = getPressureCategory(currentPressure);
  const meanCategory = getPressureCategory(mean);

  // Generate comparison insights - theme-aware
  const getComparisonInsight = () => {
    const diffFromMean = currentPressure - mean;

    if (Math.abs(diffFromMean) < stdDev * 0.5) {
      return {
        type: 'normal',
        message: t(
          'weather:pressure.normalVariation',
          'Current pressure is within normal variation'
        ),
        icon: '📊',
        color: theme.isDark ? 'text-green-400' : 'text-green-600',
      };
    } else if (diffFromMean > stdDev) {
      return {
        type: 'high',
        message: t(
          'weather:pressure.unusuallyHigh',
          'Pressure is unusually high for this location'
        ),
        icon: '📈',
        color: theme.isDark ? 'text-blue-400' : 'text-blue-600',
      };
    } else if (diffFromMean < -stdDev) {
      return {
        type: 'low',
        message: t('weather:pressure.unusuallyLow', 'Pressure is unusually low for this location'),
        icon: '📉',
        color: theme.isDark ? 'text-red-400' : 'text-red-600',
      };
    }

    return {
      type: 'moderate',
      message: t(
        'weather:pressure.moderateVariation',
        'Pressure shows moderate variation from average'
      ),
      icon: '📊',
      color: theme.isDark ? 'text-yellow-400' : 'text-yellow-600',
    };
  };

  const insight = getComparisonInsight();

  return (
    <div className={`pressure-history-comparison ${className}`}>
      <div className={config.spacing}>
        {/* Header */}
        <div className="text-center mb-2">
          <h4
            className={`font-semibold ${theme.isDark ? 'text-gray-100' : 'text-gray-900'} ${config.titleSize}`}
          >
            {t('weather:pressure.historicalComparison', 'Historical Analysis')}
          </h4>
        </div>

        {/* Current vs Historical Stats */}
        <div className="grid grid-cols-4 gap-2 max-md:grid-cols-2">
          <div className={`${currentCategory.bgColor} rounded-lg ${config.padding} text-center`}>
            <div
              className={`${config.fontSize} ${theme.isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}
            >
              {t('weather:pressure.current', 'Current')}
            </div>
            <div className={`font-bold ${currentCategory.color} ${config.titleSize}`}>
              {currentPressure.toFixed(1)}
            </div>
            <div
              className={`${config.fontSize} ${theme.isDark ? 'text-gray-500' : 'text-gray-500'}`}
            >
              hPa
            </div>
          </div>

          <div className={`${meanCategory.bgColor} rounded-lg ${config.padding} text-center`}>
            <div
              className={`${config.fontSize} ${theme.isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}
            >
              {t('weather:pressure.historical', 'Historical')}
            </div>
            <div className={`font-bold ${meanCategory.color} ${config.titleSize}`}>
              {mean.toFixed(1)}
            </div>
            <div
              className={`${config.fontSize} ${theme.isDark ? 'text-gray-500' : 'text-gray-500'}`}
            >
              hPa avg
            </div>
          </div>

          <div
            className={`${theme.isDark ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-lg p-3 text-center`}
          >
            <div
              className={`${config.fontSize} ${theme.isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}
            >
              {t('weather:pressure.difference', 'Difference')}
            </div>
            <div
              className={`font-bold ${config.titleSize} ${
                currentPressure > mean
                  ? theme.isDark
                    ? 'text-blue-400'
                    : 'text-blue-600'
                  : currentPressure < mean
                    ? theme.isDark
                      ? 'text-red-400'
                      : 'text-red-600'
                    : theme.isDark
                      ? 'text-gray-400'
                      : 'text-gray-600'
              }`}
            >
              {currentPressure > mean ? '+' : ''}
              {(currentPressure - mean).toFixed(1)}
            </div>
            <div
              className={`${config.fontSize} ${theme.isDark ? 'text-gray-500' : 'text-gray-500'}`}
            >
              hPa
            </div>
          </div>

          <div
            className={`${theme.isDark ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-lg p-3 text-center`}
          >
            <div
              className={`${config.fontSize} ${theme.isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}
            >
              {t('weather:pressure.percentile', 'Percentile')}
            </div>
            <div
              className={`font-bold ${config.titleSize} ${theme.isDark ? 'text-gray-100' : 'text-gray-900'}`}
            >
              {currentPercentile.toFixed(0)}th
            </div>
            <div
              className={`${config.fontSize} ${theme.isDark ? 'text-gray-500' : 'text-gray-500'}`}
            >
              percentile
            </div>
          </div>
        </div>

        {/* Pressure Range Visualization */}
        <div
          className={`${theme.isDark ? 'bg-gray-800/50' : 'bg-white'} rounded border ${theme.isDark ? 'border-gray-700' : 'border-gray-200'} p-2`}
        >
          <div className="relative">
            <div
              className={`w-full h-4 bg-gradient-to-r ${
                theme.isDark ? 'from-red-900/40 to-blue-900/40' : 'from-red-200 to-blue-200'
              } rounded-full relative`}
            >
              {/* Current pressure marker */}
              <div
                className={`absolute top-0 bottom-0 w-1 ${theme.isDark ? 'bg-gray-100' : 'bg-black'} rounded-full`}
                style={{ left: `${((currentPressure - min) / (max - min)) * 100}%` }}
              />
            </div>

            {/* Labels */}
            <div className="flex justify-between mt-1">
              <span
                className={`${config.fontSize} ${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                {min.toFixed(0)}
              </span>
              <span
                className={`${config.fontSize} ${theme.isDark ? 'text-gray-200' : 'text-gray-700'} font-medium`}
              >
                {currentPressure.toFixed(1)} hPa
              </span>
              <span
                className={`${config.fontSize} ${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                {max.toFixed(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Comparison Insight */}
        <div
          className={`${theme.isDark ? 'bg-blue-900/20' : 'bg-blue-50'} rounded p-2 border ${theme.isDark ? 'border-blue-800/50' : 'border-blue-100'}`}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">{insight.icon}</span>
            <div className="flex-1">
              <p
                className={`${config.fontSize} ${theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                {insight.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PressureHistoryComparison;
