import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import type { Layout } from 'react-grid-layout';

import {
  DASHBOARD_PRESETS,
  DEFAULT_DASHBOARD_LAYOUT,
  STORAGE_KEYS,
  WIDGET_METADATA,
} from '@/constants/dashboard';
import type {
  IDashboardContext,
  IDashboardLayout,
  IDashboardPreset,
  IDashboardState,
  IWidgetConfig,
  WidgetAction,
  WidgetSettings,
  WidgetType,
} from '@/types/dashboard';
import { appLogger as logger } from '@/utils/logger';

/**
 * Dashboard reducer function
 */
function dashboardReducer(state: IDashboardState, action: WidgetAction): IDashboardState {
  switch (action.type) {
    case 'ADD_WIDGET': {
      const newWidget = action.payload;
      return {
        ...state,
        currentLayout: {
          ...state.currentLayout,
          widgets: [...state.currentLayout.widgets, newWidget],
        },
      };
    }

    case 'REMOVE_WIDGET': {
      const widgetId = action.payload;
      return {
        ...state,
        currentLayout: {
          ...state.currentLayout,
          widgets: state.currentLayout.widgets.filter(w => w.id !== widgetId),
        },
      };
    }

    case 'UPDATE_WIDGET': {
      const { id, updates } = action.payload;
      return {
        ...state,
        currentLayout: {
          ...state.currentLayout,
          widgets: state.currentLayout.widgets.map(w => (w.id === id ? { ...w, ...updates } : w)),
        },
      };
    }

    case 'TOGGLE_WIDGET_VISIBILITY': {
      const widgetId = action.payload;
      return {
        ...state,
        currentLayout: {
          ...state.currentLayout,
          widgets: state.currentLayout.widgets.map(w =>
            w.id === widgetId ? { ...w, visible: !w.visible } : w
          ),
        },
      };
    }

    case 'TOGGLE_WIDGET_PIN': {
      const widgetId = action.payload;
      return {
        ...state,
        currentLayout: {
          ...state.currentLayout,
          widgets: state.currentLayout.widgets.map(w =>
            w.id === widgetId ? { ...w, pinned: !w.pinned, visible: !w.pinned } : w
          ),
        },
      };
    }

    case 'PIN_WIDGET': {
      const widgetId = action.payload;
      return {
        ...state,
        currentLayout: {
          ...state.currentLayout,
          widgets: state.currentLayout.widgets.map(w =>
            w.id === widgetId ? { ...w, pinned: true, visible: true } : w
          ),
        },
      };
    }

    case 'UNPIN_WIDGET': {
      const widgetId = action.payload;
      return {
        ...state,
        currentLayout: {
          ...state.currentLayout,
          widgets: state.currentLayout.widgets.map(w =>
            w.id === widgetId ? { ...w, pinned: false, visible: false } : w
          ),
        },
      };
    }

    case 'UPDATE_WIDGET_SETTINGS': {
      const { id, settings } = action.payload;
      return {
        ...state,
        currentLayout: {
          ...state.currentLayout,
          widgets: state.currentLayout.widgets.map(w =>
            w.id === id ? { ...w, settings: { ...w.settings, ...settings } } : w
          ),
        },
      };
    }

    case 'UPDATE_LAYOUT': {
      const newLayout = action.payload;
      return {
        ...state,
        currentLayout: {
          ...state.currentLayout,
          widgets: state.currentLayout.widgets.map(widget => {
            const layoutItem = newLayout.find(item => item.i === widget.id);
            if (layoutItem) {
              return {
                ...widget,
                position: { x: layoutItem.x, y: layoutItem.y },
                size: { w: layoutItem.w, h: layoutItem.h },
              };
            }
            return widget;
          }),
        },
      };
    }

    case 'LOAD_PRESET': {
      const preset = action.payload;
      return {
        ...state,
        currentLayout: preset.layout,
      };
    }

    case 'SAVE_PRESET': {
      const { name, description } = action.payload;
      const newPreset: IDashboardPreset = {
        id: `custom-${Date.now()}`,
        name,
        description,
        layout: state.currentLayout,
        isCustom: true,
      };
      return {
        ...state,
        presets: [...state.presets, newPreset],
      };
    }

    case 'DELETE_PRESET': {
      const presetId = action.payload;
      return {
        ...state,
        presets: state.presets.filter(p => p.id !== presetId),
      };
    }

    case 'RESET_LAYOUT': {
      return {
        ...state,
        currentLayout: DEFAULT_DASHBOARD_LAYOUT,
      };
    }

    case 'TOGGLE_EDIT_MODE': {
      return {
        ...state,
        isEditMode: !state.isEditMode,
      };
    }

    case 'SET_DRAGGING': {
      return {
        ...state,
        isDragging: action.payload,
      };
    }

    case 'SET_RESIZING': {
      return {
        ...state,
        isResizing: action.payload,
      };
    }

    default:
      return state;
  }
}

/**
 * Load dashboard layout from localStorage
 */
function loadLayoutFromStorage(): IDashboardLayout {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DASHBOARD_LAYOUT);
    if (stored) {
      const parsed = JSON.parse(stored) as IDashboardLayout;
      return parsed;
    }
  } catch (error) {
    logger.error('Failed to load dashboard layout from storage:', error);
  }
  return DEFAULT_DASHBOARD_LAYOUT;
}

/**
 * Load custom presets from localStorage
 */
function loadPresetsFromStorage(): IDashboardPreset[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_PRESETS);
    if (stored) {
      const parsed = JSON.parse(stored) as IDashboardPreset[];
      return [...DASHBOARD_PRESETS, ...parsed];
    }
  } catch (error) {
    logger.error('Failed to load custom presets from storage:', error);
  }
  return DASHBOARD_PRESETS;
}

/**
 * Initial dashboard state
 */
const initialState: IDashboardState = {
  currentLayout: loadLayoutFromStorage(),
  presets: loadPresetsFromStorage(),
  isEditMode: false,
  isDragging: false,
  isResizing: false,
};

/**
 * Dashboard context
 */
const DashboardLayoutContext = createContext<IDashboardContext | undefined>(undefined);

/**
 * Dashboard layout provider
 */
export const DashboardLayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // Persist layout to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DASHBOARD_LAYOUT, JSON.stringify(state.currentLayout));
    } catch (error) {
      logger.error('Failed to save dashboard layout to storage:', error);
    }
  }, [state.currentLayout]);

  // Persist custom presets to localStorage
  useEffect(() => {
    try {
      const customPresets = state.presets.filter(p => p.isCustom);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_PRESETS, JSON.stringify(customPresets));
    } catch (error) {
      logger.error('Failed to save custom presets to storage:', error);
    }
  }, [state.presets]);

  // Action creators
  const addWidget = useCallback((type: WidgetType) => {
    const metadata = WIDGET_METADATA[type];
    const newWidget: IWidgetConfig = {
      id: `${type}-${Date.now()}`,
      type,
      title: metadata.title,
      visible: true,
      pinned: true,
      position: { x: 0, y: Infinity }, // Place at bottom
      size: metadata.defaultSize,
      minSize: metadata.minSize,
      maxSize: metadata.maxSize,
      settings: {},
    };
    dispatch({ type: 'ADD_WIDGET', payload: newWidget });
  }, []);

  const removeWidget = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_WIDGET', payload: id });
  }, []);

  const updateWidget = useCallback((id: string, updates: Partial<IWidgetConfig>) => {
    dispatch({ type: 'UPDATE_WIDGET', payload: { id, updates } });
  }, []);

  const toggleWidgetVisibility = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_WIDGET_VISIBILITY', payload: id });
  }, []);

  const toggleWidgetPin = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_WIDGET_PIN', payload: id });
  }, []);

  const pinWidget = useCallback((id: string) => {
    dispatch({ type: 'PIN_WIDGET', payload: id });
  }, []);

  const unpinWidget = useCallback((id: string) => {
    dispatch({ type: 'UNPIN_WIDGET', payload: id });
  }, []);

  const updateWidgetSettings = useCallback((id: string, settings: WidgetSettings) => {
    dispatch({ type: 'UPDATE_WIDGET_SETTINGS', payload: { id, settings } });
  }, []);

  const updateLayout = useCallback((layout: Layout[]) => {
    dispatch({ type: 'UPDATE_LAYOUT', payload: layout });
  }, []);

  const loadPreset = useCallback((preset: IDashboardPreset) => {
    dispatch({ type: 'LOAD_PRESET', payload: preset });
  }, []);

  const savePreset = useCallback((name: string, description: string) => {
    dispatch({ type: 'SAVE_PRESET', payload: { name, description } });
  }, []);

  const deletePreset = useCallback((id: string) => {
    dispatch({ type: 'DELETE_PRESET', payload: id });
  }, []);

  const resetLayout = useCallback(() => {
    dispatch({ type: 'RESET_LAYOUT' });
  }, []);

  const toggleEditMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_EDIT_MODE' });
  }, []);

  const exportLayout = useCallback((): string => {
    return JSON.stringify(state.currentLayout, null, 2);
  }, [state.currentLayout]);

  const importLayout = useCallback(async (json: string): Promise<void> => {
    try {
      const parsed = JSON.parse(json) as IDashboardLayout;
      // Validate the layout structure
      if (!parsed.widgets || !Array.isArray(parsed.widgets)) {
        throw new Error('Invalid layout structure');
      }
      dispatch({
        type: 'LOAD_PRESET',
        payload: { id: 'imported', name: 'Imported', description: '', layout: parsed },
      });
    } catch (error) {
      logger.error('Failed to import layout:', error);
      throw error;
    }
  }, []);

  const getPinnedWidgets = useCallback(() => {
    return state.currentLayout.widgets.filter(w => w.pinned);
  }, [state.currentLayout.widgets]);

  const getUnpinnedWidgets = useCallback(() => {
    return state.currentLayout.widgets.filter(w => !w.pinned);
  }, [state.currentLayout.widgets]);

  const value: IDashboardContext = {
    state,
    dispatch,
    addWidget,
    removeWidget,
    updateWidget,
    toggleWidgetVisibility,
    toggleWidgetPin,
    pinWidget,
    unpinWidget,
    updateWidgetSettings,
    updateLayout,
    loadPreset,
    savePreset,
    deletePreset,
    resetLayout,
    toggleEditMode,
    exportLayout,
    importLayout,
    getPinnedWidgets,
    getUnpinnedWidgets,
  };

  return (
    <DashboardLayoutContext.Provider value={value}>{children}</DashboardLayoutContext.Provider>
  );
};

/**
 * Hook to use dashboard layout context
 */
export const useDashboardLayout = (): IDashboardContext => {
  const context = useContext(DashboardLayoutContext);
  if (!context) {
    throw new Error('useDashboardLayout must be used within a DashboardLayoutProvider');
  }
  return context;
};

/**
 * Hook to get a specific widget configuration
 */
export const useWidgetConfig = (widgetId: string): IWidgetConfig | undefined => {
  const { state } = useDashboardLayout();
  return state.currentLayout.widgets.find(w => w.id === widgetId);
};
