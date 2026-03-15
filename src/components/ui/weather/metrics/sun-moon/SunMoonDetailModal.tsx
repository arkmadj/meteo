/**
 * SunMoonDetailModal Component
 * Expanded sun and moon details with astronomical information.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

import AccessibleModal from '@/components/ui/molecules/AccessibleModal';
import { useTheme } from '@/design-system/theme';
import type { AstronomicalData } from '@/types/weather';
import {
  formatDaylightDuration,
  formatSunTime,
  isSunUp,
  MOON_PHASE_INFO,
} from '@/utils/astronomical';

export interface SunMoonDetailModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Astronomical data */
  astronomical: AstronomicalData;
}

const SunMoonDetailModal: React.FC<SunMoonDetailModalProps> = ({
  isOpen,
  onClose,
  astronomical,
}) => {
  const { t } = useTranslation(['weather']);
  const { theme } = useTheme();

  const moonPhaseInfo = MOON_PHASE_INFO[astronomical.moonPhase];
  const sunIsUp = isSunUp(astronomical.sunrise, astronomical.sunset);

  // Calculate solar noon (midpoint between sunrise and sunset)
  const sunriseTime = new Date(astronomical.sunrise);
  const sunsetTime = new Date(astronomical.sunset);
  const solarNoonTime = new Date((sunriseTime.getTime() + sunsetTime.getTime()) / 2);
  const solarNoon = solarNoonTime.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate night duration (24 hours - daylight duration)
  const nightDuration = 24 * 60 - astronomical.daylightDuration;

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('weather:labels.sunAndMoon', 'Sun & Moon')}
      size="lg"
      closeOnBackdropClick={true}
      closeOnEscape={true}
      className="sun-moon-detail-modal"
    >
      <div className="space-y-6 p-2">
        {/* Current Status Banner */}
        <div
          className="rounded-lg p-4 border text-center"
          style={{
            backgroundColor: theme.isDark
              ? sunIsUp
                ? 'rgba(251, 191, 36, 0.15)'
                : 'rgba(99, 102, 241, 0.15)'
              : sunIsUp
                ? 'rgba(251, 191, 36, 0.1)'
                : 'rgba(99, 102, 241, 0.1)',
            borderColor: theme.isDark
              ? sunIsUp
                ? 'rgba(251, 191, 36, 0.4)'
                : 'rgba(99, 102, 241, 0.4)'
              : sunIsUp
                ? 'rgba(251, 191, 36, 0.3)'
                : 'rgba(99, 102, 241, 0.3)',
          }}
        >
          <span className="text-4xl">{sunIsUp ? '☀️' : '🌙'}</span>
          <p className="text-lg font-semibold text-[var(--theme-text)] mt-2">
            {sunIsUp
              ? t('weather:sunMoon.currentlyDaytime', 'Currently Daytime')
              : t('weather:sunMoon.currentlyNighttime', 'Currently Nighttime')}
          </p>
        </div>

        {/* Sun Times Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-[var(--theme-text)] flex items-center gap-2">
            <span>☀️</span>
            <span>{t('weather:sunMoon.sunTimes', 'Sun Times')}</span>
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {/* Sunrise */}
            <div
              className={`rounded-lg p-3 text-center ${
                theme.isDark ? 'bg-amber-900/20' : 'bg-amber-50'
              }`}
            >
              <span className="text-2xl">🌅</span>
              <p className={`text-xs mt-1 ${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('weather:labels.sunrise', 'Sunrise')}
              </p>
              <p className="text-sm font-semibold text-[var(--theme-text)]">
                {formatSunTime(astronomical.sunrise)}
              </p>
            </div>

            {/* Solar Noon */}
            <div
              className={`rounded-lg p-3 text-center ${
                theme.isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'
              }`}
            >
              <span className="text-2xl">☀️</span>
              <p className={`text-xs mt-1 ${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('weather:sunMoon.solarNoon', 'Solar Noon')}
              </p>
              <p className="text-sm font-semibold text-[var(--theme-text)]">{solarNoon}</p>
            </div>

            {/* Sunset */}
            <div
              className={`rounded-lg p-3 text-center ${
                theme.isDark ? 'bg-orange-900/20' : 'bg-orange-50'
              }`}
            >
              <span className="text-2xl">🌇</span>
              <p className={`text-xs mt-1 ${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('weather:labels.sunset', 'Sunset')}
              </p>
              <p className="text-sm font-semibold text-[var(--theme-text)]">
                {formatSunTime(astronomical.sunset)}
              </p>
            </div>
          </div>
        </div>

        {/* Daylight Duration Visual */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--theme-text-secondary)]">
              {t('weather:labels.daylightDuration', 'Daylight')}
            </span>
            <span className="font-semibold text-[var(--theme-text)]">
              {formatDaylightDuration(astronomical.daylightDuration)}
            </span>
          </div>
          {/* Progress bar showing daylight vs night ratio */}
          <div className="h-3 rounded-full overflow-hidden flex bg-gray-200 dark:bg-gray-700">
            <div
              className="bg-gradient-to-r from-amber-400 to-yellow-500 transition-all"
              style={{
                width: `${(astronomical.daylightDuration / (24 * 60)) * 100}%`,
              }}
            />
            <div
              className="bg-gradient-to-r from-indigo-600 to-purple-700"
              style={{ width: `${(nightDuration / (24 * 60)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[var(--theme-text-secondary)]">
            <span>☀️ {formatDaylightDuration(astronomical.daylightDuration)}</span>
            <span>{formatDaylightDuration(nightDuration)} 🌙</span>
          </div>
        </div>

        {/* Moon Phase Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-[var(--theme-text)] flex items-center gap-2">
            <span>🌙</span>
            <span>{t('weather:sunMoon.moonPhase', 'Moon Phase')}</span>
          </h3>

          <div className={`rounded-lg p-4 ${theme.isDark ? 'bg-indigo-900/20' : 'bg-indigo-50'}`}>
            <div className="flex items-center gap-4">
              <span className="text-5xl">{moonPhaseInfo.emoji}</span>
              <div className="flex-1">
                <p className="text-lg font-semibold text-[var(--theme-text)]">
                  {moonPhaseInfo.name}
                </p>
                <p className="text-sm text-[var(--theme-text-secondary)]">
                  {moonPhaseInfo.description}
                </p>
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--theme-text-secondary)]">
                      {t('weather:labels.illumination', 'Illumination')}:
                    </span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-gray-400 to-white dark:from-gray-500 dark:to-gray-200"
                        style={{ width: `${astronomical.moonIllumination}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-[var(--theme-text)]">
                      {astronomical.moonIllumination}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Moon Phase Cycle */}
        <div className="space-y-2">
          <p className="text-sm text-[var(--theme-text-secondary)]">
            {t('weather:sunMoon.lunarCycle', 'Lunar Cycle')}
          </p>
          <div className="flex justify-between items-center">
            {Object.entries(MOON_PHASE_INFO).map(([phase, info]) => (
              <div
                key={phase}
                className={`flex flex-col items-center p-1 rounded ${
                  phase === astronomical.moonPhase
                    ? theme.isDark
                      ? 'bg-indigo-800/50 ring-2 ring-indigo-500'
                      : 'bg-indigo-100 ring-2 ring-indigo-400'
                    : ''
                }`}
              >
                <span className="text-lg">{info.emoji}</span>
                <span
                  className={`text-[8px] mt-0.5 ${
                    phase === astronomical.moonPhase
                      ? 'text-[var(--theme-text)] font-semibold'
                      : 'text-[var(--theme-text-secondary)]'
                  }`}
                >
                  {info.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info Note */}
        <div className="rounded-lg p-3 border border-dashed">
          <p className="text-xs text-[var(--theme-text-secondary)] text-center">
            {t(
              'weather:sunMoon.infoNote',
              'Sun times are based on your location. Moon phase data is calculated astronomically and represents the current lunar cycle.'
            )}
          </p>
        </div>
      </div>
    </AccessibleModal>
  );
};

export default SunMoonDetailModal;
