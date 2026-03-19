/**
 * Accessible Dropdown Component
 *
 * A fully accessible dropdown component with TypeScript types that follows
 * ARIA best practices for combobox/listbox patterns.
 *
 * Features:
 * - ARIA combobox pattern implementation
 * - Keyboard navigation (Arrow keys, Enter, Escape, Tab)
 * - Screen reader support with proper announcements
 * - Focus management and restoration
 * - Type-safe option handling
 * - Customizable rendering and filtering
 * - Portal support for z-index issues
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { createPortal } from 'react-dom';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DropdownOption<T = unknown> {
  /** Unique identifier for the option */
  id: string;
  /** Display label for the option */
  label: string;
  /** Optional value (defaults to id if not provided) */
  value?: T;
  /** Whether the option is disabled */
  disabled?: boolean;
  /** Optional description for screen readers */
  description?: string;
  /** Optional group/category for the option */
  group?: string;
  /** Custom data for the option */
  data?: Record<string, unknown>;
}

export interface DropdownProps<T = unknown> {
  /** Array of dropdown options */
  options: DropdownOption<T>[];
  /** Currently selected option(s) */
  value?: T | T[];
  /** Callback when selection changes */
  onChange?: (value: T | T[], option: DropdownOption<T> | DropdownOption<T>[]) => void;
  /** Placeholder text when no option is selected */
  placeholder?: string;
  /** Whether multiple selections are allowed */
  multiple?: boolean;
  /** Whether the dropdown is disabled */
  disabled?: boolean;
  /** Whether the dropdown is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** Help text to display */
  helpText?: string;
  /** Label for the dropdown */
  label?: string;
  /** Whether to hide the label visually (still accessible) */
  hideLabel?: boolean;
  /** Whether the dropdown is searchable */
  searchable?: boolean;
  /** Custom search function */
  onSearch?: (query: string, options: DropdownOption<T>[]) => DropdownOption<T>[];
  /** Custom option renderer */
  renderOption?: (
    option: DropdownOption<T>,
    isHighlighted: boolean,
    isSelected: boolean
  ) => React.ReactNode;
  /** Custom selected value renderer */
  renderValue?: (
    option: DropdownOption<T> | DropdownOption<T>[],
    placeholder: string
  ) => React.ReactNode;
  /** Maximum height of the dropdown list */
  maxHeight?: number;
  /** Whether to use a portal for the dropdown */
  usePortal?: boolean;
  /** Portal container element */
  portalContainer?: Element;
  /** CSS class name */
  className?: string;
  /** Unique ID for the dropdown */
  id?: string;
  /** ARIA label for the dropdown */
  ariaLabel?: string;
  /** ARIA described by reference */
  ariaDescribedBy?: string;
  /** Callback when dropdown opens */
  onOpen?: () => void;
  /** Callback when dropdown closes */
  onClose?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** Empty state message */
  emptyMessage?: string;
}

export interface DropdownRef {
  /** Open the dropdown */
  open: () => void;
  /** Close the dropdown */
  close: () => void;
  /** Focus the dropdown trigger */
  focus: () => void;
  /** Get the current open state */
  isOpen: () => boolean;
}

// ============================================================================
// ACCESSIBLE DROPDOWN COMPONENT
// ============================================================================

export const AccessibleDropdown = forwardRef<DropdownRef, DropdownProps>(
  <T extends unknown>(
    {
      options,
      value,
      onChange,
      placeholder = 'Select an option...',
      multiple = false,
      disabled = false,
      required = false,
      error,
      helpText,
      label,
      hideLabel = false,
      searchable = false,
      onSearch,
      renderOption,
      renderValue,
      maxHeight = 300,
      usePortal = false,
      portalContainer,
      className = '',
      id,
      ariaLabel,
      ariaDescribedBy,
      onOpen,
      onClose,
      loading = false,
      loadingMessage = 'Loading options...',
      emptyMessage = 'No options available',
    }: DropdownProps<T>,
    ref: React.Ref<DropdownRef>
  ) => {
    // ========================================================================
    // STATE & REFS
    // ========================================================================

    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [announceText, setAnnounceText] = useState('');

    const triggerRef = useRef<HTMLButtonElement>(null);
    const listboxRef = useRef<HTMLUListElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const liveRegionRef = useRef<HTMLDivElement>(null);

    const dropdownId = id || `dropdown-${Math.random().toString(36).substr(2, 9)}`;
    const listboxId = `${dropdownId}-listbox`;
    const searchId = `${dropdownId}-search`;
    const errorId = error ? `${dropdownId}-error` : undefined;
    const helpId = helpText ? `${dropdownId}-help` : undefined;

    // ========================================================================
    // COMPUTED VALUES
    // ========================================================================

    const filteredOptions = useMemo(() => {
      if (!searchable || !searchQuery.trim()) return options;

      if (onSearch) {
        return onSearch(searchQuery, options);
      }

      // Default search implementation
      const query = searchQuery.toLowerCase();
      return options.filter(
        option =>
          option.label.toLowerCase().includes(query) ||
          option.description?.toLowerCase().includes(query)
      );
    }, [options, searchQuery, searchable, onSearch]);

    const selectedOptions = useMemo(() => {
      if (!value) return [];
      const values = Array.isArray(value) ? value : [value];
      return options.filter(option =>
        values.includes(option.value !== undefined ? option.value : (option.id as T))
      );
    }, [value, options]);

    const selectedOption = multiple ? selectedOptions : selectedOptions[0];

    // ========================================================================
    // HELPER FUNCTIONS
    // ========================================================================

    const announceToScreenReader = useCallback((message: string) => {
      setAnnounceText(message);
      // Clear after announcement
      setTimeout(() => setAnnounceText(''), 1000);
    }, []);

    const getOptionValue = useCallback((option: DropdownOption<T>): T => {
      return option.value !== undefined ? option.value : (option.id as T);
    }, []);

    const isOptionSelected = useCallback(
      (option: DropdownOption<T>): boolean => {
        if (!value) return false;
        const optionValue = getOptionValue(option);
        return Array.isArray(value) ? value.includes(optionValue) : value === optionValue;
      },
      [value, getOptionValue]
    );

    // ========================================================================
    // EVENT HANDLERS
    // ========================================================================

    const handleToggle = useCallback(() => {
      if (disabled) return;

      if (isOpen) {
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
        onClose?.();
        triggerRef.current?.focus();
      } else {
        setIsOpen(true);
        setHighlightedIndex(
          selectedOptions.length > 0
            ? filteredOptions.findIndex(opt => opt.id === selectedOptions[0].id)
            : 0
        );
        onOpen?.();

        // Focus search input if searchable, otherwise focus listbox
        setTimeout(() => {
          if (searchable) {
            searchInputRef.current?.focus();
          } else {
            listboxRef.current?.focus();
          }
        }, 0);
      }
    }, [disabled, isOpen, onClose, onOpen, selectedOptions, filteredOptions, searchable]);

    const handleOptionSelect = useCallback(
      (option: DropdownOption<T>) => {
        if (option.disabled) return;

        const optionValue = getOptionValue(option);

        if (multiple) {
          const currentValues = Array.isArray(value) ? value : [];
          const newValues = currentValues.includes(optionValue)
            ? currentValues.filter(v => v !== optionValue)
            : [...currentValues, optionValue];

          const newOptions = options.filter(opt => newValues.includes(getOptionValue(opt)));

          onChange?.(newValues, newOptions);

          // Announce selection change
          const action = currentValues.includes(optionValue) ? 'deselected' : 'selected';
          announceToScreenReader(`${option.label} ${action}. ${newValues.length} items selected.`);
        } else {
          onChange?.(optionValue, option);
          setIsOpen(false);
          setSearchQuery('');
          onClose?.();

          // Announce selection and close
          announceToScreenReader(`${option.label} selected.`);

          // Return focus to trigger
          setTimeout(() => triggerRef.current?.focus(), 0);
        }
      },
      [multiple, value, options, getOptionValue, onChange, onClose, announceToScreenReader]
    );

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        const { key, altKey, ctrlKey, metaKey } = event;

        // Handle trigger key events
        if (!isOpen) {
          switch (key) {
            case 'Enter':
            case ' ':
            case 'ArrowDown':
            case 'ArrowUp':
              event.preventDefault();
              handleToggle();
              break;
          }
          return;
        }

        // Handle open dropdown key events
        switch (key) {
          case 'Escape':
            event.preventDefault();
            setIsOpen(false);
            setSearchQuery('');
            onClose?.();
            triggerRef.current?.focus();
            break;

          case 'Enter':
            event.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
              handleOptionSelect(filteredOptions[highlightedIndex]);
            }
            break;

          case 'ArrowDown':
            event.preventDefault();
            setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
            break;

          case 'ArrowUp':
            event.preventDefault();
            setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
            break;

          case 'Home':
            event.preventDefault();
            setHighlightedIndex(0);
            break;

          case 'End':
            event.preventDefault();
            setHighlightedIndex(filteredOptions.length - 1);
            break;

          case 'Tab':
            // Allow tab to close dropdown and move focus
            setIsOpen(false);
            setSearchQuery('');
            onClose?.();
            break;

          default:
            // Handle character navigation for non-searchable dropdowns
            if (!searchable && key.length === 1 && !altKey && !ctrlKey && !metaKey) {
              const char = key.toLowerCase();
              const startIndex = highlightedIndex + 1;
              const matchIndex = filteredOptions.findIndex(
                (option, index) =>
                  index >= startIndex && option.label.toLowerCase().startsWith(char)
              );

              if (matchIndex >= 0) {
                setHighlightedIndex(matchIndex);
              } else {
                // Wrap around to beginning
                const wrapIndex = filteredOptions.findIndex(option =>
                  option.label.toLowerCase().startsWith(char)
                );
                if (wrapIndex >= 0) {
                  setHighlightedIndex(wrapIndex);
                }
              }
            }
            break;
        }
      },
      [
        isOpen,
        highlightedIndex,
        filteredOptions,
        handleToggle,
        handleOptionSelect,
        onClose,
        searchable,
      ]
    );

    // ========================================================================
    // EFFECTS
    // ========================================================================

    // Scroll highlighted option into view
    useEffect(() => {
      if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
        const highlightedElement = listboxRef.current.children[highlightedIndex] as HTMLElement;
        if (highlightedElement) {
          highlightedElement.scrollIntoView({ block: 'nearest' });
        }
      }
    }, [isOpen, highlightedIndex]);

    // Close dropdown on outside click
    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        if (
          triggerRef.current &&
          !triggerRef.current.contains(target) &&
          listboxRef.current &&
          !listboxRef.current.contains(target) &&
          searchInputRef.current &&
          !searchInputRef.current.contains(target)
        ) {
          setIsOpen(false);
          setSearchQuery('');
          onClose?.();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    // ========================================================================
    // IMPERATIVE HANDLE
    // ========================================================================

    useImperativeHandle(
      ref,
      () => ({
        open: () => handleToggle(),
        close: () => {
          if (isOpen) {
            setIsOpen(false);
            setSearchQuery('');
            onClose?.();
          }
        },
        focus: () => triggerRef.current?.focus(),
        isOpen: () => isOpen,
      }),
      [handleToggle, isOpen, onClose]
    );

    // ========================================================================
    // RENDER HELPERS
    // ========================================================================

    const renderTrigger = () => (
      <button
        ref={triggerRef}
        type="button"
        className={`dropdown-trigger ${isOpen ? 'open' : ''} ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-describedby={[ariaDescribedBy, errorId, helpId].filter(Boolean).join(' ') || undefined}
        aria-label={ariaLabel}
        aria-required={required}
        aria-invalid={!!error}
        onKeyDown={handleKeyDown}
        onClick={handleToggle}
      >
        <span className="dropdown-value">
          {renderValue
            ? renderValue(selectedOption, placeholder)
            : selectedOption
              ? Array.isArray(selectedOption)
                ? `${selectedOption.length} selected`
                : selectedOption.label
              : placeholder}
        </span>
        <span className="dropdown-arrow" aria-hidden="true">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>
    );

    const renderListbox = () => (
      <ul
        ref={listboxRef}
        id={listboxId}
        role="listbox"
        aria-multiselectable={multiple}
        aria-label={ariaLabel || label || 'Options'}
        className="dropdown-listbox"
        style={{ maxHeight }}
        tabIndex={searchable ? -1 : 0}
        onKeyDown={searchable ? undefined : handleKeyDown}
      >
        {loading ? (
          <li role="option" className="dropdown-option loading" aria-disabled="true">
            {loadingMessage}
          </li>
        ) : filteredOptions.length === 0 ? (
          <li role="option" className="dropdown-option empty" aria-disabled="true">
            {emptyMessage}
          </li>
        ) : (
          filteredOptions.map((option, index) => {
            const isHighlighted = index === highlightedIndex;
            const isSelected = isOptionSelected(option);

            return (
              <li
                key={option.id}
                role="option"
                className={`dropdown-option ${isHighlighted ? 'highlighted' : ''} ${isSelected ? 'selected' : ''} ${option.disabled ? 'disabled' : ''}`}
                aria-selected={isSelected}
                aria-disabled={option.disabled}
                aria-describedby={option.description ? `${option.id}-desc` : undefined}
                onClick={() => handleOptionSelect(option)}
              >
                {renderOption ? (
                  renderOption(option, isHighlighted, isSelected)
                ) : (
                  <>
                    <span className="option-label">{option.label}</span>
                    {option.description && (
                      <span id={`${option.id}-desc`} className="option-description">
                        {option.description}
                      </span>
                    )}
                    {multiple && isSelected && (
                      <span className="option-checkmark" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </>
                )}
              </li>
            );
          })
        )}
      </ul>
    );

    const renderDropdownContent = () => (
      <div className={`dropdown-content ${isOpen ? 'open' : ''}`}>
        {searchable && (
          <div className="dropdown-search">
            <input
              ref={searchInputRef}
              id={searchId}
              type="text"
              className="dropdown-search-input"
              placeholder="Search options..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Search options"
              aria-controls={listboxId}
              aria-autocomplete="list"
              role="combobox"
              aria-expanded={isOpen}
            />
          </div>
        )}
        {renderListbox()}
      </div>
    );

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
      <div className={`dropdown-container ${className}`}>
        {/* Label */}
        {label && (
          <label htmlFor={dropdownId} className={`dropdown-label ${hideLabel ? 'sr-only' : ''}`}>
            {label}
            {required && (
              <span className="required-indicator" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {/* Dropdown */}
        <div className="dropdown-wrapper">
          {renderTrigger()}

          {/* Dropdown content - portal or inline */}
          {isOpen &&
            (usePortal
              ? createPortal(renderDropdownContent(), portalContainer || document.body)
              : renderDropdownContent())}
        </div>

        {/* Error message */}
        {error && (
          <div id={errorId} className="dropdown-error" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        {/* Help text */}
        {helpText && (
          <div id={helpId} className="dropdown-help">
            {helpText}
          </div>
        )}

        {/* Screen reader announcements */}
        <div ref={liveRegionRef} className="sr-only" aria-live="assertive" aria-atomic="true">
          {announceText}
        </div>
      </div>
    );
  }
);

AccessibleDropdown.displayName = 'AccessibleDropdown';

export default AccessibleDropdown;
