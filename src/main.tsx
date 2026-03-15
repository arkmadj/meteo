import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { preloadCriticalChunks } from '@/components/lazy/chunkOptimizedIndex';
import { SnackbarContainer } from '@/components/ui';
import { ErrorProvider } from '@/contexts/ErrorContext';
import { MotionPreferencesProvider } from '@/contexts/MotionPreferencesContext';
import { PerformanceProvider } from '@/contexts/PerformanceContext';
import { SnackbarProvider } from '@/contexts/SnackbarContext';
import { UserPreferencesProvider } from '@/contexts/UserPreferencesContext';
import { ThemeProvider } from '@/design-system/theme';
import { ApplicationBootstrapError } from '@/errors/domainErrors';
import QueryProvider from '@/providers/QueryProvider';
import { AppRouter } from '@/router';
import { chunkPreloadingService } from '@/services/chunkPreloadingService';
import { pushNotificationService } from '@/services/pushNotificationService';

// Import global styles - must be imported at the entry point to ensure
// styles are available for all routes, including 404 page on direct navigation
import '@/styles.css';

// Initialize chunk preloading service
chunkPreloadingService.updateConfig({
  enabled: true,
  respectSaveData: true,
  respectReducedMotion: true,
  maxConcurrentPreloads: 3,
  preloadDelay: 1000,
  connectionThreshold: '3g',
});

// Preload critical chunks immediately
preloadCriticalChunks();

// Register service worker for push notifications
// Registration happens asynchronously and doesn't block app startup
if ('serviceWorker' in navigator) {
  pushNotificationService.registerServiceWorker().then(result => {
    if (result.success) {
      console.log('[App] Service worker registered for push notifications');
    } else {
      console.warn('[App] Service worker registration failed:', result.error?.message);
    }
  });
}

const container = document.getElementById('root');
if (!container) throw new ApplicationBootstrapError('Failed to find root element');
const root = createRoot(container);

/**
 * Root provider hierarchy:
 * - StrictMode: React strict mode for development checks
 * - MotionPreferencesProvider: Global motion/animation preferences (manual + system)
 * - UserPreferencesProvider: User preferences (save-data, reduced-motion, etc.)
 * - ErrorProvider: Global error handling
 * - ThemeProvider: Theme management (light/dark mode)
 * - PerformanceProvider: Performance monitoring and metrics
 * - SnackbarProvider: Snackbar notifications
 * - QueryProvider: React Query for data fetching
 *
 * This hierarchy ensures all providers are available to the entire app,
 * including error boundaries like the 404 page, preventing context loss.
 */
root.render(
  <StrictMode>
    <MotionPreferencesProvider>
      <UserPreferencesProvider>
        <ErrorProvider>
          <ThemeProvider defaultMode="auto">
            <PerformanceProvider config={{ enabled: true }}>
              <SnackbarProvider
                defaultPosition="bottom-right"
                defaultMaxSnackbars={3}
                defaultDisplayMode="stack"
              >
                <QueryProvider>
                  <AppRouter />
                  <SnackbarContainer />
                </QueryProvider>
              </SnackbarProvider>
            </PerformanceProvider>
          </ThemeProvider>
        </ErrorProvider>
      </UserPreferencesProvider>
    </MotionPreferencesProvider>
  </StrictMode>
);
