import '@/styles/react-grid-layout.css';
import 'react-grid-layout/css/styles.css';

import React, { useCallback, useMemo } from 'react';
import type { Layout } from 'react-grid-layout';
import { Responsive, WidthProvider } from 'react-grid-layout';

import Widget from '@/components/dashboard/Widget';
import WidgetSidePanel from '@/components/dashboard/WidgetSidePanel';
import AQIDetailCard from '@/components/ui/weather/metrics/air-quality/AQIDetailCard';
import CoordinatesDetailCard from '@/components/ui/weather/metrics/coordinates/CoordinatesDetailCard';
import HumidityDetailCard from '@/components/ui/weather/metrics/humidity/HumidityDetailCard';
import PressureDetailCard from '@/components/ui/weather/metrics/pressure/PressureDetailCard';
import TemperatureDetailCard from '@/components/ui/weather/metrics/temperature/TemperatureDetailCard';
import UVIndexDetailCard from '@/components/ui/weather/metrics/uv-index/UVIndexDetailCard';
import VisibilityDetailCard from '@/components/ui/weather/metrics/visibility/VisibilityDetailCard';
import WindDetailCard from '@/components/ui/weather/metrics/wind/WindDetailCard';
import { useDashboardLayout } from '@/contexts/DashboardLayoutContext';
import { useTheme } from '@/design-system/theme';
import type { CurrentWeatherData } from '@/types/weather';

const ResponsiveGridLayout = WidthProvider(Responsive);

export interface CustomizableDashboardProps {
  weather: CurrentWeatherData;
  getLocalizedTemperature: (temp: number) => string;
  getLocalizedWeatherDescription: (code: number) => string;
  temperatureUnit: 'C' | 'F';
  className?: string;
}

/**
 * Customizable dashboard with drag-and-drop and resizable widgets
 */
const CustomizableDashboard: React.FC<CustomizableDashboardProps> = ({
  weather,
  getLocalizedTemperature,
  getLocalizedWeatherDescription,
  temperatureUnit,
  className = '',
}) => {
  const { _theme } = useTheme();
  const { state, updateLayout, removeWidget, dispatch } = useDashboardLayout();

  // Convert widget configs to react-grid-layout format
  // Only show pinned and visible widgets
  // Create responsive layouts for different breakpoints
  const layouts = useMemo(() => {
    const visibleWidgets = state.currentLayout.widgets.filter(w => w.visible && w.pinned);

    // Base layout (lg - desktop)
    const lgLayout: Layout[] = visibleWidgets.map(widget => ({
      i: widget.id,
      x: widget.position.x,
      y: widget.position.y,
      w: widget.size.w,
      h: widget.size.h,
      minW: widget.minSize?.w,
      minH: widget.minSize?.h,
      maxW: widget.maxSize?.w,
      maxH: widget.maxSize?.h,
      static: widget.static || false,
    }));

    // Medium layout (md - tablet landscape)
    const mdLayout: Layout[] = visibleWidgets.map((widget, index) => {
      const cols = 3;
      const row = Math.floor(index / cols);
      const col = index % cols;
      return {
        i: widget.id,
        x: col * Math.min(widget.size.w, 2),
        y: row * 2,
        w: Math.min(widget.size.w, 2),
        h: widget.size.h,
        minW: widget.minSize?.w,
        minH: widget.minSize?.h,
        maxW: widget.maxSize?.w,
        maxH: widget.maxSize?.h,
        static: widget.static || false,
      };
    });

    // Small layout (sm - tablet portrait)
    const smLayout: Layout[] = visibleWidgets.map((widget, index) => {
      const cols = 2;
      const row = Math.floor(index / cols);
      const col = index % cols;
      return {
        i: widget.id,
        x: col,
        y: row * 2,
        w: 1,
        h: widget.size.h,
        minW: 1,
        minH: widget.minSize?.h,
        maxW: 2,
        maxH: widget.maxSize?.h,
        static: widget.static || false,
      };
    });

    // Extra small layout (xs - mobile)
    const xsLayout: Layout[] = visibleWidgets.map((widget, index) => ({
      i: widget.id,
      x: 0,
      y: index * 2,
      w: 1,
      h: widget.size.h,
      minW: 1,
      minH: widget.minSize?.h,
      maxW: 1,
      maxH: widget.maxSize?.h,
      static: widget.static || false,
    }));

    return {
      lg: lgLayout,
      md: mdLayout,
      sm: smLayout,
      xs: xsLayout,
    };
  }, [state.currentLayout.widgets]);

  // Handle layout change
  const handleLayoutChange = useCallback(
    (currentLayout: Layout[]) => {
      if (!state.isEditMode) return;
      updateLayout(currentLayout);
    },
    [state.isEditMode, updateLayout]
  );

  // Handle drag start
  const handleDragStart = useCallback(() => {
    dispatch({ type: 'SET_DRAGGING', payload: true });
  }, [dispatch]);

  // Handle drag stop
  const handleDragStop = useCallback(() => {
    dispatch({ type: 'SET_DRAGGING', payload: false });
  }, [dispatch]);

  // Handle resize start
  const handleResizeStart = useCallback(() => {
    dispatch({ type: 'SET_RESIZING', payload: true });
  }, [dispatch]);

  // Handle resize stop
  const handleResizeStop = useCallback(() => {
    dispatch({ type: 'SET_RESIZING', payload: false });
  }, [dispatch]);

  // Render widget content based on type
  const renderWidgetContent = useCallback(
    (widgetId: string) => {
      const widget = state.currentLayout.widgets.find(w => w.id === widgetId);
      if (!widget) return null;

      const commonProps = {
        animationDelay: 0,
        animationDuration: 600,
        animationType: 'fadeInUp' as const,
      };

      switch (widget.type) {
        case 'temperature':
          return (
            <TemperatureDetailCard
              {...commonProps}
              getLocalizedTemperature={getLocalizedTemperature}
              temperature={{
                current: weather.temperature.current,
                minimum: weather.temperature.min || weather.temperature.current - 5,
                maximum: weather.temperature.max || weather.temperature.current + 5,
                feelsLike: weather.temperature.feels_like,
              }}
              temperatureUnit={temperatureUnit}
            />
          );

        case 'humidity':
          return <HumidityDetailCard {...commonProps} humidity={weather.humidity} />;

        case 'wind':
          return <WindDetailCard {...commonProps} wind={weather.wind} />;

        case 'pressure':
          return (
            <PressureDetailCard
              {...commonProps}
              pressure={weather.pressure}
              pressureHistory={weather.pressureHistory}
            />
          );

        case 'uv-index':
          return <UVIndexDetailCard {...commonProps} uvIndex={weather.uvIndex} />;

        case 'visibility':
          return <VisibilityDetailCard {...commonProps} visibility={weather.visibility} />;

        case 'aqi':
          return weather.airQuality ? (
            <AQIDetailCard {...commonProps} airQuality={weather.airQuality} />
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--theme-text-secondary)]">
              <p>Air quality data not available</p>
            </div>
          );

        case 'coordinates':
          return (
            <CoordinatesDetailCard
              {...commonProps}
              latitude={weather.latitude}
              location={{
                latitude: weather.latitude,
                longitude: weather.longitude,
                city: weather.city,
                country: weather.country,
              }}
              longitude={weather.longitude}
            />
          );

        default:
          return (
            <div className="flex items-center justify-center h-full">
              <p className="text-[var(--theme-text-secondary)]">Widget type not supported</p>
            </div>
          );
      }
    },
    [
      state.currentLayout.widgets,
      weather,
      getLocalizedTemperature,
      getLocalizedWeatherDescription,
      temperatureUnit,
    ]
  );

  return (
    <div className={`w-full ${className}`}>
      {/* Widget Side Panel */}
      <WidgetSidePanel />

      <ResponsiveGridLayout
        breakpoints={state.currentLayout.breakpoints}
        className="layout"
        cols={state.currentLayout.cols}
        compactType={state.currentLayout.gridSettings.compactType}
        containerPadding={[0, 0]}
        draggableHandle=".widget-drag-handle"
        isDraggable={state.isEditMode}
        isResizable={state.isEditMode}
        layouts={layouts}
        margin={[16, 16]}
        onDragStart={handleDragStart}
        onDragStop={handleDragStop}
        onLayoutChange={handleLayoutChange}
        onResizeStart={handleResizeStart}
        onResizeStop={handleResizeStop}
        preventCollision={state.currentLayout.gridSettings.preventCollision}
        rowHeight={state.currentLayout.gridSettings.rowHeight}
        useCSSTransforms
      >
        {state.currentLayout.widgets
          .filter(w => w.visible)
          .map(widget => (
            <div key={widget.id} className="widget-drag-handle">
              <Widget
                config={widget}
                isEditMode={state.isEditMode}
                onRemove={() => removeWidget(widget.id)}
                onSettings={() => {
                  // TODO: Open settings modal
                  console.log('Settings for', widget.id);
                }}
              >
                {renderWidgetContent(widget.id)}
              </Widget>
            </div>
          ))}
      </ResponsiveGridLayout>

      {/* Empty State */}
      {state.currentLayout.widgets.filter(w => w.visible).length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg
            className="w-16 h-16 mb-4 text-[var(--theme-text-secondary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-2">
            No widgets to display
          </h3>
          <p className="text-sm text-[var(--theme-text-secondary)] mb-4">
            Add widgets to customize your dashboard
          </p>
        </div>
      )}
    </div>
  );
};

CustomizableDashboard.displayName = 'CustomizableDashboard';

export default CustomizableDashboard;
