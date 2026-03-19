/**
 * MapLegend Component
 *
 * Visual legend and overlay indicators to explain color intensity for
 * temperature, air quality, and other map overlays.
 */

import React, { useState } from 'react';

import { useTheme } from '@/design-system/theme';
import { useMapCompactMode, useMapResponsive } from '@/hooks/useMapResponsive';
import type { AQIStandard } from '@/types/airQuality';
import { EUROPEAN_AQI_LEVELS, US_AQI_LEVELS } from '@/types/airQuality';

export type LegendType = 'temperature' | 'airQuality' | 'precipitation' | 'wind' | 'custom';

export interface CustomLegendItem {
  label: string;
  color: string;
  value?: string | number;
  description?: string;
}

export interface MapLegendProps {
  /** Type of legend to display */
  type: LegendType;
  /** Position on the map */
  position?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  /** Whether the legend is visible */
  visible?: boolean;
  /** Whether the legend can be collapsed */
  collapsible?: boolean;
  /** Initial collapsed state */
  initiallyCollapsed?: boolean;
  /** Title for the legend */
  title?: string;
  /** Temperature range for temperature legend */
  temperatureRange?: { min: number; max: number; unit: 'C' | 'F' };
  /** AQI standard for air quality legend */
  aqiStandard?: AQIStandard;
  /** Custom legend items */
  customItems?: CustomLegendItem[];
  /** Show values on legend items */
  showValues?: boolean;
  /** Compact mode (smaller legend) */
  compact?: boolean;
  /** Custom className */
  className?: string;
  /** Callback when legend is toggled */
  onToggle?: (collapsed: boolean) => void;
}

/**
 * Temperature color gradient stops
 */
const TEMPERATURE_GRADIENT = [
  { temp: -20, color: '#821692', label: 'Very Cold' },
  { temp: -10, color: '#1954A6', label: 'Cold' },
  { temp: 0, color: '#3AAFB9', label: 'Cool' },
  { temp: 10, color: '#57D56F', label: 'Mild' },
  { temp: 20, color: '#FFFF00', label: 'Warm' },
  { temp: 30, color: '#FF8C00', label: 'Hot' },
  { temp: 40, color: '#FF0000', label: 'Very Hot' },
];

/**
 * Get position classes for legend placement
 */
const getPositionClasses = (position: string): string => {
  const positions = {
    topLeft: 'top-4 left-4',
    topRight: 'top-4 right-4',
    bottomLeft: 'bottom-4 left-4',
    bottomRight: 'bottom-4 right-4',
  };
  return positions[position as keyof typeof positions] || positions.topRight;
};

/**
 * MapLegend Component
 */
const MapLegend: React.FC<MapLegendProps> = ({
  type,
  position = 'topRight',
  visible = true,
  collapsible = true,
  initiallyCollapsed = false,
  title,
  temperatureRange = { min: -20, max: 40, unit: 'C' },
  aqiStandard = 'european',
  customItems = [],
  showValues = true,
  compact = false,
  className = '',
  onToggle,
}) => {
  const { theme } = useTheme();
  const responsive = useMapResponsive();
  const autoCompact = useMapCompactMode();
  const [isCollapsed, setIsCollapsed] = useState(initiallyCollapsed);

  // Use responsive compact mode if not explicitly set
  const isCompact = compact || autoCompact;

  // Auto-collapse on mobile if not explicitly set
  const _shouldAutoCollapse = responsive.isMobile && initiallyCollapsed === false;

  const isDark = theme.isDark;
  const bgColor = isDark ? 'bg-gray-800/95' : 'bg-white/95';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryTextColor = isDark ? 'text-gray-300' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const hoverBgColor = isDark ? '#374151' : '#f3f4f6';

  if (!visible) return null;

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onToggle?.(newState);
  };

  // Get legend title
  const getLegendTitle = (): string => {
    if (title) return title;
    switch (type) {
      case 'temperature':
        return 'Temperature';
      case 'airQuality':
        return `Air Quality (${aqiStandard === 'european' ? 'EU' : 'US'} AQI)`;
      case 'precipitation':
        return 'Precipitation';
      case 'wind':
        return 'Wind Speed';
      case 'custom':
        return 'Legend';
      default:
        return 'Map Legend';
    }
  };

  // Render temperature legend
  const renderTemperatureLegend = () => {
    const { min, max, unit } = temperatureRange;
    const range = max - min;
    const steps = compact ? 5 : 7;
    const stepSize = range / (steps - 1);

    const items = Array.from({ length: steps }, (_, i) => {
      const temp = min + i * stepSize;
      const normalized = (temp - min) / range;

      // Find color from gradient
      let color = TEMPERATURE_GRADIENT[0].color;
      for (let j = 0; j < TEMPERATURE_GRADIENT.length - 1; j++) {
        const lower = TEMPERATURE_GRADIENT[j];
        const upper = TEMPERATURE_GRADIENT[j + 1];
        const lowerNorm = (lower.temp - min) / range;
        const upperNorm = (upper.temp - min) / range;

        if (normalized >= lowerNorm && normalized <= upperNorm) {
          const _ratio = (normalized - lowerNorm) / (upperNorm - lowerNorm);
          // Simple color interpolation
          color = upper.color;
          break;
        }
      }

      return {
        label: `${Math.round(temp)}°${unit}`,
        color,
        value: temp,
      };
    });

    return (
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index} className="map-legend-item flex items-center space-x-2">
            <div
              className="map-legend-color-box w-6 h-4 rounded border border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: item.color }}
            />
            <span className={`text-xs ${secondaryTextColor}`}>{item.label}</span>
          </div>
        ))}
      </div>
    );
  };

  // Render air quality legend
  const renderAirQualityLegend = () => {
    const levels = aqiStandard === 'european' ? EUROPEAN_AQI_LEVELS : US_AQI_LEVELS;

    return (
      <div className="space-y-1">
        {levels.map((level, index) => (
          <div key={index} className="map-legend-item flex items-center space-x-2">
            <div
              className="map-legend-color-box w-6 h-4 rounded border border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: level.color }}
            />
            <div className="flex-1">
              <div className={`text-xs font-medium ${textColor}`}>{level.category}</div>
              {showValues && !isCompact && (
                <div className={`text-[0.65rem] ${secondaryTextColor}`}>
                  {level.min}-{level.max === Infinity ? '∞' : level.max}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render precipitation legend
  const renderPrecipitationLegend = () => {
    const items = [
      { label: 'None', color: '#FFFFFF', value: '0 mm/h' },
      { label: 'Light', color: '#B3E5FC', value: '0-2 mm/h' },
      { label: 'Moderate', color: '#4FC3F7', value: '2-10 mm/h' },
      { label: 'Heavy', color: '#0288D1', value: '10-50 mm/h' },
      { label: 'Violent', color: '#01579B', value: '>50 mm/h' },
    ];

    return (
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-6 h-4 rounded border border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1">
              <div className={`text-xs ${textColor}`}>{item.label}</div>
              {showValues && !compact && (
                <div className={`text-[0.65rem] ${secondaryTextColor}`}>{item.value}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render wind legend
  const renderWindLegend = () => {
    const items = [
      { label: 'Calm', color: '#E8F5E9', value: '0-2 m/s' },
      { label: 'Light', color: '#A5D6A7', value: '2-5 m/s' },
      { label: 'Moderate', color: '#66BB6A', value: '5-10 m/s' },
      { label: 'Strong', color: '#FFA726', value: '10-15 m/s' },
      { label: 'Gale', color: '#FF7043', value: '15-20 m/s' },
      { label: 'Storm', color: '#E53935', value: '>20 m/s' },
    ];

    return (
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-6 h-4 rounded border border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1">
              <div className={`text-xs ${textColor}`}>{item.label}</div>
              {showValues && !compact && (
                <div className={`text-[0.65rem] ${secondaryTextColor}`}>{item.value}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render custom legend
  const renderCustomLegend = () => {
    return (
      <div className="space-y-1">
        {customItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-6 h-4 rounded border border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1">
              <div className={`text-xs ${textColor}`}>{item.label}</div>
              {showValues && item.value && (
                <div className={`text-[0.65rem] ${secondaryTextColor}`}>{item.value}</div>
              )}
              {item.description && !compact && (
                <div className={`text-[0.6rem] ${secondaryTextColor} italic`}>
                  {item.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render legend content based on type
  const renderLegendContent = () => {
    switch (type) {
      case 'temperature':
        return renderTemperatureLegend();
      case 'airQuality':
        return renderAirQualityLegend();
      case 'precipitation':
        return renderPrecipitationLegend();
      case 'wind':
        return renderWindLegend();
      case 'custom':
        return renderCustomLegend();
      default:
        return null;
    }
  };

  // Get responsive position - override for mobile
  const responsivePosition = responsive.isMobile ? responsive.positions.legend : position;

  return (
    <div
      className={`map-control map-legend absolute ${getPositionClasses(responsivePosition)} z-[1000] ${className}`}
      style={{
        pointerEvents: 'auto',
        bottom: responsive.isMobile ? `${responsive.safeAreaInsets.bottom + 8}px` : undefined,
      }}
    >
      <div
        className={`map-control-panel map-legend-compact ${bgColor} ${borderColor} rounded-lg shadow-xl border-2 backdrop-blur-sm ${
          isCompact ? 'p-2' : 'p-3'
        } ${isCollapsed ? 'w-auto' : isCompact ? 'min-w-[140px]' : 'min-w-[180px]'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3
            className={`map-legend-title ${isCompact ? 'text-xs' : 'text-sm'} font-semibold ${textColor}`}
          >
            {getLegendTitle()}
          </h3>
          {collapsible && (
            <button
              onClick={handleToggle}
              className={`map-button ml-2 p-1 rounded transition-colors ${textColor}`}
              style={{
                minWidth: responsive.controlSizes.buttonSize,
                minHeight: responsive.controlSizes.buttonSize,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = hoverBgColor;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }}
              aria-label={isCollapsed ? 'Expand legend' : 'Collapse legend'}
            >
              <svg
                className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Legend Content */}
        {!isCollapsed && <div className="mt-2">{renderLegendContent()}</div>}
      </div>
    </div>
  );
};

export default MapLegend;
