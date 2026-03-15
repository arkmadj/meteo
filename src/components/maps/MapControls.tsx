/**
 * Map Controls Component
 * Modern, accessible, and cohesive map controls interface
 * Consistent with the app's design system
 */

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Checkbox, Dropdown, type DropdownItem } from '@/components/ui/atoms';
import { Flex, Stack } from '@/components/ui/layout';
import { useTheme } from '@/design-system/theme';

export interface MapControlsProps {
  /** Map height in pixels */
  mapHeight: string;
  /** Callback when map height changes */
  onMapHeightChange: (height: string) => void;
  /** Show weather stations toggle state */
  showWeatherStations: boolean;
  /** Callback when weather stations toggle changes */
  onShowWeatherStationsChange: (show: boolean) => void;
  /** Show radar overlay toggle state */
  showRadarOverlay: boolean;
  /** Callback when radar overlay toggle changes */
  onShowRadarOverlayChange: (show: boolean) => void;
  /** Show wind patterns toggle state */
  showWindPatterns?: boolean;
  /** Callback when wind patterns toggle changes */
  onShowWindPatternsChange?: (show: boolean) => void;
  /** Callback for quick location buttons */
  onQuickLocationClick: (lat: number, lng: number, name: string) => void;
  /** Additional className */
  className?: string;
}

const MapControls: React.FC<MapControlsProps> = ({
  mapHeight,
  onMapHeightChange,
  showWeatherStations,
  onShowWeatherStationsChange,
  showRadarOverlay,
  onShowRadarOverlayChange,
  showWindPatterns = false,
  onShowWindPatternsChange,
  onQuickLocationClick,
  className = '',
}) => {
  const { t } = useTranslation('common');
  const { theme } = useTheme();

  // Theme-aware colors using design system
  const cardBg = theme.isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = theme.isDark ? 'text-gray-100' : 'text-gray-900';
  const labelText = theme.isDark ? 'text-gray-300' : 'text-gray-700';
  const borderColor = theme.isDark ? 'border-gray-700' : 'border-gray-200';
  const hoverBg = theme.isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50';
  const focusRing = 'focus-within:ring-2 focus-within:ring-[var(--theme-accent,#3b82f6)]';

  // Height selection dropdown items
  const heightOptions: DropdownItem[] = useMemo(
    () => [
      {
        id: '300px',
        label: t('mapDemo.baseDemo.mapHeightSmall'),
        onClick: () => onMapHeightChange('300px'),
      },
      {
        id: '500px',
        label: t('mapDemo.baseDemo.mapHeightMedium'),
        onClick: () => onMapHeightChange('500px'),
      },
      {
        id: '700px',
        label: t('mapDemo.baseDemo.mapHeightLarge'),
        onClick: () => onMapHeightChange('700px'),
      },
    ],
    [t, onMapHeightChange]
  );

  const selectedHeightLabel = useMemo(
    () =>
      heightOptions.find(opt => opt.id === mapHeight)?.label ||
      t('mapDemo.baseDemo.mapHeightMedium'),
    [heightOptions, mapHeight, t]
  );

  return (
    <div
      className={`${cardBg} rounded-lg shadow-lg border ${borderColor} transition-all duration-200 ${hoverBg} ${className}`}
      style={{
        backgroundColor: theme.surfaceColor,
        borderColor: `var(--theme-border, ${theme.isDark ? '#374151' : '#e5e7eb'})`,
      }}
      role="region"
      aria-label={t('mapDemo.baseDemo.controls')}
    >
      {/* Header with accent indicator */}
      <div
        className="px-6 py-4 border-b"
        style={{ borderColor: `var(--theme-border, ${theme.isDark ? '#374151' : '#e5e7eb'})` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-1 h-6 rounded-full"
            style={{ backgroundColor: 'var(--theme-accent, #3b82f6)' }}
            aria-hidden="true"
          />
          <h2 className={`text-lg font-semibold ${textColor}`} id="map-controls-heading">
            {t('mapDemo.baseDemo.controls')}
          </h2>
        </div>
      </div>

      {/* Controls Content */}
      <div className="p-6" role="group" aria-labelledby="map-controls-heading">
        <Stack spacing="lg" direction="column">
          {/* Row 1: Height Selector and Toggles */}
          <Flex
            gap="lg"
            wrap
            alignItems="flex-start"
            justifyContent="space-between"
            className="flex-col lg:flex-row"
          >
            {/* Map Height Control */}
            <div className="flex-1 min-w-[200px]">
              <label className={`block text-sm font-medium mb-3 ${labelText}`}>
                {t('mapDemo.baseDemo.mapHeight')}
              </label>
              <div className={`rounded-lg border ${borderColor} ${focusRing} transition-all`}>
                <Dropdown
                  items={heightOptions}
                  trigger={selectedHeightLabel}
                  placement="bottom-start"
                  size="md"
                  variant="default"
                  className="w-full"
                />
              </div>
            </div>

            {/* Toggle Controls */}
            <div
              className="flex flex-col gap-4 flex-1"
              role="group"
              aria-label={t('mapDemo.baseDemo.overlayOptions')}
            >
              <Checkbox
                checked={showWeatherStations}
                onCheckedChange={onShowWeatherStationsChange}
                label={t('mapDemo.baseDemo.showWeatherStations')}
                size="sm"
                aria-describedby="weather-stations-desc"
              />
              <Checkbox
                checked={showRadarOverlay}
                onCheckedChange={onShowRadarOverlayChange}
                label={t('mapDemo.baseDemo.showRadarOverlay')}
                size="sm"
                aria-describedby="radar-overlay-desc"
              />
              {onShowWindPatternsChange && (
                <Checkbox
                  checked={showWindPatterns}
                  onCheckedChange={onShowWindPatternsChange}
                  label={t('mapDemo.baseDemo.showWindPatterns', 'Show Wind Patterns')}
                  size="sm"
                  aria-describedby="wind-patterns-desc"
                />
              )}
            </div>
          </Flex>

          {/* Row 2: Quick Location Buttons */}
          <div role="group" aria-label={t('mapDemo.baseDemo.quickLocations')}>
            <label className={`block text-sm font-medium mb-3 ${labelText}`}>
              {t('mapDemo.baseDemo.quickLocations')}
            </label>
            <Flex gap="sm" wrap className="flex-wrap">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onQuickLocationClick(40.7128, -74.006, 'New York')}
                aria-label={t('mapDemo.baseDemo.centerOnNewYork')}
                className="transition-all duration-200 hover:scale-105"
                title={t('mapDemo.baseDemo.centerOnNewYork')}
              >
                🗽 NYC
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onQuickLocationClick(51.5074, -0.1278, 'London')}
                aria-label={t('mapDemo.baseDemo.centerOnLondon')}
                className="transition-all duration-200 hover:scale-105"
                title={t('mapDemo.baseDemo.centerOnLondon')}
              >
                🇬🇧 London
              </Button>
            </Flex>
          </div>
        </Stack>
      </div>
    </div>
  );
};

export default MapControls;
