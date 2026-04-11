import { ChevronUpIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useTheme } from '@/design-system/theme';

/**
 * Navigation item for About page sections
 */
export interface AboutNavItem {
  id: string;
  label: string;
  icon: string;
}

/**
 * Props for AboutPageNav component
 */
export interface AboutPageNavProps {
  items: AboutNavItem[];
  className?: string;
  onNavigate?: (id: string) => void;
}

/**
 * Side navigation component for About page
 * Provides quick access to different content sections with scroll spy
 * Updates URL hash for shareable section links
 * Fully theme-aware with global accent color integration
 */
const AboutPageNav: React.FC<AboutPageNavProps> = ({ items, className = '', onNavigate }) => {
  const { theme, accentColor } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>(items[0]?.id || '');

  // Theme-aware classes
  const isDark = theme.isDark;

  /**
   * Scroll to section smoothly and update URL hash
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

      // Update URL hash without triggering a page reload
      void navigate(`${location.pathname}#${id}`, { replace: true });

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
   * Scroll spy - track which section is currently visible and update URL hash
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
              // Update URL hash without triggering a page reload
              const currentHash = location.hash.replace('#', '');
              if (currentHash !== newActiveSection) {
                void navigate(`${location.pathname}#${newActiveSection}`, { replace: true });
              }
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
  }, [items, activeSection, location.pathname, location.hash, navigate]);

  return (
    <nav
      className={`sticky ${className}`}
      aria-label="About page navigation"
      role="navigation"
      style={{
        top: '100px',
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
    >
      <div
        className={`
          rounded-lg border p-4
          transition-colors duration-200
          ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          shadow-sm
        `}
        style={{
          backgroundColor: 'var(--theme-surface)',
          borderColor: 'var(--theme-border)',
        }}
      >
        <h3
          className={`
            text-sm font-semibold mb-3 uppercase tracking-wider
            transition-colors duration-200
            ${isDark ? 'text-gray-300' : 'text-gray-700'}
          `}
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          On This Page
        </h3>

        <ul className="space-y-1" role="list">
          {items.map(item => {
            const isActive = activeSection === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => scrollToSection(item.id)}
                  onKeyDown={e => handleKeyDown(e, item.id)}
                  className={`
                    w-full text-left px-3 py-2 rounded-md text-sm
                    transition-all duration-200
                    flex items-center gap-2
                    ${
                      isActive
                        ? isDark
                          ? 'hover:bg-gray-700/50'
                          : 'hover:bg-gray-100'
                        : isDark
                          ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${isDark ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}
                  `}
                  style={
                    {
                      backgroundColor: isActive
                        ? isDark
                          ? `${accentColor}20`
                          : `${accentColor}10`
                        : undefined,
                      color: isActive
                        ? isDark
                          ? accentColor
                          : `${accentColor}cc`
                        : 'var(--theme-text-secondary)',
                      borderLeftColor: isActive ? accentColor : undefined,
                      borderLeftWidth: isActive ? '2px' : undefined,
                      borderLeftStyle: isActive ? 'solid' : undefined,
                      '--tw-ring-color': accentColor,
                    } as React.CSSProperties
                  }
                  aria-current={isActive ? 'location' : undefined}
                  aria-label={`Go to ${item.label}`}
                  type="button"
                  tabIndex={0}
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
        className={`
          mt-4 w-full px-3 py-2 rounded-md text-sm font-medium
          transition-all duration-200
          flex items-center justify-center gap-2
          ${
            isDark
              ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${isDark ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-gray-50'}
        `}
        style={
          {
            backgroundColor: 'var(--theme-surface)',
            borderColor: 'var(--theme-border)',
            color: 'var(--theme-text-secondary)',
            '--tw-ring-color': accentColor,
          } as React.CSSProperties
        }
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = 'var(--theme-hover)';
          e.currentTarget.style.color = 'var(--theme-text)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'var(--theme-surface)';
          e.currentTarget.style.color = 'var(--theme-text-secondary)';
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

export default AboutPageNav;
