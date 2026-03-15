/**
 * Simple Header Component
 * A clean, minimal header perfect for focused applications
 */

import React from 'react';

import { Container } from '@/components/ui/layout';
import { COLORS } from '@/design-system/tokens';
import type { WeatherState } from '@/types/weather';

import LanguageSelector from '@/components/language/LanguageSelector';
import SearchEngine from '@/components/search/SearchEngine';

export interface SimpleHeaderProps {
  // App branding
  title: string;
  logoUrl?: string;

  // Search functionality
  query: string;
  setQuery: (query: string) => void;
  search: () => void;
  searchLoading?: boolean;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  weather?: WeatherState;

  // Language selection
  currentLanguage: string;
  supportedLanguages: Record<string, string>;
  changeLanguage: (lang: string) => void;

  // Layout options
  centerSearch?: boolean;
  showBorder?: boolean;
  className?: string;
}

const SimpleHeader: React.FC<SimpleHeaderProps> = ({
  title,
  logoUrl,
  query,
  setQuery,
  search,
  searchLoading = false,
  onSearchChange,
  weather,
  currentLanguage,
  supportedLanguages,
  changeLanguage,
  centerSearch = false,
  showBorder = true,
  className = '',
}) => {
  // Header classes
  const headerClasses = [
    'bg-white',
    'w-full',
    'py-4',
    showBorder ? `border-b border-[${COLORS.neutral[200]}]` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Logo/Brand component
  const renderBrand = () => (
    <div className="flex items-center space-x-3">
      {logoUrl ? (
        <img alt={title} className="h-8 w-8 object-contain" src={logoUrl} />
      ) : (
        <div
          className={`
          h-8 w-8 rounded-lg
          bg-gradient-to-br from-[${COLORS.primary[500]}] to-[${COLORS.primary[600]}]
          flex items-center justify-center
          text-white font-bold text-sm
        `}
        >
          {title.charAt(0)}
        </div>
      )}
      <h1 className={`text-xl font-bold text-[${COLORS.neutral[900]}]`}>{title}</h1>
    </div>
  );

  // Search component
  const renderSearch = () => (
    <div
      className={`
      ${centerSearch ? 'flex-1 max-w-md mx-auto' : 'flex-1 max-w-sm mx-4'}
    `}
    >
      <SearchEngine
        loading={searchLoading}
        query={query}
        search={search}
        setQuery={setQuery}
        weather={weather!}
        onSearchChange={onSearchChange}
      />
    </div>
  );

  // Language selector
  const renderLanguageSelector = () => (
    <div className="flex-shrink-0">
      <LanguageSelector
        changeLanguage={changeLanguage}
        currentLanguage={currentLanguage}
        supportedLanguages={supportedLanguages}
        theme="light"
        variant="compact"
      />
    </div>
  );

  return (
    <header className={headerClasses}>
      <Container size="xl">
        <div className="flex items-center justify-between">
          {/* Brand */}
          {renderBrand()}

          {/* Search */}
          {renderSearch()}

          {/* Language Selector */}
          {renderLanguageSelector()}
        </div>
      </Container>
    </header>
  );
};

export default SimpleHeader;
