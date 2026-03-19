/**
 * Location Search Map Component
 * Combines BaseWeatherMap with location search functionality
 */

import L from 'leaflet';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';

import BaseWeatherMap from '@/components/maps/BaseWeatherMap';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { useTheme } from '@/design-system/theme';
import { useMapResponsive } from '@/hooks/useMapResponsive';
import { fuzzySearchLocations } from '@/utils/fuzzySearch';

interface MapLocation {
  lat: number;
  lng: number;
  name?: string;
}

interface SearchResult {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  score?: number;
}

interface LocationSearchMapProps {
  onLocationSelect?: (location: MapLocation) => void;
  height?: string;
  className?: string;
  showSearchResults?: boolean;
}

// Sample locations database (in a real app, this would come from an API)
const SAMPLE_LOCATIONS: SearchResult[] = [
  {
    id: 1,
    name: 'New York',
    country: 'United States',
    admin1: 'New York',
    latitude: 40.7128,
    longitude: -74.006,
  },
  {
    id: 2,
    name: 'London',
    country: 'United Kingdom',
    admin1: 'England',
    latitude: 51.5074,
    longitude: -0.1278,
  },
  { id: 3, name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
  { id: 4, name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
  {
    id: 5,
    name: 'Sydney',
    country: 'Australia',
    admin1: 'New South Wales',
    latitude: -33.8688,
    longitude: 151.2093,
  },
  { id: 6, name: 'Lagos', country: 'Nigeria', latitude: 6.5244, longitude: 3.3792 },
  {
    id: 7,
    name: 'Mumbai',
    country: 'India',
    admin1: 'Maharashtra',
    latitude: 19.076,
    longitude: 72.8777,
  },
  { id: 8, name: 'São Paulo', country: 'Brazil', latitude: -23.5505, longitude: -46.6333 },
  { id: 9, name: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357 },
  { id: 10, name: 'Mexico City', country: 'Mexico', latitude: 19.4326, longitude: -99.1332 },
  {
    id: 11,
    name: 'Los Angeles',
    country: 'United States',
    admin1: 'California',
    latitude: 34.0522,
    longitude: -118.2437,
  },
  {
    id: 12,
    name: 'Chicago',
    country: 'United States',
    admin1: 'Illinois',
    latitude: 41.8781,
    longitude: -87.6298,
  },
  { id: 13, name: 'Berlin', country: 'Germany', latitude: 52.52, longitude: 13.405 },
  { id: 14, name: 'Madrid', country: 'Spain', latitude: 40.4168, longitude: -3.7038 },
  { id: 15, name: 'Rome', country: 'Italy', latitude: 41.9028, longitude: 12.4964 },
];

const LocationSearchMap: React.FC<LocationSearchMapProps> = ({
  onLocationSelect,
  height = '500px',
  className = '',
  showSearchResults = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [searchMarkers, setSearchMarkers] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { showSuccess, showError } = useSnackbar();
  const responsive = useMapResponsive();
  // Use a more conservative height calculation to prevent overflow
  const responsiveHeight = useMemo(() => {
    const defaultHeight = parseInt(height) || 500;
    if (responsive.isMobile) {
      return responsive.isLandscape ? '45vh' : '40vh';
    }
    if (responsive.isTablet) {
      return '350px';
    }
    return `${Math.min(defaultHeight, 600)}px`;
  }, [responsive.isMobile, responsive.isTablet, responsive.isLandscape, height]);
  const { theme } = useTheme();

  /**
   * Perform location search
   */
  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);

      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // Use fuzzy search to find matching locations
        const results = fuzzySearchLocations(query, SAMPLE_LOCATIONS, {
          maxResults: 8,
          minScore: 10,
          sortByRelevance: true,
        });

        const searchResults = results.map(result => ({
          ...(result.item as SearchResult),
          score: result.score,
        }));

        setSearchResults(searchResults);
        setShowDropdown(searchResults.length > 0);
      } catch (error) {
        console.error('Search error:', error);
        showError('Failed to search locations. Please try again.');
        setSearchResults([]);
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    },
    [showError]
  );

  /**
   * Handle search input change
   */
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
      performSearch(query);
    },
    [performSearch]
  );

  /**
   * Handle search result selection
   */
  const handleResultSelect = useCallback(
    (result: SearchResult) => {
      const location: MapLocation = {
        lat: result.latitude,
        lng: result.longitude,
        name: `${result.name}, ${result.country}`,
      };

      setSelectedLocation(location);
      setSearchQuery(`${result.name}, ${result.country}`);
      setShowDropdown(false);
      setSearchMarkers([result]);

      onLocationSelect?.(location);
      showSuccess(`📍 Selected ${location.name}`);
    },
    [onLocationSelect, showSuccess]
  );

  /**
   * Handle map location change
   */
  const handleMapLocationChange = useCallback(
    (location: MapLocation) => {
      setSelectedLocation(location);
      setSearchMarkers([]);
      onLocationSelect?.(location);
    },
    [onLocationSelect]
  );

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    setSearchMarkers([]);
    setSelectedLocation(null);
    searchInputRef.current?.focus();
  }, []);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
      searchInputRef.current?.blur();
    }
  }, []);

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Create search result marker icon
   */
  const createSearchMarkerIcon = () => {
    const markerColor = theme.isDark ? '#3b82f6' : '#ef4444'; // Blue in dark mode, red in light mode
    const borderColor = theme.isDark ? '#1e40af' : '#ffffff'; // Darker blue border in dark mode

    return L.divIcon({
      className: 'search-result-marker',
      html: `
        <div style="
          width: 25px;
          height: 25px;
          background: ${markerColor};
          border: 2px solid ${borderColor};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">
          <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `,
      iconSize: [25, 25],
      iconAnchor: [12, 25],
    });
  };

  return (
    <div className={`relative w-full h-full flex flex-col overflow-hidden ${className}`}>
      {/* Search Bar */}
      <div className="relative mb-4 flex-shrink-0">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            placeholder="Search for a city or location..."
            className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
              theme.isDark
                ? 'bg-gray-800 border-gray-600 text-white focus:ring-blue-400'
                : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
            }`}
          />

          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isSearching ? (
              <div
                className={`animate-spin rounded-full h-5 w-5 border-b-2 ${
                  theme.isDark ? 'border-blue-400' : 'border-blue-600'
                }`}
              ></div>
            ) : (
              <svg
                className={`h-5 w-5 ${theme.isDark ? 'text-gray-400' : 'text-gray-400'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </div>

          {/* Clear Button */}
          {searchQuery && (
            <button
              onClick={clearSearch}
              aria-label="Clear search"
              className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
                theme.isDark
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div
            ref={dropdownRef}
            className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto ${
              theme.isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
            } border`}
          >
            {searchResults.map(result => (
              <button
                key={result.id}
                onClick={() => handleResultSelect(result)}
                className={`w-full px-4 py-3 text-left focus:outline-none border-b last:border-b-0 transition-colors ${
                  theme.isDark
                    ? 'hover:bg-gray-700 focus:bg-gray-700 border-gray-700'
                    : 'hover:bg-gray-50 focus:bg-gray-50 border-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-medium ${theme.isDark ? 'text-white' : 'text-gray-900'}`}>
                      {result.name}
                    </div>
                    <div className={`text-sm ${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {result.admin1 ? `${result.admin1}, ` : ''}
                      {result.country}
                    </div>
                  </div>
                  {result.score && (
                    <div className={`text-xs ${theme.isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {Math.round(result.score)}% match
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 min-h-0 relative" style={{ height: responsiveHeight }}>
        <BaseWeatherMap
          height="100%"
          onLocationChange={handleMapLocationChange}
          showUserLocation={true}
          className={`map-container rounded-lg border h-full ${
            theme.isDark ? 'border-gray-600' : 'border-gray-200'
          }`}
        >
          {/* Search Result Markers */}
          {searchMarkers.map(marker => (
            <Marker
              key={`search-${marker.id}`}
              position={[marker.latitude, marker.longitude]}
              icon={createSearchMarkerIcon()}
            >
              <Popup>
                <div
                  className={`text-center min-w-[200px] ${
                    theme.isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                  }`}
                >
                  <h3 className={`font-bold mb-2 ${theme.isDark ? 'text-white' : 'text-gray-900'}`}>
                    📍 {marker.name}
                  </h3>
                  <div
                    className={`space-y-1 text-sm ${
                      theme.isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    <div>
                      {marker.admin1 ? `${marker.admin1}, ` : ''}
                      {marker.country}
                    </div>
                    <div className="text-xs">
                      {marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)}
                    </div>
                  </div>
                  <div
                    className={`mt-3 pt-2 border-t ${
                      theme.isDark ? 'border-gray-600' : 'border-gray-200'
                    }`}
                  >
                    <button
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        theme.isDark
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Get Weather
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </BaseWeatherMap>
      </div>

      {/* Selected Location Info */}
      {selectedLocation && showSearchResults && (
        <div
          className={`mt-4 p-4 rounded-lg border flex-shrink-0 ${
            theme.isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3
                className={`font-semibold text-sm ${
                  theme.isDark ? 'text-blue-300' : 'text-blue-900'
                }`}
              >
                Selected Location
              </h3>
              <p className={`text-sm ${theme.isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                {selectedLocation.name} • {selectedLocation.lat.toFixed(4)},{' '}
                {selectedLocation.lng.toFixed(4)}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  theme.isDark
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Get Weather
              </button>
              <button
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  theme.isDark
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSearchMap;
