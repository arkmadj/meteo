import React, { useState } from 'react';

import WeatherDetailCard from '@/components/ui/weather/display/WeatherDetailCard';
import type { TemperatureData } from '@/types/weather';
import TemperatureDetailModal from './TemperatureDetailModal';
import TemperatureGauge from './TemperatureGauge';

export interface TemperatureDetailCardProps {
  temperature: TemperatureData;
  temperatureUnit: 'C' | 'F';
  getLocalizedTemperature: (temp: number) => string;
  animationDelay?: number;
  animationType?: string;
  animationDuration?: number;
  className?: string;
}

const TemperatureDetailCard: React.FC<TemperatureDetailCardProps> = ({
  temperature,
  temperatureUnit,
  getLocalizedTemperature,
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
        aria-label="Click to view detailed temperature information"
        className="h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <WeatherDetailCard
          accentColor="blue"
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
          icon="🌡️"
          themeAware={true}
          title="Temperature"
          value={`${getLocalizedTemperature(temperature.current).replace(/[°CF]/g, '')}°${temperatureUnit}`}
        >
          <TemperatureGauge
            className="w-full h-full"
            maxTemp={temperature.max}
            minTemp={temperature.min}
            showComfortLevel={true}
            showGauge={true}
            showRange={true}
            showValue={false}
            size="sm"
            temperature={temperature.current}
            unit={temperatureUnit}
          />
        </WeatherDetailCard>
      </div>

      <TemperatureDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        temperature={temperature}
        temperatureUnit={temperatureUnit}
        getLocalizedTemperature={getLocalizedTemperature}
      />
    </>
  );
};

export default TemperatureDetailCard;
