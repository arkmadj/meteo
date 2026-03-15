import type {
  IDashboardLayout,
  IDashboardPreset,
  IWidgetConfig,
  IWidgetMetadata,
  WidgetType,
} from '@/types/dashboard';

/**
 * Widget metadata for all available widgets
 */
export const WIDGET_METADATA: Record<WidgetType, IWidgetMetadata> = {
  temperature: {
    type: 'temperature',
    title: 'Temperature',
    description: 'Current temperature with min/max and feels like',
    icon: '🌡️',
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 1, h: 2 },
    maxSize: { w: 4, h: 3 },
    category: 'primary',
    availableSettings: ['showFeelsLike', 'showMinMax', 'gaugeStyle', 'animationEnabled'],
  },
  humidity: {
    type: 'humidity',
    title: 'Humidity',
    description: 'Relative humidity percentage',
    icon: '💧',
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 1, h: 2 },
    maxSize: { w: 3, h: 3 },
    category: 'primary',
    availableSettings: ['animationEnabled'],
  },
  wind: {
    type: 'wind',
    title: 'Wind',
    description: 'Wind speed, direction, and gusts',
    icon: '💨',
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 4, h: 3 },
    category: 'atmospheric',
    availableSettings: ['compassType', 'showGust', 'animationEnabled'],
  },
  pressure: {
    type: 'pressure',
    title: 'Pressure',
    description: 'Atmospheric pressure with trends',
    icon: '🔽',
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 4, h: 3 },
    category: 'atmospheric',
    availableSettings: ['showTrend', 'showHistory', 'historyRange', 'animationEnabled'],
  },
  'uv-index': {
    type: 'uv-index',
    title: 'UV Index',
    description: 'UV radiation index',
    icon: '☀️',
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 1, h: 2 },
    maxSize: { w: 3, h: 3 },
    category: 'environmental',
    availableSettings: ['animationEnabled'],
  },
  visibility: {
    type: 'visibility',
    title: 'Visibility',
    description: 'Visibility distance',
    icon: '👁️',
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 1, h: 2 },
    maxSize: { w: 3, h: 3 },
    category: 'environmental',
    availableSettings: ['animationEnabled'],
  },
  aqi: {
    type: 'aqi',
    title: 'Air Quality',
    description: 'Air Quality Index',
    icon: '🌫️',
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 4, h: 3 },
    category: 'environmental',
    availableSettings: ['animationEnabled'],
  },
  coordinates: {
    type: 'coordinates',
    title: 'Location',
    description: 'Geographic coordinates',
    icon: '📍',
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 3, h: 2 },
    category: 'location',
    availableSettings: [],
  },
  forecast: {
    type: 'forecast',
    title: 'Forecast',
    description: 'Multi-day weather forecast',
    icon: '📅',
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 3, h: 2 },
    maxSize: { w: 6, h: 4 },
    category: 'forecast',
    availableSettings: ['forecastDays', 'showDetailedMetrics', 'cardSize', 'animationEnabled'],
  },
};

/**
 * Default widget configurations
 */
export const DEFAULT_WIDGETS: IWidgetConfig[] = [
  {
    id: 'temperature-1',
    type: 'temperature',
    title: 'Temperature',
    visible: true,
    pinned: true,
    position: { x: 0, y: 0 },
    size: { w: 2, h: 2 },
    minSize: { w: 1, h: 2 },
    settings: {
      showFeelsLike: true,
      showMinMax: true,
      gaugeStyle: 'circular',
      animationEnabled: true,
    },
  },
  {
    id: 'humidity-1',
    type: 'humidity',
    title: 'Humidity',
    visible: true,
    pinned: true,
    position: { x: 2, y: 0 },
    size: { w: 2, h: 2 },
    minSize: { w: 1, h: 2 },
    settings: {
      animationEnabled: true,
    },
  },
  {
    id: 'wind-1',
    type: 'wind',
    title: 'Wind',
    visible: true,
    pinned: true,
    position: { x: 0, y: 2 },
    size: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    settings: {
      compassType: 'detailed',
      showGust: true,
      animationEnabled: true,
    },
  },
  {
    id: 'pressure-1',
    type: 'pressure',
    title: 'Pressure',
    visible: true,
    pinned: true,
    position: { x: 2, y: 2 },
    size: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    settings: {
      showTrend: true,
      showHistory: true,
      historyRange: '24h',
      animationEnabled: true,
    },
  },
  {
    id: 'uv-index-1',
    type: 'uv-index',
    title: 'UV Index',
    visible: true,
    pinned: true,
    position: { x: 0, y: 4 },
    size: { w: 2, h: 2 },
    minSize: { w: 1, h: 2 },
    settings: {
      animationEnabled: true,
    },
  },
  {
    id: 'visibility-1',
    type: 'visibility',
    title: 'Visibility',
    visible: true,
    pinned: true,
    position: { x: 2, y: 4 },
    size: { w: 2, h: 2 },
    minSize: { w: 1, h: 2 },
    settings: {
      animationEnabled: true,
    },
  },
  {
    id: 'coordinates-1',
    type: 'coordinates',
    title: 'Location',
    visible: true,
    pinned: true,
    position: { x: 0, y: 6 },
    size: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    settings: {},
  },
];

/**
 * Default grid settings
 */
export const DEFAULT_GRID_SETTINGS = {
  cols: 4,
  rowHeight: 100,
  compactType: 'vertical' as const,
  preventCollision: false,
};

/**
 * Responsive breakpoints
 */
export const DASHBOARD_BREAKPOINTS = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
};

/**
 * Responsive column counts
 */
export const DASHBOARD_COLS = {
  lg: 4,
  md: 3,
  sm: 2,
  xs: 1,
};

/**
 * Default dashboard layout
 */
export const DEFAULT_DASHBOARD_LAYOUT: IDashboardLayout = {
  id: 'default',
  name: 'Default Layout',
  widgets: DEFAULT_WIDGETS,
  gridSettings: DEFAULT_GRID_SETTINGS,
  breakpoints: DASHBOARD_BREAKPOINTS,
  cols: DASHBOARD_COLS,
};

/**
 * Compact preset layout
 */
const COMPACT_LAYOUT: IDashboardLayout = {
  id: 'compact',
  name: 'Compact Layout',
  widgets: [
    {
      id: 'temperature-1',
      type: 'temperature',
      title: 'Temperature',
      visible: true,
      pinned: true,
      position: { x: 0, y: 0 },
      size: { w: 1, h: 2 },
      minSize: { w: 1, h: 2 },
    },
    {
      id: 'humidity-1',
      type: 'humidity',
      title: 'Humidity',
      visible: true,
      pinned: true,
      position: { x: 1, y: 0 },
      size: { w: 1, h: 2 },
      minSize: { w: 1, h: 2 },
    },
    {
      id: 'wind-1',
      type: 'wind',
      title: 'Wind',
      visible: true,
      pinned: true,
      position: { x: 2, y: 0 },
      size: { w: 2, h: 2 },
      minSize: { w: 2, h: 2 },
    },
    {
      id: 'pressure-1',
      type: 'pressure',
      title: 'Pressure',
      visible: true,
      pinned: true,
      position: { x: 0, y: 2 },
      size: { w: 2, h: 2 },
      minSize: { w: 2, h: 2 },
    },
    {
      id: 'uv-index-1',
      type: 'uv-index',
      title: 'UV Index',
      visible: true,
      pinned: true,
      position: { x: 2, y: 2 },
      size: { w: 1, h: 2 },
      minSize: { w: 1, h: 2 },
    },
    {
      id: 'visibility-1',
      type: 'visibility',
      title: 'Visibility',
      visible: true,
      pinned: true,
      position: { x: 3, y: 2 },
      size: { w: 1, h: 2 },
      minSize: { w: 1, h: 2 },
    },
  ],
  gridSettings: DEFAULT_GRID_SETTINGS,
  breakpoints: DASHBOARD_BREAKPOINTS,
  cols: DASHBOARD_COLS,
};

/**
 * Detailed preset layout
 */
const DETAILED_LAYOUT: IDashboardLayout = {
  id: 'detailed',
  name: 'Detailed Layout',
  widgets: [
    {
      id: 'temperature-1',
      type: 'temperature',
      title: 'Temperature',
      visible: true,
      pinned: true,
      position: { x: 0, y: 0 },
      size: { w: 3, h: 3 },
      minSize: { w: 2, h: 2 },
      settings: {
        showFeelsLike: true,
        showMinMax: true,
        gaugeStyle: 'circular',
      },
    },
    {
      id: 'wind-1',
      type: 'wind',
      title: 'Wind',
      visible: true,
      pinned: true,
      position: { x: 3, y: 0 },
      size: { w: 3, h: 3 },
      minSize: { w: 2, h: 2 },
      settings: {
        compassType: 'detailed',
        showGust: true,
      },
    },
    {
      id: 'pressure-1',
      type: 'pressure',
      title: 'Pressure',
      visible: true,
      pinned: true,
      position: { x: 0, y: 3 },
      size: { w: 4, h: 3 },
      minSize: { w: 2, h: 2 },
      settings: {
        showTrend: true,
        showHistory: true,
        historyRange: '7d',
      },
    },
    {
      id: 'humidity-1',
      type: 'humidity',
      title: 'Humidity',
      visible: true,
      pinned: true,
      position: { x: 4, y: 3 },
      size: { w: 2, h: 2 },
      minSize: { w: 1, h: 2 },
    },
    {
      id: 'uv-index-1',
      type: 'uv-index',
      title: 'UV Index',
      visible: true,
      pinned: true,
      position: { x: 4, y: 5 },
      size: { w: 2, h: 2 },
      minSize: { w: 1, h: 2 },
    },
    {
      id: 'visibility-1',
      type: 'visibility',
      title: 'Visibility',
      visible: true,
      pinned: true,
      position: { x: 0, y: 6 },
      size: { w: 2, h: 2 },
      minSize: { w: 1, h: 2 },
    },
    {
      id: 'coordinates-1',
      type: 'coordinates',
      title: 'Location',
      visible: true,
      pinned: true,
      position: { x: 2, y: 6 },
      size: { w: 2, h: 2 },
      minSize: { w: 2, h: 2 },
    },
  ],
  gridSettings: { ...DEFAULT_GRID_SETTINGS, cols: 6 },
  breakpoints: DASHBOARD_BREAKPOINTS,
  cols: { lg: 6, md: 4, sm: 2, xs: 1 },
};

/**
 * Minimal preset layout
 */
const MINIMAL_LAYOUT: IDashboardLayout = {
  id: 'minimal',
  name: 'Minimal Layout',
  widgets: [
    {
      id: 'temperature-1',
      type: 'temperature',
      title: 'Temperature',
      visible: true,
      pinned: true,
      position: { x: 0, y: 0 },
      size: { w: 2, h: 2 },
      minSize: { w: 1, h: 2 },
    },
    {
      id: 'wind-1',
      type: 'wind',
      title: 'Wind',
      visible: true,
      pinned: true,
      position: { x: 2, y: 0 },
      size: { w: 2, h: 2 },
      minSize: { w: 2, h: 2 },
    },
    {
      id: 'humidity-1',
      type: 'humidity',
      title: 'Humidity',
      visible: true,
      pinned: true,
      position: { x: 0, y: 2 },
      size: { w: 2, h: 2 },
      minSize: { w: 1, h: 2 },
    },
    {
      id: 'coordinates-1',
      type: 'coordinates',
      title: 'Location',
      visible: true,
      pinned: true,
      position: { x: 2, y: 2 },
      size: { w: 2, h: 2 },
      minSize: { w: 2, h: 2 },
    },
  ],
  gridSettings: DEFAULT_GRID_SETTINGS,
  breakpoints: DASHBOARD_BREAKPOINTS,
  cols: DASHBOARD_COLS,
};

/**
 * Analyst preset layout (all widgets visible)
 */
const ANALYST_LAYOUT: IDashboardLayout = {
  id: 'analyst',
  name: 'Analyst Layout',
  widgets: [
    ...DEFAULT_WIDGETS,
    {
      id: 'aqi-1',
      type: 'aqi',
      title: 'Air Quality',
      visible: true,
      pinned: true,
      position: { x: 2, y: 6 },
      size: { w: 2, h: 2 },
      minSize: { w: 2, h: 2 },
    },
  ],
  gridSettings: DEFAULT_GRID_SETTINGS,
  breakpoints: DASHBOARD_BREAKPOINTS,
  cols: DASHBOARD_COLS,
};

/**
 * Dashboard presets
 */
export const DASHBOARD_PRESETS: IDashboardPreset[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Balanced layout with all essential weather metrics',
    icon: '⚖️',
    layout: DEFAULT_DASHBOARD_LAYOUT,
    isDefault: true,
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Space-efficient layout for smaller screens',
    icon: '📱',
    layout: COMPACT_LAYOUT,
  },
  {
    id: 'detailed',
    name: 'Detailed',
    description: 'Larger widgets with more detailed information',
    icon: '🔍',
    layout: DETAILED_LAYOUT,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Only the most essential weather information',
    icon: '✨',
    layout: MINIMAL_LAYOUT,
  },
  {
    id: 'analyst',
    name: 'Analyst',
    description: 'Complete view with all available metrics',
    icon: '📊',
    layout: ANALYST_LAYOUT,
  },
];

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  DASHBOARD_LAYOUT: 'weather-app-dashboard-layout',
  CUSTOM_PRESETS: 'weather-app-custom-presets',
  EDIT_MODE: 'weather-app-edit-mode',
} as const;
