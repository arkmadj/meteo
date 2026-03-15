import React, { useState } from 'react';

import CoordinatesDisplay from './CoordinatesDisplay';
import CoordinatesMapModal from './CoordinatesMapModal';
import WeatherDetailCard from '@/components/ui/weather/display/WeatherDetailCard';
import type { LocationData } from '@/types/weather';

export interface CoordinatesDetailCardProps {
  latitude: number;
  longitude: number;
  location?: LocationData;
  animationDelay?: number;
  animationType?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'fadeInScale' | 'fadeInRotate';
  animationDuration?: number;
  className?: string;
}

const CoordinatesDetailCard: React.FC<CoordinatesDetailCardProps> = ({
  latitude,
  longitude,
  location,
  animationDelay = 0,
  animationType = 'fadeInUp',
  animationDuration = 600,
  className = '',
}) => {
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
        aria-label="Click to view location on map"
        className="h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <WeatherDetailCard
          accentColor="slate"
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
          icon="🌍"
          subtitle="Geographic Location"
          themeAware={true}
          title="Coordinates"
          value=""
        >
          <CoordinatesDisplay
            className="w-full h-full"
            latitude={latitude}
            location={
              location ? { city: location.city || '', country: location.country || '' } : undefined
            }
            longitude={longitude}
            showFormats={false}
            showGrid={true}
            showHemisphere={true}
            showLocationContext={true}
            showPrecision={true}
            size="sm"
          />
        </WeatherDetailCard>
      </div>
      <CoordinatesMapModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        latitude={latitude}
        longitude={longitude}
        location={location}
      />
    </>
  );
};

export default CoordinatesDetailCard;
