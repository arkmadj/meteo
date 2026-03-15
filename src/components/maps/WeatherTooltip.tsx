/**
 * WeatherTooltip Component
 *
 * Dynamic weather tooltips that provide quick weather insights (temp, humidity, wind)
 * when users hover or tap specific areas on the map.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import ReactDOM from 'react-dom/client';

import { useTheme } from '@/design-system/theme';

export interface WeatherDataPoint {
  lat: number;
  lng: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection?: number;
  condition?: string;
  pressure?: number;
  feelsLike?: number;
  locationName?: string;
}

export interface WeatherTooltipProps {
  /** Weather data points to display tooltips for */
  data: WeatherDataPoint[];
  /** Enable hover tooltips (default: true) */
  enableHover?: boolean;
  /** Enable tap/click tooltips on mobile (default: true) */
  enableTap?: boolean;
  /** Tooltip trigger radius in pixels (default: 30) */
  triggerRadius?: number;
  /** Show tooltip delay in ms (default: 200) */
  showDelay?: number;
  /** Hide tooltip delay in ms (default: 100) */
  hideDelay?: number;
  /** Custom tooltip renderer */
  renderTooltip?: (data: WeatherDataPoint) => React.ReactNode;
  /** Z-index for tooltips (default: 1000) */
  zIndex?: number;
}

/**
 * Tooltip Content Component
 */
interface TooltipContentProps {
  data: WeatherDataPoint;
  customRenderer?: (data: WeatherDataPoint) => React.ReactNode;
}

const TooltipContent: React.FC<TooltipContentProps> = ({ data, customRenderer }) => {
  const { theme } = useTheme();

  const isDark = theme.isDark;
  const bgColor = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryTextColor = isDark ? 'text-gray-300' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  // Temperature is assumed to be in Celsius
  const temperature = data.temperature;
  const feelsLike = data.feelsLike ?? null;
  const tempUnit = '°C';

  // Wind direction to compass
  const getWindDirection = (degrees?: number): string => {
    if (degrees === undefined) return 'N/A';
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
    return directions[index];
  };

  // Temperature color indicator
  const getTempColor = (temp: number): string => {
    if (temp >= 30) return '#ef4444'; // Hot - red
    if (temp >= 20) return '#f59e0b'; // Warm - orange
    if (temp >= 10) return '#10b981'; // Mild - green
    if (temp >= 0) return '#3b82f6'; // Cool - blue
    return '#8b5cf6'; // Cold - purple
  };

  if (customRenderer) {
    return <>{customRenderer(data)}</>;
  }

  return (
    <div
      className={`${bgColor} ${textColor} rounded-lg shadow-xl border-2 ${borderColor} p-3 min-w-[200px] max-w-[280px]`}
      style={{
        backdropFilter: 'blur(10px)',
        backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      }}
    >
      {/* Location Name */}
      {data.locationName && (
        <div className={`text-sm font-semibold ${textColor} mb-2 pb-2 border-b ${borderColor}`}>
          📍 {data.locationName}
        </div>
      )}

      {/* Temperature */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🌡️</span>
          <div>
            <div className="text-xs text-gray-500">Temperature</div>
            <div className="text-2xl font-bold" style={{ color: getTempColor(data.temperature) }}>
              {temperature.toFixed(1)}
              {tempUnit}
            </div>
          </div>
        </div>
      </div>

      {/* Feels Like */}
      {feelsLike !== null && (
        <div className={`text-xs ${secondaryTextColor} mb-2`}>
          Feels like: {feelsLike.toFixed(1)}
          {tempUnit}
        </div>
      )}

      {/* Condition */}
      {data.condition && (
        <div className={`text-sm ${secondaryTextColor} mb-2`}>{data.condition}</div>
      )}

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
        {/* Humidity */}
        <div className="flex items-center space-x-1">
          <span className="text-lg">💧</span>
          <div>
            <div className={`text-xs ${secondaryTextColor}`}>Humidity</div>
            <div className={`text-sm font-semibold ${textColor}`}>{data.humidity}%</div>
          </div>
        </div>

        {/* Wind */}
        <div className="flex items-center space-x-1">
          <span className="text-lg">💨</span>
          <div>
            <div className={`text-xs ${secondaryTextColor}`}>Wind</div>
            <div className={`text-sm font-semibold ${textColor}`}>
              {data.windSpeed.toFixed(1)} m/s
            </div>
            {data.windDirection !== undefined && (
              <div className={`text-xs ${secondaryTextColor}`}>
                {getWindDirection(data.windDirection)}
              </div>
            )}
          </div>
        </div>

        {/* Pressure */}
        {data.pressure && (
          <div className="flex items-center space-x-1 col-span-2">
            <span className="text-lg">🔽</span>
            <div>
              <div className={`text-xs ${secondaryTextColor}`}>Pressure</div>
              <div className={`text-sm font-semibold ${textColor}`}>{data.pressure} hPa</div>
            </div>
          </div>
        )}
      </div>

      {/* Coordinates */}
      <div className={`text-xs ${secondaryTextColor} mt-2 pt-2 border-t ${borderColor}`}>
        {data.lat.toFixed(4)}°, {data.lng.toFixed(4)}°
      </div>
    </div>
  );
};

/**
 * WeatherTooltip Component
 */
const WeatherTooltip: React.FC<WeatherTooltipProps> = ({
  data,
  enableHover = true,
  enableTap = true,
  triggerRadius = 30,
  showDelay = 200,
  hideDelay = 100,
  renderTooltip,
  zIndex = 1000,
}) => {
  const map = useMap();
  const [activeTooltip, setActiveTooltip] = useState<WeatherDataPoint | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [showTimeoutId, setShowTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [hideTimeoutId, setHideTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Find nearest weather data point
  const findNearestDataPoint = useCallback(
    (latlng: L.LatLng): WeatherDataPoint | null => {
      if (!data.length) return null;

      let nearest: WeatherDataPoint | null = null;
      let minDistance = Infinity;

      data.forEach(point => {
        const pointLatLng = L.latLng(point.lat, point.lng);
        const distance = latlng.distanceTo(pointLatLng);

        // Convert trigger radius from pixels to meters (approximate)
        const zoom = map.getZoom();
        const metersPerPixel =
          (40075016.686 * Math.abs(Math.cos((latlng.lat * Math.PI) / 180))) / Math.pow(2, zoom + 8);
        const triggerRadiusMeters = triggerRadius * metersPerPixel;

        if (distance < triggerRadiusMeters && distance < minDistance) {
          minDistance = distance;
          nearest = point;
        }
      });

      return nearest;
    },
    [data, map, triggerRadius]
  );

  // Handle mouse move
  const handleMouseMove = useCallback(
    (e: L.LeafletMouseEvent) => {
      if (!enableHover) return;

      const nearestPoint = findNearestDataPoint(e.latlng);

      if (nearestPoint) {
        // Clear any pending hide timeout
        if (hideTimeoutId) {
          clearTimeout(hideTimeoutId);
          setHideTimeoutId(null);
        }

        // Set show timeout if not already showing this point
        if (activeTooltip !== nearestPoint) {
          if (showTimeoutId) clearTimeout(showTimeoutId);

          const timeout = setTimeout(() => {
            setActiveTooltip(nearestPoint);
            setTooltipPosition({ x: e.containerPoint.x, y: e.containerPoint.y });
          }, showDelay);

          setShowTimeoutId(timeout);
        } else {
          // Update position if already showing
          setTooltipPosition({ x: e.containerPoint.x, y: e.containerPoint.y });
        }
      } else {
        // No point nearby, hide tooltip
        if (showTimeoutId) {
          clearTimeout(showTimeoutId);
          setShowTimeoutId(null);
        }

        if (activeTooltip) {
          const timeout = setTimeout(() => {
            setActiveTooltip(null);
            setTooltipPosition(null);
          }, hideDelay);

          setHideTimeoutId(timeout);
        }
      }
    },
    [
      enableHover,
      findNearestDataPoint,
      activeTooltip,
      showTimeoutId,
      hideTimeoutId,
      showDelay,
      hideDelay,
    ]
  );

  // Handle click/tap
  const handleClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      if (!enableTap) return;

      const nearestPoint = findNearestDataPoint(e.latlng);

      if (nearestPoint) {
        setActiveTooltip(nearestPoint);
        setTooltipPosition({ x: e.containerPoint.x, y: e.containerPoint.y });
      } else {
        setActiveTooltip(null);
        setTooltipPosition(null);
      }
    },
    [enableTap, findNearestDataPoint]
  );

  // Map events
  useMapEvents({
    mousemove: handleMouseMove,
    click: handleClick,
    mouseout: () => {
      if (showTimeoutId) clearTimeout(showTimeoutId);
      if (hideTimeoutId) clearTimeout(hideTimeoutId);
      setActiveTooltip(null);
      setTooltipPosition(null);
    },
  });

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (showTimeoutId) clearTimeout(showTimeoutId);
      if (hideTimeoutId) clearTimeout(hideTimeoutId);
    };
  }, [showTimeoutId, hideTimeoutId]);

  // Render tooltip
  useEffect(() => {
    if (!activeTooltip || !tooltipPosition) return;

    const tooltipContainer = document.createElement('div');
    tooltipContainer.className = 'weather-tooltip-container';
    tooltipContainer.style.position = 'absolute';
    tooltipContainer.style.left = `${tooltipPosition.x + 15}px`;
    tooltipContainer.style.top = `${tooltipPosition.y - 10}px`;
    tooltipContainer.style.zIndex = zIndex.toString();
    tooltipContainer.style.pointerEvents = 'none';
    tooltipContainer.style.transition = 'opacity 0.2s ease-in-out';

    map.getContainer().appendChild(tooltipContainer);

    const root = ReactDOM.createRoot(tooltipContainer);
    root.render(<TooltipContent data={activeTooltip} customRenderer={renderTooltip} />);

    return () => {
      root.unmount();
      if (tooltipContainer.parentNode) {
        tooltipContainer.parentNode.removeChild(tooltipContainer);
      }
    };
  }, [activeTooltip, tooltipPosition, map, renderTooltip, zIndex]);

  return null;
};

export default WeatherTooltip;
