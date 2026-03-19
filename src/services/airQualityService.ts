/**
 * Air Quality Service
 * Fetches air quality data from Open-Meteo Air Quality API
 */

import { getLogger } from '@/utils/logger';

import type {
  AirQualityData,
  AQILevelConfig,
  AQIStandard,
  EuropeanAQILevel,
  OpenMeteoAirQualityResponse,
  Pollutant,
  USAQILevel,
} from '@/types/airQuality';
import { EUROPEAN_AQI_LEVELS, US_AQI_LEVELS } from '@/types/airQuality';

const airQualityLogger = getLogger('AirQuality:Service');

const AIR_QUALITY_API_ENDPOINT = 'https://air-quality-api.open-meteo.com/v1/air-quality';

/**
 * Get AQI level configuration based on AQI value and standard
 */
export const getAQILevelConfig = (
  aqi: number,
  standard: AQIStandard = 'european'
): AQILevelConfig => {
  const levels = standard === 'european' ? EUROPEAN_AQI_LEVELS : US_AQI_LEVELS;
  const config = levels.find(level => aqi >= level.min && aqi <= level.max);
  return config || levels[0];
};

/**
 * Get pollutant level description
 */
const getPollutantLevel = (pollutantName: string, value: number, standard: AQIStandard): string => {
  // Simplified pollutant level determination
  // In a real app, you'd use specific thresholds for each pollutant
  if (standard === 'european') {
    if (value < 20) return 'Low';
    if (value < 40) return 'Moderate';
    if (value < 60) return 'High';
    return 'Very High';
  } else {
    if (value < 50) return 'Good';
    if (value < 100) return 'Moderate';
    if (value < 150) return 'Unhealthy for Sensitive Groups';
    if (value < 200) return 'Unhealthy';
    if (value < 300) return 'Very Unhealthy';
    return 'Hazardous';
  }
};

/**
 * Transform Open-Meteo air quality data to app format
 */
const transformAirQualityData = (
  data: OpenMeteoAirQualityResponse,
  standard: AQIStandard = 'european'
): AirQualityData => {
  const current = data.current;
  if (!current) {
    throw new Error('No current air quality data available');
  }

  const aqi = standard === 'european' ? current.european_aqi || 0 : current.us_aqi || 0;
  const levelConfig = getAQILevelConfig(aqi, standard);

  // Build pollutants object
  const pollutants: AirQualityData['pollutants'] = {};

  if (current.pm10 !== undefined) {
    pollutants.pm10 = {
      name: 'PM10',
      value: current.pm10,
      unit: 'μg/m³',
      level: getPollutantLevel('pm10', current.pm10, standard),
      description: 'Particulate matter < 10μm',
    };
  }

  if (current.pm2_5 !== undefined) {
    pollutants.pm2_5 = {
      name: 'PM2.5',
      value: current.pm2_5,
      unit: 'μg/m³',
      level: getPollutantLevel('pm2_5', current.pm2_5, standard),
      description: 'Fine particulate matter < 2.5μm',
    };
  }

  if (current.carbon_monoxide !== undefined) {
    pollutants.co = {
      name: 'CO',
      value: current.carbon_monoxide,
      unit: 'μg/m³',
      level: getPollutantLevel('co', current.carbon_monoxide, standard),
      description: 'Carbon monoxide',
    };
  }

  if (current.nitrogen_dioxide !== undefined) {
    pollutants.no2 = {
      name: 'NO₂',
      value: current.nitrogen_dioxide,
      unit: 'μg/m³',
      level: getPollutantLevel('no2', current.nitrogen_dioxide, standard),
      description: 'Nitrogen dioxide',
    };
  }

  if (current.sulphur_dioxide !== undefined) {
    pollutants.so2 = {
      name: 'SO₂',
      value: current.sulphur_dioxide,
      unit: 'μg/m³',
      level: getPollutantLevel('so2', current.sulphur_dioxide, standard),
      description: 'Sulphur dioxide',
    };
  }

  if (current.ozone !== undefined) {
    pollutants.o3 = {
      name: 'O₃',
      value: current.ozone,
      unit: 'μg/m³',
      level: getPollutantLevel('o3', current.ozone, standard),
      description: 'Ozone',
    };
  }

  // Determine dominant pollutant (highest value relative to threshold)
  let dominantPollutant = 'PM2.5';
  let maxRelativeValue = 0;

  Object.entries(pollutants).forEach(([_key, pollutant]) => {
    const relativeValue = pollutant.value / 100; // Simplified calculation
    if (relativeValue > maxRelativeValue) {
      maxRelativeValue = relativeValue;
      dominantPollutant = pollutant.name;
    }
  });

  return {
    aqi,
    standard,
    level: levelConfig.level as EuropeanAQILevel | USAQILevel,
    category: levelConfig.category,
    color: levelConfig.color,
    description: levelConfig.description,
    healthAdvice: levelConfig.healthAdvice,
    pollutants,
    dominantPollutant,
    lastUpdated: current.time,
  };
};

/**
 * Fetch air quality data for a location
 */
export const fetchAirQualityData = async (
  latitude: number,
  longitude: number,
  standard: AQIStandard = 'european'
): Promise<AirQualityData> => {
  try {
    airQualityLogger.info('Fetching air quality data', { latitude, longitude, standard });

    const aqiParam = standard === 'european' ? 'european_aqi' : 'us_aqi';
    const url = `${AIR_QUALITY_API_ENDPOINT}?latitude=${latitude}&longitude=${longitude}&current=${aqiParam},pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,uv_index&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Air quality fetch failed: ${response.status}`);
    }

    const data: OpenMeteoAirQualityResponse = await response.json();

    airQualityLogger.info('Air quality data fetched successfully', {
      aqi: data.current?.[aqiParam],
    });

    return transformAirQualityData(data, standard);
  } catch (error) {
    airQualityLogger.error('Failed to fetch air quality data', { error });
    throw error;
  }
};

/**
 * Get AQI color for visualization
 */
export const getAQIColor = (aqi: number, standard: AQIStandard = 'european'): string => {
  const config = getAQILevelConfig(aqi, standard);
  return config.color;
};

/**
 * Get AQI category name
 */
export const getAQICategory = (aqi: number, standard: AQIStandard = 'european'): string => {
  const config = getAQILevelConfig(aqi, standard);
  return config.category;
};

/**
 * Format pollutant value with unit
 */
export const formatPollutantValue = (pollutant: Pollutant): string => {
  return `${pollutant.value.toFixed(1)} ${pollutant.unit}`;
};
