/**
 * Theme Toggle Test Component
 * Simple test component to verify theme toggle functionality
 * Note: This is a demo component, not a test file
 */

import React from 'react';
import { useTheme } from '@/design-system/theme';
import ThemeToggle from './ThemeToggle';

const ThemeToggleTest: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="p-4 space-y-4 bg-[var(--theme-background)] text-[var(--theme-text)] min-h-screen">
      <h2 className="text-lg font-semibold text-[var(--theme-text)]">Theme Integration Test</h2>

      <div className="space-y-2 p-4 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-lg">
        <h3 className="font-medium text-[var(--theme-text)]">Current Theme State:</h3>
        <p className="text-[var(--theme-text-secondary)]">
          Mode: <strong className="text-[var(--theme-text)]">{theme.mode}</strong>
        </p>
        <p className="text-[var(--theme-text-secondary)]">
          Is dark:{' '}
          <strong className="text-[var(--theme-text)]">{theme.isDark ? 'Yes' : 'No'}</strong>
        </p>
        <p className="text-[var(--theme-text-secondary)]">
          Primary: <strong className="text-[var(--theme-text)]">{theme.primaryColor}</strong>
        </p>
        <p className="text-[var(--theme-text-secondary)]">
          Background: <strong className="text-[var(--theme-text)]">{theme.backgroundColor}</strong>
        </p>
        <p className="text-[var(--theme-text-secondary)]">
          Surface: <strong className="text-[var(--theme-text)]">{theme.surfaceColor}</strong>
        </p>
        <p className="text-[var(--theme-text-secondary)]">
          Text: <strong className="text-[var(--theme-text)]">{theme.textColor}</strong>
        </p>
      </div>

      <div className="space-y-4 p-4 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-lg">
        <h3 className="font-medium text-[var(--theme-text)]">Theme Toggle Variants:</h3>

        <div className="flex items-center space-x-4">
          <span className="text-[var(--theme-text-secondary)] min-w-[80px]">Default:</span>
          <ThemeToggle variant="default" showLabels={true} />
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-[var(--theme-text-secondary)] min-w-[80px]">Compact:</span>
          <ThemeToggle variant="compact" />
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-[var(--theme-text-secondary)] min-w-[80px]">Minimal:</span>
          <ThemeToggle variant="minimal" />
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-[var(--theme-text-secondary)] min-w-[80px]">Icon Only:</span>
          <ThemeToggle variant="icon-only" />
        </div>
      </div>

      <div className="p-4 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-lg">
        <p className="text-sm text-[var(--theme-text-secondary)]">
          This test component demonstrates the theme integration with CSS custom properties. Try
          clicking the toggles to see how all elements respond to theme changes consistently!
        </p>
      </div>
    </div>
  );
};

export default ThemeToggleTest;
