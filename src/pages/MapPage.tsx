import React from 'react';
import { useTranslation } from 'react-i18next';

import { MainHeader } from '@/components/headers';
import { LazyBaseWeatherMap } from '@/components/maps/LazyMap';
import { useLanguage } from '@/i18n/hooks/useLanguage';

/**
 * Full-screen Map Page
 * Displays an interactive map with zoom, pan, and geolocation support
 */
const MapPage: React.FC = () => {
  const { t } = useTranslation('common');
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <MainHeader
        sticky={true}
        variant="compact"
        currentLanguage={currentLanguage}
        supportedLanguages={supportedLanguages}
        changeLanguage={changeLanguage}
      />

      {/* Page Title and Description */}
      <div className="py-6">
        <div className="w-[min(100%-2rem,72rem)] mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--theme-text)] mb-2">
            {t('navigation.map', 'Map')}
          </h1>
          <p className="text-sm md:text-base text-[var(--theme-text-secondary)]">
            {t('navigation.mapSubtitle', 'Interactive weather map')}
          </p>
        </div>
      </div>

      {/* Map Content */}
      <div className="h-[calc(100dvh-250px)]">
        <LazyBaseWeatherMap
          preloadStrategy="immediate"
          height="100%"
          showUserLocation={true}
          enableUrlSync={true}
        />
      </div>
    </div>
  );
};

export default MapPage;
