/**
 * Navigation Header Component
 * A sophisticated navigation header with responsive design and advanced features
 */

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Container } from '@/components/ui/layout';
import { useTheme } from '@/design-system/theme';
import { SHADOWS } from '@/design-system/tokens';
import type { WeatherState } from '@/types/weather';

import LanguageSelector from '@/components/language/LanguageSelector';
import SearchEngine from '@/components/search/SearchEngine';
import ThemeToggle from '@/components/ui/preferences/ThemeToggle';

export interface NavigationHeaderProps {
  // App branding
  title: string;
  subtitle?: string;
  logoUrl?: string;

  // Search functionality
  query?: string;
  setQuery?: (query: string) => void;
  search?: () => void;
  searchLoading?: boolean;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  weather?: WeatherState;

  // Language selection
  currentLanguage: string;
  supportedLanguages: Record<string, string>;
  changeLanguage: (lang: string) => void;

  // Navigation items (optional)
  navigationItems?: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    active?: boolean;
  }>;

  // Layout and behavior
  sticky?: boolean;
  transparent?: boolean;
  showSearchInMobile?: boolean;
  showThemeToggle?: boolean;
  className?: string;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  title,
  subtitle,
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
  navigationItems = [],
  sticky = true,
  transparent = false,
  showSearchInMobile = true,
  showThemeToggle = true,
  className = '',
}) => {
  const { t } = useTranslation('common');
  const { theme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Handle scroll detection
  useEffect(() => {
    if (!sticky) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sticky]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
        setShowMobileSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Header background classes
  const getBackgroundClasses = () => {
    if (transparent && !isScrolled) {
      return 'bg-transparent';
    }
    return theme.isDark
      ? 'bg-neutral-900/95 backdrop-blur-md border-b border-[var(--theme-border)]'
      : 'bg-white/95 backdrop-blur-md border-b border-[var(--theme-border)]';
  };

  // Header classes
  const headerClasses = [
    'relative',
    'w-full',
    'transition-all',
    'duration-300',
    'ease-in-out',
    'z-[60]',
    sticky ? 'sticky top-0' : '',
    getBackgroundClasses(),
    isScrolled ? `shadow-[${SHADOWS.md}]` : '',
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
          className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm transition-all duration-200 hover:scale-110"
          style={{
            background: `linear-gradient(135deg, var(--theme-accent), ${theme.isDark ? 'rgba(var(--theme-accent-rgb), 0.7)' : 'rgba(var(--theme-accent-rgb), 0.8)'})`,
            boxShadow: '0 2px 8px rgba(var(--theme-accent-rgb), 0.3)',
          }}
        >
          {title.charAt(0)}
        </div>
      )}
      <div className="hidden sm:block">
        <h1 className="text-lg font-bold text-[var(--theme-text)]">{title}</h1>
        {subtitle && <p className="text-xs text-[var(--theme-text-secondary)] -mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  // Navigation items
  const renderNavigation = () => {
    if (navigationItems.length === 0) return null;

    return (
      <nav className="hidden lg:flex items-center space-x-6">
        {navigationItems.map((item, index) => (
          <button
            key={index}
            className={`
              px-3 py-2 rounded-md text-sm font-medium
              transition-all duration-200
              ${
                item.active
                  ? 'text-white hover:opacity-90 active:scale-95'
                  : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-hover)]'
              }
            `}
            style={
              item.active
                ? {
                    backgroundColor: 'var(--theme-accent)',
                    boxShadow: '0 2px 8px rgba(var(--theme-accent-rgb), 0.3)',
                  }
                : {}
            }
            onClick={item.onClick}
          >
            {item.label}
          </button>
        ))}
      </nav>
    );
  };

  // Desktop search
  const renderDesktopSearch = () => {
    if (!query || !setQuery || !search) return null;

    return (
      <div className="hidden md:block flex-1 max-w-md mx-6">
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
  };

  // Mobile search toggle
  const renderMobileSearchToggle = () => (
    <button
      aria-label={t('search.toggle')}
      className="md:hidden p-2 rounded-md text-[var(--theme-text-secondary)] transition-all duration-200 hover:scale-110"
      style={{
        color: 'var(--theme-text-secondary)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.color = 'var(--theme-accent)';
        (e.currentTarget as HTMLElement).style.backgroundColor =
          'rgba(var(--theme-accent-rgb), 0.1)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.color = 'var(--theme-text-secondary)';
        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
      }}
      onClick={() => setShowMobileSearch(!showMobileSearch)}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      </svg>
    </button>
  );

  // Mobile menu toggle
  const renderMobileMenuToggle = () => (
    <button
      aria-label={t('navigation.menu')}
      className="lg:hidden p-2 rounded-md text-[var(--theme-text-secondary)] transition-all duration-200 hover:scale-110"
      style={{
        color: 'var(--theme-text-secondary)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.color = 'var(--theme-accent)';
        (e.currentTarget as HTMLElement).style.backgroundColor =
          'rgba(var(--theme-accent-rgb), 0.1)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.color = 'var(--theme-text-secondary)';
        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
      }}
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {isMobileMenuOpen ? (
          <path
            d="M6 18L18 6M6 6l12 12"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        ) : (
          <path
            d="M4 6h16M4 12h16M4 18h16"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        )}
      </svg>
    </button>
  );

  // Render theme toggle
  const renderThemeToggle = () => {
    if (!showThemeToggle) return null;

    return (
      <div className="flex-shrink-0">
        <ThemeToggle variant="compact" showTooltip={true} />
      </div>
    );
  };

  // Actions (language selector, etc.)
  const renderActions = () => (
    <div className="flex items-center space-x-2">
      {renderThemeToggle()}
      <LanguageSelector
        changeLanguage={changeLanguage}
        currentLanguage={currentLanguage}
        supportedLanguages={supportedLanguages}
        theme={theme.isDark ? 'dark' : 'light'}
        variant="compact"
      />
      {showSearchInMobile && query && setQuery && search && renderMobileSearchToggle()}
      {navigationItems.length > 0 && renderMobileMenuToggle()}
    </div>
  );

  // Mobile search bar
  const renderMobileSearch = () => {
    if (!showMobileSearch || !query || !setQuery || !search) return null;

    return (
      <div className="md:hidden border-t border-[${COLORS.neutral[200]}] p-4">
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
  };

  // Mobile navigation menu
  const renderMobileMenu = () => {
    if (!isMobileMenuOpen || navigationItems.length === 0) return null;

    return (
      <div className="lg:hidden border-t border-[var(--theme-border)]">
        <nav className="px-4 py-2 space-y-1">
          {navigationItems.map((item, index) => (
            <button
              key={index}
              className={`
                block w-full text-left px-3 py-2 rounded-md text-base font-medium
                transition-all duration-200
                ${
                  item.active
                    ? 'text-white hover:opacity-90 active:scale-95'
                    : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-hover)]'
                }
              `}
              style={
                item.active
                  ? {
                      backgroundColor: 'var(--theme-accent)',
                      boxShadow: '0 2px 8px rgba(var(--theme-accent-rgb), 0.3)',
                    }
                  : {}
              }
              onClick={() => {
                item.onClick?.();
                setIsMobileMenuOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    );
  };

  return (
    <header ref={headerRef} className={headerClasses}>
      <Container size="xl">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          {renderBrand()}

          {/* Desktop Navigation */}
          {renderNavigation()}

          {/* Desktop Search */}
          {renderDesktopSearch()}

          {/* Actions */}
          {renderActions()}
        </div>

        {/* Mobile Search */}
        {renderMobileSearch()}

        {/* Mobile Menu */}
        {renderMobileMenu()}
      </Container>
    </header>
  );
};

export default NavigationHeader;
