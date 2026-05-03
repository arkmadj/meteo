import { useTranslation } from 'react-i18next';

import { useOnlineStatus } from '@/contexts/OnlineStatusContext';

/**
 * Simple offline banner - no caching, just shows offline status
 */
const OfflineBanner = () => {
  const isOnline = useOnlineStatus();
  const { t } = useTranslation(['common']);

  if (isOnline) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-1100 flex justify-center px-3 sm:px-4">
      {/*
        Visual offline indicator only - ARIA announcements are handled by
        the centralized WeatherLiveRegion component to prevent duplicate
        screen reader output
      */}
      <div
        className="pointer-events-auto flex w-full max-w-3xl items-start gap-3 rounded-lg border border-amber-500/80 bg-amber-50/95 px-4 py-3 text-amber-900 shadow-lg backdrop-blur-sm transition-all dark:border-amber-400/50 dark:bg-amber-950/80 dark:text-amber-100"
        role="status"
        data-testid="offline-banner"
      >
        <span
          aria-hidden="true"
          className="mt-0.5 inline-flex h-2.5 w-2.5 flex-none animate-pulse rounded-full bg-amber-500 sm:mt-0"
        />
        <div className="flex flex-col gap-1 text-sm sm:text-base">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
            <span className="font-semibold">{t('common:status.offlineBannerTitle')}</span>
            <span className="text-xs text-amber-900/80 dark:text-amber-100/80 sm:text-sm">
              {t('common:status.offlineBannerMessage')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineBanner;
