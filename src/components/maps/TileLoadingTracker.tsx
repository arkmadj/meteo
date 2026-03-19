/**
 * TileLoadingTracker Component
 *
 * Tracks tile loading progress for Leaflet maps and provides
 * loading state feedback to users.
 */

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

import { useMapTileLoading } from '@/hooks/useMapTileLoading';
import MapLoadingOverlay from './MapLoadingOverlay';

export interface TileLoadingTrackerProps {
  /** Show loading overlay */
  showOverlay?: boolean;
  /** Position of loading overlay */
  overlayPosition?: 'center' | 'top' | 'bottom';
  /** Show progress bar */
  showProgress?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Custom loading message */
  loadingMessage?: string;
  /** Custom error message */
  errorMessage?: string;
  /** Callback when loading starts */
  onLoadStart?: () => void;
  /** Callback when loading completes */
  onLoadComplete?: () => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
}

/**
 * TileLoadingTracker Component
 */
const TileLoadingTracker: React.FC<TileLoadingTrackerProps> = ({
  showOverlay = true,
  overlayPosition = 'top',
  showProgress = true,
  compact = false,
  loadingMessage = 'Loading map tiles...',
  errorMessage = 'Failed to load map tiles',
  onLoadStart,
  onLoadComplete,
  onError,
}) => {
  const map = useMap();
  const pendingTilesRef = useRef(new Set<string>());
  const totalTilesRef = useRef(0);

  const { state, startLoading, completeLoading, reportError, retry, reset, updateProgress } =
    useMapTileLoading({
      maxRetries: 3,
      retryDelay: 2000,
      timeout: 30000,
      onLoadStart,
      onLoadComplete,
      onError,
    });

  useEffect(() => {
    if (!map) return;

    /**
     * Handle tile load start
     */
    const handleTileLoadStart = (event: L.TileEvent) => {
      const tileKey = `${event.coords.x}-${event.coords.y}-${event.coords.z}`;

      if (!pendingTilesRef.current.has(tileKey)) {
        pendingTilesRef.current.add(tileKey);
        totalTilesRef.current++;

        if (pendingTilesRef.current.size === 1) {
          startLoading();
        }

        updateProgress(totalTilesRef.current - pendingTilesRef.current.size, totalTilesRef.current);
      }
    };

    /**
     * Handle tile load success
     */
    const handleTileLoad = (event: L.TileEvent) => {
      const tileKey = `${event.coords.x}-${event.coords.y}-${event.coords.z}`;
      pendingTilesRef.current.delete(tileKey);

      updateProgress(totalTilesRef.current - pendingTilesRef.current.size, totalTilesRef.current);

      if (pendingTilesRef.current.size === 0) {
        completeLoading();
        // Reset counters after a delay
        setTimeout(() => {
          totalTilesRef.current = 0;
        }, 1000);
      }
    };

    /**
     * Handle tile load error
     */
    const handleTileError = (event: L.TileErrorEvent) => {
      const tileKey = `${event.coords.x}-${event.coords.y}-${event.coords.z}`;
      pendingTilesRef.current.delete(tileKey);

      // Report error if too many tiles fail
      const failureRate =
        1 - (totalTilesRef.current - pendingTilesRef.current.size) / totalTilesRef.current;
      if (failureRate > 0.3) {
        reportError(new Error('Too many tiles failed to load'));
      }

      updateProgress(totalTilesRef.current - pendingTilesRef.current.size, totalTilesRef.current);

      if (pendingTilesRef.current.size === 0) {
        completeLoading();
        setTimeout(() => {
          totalTilesRef.current = 0;
        }, 1000);
      }
    };

    /**
     * Handle loading event (fired when all tiles are loaded)
     */
    const handleLoading = () => {
      if (pendingTilesRef.current.size > 0) {
        startLoading();
      }
    };

    /**
     * Handle load event (fired when all tiles are loaded)
     */
    const handleLoad = () => {
      if (pendingTilesRef.current.size === 0) {
        completeLoading();
      }
    };

    // Attach event listeners to all tile layers
    map.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.TileLayer) {
        layer.on('tileloadstart', handleTileLoadStart);
        layer.on('tileload', handleTileLoad);
        layer.on('tileerror', handleTileError);
        layer.on('loading', handleLoading);
        layer.on('load', handleLoad);
      }
    });

    // Listen for new layers being added
    const handleLayerAdd = (event: L.LayerEvent) => {
      if (event.layer instanceof L.TileLayer) {
        event.layer.on('tileloadstart', handleTileLoadStart);
        event.layer.on('tileload', handleTileLoad);
        event.layer.on('tileerror', handleTileError);
        event.layer.on('loading', handleLoading);
        event.layer.on('load', handleLoad);
      }
    };

    map.on('layeradd', handleLayerAdd);

    // Cleanup
    return () => {
      map.eachLayer((layer: L.Layer) => {
        if (layer instanceof L.TileLayer) {
          layer.off('tileloadstart', handleTileLoadStart);
          layer.off('tileload', handleTileLoad);
          layer.off('tileerror', handleTileError);
          layer.off('loading', handleLoading);
          layer.off('load', handleLoad);
        }
      });
      map.off('layeradd', handleLayerAdd);
      reset();
    };
  }, [map, startLoading, completeLoading, reportError, updateProgress, reset]);

  if (!showOverlay) return null;

  return (
    <MapLoadingOverlay
      state={state.isLoading ? 'loading' : state.hasError ? 'error' : 'idle'}
      message={loadingMessage}
      errorMessage={state.errorMessage || errorMessage}
      progress={state.progress}
      showProgress={showProgress}
      position={overlayPosition}
      compact={compact}
      onRetry={retry}
      onDismiss={reset}
    />
  );
};

export default TileLoadingTracker;
