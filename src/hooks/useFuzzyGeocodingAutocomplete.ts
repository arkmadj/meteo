import { useState, useEffect, useCallback, useMemo } from 'react';

import type { GeocodingResult } from '@/components/ui/AutocompleteDropdown';
import {
  fuzzySearchLocations,
  getPopularCities,
  calculateLocationScore,
  type FuzzyMatch,
} from '@/utils/fuzzySearch';

import { useGeocodingQuery } from './useWeatherQuery';

interface UseFuzzyGeocodingAutocompleteOptions {
  debounceMs?: number;
  minQueryLength?: number;
  maxResults?: number;
  enableFuzzySearch?: boolean;
  fuzzyThreshold?: number;
}

interface UseFuzzyGeocodingAutocompleteReturn {
  suggestions: GeocodingResult[];
  fuzzyMatches: FuzzyMatch[];
  loading: boolean;
  error: string | null;
  clearSuggestions: () => void;
  hasApiResults: boolean;
  hasFuzzyResults: boolean;
}

export const useFuzzyGeocodingAutocomplete = (
  query: string,
  options: UseFuzzyGeocodingAutocompleteOptions = {}
): UseFuzzyGeocodingAutocompleteReturn => {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    maxResults = 8,
    enableFuzzySearch = true,
    fuzzyThreshold = 25,
  } = options;

  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [fuzzyMatches, setFuzzyMatches] = useState<FuzzyMatch[]>([]);

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

  // Get popular cities for fuzzy search fallback
  const popularCities = useMemo(() => getPopularCities(), []);

  // Process API results with scoring
  const apiResults = useMemo(() => {
    if (!geocodingData || geocodingData.length === 0) return [];

    return geocodingData.slice(0, Math.ceil(maxResults / 2)).map((result: any) => {
      const score = calculateLocationScore(debouncedQuery, result);
      return {
        id: result.id,
        name: result.name,
        latitude: result.latitude,
        longitude: result.longitude,
        country: result.country,
        admin1: result.admin1,
        isFuzzyMatch: false,
        matchScore: score,
      };
    });
  }, [geocodingData, maxResults, debouncedQuery]);

  // Process fuzzy search results
  const fuzzyResults = useMemo(() => {
    if (!enableFuzzySearch || !debouncedQuery.trim() || debouncedQuery.length < minQueryLength) {
      return [];
    }

    const fuzzyMatches = fuzzySearchLocations(debouncedQuery, popularCities, {
      maxResults: Math.floor(maxResults / 2),
      minScore: fuzzyThreshold,
      sortByRelevance: true,
    });

    return fuzzyMatches.map(
      match =>
        ({
          ...match.item,
          isFuzzyMatch: true,
          matchScore: match.score,
        }) as GeocodingResult
    );
  }, [
    debouncedQuery,
    popularCities,
    maxResults,
    fuzzyThreshold,
    enableFuzzySearch,
    minQueryLength,
  ]);

  // Combine and deduplicate results
  useEffect(() => {
    if (debouncedQuery.length < minQueryLength) {
      setSuggestions([]);
      setFuzzyMatches([]);
      return;
    }

    // Create a map to deduplicate by location name
    const resultMap = new Map<string, GeocodingResult>();

    // Add API results first (higher priority)
    apiResults.forEach((result: any) => {
      const key = `${result.name}-${result.country}`.toLowerCase();
      resultMap.set(key, result);
    });

    // Add fuzzy results if enabled
    if (enableFuzzySearch) {
      fuzzyResults.forEach(result => {
        const key = `${result.name}-${result.country}`.toLowerCase();
        if (!resultMap.has(key)) {
          resultMap.set(key, result);
        }
      });
    }

    // Sort by match score (API results get a slight boost)
    const combinedResults = Array.from(resultMap.values())
      .map(result => ({
        ...result,
        matchScore: result.isFuzzyMatch ? result.matchScore : (result.matchScore || 0) + 10,
      }))
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, maxResults);

    setSuggestions(combinedResults);

    // Store fuzzy matches for debugging/analysis
    if (enableFuzzySearch && fuzzyResults.length > 0) {
      const fuzzyMatchesData = fuzzySearchLocations(debouncedQuery, popularCities, {
        maxResults,
        minScore: fuzzyThreshold,
      });
      setFuzzyMatches(fuzzyMatchesData);
    } else {
      setFuzzyMatches([]);
    }
  }, [
    apiResults,
    fuzzyResults,
    maxResults,
    debouncedQuery,
    minQueryLength,
    enableFuzzySearch,
    popularCities,
    fuzzyThreshold,
  ]);

  // Clear suggestions when query is too short
  useEffect(() => {
    if (query.length < minQueryLength) {
      setSuggestions([]);
      setFuzzyMatches([]);
    }
  }, [query, minQueryLength]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setFuzzyMatches([]);
  }, []);

  // Handle error states
  const error = geocodingError
    ? geocodingError instanceof Error
      ? geocodingError.message
      : 'Failed to search locations'
    : null;

  return {
    suggestions,
    fuzzyMatches,
    loading: isLoading && debouncedQuery.length >= minQueryLength,
    error,
    clearSuggestions,
    hasApiResults: apiResults.length > 0,
    hasFuzzyResults: fuzzyResults.length > 0,
  };
};
