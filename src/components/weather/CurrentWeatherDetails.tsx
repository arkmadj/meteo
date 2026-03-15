import React from 'react';
import { useTranslation } from 'react-i18next';

import WeatherDetailsGrid from '@/components/ui/weather/display/WeatherDetailsGrid';
import AQIDetailCard from '@/components/ui/weather/metrics/air-quality/AQIDetailCard';
import CoordinatesDetailCard from '@/components/ui/weather/metrics/coordinates/CoordinatesDetailCard';
import HumidityDetailCard from '@/components/ui/weather/metrics/humidity/HumidityDetailCard';
import PollenDetailCard from '@/components/ui/weather/metrics/pollen/PollenDetailCard';
import PressureDetailCard from '@/components/ui/weather/metrics/pressure/PressureDetailCard';
import SunMoonDetailCard from '@/components/ui/weather/metrics/sun-moon/SunMoonDetailCard';
import TemperatureDetailCard from '@/components/ui/weather/metrics/temperature/TemperatureDetailCard';
import UVIndexDetailCard from '@/components/ui/weather/metrics/uv-index/UVIndexDetailCard';
import VisibilityDetailCard from '@/components/ui/weather/metrics/visibility/VisibilityDetailCard';
import WindDetailCard from '@/components/ui/weather/metrics/wind/WindDetailCard';
import { useStaggeredAnimation } from '@/hooks/useStaggeredAnimation';
import type { CurrentWeatherData } from '@/types/weather';

interface CurrentWeatherDetailsProps {
  weather: CurrentWeatherData;
  temperatureUnit: 'C' | 'F';
  getLocalizedTemperature: (temp: number) => string;
}

const CurrentWeatherDetails: React.FC<CurrentWeatherDetailsProps> = ({
  weather,
  temperatureUnit,
  getLocalizedTemperature,
}) => {
  const { t } = useTranslation(['weather', 'common']);

  // Calculate total number of cards (7 base + conditional cards)
  const hasAirQuality = !!weather.airQuality;
  const hasPollen = !!weather.pollen;
  const hasAstronomical = !!weather.astronomical;
  const totalCards = 7 + (hasAstronomical ? 1 : 0) + (hasAirQuality ? 1 : 0) + (hasPollen ? 1 : 0);

  // Initialize staggered animations
  const { getDelay, getAnimationType } = useStaggeredAnimation({
    itemCount: totalCards,
    baseDelay: 200,
    staggerDelay: 100,
    enabled: true,
  });

  return (
    <div className="w-full mx-auto">
      {/* Enhanced Weather Details - Reusable Components */}
      <WeatherDetailsGrid title={t('weather:labels.weatherDetails', 'Weather Details')}>
        <TemperatureDetailCard
          animationDelay={getDelay(0)}
          animationDuration={600}
          animationType={getAnimationType(0)}
          getLocalizedTemperature={getLocalizedTemperature}
          temperature={{
            current: weather.temperature.current,
            minimum: weather.temperature.min || weather.temperature.current - 5,
            maximum: weather.temperature.max || weather.temperature.current + 5,
            feelsLike: weather.temperature.feels_like,
          }}
          temperatureUnit={temperatureUnit}
        />

        <HumidityDetailCard
          animationDelay={getDelay(1)}
          animationDuration={600}
          animationType={getAnimationType(1)}
          humidity={weather.humidity}
        />
        <WindDetailCard
          animationDelay={getDelay(2)}
          animationDuration={600}
          animationType={getAnimationType(2)}
          wind={weather.wind}
        />

        <PressureDetailCard
          animationDelay={getDelay(3)}
          animationDuration={600}
          animationType={getAnimationType(3)}
          pressure={weather.pressure}
          pressureHistory={weather.pressureHistory}
        />
        <UVIndexDetailCard
          animationDelay={getDelay(4)}
          animationDuration={600}
          animationType={getAnimationType(4)}
          uvIndex={weather.uvIndex}
        />

        <VisibilityDetailCard
          animationDelay={getDelay(5)}
          animationDuration={600}
          animationType={getAnimationType(5)}
          visibility={weather.visibility}
        />

        <CoordinatesDetailCard
          animationDelay={getDelay(6)}
          animationDuration={600}
          animationType={getAnimationType(6)}
          latitude={weather.latitude}
          location={{
            latitude: weather.latitude,
            longitude: weather.longitude,
            city: weather.city,
            country: weather.country,
          }}
          longitude={weather.longitude}
        />

        {/* Sun & Moon Card - Only show if astronomical data is available */}
        {weather.astronomical && (
          <SunMoonDetailCard
            astronomical={weather.astronomical}
            animationDelay={getDelay(7)}
            animationDuration={600}
            animationType={getAnimationType(7)}
          />
        )}

        {/* Air Quality Index Card - Only show if data is available */}
        {weather.airQuality && (
          <AQIDetailCard
            airQuality={weather.airQuality}
            animationDelay={getDelay(hasAstronomical ? 8 : 7)}
            animationDuration={600}
            animationType={getAnimationType(hasAstronomical ? 8 : 7)}
          />
        )}

        {/* Pollen & Allergy Card - Only show if data is available */}
        {weather.pollen && (
          <PollenDetailCard
            pollenData={weather.pollen}
            animationDelay={getDelay((hasAstronomical ? 1 : 0) + (hasAirQuality ? 1 : 0) + 7)}
            animationDuration={600}
            animationType={getAnimationType(
              (hasAstronomical ? 1 : 0) + (hasAirQuality ? 1 : 0) + 7
            )}
          />
        )}
      </WeatherDetailsGrid>
    </div>
  );
};

export default CurrentWeatherDetails;
