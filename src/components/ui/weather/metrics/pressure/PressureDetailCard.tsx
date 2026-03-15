import React, { useState } from 'react';

import PressureDetailModal from './PressureDetailModal';
import PressureGauge from './PressureGauge';
import WeatherDetailCard from '@/components/ui/weather/display/WeatherDetailCard';
import type { PressureHistory } from '@/types/weather';

export interface PressureDetailCardProps {
  pressure: number;
  pressureHistory?: PressureHistory;
  animationDelay?: number;
  animationType?: string;
  animationDuration?: number;
  className?: string;
}

const PressureDetailCard: React.FC<PressureDetailCardProps> = ({
  pressure,
  pressureHistory,
  animationDelay = 0,
  animationType = 'fadeInUp',
  animationDuration = 600,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Format pressure value
  const formatPressure = (pressureValue: number): string => {
    return `${pressureValue.toFixed(1)} hPa`;
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
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
        role="button"
        tabIndex={0}
        className="h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-lg transition-all hover:shadow-lg"
        aria-label="Click to view detailed pressure information"
      >
        <WeatherDetailCard
          accentColor="purple"
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
          icon="📊"
          themeAware={true}
          title="Pressure"
          value={formatPressure(pressure)}
        >
          <div className="bg-[var(--theme-surface)]/50 rounded-lg p-2 sm:p-3 border border-[var(--theme-border)] flex-1 overflow-y-auto">
            <PressureGauge
              className="w-full h-full"
              pressure={pressure}
              pressureHistory={pressureHistory}
              showGauge={true}
              showHistoricalComparison={false}
              showScale={true}
              showTrend={true}
              showTrendChart={true}
              showValue={false}
              showWeatherImplications={true}
              size="sm"
              trendChartTimeRange="24h"
            />
          </div>
        </WeatherDetailCard>
      </div>

      <PressureDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        pressure={pressure}
        pressureHistory={pressureHistory}
      />
    </>
  );
};

export default PressureDetailCard;
