/**
 * useFavoriteLocations Hook
 * Manages up to five favorite locations with localStorage persistence and reordering support.
 */

import { useCallback, useEffect, useState } from 'react';

export type FavoriteLocation = string;

const FAVORITES_STORAGE_KEY = 'weather-app-favorites';
const MAX_FAVORITES = 5;

// Custom event name for synchronizing favorites across hook instances
// within the same tab. The native `storage` event only fires in *other*
// documents, so we need this to keep the favorite button, trigger, and
// drawer in lockstep.
const FAVORITES_UPDATED_EVENT = 'weather-app:favorites-updated';

/**
 * Safely parse favorites list from a raw localStorage value.
 */
const parseStoredFavorites = (raw: string | null): FavoriteLocation[] => {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    // Ensure we only keep non-empty strings
    const favorites = parsed
      .filter(item => typeof item === 'string')
      .map(item => item.trim())
      .filter(item => item.length > 0) as FavoriteLocation[];

    // Enforce uniqueness and max length while preserving order
    const seen = new Set<string>();
    const unique: FavoriteLocation[] = [];

    for (const location of favorites) {
      const key = location.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(location);
      }
      if (unique.length >= MAX_FAVORITES) {
        break;
      }
    }

    return unique;
  } catch (error) {
    // Malformed JSON should not break the app; ignore and reset favorites
    // eslint-disable-next-line no-console
    console.warn('Failed to parse favorite locations from storage:', error);
    return [];
  }
};

/**
 * Load favorites from localStorage in a browser-safe way.
 */
const loadFavoritesFromStorage = (): FavoriteLocation[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    return parseStoredFavorites(raw);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to load favorite locations from storage:', error);
    return [];
  }
};

/**
 * Persist favorites to localStorage in a browser-safe way.
 */
const saveFavoritesToStorage = (favorites: FavoriteLocation[]): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to save favorite locations to storage:', error);
  }
};

/**
 * Broadcast a favorites update to all hook instances in the current tab.
 * Consumers listen for this via `window.addEventListener` and update their
 * local React state, keeping UI pieces synchronized.
 */
const emitFavoritesUpdatedEvent = (favorites: FavoriteLocation[]): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const event = new CustomEvent<FavoriteLocation[]>(FAVORITES_UPDATED_EVENT, {
      detail: favorites,
    });
    window.dispatchEvent(event);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to dispatch favorites update event:', error);
  }
};

const normalizeLocationKey = (value: string): string => value.trim().toLowerCase();

export interface UseFavoriteLocationsResult {
  /** Ordered list of favorite locations (most recent first). */
  favorites: FavoriteLocation[];
  /** Maximum number of favorites that can be stored. */
  maxFavorites: number;
  /** Add a location to favorites (moves to front if it already exists). */
  addFavorite: (location: FavoriteLocation) => void;
  /** Alias for addFavorite (for API ergonomics with existing docs). */
  addToFavorites: (location: FavoriteLocation) => void;
  /** Remove a location from favorites. */
  removeFavorite: (location: FavoriteLocation) => void;
  /** Clear all favorites. */
  clearFavorites: () => void;
  /**
   * Reorder favorites by moving the item at fromIndex to toIndex.
   * Out-of-range indices are ignored.
   */
  moveFavorite: (fromIndex: number, toIndex: number) => void;
  /** Check if a given location is currently a favorite. */
  isFavorite: (location: FavoriteLocation) => boolean;
}

/**
 * Hook for managing up to five favorite locations with persistence.
 */
export const useFavoriteLocations = (): UseFavoriteLocationsResult => {
  const [favorites, setFavorites] = useState<FavoriteLocation[]>(() => loadFavoritesFromStorage());

  // Persist any changes to favorites
  useEffect(() => {
    saveFavoritesToStorage(favorites);
  }, [favorites]);

  // Sync favorites across tabs via storage events and within a tab via
  // a custom favorites-updated event.
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== FAVORITES_STORAGE_KEY) {
        return;
      }

      setFavorites(loadFavoritesFromStorage());
    };

    const handleFavoritesUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<FavoriteLocation[]>;
      const next = Array.isArray(customEvent.detail)
        ? customEvent.detail
        : loadFavoritesFromStorage();

      setFavorites(next);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(FAVORITES_UPDATED_EVENT, handleFavoritesUpdated as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(FAVORITES_UPDATED_EVENT, handleFavoritesUpdated as EventListener);
    };
  }, []);

  const addFavorite = useCallback((location: FavoriteLocation) => {
    setFavorites(previous => {
      const normalized = location.trim();
      if (!normalized) {
        return previous;
      }

      const key = normalizeLocationKey(normalized);
      const existingIndex = previous.findIndex(item => normalizeLocationKey(item) === key);

      let next: FavoriteLocation[];

      if (existingIndex !== -1) {
        // Move existing favorite to the front
        if (existingIndex === 0) {
          return previous;
        }

        next = [previous[existingIndex], ...previous.filter((_, idx) => idx !== existingIndex)];
      } else {
        // Prepend new favorite
        next = [normalized, ...previous];
      }

      if (next.length > MAX_FAVORITES) {
        next = next.slice(0, MAX_FAVORITES);
      }

      emitFavoritesUpdatedEvent(next);

      return next;
    });
  }, []);

  const removeFavorite = useCallback((location: FavoriteLocation) => {
    setFavorites(previous => {
      const key = normalizeLocationKey(location);
      const next = previous.filter(item => normalizeLocationKey(item) !== key);

      if (next.length === previous.length) {
        return previous;
      }

      emitFavoritesUpdatedEvent(next);

      return next;
    });
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites(previous => {
      if (previous.length === 0) {
        return previous;
      }

      const next: FavoriteLocation[] = [];
      emitFavoritesUpdatedEvent(next);

      return next;
    });
  }, []);

  const moveFavorite = useCallback((fromIndex: number, toIndex: number) => {
    setFavorites(previous => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        fromIndex >= previous.length ||
        previous.length === 0
      ) {
        return previous;
      }

      const targetIndex = Math.max(0, Math.min(toIndex, previous.length - 1));
      if (targetIndex === fromIndex) {
        return previous;
      }

      const updated = [...previous];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(targetIndex, 0, moved);

      emitFavoritesUpdatedEvent(updated);

      return updated;
    });
  }, []);

  const isFavorite = useCallback(
    (location: FavoriteLocation): boolean => {
      const key = normalizeLocationKey(location);
      return favorites.some(item => normalizeLocationKey(item) === key);
    },
    [favorites]
  );

  const addToFavorites = useCallback(
    (location: FavoriteLocation) => {
      addFavorite(location);
    },
    [addFavorite]
  );

  return {
    favorites,
    maxFavorites: MAX_FAVORITES,
    addFavorite,
    addToFavorites,
    removeFavorite,
    clearFavorites,
    moveFavorite,
    isFavorite,
  };
};

export default useFavoriteLocations;
