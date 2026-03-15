/**
 * Weather Filters with CheckboxGroup
 * Example showing how to use the CheckboxGroup component for weather filters
 */

import React, { useState } from 'react';

import { getLogger } from '@/utils/logger';

import { CheckboxGroup } from '@/components/ui/atoms';

const logger = getLogger('Components:WeatherFiltersWithCheckboxGroup');

const WeatherFiltersWithCheckboxGroup: React.FC = () => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'temperature',
    'humidity',
    'wind',
  ]);
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>(['severe-weather', 'air-quality']);
  const [selectedTimeRanges, setSelectedTimeRanges] = useState<string[]>(['current', 'hourly']);

  const weatherMetrics = [
    {
      value: 'temperature',
      label: 'Temperature',
      description: 'Current temperature and feels-like',
    },
    {
      value: 'humidity',
      label: 'Humidity',
      description: 'Relative humidity percentage',
    },
    {
      value: 'wind',
      label: 'Wind Speed & Direction',
      description: 'Wind speed, direction, and gusts',
    },
    {
      value: 'pressure',
      label: 'Atmospheric Pressure',
      description: 'Barometric pressure and trends',
    },
    {
      value: 'uv-index',
      label: 'UV Index',
      description: 'Ultraviolet radiation levels',
    },
    {
      value: 'visibility',
      label: 'Visibility',
      description: 'How far you can see clearly',
    },
    {
      value: 'precipitation',
      label: 'Precipitation',
      description: 'Rain, snow, and other precipitation',
    },
    {
      value: 'air-quality',
      label: 'Air Quality Index',
      description: 'Air pollution and quality metrics',
    },
  ];

  const alertTypes = [
    {
      value: 'severe-weather',
      label: 'Severe Weather Alerts',
      description: 'Tornadoes, hurricanes, and severe storms',
    },
    {
      value: 'air-quality',
      label: 'Air Quality Warnings',
      description: 'Poor air quality and pollution alerts',
    },
    {
      value: 'frost-advisory',
      label: 'Frost Advisories',
      description: 'Freezing temperatures and frost warnings',
    },
    {
      value: 'heat-advisory',
      label: 'Heat Advisories',
      description: 'Extreme heat and health warnings',
    },
    {
      value: 'flood-warning',
      label: 'Flood Warnings',
      description: 'Flooding and water-related hazards',
    },
    {
      value: 'winter-storm',
      label: 'Winter Storm Warnings',
      description: 'Snow, ice, and winter weather alerts',
    },
  ];

  const timeRangeOptions = [
    {
      value: 'current',
      label: 'Current Conditions',
      description: 'Real-time weather data',
    },
    {
      value: 'hourly',
      label: 'Hourly Forecast',
      description: 'Weather forecast for the next 48 hours',
    },
    {
      value: 'daily',
      label: 'Daily Forecast',
      description: '7-day weather outlook',
    },
    {
      value: 'extended',
      label: 'Extended Forecast',
      description: '10-14 day weather outlook',
    },
  ];

  const handleApplyFilters = () => {
    logger.info('Applying filters:', {
      metrics: selectedMetrics,
      alerts: selectedAlerts,
      timeRanges: selectedTimeRanges,
    });

    // Here you would typically save the filters or update the weather display
    if (process.env.NODE_ENV === 'development') {
      logger.info('Filters applied!', { selectedMetrics, selectedAlerts, selectedTimeRanges });
    }
  };

  const handleResetFilters = () => {
    setSelectedMetrics(['temperature', 'humidity', 'wind']);
    setSelectedAlerts(['severe-weather', 'air-quality']);
    setSelectedTimeRanges(['current', 'hourly']);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Weather Display Filters</h1>
        <p className="text-gray-600">
          Customize which weather information and alerts you want to see
        </p>
      </div>

      {/* Weather Metrics */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <CheckboxGroup
          helperText="Select which weather data you want to display (1-6 options)"
          label="Weather Metrics"
          maxSelections={6}
          minSelections={1}
          options={weatherMetrics}
          required={true}
          selectAllLabel="Show All Metrics"
          showSelectAll={true}
          value={selectedMetrics}
          onChange={setSelectedMetrics}
        />
      </div>

      {/* Alert Preferences */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <CheckboxGroup
          helperText="Choose which types of weather alerts you want to receive"
          label="Weather Alert Types"
          options={alertTypes}
          selectAllLabel="Subscribe to All Alerts"
          showSelectAll={true}
          value={selectedAlerts}
          onChange={setSelectedAlerts}
        />
      </div>

      {/* Time Range Preferences */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <CheckboxGroup
          helperText="Select which forecast periods to display"
          label="Forecast Time Ranges"
          minSelections={1}
          options={timeRangeOptions}
          required={true}
          showSelectAll={false}
          value={selectedTimeRanges}
          onChange={setSelectedTimeRanges}
        />
      </div>

      {/* Current Filter Summary */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-blue-900 mb-4">Current Filter Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">
              Weather Metrics ({selectedMetrics.length})
            </h4>
            <div className="text-sm text-blue-700 space-y-1">
              {selectedMetrics.length > 0 ? (
                selectedMetrics.map(metric => (
                  <div key={metric} className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {weatherMetrics.find(m => m.value === metric)?.label}
                  </div>
                ))
              ) : (
                <span className="text-blue-600 italic">No metrics selected</span>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-blue-800 mb-2">
              Alert Types ({selectedAlerts.length})
            </h4>
            <div className="text-sm text-blue-700 space-y-1">
              {selectedAlerts.length > 0 ? (
                selectedAlerts.map(alert => (
                  <div key={alert} className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {alertTypes.find(a => a.value === alert)?.label}
                  </div>
                ))
              ) : (
                <span className="text-blue-600 italic">No alerts selected</span>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-blue-800 mb-2">
              Time Ranges ({selectedTimeRanges.length})
            </h4>
            <div className="text-sm text-blue-700 space-y-1">
              {selectedTimeRanges.length > 0 ? (
                selectedTimeRanges.map(range => (
                  <div key={range} className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    {timeRangeOptions.find(t => t.value === range)?.label}
                  </div>
                ))
              ) : (
                <span className="text-blue-600 italic">No time ranges selected</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 pt-4">
        <button
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          onClick={handleResetFilters}
        >
          Reset to Defaults
        </button>

        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          onClick={handleApplyFilters}
        >
          Apply Filters
        </button>
      </div>

      {/* Usage Tips */}
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-yellow-900 mb-3">💡 Filter Tips</h3>
        <div className="text-sm text-yellow-800 space-y-2">
          <p>
            • <strong>Select All</strong> quickly enables all available options in a category
          </p>
          <p>
            • <strong>Validation</strong> ensures you have the right amount of options selected
          </p>
          <p>
            • <strong>Descriptions</strong> help you understand what each option does
          </p>
          <p>
            • <strong>Real-time updates</strong> show your selections as you make changes
          </p>
          <p>
            • <strong>Flexible limits</strong> prevent overwhelming amounts of data while allowing
            customization
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeatherFiltersWithCheckboxGroup;
