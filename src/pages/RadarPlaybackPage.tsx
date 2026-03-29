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
        sticky={true}
        variant="compact"
        currentLanguage={currentLanguage}
        supportedLanguages={supportedLanguages}
        changeLanguage={changeLanguage}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title and Description */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--theme-text)] mb-2">
            {t('navigation.radarPlayback', 'Radar Playback')}
          </h1>
          <p className="text-sm md:text-base text-[var(--theme-text-secondary)]">
            {t('navigation.radarPlaybackSubtitle', 'Animated weather radar data')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🌧️ Radar Playback
          </h2>
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
