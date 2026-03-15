/**
 * HistoricalWeatherComparison Component
 *
 * Displays historical weather data comparison with current conditions.
 * Shows last-week and last-month averages alongside current weather.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, CardBody, CardHeader } from '@/components/ui/atoms';
import AnimatedCard from '@/components/ui/weather/display/AnimatedCard';
import { useTheme } from '@/design-system/theme';
import {
  calculateTemperatureChange,
  formatHistoricalPeriodLabel,
  useHistoricalWeatherComparison,
} from '@/hooks/useHistoricalWeather';
import type { CurrentWeatherData, HistoricalPeriod } from '@/types/weather';

export interface HistoricalWeatherComparisonProps {
  /** Current weather data for the location */
  currentWeather: CurrentWeatherData;
  /** Location query string for fetching historical data */
  location: string;
  /** Temperature unit */
  temperatureUnit: 'C' | 'F';
  /** Function to format temperature values */
  getLocalizedTemperature: (temp: number) => string;
  /** Additional class name */
  className?: string;
}

/**
 * Period tab selector component
 */
const PeriodTabs: React.FC<{
  activePeriod: HistoricalPeriod;
  onPeriodChange: (period: HistoricalPeriod) => void;
}> = ({ activePeriod, onPeriodChange }) => {
  const { i18n } = useTranslation();

  const periods: HistoricalPeriod[] = ['last-week', 'last-month'];

  return (
    <div className="flex gap-2">
      {periods.map(period => (
        <Button
          key={period}
          variant={activePeriod === period ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onPeriodChange(period)}
          className={`transition-all duration-200 ${
            activePeriod === period ? 'ring-2 ring-[var(--theme-accent)] ring-opacity-50' : ''
          }`}
        >
          {formatHistoricalPeriodLabel(period, i18n.language)}
        </Button>
      ))}
    </div>
  );
};

/**
 * Comparison metric row component
 */
const ComparisonMetric: React.FC<{
  label: string;
  currentValue: string;
  historicalValue: string;
  difference?: number;
  unit?: string;
  showTrend?: boolean;
}> = ({ label, currentValue, historicalValue, difference, unit = '', showTrend = true }) => {
  const { theme } = useTheme();

  const getTrendIcon = () => {
    if (!showTrend || difference === undefined) return null;

    if (difference > 0) {
      return <span className="text-red-500">↑</span>;
    } else if (difference < 0) {
      return <span className="text-blue-500">↓</span>;
    }
    return <span className="text-gray-400">→</span>;
  };

  const getTrendColor = () => {
    if (difference === undefined) return '';
    if (difference > 0) return theme.isDark ? 'text-red-400' : 'text-red-600';
    if (difference < 0) return theme.isDark ? 'text-blue-400' : 'text-blue-600';
    return 'text-[var(--theme-text-secondary)]';
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--theme-border)] last:border-b-0">
      <span className="text-sm font-medium text-[var(--theme-text-secondary)]">{label}</span>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-xs text-[var(--theme-text-secondary)]">Now</div>
          <div className="font-semibold text-[var(--theme-text)]">{currentValue}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-[var(--theme-text-secondary)]">Avg</div>
          <div className="font-semibold text-[var(--theme-text-secondary)]">{historicalValue}</div>
        </div>
        {showTrend && difference !== undefined && (
          <div className={`text-right min-w-16 ${getTrendColor()}`}>
            <div className="text-xs">Change</div>
            <div className="font-semibold flex items-center gap-1">
              {getTrendIcon()}
              {Math.abs(difference).toFixed(1)}
              {unit}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Loading skeleton for the comparison card
 */
const ComparisonSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="flex items-center justify-between py-3">
        <div className="h-4 w-24 bg-[var(--theme-border)] rounded" />
        <div className="flex gap-4">
          <div className="h-6 w-16 bg-[var(--theme-border)] rounded" />
          <div className="h-6 w-16 bg-[var(--theme-border)] rounded" />
          <div className="h-6 w-16 bg-[var(--theme-border)] rounded" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Main HistoricalWeatherComparison component
 */
const HistoricalWeatherComparison: React.FC<HistoricalWeatherComparisonProps> = ({
  currentWeather,
  location,
  temperatureUnit,
  getLocalizedTemperature,
  className = '',
}) => {
  const { t } = useTranslation(['weather', 'common']);
  const { theme } = useTheme();
  const [activePeriod, setActivePeriod] = useState<HistoricalPeriod>('last-week');

  const { lastWeek, lastMonth, isLoading, isError } = useHistoricalWeatherComparison(location, {
    temperatureUnit: temperatureUnit === 'C' ? 'celsius' : 'fahrenheit',
    enabled: Boolean(location),
  });

  const activeData = activePeriod === 'last-week' ? lastWeek.data : lastMonth.data;
  const activeLoading = activePeriod === 'last-week' ? lastWeek.isLoading : lastMonth.isLoading;
  const activeError = activePeriod === 'last-week' ? lastWeek.isError : lastMonth.isError;

  const tempChange = activeData
    ? calculateTemperatureChange(
        currentWeather.temperature.current,
        activeData.averages.temperature.mean
      )
    : null;

  return (
    <AnimatedCard
      animationType="fadeInUp"
      className={`bg-[var(--theme-surface)] border-[var(--theme-border)] ${className}`}
      duration={600}
      variant="outlined"
    >
      <CardHeader className="border-b border-[var(--theme-border)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-label="History">
              📊
            </span>
            <div>
              <h3 className="text-lg font-bold text-[var(--theme-text)]">
                {t('weather:historical.title', 'Historical Comparison')}
              </h3>
              <p className="text-sm text-[var(--theme-text-secondary)]">
                {t('weather:historical.subtitle', 'Compare current conditions with past data')}
              </p>
            </div>
          </div>
          <PeriodTabs activePeriod={activePeriod} onPeriodChange={setActivePeriod} />
        </div>
      </CardHeader>

      <CardBody className="p-4 sm:p-6">
        {activeLoading ? (
          <ComparisonSkeleton />
        ) : activeError ? (
          <div className="text-center py-8">
            <span className="text-4xl mb-4 block">⚠️</span>
            <p className="text-[var(--theme-text-secondary)]">
              {t('weather:historical.error', 'Unable to load historical data')}
            </p>
          </div>
        ) : activeData ? (
          <div className="space-y-1">
            {/* Temperature comparison */}
            <ComparisonMetric
              label={t('weather:labels.temperature', 'Temperature')}
              currentValue={getLocalizedTemperature(currentWeather.temperature.current)}
              historicalValue={getLocalizedTemperature(activeData.averages.temperature.mean)}
              difference={tempChange?.difference}
              unit={`°${temperatureUnit}`}
            />

            {/* Humidity comparison */}
            <ComparisonMetric
              label={t('weather:labels.humidity', 'Humidity')}
              currentValue={`${Math.round(currentWeather.humidity)}%`}
              historicalValue={`${Math.round(activeData.averages.humidity)}%`}
              difference={currentWeather.humidity - activeData.averages.humidity}
              unit="%"
            />

            {/* Pressure comparison */}
            <ComparisonMetric
              label={t('weather:labels.pressure', 'Pressure')}
              currentValue={`${Math.round(currentWeather.pressure)} hPa`}
              historicalValue={`${Math.round(activeData.averages.pressure)} hPa`}
              difference={currentWeather.pressure - activeData.averages.pressure}
              unit=" hPa"
            />

            {/* Wind speed comparison */}
            <ComparisonMetric
              label={t('weather:labels.windSpeed', 'Wind Speed')}
              currentValue={`${Math.round(currentWeather.wind.speed)} km/h`}
              historicalValue={`${Math.round(activeData.averages.windSpeed)} km/h`}
              difference={currentWeather.wind.speed - activeData.averages.windSpeed}
              unit=" km/h"
            />

            {/* Precipitation */}
            <ComparisonMetric
              label={t('weather:labels.precipitation', 'Precipitation')}
              currentValue="—"
              historicalValue={`${activeData.averages.precipitation.toFixed(1)} mm/day`}
              showTrend={false}
            />

            {/* Period info */}
            <div className="mt-4 pt-4 border-t border-[var(--theme-border)]">
              <p className="text-xs text-[var(--theme-text-secondary)] text-center">
                {t('weather:historical.periodInfo', 'Data from {{startDate}} to {{endDate}}', {
                  startDate: new Date(activeData.period.startDate).toLocaleDateString(),
                  endDate: new Date(activeData.period.endDate).toLocaleDateString(),
                })}
              </p>
            </div>

            {/* Trend summary */}
            {tempChange && (
              <div
                className={`mt-4 p-4 rounded-lg text-center ${
                  theme.isDark ? 'bg-[var(--theme-background)]' : 'bg-gray-50'
                }`}
              >
                <p className="text-sm text-[var(--theme-text)]">
                  {tempChange.trend === 'warmer' && (
                    <>
                      🌡️{' '}
                      {t(
                        'weather:historical.warmerThanAvg',
                        "It's {{diff}}° warmer than the {{period}} average",
                        {
                          diff: Math.abs(tempChange.difference).toFixed(1),
                          period: formatHistoricalPeriodLabel(activePeriod).toLowerCase(),
                        }
                      )}
                    </>
                  )}
                  {tempChange.trend === 'cooler' && (
                    <>
                      ❄️{' '}
                      {t(
                        'weather:historical.coolerThanAvg',
                        "It's {{diff}}° cooler than the {{period}} average",
                        {
                          diff: Math.abs(tempChange.difference).toFixed(1),
                          period: formatHistoricalPeriodLabel(activePeriod).toLowerCase(),
                        }
                      )}
                    </>
                  )}
                  {tempChange.trend === 'similar' && (
                    <>
                      ✨{' '}
                      {t(
                        'weather:historical.similarToAvg',
                        'Temperature is similar to the {{period}} average',
                        {
                          period: formatHistoricalPeriodLabel(activePeriod).toLowerCase(),
                        }
                      )}
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="text-4xl mb-4 block">📭</span>
            <p className="text-[var(--theme-text-secondary)]">
              {t('weather:historical.noData', 'No historical data available')}
            </p>
          </div>
        )}
      </CardBody>
    </AnimatedCard>
  );
};

export default HistoricalWeatherComparison;
