/**
 * Custom hook for managing weather-related state
 * Handles weather data, loading states, and error states
 */

import { useState } from 'react';

import { DEFAULT_VALUES } from '@/constants/api';
import type { WeatherState } from '@/types';
import { DEFAULT_WEATHER_STATE } from '@/types';

export interface WeatherStateHook {
  // State
  query: string;
  searchQuery: string;
  isCelsius: boolean;
  weather: WeatherState;
  loading: boolean;
  error: string | null;
  offline: boolean;

  // State setters
  setQuery: (query: string) => void;
  setSearchQuery: (query: string) => void;
  setIsCelsius: (isCelsius: boolean) => void;
  setWeather: (weather: WeatherState) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setOffline: (offline: boolean) => void;

  // Computed values
  temperatureUnit: 'C' | 'F';
  hasWeatherData: boolean;
  hasError: boolean;
}

export const useWeatherState = (): WeatherStateHook => {
  // State management
  const [query, setQuery] = useState<string>(DEFAULT_VALUES.CITY);
  const [searchQuery, setSearchQuery] = useState<string>(DEFAULT_VALUES.CITY);
  const [isCelsius, setIsCelsius] = useState<boolean>(true);
  const [weather, setWeather] = useState<WeatherState>(DEFAULT_WEATHER_STATE);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState<boolean>(false);

  // Computed values
  const temperatureUnit = isCelsius ? 'C' : 'F';
  const hasWeatherData = Boolean(weather?.data) && !loading && !error;
  const hasError = error !== null;

  return {
    // State
    query,
    searchQuery,
    isCelsius,
    weather,
    loading,
    error,
    offline,

    // State setters
    setQuery,
    setSearchQuery,
    setIsCelsius,
    setWeather,
    setLoading,
    setError,
    setOffline,

    // Computed values
    temperatureUnit,
    hasWeatherData,
    hasError,
  };
};
