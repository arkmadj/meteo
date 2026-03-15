/**
 * VisibilityDetailModal Component
 * Expanded visibility details with travel and activity guidance.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

import VisibilityMeter from './VisibilityMeter';
import AccessibleModal from '@/components/ui/molecules/AccessibleModal';
import { useTheme } from '@/design-system/theme';
import { useVisibilityUnit } from '@/hooks/useVisibilityUnit';

export interface VisibilityDetailModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Visibility value in meters */
  visibility: number;
}

interface VisibilityDetails {
  level: string;
  color: string;
  description: string;
  travelRecommendations: string[];
  context: string[];
}

type TranslateFn = (key: string, fallback?: string) => string;

/**
 * Map a visibility value in meters to descriptive guidance for users.
 */
const getVisibilityDetails = (visibilityMeters: number, t: TranslateFn): VisibilityDetails => {
  const v = Math.max(0, Math.min(50000, visibilityMeters));

  if (v < 200) {
    return {
      level: t('weather:visibility.veryPoor', 'Very Poor'),
      color: 'text-red-600',
      description: t(
        'weather:visibility.veryPoorDescription',
        'Extremely limited visibility – travel should be avoided unless absolutely essential.'
      ),
      travelRecommendations: [
        t(
          'weather:visibility.veryPoor.tip1',
          'Avoid driving where possible; if you must drive, reduce speed drastically and use fog lights.'
        ),
        t(
          'weather:visibility.veryPoor.tip2',
          'Postpone outdoor sports, cycling, and long-distance walking until conditions improve.'
        ),
      ],
      context: [
        t(
          'weather:visibility.veryPoor.context1',
          'Dense fog, heavy snow, or blowing dust can reduce visibility to just a few car lengths.'
        ),
        t(
          'weather:visibility.veryPoor.context2',
          'Airports and highways may experience significant delays or closures.'
        ),
      ],
    };
  }

  if (v < 500) {
    return {
      level: t('weather:visibility.poor', 'Poor'),
      color: 'text-orange-600',
      description: t(
        'weather:visibility.poorDescription',
        'Challenging visibility – extra caution is required for all forms of travel.'
      ),
      travelRecommendations: [
        t(
          'weather:visibility.poor.tip1',
          'Drive slowly, increase following distance, and use low-beam headlights.'
        ),
        t(
          'weather:visibility.poor.tip2',
          'Consider delaying non-essential journeys, especially on unfamiliar roads.'
        ),
      ],
      context: [
        t(
          'weather:visibility.poor.context1',
          'Fog, showers, or blowing snow can hide road markings and obstacles until very late.'
        ),
        t(
          'weather:visibility.poor.context2',
          'Pedestrians and cyclists are much harder to see – reflective clothing is important.'
        ),
      ],
    };
  }

  if (v < 1000) {
    return {
      level: t('weather:visibility.moderate', 'Moderate'),
      color: 'text-amber-600',
      description: t(
        'weather:visibility.moderateDescription',
        'Reduced but manageable visibility – conditions require attentiveness.'
      ),
      travelRecommendations: [
        t(
          'weather:visibility.moderate.tip1',
          'Drive with caution, especially on rural roads and motorways.'
        ),
        t(
          'weather:visibility.moderate.tip2',
          'Allow extra time for commutes and use lights even during the day.'
        ),
      ],
      context: [
        t(
          'weather:visibility.moderate.context1',
          'Landscape features become hazy and distant objects may fade in and out.'
        ),
        t(
          'weather:visibility.moderate.context2',
          'Typical of patchy fog, drizzle, or low cloud around hills and valleys.'
        ),
      ],
    };
  }

  if (v < 5000) {
    return {
      level: t('weather:visibility.good', 'Good'),
      color: 'text-emerald-600',
      description: t(
        'weather:visibility.goodDescription',
        'Generally good visibility – suitable for most everyday activities.'
      ),
      travelRecommendations: [
        t(
          'weather:visibility.good.tip1',
          'Driving, walking, and cycling conditions are usually safe with normal care.'
        ),
        t(
          'weather:visibility.good.tip2',
          'Ideal for local travel, commuting, and most outdoor exercise.'
        ),
      ],
      context: [
        t(
          'weather:visibility.good.context1',
          'Buildings and terrain are clearly visible, though distant horizons may look slightly hazy.'
        ),
        t(
          'weather:visibility.good.context2',
          'Common in light haze, scattered showers, or early morning mist that is lifting.'
        ),
      ],
    };
  }

  if (v < 10000) {
    return {
      level: t('weather:visibility.veryGood', 'Very Good'),
      color: 'text-sky-600',
      description: t(
        'weather:visibility.veryGoodDescription',
        'Very good visibility – comfortable for travel and outdoor activities.'
      ),
      travelRecommendations: [
        t(
          'weather:visibility.veryGood.tip1',
          'Excellent for driving, running, and cycling with standard precautions.'
        ),
        t(
          'weather:visibility.veryGood.tip2',
          'Good conditions for photography and sightseeing, though distant hills may still appear soft.'
        ),
      ],
      context: [
        t(
          'weather:visibility.veryGood.context1',
          'Only slight atmospheric haze; you can see several kilometres ahead.'
        ),
        t(
          'weather:visibility.veryGood.context2',
          'Common after fronts pass through or on clear, breezy days.'
        ),
      ],
    };
  }

  return {
    level: t('weather:visibility.excellent', 'Excellent'),
    color: 'text-indigo-600',
    description: t(
      'weather:visibility.excellentDescription',
      'Exceptional visibility – distant horizons and landmarks appear crisp and clear.'
    ),
    travelRecommendations: [
      t(
        'weather:visibility.excellent.tip1',
        'Perfect for long-distance driving, aviation, sailing, and mountain activities.'
      ),
      t(
        'weather:visibility.excellent.tip2',
        'Make the most of clear-air days for photography, stargazing, and panoramic views.'
      ),
    ],
    context: [
      t(
        'weather:visibility.excellent.context1',
        'Often occurs after cold fronts, in very dry air, or at high elevations.'
      ),
      t(
        'weather:visibility.excellent.context2',
        'You may see mountain ranges, skylines, or coastlines far beyond the immediate area.'
      ),
    ],
  };
};

const VisibilityDetailModal: React.FC<VisibilityDetailModalProps> = ({
  isOpen,
  onClose,
  visibility,
}) => {
  const { t } = useTranslation(['weather']);
  const { theme } = useTheme();
  const { formatVisibility, currentUnit } = useVisibilityUnit();

  const clampedVisibility = Math.max(0, Math.min(50000, visibility));
  const details = getVisibilityDetails(clampedVisibility, t);
  const formattedVisibility = formatVisibility(clampedVisibility);

  const isDark = theme.isDark;
  const cardBg = isDark ? 'bg-slate-900/70' : 'bg-white/95';
  const cardBorder = isDark ? 'border-indigo-500/60' : 'border-indigo-500/80';
  const secondaryCardBg = isDark ? 'bg-slate-800/70' : 'bg-slate-50';
  const secondaryBorder = isDark ? 'border-slate-600' : 'border-slate-200';

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('weather:labels.visibility', 'Visibility')}
      size="lg"
      closeOnBackdropClick={true}
      closeOnEscape={true}
      className="visibility-detail-modal"
    >
      <div className="space-y-6 p-2">
        {/* Large Visibility Meter */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <VisibilityMeter
              className="w-full"
              visibility={clampedVisibility}
              size="lg"
              showGauge={true}
              showProgressBar={true}
              showVisibilityLevel={true}
              showRecommendations={true}
              showDistanceMarkers={true}
              showValue={true}
            />
          </div>
        </div>

        {/* Current Visibility Status */}
        <div className={`rounded-lg p-4 border ${cardBg} ${cardBorder}`}>
          <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-1">
            {t('weather:visibility.currentVisibility', 'Current visibility')}:&nbsp;
            <span className={details.color}>{formattedVisibility}</span>
            <span className="ml-2 text-sm text-[var(--theme-text-secondary)]">
              ({details.level})
            </span>
          </h3>
          <p className="text-sm text-[var(--theme-text-secondary)]">{details.description}</p>
          <p className="mt-2 text-xs text-[var(--theme-text-secondary)]">
            {t(
              'weather:visibility.unitContext',
              'Values are shown in your selected visibility unit (currently {{unit}}).'
            ).replace('{{unit}}', currentUnit)}
          </p>
        </div>

        {/* Travel & Activity Guidance */}
        <div className={`space-y-3 rounded-lg p-4 border ${secondaryCardBg} ${secondaryBorder}`}>
          <h3 className="text-lg font-semibold text-[var(--theme-text)] flex items-center gap-2">
            <span>🚗</span>
            <span>
              {t('weather:visibility.travelGuidance', 'Travel and outdoor activity guidance')}
            </span>
          </h3>
          <ul className="space-y-2">
            {details.travelRecommendations.map((tip, index) => (
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
            <span>📡</span>
            <span>
              {t(
                'weather:visibility.contextHeading',
                "Understanding today's visibility conditions"
              )}
            </span>
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

        {/* Visibility Scale Note */}
        <div className="rounded-lg p-3 border border-dashed">
          <p className="text-xs text-[var(--theme-text-secondary)] text-center">
            {t(
              'weather:visibility.modalInfo',
              'Visibility describes how far you can clearly see ahead and is typically reported in meters or kilometers.'
            )}
          </p>
        </div>
      </div>
    </AccessibleModal>
  );
};

export default VisibilityDetailModal;
