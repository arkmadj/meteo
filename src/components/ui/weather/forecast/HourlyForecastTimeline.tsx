/**
 * HourlyForecastTimeline Component
 * Interactive horizontal timeline for hour-by-hour weather forecasts
 * Features: horizontal scrolling, item selection, detailed view panel
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactAnimatedWeather from 'react-animated-weather';
import { useTranslation } from 'react-i18next';

import { Card, CardBody, CardHeader } from '@/components/ui/atoms';
import { useTheme } from '@/design-system/theme';
import { usePrefersReducedMotion } from '@/hooks/useMotion';
import type { HourlyForecastItem } from '@/types/weather';
import HourlyTimelineItem from './HourlyTimelineItem';

export interface HourlyForecastTimelineProps {
  /** Array of hourly forecast data */
  hours: HourlyForecastItem[];
  /** Temperature unit */
  temperatureUnit: 'C' | 'F';
  /** Temperature formatter function */
  getLocalizedTemperature: (temp: number) => string;
  /** Weather description formatter */
  getLocalizedWeatherDescription: (code: number) => string;
  /** Optional sunrise time (ISO string) */
  sunrise?: string;
  /** Optional sunset time (ISO string) */
  sunset?: string;
  /** Compact mode for smaller displays */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Number of hours to display (default: 24) */
  hoursToShow?: number;
}

const HourlyForecastTimeline: React.FC<HourlyForecastTimelineProps> = ({
  hours,
  temperatureUnit,
  getLocalizedTemperature,
  getLocalizedWeatherDescription,
  sunrise,
  sunset,
  compact = false,
  className = '',
  hoursToShow = 24,
}) => {
  const { t } = useTranslation(['weather', 'common']);
  const { theme } = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Limit hours to display
  const displayHours = useMemo(() => hours.slice(0, hoursToShow), [hours, hoursToShow]);

  // Get current hour index
  const currentHourIndex = useMemo(() => {
    const now = new Date();
    return displayHours.findIndex(h => {
      const hourDate = new Date(h.time);
      return hourDate.getHours() === now.getHours() && hourDate.getDate() === now.getDate();
    });
  }, [displayHours]);

  // Selected hour data
  const selectedHour = displayHours[selectedIndex] || displayHours[0];

  // Update scroll button states
  const updateScrollButtons = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
    }
  }, []);

  // Handle scroll
  const handleScroll = useCallback((direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  // Scroll to current hour on mount
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && currentHourIndex >= 0) {
      const itemWidth = compact ? 76 : 96;
      const targetScroll = Math.max(
        0,
        currentHourIndex * itemWidth - container.clientWidth / 2 + itemWidth / 2
      );
      container.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  }, [currentHourIndex, compact]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollButtons);
      updateScrollButtons();
      return () => container.removeEventListener('scroll', updateScrollButtons);
    }
  }, [updateScrollButtons]);

  // Format time for display
  const formatDetailTime = (isoTime: string): string => {
    const date = new Date(isoTime);
    return date.toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Calculate temperature range for chart
  const { minTemp, maxTemp } = useMemo(() => {
    const temps = displayHours.map(h => h.temperature);
    return {
      minTemp: Math.min(...temps),
      maxTemp: Math.max(...temps),
    };
  }, [displayHours]);

  // Get wind direction as compass
  const getWindDirection = (degrees: number): string => {
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

  return (
    <Card className={`${className} overflow-hidden`} shadow="lg">
      <CardHeader className="border-[var(--theme-border)]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-label="Clock">
              🕐
            </span>
            <h2 className="text-xl font-bold text-[var(--theme-text)]">
              {t('weather:hourly.title', 'Hourly Forecast')}
            </h2>
            <span className="text-sm text-[var(--theme-text-secondary)] bg-[var(--theme-surface)] px-2 py-1 rounded-full border border-[var(--theme-border)]">
              {displayHours.length} {t('weather:hourly.hours', 'hours')}
            </span>
          </div>
          {/* Temperature range indicator */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-blue-500">❄️ {getLocalizedTemperature(minTemp)}</span>
            <span className="text-[var(--theme-text-secondary)]">—</span>
            <span className="text-red-500">🔥 {getLocalizedTemperature(maxTemp)}</span>
          </div>
        </div>
      </CardHeader>

      <CardBody className="p-0">
        {/* Timeline Scroll Container */}
        <div className="relative">
          {/* Left scroll button */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[var(--theme-surface)]/95 border border-[var(--theme-border)] shadow-lg flex items-center justify-center text-[var(--theme-text)] hover:bg-[var(--theme-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent,#3b82f6)]"
              aria-label="Scroll left"
            >
              ←
            </button>
          )}

          {/* Scrollable timeline */}
          <div
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto py-4 px-4 scrollbar-thin scrollbar-thumb-[var(--theme-border)] scrollbar-track-transparent"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {displayHours.map((hour, index) => (
              <div key={hour.time} style={{ scrollSnapAlign: 'center' }}>
                <HourlyTimelineItem
                  hour={hour}
                  isSelected={selectedIndex === index}
                  isCurrentHour={currentHourIndex === index}
                  temperatureUnit={temperatureUnit}
                  getLocalizedTemperature={getLocalizedTemperature}
                  onClick={() => setSelectedIndex(index)}
                  animationDelay={index * 50}
                  compact={compact}
                />
              </div>
            ))}
          </div>

          {/* Right scroll button */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[var(--theme-surface)]/95 border border-[var(--theme-border)] shadow-lg flex items-center justify-center text-[var(--theme-text)] hover:bg-[var(--theme-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent,#3b82f6)]"
              aria-label="Scroll right"
            >
              →
            </button>
          )}
        </div>

        {/* Temperature Trend Mini Chart */}
        <div className="px-4 py-3 border-t border-[var(--theme-border)] bg-[var(--theme-surface)]/50">
          <div className="flex items-end justify-between h-16 gap-0.5">
            {displayHours.map((hour, index) => {
              const heightPercent =
                maxTemp !== minTemp
                  ? ((hour.temperature - minTemp) / (maxTemp - minTemp)) * 100
                  : 50;
              const isSelectedBar = selectedIndex === index;
              return (
                <button
                  key={`bar-${hour.time}`}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`flex-1 min-w-[4px] max-w-[12px] rounded-t transition-all duration-200 ${
                    isSelectedBar
                      ? 'bg-[var(--theme-accent,#3b82f6)]'
                      : hour.isDay
                        ? 'bg-amber-400/60 hover:bg-amber-400'
                        : 'bg-indigo-400/60 hover:bg-indigo-400'
                  }`}
                  style={{ height: `${Math.max(10, heightPercent)}%` }}
                  aria-label={`Temperature at ${new Date(hour.time).getHours()}:00`}
                />
              );
            })}
          </div>
        </div>

        {/* Selected Hour Detail Panel */}
        {selectedHour && (
          <div className="p-4 border-t border-[var(--theme-border)] bg-gradient-to-br from-[var(--theme-surface)] to-[var(--theme-background)]">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Main weather info */}
              <div className="flex items-center gap-4 flex-1">
                <ReactAnimatedWeather
                  animate={!prefersReducedMotion}
                  color={theme.isDark ? '#9CA3AF' : '#374151'}
                  icon={selectedHour.condition.icon as any}
                  size={64}
                />
                <div>
                  <p className="text-sm text-[var(--theme-text-secondary)]">
                    {formatDetailTime(selectedHour.time)}
                  </p>
                  <p className="text-3xl font-bold text-[var(--theme-text)]">
                    {getLocalizedTemperature(selectedHour.temperature)}
                  </p>
                  <p className="text-lg text-[var(--theme-text-secondary)] capitalize">
                    {getLocalizedWeatherDescription(selectedHour.condition.code)}
                  </p>
                </div>
              </div>

              {/* Weather metrics grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
                {/* Feels Like */}
                <div className="bg-[var(--theme-surface)] rounded-lg p-3 border border-[var(--theme-border)]">
                  <div className="text-xs text-[var(--theme-text-secondary)] mb-1">
                    🌡️ Feels Like
                  </div>
                  <div className="text-lg font-semibold text-[var(--theme-text)]">
                    {getLocalizedTemperature(selectedHour.feelsLike)}
                  </div>
                </div>

                {/* Humidity */}
                <div className="bg-[var(--theme-surface)] rounded-lg p-3 border border-[var(--theme-border)]">
                  <div className="text-xs text-[var(--theme-text-secondary)] mb-1">💧 Humidity</div>
                  <div className="text-lg font-semibold text-[var(--theme-text)]">
                    {selectedHour.humidity}%
                  </div>
                </div>

                {/* Wind */}
                <div className="bg-[var(--theme-surface)] rounded-lg p-3 border border-[var(--theme-border)]">
                  <div className="text-xs text-[var(--theme-text-secondary)] mb-1">💨 Wind</div>
                  <div className="text-lg font-semibold text-[var(--theme-text)]">
                    {selectedHour.windSpeed} m/s {getWindDirection(selectedHour.windDirection)}
                  </div>
                </div>

                {/* Precipitation */}
                <div className="bg-[var(--theme-surface)] rounded-lg p-3 border border-[var(--theme-border)]">
                  <div className="text-xs text-[var(--theme-text-secondary)] mb-1">
                    🌧️ Precipitation
                  </div>
                  <div className="text-lg font-semibold text-[var(--theme-text)]">
                    {selectedHour.precipitationProbability}%
                  </div>
                </div>

                {/* UV Index */}
                <div className="bg-[var(--theme-surface)] rounded-lg p-3 border border-[var(--theme-border)]">
                  <div className="text-xs text-[var(--theme-text-secondary)] mb-1">☀️ UV Index</div>
                  <div className="text-lg font-semibold text-[var(--theme-text)]">
                    {selectedHour.uvIndex.toFixed(1)}
                  </div>
                </div>

                {/* Visibility */}
                <div className="bg-[var(--theme-surface)] rounded-lg p-3 border border-[var(--theme-border)]">
                  <div className="text-xs text-[var(--theme-text-secondary)] mb-1">
                    👁️ Visibility
                  </div>
                  <div className="text-lg font-semibold text-[var(--theme-text)]">
                    {(selectedHour.visibility / 1000).toFixed(1)} km
                  </div>
                </div>

                {/* Cloud Cover */}
                <div className="bg-[var(--theme-surface)] rounded-lg p-3 border border-[var(--theme-border)]">
                  <div className="text-xs text-[var(--theme-text-secondary)] mb-1">☁️ Clouds</div>
                  <div className="text-lg font-semibold text-[var(--theme-text)]">
                    {selectedHour.cloudCover}%
                  </div>
                </div>

                {/* Pressure */}
                <div className="bg-[var(--theme-surface)] rounded-lg p-3 border border-[var(--theme-border)]">
                  <div className="text-xs text-[var(--theme-text-secondary)] mb-1">📊 Pressure</div>
                  <div className="text-lg font-semibold text-[var(--theme-text)]">
                    {selectedHour.pressure} hPa
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default HourlyForecastTimeline;
