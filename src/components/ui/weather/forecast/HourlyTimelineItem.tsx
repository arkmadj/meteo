/**
 * HourlyTimelineItem Component
 * Individual item in the hourly forecast timeline
 * Shows temperature, weather condition, and key metrics for a single hour
 */

import React from 'react';
import ReactAnimatedWeather from 'react-animated-weather';

import { useTheme } from '@/design-system/theme';
import { usePrefersReducedMotion } from '@/hooks/useMotion';
import type { HourlyForecastItem } from '@/types/weather';

export interface HourlyTimelineItemProps {
  /** Hourly forecast data */
  hour: HourlyForecastItem;
  /** Whether this item is currently selected */
  isSelected?: boolean;
  /** Whether this is the current hour */
  isCurrentHour?: boolean;
  /** Temperature unit */
  temperatureUnit: 'C' | 'F';
  /** Temperature formatter function */
  getLocalizedTemperature: (temp: number) => string;
  /** Click handler */
  onClick?: () => void;
  /** Animation delay for staggered entrance */
  animationDelay?: number;
  /** Compact display mode */
  compact?: boolean;
}

const HourlyTimelineItem: React.FC<HourlyTimelineItemProps> = ({
  hour,
  isSelected = false,
  isCurrentHour = false,
  temperatureUnit,
  getLocalizedTemperature,
  onClick,
  animationDelay = 0,
  compact = false,
}) => {
  const { theme } = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Format the time
  const formatTime = (isoTime: string): string => {
    const date = new Date(isoTime);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Get precipitation display
  const getPrecipitationDisplay = (): string => {
    if (hour.precipitationProbability > 0) {
      return `${hour.precipitationProbability}%`;
    }
    return '';
  };

  // Determine icon color based on theme and selection
  const iconColor = isSelected
    ? 'var(--theme-accent, #3b82f6)'
    : theme.isDark
      ? '#9CA3AF'
      : '#374151';

  // Icon size based on compact mode
  const iconSize = compact ? 28 : 36;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative flex flex-col items-center px-3 py-4 rounded-xl transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent,#3b82f6)] focus:ring-offset-2 h-full
        ${compact ? 'min-w-[70px]' : 'min-w-[90px]'}
        ${
          isSelected
            ? 'bg-[var(--theme-accent,#3b82f6)]/10 border-2 border-[var(--theme-accent,#3b82f6)] shadow-lg scale-105'
            : 'bg-[var(--theme-surface)] border border-[var(--theme-border)] hover:border-[var(--theme-accent,#3b82f6)]/50 hover:shadow-md hover:scale-102'
        }
        ${isCurrentHour ? 'ring-2 ring-[var(--theme-semantic-success,#10b981)]' : ''}
      `}
      style={{
        animationDelay: prefersReducedMotion ? '0ms' : `${animationDelay}ms`,
      }}
      aria-pressed={isSelected}
      aria-label={`Weather at ${formatTime(hour.time)}: ${getLocalizedTemperature(hour.temperature)} ${temperatureUnit}, ${hour.condition.description}`}
    >
      {/* Current hour indicator */}
      {isCurrentHour && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[var(--theme-semantic-success,#10b981)] text-white text-[10px] font-semibold rounded-full">
          Now
        </div>
      )}

      {/* Time */}
      <span
        className={`
          font-medium mb-2
          ${compact ? 'text-xs' : 'text-sm'}
          ${isSelected ? 'text-[var(--theme-accent,#3b82f6)]' : 'text-[var(--theme-text-secondary)]'}
        `}
      >
        {isCurrentHour ? 'Now' : formatTime(hour.time)}
      </span>

      {/* Weather Icon */}
      <div className="relative my-1">
        <ReactAnimatedWeather
          animate={!prefersReducedMotion && isSelected}
          color={iconColor}
          icon={hour.condition.icon as any}
          size={iconSize}
        />
        {/* Precipitation indicator */}
        {hour.precipitationProbability > 0 && (
          <div
            className={`
              absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full
              ${compact ? 'text-[8px] px-1' : 'text-[10px] px-1.5 py-0.5'}
              font-bold
            `}
          >
            💧
          </div>
        )}
      </div>

      {/* Temperature */}
      <span
        className={`
          font-bold mt-1
          ${compact ? 'text-base' : 'text-lg'}
          ${isSelected ? 'text-[var(--theme-accent,#3b82f6)]' : 'text-[var(--theme-text)]'}
        `}
      >
        {getLocalizedTemperature(hour.temperature).replace(/[°CF]/g, '')}°
      </span>

      {/* Precipitation probability (if any) */}
      {getPrecipitationDisplay() && (
        <span className="text-xs text-blue-500 font-medium mt-1">
          💧 {getPrecipitationDisplay()}
        </span>
      )}

      {/* Day/Night indicator */}
      {!compact && (
        <div className="mt-2 text-xs text-[var(--theme-text-secondary)]">
          {hour.isDay ? '☀️' : '🌙'}
        </div>
      )}
    </button>
  );
};

export default HourlyTimelineItem;
