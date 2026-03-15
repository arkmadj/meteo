import React, { useState } from 'react';

import HumidityDetailModal from './HumidityDetailModal';
import HumidityMeter from './HumidityMeter';
import WeatherDetailCard from '@/components/ui/weather/display/WeatherDetailCard';

export interface HumidityDetailCardProps {
  humidity: number;
  animationDelay?: number;
  animationType?: string;
  animationDuration?: number;
  className?: string;
}

const HumidityDetailCard: React.FC<HumidityDetailCardProps> = ({
  humidity,
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
        className="h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 rounded-lg transition-all hover:shadow-lg"
        aria-label="Click to view detailed humidity information"
      >
        <WeatherDetailCard
          accentColor="cyan"
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
          icon="💧"
          themeAware={true}
          title="Humidity"
          value={`${humidity}%`}
        >
          <HumidityMeter
            className="w-full h-full"
            humidity={humidity}
            showComfortLevel={true}
            showGauge={true}
            showValue={false}
            size="sm"
          />
        </WeatherDetailCard>
      </div>

      <HumidityDetailModal isOpen={isModalOpen} onClose={handleModalClose} humidity={humidity} />
    </>
  );
};

export default HumidityDetailCard;
