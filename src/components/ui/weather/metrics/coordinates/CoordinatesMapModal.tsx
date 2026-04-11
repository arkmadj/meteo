/**
 * CoordinatesMapModal Component
 *
 * A detailed modal view for location coordinates with an interactive map
 * centered on the selected location. Displays the location on a Leaflet map
 * with coordinate information and location context. Includes optional
 * temperature heatmap overlay.
 */

import { CheckIcon } from '@heroicons/react/24/outline';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

import AirQualityHeatmapLayer, {
  type AirQualityDataPoint,
} from '@/components/maps/AirQualityHeatmapLayer';
import MapLegend from '@/components/maps/MapLegend';
import MapOverlayIndicator, { type OverlayInfo } from '@/components/maps/MapOverlayIndicator';
import MapZoomPanControls from '@/components/maps/MapZoomPanControls';
import TemperatureHeatmapLayer, {
  type TemperatureDataPoint,
} from '@/components/maps/TemperatureHeatmapLayer';
import WeatherMarkers from '@/components/maps/WeatherMarkers';
import WeatherTooltip, { type WeatherDataPoint } from '@/components/maps/WeatherTooltip';
import { Checkbox } from '@/components/ui/atoms';
import { AccessibleModal } from '@/components/ui/molecules';
import { useTheme } from '@/design-system/theme';
import type { AQIStandard } from '@/types/airQuality';
import type { LocationData } from '@/types/weather';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface CoordinatesMapModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Latitude coordinate */
  latitude: number;
  /** Longitude coordinate */
  longitude: number;
  /** Location data with city and country */
  location?: LocationData;
}

const CoordinatesMapModal: React.FC<CoordinatesMapModalProps> = ({
  isOpen,
  onClose,
  latitude,
  longitude,
  location,
}) => {
  const { t } = useTranslation(['weather']);
  const { theme } = useTheme();
  const [showTempHeatmap, setShowTempHeatmap] = useState(false);
  const [showAQIHeatmap, setShowAQIHeatmap] = useState(false);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.6);
  const [aqiStandard, setAqiStandard] = useState<AQIStandard>('european');
  const [currentZoom, setCurrentZoom] = useState(13);
  const [zoomLimitReached, setZoomLimitReached] = useState<string | null>(null);
  const [showWeatherTooltips, setShowWeatherTooltips] = useState(true);
  const [showWeatherMarkers, setShowWeatherMarkers] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Build a shareable URL with current coordinates and zoom
  const shareUrl = useMemo(() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('lat', latitude.toFixed(6));
      url.searchParams.set('lng', longitude.toFixed(6));
      url.searchParams.set('zoom', String(currentZoom));
      if (location?.city || location?.country) {
        const name = [location?.city, location?.country].filter(Boolean).join(', ');
        if (name) url.searchParams.set('name', name);
      }
      return url.toString();
    } catch {
      return '';
    }
  }, [latitude, longitude, currentZoom, location]);

  // Share via native share if available; otherwise copy link
  const handleShare = async () => {
    try {
      const title = location?.city || 'Location';
      const text = `${title} — ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      if (navigator.share && window.isSecureContext) {
        await navigator.share({ title: 'Share Location', text, url: shareUrl });
        setShareFeedback('Shared successfully');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareFeedback('Link copied to clipboard');
      }
      setTimeout(() => setShareFeedback(null), 3000);
    } catch (_err) {
      // Fallback to copying if native share is cancelled/failed
      try {
        if (shareUrl) {
          await navigator.clipboard.writeText(shareUrl);
          setShareFeedback('Link copied to clipboard');
          setTimeout(() => setShareFeedback(null), 3000);
          return;
        }
      } catch (_error) {
        // Share API failed, show error message
      }
      setShareFeedback('Unable to share');
      setTimeout(() => setShareFeedback(null), 3000);
    }
  };

  // Share directly to WhatsApp with coordinates and link
  const handleShareWhatsApp = () => {
    try {
      const title = location?.city || 'Location';
      const coords = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      const text = `${title} — ${coords}\n${shareUrl}`;
      const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      setShareFeedback('Opening WhatsApp…');
      setTimeout(() => setShareFeedback(null), 3000);
    } catch (_err) {
      setShareFeedback('Unable to open WhatsApp');
      setTimeout(() => setShareFeedback(null), 3000);
    }
  };

  // Generate sample temperature data around the location
  const temperatureData = useMemo((): TemperatureDataPoint[] => {
    const data: TemperatureDataPoint[] = [];
    const spread = 0.1; // Degrees of lat/lng spread
    const gridSize = 8;
    const step = spread / gridSize;

    for (let i = 0; i <= gridSize; i++) {
      for (let j = 0; j <= gridSize; j++) {
        const lat = latitude - spread / 2 + i * step;
        const lng = longitude - spread / 2 + j * step;

        // Create a temperature pattern (warmer in center, cooler at edges)
        const distanceFromCenter = Math.sqrt(
          Math.pow(i - gridSize / 2, 2) + Math.pow(j - gridSize / 2, 2)
        );
        const maxDistance = Math.sqrt(2 * Math.pow(gridSize / 2, 2));
        const baseTemp = 20 - (distanceFromCenter / maxDistance) * 30;
        const randomVariation = (Math.random() - 0.5) * 5;
        const temperature = baseTemp + randomVariation;

        data.push({ lat, lng, temperature });
      }
    }

    return data;
  }, [latitude, longitude]);

  // Generate sample air quality data around the location
  const airQualityData = useMemo((): AirQualityDataPoint[] => {
    const data: AirQualityDataPoint[] = [];
    const spread = 0.1; // Degrees of lat/lng spread
    const gridSize = 8;
    const step = spread / gridSize;
    const maxAQI = aqiStandard === 'european' ? 100 : 500;

    for (let i = 0; i <= gridSize; i++) {
      for (let j = 0; j <= gridSize; j++) {
        const lat = latitude - spread / 2 + i * step;
        const lng = longitude - spread / 2 + j * step;

        // Create an AQI pattern (higher in center, lower at edges)
        const distanceFromCenter = Math.sqrt(
          Math.pow(i - gridSize / 2, 2) + Math.pow(j - gridSize / 2, 2)
        );
        const maxDistance = Math.sqrt(2 * Math.pow(gridSize / 2, 2));
        const baseAQI = maxAQI * (1 - distanceFromCenter / maxDistance) * 0.7;
        const randomVariation = (Math.random() - 0.5) * (maxAQI * 0.2);
        const aqi = Math.max(0, Math.min(maxAQI, baseAQI + randomVariation));

        data.push({ lat, lng, aqi });
      }
    }

    return data;
  }, [latitude, longitude, aqiStandard]);

  // Format coordinates with proper precision
  const formatCoordinate = (value: number, isLatitude: boolean): string => {
    const direction = isLatitude ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W';
    return `${Math.abs(value).toFixed(4)}° ${direction}`;
  };

  // Convert to DMS (Degrees, Minutes, Seconds) format
  const toDMS = (value: number, isLatitude: boolean): string => {
    const absolute = Math.abs(value);
    const degrees = Math.floor(absolute);
    const minutesDecimal = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesDecimal);
    const seconds = ((minutesDecimal - minutes) * 60).toFixed(1);
    const direction = isLatitude ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W';
    return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
  };

  // Get location context description
  const getLocationContext = (): string => {
    const hemisphere = latitude >= 0 ? 'Northern' : 'Southern';
    const direction = longitude >= 0 ? 'east' : 'west';
    return t(
      'weather:coordinates.locationContext',
      `Located in the ${hemisphere} hemisphere, ${direction} of the Prime Meridian`,
      { hemisphere, direction }
    );
  };

  // Generate sample weather data around the location for tooltips
  const weatherTooltipData = useMemo((): WeatherDataPoint[] => {
    const data: WeatherDataPoint[] = [];
    const spread = 0.15; // Degrees of lat/lng spread
    const count = 12;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI;
      const distance = 0.03 + Math.random() * spread;
      const lat = latitude + distance * Math.cos(angle);
      const lng = longitude + distance * Math.sin(angle);

      // Generate realistic weather data
      const baseTemp = 20 + Math.random() * 10;
      const temperature = baseTemp + (Math.random() - 0.5) * 5;
      const humidity = 50 + Math.random() * 30;
      const windSpeed = Math.random() * 12;
      const windDirection = Math.random() * 360;
      const pressure = 1000 + Math.random() * 30;

      data.push({
        lat,
        lng,
        temperature,
        humidity,
        windSpeed,
        windDirection,
        pressure,
        feelsLike: temperature + (humidity > 70 ? 2 : -1),
        condition: temperature > 25 ? 'Warm' : temperature > 15 ? 'Mild' : 'Cool',
        locationName: `Area ${i + 1}`,
      });
    }

    return data;
  }, [latitude, longitude]);

  // Overlay info for indicator
  const overlays: OverlayInfo[] = [
    ...(showTempHeatmap
      ? [
          {
            id: 'temperature',
            name: 'Temperature',
            icon: '🌡️',
            color: '#FF8C00',
            active: true,
            opacity: heatmapOpacity,
          },
        ]
      : []),
    ...(showAQIHeatmap
      ? [
          {
            id: 'airQuality',
            name: `Air Quality (${aqiStandard === 'european' ? 'EU' : 'US'})`,
            icon: '🌫️',
            color: '#8B5CF6',
            active: true,
            opacity: heatmapOpacity,
          },
        ]
      : []),
    ...(showWeatherTooltips
      ? [
          {
            id: 'weather',
            name: 'Weather Data',
            icon: '💬',
            color: '#10B981',
            active: true,
            opacity: 1,
          },
        ]
      : []),
  ];

  // Theme-aware styles
  const isDark = theme.isDark;
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryTextColor = isDark ? 'text-gray-300' : 'text-gray-600';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('weather:labels.coordinates', 'Coordinates')}
      size="lg"
      ariaLabel="Location coordinates map modal"
    >
      <div className="space-y-6">
        {/* Location Header */}
        {location && (location.city || location.country) && (
          <div className={`${cardBg} rounded-lg p-4 border ${borderColor}`}>
            <div className="flex items-center space-x-3">
              <span className="text-3xl">📍</span>
              <div>
                <h3 className={`text-xl font-bold ${textColor}`}>
                  {location.city}
                  {location.city && location.country && ', '}
                  {location.country}
                </h3>
                <p className={`text-sm ${secondaryTextColor} mt-1`}>{getLocationContext()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions: Share */}
        <div
          className={`${cardBg} rounded-lg p-3 border ${borderColor} flex items-center justify-between`}
        >
          {/* Live region for screen readers */}
          <span className="sr-only" role="status" aria-live="assertive">
            {shareFeedback || ''}
          </span>

          <div className="flex items-center gap-3 ml-auto">
            {shareFeedback && (
              <span className={`text-xs ${secondaryTextColor}`}>{shareFeedback}</span>
            )}
            <button
              type="button"
              onClick={() => {
                void handleShare();
              }}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border ${borderColor} ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-white hover:bg-gray-50 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              aria-label="Share location"
              title="Share via device or copy link"
            >
              <span aria-hidden>📤</span>
              <span className="text-sm font-medium">Share</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border ${borderColor} ${isDark ? 'bg-green-700 hover:bg-green-600 text-gray-100' : 'bg-green-50 hover:bg-green-100 text-green-800'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
              aria-label="Share location to WhatsApp"
              title="Share to WhatsApp"
            >
              <span aria-hidden>🟢</span>
              <span className="text-sm font-medium">WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Map Controls */}
        <div className={`${cardBg} rounded-lg p-4 border ${borderColor} mb-4 space-y-3`}>
          {/* Temperature Heatmap Control */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={showTempHeatmap}
                onCheckedChange={setShowTempHeatmap}
                label="Temperature Heatmap"
                size="sm"
              />
            </div>
            <span className="text-xl">🌡️</span>
          </div>

          {/* Air Quality Heatmap Control */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={showAQIHeatmap}
                onCheckedChange={setShowAQIHeatmap}
                label="Air Quality Heatmap"
                size="sm"
              />
              {showAQIHeatmap && (
                <select
                  value={aqiStandard}
                  onChange={e => setAqiStandard(e.target.value as AQIStandard)}
                  className={`text-xs px-2 py-1 rounded border ${borderColor} ${cardBg} ${textColor}`}
                >
                  <option value="european">EU</option>
                  <option value="us">US</option>
                </select>
              )}
            </div>
            <span className="text-xl">🌫️</span>
          </div>

          {/* Weather Tooltips Control */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={showWeatherTooltips}
                onCheckedChange={setShowWeatherTooltips}
                label="Weather Tooltips"
                size="sm"
              />
              {showWeatherTooltips && (
                <div className="ml-2">
                  <Checkbox
                    checked={showWeatherMarkers}
                    onCheckedChange={setShowWeatherMarkers}
                    label="Markers"
                    size="xs"
                  />
                </div>
              )}
            </div>
            <span className="text-xl">💬</span>
          </div>

          {/* Show Legend Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={showLegend}
                onCheckedChange={setShowLegend}
                label="Show Legend"
                size="sm"
              />
            </div>
            <span className="text-xl">📊</span>
          </div>

          {/* Shared Opacity Control */}
          {(showTempHeatmap || showAQIHeatmap) && (
            <div className="flex items-center space-x-3 pt-2 border-t border-gray-300 dark:border-gray-600">
              <span className={`text-xs ${secondaryTextColor} whitespace-nowrap`}>Opacity:</span>
              <input
                type="range"
                min="0.2"
                max="1"
                step="0.1"
                value={heatmapOpacity}
                onChange={e => setHeatmapOpacity(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className={`text-xs ${secondaryTextColor} w-10 text-right`}>
                {(heatmapOpacity * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>

        {/* Interactive Map */}
        <div className="rounded-lg overflow-hidden border-2 border-gray-300 shadow-lg relative">
          <MapContainer
            center={[latitude, longitude]}
            zoom={13}
            style={{ height: '400px', width: '100%' }}
            scrollWheelZoom={true}
            doubleClickZoom={true}
            dragging={true}
            zoomControl={true}
          >
            {/* Enhanced Zoom and Pan Controls */}
            <MapZoomPanControls
              minZoom={3}
              maxZoom={18}
              smoothZoom={true}
              inertia={true}
              inertiaDeceleration={3000}
              bounceAtZoomLimits={true}
              onZoomChange={zoom => {
                setCurrentZoom(zoom);
                setZoomLimitReached(null);
              }}
              onLimitReached={type => {
                setZoomLimitReached(type);
                setTimeout(() => setZoomLimitReached(null), 2000);
              }}
              showLimitFeedback={true}
            />

            {/* Base Tile Layer */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              maxZoom={18}
            />

            {/* Temperature Heatmap Layer */}
            {showTempHeatmap && (
              <TemperatureHeatmapLayer
                data={temperatureData}
                opacity={heatmapOpacity}
                radius={30}
                blur={20}
                minTemperature={-10}
                maxTemperature={30}
              />
            )}

            {/* Air Quality Heatmap Layer */}
            {showAQIHeatmap && (
              <AirQualityHeatmapLayer
                data={airQualityData}
                standard={aqiStandard}
                opacity={heatmapOpacity}
                radius={35}
                blur={20}
              />
            )}

            {/* Weather Markers */}
            {showWeatherTooltips && showWeatherMarkers && (
              <WeatherMarkers
                data={weatherTooltipData}
                showMarkers={true}
                markerRadius={6}
                colorByTemperature={true}
                showLabels={false}
                opacity={0.7}
              />
            )}

            {/* Weather Tooltips */}
            {showWeatherTooltips && (
              <WeatherTooltip
                data={weatherTooltipData}
                enableHover={true}
                enableTap={true}
                triggerRadius={30}
                showDelay={200}
                hideDelay={100}
              />
            )}

            {/* Map Legends */}
            {showLegend && showTempHeatmap && (
              <MapLegend
                type="temperature"
                position="topRight"
                visible={true}
                collapsible={true}
                temperatureRange={{ min: -10, max: 30, unit: 'C' }}
                showValues={true}
                compact={true}
              />
            )}

            {showLegend && showAQIHeatmap && (
              <MapLegend
                type="airQuality"
                position={showTempHeatmap ? 'bottomRight' : 'topRight'}
                visible={true}
                collapsible={true}
                aqiStandard={aqiStandard}
                showValues={true}
                compact={true}
              />
            )}

            {/* Overlay Indicator */}
            {overlays.length > 0 && (
              <MapOverlayIndicator
                overlays={overlays}
                position="topLeft"
                visible={true}
                showOpacityControls={false}
                compact={true}
              />
            )}

            {/* Location Marker */}
            <Marker position={[latitude, longitude]}>
              <Popup>
                <div className="text-center">
                  <div className="font-semibold text-blue-600 mb-2">
                    {location?.city || 'Location'}
                  </div>
                  <div className="text-sm text-gray-700">
                    <div>{formatCoordinate(latitude, true)}</div>
                    <div>{formatCoordinate(longitude, false)}</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>

          {/* Zoom Level Indicator */}
          <div
            className={`absolute bottom-4 left-4 ${cardBg} rounded-lg px-3 py-2 shadow-lg border ${borderColor} z-[1000]`}
          >
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-semibold ${secondaryTextColor}`}>Zoom:</span>
              <span className={`text-sm font-bold ${textColor}`}>{currentZoom}</span>
              <span className={`text-xs ${secondaryTextColor}`}>(3-18)</span>
            </div>
          </div>

          {/* Zoom/Pan Limit Feedback */}
          {zoomLimitReached && (
            <div
              className={`absolute top-4 left-1/2 transform -translate-x-1/2 ${cardBg} rounded-lg px-4 py-2 shadow-lg border-2 ${
                zoomLimitReached === 'zoom-min'
                  ? 'border-orange-500'
                  : zoomLimitReached === 'zoom-max'
                    ? 'border-blue-500'
                    : 'border-red-500'
              } z-[1000] animate-bounce`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">
                  {zoomLimitReached === 'zoom-min'
                    ? '🔍'
                    : zoomLimitReached === 'zoom-max'
                      ? '🔎'
                      : '🚫'}
                </span>
                <span className={`text-sm font-semibold ${textColor}`}>
                  {zoomLimitReached === 'zoom-min'
                    ? 'Minimum zoom reached'
                    : zoomLimitReached === 'zoom-max'
                      ? 'Maximum zoom reached'
                      : 'Map boundary reached'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Heatmap Legends */}
        {showTempHeatmap && (
          <div className={`${cardBg} rounded-lg p-3 border ${borderColor} mt-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-semibold ${textColor}`}>Temperature Scale</span>
              <span className="text-sm">🌡️</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs ${secondaryTextColor}`}>-10°C</span>
              <div
                className="flex-1 h-4 rounded"
                style={{
                  background:
                    'linear-gradient(to right, rgb(130,22,146), rgb(25,84,166), rgb(58,175,185), rgb(87,213,111), rgb(255,255,0), rgb(255,140,0), rgb(255,0,0))',
                }}
              />
              <span className={`text-xs ${secondaryTextColor}`}>30°C</span>
            </div>
            <p className={`text-xs ${secondaryTextColor} mt-2 italic`}>
              Simulated temperature data for demonstration purposes
            </p>
          </div>
        )}

        {showAQIHeatmap && (
          <div className={`${cardBg} rounded-lg p-3 border ${borderColor} mt-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-semibold ${textColor}`}>
                Air Quality Scale ({aqiStandard === 'european' ? 'European' : 'US'} AQI)
              </span>
              <span className="text-sm">🌫️</span>
            </div>
            <div className="space-y-1">
              {(aqiStandard === 'european'
                ? [
                    { label: 'Good', color: '#50C878', range: '0-20' },
                    { label: 'Fair', color: '#B7D968', range: '20-40' },
                    { label: 'Moderate', color: '#FFD700', range: '40-60' },
                    { label: 'Poor', color: '#FF8C00', range: '60-80' },
                    { label: 'Very Poor', color: '#FF4500', range: '80-100' },
                    { label: 'Extremely Poor', color: '#8B0000', range: '100+' },
                  ]
                : [
                    { label: 'Good', color: '#00E400', range: '0-50' },
                    { label: 'Moderate', color: '#FFFF00', range: '51-100' },
                    { label: 'Unhealthy (Sensitive)', color: '#FF7E00', range: '101-150' },
                    { label: 'Unhealthy', color: '#FF0000', range: '151-200' },
                    { label: 'Very Unhealthy', color: '#8F3F97', range: '201-300' },
                    { label: 'Hazardous', color: '#7E0023', range: '301-500' },
                  ]
              ).map((level, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-6 h-3 rounded" style={{ backgroundColor: level.color }} />
                  <span className={`text-xs ${secondaryTextColor} flex-1`}>{level.label}</span>
                  <span className={`text-xs ${secondaryTextColor}`}>{level.range}</span>
                </div>
              ))}
            </div>
            <p className={`text-xs ${secondaryTextColor} mt-2 italic`}>
              Simulated air quality data for demonstration purposes
            </p>
          </div>
        )}

        {/* Coordinate Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Latitude */}
          <div className={`${cardBg} rounded-lg p-4 border ${borderColor}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${secondaryTextColor}`}>
                {t('weather:coordinates.latitude', 'Latitude')}
              </span>
              <span className="text-2xl">🧭</span>
            </div>
            <div className={`text-2xl font-bold ${textColor} mb-1`}>
              {formatCoordinate(latitude, true)}
            </div>
            <div className={`text-xs ${secondaryTextColor} font-mono`}>{latitude.toFixed(6)}°</div>
          </div>

          {/* Longitude */}
          <div className={`${cardBg} rounded-lg p-4 border ${borderColor}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${secondaryTextColor}`}>
                {t('weather:coordinates.longitude', 'Longitude')}
              </span>
              <span className="text-2xl">🌐</span>
            </div>
            <div className={`text-2xl font-bold ${textColor} mb-1`}>
              {formatCoordinate(longitude, false)}
            </div>
            <div className={`text-xs ${secondaryTextColor} font-mono`}>{longitude.toFixed(6)}°</div>
          </div>
        </div>

        {/* Alternative Formats */}
        <div className={`${cardBg} rounded-lg p-4 border ${borderColor}`}>
          <h4 className={`text-sm font-semibold ${textColor} mb-3 flex items-center`}>
            <span className="mr-2">📐</span>
            {t('weather:coordinates.alternativeFormats', 'Alternative Formats')}
          </h4>
          <div className="space-y-3">
            {/* Decimal Degrees */}
            <div>
              <span className={`text-xs font-medium ${secondaryTextColor}`}>
                Decimal Degrees (DD):
              </span>
              <div className={`text-sm font-mono ${textColor} mt-1`}>
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </div>
            </div>

            {/* Degrees, Minutes, Seconds */}
            <div>
              <span className={`text-xs font-medium ${secondaryTextColor}`}>
                Degrees, Minutes, Seconds (DMS):
              </span>
              <div className={`text-sm font-mono ${textColor} mt-1`}>
                {toDMS(latitude, true)}, {toDMS(longitude, false)}
              </div>
            </div>

            {/* Precision Info */}
            <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
              <div className="flex items-start space-x-2">
                <CheckIcon className="h-4 w-4" />
                <span className={`text-xs ${secondaryTextColor}`}>
                  {t('weather:coordinates.precisionDescription', 'Accurate to ~11 meters')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Map Info */}
        <div className={`text-xs ${secondaryTextColor} text-center italic`}>
          {t(
            'weather:coordinates.mapInfo',
            'Click and drag to explore the map. Scroll to zoom in and out.'
          )}
        </div>
      </div>
    </AccessibleModal>
  );
};

export default CoordinatesMapModal;
