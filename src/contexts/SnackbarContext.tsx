/**
 * Snackbar Context for managing global snackbar state in the React Weather App
 *
 * Provides a centralized way to show temporary notifications/messages to users.
 * Supports multiple snackbars, auto-dismiss, manual dismiss, and different variants.
 */

import type { ReactNode } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useRef,
  useEffect,
} from 'react';

import { SnackbarContextUnavailableError } from '@/errors/domainErrors';

// Snackbar variant types
export type SnackbarVariant = 'info' | 'success' | 'warning' | 'error';

// Snackbar position types
export type SnackbarPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

// Snackbar display mode types
export type SnackbarDisplayMode = 'queue' | 'stack';

// Individual snackbar interface
export interface Snackbar {
  id: string;
  message: string;
  variant?: SnackbarVariant;
  duration?: number; // Auto-dismiss duration in ms (0 = no auto-dismiss)
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
  dismissible?: boolean;
  priority?: number; // Higher priority shows first (default: 0)
  createdAt?: number; // Timestamp when snackbar was created
  dismissAt?: number; // Timestamp when snackbar should be dismissed
}

// Snackbar state interface
export interface SnackbarState {
  snackbars: Snackbar[];
  queue: Snackbar[]; // Queued snackbars waiting to be displayed
  position: SnackbarPosition;
  maxSnackbars: number;
  displayMode: SnackbarDisplayMode;
  stackOffset: number; // Offset in pixels for stacked mode
}

// Snackbar action types
type SnackbarAction =
  | { type: 'ADD_SNACKBAR'; payload: Snackbar }
  | { type: 'REMOVE_SNACKBAR'; payload: string }
  | { type: 'CLEAR_SNACKBARS' }
  | { type: 'SET_POSITION'; payload: SnackbarPosition }
  | { type: 'SET_MAX_SNACKBARS'; payload: number }
  | { type: 'SET_DISPLAY_MODE'; payload: SnackbarDisplayMode }
  | { type: 'SET_STACK_OFFSET'; payload: number }
  | { type: 'PROCESS_QUEUE' };

// Initial snackbar state
const initialSnackbarState: SnackbarState = {
  snackbars: [],
  queue: [],
  position: 'bottom-right',
  maxSnackbars: 3,
  displayMode: 'stack',
  stackOffset: 8,
};

// Helper function to sort snackbars by priority
const sortByPriority = (snackbars: Snackbar[]): Snackbar[] => {
  return [...snackbars].sort((a, b) => {
    const priorityA = a.priority ?? 0;
    const priorityB = b.priority ?? 0;
    return priorityB - priorityA; // Higher priority first
  });
};

// Snackbar reducer
const snackbarReducer = (state: SnackbarState, action: SnackbarAction): SnackbarState => {
  switch (action.type) {
    case 'ADD_SNACKBAR': {
      // Queue mode: only show one snackbar at a time
      if (state.displayMode === 'queue') {
        if (state.snackbars.length > 0) {
          // Add to queue if there's already a snackbar showing
          const newQueue = sortByPriority([...state.queue, action.payload]);
          return {
            ...state,
            queue: newQueue,
          };
        } else {
          // Show immediately if no snackbar is showing
          return {
            ...state,
            snackbars: [action.payload],
          };
        }
      }

      // Stack mode: show multiple snackbars with limit
      const newSnackbars = [...state.snackbars, action.payload];

      // Limit to maxSnackbars by removing oldest (lowest priority first)
      if (newSnackbars.length > state.maxSnackbars) {
        const sorted = sortByPriority(newSnackbars);
        return {
          ...state,
          snackbars: sorted.slice(0, state.maxSnackbars),
        };
      }

      return {
        ...state,
        snackbars: newSnackbars,
      };
    }

    case 'REMOVE_SNACKBAR': {
      const newSnackbars = state.snackbars.filter(snackbar => snackbar.id !== action.payload);

      // In queue mode, process next item from queue
      if (state.displayMode === 'queue' && newSnackbars.length === 0 && state.queue.length > 0) {
        const [nextSnackbar, ...remainingQueue] = state.queue;
        return {
          ...state,
          snackbars: [nextSnackbar],
          queue: remainingQueue,
        };
      }

      return {
        ...state,
        snackbars: newSnackbars,
      };
    }

    case 'CLEAR_SNACKBARS': {
      return {
        ...state,
        snackbars: [],
        queue: [],
      };
    }

    case 'SET_POSITION': {
      return {
        ...state,
        position: action.payload,
      };
    }

    case 'SET_MAX_SNACKBARS': {
      const newMax = Math.max(1, action.payload);

      // In queue mode, max should always be 1
      if (state.displayMode === 'queue') {
        return {
          ...state,
          maxSnackbars: 1,
        };
      }

      return {
        ...state,
        maxSnackbars: newMax,
        // Trim snackbars if new max is lower
        snackbars: state.snackbars.slice(-newMax),
      };
    }

    case 'SET_DISPLAY_MODE': {
      // When switching to queue mode, move extra snackbars to queue
      if (action.payload === 'queue') {
        const [firstSnackbar, ...rest] = state.snackbars;
        const newQueue = sortByPriority([...state.queue, ...rest]);

        return {
          ...state,
          displayMode: action.payload,
          maxSnackbars: 1,
          snackbars: firstSnackbar ? [firstSnackbar] : [],
          queue: newQueue,
        };
      }

      // When switching to stack mode, show queued items up to maxSnackbars
      if (action.payload === 'stack') {
        const allSnackbars = [...state.snackbars, ...state.queue];
        const sorted = sortByPriority(allSnackbars);
        const toShow = sorted.slice(0, state.maxSnackbars);

        return {
          ...state,
          displayMode: action.payload,
          snackbars: toShow,
          queue: [],
        };
      }

      return state;
    }

    case 'SET_STACK_OFFSET': {
      return {
        ...state,
        stackOffset: Math.max(0, action.payload),
      };
    }

    case 'PROCESS_QUEUE': {
      // Manually process queue (useful for testing or manual control)
      if (state.displayMode === 'queue' && state.snackbars.length === 0 && state.queue.length > 0) {
        const [nextSnackbar, ...remainingQueue] = state.queue;
        return {
          ...state,
          snackbars: [nextSnackbar],
          queue: remainingQueue,
        };
      }

      return state;
    }

    default:
      return state;
  }
};

// Snackbar context interface
export interface SnackbarContextType {
  snackbarState: SnackbarState;
  showSnackbar: (snackbar: Omit<Snackbar, 'id'>) => string;
  showInfo: (message: string, duration?: number, priority?: number) => string;
  showSuccess: (message: string, duration?: number, priority?: number) => string;
  showWarning: (message: string, duration?: number, priority?: number) => string;
  showError: (message: string, duration?: number, priority?: number) => string;
  removeSnackbar: (id: string) => void;
  clearSnackbars: () => void;
  setPosition: (position: SnackbarPosition) => void;
  setMaxSnackbars: (max: number) => void;
  setDisplayMode: (mode: SnackbarDisplayMode) => void;
  setStackOffset: (offset: number) => void;
  processQueue: () => void;
}

// Create context
const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

// Provider props
interface SnackbarProviderProps {
  children: ReactNode;
  defaultPosition?: SnackbarPosition;
  defaultMaxSnackbars?: number;
  defaultDisplayMode?: SnackbarDisplayMode;
  defaultStackOffset?: number;
}

// Generate unique ID for snackbars
const generateId = (): string => {
  return `snackbar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Snackbar Provider Component
 */
export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({
  children,
  defaultPosition = 'bottom-right',
  defaultMaxSnackbars = 3,
  defaultDisplayMode = 'stack',
  defaultStackOffset = 8,
}) => {
  const [snackbarState, dispatch] = useReducer(snackbarReducer, {
    ...initialSnackbarState,
    position: defaultPosition,
    maxSnackbars: defaultDisplayMode === 'queue' ? 1 : defaultMaxSnackbars,
    displayMode: defaultDisplayMode,
    stackOffset: defaultStackOffset,
  });

  // Track dismiss timers for ordered dismissal
  const dismissTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Show snackbar with custom options
  const showSnackbar = useCallback((snackbar: Omit<Snackbar, 'id'>): string => {
    const id = generateId();
    const now = Date.now();
    const duration = snackbar.duration ?? 5000;

    const newSnackbar: Snackbar = {
      id,
      variant: 'info',
      duration,
      dismissible: true,
      ...snackbar,
      createdAt: now,
      dismissAt: duration > 0 ? now + duration : undefined,
    };

    dispatch({ type: 'ADD_SNACKBAR', payload: newSnackbar });

    // Auto-dismiss if duration is set
    if (newSnackbar.duration && newSnackbar.duration > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: 'REMOVE_SNACKBAR', payload: id });
        newSnackbar.onClose?.();
        dismissTimersRef.current.delete(id);
      }, newSnackbar.duration);

      dismissTimersRef.current.set(id, timer);
    }

    return id;
  }, []);

  // Convenience methods for different variants
  const showInfo = useCallback(
    (message: string, duration: number = 5000, priority: number = 0): string => {
      return showSnackbar({ message, variant: 'info', duration, priority });
    },
    [showSnackbar]
  );

  const showSuccess = useCallback(
    (message: string, duration: number = 5000, priority: number = 0): string => {
      return showSnackbar({ message, variant: 'success', duration, priority });
    },
    [showSnackbar]
  );

  const showWarning = useCallback(
    (message: string, duration: number = 6000, priority: number = 5): string => {
      return showSnackbar({ message, variant: 'warning', duration, priority });
    },
    [showSnackbar]
  );

  const showError = useCallback(
    (message: string, duration: number = 7000, priority: number = 10): string => {
      return showSnackbar({ message, variant: 'error', duration, priority });
    },
    [showSnackbar]
  );

  // Remove specific snackbar
  const removeSnackbar = useCallback(
    (id: string) => {
      const snackbar = snackbarState.snackbars.find(s => s.id === id);

      // Clear timer if exists
      const timer = dismissTimersRef.current.get(id);
      if (timer) {
        clearTimeout(timer);
        dismissTimersRef.current.delete(id);
      }

      dispatch({ type: 'REMOVE_SNACKBAR', payload: id });
      snackbar?.onClose?.();
    },
    [snackbarState.snackbars]
  );

  // Clear all snackbars
  const clearSnackbars = useCallback(() => {
    snackbarState.snackbars.forEach(snackbar => {
      snackbar.onClose?.();

      // Clear timer if exists
      const timer = dismissTimersRef.current.get(snackbar.id);
      if (timer) {
        clearTimeout(timer);
        dismissTimersRef.current.delete(snackbar.id);
      }
    });
    dispatch({ type: 'CLEAR_SNACKBARS' });
  }, [snackbarState.snackbars]);

  // Set snackbar position
  const setPosition = useCallback((position: SnackbarPosition) => {
    dispatch({ type: 'SET_POSITION', payload: position });
  }, []);

  // Set max snackbars
  const setMaxSnackbars = useCallback((max: number) => {
    dispatch({ type: 'SET_MAX_SNACKBARS', payload: max });
  }, []);

  // Set display mode
  const setDisplayMode = useCallback((mode: SnackbarDisplayMode) => {
    dispatch({ type: 'SET_DISPLAY_MODE', payload: mode });
  }, []);

  // Set stack offset
  const setStackOffset = useCallback((offset: number) => {
    dispatch({ type: 'SET_STACK_OFFSET', payload: offset });
  }, []);

  // Process queue manually
  const processQueue = useCallback(() => {
    dispatch({ type: 'PROCESS_QUEUE' });
  }, []);

  // Effect to enforce ordered dismissal
  useEffect(() => {
    // Only enforce ordered dismissal in stack mode with multiple snackbars
    if (snackbarState.displayMode !== 'stack' || snackbarState.snackbars.length <= 1) {
      return;
    }

    // Sort snackbars by creation time (oldest first)
    const sortedByCreation = [...snackbarState.snackbars].sort((a, b) => {
      const timeA = a.createdAt ?? 0;
      const timeB = b.createdAt ?? 0;
      return timeA - timeB;
    });

    // Check if any snackbar should dismiss before others
    const now = Date.now();
    let shouldReorder = false;

    for (let i = 0; i < sortedByCreation.length - 1; i++) {
      const current = sortedByCreation[i];
      const next = sortedByCreation[i + 1];

      // If current snackbar has dismissAt time
      if (current.dismissAt && next.dismissAt) {
        // If next snackbar would dismiss before current, we need to delay it
        if (next.dismissAt < current.dismissAt) {
          shouldReorder = true;

          // Clear the next snackbar's timer
          const nextTimer = dismissTimersRef.current.get(next.id);
          if (nextTimer) {
            clearTimeout(nextTimer);
            dismissTimersRef.current.delete(next.id);
          }

          // Calculate new dismiss time (after current snackbar)
          const delayNeeded = current.dismissAt - now;

          // Set new timer for next snackbar
          if (delayNeeded > 0) {
            const newTimer = setTimeout(() => {
              dispatch({ type: 'REMOVE_SNACKBAR', payload: next.id });
              next.onClose?.();
              dismissTimersRef.current.delete(next.id);
            }, delayNeeded + 100); // Add 100ms buffer

            dismissTimersRef.current.set(next.id, newTimer);
          }
        }
      }
    }
  }, [snackbarState.snackbars, snackbarState.displayMode]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      dismissTimersRef.current.forEach(timer => clearTimeout(timer));
      dismissTimersRef.current.clear();
    };
  }, []);

  const contextValue: SnackbarContextType = {
    snackbarState,
    showSnackbar,
    showInfo,
    showSuccess,
    showWarning,
    showError,
    removeSnackbar,
    clearSnackbars,
    setPosition,
    setMaxSnackbars,
    setDisplayMode,
    setStackOffset,
    processQueue,
  };

  return <SnackbarContext.Provider value={contextValue}>{children}</SnackbarContext.Provider>;
};

/**
 * Hook to use snackbar context
 * @throws {SnackbarContextUnavailableError} If used outside SnackbarProvider
 */
export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new SnackbarContextUnavailableError('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

/**
 * Hook to get current snackbars
 */
export const useSnackbars = (): Snackbar[] => {
  const { snackbarState } = useSnackbar();
  return snackbarState.snackbars;
};

/**
 * Hook to get snackbar position
 */
export const useSnackbarPosition = (): SnackbarPosition => {
  const { snackbarState } = useSnackbar();
  return snackbarState.position;
};

/**
 * Hook to check if there are active snackbars
 */
export const useHasSnackbars = (): boolean => {
  const { snackbarState } = useSnackbar();
  return snackbarState.snackbars.length > 0;
};

export default SnackbarContext;
