/**
 * Global Event Handler Component
 * Integrates with app-wide events and triggers snackbar notifications
 */

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { useError } from '@/contexts/ErrorContext';
import { useOnlineStatus } from '@/contexts/OnlineStatusContext';
import { useSnackbar } from '@/contexts/SnackbarContext';

/**
 * Global Event Handler Component
 * Handles app-wide events and triggers appropriate snackbar notifications
 */
const GlobalEventHandler: React.FC = () => {
  const { showInfo, showWarning, showError } = useSnackbar();
  const { handleError } = useError();
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  const previousOnlineStatus = useRef(isOnline);

  // Handle unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Prevent the default browser behavior
      event.preventDefault();

      // Log and handle the rejection
      console.error('Unhandled promise rejection:', event.reason);

      const appError = {
        id: `unhandled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'UNHANDLED_PROMISE_REJECTION' as const,
        category: 'UNKNOWN' as const,
        severity: 'HIGH' as const,
        message: event.reason?.message || 'Unhandled promise rejection',
        userMessage: 'An unexpected error occurred. Please try again.',
        timestamp: Date.now(),
        retryable: false,
        context: {
          source: 'unhandled-rejection',
          promise: event.promise,
          reason: event.reason,
        },
        originalError: event.reason,
      };

      handleError(appError);
      showError('An unexpected error occurred. Please refresh the page if needed.');
    };

    const handleRejectionHandled = (event: PromiseRejectionEvent) => {
      // Log when a previously unhandled rejection is handled
      console.info('Previously unhandled promise rejection was handled:', event.reason);
    };

    // Add event listeners for unhandled rejections
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('rejectionhandled', handleRejectionHandled);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('rejectionhandled', handleRejectionHandled);
    };
  }, [handleError, showError]);

  // Handle global errors (outside React error boundaries)
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      // Prevent default browser error handling
      event.preventDefault();

      console.error('Global error:', event.error);

      const appError = {
        id: `global-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'GLOBAL_ERROR' as const,
        category: 'UNKNOWN' as const,
        severity: 'HIGH' as const,
        message: event.error?.message || 'An unexpected error occurred',
        userMessage: 'An unexpected error occurred. Please refresh the page.',
        timestamp: Date.now(),
        retryable: false,
        context: {
          source: 'global-error',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          message: event.message,
        },
        originalError: event.error,
      };

      handleError(appError);
      showError('An unexpected error occurred. Please refresh the page.');
    };

    // Add event listener for global errors
    window.addEventListener('error', handleGlobalError);

    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  }, [handleError, showError]);

  // Handle visibility change (tab focus/blur)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isOnline) {
        // Tab became visible and we're online - queries will auto-refetch
        // No notification needed as QueryProvider handles this
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOnline, showInfo]);

  // Handle page unload (save state, show warning if needed)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check if there are any pending mutations
      const mutationCache = queryClient.getMutationCache();
      const pendingMutations = mutationCache.getAll().filter(m => m.state.status === 'pending');

      if (pendingMutations.length > 0) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [queryClient]);

  // Handle storage events (sync across tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'weather-app-theme') {
        showInfo('Theme updated from another tab', 2000);
      }

      if (e.key === 'weather-app-favorites') {
        showInfo('Favorites updated from another tab', 2000);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [showInfo]);

  // Note: Keyboard shortcuts are now handled by KeyboardShortcutsProvider
  // for configurable shortcuts. See src/contexts/KeyboardShortcutsContext.tsx

  // Handle connection quality changes
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      return;
    }

    const connection = (navigator as unknown as Record<string, unknown>).connection as
      | {
          effectiveType: string;
          addEventListener: (event: string, handler: () => void) => void;
          removeEventListener: (event: string, handler: () => void) => void;
        }
      | undefined;
    if (!connection) {
      return;
    }

    const handleConnectionChange = () => {
      const effectiveType = connection.effectiveType;

      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        showWarning('Slow connection detected. Weather updates may be delayed.', 5000);
      }
    };

    connection.addEventListener('change', handleConnectionChange);

    return () => {
      connection.removeEventListener('change', handleConnectionChange);
    };
  }, [showWarning]);

  // Handle quota exceeded errors (storage)
  useEffect(() => {
    const handleQuotaExceeded = (e: Event) => {
      if (e.type === 'error') {
        const error = (e as ErrorEvent).error;
        if (error?.name === 'QuotaExceededError') {
          showError('Storage quota exceeded. Please clear some cached data.');
        }
      }
    };

    window.addEventListener('error', handleQuotaExceeded);

    return () => {
      window.removeEventListener('error', handleQuotaExceeded);
    };
  }, [showError]);

  // Handle service worker updates
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const handleServiceWorkerUpdate = () => {
      showInfo('A new version is available. Refresh to update.', 0);
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleServiceWorkerUpdate);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleServiceWorkerUpdate);
    };
  }, [showInfo]);

  // Track online status changes
  useEffect(() => {
    previousOnlineStatus.current = isOnline;
  }, [isOnline]);

  return null;
};

export default GlobalEventHandler;
