/**
 * Refactored Widget Side Panel
 * Integrated with reusable SideDrawer component
 * Features a bottom-left floating action button for quick access
 */

import React, { useState } from 'react';

import SideDrawer from '@/components/ui/navigation/SideDrawer';
import { WIDGET_METADATA } from '@/constants/dashboard';
import { useDashboardLayout } from '@/contexts/DashboardLayoutContext';
import { useTheme } from '@/design-system/theme';
import type { IWidgetConfig } from '@/types/dashboard';

export interface WidgetSidePanelProps {
  className?: string;
}

/**
 * Widget Side Panel Component
 * Provides drag-and-drop reordering, quick settings, and widget management
 */
export const WidgetSidePanel: React.FC<WidgetSidePanelProps> = ({ className = '' }) => {
  const { theme } = useTheme();
  const {
    state,
    toggleWidgetPin,
    toggleWidgetVisibility,
    updateWidget,
    getPinnedWidgets,
    getUnpinnedWidgets,
  } = useDashboardLayout();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'pinned' | 'available'>('pinned');
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  const pinnedWidgets = getPinnedWidgets();
  const unpinnedWidgets = getUnpinnedWidgets();

  // Helper functions
  const getWidgetIcon = (widget: IWidgetConfig) => {
    return WIDGET_METADATA[widget.type]?.icon || '📊';
  };

  const getWidgetDescription = (widget: IWidgetConfig) => {
    return WIDGET_METADATA[widget.type]?.description || widget.title;
  };

  const getWidgetCategory = (widget: IWidgetConfig) => {
    return WIDGET_METADATA[widget.type]?.category || 'primary';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      primary: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      atmospheric: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      environmental: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      location: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      forecast: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
    };
    return colors[category as keyof typeof colors] || colors.primary;
  };

  // Event handlers
  const handleTogglePin = (widgetId: string) => {
    toggleWidgetPin(widgetId);
  };

  const handleToggleVisibility = (widgetId: string) => {
    toggleWidgetVisibility(widgetId);
  };

  const handleToggleExpand = (widgetId: string) => {
    setExpandedWidget(expandedWidget === widgetId ? null : widgetId);
  };

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', widgetId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetWidgetId: string) => {
    e.preventDefault();
    if (!draggedWidget || draggedWidget === targetWidgetId) return;

    const widgets = [...state.currentLayout.widgets];
    const draggedIndex = widgets.findIndex(w => w.id === draggedWidget);
    const targetIndex = widgets.findIndex(w => w.id === targetWidgetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [removed] = widgets.splice(draggedIndex, 1);
      widgets.splice(targetIndex, 0, removed);

      widgets.forEach((widget, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        updateWidget(widget.id, {
          position: { x: col * 2, y: row * 2 },
        });
      });
    }

    setDraggedWidget(null);
  };

  const handleDragEnd = () => {
    setDraggedWidget(null);
  };

  const handleSizeChange = (widgetId: string, size: 'small' | 'medium' | 'large') => {
    const sizeMap = {
      small: { w: 1, h: 2 },
      medium: { w: 2, h: 2 },
      large: { w: 2, h: 3 },
    };
    updateWidget(widgetId, { size: sizeMap[size] });
  };

  // Drawer header with tabs
  const drawerHeader = (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-[var(--theme-text)] flex items-center gap-2">
        <span>🎨</span>
        <span>Customize Widgets</span>
      </h2>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          className={`
            flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
            ${
              activeTab === 'pinned'
                ? 'bg-[var(--theme-primary)] text-white shadow-md'
                : 'bg-[var(--theme-surface)] text-[var(--theme-text-secondary)] hover:bg-[var(--theme-hover)]'
            }
          `}
          onClick={() => setActiveTab('pinned')}
          aria-pressed={activeTab === 'pinned'}
        >
          📌 Pinned ({pinnedWidgets.length})
        </button>
        <button
          className={`
            flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
            ${
              activeTab === 'available'
                ? 'bg-[var(--theme-primary)] text-white shadow-md'
                : 'bg-[var(--theme-surface)] text-[var(--theme-text-secondary)] hover:bg-[var(--theme-hover)]'
            }
          `}
          onClick={() => setActiveTab('available')}
          aria-pressed={activeTab === 'available'}
        >
          📋 Available ({unpinnedWidgets.length})
        </button>
      </div>
    </div>
  );

  // Drawer footer with tips
  const drawerFooter = (
    <div className="text-xs text-[var(--theme-text-secondary)] space-y-1">
      <p>
        💡 <strong>Tip:</strong> Drag pinned widgets to reorder them
      </p>
      <p>
        🎯 <strong>Quick:</strong> Expand widgets for size and visibility controls
      </p>
    </div>
  );

  // Render pinned widgets
  const renderPinnedWidgets = () => {
    if (pinnedWidgets.length === 0) {
      return (
        <div className="text-center py-12 text-[var(--theme-text-secondary)]">
          <div className="text-4xl mb-3">📌</div>
          <p className="font-medium mb-1">No pinned widgets</p>
          <p className="text-sm">Switch to Available tab to pin widgets</p>
        </div>
      );
    }

    return pinnedWidgets.map(widget => (
      <div
        key={widget.id}
        className={`
          bg-[var(--theme-surface)] rounded-lg border border-[var(--theme-border)]
          transition-all duration-200
          ${draggedWidget === widget.id ? 'opacity-50' : 'opacity-100'}
          ${expandedWidget === widget.id ? 'ring-2 ring-[var(--theme-primary)]' : ''}
        `}
        draggable
        onDragStart={e => handleDragStart(e, widget.id)}
        onDragOver={handleDragOver}
        onDrop={e => handleDrop(e, widget.id)}
        onDragEnd={handleDragEnd}
      >
        {/* Widget Header */}
        <div className="p-3 flex items-center gap-3">
          <div className="cursor-move text-xl" title="Drag to reorder">
            ⋮⋮
          </div>
          <div className="text-2xl">{getWidgetIcon(widget)}</div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-[var(--theme-text)] truncate">{widget.title}</div>
            <div className="text-xs text-[var(--theme-text-secondary)] truncate">
              {getWidgetDescription(widget)}
            </div>
          </div>
          <button
            className="p-2 rounded hover:bg-[var(--theme-hover)] transition-colors"
            onClick={() => handleToggleExpand(widget.id)}
            aria-label={expandedWidget === widget.id ? 'Collapse' : 'Expand'}
            title={expandedWidget === widget.id ? 'Collapse' : 'Expand'}
          >
            {expandedWidget === widget.id ? '▲' : '▼'}
          </button>
        </div>

        {/* Expanded Content */}
        {expandedWidget === widget.id && (
          <div className="px-3 pb-3 space-y-3 border-t border-[var(--theme-border)] pt-3">
            {/* Category Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[var(--theme-text-secondary)]">Category:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(getWidgetCategory(widget))}`}>
                {getWidgetCategory(widget)}
              </span>
            </div>

            {/* Size Control */}
            <div>
              <label className="text-xs font-medium text-[var(--theme-text-secondary)] block mb-2">Size:</label>
              <div className="flex gap-2">
                {['small', 'medium', 'large'].map(size => (
                  <button
                    key={size}
                    className={`
                      flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors
                      ${
                        widget.size.w === (size === 'small' ? 1 : 2) && widget.size.h === (size === 'large' ? 3 : 2)
                          ? 'bg-[var(--theme-primary)] text-white'
                          : 'bg-[var(--theme-surface)] text-[var(--theme-text)] hover:bg-[var(--theme-hover)] border border-[var(--theme-border)]'
                      }
                    `}
                    onClick={() => handleSizeChange(widget.id, size as 'small' | 'medium' | 'large')}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                className="flex-1 px-3 py-2 rounded text-sm font-medium bg-[var(--theme-surface)] text-[var(--theme-text)] hover:bg-[var(--theme-hover)] border border-[var(--theme-border)] transition-colors"
                onClick={() => handleToggleVisibility(widget.id)}
              >
                {widget.visible ? '👁️ Hide' : '👁️‍🗨️ Show'}
              </button>
              <button
                className="flex-1 px-3 py-2 rounded text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                onClick={() => handleTogglePin(widget.id)}
              >
                📌 Unpin
              </button>
            </div>
          </div>
        )}
      </div>
    ));
  };

  // Render available widgets
  const renderAvailableWidgets = () => {
    if (unpinnedWidgets.length === 0) {
      return (
        <div className="text-center py-12 text-[var(--theme-text-secondary)]">
          <div className="text-4xl mb-3">✨</div>
          <p className="font-medium mb-1">All widgets pinned!</p>
          <p className="text-sm">Unpin widgets to see them here</p>
        </div>
      );
    }

    return unpinnedWidgets.map(widget => (
      <div
        key={widget.id}
        className="bg-[var(--theme-surface)] rounded-lg border border-[var(--theme-border)] p-3 hover:border-[var(--theme-primary)] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">{getWidgetIcon(widget)}</div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-[var(--theme-text)] truncate">{widget.title}</div>
            <div className="text-xs text-[var(--theme-text-secondary)] truncate">
              {getWidgetDescription(widget)}
            </div>
            <div className="mt-1">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(getWidgetCategory(widget))}`}>
                {getWidgetCategory(widget)}
              </span>
            </div>
          </div>
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-primary-hover)] transition-colors"
            onClick={() => handleTogglePin(widget.id)}
            aria-label={`Pin ${widget.title}`}
            title="Pin to dashboard"
          >
            📍 Pin
          </button>
        </div>
      </div>
    ));
  };

  return (
    <>
      {/* Floating Action Button (Bottom-Left) */}
      <button
        className={`
          fixed bottom-6 left-6 z-40
          w-14 h-14 rounded-full
          bg-[var(--theme-primary)] text-white
          shadow-lg hover:shadow-2xl
          transition-all duration-300
          flex items-center justify-center
          hover:scale-110 active:scale-95
          ${className}
        `}
        onClick={() => setIsOpen(true)}
        aria-label="Open widget customization panel"
        title="Customize Widgets"
      >
        <span className="text-2xl">🎨</span>
      </button>

      {/* Side Drawer */}
      <SideDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        position="right"
        size="medium"
        header={drawerHeader}
        footer={drawerFooter}
        ariaLabel="Widget customization panel"
        data-testid="widget-side-panel"
      >
        <div className="space-y-3">{activeTab === 'pinned' ? renderPinnedWidgets() : renderAvailableWidgets()}</div>
      </SideDrawer>
    </>
  );
};

export default WidgetSidePanel;

