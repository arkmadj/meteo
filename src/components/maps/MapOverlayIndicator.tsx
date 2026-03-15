/**
 * MapOverlayIndicator Component
 *
 * Visual indicator showing which overlays are currently active on the map
 * with quick toggle controls and opacity adjustments.
 */

import React from 'react';

import { useTheme } from '@/design-system/theme';
import { useMapCompactMode, useMapResponsive } from '@/hooks/useMapResponsive';

export interface OverlayInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  active: boolean;
  opacity?: number;
}

export interface MapOverlayIndicatorProps {
  /** List of overlays to display */
  overlays: OverlayInfo[];
  /** Position on the map */
  position?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  /** Whether the indicator is visible */
  visible?: boolean;
  /** Show opacity controls */
  showOpacityControls?: boolean;
  /** Compact mode (smaller indicator) */
  compact?: boolean;
  /** Custom className */
  className?: string;
  /** Callback when overlay is toggled */
  onToggleOverlay?: (overlayId: string) => void;
  /** Callback when opacity changes */
  onOpacityChange?: (overlayId: string, opacity: number) => void;
}

/**
 * Get position classes for indicator placement
 */
const getPositionClasses = (position: string): string => {
  const positions = {
    topLeft: 'top-20 left-4',
    topRight: 'top-20 right-4',
    bottomLeft: 'bottom-20 left-4',
    bottomRight: 'bottom-20 right-4',
  };
  return positions[position as keyof typeof positions] || positions.topLeft;
};

/**
 * MapOverlayIndicator Component
 */
const MapOverlayIndicator: React.FC<MapOverlayIndicatorProps> = ({
  overlays,
  position = 'topLeft',
  visible = true,
  showOpacityControls = false,
  compact = false,
  className = '',
  onToggleOverlay,
  onOpacityChange,
}) => {
  const { theme } = useTheme();
  const responsive = useMapResponsive();
  const autoCompact = useMapCompactMode();

  // Use responsive compact mode if not explicitly set
  const isCompact = compact || autoCompact;

  const isDark = theme.isDark;
  const bgColor = isDark ? 'bg-gray-800/95' : 'bg-white/95';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryTextColor = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const hoverBgColor = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100';
  const colorIndicatorBorderColor = isDark ? '#4b5563' : '#d1d5db';

  if (!visible) return null;

  const activeOverlays = overlays.filter(overlay => overlay.active);

  if (activeOverlays.length === 0) return null;

  // Get responsive position - override for mobile
  const responsivePosition = responsive.isMobile ? responsive.positions.overlay : position;

  return (
    <div
      className={`map-control map-overlay-indicator absolute ${getPositionClasses(responsivePosition)} z-[1000] ${className}`}
      style={{
        pointerEvents: 'auto',
        top: responsive.isMobile ? `${responsive.safeAreaInsets.top + 8}px` : undefined,
      }}
    >
      <div
        className={`map-control-panel map-overlay-indicator-compact ${bgColor} ${borderColor} rounded-lg shadow-xl border-2 backdrop-blur-sm ${
          isCompact ? 'p-2' : 'p-3'
        } ${isCompact ? 'min-w-[120px]' : 'min-w-[160px]'}`}
      >
        {/* Header */}
        <div className="flex items-center space-x-2 mb-2">
          <svg
            className={`map-overlay-icon w-4 h-4 ${textColor}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
          <h3 className={`${isCompact ? 'text-xs' : 'text-sm'} font-semibold ${textColor}`}>
            Active Overlays
          </h3>
        </div>

        {/* Overlay List */}
        <div className="space-y-2">
          {activeOverlays.map(overlay => (
            <div key={overlay.id} className="map-overlay-item space-y-1">
              {/* Overlay Item */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onToggleOverlay?.(overlay.id)}
                  className={`map-button flex items-center space-x-2 flex-1 ${hoverBgColor} rounded px-2 py-1 transition-colors`}
                  style={{ minHeight: responsive.controlSizes.buttonSize }}
                  title={`Toggle ${overlay.name}`}
                >
                  <span className="text-lg">{overlay.icon}</span>
                  <div className="flex-1 text-left">
                    <div
                      className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium ${textColor}`}
                    >
                      {overlay.name}
                    </div>
                    {!isCompact && overlay.opacity !== undefined && (
                      <div className={`text-[0.65rem] ${secondaryTextColor}`}>
                        {Math.round(overlay.opacity * 100)}% opacity
                      </div>
                    )}
                  </div>
                  <div
                    className="w-3 h-3 rounded-full border-2"
                    style={{
                      backgroundColor: overlay.color,
                      borderColor: colorIndicatorBorderColor,
                    }}
                  />
                </button>
              </div>

              {/* Opacity Control */}
              {showOpacityControls && overlay.opacity !== undefined && !isCompact && (
                <div className="flex items-center space-x-2 px-2">
                  <span className={`text-[0.65rem] ${secondaryTextColor} whitespace-nowrap`}>
                    Opacity:
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(overlay.opacity * 100)}
                    onChange={e => onOpacityChange?.(overlay.id, parseInt(e.target.value) / 100)}
                    className="flex-1 h-1"
                    style={{
                      accentColor: overlay.color,
                    }}
                  />
                  <span className={`text-[0.65rem] ${secondaryTextColor} w-8 text-right`}>
                    {Math.round(overlay.opacity * 100)}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Info */}
        {!compact && activeOverlays.length > 1 && (
          <div className={`mt-2 pt-2 border-t ${borderColor}`}>
            <div className={`text-[0.65rem] ${secondaryTextColor} text-center`}>
              {activeOverlays.length} overlay{activeOverlays.length > 1 ? 's' : ''} active
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapOverlayIndicator;
