import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import LanguageSelector from '@/components/language/LanguageSelector';
import { Button } from '@/components/ui/atoms';
import { Container } from '@/components/ui/layout';
import ThemeToggle from '@/components/ui/preferences/ThemeToggle';
import { useTheme } from '@/design-system/theme';
import { useLanguage } from '@/i18n/hooks/useLanguage';

/**
 * 404 Not Found page component with full theme-aware support
 * Aligns with the app's global design system and ensures proper color contrast
 * in all themes (light, dark, and high-contrast modes)
 * Includes language selector for easy language switching from the error screen
 */
const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { currentLanguage, changeLanguage, supportedLanguages: languages } = useLanguage();

  const goBack = () => {
    if (window.history.length > 1) {
      void navigate(-1);
    } else {
      void navigate('/');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative transition-colors duration-200"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
      }}
    >
      {/* Theme Toggle & Language Selector - Fixed in top-right corner */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        <LanguageSelector
          changeLanguage={changeLanguage}
          currentLanguage={currentLanguage}
          supportedLanguages={languages}
          variant="compact"
        />
        <ThemeToggle variant="compact" showTooltip={true} />
      </div>

      <Container size="md">
        <div className="text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div
              className="text-9xl font-bold mb-4 transition-colors duration-200"
              style={{
                color: theme.isDark ? theme.colors.neutral[600] : theme.colors.neutral[300],
              }}
            >
              404
            </div>
            <div className="text-6xl mb-4">🌩️</div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h1
              className="text-3xl font-bold mb-4 transition-colors duration-200"
              style={{ color: theme.textColor }}
            >
              Oops! Page Not Found
            </h1>
            <p
              className="text-lg mb-2 transition-colors duration-200"
              style={{ color: theme.textSecondaryColor }}
            >
              The page you're looking for seems to have drifted away like a cloud.
            </p>
            <p
              className="transition-colors duration-200"
              style={{ color: theme.textSecondaryColor }}
            >
              It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center mb-8 px-4 sm:px-0">
            {/* Primary Action - Go Home */}
            <Link to="/" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                startIcon={<span className="text-xl">🏠</span>}
                className="font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
              >
                Go Home
              </Button>
            </Link>

            {/* Secondary Action - Go Back */}
            <Button
              variant="outline"
              size="lg"
              onClick={goBack}
              fullWidth
              startIcon={<ArrowLeftIcon className="h-5 w-5" />}
              className="font-medium hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              Go Back
            </Button>

            {/* Tertiary Action - Check Weather */}
            <Link to="/weather" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                fullWidth
                startIcon={<span className="text-xl">🌤️</span>}
                className="font-medium hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                Check Weather
              </Button>
            </Link>
          </div>

          {/* Helpful Links */}
          <div
            className="rounded-lg p-6 shadow-sm border transition-colors duration-200"
            style={{
              backgroundColor: theme.surfaceColor,
              borderColor: theme.isDark ? theme.colors.neutral[700] : theme.colors.neutral[200],
            }}
          >
            <h2
              className="text-lg font-semibold mb-4 transition-colors duration-200"
              style={{ color: theme.textColor }}
            >
              Maybe you were looking for:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Weather Link */}
              <Link
                to="/weather"
                className="p-3 rounded-lg transition-all duration-200 text-center hover:shadow-md hover:-translate-y-0.5"
                style={{
                  backgroundColor: theme.isDark
                    ? `rgba(${theme.colors.primary[400]
                        .slice(1)
                        .match(/.{1,2}/g)
                        ?.map(x => parseInt(x, 16))
                        .join(', ')}, 0.15)`
                    : theme.colors.primary[50],
                  color: theme.isDark ? theme.colors.primary[300] : theme.colors.primary[900],
                }}
              >
                <div className="text-2xl mb-1">🌤️</div>
                <div className="text-sm font-medium">Weather</div>
              </Link>

              {/* Dashboard Link */}
              <Link
                to="/weather/dashboard"
                className="p-3 rounded-lg transition-all duration-200 text-center hover:shadow-md hover:-translate-y-0.5"
                style={{
                  backgroundColor: theme.isDark ? `rgba(16, 185, 129, 0.15)` : '#ecfdf5',
                  color: theme.isDark ? '#86efac' : '#065f46',
                }}
              >
                <div className="text-2xl mb-1">📊</div>
                <div className="text-sm font-medium">Dashboard</div>
              </Link>

              {/* Settings Link */}
              <Link
                to="/settings"
                className="p-3 rounded-lg transition-all duration-200 text-center hover:shadow-md hover:-translate-y-0.5"
                style={{
                  backgroundColor: theme.isDark
                    ? theme.colors.neutral[700]
                    : theme.colors.neutral[100],
                  color: theme.textColor,
                }}
              >
                <div className="text-2xl mb-1">⚙️</div>
                <div className="text-sm font-medium">Settings</div>
              </Link>
            </div>
          </div>

          {/* Development Links (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div
              className="mt-6 rounded-lg p-6 shadow-sm border transition-colors duration-200"
              style={{
                backgroundColor: theme.surfaceColor,
                borderColor: theme.isDark
                  ? theme.colors.semantic.warning[600]
                  : theme.colors.semantic.warning[300],
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-2xl">🚧</span>
                <h3
                  className="text-lg font-semibold transition-colors duration-200"
                  style={{ color: theme.textColor }}
                >
                  Development Tools
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Accessibility */}
                <Link
                  to="/accessibility"
                  className="group p-4 rounded-lg transition-all duration-200 text-center hover:shadow-md hover:-translate-y-0.5"
                  style={{
                    backgroundColor: theme.isDark ? `rgba(20, 184, 166, 0.15)` : '#ccfbf1',
                    color: theme.isDark ? '#67e8f9' : '#134e4a',
                  }}
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
                    ♿
                  </div>
                  <div className="text-sm font-medium">Accessibility</div>
                  <div className="text-xs mt-1" style={{ opacity: 0.8 }}>
                    A11y Testing
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* Footer */}
          <div
            className="mt-8 text-sm transition-colors duration-200"
            style={{ color: theme.textSecondaryColor }}
          >
            <p>
              If you believe this is an error, please{' '}
              <Link
                to="/about"
                className="underline transition-colors duration-200 hover:opacity-80"
                style={{
                  color: theme.isDark ? theme.colors.primary[300] : theme.colors.primary[700],
                }}
              >
                contact us
              </Link>{' '}
              or try refreshing the page.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default NotFoundPage;
