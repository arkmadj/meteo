/**
 * ForecastCard Component
 * Enhanced forecast card with improved typography, gradient backgrounds, visual meters,
 * and consistent design tokens matching the weather details cards
 */

import React from 'react';
import ReactAnimatedWeather from 'react-animated-weather';
import { useTranslation } from 'react-i18next';

import { CardBody } from '@/components/ui/atoms';
import AnimatedCard from '@/components/ui/weather/display/AnimatedCard';
import { useTheme } from '@/design-system/theme';
import { usePrefersReducedMotion } from '@/hooks/useMotion';
import type { ForecastDay } from '@/types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  index: number;
  isToday?: boolean;
  isTomorrow?: boolean;
  temperatureUnit: 'C' | 'F';
  getLocalizedTemperature: (temp: number) => string;
  getLocalizedWeatherDescription: (code: number) => string;
  formatWeekday: (date: string, format?: 'short' | 'long') => string;
  delay?: number;
  animationType?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'fadeInScale' | 'fadeInRotate';
  showDetailedMetrics?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  tabIndex?: number;
  role?: string;
}

const ForecastCard: React.FC<ForecastCardProps> = ({
  day,
  index,
  isToday = false,
  isTomorrow = false,
  temperatureUnit: _temperatureUnit,
  getLocalizedTemperature,
  getLocalizedWeatherDescription,
  formatWeekday,
  delay = 0,
  animationType = 'fadeInUp',
  showDetailedMetrics = true,
  size = 'md',
  className = '',
  onClick,
}) => {
  const { t } = useTranslation(['weather']);
  const { theme } = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();
  const iconColor = theme.isDark ? '#E5E7EB' : '#374151';

  // Helper function to format day name
  const formatDayName = (date: string): string => {
    if (isToday) return t('weather:forecast.today');
    if (isTomorrow) return t('weather:forecast.tomorrow');
    return formatWeekday(date, 'short');
  };

  // Helper function to get UV index color and level (with dark theme variants)
  const getUVIndexInfo = (uvIndex: number) => {
    if (uvIndex <= 2)
      return {
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-100 dark:bg-green-900/30',
        level: 'Low',
      };
    if (uvIndex <= 5)
      return {
        color: 'text-yellow-600 dark:text-yellow-400',
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        level: 'Moderate',
      };
    if (uvIndex <= 7)
      return {
        color: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        level: 'High',
      };
    if (uvIndex <= 10)
      return {
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-100 dark:bg-red-900/30',
        level: 'Very High',
      };
    return {
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      level: 'Extreme',
    };
  };

  // Helper function to get precipitation probability color
  const getPrecipitationInfo = (probability: number) => {
    if (probability <= 20)
      return {
        color: 'text-gray-500 dark:text-gray-300',
        bg: 'bg-gray-100 dark:bg-gray-700/40',
        level: 'Low',
      };
    if (probability <= 50)
      return {
        color: 'text-blue-500 dark:text-blue-400',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        level: 'Moderate',
      };
    if (probability <= 80)
      return {
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-200 dark:bg-blue-900/30',
        level: 'High',
      };
    return {
      color: 'text-blue-800 dark:text-blue-300',
      bg: 'bg-blue-300 dark:bg-blue-900/30',
      level: 'Very High',
    };
  };

  // Helper function to get wind speed info
  const getWindSpeedInfo = (speed: number) => {
    if (speed <= 5)
      return {
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-100 dark:bg-green-900/30',
        level: 'Light',
      };
    if (speed <= 15)
      return {
        color: 'text-yellow-600 dark:text-yellow-400',
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        level: 'Moderate',
      };
    if (speed <= 25)
      return {
        color: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        level: 'Strong',
      };
    return {
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/30',
      level: 'Very Strong',
    };
  };

  // Helper function to get humidity info
  const getHumidityInfo = (humidity: number) => {
    if (humidity <= 30)
      return {
        color: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        level: 'Low',
      };
    if (humidity <= 60)
      return {
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-100 dark:bg-green-900/30',
        level: 'Comfortable',
      };
    if (humidity <= 80)
      return {
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        level: 'High',
      };
    return {
      color: 'text-blue-800 dark:text-blue-300',
      bg: 'bg-blue-200 dark:bg-blue-900/30',
      level: 'Very High',
    };
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      iconSize: 32,
      cardPadding: 'p-3',
      titleText: 'text-xs',
      dateText: 'text-[10px]',
      tempText: 'text-sm',
      tempMinText: 'text-xs',
      metricText: 'text-[10px]',
      metricIcon: 'text-xs',
      spacing: 'space-y-1',
      metricSpacing: 'space-y-0.5',
    },
    md: {
      iconSize: 40,
      cardPadding: 'p-4',
      titleText: 'text-sm',
      dateText: 'text-xs',
      tempText: 'text-lg',
      tempMinText: 'text-sm',
      metricText: 'text-xs',
      metricIcon: 'text-sm',
      spacing: 'space-y-2',
      metricSpacing: 'space-y-1',
    },
    lg: {
      iconSize: 48,
      cardPadding: 'p-5',
      titleText: 'text-base',
      dateText: 'text-sm',
      tempText: 'text-xl',
      tempMinText: 'text-base',
      metricText: 'text-sm',
      metricIcon: 'text-base',
      spacing: 'space-y-3',
      metricSpacing: 'space-y-1.5',
    },
  };

  const config = sizeConfig?.[size];

  // Get theme-aware gradient background based on day index
  const getGradientBackground = (dayIndex: number): React.CSSProperties => {
    // Color palette for each day with RGB values for theme-aware gradients
    const colorPalettes = [
      // Today - Blue
      {
        light: { from: '#eff6ff', to: '#dbeafe', border: '#bfdbfe' },
        dark: {
          from: 'rgba(59, 130, 246, 0.15)',
          to: 'rgba(59, 130, 246, 0.1)',
          border: 'rgba(59, 130, 246, 0.3)',
        },
      },
      // Tomorrow - Cyan
      {
        light: { from: '#ecfeff', to: '#cffafe', border: '#a5f3fc' },
        dark: {
          from: 'rgba(6, 182, 212, 0.15)',
          to: 'rgba(6, 182, 212, 0.1)',
          border: 'rgba(6, 182, 212, 0.3)',
        },
      },
      // Day 3 - Green
      {
        light: { from: '#f0fdf4', to: '#dcfce7', border: '#bbf7d0' },
        dark: {
          from: 'rgba(34, 197, 94, 0.15)',
          to: 'rgba(34, 197, 94, 0.1)',
          border: 'rgba(34, 197, 94, 0.3)',
        },
      },
      // Day 4 - Purple
      {
        light: { from: '#faf5ff', to: '#f3e8ff', border: '#e9d5ff' },
        dark: {
          from: 'rgba(168, 85, 247, 0.15)',
          to: 'rgba(168, 85, 247, 0.1)',
          border: 'rgba(168, 85, 247, 0.3)',
        },
      },
      // Day 5 - Yellow/Orange
      {
        light: { from: '#fefce8', to: '#fed7aa', border: '#fde68a' },
        dark: {
          from: 'rgba(251, 146, 60, 0.15)',
          to: 'rgba(251, 146, 60, 0.1)',
          border: 'rgba(251, 146, 60, 0.3)',
        },
      },
      // Day 6 - Indigo
      {
        light: { from: '#eef2ff', to: '#e0e7ff', border: '#c7d2fe' },
        dark: {
          from: 'rgba(99, 102, 241, 0.15)',
          to: 'rgba(99, 102, 241, 0.1)',
          border: 'rgba(99, 102, 241, 0.3)',
        },
      },
      // Day 7 - Slate/Blue
      {
        light: { from: '#f8fafc', to: '#eff6ff', border: '#cbd5e1' },
        dark: {
          from: 'rgba(100, 116, 139, 0.15)',
          to: 'rgba(59, 130, 246, 0.1)',
          border: 'rgba(100, 116, 139, 0.3)',
        },
      },
    ];

    const palette = colorPalettes[dayIndex % colorPalettes.length];
    const colors = theme.isDark ? palette.dark : palette.light;

    // High contrast mode: use solid colors with stronger borders
    if (theme.isHighContrast) {
      return {
        background: theme.isDark ? 'var(--theme-surface)' : 'var(--theme-background)',
        borderColor: 'var(--theme-border)',
        borderWidth: '2px',
      };
    }

    return {
      background: `linear-gradient(to bottom right, ${colors.from}, ${colors.to})`,
      borderColor: colors.border,
    };
  };

  const uvInfo = getUVIndexInfo(day.uvIndex);
  const precipInfo = getPrecipitationInfo(day.precipitationProbability);
  const windInfo = getWindSpeedInfo(day.wind.speed);
  const humidityInfo = getHumidityInfo(day.humidity);

  const cardStyles = getGradientBackground(index);

  return (
    <AnimatedCard
      animationType={animationType}
      className={`text-center transition-all duration-300 border ${className}`}
      delay={delay}
      duration={600}
      style={{
        ...cardStyles,
        boxShadow: theme.isHighContrast ? 'none' : undefined,
        transform: 'translateY(0)',
      }}
      variant="outlined"
      onClick={onClick}
      onMouseEnter={e => {
        if (!theme.isHighContrast) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow =
            '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <CardBody className={config.cardPadding}>
        <div className={`${config.spacing} flex flex-col h-full`}>
          {/* Day and Date Header */}
          <div className="flex-shrink-0">
            <h3 className={`font-semibold ${config.titleText} mb-1 text-[var(--theme-text)]`}>
              {formatDayName(day.date)}
            </h3>
            <p className={`${config.dateText} font-medium text-[var(--theme-text-secondary)]`}>
              {new Date(day.date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Weather Icon and Condition */}
          <div className="flex-shrink-0 flex flex-col items-center space-y-2">
            <div className="relative">
              <ReactAnimatedWeather
                animate={!prefersReducedMotion}
                color={iconColor}
                icon={day.condition.icon}
                size={config.iconSize}
              />
              {/* Weather condition badge - Theme-aware */}
              <div
                className="absolute -bottom-1 -right-1 rounded-full p-1 border"
                style={{
                  backgroundColor: theme.isDark
                    ? 'var(--theme-surface)'
                    : 'var(--theme-background)',
                  borderColor: 'var(--theme-border)',
                  boxShadow: theme.isHighContrast ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--theme-accent)' }}
                ></div>
              </div>
            </div>
            <p
              className={`${config.dateText} capitalize leading-tight text-center max-w-full text-[var(--theme-text-secondary)]`}
            >
              {getLocalizedWeatherDescription(day.condition.code)}
            </p>
          </div>

          {/* Temperature Section */}
          <div className="flex-shrink-0 space-y-1">
            <div className="flex items-center justify-center space-x-2">
              <span className={`${config.tempText} font-bold text-[var(--theme-text)]`}>
                {getLocalizedTemperature(day.temperature.maximum).replace(/[°CF]/g, '')}°
              </span>
              <span className="text-red-500 text-xs">↗</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className={`${config.tempMinText} text-[var(--theme-text-secondary)]`}>
                {getLocalizedTemperature(day.temperature.minimum).replace(/[°CF]/g, '')}°
              </span>
              <span className="text-blue-500 text-xs">↘</span>
            </div>

            {/* Temperature Range Visualization - Theme-aware */}
            <div
              className="w-full rounded-full h-1.5 mt-2"
              style={{
                backgroundColor: theme.isDark
                  ? 'rgba(var(--theme-accent-rgb), 0.2)'
                  : 'rgba(var(--theme-accent-rgb), 0.15)',
              }}
            >
              <div
                className="h-1.5 rounded-full w-3/4 mx-auto"
                style={{
                  background: theme.isDark
                    ? 'linear-gradient(to right, #60a5fa, #f87171)'
                    : 'linear-gradient(to right, #3b82f6, #ef4444)',
                }}
              ></div>
            </div>
          </div>

          {/* Weather Metrics */}
          {showDetailedMetrics && (
            <div className={`flex-1 ${config.metricSpacing} ${config.metricText}`}>
              {/* Precipitation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span className={`${config.metricIcon}`}>💧</span>
                  <span className="text-[var(--theme-text-secondary)]">Rain</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className={precipInfo.color}>{day.precipitationProbability}%</span>
                  <div className={`w-2 h-2 rounded-full ${precipInfo.bg}`}></div>
                </div>
              </div>

              {/* Wind */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span className={`${config.metricIcon}`}>💨</span>
                  <span className="text-[var(--theme-text-secondary)]">Wind</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className={windInfo.color}>{day.wind.speed.toFixed(1)}</span>
                  <div className={`w-2 h-2 rounded-full ${windInfo.bg}`}></div>
                </div>
              </div>

              {/* UV Index */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span className={`${config.metricIcon}`}>☀️</span>
                  <span className="text-[var(--theme-text-secondary)]">UV</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className={uvInfo.color}>{day.uvIndex.toFixed(1)}</span>
                  <div className={`w-2 h-2 rounded-full ${uvInfo.bg}`}></div>
                </div>
              </div>

              {/* Humidity */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span className={`${config.metricIcon}`}>💧</span>
                  <span className="text-[var(--theme-text-secondary)]">Humid</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className={humidityInfo.color}>{day.humidity}%</span>
                  <div className={`w-2 h-2 rounded-full ${humidityInfo.bg}`}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </AnimatedCard>
  );
};

export default ForecastCard;
