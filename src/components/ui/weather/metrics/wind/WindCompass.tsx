/**
 * WindCompass Component
 * A visual compass component for displaying wind direction with speed indicators
 */

import { useTheme } from '@/design-system/theme';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useWindSpeedUnit } from '@/hooks/useWindSpeedUnit';

interface WindCompassProps {
  windSpeed: number;
  windDirection: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  showDirection?: boolean;
  showSpeedIndicator?: boolean;
  showCompassLabels?: boolean;
  className?: string;
}

const WindCompass: React.FC<WindCompassProps> = ({
  windSpeed,
  windDirection,
  size = 'md',
  showValue = true,
  showDirection = true,
  showSpeedIndicator = true,
  showCompassLabels = true,
  className = '',
}) => {
  const { theme } = useTheme();

  const compassSurfaceBackground = theme.isDark
    ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.94), rgba(15, 23, 42, 0.88))'
    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(226, 232, 240, 0.92))';
  const compassBorderColor = theme.isDark
    ? 'rgba(148, 163, 184, 0.45)'
    : 'rgba(148, 163, 184, 0.32)';
  const compassShadow = theme.isDark
    ? '0 20px 38px rgba(8, 15, 26, 0.55)'
    : '0 18px 34px rgba(15, 23, 42, 0.12)';
  const markerPrimaryColor = theme.isDark ? 'rgba(191, 219, 254, 0.9)' : 'rgba(30, 41, 59, 0.7)';
  const markerSecondaryColor = theme.isDark
    ? 'rgba(148, 163, 184, 0.6)'
    : 'rgba(148, 163, 184, 0.5)';
  const labelFillColor = theme.isDark ? theme.colors.neutral[100] : theme.colors.neutral[700];
  const labelStrokeColor = theme.isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.9)';
  const secondaryTextColor = theme.isDark ? theme.colors.neutral[300] : theme.colors.neutral[600];
  const scaleLabelColor = theme.isDark ? theme.colors.neutral[300] : theme.colors.neutral[500];
  const scaleUnitColor = theme.isDark ? 'rgba(148, 163, 184, 0.6)' : 'rgba(100, 116, 139, 0.7)';
  const compassBaseFill = theme.isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.96)';
  const badgeBackground = theme.isDark ? 'rgba(15, 23, 42, 0.82)' : 'rgba(248, 250, 252, 0.94)';
  const badgeBorderColor = theme.isDark ? 'rgba(148, 163, 184, 0.4)' : 'rgba(148, 163, 184, 0.28)';
  const badgeShadow = theme.isDark
    ? '0 12px 24px rgba(8, 15, 26, 0.45)'
    : '0 10px 22px rgba(15, 23, 42, 0.09)';
  const accentPalette = theme.isDark
    ? ['#94a3b8', '#38bdf8', '#34d399', '#facc15', '#fb923c', '#f97316', '#ef4444', '#f87171']
    : ['#6b7280', '#0ea5e9', '#10b981', '#f59e0b', '#f97316', '#ef4444', '#dc2626', '#b91c1c'];

  const { t } = useTranslation(['weather']);
  const { formatWindSpeed, getUnitSymbol } = useWindSpeedUnit();

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-24 h-24',
      compass: 'w-20 h-20',
      arrow: 'w-8 h-8',
      text: 'text-xs',
      valueText: 'text-sm',
      labelText: 'text-xs',
    },
    md: {
      container: 'w-32 h-32',
      compass: 'w-28 h-28',
      arrow: 'w-10 h-10',
      text: 'text-sm',
      valueText: 'text-base',
      labelText: 'text-xs',
    },
    lg: {
      container: 'w-40 h-40',
      compass: 'w-36 h-36',
      arrow: 'w-12 h-12',
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
    if (speed < 1)
      return { category: 'Calm', color: 'text-gray-400', bgColor: 'bg-gray-100', intensity: 0 };
    if (speed < 3)
      return { category: 'Light Air', color: 'text-blue-500', bgColor: 'bg-blue-50', intensity: 1 };
    if (speed < 7)
      return {
        category: 'Light Breeze',
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        intensity: 2,
      };
    if (speed < 12)
      return {
        category: 'Gentle Breeze',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        intensity: 3,
      };
    if (speed < 18)
      return {
        category: 'Moderate Breeze',
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        intensity: 4,
      };
    if (speed < 25)
      return {
        category: 'Fresh Breeze',
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        intensity: 5,
      };
    if (speed < 32)
      return {
        category: 'Strong Breeze',
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
        intensity: 6,
      };
    return { category: 'High Wind', color: 'text-red-700', bgColor: 'bg-red-100', intensity: 7 };
  };

  const windInfo = getWindSpeedInfo(windSpeed);
  const intensityIndex = Math.max(0, Math.min(accentPalette.length - 1, windInfo.intensity));
  const accentColor = accentPalette[intensityIndex];

  const directionText = getWindDirectionText(windDirection);

  // Calculate arrow rotation (wind direction indicates where wind is coming FROM)
  const arrowRotation = windDirection;

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
    <div className={`wind-compass ${className}`}>
      {/* Wind Speed Value Display */}
      {showValue && (
        <div className="text-center mb-3">
          <div className={`font-bold ${config.valueText}`} style={{ color: accentColor }}>
            {windSpeed.toFixed(1)} m/s
          </div>
          {showDirection && (
            <div className={`${config.text} font-medium`} style={{ color: secondaryTextColor }}>
              {directionText} ({windDirection}°)
            </div>
          )}
        </div>
      )}

      {/* Compass Container */}
      <div className={`relative ${config.container} mx-auto`}>
        {/* Compass Background */}
        <div
          className={`${config.compass} relative mx-auto rounded-full`}
          style={{
            background: compassSurfaceBackground,
            boxShadow: compassShadow,
            border: `1px solid ${compassBorderColor}`,
          }}
        >
          {/* Outer Ring */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Compass Background Circle */}
            <circle
              cx="50"
              cy="50"
              fill={compassBaseFill}
              r="48"
              stroke={compassBorderColor}
              strokeWidth="2"
            />

            {/* Speed Intensity Rings */}
            {showSpeedIndicator && windInfo.intensity > 0 && (
              <>
                {Array.from({ length: windInfo.intensity }, (_, i) => (
                  <circle
                    key={i}
                    className="transition-all duration-1000"
                    cx="50"
                    cy="50"
                    fill="none"
                    opacity={0.3 - i * 0.05}
                    r={42 - i * 6}
                    stroke={accentColor}
                    strokeWidth="1"
                  />
                ))}
              </>
            )}

            {/* Compass Direction Lines */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
              <line
                key={angle}
                stroke={angle % 90 === 0 ? markerPrimaryColor : markerSecondaryColor}
                strokeLinecap="round"
                strokeOpacity={angle % 90 === 0 ? 0.95 : 0.6}
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
                  className={`${config.labelText} font-semibold tracking-wide`}
                  dominantBaseline="middle"
                  fill={labelFillColor}
                  style={{
                    paintOrder: 'stroke fill',
                    stroke: labelStrokeColor,
                    strokeWidth: theme.isDark ? 0.6 : 0.35,
                  }}
                  textAnchor="middle"
                  x={point.x}
                  y={point.y}
                >
                  {point.label}
                </text>
              ))}

            {/* Wind Direction Arrow */}
            <g transform={`rotate(${arrowRotation} 50 50)`}>
              {/* Arrow Shaft */}
              <line
                className="transition-all duration-1000"
                stroke={accentColor}
                strokeLinecap="round"
                strokeWidth="3"
                x1="50"
                x2="50"
                y1="50"
                y2="25"
              />

              {/* Arrow Head */}
              <polygon
                className="transition-all duration-1000"
                fill={accentColor}
                points="50,20 45,30 55,30"
              />

              {/* Arrow Tail (showing wind origin) */}
              <circle
                className="transition-all duration-1000"
                cx="50"
                cy="50"
                fill={accentColor}
                r="3"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* Wind Speed Category */}
      {showSpeedIndicator && (
        <div className="text-center mt-3">
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full border ${config.text} font-medium`}
            style={{
              background: badgeBackground,
              borderColor: badgeBorderColor,
              boxShadow: badgeShadow,
              color: accentColor,
            }}
          >
            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: accentColor }} />
            {windInfo.category}
          </div>
        </div>
      )}

      {/* Wind Speed Value */}
      {showValue && (
        <div className="text-center mt-2">
          <div className={`${config.valueText} font-bold`} style={{ color: accentColor }}>
            {formatWindSpeed(windSpeed, { showUnit: true, decimals: 1 })}
          </div>
        </div>
      )}

      {/* Wind Speed Scale Reference */}
      <div className="mt-4 text-center">
        <div className={`${config.labelText} font-medium mb-2`} style={{ color: scaleLabelColor }}>
          {t('weather:wind.speedScale', 'Wind Speed Scale')}
        </div>
        <div className="flex justify-center space-x-1">
          {[
            { range: '0-1', color: 'bg-gray-300', label: 'Calm' },
            { range: '1-3', color: 'bg-blue-300', label: 'Light' },
            { range: '3-7', color: 'bg-green-300', label: 'Breeze' },
            { range: '7-12', color: 'bg-yellow-300', label: 'Gentle' },
            { range: '12-18', color: 'bg-orange-300', label: 'Moderate' },
            { range: '18-25', color: 'bg-red-300', label: 'Fresh' },
            { range: '25+', color: 'bg-purple-300', label: 'Strong' },
          ].map((scale, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-sm ${scale.color} ${
                windInfo.intensity === index ? 'ring-2 ring-gray-400' : ''
              }`}
              title={`${scale.label}: ${scale.range} ${getUnitSymbol()}`}
            />
          ))}
        </div>
        <div className={`${config.labelText} mt-1`} style={{ color: scaleUnitColor }}>
          {getUnitSymbol()}
        </div>
      </div>
    </div>
  );
};

export default WindCompass;
