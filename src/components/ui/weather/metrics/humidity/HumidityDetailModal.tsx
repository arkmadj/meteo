/**
 * HumidityDetailModal Component
 * Displays detailed humidity information in a modal overlay
 * Includes large gauge, comfort zones, health impacts, and recommendations
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

import HumidityMeter from './HumidityMeter';
import { AccessibleModal } from '@/components/ui/molecules';
import { useTheme } from '@/design-system/theme';

export interface HumidityDetailModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Humidity percentage (0-100) */
  humidity: number;
}

/**
 * Get detailed humidity information including comfort level and recommendations
 */
const getHumidityDetails = (humidity: number, t: (key: string, fallback: string) => string) => {
  if (humidity < 30) {
    return {
      level: t('weather:humidity.low', 'Dry'),
      color: 'text-orange-600',
      bgColor: 'bg-orange-500',
      description: t('weather:humidity.lowDescription', 'Too dry - may cause discomfort'),
      healthImpacts: [
        'Dry skin and irritated eyes',
        'Increased static electricity',
        'Respiratory discomfort',
        'Cracked lips and nasal passages',
      ],
      recommendations: [
        'Use a humidifier indoors',
        'Stay hydrated by drinking water',
        'Apply moisturizer to skin',
        'Keep plants to add moisture',
      ],
    };
  } else if (humidity > 70) {
    return {
      level: t('weather:humidity.high', 'Humid'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
      description: t('weather:humidity.highDescription', 'Too humid - may feel sticky'),
      healthImpacts: [
        'Increased sweating and discomfort',
        'Mold and mildew growth risk',
        'Difficulty cooling down',
        'Aggravated allergies',
      ],
      recommendations: [
        'Use a dehumidifier or air conditioning',
        'Ensure proper ventilation',
        'Wear breathable, light clothing',
        'Monitor for mold growth',
      ],
    };
  } else if (humidity >= 40 && humidity <= 60) {
    return {
      level: t('weather:humidity.optimal', 'Optimal'),
      color: 'text-green-600',
      bgColor: 'bg-green-500',
      description: t('weather:humidity.optimalDescription', 'Perfect comfort level'),
      healthImpacts: [
        'Optimal respiratory comfort',
        'Reduced risk of infections',
        'Comfortable skin hydration',
        'Ideal for sleep quality',
      ],
      recommendations: [
        'Maintain current conditions',
        'Continue regular ventilation',
        'No special actions needed',
        'Enjoy the comfortable environment',
      ],
    };
  } else {
    return {
      level: t('weather:humidity.normal', 'Comfortable'),
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-500',
      description: t('weather:humidity.normalDescription', 'Comfortable level'),
      healthImpacts: [
        'Generally comfortable conditions',
        'Minor adjustments may help',
        'Acceptable for most activities',
        'Low health concerns',
      ],
      recommendations: [
        'Monitor humidity levels',
        'Adjust ventilation as needed',
        'Maintain comfortable clothing',
        'Stay aware of changes',
      ],
    };
  }
};

const HumidityDetailModal: React.FC<HumidityDetailModalProps> = ({ isOpen, onClose, humidity }) => {
  const { t } = useTranslation(['weather', 'common']);
  const { theme } = useTheme();

  const details = getHumidityDetails(humidity, t);

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('weather:labels.humidity', 'Humidity')}
      size="lg"
      closeOnBackdropClick={true}
      closeOnEscape={true}
      className="humidity-detail-modal"
    >
      <div className="space-y-6 p-2">
        {/* Large Humidity Gauge */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <HumidityMeter
              className="w-full"
              humidity={humidity}
              showComfortLevel={true}
              showGauge={true}
              showValue={true}
              size="lg"
            />
          </div>
        </div>

        {/* Current Status */}
        <div
          className="rounded-lg p-4 border"
          style={{
            backgroundColor: theme.isDark ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.05)',
            borderColor: theme.isDark ? 'rgba(6, 182, 212, 0.3)' : 'rgba(6, 182, 212, 0.2)',
          }}
        >
          <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-2">
            Current Status: {details.level}
          </h3>
          <p className={`${details.color} font-medium`}>{details.description}</p>
        </div>

        {/* Health Impacts */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-[var(--theme-text)] flex items-center gap-2">
            <span>🏥</span>
            <span>Health Impacts</span>
          </h3>
          <ul className="space-y-2">
            {details.healthImpacts.map((impact, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-[var(--theme-text-secondary)] text-sm"
              >
                <span className="text-[var(--theme-accent)] mt-0.5">•</span>
                <span>{impact}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-[var(--theme-text)] flex items-center gap-2">
            <span>💡</span>
            <span>Recommendations</span>
          </h3>
          <ul className="space-y-2">
            {details.recommendations.map((recommendation, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-[var(--theme-text-secondary)] text-sm"
              >
                <span className="text-[var(--theme-accent)] mt-0.5">✓</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Comfort Zones Reference */}
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
            Humidity Comfort Zones
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              <span className="text-[var(--theme-text-secondary)]">0-30%: Too Dry</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
              <span className="text-[var(--theme-text-secondary)]">30-40%: Fair</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-[var(--theme-text-secondary)]">40-60%: Optimal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
              <span className="text-[var(--theme-text-secondary)]">60-70%: Good</span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-[var(--theme-text-secondary)]">70%+: Too Humid</span>
            </div>
          </div>
        </div>
      </div>
    </AccessibleModal>
  );
};

export default HumidityDetailModal;
