/**
 * EnhancedForecastGrid Component
 * Enhanced forecast display using Carousel component with responsive behavior,
 * staggered animations, statistics, and trend indicators
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import WeatherEmblaCarousel from '@/components/ui/navigation/WeatherEmblaCarousel';
import { useStaggeredAnimation } from '@/hooks/useStaggeredAnimation';
import type { ForecastDay } from '@/types/weather';
import ForecastCard from './ForecastCard';

interface EnhancedForecastGridProps {
  forecast: ForecastDay[];
  temperatureUnit: 'C' | 'F';
  getLocalizedTemperature: (temp: number) => string;
  getLocalizedWeatherDescription: (code: number) => string;
  formatWeekday: (date: string, format?: 'short' | 'long') => string;
  showDetailedMetrics?: boolean;
  cardSize?: 'sm' | 'md' | 'lg';
  animationEnabled?: boolean;
  className?: string;

  // Carousel-specific options
  displayMode?: 'grid' | 'carousel' | 'auto';
  showStatistics?: boolean;
  showTrends?: boolean;
}

const EnhancedForecastGrid: React.FC<EnhancedForecastGridProps> = ({
  forecast,
  temperatureUnit,
  getLocalizedTemperature,
  getLocalizedWeatherDescription,
  formatWeekday,
  showDetailedMetrics = true,
  cardSize = 'md',
  animationEnabled = true,
  className = '',
  displayMode = 'auto',
  showStatistics = false,
  showTrends = false,
}) => {
  const { t } = useTranslation(['weather']);

  // Navigation state for seamless carousel interaction
  const [currentPage, setCurrentPage] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  // Initialize staggered animations for forecast cards
  const { getDelay } = useStaggeredAnimation({
    itemCount: forecast.length,
    baseDelay: 100,
    staggerDelay: 150,
    enabled: animationEnabled,
  });

  // Helper function to determine if day is today or tomorrow
  const getDayInfo = (date: string) => {
    const today = new Date();
    const forecastDate = new Date(date);
    const diffTime = forecastDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      isToday: diffDays === 0,
      isTomorrow: diffDays === 1,
    };
  };

  // Animation types for variety - memoized to prevent re-renders
  const animationTypes = useMemo(
    () =>
      [
        'fadeInUp',
        'fadeInLeft',
        'fadeInRight',
        'fadeInScale',
        'fadeInRotate',
        'fadeInUp',
        'fadeInLeft',
      ] as const,
    []
  );

  // Determine the actual display mode based on screen size and preference
  const actualDisplayMode = useMemo(() => {
    if (displayMode === 'grid' || displayMode === 'carousel') {
      return displayMode;
    }

    // Auto mode: use carousel for better mobile experience
    return 'carousel';
  }, [displayMode]);

  // Handle page changes with smooth navigation feedback
  const handlePageChange = useCallback((page: number) => {
    setIsNavigating(true);
    setCurrentPage(page);

    // Reset navigation state after animation completes
    setTimeout(() => {
      setIsNavigating(false);
    }, 300);
  }, []);

  // Responsive configuration for carousel
  const carouselConfig = useMemo(() => {
    const itemCount = forecast.length;

    // Determine items per page based on screen size and forecast length
    const getItemsPerPage = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        if (width < 640) return 1; // Mobile
        if (width < 1024) return Math.min(2, itemCount); // Tablet
        return itemCount >= 7 ? Math.min(7, itemCount) : Math.min(4, itemCount); // Desktop
      }
      return Math.min(3, itemCount); // Default fallback
    };

    const itemsPerPage = getItemsPerPage();

    return {
      itemsPerPage,
      showControls: true,
      showDots: true, // Show dots for manageable lists
      spacing: 'md' as const,
      align: 'center' as const,
      keyboardNavigation: true,
      touchNavigation: true,
      onPageChange: handlePageChange,
    };
  }, [forecast.length, handlePageChange]);

  // Update items per page on window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      // Force re-render of carousel config on resize
      setCurrentPage(prev =>
        Math.min(prev, Math.ceil(forecast.length / carouselConfig.itemsPerPage) - 1)
      );
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [forecast.length, carouselConfig.itemsPerPage]);

  // Generate forecast cards with enhanced data and animations
  const forecastCards = useMemo(() => {
    return forecast.map((day, index) => {
      const { isToday, isTomorrow } = getDayInfo(day.date);

      // Enhanced animation delay for carousel context
      const enhancedDelay = animationEnabled
        ? actualDisplayMode === 'carousel'
          ? getDelay(index) + 200 // Slight delay for carousel loading
          : getDelay(index)
        : 0;

      // Calculate if this card is currently visible in the carousel
      const itemsPerPage = carouselConfig.itemsPerPage;
      const startIndex = currentPage * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const isVisible = index >= startIndex && index < endIndex;

      return (
        <div
          key={day.date}
          className={`
            w-full h-full transition-all duration-300
            ${isVisible ? 'opacity-100 scale-100' : 'opacity-70 scale-95'}
            ${isNavigating ? 'pointer-events-none' : 'pointer-events-auto'}
            hover:scale-105 focus-within:scale-105
          `}
        >
          <ForecastCard
            animationType={animationTypes?.[index % animationTypes.length]}
            className="w-full h-full"
            day={day}
            delay={enhancedDelay}
            formatWeekday={formatWeekday}
            getLocalizedTemperature={getLocalizedTemperature}
            getLocalizedWeatherDescription={getLocalizedWeatherDescription}
            index={index}
            isToday={isToday}
            isTomorrow={isTomorrow}
            showDetailedMetrics={showDetailedMetrics}
            size={cardSize}
            temperatureUnit={temperatureUnit}
          />
        </div>
      );
    });
  }, [
    forecast,
    animationTypes,
    getDelay,
    formatWeekday,
    getLocalizedTemperature,
    getLocalizedWeatherDescription,
    showDetailedMetrics,
    cardSize,
    temperatureUnit,
    animationEnabled,
    actualDisplayMode,
    carouselConfig.itemsPerPage,
    currentPage,
    isNavigating,
  ]);

  return (
    <div className={`${className} w-full max-md:w-[90dvw]`}>
      {/* Enhanced Forecast Display using Embla Carousel */}
      {actualDisplayMode === 'carousel' ? (
        <div
          className={`mb-8 ${isNavigating ? 'opacity-90' : 'opacity-100'} transition-opacity duration-200`}
        >
          <WeatherEmblaCarousel
            autoplay={false}
            cardSize={cardSize}
            forecast={forecast}
            formatWeekday={formatWeekday}
            getLocalizedTemperature={getLocalizedTemperature}
            getLocalizedWeatherDescription={getLocalizedWeatherDescription}
            loop={false}
            showArrows={carouselConfig.showControls}
            showDetailedMetrics={showDetailedMetrics}
            showDots={carouselConfig.showDots}
            slidesToShow={{
              mobile: 1,
              tablet: Math.min(2, forecast.length),
              desktop: Math.min(carouselConfig.itemsPerPage, forecast.length),
            }}
            temperatureUnit={temperatureUnit}
            onSlideChange={handlePageChange}
          />
        </div>
      ) : (
        /* Traditional Grid Layout for comparison */
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 lg:gap-3">
            {forecastCards}
          </div>
        </div>
      )}

      {/* Forecast Statistics */}
      {showStatistics && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Average High Temperature */}
          <div
            className="text-center p-3 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg border border-red-200 dark:border-red-700/50"
            style={{ boxShadow: '0 1px 2px var(--theme-shadow)' }}
          >
            <div className="text-2xl mb-1">🌡️</div>
            <p className="text-xs text-[var(--theme-text-secondary)] mb-1">
              {t('weather:forecast.avgHigh')}
            </p>
            <p className="text-lg font-bold" style={{ color: 'var(--theme-semantic-error)' }}>
              {getLocalizedTemperature(
                forecast.reduce((sum, day) => sum + day.temperature.maximum, 0) / forecast.length
              ).replace(/[°CF]/g, '')}
              °
            </p>
          </div>

          {/* Average Low Temperature */}
          <div
            className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700/50"
            style={{ boxShadow: '0 1px 2px var(--theme-shadow)' }}
          >
            <div className="text-2xl mb-1">❄️</div>
            <p className="text-xs text-[var(--theme-text-secondary)] mb-1">
              {t('weather:forecast.avgLow')}
            </p>
            <p className="text-lg font-bold" style={{ color: 'var(--theme-semantic-info)' }}>
              {getLocalizedTemperature(
                forecast.reduce((sum, day) => sum + day.temperature.minimum, 0) / forecast.length
              ).replace(/[°CF]/g, '')}
              °
            </p>
          </div>

          {/* Average Precipitation */}
          <div
            className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-700/50"
            style={{ boxShadow: '0 1px 2px var(--theme-shadow)' }}
          >
            <div className="text-2xl mb-1">💧</div>
            <p className="text-xs text-[var(--theme-text-secondary)] mb-1">Avg Rain</p>
            <p className="text-lg font-bold" style={{ color: 'var(--theme-semantic-info)' }}>
              {Math.round(
                forecast.reduce((sum, day) => sum + day.precipitationProbability, 0) /
                  forecast.length
              )}
              %
            </p>
          </div>

          {/* Max UV Index */}
          <div
            className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700/50"
            style={{ boxShadow: '0 1px 2px var(--theme-shadow)' }}
          >
            <div className="text-2xl mb-1">☀️</div>
            <p className="text-xs text-[var(--theme-text-secondary)] mb-1">Max UV</p>
            <p className="text-lg font-bold" style={{ color: 'var(--theme-semantic-warning)' }}>
              {Math.max(...forecast.map(day => day.uvIndex)).toFixed(1)}
            </p>
          </div>
        </div>
      )}

      {/* Weather Trend Indicators */}
      {showTrends && (
        <div
          className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800/20 dark:to-slate-700/20 rounded-lg border border-gray-200 dark:border-slate-600/50"
          style={{ boxShadow: '0 1px 2px var(--theme-shadow)' }}
        >
          <h4 className="text-sm font-semibold text-[var(--theme-text)] mb-3 flex items-center">
            <span className="text-lg mr-2">📊</span>
            {t('weather:forecast.weeklyTrends')}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Temperature Trend */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <span className="text-sm text-[var(--theme-text-secondary)]">Temperature</span>
                {forecast?.[forecast.length - 1].temperature.maximum >
                forecast?.[0].temperature.maximum ? (
                  <span className="text-lg" style={{ color: 'var(--theme-semantic-error)' }}>
                    ↗️
                  </span>
                ) : (
                  <span className="text-lg" style={{ color: 'var(--theme-semantic-info)' }}>
                    ↘️
                  </span>
                )}
              </div>
              <div className="flex justify-center space-x-1">
                {forecast.slice(0, 7).map((day, index) => (
                  <div
                    key={index}
                    className="w-2 bg-gradient-to-t from-blue-400 to-red-400 dark:from-blue-500 dark:to-red-500 rounded-full"
                    style={{
                      height: `${Math.max(8, (day.temperature.maximum / Math.max(...forecast.map(d => d.temperature.maximum))) * 24)}px`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Precipitation Trend */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <span className="text-sm text-[var(--theme-text-secondary)]">Precipitation</span>
                <span className="text-lg" style={{ color: 'var(--theme-semantic-info)' }}>
                  💧
                </span>
              </div>
              <div className="flex justify-center space-x-1">
                {forecast.slice(0, 7).map((day, index) => (
                  <div
                    key={index}
                    className="w-2 bg-blue-400 dark:bg-blue-500 rounded-full"
                    style={{
                      height: `${Math.max(4, (day.precipitationProbability / 100) * 24)}px`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* UV Index Trend */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <span className="text-sm text-[var(--theme-text-secondary)]">UV Index</span>
                <span className="text-lg" style={{ color: 'var(--theme-semantic-warning)' }}>
                  ☀️
                </span>
              </div>
              <div className="flex justify-center space-x-1">
                {forecast.slice(0, 7).map((day, index) => (
                  <div
                    key={index}
                    className="w-2 bg-gradient-to-t from-yellow-400 to-red-400 dark:from-yellow-500 dark:to-red-500 rounded-full"
                    style={{
                      height: `${Math.max(4, (day.uvIndex / Math.max(...forecast.map(d => d.uvIndex))) * 24)}px`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedForecastGrid;
