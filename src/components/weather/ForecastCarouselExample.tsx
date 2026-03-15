/**
 * ForecastCarousel Example Component
 * Demonstrates how to integrate the ForecastCarousel component into the main app
 * with real weather data and proper configuration
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getLogger } from '@/utils/logger';

import type { ForecastDay } from '../types/weather';

import { Box, Container, Stack } from '@/components/ui/layout';
import ForecastCarousel from '@/components/ui/weather/forecast/ForecastCarousel';

const logger = getLogger('Components:ForecastCarouselExample');

export interface ForecastCarouselExampleProps {
  /** Forecast data */
  forecast: ForecastDay[];
  /** Current temperature unit */
  temperatureUnit: 'C' | 'F';
  /** Function to toggle temperature unit */
  toggleTemperatureUnit: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: string | null;
}

const ForecastCarouselExample: React.FC<ForecastCarouselExampleProps> = ({
  forecast,
  temperatureUnit,
  toggleTemperatureUnit,
  isLoading = false,
  error = null,
}) => {
  const { t, i18n } = useTranslation(['weather', 'common']);
  const [selectedDay, setSelectedDay] = useState<ForecastDay | null>(null);

  // Utility functions for localization
  const getLocalizedTemperature = (temp: number): string => {
    if (temperatureUnit === 'F') {
      const fahrenheit = Math.round((temp * 9) / 5 + 32);
      return `${fahrenheit}°F`;
    }
    return `${temp}°C`;
  };

  const getLocalizedWeatherDescription = (code: number): string => {
    return t(`weather:conditions.${code}`, {
      defaultValue: 'Unknown weather',
    });
  };

  const formatWeekday = (date: string, format: 'short' | 'long' = 'short'): string => {
    const dateObj = new Date(date);
    const locale = i18n.language;

    if (format === 'short') {
      return dateObj.toLocaleDateString(locale, { weekday: 'short' });
    }
    return dateObj.toLocaleDateString(locale, { weekday: 'long' });
  };

  // Handle day selection
  const handleDaySelect = (day: ForecastDay, index: number) => {
    setSelectedDay(day);
    logger.info('Selected forecast day', { day, index });
  };

  // Loading state
  if (isLoading) {
    return (
      <Container className="py-8" maxWidth="lg">
        <Box className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common:loading')}</p>
        </Box>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container className="py-8" maxWidth="lg">
        <Box className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <p className="text-red-600 mb-2">{t('weather:errors.forecastLoadError')}</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </Box>
      </Container>
    );
  }

  // Empty state
  if (forecast.length === 0) {
    return (
      <Container className="py-8" maxWidth="lg">
        <Box className="text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <p className="text-gray-600">{t('weather:errors.noForecastData')}</p>
        </Box>
      </Container>
    );
  }

  return (
    <Container className="py-8" maxWidth="lg">
      <Stack spacing={6}>
        {/* Header */}
        <Box className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('weather:forecast.7dayTitle')}
          </h1>
          <p className="text-gray-600 mb-4">{t('weather:forecast.7daySubtitle')}</p>

          {/* Temperature unit toggle */}
          <button
            className="
              inline-flex items-center px-4 py-2 border border-gray-300 rounded-md
              bg-white text-sm font-medium text-gray-700
              hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              transition-colors duration-200
            "
            onClick={toggleTemperatureUnit}
          >
            <span className="mr-2">
              {t('weather:temperature.unit')}: {temperatureUnit}
            </span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>
        </Box>

        {/* Main forecast carousel */}
        <Box>
          <ForecastCarousel
            autoplay={false}
            forecast={forecast}
            formatWeekday={formatWeekday}
            getLocalizedTemperature={getLocalizedTemperature}
            getLocalizedWeatherDescription={getLocalizedWeatherDescription}
            showPrecipitation={true}
            showTrends={true}
            showUVIndex={false}
            showWind={false}
            size="md"
            temperatureUnit={temperatureUnit}
            variant="default"
            onDaySelect={handleDaySelect}
          />
        </Box>

        {/* Selected day details */}
        {selectedDay && (
          <Box className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              {t('weather:forecast.selectedDayDetails')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-1">{t('weather:forecast.date')}</h3>
                <p className="text-gray-900">{formatWeekday(selectedDay.date, 'long')}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-1">
                  {t('weather:forecast.condition')}
                </h3>
                <p className="text-gray-900">
                  {getLocalizedWeatherDescription(selectedDay.condition.code)}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-1">
                  {t('weather:forecast.temperature')}
                </h3>
                <p className="text-gray-900">
                  {getLocalizedTemperature(selectedDay.temperature.minimum)} -{' '}
                  {getLocalizedTemperature(selectedDay.temperature.maximum)}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-1">{t('weather:forecast.humidity')}</h3>
                <p className="text-gray-900">{selectedDay.humidity}%</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-1">{t('weather:forecast.wind')}</h3>
                <p className="text-gray-900">{selectedDay.wind.speed} km/h</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-1">
                  {t('weather:forecast.precipitation')}
                </h3>
                <p className="text-gray-900">{selectedDay.precipitationProbability}%</p>
              </div>
            </div>
          </Box>
        )}

        {/* Additional features section */}
        <Box className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{t('weather:forecast.features')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 5l7 7-7 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('weather:forecast.swipeNavigation')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('weather:forecast.swipeNavigationDescription')}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M15 19l-7-7 7-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('weather:forecast.keyboardNavigation')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('weather:forecast.keyboardNavigationDescription')}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('weather:forecast.responsiveDesign')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('weather:forecast.responsiveDesignDescription')}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{t('weather:forecast.interactive')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('weather:forecast.interactiveDescription')}
                </p>
              </div>
            </div>
          </div>
        </Box>
      </Stack>
    </Container>
  );
};

export default ForecastCarouselExample;
