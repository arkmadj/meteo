/**
 * Air Quality Index (AQI) Types
 * Based on Open-Meteo Air Quality API
 */

// AQI Standards
export type AQIStandard = 'european' | 'us';

// European AQI Levels (0-100+)
export type EuropeanAQILevel =
  | 'good'
  | 'fair'
  | 'moderate'
  | 'poor'
  | 'very_poor'
  | 'extremely_poor';

// US AQI Levels (0-500)
export type USAQILevel =
  | 'good'
  | 'moderate'
  | 'unhealthy_sensitive'
  | 'unhealthy'
  | 'very_unhealthy'
  | 'hazardous';

// Open-Meteo Air Quality Response
export interface OpenMeteoAirQualityResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current?: {
    time: string;
    european_aqi?: number;
    us_aqi?: number;
    pm10?: number;
    pm2_5?: number;
    carbon_monoxide?: number;
    nitrogen_dioxide?: number;
    sulphur_dioxide?: number;
    ozone?: number;
    dust?: number;
    uv_index?: number;
  };
  hourly?: {
    time: string[];
    european_aqi?: number[];
    us_aqi?: number[];
    pm10?: number[];
    pm2_5?: number[];
    carbon_monoxide?: number[];
    nitrogen_dioxide?: number[];
    sulphur_dioxide?: number[];
    ozone?: number[];
  };
  hourly_units?: {
    european_aqi?: string;
    us_aqi?: string;
    pm10?: string;
    pm2_5?: string;
    carbon_monoxide?: string;
    nitrogen_dioxide?: string;
    sulphur_dioxide?: string;
    ozone?: string;
  };
}

// Pollutant data
export interface Pollutant {
  name: string;
  value: number;
  unit: string;
  level: string;
  description: string;
}

// AQI Data structure for the app
export interface AirQualityData {
  aqi: number;
  standard: AQIStandard;
  level: EuropeanAQILevel | USAQILevel;
  category: string;
  color: string;
  description: string;
  healthAdvice: {
    general: string;
    sensitive: string;
    outdoor: string;
  };
  pollutants: {
    pm10?: Pollutant;
    pm2_5?: Pollutant;
    co?: Pollutant;
    no2?: Pollutant;
    so2?: Pollutant;
    o3?: Pollutant;
  };
  dominantPollutant?: string;
  lastUpdated: string;
}

// AQI Level Configuration
export interface AQILevelConfig {
  min: number;
  max: number;
  level: EuropeanAQILevel | USAQILevel;
  category: string;
  color: string;
  textColor: string;
  bgColor: string;
  description: string;
  healthAdvice: {
    general: string;
    sensitive: string;
    outdoor: string;
  };
}

// European AQI Levels Configuration
export const EUROPEAN_AQI_LEVELS: AQILevelConfig[] = [
  {
    min: 0,
    max: 20,
    level: 'good',
    category: 'Good',
    color: '#50C878',
    textColor: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    description: 'Air quality is excellent',
    healthAdvice: {
      general: 'Air quality is excellent. Enjoy outdoor activities!',
      sensitive: 'No health concerns for sensitive groups.',
      outdoor: 'Perfect conditions for outdoor activities.',
    },
  },
  {
    min: 20,
    max: 40,
    level: 'fair',
    category: 'Fair',
    color: '#B7D968',
    textColor: 'text-lime-700 dark:text-lime-400',
    bgColor: 'bg-lime-50 dark:bg-lime-950/30',
    description: 'Air quality is acceptable',
    healthAdvice: {
      general: 'Air quality is acceptable for most people.',
      sensitive: 'Unusually sensitive individuals may experience minor symptoms.',
      outdoor: 'Outdoor activities are generally safe.',
    },
  },
  {
    min: 40,
    max: 60,
    level: 'moderate',
    category: 'Moderate',
    color: '#FFD700',
    textColor: 'text-yellow-700 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    description: 'Air quality is moderate',
    healthAdvice: {
      general: 'Air quality is acceptable, but some pollutants may be a concern.',
      sensitive:
        'Sensitive groups (children, elderly, respiratory conditions) should consider limiting prolonged outdoor exertion.',
      outdoor: 'Reduce prolonged or heavy outdoor exertion if you are sensitive.',
    },
  },
  {
    min: 60,
    max: 80,
    level: 'poor',
    category: 'Poor',
    color: '#FF8C00',
    textColor: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    description: 'Air quality is poor',
    healthAdvice: {
      general: 'Everyone may begin to experience health effects.',
      sensitive: 'Sensitive groups should avoid prolonged outdoor exertion.',
      outdoor: 'Consider reducing outdoor activities, especially if you feel symptoms.',
    },
  },
  {
    min: 80,
    max: 100,
    level: 'very_poor',
    category: 'Very Poor',
    color: '#FF4500',
    textColor: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    description: 'Air quality is very poor',
    healthAdvice: {
      general: 'Health alert: everyone may experience more serious health effects.',
      sensitive: 'Sensitive groups should avoid all outdoor activities.',
      outdoor: 'Avoid outdoor activities. Stay indoors with windows closed.',
    },
  },
  {
    min: 100,
    max: Infinity,
    level: 'extremely_poor',
    category: 'Extremely Poor',
    color: '#8B0000',
    textColor: 'text-purple-700 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    description: 'Air quality is extremely poor',
    healthAdvice: {
      general: 'Health warning: everyone should avoid all outdoor activities.',
      sensitive: 'Sensitive groups should remain indoors and keep activity levels low.',
      outdoor: 'Avoid all outdoor activities. Emergency conditions.',
    },
  },
];

// US AQI Levels Configuration
export const US_AQI_LEVELS: AQILevelConfig[] = [
  {
    min: 0,
    max: 50,
    level: 'good',
    category: 'Good',
    color: '#00E400',
    textColor: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    description: 'Air quality is satisfactory',
    healthAdvice: {
      general: 'Air quality is satisfactory, and air pollution poses little or no risk.',
      sensitive: 'No health concerns.',
      outdoor: 'Ideal conditions for outdoor activities.',
    },
  },
  {
    min: 51,
    max: 100,
    level: 'moderate',
    category: 'Moderate',
    color: '#FFFF00',
    textColor: 'text-yellow-700 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    description: 'Air quality is acceptable',
    healthAdvice: {
      general: 'Air quality is acceptable for most people.',
      sensitive:
        'Unusually sensitive people should consider reducing prolonged or heavy outdoor exertion.',
      outdoor: 'Generally safe for outdoor activities.',
    },
  },
  {
    min: 101,
    max: 150,
    level: 'unhealthy_sensitive',
    category: 'Unhealthy for Sensitive Groups',
    color: '#FF7E00',
    textColor: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    description: 'Sensitive groups may experience health effects',
    healthAdvice: {
      general: 'General public is not likely to be affected.',
      sensitive:
        'People with respiratory or heart conditions, children, and older adults should limit prolonged outdoor exertion.',
      outdoor: 'Sensitive groups should reduce prolonged outdoor activities.',
    },
  },
  {
    min: 151,
    max: 200,
    level: 'unhealthy',
    category: 'Unhealthy',
    color: '#FF0000',
    textColor: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    description: 'Everyone may experience health effects',
    healthAdvice: {
      general: 'Everyone may begin to experience health effects.',
      sensitive: 'Sensitive groups should avoid prolonged outdoor exertion.',
      outdoor: 'Everyone should reduce prolonged or heavy outdoor exertion.',
    },
  },
  {
    min: 201,
    max: 300,
    level: 'very_unhealthy',
    category: 'Very Unhealthy',
    color: '#8F3F97',
    textColor: 'text-purple-700 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    description: 'Health alert: serious effects for everyone',
    healthAdvice: {
      general: 'Health alert: everyone may experience more serious health effects.',
      sensitive: 'Sensitive groups should avoid all outdoor activities.',
      outdoor: 'Everyone should avoid prolonged outdoor exertion.',
    },
  },
  {
    min: 301,
    max: 500,
    level: 'hazardous',
    category: 'Hazardous',
    color: '#7E0023',
    textColor: 'text-red-900 dark:text-red-300',
    bgColor: 'bg-red-100 dark:bg-red-950/50',
    description: 'Health warning: emergency conditions',
    healthAdvice: {
      general: 'Health warning: everyone should avoid all outdoor activities.',
      sensitive: 'Everyone should remain indoors and keep activity levels low.',
      outdoor: 'Avoid all outdoor activities. Emergency conditions.',
    },
  },
];
