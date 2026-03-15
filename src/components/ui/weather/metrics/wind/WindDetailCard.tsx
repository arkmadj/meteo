import React, { useState } from 'react';

import DualWindCompass from './DualWindCompass';
import WeatherDetailCard from '@/components/ui/weather/display/WeatherDetailCard';
import WindDetailModal from './WindDetailModal';
import WindGustIndicator from './WindGustIndicator';
import { useTheme } from '@/design-system/theme';
import { useWindSpeedUnit } from '@/hooks/useWindSpeedUnit';
import type { WindData } from '@/types/weather';

export interface WindDetailCardProps {
  wind: WindData;
  animationDelay?: number;
  animationType?: string;
  animationDuration?: number;
  className?: string;
}

const WindDetailCard: React.FC<WindDetailCardProps> = ({
  wind,
  animationDelay = 0,
  animationType = 'fadeInUp',
  animationDuration = 600,
  className = '',
}) => {
  const { formatWindSpeed } = useWindSpeedUnit();
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
        role="button"
        tabIndex={0}
        className="h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg transition-all hover:shadow-lg"
        aria-label="Click to view detailed wind information"
      >
        <WeatherDetailCard
          accentColor="green"
          animationDelay={animationDelay}
          animationDuration={animationDuration}
          animationType={
            animationType as
              | 'fadeInUp'
              | 'fadeInLeft'
              | 'fadeInRight'
              | 'fadeInScale'
              | 'fadeInRotate'
          }
          className={className}
          icon="💨"
          themeAware={true}
          title="Wind"
          value={
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-1 sm:space-y-0">
              <span className="truncate">
                {formatWindSpeed(wind.speed, { showUnit: true, decimals: 1 })}
              </span>
              {wind.gust && wind.gust > wind.speed && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs sm:text-sm text-[var(--theme-text-secondary)]">•</span>
                  <span
                    className="text-base sm:text-lg font-semibold truncate"
                    style={{ color: 'var(--theme-semantic-warning)' }}
                  >
                    {formatWindSpeed(wind.gust, { showUnit: true, decimals: 1 })}
                  </span>
                  <span className="text-xs text-[var(--theme-text-secondary)] uppercase tracking-wide hidden sm:inline">
                    gusts
                  </span>
                </div>
              )}
            </div>
          }
        >
          <div className="space-y-3 h-full flex flex-col">
            {/* Wind Gust Indicator - Theme-aware */}
            {wind.gust && (
              <div className="bg-[var(--theme-surface)]/50 rounded-lg p-2 sm:p-3 border border-[var(--theme-border)] flex-1">
                <WindGustIndicator
                  className="w-full h-full"
                  gustSpeed={wind.gust}
                  showAnimation={true}
                  showGustFactor={true}
                  showValues={true}
                  size="sm"
                  windSpeed={wind.speed}
                />
              </div>
            )}

            {/* Dual Wind Direction Compass - Theme-aware */}
            <div
              className="rounded-lg p-2 sm:p-3 border flex-1"
              style={{
                backgroundColor: theme.isDark
                  ? 'rgba(34, 197, 94, 0.1)'
                  : 'rgba(34, 197, 94, 0.05)',
                borderColor: theme.isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)',
              }}
            >
              <DualWindCompass
                className="w-full h-full"
                gustDirection={wind.gustDirection}
                gustSpeed={wind.gust}
                showCompassLabels={true}
                showDirections={true}
                showLegend={false}
                showSpeedIndicators={true}
                showValues={false}
                size="sm"
                windDirection={wind.direction}
                windSpeed={wind.speed}
              />
            </div>
          </div>
        </WeatherDetailCard>
      </div>

      <WindDetailModal isOpen={isModalOpen} onClose={handleModalClose} wind={wind} />
    </>
  );
};

export default WindDetailCard;
