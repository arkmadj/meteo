/**
 * ShareWeatherModal Component
 * Modal for sharing weather cards to social media platforms
 */

import React, { useState } from 'react';

import Modal from '@/components/ui/navigation/Modal';
import ShareableWeatherCard from './ShareableWeatherCard';
import { useTheme } from '@/design-system/theme';
import { useWeatherShare } from '@/hooks/useWeatherShare';
import type {
  ShareableWeatherData,
  ShareCardConfig,
  ShareCardLayout,
  ShareCardTheme,
  SocialPlatform,
} from '@/types/socialShare';
import { DEFAULT_SHARE_CARD_CONFIG, SOCIAL_PLATFORMS } from '@/types/socialShare';

export interface ShareWeatherModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Weather data to share */
  weatherData: ShareableWeatherData | null;
  /** Temperature unit */
  temperatureUnit?: 'C' | 'F';
  /** Localization function for temperature */
  getLocalizedTemperature?: (temp: number) => string;
}

const SOCIAL_BUTTONS: SocialPlatform[] = [
  'twitter',
  'facebook',
  'whatsapp',
  'telegram',
  'linkedin',
  'email',
  'copy',
];

const LAYOUT_OPTIONS: { value: ShareCardLayout; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'standard', label: 'Standard' },
  { value: 'detailed', label: 'Detailed' },
];

const THEME_OPTIONS: { value: ShareCardTheme; label: string }[] = [
  { value: 'weather-adaptive', label: 'Weather' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'gradient', label: 'Gradient' },
];

const ShareWeatherModal: React.FC<ShareWeatherModalProps> = ({
  isOpen,
  onClose,
  weatherData,
  temperatureUnit = 'C',
  getLocalizedTemperature,
}) => {
  const { theme } = useTheme();
  const [cardConfig, setCardConfig] = useState<ShareCardConfig>(DEFAULT_SHARE_CARD_CONFIG);

  const { share, shareNative, copyUrl, isSharing, supportsNative, cardRef } = useWeatherShare({
    weatherData,
    config: cardConfig,
  });

  const handleShare = async (platform: SocialPlatform) => {
    await share(platform);
  };

  const handleNativeShare = async () => {
    await shareNative();
  };

  const getPlatformIcon = (platform: SocialPlatform): React.ReactNode => {
    const icons: Record<SocialPlatform, string> = {
      twitter: '𝕏',
      facebook: 'f',
      linkedin: 'in',
      whatsapp: '📱',
      telegram: '✈️',
      email: '✉️',
      pinterest: '📌',
      copy: '📋',
    };
    return icons[platform];
  };

  const cardBg = theme.isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = theme.isDark ? 'text-gray-100' : 'text-gray-900';
  const subTextColor = theme.isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = theme.isDark ? 'border-gray-700' : 'border-gray-200';

  if (!weatherData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Weather" size="lg">
      <div className={`${cardBg} ${textColor}`}>
        {/* Preview */}
        <div className="mb-6">
          <h3 className={`text-sm font-medium ${subTextColor} mb-3`}>Preview</h3>
          <div className="flex justify-center">
            <ShareableWeatherCard
              ref={cardRef}
              data={weatherData}
              config={cardConfig}
              temperatureUnit={temperatureUnit}
              getLocalizedTemperature={getLocalizedTemperature}
              className="max-w-sm"
            />
          </div>
        </div>

        {/* Layout & Theme Options */}
        <div className={`grid grid-cols-2 gap-4 mb-6 pb-6 border-b ${borderColor}`}>
          <div>
            <label className={`text-sm font-medium ${subTextColor} block mb-2`}>Layout</label>
            <select
              value={cardConfig.layout}
              onChange={e =>
                setCardConfig(c => ({ ...c, layout: e.target.value as ShareCardLayout }))
              }
              className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${cardBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {LAYOUT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`text-sm font-medium ${subTextColor} block mb-2`}>Theme</label>
            <select
              value={cardConfig.theme}
              onChange={e =>
                setCardConfig(c => ({ ...c, theme: e.target.value as ShareCardTheme }))
              }
              className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${cardBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {THEME_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Native Share (if supported) */}
        {supportsNative && (
          <button
            onClick={handleNativeShare}
            disabled={isSharing}
            className="w-full py-3 px-4 mb-4 rounded-lg font-medium text-white transition-all duration-200 disabled:opacity-50"
            style={{ backgroundColor: theme.accentColor }}
          >
            {isSharing ? 'Sharing...' : '📤 Share'}
          </button>
        )}

        {/* Social Platform Buttons */}
        <div>
          <h3 className={`text-sm font-medium ${subTextColor} mb-3`}>Share to</h3>
          <div className="grid grid-cols-4 gap-3">
            {SOCIAL_BUTTONS.map(platform => {
              const config = SOCIAL_PLATFORMS[platform];
              return (
                <button
                  key={platform}
                  onClick={() => handleShare(platform)}
                  disabled={isSharing}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border ${borderColor} transition-all duration-200 hover:scale-105 disabled:opacity-50`}
                  style={{
                    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  }}
                  title={config.name}
                >
                  <span
                    className="text-xl w-10 h-10 flex items-center justify-center rounded-full mb-1"
                    style={{ backgroundColor: config.color, color: '#fff' }}
                  >
                    {getPlatformIcon(platform)}
                  </span>
                  <span className={`text-xs ${subTextColor}`}>{config.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Copy URL Button */}
        <button
          onClick={copyUrl}
          disabled={isSharing}
          className={`w-full mt-4 py-2 px-4 rounded-lg border ${borderColor} ${subTextColor} text-sm transition-all duration-200 hover:bg-opacity-10 disabled:opacity-50`}
        >
          📋 Copy Link
        </button>
      </div>
    </Modal>
  );
};

export default ShareWeatherModal;
