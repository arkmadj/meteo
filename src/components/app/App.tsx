import '@fortawesome/fontawesome-free/css/all.min.css';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import AppHeader from '@/components/headers/AppHeader';
import LanguageSelector from '@/components/language/LanguageSelector';
import { LoadingWithSkeleton, WeatherLiveRegion } from '@/components/ui';
import { Container, Grid } from '@/components/ui/layout';
import ErrorBoundary from '@/components/utilities/ErrorBoundary';
import ErrorDisplay from '@/components/utilities/ErrorDisplay';
import SplashScreen from '@/components/utilities/SplashScreen';
import Forecast from '@/components/weather/Forecast';
import { DashboardLayoutProvider } from '@/contexts/DashboardLayoutContext';
import { useErrors } from '@/contexts/ErrorContext';
import '@/i18n/config';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import '@/styles/embla-carousel.css';

import { BORDER_RADIUS, SHADOWS, SPACING } from '@/design-system/tokens';
import {
  useWeatherActions,
  useWeatherEffects,
  useWeatherFormatting,
  useWeatherState,
} from '@/hooks/app';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import { useCompleteWeatherQuery } from '@/hooks/useWeatherQuery';

const App = () => {
  const { t } = useTranslation(['common', 'weather', 'errors']);
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();
  const errors = useErrors();

  // Custom hooks for weather functionality
  const weatherState = useWeatherState();
  const weatherFormatting = useWeatherFormatting();
  const weatherActions = useWeatherActions(weatherState);

  // React Query hooks
  const weatherQuery = useCompleteWeatherQuery(weatherState.searchQuery, 7, {
    enabled: !!weatherState.searchQuery,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Handle side effects with ARIA announcements
  const { announcement, clearAnnouncement } = useWeatherEffects(weatherState, weatherQuery);

  // Handle selection from Favorites Drawer
  const handleSelectFavoriteLocation = (location: string) => {
    weatherState.setQuery(location);
    weatherState.setSearchQuery(location);
    weatherState.setError(null);
  };

  // Memoized values for performance
  const memoizedWeather = useMemo(() => weatherState.weather, [weatherState.weather]);
  const memoizedLoading = useMemo(() => weatherState.loading, [weatherState.loading]);
  const memoizedError = useMemo(() => weatherState.error, [weatherState.error]);

  // Splash screen management
  const isAppReady = !memoizedLoading && (!!memoizedWeather || !!memoizedError);
  const { showSplash } = useSplashScreen({
    minDuration: 2000,
    maxDuration: 5000,
    isAppReady,
    enabled: true,
  });

  return (
    <>
      {/* Splash Screen */}
      <SplashScreen show={showSplash} minDuration={2000} />

      {/*
        Centralized ARIA Live Region for Weather Updates
        Prevents redundant announcements by using a single, managed live region
        that handles debouncing, deduplication, and proper politeness levels
      */}
      <WeatherLiveRegion
        announcement={announcement}
        onAnnouncementProcessed={clearAnnouncement}
        announcementDuration={5000}
        id="weather-announcements"
      />

      {/* Main App */}
      <DashboardLayoutProvider>
        <div className="min-h-screen relative w-[min(100%-2rem,72rem)] mx-auto">
          {/* App Header */}
          <AppHeader
            changeLanguage={changeLanguage}
            currentLanguage={currentLanguage}
            query={weatherState.query}
            search={weatherActions.handleSearch}
            searchLoading={memoizedLoading}
            setQuery={weatherState.setQuery}
            showSubtitle={false}
            showThemeToggle={true}
            sticky={true}
            supportedLanguages={supportedLanguages}
            variant="compact"
            weather={weatherState.weather}
            onSelectFavoriteLocation={handleSelectFavoriteLocation}
          />

          {/* Main Content */}
          <Container className="flex-1 py-8" size="full">
            <ErrorBoundary>
              <main
                className={`backdrop-blur-sm rounded-[${BORDER_RADIUS.xl}] shadow-[${SHADOWS.xl}] p-[${SPACING[6]}] sm:p-[${SPACING[8]}] mb-6`}
              >
                {/*
                  Visual offline indicator - removed aria-live since announcements
                  are now handled by the centralized WeatherLiveRegion
                */}
                {weatherState.offline && (
                  <div
                    className="mb-4 rounded-md border border-amber-500/70 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 dark:border-amber-400/50 dark:bg-amber-950/40 dark:text-amber-200"
                    role="status"
                  >
                    {t('common:status.offline')}
                  </div>
                )}
                <Grid className="w-full" gap="lg">
                  {/* Error Display */}
                  {errors.length > 0 && (
                    <div>
                      <ErrorDisplay
                        error={errors?.[0]}
                        onDismiss={() => weatherState.setError(null)}
                        onRetry={weatherActions.handleRefresh}
                      />
                    </div>
                  )}

                  {/* Weather Content */}
                  <div className="w-[min(100%,72rem)]">
                    {memoizedLoading && !memoizedError && true && (
                      <LoadingWithSkeleton
                        message={t('common:loading')}
                        showSkeleton={true}
                        variant="weather"
                      />
                    )}

                    {!memoizedLoading && !memoizedError && memoizedWeather && (
                      <Forecast
                        formatWeekday={weatherFormatting.formatWeekday}
                        getLocalizedTemperature={(temp: number) =>
                          weatherFormatting.getLocalizedTemperature(temp, weatherState.isCelsius)
                        }
                        getLocalizedWeatherDescription={
                          weatherFormatting.getLocalizedWeatherDescription
                        }
                        temperatureUnit={weatherState.temperatureUnit}
                        toggleTemperatureUnit={weatherActions.toggleTemperatureUnit}
                        weather={memoizedWeather}
                      />
                    )}
                  </div>

                  {/* Additional Language Selector (Optional) */}
                  <div className="text-center w-[min(100%,72rem)]">
                    <LanguageSelector
                      changeLanguage={changeLanguage}
                      currentLanguage={currentLanguage}
                      showFlags={true}
                      showNativeNames={true}
                      size="md"
                      supportedLanguages={supportedLanguages}
                      variant="toggle"
                    />
                  </div>
                </Grid>
              </main>
            </ErrorBoundary>

            <footer className="mt-8 text-center w-[min(100%-2rem,72rem)] mx-auto pt-6 border-t border-[var(--theme-border)]">
              <p className="text-sm text-[var(--theme-text-secondary)]">{t('common:footer')}</p>
            </footer>
          </Container>
        </div>
      </DashboardLayoutProvider>
    </>
  );
};

App.displayName = 'App';

export default App;
