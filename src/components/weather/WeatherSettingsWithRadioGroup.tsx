/**
 * Weather Settings with RadioGroup
 * Example showing how to use the RadioGroup component for weather settings
 */

import React, { useState } from 'react';

import { getLogger } from '@/utils/logger';

import { RadioGroup } from '@/components/ui/atoms';

const logger = getLogger('Components:WeatherSettingsWithRadioGroup');

const WeatherSettingsWithRadioGroup: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<string>('auto');
  const [selectedUnits, setSelectedUnits] = useState<string>('metric');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [selectedRefreshRate, setSelectedRefreshRate] = useState<string>('balanced');

  const themeOptions = [
    {
      value: 'light',
      label: 'Light Theme',
      description: 'Clean and bright interface, perfect for daytime use',
    },
    {
      value: 'dark',
      label: 'Dark Theme',
      description: 'Easy on the eyes, ideal for nighttime and low-light conditions',
    },
    {
      value: 'auto',
      label: 'Auto Theme',
      description: 'Automatically switches between light and dark based on your system settings',
    },
  ];

  const unitOptions = [
    {
      value: 'metric',
      label: 'Metric (°C, km/h, mm)',
      description: 'Celsius, kilometers per hour, millimeters - used in most countries',
    },
    {
      value: 'imperial',
      label: 'Imperial (°F, mph, in)',
      description: 'Fahrenheit, miles per hour, inches - traditional US system',
    },
    {
      value: 'scientific',
      label: 'Scientific (K, m/s, hPa)',
      description: 'Kelvin, meters per second, hectopascals - for scientific accuracy',
    },
  ];

  const languageOptions = [
    { value: 'en', label: 'English', description: 'English (US)' },
    { value: 'es', label: 'Español', description: 'Spanish' },
    { value: 'fr', label: 'Français', description: 'French' },
    { value: 'de', label: 'Deutsch', description: 'German' },
    { value: 'it', label: 'Italiano', description: 'Italian' },
    { value: 'pt', label: 'Português', description: 'Portuguese' },
    { value: 'ja', label: '日本語', description: 'Japanese' },
    { value: 'ko', label: '한국어', description: 'Korean' },
  ];

  const refreshRateOptions = [
    {
      value: 'conservative',
      label: 'Conservative',
      description: 'Updates every 30 minutes, minimal battery usage',
    },
    {
      value: 'balanced',
      label: 'Balanced',
      description: 'Updates every 15 minutes, good balance of accuracy and battery life',
    },
    {
      value: 'frequent',
      label: 'Frequent',
      description: 'Updates every 5 minutes, maximum accuracy with higher battery usage',
    },
    {
      value: 'realtime',
      label: 'Real-time',
      description: 'Continuous updates, highest accuracy but significant battery drain',
    },
  ];

  const handleSaveSettings = () => {
    logger.info('Saving settings:', {
      theme: selectedTheme,
      units: selectedUnits,
      language: selectedLanguage,
      refreshRate: selectedRefreshRate,
    });

    // Here you would typically save the settings to localStorage or send to server
    if (process.env.NODE_ENV === 'development') {
      logger.info('Settings saved!', {
        selectedTheme,
        selectedUnits,
        selectedLanguage,
        selectedRefreshRate,
      });
    }
  };

  const handleResetSettings = () => {
    setSelectedTheme('auto');
    setSelectedUnits('metric');
    setSelectedLanguage('en');
    setSelectedRefreshRate('balanced');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Weather App Settings</h1>
        <p className="text-gray-600">
          Customize your weather experience with these personal preferences
        </p>
      </div>

      {/* Theme Selection */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <RadioGroup
          helperText="Choose how the app should look and feel"
          label="Theme Preference"
          options={themeOptions}
          value={selectedTheme}
          onChange={setSelectedTheme}
        />
      </div>

      {/* Unit System */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <RadioGroup
          helperText="Select your preferred measurement system for weather data"
          label="Unit System"
          options={unitOptions}
          value={selectedUnits}
          onChange={setSelectedUnits}
        />
      </div>

      {/* Language Selection */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <RadioGroup
          direction="horizontal"
          helperText="Choose your preferred language for the interface"
          label="Language"
          options={languageOptions}
          value={selectedLanguage}
          onChange={setSelectedLanguage}
        />
      </div>

      {/* Refresh Rate */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <RadioGroup
          helperText="How often should weather data be updated? Higher rates provide more accuracy but use more battery."
          label="Data Refresh Rate"
          options={refreshRateOptions}
          value={selectedRefreshRate}
          onChange={setSelectedRefreshRate}
        />
      </div>

      {/* Current Settings Summary */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-blue-900 mb-4">Current Settings Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Theme</h4>
              <div className="text-sm text-blue-700 bg-blue-100 px-3 py-2 rounded-sm">
                {themeOptions.find(opt => opt.value === selectedTheme)?.label}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-blue-800 mb-2">Units</h4>
              <div className="text-sm text-blue-700 bg-blue-100 px-3 py-2 rounded-sm">
                {unitOptions.find(opt => opt.value === selectedUnits)?.label}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Language</h4>
              <div className="text-sm text-blue-700 bg-blue-100 px-3 py-2 rounded-sm">
                {languageOptions.find(opt => opt.value === selectedLanguage)?.label}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-blue-800 mb-2">Refresh Rate</h4>
              <div className="text-sm text-blue-700 bg-blue-100 px-3 py-2 rounded-sm">
                {refreshRateOptions.find(opt => opt.value === selectedRefreshRate)?.label}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 pt-4">
        <button
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          onClick={handleResetSettings}
        >
          Reset to Defaults
        </button>

        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          onClick={handleSaveSettings}
        >
          Save Settings
        </button>
      </div>

      {/* Setting Explanations */}
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-yellow-900 mb-3">💡 Setting Explanations</h3>
        <div className="text-sm text-yellow-800 space-y-3">
          <div>
            <strong>Theme:</strong> Affects the visual appearance of the entire app. Auto theme
            adapts to your device's system preference.
          </div>
          <div>
            <strong>Units:</strong> Determines how weather measurements are displayed. You can
            change this at any time.
          </div>
          <div>
            <strong>Language:</strong> Sets the interface language. Weather data descriptions may
            still appear in English.
          </div>
          <div>
            <strong>Refresh Rate:</strong> Controls how often the app fetches new weather data. More
            frequent updates provide better accuracy but use more battery and data.
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherSettingsWithRadioGroup;
