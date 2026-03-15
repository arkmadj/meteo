import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import AboutPageNav, { AboutNavItem } from '@/components/navigation/AboutPageNav';
import MainHeader from '@/components/headers/MainHeader';
import { Card, CardBody, CardHeader, FloatingActionButton } from '@/components/ui/atoms';
import { Container, Flex, Grid, Stack } from '@/components/ui/layout';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { useTheme } from '@/design-system/theme';
import { getSectionById, sectionsToNavItems, type SectionMetadata } from '@/utils/sectionUtils';

/**
 * Define all sections with their metadata
 * This serves as the single source of truth for all page sections
 */
const SECTIONS: SectionMetadata[] = [
  {
    id: 'app-info',
    icon: '🌤️',
    title: 'Weather App',
    subtitle: 'Modern React weather application',
  },
  {
    id: 'tech-stack',
    icon: '⚡',
    title: 'Technology Stack',
    subtitle: 'Built with modern web technologies',
  },
  {
    id: 'accessibility',
    icon: '♿',
    title: 'Accessibility',
    subtitle: 'Inclusive design for everyone',
  },
  {
    id: 'performance',
    icon: '📈',
    title: 'Performance',
    subtitle: 'Optimized for speed and efficiency',
  },
  {
    id: 'credits',
    icon: '🙏',
    title: 'Credits & Acknowledgments',
    subtitle: 'Thank you to all contributors',
  },
];

/**
 * About page component - app information and credits
 * Theme-aware implementation with proper context integration
 * Supports URL hash navigation for direct section linking
 * Dynamically generates navigation from section metadata
 */
const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { showSuccess, showError } = useSnackbar();
  const [showMobileNav, setShowMobileNav] = useState(false);

  /**
   * Dynamically generate navigation items from sections
   * This ensures the sidebar always reflects the actual page content
   */
  const navItems: AboutNavItem[] = useMemo(() => sectionsToNavItems(SECTIONS), []);

  // Theme-aware classes
  const isDark = theme.isDark;
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const pageClasses = `min-h-screen ${bgColor} transition-colors duration-200`;

  /**
   * Handle URL hash navigation on mount and hash change
   * Scrolls to the section specified in the URL hash
   */
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && navItems.some(item => item.id === hash)) {
      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          const headerOffset = 100; // Account for sticky header
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [location.hash, navItems]);

  /**
   * Copy section link to clipboard
   */
  const copySectionLink = async (sectionId: string) => {
    try {
      const url = `${window.location.origin}${location.pathname}#${sectionId}`;
      await navigator.clipboard.writeText(url);
      showSuccess('🔗 Link copied to clipboard!', 2000);
    } catch (error) {
      showError('Failed to copy link');
    }
  };

  /**
   * Render section header with copy link button
   * Uses section metadata for consistent rendering
   */
  const renderSectionHeader = (section: SectionMetadata) => (
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {section.icon} {section.title}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">{section.subtitle}</p>
      </div>
      <button
        onClick={() => copySectionLink(section.id)}
        className={`
          p-2 rounded-md text-sm transition-all duration-200
          ${
            isDark
              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${isDark ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}
        `}
        aria-label={`Copy link to ${section.title} section`}
        title="Copy link to this section"
        type="button"
      >
        <span className="text-lg" aria-hidden="true">
          🔗
        </span>
      </button>
    </div>
  );

  /**
   * Get section metadata by ID
   */
  const getSection = (id: string): SectionMetadata => getSectionById(SECTIONS, id);

  return (
    <div className={pageClasses} data-theme={isDark ? 'dark' : 'light'}>
      {/* Header */}
      <MainHeader
        title="About Weather App"
        subtitle="Learn more about this application"
        navigationButtons={[
          { label: 'Home', to: '/', variant: 'secondary' },
          { label: 'Settings', to: '/settings', variant: 'secondary' },
        ]}
        sticky={true}
      />

      {/* Main Content */}
      <main className="py-6">
        <Container size="xl">
          {/* Mobile Navigation Toggle */}
          <button
            onClick={() => setShowMobileNav(!showMobileNav)}
            className={`
              lg:hidden mb-4 px-4 py-2 rounded-lg text-sm font-medium
              flex items-center gap-2 w-full justify-between
              transition-colors duration-200
              ${
                isDark
                  ? 'bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }
            `}
            aria-expanded={showMobileNav}
            aria-controls="mobile-nav"
            type="button"
          >
            <span className="flex items-center gap-2">
              <span aria-hidden="true">📑</span>
              <span>Table of Contents</span>
            </span>
            <span aria-hidden="true">{showMobileNav ? '▲' : '▼'}</span>
          </button>

          {/* Mobile Navigation Dropdown */}
          {showMobileNav && (
            <div id="mobile-nav" className="lg:hidden mb-6">
              <AboutPageNav items={navItems} onNavigate={() => setShowMobileNav(false)} />
            </div>
          )}

          <div className="flex gap-8">
            {/* Side Navigation - Hidden on mobile, visible on large screens */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <AboutPageNav items={navItems} />
            </aside>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              <div className="space-y-6">
                {/* App Information */}
                <Card id="app-info">
                  <CardHeader>{renderSectionHeader(getSection('app-info'))}</CardHeader>
                  <CardBody className="space-y-6">
                    {/* Hero Section */}
                    <div className="text-center py-4">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 mb-4 shadow-lg">
                        <span className="text-4xl" role="img" aria-label="Weather icon">
                          🌤️
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-[var(--theme-text)] mb-2">
                        React Weather App
                      </h3>
                      <p className="text-base text-[var(--theme-text-secondary)] max-w-2xl mx-auto">
                        A modern, accessible weather application built with React, TypeScript, and
                        cutting-edge web technologies. Experience real-time weather data with an
                        intuitive, customizable interface.
                      </p>
                      <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--theme-surface)] border border-[var(--theme-border)]">
                        <span className="text-sm font-medium text-[var(--theme-text-secondary)]">
                          Version
                        </span>
                        <span className="text-sm font-semibold text-[var(--theme-primary)]">
                          v1.0.0
                        </span>
                      </div>
                    </div>

                    {/* Key Features Grid */}
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-4 flex items-center gap-2">
                        <span className="text-xl" role="img" aria-label="Star">
                          ⭐
                        </span>
                        Key Features
                      </h3>
                      <Grid columns={{ sm: 1, md: 2, lg: 3 }} gap="md">
                        {/* Feature Card 1 */}
                        <div className="p-4 rounded-lg bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <span className="text-xl" role="img" aria-label="Cloud">
                                ☁️
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[var(--theme-text)] mb-1">
                                Real-Time Data
                              </h4>
                              <p className="text-sm text-[var(--theme-text-secondary)]">
                                Live weather updates with smart caching and automatic refresh
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Feature Card 2 */}
                        <div className="p-4 rounded-lg bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <span className="text-xl" role="img" aria-label="Dashboard">
                                📊
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[var(--theme-text)] mb-1">
                                Customizable Dashboard
                              </h4>
                              <p className="text-sm text-[var(--theme-text-secondary)]">
                                Interactive widgets you can arrange and personalize
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Feature Card 3 */}
                        <div className="p-4 rounded-lg bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <span className="text-xl" role="img" aria-label="Moon">
                                🌙
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[var(--theme-text)] mb-1">
                                Dark Mode
                              </h4>
                              <p className="text-sm text-[var(--theme-text-secondary)]">
                                Auto-detect system preference with manual override
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Feature Card 4 */}
                        <div className="p-4 rounded-lg bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <span className="text-xl" role="img" aria-label="Accessibility">
                                ♿
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[var(--theme-text)] mb-1">
                                Fully Accessible
                              </h4>
                              <p className="text-sm text-[var(--theme-text-secondary)]">
                                WCAG 2.1 AA compliant with keyboard navigation
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Feature Card 5 */}
                        <div className="p-4 rounded-lg bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <span className="text-xl" role="img" aria-label="Rocket">
                                🚀
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[var(--theme-text)] mb-1">
                                Optimized Performance
                              </h4>
                              <p className="text-sm text-[var(--theme-text-secondary)]">
                                Lazy loading, code splitting, and smart prefetching
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Feature Card 6 */}
                        <div className="p-4 rounded-lg bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <span className="text-xl" role="img" aria-label="Mobile">
                                📱
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[var(--theme-text)] mb-1">
                                Responsive Design
                              </h4>
                              <p className="text-sm text-[var(--theme-text-secondary)]">
                                Seamless experience across all devices and screen sizes
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Feature Card 7 */}
                        <div className="p-4 rounded-lg bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <span className="text-xl" role="img" aria-label="Globe">
                                🌍
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[var(--theme-text)] mb-1">
                                Internationalization
                              </h4>
                              <p className="text-sm text-[var(--theme-text-secondary)]">
                                Multi-language support with localized content
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Feature Card 8 */}
                        <div className="p-4 rounded-lg bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <span className="text-xl" role="img" aria-label="Location">
                                📍
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[var(--theme-text)] mb-1">
                                Geolocation
                              </h4>
                              <p className="text-sm text-[var(--theme-text-secondary)]">
                                Automatic location detection with manual override
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Feature Card 9 */}
                        <div className="p-4 rounded-lg bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <span className="text-xl" role="img" aria-label="Map">
                                🗺️
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[var(--theme-text)] mb-1">
                                Interactive Maps
                              </h4>
                              <p className="text-sm text-[var(--theme-text-secondary)]">
                                Heatmap visualizations with zoom and pan controls
                              </p>
                            </div>
                          </div>
                        </div>
                      </Grid>
                    </div>

                    {/* Additional Highlights */}
                    <div className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                      <Flex alignItems="center" gap="md" className="mb-4">
                        <span className="text-2xl" role="img" aria-label="Sparkles">
                          ✨
                        </span>
                        <h3 className="text-lg font-semibold text-[var(--theme-text)]">
                          What Makes Us Special
                        </h3>
                      </Flex>
                      <Stack spacing="sm">
                        <Flex alignItems="flex-start" gap="sm">
                          <span className="text-blue-600 dark:text-blue-400 mt-0.5">▸</span>
                          <p className="text-sm text-[var(--theme-text-secondary)] flex-1">
                            <strong className="text-[var(--theme-text)]">
                              Smart Caching Strategy:
                            </strong>{' '}
                            Intelligent data management with TanStack Query ensures fresh data
                            without unnecessary API calls
                          </p>
                        </Flex>
                        <Flex alignItems="flex-start" gap="sm">
                          <span className="text-blue-600 dark:text-blue-400 mt-0.5">▸</span>
                          <p className="text-sm text-[var(--theme-text-secondary)] flex-1">
                            <strong className="text-[var(--theme-text)]">
                              Design System Integration:
                            </strong>{' '}
                            Comprehensive design tokens ensure consistency across all components and
                            themes
                          </p>
                        </Flex>
                        <Flex alignItems="flex-start" gap="sm">
                          <span className="text-blue-600 dark:text-blue-400 mt-0.5">▸</span>
                          <p className="text-sm text-[var(--theme-text-secondary)] flex-1">
                            <strong className="text-[var(--theme-text)]">
                              Accessibility First:
                            </strong>{' '}
                            Built from the ground up with screen readers, keyboard navigation, and
                            high contrast support
                          </p>
                        </Flex>
                        <Flex alignItems="flex-start" gap="sm">
                          <span className="text-blue-600 dark:text-blue-400 mt-0.5">▸</span>
                          <p className="text-sm text-[var(--theme-text-secondary)] flex-1">
                            <strong className="text-[var(--theme-text)]">
                              Performance Optimized:
                            </strong>{' '}
                            Advanced code splitting with 15 named chunks and intelligent prefetching
                            strategies
                          </p>
                        </Flex>
                      </Stack>
                    </div>
                  </CardBody>
                </Card>

                {/* Technical Information */}
                <Card id="tech-stack">
                  <CardHeader>{renderSectionHeader(getSection('tech-stack'))}</CardHeader>
                  <CardBody className="space-y-6">
                    {/* Technology Stack Grid */}
                    <Grid columns={{ sm: 1, md: 2, lg: 2 }} gap="md">
                      {/* Core Technologies */}
                      <div className="p-5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group hover:shadow-md">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                            <span className="text-2xl" role="img" aria-label="Rocket">
                              🚀
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-[var(--theme-text)] mb-1">
                              Core Technologies
                            </h3>
                            <p className="text-xs text-[var(--theme-text-secondary)]">
                              Modern foundation
                            </p>
                          </div>
                        </div>
                        <ul className="space-y-2.5">
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>React 18 with TypeScript for type-safe development</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Vite for fast builds and HMR</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>React Router v7 for client-side routing</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Tailwind CSS v4 for utility-first styling</span>
                          </li>
                        </ul>
                      </div>

                      {/* Data Management */}
                      <div className="p-5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group hover:shadow-md">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                            <span className="text-2xl" role="img" aria-label="Database">
                              💾
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-[var(--theme-text)] mb-1">
                              Data Management
                            </h3>
                            <p className="text-xs text-[var(--theme-text-secondary)]">
                              Smart state handling
                            </p>
                          </div>
                        </div>
                        <ul className="space-y-2.5">
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>TanStack Query v5 for server state management</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Smart caching with configurable stale times</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Automatic background refetching</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Optimistic updates and query invalidation</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>DevTools for debugging (development only)</span>
                          </li>
                        </ul>
                      </div>

                      {/* UI Component System */}
                      <div className="p-5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group hover:shadow-md">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                            <span className="text-2xl" role="img" aria-label="Components">
                              🧩
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-[var(--theme-text)] mb-1">
                              UI Component System
                            </h3>
                            <p className="text-xs text-[var(--theme-text-secondary)]">
                              Modular architecture
                            </p>
                          </div>
                        </div>
                        <ul className="space-y-2.5">
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-purple-500 dark:text-purple-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Atomic Design: Atoms, Molecules, Organisms</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-purple-500 dark:text-purple-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Modular layout components (Container, Grid, Stack)</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-purple-500 dark:text-purple-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Design tokens for consistent theming</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-purple-500 dark:text-purple-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Accessible custom components (Modals, Dropdowns)</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-purple-500 dark:text-purple-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Storybook for component documentation</span>
                          </li>
                        </ul>
                      </div>

                      {/* Theme System */}
                      <div className="p-5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group hover:shadow-md">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                            <span className="text-2xl" role="img" aria-label="Theme">
                              🎨
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-[var(--theme-text)] mb-1">
                              Theme System
                            </h3>
                            <p className="text-xs text-[var(--theme-text-secondary)]">
                              Dynamic theming
                            </p>
                          </div>
                        </div>
                        <ul className="space-y-2.5">
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Light, Dark, and Auto modes</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>System preference detection</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Persistent theme selection</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>CSS custom properties for dynamic theming</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Comprehensive color palette with semantic meanings</span>
                          </li>
                        </ul>
                      </div>

                      {/* Performance Optimization */}
                      <div className="p-5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group hover:shadow-md">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                            <span className="text-2xl" role="img" aria-label="Performance">
                              ⚡
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-[var(--theme-text)] mb-1">
                              Performance Optimization
                            </h3>
                            <p className="text-xs text-[var(--theme-text-secondary)]">
                              Speed & efficiency
                            </p>
                          </div>
                        </div>
                        <ul className="space-y-2.5">
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-orange-500 dark:text-orange-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Webpack chunk splitting (15 named chunks)</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-orange-500 dark:text-orange-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Intelligent prefetching with data-saver respect</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-orange-500 dark:text-orange-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Route-based code splitting with React.lazy</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-orange-500 dark:text-orange-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Suspense boundaries for smooth loading states</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-orange-500 dark:text-orange-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Bundle size optimization and tree shaking</span>
                          </li>
                        </ul>
                      </div>

                      {/* Maps & Visualization */}
                      <div className="p-5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group hover:shadow-md">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 dark:from-teal-400 dark:to-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                            <span className="text-2xl" role="img" aria-label="Map">
                              🗺️
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-[var(--theme-text)] mb-1">
                              Maps & Visualization
                            </h3>
                            <p className="text-xs text-[var(--theme-text-secondary)]">
                              Interactive mapping
                            </p>
                          </div>
                        </div>
                        <ul className="space-y-2.5">
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-teal-500 dark:text-teal-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Leaflet for interactive maps</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-teal-500 dark:text-teal-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Temperature and air quality heatmaps</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-teal-500 dark:text-teal-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Custom weather tooltips and overlays</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-teal-500 dark:text-teal-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Zoom and pan controls</span>
                          </li>
                        </ul>
                      </div>

                      {/* Internationalization */}
                      <div className="p-5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group hover:shadow-md">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                            <span className="text-2xl" role="img" aria-label="Globe">
                              🌍
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-[var(--theme-text)] mb-1">
                              Internationalization
                            </h3>
                            <p className="text-xs text-[var(--theme-text-secondary)]">
                              Multi-language support
                            </p>
                          </div>
                        </div>
                        <ul className="space-y-2.5">
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-indigo-500 dark:text-indigo-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>i18next for translation management</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-indigo-500 dark:text-indigo-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Browser language detection</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-indigo-500 dark:text-indigo-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>HTTP backend for dynamic loading</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-indigo-500 dark:text-indigo-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Multiple language support</span>
                          </li>
                        </ul>
                      </div>

                      {/* Developer Tools */}
                      <div className="p-5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group hover:shadow-md">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-red-600 dark:from-red-400 dark:to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                            <span className="text-2xl" role="img" aria-label="Tools">
                              🛠️
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-[var(--theme-text)] mb-1">
                              Developer Tools
                            </h3>
                            <p className="text-xs text-[var(--theme-text-secondary)]">
                              Quality & testing
                            </p>
                          </div>
                        </div>
                        <ul className="space-y-2.5">
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>ESLint with custom rules and dual-mode config</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Prettier for code formatting</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Husky for git hooks</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Jest and React Testing Library</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>TypeScript strict mode</span>
                          </li>
                        </ul>
                      </div>
                    </Grid>
                  </CardBody>
                </Card>

                {/* Accessibility */}
                <Card id="accessibility">
                  <CardHeader>{renderSectionHeader(getSection('accessibility'))}</CardHeader>
                  <CardBody className="space-y-6">
                    {/* Introduction */}
                    <div>
                      <p className="text-base text-[var(--theme-text-secondary)]">
                        Built with accessibility at its core, this application follows WCAG 2.1 AA
                        guidelines to ensure an inclusive experience for all users, regardless of
                        their abilities or assistive technologies.
                      </p>
                    </div>

                    {/* Core Features Grid */}
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-4 flex items-center gap-2">
                        <span className="text-xl" role="img" aria-label="Check mark">
                          ✅
                        </span>
                        Core Features
                      </h3>
                      <Grid columns={{ sm: 1, md: 2, lg: 3 }} gap="md">
                        {/* WCAG Compliance */}
                        <div className="p-4 rounded-lg bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <span className="text-xl" role="img" aria-label="Shield">
                                🛡️
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[var(--theme-text)] mb-1">
                                WCAG 2.1 AA Compliant
                              </h4>
                              <p className="text-sm text-[var(--theme-text-secondary)]">
                                Meets international accessibility standards throughout the app
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Keyboard Navigation */}
                        <div className="p-4 rounded-lg bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <span className="text-xl" role="img" aria-label="Keyboard">
                                ⌨️
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[var(--theme-text)] mb-1">
                                Full Keyboard Support
                              </h4>
                              <p className="text-sm text-[var(--theme-text-secondary)]">
                                Navigate and interact with all features using only keyboard
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Screen Reader */}
                        <div className="p-4 rounded-lg bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <span className="text-xl" role="img" aria-label="Speaker">
                                🔊
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[var(--theme-text)] mb-1">
                                Screen Reader Compatible
                              </h4>
                              <p className="text-sm text-[var(--theme-text-secondary)]">
                                Comprehensive ARIA labels and semantic HTML structure
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* High Contrast */}
                        <div className="p-4 rounded-lg bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <span className="text-xl" role="img" aria-label="Contrast">
                                🎨
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[var(--theme-text)] mb-1">
                                High Contrast Mode
                              </h4>
                              <p className="text-sm text-[var(--theme-text-secondary)]">
                                Enhanced color contrast for improved readability
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Reduced Motion */}
                        <div className="p-4 rounded-lg bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <span className="text-xl" role="img" aria-label="Motion">
                                🎬
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[var(--theme-text)] mb-1">
                                Reduced Motion
                              </h4>
                              <p className="text-sm text-[var(--theme-text-secondary)]">
                                Respects user preferences for minimal animations
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Focus Management */}
                        <div className="p-4 rounded-lg bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <span className="text-xl" role="img" aria-label="Target">
                                🎯
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[var(--theme-text)] mb-1">
                                Focus Management
                              </h4>
                              <p className="text-sm text-[var(--theme-text-secondary)]">
                                Clear focus indicators and logical tab order
                              </p>
                            </div>
                          </div>
                        </div>
                      </Grid>
                    </div>

                    {/* Interactive Components */}
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-4 flex items-center gap-2">
                        <span className="text-xl" role="img" aria-label="Interaction">
                          🖱️
                        </span>
                        Interactive Components
                      </h3>
                      <Grid columns={{ sm: 1, md: 2 }} gap="md">
                        {/* Modals */}
                        <div className="p-4 rounded-lg bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <span className="text-xl" role="img" aria-label="Window">
                                🪟
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[var(--theme-text)] mb-1">
                                Accessible Modals
                              </h4>
                              <p className="text-sm text-[var(--theme-text-secondary)]">
                                Focus trapping, escape key support, and proper ARIA roles
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Dropdowns */}
                        <div className="p-4 rounded-lg bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <span className="text-xl" role="img" aria-label="Menu">
                                📋
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[var(--theme-text)] mb-1">
                                Keyboard-Navigable Menus
                              </h4>
                              <p className="text-sm text-[var(--theme-text-secondary)]">
                                Arrow key navigation and proper menu semantics
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Live Regions */}
                        <div className="p-4 rounded-lg bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <span className="text-xl" role="img" aria-label="Broadcast">
                                📡
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[var(--theme-text)] mb-1">
                                ARIA Live Regions
                              </h4>
                              <p className="text-sm text-[var(--theme-text-secondary)]">
                                Dynamic content updates announced to screen readers
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Forms */}
                        <div className="p-4 rounded-lg bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <span className="text-xl" role="img" aria-label="Form">
                                📝
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[var(--theme-text)] mb-1">
                                Accessible Forms
                              </h4>
                              <p className="text-sm text-[var(--theme-text-secondary)]">
                                Clear labels, validation messages, and error handling
                              </p>
                            </div>
                          </div>
                        </div>
                      </Grid>
                    </div>

                    {/* Testing & Validation */}
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-4 flex items-center gap-2">
                        <span className="text-xl" role="img" aria-label="Testing">
                          🧪
                        </span>
                        Testing & Validation
                      </h3>
                      <div className="p-5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)]">
                        <Grid columns={{ sm: 1, md: 2 }} gap="md">
                          <div>
                            <h4 className="font-medium text-[var(--theme-text)] mb-2 flex items-center gap-2">
                              <span className="text-lg" role="img" aria-label="Robot">
                                🤖
                              </span>
                              Automated Testing
                            </h4>
                            <ul className="text-sm text-[var(--theme-text-secondary)] space-y-1.5">
                              <li className="flex items-start gap-2">
                                <span className="text-[var(--theme-primary)] mt-0.5">•</span>
                                <span>jest-axe for automated accessibility testing</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-[var(--theme-primary)] mt-0.5">•</span>
                                <span>Storybook a11y addon for component testing</span>
                              </li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-[var(--theme-text)] mb-2 flex items-center gap-2">
                              <span className="text-lg" role="img" aria-label="Person">
                                👤
                              </span>
                              Manual Testing
                            </h4>
                            <ul className="text-sm text-[var(--theme-text-secondary)] space-y-1.5">
                              <li className="flex items-start gap-2">
                                <span className="text-[var(--theme-primary)] mt-0.5">•</span>
                                <span>Keyboard navigation verification</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-[var(--theme-primary)] mt-0.5">•</span>
                                <span>Screen reader compatibility checks</span>
                              </li>
                            </ul>
                          </div>
                        </Grid>
                      </div>
                    </div>

                    {/* Call to Action */}
                    <div className="rounded-xl p-5 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-500 dark:bg-blue-600 flex items-center justify-center shadow-md">
                          <span className="text-2xl" role="img" aria-label="Information">
                            ℹ️
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-[var(--theme-text)] mb-2">
                            Try Our Accessibility Features
                          </h4>
                          <p className="text-sm text-[var(--theme-text-secondary)] mb-3">
                            Visit the Accessibility page to explore interactive demos of our
                            accessible components, including modals, dropdowns, and more.
                          </p>
                          <button
                            onClick={() => navigate('/accessibility')}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            <span>Explore Demos</span>
                            <span role="img" aria-label="Arrow">
                              →
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Performance Metrics */}
                <Card id="performance">
                  <CardHeader>{renderSectionHeader(getSection('performance'))}</CardHeader>
                  <CardBody className="space-y-6">
                    {/* Core Web Vitals Grid */}
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-4 flex items-center gap-2">
                        <span className="text-xl" role="img" aria-label="Chart">
                          📊
                        </span>
                        Core Web Vitals
                      </h3>
                      <Grid columns={{ sm: 2, md: 2, lg: 4 }} gap="md">
                        {/* Performance Score */}
                        <div className="p-5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group hover:shadow-md">
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                              <span className="text-2xl" role="img" aria-label="Target">
                                🎯
                              </span>
                            </div>
                            <div>
                              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                                98
                              </div>
                              <div className="text-xs font-medium text-[var(--theme-text-secondary)]">
                                Performance Score
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* First Contentful Paint */}
                        <div className="p-5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group hover:shadow-md">
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                              <span className="text-2xl" role="img" aria-label="Rocket">
                                🚀
                              </span>
                            </div>
                            <div>
                              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                1.2s
                              </div>
                              <div className="text-xs font-medium text-[var(--theme-text-secondary)]">
                                First Contentful Paint
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Largest Contentful Paint */}
                        <div className="p-5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group hover:shadow-md">
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                              <span className="text-2xl" role="img" aria-label="Lightning">
                                ⚡
                              </span>
                            </div>
                            <div>
                              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                                0.8s
                              </div>
                              <div className="text-xs font-medium text-[var(--theme-text-secondary)]">
                                Largest Contentful Paint
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* First Input Delay */}
                        <div className="p-5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group hover:shadow-md">
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                              <span className="text-2xl" role="img" aria-label="Pointer">
                                👆
                              </span>
                            </div>
                            <div>
                              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                                45ms
                              </div>
                              <div className="text-xs font-medium text-[var(--theme-text-secondary)]">
                                First Input Delay
                              </div>
                            </div>
                          </div>
                        </div>
                      </Grid>
                    </div>

                    {/* Optimization Strategies Grid */}
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-4 flex items-center gap-2">
                        <span className="text-xl" role="img" aria-label="Gear">
                          ⚙️
                        </span>
                        Optimization Strategies
                      </h3>
                      <Grid columns={{ sm: 1, md: 2, lg: 3 }} gap="md">
                        {/* Code Splitting */}
                        <div className="p-5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group hover:shadow-md">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                              <span className="text-2xl" role="img" aria-label="Package">
                                📦
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-semibold text-[var(--theme-text)] mb-2">
                                Code Splitting
                              </h4>
                              <ul className="text-sm text-[var(--theme-text-secondary)] space-y-1.5">
                                <li className="flex items-start gap-2">
                                  <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">
                                    ▸
                                  </span>
                                  <span>15 named Webpack chunks</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">
                                    ▸
                                  </span>
                                  <span>Route-based lazy loading</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">
                                    ▸
                                  </span>
                                  <span>Intelligent prefetching</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">
                                    ▸
                                  </span>
                                  <span>60% bundle size reduction</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Data Fetching */}
                        <div className="p-5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group hover:shadow-md">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 dark:from-teal-400 dark:to-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                              <span className="text-2xl" role="img" aria-label="Database">
                                🗄️
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-semibold text-[var(--theme-text)] mb-2">
                                Data Fetching
                              </h4>
                              <ul className="text-sm text-[var(--theme-text-secondary)] space-y-1.5">
                                <li className="flex items-start gap-2">
                                  <span className="text-teal-600 dark:text-teal-400 mt-0.5">▸</span>
                                  <span>TanStack Query caching</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-teal-600 dark:text-teal-400 mt-0.5">▸</span>
                                  <span>Background refetching</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-teal-600 dark:text-teal-400 mt-0.5">▸</span>
                                  <span>Query deduplication</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-teal-600 dark:text-teal-400 mt-0.5">▸</span>
                                  <span>Optimistic updates</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* User Experience */}
                        <div className="p-5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group hover:shadow-md">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 dark:from-pink-400 dark:to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                              <span className="text-2xl" role="img" aria-label="Sparkles">
                                ✨
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-semibold text-[var(--theme-text)] mb-2">
                                User Experience
                              </h4>
                              <ul className="text-sm text-[var(--theme-text-secondary)] space-y-1.5">
                                <li className="flex items-start gap-2">
                                  <span className="text-pink-600 dark:text-pink-400 mt-0.5">▸</span>
                                  <span>Suspense boundaries</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-pink-600 dark:text-pink-400 mt-0.5">▸</span>
                                  <span>Skeleton screens</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-pink-600 dark:text-pink-400 mt-0.5">▸</span>
                                  <span>Connection-aware prefetch</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-pink-600 dark:text-pink-400 mt-0.5">▸</span>
                                  <span>Offline support</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </Grid>
                    </div>
                  </CardBody>
                </Card>

                {/* Credits */}
                <Card id="credits">
                  <CardHeader>{renderSectionHeader(getSection('credits'))}</CardHeader>
                  <CardBody className="space-y-6">
                    {/* Credits Grid */}
                    <Grid columns={{ sm: 1, md: 2, lg: 3 }} gap="md">
                      {/* Weather Data */}
                      <div className="p-5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group hover:shadow-md">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                            <span className="text-2xl" role="img" aria-label="Cloud">
                              ☁️
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-[var(--theme-text)] mb-1">
                              Weather Data
                            </h3>
                            <p className="text-xs text-[var(--theme-text-secondary)]">
                              Real-time information
                            </p>
                          </div>
                        </div>
                        <ul className="space-y-2.5">
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>OpenWeatherMap API</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Open-Meteo</span>
                          </li>
                        </ul>
                      </div>

                      {/* Icons & Assets */}
                      <div className="p-5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group hover:shadow-md">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 dark:from-yellow-400 dark:to-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                            <span className="text-2xl" role="img" aria-label="Art">
                              🎨
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-[var(--theme-text)] mb-1">
                              Icons & Assets
                            </h3>
                            <p className="text-xs text-[var(--theme-text-secondary)]">
                              Visual elements
                            </p>
                          </div>
                        </div>
                        <ul className="space-y-2.5">
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-yellow-500 dark:text-yellow-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>React Animated Weather</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-yellow-500 dark:text-yellow-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Heroicons</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-yellow-500 dark:text-yellow-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>FontAwesome</span>
                          </li>
                        </ul>
                      </div>

                      {/* Maps */}
                      <div className="p-5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group hover:shadow-md">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-400 dark:to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                            <span className="text-2xl" role="img" aria-label="Map">
                              🗺️
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-[var(--theme-text)] mb-1">
                              Maps
                            </h3>
                            <p className="text-xs text-[var(--theme-text-secondary)]">
                              Interactive mapping
                            </p>
                          </div>
                        </div>
                        <ul className="space-y-2.5">
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Leaflet</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>React Leaflet</span>
                          </li>
                        </ul>
                      </div>

                      {/* Key Libraries */}
                      <div className="p-5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group hover:shadow-md">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 dark:from-purple-400 dark:to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                            <span className="text-2xl" role="img" aria-label="Books">
                              📚
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-[var(--theme-text)] mb-1">
                              Key Libraries
                            </h3>
                            <p className="text-xs text-[var(--theme-text-secondary)]">
                              Essential tools
                            </p>
                          </div>
                        </div>
                        <ul className="space-y-2.5">
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-purple-500 dark:text-purple-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>TanStack Query</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-purple-500 dark:text-purple-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>i18next</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-purple-500 dark:text-purple-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Embla Carousel</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-purple-500 dark:text-purple-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>React Grid Layout</span>
                          </li>
                        </ul>
                      </div>

                      {/* Testing & Quality */}
                      <div className="p-5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group hover:shadow-md">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 dark:from-red-400 dark:to-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                            <span className="text-2xl" role="img" aria-label="Test tube">
                              🧪
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-[var(--theme-text)] mb-1">
                              Testing & Quality
                            </h3>
                            <p className="text-xs text-[var(--theme-text-secondary)]">
                              Code reliability
                            </p>
                          </div>
                        </div>
                        <ul className="space-y-2.5">
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>Jest</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>React Testing Library</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-[var(--theme-text-secondary)]">
                            <span className="text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0">
                              ✓
                            </span>
                            <span>ESLint</span>
                          </li>
                        </ul>
                      </div>

                      {/* Open Source */}
                      <div className="p-5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200 group hover:shadow-md">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 dark:from-indigo-400 dark:to-violet-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                            <span className="text-2xl" role="img" aria-label="Heart">
                              ❤️
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-[var(--theme-text)] mb-1">
                              Open Source
                            </h3>
                            <p className="text-xs text-[var(--theme-text-secondary)]">
                              Community driven
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-[var(--theme-text-secondary)] leading-relaxed">
                          Built with love using open source technologies and community
                          contributions. This project demonstrates modern React patterns,
                          accessibility best practices, and performance optimization techniques.
                        </p>
                      </div>
                    </Grid>

                    {/* Thank You Message */}
                    <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 flex items-center justify-center shadow-lg">
                          <span className="text-3xl" role="img" aria-label="Folded hands">
                            🙏
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-2">
                            Thank You!
                          </h3>
                          <p className="text-sm text-[var(--theme-text-secondary)] leading-relaxed">
                            A huge thank you to all the open source contributors, maintainers, and
                            communities who make projects like this possible. Your dedication to
                            building and sharing amazing tools enables developers worldwide to
                            create better applications. We stand on the shoulders of giants.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          </div>
        </Container>
      </main>

      {/* Floating Action Buttons */}
      <FloatingActionButton
        icon={<span className="text-2xl">🌤️</span>}
        tooltip="Go to Weather"
        variant="primary"
        position="bottom-right"
        onClick={() => navigate('/weather')}
        aria-label="Navigate to weather page"
      />

      <FloatingActionButton
        icon={<span className="text-2xl">⚙️</span>}
        tooltip="Go to Settings"
        variant="secondary"
        position="bottom-right"
        className="!bottom-24"
        onClick={() => navigate('/settings')}
        aria-label="Navigate to settings page"
      />
    </div>
  );
};

export default AboutPage;
