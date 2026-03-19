/**
 * KeyboardShortcutsContext
 * Provides keyboard shortcuts configuration throughout the app
 */

import { useQueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import React, { createContext, useCallback, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useSnackbar } from '@/contexts/SnackbarContext';
import type { UseKeyboardShortcutsReturn } from '@/hooks/useKeyboardShortcuts';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { KeyboardShortcutAction } from '@/types/keyboardShortcuts';

/**
 * Action handlers type
 */
export type ShortcutActionHandlers = {
  [K in KeyboardShortcutAction]?: () => void;
};

/**
 * Extended context value with action registration
 */
interface KeyboardShortcutsContextValue extends UseKeyboardShortcutsReturn {
  /** Register a custom action handler */
  registerHandler: (action: KeyboardShortcutAction, handler: () => void) => void;
  /** Unregister an action handler */
  unregisterHandler: (action: KeyboardShortcutAction) => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextValue | null>(null);

interface KeyboardShortcutsProviderProps {
  children: ReactNode;
}

/**
 * KeyboardShortcutsProvider
 * Wraps the app to provide keyboard shortcut functionality
 */
export const KeyboardShortcutsProvider: React.FC<KeyboardShortcutsProviderProps> = ({
  children,
}) => {
  const shortcutsHook = useKeyboardShortcuts();
  const { showInfo } = useSnackbar();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const handlersRef = React.useRef<ShortcutActionHandlers>({});

  const registerHandler = useCallback((action: KeyboardShortcutAction, handler: () => void) => {
    handlersRef.current[action] = handler;
  }, []);

  const unregisterHandler = useCallback((action: KeyboardShortcutAction) => {
    delete handlersRef.current[action];
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Allow search focus shortcut to work even in inputs
        if (!shortcutsHook.matchesShortcut(event, 'focusSearch')) {
          return;
        }
      }

      // Check each shortcut action
      const actions: KeyboardShortcutAction[] = [
        'focusSearch',
        'refreshData',
        'toggleUnits',
        'toggleDevTools',
        'toggleFavorites',
        'goToHome',
        'goToSettings',
        'goToWeather',
      ];

      for (const action of actions) {
        if (shortcutsHook.matchesShortcut(event, action)) {
          event.preventDefault();

          // Check for custom handler first
          const customHandler = handlersRef.current[action];
          if (customHandler) {
            customHandler();
            return;
          }

          // Default handlers
          switch (action) {
            case 'focusSearch': {
              const searchInput = document.querySelector<HTMLInputElement>(
                'input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]'
              );
              if (searchInput) {
                searchInput.focus();
                showInfo('Search focused', 1000);
              }
              break;
            }
            case 'refreshData':
              queryClient.invalidateQueries({ queryKey: ['weather'] });
              showInfo('Refreshing weather data...', 2000);
              break;
            case 'toggleUnits': {
              // Try to find and trigger the temperature toggle
              const toggleBtn = document.querySelector<HTMLButtonElement>(
                '[data-temperature-toggle], [aria-label*="temperature" i], [aria-label*="unit" i]'
              );
              if (toggleBtn) {
                toggleBtn.click();
                showInfo('Temperature unit toggled', 1000);
              }
              break;
            }
            case 'toggleDevTools': {
              const toggleQuickNav = (window as unknown as Record<string, unknown>)
                .__toggleQuickNav;
              if (typeof toggleQuickNav === 'function') {
                toggleQuickNav();
              }
              break;
            }
            case 'toggleFavorites': {
              const toggleFavorites = (window as unknown as Record<string, unknown>)
                .__toggleFavorites;
              if (typeof toggleFavorites === 'function') {
                toggleFavorites();
                showInfo('Favorites toggled', 1000);
              }
              break;
            }
            case 'goToHome':
              navigate('/');
              showInfo('Navigating to Home', 1000);
              break;
            case 'goToSettings':
              navigate('/settings');
              showInfo('Navigating to Settings', 1000);
              break;
            case 'goToWeather':
              navigate('/weather');
              showInfo('Navigating to Weather', 1000);
              break;
          }
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutsHook, showInfo, navigate, queryClient]);

  const contextValue: KeyboardShortcutsContextValue = {
    ...shortcutsHook,
    registerHandler,
    unregisterHandler,
  };

  return (
    <KeyboardShortcutsContext.Provider value={contextValue}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
};

/**
 * Hook to use keyboard shortcuts context
 */
export const useKeyboardShortcutsContext = (): KeyboardShortcutsContextValue => {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcutsContext must be used within a KeyboardShortcutsProvider');
  }
  return context;
};

export default KeyboardShortcutsContext;
