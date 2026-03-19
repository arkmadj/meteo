/**
 * AirQualityDetailModal Component
 * Expanded air quality details with health guidance and pollutant breakdown.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

import AQIMeter from './AQIMeter';
import AccessibleModal from '@/components/ui/molecules/AccessibleModal';
import { useTheme } from '@/design-system/theme';
import type { AirQualityData } from '@/types/airQuality';
import { formatPollutantValue } from '@/services/airQualityService';

export interface AirQualityDetailModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Complete air quality data for the current location */
  airQuality: AirQualityData;
}

const AirQualityDetailModal: React.FC<AirQualityDetailModalProps> = ({
  isOpen,
  onClose,
  airQuality,
}) => {
  const { t } = useTranslation(['weather']);
  const { theme } = useTheme();

  const {
    aqi,
    standard,
    category,
    color,
    description,
    healthAdvice,
    pollutants,
    dominantPollutant,
    lastUpdated,
  } = airQuality;

  const isEuropeanStandard = standard === 'european';
  const pollutantEntries = Object.entries(pollutants);

  const cardBackground = theme.isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.96)';
  const highlightBorder = theme.isDark ? 'rgba(59, 130, 246, 0.7)' : 'rgba(37, 99, 235, 0.85)';
  const subtleBorder = theme.isDark ? 'rgba(51, 65, 85, 0.9)' : 'rgba(226, 232, 240, 0.9)';

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('weather:labels.airQuality', 'Air Quality')}
      size="lg"
      closeOnBackdropClick={true}
      closeOnEscape={true}
      className="air-quality-detail-modal"
    >
      <div className="space-y-6 p-2">
        {/* Large AQI meter */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <AQIMeter
              aqi={aqi}
              standard={standard}
              className="w-full"
              size="lg"
              showGauge={true}
              showProgressBar={true}
              showValue={true}
              showCategory={true}
            />
          </div>
        </div>

        {/* Current air quality status */}
        <div
          className="rounded-lg border p-4"
          style={{
            backgroundColor: cardBackground,
            borderColor: highlightBorder,
          }}
        >
          <h3 className="mb-1 text-lg font-semibold text-[var(--theme-text)]">
            {t('weather:labels.airQuality', 'Current air quality')}
            <span className="ml-1" style={{ color }}>
              {category}
            </span>
            <span className="ml-2 text-sm text-[var(--theme-text-secondary)]">
              ({Math.round(aqi)})
            </span>
          </h3>
          <p className="text-sm text-[var(--theme-text-secondary)]">{description}</p>

          {dominantPollutant && (
            <p className="mt-2 text-xs text-[var(--theme-text-secondary)]">
              <span className="font-medium text-[var(--theme-text)]">
                {t('weather:airQuality.dominantPollutantLabel', 'Dominant pollutant')}:
              </span>{' '}
              {dominantPollutant}
            </p>
          )}

          <p className="mt-2 text-xs text-[var(--theme-text-secondary)]">
            <span className="font-medium">
              {isEuropeanStandard
                ? t('weather:airQuality.standardEuropean', 'European AQI standard')
                : t('weather:airQuality.standardUS', 'US AQI standard')}
            </span>
            {lastUpdated && (
              <>
                <span className="mx-1">•</span>
                <span>
                  {t('weather:labels.lastUpdated', 'Last updated')}: {lastUpdated}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Health guidance */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-[var(--theme-text)]">
            <span>💡</span>
            <span>{t('weather:airQuality.healthAdviceHeading', 'Health guidance')}</span>
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div
              className="rounded-lg border p-3 text-xs"
              style={{
                backgroundColor: theme.isDark
                  ? 'rgba(30, 64, 175, 0.35)'
                  : 'rgba(219, 234, 254, 0.95)',
                borderColor: subtleBorder,
              }}
            >
              <div className="mb-1 font-semibold text-[var(--theme-text)]">
                👥 {t('weather:airQuality.generalPopulation', 'General population')}
              </div>
              <p className="text-[var(--theme-text-secondary)]">{healthAdvice.general}</p>
            </div>

            <div
              className="rounded-lg border p-3 text-xs"
              style={{
                backgroundColor: theme.isDark
                  ? 'rgba(120, 53, 15, 0.4)'
                  : 'rgba(255, 237, 213, 0.96)',
                borderColor: subtleBorder,
              }}
            >
              <div className="mb-1 font-semibold text-[var(--theme-text)]">
                ⚠️ {t('weather:airQuality.sensitiveGroups', 'Sensitive groups')}
              </div>
              <p className="text-[var(--theme-text-secondary)]">{healthAdvice.sensitive}</p>
            </div>

            <div
              className="rounded-lg border p-3 text-xs"
              style={{
                backgroundColor: theme.isDark
                  ? 'rgba(5, 46, 22, 0.45)'
                  : 'rgba(220, 252, 231, 0.96)',
                borderColor: subtleBorder,
              }}
            >
              <div className="mb-1 font-semibold text-[var(--theme-text)]">
                🏃 {t('weather:airQuality.outdoorActivities', 'Outdoor activities')}
              </div>
              <p className="text-[var(--theme-text-secondary)]">{healthAdvice.outdoor}</p>
            </div>
          </div>
        </div>

        {/* Pollutant breakdown */}
        {pollutantEntries.length > 0 && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-[var(--theme-text)]">
              <span>🫧</span>
              <span>
                {t('weather:airQuality.pollutantBreakdownHeading', 'Pollutant breakdown')}
              </span>
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {pollutantEntries.map(([key, pollutant]) => (
                <div
                  key={key}
                  className="rounded-lg border p-3 text-xs"
                  style={{
                    backgroundColor: cardBackground,
                    borderColor: subtleBorder,
                  }}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <div className="font-semibold text-[var(--theme-text)]">{pollutant.name}</div>
                    <div className="text-sm font-semibold text-[var(--theme-text)]">
                      {formatPollutantValue(pollutant)}
                    </div>
                  </div>
                  <p className="mb-2 text-[var(--theme-text-secondary)]">{pollutant.description}</p>
                  <div className="flex items-center justify-between text-[var(--theme-text-secondary)]">
                    <span className="text-xs">{t('weather:airQuality.levelLabel', 'Level')}</span>
                    <span
                      className="text-xs font-semibold"
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
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AQI scale note */}
        <div className="rounded-lg border border-dashed p-3">
          <p className="text-center text-xs text-[var(--theme-text-secondary)]">
            {isEuropeanStandard
              ? t(
                  'weather:airQuality.scaleNoteEuropean',
                  'European AQI typically ranges from 0 (Good) to 100+ (Extremely Poor) and reflects the highest impact pollutant at this location.'
                )
              : t(
                  'weather:airQuality.scaleNoteUS',
                  'US AQI ranges from 0 (Good) to 500 (Hazardous) and indicates the highest health risk from key pollutants at this location.'
                )}
          </p>
        </div>
      </div>
    </AccessibleModal>
  );
};

export default AirQualityDetailModal;
