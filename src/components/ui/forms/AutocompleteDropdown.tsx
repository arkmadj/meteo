import React from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/design-system/theme';
import { findCharacterMatches } from '@/utils/fuzzySearch';

import CustomScrollbar from './CustomScrollbar';

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  // Additional metadata for fuzzy search
  isFuzzyMatch?: boolean;
  matchScore?: number;
}

export interface AutocompleteDropdownProps {
  suggestions: GeocodingResult[];
  selectedIndex: number;
  onSelect: (suggestion: GeocodingResult) => void;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
  query?: string; // For highlighting matches
}

// Helper function to highlight matched characters
const HighlightedText: React.FC<{
  text: string;
  query: string;
  className?: string;
}> = ({ text, query, className = '' }) => {
  if (!query.trim()) {
    return <span className={className}>{text}</span>;
  }

  const matches = findCharacterMatches(query, text);
  if (matches.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const parts: Array<{ text: string; highlight: boolean }> = [];
  let lastIndex = 0;

  matches.forEach((matchIndex, _i) => {
    // Add text before the match
    if (matchIndex > lastIndex) {
      parts.push({
        text: text.slice(lastIndex, matchIndex),
        highlight: false,
      });
    }

    // Add the matched character
    parts.push({
      text: text?.[matchIndex],
      highlight: true,
    });

    lastIndex = matchIndex + 1;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      text: text.slice(lastIndex),
      highlight: false,
    });
  }

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.highlight ? (
          <mark
            key={index}
            className="bg-[var(--theme-accent)]/20 text-[var(--theme-accent)] px-1 py-0.5 rounded-md font-semibold shadow-sm"
          >
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </span>
  );
};

const AutocompleteDropdown: React.FC<AutocompleteDropdownProps> = ({
  suggestions,
  selectedIndex,
  onSelect,
  onClose: _onClose,
  loading = false,
  error = null,
  query = '',
}) => {
  const { theme: _theme } = useTheme();
  const { t } = useTranslation();

  if (error) {
    return (
      <div className="bg-[var(--theme-surface)]/95 backdrop-blur-sm border border-red-200 rounded-xl shadow-lg w-full">
        <div className="px-4 py-3 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              clipRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              fillRule="evenodd"
            />
          </svg>
          {error}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-[var(--theme-surface)]/95 backdrop-blur-sm border border-[var(--theme-border)] rounded-xl shadow-lg w-full">
        <div className="px-4 py-4 text-sm text-[var(--theme-text-secondary)] text-center flex items-center justify-center">
          <svg className="animate-spin w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              fill="currentColor"
            />
          </svg>
          {t('search.searching')}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-[var(--theme-surface)]/95 backdrop-blur-sm border border-[var(--theme-border)] rounded-xl shadow-xl w-full">
      <CustomScrollbar
        className="w-full"
        fadeIn={true}
        hoverGlow={true}
        maxHeight="20rem"
        smoothScroll={true}
        variant="autocomplete"
      >
        {suggestions.map((suggestion, index) => (
          <div
            key={String(suggestion.id)}
            aria-selected={index === selectedIndex}
            className={`
            px-4 py-3 cursor-pointer transition-all duration-200 ease-in-out border-l-4 rounded-none
            ${
              index === selectedIndex
                ? 'bg-[var(--theme-accent)]/10 border-l-[var(--theme-accent)] shadow-sm'
                : 'border-l-transparent hover:bg-[var(--theme-hover)] hover:border-l-[var(--theme-accent)]/30'
            }
            ${index === 0 ? 'rounded-t-xl' : ''}
            ${index === suggestions.length - 1 ? 'rounded-b-none' : ''}
          `}
            role="option"
            tabIndex={0}
            onClick={() => onSelect(suggestion)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(suggestion);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <svg
                    className="w-4 h-4 flex-shrink-0 text-[var(--theme-accent)]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      fillRule="evenodd"
                    />
                  </svg>
                  <HighlightedText
                    className="font-semibold text-[var(--theme-text)] truncate"
                    query={query}
                    text={suggestion.name}
                  />
                  {suggestion.isFuzzyMatch && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200 flex-shrink-0 shadow-sm">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          clipRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          fillRule="evenodd"
                        />
                      </svg>
                      {t('search.smartMatch')}
                    </span>
                  )}
                  {suggestion.matchScore && suggestion.matchScore > 80 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200 flex-shrink-0 shadow-sm">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {t('search.bestMatch')}
                    </span>
                  )}
                </div>
                <div className="text-sm text-[var(--theme-text-secondary)] truncate">
                  {suggestion.admin1 && suggestion.admin1 !== suggestion.name && (
                    <>
                      <HighlightedText className="mr-1" query={query} text={suggestion.admin1} />
                      •{' '}
                    </>
                  )}
                  <HighlightedText query={query} text={suggestion.country} />
                </div>
              </div>
              <div className="ml-3 flex-shrink-0 flex flex-col items-end">
                <svg
                  className="w-4 h-4 text-[var(--theme-text-secondary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 5l7 7-7 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                {suggestion.matchScore && (
                  <div className="text-xs text-[var(--theme-text-secondary)] mt-1">
                    {suggestion.matchScore.toFixed(0)}%
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CustomScrollbar>

      {/* Enhanced Footer with search info */}
      <div className="px-4 py-3 bg-[var(--theme-hover)] border-t border-[var(--theme-border)] text-xs text-[var(--theme-text-secondary)] rounded-b-xl">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[var(--theme-accent)] rounded-full animate-pulse"></div>
            <span className="font-medium">
              {t(`search.resultsFound${suggestions.length !== 1 ? '_plural' : ''}`, {
                count: suggestions.length,
                plural: suggestions.length !== 1 ? 's' : '',
              })}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1 px-2 py-1 bg-[var(--theme-surface)]/60 rounded-full">
              <svg
                className="w-3 h-3 text-[var(--theme-accent)]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  clipRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  fillRule="evenodd"
                />
              </svg>
              <span className="text-[var(--theme-accent)] font-medium">
                {t('search.smartSearch')}
              </span>
            </span>
            <span className="flex items-center gap-1 text-[var(--theme-text-secondary)]">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              <span className="text-xs">{t('search.poweredByAI')}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutocompleteDropdown;
