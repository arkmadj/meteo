import {
  getWeatherBufferKey,
  loadWeatherBuffer,
  persistWeatherBuffer,
} from '@/utils/weatherBuffer';

import { getLogger } from '@/utils/logger';

import { API_ENDPOINTS, WEATHER_QUERY_PARAMS } from '@/constants/api';
import { CityNotFoundError, GeocodingError, WeatherDataFetchError } from '@/errors/domainErrors';
import type {
  AstronomicalData,
  CurrentWeatherData,
  ForecastDay,
  HourlyForecastItem,
  OpenMeteoResponse,
  PressureHistory,
  PressureReading,
} from '@/types/weather';

import { fetchAirQualityData } from '@/services/airQualityService';
import { fetchPollenData } from '@/services/pollenService';
import { WEATHER_CODES } from '@/types/weather';
import {
  calculateDaylightDuration,
  calculateMoonIllumination,
  calculateMoonPhase,
} from '@/utils/astronomical';
const weatherServiceLogger = getLogger('Weather:Service');

// Geocoding cache to prevent duplicate API calls for the same location
// Always cache count=10 results and use them for both count=1 and count=10 requests
const geocodingCache = new Map<
  string,
  {
    results: Array<{
      latitude: number;
      longitude: number;
      timezone?: string;
      name?: string;
      country?: string;
      admin1?: string;
      id?: number;
    }>;
    timestamp: number;
  }
>();

// In-flight request cache to prevent duplicate simultaneous requests
const geocodingInFlightRequests = new Map<string, Promise<any[]>>();

const GEOCODING_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const GEOCODING_MAX_RESULTS = 10; // Always fetch maximum results to avoid duplicate calls

// Historical weather cache to prevent duplicate API calls
const historicalWeatherCache = new Map<
  string,
  {
    data: import('@/types/weather').HistoricalWeatherData;
    timestamp: number;
  }
>();

// In-flight historical weather requests to prevent duplicate simultaneous calls
const historicalInFlightRequests = new Map<
  string,
  Promise<import('@/types/weather').HistoricalWeatherData>
>();

const HISTORICAL_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours (historical data doesn't change often)

/**
 * Clear expired geocoding cache entries
 */
export const clearExpiredGeocodingCache = () => {
  const now = Date.now();
  const keysToDelete: string[] = [];

  geocodingCache.forEach((value, key) => {
    if (now - value.timestamp >= GEOCODING_CACHE_TTL) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => geocodingCache.delete(key));

  if (keysToDelete.length > 0) {
    weatherServiceLogger.info('Cleared expired geocoding cache entries', {
      count: keysToDelete.length,
    });
  }
};

/**
 * Clear all geocoding cache entries
 */
export const clearGeocodingCache = () => {
  const size = geocodingCache.size;
  geocodingCache.clear();
  weatherServiceLogger.info('Cleared all geocoding cache entries', { count: size });
};

/**
 * Clear expired historical weather cache entries
 */
export const clearExpiredHistoricalCache = () => {
  const now = Date.now();
  const keysToDelete: string[] = [];

  historicalWeatherCache.forEach((value, key) => {
    if (now - value.timestamp >= HISTORICAL_CACHE_TTL) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => historicalWeatherCache.delete(key));

  if (keysToDelete.length > 0) {
    weatherServiceLogger.info('Cleared expired historical weather cache entries', {
      count: keysToDelete.length,
    });
  }
};

/**
 * Clear all historical weather cache entries
 */
export const clearHistoricalCache = () => {
  const size = historicalWeatherCache.size;
  historicalWeatherCache.clear();
  weatherServiceLogger.info('Cleared all historical weather cache entries', { count: size });
};

/**
 * Clear all caches (geocoding + historical weather)
 */
export const clearAllCaches = () => {
  clearGeocodingCache();
  clearHistoricalCache();
  weatherServiceLogger.info('Cleared all service caches');
};

export type TemperatureUnit = 'celsius' | 'fahrenheit';

// Helper function to generate realistic wind gust data
const generateWindGust = (windSpeed: number, weatherCode: number): number => {
  // Base gust factor (gusts are typically 1.2-2.0x wind speed)
  let gustFactor = 1.2 + Math.random() * 0.8; // 1.2 to 2.0

  // Adjust gust factor based on weather conditions
  if (weatherCode >= 95) {
    // Thunderstorms
    gustFactor = 1.8 + Math.random() * 0.7; // 1.8 to 2.5
  } else if (weatherCode >= 80) {
    // Showers
    gustFactor = 1.5 + Math.random() * 0.5; // 1.5 to 2.0
  } else if (weatherCode >= 51) {
    // Rain/drizzle
    gustFactor = 1.3 + Math.random() * 0.4; // 1.3 to 1.7
  } else if (weatherCode >= 45) {
    // Fog
    gustFactor = 1.1 + Math.random() * 0.2; // 1.1 to 1.3
  }

  // For very low wind speeds, gusts are minimal
  if (windSpeed < 2) {
    gustFactor = 1.0 + Math.random() * 0.3; // 1.0 to 1.3
  }

  const gustSpeed = windSpeed * gustFactor;

  // Round to 1 decimal place and ensure gust is at least equal to wind speed
  return Math.max(windSpeed, Math.round(gustSpeed * 10) / 10);
};

// Helper function to generate realistic gust direction variation
const generateGustDirection = (
  windDirection: number,
  weatherCode: number,
  gustFactor: number
): number => {
  // Base direction variation (gusts can vary ±15-45° from sustained wind direction)
  let maxVariation = 15 + Math.random() * 30; // 15-45 degrees

  // Adjust variation based on weather conditions
  if (weatherCode >= 95) {
    // Thunderstorms - more chaotic
    maxVariation = 30 + Math.random() * 60; // 30-90 degrees
  } else if (weatherCode >= 80) {
    // Showers - moderate variation
    maxVariation = 20 + Math.random() * 40; // 20-60 degrees
  } else if (weatherCode >= 51) {
    // Rain/drizzle - slight variation
    maxVariation = 10 + Math.random() * 25; // 10-35 degrees
  } else if (weatherCode >= 45) {
    // Fog - minimal variation
    maxVariation = 5 + Math.random() * 15; // 5-20 degrees
  }

  // Higher gust factors tend to have more directional variation
  if (gustFactor > 2.0) {
    maxVariation *= 1.5; // Increase variation for strong gusts
  } else if (gustFactor < 1.3) {
    maxVariation *= 0.5; // Reduce variation for light gusts
  }

  // Generate random direction variation
  const variation = (Math.random() - 0.5) * 2 * maxVariation;
  let gustDirection = windDirection + variation;

  // Normalize to 0-360 range
  if (gustDirection < 0) gustDirection += 360;
  if (gustDirection >= 360) gustDirection -= 360;

  return Math.round(gustDirection);
};

// Helper function to generate realistic pressure history data
const generatePressureHistory = (currentPressure: number, weatherCode: number): PressureHistory => {
  const now = new Date();
  const readings: PressureReading[] = [];
  const last24Hours: PressureReading[] = [];
  const last7Days: PressureReading[] = [];

  // Generate base pressure variation based on weather conditions
  let baseVariation = 5; // ±5 hPa normal variation
  let trendDirection = 0; // -1 falling, 0 stable, 1 rising

  // Adjust variation and trend based on weather conditions
  if (weatherCode >= 95) {
    // Thunderstorms
    baseVariation = 15;
    trendDirection = -1; // Falling pressure before storms
  } else if (weatherCode >= 80) {
    // Showers
    baseVariation = 10;
    trendDirection = -0.5;
  } else if (weatherCode >= 51) {
    // Rain/drizzle
    baseVariation = 8;
    trendDirection = -0.3;
  } else if (weatherCode <= 3) {
    // Clear/partly cloudy
    baseVariation = 3;
    trendDirection = 0.3; // Slight rising trend for clear weather
  }

  // Generate 24-hour history (hourly readings)
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);

    // Create pressure variation with trend
    const trendEffect = trendDirection * (23 - i) * 0.2; // Gradual trend over time
    const randomVariation = (Math.random() - 0.5) * baseVariation;
    const pressure = currentPressure + trendEffect + randomVariation;

    // Ensure pressure stays within realistic bounds
    const clampedPressure = Math.max(950, Math.min(1080, pressure));

    const reading: PressureReading = {
      timestamp: timestamp.toISOString(),
      pressure: Math.round(clampedPressure * 10) / 10,
      trend:
        i === 0
          ? 'stable'
          : clampedPressure > (readings?.[readings.length - 1]?.pressure || clampedPressure)
            ? 'rising'
            : clampedPressure < (readings?.[readings.length - 1]?.pressure || clampedPressure)
              ? 'falling'
              : 'stable',
    };

    readings.push(reading);
    last24Hours.push(reading);
  }

  // Generate 7-day history (daily readings at noon)
  for (let i = 6; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    timestamp.setHours(12, 0, 0, 0); // Set to noon

    // Create daily pressure variation
    const dailyTrendEffect = trendDirection * (6 - i) * 1.5;
    const dailyRandomVariation = (Math.random() - 0.5) * baseVariation * 2;
    const pressure = currentPressure + dailyTrendEffect + dailyRandomVariation;

    const clampedPressure = Math.max(950, Math.min(1080, pressure));

    const reading: PressureReading = {
      timestamp: timestamp.toISOString(),
      pressure: Math.round(clampedPressure * 10) / 10,
      trend: 'stable',
    };

    last7Days.push(reading);
  }

  // Calculate overall trend and change rate
  const firstReading = last24Hours?.[0];
  const lastReading = last24Hours?.[last24Hours.length - 1];
  const pressureChange = lastReading.pressure - firstReading.pressure;
  const changeRate = pressureChange / 24; // hPa per hour

  let overallTrend: 'rising' | 'falling' | 'stable' = 'stable';
  if (Math.abs(changeRate) > 0.1) {
    overallTrend = changeRate > 0 ? 'rising' : 'falling';
  }

  return {
    current: currentPressure,
    readings,
    trend: overallTrend,
    changeRate: Math.round(changeRate * 100) / 100,
    last24Hours,
    last7Days,
  };
};

export const transformWeatherData = (
  weatherData: OpenMeteoResponse,
  location: {
    name: string;
    country: string;
    admin1?: string;
    latitude: number;
    longitude: number;
  },
  getWeatherDescription: (code: number) => string
): CurrentWeatherData => {
  const currentWeather = weatherData.current_weather;
  const dailyData = weatherData.daily;

  // Get weather description from code
  const weatherCodeInfo = WEATHER_CODES?.[currentWeather!.weathercode] || {
    description: getWeatherDescription(currentWeather!.weathercode),
    icon: 'CLEAR_DAY',
  };

  // Calculate astronomical data
  const sunrise = dailyData.sunrise?.[0] || '';
  const sunset = dailyData.sunset?.[0] || '';
  const astronomical: AstronomicalData | undefined =
    sunrise && sunset
      ? {
          sunrise,
          sunset,
          daylightDuration: calculateDaylightDuration(sunrise, sunset),
          moonPhase: calculateMoonPhase(new Date()),
          moonIllumination: calculateMoonIllumination(new Date()),
        }
      : undefined;

  // Transform the data to match our app's structure
  const transformedData: CurrentWeatherData = {
    city: location.name,
    country: location.admin1 ? `${location.admin1}, ${location.country}` : location.country,
    latitude: location.latitude,
    longitude: location.longitude,
    condition: {
      code: currentWeather!.weathercode,
      description: weatherCodeInfo.description,
      icon: weatherCodeInfo.icon,
    },
    temperature: {
      current: currentWeather!.temperature,
      feels_like: currentWeather!.temperature, // Open-Meteo does not provide feels-like temp in free tier
      humidity: dailyData.relative_humidity_2m_mean?.[0],
    },
    humidity: dailyData.relative_humidity_2m_mean?.[0],
    wind: {
      speed: currentWeather!.windspeed,
      direction: currentWeather!.winddirection,
      gust: generateWindGust(currentWeather!.windspeed, currentWeather!.weathercode),
      gustDirection: generateGustDirection(
        currentWeather!.winddirection,
        currentWeather!.weathercode,
        generateWindGust(currentWeather!.windspeed, currentWeather!.weathercode) /
          currentWeather!.windspeed
      ),
    },
    pressure: dailyData.pressure_msl_mean?.[0],
    pressureHistory: generatePressureHistory(
      dailyData.pressure_msl_mean?.[0],
      currentWeather!.weathercode
    ),
    visibility: dailyData.visibility_mean?.[0],
    uvIndex: dailyData.uv_index_max?.[0],
    astronomical,
    lastUpdated: Date.now().toString(),
    timezone: weatherData.timezone,
  };

  return transformedData;
};

export const transformForecastData = (
  weatherData: OpenMeteoResponse,
  getWeatherDescription: (code: number) => string
): ForecastDay[] => {
  const dailyData = weatherData.daily;

  return dailyData.time.map((date, index) => {
    const weatherCode = dailyData.weathercode?.[index];
    const weatherCodeInfo = WEATHER_CODES?.[weatherCode] || {
      description: getWeatherDescription(weatherCode),
      icon: 'CLEAR_DAY',
    };

    return {
      date,
      condition: {
        code: weatherCode,
        description: weatherCodeInfo.description,
        icon: weatherCodeInfo.icon,
      },
      temperature: {
        minimum: dailyData.temperature_2m_min?.[index],
        maximum: dailyData.temperature_2m_max?.[index],
      },
      humidity: dailyData.relative_humidity_2m_mean?.[index],
      wind: {
        speed: dailyData.wind_speed_10m_max?.[index],
        gust: generateWindGust(dailyData.wind_speed_10m_max?.[index], weatherCode),
        // For forecast data, we don't have direction, so we'll use a simulated direction
        gustDirection: generateGustDirection(
          180 + Math.random() * 180, // Random base direction for forecast
          weatherCode,
          generateWindGust(dailyData.wind_speed_10m_max?.[index], weatherCode) /
            dailyData.wind_speed_10m_max?.[index]
        ),
      },
      pressure: dailyData.pressure_msl_mean?.[index],
      visibility: dailyData.visibility_mean?.[index],
      uvIndex: dailyData.uv_index_max?.[index],
      precipitationProbability: dailyData.precipitation_probability_max?.[index],
      sunrise: dailyData.sunrise?.[index],
      sunset: dailyData.sunset?.[index],
    };
  });
};

/**
 * Generate hourly forecast data for the next 24-48 hours
 * Uses current weather as base and simulates realistic hourly variations
 */
export const generateHourlyForecast = (
  currentWeather: CurrentWeatherData,
  forecast: ForecastDay[],
  hoursCount: number = 24
): HourlyForecastItem[] => {
  const hours: HourlyForecastItem[] = [];
  const now = new Date();

  // Get sunrise/sunset from forecast for day/night determination
  const todayForecast = forecast[0];
  const sunriseHour = todayForecast?.sunrise ? new Date(todayForecast.sunrise).getHours() : 6;
  const sunsetHour = todayForecast?.sunset ? new Date(todayForecast.sunset).getHours() : 18;

  // Base values from current weather
  const baseTemp = currentWeather.temperature.current;
  const basePressure = currentWeather.pressure;
  const baseHumidity = currentWeather.humidity;
  const baseWindSpeed = currentWeather.wind.speed;
  const baseWindDirection = currentWeather.wind.direction;
  const baseUvIndex = currentWeather.uvIndex;
  const baseVisibility = currentWeather.visibility;
  const baseConditionCode = currentWeather.condition.code;

  for (let i = 0; i < hoursCount; i++) {
    const hourDate = new Date(now.getTime() + i * 60 * 60 * 1000);
    const hour = hourDate.getHours();
    const dayIndex = Math.floor(i / 24);
    const dayForecast = forecast[Math.min(dayIndex, forecast.length - 1)];

    // Determine if it's day or night
    const isDay = hour >= sunriseHour && hour < sunsetHour;

    // Temperature varies throughout the day (coldest at dawn, warmest in afternoon)
    const dayProgress = (hour - 6) / 18; // 0 at 6am, 1 at midnight
    const tempRange =
      (dayForecast?.temperature.maximum || baseTemp + 5) -
      (dayForecast?.temperature.minimum || baseTemp - 5);
    const tempVariation = Math.sin(dayProgress * Math.PI) * (tempRange / 2);
    const temperature = baseTemp + tempVariation + (Math.random() - 0.5) * 2;

    // Feels like temperature (wind chill effect)
    const windChillFactor = Math.max(0, (10 - baseWindSpeed) / 10);
    const feelsLike = temperature - (1 - windChillFactor) * 2 + (Math.random() - 0.5);

    // Humidity tends to be higher at night and lower during the day
    const humidityVariation = isDay ? -10 : 10;
    const humidity = Math.min(
      100,
      Math.max(20, baseHumidity + humidityVariation + (Math.random() - 0.5) * 10)
    );

    // Wind speed varies slightly
    const windSpeed = Math.max(0, baseWindSpeed + (Math.random() - 0.5) * 4);
    const windDirection = (baseWindDirection + (Math.random() - 0.5) * 30 + 360) % 360;
    const windGust = generateWindGust(windSpeed, baseConditionCode);

    // Precipitation probability based on weather condition
    let precipProbability = 0;
    if (baseConditionCode >= 51 && baseConditionCode <= 99) {
      precipProbability = 30 + Math.random() * 50;
    } else if (baseConditionCode >= 45) {
      precipProbability = 10 + Math.random() * 20;
    }
    // Add random chance
    precipProbability = Math.min(100, precipProbability + (Math.random() * 20 - 10));
    if (precipProbability < 0) precipProbability = 0;

    // Precipitation amount (if any)
    const precipAmount = precipProbability > 30 ? Math.random() * 2 : 0;

    // UV Index (0 at night, peaks at midday)
    const uvIndex = isDay
      ? baseUvIndex * Math.sin(((hour - sunriseHour) / (sunsetHour - sunriseHour)) * Math.PI)
      : 0;

    // Cloud cover based on condition
    let cloudCover = 0;
    if (baseConditionCode >= 3) cloudCover = 80 + Math.random() * 20;
    else if (baseConditionCode >= 2) cloudCover = 40 + Math.random() * 40;
    else if (baseConditionCode >= 1) cloudCover = 10 + Math.random() * 30;

    // Visibility decreases with precipitation/fog
    let visibility = baseVisibility;
    if (baseConditionCode >= 45 && baseConditionCode <= 48) {
      visibility = 500 + Math.random() * 2000; // Fog
    } else if (baseConditionCode >= 51) {
      visibility = baseVisibility * (0.5 + Math.random() * 0.4);
    }

    // Weather condition - may change slightly
    const conditionInfo = WEATHER_CODES[baseConditionCode] || {
      description: 'Clear',
      icon: isDay ? 'CLEAR_DAY' : 'CLEAR_NIGHT',
    };

    hours.push({
      time: hourDate.toISOString(),
      temperature: Math.round(temperature * 10) / 10,
      feelsLike: Math.round(feelsLike * 10) / 10,
      condition: {
        code: baseConditionCode,
        description: conditionInfo.description,
        icon: isDay ? conditionInfo.icon : conditionInfo.icon.replace('_DAY', '_NIGHT'),
      },
      humidity: Math.round(humidity),
      pressure: Math.round(basePressure + (Math.random() - 0.5) * 4),
      windSpeed: Math.round(windSpeed * 10) / 10,
      windDirection: Math.round(windDirection),
      windGust: Math.round(windGust * 10) / 10,
      precipitationProbability: Math.round(precipProbability),
      precipitationAmount: Math.round(precipAmount * 10) / 10,
      visibility: Math.round(visibility),
      uvIndex: Math.round(uvIndex * 10) / 10,
      cloudCover: Math.round(cloudCover),
      isDay,
    });
  }

  return hours;
};

/**
 * Complete weather data fetch (geocoding + weather)
 */
export const fetchCompleteWeatherData = async (
  searchQuery: string,
  days: number = 7,
  temperatureUnit: TemperatureUnit = 'celsius'
): Promise<{
  current: CurrentWeatherData;
  forecast: ForecastDay[];
}> => {
  const resolvedDays = Number.isFinite(days) && days > 0 ? Math.round(days) : 7;
  const bufferKey = {
    query: searchQuery,
    unit: temperatureUnit,
    days: resolvedDays,
  };
  const bufferKeyId = getWeatherBufferKey(bufferKey);
  const offlineMode = typeof navigator !== 'undefined' && navigator.onLine === false;

  const cachedEntry = loadWeatherBuffer({
    ...bufferKey,
    allowExpired: true,
  });

  if (offlineMode && cachedEntry) {
    weatherServiceLogger.info('Returning weather data from local buffer', {
      key: bufferKeyId,
      expired: cachedEntry.expired,
      ageMs: Date.now() - cachedEntry.timestamp,
    });
    return cachedEntry.payload;
  }

  try {
    // Use searchCities to leverage shared geocoding cache with autocomplete
    // This prevents duplicate API calls when both weather and search need geocoding
    const geocodingResults = await searchCities(searchQuery);

    if (!geocodingResults || geocodingResults.length === 0) {
      throw new CityNotFoundError('Location not found', {
        details: { query: searchQuery },
      });
    }

    const location = geocodingResults[0];

    // Then fetch weather data
    const weatherUrl = `${API_ENDPOINTS.WEATHER}?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true&daily=${WEATHER_QUERY_PARAMS.join(',')}&timezone=${location.timezone || 'auto'}&temperature_unit=${temperatureUnit}`;
    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new WeatherDataFetchError(`Weather fetch failed: ${weatherResponse.status}`, {
        details: {
          status: weatherResponse.status,
          url: weatherUrl,
        },
      });
    }

    const weatherData: OpenMeteoResponse = await weatherResponse.json();

    // Transform the data
    const current = transformWeatherData(weatherData, location, code => {
      const weatherInfo = WEATHER_CODES?.[code];
      return weatherInfo ? weatherInfo.description : 'Unknown weather condition';
    });

    const forecast = transformForecastData(weatherData, code => {
      const weatherInfo = WEATHER_CODES?.[code];
      return weatherInfo ? weatherInfo.description : 'Unknown weather condition';
    });

    // Fetch air quality data (optional, don't fail if it errors)
    try {
      const airQuality = await fetchAirQualityData(
        location.latitude,
        location.longitude,
        'european'
      );
      current.airQuality = airQuality;
      weatherServiceLogger.info('Air quality data added to weather data');
    } catch (airQualityError) {
      weatherServiceLogger.warn('Failed to fetch air quality data, continuing without it', {
        error: airQualityError,
      });
      // Continue without air quality data
    }

    // Fetch pollen data (optional, only available in Europe)
    try {
      const pollenData = await fetchPollenData(location.latitude, location.longitude);
      current.pollen = pollenData;
      if (pollenData.availableInRegion) {
        weatherServiceLogger.info('Pollen data added to weather data');
      } else {
        weatherServiceLogger.info(
          'Pollen data not available for this region (non-European location)'
        );
      }
    } catch (pollenError) {
      weatherServiceLogger.warn('Failed to fetch pollen data, continuing without it', {
        error: pollenError,
      });
      // Continue without pollen data
    }

    const payload = { current, forecast };
    persistWeatherBuffer(bufferKey, payload);

    return payload;
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown error';

    if (cachedEntry) {
      weatherServiceLogger.warn('Weather fetch failed, served from buffer', {
        key: bufferKeyId,
        reason,
        expired: cachedEntry.expired,
      });
      return cachedEntry.payload;
    }

    weatherServiceLogger.error('Error fetching weather data', {
      reason,
      key: bufferKeyId,
    });

    throw error;
  }
};

/**
 * Geocoding API function to get location data from city name
 * Delegates to searchCities for unified caching and deduplication
 */
export const fetchGeocodingData = async (cityName: string) => {
  return searchCities(cityName);
};

/**
 * Search cities function for autocomplete/location search
 */
export const searchCities = async (query: string) => {
  try {
    // Check geocoding cache first
    const cacheKey = query.toLowerCase().trim();
    const cachedGeocode = geocodingCache.get(cacheKey);
    const now = Date.now();

    if (cachedGeocode && now - cachedGeocode.timestamp < GEOCODING_CACHE_TTL) {
      // Return cached results
      weatherServiceLogger.info('Using cached city search results', {
        query,
        cacheAge: now - cachedGeocode.timestamp,
        resultsCount: cachedGeocode.results.length,
      });
      return cachedGeocode.results;
    }

    // Check if there's already an in-flight request for this query
    const inFlightRequest = geocodingInFlightRequests.get(cacheKey);
    if (inFlightRequest) {
      weatherServiceLogger.info('Reusing in-flight geocoding request', {
        query,
      });
      return inFlightRequest;
    }

    // Create new request
    const requestPromise = (async () => {
      try {
        // Make geocoding API call with count=10
        const geocodingUrl = `${API_ENDPOINTS.GEOCODING}?name=${encodeURIComponent(query)}&count=${GEOCODING_MAX_RESULTS}&language=en&format=json`;
        const response = await fetch(geocodingUrl);

        if (!response.ok) {
          throw new GeocodingError(`City search failed: ${response.status}`, {
            details: {
              status: response.status,
              url: geocodingUrl,
            },
          });
        }

        const data = await response.json();
        const results = data.results || [];

        // Cache the results
        geocodingCache.set(cacheKey, {
          results,
          timestamp: now,
        });

        weatherServiceLogger.info('Cached new city search results', {
          query,
          resultsCount: results.length,
        });

        return results;
      } finally {
        // Always remove from in-flight requests when done
        geocodingInFlightRequests.delete(cacheKey);
      }
    })();

    // Store the in-flight request
    geocodingInFlightRequests.set(cacheKey, requestPromise);

    return requestPromise;
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown error';

    weatherServiceLogger.error('Error searching cities', {
      reason,
      query,
    });

    throw error;
  }
};

// ============================================================================
// Historical Weather Data Functions
// ============================================================================

/**
 * Interface for Open-Meteo Archive API response
 */
interface OpenMeteoHistoricalResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_mean: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    relative_humidity_2m_mean: number[];
    pressure_msl_mean: number[];
    wind_speed_10m_max: number[];
    precipitation_sum: number[];
    uv_index_max?: number[];
  };
}

/**
 * Helper to format date as YYYY-MM-DD
 */
const formatDateForAPI = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Calculate date range for historical period
 */
const getHistoricalDateRange = (
  period: 'last-week' | 'last-month'
): { startDate: string; endDate: string } => {
  const now = new Date();
  const endDate = new Date(now);
  // Archive API has 5-day delay, so we go back from 6 days ago
  endDate.setDate(endDate.getDate() - 6);

  const startDate = new Date(endDate);
  if (period === 'last-week') {
    startDate.setDate(startDate.getDate() - 6); // 7 days total
  } else {
    startDate.setDate(startDate.getDate() - 29); // 30 days total
  }

  return {
    startDate: formatDateForAPI(startDate),
    endDate: formatDateForAPI(endDate),
  };
};

/**
 * Transform historical API response to app format
 */
const transformHistoricalData = (
  response: OpenMeteoHistoricalResponse,
  location: { name: string; country: string; latitude: number; longitude: number },
  period: 'last-week' | 'last-month',
  getWeatherDescription: (code: number) => string
): import('@/types/weather').HistoricalWeatherData => {
  const { daily } = response;

  const days: import('@/types/weather').HistoricalWeatherDay[] = daily.time.map((date, index) => {
    const weatherCode = daily.weather_code[index];
    const weatherCodeInfo = WEATHER_CODES[weatherCode] || {
      description: getWeatherDescription(weatherCode),
      icon: 'CLEAR_DAY',
    };

    return {
      date,
      condition: {
        code: weatherCode,
        description: weatherCodeInfo.description,
        icon: weatherCodeInfo.icon,
      },
      temperature: {
        mean: daily.temperature_2m_mean[index],
        minimum: daily.temperature_2m_min[index],
        maximum: daily.temperature_2m_max[index],
      },
      humidity: daily.relative_humidity_2m_mean[index],
      pressure: daily.pressure_msl_mean[index],
      windSpeed: daily.wind_speed_10m_max[index],
      precipitation: daily.precipitation_sum[index],
      uvIndex: daily.uv_index_max?.[index],
    };
  });

  // Calculate averages
  const validDays = days.filter(d => d.temperature.mean !== null);
  const averages = {
    temperature: {
      mean: validDays.reduce((sum, d) => sum + d.temperature.mean, 0) / validDays.length,
      minimum: validDays.reduce((sum, d) => sum + d.temperature.minimum, 0) / validDays.length,
      maximum: validDays.reduce((sum, d) => sum + d.temperature.maximum, 0) / validDays.length,
    },
    humidity: validDays.reduce((sum, d) => sum + d.humidity, 0) / validDays.length,
    pressure: validDays.reduce((sum, d) => sum + d.pressure, 0) / validDays.length,
    windSpeed: validDays.reduce((sum, d) => sum + d.windSpeed, 0) / validDays.length,
    precipitation: validDays.reduce((sum, d) => sum + d.precipitation, 0) / validDays.length,
  };

  return {
    location: {
      city: location.name,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude,
    },
    period: {
      startDate: daily.time[0],
      endDate: daily.time[daily.time.length - 1],
      label: period,
    },
    days,
    averages,
  };
};

/**
 * Fetch historical weather data for a location
 */
export const fetchHistoricalWeatherData = async (
  searchQuery: string,
  period: 'last-week' | 'last-month' = 'last-week',
  temperatureUnit: TemperatureUnit = 'celsius'
): Promise<import('@/types/weather').HistoricalWeatherData> => {
  // Create cache key from query + period + unit
  const cacheKey = `${searchQuery.toLowerCase().trim()}_${period}_${temperatureUnit}`;
  const now = Date.now();

  console.log(`[HISTORICAL] 🔵 ENTRY: ${cacheKey} at ${now}`, {
    query: searchQuery,
    period,
    temperatureUnit,
    stackTrace: new Error().stack?.split('\n').slice(2, 5).join('\n'),
  });

  weatherServiceLogger.info('Fetching historical weather data', {
    query: searchQuery,
    period,
    temperatureUnit,
  });

  // Check cache first
  const cachedData = historicalWeatherCache.get(cacheKey);
  if (cachedData && now - cachedData.timestamp < HISTORICAL_CACHE_TTL) {
    console.log(`[HISTORICAL] ✅ CACHE HIT: ${cacheKey}`);
    weatherServiceLogger.info('Using cached historical weather data', {
      query: searchQuery,
      period,
      cacheAge: now - cachedData.timestamp,
    });
    return cachedData.data;
  }

  // CRITICAL: Store a placeholder promise IMMEDIATELY to block concurrent calls
  // This prevents React StrictMode double-invocation from creating duplicate requests
  if (!historicalInFlightRequests.has(cacheKey)) {
    // Create placeholder - other calls will wait for this
    const placeholder = new Promise<import('@/types/weather').HistoricalWeatherData>(
      () => {} // Empty executor - will be replaced immediately
    );
    historicalInFlightRequests.set(cacheKey, placeholder);
    console.log(`[HISTORICAL] 🔒 LOCKED: ${cacheKey}`);
  } else {
    // Another call is already in progress
    const existingRequest = historicalInFlightRequests.get(cacheKey)!;
    console.log(`[HISTORICAL] ✅ IN-FLIGHT HIT: ${cacheKey}`);
    weatherServiceLogger.info('Reusing in-flight historical weather request', {
      query: searchQuery,
      period,
      cacheKey,
    });
    return existingRequest;
  }

  console.log(`[HISTORICAL] 🟡 CREATING new request: ${cacheKey}`);

  // Create execution function
  const executeRequest = async (): Promise<import('@/types/weather').HistoricalWeatherData> => {
    weatherServiceLogger.info('Executing historical weather request', {
      query: searchQuery,
      period,
      cacheKey,
    });

    try {
      // Use searchCities to leverage shared geocoding cache with autocomplete
      // This prevents duplicate API calls when both weather and search need geocoding
      const geocodingResults = await searchCities(searchQuery);

      if (!geocodingResults || geocodingResults.length === 0) {
        throw new CityNotFoundError('Location not found', {
          details: { query: searchQuery },
        });
      }

      const location = geocodingResults[0];
      const { startDate, endDate } = getHistoricalDateRange(period);

      // Fetch historical weather data from Archive API
      const historicalParams = [
        'weather_code',
        'temperature_2m_mean',
        'temperature_2m_max',
        'temperature_2m_min',
        'relative_humidity_2m_mean',
        'pressure_msl_mean',
        'wind_speed_10m_max',
        'precipitation_sum',
        'uv_index_max',
      ].join(',');

      const historicalUrl = `${API_ENDPOINTS.HISTORICAL}?latitude=${location.latitude}&longitude=${location.longitude}&start_date=${startDate}&end_date=${endDate}&daily=${historicalParams}&timezone=${location.timezone || 'auto'}&temperature_unit=${temperatureUnit}`;

      console.log(`[HISTORICAL] 🌐 MAKING API CALL: ${cacheKey}`, { url: historicalUrl });
      weatherServiceLogger.debug('Historical API URL', { url: historicalUrl });

      const historicalResponse = await fetch(historicalUrl);
      console.log(`[HISTORICAL] 📥 API RESPONSE: ${cacheKey}`, {
        status: historicalResponse.status,
      });

      if (!historicalResponse.ok) {
        throw new WeatherDataFetchError(
          `Historical weather fetch failed: ${historicalResponse.status}`,
          {
            details: { status: historicalResponse.status, url: historicalUrl },
          }
        );
      }

      const historicalData: OpenMeteoHistoricalResponse = await historicalResponse.json();

      // Transform the data
      const result = transformHistoricalData(
        historicalData,
        {
          name: location.name,
          country: location.admin1 ? `${location.admin1}, ${location.country}` : location.country,
          latitude: location.latitude,
          longitude: location.longitude,
        },
        period,
        code => {
          const weatherInfo = WEATHER_CODES[code];
          return weatherInfo ? weatherInfo.description : 'Unknown weather condition';
        }
      );

      // Cache the result
      historicalWeatherCache.set(cacheKey, {
        data: result,
        timestamp: now,
      });

      weatherServiceLogger.info('Historical weather data fetched and cached successfully', {
        query: searchQuery,
        period,
        daysCount: result.days.length,
      });

      return result;
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown error';
      weatherServiceLogger.error('Error fetching historical weather data', {
        reason,
        query: searchQuery,
        period,
      });
      throw error;
    } finally {
      // Always remove from in-flight requests when done
      historicalInFlightRequests.delete(cacheKey);
    }
  };

  // Execute and replace the placeholder with the real promise
  const requestPromise = executeRequest();
  historicalInFlightRequests.set(cacheKey, requestPromise);

  console.log(
    `[HISTORICAL] 🟢 REPLACED PLACEHOLDER: ${cacheKey}, Map size: ${historicalInFlightRequests.size}`
  );

  weatherServiceLogger.info('Executing historical weather request', {
    query: searchQuery,
    period,
    cacheKey,
  });

  return requestPromise;
};
