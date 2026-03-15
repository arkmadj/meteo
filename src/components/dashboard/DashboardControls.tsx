import React, { useState } from 'react';

import { DASHBOARD_PRESETS, WIDGET_METADATA } from '@/constants/dashboard';
import { useDashboardLayout } from '@/contexts/DashboardLayoutContext';
import { useTheme } from '@/design-system/theme';
import type { WidgetType } from '@/types/dashboard';

import { WidgetPinManager } from './WidgetPinManager';

export interface DashboardControlsProps {
  className?: string;
}

/**
 * Dashboard controls for customization
 */
const DashboardControls: React.FC<DashboardControlsProps> = ({ className = '' }) => {
  const { theme } = useTheme();
  const { state, toggleEditMode, resetLayout, loadPreset, addWidget, exportLayout, importLayout } =
    useDashboardLayout();

  const [showPresets, setShowPresets] = useState(false);
  const [showWidgets, setShowWidgets] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);

  const handleExport = () => {
    const json = exportLayout();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-layout-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await importLayout(text);
      setShowExportImport(false);
    } catch (error) {
      alert('Failed to import layout. Please check the file format.');
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {/* Widget Pin Manager */}
      <WidgetPinManager />

      {/* Edit Mode Toggle */}
      <button
        onClick={toggleEditMode}
        className={`
          px-4 py-2 rounded-lg font-medium
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${
            state.isEditMode
              ? 'bg-[var(--theme-primary)] text-white hover:opacity-90 focus:ring-[var(--theme-primary)]'
              : 'bg-[var(--theme-surface)] text-[var(--theme-text)] border border-[var(--theme-border)] hover:bg-[var(--theme-background)] focus:ring-[var(--theme-primary)]'
          }
        `}
        type="button"
      >
        {state.isEditMode ? '✓ Done Editing' : '✏️ Edit Layout'}
      </button>

      {/* Presets Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="
            px-4 py-2 rounded-lg font-medium
            bg-[var(--theme-surface)] text-[var(--theme-text)]
            border border-[var(--theme-border)]
            hover:bg-[var(--theme-background)]
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]
          "
          type="button"
        >
          📐 Presets
        </button>

        {showPresets && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowPresets(false)}
              onKeyDown={e => e.key === 'Escape' && setShowPresets(false)}
              role="button"
              tabIndex={-1}
            />
            <div
              className="
                absolute top-full left-0 mt-2 z-20
                w-64 rounded-lg shadow-lg
                bg-[var(--theme-surface)]
                border border-[var(--theme-border)]
                overflow-hidden
              "
            >
              {DASHBOARD_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => {
                    loadPreset(preset);
                    setShowPresets(false);
                  }}
                  className="
                    w-full px-4 py-3 text-left
                    hover:bg-[var(--theme-background)]
                    transition-colors
                    border-b border-[var(--theme-border)] last:border-b-0
                  "
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{preset.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-[var(--theme-text)]">{preset.name}</div>
                      <div className="text-xs text-[var(--theme-text-secondary)]">
                        {preset.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add Widget Dropdown */}
      {state.isEditMode && (
        <div className="relative">
          <button
            onClick={() => setShowWidgets(!showWidgets)}
            className="
              px-4 py-2 rounded-lg font-medium
              bg-[var(--theme-surface)] text-[var(--theme-text)]
              border border-[var(--theme-border)]
              hover:bg-[var(--theme-background)]
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]
            "
            type="button"
          >
            ➕ Add Widget
          </button>

          {showWidgets && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowWidgets(false)}
                onKeyDown={e => e.key === 'Escape' && setShowWidgets(false)}
                role="button"
                tabIndex={-1}
              />
              <div
                className="
                  absolute top-full left-0 mt-2 z-20
                  w-72 rounded-lg shadow-lg
                  bg-[var(--theme-surface)]
                  border border-[var(--theme-border)]
                  overflow-hidden
                  max-h-96 overflow-y-auto
                "
              >
                {Object.values(WIDGET_METADATA).map(widget => (
                  <button
                    key={widget.type}
                    onClick={() => {
                      addWidget(widget.type as WidgetType);
                      setShowWidgets(false);
                    }}
                    className="
                      w-full px-4 py-3 text-left
                      hover:bg-[var(--theme-background)]
                      transition-colors
                      border-b border-[var(--theme-border)] last:border-b-0
                    "
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{widget.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-[var(--theme-text)]">{widget.title}</div>
                        <div className="text-xs text-[var(--theme-text-secondary)]">
                          {widget.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Reset Layout */}
      <button
        onClick={() => {
          if (confirm('Are you sure you want to reset the layout to default?')) {
            resetLayout();
          }
        }}
        className="
          px-4 py-2 rounded-lg font-medium
          bg-[var(--theme-surface)] text-[var(--theme-text)]
          border border-[var(--theme-border)]
          hover:bg-[var(--theme-background)]
          transition-colors
          focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]
        "
        type="button"
      >
        🔄 Reset
      </button>

      {/* Export/Import */}
      <div className="relative">
        <button
          onClick={() => setShowExportImport(!showExportImport)}
          className="
            px-4 py-2 rounded-lg font-medium
            bg-[var(--theme-surface)] text-[var(--theme-text)]
            border border-[var(--theme-border)]
            hover:bg-[var(--theme-background)]
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]
          "
          type="button"
        >
          💾 Export/Import
        </button>

        {showExportImport && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowExportImport(false)}
              onKeyDown={e => e.key === 'Escape' && setShowExportImport(false)}
              role="button"
              tabIndex={-1}
            />
            <div
              className="
                absolute top-full right-0 mt-2 z-20
                w-48 rounded-lg shadow-lg
                bg-[var(--theme-surface)]
                border border-[var(--theme-border)]
                overflow-hidden
              "
            >
              <button
                onClick={() => {
                  handleExport();
                  setShowExportImport(false);
                }}
                className="
                  w-full px-4 py-3 text-left
                  hover:bg-[var(--theme-background)]
                  transition-colors
                  border-b border-[var(--theme-border)]
                "
                type="button"
              >
                <div className="font-medium text-[var(--theme-text)]">📤 Export Layout</div>
              </button>
              <label
                className="
                  block w-full px-4 py-3 text-left
                  hover:bg-[var(--theme-background)]
                  transition-colors
                  cursor-pointer
                "
              >
                <div className="font-medium text-[var(--theme-text)]">📥 Import Layout</div>
                <input accept=".json" className="hidden" onChange={handleImport} type="file" />
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

DashboardControls.displayName = 'DashboardControls';

export default DashboardControls;
