/**
 * Keyboard Shortcuts Types
 * Defines types for configurable keyboard shortcuts in the app
 */

/**
 * Available keyboard shortcut actions
 */
export type KeyboardShortcutAction =
  | 'focusSearch'
  | 'refreshData'
  | 'toggleUnits'
  | 'toggleDevTools'
  | 'toggleFavorites'
  | 'goToHome'
  | 'goToSettings'
  | 'goToWeather';

/**
 * Modifier keys that can be used in shortcuts
 */
export type ModifierKey = 'ctrl' | 'alt' | 'shift' | 'meta';

/**
 * A key combination for a shortcut
 */
export interface KeyCombination {
  /** The main key (e.g., 'k', 'r', 'f1') */
  key: string;
  /** Required modifier keys */
  modifiers: ModifierKey[];
}

/**
 * A keyboard shortcut definition
 */
export interface KeyboardShortcut {
  /** Unique action identifier */
  action: KeyboardShortcutAction;
  /** Human-readable label for the shortcut */
  label: string;
  /** Description of what the shortcut does */
  description: string;
  /** The key combination */
  keyCombination: KeyCombination;
  /** Whether the shortcut is enabled */
  enabled: boolean;
  /** Category for grouping in UI */
  category: 'navigation' | 'data' | 'accessibility' | 'display';
}

/**
 * Map of action to keyboard shortcut
 */
export type KeyboardShortcutsMap = Record<KeyboardShortcutAction, KeyboardShortcut>;

/**
 * Configuration for keyboard shortcuts
 */
export interface KeyboardShortcutsConfig {
  /** Whether keyboard shortcuts are globally enabled */
  enabled: boolean;
  /** The configured shortcuts */
  shortcuts: KeyboardShortcutsMap;
}

/**
 * Default keyboard shortcuts configuration
 */
export const DEFAULT_SHORTCUTS: KeyboardShortcutsMap = {
  focusSearch: {
    action: 'focusSearch',
    label: 'Focus Search',
    description: 'Focus the search input field',
    keyCombination: { key: 'k', modifiers: ['ctrl'] },
    enabled: true,
    category: 'navigation',
  },
  refreshData: {
    action: 'refreshData',
    label: 'Refresh Data',
    description: 'Refresh weather data',
    keyCombination: { key: 'r', modifiers: ['ctrl', 'shift'] },
    enabled: true,
    category: 'data',
  },
  toggleUnits: {
    action: 'toggleUnits',
    label: 'Toggle Units',
    description: 'Toggle between Celsius and Fahrenheit',
    keyCombination: { key: 'u', modifiers: ['ctrl'] },
    enabled: true,
    category: 'display',
  },
  toggleDevTools: {
    action: 'toggleDevTools',
    label: 'Toggle Quick Nav',
    description: 'Toggle Quick Navigation menu',
    keyCombination: { key: 'd', modifiers: ['ctrl'] },
    enabled: true,
    category: 'accessibility',
  },
  toggleFavorites: {
    action: 'toggleFavorites',
    label: 'Toggle Favorites',
    description: 'Open/close favorites drawer',
    keyCombination: { key: 'f', modifiers: ['ctrl'] },
    enabled: true,
    category: 'navigation',
  },
  goToHome: {
    action: 'goToHome',
    label: 'Go to Home',
    description: 'Navigate to home page',
    keyCombination: { key: 'h', modifiers: ['ctrl', 'shift'] },
    enabled: true,
    category: 'navigation',
  },
  goToSettings: {
    action: 'goToSettings',
    label: 'Go to Settings',
    description: 'Navigate to settings page',
    keyCombination: { key: ',', modifiers: ['ctrl'] },
    enabled: true,
    category: 'navigation',
  },
  goToWeather: {
    action: 'goToWeather',
    label: 'Go to Weather',
    description: 'Navigate to weather page',
    keyCombination: { key: 'w', modifiers: ['ctrl', 'shift'] },
    enabled: true,
    category: 'navigation',
  },
};

/**
 * Default keyboard shortcuts config
 */
export const DEFAULT_KEYBOARD_SHORTCUTS_CONFIG: KeyboardShortcutsConfig = {
  enabled: true,
  shortcuts: DEFAULT_SHORTCUTS,
};

/**
 * Serialize a key combination to a display string
 */
export function formatKeyCombination(combo: KeyCombination, isMac: boolean = false): string {
  const modifierSymbols: Record<ModifierKey, string> = isMac
    ? { ctrl: '⌃', alt: '⌥', shift: '⇧', meta: '⌘' }
    : { ctrl: 'Ctrl', alt: 'Alt', shift: 'Shift', meta: 'Win' };

  const parts = combo.modifiers.map(mod => modifierSymbols[mod]);
  parts.push(combo.key.toUpperCase());

  return parts.join(isMac ? '' : '+');
}

/**
 * Check if a keyboard event matches a key combination
 */
export function matchesKeyCombination(event: KeyboardEvent, combo: KeyCombination): boolean {
  const keyMatches = event.key.toLowerCase() === combo.key.toLowerCase();
  const ctrlMatches = combo.modifiers.includes('ctrl') === (event.ctrlKey || event.metaKey);
  const altMatches = combo.modifiers.includes('alt') === event.altKey;
  const shiftMatches = combo.modifiers.includes('shift') === event.shiftKey;

  return keyMatches && ctrlMatches && altMatches && shiftMatches;
}
