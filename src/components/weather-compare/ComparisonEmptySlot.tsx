/**
 * ComparisonEmptySlot Component
 * Displays an empty slot with search functionality for adding a city to compare.
 */

import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Card, CardBody, Button } from '@/components/ui/atoms';
import { useTheme } from '@/design-system/theme';
import { useFuzzyGeocodingAutocomplete } from '@/hooks/useFuzzyGeocodingAutocomplete';

interface ComparisonEmptySlotProps {
  cityId: string;
  onCitySelect: (id: string, name: string, query: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

const ComparisonEmptySlot: React.FC<ComparisonEmptySlotProps> = ({
  cityId,
  onCitySelect,
  onRemove,
  canRemove,
}) => {
  const { t } = useTranslation(['weather', 'common']);
  const { _theme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Use fuzzy geocoding autocomplete hook
  const { suggestions, loading, clearSuggestions } = useFuzzyGeocodingAutocomplete(query, {
    debounceMs: 300,
    minQueryLength: 2,
    maxResults: 6,
    enableFuzzySearch: true,
    fuzzyThreshold: 25,
  });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length >= 2);
    setSelectedIndex(-1);
  }, []);

  const handleSelectSuggestion = useCallback(
    (suggestion: (typeof suggestions)[0]) => {
      const cityName = suggestion.admin1
        ? `${suggestion.name}, ${suggestion.admin1}, ${suggestion.country}`
        : `${suggestion.name}, ${suggestion.country}`;
      const searchQuery = `${suggestion.name}, ${suggestion.country}`;

      onCitySelect(cityId, cityName, searchQuery);
      setQuery('');
      setShowSuggestions(false);
      clearSuggestions();
    },
    [cityId, onCitySelect, clearSuggestions]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showSuggestions || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            handleSelectSuggestion(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [showSuggestions, suggestions, selectedIndex, handleSelectSuggestion]
  );

  const handleInputFocus = useCallback(() => {
    if (query.length >= 2) {
      setShowSuggestions(true);
    }
  }, [query]);

  const handleInputBlur = useCallback(() => {
    // Delay hiding to allow click on suggestion
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  return (
    <Card
      className="h-full min-h-[400px] bg-[var(--theme-surface)] border-2 border-dashed border-[var(--theme-border)]"
      shadow="sm"
    >
      <CardBody className="flex flex-col items-center justify-center h-full p-6">
        {/* Search Icon */}
        <div className="w-16 h-16 rounded-full bg-[var(--theme-background)] flex items-center justify-center mb-4">
          <span className="text-3xl">🔍</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-2">
          {t('weather:compare.addCity', 'Add City')}
        </h3>
        <p className="text-sm text-[var(--theme-text-secondary)] mb-4 text-center">
          {t('weather:compare.searchPlaceholder', 'Search for a city to compare')}
        </p>

        {/* Search Input */}
        <div className="w-full relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={t('weather:compare.inputPlaceholder', 'Enter city name...')}
            className="
              w-full px-4 py-3 rounded-lg
              bg-[var(--theme-background)] text-[var(--theme-text)]
              border border-[var(--theme-border)]
              focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]
              placeholder:text-[var(--theme-text-secondary)]
            "
            autoComplete="off"
          />

          {/* Loading indicator */}
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--theme-primary)]" />
            </div>
          )}

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.name}-${suggestion.latitude}-${suggestion.longitude}`}
                  type="button"
                  className={`
                    w-full px-4 py-3 text-left
                    hover:bg-[var(--theme-hover)]
                    ${index === selectedIndex ? 'bg-[var(--theme-hover)]' : ''}
                    ${index !== suggestions.length - 1 ? 'border-b border-[var(--theme-border)]' : ''}
                  `}
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  <p className="font-medium text-[var(--theme-text)]">{suggestion.name}</p>
                  <p className="text-xs text-[var(--theme-text-secondary)]">
                    {suggestion.admin1 ? `${suggestion.admin1}, ` : ''}
                    {suggestion.country}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Remove button */}
        {canRemove && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 text-[var(--theme-text-secondary)]"
            onClick={() => onRemove(cityId)}
          >
            {t('common:actions.remove', 'Remove Slot')}
          </Button>
        )}
      </CardBody>
    </Card>
  );
};

export default ComparisonEmptySlot;
