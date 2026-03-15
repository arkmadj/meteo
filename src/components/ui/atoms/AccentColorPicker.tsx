/**
 * Accent Color Picker Component
 * Provides a color picker for selecting custom accent colors
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { COLORS } from '../../../design-system/tokens';
import type { BaseComponentProps, ComponentSize } from '../base/BaseComponent';
import { componentUtils, useComponentState } from '../base/BaseComponent';

// ============================================================================
// TYPES
// ============================================================================

export interface AccentColorPickerProps extends Omit<BaseComponentProps, 'size'> {
  /** Current accent color value */
  value?: string;
  /** Default color if no value provided */
  defaultValue?: string;
  /** Callback when color changes */
  onColorChange?: (color: string) => void;
  /** Component size */
  size?: ComponentSize;
  /** Show preset color swatches */
  showPresets?: boolean;
  /** Show color input field */
  showInput?: boolean;
  /** Custom preset colors */
  presetColors?: string[];
  /** Disabled state */
  disabled?: boolean;
  /** Label for the picker */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
}

// ============================================================================
// PRESET COLORS
// ============================================================================

const DEFAULT_PRESET_COLORS = [
  // Primary blues
  COLORS.primary[500],
  COLORS.primary[600],
  COLORS.primary[400],
  
  // Semantic colors
  COLORS.semantic.success[500],
  COLORS.semantic.warning[500],
  COLORS.semantic.error[500],
  COLORS.semantic.info[500],
  
  // Neutral colors
  COLORS.neutral[600],
  COLORS.neutral[700],
  COLORS.neutral[800],
  
  // Weather-themed colors
  COLORS.weather.sunny,
  COLORS.weather.rainy,
  COLORS.weather.cloudy,
  COLORS.weather.stormy,
  
  // Special accent colors
  COLORS.special.accent,
  '#ff6b9d',
  '#4ecdc4',
  '#45b7d1',
  '#f9ca24',
  '#6c5ce7',
  '#a29bfe',
];

// ============================================================================
// COMPONENT
// ============================================================================

const AccentColorPicker: React.FC<AccentColorPickerProps> = ({
  value,
  defaultValue = COLORS.special.accent,
  onColorChange,
  size = 'md',
  showPresets = true,
  showInput = true,
  presetColors = DEFAULT_PRESET_COLORS,
  disabled = false,
  label,
  helperText,
  error = false,
  errorMessage,
  className = '',
  testId,
  ...props
}) => {
  const { t } = useTranslation('common');
  const { isDisabled } = useComponentState({
    disabled,
    testId,
  });

  const [selectedColor, setSelectedColor] = useState<string>(value || defaultValue);
  const [inputValue, setInputValue] = useState<string>(value || defaultValue);
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Update internal state when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedColor(value);
      setInputValue(value);
    }
  }, [value]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle color selection from presets
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setInputValue(color);
    onColorChange?.(color);
  };

  // Handle input field change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Validate and apply color if valid
    if (isValidColor(newValue)) {
      setSelectedColor(newValue);
      onColorChange?.(newValue);
    }
  };

  // Validate color string
  const isValidColor = (color: string): boolean => {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
  };

  // Get size classes
  const getSizeClasses = (): string => {
    const baseClasses = 'accent-color-picker';
    const sizeClasses = {
      xs: 'accent-color-picker-xs',
      sm: 'accent-color-picker-sm',
      md: 'accent-color-picker-md',
      lg: 'accent-color-picker-lg',
      xl: 'accent-color-picker-xl',
    };
    return `${baseClasses} ${sizeClasses[size]}`;
  };

  // Render color swatch
  const renderColorSwatch = (color: string, isSelected: boolean = false) => (
    <button
      type="button"
      className={`color-swatch ${isSelected ? 'color-swatch-selected' : ''}`}
      style={{ backgroundColor: color }}
      onClick={() => handleColorSelect(color)}
      disabled={isDisabled}
      aria-label={`Select color ${color}`}
      aria-pressed={isSelected}
    >
      {isSelected && (
        <span className="color-swatch-check">✓</span>
      )}
    </button>
  );

  return (
    <div 
      ref={pickerRef}
      className={`accent-color-picker-container ${getSizeClasses()} ${className} ${
        error ? 'accent-color-picker-error' : ''
      } ${isDisabled ? 'accent-color-picker-disabled' : ''}`}
      data-testid={testId}
      {...props}
    >
      {/* Label */}
      {label && (
        <label className="accent-color-picker-label">
          {label}
        </label>
      )}

      {/* Main picker trigger */}
      <div className="accent-color-picker-trigger">
        <button
          type="button"
          className="accent-color-picker-button"
          onClick={() => setIsPickerOpen(!isPickerOpen)}
          disabled={isDisabled}
          aria-expanded={isPickerOpen}
          aria-haspopup="listbox"
        >
          <div 
            className="accent-color-preview"
            style={{ backgroundColor: selectedColor }}
          />
          <span className="accent-color-value">{selectedColor}</span>
          <span className="accent-color-dropdown-arrow">
            {isPickerOpen ? '▲' : '▼'}
          </span>
        </button>
      </div>

      {/* Dropdown panel */}
      {isPickerOpen && (
        <div className="accent-color-picker-panel">
          {/* Preset colors */}
          {showPresets && (
            <div className="accent-color-presets">
              <div className="accent-color-presets-grid">
                {presetColors.map((color) => 
                  renderColorSwatch(color, color === selectedColor)
                )}
              </div>
            </div>
          )}

          {/* Custom color input */}
          {showInput && (
            <div className="accent-color-input-section">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="#000000"
                className="accent-color-input"
                disabled={isDisabled}
                aria-label="Enter custom color"
              />
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => handleColorSelect(e.target.value)}
                className="accent-color-native-input"
                disabled={isDisabled}
                aria-label="Pick custom color"
              />
            </div>
          )}
        </div>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p className="accent-color-picker-helper">
          {helperText}
        </p>
      )}

      {/* Error message */}
      {error && errorMessage && (
        <p className="accent-color-picker-error-message">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default AccentColorPicker;
