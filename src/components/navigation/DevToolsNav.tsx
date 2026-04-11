/**
 * Quick Navigation Component
 * Provides quick access to key app sections via a floating action button
 * and a compact navigation card
 */

import { ArrowRightIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { Card } from '@/components/ui/atoms';
import FloatingActionButton from '@/components/ui/atoms/FloatingActionButton';
import { useTheme } from '@/design-system/theme';

// ============================================================================
// TYPES
// ============================================================================

interface QuickNavItem {
  path: string;
  label: string;
  icon: string;
  description: string;
  badge?: number | string;
  developmentOnly?: boolean;
}

interface QuickNavProps {
  /** Position of the FAB */
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  /** Custom class name */
  className?: string;
}

// ============================================================================
// QUICK NAVIGATION CONFIGURATION
// ============================================================================

const quickNavItems: QuickNavItem[] = [
  {
    path: '/weather/compare',
    label: 'Compare',
    icon: '⚖️',
    description: 'Compare weather across cities',
  },
  {
    path: '/about',
    label: 'About',
    icon: 'ℹ️',
    description: 'About this app',
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: '⚙️',
    description: 'App preferences',
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

const QuickNav: React.FC<QuickNavProps> = ({ position = 'bottom-right', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme: _theme } = useTheme();
  const location = useLocation();
  const cardRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  // Toggle function for keyboard shortcut
  const toggleQuickNav = React.useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Expose toggle function globally for keyboard shortcut
  useEffect(() => {
    // Store the toggle function on window for global access
    (window as unknown as Record<string, unknown>).__toggleQuickNav = toggleQuickNav;

    return () => {
      delete (window as unknown as Record<string, unknown>).__toggleQuickNav;
    };
  }, [toggleQuickNav]);

  // Filter items based on environment
  const filteredItems = quickNavItems.filter(item => {
    if (item.developmentOnly && process.env.NODE_ENV !== 'development') {
      return false;
    }
    return true;
  });

  // Close card when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        cardRef.current &&
        fabRef.current &&
        !cardRef.current.contains(event.target as Node) &&
        !fabRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close card when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close card on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Check if current path is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Calculate card position based on FAB position
  const getCardPosition = () => {
    const baseClasses = 'fixed z-50 transition-all duration-300';

    if (!isOpen) {
      return `${baseClasses} opacity-0 pointer-events-none scale-95`;
    }

    const positionClasses = {
      'bottom-left': 'bottom-20 left-6',
      'bottom-right': 'bottom-20 right-6',
      'top-left': 'top-20 left-6',
      'top-right': 'top-20 right-6',
    };

    return `${baseClasses} ${positionClasses[position]} opacity-100 scale-100`;
  };

  return (
    <>
      {/* Floating Action Button */}
      <FloatingActionButton
        ref={fabRef}
        position={position}
        variant="primary"
        size="md"
        icon={isOpen ? <XMarkIcon className="h-6 w-6" /> : <span className="text-2xl">🧭</span>}
        tooltip={isOpen ? 'Close Quick Nav' : 'Open Quick Nav'}
        onClick={() => setIsOpen(!isOpen)}
        className={className}
        aria-label={isOpen ? 'Close quick navigation' : 'Open quick navigation'}
        aria-expanded={isOpen}
        aria-controls="quick-nav-card"
      />

      {/* Navigation Card */}
      <div
        ref={cardRef}
        id="quick-nav-card"
        className={getCardPosition()}
        role="dialog"
        aria-label="Quick navigation"
        aria-modal="true"
      >
        <Card shadow="xl" padding="none" className="w-80 max-w-[calc(100vw-3rem)] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[var(--theme-border)] bg-[var(--theme-hover)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">
                  🧭
                </span>
                <h3 className="text-base font-semibold text-[var(--theme-text)]">Quick Links</h3>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <span className="px-2 py-0.5 text-xs font-medium bg-[var(--theme-primary-bg)] text-[var(--theme-primary-text)] rounded-full border border-[var(--theme-primary-border)]">
                  DEV
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--theme-text-secondary)] mt-1">
              Quick access to key app sections
            </p>
          </div>

          {/* Navigation Items */}
          <nav className="py-2 max-h-[60vh] overflow-y-auto" aria-label="Quick navigation menu">
            {filteredItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3
                  transition-colors duration-200
                  hover:bg-[var(--theme-hover)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-border)] focus:ring-inset
                  ${
                    isActive(item.path)
                      ? 'bg-[var(--theme-primary-bg)] border-l-4 border-[var(--theme-primary-border)] text-[var(--theme-primary-text)] font-medium'
                      : 'text-[var(--theme-text)] border-l-4 border-transparent'
                  }
                `}
                onClick={() => setIsOpen(false)}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                <span className="text-2xl flex-shrink-0" aria-hidden="true">
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm ${isActive(item.path) ? 'font-semibold' : 'font-medium'}`}
                    >
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className="px-1.5 py-0.5 text-xs font-semibold bg-[var(--theme-error-bg)] text-[var(--theme-error-text)] rounded-full border border-[var(--theme-error-text)]"
                        aria-label={`${item.badge} notifications`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--theme-text-secondary)] truncate">
                    {item.description}
                  </p>
                </div>
                {isActive(item.path) && (
                  <CheckIcon
                    className="h-5 w-5 text-[var(--theme-primary-text)] flex-shrink-0"
                    aria-hidden="true"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-[var(--theme-border)] bg-[var(--theme-hover)]">
            <div className="flex items-center justify-between text-xs text-[var(--theme-text-secondary)]">
              <div className="flex flex-col gap-0.5">
                <span>
                  <kbd className="px-1.5 py-0.5 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded text-[10px] font-mono text-[var(--theme-text)]">
                    {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+D
                  </kbd>{' '}
                  to toggle
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded text-[10px] font-mono text-[var(--theme-text)]">
                    ESC
                  </kbd>{' '}
                  to close
                </span>
              </div>
              <Link
                to="/"
                className="text-[var(--theme-primary-text)] hover:text-[var(--theme-primary-text-hover)] font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-border)] rounded px-1"
                onClick={() => setIsOpen(false)}
              >
                <span className="flex items-center gap-1">
                  Home <ArrowRightIcon className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Backdrop (optional, for mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[var(--theme-backdrop)] z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default QuickNav;
export type { QuickNavItem, QuickNavProps };
