/**
 * AQI Detail Card Component
 * Displays Air Quality Index with health advice and pollutant breakdown.
 *
 * The card is clickable and opens an accessible modal with expanded
 * air quality information while still providing at-a-glance details
 * directly in the dashboard.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import AQIMeter from './AQIMeter';
import AirQualityDetailModal from './AirQualityDetailModal';
import WeatherDetailCard from '@/components/ui/weather/display/WeatherDetailCard';
import { formatPollutantValue } from '@/services/airQualityService';
import type { AirQualityData } from '@/types/airQuality';

export interface AQIDetailCardProps {
  airQuality: AirQualityData;
  animationDelay?: number;
  animationType?: string;
  animationDuration?: number;
  className?: string;
}

const AQIDetailCard: React.FC<AQIDetailCardProps> = ({
  airQuality,
  animationDelay = 0,
  animationType = 'fadeInUp',
  animationDuration = 600,
  className = '',
}) => {
  const { t } = useTranslation(['weather']);
  const [showDetails, setShowDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    aqi,
    standard,
    category,
    color,
    description,
    healthAdvice,
    pollutants,
    dominantPollutant,
  } = airQuality;

  // Get dynamic text color based on AQI level
  const getTextColor = (): string => {
    if (aqi <= 20 || (standard === 'us' && aqi <= 50)) return 'text-green-600 dark:text-green-400';
    if (aqi <= 40 || (standard === 'us' && aqi <= 100))
      return 'text-yellow-600 dark:text-yellow-400';
    if (aqi <= 60 || (standard === 'us' && aqi <= 150))
      return 'text-orange-600 dark:text-orange-400';
    if (aqi <= 80 || (standard === 'us' && aqi <= 200)) return 'text-red-600 dark:text-red-400';
    return 'text-purple-600 dark:text-purple-400';
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <article
        onClick={handleCardClick}
        className="h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 rounded-lg transition-all hover:shadow-lg"
        aria-label={t(
          'weather:airQuality.cardAriaLabel',
          'Click to view detailed air quality information'
        )}
        data-testid="aqi-detail-card"
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
          icon="🌫️"
          textColor={getTextColor()}
          themeAware={true}
          title="Air Quality"
          value={Math.round(aqi).toString()}
        >
          <div className="space-y-4">
            {/* AQI Meter */}
            <AQIMeter
              aqi={aqi}
              className="w-full"
              showCategory={true}
              showGauge={true}
              showProgressBar={true}
              showValue={false}
              size="sm"
              standard={standard}
            />

            {/* Category and Description */}
            <div className="text-center">
              <div className="text-sm font-semibold mb-1" style={{ color }}>
                {category}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{description}</div>
            </div>

            {/* Dominant Pollutant */}
            {dominantPollutant && (
              <div className="text-center py-2 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Primary Pollutant
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {dominantPollutant}
                </div>
              </div>
            )}

            {/* Open details button for accessible modal trigger */}
            <div className="flex justify-center">
              <button
                type="button"
                className="mt-2 inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={event => {
                  event.stopPropagation();
                  handleCardClick();
                }}
                aria-label={t(
                  'weather:airQuality.cardAriaLabel',
                  'Click to view detailed air quality information'
                )}
                aria-expanded={isModalOpen ? 'true' : 'false'}
              >
                {t('weather:airQuality.viewDetailsButton', 'View detailed air quality information')}
              </button>
            </div>

            {/* Health Advice - Collapsible */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <button
                className="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                onClick={event => {
                  event.stopPropagation();
                  setShowDetails(!showDetails);
                }}
                type="button"
                aria-expanded={showDetails ? 'true' : 'false'}
              >
                <span>Health Advice</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M19 9l-7 7-7-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>

              {showDetails && (
                <div className="mt-3 space-y-3 text-xs text-gray-600 dark:text-gray-400 animate-fadeIn">
                  {/* General Population */}
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
                    <div className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                      👥 General Population
                    </div>
                    <div>{healthAdvice.general}</div>
                  </div>

                  {/* Sensitive Groups */}
                  <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded">
                    <div className="font-semibold text-amber-900 dark:text-amber-300 mb-1">
                      ⚠️ Sensitive Groups
                    </div>
                    <div>{healthAdvice.sensitive}</div>
                  </div>

                  {/* Outdoor Activities */}
                  <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded">
                    <div className="font-semibold text-green-900 dark:text-green-300 mb-1">
                      🏃 Outdoor Activities
                    </div>
                    <div>{healthAdvice.outdoor}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Pollutants Breakdown - Collapsible */}
            {Object.keys(pollutants).length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <button
                  className="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  onClick={event => {
                    event.stopPropagation();
                    setShowDetails(!showDetails);
                  }}
                  type="button"
                  aria-expanded={showDetails ? 'true' : 'false'}
                >
                  <span>Pollutant Details</span>
                  <span className="text-xs text-gray-500">
                    {Object.keys(pollutants).length} pollutants
                  </span>
                </button>

                {showDetails && (
                  <div className="mt-3 space-y-2 animate-fadeIn">
                    {Object.entries(pollutants).map(([key, pollutant]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded text-xs"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {pollutant.name}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {pollutant.description}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatPollutantValue(pollutant)}
                          </div>
                          <div
                            className="text-xs font-medium"
                            style={{
                              color:
                                pollutant.level === 'Low' || pollutant.level === 'Good'
                                  ? '#10b981'
                                  : pollutant.level === 'Moderate'
                                    ? '#f59e0b'
                                    : '#ef4444',
                            }}
                          >
                            {pollutant.level}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Standard Indicator */}
            <div className="text-center text-xs text-gray-400 dark:text-gray-500">
              {standard === 'european' ? 'European AQI' : 'US AQI'} Standard
            </div>
          </div>
        </WeatherDetailCard>
      </article>

      <AirQualityDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        airQuality={airQuality}
      />
    </>
  );
};

export default AQIDetailCard;
