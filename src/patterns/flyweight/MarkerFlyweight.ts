/**
 * Flyweight Pattern Implementation for Map Markers
 *
 * The Flyweight pattern is a structural design pattern that minimizes memory usage
 * by sharing common data (intrinsic state) among multiple objects, while keeping
 * unique data (extrinsic state) separate.
 *
 * For map markers, this means:
 * - Intrinsic state: Shared marker appearance (icon, color, size, style)
 * - Extrinsic state: Unique marker data (position, label, metadata)
 *
 * Benefits:
 * - Reduces memory footprint when rendering 1000+ markers
 * - Improves rendering performance by reusing DOM elements
 * - Enables efficient marker clustering and filtering
 */

import L from 'leaflet';

/**
 * Intrinsic state - shared among markers of the same type
 * This data is stored once and reused by multiple markers
 */
export interface IMarkerIntrinsicState {
  /** Marker type identifier */
  type: string;
  /** Marker color */
  color: string;
  /** Marker size in pixels */
  size: number;
  /** Icon SVG or HTML */
  iconHtml: string;
  /** Border color */
  borderColor?: string;
  /** Border width */
  borderWidth?: number;
  /** Z-index for layering */
  zIndex?: number;
}

/**
 * Extrinsic state - unique to each marker instance
 * This data is passed to the flyweight when rendering
 */
export interface IMarkerExtrinsicState {
  /** Marker position */
  position: [number, number];
  /** Marker label/title */
  label: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Unique identifier */
  id: string | number;
}

/**
 * Complete marker data combining intrinsic and extrinsic state
 */
export interface IMarkerData extends IMarkerExtrinsicState {
  /** Marker type (references intrinsic state) */
  type: string;
}

/**
 * MarkerFlyweight class
 * Represents a shared marker appearance that can be reused
 */
export class MarkerFlyweight {
  private intrinsicState: IMarkerIntrinsicState;
  private icon: L.DivIcon | null = null;

  constructor(intrinsicState: IMarkerIntrinsicState) {
    this.intrinsicState = intrinsicState;
  }

  /**
   * Get or create the Leaflet icon for this flyweight
   */
  public getIcon(): L.DivIcon {
    if (!this.icon) {
      this.icon = this.createIcon();
    }
    return this.icon;
  }

  /**
   * Create a Leaflet DivIcon from the intrinsic state
   */
  private createIcon(): L.DivIcon {
    const { size, color, iconHtml, borderColor, borderWidth, zIndex } = this.intrinsicState;

    return L.divIcon({
      className: `marker-flyweight marker-${this.intrinsicState.type}`,
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border: ${borderWidth || 2}px solid ${borderColor || '#ffffff'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          z-index: ${zIndex || 500};
        ">
          ${iconHtml}
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
    });
  }

  /**
   * Get the intrinsic state
   */
  public getIntrinsicState(): IMarkerIntrinsicState {
    return this.intrinsicState;
  }

  /**
   * Create a Leaflet marker with this flyweight's appearance
   * and the provided extrinsic state
   */
  public createMarker(extrinsicState: IMarkerExtrinsicState): L.Marker {
    const marker = L.marker(extrinsicState.position, {
      icon: this.getIcon(),
      title: extrinsicState.label,
    });

    // Store extrinsic state for later retrieval
    (marker as any).extrinsicState = extrinsicState;

    return marker;
  }

  /**
   * Get a unique key for this flyweight based on intrinsic state
   */
  public static getKey(intrinsicState: IMarkerIntrinsicState): string {
    return `${intrinsicState.type}-${intrinsicState.color}-${intrinsicState.size}`;
  }
}
