// Open-Meteo API Types

export interface OpenMeteoCurrentWeather {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  time: string;
}

export interface OpenMeteoDailyUnits {
  time: string;
  weathercode: string;
  temperature_2m_max: string;
  temperature_2m_min: string;
  windspeed_10m_max: string;
}

export interface OpenMeteoDailyData {
  time: string[];
  weathercode: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  wind_speed_10m_max: number[];
  relative_humidity_2m_mean: number[];
  pressure_msl_mean: number[];
  visibility_mean: number[];
  uv_index_max: number[];
  precipitation_probability_max: number[];
  sunrise: string[];
  sunset: string[];
}
export interface OpenMeteoDaily {
  time: string[];
  weathercode: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  windspeed_10m_max: number[];
  apparent_temperature_max: number[];
  apparent_temperature_min: number[];
  sunrise: string[];
  sunset: string[];
  precipitation_sum: number[];
  precipitation_hours: number[];
}

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_weather?: OpenMeteoCurrentWeather;
  daily_units: OpenMeteoDailyUnits;
  daily: OpenMeteoDailyData;
}

export interface OpenMeteoGeocodingResponse {
  results: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1: string;
  }[];
}

// App-specific types (adapted from Open-Meteo data)

export interface WeatherCondition {
  code: number;
  description: string;
  icon: string;
}

export interface Temperature {
  current: number;
  humidity?: number;
  feels_like?: number;
  max?: number;
  min?: number;
}
export interface Wind {
  speed: number;
  direction: number;
  gust?: number;
  gustDirection?: number;
}

export interface PressureReading {
  timestamp: string;
  pressure: number;
  trend?: 'rising' | 'falling' | 'stable';
}

export interface PressureHistory {
  current: number;
  readings: PressureReading[];
  trend: 'rising' | 'falling' | 'stable';
  changeRate: number; // hPa per hour
  last24Hours: PressureReading[];
  last7Days: PressureReading[];
}

export type MoonPhase =
  | 'new'
  | 'waxing-crescent'
  | 'first-quarter'
  | 'waxing-gibbous'
  | 'full'
  | 'waning-gibbous'
  | 'last-quarter'
  | 'waning-crescent';

export interface AstronomicalData {
  sunrise: string;
  sunset: string;
  daylightDuration: number; // in minutes
  moonPhase: MoonPhase;
  moonIllumination: number; // 0-100 percentage
}

export interface CurrentWeatherData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  condition: WeatherCondition;
  temperature: Temperature;
  wind: Wind;
  timezone: string;
  humidity: number;
  pressure: number;
  pressureHistory?: PressureHistory;
  visibility: number;
  uvIndex: number;
  airQuality?: import('@/types/airQuality').AirQualityData;
  pollen?: import('@/types/pollen').PollenData;
  astronomical?: AstronomicalData;
  lastUpdated: string;
}
export interface ForecastDay {
  date: string;
  condition: WeatherCondition;
  temperature: {
    minimum: number;
    maximum: number;
  };
  wind: {
    speed: number;
    gust?: number;
  };
  humidity: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  precipitationProbability: number;
  sunrise?: string;
  sunset?: string;
  isToday?: boolean;
  isTomorrow?: boolean;
}

export interface ForecastWeatherData {
  daily: ForecastDay[];
  hourly?: HourlyForecastItem[];
}

// Hourly forecast data for interactive timeline
export interface HourlyForecastItem {
  time: string; // ISO timestamp
  temperature: number;
  feelsLike: number;
  condition: WeatherCondition;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGust?: number;
  precipitationProbability: number;
  precipitationAmount: number;
  visibility: number;
  uvIndex: number;
  cloudCover: number;
  isDay: boolean;
}

export interface HourlyForecastData {
  hours: HourlyForecastItem[];
  timezone: string;
  sunrise: string;
  sunset: string;
}

// Additional types for component props
export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export interface TemperatureData {
  current: number;
  minimum: number;
  maximum: number;
  feelsLike?: number;
  min?: number;
  max?: number;
}

export interface WindData {
  speed: number;
  direction: number;
  gust?: number;
  gustDirection?: number;
}

export interface WeatherResponse {
  data: CurrentWeatherData;
}

export interface ForecastResponse {
  data: ForecastWeatherData;
}

export interface WeatherState {
  loading: boolean;
  data: CurrentWeatherData;
  forecast?: ForecastDay[];
  hourly?: HourlyForecastItem[];
}

// Historical Weather Types for Open-Meteo Archive API
export interface HistoricalWeatherDay {
  date: string;
  condition: WeatherCondition;
  temperature: {
    mean: number;
    minimum: number;
    maximum: number;
  };
  humidity: number;
  pressure: number;
  windSpeed: number;
  precipitation: number;
  uvIndex?: number;
}

export interface HistoricalWeatherData {
  location: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  period: {
    startDate: string;
    endDate: string;
    label: 'last-week' | 'last-month';
  };
  days: HistoricalWeatherDay[];
  averages: {
    temperature: {
      mean: number;
      minimum: number;
      maximum: number;
    };
    humidity: number;
    pressure: number;
    windSpeed: number;
    precipitation: number;
  };
}

export interface HistoricalComparisonData {
  current: CurrentWeatherData;
  lastWeek: HistoricalWeatherData | null;
  lastMonth: HistoricalWeatherData | null;
}

export type HistoricalPeriod = 'last-week' | 'last-month';

// Weather code mapping from WMO codes to descriptions and icons
export const WEATHER_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: 'Clear sky', icon: 'CLEAR_DAY' },
  1: { description: 'Mainly clear', icon: 'PARTLY_CLOUDY_DAY' },
  2: { description: 'Partly cloudy', icon: 'PARTLY_CLOUDY_DAY' },
  3: { description: 'Overcast', icon: 'CLOUDY' },
  45: { description: 'Fog', icon: 'FOG' },
  48: { description: 'Depositing rime fog', icon: 'FOG' },
  51: { description: 'Drizzle: Light', icon: 'RAIN' },
  53: { description: 'Drizzle: Moderate', icon: 'RAIN' },
  55: { description: 'Drizzle: Dense', icon: 'RAIN' },
  56: { description: 'Freezing Drizzle: Light', icon: 'SLEET' },
  57: { description: 'Freezing Drizzle: Dense', icon: 'SLEET' },
  61: { description: 'Rain: Slight', icon: 'RAIN' },
  63: { description: 'Rain: Moderate', icon: 'RAIN' },
  65: { description: 'Rain: Heavy', icon: 'RAIN' },
  66: { description: 'Freezing Rain: Light', icon: 'SLEET' },
  67: { description: 'Freezing Rain: Heavy', icon: 'SLEET' },
  71: { description: 'Snow fall: Slight', icon: 'SNOW' },
  73: { description: 'Snow fall: Moderate', icon: 'SNOW' },
  75: { description: 'Snow fall: Heavy', icon: 'SNOW' },
  77: { description: 'Snow grains', icon: 'SNOW' },
  80: { description: 'Rain showers: Slight', icon: 'RAIN' },
  81: { description: 'Rain showers: Moderate', icon: 'RAIN' },
  82: { description: 'Rain showers: Violent', icon: 'RAIN' },
  85: { description: 'Snow showers: Slight', icon: 'SNOW' },
  86: { description: 'Snow showers: Heavy', icon: 'SNOW' },
  95: { description: 'Thunderstorm: Slight', icon: 'WIND' },
  96: { description: 'Thunderstorm: Moderate', icon: 'WIND' },
  99: { description: 'Thunderstorm: Heavy', icon: 'WIND' },
};

export const DEFAULT_WEATHER_STATE = {
  loading: true,
  data: {
    city: '',
    country: '',
    latitude: 0,
    longitude: 0,
    condition: {
      code: 0,
      description: '',
      icon: 'CLEAR_DAY',
    },
    temperature: {
      current: 0,
      feels_like: 0,
      max: 0,
      min: 0,
    },
    wind: {
      speed: 0,
      direction: 0,
      gust: 0,
    },
    timezone: '',
    humidity: 0,
    pressure: 0,
    visibility: 0,
    uvIndex: 0,
    lastUpdated: new Date().toISOString(),
  },
  forecast: [],
};
