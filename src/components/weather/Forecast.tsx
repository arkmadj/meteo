import React, { useMemo, useState } from 'react';

import CurrentWeatherDetails from '@/components/weather/CurrentWeatherDetails';
import EnhancedForecast from '@/components/weather/EnhancedForecast';
// Lazy-loaded dashboard components for better performance
import { CustomizableDashboard, DashboardControls } from '@/components/lazy';
import { DashboardSuspense, HourlyForecastTimeline } from '@/components/ui';
import HistoricalWeatherComparison from '@/components/ui/weather/comparison/HistoricalWeatherComparison';
import { Stack } from '@/components/ui/layout';
import WeatherCard from '@/components/weather/WeatherCard';
import { FORECAST_DAYS_LIMIT } from '@/constants/dates';
import { generateHourlyForecast } from '@/services/weatherService';
import type { WeatherState } from '@/types';

interface ForecastProps {
  weather: WeatherState;
  formatWeekday: (_date: string, _format?: 'short' | 'long') => string;
  getLocalizedWeatherDescription: (_code: number) => string;
  getLocalizedTemperature: (_temp: number) => string;
  temperatureUnit: 'C' | 'F';
  toggleTemperatureUnit: () => void;
}

const Forecast = React.memo(
  ({
    weather,
    formatWeekday,
    getLocalizedWeatherDescription,
    getLocalizedTemperature,
    temperatureUnit,
    toggleTemperatureUnit,
  }: ForecastProps) => {
    const { data, forecast } = weather;
    const [useCustomizableDashboard, setUseCustomizableDashboard] = useState(false);

    // Generate hourly forecast data
    const hourlyForecast = useMemo(() => {
      if (data && forecast && forecast.length > 0) {
        return generateHourlyForecast(data, forecast, 24);
      }
      return [];
    }, [data, forecast]);

    return (
      <Stack alignItems="center" className="text-center relative w-full" spacing="lg">
        {/* Unified Weather Card - City, Date, and Temperature */}
        <div className="w-full">
          <WeatherCard
            getLocalizedTemperature={getLocalizedTemperature}
            getLocalizedWeatherDescription={getLocalizedWeatherDescription}
            showFeelsLike={true}
            showTime={false}
            showWeatherDescription={true}
            temperatureUnit={temperatureUnit}
            toggleTemperatureUnit={toggleTemperatureUnit}
            variant="detailed"
            weather={data}
            enableVariantToggle={true}
          />
        </div>

        {/* Dashboard Layout Toggle */}
        <div className="w-full flex justify-between items-center mb-4 px-4">
          <h3 className="text-lg font-semibold text-[var(--theme-text)]">Weather Details</h3>
          <button
            onClick={() => setUseCustomizableDashboard(!useCustomizableDashboard)}
            className="
              px-3 py-1.5 rounded-md text-sm font-medium
              bg-[var(--theme-surface)] text-[var(--theme-text)]
              border border-[var(--theme-border)]
              hover:bg-[var(--theme-background)]
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]
            "
            type="button"
          >
            {useCustomizableDashboard ? '📊 Classic View' : '🎨 Customize Layout'}
          </button>
        </div>

        {/* Detailed Current Weather Information */}
        <div className="w-full">
          {useCustomizableDashboard ? (
            <DashboardSuspense>
              <DashboardControls className="mb-6 px-4" />
              <CustomizableDashboard
                getLocalizedTemperature={getLocalizedTemperature}
                getLocalizedWeatherDescription={getLocalizedWeatherDescription}
                temperatureUnit={temperatureUnit}
                weather={data}
              />
            </DashboardSuspense>
          ) : (
            <CurrentWeatherDetails
              getLocalizedTemperature={getLocalizedTemperature}
              temperatureUnit={temperatureUnit}
              weather={data}
            />
          )}
        </div>

        {/* Historical Weather Comparison */}
        <div className="w-full px-4">
          <HistoricalWeatherComparison
            currentWeather={data}
            location={data.city}
            temperatureUnit={temperatureUnit}
            getLocalizedTemperature={getLocalizedTemperature}
          />
        </div>

        {/* Hourly Forecast Timeline */}
        {hourlyForecast.length > 0 && (
          <div className="w-full px-4">
            <HourlyForecastTimeline
              hours={hourlyForecast}
              temperatureUnit={temperatureUnit}
              getLocalizedTemperature={getLocalizedTemperature}
              getLocalizedWeatherDescription={getLocalizedWeatherDescription}
              sunrise={forecast?.[0]?.sunrise}
              sunset={forecast?.[0]?.sunset}
              hoursToShow={24}
            />
          </div>
        )}

        <div className="w-full">
          {/* Enhanced 7-Day Forecast Section */}
          {forecast && forecast.length > 0 && (
            <div className="w-full relative">
              <EnhancedForecast
                forecast={forecast.slice(0, FORECAST_DAYS_LIMIT)}
                formatWeekday={formatWeekday}
                getLocalizedTemperature={getLocalizedTemperature}
                getLocalizedWeatherDescription={getLocalizedWeatherDescription}
                temperatureUnit={temperatureUnit}
              />
            </div>
          )}
        </div>
      </Stack>
    );
  }
);

Forecast.displayName = 'Forecast';

export default Forecast;
