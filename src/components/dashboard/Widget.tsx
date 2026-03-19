import React, { useState } from 'react';

import { useTheme } from '@/design-system/theme';
import type { IWidgetConfig } from '@/types/dashboard';

export interface WidgetProps {
  config: IWidgetConfig;
  isEditMode: boolean;
  onRemove?: () => void;
  onSettings?: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Widget wrapper component that provides drag handles, resize controls,
 * and widget management UI
 */
const Widget: React.FC<WidgetProps> = ({
  config,
  isEditMode,
  onRemove,
  onSettings,
  children,
  className = '',
}) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`
        relative h-full w-full
        rounded-lg
        bg-[var(--theme-surface)]
        border border-[var(--theme-border)]
        shadow-sm
        transition-all duration-200
        ${isEditMode ? 'cursor-move' : ''}
        ${isHovered && isEditMode ? 'shadow-lg ring-2 ring-[var(--theme-primary)]' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      aria-label={`${config.title} widget${config.pinned ? ' (pinned)' : ''}`}
    >
      {/* Pin Indicator */}
      {config.pinned && !isEditMode && (
        <div
          className="absolute top-2 left-2 z-10 opacity-50"
          title="This widget is pinned"
          aria-label="Pinned widget"
        >
          <span className="text-xs">📌</span>
        </div>
      )}
      {/* Edit Mode Controls */}
      {isEditMode && (
        <div
          className={`
            absolute top-2 right-2 z-10
            flex items-center gap-1.5 sm:gap-2
            transition-opacity duration-200
            ${isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-0'}
            opacity-100 sm:opacity-0
          `}
        >
          {/* Settings Button */}
          {onSettings && (
            <button
              onClick={e => {
                e.stopPropagation();
                onSettings();
              }}
              className="
                p-1.5 sm:p-1.5 rounded-md
                bg-[var(--theme-surface)]
                border border-[var(--theme-border)]
                text-[var(--theme-text-secondary)]
                hover:bg-[var(--theme-background)]
                hover:text-[var(--theme-text)]
                active:bg-[var(--theme-background)]
                transition-colors
                focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]
                touch-manipulation
              "
              aria-label={`Settings for ${config.title}`}
              title="Widget Settings"
              type="button"
            >
              <svg
                className="w-4 h-4 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
                <path
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
          )}

          {/* Remove Button */}
          {onRemove && (
            <button
              onClick={e => {
                e.stopPropagation();
                onRemove();
              }}
              className="
                p-1.5 sm:p-1.5 rounded-md
                bg-red-50 dark:bg-red-900/20
                border border-red-200 dark:border-red-800
                text-red-600 dark:text-red-400
                hover:bg-red-100 dark:hover:bg-red-900/40
                active:bg-red-100 dark:active:bg-red-900/40
                transition-colors
                focus:outline-none focus:ring-2 focus:ring-red-500
                touch-manipulation
              "
              aria-label={`Remove ${config.title} widget`}
              title="Remove Widget"
              type="button"
            >
              <svg
                className="w-4 h-4 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Drag Handle Indicator */}
      {isEditMode && (
        <div
          className={`
            absolute top-2 left-2 z-10
            transition-opacity duration-200
            ${isHovered ? 'opacity-100' : 'opacity-30'}
            touch-manipulation
          `}
          aria-hidden="true"
        >
          <svg
            className="w-5 h-5 sm:w-5 sm:h-5 text-[var(--theme-text-secondary)]"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </div>
      )}

      {/* Widget Content */}
      <div
        className={`
          h-full w-full
          ${isEditMode ? 'pointer-events-none' : ''}
        `}
      >
        {children}
      </div>

      {/* Resize Indicator (shown in edit mode) */}
      {isEditMode && (
        <div
          className={`
            absolute bottom-1 right-1
            w-4 h-4
            transition-opacity duration-200
            ${isHovered ? 'opacity-100' : 'opacity-30'}
          `}
          aria-hidden="true"
        >
          <svg
            className="w-4 h-4 text-[var(--theme-text-secondary)]"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 7h-2v2h2V7zm0 4h-2v2h2v-2zM9 11H7v2h2v-2zm4 4h-2v2h2v-2zm-4 0H7v2h2v-2z"
              fillRule="evenodd"
            />
          </svg>
        </div>
      )}

      {/* Hidden Widget Overlay */}
      {!config.visible && (
        <div
          className="
            absolute inset-0
            bg-[var(--theme-background)]/80
            backdrop-blur-sm
            rounded-lg
            flex items-center justify-center
            z-20
          "
        >
          <div className="text-center">
            <svg
              className="w-12 h-12 mx-auto mb-2 text-[var(--theme-text-secondary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            <p className="text-sm text-[var(--theme-text-secondary)]">Widget Hidden</p>
          </div>
        </div>
      )}
    </div>
  );
};

Widget.displayName = 'Widget';

export default Widget;
