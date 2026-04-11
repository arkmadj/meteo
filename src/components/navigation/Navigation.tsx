import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { XMarkIcon } from '@heroicons/react/24/outline';

import { Button } from '@/components/ui/atoms';

/**
 * Navigation item interface
 */
interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  description?: string;
  external?: boolean;
  developmentOnly?: boolean;
}

/**
 * Navigation configuration
 */
const navigationItems: NavigationItem[] = [
  {
    path: '/',
    label: 'Home',
    icon: '🏠',
    description: 'Main weather app',
  },
  {
    path: '/weather',
    label: 'Weather',
    icon: '🌤️',
    description: 'Current weather and forecast',
  },
  {
    path: '/weather/dashboard',
    label: 'Dashboard',
    icon: '📊',
    description: 'Weather analytics dashboard',
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: '⚙️',
    description: 'App preferences',
  },
  {
    path: '/about',
    label: 'About',
    icon: 'ℹ️',
    description: 'App information',
  },
];

/**
 * Main navigation component props
 */
interface NavigationProps {
  variant?: 'header' | 'sidebar' | 'footer' | 'breadcrumb';
  className?: string;
  showLabels?: boolean;
  showDescriptions?: boolean;
  maxItems?: number;
}

/**
 * Main navigation component
 */
export const Navigation: React.FC<NavigationProps> = ({
  variant = 'header',
  className = '',
  showLabels = true,
  showDescriptions = false,
  maxItems,
}) => {
  const location = useLocation();

  // Filter items based on environment
  const filteredItems = navigationItems.filter(item => {
    if (item.developmentOnly && process.env.NODE_ENV !== 'development') {
      return false;
    }
    return true;
  });

  // Limit items if maxItems is specified
  const items = maxItems ? filteredItems.slice(0, maxItems) : filteredItems;

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const renderHeaderNavigation = () => (
    <nav className={`flex items-center space-x-1 ${className}`} aria-label="Main navigation">
      {items.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={`
            px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-border)] focus:ring-offset-2
            ${
              isActive(item.path)
                ? 'bg-[var(--theme-primary-bg)] text-[var(--theme-primary-text)] border border-[var(--theme-primary-border)]'
                : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-hover)] border border-transparent'
            }
          `}
          title={item.description}
          aria-current={isActive(item.path) ? 'page' : undefined}
        >
          <span className="mr-1" aria-hidden="true">
            {item.icon}
          </span>
          {showLabels && item.label}
        </Link>
      ))}
    </nav>
  );

  const renderSidebarNavigation = () => (
    <nav className={`space-y-1 ${className}`} aria-label="Sidebar navigation">
      {items.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={`
            flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-border)] focus:ring-inset
            ${
              isActive(item.path)
                ? 'bg-[var(--theme-primary-bg)] text-[var(--theme-primary-text)] border-r-4 border-[var(--theme-primary-border)]'
                : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-hover)]'
            }
          `}
          aria-current={isActive(item.path) ? 'page' : undefined}
        >
          <span className="mr-3 text-lg" aria-hidden="true">
            {item.icon}
          </span>
          <div className="flex-1">
            {showLabels && <div>{item.label}</div>}
            {showDescriptions && item.description && (
              <div className="text-xs text-[var(--theme-text-secondary)]">{item.description}</div>
            )}
          </div>
        </Link>
      ))}
    </nav>
  );

  const renderFooterNavigation = () => (
    <nav
      className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 ${className}`}
      aria-label="Footer navigation"
    >
      {items.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={`
            p-3 rounded-lg text-center transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-border)] focus:ring-offset-2
            ${
              isActive(item.path)
                ? 'bg-[var(--theme-primary-bg)] text-[var(--theme-primary-text)] border-2 border-[var(--theme-primary-border)]'
                : 'bg-[var(--theme-surface)] text-[var(--theme-text-secondary)] hover:bg-[var(--theme-hover)] hover:text-[var(--theme-text)] border border-[var(--theme-border)]'
            }
          `}
          aria-current={isActive(item.path) ? 'page' : undefined}
        >
          <div className="text-2xl mb-1" aria-hidden="true">
            {item.icon}
          </div>
          {showLabels && <div className="text-sm font-medium">{item.label}</div>}
          {showDescriptions && item.description && (
            <div className="text-xs text-[var(--theme-text-secondary)] mt-1">
              {item.description}
            </div>
          )}
        </Link>
      ))}
    </nav>
  );

  const renderBreadcrumbNavigation = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      { path: '/', label: 'Home', icon: '🏠' },
      ...pathSegments.map((segment, index) => {
        const path = '/' + pathSegments.slice(0, index + 1).join('/');
        const item = navigationItems.find(item => item.path === path);
        return {
          path,
          label: item?.label || segment.charAt(0).toUpperCase() + segment.slice(1),
          icon: item?.icon || '📄',
        };
      }),
    ];

    return (
      <nav
        className={`flex items-center space-x-2 text-sm ${className}`}
        aria-label="Breadcrumb navigation"
      >
        <ol className="flex items-center space-x-2">
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.path} className="flex items-center space-x-2">
              {index > 0 && (
                <span className="text-[var(--theme-text-secondary)]" aria-hidden="true">
                  /
                </span>
              )}
              <Link
                to={crumb.path}
                className={`
                  flex items-center space-x-1 px-2 py-1 rounded transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-border)] focus:ring-offset-1
                  ${
                    index === breadcrumbs.length - 1
                      ? 'text-[var(--theme-text)] font-semibold'
                      : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-hover)]'
                  }
                `}
                aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
              >
                <span aria-hidden="true">{crumb.icon}</span>
                {showLabels && <span>{crumb.label}</span>}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    );
  };

  switch (variant) {
    case 'sidebar':
      return renderSidebarNavigation();
    case 'footer':
      return renderFooterNavigation();
    case 'breadcrumb':
      return renderBreadcrumbNavigation();
    default:
      return renderHeaderNavigation();
  }
};

/**
 * Quick navigation component for floating action buttons
 */
export const QuickNavigation: React.FC<{
  items?: string[];
  className?: string;
}> = ({ items = ['/weather', '/weather/dashboard', '/settings'], className = '' }) => {
  const quickItems = navigationItems.filter(item => items.includes(item.path));

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {quickItems.map(item => (
        <Link key={item.path} to={item.path}>
          <Button variant="secondary" size="sm" className="shadow-lg" title={item.description}>
            {item.icon} {item.label}
          </Button>
        </Link>
      ))}
    </div>
  );
};

/**
 * Mobile navigation menu
 */
export const MobileNavigation: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[var(--theme-backdrop)]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu */}
      <div
        className="fixed inset-y-0 left-0 w-64 bg-[var(--theme-surface)] shadow-xl border-r border-[var(--theme-border)]"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--theme-border)]">
          <h2 className="text-lg font-semibold text-[var(--theme-text)]">Navigation</h2>
          <button
            onClick={onClose}
            className="p-2 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-hover)] rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-border)]"
            aria-label="Close navigation menu"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <Navigation variant="sidebar" showLabels={true} showDescriptions={true} />
        </div>
      </div>
    </div>
  );
};

export default Navigation;
