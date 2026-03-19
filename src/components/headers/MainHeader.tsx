/**
 * MainHeader Component
 * A reusable header component that provides consistent styling, structure, and behavior across all pages.
 * Supports title, subtitle, navigation buttons, and theme toggle.
 *
 * Theme-aware implementation using CSS custom properties for dynamic light/dark mode support.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/atoms';
import { Container } from '@/components/ui/layout';
import ThemeToggle from '@/components/ui/preferences/ThemeToggle';
import { useTheme } from '@/design-system/theme';

// ============================================================================
// TYPES
// ============================================================================

export interface NavigationButton {
  /** Button label */
  label: string;
  /** Navigation path */
  to: string;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  /** Button size */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Optional icon */
  icon?: string;
}

export interface MainHeaderProps {
  /** Page title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Navigation buttons to display */
  navigationButtons?: NavigationButton[];
  /** Show theme toggle */
  showThemeToggle?: boolean;
  /** Container size */
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Make header sticky on scroll */
  sticky?: boolean;
  /** Custom className for header */
  className?: string;
  /** Custom className for title */
  titleClassName?: string;
  /** Custom className for subtitle */
  subtitleClassName?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

const MainHeader: React.FC<MainHeaderProps> = ({
  title,
  subtitle,
  navigationButtons = [],
  showThemeToggle = true,
  containerSize = 'xl',
  sticky = false,
  className = '',
  titleClassName = '',
  subtitleClassName = '',
}) => {
  // ============================================================================
  // HOOKS
  // ============================================================================

  const { theme } = useTheme();
  const [_isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Handle scroll detection for sticky header
  useEffect(() => {
    if (!sticky) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sticky]);

  // ============================================================================
  // STYLES - Theme-aware using CSS custom properties
  // ============================================================================

  // Theme-aware CSS classes using CSS custom properties
  const themeClasses = {
    background: 'bg-[var(--theme-surface)]',
    text: 'text-[var(--theme-text)]',
    textSecondary: 'text-[var(--theme-text-secondary)]',
    border: 'border-[var(--theme-border)]',
    shadow: 'shadow-[0_1px_3px_var(--theme-shadow)]',
  };

  const headerClasses = [
    themeClasses.background,
    'border-b',
    themeClasses.border,
    'transition-colors',
    'duration-200',
    'ease-in-out',
    'w-full',
    'z-50',
    // Sticky positioning with stable layout
    sticky ? 'sticky top-0' : '',
    // Consistent shadow and backdrop blur for stable layout
    sticky ? 'shadow-sm backdrop-blur-sm' : themeClasses.shadow,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const titleClasses = [
    'text-2xl',
    'font-bold',
    themeClasses.text,
    'transition-colors',
    'duration-200',
    titleClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const subtitleClasses = [
    'text-sm',
    'mt-1',
    themeClasses.textSecondary,
    'transition-colors',
    'duration-200',
    subtitleClassName,
  ]
    .filter(Boolean)
    .join(' ');

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <header
      ref={headerRef}
      className={headerClasses}
      data-theme={theme.isDark ? 'dark' : 'light'}
      role="banner"
      style={
        sticky
          ? {
              willChange: 'transform',
              transform: 'translateZ(0)',
            }
          : undefined
      }
    >
      <Container size={containerSize} className="py-4">
        <div className="flex items-center justify-between">
          {/* Title and Subtitle */}
          <div className="flex-1 min-w-0">
            <h1 className={titleClasses}>{title}</h1>
            {subtitle && <p className={subtitleClasses}>{subtitle}</p>}
          </div>

          {/* Navigation Buttons and Theme Toggle */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Theme Toggle */}
            {showThemeToggle && <ThemeToggle variant="compact" showTooltip={true} />}

            {/* Navigation Buttons */}
            {navigationButtons.map((button, index) => (
              <Link key={`${button.to}-${index}`} to={button.to}>
                <Button variant={button.variant || 'secondary'} size={button.size || 'sm'}>
                  {button.icon && <span className="mr-1">{button.icon}</span>}
                  {button.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </header>
  );
};

MainHeader.displayName = 'MainHeader';

export default MainHeader;
