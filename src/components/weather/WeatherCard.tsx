/**
 * Unified Weather Card Component
 * Merges City/Date information with Current Temperature in a single card
 * matching Header UI aesthetics with glass morphism and blue accents
 */

import React, { useEffect, useState } from 'react';
import ReactAnimatedWeather from 'react-animated-weather';
import { useTranslation } from 'react-i18next';

import TemperatureToggle from '@/components/ui/weather/metrics/temperature/TemperatureToggle';
import { ICON_SIZES } from '@/constants/ui';
import { useTheme } from '@/design-system/theme';
import useFavoriteLocations from '@/hooks/useFavoriteLocations';
import { usePrefersReducedMotion } from '@/hooks/useMotion';
import { useDateI18n } from '@/i18n/hooks/useDateI18n';
import type { CurrentWeatherData } from '@/types/weather';

export interface WeatherCardProps {
  /** Weather data */
  weather: CurrentWeatherData;
  /** Temperature unit */
  temperatureUnit: 'C' | 'F';
  /** Function to get localized temperature */
  getLocalizedTemperature: (temp: number) => string;
  /** Function to get localized weather description */
  getLocalizedWeatherDescription: (code: number) => string;
  /** Function to toggle temperature unit */
  toggleTemperatureUnit: () => void;
  /** Component variant */
  variant?: 'default' | 'compact' | 'detailed';
  /** Show additional weather info */
  showWeatherDescription?: boolean;
  /** Show feels like temperature */
  showFeelsLike?: boolean;
  /** Show time information */
  showTime?: boolean;
  /** Custom className */
  className?: string;
  /** Enable variant toggle button */
  enableVariantToggle?: boolean;
  /** Callback when variant changes */
  onVariantChange?: (variant: 'default' | 'compact' | 'detailed') => void;
}

interface FavoriteLocationButtonProps {
  locationLabel: string;
  className?: string;
}

const FavoriteLocationButton: React.FC<FavoriteLocationButtonProps> = ({
  locationLabel,
  className = '',
}) => {
  const { addFavorite, removeFavorite, isFavorite } = useFavoriteLocations();

  const trimmedLabel = locationLabel.trim();
  const isDisabled = trimmedLabel.length === 0;
  const isActive = !isDisabled && isFavorite(trimmedLabel);

  const handleClick = () => {
    if (isDisabled) return;

    if (isActive) {
      removeFavorite(trimmedLabel);
    } else {
      addFavorite(trimmedLabel);
    }
  };

  const baseClasses = [
    'inline-flex items-center justify-center',
    'rounded-full border-2',
    'w-9 h-9 sm:w-10 sm:h-10',
    'text-xs sm:text-sm',
    'transition-all duration-300 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'shadow-sm hover:shadow-md',
    'backdrop-blur-sm',
  ].join(' ');

  const stateClasses = isActive
    ? 'bg-gradient-to-br from-[var(--theme-accent)]/20 to-[var(--theme-accent)]/10 text-[var(--theme-accent)] border-[var(--theme-accent)] focus:ring-[var(--theme-accent)] hover:scale-110 hover:shadow-[0_0_20px_var(--theme-accent)]/30'
    : 'bg-[var(--theme-surface)]/80 text-[var(--theme-text-secondary)] border-[var(--theme-border)] hover:bg-[var(--theme-hover)] hover:border-[var(--theme-accent)]/50 hover:text-[var(--theme-accent)] hover:scale-105 focus:ring-[var(--theme-primary)]';

  const disabledClasses = isDisabled ? 'opacity-60 cursor-not-allowed hover:scale-100' : '';

  return (
    <button
      type="button"
      aria-label={isActive ? 'Remove location from favorites' : 'Add location to favorites'}
      aria-pressed={isActive}
      disabled={isDisabled}
      className={`${baseClasses} ${stateClasses} ${disabledClasses} ${className}`}
      onClick={handleClick}
    >
      <svg
        aria-hidden="true"
        className="w-4 h-4"
        fill={isActive ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.89a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.89a1 1 0 00-1.176 0l-3.976 2.89c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.978 10.1c-.783-.57-.38-1.81.588-1.81h4.916a1 1 0 00.95-.69l1.517-4.674z" />
      </svg>
    </button>
  );
};

const WeatherCard: React.FC<WeatherCardProps> = ({
  weather,
  temperatureUnit,
  getLocalizedTemperature,
  getLocalizedWeatherDescription,
  toggleTemperatureUnit,
  variant = 'default',
  showWeatherDescription = true,
  showFeelsLike = true,
  showTime = false,
  className = '',
  enableVariantToggle = false,
  onVariantChange,
}) => {
  const { t } = useTranslation(['common', 'weather']);
  const { formatDate } = useDateI18n();
  const { theme } = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentVariant, setCurrentVariant] = useState<'default' | 'compact' | 'detailed'>(variant);
  const locationLabel = weather.country ? `${weather.city}, ${weather.country}` : weather.city;

  // Update current time every minute if showTime is enabled
  useEffect(() => {
    if (!showTime) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [showTime]);

  // Update internal variant when prop changes
  useEffect(() => {
    setCurrentVariant(variant);
  }, [variant]);

  // Get the active variant (internal state if toggle enabled, otherwise prop)
  const activeVariant = enableVariantToggle ? currentVariant : variant;

  // Handle variant toggle
  const handleVariantToggle = () => {
    if (!enableVariantToggle) return;

    const variants: Array<'default' | 'compact' | 'detailed'> = ['default', 'compact', 'detailed'];
    const currentIndex = variants.indexOf(currentVariant);
    const nextIndex = (currentIndex + 1) % variants.length;
    const nextVariant = variants[nextIndex];

    setCurrentVariant(nextVariant);
    onVariantChange?.(nextVariant);
  };

  // Render temperature without unit suffix for display
  const renderTemperature = (temperature: number) => {
    return getLocalizedTemperature(temperature).replace(/[°CF]/g, '');
  };

  // Get formatted date
  const getFormattedDate = () => {
    return formatDate(new Date(), 'long');
  };

  // Get formatted time
  const getFormattedTime = () => {
    if (!showTime) return null;
    return formatDate(currentTime, 'time');
  };

  // Get variant-specific styling with mobile-first approach and theme awareness
  const getVariantStyles = () => {
    const baseStyles = [
      'bg-gradient-to-br from-[var(--theme-surface)]/98 to-[var(--theme-surface)]/95',
      'backdrop-blur-md',
      'border border-[var(--theme-border)]/60',
      'rounded-2xl',
      'shadow-[0_2px_8px_var(--theme-shadow),0_1px_2px_var(--theme-shadow)]',
      'hover:shadow-[0_8px_24px_var(--theme-shadow),0_2px_8px_var(--theme-shadow)]',
      'hover:border-[var(--theme-accent)]/30',
      'transition-all',
      'duration-300',
      'ease-out',
      'w-full',
      'overflow-hidden',
      'relative', // For positioning the variant toggle button
      'group', // For group hover effects
    ];

    switch (activeVariant) {
      case 'compact':
        return [...baseStyles, 'p-4 sm:p-5'].join(' ');
      case 'detailed':
        return [...baseStyles, 'p-5 sm:p-7', 'space-y-4 sm:space-y-5'].join(' ');
      default:
        return [...baseStyles, 'p-5 sm:p-6', 'space-y-4 sm:space-y-5'].join(' ');
    }
  };

  // Render variant toggle button
  const renderVariantToggle = () => {
    if (!enableVariantToggle) return null;

    const getVariantIcon = (variant: string) => {
      switch (variant) {
        case 'compact':
          return '⚡'; // Lightning for compact/fast
        case 'detailed':
          return '📋'; // Clipboard for detailed/comprehensive
        default:
          return '🎯'; // Target for default/balanced
      }
    };

    const getVariantLabel = (variant: string) => {
      switch (variant) {
        case 'compact':
          return t('common:compact', 'Compact');
        case 'detailed':
          return t('common:detailed', 'Detailed');
        default:
          return t('common:default', 'Default');
      }
    };

    return (
      <button
        className={`
          absolute bottom-3 right-3 z-10
          w-9 h-9 sm:w-11 sm:h-11
          bg-gradient-to-br from-[var(--theme-surface)]/95 to-[var(--theme-surface)]/90
          backdrop-blur-md
          border border-[var(--theme-border)]/60
          rounded-xl
          flex items-center justify-center
          text-[var(--theme-text-secondary)]
          hover:text-[var(--theme-accent)]
          hover:bg-gradient-to-br hover:from-[var(--theme-accent)]/10 hover:to-[var(--theme-accent)]/5
          hover:border-[var(--theme-accent)]/60
          hover:scale-110
          active:scale-95
          transition-all duration-300 ease-out
          focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]/50 focus:ring-offset-2
          shadow-[0_2px_8px_var(--theme-shadow)]
          hover:shadow-[0_4px_16px_var(--theme-accent)]/20
        `}
        title={`${t('common:switchTo', 'Switch to')} ${getVariantLabel(
          ['default', 'compact', 'detailed'][
            (['default', 'compact', 'detailed'].indexOf(activeVariant) + 1) % 3
          ]
        )}`}
        onClick={handleVariantToggle}
      >
        <span className="text-base sm:text-lg transition-transform duration-300">
          {getVariantIcon(activeVariant)}
        </span>
      </button>
    );
  };

  // Render location icon - Theme-aware with accent color and gradient
  const renderLocationIcon = () => (
    <div
      className="inline-flex items-center justify-center w-8 h-8 rounded-full mr-2.5 shadow-sm transition-all duration-300 group-hover:scale-110"
      style={{
        background: theme.isDark
          ? 'linear-gradient(135deg, rgba(var(--theme-accent-rgb), 0.2) 0%, rgba(var(--theme-accent-rgb), 0.1) 100%)'
          : 'linear-gradient(135deg, rgba(var(--theme-accent-rgb), 0.15) 0%, rgba(var(--theme-accent-rgb), 0.08) 100%)',
        boxShadow: theme.isDark
          ? '0 2px 8px rgba(var(--theme-accent-rgb), 0.15)'
          : '0 2px 8px rgba(var(--theme-accent-rgb), 0.1)',
      }}
    >
      <svg
        className="w-4 h-4 drop-shadow-sm"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        style={{ color: 'var(--theme-accent)' }}
        viewBox="0 0 24 24"
      >
        <path
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );

  // Render time icon - Theme-aware with accent color and gradient
  const renderTimeIcon = () => (
    <div
      className="inline-flex items-center justify-center w-6 h-6 rounded-full mr-2 shadow-sm transition-all duration-300"
      style={{
        background: theme.isDark
          ? 'linear-gradient(135deg, rgba(var(--theme-accent-rgb), 0.2) 0%, rgba(var(--theme-accent-rgb), 0.1) 100%)'
          : 'linear-gradient(135deg, rgba(var(--theme-accent-rgb), 0.15) 0%, rgba(var(--theme-accent-rgb), 0.08) 100%)',
        boxShadow: theme.isDark
          ? '0 2px 8px rgba(var(--theme-accent-rgb), 0.15)'
          : '0 2px 8px rgba(var(--theme-accent-rgb), 0.1)',
      }}
    >
      <svg
        className="w-3 h-3 drop-shadow-sm"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        style={{ color: 'var(--theme-accent)' }}
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    </div>
  );

  // Render compact variant with mobile-first approach
  const renderCompact = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Location and Date */}
      <div className="flex items-center flex-1 min-w-0">
        {renderLocationIcon()}
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-lg font-bold text-[var(--theme-text)] leading-tight truncate tracking-tight">
            {weather.city}
            <span className="text-[var(--theme-text-secondary)] font-medium ml-1.5">
              {weather.country && `, ${weather.country}`}
            </span>
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-[var(--theme-text-secondary)] mt-1.5 gap-1 sm:gap-0 font-medium">
            <span className="truncate">{getFormattedDate()}</span>
            {showTime && (
              <>
                <span className="hidden sm:inline sm:mx-2 text-[var(--theme-accent)]/50">•</span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--theme-accent)] animate-pulse" />
                  {getFormattedTime()}
                </span>
              </>
            )}
          </div>
        </div>
        <FavoriteLocationButton locationLabel={locationLabel} className="ml-3" />
      </div>

      {/* Temperature and Weather */}
      <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0 bg-gradient-to-br from-[var(--theme-accent)]/5 to-transparent rounded-xl px-3 py-2 sm:px-4 sm:py-2.5">
        <div className="relative">
          <ReactAnimatedWeather
            animate={!prefersReducedMotion}
            color={theme.isDark ? '#9CA3AF' : '#6B7280'}
            icon={weather.condition.icon as any}
            size={40}
          />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[var(--theme-accent)] rounded-full border-2 border-[var(--theme-surface)] shadow-sm" />
        </div>
        <div className="text-right">
          <div className="flex items-center">
            <span className="text-2xl sm:text-3xl font-bold text-[var(--theme-text)] tracking-tight bg-gradient-to-br from-[var(--theme-text)] to-[var(--theme-text-secondary)] bg-clip-text">
              {renderTemperature(weather.temperature.current)}
            </span>
            <TemperatureToggle
              className="ml-1.5"
              previewTemperature={weather.temperature.current}
              showLabels={false}
              showPreview={true}
              temperatureUnit={temperatureUnit}
              variant="compact"
              onToggle={toggleTemperatureUnit}
            />
          </div>
          {showWeatherDescription && (
            <p className="text-xs sm:text-sm text-[var(--theme-text-secondary)] capitalize mt-1.5 max-w-[120px] sm:max-w-none truncate font-medium">
              {getLocalizedWeatherDescription(weather.condition.code)}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Render default variant
  const renderDefault = () => (
    <div className="text-center space-y-4 sm:space-y-5">
      {/* Location and Date Header */}
      <div className="space-y-2 sm:space-y-3">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center">
            {renderLocationIcon()}
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--theme-text)] tracking-tight bg-gradient-to-br from-[var(--theme-text)] to-[var(--theme-text-secondary)] bg-clip-text">
              {weather.city}
              {weather.country && (
                <span className="text-[var(--theme-text-secondary)] font-semibold ml-2">
                  , {weather.country}
                </span>
              )}
            </h2>
            <FavoriteLocationButton locationLabel={locationLabel} className="ml-3" />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-center text-[var(--theme-text-secondary)] gap-2 sm:gap-0 font-medium">
          <span className="text-sm sm:text-base">{getFormattedDate()}</span>
          {showTime && (
            <div className="flex items-center justify-center sm:ml-4">
              {renderTimeIcon()}
              <span className="text-sm sm:text-base flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--theme-accent)] animate-pulse" />
                {getFormattedTime()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Weather and Temperature */}
      <div className="relative">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-accent)]/10 via-transparent to-[var(--theme-accent)]/5 rounded-2xl blur-2xl" />

        <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 py-4">
          <div className="relative">
            <ReactAnimatedWeather
              animate={!prefersReducedMotion}
              color={theme.isDark ? '#9CA3AF' : '#374151'}
              icon={weather.condition.icon as any}
              size={ICON_SIZES.WEATHER_MAIN}
            />
            {/* Decorative ring around icon */}
            <div
              className="absolute inset-0 rounded-full border-2 border-[var(--theme-accent)]/20 animate-pulse"
              style={{ margin: '-8px' }}
            />
          </div>
          <div className="text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-baseline items-center justify-center gap-2 sm:gap-0">
              <span className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-br from-[var(--theme-text)] via-[var(--theme-text)] to-[var(--theme-text-secondary)] bg-clip-text text-transparent">
                {renderTemperature(weather.temperature.current)}
              </span>
              <TemperatureToggle
                className="ml-0 sm:ml-3"
                previewTemperature={weather.temperature.current}
                showLabels={true}
                showPreview={true}
                temperatureUnit={temperatureUnit}
                variant="default"
                onToggle={toggleTemperatureUnit}
              />
            </div>
            {showWeatherDescription && (
              <p className="text-base sm:text-xl text-[var(--theme-text-secondary)] capitalize mt-2 sm:mt-3 font-semibold">
                {getLocalizedWeatherDescription(weather.condition.code)}
              </p>
            )}
            {showFeelsLike && weather.temperature.feels_like && (
              <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-[var(--theme-surface)]/60 backdrop-blur-sm rounded-full border border-[var(--theme-border)]/40">
                <svg
                  className="w-3.5 h-3.5 text-[var(--theme-accent)]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2v10m0 0L8 8m4 4l4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-xs sm:text-sm text-[var(--theme-text-secondary)] font-medium">
                  {t('weather:labels.feelsLike')}{' '}
                  {renderTemperature(weather.temperature.feels_like)}°{temperatureUnit}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render detailed variant
  const renderDetailed = () => (
    <div className="space-y-5 sm:space-y-7">
      {/* Location Header */}
      <div className="flex items-start">
        {renderLocationIcon()}
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--theme-text)] leading-tight truncate tracking-tight bg-gradient-to-br from-[var(--theme-text)] to-[var(--theme-text-secondary)] bg-clip-text">
            {weather.city}
          </h2>
          {weather.country && (
            <p className="text-base sm:text-lg text-[var(--theme-text-secondary)] mt-2 font-semibold">
              {weather.country}
            </p>
          )}
        </div>
        <FavoriteLocationButton locationLabel={locationLabel} className="ml-3" />
      </div>

      {/* Main Weather Display */}
      <div className="relative">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-accent)]/10 via-transparent to-[var(--theme-accent)]/5 rounded-2xl blur-xl" />

        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6 p-4 sm:p-5 bg-gradient-to-br from-[var(--theme-surface)]/40 to-transparent rounded-2xl border border-[var(--theme-border)]/30 backdrop-blur-sm">
          <div className="flex items-center space-x-4 sm:space-x-5">
            <div className="relative">
              <ReactAnimatedWeather
                animate={!prefersReducedMotion}
                color={theme.isDark ? '#9CA3AF' : '#374151'}
                icon={weather.condition.icon as any}
                size={64}
              />
              {/* Decorative ring around icon */}
              <div
                className="absolute inset-0 rounded-full border-2 border-[var(--theme-accent)]/20 animate-pulse"
                style={{ margin: '-10px' }}
              />
            </div>
            <div className="text-center sm:text-left">
              {showWeatherDescription && (
                <p className="text-xl sm:text-2xl text-[var(--theme-text)] capitalize font-bold tracking-tight">
                  {getLocalizedWeatherDescription(weather.condition.code)}
                </p>
              )}
              {showFeelsLike && weather.temperature.feels_like && (
                <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-[var(--theme-surface)]/60 backdrop-blur-sm rounded-full border border-[var(--theme-border)]/40">
                  <svg
                    className="w-3.5 h-3.5 text-[var(--theme-accent)]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 2v10m0 0L8 8m4 4l4-4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-xs sm:text-sm text-[var(--theme-text-secondary)] font-medium">
                    {t('weather:labels.feelsLike')}{' '}
                    {renderTemperature(weather.temperature.feels_like)}°{temperatureUnit}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="text-center sm:text-right">
            <div className="flex flex-col sm:flex-row sm:items-baseline items-center justify-center gap-2 sm:gap-0">
              <span className="text-5xl sm:text-6xl md:text-7xl font-light tracking-tighter bg-gradient-to-br from-[var(--theme-text)] via-[var(--theme-text)] to-[var(--theme-text-secondary)] bg-clip-text text-transparent">
                {renderTemperature(weather.temperature.current)}
              </span>
              <TemperatureToggle
                className="ml-0 sm:ml-3"
                previewTemperature={weather.temperature.current}
                showLabels={true}
                showPreview={false}
                temperatureUnit={temperatureUnit}
                variant="detailed"
                onToggle={toggleTemperatureUnit}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Date and Time Info */}
      <div className="relative border-t border-[var(--theme-border)]/50 pt-4 sm:pt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-[var(--theme-surface)]/60 to-transparent rounded-xl border border-[var(--theme-border)]/30 backdrop-blur-sm transition-all duration-300 hover:border-[var(--theme-accent)]/40 hover:shadow-md">
            <div
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl shadow-sm"
              style={{
                background: theme.isDark
                  ? 'linear-gradient(135deg, rgba(var(--theme-accent-rgb), 0.2) 0%, rgba(var(--theme-accent-rgb), 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(var(--theme-accent-rgb), 0.15) 0%, rgba(var(--theme-accent-rgb), 0.08) 100%)',
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                style={{ color: 'var(--theme-accent)' }}
                viewBox="0 0 24 24"
              >
                <rect height="18" rx="2" ry="2" width="18" x="3" y="4" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
            </div>
            <span className="text-sm sm:text-base text-[var(--theme-text)] truncate font-medium">
              {getFormattedDate()}
            </span>
          </div>
          {showTime && (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-[var(--theme-surface)]/60 to-transparent rounded-xl border border-[var(--theme-border)]/30 backdrop-blur-sm transition-all duration-300 hover:border-[var(--theme-accent)]/40 hover:shadow-md">
              {renderTimeIcon()}
              <span className="text-sm sm:text-base text-[var(--theme-text)] truncate font-medium flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--theme-accent)] animate-pulse" />
                {getFormattedTime()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render based on variant
  const renderContent = () => {
    switch (activeVariant) {
      case 'compact':
        return renderCompact();
      case 'detailed':
        return renderDetailed();
      default:
        return renderDefault();
    }
  };

  return (
    <div className={`${getVariantStyles()} ${className}`}>
      {renderVariantToggle()}
      {renderContent()}
    </div>
  );
};

export default WeatherCard;
