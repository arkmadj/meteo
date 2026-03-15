/**
 * Pollen Service
 * Fetches pollen and allergy data from Open-Meteo Air Quality API
 * Note: Pollen data is only available in Europe
 */

import { getLogger } from '@/utils/logger';

import type {
  PollenData,
  PollenLevelConfig,
  PollenReading,
  PollenRiskLevel,
  PollenType,
} from '@/types/pollen';
import { POLLEN_INFO, POLLEN_LEVELS, POLLEN_THRESHOLDS } from '@/types/pollen';

const pollenLogger = getLogger('Pollen:Service');

const POLLEN_API_ENDPOINT = 'https://air-quality-api.open-meteo.com/v1/air-quality';

// Europe bounding box (approximate)
const EUROPE_BOUNDS = {
  minLat: 35,
  maxLat: 72,
  minLon: -25,
  maxLon: 45,
};

/**
 * Check if coordinates are within Europe (where pollen data is available)
 */
export const isInEurope = (latitude: number, longitude: number): boolean => {
  return (
    latitude >= EUROPE_BOUNDS.minLat &&
    latitude <= EUROPE_BOUNDS.maxLat &&
    longitude >= EUROPE_BOUNDS.minLon &&
    longitude <= EUROPE_BOUNDS.maxLon
  );
};

/**
 * Get pollen risk level based on value and pollen type
 */
export const getPollenRiskLevel = (value: number, pollenType: PollenType): PollenRiskLevel => {
  if (value === 0) return 'none';

  const thresholds = POLLEN_THRESHOLDS[pollenType];
  if (value < thresholds.low) return 'low';
  if (value < thresholds.moderate) return 'moderate';
  if (value < thresholds.high) return 'high';
  if (value < thresholds.veryHigh) return 'very_high';
  return 'extreme';
};

/**
 * Convert risk level to numeric index (0-5)
 */
const riskLevelToIndex = (level: PollenRiskLevel): number => {
  const indexMap: Record<PollenRiskLevel, number> = {
    none: 0,
    low: 1,
    moderate: 2,
    high: 3,
    very_high: 4,
    extreme: 5,
  };
  return indexMap[level];
};

/**
 * Get pollen level configuration
 */
export const getPollenLevelConfig = (index: number): PollenLevelConfig => {
  const config = POLLEN_LEVELS.find(level => index >= level.min && index <= level.max);
  return config || POLLEN_LEVELS[0];
};

/**
 * Create a pollen reading from API data
 */
const createPollenReading = (
  type: PollenType,
  value: number | undefined
): PollenReading | undefined => {
  if (value === undefined || value === null) return undefined;

  const info = POLLEN_INFO[type];
  const level = getPollenRiskLevel(value, type);
  const levelIndex = riskLevelToIndex(level);
  const config = getPollenLevelConfig(levelIndex);

  return {
    type,
    name: info.name,
    value,
    level,
    color: config.color,
    description: config.description,
    icon: info.icon,
  };
};

/**
 * Calculate overall pollen risk from individual readings
 */
const calculateOverallRisk = (
  pollens: PollenData['pollens']
): { level: PollenRiskLevel; index: number } => {
  const readings = Object.values(pollens).filter(Boolean) as PollenReading[];

  if (readings.length === 0) {
    return { level: 'none', index: 0 };
  }

  // Find the highest risk level among all pollens
  let maxIndex = 0;
  readings.forEach(reading => {
    const index = riskLevelToIndex(reading.level);
    if (index > maxIndex) {
      maxIndex = index;
    }
  });

  const levelMap: PollenRiskLevel[] = ['none', 'low', 'moderate', 'high', 'very_high', 'extreme'];
  return { level: levelMap[maxIndex], index: maxIndex };
};

/**
 * Find the dominant pollen type
 */
const findDominantPollen = (pollens: PollenData['pollens']): string | undefined => {
  const readings = Object.values(pollens).filter(Boolean) as PollenReading[];

  if (readings.length === 0) return undefined;

  let dominant = readings[0];
  readings.forEach(reading => {
    if (reading.value > dominant.value) {
      dominant = reading;
    }
  });

  return dominant.name;
};

/**
 * Check if it's pollen season (any pollen detected)
 */
const checkPollenSeason = (pollens: PollenData['pollens']): boolean => {
  return Object.values(pollens).some(pollen => pollen && pollen.value > 0);
};

// Open-Meteo API response type for pollen data
interface OpenMeteoPollenResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current?: {
    time: string;
    alder_pollen?: number;
    birch_pollen?: number;
    grass_pollen?: number;
    mugwort_pollen?: number;
    olive_pollen?: number;
    ragweed_pollen?: number;
  };
}

/**
 * Transform Open-Meteo pollen data to app format
 */
const transformPollenData = (
  data: OpenMeteoPollenResponse,
  availableInRegion: boolean
): PollenData => {
  const current = data.current;

  if (!current || !availableInRegion) {
    // Return empty pollen data for regions outside Europe
    const config = getPollenLevelConfig(0);
    return {
      overallRisk: 'none',
      overallIndex: 0,
      category: availableInRegion ? config.category : 'Not Available',
      color: config.color,
      description: availableInRegion
        ? config.description
        : 'Pollen data is only available in Europe',
      healthAdvice: config.healthAdvice,
      pollens: {},
      isPollenSeason: false,
      lastUpdated: current?.time || new Date().toISOString(),
      availableInRegion,
    };
  }

  // Build pollens object
  const pollens: PollenData['pollens'] = {};

  const pollenMappings: Array<{
    key: keyof PollenData['pollens'];
    apiKey: keyof typeof current;
    type: PollenType;
  }> = [
    { key: 'alder', apiKey: 'alder_pollen', type: 'alder' },
    { key: 'birch', apiKey: 'birch_pollen', type: 'birch' },
    { key: 'grass', apiKey: 'grass_pollen', type: 'grass' },
    { key: 'mugwort', apiKey: 'mugwort_pollen', type: 'mugwort' },
    { key: 'olive', apiKey: 'olive_pollen', type: 'olive' },
    { key: 'ragweed', apiKey: 'ragweed_pollen', type: 'ragweed' },
  ];

  pollenMappings.forEach(({ key, apiKey, type }) => {
    const value = current[apiKey] as number | undefined;
    const reading = createPollenReading(type, value);
    if (reading) {
      pollens[key] = reading;
    }
  });

  const { level: overallRisk, index: overallIndex } = calculateOverallRisk(pollens);
  const config = getPollenLevelConfig(overallIndex);
  const dominantPollen = findDominantPollen(pollens);
  const isPollenSeason = checkPollenSeason(pollens);

  return {
    overallRisk,
    overallIndex,
    category: config.category,
    color: config.color,
    description: config.description,
    healthAdvice: config.healthAdvice,
    pollens,
    dominantPollen,
    isPollenSeason,
    lastUpdated: current.time,
    availableInRegion,
  };
};

/**
 * Fetch pollen data for a location
 */
export const fetchPollenData = async (latitude: number, longitude: number): Promise<PollenData> => {
  const availableInRegion = isInEurope(latitude, longitude);

  try {
    pollenLogger.info('Fetching pollen data', { latitude, longitude, availableInRegion });

    if (!availableInRegion) {
      pollenLogger.info('Location outside Europe - pollen data not available');
      return transformPollenData({ latitude, longitude } as OpenMeteoPollenResponse, false);
    }

    const url = `${POLLEN_API_ENDPOINT}?latitude=${latitude}&longitude=${longitude}&current=alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Pollen data fetch failed: ${response.status}`);
    }

    const data: OpenMeteoPollenResponse = await response.json();

    pollenLogger.info('Pollen data fetched successfully', {
      hasData: !!data.current,
    });

    return transformPollenData(data, availableInRegion);
  } catch (error) {
    pollenLogger.error('Failed to fetch pollen data', { error });
    // Return empty data on error instead of throwing
    return transformPollenData(
      { latitude, longitude } as OpenMeteoPollenResponse,
      availableInRegion
    );
  }
};

/**
 * Get pollen color for visualization
 */
export const getPollenColor = (index: number): string => {
  const config = getPollenLevelConfig(index);
  return config.color;
};

/**
 * Get pollen category name
 */
export const getPollenCategory = (index: number): string => {
  const config = getPollenLevelConfig(index);
  return config.category;
};
