/**
 * ComparisonCityCard Component
 * Displays weather data for a selected city in the comparison view.
 */

import React from 'react';
import ReactAnimatedWeather from 'react-animated-weather';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardBody, CardHeader } from '@/components/ui/atoms';
import { useTheme } from '@/design-system/theme';
import { usePrefersReducedMotion } from '@/hooks/useMotion';
import { useCompleteWeatherQuery } from '@/hooks/useWeatherQuery';
import type { CurrentWeatherData, ForecastDay } from '@/types/weather';
import { WEATHER_CODES } from '@/types/weather';

// Helper to get weather description from code
const getWeatherDescription = (code: number | undefined): string => {
  if (code === undefined) return 'Unknown';
  return WEATHER_CODES[code]?.description || 'Unknown';
};

interface ComparisonCityCardProps {
  cityId: string;
  cityName: string;
  query: string;
  temperatureUnit: 'C' | 'F';
  getLocalizedTemperature: (temp: number) => string;
  onRemove: (id: string) => void;
  onClear: (id: string) => void;
  canRemove: boolean;
}

const ComparisonCityCard: React.FC<ComparisonCityCardProps> = ({
  cityId,
  cityName,
  query,
  temperatureUnit,
  getLocalizedTemperature,
  onRemove,
  onClear,
  canRemove,
}) => {
  const { t } = useTranslation(['weather', 'common']);
  const { theme } = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Fetch weather data for this city
  const { data, isLoading, isError, error } = useCompleteWeatherQuery(query, 7, {
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  }) as {
    data: { current: CurrentWeatherData; forecast: ForecastDay[] } | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  };

  const weather = data?.current;
  const forecast = data?.forecast;

  // Handle loading state
  if (isLoading) {
    return (
      <Card className="h-full min-h-[400px] bg-[var(--theme-surface)]" shadow="md">
        <CardBody className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--theme-primary)]" />
            <p className="text-sm text-[var(--theme-text-secondary)]">
              {t('common:loading', 'Loading...')}
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Handle error state
  if (isError || !weather) {
    return (
      <Card className="h-full min-h-[400px] bg-[var(--theme-surface)]" shadow="md">
        <CardHeader className="flex items-center justify-between">
          <span className="font-semibold text-[var(--theme-text)]">{cityName}</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="xs" onClick={() => onClear(cityId)}>
              {t('common:actions.retry', 'Retry')}
            </Button>
            {canRemove && (
              <Button variant="ghost" size="xs" onClick={() => onRemove(cityId)}>
                ✕
              </Button>
            )}
          </div>
        </CardHeader>
        <CardBody className="flex items-center justify-center">
          <div className="text-center">
            <p className="text-[var(--theme-text-secondary)]">
              {t('weather:errors.fetchFailed', 'Failed to load weather data')}
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => onClear(cityId)}>
              {t('common:actions.tryAgain', 'Try Again')}
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-[var(--theme-surface)]" shadow="md">
      {/* Header with city name and actions */}
      <CardHeader className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--theme-text)] truncate">{weather.city}</h3>
          {weather.country && (
            <p className="text-xs text-[var(--theme-text-secondary)] truncate">{weather.country}</p>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button variant="ghost" size="xs" onClick={() => onClear(cityId)} title="Change city">
            ↻
          </Button>
          {canRemove && (
            <Button variant="ghost" size="xs" onClick={() => onRemove(cityId)} title="Remove">
              ✕
            </Button>
          )}
        </div>
      </CardHeader>

      <CardBody className="space-y-4">
        {/* Current Temperature & Condition */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ReactAnimatedWeather
              animate={!prefersReducedMotion}
              color={theme.isDark ? '#9CA3AF' : '#374151'}
              icon={weather.condition?.icon || 'CLEAR_DAY'}
              size={48}
            />
            <div>
              <p className="text-3xl font-bold text-[var(--theme-text)]">
                {getLocalizedTemperature(weather.temperature.current).replace(/[°CF]/g, '')}°
                {temperatureUnit}
              </p>
              <p className="text-sm text-[var(--theme-text-secondary)] capitalize">
                {getWeatherDescription(weather.condition?.code)}
              </p>
            </div>
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Feels Like */}
          <div className="bg-[var(--theme-background)] rounded-lg p-3">
            <p className="text-xs text-[var(--theme-text-secondary)]">
              {t('weather:labels.feelsLike', 'Feels Like')}
            </p>
            <p className="text-lg font-semibold text-[var(--theme-text)]">
              {weather.temperature.feels_like != null
                ? `${getLocalizedTemperature(weather.temperature.feels_like).replace(/[°CF]/g, '')}°`
                : '-'}
            </p>
          </div>

          {/* Humidity */}
          <div className="bg-[var(--theme-background)] rounded-lg p-3">
            <p className="text-xs text-[var(--theme-text-secondary)]">
              {t('weather:labels.humidity', 'Humidity')}
            </p>
            <p className="text-lg font-semibold text-[var(--theme-text)]">
              {weather.humidity ?? '-'}%
            </p>
          </div>

          {/* Wind Speed */}
          <div className="bg-[var(--theme-background)] rounded-lg p-3">
            <p className="text-xs text-[var(--theme-text-secondary)]">
              {t('weather:labels.wind', 'Wind')}
            </p>
            <p className="text-lg font-semibold text-[var(--theme-text)]">
              {weather.wind?.speed ?? '-'} km/h
            </p>
          </div>

          {/* Pressure */}
          <div className="bg-[var(--theme-background)] rounded-lg p-3">
            <p className="text-xs text-[var(--theme-text-secondary)]">
              {t('weather:labels.pressure', 'Pressure')}
            </p>
            <p className="text-lg font-semibold text-[var(--theme-text)]">
              {weather.pressure ?? '-'} hPa
            </p>
          </div>

          {/* UV Index */}
          <div className="bg-[var(--theme-background)] rounded-lg p-3">
            <p className="text-xs text-[var(--theme-text-secondary)]">
              {t('weather:labels.uvIndex', 'UV Index')}
            </p>
            <p className="text-lg font-semibold text-[var(--theme-text)]">
              {weather.uvIndex ?? '-'}
            </p>
          </div>

          {/* Visibility */}
          <div className="bg-[var(--theme-background)] rounded-lg p-3">
            <p className="text-xs text-[var(--theme-text-secondary)]">
              {t('weather:labels.visibility', 'Visibility')}
            </p>
            <p className="text-lg font-semibold text-[var(--theme-text)]">
              {weather.visibility != null ? `${weather.visibility} km` : '-'}
            </p>
          </div>
        </div>

        {/* Mini Forecast Preview (next 3 days) */}
        {forecast && forecast.length > 0 && (
          <div className="pt-3 border-t border-[var(--theme-border)]">
            <p className="text-xs text-[var(--theme-text-secondary)] mb-2">
              {t('weather:labels.forecast', '3-Day Forecast')}
            </p>
            <div className="flex justify-between">
              {forecast.slice(0, 3).map((day, index) => (
                <div key={index} className="text-center flex-1">
                  <p className="text-xs text-[var(--theme-text-secondary)]">
                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                  </p>
                  <p className="text-sm font-semibold text-[var(--theme-text)]">
                    {getLocalizedTemperature(day.temperature.maximum).replace(/[°CF]/g, '')}°
                  </p>
                  <p className="text-xs text-[var(--theme-text-secondary)]">
                    {getLocalizedTemperature(day.temperature.minimum).replace(/[°CF]/g, '')}°
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ComparisonCityCard;
