/**
 * ShareButton Component
 * A reusable share button that integrates with weather cards
 * Supports both native share and modal-based sharing
 */

import React, { useState } from 'react';

import ShareWeatherModal from './ShareWeatherModal';
import { useTheme } from '@/design-system/theme';
import type { ShareableWeatherData } from '@/types/socialShare';

export type ShareButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon';
export type ShareButtonSize = 'sm' | 'md' | 'lg';

export interface ShareButtonProps {
  /** Weather data to share */
  weatherData: ShareableWeatherData | null;
  /** Button variant */
  variant?: ShareButtonVariant;
  /** Button size */
  size?: ShareButtonSize;
  /** Show label text */
  showLabel?: boolean;
  /** Custom label text */
  label?: string;
  /** Temperature unit */
  temperatureUnit?: 'C' | 'F';
  /** Localization function for temperature */
  getLocalizedTemperature?: (temp: number) => string;
  /** Custom class name */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  weatherData,
  variant = 'primary',
  size = 'md',
  showLabel = true,
  label = 'Share',
  temperatureUnit = 'C',
  getLocalizedTemperature,
  className = '',
  disabled = false,
}) => {
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    if (weatherData) {
      setIsModalOpen(true);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.accentColor,
          color: '#ffffff',
          border: 'none',
        };
      case 'secondary':
        return {
          backgroundColor: theme.isDark ? '#374151' : '#e5e7eb',
          color: theme.isDark ? '#f3f4f6' : '#1f2937',
          border: 'none',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: theme.isDark ? '#f3f4f6' : '#1f2937',
          border: `1px solid ${theme.isDark ? '#4b5563' : '#d1d5db'}`,
        };
      case 'icon':
        return {
          backgroundColor: 'transparent',
          color: theme.isDark ? '#9ca3af' : '#6b7280',
          border: 'none',
        };
      default:
        return {};
    }
  };

  const ShareIcon = () => (
    <svg
      className={iconSizes[size]}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  );

  const isDisabled = disabled || !weatherData;
  const buttonTitle = weatherData ? 'Share weather' : 'No weather data to share';

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center rounded-lg font-medium
          transition-all duration-200 ease-in-out
          hover:opacity-90 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${variant === 'icon' ? 'p-2' : sizeClasses[size]}
          ${className}
        `}
        style={{
          ...getVariantStyles(),
          outlineColor: theme.accentColor,
        }}
        title={buttonTitle}
        aria-label={label}
      >
        <ShareIcon />
        {showLabel && variant !== 'icon' && <span>{label}</span>}
      </button>

      <ShareWeatherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        weatherData={weatherData}
        temperatureUnit={temperatureUnit}
        getLocalizedTemperature={getLocalizedTemperature}
      />
    </>
  );
};

export default ShareButton;
