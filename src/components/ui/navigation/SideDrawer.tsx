/**
 * Reusable Side Drawer Component
 *
 * A flexible, accessible side drawer with smooth transitions and theme support.
 * Supports multiple positions, sizes, and customization options.
 */

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useTheme } from '@/design-system/theme';

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'small' | 'medium' | 'large' | 'full';
export type DrawerVariant = 'default' | 'overlay' | 'push' | 'persistent';

export interface SideDrawerProps {
  /** Whether the drawer is open */
  isOpen: boolean;

  /** Callback when drawer should close */
  onClose: () => void;

  /** Drawer content */
  children: React.ReactNode;

  /** Position of the drawer */
  position?: DrawerPosition;

  /** Size of the drawer */
  size?: DrawerSize;

  /** Visual variant */
  variant?: DrawerVariant;

  /** Whether to show backdrop overlay */
  showBackdrop?: boolean;

  /** Whether clicking backdrop closes drawer */
  closeOnBackdropClick?: boolean;

  /** Whether pressing Escape closes drawer */
  closeOnEscape?: boolean;

  /** Custom backdrop opacity (0-1) */
  backdropOpacity?: number;

  /** Animation duration in milliseconds */
  animationDuration?: number;

  /** Custom z-index */
  zIndex?: number;

  /** Custom className for drawer */
  className?: string;

  /** Custom className for backdrop */
  backdropClassName?: string;

  /** Header content */
  header?: React.ReactNode;

  /** Footer content */
  footer?: React.ReactNode;

  /** Whether to show close button */
  showCloseButton?: boolean;

  /** Custom close button content */
  closeButtonContent?: React.ReactNode;

  /** Callback when drawer starts opening */
  onOpen?: () => void;

  /** Callback when drawer finishes opening */
  onOpened?: () => void;

  /** Callback when drawer starts closing */
  onClosing?: () => void;

  /** Callback when drawer finishes closing */
  onClosed?: () => void;

  /** Whether to lock body scroll when open */
  lockBodyScroll?: boolean;

  /** Whether to trap focus inside drawer */
  trapFocus?: boolean;

  /** ARIA label for accessibility */
  ariaLabel?: string;

  /** ARIA labelledby for accessibility */
  ariaLabelledBy?: string;

  /** Test ID for testing */
  'data-testid'?: string;
}

/**
 * Get drawer size in pixels or percentage
 */
const getDrawerSize = (size: DrawerSize, position: DrawerPosition): string => {
  const isVertical = position === 'left' || position === 'right';

  const sizes = {
    small: isVertical ? '320px' : '30vh',
    medium: isVertical ? '480px' : '50vh',
    large: isVertical ? '640px' : '70vh',
    full: isVertical ? '100vw' : '100vh',
  };

  return sizes[size];
};

/**
 * Get transform value for drawer position
 */
const getTransform = (position: DrawerPosition, isOpen: boolean): string => {
  if (isOpen) return 'translate(0, 0)';

  const transforms = {
    left: 'translateX(-100%)',
    right: 'translateX(100%)',
    top: 'translateY(-100%)',
    bottom: 'translateY(100%)',
  };

  return transforms[position];
};

/**
 * SideDrawer Component
 */
export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  children,
  position = 'right',
  size = 'medium',
  variant = 'overlay',
  showBackdrop = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  backdropOpacity = 0.5,
  animationDuration = 300,
  zIndex = 1000,
  className = '',
  backdropClassName = '',
  header,
  footer,
  showCloseButton = true,
  closeButtonContent,
  onOpen,
  onOpened,
  onClosing,
  onClosed,
  lockBodyScroll = true,
  trapFocus = true,
  ariaLabel,
  ariaLabelledBy,
  'data-testid': testId,
}) => {
  const { theme } = useTheme();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Get actual theme mode
  const themeMode =
    theme.mode === 'auto'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme.mode;

  // Handle mount/unmount for animations
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setIsAnimating(true);
      onOpen?.();

      const timer = setTimeout(() => {
        setIsAnimating(false);
        onOpened?.();
      }, animationDuration);

      return () => clearTimeout(timer);
    } else if (isMounted) {
      setIsAnimating(true);
      onClosing?.();

      const timer = setTimeout(() => {
        setIsMounted(false);
        setIsAnimating(false);
        onClosed?.();
      }, animationDuration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, animationDuration, onOpen, onOpened, onClosing, onClosed]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (lockBodyScroll && isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, lockBodyScroll]);

  // Handle Escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus trap
  useEffect(() => {
    if (!trapFocus || !isOpen || !drawerRef.current) return;

    const drawer = drawerRef.current;
    const focusableElements = drawer.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus first element
    firstElement?.focus();

    drawer.addEventListener('keydown', handleTab as EventListener);
    return () => drawer.removeEventListener('keydown', handleTab as EventListener);
  }, [isOpen, trapFocus]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Don't render if not mounted
  if (!isMounted && !isOpen) return null;

  const drawerSize = getDrawerSize(size, position);
  const transform = getTransform(position, isOpen);

  const isVertical = position === 'left' || position === 'right';
  const isHorizontal = position === 'top' || position === 'bottom';

  const content = (
    <>
      {/* Backdrop */}
      {showBackdrop && (
        <div
          className={`side-drawer-backdrop ${backdropClassName}`}
          onClick={handleBackdropClick}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: themeMode === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
            opacity: isOpen ? backdropOpacity : 0,
            transition: `opacity ${animationDuration}ms ease-in-out`,
            zIndex: zIndex - 1,
            pointerEvents: isOpen ? 'auto' : 'none',
          }}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`side-drawer side-drawer-${position} side-drawer-${variant} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        data-testid={testId}
        style={{
          position: 'fixed',
          ...(position === 'left' && { left: 0, top: 0, bottom: 0 }),
          ...(position === 'right' && { right: 0, top: 0, bottom: 0 }),
          ...(position === 'top' && { top: 0, left: 0, right: 0 }),
          ...(position === 'bottom' && { bottom: 0, left: 0, right: 0 }),
          width: isVertical ? drawerSize : '100%',
          height: isHorizontal ? drawerSize : '100%',
          backgroundColor: themeMode === 'dark' ? '#1f2937' : '#ffffff',
          boxShadow:
            themeMode === 'dark' ? '0 0 20px rgba(0, 0, 0, 0.5)' : '0 0 20px rgba(0, 0, 0, 0.1)',
          transform,
          transition: `transform ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          zIndex,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        {(header || showCloseButton) && (
          <div
            className="side-drawer-header"
            style={{
              padding: '1rem',
              borderBottom: `1px solid ${themeMode === 'dark' ? '#374151' : '#e5e7eb'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            {header}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="side-drawer-close-button"
                aria-label="Close drawer"
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  background: 'transparent',
                  color: themeMode === 'dark' ? '#9ca3af' : '#6b7280',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  lineHeight: 1,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor =
                    themeMode === 'dark' ? '#374151' : '#f3f4f6';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {closeButtonContent || '✕'}
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className="side-drawer-content"
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '1rem',
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="side-drawer-footer"
            style={{
              padding: '1rem',
              borderTop: `1px solid ${themeMode === 'dark' ? '#374151' : '#e5e7eb'}`,
              flexShrink: 0,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </>
  );

  // Render via a portal so the drawer is decoupled from layout containers
  // like the sticky header and always behaves as a viewport overlay.
  if (typeof document === 'undefined') {
    return content as unknown as JSX.Element;
  }

  return createPortal(content, document.body);
};

export default SideDrawer;
