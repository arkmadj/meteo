/**
 * City and Date Information Component
 * A revamped component matching Header UI aesthetics with glass morphism,
 * blue accents, rounded corners, and modern styling
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/design-system/theme';
import { useDateI18n } from '@/i18n/hooks/useDateI18n';

export interface CityDateInfoProps {
  /** City name */
  city: string;
  /** Country name */
  country: string;
  /** Current date (optional, defaults to current date) */
  date?: Date | string;
  /** Timezone for date formatting */
  timezone?: string;
  /** Component variant */
  variant?: 'default' | 'compact' | 'detailed';
  /** Show additional location info */
  showLocationDetails?: boolean;
  /** Show time information */
  showTime?: boolean;
  /** Custom className */
  className?: string;
  /** Coordinates for detailed view */
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  /** Last updated timestamp */
  lastUpdated?: Date | string;
}

const CityDateInfo: React.FC<CityDateInfoProps> = ({
  city,
  country,
  date,
  timezone,
  variant = 'default',
  showLocationDetails = false,
  showTime = false,
  className = '',
  coordinates,
  lastUpdated,
}) => {
  const { t: _t } = useTranslation(['common', 'weather']);
  const { formatDate, formatWeekday: _formatWeekday } = useDateI18n();
  const { theme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute if showTime is enabled
  useEffect(() => {
    if (!showTime) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [showTime]);

  // Get the display date
  const displayDate = date ? (typeof date === 'string' ? new Date(date) : date) : new Date();

  // Format date based on variant
  const getFormattedDate = () => {
    switch (variant) {
      case 'compact':
        return formatDate(displayDate, 'short');
      case 'detailed':
        return formatDate(displayDate, 'long');
      default:
        return formatDate(displayDate, 'long');
    }
  };

  // Format time
  const getFormattedTime = () => {
    if (!showTime) return null;
    return formatDate(currentTime, 'time');
  };

  // Get variant-specific styling with theme awareness
  const getVariantStyles = () => {
    const baseStyles = [
      'bg-[var(--theme-surface)]/95',
      'backdrop-blur-sm',
      'border',
      'border-[var(--theme-border)]',
      'rounded-xl',
      'shadow-[0_1px_3px_var(--theme-shadow)]',
      'hover:shadow-[0_4px_12px_var(--theme-shadow)]',
      'transition-all',
      'duration-200',
      'ease-in-out',
    ];

    switch (variant) {
      case 'compact':
        return [...baseStyles, 'px-4', 'py-3', 'text-center'].join(' ');
      case 'detailed':
        return [...baseStyles, 'px-6', 'py-5', 'space-y-3'].join(' ');
      default:
        return [...baseStyles, 'px-5', 'py-4', 'text-center'].join(' ');
    }
  };

  // Render location icon with theme awareness
  const renderLocationIcon = () => (
    <div className="inline-flex items-center justify-center w-8 h-8 bg-[var(--theme-primary)]/10 rounded-full mr-3">
      <svg
        className="w-4 h-4 text-[var(--theme-primary)]"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );

  // Render time icon with theme awareness
  const renderTimeIcon = () => (
    <div className="inline-flex items-center justify-center w-6 h-6 bg-[var(--theme-primary)]/10 rounded-full mr-2">
      <svg
        className="w-3 h-3 text-[var(--theme-primary)]"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    </div>
  );

  // Render compact variant with theme awareness
  const renderCompact = () => (
    <div className="flex items-center justify-center">
      {renderLocationIcon()}
      <div className="text-left">
        <h2 className="text-lg font-semibold text-[var(--theme-text)] leading-tight">
          {city}
          <span className="text-[var(--theme-text-secondary)] font-normal ml-1">
            {country && `, ${country}`}
          </span>
        </h2>
        <div className="flex items-center text-sm text-[var(--theme-text-secondary)] mt-1">
          <span>{getFormattedDate()}</span>
          {showTime && (
            <>
              <span className="mx-2">•</span>
              <span>{getFormattedTime()}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Render default variant with theme awareness
  const renderDefault = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-center">
        {renderLocationIcon()}
        <h2 className="text-xl font-bold text-[var(--theme-text)]">
          {city}
          {country && (
            <span className="text-[var(--theme-text-secondary)] font-medium ml-1">, {country}</span>
          )}
        </h2>
      </div>
      <div className="flex items-center justify-center text-[var(--theme-text-secondary)]">
        <span className="text-sm">{getFormattedDate()}</span>
        {showTime && (
          <div className="flex items-center ml-4">
            {renderTimeIcon()}
            <span className="text-sm">{getFormattedTime()}</span>
          </div>
        )}
      </div>
    </div>
  );

  // Render detailed variant with theme awareness
  const renderDetailed = () => (
    <div className="space-y-4">
      {/* Main location info */}
      <div className="flex items-start">
        {renderLocationIcon()}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-[var(--theme-text)] leading-tight">{city}</h2>
          {country && <p className="text-lg text-[var(--theme-text-secondary)] mt-1">{country}</p>}
        </div>
      </div>

      {/* Date and time info */}
      <div className="border-t border-[var(--theme-border)] pt-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center w-6 h-6 bg-[var(--theme-primary)]/10 rounded-full mr-2">
              <svg
                className="w-3 h-3 text-[var(--theme-primary)]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <rect height="18" rx="2" ry="2" width="18" x="3" y="4" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
            </div>
            <span className="text-sm text-[var(--theme-text-secondary)]">{getFormattedDate()}</span>
          </div>
          {showTime && (
            <div className="flex items-center">
              {renderTimeIcon()}
              <span className="text-sm text-[var(--theme-text-secondary)]">
                {getFormattedTime()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Additional details */}
      {showLocationDetails && (
        <div className="border-t border-[var(--theme-border)] pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[var(--theme-text-secondary)]">
            {coordinates && (
              <div>
                <span className="font-medium">Coordinates:</span>
                <br />
                <span>
                  {coordinates.latitude.toFixed(4)}°, {coordinates.longitude.toFixed(4)}°
                </span>
              </div>
            )}
            {timezone && (
              <div>
                <span className="font-medium">Timezone:</span>
                <br />
                <span>{timezone}</span>
              </div>
            )}
            {lastUpdated && (
              <div className="sm:col-span-2">
                <span className="font-medium">Last updated:</span>
                <br />
                <span>
                  {formatDate(
                    typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated,
                    'time'
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Render based on variant
  const renderContent = () => {
    switch (variant) {
      case 'compact':
        return renderCompact();
      case 'detailed':
        return renderDetailed();
      default:
        return renderDefault();
    }
  };

  return <div className={`${getVariantStyles()} ${className}`}>{renderContent()}</div>;
};

export default CityDateInfo;
