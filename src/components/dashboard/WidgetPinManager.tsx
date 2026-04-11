import React, { useState } from 'react';

import { XMarkIcon } from '@heroicons/react/24/outline';

import { WIDGET_METADATA } from '@/constants/dashboard';
import { useDashboardLayout } from '@/contexts/DashboardLayoutContext';
import type { IWidgetConfig } from '@/types/dashboard';

/**
 * Widget Pin Manager Component
 * Allows users to pin/unpin widgets to control which appear on the dashboard
 */
export const WidgetPinManager: React.FC = () => {
  const {
    state: _state,
    toggleWidgetPin,
    getPinnedWidgets,
    getUnpinnedWidgets,
  } = useDashboardLayout();
  const [isOpen, setIsOpen] = useState(false);

  const pinnedWidgets = getPinnedWidgets();
  const unpinnedWidgets = getUnpinnedWidgets();

  const handleTogglePin = (widgetId: string) => {
    toggleWidgetPin(widgetId);
  };

  const getWidgetIcon = (widget: IWidgetConfig) => {
    return WIDGET_METADATA[widget.type]?.icon || '📊';
  };

  const getWidgetDescription = (widget: IWidgetConfig) => {
    return WIDGET_METADATA[widget.type]?.description || widget.title;
  };

  return (
    <div className="widget-pin-manager">
      <button
        className="btn btn-secondary"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Manage pinned widgets"
        title="Pin/Unpin Widgets"
      >
        📌 Manage Pins ({pinnedWidgets.length})
      </button>

      {isOpen && (
        <div className="widget-pin-panel">
          <div className="widget-pin-panel-header">
            <h3>Manage Dashboard Widgets</h3>
            <button
              className="btn-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close pin manager"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="widget-pin-panel-content">
            {/* Pinned Widgets Section */}
            <div className="widget-pin-section">
              <h4 className="widget-pin-section-title">
                📌 Pinned Widgets ({pinnedWidgets.length})
              </h4>
              <p className="widget-pin-section-description">
                These widgets are visible on your dashboard
              </p>
              <div className="widget-pin-list">
                {pinnedWidgets.length === 0 ? (
                  <div className="widget-pin-empty">
                    <p>No widgets pinned</p>
                    <p className="text-muted">Pin widgets from the available list below</p>
                  </div>
                ) : (
                  pinnedWidgets.map(widget => (
                    <div key={widget.id} className="widget-pin-item pinned">
                      <div className="widget-pin-item-info">
                        <span className="widget-pin-item-icon" role="img" aria-hidden="true">
                          {getWidgetIcon(widget)}
                        </span>
                        <div className="widget-pin-item-details">
                          <span className="widget-pin-item-title">{widget.title}</span>
                          <span className="widget-pin-item-description">
                            {getWidgetDescription(widget)}
                          </span>
                        </div>
                      </div>
                      <button
                        className="btn-pin active"
                        onClick={() => handleTogglePin(widget.id)}
                        aria-label={`Unpin ${widget.title}`}
                        title="Click to unpin"
                      >
                        📌 Pinned
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Available Widgets Section */}
            <div className="widget-pin-section">
              <h4 className="widget-pin-section-title">
                📋 Available Widgets ({unpinnedWidgets.length})
              </h4>
              <p className="widget-pin-section-description">
                Click to pin these widgets to your dashboard
              </p>
              <div className="widget-pin-list">
                {unpinnedWidgets.length === 0 ? (
                  <div className="widget-pin-empty">
                    <p>All widgets are pinned!</p>
                    <p className="text-muted">Unpin widgets to see them here</p>
                  </div>
                ) : (
                  unpinnedWidgets.map(widget => (
                    <div key={widget.id} className="widget-pin-item unpinned">
                      <div className="widget-pin-item-info">
                        <span className="widget-pin-item-icon" role="img" aria-hidden="true">
                          {getWidgetIcon(widget)}
                        </span>
                        <div className="widget-pin-item-details">
                          <span className="widget-pin-item-title">{widget.title}</span>
                          <span className="widget-pin-item-description">
                            {getWidgetDescription(widget)}
                          </span>
                        </div>
                      </div>
                      <button
                        className="btn-pin"
                        onClick={() => handleTogglePin(widget.id)}
                        aria-label={`Pin ${widget.title}`}
                        title="Click to pin"
                      >
                        📍 Pin
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="widget-pin-panel-footer">
            <p className="text-muted">
              💡 Tip: Pinned widgets appear on your dashboard. Unpinned widgets are hidden but can
              be re-pinned anytime.
            </p>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="widget-pin-overlay" onClick={() => setIsOpen(false)} aria-hidden="true" />
      )}
    </div>
  );
};
