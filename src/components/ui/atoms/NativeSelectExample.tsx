/**
 * NativeSelect Example Component
 * Demonstrates usage of the NativeSelect atom component
 */

import React, { useState } from 'react';

import { NativeSelect } from './index';

const NativeSelectExample: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState('');
  const [selectedSize, setSelectedSize] = useState('md');
  const [selectedVariant, setSelectedVariant] = useState('default');

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Português' },
    { value: 'ru', label: 'Русский' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' },
    { value: 'zh', label: '中文' },
  ];

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
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">NativeSelect Component</h1>
        <p className="text-gray-600">
          A lightweight select component using the native browser select element
        </p>
      </div>

      {/* Basic Usage */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Basic Usage</h2>
        <NativeSelect
          helperText="This uses the native browser select element for optimal performance"
          label="Select a Language"
          options={languageOptions}
          placeholder="Choose your language..."
          value={selectedValue}
          onValueChange={setSelectedValue}
        />
        <p className="text-sm text-gray-600">Selected: {selectedValue || 'None'}</p>
      </div>

      {/* Size Variants */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Size Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NativeSelect
            label="Extra Small"
            options={languageOptions}
            placeholder="XS Select"
            size="xs"
          />
          <NativeSelect
            label="Medium (Default)"
            options={languageOptions}
            placeholder="MD Select"
            size="md"
          />
          <NativeSelect
            label="Extra Large"
            options={languageOptions}
            placeholder="XL Select"
            size="xl"
          />
        </div>
      </div>

      {/* Style Variants */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Style Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NativeSelect
            label="Default Style"
            options={languageOptions}
            placeholder="Default"
            variant="default"
          />
          <NativeSelect
            label="Filled Style"
            options={languageOptions}
            placeholder="Filled"
            variant="filled"
          />
          <NativeSelect
            label="Outlined Style"
            options={languageOptions}
            placeholder="Outlined"
            variant="outlined"
          />
        </div>
      </div>

      {/* Interactive Demo */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Interactive Demo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NativeSelect
            label="Select Size"
            options={sizeOptions}
            value={selectedSize}
            onValueChange={setSelectedSize}
          />
          <NativeSelect
            label="Select Variant"
            options={variantOptions}
            value={selectedVariant}
            onValueChange={setSelectedVariant}
          />
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Preview:</h3>
          <NativeSelect
            label={`Dynamic ${selectedVariant} Select (${selectedSize})`}
            options={languageOptions}
            placeholder="Try me!"
            size={selectedSize as 'sm' | 'md' | 'lg'}
            variant={selectedVariant as 'default' | 'filled' | 'outlined'}
          />
        </div>
      </div>

      {/* Error States */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Error States</h2>
        <NativeSelect
          error={true}
          errorMessage="Please select a language"
          label="Language with Error"
          options={languageOptions}
          placeholder="Select a language..."
        />
      </div>

      {/* Disabled State */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Disabled State</h2>
        <NativeSelect
          disabled={true}
          label="Disabled Select"
          options={languageOptions}
          placeholder="This is disabled"
        />
      </div>

      {/* Comparison with Custom Select */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Why Choose NativeSelect?</h2>
        <div className="bg-blue-50 p-4 rounded-lg">
          <ul className="text-sm text-blue-800 space-y-2">
            <li>
              <strong>🚀 Performance:</strong> Uses native browser select - no custom dropdown logic
            </li>
            <li>
              <strong>♿ Accessibility:</strong> Built-in screen reader support and keyboard
              navigation
            </li>
            <li>
              <strong>📱 Mobile:</strong> Native mobile select experience with proper touch handling
            </li>
            <li>
              <strong>🎨 Simple:</strong> Lightweight with fewer dependencies and styling concerns
            </li>
            <li>
              <strong>🔧 Reliable:</strong> Consistent behavior across all browsers and devices
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NativeSelectExample;
