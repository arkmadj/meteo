/**
 * Pollen Meter Component
 * Visual representation of Pollen levels with gauge and progress bar
 */

import React from 'react';

import type { PollenData } from '@/types/pollen';
import { POLLEN_LEVELS } from '@/types/pollen';

export interface PollenMeterProps {
  pollenData: PollenData;
  size?: 'sm' | 'md' | 'lg';
  showGauge?: boolean;
  showProgressBar?: boolean;
  showValue?: boolean;
  showCategory?: boolean;
  showIndividualPollens?: boolean;
  className?: string;
}

const PollenMeter: React.FC<PollenMeterProps> = ({
  pollenData,
  size = 'md',
  showGauge = true,
  showProgressBar = true,
  showValue = true,
  showCategory = true,
  showIndividualPollens = false,
  className = '',
}) => {
  const { overallIndex, category, color } = pollenData;
  const maxIndex = 5; // Maximum pollen index

  // Find current level configuration
  const _currentLevel =
    POLLEN_LEVELS.find(level => overallIndex >= level.min && overallIndex <= level.max) ||
    POLLEN_LEVELS[0];

  // Calculate percentage for progress bar
  const percentage = (overallIndex / maxIndex) * 100;

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

  // Get active pollens
  const activePollens = Object.values(pollenData.pollens).filter(
    pollen => pollen && pollen.value > 0
  );

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Circular Gauge */}
      {showGauge && (
        <div className="relative" style={{ width: config.gauge, height: config.gauge }}>
          <svg className="transform -rotate-90" height={config.gauge} width={config.gauge}>
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
              stroke={color}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeWidth={config.strokeWidth}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {showValue && (
              <div className={`font-bold ${config.fontSize}`} style={{ color }}>
                {overallIndex}
              </div>
            )}
            {showCategory && (
              <div
                className={`font-medium ${config.categorySize} text-gray-600 dark:text-gray-400 text-center px-2`}
              >
                {category}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Linear Progress Bar */}
      {showProgressBar && (
        <div className="w-full">
          <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full"
              style={{
                width: `${percentage}%`,
                backgroundColor: color,
              }}
            />
          </div>

          {/* Level indicators */}
          <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>None</span>
            <span className="font-medium" style={{ color }}>
              {category}
            </span>
            <span>Extreme</span>
          </div>

          {/* Color scale legend */}
          <div className="mt-3 flex gap-1 rounded-full overflow-hidden">
            {POLLEN_LEVELS.map((level, index) => (
              <div
                key={index}
                className="h-2 flex-1 transition-opacity duration-300"
                style={{
                  backgroundColor: level.color,
                  opacity: overallIndex === index ? 1 : 0.4,
                }}
                title={level.category}
              />
            ))}
          </div>
        </div>
      )}

      {/* Individual Pollen Types */}
      {showIndividualPollens && activePollens.length > 0 && (
        <div className="w-full mt-4">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Active Pollen Types
          </div>
          <div className="grid grid-cols-2 gap-2">
            {activePollens.map(
              pollen =>
                pollen && (
                  <div
                    key={pollen.type}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{pollen.icon}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {pollen.name}
                      </span>
                    </div>
                    <div
                      className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: `${pollen.color}20`,
                        color: pollen.color,
                      }}
                    >
                      {Math.round(pollen.value)} grains/m³
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
      )}

      {/* Not Available Message */}
      {!pollenData.availableInRegion && (
        <div className="w-full text-center py-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Pollen data is only available in Europe
          </div>
        </div>
      )}
    </div>
  );
};

export default PollenMeter;
