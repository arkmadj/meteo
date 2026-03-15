/**
 * RadioGroup Example Component
 * Demonstrates usage of the RadioGroup atom component
 */

import React, { useState } from 'react';

import { RadioGroup } from './index';

const noop = () => {};

const RadioGroupExample: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<string>('light');
  const [selectedUnit, setSelectedUnit] = useState<string>('celsius');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('daily');
  const [selectedLayout, setSelectedLayout] = useState<string>('comfortable');

  const themeOptions = [
    { value: 'light', label: 'Light Theme', description: 'Clean and bright interface' },
    { value: 'dark', label: 'Dark Theme', description: 'Easy on the eyes in low light' },
    { value: 'auto', label: 'Auto Theme', description: 'Follows system preference' },
  ];

  const unitOptions = [
    { value: 'celsius', label: 'Celsius (°C)', description: 'Metric temperature scale' },
    { value: 'fahrenheit', label: 'Fahrenheit (°F)', description: 'Imperial temperature scale' },
    { value: 'kelvin', label: 'Kelvin (K)', description: 'Scientific temperature scale' },
  ];

  const frequencyOptions = [
    { value: 'realtime', label: 'Real-time', description: 'Updates as weather changes' },
    { value: 'hourly', label: 'Hourly', description: 'Updates every hour' },
    { value: 'daily', label: 'Daily', description: 'Updates once per day' },
    { value: 'weekly', label: 'Weekly', description: 'Updates once per week' },
  ];

  const layoutOptions = [
    { value: 'compact', label: 'Compact', description: 'More information in less space' },
    { value: 'comfortable', label: 'Comfortable', description: 'Balanced spacing and readability' },
    { value: 'spacious', label: 'Spacious', description: 'Extra spacing for clarity' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">RadioGroup Component</h1>
        <p className="text-gray-600">
          A component for managing mutually exclusive radio button selections with validation and
          flexible layouts
        </p>
      </div>

      {/* Basic Usage */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Basic Usage</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Theme Selection</h3>
            <RadioGroup
              helperText="Select your preferred visual theme"
              label="Choose Your Theme"
              options={themeOptions}
              value={selectedTheme}
              onChange={setSelectedTheme}
            />

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Selected Theme:</h4>
              <div className="text-sm text-blue-800">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {themeOptions.find(opt => opt.value === selectedTheme)?.label}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Temperature Units</h3>
            <RadioGroup
              direction="vertical"
              helperText="Choose how temperatures are displayed"
              label="Temperature Display Units"
              options={unitOptions}
              value={selectedUnit}
              onChange={setSelectedUnit}
            />

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Selected Unit:</h4>
              <div className="text-sm text-green-800">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  {unitOptions.find(opt => opt.value === selectedUnit)?.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Examples */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Validation Examples</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Required Selection</h3>
            <RadioGroup
              error={!selectedFrequency}
              errorMessage="Please select an update frequency"
              helperText="How often should weather data refresh?"
              label="Update Frequency"
              options={frequencyOptions}
              required={true}
              value={selectedFrequency}
              onChange={setSelectedFrequency}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">With Error State</h3>
            <RadioGroup
              error={true}
              errorMessage="Layout selection is required for optimal experience"
              helperText="Choose your preferred layout density"
              label="Layout Preference"
              options={layoutOptions}
              value={selectedLayout}
              onChange={setSelectedLayout}
            />

            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Selected Layout:</h4>
              <div className="text-sm text-purple-800">
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                  {layoutOptions.find(opt => opt.value === selectedLayout)?.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layout Options */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Layout Options</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">Horizontal Layout</h3>
            <RadioGroup
              direction="horizontal"
              label="Quick Theme Selection"
              options={themeOptions.slice(0, 3)}
              value={selectedTheme}
              onChange={setSelectedTheme}
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">Vertical Layout (Default)</h3>
            <RadioGroup
              direction="vertical"
              label="Detailed Unit Selection"
              options={[
                { value: 'celsius', label: 'Celsius', description: 'Standard metric unit (°C)' },
                { value: 'fahrenheit', label: 'Fahrenheit', description: 'Imperial unit (°F)' },
                { value: 'kelvin', label: 'Kelvin', description: 'Scientific unit (K)' },
              ]}
              value={selectedUnit}
              onChange={setSelectedUnit}
            />
          </div>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Advanced Features</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">With Disabled Options</h3>
            <RadioGroup
              helperText="Some options may not be available yet"
              label="Notification Settings"
              options={[
                { value: 'enabled', label: 'Enabled', description: 'Receive all notifications' },
                {
                  value: 'important',
                  label: 'Important Only',
                  description: 'Only critical alerts',
                },
                {
                  value: 'disabled',
                  label: 'Disabled',
                  description: 'No notifications (Coming Soon)',
                  disabled: true,
                },
              ]}
              value={'enabled'}
              onChange={noop}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Complex Descriptions</h3>
            <RadioGroup
              helperText="Higher refresh rates provide more accurate data but use more battery"
              label="Data Refresh Strategy"
              options={[
                {
                  value: 'conservative',
                  label: 'Conservative',
                  description: 'Minimal data usage, updates only when necessary',
                },
                {
                  value: 'balanced',
                  label: 'Balanced',
                  description: 'Moderate data usage with regular updates',
                },
                {
                  value: 'aggressive',
                  label: 'Aggressive',
                  description: 'Maximum data usage for real-time accuracy',
                },
              ]}
              value={'balanced'}
              onChange={noop}
            />
          </div>
        </div>
      </div>

      {/* Usage Guidelines */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Usage Guidelines</h2>
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-3">When to Use</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Mutually exclusive options</li>
                <li>• Single selection from multiple choices</li>
                <li>• Settings and preferences</li>
                <li>• Form inputs with limited options</li>
                <li>• Configuration choices</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-3">When Not to Use</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Multiple selections (use CheckboxGroup)</li>
                <li>• Binary choices (use Switch)</li>
                <li>• Very long lists ({'>'}7-8 options)</li>
                <li>• Complex hierarchical selections</li>
                <li>• When space is extremely limited</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadioGroupExample;
