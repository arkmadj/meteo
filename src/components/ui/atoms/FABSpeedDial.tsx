/**
 * FAB Speed Dial Component
 * An expandable floating action button that reveals multiple action buttons
 * Follows Material Design speed dial pattern with smooth animations
 */

import { XMarkIcon } from '@heroicons/react/24/outline';
import React, { forwardRef, useEffect, useRef, useState } from 'react';

import { useTheme } from '@/design-system/theme';
import { SPACING } from '@/design-system/tokens';
import { usePrefersReducedMotion } from '@/hooks/useMotion';

import FloatingActionButton, { type FABPosition, type FABVariant } from './FloatingActionButton';

// ============================================================================
// TYPES
// ============================================================================

export interface SpeedDialAction {
  /** Unique identifier for the action */
  id: string;
  /** Icon to display */
  icon: React.ReactNode;
  /** Label/tooltip text */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Optional variant */
  variant?: FABVariant;
  /** Optional badge */
  badge?: number | string;
  /** Whether the action is disabled */
  disabled?: boolean;
}

export interface FABSpeedDialProps {
  /** Array of actions to display */
  actions: SpeedDialAction[];
  /** Main FAB icon when closed */
  icon?: React.ReactNode;
  /** Main FAB icon when open */
  openIcon?: React.ReactNode;
  /** Position on screen */
  position?: FABPosition;
  /** Main FAB variant */
  variant?: FABVariant;
  /** Tooltip for main FAB */
  tooltip?: string;
  /** Direction to expand actions */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Custom className */
  className?: string;
  /** ARIA label */
  ariaLabel?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

const FABSpeedDial = forwardRef<HTMLDivElement, FABSpeedDialProps>(
  (
    {
      actions,
      icon = <span className="text-2xl">+</span>,
      openIcon = <XMarkIcon className="h-6 w-6" />,
      position = 'bottom-left',
      variant = 'primary',
      tooltip = 'Quick Actions',
      direction = 'up',
      className = '',
      ariaLabel = 'Speed dial actions',
    },
    _ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const { theme: _theme } = useTheme();
    const prefersReducedMotion = usePrefersReducedMotion();
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    // Close on escape key
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && isOpen) {
          setIsOpen(false);
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    // Calculate action button positions based on direction
    const getActionStyle = (index: number): React.CSSProperties => {
      const offset = (index + 1) * 64; // 64px spacing between buttons (matches design tokens)
      const baseStyle: React.CSSProperties = {
        position: 'absolute',
        transition: prefersReducedMotion
          ? 'opacity 0.1s ease'
          : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transitionDelay: prefersReducedMotion ? '0ms' : `${index * 50}ms`,
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        transform: isOpen ? 'scale(1)' : 'scale(0)',
        transformOrigin: 'center',
      };

      switch (direction) {
        case 'up':
          return { ...baseStyle, bottom: offset };
        case 'down':
          return { ...baseStyle, top: offset };
        case 'left':
          return { ...baseStyle, right: offset };
        case 'right':
          return { ...baseStyle, left: offset };
        default:
          return baseStyle;
      }
    };

    const handleActionClick = (action: SpeedDialAction) => {
      action.onClick();
      setIsOpen(false);
    };

    return (
      <div
        ref={containerRef}
        className={`fixed z-50 ${className}`}
        style={{
          bottom: position.includes('bottom') ? SPACING[6] : undefined,
          top: position.includes('top') ? SPACING[6] : undefined,
          left: position.includes('left') ? SPACING[6] : undefined,
          right: position.includes('right') ? SPACING[6] : undefined,
        }}
        role="group"
        aria-label={ariaLabel}
      >
        {/* Backdrop overlay when open - transparent to keep UI visible */}
        {isOpen && (
          <div
            className="fixed inset-0 z-[-1]"
            style={{
              backgroundColor: 'transparent',
              backdropFilter: prefersReducedMotion ? 'none' : 'blur(0px)',
            }}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Action buttons */}
        <div className="relative">
          {actions.map((action, index) => (
            <div key={action.id} style={getActionStyle(index)}>
              <FloatingActionButton
                icon={action.icon}
                tooltip={action.label}
                variant={action.variant || 'secondary'}
                badge={action.badge}
                disabled={action.disabled}
                onClick={() => handleActionClick(action)}
                position={position}
                size="md"
                className="!relative !bottom-auto !top-auto !left-auto !right-auto"
                aria-label={action.label}
              />
            </div>
          ))}

          {/* Main FAB */}
          <FloatingActionButton
            icon={isOpen ? openIcon : icon}
            tooltip={isOpen ? 'Close' : tooltip}
            variant={variant}
            position={position}
            onClick={() => setIsOpen(!isOpen)}
            className="!relative !bottom-auto !top-auto !left-auto !right-auto"
            aria-label={isOpen ? 'Close speed dial' : 'Open speed dial'}
            aria-expanded={isOpen}
            aria-haspopup="menu"
          />
        </div>
      </div>
    );
  }
);

FABSpeedDial.displayName = 'FABSpeedDial';

export default FABSpeedDial;
