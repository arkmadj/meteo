import type { Layout } from 'react-grid-layout';

/**
 * Available widget types for the dashboard
 */
export type WidgetType =
  | 'temperature'
  | 'humidity'
  | 'wind'
  | 'pressure'
  | 'uv-index'
  | 'visibility'
  | 'aqi'
  | 'coordinates'
  | 'forecast';

/**
 * Widget size presets
 */
export type WidgetSize = 'small' | 'medium' | 'large' | 'xlarge';

/**
 * Widget-specific settings
 */
export interface WidgetSettings {
  // Temperature widget settings
  showFeelsLike?: boolean;
  showMinMax?: boolean;
  gaugeStyle?: 'circular' | 'linear';

  // Wind widget settings
  compassType?: 'simple' | 'detailed';
  showGust?: boolean;

  // Pressure widget settings
  showTrend?: boolean;
  showHistory?: boolean;
  historyRange?: '24h' | '7d' | '30d';

  // Forecast widget settings
  forecastDays?: number;
  showDetailedMetrics?: boolean;
  cardSize?: 'compact' | 'default' | 'large';

  // General settings
  refreshInterval?: number;
  animationEnabled?: boolean;
}

/**
 * Widget configuration
 */
export interface IWidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  visible: boolean;
  pinned: boolean; // If true, widget is pinned to dashboard
  position: {
    x: number;
    y: number;
  };
  size: {
    w: number;
    h: number;
  };
  minSize?: {
    w: number;
    h: number;
  };
  maxSize?: {
    w: number;
    h: number;
  };
  settings?: WidgetSettings;
  static?: boolean; // If true, widget cannot be moved or resized
}

/**
 * Dashboard layout configuration
 */
export interface IDashboardLayout {
  id: string;
  name: string;
  widgets: IWidgetConfig[];
  gridSettings: {
    cols: number;
    rowHeight: number;
    compactType: 'vertical' | 'horizontal' | null;
    preventCollision: boolean;
  };
  breakpoints?: {
    lg: number;
    md: number;
    sm: number;
    xs: number;
  };
  cols?: {
    lg: number;
    md: number;
    sm: number;
    xs: number;
  };
}

/**
 * Dashboard preset template
 */
export interface IDashboardPreset {
  id: string;
  name: string;
  description: string;
  icon?: string;
  layout: IDashboardLayout;
  isDefault?: boolean;
  isCustom?: boolean;
}

/**
 * Dashboard state
 */
export interface IDashboardState {
  currentLayout: IDashboardLayout;
  presets: IDashboardPreset[];
  isEditMode: boolean;
  isDragging: boolean;
  isResizing: boolean;
}

/**
 * Widget metadata for display and configuration
 */
export interface IWidgetMetadata {
  type: WidgetType;
  title: string;
  description: string;
  icon: string;
  defaultSize: {
    w: number;
    h: number;
  };
  minSize: {
    w: number;
    h: number;
  };
  maxSize?: {
    w: number;
    h: number;
  };
  category: 'primary' | 'atmospheric' | 'environmental' | 'location' | 'forecast';
  availableSettings?: (keyof WidgetSettings)[];
}

/**
 * Layout change event
 */
export interface ILayoutChangeEvent {
  layout: Layout[];
  oldLayout: Layout[];
}

/**
 * Widget action types
 */
export type WidgetAction =
  | { type: 'ADD_WIDGET'; payload: IWidgetConfig }
  | { type: 'REMOVE_WIDGET'; payload: string }
  | { type: 'UPDATE_WIDGET'; payload: { id: string; updates: Partial<IWidgetConfig> } }
  | { type: 'TOGGLE_WIDGET_VISIBILITY'; payload: string }
  | { type: 'TOGGLE_WIDGET_PIN'; payload: string }
  | { type: 'PIN_WIDGET'; payload: string }
  | { type: 'UNPIN_WIDGET'; payload: string }
  | { type: 'UPDATE_WIDGET_SETTINGS'; payload: { id: string; settings: WidgetSettings } }
  | { type: 'UPDATE_LAYOUT'; payload: Layout[] }
  | { type: 'LOAD_PRESET'; payload: IDashboardPreset }
  | { type: 'SAVE_PRESET'; payload: { name: string; description: string } }
  | { type: 'DELETE_PRESET'; payload: string }
  | { type: 'RESET_LAYOUT' }
  | { type: 'TOGGLE_EDIT_MODE' }
  | { type: 'SET_DRAGGING'; payload: boolean }
  | { type: 'SET_RESIZING'; payload: boolean };

/**
 * Dashboard context value
 */
export interface IDashboardContext {
  state: IDashboardState;
  dispatch: React.Dispatch<WidgetAction>;
  addWidget: (type: WidgetType) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<IWidgetConfig>) => void;
  toggleWidgetVisibility: (id: string) => void;
  toggleWidgetPin: (id: string) => void;
  pinWidget: (id: string) => void;
  unpinWidget: (id: string) => void;
  updateWidgetSettings: (id: string, settings: WidgetSettings) => void;
  updateLayout: (layout: Layout[]) => void;
  loadPreset: (preset: IDashboardPreset) => void;
  savePreset: (name: string, description: string) => void;
  deletePreset: (id: string) => void;
  resetLayout: () => void;
  toggleEditMode: () => void;
  exportLayout: () => string;
  importLayout: (json: string) => Promise<void>;
  getPinnedWidgets: () => IWidgetConfig[];
  getUnpinnedWidgets: () => IWidgetConfig[];
}
