/**
 * WeatherMarkers Component
 *
 * Interactive weather markers for maps that display weather data points
 * with visual indicators and work seamlessly with WeatherTooltip.
 */

import React from 'react';
import { CircleMarker, Tooltip } from 'react-leaflet';

import { useTheme } from '@/design-system/theme';
import type { WeatherDataPoint } from './WeatherTooltip';

export interface WeatherMarkersProps {
  /** Weather data points to display as markers */
  data: WeatherDataPoint[];
  /** Show markers (default: true) */
  showMarkers?: boolean;
  /** Marker radius in pixels (default: 8) */
  markerRadius?: number;
  /** Color markers by temperature (default: true) */
  colorByTemperature?: boolean;
  /** Show permanent labels (default: false) */
  showLabels?: boolean;
  /** Marker opacity (default: 0.7) */
  opacity?: number;
  /** Z-index for markers (default: 500) */
  zIndex?: number;
  /** Custom marker renderer */
  renderMarker?: (data: WeatherDataPoint, index: number) => React.ReactNode;
}

/**
 * Get color based on temperature
 */
const getTemperatureColor = (temperature: number): string => {
  if (temperature >= 35) return '#7f1d1d'; // Extreme hot - dark red
  if (temperature >= 30) return '#dc2626'; // Very hot - red
  if (temperature >= 25) return '#f59e0b'; // Hot - orange
  if (temperature >= 20) return '#fbbf24'; // Warm - yellow
  if (temperature >= 15) return '#10b981'; // Mild - green
  if (temperature >= 10) return '#3b82f6'; // Cool - blue
  if (temperature >= 5) return '#6366f1'; // Cold - indigo
  if (temperature >= 0) return '#8b5cf6'; // Very cold - purple
  return '#a855f7'; // Freezing - light purple
};

/**
 * Get humidity color
 */
const getHumidityColor = (humidity: number): string => {
  if (humidity >= 80) return '#0ea5e9'; // Very humid - cyan
  if (humidity >= 60) return '#3b82f6'; // Humid - blue
  if (humidity >= 40) return '#10b981'; // Moderate - green
  if (humidity >= 20) return '#f59e0b'; // Dry - orange
  return '#ef4444'; // Very dry - red
};

/**
 * WeatherMarkers Component
 */
const WeatherMarkers: React.FC<WeatherMarkersProps> = ({
  data,
  showMarkers = true,
  markerRadius = 8,
  colorByTemperature = true,
  showLabels = false,
  opacity = 0.7,
  zIndex: _zIndex = 500,
  renderMarker,
}) => {
  const { theme } = useTheme();
  const isDark = theme.isDark;

  if (!showMarkers || !data.length) return null;

  return (
    <>
      {data.map((point, index) => {
        // Custom renderer
        if (renderMarker) {
          return <React.Fragment key={index}>{renderMarker(point, index)}</React.Fragment>;
        }

        // Default marker
        const color = colorByTemperature
          ? getTemperatureColor(point.temperature)
          : getHumidityColor(point.humidity);

        const fillColor = color;
        const strokeColor = isDark ? '#ffffff' : '#000000';

        return (
          <CircleMarker
            key={index}
            center={[point.lat, point.lng]}
            radius={markerRadius}
            pathOptions={{
              fillColor,
              fillOpacity: opacity,
              color: strokeColor,
              weight: 2,
              opacity: opacity * 0.8,
            }}
            pane="markerPane"
            eventHandlers={{
              mouseover: e => {
                const target = e.target;
                target.setStyle({
                  fillOpacity: 1,
                  weight: 3,
                });
              },
              mouseout: e => {
                const target = e.target;
                target.setStyle({
                  fillOpacity: opacity,
                  weight: 2,
                });
              },
            }}
          >
            {showLabels && (
              <Tooltip
                permanent
                direction="top"
                offset={[0, -markerRadius - 5]}
                className="weather-marker-label"
                opacity={0.9}
              >
                <div className="text-xs font-semibold">{point.temperature.toFixed(1)}°C</div>
              </Tooltip>
            )}
          </CircleMarker>
        );
      })}
    </>
  );
};

export default WeatherMarkers;
