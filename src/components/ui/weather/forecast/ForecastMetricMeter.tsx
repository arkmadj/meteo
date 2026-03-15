/**
 * ForecastMetricMeter Component
 * Visual meter component for forecast metrics with color-coded indicators
 */

import React from 'react';

interface ForecastMetricMeterProps {
  value: number;
  maxValue: number;
  minValue?: number;
  label: string;
  icon: string;
  unit?: string;
  colorScheme: 'precipitation' | 'wind' | 'uv' | 'humidity' | 'temperature';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  showBar?: boolean;
  className?: string;
}

const ForecastMetricMeter: React.FC<ForecastMetricMeterProps> = ({
  value,
  maxValue,
  minValue = 0,
  label,
  icon,
  unit = '',
  colorScheme,
  size = 'md',
  showValue = true,
  showBar = true,
  className = '',
}) => {
  // Calculate percentage for the meter
  const percentage = Math.min(Math.max(((value - minValue) / (maxValue - minValue)) * 100, 0), 100);

  // Color schemes for different metrics
  const colorSchemes = {
    precipitation: {
      low: { bg: 'bg-gray-100', text: 'text-gray-500', bar: 'bg-gray-300' },
      moderate: { bg: 'bg-blue-100', text: 'text-blue-500', bar: 'bg-blue-400' },
      high: { bg: 'bg-blue-200', text: 'text-blue-600', bar: 'bg-blue-500' },
      extreme: { bg: 'bg-blue-300', text: 'text-blue-800', bar: 'bg-blue-600' },
    },
    wind: {
      low: { bg: 'bg-green-100', text: 'text-green-600', bar: 'bg-green-400' },
      moderate: { bg: 'bg-yellow-100', text: 'text-yellow-600', bar: 'bg-yellow-400' },
      high: { bg: 'bg-orange-100', text: 'text-orange-600', bar: 'bg-orange-400' },
      extreme: { bg: 'bg-red-100', text: 'text-red-600', bar: 'bg-red-400' },
    },
    uv: {
      low: { bg: 'bg-green-100', text: 'text-green-600', bar: 'bg-green-400' },
      moderate: { bg: 'bg-yellow-100', text: 'text-yellow-600', bar: 'bg-yellow-400' },
      high: { bg: 'bg-orange-100', text: 'text-orange-600', bar: 'bg-orange-400' },
      extreme: { bg: 'bg-red-100', text: 'text-red-600', bar: 'bg-red-400' },
    },
    humidity: {
      low: { bg: 'bg-orange-100', text: 'text-orange-600', bar: 'bg-orange-400' },
      moderate: { bg: 'bg-green-100', text: 'text-green-600', bar: 'bg-green-400' },
      high: { bg: 'bg-blue-100', text: 'text-blue-600', bar: 'bg-blue-400' },
      extreme: { bg: 'bg-blue-200', text: 'text-blue-800', bar: 'bg-blue-500' },
    },
    temperature: {
      low: { bg: 'bg-blue-100', text: 'text-blue-600', bar: 'bg-blue-400' },
      moderate: { bg: 'bg-green-100', text: 'text-green-600', bar: 'bg-green-400' },
      high: { bg: 'bg-orange-100', text: 'text-orange-600', bar: 'bg-orange-400' },
      extreme: { bg: 'bg-red-100', text: 'text-red-600', bar: 'bg-red-400' },
    },
  };

  // Get intensity level based on percentage
  const getIntensityLevel = (percent: number): 'low' | 'moderate' | 'high' | 'extreme' => {
    if (percent <= 25) return 'low';
    if (percent <= 50) return 'moderate';
    if (percent <= 75) return 'high';
    return 'extreme';
  };

  // Get specific thresholds for different metrics
  const getMetricIntensity = (
    metricType: string,
    val: number
  ): 'low' | 'moderate' | 'high' | 'extreme' => {
    switch (metricType) {
      case 'precipitation':
        if (val <= 20) return 'low';
        if (val <= 50) return 'moderate';
        if (val <= 80) return 'high';
        return 'extreme';
      case 'wind':
        if (val <= 5) return 'low';
        if (val <= 15) return 'moderate';
        if (val <= 25) return 'high';
        return 'extreme';
      case 'uv':
        if (val <= 2) return 'low';
        if (val <= 5) return 'moderate';
        if (val <= 7) return 'high';
        return 'extreme';
      case 'humidity':
        if (val <= 30) return 'low';
        if (val <= 60) return 'moderate';
        if (val <= 80) return 'high';
        return 'extreme';
      default:
        return getIntensityLevel(percentage);
    }
  };

  const intensity = getMetricIntensity(colorScheme, value);
  const colors = colorSchemes?.[colorScheme][intensity];

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'space-y-1',
      icon: 'text-xs',
      label: 'text-[10px]',
      value: 'text-xs',
      bar: 'h-1',
      indicator: 'w-1.5 h-1.5',
    },
    md: {
      container: 'space-y-1.5',
      icon: 'text-sm',
      label: 'text-xs',
      value: 'text-sm',
      bar: 'h-1.5',
      indicator: 'w-2 h-2',
    },
    lg: {
      container: 'space-y-2',
      icon: 'text-base',
      label: 'text-sm',
      value: 'text-base',
      bar: 'h-2',
      indicator: 'w-2.5 h-2.5',
    },
  };

  const config = sizeConfig?.[size];

  return (
    <div className={`${config.container} ${className}`}>
      {/* Header with icon, label, and value */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <span className={`${config.icon}`}>{icon}</span>
          <span className={`text-gray-500 ${config.label} font-medium`}>{label}</span>
        </div>
        {showValue && (
          <div className="flex items-center space-x-1">
            <span className={`${colors.text} ${config.value} font-semibold`}>
              {typeof value === 'number' ? value.toFixed(1) : value}
              {unit}
            </span>
            <div
              className={`${config.indicator} rounded-full ${colors.bg} border border-white shadow-sm`}
            ></div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {showBar && (
        <div className={`w-full bg-gray-200 rounded-full ${config.bar} overflow-hidden`}>
          <div
            className={`${colors.bar} ${config.bar} rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          >
            {/* Animated shimmer effect */}
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Intensity indicator dots */}
      <div className="flex justify-center space-x-1">
        {['low', 'moderate', 'high', 'extreme'].map((level, index) => (
          <div
            key={level}
            className={`w-1 h-1 rounded-full transition-all duration-300 ${
              ['low', 'moderate', 'high', 'extreme'].indexOf(intensity) >= index
                ? colors.bg
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ForecastMetricMeter;
