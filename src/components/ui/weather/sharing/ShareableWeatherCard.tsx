/**
 * ShareableWeatherCard Component
 * A styled weather card optimized for social media sharing
 * Supports various layouts and themes for different platforms
 */

import { forwardRef, useMemo } from 'react';

import { useTheme } from '@/design-system/theme';
import type { ShareableWeatherData, ShareCardConfig, ShareCardTheme } from '@/types/socialShare';
import { DEFAULT_SHARE_CARD_CONFIG } from '@/types/socialShare';
import { getWeatherEmoji } from '@/utils/socialShare';

export interface ShareableWeatherCardProps {
  /** Weather data to display */
  data: ShareableWeatherData;
  /** Card configuration */
  config?: Partial<ShareCardConfig>;
  /** Temperature unit */
  temperatureUnit?: 'C' | 'F';
  /** Custom class name */
  className?: string;
  /** Localization function for temperature */
  getLocalizedTemperature?: (temp: number) => string;
}

/**
 * Get background gradient based on weather and theme
 */
function getBackgroundGradient(
  weatherCode: number,
  themeType: ShareCardTheme,
  isDark: boolean
): string {
  if (themeType === 'light') {
    return 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
  }
  if (themeType === 'dark') {
    return 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
  }
  if (themeType === 'gradient') {
    return isDark
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)';
  }
  // weather-adaptive
  if (weatherCode === 0) {
    return isDark
      ? 'linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)'
      : 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)';
  }
  if (weatherCode <= 3) {
    return isDark
      ? 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)'
      : 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)';
  }
  if (weatherCode <= 48) {
    return 'linear-gradient(135deg, #636e72 0%, #2d3436 100%)';
  }
  if (weatherCode <= 67) {
    return isDark
      ? 'linear-gradient(135deg, #1e3d59 0%, #0d1b2a 100%)'
      : 'linear-gradient(135deg, #6c5ce7 0%, #74b9ff 100%)';
  }
  if (weatherCode <= 77) {
    return 'linear-gradient(135deg, #dfe6e9 0%, #b2bec3 100%)';
  }
  return 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)';
}

/**
 * Get text color based on theme
 */
function getTextColor(themeType: ShareCardTheme, _isDark: boolean): string {
  if (themeType === 'light') return '#1f2937';
  if (themeType === 'dark') return '#f3f4f6';
  return '#ffffff';
}

const ShareableWeatherCard = forwardRef<HTMLDivElement, ShareableWeatherCardProps>(
  (
    { data, config: userConfig, temperatureUnit = 'C', className = '', getLocalizedTemperature },
    ref
  ) => {
    const { theme } = useTheme();
    const config: ShareCardConfig = { ...DEFAULT_SHARE_CARD_CONFIG, ...userConfig };

    const { current, forecast: _forecast } = data;
    const weatherCode = current.condition.code;

    const background = useMemo(
      () => getBackgroundGradient(weatherCode, config.theme, theme.isDark),
      [weatherCode, config.theme, theme.isDark]
    );

    const textColor = useMemo(
      () => getTextColor(config.theme, theme.isDark),
      [config.theme, theme.isDark]
    );

    const formatTemp = (temp: number): string => {
      if (getLocalizedTemperature) return getLocalizedTemperature(temp);
      const value = temperatureUnit === 'F' ? (temp * 9) / 5 + 32 : temp;
      return `${Math.round(value)}°${temperatureUnit}`;
    };

    const location = current.country ? `${current.city}, ${current.country}` : current.city;

    const emoji = getWeatherEmoji(weatherCode);
    const timestamp = new Date().toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    const renderCompactLayout = () => (
      <div className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm opacity-80">{location}</p>
          <p className="text-4xl font-bold">{formatTemp(current.temperature.current)}</p>
        </div>
        <div className="text-5xl">{emoji}</div>
      </div>
    );

    const renderStandardLayout = () => (
      <div className="p-6 text-center">
        <p className="text-lg opacity-90 mb-2">{location}</p>
        <div className="text-6xl mb-4">{emoji}</div>
        <p className="text-5xl font-bold mb-2">{formatTemp(current.temperature.current)}</p>
        <p className="text-lg opacity-80">{current.condition.description}</p>
        <div className="flex justify-center gap-6 mt-4 text-sm opacity-80">
          <span>💧 {current.humidity}%</span>
          <span>💨 {Math.round(current.wind.speed)} km/h</span>
        </div>
        {config.showTimestamp && <p className="text-xs opacity-60 mt-4">{timestamp}</p>}
      </div>
    );

    const renderDetailedLayout = () => (
      <div className="p-6">
        <div className="text-center mb-4">
          <p className="text-lg opacity-90">{location}</p>
          {config.showTimestamp && <p className="text-xs opacity-60">{timestamp}</p>}
        </div>
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="text-6xl">{emoji}</span>
          <div>
            <p className="text-5xl font-bold">{formatTemp(current.temperature.current)}</p>
            <p className="opacity-80">{current.condition.description}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white bg-opacity-10 rounded-lg p-3 text-center">
            <p className="opacity-60">Feels Like</p>
            <p className="font-semibold">
              {formatTemp(current.temperature.feels_like || current.temperature.current)}
            </p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3 text-center">
            <p className="opacity-60">Humidity</p>
            <p className="font-semibold">{current.humidity}%</p>
          </div>
        </div>
      </div>
    );

    const renderContent = () => {
      switch (config.layout) {
        case 'compact':
          return renderCompactLayout();
        case 'detailed':
          return renderDetailedLayout();
        default:
          return renderStandardLayout();
      }
    };
    return (
      <div
        ref={ref}
        className={`rounded-2xl overflow-hidden shadow-2xl ${className}`}
        style={{ background, color: textColor, minWidth: 280 }}
      >
        {renderContent()}
        {config.showAppName && (
          <div className="px-4 py-2 bg-black bg-opacity-20 text-center text-xs opacity-70">
            {config.customBranding?.appName || 'Weather App'}
          </div>
        )}
      </div>
    );
  }
);

ShareableWeatherCard.displayName = 'ShareableWeatherCard';

export default ShareableWeatherCard;
