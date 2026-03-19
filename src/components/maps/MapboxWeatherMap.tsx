/**
 * Mapbox GL JS Weather Map Implementation
 * Demonstrates Mapbox GL JS for high-performance weather visualization
 */

import React, { useEffect, useRef, useState } from 'react';

// Note: In a real implementation, you would install and import:
// import mapboxgl from 'mapbox-gl';
// import 'mapbox-gl/dist/mapbox-gl.css';

interface WeatherData {
  id: string;
  coordinates: [number, number];
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  conditions: string;
}

interface MapboxWeatherMapProps {
  center: [number, number];
  zoom: number;
  weatherData: WeatherData[];
  showHeatmap?: boolean;
  showClusters?: boolean;
  style?: 'streets' | 'satellite' | 'dark' | 'light';
  onDataClick?: (data: WeatherData) => void;
}

const MapboxWeatherMap: React.FC<MapboxWeatherMapProps> = ({
  center,
  zoom,
  weatherData,
  showHeatmap = false,
  showClusters = false,
  style = 'streets',
  onDataClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef.current || isLoaded) return;

    // In a real implementation:
    const initializeMap = async () => {
      try {
        console.log('Initializing Mapbox GL JS map...');

        // mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';
        //
        // const map = new mapboxgl.Map({
        //   container: mapContainerRef.current,
        //   style: `mapbox://styles/mapbox/${style}-v11`,
        //   center: center,
        //   zoom: zoom,
        //   antialias: true
        // });
        //
        // map.on('load', () => {
        //   setMapLoaded(true);
        // });
        //
        // mapRef.current = map;

        setIsLoaded(true);
        setTimeout(() => setMapLoaded(true), 1000); // Simulate loading
      } catch (error) {
        console.error('Failed to initialize Mapbox:', error);
      }
    };

    initializeMap();

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const map = mapRef.current;
      if (map) {
        // map.remove();
      }
    };
  }, [center, zoom, style, isLoaded]);

  // Add weather data as GeoJSON source
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !weatherData.length) return;

    const geojsonData = {
      type: 'FeatureCollection',
      features: weatherData.map(data => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: data.coordinates,
        },
        properties: {
          id: data.id,
          temperature: data.temperature,
          humidity: data.humidity,
          pressure: data.pressure,
          windSpeed: data.windSpeed,
          windDirection: data.windDirection,
          conditions: data.conditions,
        },
      })),
    };

    // In real implementation:
    // if (mapRef.current.getSource('weather-data')) {
    //   mapRef.current.getSource('weather-data').setData(geojsonData);
    // } else {
    //   mapRef.current.addSource('weather-data', {
    //     type: 'geojson',
    //     data: geojsonData,
    //     cluster: showClusters,
    //     clusterMaxZoom: 14,
    //     clusterRadius: 50
    //   });
    // }

    console.log('Updated weather data:', geojsonData.features.length, 'points');
  }, [weatherData, mapLoaded, showClusters]);

  // Add weather markers layer
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    // In real implementation:
    // if (!mapRef.current.getLayer('weather-markers')) {
    //   mapRef.current.addLayer({
    //     id: 'weather-markers',
    //     type: 'circle',
    //     source: 'weather-data',
    //     filter: ['!', ['has', 'point_count']],
    //     paint: {
    //       'circle-color': [
    //         'interpolate',
    //         ['linear'],
    //         ['get', 'temperature'],
    //         0, '#0000ff',    // Blue for cold
    //         32, '#00ffff',   // Cyan
    //         50, '#00ff00',   // Green
    //         70, '#ffff00',   // Yellow
    //         85, '#ff8000',   // Orange
    //         100, '#ff0000'   // Red for hot
    //       ],
    //       'circle-radius': [
    //         'interpolate',
    //         ['linear'],
    //         ['zoom'],
    //         5, 3,
    //         15, 8
    //       ],
    //       'circle-stroke-width': 1,
    //       'circle-stroke-color': '#ffffff'
    //     }
    //   });
    //
    //   // Add click handler
    //   mapRef.current.on('click', 'weather-markers', (e) => {
    //     const properties = e.features[0].properties;
    //     onDataClick?.(properties);
    //   });
    // }

    console.log('Added weather markers layer');
  }, [mapLoaded, onDataClick]);

  // Add temperature heatmap
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    if (showHeatmap) {
      // In real implementation:
      // if (!mapRef.current.getLayer('temperature-heatmap')) {
      //   mapRef.current.addLayer({
      //     id: 'temperature-heatmap',
      //     type: 'heatmap',
      //     source: 'weather-data',
      //     paint: {
      //       'heatmap-weight': [
      //         'interpolate',
      //         ['linear'],
      //         ['get', 'temperature'],
      //         0, 0,
      //         100, 1
      //       ],
      //       'heatmap-intensity': [
      //         'interpolate',
      //         ['linear'],
      //         ['zoom'],
      //         0, 1,
      //         15, 3
      //       ],
      //       'heatmap-color': [
      //         'interpolate',
      //         ['linear'],
      //         ['heatmap-density'],
      //         0, 'rgba(0,0,255,0)',
      //         0.2, 'rgb(0,255,255)',
      //         0.4, 'rgb(0,255,0)',
      //         0.6, 'rgb(255,255,0)',
      //         0.8, 'rgb(255,128,0)',
      //         1, 'rgb(255,0,0)'
      //       ],
      //       'heatmap-radius': [
      //         'interpolate',
      //         ['linear'],
      //         ['zoom'],
      //         0, 2,
      //         15, 20
      //       ]
      //     }
      //   });
      // }

      console.log('Added temperature heatmap');
    } else {
      // Remove heatmap layer
      // if (mapRef.current.getLayer('temperature-heatmap')) {
      //   mapRef.current.removeLayer('temperature-heatmap');
      // }
    }
  }, [showHeatmap, mapLoaded]);

  // Add cluster layers
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    if (showClusters) {
      // In real implementation:
      // Add cluster circles
      // Add cluster count labels
      // Add unclustered points
      console.log('Added clustering layers');
    }
  }, [showClusters, mapLoaded]);

  return (
    <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading Mapbox GL JS...</p>
          </div>
        </div>
      )}

      {/* Map controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
        <button
          onClick={() => {
            /* Toggle heatmap */
          }}
          className={`block w-full px-3 py-1 text-sm rounded ${
            showHeatmap ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          Heatmap
        </button>
        <button
          onClick={() => {
            /* Toggle clusters */
          }}
          className={`block w-full px-3 py-1 text-sm rounded ${
            showClusters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          Clusters
        </button>
      </div>

      {/* Map info */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
        <h3 className="font-semibold text-gray-900 mb-1">Mapbox GL JS</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <div>Bundle: ~500KB gzipped</div>
          <div>Cost: $5/1K loads after 50K</div>
          <div>Points: {weatherData.length}</div>
          <div>WebGL: ✓ Vector Tiles: ✓</div>
        </div>
      </div>
    </div>
  );
};

// Example usage component
export const MapboxWeatherMapExample: React.FC = () => {
  const [weatherData] = useState<WeatherData[]>([
    {
      id: '1',
      coordinates: [-74.006, 40.7128],
      temperature: 72,
      humidity: 65,
      pressure: 1013,
      windSpeed: 8,
      windDirection: 180,
      conditions: 'Partly Cloudy',
    },
    {
      id: '2',
      coordinates: [-73.9851, 40.7589],
      temperature: 85,
      humidity: 70,
      pressure: 1010,
      windSpeed: 12,
      windDirection: 220,
      conditions: 'Hot',
    },
    {
      id: '3',
      coordinates: [-74.0445, 40.6892],
      temperature: 45,
      humidity: 80,
      pressure: 1020,
      windSpeed: 15,
      windDirection: 90,
      conditions: 'Cold',
    },
  ]);

  const handleDataClick = (data: WeatherData) => {
    console.log('Weather data clicked:', data);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🗺️ Mapbox GL JS Weather Map</h2>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Key Features:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• WebGL-accelerated rendering</li>
            <li>• Beautiful vector tiles and styling</li>
            <li>• Built-in clustering and heatmaps</li>
            <li>• Smooth animations and transitions</li>
            <li>• Excellent mobile performance</li>
          </ul>
        </div>

        <MapboxWeatherMap
          center={[-74.006, 40.7128]}
          zoom={10}
          weatherData={weatherData}
          showHeatmap={false}
          showClusters={false}
          style="streets"
          onDataClick={handleDataClick}
        />

        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">Best For:</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• High-performance weather apps</li>
            <li>• Beautiful custom styling</li>
            <li>• Mobile-first applications</li>
            <li>• Professional/commercial projects</li>
            <li>• Advanced weather visualizations</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-red-50 rounded-lg">
          <h4 className="font-semibold text-red-900 mb-2">Considerations:</h4>
          <ul className="text-sm text-red-800 space-y-1">
            <li>• Larger bundle size (~500KB)</li>
            <li>• Requires API key and has usage limits</li>
            <li>• Can be expensive for high-traffic apps</li>
            <li>• Learning curve for advanced styling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MapboxWeatherMap;
