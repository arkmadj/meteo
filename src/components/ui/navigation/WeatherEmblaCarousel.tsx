/**
 * WeatherEmblaCarousel Component
 * Weather-specific carousel using Embla Carousel for 7-day forecast
 * with responsive design and weather-focused features
 */

import type { EmblaOptionsType } from 'embla-carousel';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ForecastDay } from '@/types/weather';

import ForecastCard from '@/components/ui/weather/forecast/ForecastCard';
import EmblaCarousel from './EmblaCarousel';

export interface WeatherEmblaCarouselProps {
  /** Forecast data for 7 days */
  forecast: ForecastDay[];
  /** Temperature unit (Celsius or Fahrenheit) */
  temperatureUnit: 'C' | 'F';
  /** Function to get localized temperature string */
  getLocalizedTemperature: (temp: number) => string;
  /** Function to get localized weather description */
  getLocalizedWeatherDescription: (code: number) => string;
  /** Function to format weekday names */
  formatWeekday: (date: string, format?: 'short' | 'long') => string;
  /** Size variant of the forecast cards */
  cardSize?: 'sm' | 'md' | 'lg';
  /** Show detailed metrics on cards */
  showDetailedMetrics?: boolean;
  /** Enable autoplay */
  autoplay?: boolean;
  /** Autoplay delay in milliseconds */
  autoplayDelay?: number;
  /** Show navigation arrows */
  showArrows?: boolean;
  /** Show dot indicators */
  showDots?: boolean;
  /** Enable loop/infinite scroll */
  loop?: boolean;
  /** Number of slides to show at once (responsive) */
  slidesToShow?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  /** Custom class name */
  className?: string;
  /** Callback when a day is selected */
  onDaySelect?: (day: ForecastDay, index: number) => void;
  /** Callback when slide changes */
  onSlideChange?: (index: number) => void;
}

const WeatherEmblaCarousel: React.FC<WeatherEmblaCarouselProps> = ({
  forecast,
  temperatureUnit,
  getLocalizedTemperature,
  getLocalizedWeatherDescription,
  formatWeekday,
  cardSize = 'md',
  showDetailedMetrics = true,
  autoplay = false,
  autoplayDelay = 5000,
  showArrows = true,
  showDots = true,
  loop = false,
  slidesToShow = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  },
  className = '',
  onDaySelect,
  onSlideChange,
}) => {
  const { t } = useTranslation(['weather', 'common']);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  // Helper function to determine if day is today or tomorrow
  const getDayInfo = useCallback((date: string) => {
    const today = new Date();
    const forecastDate = new Date(date);
    const diffTime = forecastDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      isToday: diffDays === 0,
      isTomorrow: diffDays === 1,
    };
  }, []);

  // Responsive Embla options
  const emblaOptions: EmblaOptionsType = useMemo(() => {
    return {
      loop,
      align: 'start',
      containScroll: 'trimSnaps',
      dragFree: false,
      slidesToScroll: 1,
      breakpoints: {
        '(min-width: 640px)': {
          slidesToScroll: Math.min(2, forecast.length),
        },
        '(min-width: 1024px)': {
          slidesToScroll: Math.min(3, forecast.length),
        },
      },
    };
  }, [loop, forecast.length, slidesToShow]);

  // Handle day selection
  const handleDaySelect = useCallback(
    (day: ForecastDay, index: number) => {
      setSelectedDayIndex(index);
      if (onDaySelect) {
        onDaySelect(day, index);
      }
    },
    [onDaySelect]
  );

  // Handle slide change
  const handleSlideChange = useCallback(
    (index: number) => {
      if (onSlideChange) {
        onSlideChange(index);
      }
    },
    [onSlideChange]
  );

  // Generate forecast cards
  const forecastCards = useMemo(() => {
    return forecast.map((day, index) => {
      const { isToday, isTomorrow } = getDayInfo(day.date);
      const isSelected = selectedDayIndex === index;

      return (
        <div
          key={day.date}
          className={`
            px-2 transition-all duration-300 w-full
            ${isSelected ? 'scale-105' : 'scale-100'}
          `}
          style={{
            // flex: `0 0 ${100 / (slidesToShow.desktop || 3)}%`,
            minWidth: 0,
          }}
        >
          <ForecastCard
            aria-pressed={isSelected}
            className={`
              w-full cursor-pointer transition-all duration-200
              hover:shadow-lg hover:-translate-y-1
              ${isSelected ? 'ring-2 ring-blue-500' : ''}
            `}
            day={day}
            formatWeekday={formatWeekday}
            getLocalizedTemperature={getLocalizedTemperature}
            getLocalizedWeatherDescription={getLocalizedWeatherDescription}
            index={index}
            isToday={isToday}
            isTomorrow={isTomorrow}
            role="button"
            showDetailedMetrics={showDetailedMetrics}
            size={cardSize}
            tabIndex={0}
            temperatureUnit={temperatureUnit}
            onClick={() => handleDaySelect(day, index)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleDaySelect(day, index);
              }
            }}
          />
        </div>
      );
    });
  }, [
    forecast,
    getDayInfo,
    selectedDayIndex,
    slidesToShow.desktop,
    temperatureUnit,
    getLocalizedTemperature,
    getLocalizedWeatherDescription,
    formatWeekday,
    showDetailedMetrics,
    cardSize,
    handleDaySelect,
  ]);

  // Loading state
  if (!forecast || forecast.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-gray-500 mb-2">{t('weather:forecast.noData')}</div>
          <div className="text-sm text-gray-400">{t('weather:forecast.noDataDescription')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`weather-embla-carousel ${className}`}>
      {/* Embla Carousel */}
      <EmblaCarousel
        ariaLabel={t('weather:forecast.carouselLabel', { count: forecast.length })}
        autoplay={autoplay}
        autoplayDelay={autoplayDelay}
        className="weather-forecast-carousel"
        enableWheelGestures={true}
        options={emblaOptions}
        showArrows={showArrows}
        showDots={showDots}
        slideClassName="weather-forecast-slide"
        onSlideChange={handleSlideChange}
      >
        {forecastCards}
      </EmblaCarousel>

      {/* Selected Day Details */}
      {/* {selectedDayIndex !== null && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            {getDayInfo(forecast[selectedDayIndex].date).isToday
              ? t('weather:forecast.today')
              : getDayInfo(forecast[selectedDayIndex].date).isTomorrow
                ? t('weather:forecast.tomorrow')
                : formatWeekday(forecast[selectedDayIndex].date, 'long')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Temperature:</span>
              <div className="text-blue-900">
                {getLocalizedTemperature(forecast[selectedDayIndex].temperature.maximum)} /{' '}
                {getLocalizedTemperature(forecast[selectedDayIndex].temperature.minimum)}
              </div>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Condition:</span>
              <div className="text-blue-900">
                {getLocalizedWeatherDescription(forecast[selectedDayIndex].condition.code)}
              </div>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Precipitation:</span>
              <div className="text-blue-900">
                {forecast[selectedDayIndex].precipitationProbability}%
              </div>
            </div>
            <div>
              <span className="text-blue-700 font-medium">UV Index:</span>
              <div className="text-blue-900">{forecast[selectedDayIndex].uvIndex}</div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default WeatherEmblaCarousel;
