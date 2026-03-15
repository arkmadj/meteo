/**
 * Weather Settings with Switch Component
 * Example showing how to use the Switch component in weather app settings
 */

import React, { useState } from 'react';

import { getLogger } from '@/utils/logger';

import { Switch } from '@/components/ui/atoms';

const logger = getLogger('Components:WeatherSettingsWithSwitch');

const WeatherSettingsWithSwitch: React.FC = () => {
  const [settings, setSettings] = useState({
    autoRefresh: true,
    notifications: false,
    darkMode: false,
    celsius: true,
    windSpeed: true,
    humidity: true,
    pressure: false,
    uvIndex: true,
    hourlyForecast: true,
    dailyForecast: true,
  });

  const updateSetting = (key: keyof typeof settings) => (value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Weather Settings</h1>
        <p className="text-gray-600">
          Customize your weather experience with these toggle settings
        </p>
      </div>

      {/* General Settings */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">General</h2>

        <div className="space-y-4">
          <Switch
            checked={settings.autoRefresh}
            description="Automatically refresh weather data every 15 minutes"
            label="Auto-refresh"
            showIcons={true}
            variant="default"
            onCheckedChange={updateSetting('autoRefresh')}
          />

          <Switch
            checked={settings.notifications}
            description="Receive weather alerts and severe weather warnings"
            label="Push Notifications"
            showIcons={true}
            variant="filled"
            onCheckedChange={updateSetting('notifications')}
          />

          <Switch
            checked={settings.darkMode}
            description="Use dark theme for better visibility at night"
            label="Dark Mode"
            showIcons={true}
            variant="outlined"
            onCheckedChange={updateSetting('darkMode')}
          />

          <Switch
            checked={settings.celsius}
            description="Display temperature in Celsius instead of Fahrenheit"
            label="Celsius (°C)"
            variant="default"
            onCheckedChange={updateSetting('celsius')}
          />
        </div>
      </div>

      {/* Display Options */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Display Options</h2>

        <div className="space-y-4">
          <Switch
            checked={settings.windSpeed}
            description="Show wind speed and direction"
            label="Wind Speed"
            size="sm"
            onCheckedChange={updateSetting('windSpeed')}
          />

          <Switch
            checked={settings.humidity}
            description="Display humidity percentage"
            label="Humidity"
            size="sm"
            onCheckedChange={updateSetting('humidity')}
          />

          <Switch
            checked={settings.pressure}
            description="Show atmospheric pressure"
            label="Pressure"
            size="sm"
            onCheckedChange={updateSetting('pressure')}
          />

          <Switch
            checked={settings.uvIndex}
            description="Display UV index and warnings"
            label="UV Index"
            size="sm"
            onCheckedChange={updateSetting('uvIndex')}
          />
        </div>
      </div>

      {/* Forecast Settings */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Forecast</h2>

        <div className="space-y-4">
          <Switch
            checked={settings.hourlyForecast}
            description="Show detailed hourly weather forecast"
            label="Hourly Forecast"
            variant="filled"
            onCheckedChange={updateSetting('hourlyForecast')}
          />

          <Switch
            checked={settings.dailyForecast}
            description="Display 7-day weather forecast"
            label="Daily Forecast"
            variant="filled"
            onCheckedChange={updateSetting('dailyForecast')}
          />
        </div>
      </div>

      {/* Settings Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Current Settings Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Auto-refresh:</span>
              <span className={settings.autoRefresh ? 'text-green-600' : 'text-red-600'}>
                {settings.autoRefresh ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Notifications:</span>
              <span className={settings.notifications ? 'text-green-600' : 'text-red-600'}>
                {settings.notifications ? 'On' : 'Off'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Dark Mode:</span>
              <span className={settings.darkMode ? 'text-green-600' : 'text-red-600'}>
                {settings.darkMode ? 'On' : 'Off'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Temperature:</span>
              <span className="text-blue-600">{settings.celsius ? 'Celsius' : 'Fahrenheit'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Wind Speed:</span>
              <span className={settings.windSpeed ? 'text-green-600' : 'text-gray-400'}>
                {settings.windSpeed ? 'Shown' : 'Hidden'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Humidity:</span>
              <span className={settings.humidity ? 'text-green-600' : 'text-gray-400'}>
                {settings.humidity ? 'Shown' : 'Hidden'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>UV Index:</span>
              <span className={settings.uvIndex ? 'text-green-600' : 'text-gray-400'}>
                {settings.uvIndex ? 'Shown' : 'Hidden'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Forecast:</span>
              <span className="text-blue-600">
                {settings.hourlyForecast && settings.dailyForecast
                  ? 'Both'
                  : settings.hourlyForecast
                    ? 'Hourly'
                    : settings.dailyForecast
                      ? 'Daily'
                      : 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-center pt-4">
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          onClick={() => {
            // Save settings logic here

            logger.info('Saving settings', { settings });
            if (process.env.NODE_ENV === 'development') {
              logger.info('Settings saved successfully!');
            }
          }}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default WeatherSettingsWithSwitch;
