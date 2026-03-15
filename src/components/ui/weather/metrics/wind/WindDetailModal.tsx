/**
 * WindDetailModal Component
 * Displays detailed wind information in a modal overlay
 * Includes large compass, wind speed scale, gust information, and directional details
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

import DualWindCompass from './DualWindCompass';
import WindGustIndicator from './WindGustIndicator';
import { AccessibleModal } from '@/components/ui/molecules';
import { useTheme } from '@/design-system/theme';
import { useWindSpeedUnit } from '@/hooks/useWindSpeedUnit';
import type { WindData } from '@/types/weather';

export interface WindDetailModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Wind data */
  wind: WindData;
}

const WindDetailModal: React.FC<WindDetailModalProps> = ({ isOpen, onClose, wind }) => {
  const { t } = useTranslation(['weather']);
  const { theme } = useTheme();
  const { formatWindSpeed } = useWindSpeedUnit();

  // Convert wind direction to compass direction
  const getWindDirectionText = (degrees: number): string => {
    const directions = [
      'N',
      'NNE',
      'NE',
      'ENE',
      'E',
      'ESE',
      'SE',
      'SSE',
      'S',
      'SSW',
      'SW',
      'WSW',
      'W',
      'WNW',
      'NW',
      'NNW',
    ];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  // Get wind speed category based on Beaufort scale (m/s)
  const getWindSpeedCategory = (speed: number) => {
    if (speed < 0.5) {
      return {
        level: t('weather:wind.calm', 'Calm'),
        color: 'text-gray-600',
        bgColor: 'bg-gray-500',
        description: t('weather:wind.calmDescription', 'No wind movement'),
      };
    } else if (speed < 1.6) {
      return {
        level: t('weather:wind.lightAir', 'Light Air'),
        color: 'text-blue-600',
        bgColor: 'bg-blue-500',
        description: t('weather:wind.lightAirDescription', 'Barely perceptible wind'),
      };
    } else if (speed < 3.4) {
      return {
        level: t('weather:wind.lightBreeze', 'Light Breeze'),
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-500',
        description: t('weather:wind.lightBreezeDescription', 'Light wind felt on face'),
      };
    } else if (speed < 5.5) {
      return {
        level: t('weather:wind.gentleBreeze', 'Gentle Breeze'),
        color: 'text-green-600',
        bgColor: 'bg-green-500',
        description: t('weather:wind.gentleBreezeDescription', 'Pleasant breeze'),
      };
    } else if (speed < 8.0) {
      return {
        level: t('weather:wind.moderateBreeze', 'Moderate Breeze'),
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-500',
        description: t('weather:wind.moderateBreezeDescription', 'Moderate wind movement'),
      };
    } else if (speed < 10.8) {
      return {
        level: t('weather:wind.freshBreeze', 'Fresh Breeze'),
        color: 'text-orange-600',
        bgColor: 'bg-orange-500',
        description: t('weather:wind.freshBreezeDescription', 'Fresh breeze - small trees sway'),
      };
    } else if (speed < 13.9) {
      return {
        level: t('weather:wind.strongBreeze', 'Strong Breeze'),
        color: 'text-red-600',
        bgColor: 'bg-red-500',
        description: t(
          'weather:wind.strongBreezeDescription',
          'Strong breeze - large branches move'
        ),
      };
    } else {
      return {
        level: t('weather:wind.highWind', 'High Wind'),
        color: 'text-red-700',
        bgColor: 'bg-red-600',
        description: t('weather:wind.highWindDescription', 'High wind - whole trees in motion'),
      };
    }
  };

  const windCategory = getWindSpeedCategory(wind.speed);
  const windDirectionText = getWindDirectionText(wind.direction);
  const gustDirectionText = wind.gustDirection ? getWindDirectionText(wind.gustDirection) : null;

  // Calculate direction difference
  const getDirectionDifference = (dir1: number, dir2: number): number => {
    let diff = Math.abs(dir1 - dir2);
    if (diff > 180) diff = 360 - diff;
    return diff;
  };

  const directionDifference =
    wind.gustDirection !== undefined
      ? getDirectionDifference(wind.direction, wind.gustDirection)
      : 0;

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('weather:labels.wind', 'Wind')}
      size="lg"
      closeOnBackdropClick={true}
      closeOnEscape={true}
      className="wind-detail-modal"
    >
      <div className="space-y-6 p-2">
        {/* Large Wind Compass */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <DualWindCompass
              className="w-full"
              gustDirection={wind.gustDirection}
              gustSpeed={wind.gust}
              showCompassLabels={true}
              showDirections={true}
              showLegend={true}
              showSpeedIndicators={true}
              showValues={true}
              size="lg"
              windDirection={wind.direction}
              windSpeed={wind.speed}
            />
          </div>
        </div>

        {/* Wind Category Badge */}
        <div className="flex justify-center">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${windCategory.bgColor} text-white font-semibold shadow-md`}
          >
            <span className="text-2xl">💨</span>
            <span>{windCategory.level}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-center text-[var(--theme-text-secondary)] text-sm">
          {windCategory.description}
        </p>

        {/* Wind Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Wind Speed */}
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-lg p-4">
            <h4 className="text-sm font-semibold text-[var(--theme-text-secondary)] mb-2">
              {t('weather:labels.windSpeed', 'Wind Speed')}
            </h4>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-[var(--theme-text)]">
                {formatWindSpeed(wind.speed, { showUnit: true, decimals: 1 })}
              </p>
              <p className="text-xs text-[var(--theme-text-secondary)]">
                {t('weather:wind.sustainedWind', 'Sustained Wind')}
              </p>
            </div>
          </div>

          {/* Wind Direction */}
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-lg p-4">
            <h4 className="text-sm font-semibold text-[var(--theme-text-secondary)] mb-2">
              {t('weather:wind.direction', 'Direction')}
            </h4>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-[var(--theme-text)]">{windDirectionText}</p>
              <p className="text-xs text-[var(--theme-text-secondary)]">
                {wind.direction}°{' '}
                {t('weather:wind.fromDirection', 'From {{direction}}', {
                  direction: windDirectionText,
                })}
              </p>
            </div>
          </div>

          {/* Wind Gust */}
          {wind.gust && wind.gust > wind.speed && (
            <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-lg p-4">
              <h4 className="text-sm font-semibold text-[var(--theme-text-secondary)] mb-2 flex items-center gap-2">
                <span className="text-orange-500">⚡</span>
                {t('weather:wind.windGusts', 'Wind Gusts')}
              </h4>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-[var(--theme-text)]">
                  {formatWindSpeed(wind.gust, { showUnit: true, decimals: 1 })}
                </p>
                <p className="text-xs text-[var(--theme-text-secondary)]">
                  {((wind.gust / wind.speed - 1) * 100).toFixed(0)}%{' '}
                  {t('weather:wind.gustModerate', 'stronger')}
                </p>
              </div>
            </div>
          )}

          {/* Gust Direction */}
          {wind.gustDirection !== undefined && gustDirectionText && (
            <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-lg p-4">
              <h4 className="text-sm font-semibold text-[var(--theme-text-secondary)] mb-2">
                {t('weather:wind.direction', 'Direction')} ({t('weather:wind.windGusts', 'Gusts')})
              </h4>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-[var(--theme-text)]">{gustDirectionText}</p>
                <p className="text-xs text-[var(--theme-text-secondary)]">
                  {wind.gustDirection}° ({directionDifference}°{' '}
                  {t('weather:wind.directionVariation', 'variation')})
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Wind Gust Indicator */}
        {wind.gust && wind.gust > wind.speed && (
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-lg p-4">
            <h4 className="text-sm font-semibold text-[var(--theme-text-secondary)] mb-3">
              {t('weather:wind.gustyConditions', 'Gusty Conditions')}
            </h4>
            <WindGustIndicator
              className="w-full"
              gustSpeed={wind.gust}
              showAnimation={true}
              showGustFactor={true}
              showValues={true}
              size="lg"
              windSpeed={wind.speed}
            />
          </div>
        )}

        {/* Wind Speed Scale Info */}
        <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-lg p-4">
          <h4 className="text-sm font-semibold text-[var(--theme-text-secondary)] mb-3">
            {t('weather:wind.speedScale', 'Wind Speed Scale')}
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[var(--theme-text-secondary)]">
                {t('weather:wind.calm', 'Calm')}
              </span>
              <span className="text-[var(--theme-text)]">&lt; 0.5 m/s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--theme-text-secondary)]">
                {t('weather:wind.lightBreeze', 'Light Breeze')}
              </span>
              <span className="text-[var(--theme-text)]">1.6 - 3.4 m/s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--theme-text-secondary)]">
                {t('weather:wind.moderateBreeze', 'Moderate Breeze')}
              </span>
              <span className="text-[var(--theme-text)]">5.5 - 8.0 m/s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--theme-text-secondary)]">
                {t('weather:wind.strongBreeze', 'Strong Breeze')}
              </span>
              <span className="text-[var(--theme-text)]">10.8 - 13.9 m/s</span>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div
          className="rounded-lg p-3 border"
          style={{
            backgroundColor: theme.isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
            borderColor: theme.isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)',
          }}
        >
          <p
            className="text-xs text-center"
            style={{ color: theme.isDark ? 'rgb(134, 239, 172)' : 'rgb(22, 101, 52)' }}
          >
            💡{' '}
            {t(
              'weather:wind.modalInfo',
              'Wind speeds are displayed in your preferred unit. Direction indicates where the wind is coming from.'
            )}
          </p>
        </div>
      </div>
    </AccessibleModal>
  );
};

export default WindDetailModal;
