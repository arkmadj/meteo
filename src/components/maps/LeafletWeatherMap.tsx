/**
 * Leaflet Weather Map Implementation
 * Demonstrates Leaflet.js for weather visualization
 */

import React, { useEffect, useRef, useState } from 'react';

// Note: In a real implementation, you would install and import:
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

interface WeatherStation {
  id: string;
  lat: number;
  lng: number;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  conditions: string;
}

interface LeafletWeatherMapProps {
  center: [number, number];
  zoom: number;
  weatherStations: WeatherStation[];
  showRadar?: boolean;
  showSatellite?: boolean;
  onStationClick?: (station: WeatherStation) => void;
}

const LeafletWeatherMap: React.FC<LeafletWeatherMapProps> = ({
  center,
  zoom,
  weatherStations,
  showRadar = false,
  showSatellite = false,
  onStationClick,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || isLoaded) return;

    // In a real implementation, this would use actual Leaflet
    const initializeMap = () => {
      try {
        // Simulated Leaflet initialization
        console.log('Initializing Leaflet map...');

        // const map = L.map(mapRef.current).setView(center, zoom);
        //
        // // Add base tile layer
        // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        //   attribution: '© OpenStreetMap contributors'
        // }).addTo(map);

        // mapInstanceRef.current = map;
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to initialize Leaflet:', error);
      }
    };

    initializeMap();

    return () => {
      // Cleanup map instance
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const mapInstance = mapInstanceRef.current;
      if (mapInstance) {
        // mapInstance.remove();
      }
    };
  }, [center, zoom, isLoaded]);

  // Add weather stations as markers
  useEffect(() => {
    if (!mapInstanceRef.current || !weatherStations.length) return;

    // Clear existing markers
    markersRef.current.forEach(_marker => {
      // mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    weatherStations.forEach(_station => {
      // In real implementation:
      // const marker = L.marker([station.lat, station.lng])
      //   .bindPopup(`
      //     <div class="weather-popup">
      //       <h3>${station.conditions}</h3>
      //       <p>Temperature: ${station.temperature}°F</p>
      //       <p>Humidity: ${station.humidity}%</p>
      //       <p>Pressure: ${station.pressure} hPa</p>
      //       <p>Wind: ${station.windSpeed} mph</p>
      //     </div>
      //   `)
      //   .on('click', () => onStationClick?.(station))
      //   .addTo(mapInstanceRef.current);
      // markersRef.current.push(marker);
    });
  }, [weatherStations, onStationClick]);

  // Add weather radar overlay
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (showRadar) {
      // In real implementation:
      // const radarLayer = L.tileLayer('https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=YOUR_API_KEY', {
      //   attribution: 'Weather data © OpenWeatherMap',
      //   opacity: 0.6
      // }).addTo(mapInstanceRef.current);

      console.log('Adding radar overlay...');
    }
  }, [showRadar]);

  // Add satellite imagery
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (showSatellite) {
      // In real implementation:
      // const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      //   attribution: 'Tiles © Esri'
      // }).addTo(mapInstanceRef.current);

      console.log('Adding satellite imagery...');
    }
  }, [showSatellite]);

  return (
    <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading Leaflet map...</p>
          </div>
        </div>
      )}

      {/* Map controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
        <button
          onClick={() => {
            /* Toggle radar */
          }}
          className={`block w-full px-3 py-1 text-sm rounded ${
            showRadar ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          Radar
        </button>
        <button
          onClick={() => {
            /* Toggle satellite */
          }}
          className={`block w-full px-3 py-1 text-sm rounded ${
            showSatellite ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Map info */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
        <h3 className="font-semibold text-gray-900 mb-1">Leaflet Map</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <div>Bundle: ~39KB gzipped</div>
          <div>Cost: Free</div>
          <div>Stations: {weatherStations.length}</div>
        </div>
      </div>
    </div>
  );
};

// Example usage component
export const LeafletWeatherMapExample: React.FC = () => {
  const [weatherStations] = useState<WeatherStation[]>([
    {
      id: '1',
      lat: 40.7128,
      lng: -74.006,
      temperature: 72,
      humidity: 65,
      pressure: 1013,
      windSpeed: 8,
      conditions: 'Partly Cloudy',
    },
    {
      id: '2',
      lat: 40.7589,
      lng: -73.9851,
      temperature: 75,
      humidity: 60,
      pressure: 1015,
      windSpeed: 12,
      conditions: 'Sunny',
    },
  ]);

  const handleStationClick = (station: WeatherStation) => {
    console.log('Weather station clicked:', station);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🍃 Leaflet Weather Map</h2>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Key Features:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Lightweight (~39KB gzipped)</li>
            <li>• Completely free and open source</li>
            <li>• Extensive plugin ecosystem</li>
            <li>• Simple API and great documentation</li>
            <li>• Mobile-friendly out of the box</li>
          </ul>
        </div>

        <LeafletWeatherMap
          center={[40.7128, -74.006]}
          zoom={10}
          weatherStations={weatherStations}
          showRadar={false}
          showSatellite={false}
          onStationClick={handleStationClick}
        />

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Best For:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Budget-conscious projects</li>
            <li>• Simple weather overlays</li>
            <li>• Rapid prototyping</li>
            <li>• Open source projects</li>
            <li>• Custom tile providers</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold text-yellow-900 mb-2">Limitations:</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• No native vector tiles or WebGL</li>
            <li>• Performance degrades with many markers</li>
            <li>• Requires plugins for advanced features</li>
            <li>• Limited built-in styling options</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LeafletWeatherMap;
