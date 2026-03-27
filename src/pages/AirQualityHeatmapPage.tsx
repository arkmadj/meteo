/**
 * AirQualityHeatmapPage
 *
 * Showcase page for air quality heatmap visualization features
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

// Demo component removed
import { MainHeader } from '@/components/headers';
import { useTheme } from '@/design-system/theme';
import { useLanguage } from '@/i18n/hooks/useLanguage';

const AirQualityHeatmapPage: React.FC = () => {
  const { t } = useTranslation(['common']);
  const { theme } = useTheme();
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();

  const isDark = theme.isDark;
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryTextColor = isDark ? 'text-gray-300' : 'text-gray-600';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <MainHeader
        title={t('navigation.airQuality', 'Air Quality Heatmap')}
        subtitle={t('navigation.airQualitySubtitle', 'Advanced air quality visualization')}
        showSubtitle={true}
        sticky={true}
        variant="compact"
        currentLanguage={currentLanguage}
        supportedLanguages={supportedLanguages}
        changeLanguage={changeLanguage}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className={`${cardBg} rounded-lg shadow-lg p-8 mb-8 border ${borderColor}`}>
          <h1 className={`text-4xl font-bold ${textColor} mb-4`}>
            🌫️ Air Quality Heatmap Visualization
          </h1>
          <p className={`text-lg ${secondaryTextColor} mb-6`}>
            Advanced air quality visualization using custom canvas-based heatmap rendering with
            real-time controls and dual AQI standard support (European & US).
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <div className={`p-4 rounded-lg border ${borderColor}`}>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🎨</span>
                <h3 className={`font-semibold ${textColor}`}>AQI-Based Color Gradients</h3>
              </div>
              <p className={`text-sm ${secondaryTextColor}`}>
                Dynamic color mapping based on AQI intensity using standard-specific gradients
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${borderColor}`}>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🌍</span>
                <h3 className={`font-semibold ${textColor}`}>Dual AQI Standards</h3>
              </div>
              <p className={`text-sm ${secondaryTextColor}`}>
                Support for both European (0-100+) and US (0-500) AQI standards
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${borderColor}`}>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">⚡</span>
                <h3 className={`font-semibold ${textColor}`}>High Performance</h3>
              </div>
              <p className={`text-sm ${secondaryTextColor}`}>
                Canvas-based rendering for smooth, real-time visualization
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${borderColor}`}>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🎛️</span>
                <h3 className={`font-semibold ${textColor}`}>Interactive Controls</h3>
              </div>
              <p className={`text-sm ${secondaryTextColor}`}>
                Adjust opacity, radius, blur, and switch between AQI standards
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
            air quality heatmap feature.
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
                <li>Radial gradients for each AQI data point</li>
                <li>Standard-specific color mapping (European/US)</li>
                <li>Real-time updates on map pan/zoom</li>
                <li>Automatic canvas resizing on viewport changes</li>
              </ul>
            </div>

            {/* Color Mapping */}
            <div>
              <h3 className={`text-lg font-semibold ${textColor} mb-2`}>AQI Color Mapping</h3>
              <p className={`${secondaryTextColor} mb-2`}>
                Colors are dynamically mapped based on AQI values and selected standard:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                {/* European AQI */}
                <div className={`p-3 rounded border ${borderColor}`}>
                  <h4 className={`font-semibold ${textColor} mb-2`}>European AQI (0-100+)</h4>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-4 rounded" style={{ background: '#50C878' }} />
                      <span className={`text-sm ${secondaryTextColor}`}>Good (0-20)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-4 rounded" style={{ background: '#B7D968' }} />
                      <span className={`text-sm ${secondaryTextColor}`}>Fair (20-40)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-4 rounded" style={{ background: '#FFD700' }} />
                      <span className={`text-sm ${secondaryTextColor}`}>Moderate (40-60)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-4 rounded" style={{ background: '#FF8C00' }} />
                      <span className={`text-sm ${secondaryTextColor}`}>Poor (60-80)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-4 rounded" style={{ background: '#FF4500' }} />
                      <span className={`text-sm ${secondaryTextColor}`}>Very Poor (80-100)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-4 rounded" style={{ background: '#8B0000' }} />
                      <span className={`text-sm ${secondaryTextColor}`}>Extremely Poor (100+)</span>
                    </div>
                  </div>
                </div>

                {/* US AQI */}
                <div className={`p-3 rounded border ${borderColor}`}>
                  <h4 className={`font-semibold ${textColor} mb-2`}>US AQI (0-500)</h4>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-4 rounded" style={{ background: '#00E400' }} />
                      <span className={`text-sm ${secondaryTextColor}`}>Good (0-50)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-4 rounded" style={{ background: '#FFFF00' }} />
                      <span className={`text-sm ${secondaryTextColor}`}>Moderate (51-100)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-4 rounded" style={{ background: '#FF7E00' }} />
                      <span className={`text-sm ${secondaryTextColor}`}>
                        Unhealthy (Sensitive) (101-150)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-4 rounded" style={{ background: '#FF0000' }} />
                      <span className={`text-sm ${secondaryTextColor}`}>Unhealthy (151-200)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-4 rounded" style={{ background: '#8F3F97' }} />
                      <span className={`text-sm ${secondaryTextColor}`}>
                        Very Unhealthy (201-300)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-4 rounded" style={{ background: '#7E0023' }} />
                      <span className={`text-sm ${secondaryTextColor}`}>Hazardous (301-500)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Use Cases */}
            <div>
              <h3 className={`text-lg font-semibold ${textColor} mb-2`}>Use Cases</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                <div className={`p-3 rounded border ${borderColor}`}>
                  <h4 className={`font-semibold ${textColor} mb-1`}>Environmental Monitoring</h4>
                  <p className={`text-sm ${secondaryTextColor}`}>
                    Track air quality patterns across urban and rural areas
                  </p>
                </div>
                <div className={`p-3 rounded border ${borderColor}`}>
                  <h4 className={`font-semibold ${textColor} mb-1`}>Public Health</h4>
                  <p className={`text-sm ${secondaryTextColor}`}>
                    Identify pollution hotspots and health risk zones
                  </p>
                </div>
                <div className={`p-3 rounded border ${borderColor}`}>
                  <h4 className={`font-semibold ${textColor} mb-1`}>Urban Planning</h4>
                  <p className={`text-sm ${secondaryTextColor}`}>
                    Inform city planning and pollution reduction strategies
                  </p>
                </div>
                <div className={`p-3 rounded border ${borderColor}`}>
                  <h4 className={`font-semibold ${textColor} mb-1`}>Real-time Alerts</h4>
                  <p className={`text-sm ${secondaryTextColor}`}>
                    Provide visual warnings for poor air quality conditions
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
                The canvas-based approach provides excellent performance with hundreds of data
                points. The layer only re-renders when the map moves or data changes, using
                efficient radial gradient rendering with standard-specific color mapping.
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
            The air quality heatmap is integrated into the Coordinates detail card modal alongside
            the temperature heatmap. Click on any Coordinates card in the weather dashboard to see
            both overlays with independent controls.
          </p>
          <div
            className={`p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800`}
          >
            <p className={`${secondaryTextColor} text-sm`}>
              <strong>Try it:</strong> Navigate to the main weather page, find the Coordinates card,
              and click on it. In the modal, toggle the "Air Quality Heatmap" checkbox and switch
              between European and US AQI standards to see the different color mappings!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirQualityHeatmapPage;
