import { ChevronUpIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

import { useTheme } from '@/design-system/theme';

/**
 * Navigation item for Conditional Loading Demo sections
 */
export interface ConditionalLoadingNavItem {
  id: string;
  label: string;
  icon: string;
}

/**
 * Props for ConditionalLoadingNav component
 */
export interface ConditionalLoadingNavProps {
  items: ConditionalLoadingNavItem[];
  className?: string;
  onNavigate?: (id: string) => void;
}

/**
 * Side navigation component for Conditional Loading Demo
 * Provides quick access to different demo sections with scroll spy
 * Features:
 * - Smooth scrolling to sections
 * - Active section highlighting with accent colors
 * - Keyboard navigation (Enter/Space)
 * - ARIA attributes for accessibility
 * - Theme-aware styling with cohesive accent color integration
 */
const ConditionalLoadingNav: React.FC<ConditionalLoadingNavProps> = ({
  items,
  className = '',
  onNavigate,
}) => {
  const { theme, accentColor } = useTheme();
  const [activeSection, setActiveSection] = useState<string>(items[0]?.id || '');

  // Theme-aware classes
  const isDark = theme.isDark;

  /**
   * Scroll to section smoothly
   */
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      setActiveSection(id);
      onNavigate?.(id);
    }
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollToSection(id);
    }
  };

  /**
   * Scroll spy - track which section is currently visible
   */
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150; // Offset for header

      // Find the section that's currently in view
      for (let i = items.length - 1; i >= 0; i--) {
        const section = document.getElementById(items[i].id);
        if (section) {
          const sectionTop = section.offsetTop;
          if (scrollPosition >= sectionTop) {
            const newActiveSection = items[i].id;
            if (newActiveSection !== activeSection) {
              setActiveSection(newActiveSection);
            }
            break;
          }
        }
      }
    };

    // Add scroll listener with throttling
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollListener);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', scrollListener);
  }, [items, activeSection]);

  return (
    <nav
      className={`sticky top-24 ${className}`}
      aria-label="Conditional loading demo navigation"
      role="navigation"
    >
      <div
        className="rounded-lg border p-4 shadow-sm transition-all duration-200"
        style={{
          backgroundColor: 'var(--theme-surface)',
          borderColor: 'var(--theme-border)',
        }}
      >
        <h3
          className="text-sm font-semibold mb-3 uppercase tracking-wider"
          style={{
            color: 'var(--theme-text-secondary)',
          }}
        >
          Quick Navigation
        </h3>

        <ul className="space-y-1" role="list">
          {items.map(item => {
            const isActive = activeSection === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => scrollToSection(item.id)}
                  onKeyDown={e => handleKeyDown(e, item.id)}
                  className="w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={
                    isActive
                      ? {
                          backgroundColor: `rgba(var(--theme-accent-rgb), ${isDark ? '0.2' : '0.1'})`,
                          color: isDark ? accentColor : 'var(--theme-accent)',
                          borderLeft: `3px solid ${accentColor}`,
                          paddingLeft: 'calc(0.75rem - 3px)',
                          boxShadow: `0 2px 8px rgba(var(--theme-accent-rgb), 0.15)`,
                        }
                      : {
                          color: 'var(--theme-text-secondary)',
                          borderLeft: '3px solid transparent',
                          paddingLeft: 'calc(0.75rem - 3px)',
                        }
                  }
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--theme-hover)';
                      e.currentTarget.style.color = 'var(--theme-text)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--theme-text-secondary)';
                    }
                  }}
                  aria-current={isActive ? 'location' : undefined}
                  type="button"
                >
                  <span className="text-base" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: accentColor,
                        boxShadow: `0 0 4px ${accentColor}`,
                      }}
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Back to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="mt-4 w-full px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{
          backgroundColor: 'var(--theme-surface)',
          color: 'var(--theme-text-secondary)',
          border: '1px solid var(--theme-border)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = `rgba(var(--theme-accent-rgb), 0.1)`;
          e.currentTarget.style.color = accentColor;
          e.currentTarget.style.borderColor = accentColor;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'var(--theme-surface)';
          e.currentTarget.style.color = 'var(--theme-text-secondary)';
          e.currentTarget.style.borderColor = 'var(--theme-border)';
        }}
        aria-label="Scroll to top"
        type="button"
      >
        <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
        <span>Back to Top</span>
      </button>
    </nav>
  );
};

export default ConditionalLoadingNav;
