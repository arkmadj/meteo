/**
 * CheckboxGroup Example Component
 * Demonstrates usage of the CheckboxGroup atom component
 */

import React, { useState } from 'react';

import { CheckboxGroup } from './index';

const noop = () => {};

const CheckboxGroupExample: React.FC = () => {
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(['reading']);
  const [selectedWeather, setSelectedWeather] = useState<string[]>([]);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(['email']);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const hobbyOptions = [
    { value: 'reading', label: 'Reading', description: 'Books, articles, and blogs' },
    { value: 'sports', label: 'Sports', description: 'Playing or watching sports' },
    { value: 'music', label: 'Music', description: 'Listening or playing music' },
    { value: 'cooking', label: 'Cooking', description: 'Preparing meals and baking' },
    { value: 'travel', label: 'Travel', description: 'Exploring new places' },
    { value: 'gaming', label: 'Gaming', description: 'Video games and board games' },
  ];

  const weatherOptions = [
    { value: 'temperature', label: 'Temperature' },
    { value: 'humidity', label: 'Humidity' },
    { value: 'wind', label: 'Wind Speed' },
    { value: 'pressure', label: 'Pressure' },
    { value: 'uv', label: 'UV Index' },
    { value: 'visibility', label: 'Visibility' },
    { value: 'precipitation', label: 'Precipitation' },
  ];

  const notificationOptions = [
    { value: 'email', label: 'Email Notifications' },
    { value: 'push', label: 'Push Notifications' },
    { value: 'sms', label: 'SMS Notifications' },
    { value: 'in-app', label: 'In-App Notifications' },
  ];

  const sizeOptions = [
    { value: 'xs', label: 'Extra Small' },
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' },
    { value: 'xl', label: 'Extra Large' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CheckboxGroup Component</h1>
        <p className="text-gray-600">
          A powerful component for managing multiple related checkboxes with validation and select
          all functionality
        </p>
      </div>

      {/* Basic Usage */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Basic Usage</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Hobbies Selection</h3>
            <CheckboxGroup
              helperText="Choose all that apply to help us personalize your experience"
              label="Select Your Hobbies"
              options={hobbyOptions}
              showSelectAll={true}
              value={selectedHobbies}
              onChange={setSelectedHobbies}
            />

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Selected Hobbies:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedHobbies.length > 0 ? (
                  selectedHobbies.map(hobby => (
                    <span
                      key={hobby}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {hobbyOptions.find(opt => opt.value === hobby)?.label}
                    </span>
                  ))
                ) : (
                  <span className="text-blue-600 italic">None selected</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Weather Data</h3>
            <CheckboxGroup
              direction="vertical"
              helperText="Select which weather metrics you want to see"
              label="Weather Information to Display"
              options={weatherOptions}
              selectAllLabel="Show All Weather Data"
              showSelectAll={true}
              value={selectedWeather}
              onChange={setSelectedWeather}
            />

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Selected Metrics:</h4>
              <div className="text-sm text-green-800">
                {selectedWeather.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {selectedWeather.map(metric => (
                      <li key={metric}>
                        {weatherOptions.find(opt => opt.value === metric)?.label}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-green-600 italic">No metrics selected</span>
                )}
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
            <h3 className="text-lg font-medium text-gray-700">Required Selection (Min 2)</h3>
            <CheckboxGroup
              error={selectedNotifications.length < 2}
              errorMessage="Please select at least 2 notification methods"
              helperText="Choose how you want to receive notifications"
              label="Notification Preferences"
              minSelections={2}
              options={notificationOptions}
              required={true}
              value={selectedNotifications}
              onChange={setSelectedNotifications}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Limited Selection (Max 3)</h3>
            <CheckboxGroup
              helperText="Choose up to 3 sizes for your preferences"
              label="Select Sizes (Max 3)"
              maxSelections={3}
              options={sizeOptions}
              showSelectAll={false}
              value={selectedSizes}
              onChange={setSelectedSizes}
            />

            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Selected Sizes:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedSizes.length > 0 ? (
                  selectedSizes.map(size => (
                    <span
                      key={size}
                      className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                    >
                      {sizeOptions.find(opt => opt.value === size)?.label}
                    </span>
                  ))
                ) : (
                  <span className="text-purple-600 italic">No sizes selected</span>
                )}
              </div>
              <p className="text-xs text-purple-600 mt-2">{selectedSizes.length}/3 selected</p>
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
            <CheckboxGroup
              direction="horizontal"
              label="Quick Size Selection"
              options={sizeOptions.slice(0, 4)}
              showSelectAll={false}
              value={selectedSizes}
              onChange={setSelectedSizes}
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">Vertical Layout (Default)</h3>
            <CheckboxGroup
              direction="vertical"
              label="Detailed Preferences"
              options={[
                {
                  value: 'compact',
                  label: 'Compact View',
                  description: 'Show more information in less space',
                },
                {
                  value: 'detailed',
                  label: 'Detailed View',
                  description: 'Show comprehensive information',
                },
                {
                  value: 'minimal',
                  label: 'Minimal View',
                  description: 'Show only essential information',
                },
              ]}
              showSelectAll={false}
              value={[]}
              onChange={noop}
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
            <CheckboxGroup
              helperText="Some features are not yet available"
              label="Feature Selection"
              options={[
                { value: 'basic', label: 'Basic Plan', description: 'Essential features included' },
                {
                  value: 'premium',
                  label: 'Premium Plan',
                  description: 'Advanced features (Coming Soon)',
                  disabled: true,
                },
                {
                  value: 'enterprise',
                  label: 'Enterprise Plan',
                  description: 'Full feature set (Coming Soon)',
                  disabled: true,
                },
              ]}
              showSelectAll={false}
              value={['basic']}
              onChange={noop}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Complex Validation</h3>
            <CheckboxGroup
              helperText="Select 1-3 options to help us improve"
              label="Survey Preferences"
              maxSelections={3}
              minSelections={1}
              options={[
                { value: 'daily', label: 'Daily Surveys' },
                { value: 'weekly', label: 'Weekly Surveys' },
                { value: 'monthly', label: 'Monthly Surveys' },
                { value: 'feedback', label: 'Feedback Requests' },
                { value: 'beta', label: 'Beta Testing' },
              ]}
              showSelectAll={true}
              value={[]}
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
                <li>• Multiple related options</li>
                <li>• User preferences and settings</li>
                <li>• Feature selection</li>
                <li>• Survey and questionnaire forms</li>
                <li>• Filter and search options</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-3">When Not to Use</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Single binary choices (use Switch)</li>
                <li>• Mutually exclusive options (use Select)</li>
                <li>• Very long lists ({'>'}20 items)</li>
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

export default CheckboxGroupExample;
