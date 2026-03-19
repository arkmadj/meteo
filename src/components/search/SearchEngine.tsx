import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import SearchInput from '@/components/ui/atoms/SearchInput';
import AutocompleteDropdown, {
  type GeocodingResult,
} from '@/components/ui/forms/AutocompleteDropdown';
import { Container } from '@/components/ui/layout';
import { useFuzzyGeocodingAutocomplete } from '@/hooks/useFuzzyGeocodingAutocomplete';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useReverseGeocodingQuery } from '@/hooks/useWeatherQuery';
import type { SearchEngineProps } from '@/types';

const SearchEngine = React.memo(
  ({ query, setQuery, search, onSearchChange, loading, placeholder }: SearchEngineProps) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [usingCurrentLocation, setUsingCurrentLocation] = useState(false);

    // Use the fuzzy geocoding autocomplete hook
    const {
      suggestions,
      loading: suggestionsLoading,
      error: suggestionsError,
      clearSuggestions,
    } = useFuzzyGeocodingAutocomplete(query, {
      debounceMs: 300,
      minQueryLength: 2,
      maxResults: 8,
      enableFuzzySearch: true,
      fuzzyThreshold: 25,
    });

    const {
      position,
      loading: geolocationLoading,
      isSupported: isGeolocationSupported,
      getCurrentPosition,
    } = useGeolocation({
      showNotifications: true,
      onError: () => {
        setUsingCurrentLocation(false);
      },
    });

    const { data: reverseGeocodingData, isLoading: reverseGeocodingLoading } =
      useReverseGeocodingQuery(position?.latitude ?? 0, position?.longitude ?? 0, {
        enabled: usingCurrentLocation && !!position,
        staleTime: 24 * 60 * 60 * 1000,
        cacheTime: 7 * 24 * 60 * 60 * 1000,
        retry: 2,
      });

    const reverseGeocodingResults = useMemo(
      () => (reverseGeocodingData ?? []) as GeocodingResult[],
      [reverseGeocodingData]
    );

    // Handle suggestion selection - defined first to avoid ReferenceError
    const handleSuggestionSelect = useCallback(
      (suggestion: GeocodingResult) => {
        const locationName =
          suggestion.admin1 && suggestion.admin1 !== suggestion.name
            ? `${suggestion.name}, ${suggestion.admin1}`
            : suggestion.name;

        setQuery(locationName);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        clearSuggestions();

        // Trigger search after a short delay to allow state to update
        setTimeout(() => {
          search();
        }, 100);
      },
      [setQuery, search, clearSuggestions]
    );

    // Memoize handleKeyPress to prevent recreation on every render
    const handleKeyPress = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
          if (selectedIndex >= 0 && suggestions?.[selectedIndex]) {
            // Select the highlighted suggestion
            handleSuggestionSelect(suggestions?.[selectedIndex]);
          } else {
            // Perform regular search
            search(e);
          }
          setShowSuggestions(false);
          setSelectedIndex(-1);
        } else if (e.key === 'Escape') {
          setShowSuggestions(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (!showSuggestions && suggestions.length > 0) {
            setShowSuggestions(true);
            setSelectedIndex(0);
          } else if (showSuggestions && suggestions.length > 0) {
            setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (showSuggestions) {
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
          }
        }
      },
      [search, selectedIndex, suggestions, showSuggestions, handleSuggestionSelect]
    );

    // Handle input focus
    const handleInputFocus = useCallback(() => {
      if (suggestions.length > 0) {
        setShowSuggestions(true);
      }
    }, [suggestions.length]);

    const handleInputBlur = useCallback(() => {
      // Delay hiding suggestions to allow for clicks on suggestions
      setTimeout(() => {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }, 150);
    }, []);

    // Handle input change
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setSelectedIndex(-1);

        if (onSearchChange) {
          onSearchChange(e);
        }
      },
      [setQuery, onSearchChange]
    );

    const handleUseCurrentLocation = useCallback(() => {
      if (!isGeolocationSupported) {
        return;
      }

      setUsingCurrentLocation(true);
      getCurrentPosition();
    }, [getCurrentPosition, isGeolocationSupported]);

    // Handle clicks outside the component
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setShowSuggestions(false);
          setSelectedIndex(-1);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Update showSuggestions based on suggestions availability
    useEffect(() => {
      if (suggestions.length > 0 && query.length >= 2) {
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }, [suggestions.length, query.length]);

    // When using current location, resolve coordinates via reverse geocoding and trigger search
    useEffect(() => {
      if (!usingCurrentLocation) {
        return;
      }

      if (!position || !reverseGeocodingResults || reverseGeocodingResults.length === 0) {
        return;
      }

      const bestMatch = reverseGeocodingResults[0];
      if (bestMatch) {
        handleSuggestionSelect(bestMatch);
        setUsingCurrentLocation(false);
      }
    }, [usingCurrentLocation, position, reverseGeocodingResults, handleSuggestionSelect]);

    return (
      <Container className="w-full px-0" size="lg">
        <div ref={containerRef} className="relative w-full">
          <SearchInput
            ref={inputRef}
            clearable={true}
            loading={loading}
            placeholder={placeholder}
            showSuggestions={showSuggestions}
            size="lg"
            suggestionsContent={
              showSuggestions && (
                <AutocompleteDropdown
                  error={suggestionsError}
                  loading={suggestionsLoading}
                  query={query}
                  selectedIndex={selectedIndex}
                  suggestions={suggestions}
                  onClose={() => {
                    setShowSuggestions(false);
                    setSelectedIndex(-1);
                  }}
                  onSelect={handleSuggestionSelect}
                />
              )
            }
            value={query}
            variant="filled"
            onBlur={handleInputBlur}
            onChange={handleInputChange}
            onClear={() => {
              setQuery('');
              setShowSuggestions(false);
              setSelectedIndex(-1);
              clearSuggestions();
            }}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyPress}
            onUseCurrentLocation={handleUseCurrentLocation}
            useCurrentLocationSupported={isGeolocationSupported}
            useCurrentLocationLoading={geolocationLoading || reverseGeocodingLoading}
            onSearch={value => {
              if (value.trim()) {
                search();
                setShowSuggestions(false);
                setSelectedIndex(-1);
              }
            }}
          />

          {/* Debug info for development */}
          {/* {process.env.NODE_ENV === 'development' && (
            <div className="text-[10px] text-gray-500 absolute bottom-0 left-4">
              {hasApiResults && <span className="mr-2">🌐 API</span>}
              {hasFuzzyResults && <span className="mr-2">🔍 Fuzzy</span>}
              {suggestions.length > 0 && <span>Total: {suggestions.length}</span>}
            </div>
          )} */}
        </div>
      </Container>
    );
  }
);

SearchEngine.displayName = 'SearchEngine';

export default SearchEngine;
