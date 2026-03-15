/**
 * AQI Meter Component
 * Visual representation of Air Quality Index with gauge and progress bar
 */

import React from 'react';

import type { AQIStandard } from '@/types/airQuality';
import { EUROPEAN_AQI_LEVELS, US_AQI_LEVELS } from '@/types/airQuality';

export interface AQIMeterProps {
  aqi: number;
  standard?: AQIStandard;
  size?: 'sm' | 'md' | 'lg';
  showGauge?: boolean;
  showProgressBar?: boolean;
  showValue?: boolean;
  showCategory?: boolean;
  className?: string;
}

const AQIMeter: React.FC<AQIMeterProps> = ({
  aqi,
  standard = 'european',
  size = 'md',
  showGauge = true,
  showProgressBar = true,
  showValue = true,
  showCategory = true,
  className = '',
}) => {
  const levels = standard === 'european' ? EUROPEAN_AQI_LEVELS : US_AQI_LEVELS;
  const maxAQI = standard === 'european' ? 100 : 500;

  // Find current level
  const currentLevel = levels.find(level => aqi >= level.min && aqi <= level.max) || levels[0];

  // Calculate percentage for progress bar
  const percentage = Math.min((aqi / maxAQI) * 100, 100);

  // Size configurations
  const sizeConfig = {
    sm: {
      gauge: 80,
      strokeWidth: 8,
      fontSize: 'text-lg',
      categorySize: 'text-xs',
    },
    md: {
      gauge: 120,
      strokeWidth: 10,
      fontSize: 'text-2xl',
      categorySize: 'text-sm',
    },
    lg: {
      gauge: 160,
      strokeWidth: 12,
      fontSize: 'text-3xl',
      categorySize: 'text-base',
    },
  };

  const config = sizeConfig[size];
  const radius = (config.gauge - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Circular Gauge */}
      {showGauge && (
        <div className="relative" style={{ width: config.gauge, height: config.gauge }}>
          {/* Background circle */}
          <svg
            className="transform -rotate-90"
            height={config.gauge}
            width={config.gauge}
          >
            {/* Background track */}
            <circle
              className="stroke-gray-200 dark:stroke-gray-700"
              cx={config.gauge / 2}
              cy={config.gauge / 2}
              fill="none"
              r={radius}
              strokeWidth={config.strokeWidth}
            />
            {/* Progress circle */}
            <circle
              className="transition-all duration-1000 ease-out"
              cx={config.gauge / 2}
              cy={config.gauge / 2}
              fill="none"
              r={radius}
              stroke={currentLevel.color}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeWidth={config.strokeWidth}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {showValue && (
              <div className={`font-bold ${config.fontSize}`} style={{ color: currentLevel.color }}>
                {Math.round(aqi)}
              </div>
            )}
            {showCategory && (
              <div className={`font-medium ${config.categorySize} text-gray-600 dark:text-gray-400 text-center px-2`}>
                {currentLevel.category}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Linear Progress Bar */}
      {showProgressBar && (
        <div className="w-full">
          {/* Progress bar */}
          <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full"
              style={{
                width: `${percentage}%`,
                backgroundColor: currentLevel.color,
              }}
            />
          </div>

          {/* Level indicators */}
          <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>0</span>
            <span className="font-medium" style={{ color: currentLevel.color }}>
              {Math.round(aqi)}
            </span>
            <span>{maxAQI}{standard === 'european' ? '+' : ''}</span>
          </div>

          {/* Color scale legend */}
          <div className="mt-3 flex gap-1 rounded-full overflow-hidden">
            {levels.map((level, index) => (
              <div
                key={index}
                className="h-2 flex-1 transition-opacity duration-300"
                style={{
                  backgroundColor: level.color,
                  opacity: aqi >= level.min && aqi <= level.max ? 1 : 0.4,
                }}
                title={level.category}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AQIMeter;

