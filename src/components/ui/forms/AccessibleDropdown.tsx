/**
 * Accessible Dropdown Component
 * Fully accessible custom dropdown without using <select>
 * Supports keyboard, screen readers, and mobile devices
 */

import React, { useEffect, useRef, useState } from 'react';

import { BORDER_RADIUS, COLORS, SHADOWS, SPACING } from '@/design-system/tokens';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: React.ReactNode;
}

export interface AccessibleDropdownProps {
  /** Unique ID for the dropdown */
  id: string;
  /** Label for the dropdown */
  label: string;
  /** Options to display */
  options: DropdownOption[];
  /** Selected value */
  value: string | null;
  /** Change handler */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Helper text */
  helperText?: string;
  /** Required field */
  required?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Accessible Dropdown Component
 * Implements ARIA 1.2 Combobox pattern
 */
const AccessibleDropdown: React.FC<AccessibleDropdownProps> = ({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  error = false,
  errorMessage,
  helperText,
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);
  const enabledOptions = options.filter(opt => !opt.disabled);

  // Generate IDs
  const triggerId = `${id}-trigger`;
  const listboxId = `${id}-listbox`;
  const labelId = `${id}-label`;
  const descriptionId = helperText || errorMessage ? `${id}-description` : undefined;

  /**
   * Close dropdown
   */
  const closeDropdown = () => {
    setIsOpen(false);
    setActiveIndex(-1);
    triggerRef.current?.focus();
  };

  /**
   * Open dropdown
   */
  const openDropdown = () => {
    if (disabled) return;
    setIsOpen(true);
    // Set active index to selected option or first enabled option
    const selectedIndex = value ? enabledOptions.findIndex(opt => opt.value === value) : 0;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  };

  /**
   * Select option
   */
  const selectOption = (optionValue: string) => {
    const option = options.find(opt => opt.value === optionValue);
    if (option && !option.disabled) {
      onChange(optionValue);
      closeDropdown();

      // Announce to screen readers
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = `${option.label} selected`;
      }
    }
  };

  /**
   * Navigate to next option
   */
  const navigateNext = () => {
    setActiveIndex(prev => {
      const next = prev + 1;
      return next >= enabledOptions.length ? 0 : next;
    });
  };

  /**
   * Navigate to previous option
   */
  const navigatePrevious = () => {
    setActiveIndex(prev => {
      const next = prev - 1;
      return next < 0 ? enabledOptions.length - 1 : next;
    });
  };

  /**
   * Navigate to first option
   */
  const navigateFirst = () => {
    setActiveIndex(0);
  };

  /**
   * Navigate to last option
   */
  const navigateLast = () => {
    setActiveIndex(enabledOptions.length - 1);
  };

  /**
   * Type-ahead search
   */
  const handleTypeAhead = (char: string) => {
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Update search query
    const newQuery = searchQuery + char.toLowerCase();
    setSearchQuery(newQuery);

    // Find matching option
    const matchIndex = enabledOptions.findIndex(opt =>
      opt.label.toLowerCase().startsWith(newQuery)
    );

    if (matchIndex >= 0) {
      setActiveIndex(matchIndex);
    }

    // Clear search after 500ms
    const timeout = setTimeout(() => {
      setSearchQuery('');
    }, 500);
    setSearchTimeout(timeout);
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && activeIndex >= 0) {
          selectOption(enabledOptions[activeIndex].value);
        } else {
          openDropdown();
        }
        break;

      case 'Escape':
        e.preventDefault();
        if (isOpen) {
          closeDropdown();
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          openDropdown();
        } else {
          navigateNext();
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          openDropdown();
        } else {
          navigatePrevious();
        }
        break;

      case 'Home':
        e.preventDefault();
        if (isOpen) {
          navigateFirst();
        }
        break;

      case 'End':
        e.preventDefault();
        if (isOpen) {
          navigateLast();
        }
        break;

      case 'Tab':
        if (isOpen) {
          closeDropdown();
        }
        break;

      default:
        // Type-ahead search
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          if (!isOpen) {
            openDropdown();
          }
          handleTypeAhead(e.key);
        }
        break;
    }
  };

  /**
   * Handle click outside
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        listboxRef.current &&
        !listboxRef.current.contains(target)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  /**
   * Scroll active option into view
   */
  useEffect(() => {
    if (isOpen && activeIndex >= 0 && listboxRef.current) {
      const activeOption = listboxRef.current.children[activeIndex] as HTMLElement;
      if (activeOption) {
        activeOption.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen, activeIndex]);

  /**
   * Prevent body scroll when open on mobile
   */
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const activeDescendantId =
    isOpen && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  return (
    <div className={`accessible-dropdown ${className}`} style={{ position: 'relative' }}>
      {/* Label */}
      <label
        id={labelId}
        htmlFor={triggerId}
        style={{
          display: 'block',
          marginBottom: SPACING[2],
          fontSize: '14px',
          fontWeight: 600,
          color: error ? COLORS.semantic.error[500] : COLORS.neutral[900],
        }}
      >
        {label}
        {required && (
          <span style={{ color: COLORS.semantic.error[500], marginLeft: '4px' }}>*</span>
        )}
      </label>

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id={triggerId}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-labelledby={labelId}
        aria-activedescendant={activeDescendantId}
        aria-describedby={descriptionId}
        aria-required={required}
        aria-invalid={error}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        style={{
          width: '100%',
          minHeight: '44px',
          padding: `${SPACING[2]} ${SPACING[3]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: SPACING[2],
          backgroundColor: disabled ? COLORS.neutral[100] : 'white',
          border: `2px solid ${
            error ? COLORS.semantic.error : isOpen ? COLORS.primary[500] : COLORS.neutral[300]
          }`,
          borderRadius: BORDER_RADIUS.md,
          fontSize: '14px',
          color: disabled ? COLORS.neutral[500] : COLORS.neutral[900],
          cursor: disabled ? 'not-allowed' : 'pointer',
          textAlign: 'left',
          transition: 'border-color 0.15s ease-out',
        }}
      >
        <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: SPACING[2] }}>
          {selectedOption?.icon}
          <span style={{ color: selectedOption ? 'inherit' : COLORS.neutral[500] }}>
            {selectedOption?.label || placeholder}
          </span>
        </span>
        <span
          style={{
            fontSize: '12px',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.15s ease-out',
          }}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>

      {/* Listbox */}
      {isOpen && (
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-labelledby={labelId}
          tabIndex={-1}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: SPACING[1],
            maxHeight: '300px',
            overflowY: 'auto',
            backgroundColor: 'white',
            border: `1px solid ${COLORS.neutral[300]}`,
            borderRadius: BORDER_RADIUS.md,
            boxShadow: SHADOWS.lg,
            zIndex: 1000,
            listStyle: 'none',
            padding: SPACING[1],
            margin: 0,
          }}
        >
          {enabledOptions.map((option, index) => {
            const isActive = index === activeIndex;
            const isSelected = option.value === value;
            const optionId = `${listboxId}-option-${index}`;

            return (
              <li
                key={option.value}
                id={optionId}
                role="option"
                aria-selected={isSelected}
                onClick={() => selectOption(option.value)}
                style={{
                  minHeight: '44px',
                  padding: `${SPACING[2]} ${SPACING[3]}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: SPACING[2],
                  backgroundColor: isActive
                    ? COLORS.primary[50]
                    : isSelected
                      ? COLORS.primary[100]
                      : 'transparent',
                  color: COLORS.neutral[900],
                  cursor: 'pointer',
                  borderRadius: BORDER_RADIUS.sm,
                  fontSize: '14px',
                  transition: 'background-color 0.1s ease-out',
                }}
              >
                {option.icon}
                <div style={{ flex: 1 }}>
                  <div>{option.label}</div>
                  {option.description && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: COLORS.neutral[600],
                        marginTop: '2px',
                      }}
                    >
                      {option.description}
                    </div>
                  )}
                </div>
                {isSelected && (
                  <span style={{ fontSize: '16px', color: COLORS.primary[600] }}>✓</span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Helper/Error Text */}
      {(helperText || errorMessage) && (
        <div
          id={descriptionId}
          style={{
            marginTop: SPACING[1],
            fontSize: '12px',
            color: error ? COLORS.semantic.error[500] : COLORS.neutral[600],
          }}
        >
          {error ? errorMessage : helperText}
        </div>
      )}

      {/* Screen Reader Live Region */}
      <div
        ref={liveRegionRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      />
    </div>
  );
};

export default AccessibleDropdown;
