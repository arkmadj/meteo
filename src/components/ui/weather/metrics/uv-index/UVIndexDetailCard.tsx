import React, { useState } from 'react';

import UVIndexDetailModal from './UVIndexDetailModal';
import UVIndexMeter from './UVIndexMeter';
import WeatherDetailCard from '@/components/ui/weather/display/WeatherDetailCard';

export interface UVIndexDetailCardProps {
  uvIndex: number;
  animationDelay?: number;
  animationType?: string;
  animationDuration?: number;
  className?: string;
}

const UVIndexDetailCard: React.FC<UVIndexDetailCardProps> = ({
  uvIndex,
  animationDelay = 0,
  animationType = 'fadeInUp',
  animationDuration = 600,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get UV index color based on value
  const getUVIndexColor = (index: number): string => {
    if (index <= 2) return 'text-green-600';
    if (index <= 5) return 'text-yellow-600';
    if (index <= 7) return 'text-orange-600';
    if (index <= 10) return 'text-red-600';
    return 'text-purple-600';
  };

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
        aria-label="Click to view detailed UV index information and sun safety guidance"
        className="h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
        data-testid="uv-index-detail-card"
      >
        <WeatherDetailCard
          accentColor="yellow"
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
          icon="☀️"
          textColor={getUVIndexColor(uvIndex)} // Keep dynamic UV color logic
          themeAware={true}
          title="UV Index"
          value={uvIndex.toFixed(1)}
        >
          <UVIndexMeter
            className="w-full h-full"
            showGauge={true}
            showProgressBar={true}
            showRecommendations={true}
            showRiskLevel={true}
            showValue={false}
            size="sm"
            uvIndex={uvIndex}
          />
        </WeatherDetailCard>
      </div>

      <UVIndexDetailModal isOpen={isModalOpen} onClose={handleModalClose} uvIndex={uvIndex} />
    </>
  );
};

export default UVIndexDetailCard;
