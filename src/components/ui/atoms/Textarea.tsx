/**
 * Textarea Atom Component
 * A versatile textarea component following atomic design principles
 */

import React, { forwardRef, useState } from 'react';

import { COLORS, COMPONENT_TOKENS, BORDER_RADIUS, TYPOGRAPHY } from '../../../design-system/tokens';
import type { BaseComponentProps, ComponentSize } from '../base/BaseComponent';
import { componentUtils, useComponentState } from '../base/BaseComponent';

// ============================================================================
// TEXTAREA SPECIFIC TYPES
// ============================================================================

export type TextareaVariant = 'default' | 'filled' | 'outlined';
export type TextareaSize = ComponentSize;
export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

// ============================================================================
// TEXTAREA COMPONENT
// ============================================================================

export interface TextareaProps
  extends Omit<BaseComponentProps, 'variant'>,
    React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Textarea variant */
  variant?: TextareaVariant;
  /** Textarea size */
  size?: TextareaSize;
  /** Label text */
  label?: string;
  /** Whether the label should be hidden visually */
  hiddenLabel?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Textarea value */
  value?: string;
  /** Default value */
  defaultValue?: string;
  /** Error message */
  errorMessage?: string;
  /** Whether the textarea has an error */
  error?: boolean;
  /** Helper text */
  helperText?: string;
  /** Maximum length */
  maxLength?: number;
  /** Minimum length */
  minLength?: number;
  /** Number of rows */
  rows?: number;
  /** Resize behavior */
  resize?: TextareaResize;
  /** Whether to show character count */
  showCharacterCount?: boolean;
  /** Custom character count formatter */
  characterCountFormatter?: (current: number, max: number) => string;
  /** Auto-resize based on content */
  autoResize?: boolean;
  /** Maximum height for auto-resize */
  maxHeight?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      variant = 'default',
      size = 'md',
      label,
      hiddenLabel = false,
      placeholder,
      value,
      defaultValue,
      errorMessage,
      error = false,
      helperText,
      maxLength,
      minLength,
      rows = 3,
      resize = 'vertical',
      showCharacterCount = false,
      characterCountFormatter,
      autoResize = false,
      maxHeight = '200px',
      disabled,
      className,
      testId,
      onChange,
      ...props
    },
    ref
  ) => {
    const { isDisabled } = useComponentState({
      disabled,
      testId,
    });

    const [internalValue, setInternalValue] = useState(defaultValue || '');

    const currentValue = value !== undefined ? value : internalValue;
    const characterCount = currentValue.length;
    const isOverLimit = maxLength && characterCount > maxLength;

    // ============================================================================
    // STYLES
    // ============================================================================

    const containerClasses = ['relative', 'w-full'].join(' ');

    const baseTextareaClasses = [
      'w-full',
      'border',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'placeholder:text-gray-400',
      'bg-transparent',
      'resize-none', // We'll handle resize manually
    ].join(' ');

    const variantClasses: Record<TextareaVariant, string> = {
      default: [
        `border-[${COLORS.neutral[300]}]`,
        'bg-white',
        `focus:border-[${COLORS.primary[500]}]`,
        `focus:ring-[${COLORS.primary[500]}]`,
        `hover:border-[${COLORS.neutral[400]}]`,
      ].join(' '),

      filled: [
        'border-transparent',
        `bg-[${COLORS.neutral[100]}]`,
        'focus:bg-white',
        `focus:border-[${COLORS.primary[500]}]`,
        `focus:ring-[${COLORS.primary[500]}]`,
        `hover:bg-[${COLORS.neutral[200]}]`,
      ].join(' '),

      outlined: [
        `border-[${COLORS.neutral[300]}]`,
        'bg-transparent',
        `focus:border-[${COLORS.primary[500]}]`,
        `focus:ring-[${COLORS.primary[500]}]`,
        `hover:border-[${COLORS.neutral[400]}]`,
      ].join(' '),
    };

    const sizeClasses: Record<TextareaSize, string> = {
      xs: [
        `px-[${COMPONENT_TOKENS.input.padding.xs}]`,
        `py-[${COMPONENT_TOKENS.input.height.xs}]`,
        `text-[${COMPONENT_TOKENS.input.fontSize.xs}]`,
        `rounded-[${BORDER_RADIUS.sm}]`,
      ].join(' '),

      sm: [
        `px-[${COMPONENT_TOKENS.input.padding.sm}]`,
        `py-[${COMPONENT_TOKENS.input.height.sm}]`,
        `text-[${COMPONENT_TOKENS.input.fontSize.sm}]`,
        `rounded-[${BORDER_RADIUS.md}]`,
      ].join(' '),

      md: [
        `px-[${COMPONENT_TOKENS.input.padding.md}]`,
        `py-[${COMPONENT_TOKENS.input.height.md}]`,
        `text-[${COMPONENT_TOKENS.input.fontSize.md}]`,
        `rounded-[${BORDER_RADIUS.lg}]`,
      ].join(' '),

      lg: [
        `px-[${COMPONENT_TOKENS.input.padding.lg}]`,
        `py-[${COMPONENT_TOKENS.input.height.lg}]`,
        `text-[${COMPONENT_TOKENS.input.fontSize.lg}]`,
        `rounded-[${BORDER_RADIUS.lg}]`,
      ].join(' '),

      xl: [
        'px-6',
        'py-4',
        `text-[${TYPOGRAPHY.fontSize.lg[0]}]`,
        `rounded-[${BORDER_RADIUS.xl}]`,
      ].join(' '),
    };

    const resizeClasses: Record<TextareaResize, string> = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    const errorClasses =
      error || isOverLimit
        ? [
            `border-[${COLORS.semantic.error[500]}]`,
            `focus:border-[${COLORS.semantic.error[500]}]`,
            `focus:ring-[${COLORS.semantic.error[500]}]`,
          ].join(' ')
        : '';

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;

      if (value === undefined) {
        setInternalValue(newValue);
      }

      onChange?.(e);
    };

    // ============================================================================
    // AUTO-RESIZE LOGIC
    // ============================================================================

    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        const maxHeightValue = parseInt(maxHeight);
        textarea.style.height = `${Math.min(scrollHeight, maxHeightValue)}px`;
      }
    }, [currentValue, autoResize, maxHeight]);

    // ============================================================================
    // RENDER
    // ============================================================================

    const propsForClasses: BaseComponentProps = {
      size,
      disabled: isDisabled,
      className,
    };

    const coreTextareaClasses = componentUtils.generateClasses(
      baseTextareaClasses,
      propsForClasses,
      undefined,
      sizeClasses
    );

    const textareaClasses = [
      coreTextareaClasses,
      variantClasses?.[variant],
      resizeClasses?.[resize],
      error || isOverLimit ? errorClasses : '',
    ]
      .filter(Boolean)
      .join(' ');

    const textareaId = testId || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const displayCharacterCount = () => {
      if (!showCharacterCount || !maxLength) return null;

      const formatter =
        characterCountFormatter || ((current: number, max: number) => `${current}/${max}`);

      return (
        <div className="absolute bottom-2 right-2">
          <span
            className={`text-xs ${
              isOverLimit ? `text-[${COLORS.semantic.error[600]}]` : `text-[${COLORS.neutral[400]}]`
            }`}
          >
            {formatter(characterCount, maxLength)}
          </span>
        </div>
      );
    };

    return (
      <div className={containerClasses}>
        {/* Label */}
        {label && (
          <label
            className={`block text-sm font-medium mb-2 ${
              hiddenLabel ? 'sr-only' : `text-[${COLORS.neutral[700]}]`
            }`}
            htmlFor={textareaId}
          >
            {label}
          </label>
        )}

        {/* Textarea */}
        <div className="relative">
          <textarea
            ref={el => {
              if (ref) {
                if (typeof ref === 'function') {
                  ref(el);
                } else {
                  ref.current = el;
                }
              }
              if (textareaRef) {
                (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
              }
            }}
            aria-describedby={
              error && errorMessage
                ? `${textareaId}-error`
                : helperText
                  ? `${textareaId}-helper`
                  : undefined
            }
            aria-invalid={error || isOverLimit ? 'true' : 'false'}
            className={`${textareaClasses} ${showCharacterCount ? 'pr-16' : ''}`}
            data-testid={testId}
            disabled={isDisabled}
            id={textareaId}
            maxLength={maxLength}
            minLength={minLength}
            placeholder={placeholder}
            rows={rows}
            style={autoResize ? { minHeight: '60px', maxHeight } : undefined}
            value={currentValue}
            onChange={handleChange}
            {...props}
          />

          {/* Character Count */}
          {displayCharacterCount()}
        </div>

        {/* Helper/Error Text */}
        {(helperText || (error && errorMessage) || isOverLimit) && (
          <div className="mt-2">
            {isOverLimit ? (
              <p className={`text-sm text-[${COLORS.semantic.error[600]}]`} role="alert">
                {errorMessage || `Maximum ${maxLength} characters exceeded`}
              </p>
            ) : error && errorMessage ? (
              <p
                className={`text-sm text-[${COLORS.semantic.error[600]}]`}
                id={`${textareaId}-error`}
                role="alert"
              >
                {errorMessage}
              </p>
            ) : helperText ? (
              <p className={`text-sm text-[${COLORS.neutral[500]}]`} id={`${textareaId}-helper`}>
                {helperText}
              </p>
            ) : null}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
