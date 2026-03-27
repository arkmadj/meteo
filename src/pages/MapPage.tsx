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
        title={t('navigation.map', 'Map')}
        subtitle={t('navigation.mapSubtitle', 'Interactive weather map')}
        showSubtitle={true}
        sticky={true}
        variant="compact"
        currentLanguage={currentLanguage}
        supportedLanguages={supportedLanguages}
        changeLanguage={changeLanguage}
      />

      {/* Map Content */}
      <div className="h-[calc(100vh-80px)]">
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
