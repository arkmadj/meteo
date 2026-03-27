/**
 * RadarPlaybackPage
 *
 * Page component for the animated radar playback demo
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

// Demo component removed
import { MainHeader } from '@/components/headers';
import { useLanguage } from '@/i18n/hooks/useLanguage';

const RadarPlaybackPage: React.FC = () => {
  const { t } = useTranslation(['common']);
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <MainHeader
        title={t('navigation.radarPlayback', 'Radar Playback')}
        subtitle={t('navigation.radarPlaybackSubtitle', 'Animated weather radar data')}
        showSubtitle={true}
        sticky={true}
        variant="compact"
        currentLanguage={currentLanguage}
        supportedLanguages={supportedLanguages}
        changeLanguage={changeLanguage}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🌧️ Radar Playback
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Interactive demo has been removed. This feature allows playback of weather radar data
            over time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RadarPlaybackPage;
