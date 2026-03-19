/**
 * React Query Provider Component
 */

import { QueryClientProvider, focusManager, onlineManager } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { useEffect, useState } from 'react';

import GlobalEventHandler from '@/components/utilities/GlobalEventHandler';
import OfflineBanner from '@/components/utilities/OfflineBanner';
import queryClient from '@/config/queryClient';
import { useError } from '@/contexts/ErrorContext';
import { OnlineStatusProvider } from '@/contexts/OnlineStatusContext';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { CityNotFoundError, GeocodingError, WeatherServiceError } from '@/errors/domainErrors';
import { useLanguage } from '@/i18n/hooks/useLanguage';

const FOCUS_EVENT_THROTTLE_MS = 500;

/**
 * Check if TanStack Query DevTools should be enabled
 * Controlled by VITE_ENABLE_QUERY_DEVTOOLS environment variable
 */
const isDevToolsEnabled = (): boolean => {
  // Only enable in development mode
  if (import.meta.env.MODE !== 'development') {
    return false;
  }

  // Check environment variable
  const envFlag = import.meta.env.VITE_ENABLE_QUERY_DEVTOOLS;

  // Convert string to boolean (handles 'true', '1', 'yes', etc.)
  if (typeof envFlag === 'string') {
    return envFlag.toLowerCase() === 'true' || envFlag === '1' || envFlag.toLowerCase() === 'yes';
  }

  // Default to false if not set
  return false;
};

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Custom error handler for React Query with Snackbar integration
 */
const createQueryErrorHandler = (
  showSnackbar: ReturnType<typeof useSnackbar>['showSnackbar'],
  showError: ReturnType<typeof useSnackbar>['showError'],
  showWarning: ReturnType<typeof useSnackbar>['showWarning']
) => {
  return (error: Error, query: unknown) => {
    console.error('Query Error:', error);

    // Don't show snackbars for background refetches
    const queryWithState = query as { state?: { fetchStatus?: string; data?: unknown } };
    const isBackgroundRefetch =
      queryWithState?.state?.fetchStatus === 'fetching' && queryWithState?.state?.data;
    if (isBackgroundRefetch) {
      return;
    }

    // Handle specific error types
    if (error instanceof CityNotFoundError) {
      showWarning('Location not found. Please try a different search.');
      return;
    }

    if (error instanceof GeocodingError) {
      showError('Unable to find location. Please check your search and try again.');
      return;
    }

    if (error instanceof WeatherServiceError) {
      // Check if it's a network error
      if (error.message.toLowerCase().includes('network')) {
        showError('Network error. Please check your connection and try again.');
        return;
      }

      // Check if it's a rate limit error
      if (error.message.toLowerCase().includes('rate limit')) {
        showWarning('Too many requests. Please wait a moment and try again.');
        return;
      }

      // Generic weather service error
      showError('Unable to fetch weather data. Please try again later.');
      return;
    }

    // Generic error
    showError('An unexpected error occurred. Please try again.');
  };
};

/**
 * Online/Offline status management with Snackbar integration
 */
const useOnlineStatusManager = (
  showSuccess: ReturnType<typeof useSnackbar>['showSuccess'],
  showWarning: ReturnType<typeof useSnackbar>['showWarning'],
  clearSnackbars: ReturnType<typeof useSnackbar>['clearSnackbars']
) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [offlineSnackbarId, setOfflineSnackbarId] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      onlineManager.setOnline(true);

      // Clear offline snackbar and show back online message
      if (offlineSnackbarId) {
        clearSnackbars();
        setOfflineSnackbarId(null);
      }
      showSuccess('Back online! Weather data will refresh automatically.', 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      onlineManager.setOnline(false);

      // Show persistent offline warning
      const id = showWarning('You are offline. Showing cached weather data.', 0);
      setOfflineSnackbarId(id);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial online status
    onlineManager.setOnline(isOnline);

    // Show offline warning if starting offline
    if (!isOnline) {
      const id = showWarning('You are offline. Showing cached weather data.', 0);
      setOfflineSnackbarId(id);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline, offlineSnackbarId, showSuccess, showWarning, clearSnackbars]);

  return isOnline;
};

/**
 * Window focus management
 */
const useWindowFocus = () => {
  // Initialize language hook to ensure i18n listeners are set up (no direct usage needed here)
  useLanguage();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    focusManager.setEventListener(handleFocus => {
      if (typeof window === 'undefined') {
        return () => undefined;
      }

      let lastFocusNotification = 0;

      const notify = (focused: boolean) => {
        if (focused) {
          const now = Date.now();
          if (now - lastFocusNotification < FOCUS_EVENT_THROTTLE_MS) {
            return;
          }
          lastFocusNotification = now;
        } else {
          lastFocusNotification = 0;
        }

        handleFocus(focused);
      };

      const handleVisibilityChange = () => notify(!document.hidden);
      const handleFocusEvent = () => notify(true);
      const handleBlurEvent = () => notify(false);

      // Sync initial state
      notify(!document.hidden);

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocusEvent);
      window.addEventListener('blur', handleBlurEvent);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocusEvent);
        window.removeEventListener('blur', handleBlurEvent);
      };
    });

    return () => {
      focusManager.setEventListener(() => undefined);
    };
  }, []);
};

/**
 * Main Query Provider Component
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  const { addError } = useError();
  const { showSnackbar, showError, showWarning, showSuccess, showInfo, clearSnackbars } =
    useSnackbar();

  const isOnline = useOnlineStatusManager(showSuccess, showWarning, clearSnackbars);

  // Set up window focus management
  useWindowFocus();

  // Set up global error handling with snackbar integration
  useEffect(() => {
    const handleQueryError = createQueryErrorHandler(showSnackbar, showError, showWarning);

    const unsubscribe = queryClient.getQueryCache().subscribe(event => {
      const eventWithAction = event as {
        type: string;
        action?: string;
        query: { state: { error?: Error } };
      };
      if (event.type === 'updated' && eventWithAction.action === 'error') {
        const { query } = event;
        if (query.state.error) {
          handleQueryError(query.state.error, query);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [addError, showSnackbar, showError, showWarning]);

  // Set up cache refresh notifications
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe(event => {
      // Notify on successful background refetch
      const eventWithAction = event as {
        type: string;
        action?: string;
        query: {
          state: { data?: unknown; dataUpdatedAt?: number; fetchStatus?: string };
          meta?: unknown;
        };
      };
      if (event.type === 'updated' && eventWithAction.action === 'success') {
        const { query } = event;
        const meta = query.meta as { autoRefresh?: boolean };

        // Only show notification for auto-refresh, not manual fetches
        if (meta?.autoRefresh && query.state.data && query.state.dataUpdatedAt) {
          const isBackgroundRefetch = query.state.fetchStatus === 'idle' && query.state.data;
          if (isBackgroundRefetch) {
            showInfo('Weather data refreshed', 2000);
          }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [showInfo]);

  // Configure online manager
  useEffect(() => {
    onlineManager.setOnline(isOnline);
  }, [isOnline]);

  return (
    <OnlineStatusProvider value={isOnline}>
      <QueryClientProvider client={queryClient}>
        <GlobalEventHandler />
        <OfflineBanner />
        {children}
        {/* TanStack Query DevTools - only enabled via environment flag */}
        {isDevToolsEnabled() && (
          <ReactQueryDevtools
            initialIsOpen={false}
            buttonPosition="bottom-left"
            position="bottom"
          />
        )}
      </QueryClientProvider>
    </OnlineStatusProvider>
  );
};

export default QueryProvider;
