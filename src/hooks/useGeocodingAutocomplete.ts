import { useState, useEffect, useCallback } from 'react';

import type { GeocodingResult } from '@/components/ui/AutocompleteDropdown';

import { useGeocodingQuery } from './useWeatherQuery';

interface UseGeocodingAutocompleteOptions {
  debounceMs?: number;
  minQueryLength?: number;
  maxResults?: number;
}

interface UseGeocodingAutocompleteReturn {
  suggestions: GeocodingResult[];
  loading: boolean;
  error: string | null;
  clearSuggestions: () => void;
}

export const useGeocodingAutocomplete = (
  query: string,
  options: UseGeocodingAutocompleteOptions = {}
): UseGeocodingAutocompleteReturn => {
  const { debounceMs = 300, minQueryLength = 2, maxResults = 8 } = options;

  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Use the geocoding query hook
  const {
    data: geocodingData,
    isLoading,
    error: geocodingError,
  } = useGeocodingQuery(debouncedQuery, {
    enabled: debouncedQuery.length >= minQueryLength,
  });

  // Transform and limit results
  useEffect(() => {
    if (geocodingData && geocodingData.length > 0) {
      const transformedSuggestions: GeocodingResult[] = geocodingData
        .slice(0, maxResults)
        .map((result: any) => ({
          id: result.id,
          name: result.name,
          latitude: result.latitude,
          longitude: result.longitude,
          country: result.country,
          admin1: result.admin1,
        }));

      setSuggestions(transformedSuggestions);
    } else if (!isLoading && debouncedQuery.length >= minQueryLength) {
      setSuggestions([]);
    }
  }, [geocodingData, isLoading, debouncedQuery, maxResults, minQueryLength]);

  // Clear suggestions when query is too short
  useEffect(() => {
    if (query.length < minQueryLength) {
      setSuggestions([]);
    }
  }, [query, minQueryLength]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  // Handle error states
  const error = geocodingError
    ? geocodingError instanceof Error
      ? geocodingError.message
      : 'Failed to search locations'
    : null;

  return {
    suggestions,
    loading: isLoading && debouncedQuery.length >= minQueryLength,
    error,
    clearSuggestions,
  };
};
