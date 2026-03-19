/**
 * Pollen Detail Card Component
 * Displays pollen count and allergy forecast with health advice and pollen breakdown.
 *
 * The card is clickable and opens an accessible modal with expanded
 * pollen information while still providing at-a-glance details
 * directly in the dashboard.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import WeatherDetailCard from '@/components/ui/weather/display/WeatherDetailCard';
import type { PollenData } from '@/types/pollen';
import PollenDetailModal from './PollenDetailModal';
import PollenMeter from './PollenMeter';

export interface PollenDetailCardProps {
  pollenData: PollenData;
  animationDelay?: number;
  animationType?: string;
  animationDuration?: number;
  className?: string;
}

const PollenDetailCard: React.FC<PollenDetailCardProps> = ({
  pollenData,
  animationDelay = 0,
  animationType = 'fadeInUp',
  animationDuration = 600,
  className = '',
}) => {
  const { t } = useTranslation(['weather']);
  const [_showDetails, _setShowDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    overallIndex,
    category,
    color,
    description,
    healthAdvice,
    pollens,
    dominantPollen,
    isPollenSeason,
    availableInRegion,
  } = pollenData;

  // Get dynamic text color based on pollen level
  const getTextColor = (): string => {
    if (overallIndex === 0) return 'text-gray-600 dark:text-gray-400';
    if (overallIndex === 1) return 'text-green-600 dark:text-green-400';
    if (overallIndex === 2) return 'text-yellow-600 dark:text-yellow-400';
    if (overallIndex === 3) return 'text-orange-600 dark:text-orange-400';
    if (overallIndex === 4) return 'text-red-600 dark:text-red-400';
    return 'text-purple-600 dark:text-purple-400';
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // Get active pollens
  const _activePollens = Object.values(pollens).filter(pollen => pollen && pollen.value > 0);

  return (
    <>
      <article
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
        aria-label={t(
          'weather:pollen.cardAriaLabel',
          'Click to view detailed pollen and allergy information'
        )}
        data-testid="pollen-detail-card"
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
          icon="🌸"
          textColor={getTextColor()}
          themeAware={true}
          title={t('weather:pollen.title', 'Pollen')}
          value={availableInRegion ? category : 'N/A'}
        >
          <div className="space-y-4">
            {/* Pollen Meter */}
            {availableInRegion ? (
              <PollenMeter
                pollenData={pollenData}
                className="w-full"
                showCategory={true}
                showGauge={true}
                showProgressBar={true}
                showValue={false}
                size="sm"
              />
            ) : (
              <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                {t('weather:pollen.notAvailable', 'Pollen data is only available in Europe')}
              </div>
            )}

            {/* Category and Description */}
            {availableInRegion && (
              <div className="text-center">
                <div className="text-sm font-semibold mb-1" style={{ color }}>
                  {category}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{description}</div>
              </div>
            )}

            {/* Season Status */}
            {availableInRegion && (
              <div className="text-center py-2 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {t('weather:pollen.seasonStatus', 'Season Status')}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {isPollenSeason
                    ? t('weather:pollen.activeSeasonLabel', 'Active Season')
                    : t('weather:pollen.offSeasonLabel', 'Off Season')}
                </div>
              </div>
            )}
          </div>
        </WeatherDetailCard>
      </article>

      <PollenDetailModal isOpen={isModalOpen} onClose={handleModalClose} pollenData={pollenData} />
    </>
  );
};

export default PollenDetailCard;
