/**
 * App Header Component
 * A comprehensive header that includes app branding, search functionality, language selection, and theme toggle
 * Features polished entry animations that respect user motion preferences
 */

import type { CSSProperties } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useTheme } from '@/design-system/theme';
import { ANIMATION_DURATION, ANIMATION_EASING, usePrefersReducedMotion } from '@/hooks/useMotion';
import type { SupportedLanguage } from '@/i18n/config/types';
import type { NotificationItem } from '@/types/notification';
import type { WeatherState } from '@/types/weather';

import LanguageSelector from '@/components/language/LanguageSelector';
import SearchEngine from '@/components/search/SearchEngine';
import FavoriteLocationsDrawerTrigger from '@/components/ui/favorites/FavoriteLocationsDrawerTrigger';
import NotificationBell from '@/components/ui/notifications/NotificationBell';
import ThemeToggle from '@/components/ui/preferences/ThemeToggle';

export interface AppHeaderProps {
  // App branding
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  logoUrl?: string;

  // Search functionality
  query?: string;
  setQuery?: (query: string) => void;
  search?: () => void;
  searchLoading?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  weather?: WeatherState;
  showSearch?: boolean;

  // Language selection
  currentLanguage: string;
  supportedLanguages: Record<string, string>;
  changeLanguage: (lang: SupportedLanguage) => void;

  // Favorites drawer integration
  onSelectFavoriteLocation?: (location: string) => void;
  showFavorites?: boolean;

  // Notifications
  notifications?: NotificationItem[];
  unreadNotificationCount?: number;
  onMarkNotificationAsRead?: (id: string) => void;
  onDismissNotification?: (id: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
  onClearAllNotifications?: () => void;
  showNotifications?: boolean;

  // Layout and styling
  variant?: 'default' | 'compact' | 'minimal';
  sticky?: boolean;
  showSubtitle?: boolean;
  showThemeToggle?: boolean;
  className?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'Meteo',
  subtitle,
  showLogo = true,
  query = '',
  setQuery,
  search,
  searchLoading = false,
  searchPlaceholder,
  onSearchChange,
  weather,
  showSearch = true,
  currentLanguage,
  supportedLanguages,
  changeLanguage,
  variant = 'default',
  sticky = false,
  showSubtitle = false,
  showThemeToggle = true,
  className = '',
  onSelectFavoriteLocation,
  showFavorites = true,
  // Notification props
  notifications = [],
  unreadNotificationCount = 0,
  onMarkNotificationAsRead,
  onDismissNotification,
  onMarkAllNotificationsAsRead,
  onClearAllNotifications,
  showNotifications = true,
}) => {
  const { t } = useTranslation('common');
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Animation state for staggered entry animations
  const [animationState, setAnimationState] = useState({
    headerVisible: false,
    brandingVisible: false,
    searchVisible: false,
    actionsVisible: false,
  });

  // Use provided title/subtitle or fallback to translations
  const displayTitle = title || t('title');
  const displaySubtitle = subtitle || t('subtitle');

  // Theme-aware CSS classes using CSS custom properties
  const themeClasses = {
    background: 'bg-[var(--theme-surface)]',
    text: 'text-[var(--theme-text)]',
    textSecondary: 'text-[var(--theme-text-secondary)]',
    border: 'border-[var(--theme-border)]',
    shadow: 'shadow-[0_4px_6px_var(--theme-shadow)]',
    hover: 'hover:bg-[var(--theme-hover)]',
  };

  // Handle scroll detection for sticky header
  useEffect(() => {
    if (!sticky) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sticky]);

  // Entry animation effect with staggered timing
  useEffect(() => {
    // Animation timing constants
    const HEADER_DELAY = 50;
    const BRANDING_DELAY = prefersReducedMotion ? 50 : 150;
    const SEARCH_DELAY = prefersReducedMotion ? 50 : 300;
    const ACTIONS_DELAY = prefersReducedMotion ? 50 : 400;

    // Staggered visibility updates
    const headerTimer = setTimeout(() => {
      setAnimationState(prev => ({ ...prev, headerVisible: true }));
    }, HEADER_DELAY);

    const brandingTimer = setTimeout(() => {
      setAnimationState(prev => ({ ...prev, brandingVisible: true }));
    }, BRANDING_DELAY);

    const searchTimer = setTimeout(() => {
      setAnimationState(prev => ({ ...prev, searchVisible: true }));
    }, SEARCH_DELAY);

    const actionsTimer = setTimeout(() => {
      setAnimationState(prev => ({ ...prev, actionsVisible: true }));
    }, ACTIONS_DELAY);

    return () => {
      clearTimeout(headerTimer);
      clearTimeout(brandingTimer);
      clearTimeout(searchTimer);
      clearTimeout(actionsTimer);
    };
  }, [prefersReducedMotion]);

  // Helper function to get animation styles
  const getEntryAnimationStyle = (
    isVisible: boolean,
    animationType: 'slideDown' | 'slideUp' | 'slideLeft' | 'fadeScale' = 'slideDown'
  ): CSSProperties => {
    const duration = prefersReducedMotion
      ? ANIMATION_DURATION.fast * 0.3
      : ANIMATION_DURATION.normal;
    const distance = prefersReducedMotion ? 4 : 16;

    const transforms: Record<typeof animationType, string> = {
      slideDown: `translateY(-${distance}px)`,
      slideUp: `translateY(${distance}px)`,
      slideLeft: `translateX(${distance}px)`,
      fadeScale: `scale(0.96)`,
    };

    return {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0) translateX(0) scale(1)' : transforms[animationType],
      transition: `opacity ${duration}ms ${ANIMATION_EASING.easeOut}, transform ${duration}ms ${ANIMATION_EASING.easeOut}`,
      willChange: isVisible ? 'auto' : 'opacity, transform',
    };
  };

  // Variant-specific configurations
  const variantConfig = {
    default: {
      titleSize: 'text-xl sm:text-2xl lg:text-3xl',
      subtitleSize: 'text-sm sm:text-base',
      padding: 'px-4 py-3 sm:px-6 sm:py-4',
      searchSize: 'lg' as const,
      showBranding: true,
      showSearch: true,
      showLanguage: true,
      layout: 'inline' as const,
    },
    compact: {
      titleSize: 'text-lg sm:text-xl',
      subtitleSize: 'text-xs sm:text-sm',
      padding: 'px-3 py-2.5 sm:px-4 sm:py-3',
      searchSize: 'md' as const,
      showBranding: true,
      showSearch: true,
      showLanguage: true,
      layout: 'inline' as const,
    },
    minimal: {
      titleSize: 'text-base sm:text-lg',
      subtitleSize: 'text-xs',
      padding: 'px-3 py-2 sm:px-3 sm:py-2.5',
      searchSize: 'sm' as const,
      showBranding: false,
      showSearch: true,
      showLanguage: true,
      layout: 'inline' as const,
    },
  };

  const config = variantConfig?.[variant];

  // Base header classes with mobile-first approach
  const headerClasses = [
    'relative',
    'w-full',
    'mx-auto',
    'transition-all',
    'duration-300',
    'ease-in-out',
    themeClasses.background,
    themeClasses.shadow,
    'rounded-xl',
    'border',
    themeClasses.border,
    config.padding,
    'mt-4 sm:mt-6',
    sticky ? 'sticky top-4 z-50' : '',
    sticky && isScrolled ? 'shadow-lg backdrop-blur-md' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Render logo if provided
  const renderLogo = () => {
    if (!showLogo) return null;

    const handleLogoClick = () => {
      void navigate('/');
    };

    return (
      <div className="flex items-center mr-4">
        <button
          onClick={handleLogoClick}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer"
          aria-label="Go to home page"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </button>
      </div>
    );
  };

  // Render app branding (title and subtitle)
  const renderBranding = () => {
    if (!config.showBranding) return null;

    return (
      <div
        className={`${config.layout === 'inline' ? 'flex items-center space-x-3' : 'text-center'}`}
      >
        {renderLogo()}
        <div className={config.layout === 'inline' ? 'text-left' : 'text-center'}>
          <h1
            className={`
            ${config.titleSize}
            font-bold
            ${themeClasses.text}
            leading-tight
            ${config.layout === 'inline' ? 'mb-0' : 'mb-1'}
          `}
          >
            {displayTitle}
          </h1>
          {showSubtitle && (
            <p
              className={`
              ${config.subtitleSize}
              ${themeClasses.textSecondary}
              leading-tight
              ${config.layout === 'inline' ? 'mt-0' : ''}
            `}
            >
              {displaySubtitle}
            </p>
          )}
        </div>
      </div>
    );
  };

  // Render search section
  const renderSearch = () => {
    if (!config.showSearch || !showSearch) return null;
    if (!setQuery || !search) return null;

    return (
      <div className="w-full">
        <SearchEngine
          loading={searchLoading}
          placeholder={searchPlaceholder}
          query={query}
          search={search}
          setQuery={setQuery}
          weather={weather!}
          onSearchChange={onSearchChange}
        />
      </div>
    );
  };

  // Render theme toggle
  const renderThemeToggle = () => {
    if (!showThemeToggle) return null;

    return (
      <div className="flex-shrink-0">
        <ThemeToggle variant="compact" showTooltip={true} />
      </div>
    );
  };

  // Render language selector
  const renderLanguageSelector = () => {
    if (!config.showLanguage) return null;

    return (
      <div className="flex-shrink-0">
        <LanguageSelector
          changeLanguage={changeLanguage}
          currentLanguage={currentLanguage}
          supportedLanguages={supportedLanguages}
          theme={theme.isDark ? 'dark' : 'light'}
          variant="compact"
        />
      </div>
    );
  };

  // Render favorites trigger (opens the FavoriteLocationsDrawer)
  const renderFavoritesTrigger = () => {
    if (!onSelectFavoriteLocation || !showFavorites) return null;

    return (
      <div className="flex-shrink-0">
        <FavoriteLocationsDrawerTrigger onSelectLocation={onSelectFavoriteLocation} />
      </div>
    );
  };

  // Render notification bell
  const renderNotificationBell = () => {
    if (!showNotifications) return null;

    return (
      <div className="flex-shrink-0">
        <NotificationBell
          notifications={notifications}
          unreadCount={unreadNotificationCount}
          onMarkAsRead={onMarkNotificationAsRead}
          onDismiss={onDismissNotification}
          onMarkAllAsRead={onMarkAllNotificationsAsRead}
          onClearAll={onClearAllNotifications}
        />
      </div>
    );
  };

  // Render header actions (favorites, notifications, theme toggle, language selector)
  const renderHeaderActions = () => {
    return (
      <div className="flex items-center space-x-2">
        {renderFavoritesTrigger()}
        {renderNotificationBell()}
        {renderThemeToggle()}
        {renderLanguageSelector()}
      </div>
    );
  };

  // Render based on layout with mobile-first approach
  const renderContent = () => {
    return (
      <div className="w-full">
        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between w-full gap-4">
          <div
            className="flex-1"
            style={getEntryAnimationStyle(animationState.brandingVisible, 'slideDown')}
          >
            {renderBranding()}
          </div>
          <div
            className="flex-1 max-w-md mx-4"
            style={getEntryAnimationStyle(animationState.searchVisible, 'fadeScale')}
          >
            {renderSearch()}
          </div>
          <div
            className="flex-shrink-0"
            style={getEntryAnimationStyle(animationState.actionsVisible, 'slideLeft')}
          >
            {renderHeaderActions()}
          </div>
        </div>

        {/* Tablet Layout */}
        <div className="hidden sm:flex lg:hidden items-center justify-between w-full gap-4">
          <div
            className="flex-1"
            style={getEntryAnimationStyle(animationState.brandingVisible, 'slideDown')}
          >
            {renderBranding()}
          </div>
          <div
            className="flex-shrink-0"
            style={getEntryAnimationStyle(animationState.actionsVisible, 'slideLeft')}
          >
            {renderHeaderActions()}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between w-full gap-4">
            <div
              className="flex-1"
              style={getEntryAnimationStyle(animationState.brandingVisible, 'slideDown')}
            >
              {renderBranding()}
            </div>
            <div
              className="flex-shrink-0"
              style={getEntryAnimationStyle(animationState.actionsVisible, 'slideLeft')}
            >
              {renderHeaderActions()}
            </div>
          </div>
        </div>

        {/* Search Bar - Bottom for Mobile/Tablet */}
        <div
          className={`lg:hidden mt-4 pt-4 border-t ${themeClasses.border}`}
          style={getEntryAnimationStyle(animationState.searchVisible, 'slideUp')}
        >
          {renderSearch()}
        </div>
      </div>
    );
  };

  return (
    <header
      ref={headerRef}
      className={headerClasses}
      style={getEntryAnimationStyle(animationState.headerVisible, 'slideDown')}
    >
      {renderContent()}
    </header>
  );
};

export default AppHeader;
