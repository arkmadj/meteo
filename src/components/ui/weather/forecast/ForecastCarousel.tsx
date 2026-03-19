/**
 * ForecastCarousel Component
 * Specialized carousel component for presenting the 7-day weather forecast
 * with weather-specific features and responsive design
 */

import React from 'react';
import ReactAnimatedWeather from 'react-animated-weather';
import { useTranslation } from 'react-i18next';

import { usePrefersReducedMotion } from '@/hooks/useMotion';

import { useResponsiveItemsPerPage } from '@/hooks/useResponsiveItemsPerPage';
import type { ForecastDay } from '@/types/weather';

import { Card, CardBody } from '@/components/ui/atoms';
import Carousel from '@/components/ui/navigation/Carousel';

export type ForecastCarouselSize = 'sm' | 'md' | 'lg';
export type ForecastCarouselVariant = 'default' | 'compact' | 'detailed';

export interface ForecastCarouselProps {
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
  size?: ForecastCarouselSize;
  /** Visual variant of the carousel */
  variant?: ForecastCarouselVariant;
  /** Number of items to show per page (responsive) */
  itemsPerPage?: number | { sm: number; md: number; lg: number };
  /** Show temperature trends */
  showTrends?: boolean;
  /** Show precipitation probability */
  showPrecipitation?: boolean;
  /** Show wind information */
  showWind?: boolean;
  /** Show UV index */
  showUVIndex?: boolean;
  /** Enable autoplay */
  autoplay?: boolean;
  /** Custom class name */
  className?: string;
  /** Callback when forecast day is selected */
  onDaySelect?: (day: ForecastDay, index: number) => void;
}

const ForecastCarousel: React.FC<ForecastCarouselProps> = ({
  forecast,
  temperatureUnit: _temperatureUnit,
  getLocalizedTemperature,
  getLocalizedWeatherDescription,
  formatWeekday,
  size = 'md',
  variant = 'default',
  itemsPerPage = { sm: 1, md: 2, lg: 2 },
  showTrends = true,
  showPrecipitation = true,
  showWind = false,
  showUVIndex = false,
  autoplay = false,
  className = '',
  onDaySelect,
}) => {
  const { t } = useTranslation(['weather', 'common']);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Get responsive items per page using CSS-based media queries
  const responsiveConfig: Partial<Record<ForecastCarouselSize, number>> =
    typeof itemsPerPage === 'number'
      ? { sm: itemsPerPage, md: itemsPerPage, lg: itemsPerPage }
      : itemsPerPage;

  const normalizedItemsPerPage = {
    sm: responsiveConfig.sm ?? 1,
    md: responsiveConfig.md ?? 2,
    lg: responsiveConfig.lg ?? 2,
  };

  const responsiveItemsPerPage = useResponsiveItemsPerPage(normalizedItemsPerPage);

  // Format day name with special handling for today/tomorrow
  const formatDayName = (date: string, _index: number): string => {
    const today = new Date();
    const forecastDate = new Date(date);
    const diffTime = forecastDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('weather:forecast.today');
    if (diffDays === 1) return t('weather:forecast.tomorrow');
    return formatWeekday(date, 'short');
  };

  // Get temperature trend emoji
  const getTemperatureTrend = (currentDay: ForecastDay, previousDay?: ForecastDay): string => {
    if (!previousDay || !showTrends) return '';

    const currentAvg = (currentDay.temperature.maximum + currentDay.temperature.minimum) / 2;
    const previousAvg = (previousDay.temperature.maximum + previousDay.temperature.minimum) / 2;
    const diff = currentAvg - previousAvg;

    if (Math.abs(diff) < 1) return '→';
    return diff > 0 ? '↗️' : '↘️';
  };

  // Get weather icon size based on card size
  const getIconSize = () => {
    const sizeMap = {
      sm: 32,
      md: 48,
      lg: 64,
    };
    return sizeMap?.[size];
  };

  // Get UV index color
  const getUVIndexColor = (uvIndex: number): string => {
    if (uvIndex <= 2) return 'text-green-500';
    if (uvIndex <= 5) return 'text-yellow-500';
    if (uvIndex <= 7) return 'text-orange-500';
    if (uvIndex <= 10) return 'text-red-500';
    return 'text-purple-500';
  };

  // Render individual forecast card
  const renderForecastCard = (day: ForecastDay, index: number) => {
    const dayName = formatDayName(day.date, index);
    const trend = index > 0 ? getTemperatureTrend(day, forecast?.[index - 1]) : '';
    const iconSize = getIconSize();

    return (
      <div
        key={day.date}
        role="button"
        tabIndex={0}
        aria-label={`Weather forecast for ${dayName}`}
        className="cursor-pointer"
        onClick={() => onDaySelect?.(day, index)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onDaySelect?.(day, index);
          }
        }}
      >
        <Card
          className={`
            transition-all duration-200 hover:shadow-lg hover:-translate-y-1
            ${variant === 'compact' ? 'p-3' : variant === 'detailed' ? 'p-5' : 'p-4'}
            ${size === 'sm' ? 'min-w-[100px] sm:min-w-[120px]' : size === 'md' ? 'min-w-[130px] sm:min-w-[150px] md:min-w-[160px]' : 'min-w-[150px] sm:min-w-[170px] md:min-w-[180px]'}
            flex-1 max-w-full
          `}
        >
          <CardBody className="text-center">
            {/* Day name */}
            <div className="flex items-center justify-center gap-1 mb-2">
              <h3
                className={`font-semibold ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'}`}
              >
                {dayName}
              </h3>
              {trend && <span className="text-sm">{trend}</span>}
            </div>

            {/* Weather icon */}
            <div className="my-3">
              <ReactAnimatedWeather
                animate={!prefersReducedMotion}
                color="#6B7280"
                icon={day.condition.icon}
                size={iconSize}
              />
            </div>

            {/* Weather description */}
            <p className={`text-gray-600 mb-3 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
              {getLocalizedWeatherDescription(day.condition.code)}
            </p>

            {/* Temperature range */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <span
                className={`font-bold ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'}`}
              >
                {getLocalizedTemperature(day.temperature.maximum).replace(/[°CF]/g, '')}°
              </span>
              <span className={`text-gray-500 ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
                {getLocalizedTemperature(day.temperature.minimum).replace(/[°CF]/g, '')}°
              </span>
            </div>

            {/* Additional metrics */}
            {(showPrecipitation || showWind || showUVIndex) && (
              <div className={`space-y-1 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
                {showPrecipitation && day.precipitationProbability > 0 && (
                  <div className="flex items-center justify-center gap-1 text-blue-600">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                    </svg>
                    <span>{day.precipitationProbability}%</span>
                  </div>
                )}

                {showWind && (
                  <div className="flex items-center justify-center gap-1 text-gray-600">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                    <span>{day.wind.speed} km/h</span>
                  </div>
                )}

                {showUVIndex && day.uvIndex > 0 && (
                  <div
                    className={`flex items-center justify-center gap-1 ${getUVIndexColor(day.uvIndex)}`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                    <span>{day.uvIndex}</span>
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    );
  };

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      {/* Carousel header */}
      <div className="mb-4 text-center">
        <h2 className="text-xl font-semibold text-gray-900">{t('weather:forecast.title')}</h2>
        <p className="text-sm text-gray-600 mt-1">{t('weather:forecast.subtitle')}</p>
      </div>

      {/* Forecast carousel */}
      <Carousel
        align="center"
        autoplay={autoplay}
        autoplayInterval={6000}
        className="w-full max-w-7xl mx-auto"
        infinite={false}
        itemsPerPage={responsiveItemsPerPage}
        keyboardNavigation={true}
        showControls={forecast.length > responsiveItemsPerPage}
        showDots={forecast.length > responsiveItemsPerPage}
        spacing="lg"
        touchNavigation={true}
      >
        {forecast.map((day, index) => renderForecastCard(day, index))}
      </Carousel>
    </div>
  );
};

export default ForecastCarousel;
