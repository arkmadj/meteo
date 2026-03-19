/**
 * InteractiveCard Component
 * Demonstrates multi-modal interaction design (touch, keyboard, switch devices)
 *
 * Features:
 * - Touch: Tap to activate, swipe to dismiss
 * - Keyboard: Enter/Space to activate, Escape to dismiss
 * - Switch: Sequential navigation with clear focus indicators
 * - Screen Reader: Full ARIA support with announcements
 */

import React, { useState, useRef, useCallback } from 'react';

import { COLORS, SPACING } from '../../../design-system/tokens';

export interface InteractiveCardProps {
  /** Card title */
  title: string;
  /** Card description */
  description?: string;
  /** Icon or image */
  icon?: React.ReactNode;
  /** Whether the card is selected */
  selected?: boolean;
  /** Whether the card is disabled */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Dismiss handler (for swipe/escape) */
  onDismiss?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Test ID */
  testId?: string;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  title,
  description,
  icon,
  selected = false,
  disabled = false,
  onClick,
  onDismiss,
  className = '',
  testId,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  // ============================================================================
  // KEYBOARD NAVIGATION
  // ============================================================================

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          onClick?.();
          break;
        case 'Escape':
          if (onDismiss) {
            e.preventDefault();
            onDismiss();
          }
          break;
      }
    },
    [disabled, onClick, onDismiss]
  );

  // ============================================================================
  // TOUCH GESTURES
  // ============================================================================

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!onDismiss) return;

    // Swipe left to dismiss (threshold: 100px)
    if (touchStart - touchEnd > 100) {
      onDismiss();
    }
  }, [touchStart, touchEnd, onDismiss]);

  // ============================================================================
  // MOUSE/CLICK HANDLERS
  // ============================================================================

  const handleClick = useCallback(() => {
    if (disabled) return;
    onClick?.();
  }, [disabled, onClick]);

  // ============================================================================
  // FOCUS MANAGEMENT
  // ============================================================================

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // ============================================================================
  // STYLES
  // ============================================================================

  const baseStyles: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING[3],
    padding: SPACING[4],
    borderRadius: '12px',
    border: `2px solid ${selected ? COLORS.primary[500] : COLORS.neutral[200]}`,
    backgroundColor: disabled ? COLORS.neutral[50] : COLORS.neutral[0],
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.6 : 1,
    // Minimum touch target size (44px × 44px)
    minHeight: '44px',
    minWidth: '44px',
  };

  const focusStyles: React.CSSProperties = isFocused
    ? {
        outline: `3px solid ${COLORS.primary[500]}`,
        outlineOffset: '2px',
        boxShadow: `0 0 0 4px ${COLORS.primary[100]}`,
      }
    : {};

  const hoverStyles: React.CSSProperties = !disabled
    ? {
        transform: 'translateY(-2px)',
        boxShadow: `0 4px 12px ${COLORS.neutral[200]}`,
      }
    : {};

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`${title}${description ? `: ${description}` : ''}`}
      aria-pressed={selected}
      aria-disabled={disabled}
      data-testid={testId}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={{
        ...baseStyles,
        ...focusStyles,
        ...(isFocused ? {} : hoverStyles),
      }}
      className={className}
    >
      {/* Icon */}
      {icon && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: selected ? COLORS.primary[100] : COLORS.neutral[100],
            color: selected ? COLORS.primary[600] : COLORS.neutral[600],
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1 }}>
        {/* Title */}
        <h3
          style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 600,
            color: COLORS.neutral[900],
            lineHeight: 1.5,
          }}
        >
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p
            style={{
              margin: `${SPACING[2]} 0 0 0`,
              fontSize: '14px',
              color: COLORS.neutral[600],
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Selected Indicator */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            top: SPACING[2],
            right: SPACING[2],
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: COLORS.primary[500],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-hidden="true"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}

      {/* Swipe Hint (visible on touch devices) */}
      {onDismiss && !disabled && (
        <div
          style={{
            position: 'absolute',
            bottom: SPACING[2],
            right: SPACING[2],
            fontSize: '12px',
            color: COLORS.neutral[400],
          }}
          aria-hidden="true"
        >
          ← Swipe to dismiss
        </div>
      )}

      {/* Screen Reader Instructions */}
      <span className="sr-only">
        {disabled
          ? 'This card is disabled'
          : `Press Enter or Space to ${selected ? 'deselect' : 'select'}. ${onDismiss ? 'Press Escape to dismiss.' : ''}`}
      </span>
    </div>
  );
};

InteractiveCard.displayName = 'InteractiveCard';

export default InteractiveCard;
