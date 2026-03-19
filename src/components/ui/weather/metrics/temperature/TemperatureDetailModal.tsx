/**
 * TemperatureDetailModal Component
 *
 * A detailed modal view for temperature information with comprehensive breakdown
 * including current temperature, feels like, min/max, comfort level, and temperature scale.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

import { AccessibleModal } from '@/components/ui/molecules';
import TemperatureGauge from './TemperatureGauge';
import { useTheme } from '@/design-system/theme';
import type { TemperatureData } from '@/types/weather';

export interface TemperatureDetailModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Temperature data */
  temperature: TemperatureData;
  /** Temperature unit */
  temperatureUnit: 'C' | 'F';
  /** Function to get localized temperature */
  getLocalizedTemperature: (temp: number) => string;
}

const TemperatureDetailModal: React.FC<TemperatureDetailModalProps> = ({
  isOpen,
  onClose,
  temperature,
  temperatureUnit,
  getLocalizedTemperature,
}) => {
  const { t } = useTranslation(['weather']);
  const { _theme } = useTheme();

  // Get temperature comfort level and color
  const getTemperatureInfo = (temp: number, tempUnit: 'C' | 'F') => {
    const celsius = tempUnit === 'C' ? temp : ((temp - 32) * 5) / 9;

    if (celsius < 0) {
      return {
        level: t('weather:temperature.freezing', 'Freezing'),
        color: 'text-blue-700',
        bgColor: 'bg-blue-600',
        description: t(
          'weather:temperature.freezingDescription',
          'Very cold - freezing conditions'
        ),
      };
    } else if (celsius < 10) {
      return {
        level: t('weather:temperature.cold', 'Cold'),
        color: 'text-blue-600',
        bgColor: 'bg-blue-500',
        description: t('weather:temperature.coldDescription', 'Cold - dress warmly'),
      };
    } else if (celsius < 18) {
      return {
        level: t('weather:temperature.cool', 'Cool'),
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-500',
        description: t('weather:temperature.coolDescription', 'Cool - light jacket recommended'),
      };
    } else if (celsius >= 18 && celsius <= 25) {
      return {
        level: t('weather:temperature.comfortable', 'Comfortable'),
        color: 'text-green-600',
        bgColor: 'bg-green-500',
        description: t('weather:temperature.comfortableDescription', 'Perfect temperature'),
      };
    } else if (celsius <= 30) {
      return {
        level: t('weather:temperature.warm', 'Warm'),
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-500',
        description: t('weather:temperature.warmDescription', 'Warm - comfortable for most'),
      };
    } else if (celsius <= 38) {
      return {
        level: t('weather:temperature.hot', 'Hot'),
        color: 'text-orange-600',
        bgColor: 'bg-orange-500',
        description: t('weather:temperature.hotDescription', 'Hot - stay hydrated'),
      };
    } else {
      return {
        level: t('weather:temperature.extreme', 'Extreme'),
        color: 'text-red-600',
        bgColor: 'bg-red-500',
        description: t(
          'weather:temperature.extremeDescription',
          'Extremely hot - take precautions'
        ),
      };
    }
  };

  const tempInfo = getTemperatureInfo(temperature.current, temperatureUnit);

  // Convert temperature to the other unit for comparison
  const convertTemperature = (temp: number, fromUnit: 'C' | 'F', toUnit: 'C' | 'F') => {
    if (fromUnit === toUnit) return temp;
    if (toUnit === 'F') {
      return (temp * 9) / 5 + 32;
    } else {
      return ((temp - 32) * 5) / 9;
    }
  };

  const otherUnit = temperatureUnit === 'C' ? 'F' : 'C';
  const currentInOtherUnit = convertTemperature(temperature.current, temperatureUnit, otherUnit);
  const feelsLikeInOtherUnit = temperature.feelsLike
    ? convertTemperature(temperature.feelsLike, temperatureUnit, otherUnit)
    : null;

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('weather:labels.temperature', 'Temperature')}
      size="lg"
      closeOnBackdropClick={true}
      closeOnEscape={true}
      className="temperature-detail-modal"
    >
      <div className="space-y-6 p-2">
        {/* Large Temperature Gauge */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <TemperatureGauge
              className="w-full"
              maxTemp={temperature.max}
              minTemp={temperature.min}
              showComfortLevel={true}
              showGauge={true}
              showRange={true}
              showValue={true}
              size="lg"
              temperature={temperature.current}
              unit={temperatureUnit}
            />
          </div>
        </div>

        {/* Comfort Level Badge */}
        <div className="flex justify-center">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${tempInfo.bgColor} text-white font-semibold shadow-md`}
          >
            <span className="text-2xl">🌡️</span>
            <span>{tempInfo.level}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-center text-[var(--theme-text-secondary)] text-sm">
          {tempInfo.description}
        </p>

        {/* Temperature Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Current Temperature */}
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-lg p-4">
            <h4 className="text-sm font-semibold text-[var(--theme-text-secondary)] mb-2">
              {t('weather:labels.temperature', 'Temperature')}
            </h4>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-[var(--theme-text)]">
                {getLocalizedTemperature(temperature.current).replace(/[°CF]/g, '')}°
                {temperatureUnit}
              </p>
              <p className="text-sm text-[var(--theme-text-secondary)]">
                {Math.round(currentInOtherUnit)}°{otherUnit}
              </p>
            </div>
          </div>

          {/* Feels Like */}
          {temperature.feelsLike && (
            <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-lg p-4">
              <h4 className="text-sm font-semibold text-[var(--theme-text-secondary)] mb-2">
                {t('weather:labels.feelsLike', 'Feels Like')}
              </h4>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-[var(--theme-text)]">
                  {getLocalizedTemperature(temperature.feelsLike).replace(/[°CF]/g, '')}°
                  {temperatureUnit}
                </p>
                {feelsLikeInOtherUnit && (
                  <p className="text-sm text-[var(--theme-text-secondary)]">
                    {Math.round(feelsLikeInOtherUnit)}°{otherUnit}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Min Temperature */}
          {temperature.min !== undefined && (
            <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-lg p-4">
              <h4 className="text-sm font-semibold text-[var(--theme-text-secondary)] mb-2 flex items-center gap-2">
                <span className="text-blue-500">↘</span>
                {t('weather:labels.minTemp', 'Minimum')}
              </h4>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-[var(--theme-text)]">
                  {getLocalizedTemperature(temperature.min).replace(/[°CF]/g, '')}°{temperatureUnit}
                </p>
                <p className="text-sm text-[var(--theme-text-secondary)]">
                  {Math.round(convertTemperature(temperature.min, temperatureUnit, otherUnit))}°
                  {otherUnit}
                </p>
              </div>
            </div>
          )}

          {/* Max Temperature */}
          {temperature.max !== undefined && (
            <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-lg p-4">
              <h4 className="text-sm font-semibold text-[var(--theme-text-secondary)] mb-2 flex items-center gap-2">
                <span className="text-red-500">↗</span>
                {t('weather:labels.maxTemp', 'Maximum')}
              </h4>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-[var(--theme-text)]">
                  {getLocalizedTemperature(temperature.max).replace(/[°CF]/g, '')}°{temperatureUnit}
                </p>
                <p className="text-sm text-[var(--theme-text-secondary)]">
                  {Math.round(convertTemperature(temperature.max, temperatureUnit, otherUnit))}°
                  {otherUnit}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Temperature Range */}
        {temperature.min !== undefined && temperature.max !== undefined && (
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-lg p-4">
            <h4 className="text-sm font-semibold text-[var(--theme-text-secondary)] mb-3">
              {t('weather:labels.temperatureRange', 'Temperature Range')}
            </h4>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--theme-text)]">
                {getLocalizedTemperature(temperature.min).replace(/[°CF]/g, '')}°{temperatureUnit}
              </span>
              <div className="flex-1 mx-4 h-2 bg-gradient-to-r from-blue-500 via-green-500 to-red-500 rounded-full" />
              <span className="text-[var(--theme-text)]">
                {getLocalizedTemperature(temperature.max).replace(/[°CF]/g, '')}°{temperatureUnit}
              </span>
            </div>
            <p className="text-xs text-[var(--theme-text-secondary)] mt-2 text-center">
              {t('weather:labels.temperatureVariation', 'Variation')}:{' '}
              {Math.round(temperature.max - temperature.min)}°{temperatureUnit}
            </p>
          </div>
        )}

        {/* Info Note */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-xs text-blue-800 dark:text-blue-300 text-center">
            💡{' '}
            {t(
              'weather:temperature.modalInfo',
              'Temperature values are displayed in both Celsius and Fahrenheit for your convenience.'
            )}
          </p>
        </div>
      </div>
    </AccessibleModal>
  );
};

export default TemperatureDetailModal;
