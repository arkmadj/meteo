/**
 * DualWindCompass Component
 * A visual compass component displaying both sustained wind and gust directions with clear distinction
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useWindSpeedUnit } from '@/hooks/useWindSpeedUnit';

interface DualWindCompassProps {
  windSpeed: number;
  windDirection: number;
  gustSpeed?: number;
  gustDirection?: number;
  size?: 'sm' | 'md' | 'lg';
  showValues?: boolean;
  showDirections?: boolean;
  showSpeedIndicators?: boolean;
  showCompassLabels?: boolean;
  showLegend?: boolean;
  className?: string;
}

const DualWindCompass: React.FC<DualWindCompassProps> = ({
  windSpeed,
  windDirection,
  gustSpeed,
  gustDirection,
  size = 'md',
  showValues = true,
  showDirections = true,
  showSpeedIndicators = true,
  showCompassLabels = true,
  showLegend = true,
  className = '',
}) => {
  const { t } = useTranslation(['weather']);
  const { formatWindSpeed } = useWindSpeedUnit();

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-28 h-28',
      compass: 'w-24 h-24',
      text: 'text-xs',
      valueText: 'text-sm',
      labelText: 'text-xs',
    },
    md: {
      container: 'w-36 h-36',
      compass: 'w-32 h-32',
      text: 'text-sm',
      valueText: 'text-base',
      labelText: 'text-xs',
    },
    lg: {
      container: 'w-44 h-44',
      compass: 'w-40 h-40',
      text: 'text-base',
      valueText: 'text-lg',
      labelText: 'text-sm',
    },
  };

  const config = sizeConfig?.[size];

  // Convert wind direction to compass direction
  const getWindDirectionText = (degrees: number): string => {
    const directions = [
      'N',
      'NNE',
      'NE',
      'ENE',
      'E',
      'ESE',
      'SE',
      'SSE',
      'S',
      'SSW',
      'SW',
      'WSW',
      'W',
      'WNW',
      'NW',
      'NNW',
    ];
    const index = Math.round(degrees / 22.5) % 16;
    return directions?.[index];
  };

  // Get wind speed category and color
  const getWindSpeedInfo = (speed: number) => {
    if (speed < 1) return { category: 'Calm', color: '#9ca3af', intensity: 0 };
    if (speed < 3) return { category: 'Light Air', color: '#3b82f6', intensity: 1 };
    if (speed < 7) return { category: 'Light Breeze', color: '#10b981', intensity: 2 };
    if (speed < 12) return { category: 'Gentle Breeze', color: '#f59e0b', intensity: 3 };
    if (speed < 18) return { category: 'Moderate Breeze', color: '#f97316', intensity: 4 };
    if (speed < 25) return { category: 'Fresh Breeze', color: '#ef4444', intensity: 5 };
    return { category: 'Strong Breeze', color: '#dc2626', intensity: 6 };
  };

  const windInfo = getWindSpeedInfo(windSpeed);
  const gustInfo = gustSpeed ? getWindSpeedInfo(gustSpeed) : null;

  const windDirectionText = getWindDirectionText(windDirection);
  const gustDirectionText = gustDirection ? getWindDirectionText(gustDirection) : null;

  // Calculate direction difference
  const getDirectionDifference = (dir1: number, dir2: number): number => {
    let diff = Math.abs(dir1 - dir2);
    if (diff > 180) diff = 360 - diff;
    return diff;
  };

  const directionDifference = gustDirection
    ? getDirectionDifference(windDirection, gustDirection)
    : 0;

  // Compass points for labels
  const compassPoints = [
    { label: 'N', angle: 0, x: 50, y: 8 },
    { label: 'NE', angle: 45, x: 85, y: 15 },
    { label: 'E', angle: 90, x: 92, y: 50 },
    { label: 'SE', angle: 135, x: 85, y: 85 },
    { label: 'S', angle: 180, x: 50, y: 92 },
    { label: 'SW', angle: 225, x: 15, y: 85 },
    { label: 'W', angle: 270, x: 8, y: 50 },
    { label: 'NW', angle: 315, x: 15, y: 15 },
  ];

  return (
    <div className={`dual-wind-compass ${className}`}>
      {/* Values Display */}
      {showValues && (
        <div className="text-center mb-4 space-y-2">
          {/* Sustained Wind */}
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <div className={`font-bold text-blue-600 ${config.valueText}`}>
                {formatWindSpeed(windSpeed, { showUnit: true, decimals: 1 })}
              </div>
              {showDirections && (
                <div className={`${config.text} text-gray-600 font-medium`}>
                  {windDirectionText} ({windDirection}°)
                </div>
              )}
              <div className={`${config.text} text-blue-500`}>
                {t('weather:wind.sustainedWind', 'Sustained')}
              </div>
            </div>

            {/* Gust Wind */}
            {gustSpeed && gustDirection && (
              <div className="text-center">
                <div className={`font-bold text-orange-600 ${config.valueText}`}>
                  {formatWindSpeed(gustSpeed, { showUnit: true, decimals: 1 })}
                </div>
                {showDirections && (
                  <div className={`${config.text} text-gray-600 font-medium`}>
                    {gustDirectionText} ({gustDirection}°)
                  </div>
                )}
                <div className={`${config.text} text-orange-500`}>
                  {t('weather:wind.windGusts', 'Gusts')}
                </div>
              </div>
            )}
          </div>

          {/* Direction Difference */}
          {gustDirection && directionDifference > 5 && (
            <div className={`${config.text} text-gray-500 italic`}>
              {directionDifference.toFixed(0)}°{' '}
              {t('weather:wind.directionVariation', 'direction variation')}
            </div>
          )}
        </div>
      )}

      {/* Compass Visualization */}
      <div className="flex justify-center">
        <div className={`relative ${config.container}`}>
          <svg
            className={`${config.compass} transform transition-transform duration-1000`}
            viewBox="0 0 100 100"
          >
            {/* Compass Background Circle */}
            <circle
              cx="50"
              cy="50"
              fill="rgba(255, 255, 255, 0.1)"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="1"
            />

            {/* Speed Intensity Rings for Sustained Wind */}
            {showSpeedIndicators && windInfo.intensity > 0 && (
              <>
                {Array.from({ length: windInfo.intensity }, (_, i) => (
                  <circle
                    key={`wind-${i}`}
                    className="transition-all duration-1000"
                    cx="50"
                    cy="50"
                    fill="none"
                    opacity={0.2 - i * 0.03}
                    r={40 - i * 5}
                    stroke={windInfo.color}
                    strokeWidth="1"
                  />
                ))}
              </>
            )}

            {/* Speed Intensity Rings for Gusts */}
            {showSpeedIndicators && gustInfo && gustInfo.intensity > 0 && (
              <>
                {Array.from({ length: gustInfo.intensity }, (_, i) => (
                  <circle
                    key={`gust-${i}`}
                    className="transition-all duration-1000"
                    cx="50"
                    cy="50"
                    fill="none"
                    opacity={0.3 - i * 0.04}
                    r={38 - i * 5}
                    stroke={gustInfo.color}
                    strokeDasharray="3,2"
                    strokeWidth="1"
                  />
                ))}
              </>
            )}

            {/* Compass Direction Lines */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
              <line
                key={angle}
                stroke="#9ca3af"
                strokeWidth={angle % 90 === 0 ? '2' : '1'}
                transform={`rotate(${angle} 50 50)`}
                x1="50"
                x2="50"
                y1="10"
                y2={angle % 90 === 0 ? '20' : '15'}
              />
            ))}

            {/* Compass Labels */}
            {showCompassLabels &&
              compassPoints.map(point => (
                <text
                  key={point.label}
                  className={`fill-gray-600 ${config.labelText} font-semibold`}
                  dominantBaseline="middle"
                  textAnchor="middle"
                  x={point.x}
                  y={point.y}
                >
                  {point.label}
                </text>
              ))}

            {/* Sustained Wind Direction Arrow */}
            <g transform={`rotate(${windDirection} 50 50)`}>
              {/* Arrow Shaft */}
              <line
                className="transition-all duration-1000"
                stroke={windInfo.color}
                strokeLinecap="round"
                strokeWidth="3"
                x1="50"
                x2="50"
                y1="50"
                y2="28"
              />

              {/* Arrow Head */}
              <polygon
                className="transition-all duration-1000"
                fill={windInfo.color}
                points="50,23 46,32 54,32"
              />

              {/* Arrow Tail */}
              <circle
                className="transition-all duration-1000"
                cx="50"
                cy="50"
                fill={windInfo.color}
                r="2"
              />
            </g>

            {/* Gust Direction Arrow */}
            {gustDirection && gustInfo && (
              <g transform={`rotate(${gustDirection} 50 50)`}>
                {/* Gust Arrow Shaft (dashed) */}
                <line
                  className="transition-all duration-1000"
                  opacity="0.8"
                  stroke={gustInfo.color}
                  strokeDasharray="4,2"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                  x1="50"
                  x2="50"
                  y1="50"
                  y2="25"
                />

                {/* Gust Arrow Head */}
                <polygon
                  className="transition-all duration-1000"
                  fill={gustInfo.color}
                  opacity="0.8"
                  points="50,20 47,28 53,28"
                />
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div
          className="flex items-center justify-center space-x-6 mt-4 pt-3 border-t border-gray-100"
          data-testid="wind-legend"
        >
          <div className="flex items-center space-x-2" data-testid="wind-legend-sustained">
            <div className="w-4 h-1 bg-blue-500 rounded-sm" />
            <span className={`${config.text} text-gray-600`}>
              {t('weather:wind.sustainedWind', 'Sustained Wind')}
            </span>
          </div>
          {gustSpeed && gustDirection && (
            <div className="flex items-center space-x-2" data-testid="wind-legend-gusts">
              <div
                className="w-4 h-1 bg-orange-500 rounded-sm opacity-80"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(90deg, transparent, transparent 2px, white 2px, white 4px)',
                }}
              />
              <span className={`${config.text} text-gray-600`}>
                {t('weather:wind.windGusts', 'Wind Gusts')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Direction Analysis */}
      {gustDirection && directionDifference > 0 && (
        <div className={`mt-3 text-center ${config.text} text-gray-500`}>
          {directionDifference < 15 ? (
            <span className="text-green-600">
              {t('weather:wind.consistentDirection', 'Consistent wind direction')}
            </span>
          ) : directionDifference < 45 ? (
            <span className="text-yellow-600">
              {t('weather:wind.moderateVariation', 'Moderate directional variation')}
            </span>
          ) : (
            <span className="text-orange-600">
              {t('weather:wind.significantVariation', 'Significant directional shifts')}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default DualWindCompass;
