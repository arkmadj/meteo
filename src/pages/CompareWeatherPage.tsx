/**
 * CompareWeatherPage Component
 * Allows users to compare weather conditions across multiple cities side-by-side.
 */

import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import MainHeader from '@/components/headers/MainHeader';
import { Button } from '@/components/ui/atoms';
import { Container, Grid } from '@/components/ui/layout';
import ComparisonCityCard from '@/components/weather-compare/ComparisonCityCard';
import ComparisonEmptySlot from '@/components/weather-compare/ComparisonEmptySlot';
import { useWeatherFormatting } from '@/hooks/app';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useLanguage } from '@/i18n/hooks/useLanguage';

// Types for comparison cities
interface ComparisonCity {
  id: string;
  name: string;
  query: string;
}

// Maximum number of cities to compare
const MAX_COMPARISON_CITIES = 4;

// Generate unique ID for each city slot
const generateId = () => Math.random().toString(36).substring(2, 9);

/**
 * CompareWeatherPage - Main page component for weather comparison feature
 */
const CompareWeatherPage: React.FC = () => {
  const { t } = useTranslation(['common', 'weather']);
  const weatherFormatting = useWeatherFormatting();
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();
  const breakpoint = useBreakpoint();

  // Temperature unit state
  const [isCelsius, setIsCelsius] = useState(true);
  const temperatureUnit = isCelsius ? 'C' : 'F';

  // Determine if we're on mobile or tablet
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';

  const toggleTemperatureUnit = useCallback(() => {
    setIsCelsius(prev => !prev);
  }, []);

  const getLocalizedTemperature = useCallback(
    (temp: number) => weatherFormatting.getLocalizedTemperature(temp, isCelsius),
    [weatherFormatting, isCelsius]
  );

  // State for cities to compare
  const [cities, setCities] = useState<ComparisonCity[]>([
    { id: generateId(), name: '', query: '' },
    { id: generateId(), name: '', query: '' },
  ]);

  // Add a new city slot for comparison
  const handleAddCity = useCallback(() => {
    if (cities.length >= MAX_COMPARISON_CITIES) return;
    setCities(prev => [...prev, { id: generateId(), name: '', query: '' }]);
  }, [cities.length]);

  // Remove a city from comparison
  const handleRemoveCity = useCallback((id: string) => {
    setCities(prev => {
      // Keep at least 2 cities for comparison
      if (prev.length <= 2) return prev;
      return prev.filter(city => city.id !== id);
    });
  }, []);

  // Update a city's query when user selects from search
  const handleCitySelect = useCallback((id: string, name: string, query: string) => {
    setCities(prev => prev.map(city => (city.id === id ? { ...city, name, query } : city)));
  }, []);

  // Clear a specific city slot
  const handleClearCity = useCallback((id: string) => {
    setCities(prev => prev.map(city => (city.id === id ? { ...city, name: '', query: '' } : city)));
  }, []);

  // Check if we can add more cities
  const canAddMoreCities = cities.length < MAX_COMPARISON_CITIES;

  // Count active cities (those with queries)
  const activeCitiesCount = cities.filter(c => c.query).length;

  return (
    <div
      className="min-h-screen transition-colors duration-200"
      style={{ backgroundColor: 'var(--theme-background)' }}
    >
      {/* Header */}
      <MainHeader
        sticky={true}
        variant="compact"
        currentLanguage={currentLanguage}
        supportedLanguages={supportedLanguages}
        changeLanguage={changeLanguage}
      />

      {/* Main Content */}
      <main className="py-6">
        <Container size="lg">
          {/* Page Title and Description */}
          <div className="mb-6 px-4">
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--theme-text)] mb-2">
              {t('common:navigation.compare', 'Compare Weather')}
            </h1>
            <p className="text-sm md:text-base text-[var(--theme-text-secondary)]">
              {t('weather:compare.subtitle', 'Compare weather conditions across multiple cities')}
            </p>
          </div>

          {/* Action Bar */}
          <div
            className={`flex mb-6 px-4 ${
              isMobile
                ? 'flex-col gap-4'
                : isTablet
                  ? 'flex-col gap-3'
                  : 'items-center justify-between'
            }`}
          >
            <div className="flex items-center gap-4">
              <h2
                className={`${
                  isMobile ? 'text-base' : 'text-lg'
                } font-semibold text-[var(--theme-text)]`}
              >
                {activeCitiesCount > 0
                  ? t('weather:compare.comparing', 'Comparing {{count}} cities', {
                      count: activeCitiesCount,
                    })
                  : t('weather:compare.selectCities', 'Select cities to compare')}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {/* Temperature Unit Toggle */}
              <Button
                variant="outline"
                size={isMobile ? 'xs' : 'sm'}
                onClick={toggleTemperatureUnit}
              >
                °{temperatureUnit}
              </Button>

              {/* Add City Button */}
              {canAddMoreCities && (
                <Button variant="primary" size={isMobile ? 'xs' : 'sm'} onClick={handleAddCity}>
                  {isMobile ? '+' : '+'} {!isMobile && t('weather:compare.addCity', 'Add City')}
                </Button>
              )}
            </div>
          </div>

          {/* Comparison Grid */}
          <Grid
            className={`gap-4 ${isMobile ? 'px-2' : 'px-4'}`}
            templateColumns={
              isMobile
                ? '1fr'
                : isTablet
                  ? 'repeat(auto-fit, minmax(280px, 1fr))'
                  : `repeat(${Math.min(cities.length, 2)}, minmax(280px, 1fr))`
            }
          >
            {cities.map(city =>
              city.query ? (
                <ComparisonCityCard
                  key={city.id}
                  cityId={city.id}
                  cityName={city.name}
                  query={city.query}
                  temperatureUnit={temperatureUnit}
                  getLocalizedTemperature={getLocalizedTemperature}
                  onRemove={handleRemoveCity}
                  onClear={handleClearCity}
                  canRemove={cities.length > 2}
                />
              ) : (
                <ComparisonEmptySlot
                  key={city.id}
                  cityId={city.id}
                  onCitySelect={handleCitySelect}
                  onRemove={handleRemoveCity}
                  canRemove={cities.length > 2}
                />
              )
            )}
          </Grid>
        </Container>
      </main>
    </div>
  );
};

export default CompareWeatherPage;
