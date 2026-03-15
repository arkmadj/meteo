import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import VisibilityDetailModal from './VisibilityDetailModal';
import VisibilityMeter from './VisibilityMeter';
import WeatherDetailCard from '@/components/ui/weather/display/WeatherDetailCard';
import { useVisibilityUnit } from '@/hooks/useVisibilityUnit';

export interface VisibilityDetailCardProps {
  visibility: number;
  animationDelay?: number;
  animationType?: string;
  animationDuration?: number;
  className?: string;
}

const VisibilityDetailCard: React.FC<VisibilityDetailCardProps> = ({
  visibility,
  animationDelay = 0,
  animationType = 'fadeInUp',
  animationDuration = 600,
  className = '',
}) => {
  const { t } = useTranslation(['weather']);
  const { formatVisibility } = useVisibilityUnit();
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
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleCardClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={t(
          'weather:accessibility.visibilityDetailsAriaLabel',
          'Click to view detailed visibility information and travel safety guidance'
        )}
        className="h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
        data-testid="visibility-detail-card"
      >
        <WeatherDetailCard
          accentColor="indigo"
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
          icon="👁️"
          themeAware={true}
          title={t('weather:labels.visibility', 'Visibility')}
          value={formatVisibility(visibility)}
        >
          <VisibilityMeter
            className="w-full h-full"
            showDistanceMarkers={false}
            showGauge={true}
            showProgressBar={true}
            showRecommendations={true}
            showValue={false}
            showVisibilityLevel={true}
            size="sm"
            visibility={visibility}
          />
        </WeatherDetailCard>
      </div>

      <VisibilityDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        visibility={visibility}
      />
    </>
  );
};

export default VisibilityDetailCard;
