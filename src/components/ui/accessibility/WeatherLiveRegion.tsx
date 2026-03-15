/**
 * WeatherLiveRegion Component
 *
 * Dedicated ARIA live region for weather announcements.
 * Prevents redundant or disruptive screen reader output by:
 * - Using a single, centralized live region
 * - Clearing announcements after they've been read
 * - Supporting both polite and assertive announcements
 * - Maintaining proper focus management
 */

import React, { useEffect, useRef, useState } from 'react';

import type { WeatherAnnouncement } from '@/hooks/app/useWeatherAnnouncement';

export interface WeatherLiveRegionProps {
  /** Current announcement to display */
  announcement: WeatherAnnouncement | null;
  /** Callback when announcement has been processed */
  onAnnouncementProcessed?: () => void;
  /** Time to keep announcement visible before clearing (ms) */
  announcementDuration?: number;
  /** Additional CSS class */
  className?: string;
  /** ID for the live region (for aria-describedby references) */
  id?: string;
}

/**
 * Auto-clearing delay for announcements
 * Give screen readers enough time to read the message
 */
const DEFAULT_ANNOUNCEMENT_DURATION = 5000;

/**
 * Minimum delay between announcement updates to prevent rapid-fire
 */
const MIN_UPDATE_INTERVAL = 1000;

export const WeatherLiveRegion: React.FC<WeatherLiveRegionProps> = ({
  announcement,
  onAnnouncementProcessed,
  announcementDuration = DEFAULT_ANNOUNCEMENT_DURATION,
  className = '',
  id = 'weather-live-region',
}) => {
  const [displayedAnnouncement, setDisplayedAnnouncement] = useState<WeatherAnnouncement | null>(
    null
  );
  const lastUpdateRef = useRef<number>(0);
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const politeRegionRef = useRef<HTMLDivElement>(null);
  const assertiveRegionRef = useRef<HTMLDivElement>(null);

  /**
   * Handle new announcements with debouncing
   */
  useEffect(() => {
    if (!announcement) return;

    const now = Date.now();

    // Prevent rapid updates (unless assertive - those are important)
    if (
      announcement.politeness !== 'assertive' &&
      now - lastUpdateRef.current < MIN_UPDATE_INTERVAL
    ) {
      return;
    }

    // Clear any pending timeout
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
    }

    lastUpdateRef.current = now;
    setDisplayedAnnouncement(announcement);

    // Auto-clear announcement after duration
    clearTimeoutRef.current = setTimeout(() => {
      setDisplayedAnnouncement(null);
      onAnnouncementProcessed?.();
    }, announcementDuration);

    return () => {
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
    };
  }, [announcement, announcementDuration, onAnnouncementProcessed]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
    };
  }, []);

  // Screen reader only styles
  const srOnlyStyles: React.CSSProperties = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  };

  const politeMessage =
    displayedAnnouncement?.politeness === 'polite' ? displayedAnnouncement.message : '';
  const assertiveMessage =
    displayedAnnouncement?.politeness === 'assertive' ? displayedAnnouncement.message : '';

  return (
    <>
      {/* Polite announcements - wait for screen reader to finish current speech */}
      <div
        ref={politeRegionRef}
        id={`${id}-polite`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-relevant="additions text"
        style={srOnlyStyles}
        className={className}
      >
        {politeMessage}
      </div>

      {/* Assertive announcements - interrupt screen reader immediately */}
      <div
        ref={assertiveRegionRef}
        id={`${id}-assertive`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        aria-relevant="additions text"
        style={srOnlyStyles}
        className={className}
      >
        {assertiveMessage}
      </div>
    </>
  );
};

WeatherLiveRegion.displayName = 'WeatherLiveRegion';

export default WeatherLiveRegion;

