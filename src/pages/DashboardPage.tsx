import React from 'react';
import { Link } from 'react-router-dom';

import MainHeader from '@/components/headers/MainHeader';
import { DashboardSuspense } from '@/components/ui';
import { Button } from '@/components/ui/atoms';
import { Container } from '@/components/ui/layout';
import { useLanguage } from '@/i18n/hooks/useLanguage';

// Chunk-optimized lazy-loaded dashboard components
import { CustomizableDashboard, DashboardControls } from '@/components/lazy/chunkOptimizedIndex';

/**
 * Dashboard page component - comprehensive weather dashboard
 */
const DashboardPage: React.FC = () => {
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();
  // Mock weather data for dashboard
  const mockWeatherData = {
    temperature: 22,
    humidity: 65,
    pressure: 1013.25,
    windSpeed: 10,
    windDirection: 180,
    uvIndex: 5,
    visibility: 10,
    city: 'Dashboard City',
    country: 'Demo Country',
    latitude: 40.7128,
    longitude: -74.006,
    airQuality: {
      aqi: 50,
      pm25: 12,
      pm10: 20,
      o3: 80,
      no2: 25,
      so2: 5,
      co: 0.5,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MainHeader
        title="Weather Dashboard"
        subtitle="Comprehensive weather analytics and controls"
        showSubtitle={true}
        variant="compact"
        currentLanguage={currentLanguage}
        supportedLanguages={supportedLanguages}
        changeLanguage={changeLanguage}
      />

      {/* Main Content */}
      <main className="py-6">
        <Container size="lg">
          <div className="space-y-6">
            {/* Dashboard Controls */}
            <DashboardSuspense>
              <DashboardControls className="mb-6" />
            </DashboardSuspense>

            {/* Customizable Dashboard */}
            <DashboardSuspense>
              <CustomizableDashboard
                weather={mockWeatherData}
                getLocalizedTemperature={temp => `${temp}°C`}
                getLocalizedWeatherDescription={code => `Weather ${code}`}
                temperatureUnit="C"
              />
            </DashboardSuspense>
          </div>
        </Container>
      </main>

      {/* Quick Actions */}
      <div className="fixed bottom-6 right-6">
        <div className="flex flex-col space-y-2">
          <Link to="/showcase">
            <Button variant="secondary" size="sm" className="shadow-lg">
              🎨 Showcase
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
