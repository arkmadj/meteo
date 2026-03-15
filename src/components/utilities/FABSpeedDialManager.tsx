/**
 * FAB Speed Dial Manager Component
 * Consolidates all demo-page FAB actions into one expandable speed-dial interface
 * Provides centralized access to demo controls and navigation
 */

import React, { createContext, useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import FABSpeedDial, { type SpeedDialAction } from '@/components/ui/atoms/FABSpeedDial';
import { useSnackbar } from '@/contexts/SnackbarContext';

// ============================================================================
// CONTEXT FOR MANAGING SPEED DIAL STATE
// ============================================================================

interface FABSpeedDialManagerContextValue {
  /** Register a new action */
  registerAction: (action: SpeedDialAction) => void;
  /** Unregister an action */
  unregisterAction: (actionId: string) => void;
  /** Update an existing action */
  updateAction: (actionId: string, updates: Partial<SpeedDialAction>) => void;
  /** Get all registered actions */
  getActions: () => SpeedDialAction[];
}

const FABSpeedDialManagerContext = createContext<FABSpeedDialManagerContextValue | null>(null);

export const useFABSpeedDialManager = () => {
  const context = useContext(FABSpeedDialManagerContext);
  if (!context) {
    throw new Error('useFABSpeedDialManager must be used within FABSpeedDialManagerProvider');
  }
  return context;
};

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface FABSpeedDialManagerProviderProps {
  children: React.ReactNode;
}

export const FABSpeedDialManagerProvider: React.FC<FABSpeedDialManagerProviderProps> = ({
  children,
}) => {
  const [actions, setActions] = useState<SpeedDialAction[]>([]);

  const registerAction = (action: SpeedDialAction) => {
    setActions(prev => {
      // Prevent duplicates
      if (prev.some(a => a.id === action.id)) {
        return prev;
      }
      return [...prev, action];
    });
  };

  const unregisterAction = (actionId: string) => {
    setActions(prev => prev.filter(a => a.id !== actionId));
  };

  const updateAction = (actionId: string, updates: Partial<SpeedDialAction>) => {
    setActions(prev =>
      prev.map(action => (action.id === actionId ? { ...action, ...updates } : action))
    );
  };

  const getActions = () => actions;

  const value: FABSpeedDialManagerContextValue = {
    registerAction,
    unregisterAction,
    updateAction,
    getActions,
  };

  return (
    <FABSpeedDialManagerContext.Provider value={value}>
      {children}
    </FABSpeedDialManagerContext.Provider>
  );
};

// ============================================================================
// MAIN SPEED DIAL MANAGER COMPONENT
// ============================================================================

interface FABSpeedDialManagerProps {
  /** Whether to show on current page */
  showOnPages?: string[];
  /** Whether to hide on specific pages */
  hideOnPages?: string[];
  /** Additional custom actions to include */
  customActions?: SpeedDialAction[];
}

const FABSpeedDialManager: React.FC<FABSpeedDialManagerProps> = ({
  showOnPages,
  hideOnPages,
  customActions = [],
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showInfo } = useSnackbar();
  const context = useContext(FABSpeedDialManagerContext);

  // Check if should show on current page
  const shouldShow = () => {
    const currentPath = location.pathname;

    if (hideOnPages && hideOnPages.some(page => currentPath.includes(page))) {
      return false;
    }

    if (showOnPages && !showOnPages.some(page => currentPath.includes(page))) {
      return false;
    }

    return true;
  };

  if (!shouldShow()) {
    return null;
  }

  // Define default actions for demo pages with consistent iconography
  const defaultActions: SpeedDialAction[] = [
    {
      id: 'showcase',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      label: 'Component Showcase',
      onClick: () => {
        navigate('/showcase');
        showInfo('Navigating to Showcase', 2000);
      },
      variant: 'secondary',
    },
    {
      id: 'demo',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      label: 'Demo Components',
      onClick: () => {
        navigate('/demo');
        showInfo('Navigating to Demo', 2000);
      },
      variant: 'secondary',
    },
  ];

  // Merge all actions: default + custom + dynamically registered
  const allActions = [
    ...defaultActions,
    ...customActions,
    ...(context ? context.getActions() : []),
  ];

  return (
    <FABSpeedDial
      actions={allActions}
      icon={
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      }
      openIcon={
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      }
      position="bottom-left"
      variant="primary"
      tooltip="Quick Actions"
      direction="up"
      ariaLabel="Demo page quick actions"
    />
  );
};

export default FABSpeedDialManager;
