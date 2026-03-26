/**
 * UVIndexDetailModal Component
 * Expanded UV index details with safety guidance and contextual information.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

import AccessibleModal from '@/components/ui/molecules/AccessibleModal';
import { useTheme } from '@/design-system/theme';
import UVIndexMeter from './UVIndexMeter';

export interface UVIndexDetailModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Current UV index value */
  uvIndex: number;
}

interface UVIndexDetails {
  level: string;
  color: string;
  description: string;
  protectionTips: string[];
  context: string[];
}

type TranslateFn = (key: string, fallback?: string) => string;

/**
 * Get detailed information, safety guidance, and context for a given UV index.
 */
const getUVDetails = (uvIndex: number, t: TranslateFn): UVIndexDetails => {
  const index = Math.max(0, Math.min(12, uvIndex));

  if (index <= 2) {
    return {
      level: t('weather:uvIndex.low', 'Low'),
      color: 'text-green-600',
      description: t('weather:uvIndex.lowDescription', 'Minimal risk - no protection needed'),
      protectionTips: [
        t('weather:uvIndex.low.tip1', 'No protection required for most people.'),
        t('weather:uvIndex.low.tip2', 'Consider sunglasses on very bright days.'),
      ],
      context: [
        t(
          'weather:uvIndex.low.context1',
          'UV levels are lowest during early morning and late afternoon.'
        ),
        t(
          'weather:uvIndex.low.context2',
          'Unprotected skin is unlikely to burn except after very long exposure.'
        ),
      ],
    };
  }

  if (index <= 5) {
    return {
      level: t('weather:uvIndex.moderate', 'Moderate'),
      color: 'text-yellow-600',
      description: t(
        'weather:uvIndex.moderateDescription',
        'Low risk - some protection recommended'
      ),
      protectionTips: [
        t(
          'weather:uvIndex.moderate.tip1',
          'Wear sunglasses and consider sunscreen on bright days.'
        ),
        t('weather:uvIndex.moderate.tip2', 'Keep infants and sensitive skin lightly covered.'),
      ],
      context: [
        t(
          'weather:uvIndex.moderate.context1',
          'Unprotected skin can start to burn after about 30–45 minutes in midday sun.'
        ),
        t(
          'weather:uvIndex.moderate.context2',
          'Take extra care near reflective surfaces like water, sand, or snow.'
        ),
      ],
    };
  }

  if (index <= 7) {
    return {
      level: t('weather:uvIndex.high', 'High'),
      color: 'text-orange-600',
      description: t('weather:uvIndex.highDescription', 'Moderate risk - protection essential'),
      protectionTips: [
        t('weather:uvIndex.high.tip1', 'Apply SPF 30+ broad-spectrum sunscreen every 2 hours.'),
        t('weather:uvIndex.high.tip2', 'Wear a wide-brimmed hat and UV-blocking sunglasses.'),
        t('weather:uvIndex.high.tip3', 'Seek shade when the sun is strongest around midday.'),
      ],
      context: [
        t(
          'weather:uvIndex.high.context1',
          'Unprotected skin can burn in about 20–30 minutes during peak hours.'
        ),
        t(
          'weather:uvIndex.high.context2',
          'Children and fair skin are at higher risk of sun damage at this level.'
        ),
      ],
    };
  }

  if (index <= 10) {
    return {
      level: t('weather:uvIndex.veryHigh', 'Very High'),
      color: 'text-red-600',
      description: t(
        'weather:uvIndex.veryHighDescription',
        'High risk - extra protection required'
      ),
      protectionTips: [
        t(
          'weather:uvIndex.veryHigh.tip1',
          'Avoid direct sun between 10am and 4pm whenever possible.'
        ),
        t(
          'weather:uvIndex.veryHigh.tip2',
          'Stay in the shade and cover arms and legs with clothing.'
        ),
        t(
          'weather:uvIndex.veryHigh.tip3',
          'Use SPF 30+ sunscreen on all exposed skin, reapplying regularly.'
        ),
      ],
      context: [
        t(
          'weather:uvIndex.veryHigh.context1',
          'Unprotected skin can burn in about 10–20 minutes during peak sunlight.'
        ),
        t(
          'weather:uvIndex.veryHigh.context2',
          'High-altitude locations and reflective surfaces further increase exposure.'
        ),
      ],
    };
  }

  return {
    level: t('weather:uvIndex.extreme', 'Extreme'),
    color: 'text-purple-600',
    description: t('weather:uvIndex.extremeDescription', 'Very high risk - avoid sun exposure'),
    protectionTips: [
      t(
        'weather:uvIndex.extreme.tip1',
        'Avoid being outdoors during peak UV hours whenever possible.'
      ),
      t(
        'weather:uvIndex.extreme.tip2',
        'Stay in full shade and wear protective clothing, hat, and sunglasses.'
      ),
      t(
        'weather:uvIndex.extreme.tip3',
        'Use high SPF (50+) broad-spectrum sunscreen on any exposed skin.'
      ),
    ],
    context: [
      t(
        'weather:uvIndex.extreme.context1',
        'Unprotected skin can burn in less than 10 minutes at this level.'
      ),
      t(
        'weather:uvIndex.extreme.context2',
        'UV is often strongest near the equator, at high altitudes, and over snow or water.'
      ),
    ],
  };
};

const UVIndexDetailModal: React.FC<UVIndexDetailModalProps> = ({ isOpen, onClose, uvIndex }) => {
  const { t } = useTranslation(['weather']);
  const { theme } = useTheme();
  const clampedUVIndex = Math.max(0, Math.min(12, uvIndex));
  const details = getUVDetails(clampedUVIndex, t as unknown as TranslateFn);

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('weather:labels.uvIndex', 'UV Index')}
      size="lg"
      closeOnBackdropClick={true}
      closeOnEscape={true}
      className="uv-index-detail-modal"
    >
      <div className="space-y-6 p-2">
        {/* Large UV Index Meter */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <UVIndexMeter
              className="w-full"
              uvIndex={clampedUVIndex}
              size="lg"
              showGauge={true}
              showProgressBar={true}
              showValue={true}
              showRiskLevel={true}
              showRecommendations={true}
            />
          </div>
        </div>

        {/* Current UV Status */}
        <div
          className="rounded-lg p-4 border"
          style={{
            backgroundColor: theme.isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.96)',
            borderColor: theme.isDark ? 'rgba(234, 179, 8, 0.75)' : 'rgba(234, 179, 8, 0.85)',
          }}
        >
          <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-1">
            {t('weather:uvIndex.currentLevel', 'Current UV level')}:&nbsp;
            <span className={details.color}>{details.level}</span>
            <span className="ml-2 text-sm text-[var(--theme-text-secondary)]">
              ({clampedUVIndex.toFixed(1)})
            </span>
          </h3>
          <p className="text-sm text-[var(--theme-text-secondary)]">{details.description}</p>
        </div>

        {/* Sun Safety Guidance */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-[var(--theme-text)] flex items-center gap-2">
            <span>☀️</span>
            <span>{t('weather:uvIndex.safetyGuidance', 'Sun safety guidance')}</span>
          </h3>
          <ul className="space-y-2">
            {details.protectionTips.map((tip, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-[var(--theme-text-secondary)] text-sm"
              >
                <span className="text-[var(--theme-accent)] mt-0.5">✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contextual Information */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-[var(--theme-text)] flex items-center gap-2">
            <span>📊</span>
            <span>{t('weather:uvIndex.contextHeading', "Understanding today's UV index")}</span>
          </h3>
          <ul className="space-y-2">
            {details.context.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-[var(--theme-text-secondary)] text-sm"
              >
                <span className="text-[var(--theme-accent)] mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* UV Index Scale Note */}
        <div className="rounded-lg p-3 border border-dashed">
          <p className="text-xs text-[var(--theme-text-secondary)] text-center">
            {t(
              'weather:uvIndex.modalInfo',
              'The UV index ranges from 0 (Low) to 11+ (Extreme) and describes the intensity of sunburn-producing ultraviolet radiation at the surface.'
            )}
          </p>
        </div>
      </div>
    </AccessibleModal>
  );
};

export default UVIndexDetailModal;
