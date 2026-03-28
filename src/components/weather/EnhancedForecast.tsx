import React from 'react';
import { useTranslation } from 'react-i18next';

import EnhancedForecastGrid from '@/components/ui/weather/forecast/EnhancedForecastGrid';
import { useTheme } from '@/design-system/theme';
import type { ForecastDay } from '@/types/weather';

interface EnhancedForecastProps {
  forecast: ForecastDay[];
  temperatureUnit: 'C' | 'F';
  getLocalizedTemperature: (temp: number) => string;
  getLocalizedWeatherDescription: (code: number) => string;
  formatWeekday: (date: string, format?: 'short' | 'long') => string;
}

const EnhancedForecast: React.FC<EnhancedForecastProps> = ({
  forecast,
  temperatureUnit,
  getLocalizedTemperature,
  getLocalizedWeatherDescription,
  formatWeekday,
}) => {
  const { t } = useTranslation(['weather', 'common']);
  const { theme } = useTheme();

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Enhanced Header - Theme-Aware and Mobile Responsive */}
      <div className="text-center space-y-2 sm:space-y-3 md:space-y-4 px-3 sm:px-2 md:px-0">
        <div
          className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 md:gap-3 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 border transition-all duration-200"
          style={{
            background: theme.isDark
              ? 'linear-gradient(to right, rgba(var(--theme-accent-rgb), 0.15), rgba(var(--theme-accent-rgb), 0.1))'
              : 'linear-gradient(to right, rgba(var(--theme-accent-rgb), 0.08), rgba(var(--theme-accent-rgb), 0.05))',
            borderColor: theme.isDark
              ? 'rgba(var(--theme-accent-rgb), 0.3)'
              : 'rgba(var(--theme-accent-rgb), 0.2)',
            boxShadow: theme.isHighContrast ? 'none' : '0 1px 2px var(--theme-shadow)',
          }}
        >
          <span className="text-base sm:text-xl md:text-2xl" role="img" aria-label="Calendar">
            📅
          </span>
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-[var(--theme-text)]">
            {t('weather:forecast.title')}
          </h2>
          <span
            className="text-[10px] sm:text-xs md:text-sm text-[var(--theme-text-secondary)] rounded-full px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 font-medium border transition-colors duration-200"
            style={{
              backgroundColor: theme.isDark ? 'var(--theme-surface)' : 'var(--theme-background)',
              borderColor: 'var(--theme-border)',
            }}
          >
            {forecast.length} {t('weather:forecast.days')}
          </span>
        </div>
        <p className="text-xs sm:text-sm md:text-base text-[var(--theme-text-secondary)] mx-auto max-w-2xl px-4 leading-relaxed">
          {t('weather:forecast.subtitle')}
        </p>
      </div>

      {/* Enhanced 7-Day Forecast Grid */}
      <EnhancedForecastGrid
        animationEnabled={true}
        cardSize="md"
        className="mb-8"
        forecast={forecast}
        formatWeekday={formatWeekday}
        getLocalizedTemperature={getLocalizedTemperature}
        getLocalizedWeatherDescription={getLocalizedWeatherDescription}
        showDetailedMetrics={true}
        temperatureUnit={temperatureUnit}
      />
    </div>
  );
};

export default EnhancedForecast;
