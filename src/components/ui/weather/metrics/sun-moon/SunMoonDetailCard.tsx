import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import SunMoonDetailModal from './SunMoonDetailModal';
import WeatherDetailCard from '@/components/ui/weather/display/WeatherDetailCard';
import { useTheme } from '@/design-system/theme';
import type { AstronomicalData } from '@/types/weather';
import {
  formatDaylightDuration,
  formatSunTime,
  isSunUp,
  MOON_PHASE_INFO,
} from '@/utils/astronomical';

export interface SunMoonDetailCardProps {
  astronomical: AstronomicalData;
  animationDelay?: number;
  animationType?: string;
  animationDuration?: number;
  className?: string;
}

const SunMoonDetailCard: React.FC<SunMoonDetailCardProps> = ({
  astronomical,
  animationDelay = 0,
  animationType = 'fadeInUp',
  animationDuration = 600,
  className = '',
}) => {
  const { t } = useTranslation(['weather']);
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const sunIsUp = isSunUp(astronomical.sunrise, astronomical.sunset);
  const moonPhaseInfo = MOON_PHASE_INFO[astronomical.moonPhase];

  return (
    <>
      <div
        onClick={handleCardClick}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleCardClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={t(
          'weather:accessibility.sunMoonDetailsAriaLabel',
          'Click to view detailed sunrise, sunset, and moon phase information'
        )}
        className="h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
        data-testid="sun-moon-detail-card"
      >
        <WeatherDetailCard
          accentColor="orange"
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
          icon={sunIsUp ? '☀️' : '🌙'}
          themeAware={true}
          title={t('weather:labels.sunAndMoon', 'Sun & Moon')}
          value={formatDaylightDuration(astronomical.daylightDuration)}
          subtitle={t('weather:labels.daylightDuration', 'Daylight')}
        >
          <div className="space-y-3">
            {/* Sunrise and Sunset Row */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🌅</span>
                <div>
                  <p className={`text-xs ${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('weather:labels.sunrise', 'Sunrise')}
                  </p>
                  <p
                    className={`text-sm font-semibold ${theme.isDark ? 'text-gray-200' : 'text-gray-800'}`}
                  >
                    {formatSunTime(astronomical.sunrise)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className={`text-xs ${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('weather:labels.sunset', 'Sunset')}
                  </p>
                  <p
                    className={`text-sm font-semibold ${theme.isDark ? 'text-gray-200' : 'text-gray-800'}`}
                  >
                    {formatSunTime(astronomical.sunset)}
                  </p>
                </div>
                <span className="text-xl">🌇</span>
              </div>
            </div>

            {/* Moon Phase Row */}
            <div
              className={`flex items-center justify-between p-2 rounded-lg ${
                theme.isDark ? 'bg-gray-800/50' : 'bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{moonPhaseInfo.emoji}</span>
                <div>
                  <p className={`text-xs ${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('weather:labels.moonPhase', 'Moon Phase')}
                  </p>
                  <p
                    className={`text-sm font-medium ${theme.isDark ? 'text-gray-200' : 'text-gray-800'}`}
                  >
                    {moonPhaseInfo.name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xs ${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('weather:labels.illumination', 'Illumination')}
                </p>
                <p
                  className={`text-sm font-semibold ${theme.isDark ? 'text-gray-200' : 'text-gray-800'}`}
                >
                  {astronomical.moonIllumination}%
                </p>
              </div>
            </div>
          </div>
        </WeatherDetailCard>
      </div>

      <SunMoonDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        astronomical={astronomical}
      />
    </>
  );
};

export default SunMoonDetailCard;
