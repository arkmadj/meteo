/**
 * Snackbar Container Component
 * Manages the display and positioning of all active snackbars
 * Supports both queue mode (one at a time) and stack mode (multiple with offsets)
 * Responsive across mobile, tablet, and desktop breakpoints
 */

import React from 'react';

import { SPACING } from '@/design-system/tokens';
import { useSnackbar, type SnackbarPosition } from '@/contexts/SnackbarContext';
import { useBreakpoint, type Breakpoint } from '@/hooks/useBreakpoint';

import Snackbar from './Snackbar';

/**
 * Get responsive spacing based on breakpoint
 */
const getResponsiveSpacing = (breakpoint: Breakpoint) => {
  const spacing = {
    mobile: SPACING[2], // 8px
    tablet: SPACING[4], // 16px
    desktop: SPACING[5], // 20px
  };
  return spacing[breakpoint];
};

/**
 * Get position-specific styles with responsive spacing
 */
const getPositionStyles = (
  position: SnackbarPosition,
  breakpoint: Breakpoint
): React.CSSProperties => {
  const spacing = getResponsiveSpacing(breakpoint);

  const baseStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING[2],
    pointerEvents: 'none',
    // Safe area insets for mobile devices (notches, home indicators)
    paddingTop: 'env(safe-area-inset-top)',
    paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: 'env(safe-area-inset-left)',
    paddingRight: 'env(safe-area-inset-right)',
  };

  const positions: Record<SnackbarPosition, React.CSSProperties> = {
    'top-left': {
      ...baseStyles,
      top: spacing,
      left: spacing,
      alignItems: breakpoint === 'mobile' ? 'center' : 'flex-start',
    },
    'top-center': {
      ...baseStyles,
      top: spacing,
      left: '50%',
      transform: 'translateX(-50%)',
      alignItems: 'center',
    },
    'top-right': {
      ...baseStyles,
      top: spacing,
      right: spacing,
      alignItems: breakpoint === 'mobile' ? 'center' : 'flex-end',
    },
    'bottom-left': {
      ...baseStyles,
      bottom: spacing,
      left: spacing,
      alignItems: breakpoint === 'mobile' ? 'center' : 'flex-start',
      flexDirection: 'column-reverse',
    },
    'bottom-center': {
      ...baseStyles,
      bottom: spacing,
      left: '50%',
      transform: 'translateX(-50%)',
      alignItems: 'center',
      flexDirection: 'column-reverse',
    },
    'bottom-right': {
      ...baseStyles,
      bottom: spacing,
      right: spacing,
      alignItems: breakpoint === 'mobile' ? 'center' : 'flex-end',
      flexDirection: 'column-reverse',
    },
  };

  return positions[position];
};

/**
 * Snackbar Container Component
 */
const SnackbarContainer: React.FC = () => {
  const { snackbarState, removeSnackbar } = useSnackbar();
  const { snackbars, position, displayMode, stackOffset } = snackbarState;
  const breakpoint = useBreakpoint();

  // Don't render if no snackbars
  if (snackbars.length === 0) {
    return null;
  }

  // Determine aria-live value based on highest priority snackbar variant
  // Error and warning are assertive (interrupt screen reader immediately)
  // Info and success are polite (wait for screen reader to finish)
  const hasUrgentMessage = snackbars.some(
    snackbar => snackbar.variant === 'error' || snackbar.variant === 'warning'
  );
  const ariaLive = hasUrgentMessage ? 'assertive' : 'polite';

  // Queue mode: show only one snackbar at a time
  if (displayMode === 'queue') {
    return (
      <div
        className="snackbar-container snackbar-container--queue"
        style={getPositionStyles(position, breakpoint)}
        aria-live={ariaLive}
        aria-atomic="false"
        role="region"
        aria-label="Notifications"
      >
        {snackbars.map(snackbar => (
          <Snackbar
            key={snackbar.id}
            snackbar={snackbar}
            onClose={removeSnackbar}
            index={0}
            displayMode="queue"
          />
        ))}
      </div>
    );
  }

  // Stack mode: show multiple snackbars with offsets
  return (
    <div
      className="snackbar-container snackbar-container--stack"
      style={getPositionStyles(position, breakpoint)}
      aria-live={ariaLive}
      aria-atomic="false"
      role="region"
      aria-label="Notifications"
    >
      {snackbars.map((snackbar, index) => (
        <Snackbar
          key={snackbar.id}
          snackbar={snackbar}
          onClose={removeSnackbar}
          index={index}
          totalCount={snackbars.length}
          stackOffset={stackOffset}
          displayMode="stack"
        />
      ))}
    </div>
  );
};

export default SnackbarContainer;
