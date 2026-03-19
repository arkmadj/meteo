/**
 * useKeyboardShortcuts Hook
 * Manages configurable keyboard shortcuts with localStorage persistence
 */

import { useCallback, useEffect, useState } from 'react';

import type {
  KeyboardShortcut,
  KeyboardShortcutAction,
  KeyboardShortcutsConfig,
  KeyCombination,
} from '@/types/keyboardShortcuts';
import {
  DEFAULT_KEYBOARD_SHORTCUTS_CONFIG,
  matchesKeyCombination,
} from '@/types/keyboardShortcuts';

const STORAGE_KEY = 'keyboard-shortcuts-config';

/**
 * Load shortcuts config from localStorage
 */
function loadFromStorage(): KeyboardShortcutsConfig | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all shortcuts exist
      return {
        enabled: parsed.enabled ?? DEFAULT_KEYBOARD_SHORTCUTS_CONFIG.enabled,
        shortcuts: {
          ...DEFAULT_KEYBOARD_SHORTCUTS_CONFIG.shortcuts,
          ...parsed.shortcuts,
        },
      };
    }
  } catch (error) {
    console.warn('Failed to load keyboard shortcuts from storage:', error);
  }

  return null;
}

/**
 * Save shortcuts config to localStorage
 */
function saveToStorage(config: KeyboardShortcutsConfig): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.warn('Failed to save keyboard shortcuts to storage:', error);
  }
}

/**
 * Hook return type
 */
export interface UseKeyboardShortcutsReturn {
  /** Current configuration */
  config: KeyboardShortcutsConfig;
  /** Whether shortcuts are globally enabled */
  isEnabled: boolean;
  /** Toggle global enable/disable */
  setEnabled: (enabled: boolean) => void;
  /** Get a specific shortcut */
  getShortcut: (action: KeyboardShortcutAction) => KeyboardShortcut;
  /** Update a shortcut's key combination */
  updateShortcut: (action: KeyboardShortcutAction, keyCombination: KeyCombination) => void;
  /** Toggle a specific shortcut's enabled state */
  toggleShortcut: (action: KeyboardShortcutAction, enabled?: boolean) => void;
  /** Reset all shortcuts to defaults */
  resetToDefaults: () => void;
  /** Check if an event matches a shortcut action */
  matchesShortcut: (event: KeyboardEvent, action: KeyboardShortcutAction) => boolean;
  /** Get all shortcuts grouped by category */
  getShortcutsByCategory: () => Record<string, KeyboardShortcut[]>;
  /** Check for shortcut conflicts */
  hasConflict: (
    action: KeyboardShortcutAction,
    combo: KeyCombination
  ) => KeyboardShortcutAction | null;
}

/**
 * Custom hook for managing keyboard shortcuts
 */
export function useKeyboardShortcuts(): UseKeyboardShortcutsReturn {
  const [config, setConfig] = useState<KeyboardShortcutsConfig>(() => {
    return loadFromStorage() ?? DEFAULT_KEYBOARD_SHORTCUTS_CONFIG;
  });

  // Persist config changes to localStorage
  useEffect(() => {
    saveToStorage(config);
  }, [config]);

  const setEnabled = useCallback((enabled: boolean) => {
    setConfig(prev => ({ ...prev, enabled }));
  }, []);

  const getShortcut = useCallback(
    (action: KeyboardShortcutAction): KeyboardShortcut => {
      return config.shortcuts[action];
    },
    [config.shortcuts]
  );

  const updateShortcut = useCallback(
    (action: KeyboardShortcutAction, keyCombination: KeyCombination) => {
      setConfig(prev => ({
        ...prev,
        shortcuts: {
          ...prev.shortcuts,
          [action]: {
            ...prev.shortcuts[action],
            keyCombination,
          },
        },
      }));
    },
    []
  );

  const toggleShortcut = useCallback((action: KeyboardShortcutAction, enabled?: boolean) => {
    setConfig(prev => ({
      ...prev,
      shortcuts: {
        ...prev.shortcuts,
        [action]: {
          ...prev.shortcuts[action],
          enabled: enabled ?? !prev.shortcuts[action].enabled,
        },
      },
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setConfig(DEFAULT_KEYBOARD_SHORTCUTS_CONFIG);
  }, []);

  const matchesShortcut = useCallback(
    (event: KeyboardEvent, action: KeyboardShortcutAction): boolean => {
      if (!config.enabled) return false;
      const shortcut = config.shortcuts[action];
      if (!shortcut.enabled) return false;
      return matchesKeyCombination(event, shortcut.keyCombination);
    },
    [config]
  );

  const getShortcutsByCategory = useCallback(() => {
    const grouped: Record<string, KeyboardShortcut[]> = {};
    Object.values(config.shortcuts).forEach(shortcut => {
      if (!grouped[shortcut.category]) {
        grouped[shortcut.category] = [];
      }
      grouped[shortcut.category].push(shortcut);
    });
    return grouped;
  }, [config.shortcuts]);

  const hasConflict = useCallback(
    (action: KeyboardShortcutAction, combo: KeyCombination): KeyboardShortcutAction | null => {
      for (const [key, shortcut] of Object.entries(config.shortcuts)) {
        if (key === action) continue;
        const existingCombo = shortcut.keyCombination;
        if (
          existingCombo.key.toLowerCase() === combo.key.toLowerCase() &&
          existingCombo.modifiers.length === combo.modifiers.length &&
          existingCombo.modifiers.every(m => combo.modifiers.includes(m))
        ) {
          return key as KeyboardShortcutAction;
        }
      }
      return null;
    },
    [config.shortcuts]
  );

  return {
    config,
    isEnabled: config.enabled,
    setEnabled,
    getShortcut,
    updateShortcut,
    toggleShortcut,
    resetToDefaults,
    matchesShortcut,
    getShortcutsByCategory,
    hasConflict,
  };
}

export default useKeyboardShortcuts;
