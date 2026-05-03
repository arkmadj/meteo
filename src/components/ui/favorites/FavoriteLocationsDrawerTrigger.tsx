import React, { useState } from 'react';

import useFavoriteLocations from '@/hooks/useFavoriteLocations';
import FavoriteLocationsDrawer from './FavoriteLocationsDrawer';

export interface FavoriteLocationsDrawerTriggerProps {
  /** Optional callback when a favorite location is selected from the drawer. */
  onSelectLocation?: (location: string) => void;
  /** Optional className to customize the trigger button. */
  className?: string;
}

const FavoriteLocationsDrawerTrigger: React.FC<FavoriteLocationsDrawerTriggerProps> = ({
  onSelectLocation,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { favorites } = useFavoriteLocations();

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSelectLocation = (location: string) => {
    if (onSelectLocation) {
      onSelectLocation(location);
    }
  };

  const hasFavorites = favorites.length > 0;

  const baseClasses = [
    'inline-flex items-center',
    'rounded-full border',
    'px-3 py-1.5',
    'text-xs sm:text-sm font-medium',
    'transition-colors transition-shadow duration-150',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
  ].join(' ');

  const stateClasses = hasFavorites
    ? 'bg-[var(--theme-accent)]/10 text-[var(--theme-accent)] border-[var(--theme-accent)] focus-visible:ring-[var(--theme-accent)]'
    : 'bg-[var(--theme-surface)] text-[var(--theme-text-secondary)] border-[var(--theme-border)] hover:bg-[var(--theme-hover)] focus-visible:ring-[var(--theme-primary)]';

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Open favorite locations drawer"
        className={`${baseClasses} ${stateClasses} ${className}`}
      >
        <span className="mr-1.5 inline-flex items-center justify-center">
          <svg
            aria-hidden="true"
            className="w-4 h-4"
            fill={hasFavorites ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.89a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.89a1 1 0 00-1.176 0l-3.976 2.89c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.978 10.1c-.783-.57-.38-1.81.588-1.81h4.916a1 1 0 00.95-.69l1.517-4.674z" />
          </svg>
        </span>
        <span className="hidden sm:inline">Favorites</span>
        {hasFavorites && (
          <span className="ml-1 inline-flex items-center justify-center rounded-full bg-[var(--theme-accent)] text-white text-[0.7rem] leading-none px-1.5 py-0.5 min-w-[1.25rem]">
            {favorites.length}
          </span>
        )}
      </button>

      <FavoriteLocationsDrawer
        isOpen={isOpen}
        onClose={handleClose}
        onSelectLocation={handleSelectLocation}
      />
    </>
  );
};

export default FavoriteLocationsDrawerTrigger;
