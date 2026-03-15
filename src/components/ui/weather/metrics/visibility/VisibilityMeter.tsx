/**
 * VisibilityMeter Component
 * Visual visibility meter with circular gauge and progress bar for intuitive visibility understanding
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

import { useVisibilityUnit } from '@/hooks/useVisibilityUnit';

interface VisibilityMeterProps {
  /** Visibility value in meters */
  visibility: number;
  /** Size variant of the meter */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show the numeric value */
  showValue?: boolean;
  /** Whether to show the visibility level indicator */
  showVisibilityLevel?: boolean;
  /** Whether to show the detailed gauge */
  showGauge?: boolean;
  /** Whether to show activity recommendations */
  showRecommendations?: boolean;
  /** Whether to show the progress bar */
  showProgressBar?: boolean;
  /** Whether to show distance markers */
  showDistanceMarkers?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const VisibilityMeter: React.FC<VisibilityMeterProps> = ({
  visibility,
  size = 'md',
  showValue = true,
  showVisibilityLevel = true,
  showGauge = true,
  showRecommendations = false,
  showProgressBar = true,
  showDistanceMarkers = true,
  className = '',
}) => {
  const { t } = useTranslation(['weather']);
  const { formatVisibility, currentUnit } = useVisibilityUnit();

  // Clamp visibility between 0 and 50000 meters (50km max for display)
  const clampedVisibility = Math.max(0, Math.min(50000, visibility));

  // Get visibility level, color, and recommendations
  const getVisibilityInfo = (value: number) => {
    if (value < 1000) {
      return {
        level: t('weather:visibility.poor', 'Poor'),
        color: 'text-red-600',
        bgColor: 'bg-red-500',
        description: t(
          'weather:visibility.poorDescription',
          'Very limited visibility - hazardous conditions'
        ),
        recommendation: t(
          'weather:visibility.poorRecommendation',
          'Avoid driving, stay indoors if possible'
        ),
        category: 'hazardous',
        icon: '🌫️',
        activities: ['indoor-only', 'no-driving', 'no-outdoor-sports'],
      };
    } else if (value < 5000) {
      return {
        level: t('weather:visibility.moderate', 'Moderate'),
        color: 'text-orange-600',
        bgColor: 'bg-orange-500',
        description: t(
          'weather:visibility.moderateDescription',
          'Limited visibility - exercise caution'
        ),
        recommendation: t(
          'weather:visibility.moderateRecommendation',
          'Drive carefully, use headlights'
        ),
        category: 'limited',
        icon: '🌁',
        activities: ['careful-driving', 'limited-outdoor', 'use-lights'],
      };
    } else if (value < 10000) {
      return {
        level: t('weather:visibility.good', 'Good'),
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-500',
        description: t('weather:visibility.goodDescription', 'Good visibility - normal conditions'),
        recommendation: t(
          'weather:visibility.goodRecommendation',
          'Normal activities, good for most outdoor activities'
        ),
        category: 'normal',
        icon: '⛅',
        activities: ['normal-driving', 'outdoor-activities', 'sports'],
      };
    } else {
      return {
        level: t('weather:visibility.excellent', 'Excellent'),
        color: 'text-green-600',
        bgColor: 'bg-green-500',
        description: t(
          'weather:visibility.excellentDescription',
          'Excellent visibility - perfect conditions'
        ),
        recommendation: t(
          'weather:visibility.excellentRecommendation',
          'Perfect for all activities and travel'
        ),
        category: 'excellent',
        icon: '☀️',
        activities: ['all-activities', 'long-distance-travel', 'photography'],
      };
    }
  };

  const visibilityInfo = getVisibilityInfo(clampedVisibility);

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-24 h-24',
      strokeWidth: 6,
      fontSize: 'text-xs',
      valueSize: 'text-sm',
      progressHeight: 'h-2',
      iconSize: 'text-lg',
    },
    md: {
      container: 'w-32 h-32',
      strokeWidth: 8,
      fontSize: 'text-sm',
      valueSize: 'text-lg',
      progressHeight: 'h-3',
      iconSize: 'text-xl',
    },
    lg: {
      container: 'w-40 h-40',
      strokeWidth: 10,
      fontSize: 'text-base',
      valueSize: 'text-xl',
      progressHeight: 'h-4',
      iconSize: 'text-2xl',
    },
  };

  const config = sizeConfig?.[size];

  // Circular gauge calculations (0-50km scale)
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (clampedVisibility / 50000) * circumference;

  // Visibility zones for the progress bar
  const getProgressBarSegments = () => {
    switch (currentUnit) {
      case 'km':
        return [
          {
            start: 0,
            end: 2,
            color: 'bg-red-400',
            label: t('weather:visibility.poor', 'Poor'),
            range: '<1km',
          },
          {
            start: 2,
            end: 10,
            color: 'bg-orange-400',
            label: t('weather:visibility.moderate', 'Moderate'),
            range: '1-5km',
          },
          {
            start: 10,
            end: 20,
            color: 'bg-yellow-400',
            label: t('weather:visibility.good', 'Good'),
            range: '5-10km',
          },
          {
            start: 20,
            end: 100,
            color: 'bg-green-400',
            label: t('weather:visibility.excellent', 'Excellent'),
            range: '10km+',
          },
        ];
      case 'mi':
        return [
          {
            start: 0,
            end: 2,
            color: 'bg-red-400',
            label: t('weather:visibility.poor', 'Poor'),
            range: '<0.6mi',
          },
          {
            start: 2,
            end: 10,
            color: 'bg-orange-400',
            label: t('weather:visibility.moderate', 'Moderate'),
            range: '0.6-3mi',
          },
          {
            start: 10,
            end: 20,
            color: 'bg-yellow-400',
            label: t('weather:visibility.good', 'Good'),
            range: '3-6mi',
          },
          {
            start: 20,
            end: 100,
            color: 'bg-green-400',
            label: t('weather:visibility.excellent', 'Excellent'),
            range: '6mi+',
          },
        ];
      case 'nm':
        return [
          {
            start: 0,
            end: 2,
            color: 'bg-red-400',
            label: t('weather:visibility.poor', 'Poor'),
            range: '<0.5NM',
          },
          {
            start: 2,
            end: 10,
            color: 'bg-orange-400',
            label: t('weather:visibility.moderate', 'Moderate'),
            range: '0.5-2.5NM',
          },
          {
            start: 10,
            end: 20,
            color: 'bg-yellow-400',
            label: t('weather:visibility.good', 'Good'),
            range: '2.5-5NM',
          },
          {
            start: 20,
            end: 100,
            color: 'bg-green-400',
            label: t('weather:visibility.excellent', 'Excellent'),
            range: '5NM+',
          },
        ];
      default: // m
        return [
          {
            start: 0,
            end: 2,
            color: 'bg-red-400',
            label: t('weather:visibility.poor', 'Poor'),
            range: '<1000m',
          },
          {
            start: 2,
            end: 10,
            color: 'bg-orange-400',
            label: t('weather:visibility.moderate', 'Moderate'),
            range: '1000-5000m',
          },
          {
            start: 10,
            end: 20,
            color: 'bg-yellow-400',
            label: t('weather:visibility.good', 'Good'),
            range: '5000-10000m',
          },
          {
            start: 20,
            end: 100,
            color: 'bg-green-400',
            label: t('weather:visibility.excellent', 'Excellent'),
            range: '10000m+',
          },
        ];
    }
  };

  // Get activity icons based on visibility level
  const getActivityIcons = () => {
    const activities = visibilityInfo.activities;
    const iconMap: Record<string, string> = {
      'indoor-only': '🏠',
      'no-driving': '🚫',
      'no-outdoor-sports': '⛔',
      'careful-driving': '🚗',
      'limited-outdoor': '🚶',
      'use-lights': '💡',
      'normal-driving': '🚙',
      'outdoor-activities': '🏃',
      sports: '⚽',
      'all-activities': '🎯',
      'long-distance-travel': '✈️',
      photography: '📸',
    };

    return activities.slice(0, 3).map(activity => iconMap?.[activity] || '🌟');
  };

  // Distance markers for the progress bar
  const getDistanceMarkers = () => {
    switch (currentUnit) {
      case 'km':
        return [
          { position: 2, label: '1km' },
          { position: 10, label: '5km' },
          { position: 20, label: '10km' },
          { position: 40, label: '25km' },
          { position: 100, label: '50km+' },
        ];
      case 'mi':
        return [
          { position: 2, label: '0.6mi' },
          { position: 10, label: '3mi' },
          { position: 20, label: '6mi' },
          { position: 40, label: '15mi' },
          { position: 100, label: '30mi+' },
        ];
      case 'nm':
        return [
          { position: 2, label: '0.5NM' },
          { position: 10, label: '2.5NM' },
          { position: 20, label: '5NM' },
          { position: 40, label: '13NM' },
          { position: 100, label: '25NM+' },
        ];
      default: // m
        return [
          { position: 2, label: '1000m' },
          { position: 10, label: '5000m' },
          { position: 20, label: '10km' },
          { position: 40, label: '20km' },
          { position: 100, label: '50km+' },
        ];
    }
  };

  const distanceMarkers = getDistanceMarkers();

  return (
    <div className={`visibility-meter ${className}`}>
      {/* Circular Gauge */}
      {showGauge && (
        <div className="flex justify-center mb-4">
          <div className={`relative ${config.container}`}>
            <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                className="text-gray-200"
                cx="50"
                cy="50"
                fill="transparent"
                r={radius}
                stroke="currentColor"
                strokeWidth={config.strokeWidth}
              />

              {/* Progress circle */}
              <circle
                className={`transition-all duration-1000 ease-out ${visibilityInfo.color.replace('text-', 'text-')}`}
                cx="50"
                cy="50"
                fill="transparent"
                r={radius}
                stroke="currentColor"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth={config.strokeWidth}
                style={{
                  filter: 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.4))',
                }}
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`${config.iconSize} mb-1`} data-testid="visibility-gauge-icon">
                {visibilityInfo.icon}
              </div>
              {showValue && (
                <div
                  className={`font-bold ${visibilityInfo.color} ${config.valueSize}`}
                  data-testid="visibility-gauge-value"
                >
                  {formatVisibility(clampedVisibility)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {showProgressBar && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{t('weather:labels.visibility', 'Visibility')}</span>
            <span data-testid="visibility-range-value">{formatVisibility(clampedVisibility)}</span>
          </div>

          <div
            className={`relative ${config.progressHeight} bg-gray-200 rounded-full overflow-hidden`}
          >
            {/* Visibility zone segments */}
            {getProgressBarSegments().map((segment, index) => (
              <div
                key={index}
                className={`absolute top-0 ${segment.color} opacity-30`}
                style={{
                  left: `${segment.start}%`,
                  width: `${segment.end - segment.start}%`,
                  height: '100%',
                }}
              />
            ))}

            {/* Current visibility indicator */}
            <div
              className={`absolute top-0 ${visibilityInfo.bgColor} transition-all duration-1000 ease-out`}
              style={{
                width: `${Math.min((clampedVisibility / 50000) * 100, 100)}%`,
                height: '100%',
                boxShadow: '0 0 8px rgba(99, 102, 241, 0.4)',
              }}
            />

            {/* Visibility pointer */}
            <div
              className="absolute top-0 w-1 h-full bg-white border border-gray-400 shadow-md transition-all duration-1000 ease-out"
              style={{
                left: `${Math.min((clampedVisibility / 50000) * 100, 100)}%`,
                transform: 'translateX(-50%)',
              }}
            />
          </div>

          {/* Distance markers */}
          {showDistanceMarkers && (
            <div className="relative mt-1">
              {distanceMarkers.map((marker, index) => (
                <div
                  key={index}
                  className="absolute text-xs text-gray-400 transform -translate-x-1/2"
                  style={{ left: `${Math.min(marker.position, 100)}%` }}
                >
                  {marker.label}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Visibility Level Information */}
      {showVisibilityLevel && (
        <div className="text-center mb-3">
          <div
            className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${visibilityInfo.bgColor} bg-opacity-10 border border-current border-opacity-20`}
          >
            <span className="text-sm">{visibilityInfo.icon}</span>
            <span className={`font-semibold ${visibilityInfo.color} ${config.fontSize}`}>
              {visibilityInfo.level}
            </span>
          </div>
          <p className={`text-xs text-gray-600 mt-1 ${config.fontSize}`}>
            {visibilityInfo.description}
          </p>
        </div>
      )}

      {/* Activity Recommendations */}
      {showRecommendations && (
        <div
          data-testid="visibility-activity-card"
          className="relative overflow-hidden rounded-xl border border-[var(--theme-border-light)] bg-[var(--theme-surface)]/90 p-4 shadow-[0_12px_24px_var(--theme-shadow)] backdrop-blur supports-[backdrop-filter]:bg-[var(--theme-surface)]/75 transition-all duration-300 ease-out dark:shadow-[0_18px_32px_rgba(2,6,23,0.6)]"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--theme-primary)]/10 via-transparent to-transparent opacity-90 dark:from-[var(--theme-primary)]/20"
          />
          <div className="relative mb-3 flex items-center gap-3">
            <div className="flex items-center -space-x-1" data-testid="visibility-activity-icons">
              {getActivityIcons().map((icon, index) => (
                <span
                  key={index}
                  aria-hidden="true"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[var(--theme-primary)]/15 text-lg text-[var(--theme-primary)] shadow-[0_4px_10px_var(--theme-shadow)] dark:bg-[var(--theme-primary)]/20"
                >
                  {icon}
                </span>
              ))}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-semibold tracking-wide text-[var(--theme-text)]">
                Activity Recommendations
              </span>
              <span className="mt-0.5 text-[0.65rem] uppercase tracking-[0.18em] text-[var(--theme-text-secondary)]">
                {visibilityInfo.level}
              </span>
            </div>
          </div>
          <p className="relative text-sm leading-5 text-[var(--theme-text-secondary)]">
            {visibilityInfo.recommendation}
          </p>
        </div>
      )}
    </div>
  );
};

export default VisibilityMeter;
