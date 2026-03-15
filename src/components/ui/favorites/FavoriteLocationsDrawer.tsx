/**
 * FavoriteLocationsDrawer Component
 *
 * Side drawer that shows up to five favorite locations backed by localStorage
 * via the useFavoriteLocations hook. Updates automatically as favorites
 * change in the current tab or in other tabs.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

import SideDrawer from '@/components/ui/navigation/SideDrawer';
import useFavoriteLocations from '@/hooks/useFavoriteLocations';

export interface FavoriteLocationsDrawerProps {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Callback when the drawer should close */
  onClose: () => void;
  /** Optional callback when a favorite location is selected */
  onSelectLocation?: (location: string) => void;
  /** Optional test id for querying in tests */
  'data-testid'?: string;
}

const FavoriteLocationsDrawer: React.FC<FavoriteLocationsDrawerProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  'data-testid': testId = 'favorite-locations-drawer',
}) => {
  const { t } = useTranslation(['common', 'weather']);
  const { favorites, maxFavorites, removeFavorite, clearFavorites, moveFavorite } =
    useFavoriteLocations();

  const handleSelect = (location: string) => {
    if (onSelectLocation) {
      onSelectLocation(location);
    }
    onClose();
  };

  /**
   * Handle the start of a drag gesture for a favorite item.
   *
   * We mark the drag as a "move" operation so the cursor feedback is consistent
   * across browsers, but we do not perform any mutation here.
   */
  const handleDragStart = (event: React.DragEvent<HTMLLIElement>) => {
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  };

  /**
   * Handle the end of a drag gesture for a favorite item.
   *
   * If the drag finishes with the pointer outside the drawer's bounds, we
   * interpret that as the user dragging the favorite out of the drawer and
   * remove it from the favorites list. This keeps keyboard and click-based
   * removal fully intact while adding an extra, gesture-based affordance.
   */
  const handleDragEnd = (event: React.DragEvent<HTMLLIElement>, location: string) => {
    // Safety check for non-browser environments; drag events will not fire
    // during SSR or in tests that do not mount to a real DOM.
    if (typeof window === 'undefined') {
      return;
    }

    const drawerElement = event.currentTarget.closest('.side-drawer');
    if (!drawerElement) {
      return;
    }

    const rect = (drawerElement as HTMLElement).getBoundingClientRect();
    const { clientX, clientY } = event;

    const isInsideDrawer =
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom;

    if (!isInsideDrawer) {
      removeFavorite(location);
    }
  };

  const header = (
    <div className="flex flex-col w-full">
      <h2 className="text-base font-semibold text-[var(--theme-text)]">
        {t('weather:favorites.title', 'Favorite locations')}
      </h2>
      <p className="mt-0.5 text-xs text-[var(--theme-text-secondary)]">
        {t('weather:favorites.subtitle', '{{count}} of {{max}} saved', {
          count: favorites.length,
          max: maxFavorites,
        })}
      </p>
    </div>
  );

  const footer =
    favorites.length > 0 ? (
      <div className="flex items-center justify-between text-xs text-[var(--theme-text-secondary)]">
        <span>
          {t(
            'weather:favorites.hint',
            'Favorites update here automatically as you add or remove them.'
          )}
        </span>
        <button
          type="button"
          onClick={clearFavorites}
          className="ml-3 inline-flex items-center rounded-md px-2 py-1 border border-[var(--theme-border)] text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--theme-accent)]"
        >
          {t('weather:favorites.clearAll', 'Clear all')}
        </button>
      </div>
    ) : null;

  const renderEmptyState = () => (
    <div className="rounded-lg border border-dashed border-[var(--theme-border)] bg-[var(--theme-surface)]/80 px-4 py-6 text-center text-sm text-[var(--theme-text-secondary)]">
      {t(
        'weather:favorites.empty',
        'You have no favorite locations yet. Tap the star icon on a city to save it here.'
      )}
    </div>
  );

  const renderFavoritesList = () => (
    <ul
      className="space-y-2"
      aria-label={t('weather:favorites.listLabel', 'Saved favorite locations')}
    >
      {favorites.map((location, index) => (
        <li
          key={location.toLowerCase()}
          draggable
          onDragStart={handleDragStart}
          onDragEnd={event => handleDragEnd(event, location)}
          className="flex items-center justify-between rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)]/95 px-3 py-2 shadow-sm cursor-grab active:cursor-grabbing select-none"
        >
          <button
            type="button"
            className="flex-1 min-w-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--theme-accent)]"
            onClick={() => handleSelect(location)}
          >
            <span className="block text-[0.7rem] uppercase tracking-wide text-[var(--theme-text-secondary)]">
              {t('weather:favorites.itemLabel', 'Favorite {{index}}', { index: index + 1 })}
            </span>
            <span className="block text-sm font-medium text-[var(--theme-text)] truncate">
              {location}
            </span>
          </button>
          <div className="ml-2 flex flex-col space-y-1">
            <button
              type="button"
              aria-label={t('weather:favorites.moveUp', 'Move up')}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-transparent text-[var(--theme-text-secondary)] hover:bg-[var(--theme-hover)] disabled:opacity-40 disabled:hover:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--theme-accent)]"
              onClick={() => moveFavorite(index, index - 1)}
              disabled={index === 0}
            >
              <span aria-hidden="true"></span>
            </button>
            <button
              type="button"
              aria-label={t('weather:favorites.moveDown', 'Move down')}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-transparent text-[var(--theme-text-secondary)] hover:bg-[var(--theme-hover)] disabled:opacity-40 disabled:hover:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--theme-accent)]"
              onClick={() => moveFavorite(index, index + 1)}
              disabled={index === favorites.length - 1}
            >
              <span aria-hidden="true"></span>
            </button>
          </div>
          <button
            type="button"
            aria-label={t('weather:favorites.remove', 'Remove from favorites')}
            className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-[var(--theme-text-secondary)] hover:bg-[var(--theme-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--theme-accent)]"
            onClick={() => removeFavorite(location)}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      position="right"
      size="small"
      header={header}
      footer={footer}
      ariaLabel={t('weather:favorites.ariaLabel', 'Favorite locations drawer')}
      showBackdrop={true}
      closeOnBackdropClick={true}
      backdropOpacity={0.3}
      data-testid={testId}
    >
      <div className="space-y-3">
        {favorites.length === 0 ? renderEmptyState() : renderFavoritesList()}
      </div>
    </SideDrawer>
  );
};

export default FavoriteLocationsDrawer;
