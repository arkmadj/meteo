/**
 * Modal Component
 * Accessible overlay dialogs and modal windows
 * Features:
 * - Focus trapping (prevents focus from escaping modal)
 * - ARIA attributes for screen readers
 * - Keyboard navigation (ESC to close, Tab to navigate)
 * - Focus restoration on close
 * - Background content management
 */

import React, { useRef } from 'react';

import { BORDER_RADIUS } from '@/design-system/tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: ModalSize;
  className?: string;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
  finalFocusRef?: React.RefObject<HTMLElement>;
  isAlert?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  className = '',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  initialFocusRef,
  finalFocusRef,
  isAlert = false,
}) => {
  const titleId = useRef(`modal-title-${Math.random().toString(36).substr(2, 9)}`);
  const descriptionId = useRef(`modal-description-${Math.random().toString(36).substr(2, 9)}`);
  const modalId = useRef(`modal-${Math.random().toString(36).substr(2, 9)}`);

  // Use focus trap hook for accessibility
  const modalRef = useFocusTrap({
    isOpen,
    onClose: closeOnEscape ? onClose : undefined,
    initialFocusRef,
    finalFocusRef,
    preventScroll: true,
    hideBackground: true,
    modalId: modalId.current,
  });

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        id={modalId.current}
        role={isAlert ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby={title ? titleId.current : undefined}
        aria-describedby={description ? descriptionId.current : undefined}
        className={`w-full ${sizeClasses?.[size]} bg-white rounded-[${BORDER_RADIUS.lg}] shadow-xl ${className}`}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900" id={titleId.current}>
              {title}
            </h2>
            {showCloseButton && (
              <button
                aria-label="Close modal"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={onClose}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {description && (
          <div
            className="px-6 py-4 text-sm text-gray-600 border-b border-gray-200"
            id={descriptionId.current}
          >
            {description}
          </div>
        )}

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
