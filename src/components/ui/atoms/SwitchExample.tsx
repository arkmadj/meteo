/**
 * Switch Component Example
 * Demonstrates usage of the ARIA-compliant Switch atom component
 * Showcases accessibility features, keyboard navigation, and various configurations
 */

import React, { useState } from 'react';

import { Switch } from './index';

const SwitchExample: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [selectedSize, setSelectedSize] = useState('md');
  const [selectedVariant, setSelectedVariant] = useState('default');
  const [keyboardDemo, setKeyboardDemo] = useState(false);

  const sizeOptions = [
    { value: 'xs', label: 'Extra Small' },
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' },
    { value: 'xl', label: 'Extra Large' },
  ];

  const variantOptions = [
    { value: 'default', label: 'Default' },
    { value: 'filled', label: 'Filled' },
    { value: 'outlined', label: 'Outlined' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Switch Component</h1>
        <p className="text-gray-600">A modern toggle switch component for binary state controls</p>
      </div>

      {/* Basic Usage */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Basic Usage</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Settings</h3>
            <Switch
              checked={notifications}
              description="Receive push notifications for weather updates"
              label="Enable Notifications"
              onCheckedChange={setNotifications}
            />

            <Switch
              checked={darkMode}
              description="Switch to dark theme"
              label="Dark Mode"
              onCheckedChange={setDarkMode}
            />

            <Switch
              checked={autoSave}
              description="Automatically save changes"
              label="Auto-save"
              onCheckedChange={setAutoSave}
            />

            <Switch
              checked={analytics}
              description="Help improve the app with usage data"
              label="Analytics"
              onCheckedChange={setAnalytics}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-3">Current Settings:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Notifications:</span>
                <span className={notifications ? 'text-green-600' : 'text-red-600'}>
                  {notifications ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Dark Mode:</span>
                <span className={darkMode ? 'text-green-600' : 'text-red-600'}>
                  {darkMode ? 'On' : 'Off'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Auto-save:</span>
                <span className={autoSave ? 'text-green-600' : 'text-red-600'}>
                  {autoSave ? 'On' : 'Off'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Analytics:</span>
                <span className={analytics ? 'text-green-600' : 'text-red-600'}>
                  {analytics ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size Variants */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Size Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-600">Extra Small</h3>
            <Switch checked={true} label="XS Switch" size="xs" />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-600">Small</h3>
            <Switch checked={true} label="Small Switch" size="sm" />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-600">Medium (Default)</h3>
            <Switch checked={true} label="Medium Switch" size="md" />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-600">Large</h3>
            <Switch checked={true} label="Large Switch" size="lg" />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-600">Extra Large</h3>
            <Switch checked={true} label="XL Switch" size="xl" />
          </div>
        </div>
      </div>

      {/* Style Variants */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Style Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-600">Default</h3>
            <Switch checked={true} label="Default Style" variant="default" />
            <Switch checked={false} label="Default Off" variant="default" />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-600">Filled</h3>
            <Switch checked={true} label="Filled Style" variant="filled" />
            <Switch checked={false} label="Filled Off" variant="filled" />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-600">Outlined</h3>
            <Switch checked={true} label="Outlined Style" variant="outlined" />
            <Switch checked={false} label="Outlined Off" variant="outlined" />
          </div>
        </div>
      </div>

      {/* With Icons */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">With Icons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Switch
              checked={true}
              description="Connect to wireless network"
              label="WiFi"
              showIcons={true}
            />

            <Switch
              checked={false}
              description="Enable Bluetooth connectivity"
              label="Bluetooth"
              showIcons={true}
            />

            <Switch
              checked={false}
              description="Disable all wireless connections"
              label="Airplane Mode"
              showIcons={true}
            />
          </div>

          <div className="space-y-4">
            <Switch
              checked={true}
              description="Enable audio output"
              label="Sound"
              offIcon={
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v1.79l2.48 2.25 0.02-0.01zm-6.5 0c0 .83.25 1.55.67 2.19l1.46-1.33c0.33-.3.54-.78.54-1.36 0-.83-.46-1.52-1.09-1.85l1.49-1.32c1.18.68 1.98 1.95 1.98 3.47 0 1.14-.39 2.17-1.02 3.01l1.39 1.25c.81-.89 1.31-2.06 1.31-3.36 0-2.22-1.31-4.14-3.22-4.95l.02-.02 1.39-1.25-1.42-1.41L3 6.19 4.41 7.6l5.08 4.55c-.58.47-.98 1.19-.98 2.05zM5.41 7.6L9 11.17v.02c0-.89.39-1.67 1-2.22l-1.46-1.32-.73-.66z" />
                </svg>
              }
              showIcons={true}
              onIcon={
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              }
            />

            <Switch
              checked={true}
              description="Allow access to location"
              label="Location Services"
              showIcons={true}
            />
          </div>
        </div>
      </div>

      {/* Interactive Demo */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Interactive Demo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Configure Switch</h3>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Size</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-3 focus:ring-blue-500"
                value={selectedSize}
                onChange={e => setSelectedSize(e.target.value)}
              >
                {sizeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Variant</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-3 focus:ring-blue-500"
                value={selectedVariant}
                onChange={e => setSelectedVariant(e.target.value)}
              >
                {variantOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Preview</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Switch
                checked={true}
                description="This switch updates based on your selections above"
                label={`Dynamic ${selectedVariant} Switch (${selectedSize})`}
                showIcons={true}
                size={selectedSize as unknown}
                variant={selectedVariant as unknown}
              />
            </div>
          </div>
        </div>
      </div>

      {/* States */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Component States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-600">Normal State</h3>
            <Switch checked={true} label="Normal" />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-600">Disabled State</h3>
            <Switch checked={true} disabled={true} label="Disabled" />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-600">Loading State</h3>
            <Switch checked={true} label="Loading" loading={true} />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-600">Error State</h3>
            <Switch
              checked={false}
              error={true}
              errorMessage="This setting is required"
              label="Error"
            />
          </div>
        </div>
      </div>

      {/* Accessibility Features */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">♿ Accessibility Features</h2>
        <div className="bg-green-50 p-6 rounded-lg space-y-6">
          <div>
            <h3 className="text-lg font-medium text-green-900 mb-3">🎯 WCAG 2.1 AA Compliant</h3>
            <p className="text-sm text-green-800 mb-4">
              This Switch component is fully accessible and meets WCAG 2.1 AA standards with the
              following features:
            </p>
            <ul className="text-sm text-green-800 space-y-2">
              <li>✅ Proper ARIA attributes (role="switch", aria-checked, aria-disabled)</li>
              <li>✅ Visible focus indicators with high contrast (3:1 minimum)</li>
              <li>✅ Full keyboard navigation support</li>
              <li>✅ Screen reader announcements for state changes</li>
              <li>✅ Proper label association and descriptions</li>
              <li>✅ Touch target size meets minimum 44px requirement</li>
            </ul>
          </div>

          <div className="border-t border-green-200 pt-4">
            <h3 className="text-lg font-medium text-green-900 mb-3">⌨️ Keyboard Navigation</h3>
            <div className="bg-white p-4 rounded-md space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Try it yourself:</p>
                <Switch
                  autoFocus={true}
                  checked={keyboardDemo}
                  description="Use Tab to focus, Space/Enter to toggle, Arrow keys to change state"
                  label="Keyboard Navigation Demo"
                  onCheckedChange={setKeyboardDemo}
                />
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">
                    Tab
                  </kbd>{' '}
                  - Focus the switch
                </p>
                <p>
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">
                    Space
                  </kbd>{' '}
                  or{' '}
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">
                    Enter
                  </kbd>{' '}
                  - Toggle the switch
                </p>
                <p>
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">
                    →
                  </kbd>{' '}
                  or{' '}
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">
                    ↑
                  </kbd>{' '}
                  - Turn on (when off)
                </p>
                <p>
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">
                    ←
                  </kbd>{' '}
                  or{' '}
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">
                    ↓
                  </kbd>{' '}
                  - Turn off (when on)
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-green-200 pt-4">
            <h3 className="text-lg font-medium text-green-900 mb-3">🔊 Screen Reader Support</h3>
            <p className="text-sm text-green-800 mb-3">
              The Switch component provides comprehensive screen reader support:
            </p>
            <ul className="text-sm text-green-800 space-y-2">
              <li>• State announcements (On/Off/Loading) via ARIA live regions</li>
              <li>• Error messages announced with role="alert"</li>
              <li>• Proper label association for context</li>
              <li>• Description text linked via aria-describedby</li>
            </ul>
          </div>

          <div className="border-t border-green-200 pt-4">
            <h3 className="text-lg font-medium text-green-900 mb-3">🎨 Focus Indicators</h3>
            <div className="bg-white p-4 rounded-md space-y-3">
              <p className="text-sm text-gray-700">
                Focus on these switches to see the visible focus indicators:
              </p>
              <div className="space-y-3">
                <Switch checked={true} label="Default Focus Ring" />
                <Switch checked={true} focusRingColor="#10b981" label="Custom Green Focus Ring" />
                <Switch checked={true} focusRingColor="#f59e0b" label="Custom Orange Focus Ring" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Guidelines */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Usage Guidelines</h2>
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-3">✅ When to Use</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Binary state toggles (on/off)</li>
                <li>• Settings and preferences</li>
                <li>• Feature enable/disable</li>
                <li>• Quick state changes</li>
                <li>• Mobile-friendly interfaces</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-3">❌ When Not to Use</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Multiple selection (use Checkbox)</li>
                <li>• Complex state management</li>
                <li>• Form submissions (use Button)</li>
                <li>• Navigation elements</li>
                <li>• When space is limited</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Best Practices</h2>
        <div className="bg-purple-50 p-6 rounded-lg space-y-4">
          <div>
            <h3 className="text-lg font-medium text-purple-900 mb-3">
              📝 Accessibility Best Practices
            </h3>
            <ul className="text-sm text-purple-800 space-y-2">
              <li>
                ✓ Always provide a clear, descriptive label that explains what the switch controls
              </li>
              <li>✓ Use description text to provide additional context when needed</li>
              <li>✓ Ensure sufficient color contrast for all states (checked, unchecked, focus)</li>
              <li>
                ✓ Test with keyboard-only navigation to verify all functionality is accessible
              </li>
              <li>✓ Test with screen readers to ensure proper announcements</li>
              <li>✓ Provide immediate feedback for state changes</li>
              <li>✓ Use loading state for async operations to inform users of pending changes</li>
              <li>✓ Display clear error messages when validation fails</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwitchExample;
