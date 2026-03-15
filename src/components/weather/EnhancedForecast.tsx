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
    <div className="w-full space-y-8">
      {/* Enhanced Header - Theme-Aware */}
      <div className="text-center space-y-4">
        <div
          className="inline-flex items-center space-x-3 rounded-full px-6 py-3 border transition-all duration-200"
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
          <span className="text-2xl" role="img" aria-label="Calendar">
            📅
          </span>
          <h2 className="text-2xl font-bold text-[var(--theme-text)]">
            {t('weather:forecast.title')}
          </h2>
          <span
            className="text-sm text-[var(--theme-text-secondary)] rounded-full px-3 py-1 font-medium border transition-colors duration-200"
            style={{
              backgroundColor: theme.isDark ? 'var(--theme-surface)' : 'var(--theme-background)',
              borderColor: 'var(--theme-border)',
            }}
          >
            {forecast.length} {t('weather:forecast.days')}
          </span>
        </div>
        <p className="text-[var(--theme-text-secondary)] mx-auto">
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
