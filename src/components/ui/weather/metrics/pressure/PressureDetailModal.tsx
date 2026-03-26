/**
 * PressureDetailModal Component
 * Displays detailed pressure information in a modal overlay
 * Includes large gauge, trends, historical comparison, and weather insights
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

import { AccessibleModal } from '@/components/ui/molecules';
import PressureTrendChart from '@/components/ui/weather/charts/PressureTrendChart';
import PressureHistoryComparison from '@/components/ui/weather/comparison/PressureHistoryComparison';
import { useTheme } from '@/design-system/theme';
import type { PressureHistory } from '@/types/weather';
import PressureGauge from './PressureGauge';

export interface PressureDetailModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Current pressure in hPa */
  pressure: number;
  /** Optional pressure history data */
  pressureHistory?: PressureHistory;
}

/**
 * Get detailed pressure information including category and implications
 */
const getPressureDetails = (pressure: number, t: (key: string, fallback: string) => string) => {
  if (pressure < 980) {
    return {
      level: t('weather:pressure.veryLow', 'Very Low'),
      color: 'text-red-600',
      bgColor: 'rgba(220, 38, 38, 0.1)',
      borderColor: 'rgba(220, 38, 38, 0.3)',
      icon: '🌩️',
      description: t('weather:pressure.veryLowDescription', 'Severe weather conditions expected'),
      implication: t('weather:pressure.veryLowImplication', 'Stormy weather likely'),
    };
  } else if (pressure < 1000) {
    return {
      level: t('weather:pressure.low', 'Low'),
      color: 'text-orange-600',
      bgColor: 'rgba(249, 115, 22, 0.1)',
      borderColor: 'rgba(249, 115, 22, 0.3)',
      icon: '☁️',
      description: t('weather:pressure.lowDescription', 'Cloudy with possible precipitation'),
      implication: t('weather:pressure.lowImplication', 'Unsettled weather'),
    };
  } else if (pressure < 1013) {
    return {
      level: t('weather:pressure.belowNormal', 'Below Normal'),
      color: 'text-yellow-600',
      bgColor: 'rgba(234, 179, 8, 0.1)',
      borderColor: 'rgba(234, 179, 8, 0.3)',
      icon: '🌤️',
      description: t('weather:pressure.belowNormalDescription', 'Variable weather conditions'),
      implication: t('weather:pressure.belowNormalImplication', 'Changing conditions'),
    };
  } else if (pressure <= 1020) {
    return {
      level: t('weather:pressure.normal', 'Normal'),
      color: 'text-green-600',
      bgColor: 'rgba(34, 197, 94, 0.1)',
      borderColor: 'rgba(34, 197, 94, 0.3)',
      icon: '☀️',
      description: t('weather:pressure.normalDescription', 'Stable weather conditions'),
      implication: t('weather:pressure.normalImplication', 'Fair weather'),
    };
  } else if (pressure <= 1040) {
    return {
      level: t('weather:pressure.high', 'High'),
      color: 'text-blue-600',
      bgColor: 'rgba(37, 99, 235, 0.1)',
      borderColor: 'rgba(37, 99, 235, 0.3)',
      icon: '🌞',
      description: t('weather:pressure.highDescription', 'Clear and stable weather'),
      implication: t('weather:pressure.highImplication', 'Clear skies'),
    };
  } else {
    return {
      level: t('weather:pressure.veryHigh', 'Very High'),
      color: 'text-indigo-600',
      bgColor: 'rgba(99, 102, 241, 0.1)',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      icon: '✨',
      description: t('weather:pressure.veryHighDescription', 'Exceptionally clear and dry'),
      implication: t('weather:pressure.veryHighImplication', 'Very clear conditions'),
    };
  }
};

const PressureDetailModal: React.FC<PressureDetailModalProps> = ({
  isOpen,
  onClose,
  pressure,
  pressureHistory,
}) => {
  const { t } = useTranslation(['weather', 'common']);
  const { theme } = useTheme();

  const details = getPressureDetails(pressure, t);

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('weather:labels.pressure', 'Pressure')}
      size="lg"
      closeOnBackdropClick={true}
      closeOnEscape={true}
      className="pressure-detail-modal"
    >
      <div className="space-y-6 p-2">
        {/* Large Pressure Gauge */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <PressureGauge
              className="w-full"
              pressure={pressure}
              pressureHistory={pressureHistory}
              showGauge={true}
              showScale={true}
              showTrend={true}
              showValue={true}
              showWeatherImplications={true}
              size="lg"
            />
          </div>
        </div>

        {/* Current Status */}
        <div
          className="rounded-lg p-4 border"
          style={{
            backgroundColor: theme.isDark ? details.bgColor : details.bgColor,
            borderColor: theme.isDark ? details.borderColor : details.borderColor,
          }}
        >
          <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-2 flex items-center gap-2">
            <span>{details.icon}</span>
            <span>
              {t('weather:pressure.current', 'Current')}: {details.level}
            </span>
          </h3>
          <p className={`${details.color} font-medium mb-1`}>{details.description}</p>
          <p className="text-sm text-[var(--theme-text-secondary)]">{details.implication}</p>
        </div>

        {/* Pressure Trend Chart */}
        {pressureHistory && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[var(--theme-text)] flex items-center gap-2">
              <span>📈</span>
              <span>{t('weather:pressure.trendChart', 'Pressure Trend')}</span>
            </h3>
            <div
              className="rounded-lg p-4 border"
              style={{
                backgroundColor: theme.isDark
                  ? 'rgba(100, 116, 139, 0.1)'
                  : 'rgba(100, 116, 139, 0.05)',
                borderColor: theme.isDark ? 'rgba(100, 116, 139, 0.3)' : 'rgba(100, 116, 139, 0.2)',
              }}
            >
              <PressureTrendChart
                pressureHistory={pressureHistory}
                showTrendLine={true}
                size="md"
                timeRange="24h"
              />
            </div>
          </div>
        )}

        {/* Historical Comparison */}
        {pressureHistory && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[var(--theme-text)] flex items-center gap-2">
              <span>📊</span>
              <span>{t('weather:pressure.historicalComparison', 'Historical Comparison')}</span>
            </h3>
            <div
              className="rounded-lg p-4 border"
              style={{
                backgroundColor: theme.isDark
                  ? 'rgba(100, 116, 139, 0.1)'
                  : 'rgba(100, 116, 139, 0.05)',
                borderColor: theme.isDark ? 'rgba(100, 116, 139, 0.3)' : 'rgba(100, 116, 139, 0.2)',
              }}
            >
              <PressureHistoryComparison
                pressureHistory={pressureHistory}
                showPercentiles={true}
                showSeasonalComparison={true}
                size="md"
              />
            </div>
          </div>
        )}

        {/* Weather Insights */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-[var(--theme-text)] flex items-center gap-2">
            <span>💡</span>
            <span>{t('weather:pressure.insight', 'Pressure Insight')}</span>
          </h3>
          <div className="space-y-2">
            {pressure < 980 && (
              <div className="flex items-start gap-3 text-[var(--theme-text-secondary)] text-sm">
                <span className="text-red-600 mt-0.5">⚠️</span>
                <span>
                  {t('weather:pressure.stormWarning', 'Storm conditions - take precautions')}
                </span>
              </div>
            )}
            {pressure >= 980 && pressure < 1000 && (
              <div className="flex items-start gap-3 text-[var(--theme-text-secondary)] text-sm">
                <span className="text-orange-600 mt-0.5">•</span>
                <span>
                  {t('weather:pressure.unsettledInfo', 'Unsettled weather - expect changes')}
                </span>
              </div>
            )}
            {pressure >= 1000 && pressure <= 1020 && (
              <div className="flex items-start gap-3 text-[var(--theme-text-secondary)] text-sm">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>{t('weather:pressure.normalInfo', 'Normal atmospheric conditions')}</span>
              </div>
            )}
            {pressure > 1040 && (
              <div className="flex items-start gap-3 text-[var(--theme-text-secondary)] text-sm">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>
                  {t('weather:pressure.highPressureInfo', 'High pressure - very stable conditions')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Pressure Categories Reference */}
        <div
          className="rounded-lg p-4 border"
          style={{
            backgroundColor: theme.isDark
              ? 'rgba(100, 116, 139, 0.1)'
              : 'rgba(100, 116, 139, 0.05)',
            borderColor: theme.isDark ? 'rgba(100, 116, 139, 0.3)' : 'rgba(100, 116, 139, 0.2)',
          }}
        >
          <h3 className="text-sm font-semibold text-[var(--theme-text)] mb-3 uppercase tracking-wide">
            {t('weather:pressure.barometricPressure', 'Barometric Pressure')} Categories
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600"></span>
              <span className="text-[var(--theme-text-secondary)]">&lt;980 hPa: Very Low</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              <span className="text-[var(--theme-text-secondary)]">980-1000 hPa: Low</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
              <span className="text-[var(--theme-text-secondary)]">
                1000-1013 hPa: Below Normal
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-[var(--theme-text-secondary)]">1013-1020 hPa: Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              <span className="text-[var(--theme-text-secondary)]">1020-1040 hPa: High</span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
              <span className="text-[var(--theme-text-secondary)]">&gt;1040 hPa: Very High</span>
            </div>
          </div>
        </div>
      </div>
    </AccessibleModal>
  );
};

export default PressureDetailModal;
