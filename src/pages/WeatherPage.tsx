import React from 'react';
import { useNavigate } from 'react-router-dom';

import MainHeader from '@/components/headers/MainHeader';
import { Button } from '@/components/ui/atoms';
import { Container } from '@/components/ui/layout';
import Forecast from '@/components/weather/Forecast';
import { useLanguage } from '@/i18n/hooks/useLanguage';

/**
 * Weather page component - focused weather interface
 */
const WeatherPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MainHeader
        title="Meteo"
        subtitle="Current weather and forecast"
        showSubtitle={true}
        variant="compact"
        currentLanguage={currentLanguage}
        supportedLanguages={supportedLanguages}
        changeLanguage={changeLanguage}
      />

      {/* Main Content */}
      <main className="py-6">
        <Container size="lg">
          <Forecast />
        </Container>
      </main>

      {/* Quick Actions */}
      <div className="fixed bottom-6 right-6">
        <div className="flex flex-col space-y-2">
          <Button
            onClick={() => {
              void navigate('/weather/dashboard');
            }}
            variant="primary"
            size="sm"
            className="shadow-lg"
          >
            📊 Dashboard
          </Button>
          <Button
            onClick={() => {
              void navigate('/settings');
            }}
            variant="secondary"
            size="sm"
            className="shadow-lg"
          >
            ⚙️ Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WeatherPage;
