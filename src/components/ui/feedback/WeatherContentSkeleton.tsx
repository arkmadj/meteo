/**
 * Weather Content Skeleton
 * Theme-aware skeleton loaders for weather components
 * Mirrors the exact layout and structure of actual weather content
 */

import { useTheme } from '@/design-system/theme';
import { SPACING } from '@/design-system/tokens';
import React from 'react';
import { SkeletonCircle, SkeletonText } from './Skeleton';

export interface WeatherCardSkeletonProps {
  /** Card variant */
  variant?: 'default' | 'compact' | 'detailed';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Skeleton loader for WeatherCard component
 * Matches WeatherCard padding: p-3 sm:p-4 (compact), p-4 sm:p-6 (detailed), p-4 sm:p-5 (default)
 */
export const WeatherCardSkeleton: React.FC<WeatherCardSkeletonProps> = ({
  variant = 'default',
  className = '',
}) => {
  const { theme } = useTheme();

  const getCardClasses = () => {
    const baseClasses = [
      'bg-[var(--theme-surface)]/95',
      'backdrop-blur-sm',
      'border',
      'border-[var(--theme-border)]',
      'rounded-xl',
      'shadow-[0_1px_3px_var(--theme-shadow)]',
      'w-full',
      'overflow-hidden',
    ];

    switch (variant) {
      case 'compact':
        return [...baseClasses, 'p-3 sm:p-4'].join(' ');
      case 'detailed':
        return [...baseClasses, 'p-4 sm:p-6'].join(' ');
      default:
        return [...baseClasses, 'p-4 sm:p-5'].join(' ');
    }
  };

  // Compact variant - matches renderCompact() layout
  if (variant === 'compact') {
    return (
      <div className={`weather-card-skeleton ${getCardClasses()} ${className}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Location and Date */}
          <div className="flex items-center flex-1 min-w-0">
            <SkeletonCircle width="1.5rem" height="1.5rem" className="mr-2 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <SkeletonText width="70%" height="1.125rem" className="max-w-[200px]" />
              <SkeletonText width="50%" height="0.875rem" className="mt-1 max-w-[150px]" />
            </div>
            <SkeletonCircle width="2rem" height="2rem" className="ml-2 flex-shrink-0" />
          </div>

          {/* Temperature and Weather */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <SkeletonCircle width="2rem" height="2rem" />
            <div className="text-right">
              <div className="flex items-center">
                <SkeletonText width="3rem" height="1.5rem" />
                <SkeletonText width="2.5rem" height="1.25rem" className="ml-1" />
              </div>
              <SkeletonText width="5rem" height="0.75rem" className="mt-1" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Detailed variant - matches renderDetailed() layout with space-y-4 sm:space-y-6
  if (variant === 'detailed') {
    return (
      <div className={`weather-card-skeleton ${getCardClasses()} ${className}`}>
        <div className="space-y-4 sm:space-y-6">
          {/* Location Header */}
          <div className="flex items-start">
            <SkeletonCircle width="1.5rem" height="1.5rem" className="mr-2 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <SkeletonText width="50%" height="1.5rem" className="max-w-[250px]" />
              <SkeletonText width="30%" height="1.125rem" className="mt-1 max-w-[150px]" />
            </div>
            <SkeletonCircle width="2.25rem" height="2.25rem" className="ml-2 flex-shrink-0" />
          </div>

          {/* Main Weather Display */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <SkeletonCircle width="48px" height="48px" />
              <div className="text-center sm:text-left">
                <SkeletonText width="8rem" height="1.25rem" />
                <SkeletonText width="5rem" height="0.875rem" className="mt-1" />
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div className="flex flex-col sm:flex-row sm:items-baseline items-center justify-center gap-2 sm:gap-0">
                <SkeletonText width="5rem" height="3rem" />
                <SkeletonText width="3rem" height="1.5rem" className="sm:ml-2" />
              </div>
            </div>
          </div>

          {/* Date and Time Info */}
          <div
            className="border-t pt-3 sm:pt-4"
            style={{
              borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center">
                <SkeletonCircle width="1.25rem" height="1.25rem" className="mr-2" />
                <SkeletonText width="8rem" height="0.875rem" />
              </div>
              <div className="flex items-center">
                <SkeletonCircle width="1.25rem" height="1.25rem" className="mr-2" />
                <SkeletonText width="5rem" height="0.875rem" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant - matches renderDefault() layout with space-y-3 sm:space-y-4
  return (
    <div className={`weather-card-skeleton ${getCardClasses()} ${className}`}>
      <div className="text-center space-y-3 sm:space-y-4">
        {/* Location and Date Header */}
        <div className="space-y-1 sm:space-y-2">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center">
              <SkeletonCircle width="1.5rem" height="1.5rem" className="mr-2" />
              <SkeletonText width="10rem" height="1.25rem" />
              <SkeletonCircle width="2rem" height="2rem" className="ml-2" />
            </div>
          </div>
          <SkeletonText width="8rem" height="0.875rem" className="mx-auto" />
        </div>

        {/* Weather and Temperature */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <SkeletonCircle width="50px" height="50px" />
          <div className="text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-baseline items-center justify-center gap-2 sm:gap-0">
              <SkeletonText width="5rem" height="2.5rem" />
              <SkeletonText width="3rem" height="1.5rem" className="sm:ml-2" />
            </div>
            <SkeletonText width="7rem" height="1rem" className="mt-1 sm:mt-2 mx-auto sm:mx-0" />
            <SkeletonText width="5rem" height="0.875rem" className="mt-1 mx-auto sm:mx-0" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton loader for EnhancedForecast component
 * Matches the EnhancedForecast structure with header and carousel/grid
 */
export interface ForecastSkeletonProps {
  /** Number of forecast cards to show */
  days?: number;
  /** Show forecast header */
  showHeader?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const ForecastSkeleton: React.FC<ForecastSkeletonProps> = ({
  days = 7,
  showHeader = true,
  className = '',
}) => {
  const { theme } = useTheme();

  return (
    <div className={`weather-forecast-skeleton w-full space-y-8 ${className}`}>
      {/* Enhanced Header - matches EnhancedForecast header */}
      {showHeader && (
        <div className="text-center space-y-4">
          <div
            className="inline-flex items-center space-x-3 rounded-full px-6 py-3 border"
            style={{
              background: theme.isDark
                ? 'linear-gradient(to right, rgba(var(--theme-accent-rgb), 0.15), rgba(var(--theme-accent-rgb), 0.1))'
                : 'linear-gradient(to right, rgba(var(--theme-accent-rgb), 0.08), rgba(var(--theme-accent-rgb), 0.05))',
              borderColor: theme.isDark
                ? 'rgba(var(--theme-accent-rgb), 0.3)'
                : 'rgba(var(--theme-accent-rgb), 0.2)',
            }}
          >
            <SkeletonText width="2rem" height="2rem" />
            <SkeletonText width="10rem" height="1.75rem" />
            <SkeletonText width="4rem" height="1.5rem" className="rounded-full" />
          </div>
          <SkeletonText width="16rem" height="1rem" className="mx-auto" />
        </div>
      )}

      {/* Forecast Cards Grid - matches ForecastCard layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        {Array.from({ length: days }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border p-4 space-y-2"
            style={{
              backgroundColor: theme.surfaceColor,
              borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="flex flex-col items-center space-y-2">
              {/* Day name */}
              <SkeletonText width="80%" height="0.875rem" className="mx-auto" />
              {/* Date */}
              <SkeletonText width="60%" height="0.75rem" className="mx-auto" />
              {/* Weather icon */}
              <SkeletonCircle width="40px" height="40px" className="my-2" />
              {/* Temperature */}
              <SkeletonText width="70%" height="1.125rem" className="mx-auto" />
              {/* Min temp */}
              <SkeletonText width="50%" height="0.875rem" className="mx-auto" />
              {/* Weather description */}
              <SkeletonText width="90%" height="0.75rem" className="mx-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton loader for CurrentWeatherDetails component
 * Matches CurrentWeatherDetails with main card + WeatherDetailsGrid
 */
export interface CurrentWeatherDetailsSkeletonProps {
  /** Number of detail cards (7 base + 1 optional AQI) */
  cardCount?: number;
  /** Additional CSS classes */
  className?: string;
}

export const CurrentWeatherDetailsSkeleton: React.FC<CurrentWeatherDetailsSkeletonProps> = ({
  cardCount = 8,
  className = '',
}) => {
  const { theme } = useTheme();

  return (
    <div className={`weather-details-skeleton w-full mx-auto ${className}`}>
      {/* Main Current Weather Card - matches Card with CardHeader in CurrentWeatherDetails */}
      <div
        className="mb-6 rounded-xl border shadow-lg overflow-hidden"
        style={{
          backgroundColor: `${theme.surfaceColor}f2`, // /95 opacity
          borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between max-md:flex-col gap-4">
            {/* Left: Icon + Temperature info */}
            <div className="flex items-center space-x-4">
              <SkeletonCircle width="80px" height="80px" />
              <div className="space-y-2">
                <SkeletonText width="6rem" height="1.875rem" />
                <SkeletonText width="8rem" height="1.125rem" />
                <SkeletonText width="5rem" height="0.875rem" />
              </div>
            </div>
            {/* Right: City/Date info */}
            <div className="text-right space-y-2">
              <SkeletonText width="10rem" height="1.25rem" className="ml-auto" />
              <SkeletonText width="7rem" height="1rem" className="ml-auto" />
              <SkeletonText width="5rem" height="0.875rem" className="ml-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Weather Details Grid - matches WeatherDetailsGrid structure */}
      <div className="space-y-4 sm:space-y-6">
        <SkeletonText width="10rem" height="1.125rem" className="mx-auto" />

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 auto-rows-fr px-4 sm:px-0">
          {Array.from({ length: cardCount }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg p-4 border"
              style={{
                backgroundColor: theme.surfaceColor,
                borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              }}
            >
              <div className="flex items-center gap-4 mb-3">
                <SkeletonCircle width="3rem" height="3rem" />
                <SkeletonText width="60%" height="1rem" />
              </div>
              <SkeletonText width="80%" height="1.75rem" />
              <SkeletonText width="50%" height="0.875rem" className="mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton loader for HistoricalWeatherComparison component
 * Matches the HistoricalWeatherComparison card structure
 */
export interface HistoricalWeatherComparisonSkeletonProps {
  /** Additional CSS classes */
  className?: string;
}

export const HistoricalWeatherComparisonSkeleton: React.FC<
  HistoricalWeatherComparisonSkeletonProps
> = ({ className = '' }) => {
  const { theme } = useTheme();

  return (
    <div
      className={`historical-weather-skeleton rounded-xl border overflow-hidden ${className}`}
      style={{
        backgroundColor: theme.surfaceColor,
        borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Header */}
      <div
        className="p-4 sm:p-6 border-b"
        style={{ borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <SkeletonText width="2rem" height="2rem" />
            <SkeletonText width="12rem" height="1.5rem" />
          </div>
          <div className="flex gap-2">
            <SkeletonText width="5rem" height="2rem" className="rounded-md" />
            <SkeletonText width="5rem" height="2rem" className="rounded-md" />
          </div>
        </div>
      </div>

      {/* Body - Comparison metrics */}
      <div className="p-4 sm:p-6 space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center justify-between py-3">
            <SkeletonText width="6rem" height="1rem" />
            <div className="flex gap-4">
              <SkeletonText width="4rem" height="1.5rem" />
              <SkeletonText width="4rem" height="1.5rem" />
              <SkeletonText width="4rem" height="1.5rem" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton loader for HourlyForecastTimeline component
 * Matches the HourlyForecastTimeline card structure with horizontal scrolling items
 */
export interface HourlyForecastTimelineSkeletonProps {
  /** Number of hourly items to show */
  hoursToShow?: number;
  /** Additional CSS classes */
  className?: string;
}

export const HourlyForecastTimelineSkeleton: React.FC<HourlyForecastTimelineSkeletonProps> = ({
  hoursToShow = 24,
  className = '',
}) => {
  const { theme } = useTheme();

  return (
    <div
      className={`hourly-forecast-skeleton rounded-xl border overflow-hidden ${className}`}
      style={{
        backgroundColor: theme.surfaceColor,
        borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Header */}
      <div
        className="p-4 sm:p-6 border-b"
        style={{ borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <SkeletonText width="2rem" height="2rem" />
            <SkeletonText width="10rem" height="1.5rem" />
            <SkeletonText width="4rem" height="1.5rem" className="rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <SkeletonText width="3rem" height="1rem" />
            <SkeletonText width="1rem" height="1rem" />
            <SkeletonText width="3rem" height="1rem" />
          </div>
        </div>
      </div>

      {/* Body - Scrollable timeline */}
      <div className="p-4">
        <div className="flex gap-3 overflow-x-auto py-4">
          {Array.from({ length: Math.min(hoursToShow, 12) }).map((_, index) => (
            <div
              key={index}
              className="flex-shrink-0 rounded-xl border p-3 min-w-[90px]"
              style={{
                backgroundColor: theme.surfaceColor,
                borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              }}
            >
              <div className="flex flex-col items-center space-y-2">
                <SkeletonText width="3rem" height="0.875rem" className="mx-auto" />
                <SkeletonCircle width="40px" height="40px" />
                <SkeletonText width="2.5rem" height="1.125rem" className="mx-auto" />
                <SkeletonText width="2rem" height="0.75rem" className="mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected hour details panel */}
      <div
        className="p-4 border-t"
        style={{ borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <SkeletonText width="3rem" height="0.75rem" className="mx-auto" />
              <SkeletonText width="4rem" height="1.25rem" className="mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Complete weather content skeleton - mirrors Forecast component structure
 * Layout: Stack with WeatherCard + Dashboard Toggle + CurrentWeatherDetails + HistoricalWeatherComparison + HourlyForecastTimeline + EnhancedForecast
 */
export interface WeatherContentSkeletonProps {
  /** Show current weather card (WeatherCard skeleton) */
  showCurrentWeather?: boolean;
  /** Show weather details (CurrentWeatherDetails skeleton) */
  showWeatherDetails?: boolean;
  /** Show historical comparison (HistoricalWeatherComparison skeleton) */
  showHistoricalComparison?: boolean;
  /** Show hourly forecast (HourlyForecastTimeline skeleton) */
  showHourlyForecast?: boolean;
  /** Show forecast section (EnhancedForecast skeleton) */
  showForecast?: boolean;
  /** Number of forecast days */
  forecastDays?: number;
  /** Number of hourly forecast items */
  hoursToShow?: number;
  /** WeatherCard variant */
  cardVariant?: 'default' | 'compact' | 'detailed';
  /** Additional CSS classes */
  className?: string;
}

export const WeatherContentSkeleton: React.FC<WeatherContentSkeletonProps> = ({
  showCurrentWeather = true,
  showWeatherDetails = true,
  showHistoricalComparison = true,
  showHourlyForecast = true,
  showForecast = true,
  forecastDays = 7,
  hoursToShow = 24,
  cardVariant = 'detailed',
  className = '',
}) => {
  return (
    // Uses Stack spacing="lg" which maps to mt-6 (1.5rem)
    <div
      className={`weather-content-skeleton flex flex-col items-center text-center w-full ${className}`}
    >
      {/* WeatherCard Skeleton */}
      {showCurrentWeather && (
        <div className="w-full">
          <WeatherCardSkeleton variant={cardVariant} />
        </div>
      )}

      {/* Dashboard Toggle Section Skeleton */}
      {showWeatherDetails && (
        <div className="w-full mt-6">
          <div className="flex justify-between items-center mb-4 px-4">
            <SkeletonText width="8rem" height="1.125rem" />
            <SkeletonText width="9rem" height="2rem" className="rounded-md" />
          </div>
        </div>
      )}

      {/* CurrentWeatherDetails Skeleton */}
      {showWeatherDetails && (
        <div className="w-full mt-6">
          <CurrentWeatherDetailsSkeleton />
        </div>
      )}

      {/* HistoricalWeatherComparison Skeleton */}
      {showHistoricalComparison && (
        <div className="w-full mt-6 px-4">
          <HistoricalWeatherComparisonSkeleton />
        </div>
      )}

      {/* HourlyForecastTimeline Skeleton */}
      {showHourlyForecast && (
        <div className="w-full mt-6 px-4">
          <HourlyForecastTimelineSkeleton hoursToShow={hoursToShow} />
        </div>
      )}

      {/* EnhancedForecast Skeleton */}
      {showForecast && (
        <div className="w-full mt-6">
          <ForecastSkeleton days={forecastDays} />
        </div>
      )}
    </div>
  );
};

/**
 * Loading state with skeleton and message
 */
export interface LoadingWithSkeletonProps {
  /** Loading message */
  message?: string;
  /** Show skeleton */
  showSkeleton?: boolean;
  /** Skeleton variant */
  variant?: 'weather' | 'forecast' | 'details';
  /** Additional CSS classes */
  className?: string;
}

export const LoadingWithSkeleton: React.FC<LoadingWithSkeletonProps> = ({
  message = 'Loading weather data...',
  showSkeleton = true,
  variant = 'weather',
  className = '',
}) => {
  const { theme } = useTheme();

  return (
    <div
      className={`loading-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: SPACING[6],
        padding: SPACING[8],
      }}
    >
      {/* Loading Message */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '3rem',
            height: '3rem',
            border: `3px solid ${theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderTopColor: theme.primaryColor,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem',
          }}
        />
        <p
          style={{
            color: theme.textSecondaryColor,
            fontSize: '1rem',
            fontWeight: 500,
          }}
        >
          {message}
        </p>
      </div>

      {/* Skeleton */}
      {showSkeleton && (
        <div style={{ width: '100%' }}>
          {variant === 'weather' && <WeatherContentSkeleton />}
          {variant === 'forecast' && <ForecastSkeleton days={5} />}
          {variant === 'details' && <CurrentWeatherDetailsSkeleton />}
        </div>
      )}
    </div>
  );
};

export default WeatherContentSkeleton;
