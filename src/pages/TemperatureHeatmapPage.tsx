/**
 * TemperatureHeatmapPage
 *
 * Showcase page for temperature heatmap visualization features
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

// Demo component removed
import { useTheme } from '@/design-system/theme';

const TemperatureHeatmapPage: React.FC = () => {
  const { _t } = useTranslation(['common']);
  const { theme } = useTheme();

  const isDark = theme.isDark;
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryTextColor = isDark ? 'text-gray-300' : 'text-gray-600';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgColor} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className={`${cardBg} rounded-lg shadow-lg p-8 mb-8 border ${borderColor}`}>
          <h1 className={`text-4xl font-bold ${textColor} mb-4`}>
            🌡️ Temperature Heatmap Visualization
          </h1>
          <p className={`text-lg ${secondaryTextColor} mb-6`}>
            Advanced temperature visualization using custom canvas-based heatmap rendering with
            real-time controls and interactive features.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <div className={`p-4 rounded-lg border ${borderColor}`}>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🎨</span>
                <h3 className={`font-semibold ${textColor}`}>Custom Canvas Rendering</h3>
              </div>
              <p className={`text-sm ${secondaryTextColor}`}>
                High-performance canvas-based rendering for smooth, real-time temperature
                visualization
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${borderColor}`}>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🎛️</span>
                <h3 className={`font-semibold ${textColor}`}>Interactive Controls</h3>
              </div>
              <p className={`text-sm ${secondaryTextColor}`}>
                Adjust opacity, radius, blur, and temperature ranges in real-time
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${borderColor}`}>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">📊</span>
                <h3 className={`font-semibold ${textColor}`}>Multiple Data Patterns</h3>
              </div>
              <p className={`text-sm ${secondaryTextColor}`}>
                Support for grid-based and random point distributions
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${borderColor}`}>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🌈</span>
                <h3 className={`font-semibold ${textColor}`}>Color Gradients</h3>
              </div>
              <p className={`text-sm ${secondaryTextColor}`}>
                Beautiful temperature gradients from purple (cold) to red (hot)
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${borderColor}`}>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">⚡</span>
                <h3 className={`font-semibold ${textColor}`}>Optimized Performance</h3>
              </div>
              <p className={`text-sm ${secondaryTextColor}`}>
                Efficient rendering with support for hundreds of data points
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${borderColor}`}>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🗺️</span>
                <h3 className={`font-semibold ${textColor}`}>Leaflet Integration</h3>
              </div>
              <p className={`text-sm ${secondaryTextColor}`}>
                Seamless integration with Leaflet maps and other layers
              </p>
            </div>
          </div>
        </div>

        {/* Demo Component - Removed */}
        <div className={`${cardBg} rounded-lg shadow-lg p-8 border ${borderColor}`}>
          <p className={`text-lg ${textColor}`}>
            Interactive demo has been removed. This page shows the technical documentation for the
            temperature heatmap feature.
          </p>
        </div>

        {/* Technical Details */}
        <div className={`${cardBg} rounded-lg shadow-lg p-8 mt-8 border ${borderColor}`}>
          <h2 className={`text-2xl font-bold ${textColor} mb-4`}>🔧 Technical Implementation</h2>

          <div className="space-y-6">
            {/* Canvas Rendering */}
            <div>
              <h3 className={`text-lg font-semibold ${textColor} mb-2`}>Canvas-Based Rendering</h3>
              <p className={`${secondaryTextColor} mb-2`}>
                The heatmap uses HTML5 Canvas API for high-performance rendering:
              </p>
              <ul className={`list-disc list-inside ${secondaryTextColor} space-y-1 ml-4`}>
                <li>Custom Leaflet layer extending L.Layer</li>
                <li>Radial gradients for each temperature point</li>
                <li>Gaussian blur for smooth transitions</li>
                <li>Real-time updates on map pan/zoom</li>
                <li>Automatic canvas resizing on viewport changes</li>
              </ul>
            </div>

            {/* Color Mapping */}
            <div>
              <h3 className={`text-lg font-semibold ${textColor} mb-2`}>Color Mapping</h3>
              <p className={`${secondaryTextColor} mb-2`}>
                Temperature values are mapped to colors using a 7-stop gradient:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded" style={{ background: 'rgb(130,22,146)' }} />
                  <span className={`text-sm ${secondaryTextColor}`}>Purple - Very Cold</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded" style={{ background: 'rgb(25,84,166)' }} />
                  <span className={`text-sm ${secondaryTextColor}`}>Blue - Cold</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded" style={{ background: 'rgb(58,175,185)' }} />
                  <span className={`text-sm ${secondaryTextColor}`}>Cyan - Cool</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded" style={{ background: 'rgb(87,213,111)' }} />
                  <span className={`text-sm ${secondaryTextColor}`}>Green - Mild</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded" style={{ background: 'rgb(255,255,0)' }} />
                  <span className={`text-sm ${secondaryTextColor}`}>Yellow - Warm</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded" style={{ background: 'rgb(255,140,0)' }} />
                  <span className={`text-sm ${secondaryTextColor}`}>Orange - Hot</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded" style={{ background: 'rgb(255,0,0)' }} />
                  <span className={`text-sm ${secondaryTextColor}`}>Red - Very Hot</span>
                </div>
              </div>
            </div>

            {/* Integration Options */}
            <div>
              <h3 className={`text-lg font-semibold ${textColor} mb-2`}>Integration Options</h3>
              <p className={`${secondaryTextColor} mb-2`}>
                The component supports multiple data sources:
              </p>
              <ul className={`list-disc list-inside ${secondaryTextColor} space-y-1 ml-4`}>
                <li>
                  <strong>Custom Data:</strong> Provide your own temperature data points with
                  lat/lng coordinates
                </li>
                <li>
                  <strong>Weather Tile Services:</strong> Optional integration with OpenWeatherMap
                  tile layers
                </li>
                <li>
                  <strong>Real-time Updates:</strong> Dynamic data updates without re-rendering the
                  entire map
                </li>
                <li>
                  <strong>Multiple Layers:</strong> Combine with other map layers (markers,
                  polygons, etc.)
                </li>
              </ul>
            </div>

            {/* Use Cases */}
            <div>
              <h3 className={`text-lg font-semibold ${textColor} mb-2`}>Use Cases</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                <div className={`p-3 rounded border ${borderColor}`}>
                  <h4 className={`font-semibold ${textColor} mb-1`}>Weather Forecasting</h4>
                  <p className={`text-sm ${secondaryTextColor}`}>
                    Visualize temperature distributions across regions
                  </p>
                </div>
                <div className={`p-3 rounded border ${borderColor}`}>
                  <h4 className={`font-semibold ${textColor} mb-1`}>Climate Analysis</h4>
                  <p className={`text-sm ${secondaryTextColor}`}>
                    Display historical temperature patterns and trends
                  </p>
                </div>
                <div className={`p-3 rounded border ${borderColor}`}>
                  <h4 className={`font-semibold ${textColor} mb-1`}>Urban Heat Islands</h4>
                  <p className={`text-sm ${secondaryTextColor}`}>
                    Identify hot spots in urban environments
                  </p>
                </div>
                <div className={`p-3 rounded border ${borderColor}`}>
                  <h4 className={`font-semibold ${textColor} mb-1`}>Agricultural Planning</h4>
                  <p className={`text-sm ${secondaryTextColor}`}>
                    Monitor temperature zones for crop management
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Notes */}
            <div
              className={`p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800`}
            >
              <h3 className={`text-lg font-semibold ${textColor} mb-2 flex items-center`}>
                <span className="mr-2">⚡</span>
                Performance Optimization
              </h3>
              <p className={`${secondaryTextColor} text-sm`}>
                The canvas-based approach provides excellent performance even with hundreds of data
                points. The layer only re-renders when the map moves or data changes, and uses
                efficient radial gradient rendering. For very large datasets (1000+ points),
                consider implementing data clustering or level-of-detail techniques.
              </p>
            </div>
          </div>
        </div>

        {/* Integration Example */}
        <div className={`${cardBg} rounded-lg shadow-lg p-8 mt-8 border ${borderColor}`}>
          <h2 className={`text-2xl font-bold ${textColor} mb-4`}>
            📝 Integration in Coordinates Modal
          </h2>
          <p className={`${secondaryTextColor} mb-4`}>
            The temperature heatmap is also integrated into the Coordinates detail card modal. Click
            on any Coordinates card in the weather dashboard to see the map with an optional
            temperature overlay toggle.
          </p>
          <div
            className={`p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800`}
          >
            <p className={`${secondaryTextColor} text-sm`}>
              <strong>Try it:</strong> Navigate to the main weather page, find the Coordinates card,
              and click on it. In the modal, toggle the "Temperature Heatmap" checkbox to see the
              overlay in action!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemperatureHeatmapPage;
