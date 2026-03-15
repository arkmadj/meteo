/**
 * CoordinatesDisplay Component
 * Enhanced coordinates display with visual cues, improved typography, and polished styling
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/design-system/theme';
import { cn } from '@/utils/cn';

interface CoordinatesDisplayProps {
  /** Latitude value */
  latitude: number;
  /** Longitude value */
  longitude: number;
  /** Size variant of the display */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show hemisphere indicators */
  showHemisphere?: boolean;
  /** Whether to show coordinate grid visualization */
  showGrid?: boolean;
  /** Whether to show precision indicators */
  showPrecision?: boolean;
  /** Whether to show coordinate format options */
  showFormats?: boolean;
  /** Whether to show location context */
  showLocationContext?: boolean;
  /** City and country for context */
  location?: {
    city: string;
    country: string;
  };
  /** Additional CSS classes */
  className?: string;
}

const CoordinatesDisplay: React.FC<CoordinatesDisplayProps> = ({
  latitude,
  longitude,
  size = 'md',
  showHemisphere = true,
  showGrid = true,
  showPrecision = true,
  showFormats = false,
  showLocationContext = true,
  location,
  className = '',
}) => {
  const { t } = useTranslation(['weather']);
  const { theme } = useTheme();

  const gridStyles = React.useMemo(() => {
    const markerCore = '#ef4444';

    if (theme.isDark) {
      return {
        cardBackground: 'linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.78))',
        cardBorder: 'rgba(94, 109, 130, 0.6)',
        cardShadow: '0 16px 32px rgba(2, 6, 23, 0.45)',
        headingColor: 'rgba(226, 232, 240, 0.92)',
        helperTextColor: 'rgba(148, 163, 184, 0.75)',
        gridBackground:
          'radial-gradient(circle at 30% 30%, rgba(56, 189, 248, 0.18), rgba(15, 23, 42, 0.85))',
        gridBorder: 'rgba(94, 109, 130, 0.55)',
        gridLineSoft: 'rgba(148, 163, 184, 0.28)',
        gridLineStrong: 'rgba(148, 163, 184, 0.45)',
        axisColor: 'rgba(248, 250, 252, 0.65)',
        gridInsetShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
        markerBorder: 'rgba(2, 6, 23, 0.9)',
        markerCore,
        markerShadow: '0 0 16px rgba(239, 68, 68, 0.35)',
        markerPulse: 'rgba(239, 68, 68, 0.45)',
      } as const;
    }

    return {
      cardBackground:
        'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(236, 253, 245, 0.92))',
      cardBorder: 'rgba(191, 219, 254, 0.85)',
      cardShadow: '0 18px 30px rgba(15, 23, 42, 0.08)',
      headingColor: 'rgba(15, 23, 42, 0.86)',
      helperTextColor: 'rgba(100, 116, 139, 0.75)',
      gridBackground:
        'radial-gradient(circle at 30% 30%, rgba(56, 189, 248, 0.28), rgba(217, 249, 157, 0.2))',
      gridBorder: 'rgba(148, 163, 184, 0.4)',
      gridLineSoft: 'rgba(148, 163, 184, 0.35)',
      gridLineStrong: 'rgba(148, 163, 184, 0.55)',
      axisColor: 'rgba(15, 118, 110, 0.65)',
      gridInsetShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',

      markerBorder: 'rgba(255, 255, 255, 0.9)',
      markerCore,
      markerShadow: '0 0 12px rgba(239, 68, 68, 0.28)',
      markerPulse: 'rgba(239, 68, 68, 0.55)',
    } as const;
  }, [theme.isDark]);

  const detailStyles = React.useMemo(() => {
    if (theme.isDark) {
      return {
        precisionText: 'rgba(148, 163, 184, 0.82)',
        precisionLabel: 'rgba(226, 232, 240, 0.92)',
        locationCard: {
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.82), rgba(30, 41, 59, 0.72))',
          border: 'rgba(96, 165, 250, 0.35)',
          heading: 'rgba(191, 219, 254, 0.95)',
          body: 'rgba(147, 197, 253, 0.82)',
        },
        formatsCard: {
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.75))',
          border: 'rgba(71, 85, 105, 0.6)',
          heading: 'rgba(226, 232, 240, 0.94)',
          label: 'rgba(203, 213, 225, 0.85)',
          value: 'rgba(226, 232, 240, 0.96)',
        },
      } as const;
    }

    return {
      precisionText: 'rgba(71, 85, 105, 0.85)',
      precisionLabel: 'rgba(15, 23, 42, 0.9)',
      locationCard: {
        background: 'linear-gradient(135deg, rgba(219, 234, 254, 0.9), rgba(191, 219, 254, 0.82))',
        border: 'rgba(147, 197, 253, 0.7)',
        heading: 'rgba(30, 64, 175, 0.95)',
        body: 'rgba(30, 64, 175, 0.78)',
      },
      formatsCard: {
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(243, 244, 246, 0.92))',
        border: 'rgba(203, 213, 225, 0.75)',
        heading: 'rgba(15, 23, 42, 0.92)',
        label: 'rgba(71, 85, 105, 0.9)',
        value: 'rgba(15, 23, 42, 0.92)',
      },
    } as const;
  }, [theme.isDark]);

  // Format coordinates with proper precision
  const formatCoordinate = (value: number): string => {
    return Math.abs(value).toFixed(4);
  };

  // Get hemisphere indicators
  const getHemisphere = (value: number, type: 'lat' | 'lng'): string => {
    if (type === 'lat') {
      return value >= 0 ? 'N' : 'S';
    } else {
      return value >= 0 ? 'E' : 'W';
    }
  };

  // Get coordinate in DMS (Degrees, Minutes, Seconds) format
  const toDMS = (value: number, type: 'lat' | 'lng'): string => {
    const abs = Math.abs(value);
    const degrees = Math.floor(abs);
    const minutes = Math.floor((abs - degrees) * 60);
    const seconds = Math.round(((abs - degrees) * 60 - minutes) * 60);
    const hemisphere = getHemisphere(value, type);

    return `${degrees}° ${minutes}' ${seconds}" ${hemisphere}`;
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      coordinateText: 'text-lg',
      labelText: 'text-xs',
      hemisphereText: 'text-sm',
      iconSize: 'text-lg',
      spacing: 'space-y-2',
      padding: 'p-3',
    },
    md: {
      coordinateText: 'text-2xl',
      labelText: 'text-sm',
      hemisphereText: 'text-base',
      iconSize: 'text-xl',
      spacing: 'space-y-3',
      padding: 'p-4',
    },
    lg: {
      coordinateText: 'text-3xl',
      labelText: 'text-base',
      hemisphereText: 'text-lg',
      iconSize: 'text-2xl',
      spacing: 'space-y-4',
      padding: 'p-6',
    },
  };

  const config = sizeConfig?.[size];

  // Get precision level description
  const getPrecisionDescription = (): string => {
    return t('weather:coordinates.precisionDescription', 'Accurate to ~11 meters');
  };

  // Get location context description
  const getLocationContext = (): string => {
    if (!location) return '';

    const latDirection = latitude >= 0 ? 'north' : 'south';
    const lngDirection = longitude >= 0 ? 'east' : 'west';

    return t(
      'weather:coordinates.locationContext',
      `Located in the ${latDirection}ern hemisphere, ${lngDirection} of the Prime Meridian`
    );
  };

  return (
    <div
      className={cn(
        'coordinates-display text-[var(--theme-text)] transition-colors duration-300',
        className
      )}
    >
      {/* Main Coordinates Display */}
      <div className={cn(config.spacing)}>
        {/* Latitude */}
        <div className="coordinate-item">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className={config.iconSize}>🌐</span>
              <span
                className={cn(
                  'font-medium text-[var(--theme-text-secondary)] transition-colors',
                  config.labelText
                )}
              >
                {t('weather:coordinates.latitude', 'Latitude')}
              </span>
            </div>
            {showHemisphere && (
              <div
                className={cn(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border transition-colors duration-300',
                  latitude >= 0
                    ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/15 dark:text-blue-200 dark:border-blue-400/30'
                    : 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/15 dark:text-orange-200 dark:border-orange-400/30'
                )}
              >
                {getHemisphere(latitude, 'lat')}
              </div>
            )}
          </div>

          <div className="flex items-baseline space-x-2">
            <span
              className={cn(
                'font-bold text-[var(--theme-text)] font-mono tracking-wide transition-colors',
                config.coordinateText
              )}
            >
              {formatCoordinate(latitude)}°
            </span>
            <span className="text-sm font-medium text-[var(--theme-text-secondary)] transition-colors">
              {latitude >= 0 ? 'N' : 'S'}
            </span>
          </div>

          {showFormats && (
            <div className="mt-1">
              <span className="text-xs font-mono text-[var(--theme-text-secondary)] transition-colors">
                {toDMS(latitude, 'lat')}
              </span>
            </div>
          )}
        </div>

        {/* Longitude */}
        <div className="coordinate-item">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className={config.iconSize}>🗺️</span>
              <span
                className={cn(
                  'font-medium text-[var(--theme-text-secondary)] transition-colors',
                  config.labelText
                )}
              >
                {t('weather:coordinates.longitude', 'Longitude')}
              </span>
            </div>
            {showHemisphere && (
              <div
                className={cn(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border transition-colors duration-300',
                  longitude >= 0
                    ? 'bg-green-100 text-green-800 border-green-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-400/30'
                    : 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/15 dark:text-purple-200 dark:border-purple-400/30'
                )}
              >
                {getHemisphere(longitude, 'lng')}
              </div>
            )}
          </div>

          <div className="flex items-baseline space-x-2">
            <span
              className={cn(
                'font-bold text-[var(--theme-text)] font-mono tracking-wide transition-colors',
                config.coordinateText
              )}
            >
              {formatCoordinate(longitude)}°
            </span>
            <span className="text-sm font-medium text-[var(--theme-text-secondary)] transition-colors">
              {longitude >= 0 ? 'E' : 'W'}
            </span>
          </div>

          {showFormats && (
            <div className="mt-1">
              <span className="text-xs font-mono text-[var(--theme-text-secondary)] transition-colors">
                {toDMS(longitude, 'lng')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Coordinate Grid Visualization */}
      {showGrid && (
        <div
          className="mt-4 p-3 rounded-lg border backdrop-blur-sm transition-colors duration-300"
          style={{
            background: gridStyles.cardBackground,
            borderColor: gridStyles.cardBorder,
            boxShadow: gridStyles.cardShadow,
          }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm">📍</span>
            <span className="text-sm font-semibold" style={{ color: gridStyles.headingColor }}>
              {t('weather:coordinates.gridReference', 'Grid Reference')}
            </span>
          </div>

          <div
            className="relative w-full h-16 rounded border overflow-hidden transition-all duration-300"
            style={{
              background: gridStyles.gridBackground,
              borderColor: gridStyles.gridBorder,
              boxShadow: gridStyles.gridInsetShadow,
            }}
          >
            {/* Grid lines */}
            <div className="absolute inset-0">
              {/* Vertical lines */}
              <div
                className="absolute left-1/4 top-0 bottom-0 w-px"
                style={{ backgroundColor: gridStyles.gridLineSoft }}
              ></div>
              <div
                className="absolute left-1/2 top-0 bottom-0 w-px"
                style={{ backgroundColor: gridStyles.gridLineStrong }}
              ></div>
              <div
                className="absolute left-3/4 top-0 bottom-0 w-px"
                style={{ backgroundColor: gridStyles.gridLineSoft }}
              ></div>

              {/* Horizontal lines */}
              <div
                className="absolute top-1/4 left-0 right-0 h-px"
                style={{ backgroundColor: gridStyles.gridLineSoft }}
              ></div>
              <div
                className="absolute top-1/2 left-0 right-0 h-px"
                style={{ backgroundColor: gridStyles.axisColor }}
              ></div>
              <div
                className="absolute top-3/4 left-0 right-0 h-px"
                style={{ backgroundColor: gridStyles.gridLineSoft }}
              ></div>
            </div>

            {/* Location marker */}
            <div
              className="absolute w-2 h-2 rounded-full border-2 shadow-lg transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${50 + (longitude / 180) * 40}%`,
                top: `${50 - (latitude / 90) * 40}%`,
                backgroundColor: gridStyles.markerCore,
                borderColor: gridStyles.markerBorder,
                boxShadow: gridStyles.markerShadow,
              }}
            >
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{ backgroundColor: gridStyles.markerPulse }}
              ></div>
            </div>
          </div>

          <div
            className="flex justify-between text-xs font-medium mt-1"
            style={{ color: gridStyles.helperTextColor }}
          >
            <span>180°W</span>
            <span>0°</span>
            <span>180°E</span>
          </div>
        </div>
      )}

      {/* Precision Information */}
      {showPrecision && (
        <div
          className="mt-3 flex items-center space-x-2 text-xs transition-colors duration-300"
          style={{ color: detailStyles.precisionText }}
        >
          <span>🎯</span>
          <span className="font-medium" style={{ color: detailStyles.precisionLabel }}>
            Precision:
          </span>
          <span>{getPrecisionDescription()}</span>
        </div>
      )}

      {/* Location Context */}
      {showLocationContext && location && (
        <div
          className="mt-3 p-3 rounded-lg border transition-colors duration-300 backdrop-blur-sm"
          style={{
            background: detailStyles.locationCard.background,
            borderColor: detailStyles.locationCard.border,
            color: detailStyles.locationCard.body,
          }}
        >
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm">🌍</span>
            <span
              className="text-sm font-semibold"
              style={{ color: detailStyles.locationCard.heading }}
            >
              {location.city}, {location.country}
            </span>
          </div>
          <p className="text-xs" style={{ color: detailStyles.locationCard.body }}>
            {getLocationContext()}
          </p>
        </div>
      )}

      {/* Alternative Formats */}
      {showFormats && (
        <div
          className="mt-4 p-3 rounded-lg border transition-colors duration-300 backdrop-blur-sm"
          style={{
            background: detailStyles.formatsCard.background,
            borderColor: detailStyles.formatsCard.border,
          }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm">📐</span>
            <span
              className="text-sm font-semibold"
              style={{ color: detailStyles.formatsCard.heading }}
            >
              {t('weather:coordinates.alternativeFormats', 'Alternative Formats')}
            </span>
          </div>

          <div className="space-y-2 text-xs transition-colors duration-300">
            <div>
              <span className="font-medium" style={{ color: detailStyles.formatsCard.label }}>
                Decimal Degrees:
              </span>
              <span className="ml-2 font-mono" style={{ color: detailStyles.formatsCard.value }}>
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </span>
            </div>
            <div>
              <span className="font-medium" style={{ color: detailStyles.formatsCard.label }}>
                DMS:
              </span>
              <span className="ml-2 font-mono" style={{ color: detailStyles.formatsCard.value }}>
                {toDMS(latitude, 'lat')}, {toDMS(longitude, 'lng')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoordinatesDisplay;
