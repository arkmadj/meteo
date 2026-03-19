/**
 * Pollen and Allergy Types
 * Based on Open-Meteo Air Quality API pollen data
 * Note: Pollen data is only available in Europe
 */

// Pollen types available from Open-Meteo
export type PollenType = 'alder' | 'birch' | 'grass' | 'mugwort' | 'olive' | 'ragweed';

// Pollen risk levels
export type PollenRiskLevel = 'none' | 'low' | 'moderate' | 'high' | 'very_high' | 'extreme';

// Individual pollen data
export interface PollenReading {
  type: PollenType;
  name: string;
  value: number; // Grains/m³
  level: PollenRiskLevel;
  color: string;
  description: string;
  icon: string;
}

// Overall pollen/allergy data
export interface PollenData {
  overallRisk: PollenRiskLevel;
  overallIndex: number; // 0-5 scale for overall risk
  category: string;
  color: string;
  description: string;
  healthAdvice: {
    general: string;
    allergySufferers: string;
    outdoor: string;
  };
  pollens: {
    alder?: PollenReading;
    birch?: PollenReading;
    grass?: PollenReading;
    mugwort?: PollenReading;
    olive?: PollenReading;
    ragweed?: PollenReading;
  };
  dominantPollen?: string;
  isPollenSeason: boolean;
  lastUpdated: string;
  availableInRegion: boolean;
}

// Pollen level configuration
export interface PollenLevelConfig {
  min: number;
  max: number;
  level: PollenRiskLevel;
  category: string;
  color: string;
  textColor: string;
  bgColor: string;
  description: string;
  healthAdvice: {
    general: string;
    allergySufferers: string;
    outdoor: string;
  };
}

// Pollen thresholds for different pollen types (in Grains/m³)
// These are approximate thresholds based on common allergy guidelines
export const POLLEN_THRESHOLDS: Record<
  PollenType,
  { low: number; moderate: number; high: number; veryHigh: number }
> = {
  alder: { low: 10, moderate: 50, high: 100, veryHigh: 200 },
  birch: { low: 10, moderate: 50, high: 100, veryHigh: 200 },
  grass: { low: 20, moderate: 50, high: 100, veryHigh: 200 },
  mugwort: { low: 10, moderate: 30, high: 50, veryHigh: 100 },
  olive: { low: 50, moderate: 200, high: 400, veryHigh: 800 },
  ragweed: { low: 10, moderate: 50, high: 100, veryHigh: 200 },
};

// Pollen level configurations
export const POLLEN_LEVELS: PollenLevelConfig[] = [
  {
    min: 0,
    max: 0,
    level: 'none',
    category: 'None',
    color: '#9CA3AF',
    textColor: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-900/30',
    description: 'No pollen detected',
    healthAdvice: {
      general: 'No pollen in the air. Enjoy outdoor activities freely.',
      allergySufferers: 'Safe conditions for allergy sufferers.',
      outdoor: 'Perfect conditions for all outdoor activities.',
    },
  },
  {
    min: 1,
    max: 1,
    level: 'low',
    category: 'Low',
    color: '#22C55E',
    textColor: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/30',
    description: 'Low pollen levels',
    healthAdvice: {
      general: 'Minimal pollen. Most people will not be affected.',
      allergySufferers: 'Most allergy sufferers should be comfortable.',
      outdoor: 'Good conditions for outdoor activities.',
    },
  },
  {
    min: 2,
    max: 2,
    level: 'moderate',
    category: 'Moderate',
    color: '#EAB308',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
    description: 'Moderate pollen levels',
    healthAdvice: {
      general: 'Some sensitive individuals may experience symptoms.',
      allergySufferers: 'Take allergy medication if needed. Keep windows closed.',
      outdoor: 'Consider limiting prolonged outdoor exposure if sensitive.',
    },
  },
  {
    min: 3,
    max: 3,
    level: 'high',
    category: 'High',
    color: '#F97316',
    textColor: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/30',
    description: 'High pollen levels',
    healthAdvice: {
      general: 'Many allergy sufferers will experience symptoms.',
      allergySufferers: 'Take preventive medication. Limit outdoor time during peak hours.',
      outdoor: 'Reduce outdoor activities, especially during midday.',
    },
  },
  {
    min: 4,
    max: 4,
    level: 'very_high',
    category: 'Very High',
    color: '#EF4444',
    textColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/30',
    description: 'Very high pollen levels',
    healthAdvice: {
      general: 'Most allergy sufferers will be significantly affected.',
      allergySufferers: 'Stay indoors when possible. Use air purifiers.',
      outdoor: 'Avoid outdoor activities. If necessary, wear a mask.',
    },
  },
  {
    min: 5,
    max: 5,
    level: 'extreme',
    category: 'Extreme',
    color: '#7C3AED',
    textColor: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/30',
    description: 'Extreme pollen levels',
    healthAdvice: {
      general: 'Everyone may experience symptoms. Severe for allergy sufferers.',
      allergySufferers: 'Stay indoors. Seek medical advice if symptoms worsen.',
      outdoor: 'Avoid all outdoor activities if possible.',
    },
  },
];

// Pollen type display names and icons
export const POLLEN_INFO: Record<PollenType, { name: string; icon: string; season: string }> = {
  alder: { name: 'Alder', icon: '🌳', season: 'Late Winter - Early Spring' },
  birch: { name: 'Birch', icon: '🌲', season: 'Spring' },
  grass: { name: 'Grass', icon: '🌾', season: 'Late Spring - Summer' },
  mugwort: { name: 'Mugwort', icon: '🌿', season: 'Late Summer - Autumn' },
  olive: { name: 'Olive', icon: '🫒', season: 'Late Spring - Early Summer' },
  ragweed: { name: 'Ragweed', icon: '🍂', season: 'Late Summer - Autumn' },
};
