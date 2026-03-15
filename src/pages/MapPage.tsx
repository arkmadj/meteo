import React from 'react';
import { LazyBaseWeatherMap } from '@/components/maps/LazyMap';

/**
 * Full-screen Map Page
 * Displays an interactive map with zoom, pan, and geolocation support
 */
const MapPage: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gray-50">
      <LazyBaseWeatherMap
        preloadStrategy="immediate"
        height="100vh"
        showUserLocation={true}
        enableUrlSync={true}
      />
    </div>
  );
};

export default MapPage;

