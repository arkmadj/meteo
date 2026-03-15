/**
 * Accessible Modal Component
 * 
 * A fully accessible modal dialog component with TypeScript types that follows
 * ARIA best practices for dialog patterns.
 * 
 * Features:
 * - ARIA dialog pattern implementation
 * - Focus management and restoration
 * - Keyboard navigation (Escape to close, Tab trapping)
 * - Screen reader support with proper announcements
 * - Portal rendering for z-index management
 * - Backdrop click handling
 * - Type-safe props and event handling
 * - Customizable sizes and animations
 */

import React, {
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { createPortal } from 'react-dom';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalVariant = 'default' | 'confirmation' | 'alert' | 'form';

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title (required for accessibility) */
  title: string;
  /** Whether to hide the title visually (still accessible) */
  hideTitle?: boolean;
  /** Modal content */
  children: React.ReactNode;
  /** Modal size */
  size?: ModalSize;
  /** Modal variant */
  variant?: ModalVariant;
  /** Whether clicking backdrop closes modal */
  closeOnBackdropClick?: boolean;
  /** Whether pressing Escape closes modal */
  closeOnEscape?: boolean;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Custom close button content */
  closeButtonContent?: React.ReactNode;
  /** Whether to prevent body scroll when open */
  preventBodyScroll?: boolean;
  /** Initial focus element selector or ref */
  initialFocus?: string | React.RefObject<HTMLElement>;
  /** Element to return focus to when closed */
  returnFocus?: React.RefObject<HTMLElement>;
  /** Portal container element */
  portalContainer?: Element;
  /** CSS class name for modal container */
  className?: string;
  /** CSS class name for modal backdrop */
  backdropClassName?: string;
  /** CSS class name for modal content */
  contentClassName?: string;
  /** Unique ID for the modal */
  id?: string;
  /** ARIA label for the modal */
  ariaLabel?: string;
  /** ARIA described by reference */
  ariaDescribedBy?: string;
  /** ARIA labelledby reference (defaults to title) */
  ariaLabelledBy?: string;
  /** Role for the modal (defaults to 'dialog') */
  role?: 'dialog' | 'alertdialog';
  /** Callback when modal opens */
  onOpen?: () => void;
  /** Callback when modal closes */
  onAfterClose?: () => void;
  /** Whether modal is loading */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** Whether to disable animations */
  disableAnimation?: boolean;
}

export interface ModalRef {
  /** Focus the modal */
  focus: () => void;
  /** Close the modal */
  close: () => void;
  /** Get the modal element */
  getElement: () => HTMLDivElement | null;
}

// ============================================================================
// FOCUS TRAP HOOK
// ============================================================================

const useFocusTrap = (
  isActive: boolean,
  containerRef: React.RefObject<HTMLElement>
) => {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback((container: HTMLElement) => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }, []);

  const handleTabKey = useCallback((event: KeyboardEvent) => {
    if (!isActive || !containerRef.current) return;

    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [isActive, containerRef, getFocusableElements]);

  useEffect(() => {
    if (isActive) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Add event listener for tab trapping
      document.addEventListener('keydown', handleTabKey);

      return () => {
        document.removeEventListener('keydown', handleTabKey);
      };
    } else {
      // Restore focus when deactivated
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
    }
  }, [isActive, handleTabKey]);

  const focusFirstElement = useCallback(() => {
    if (!containerRef.current) return;

    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else {
      // If no focusable elements, focus the container itself
      containerRef.current.focus();
    }
  }, [containerRef, getFocusableElements]);

  return { focusFirstElement };
};

// ============================================================================
// ACCESSIBLE MODAL COMPONENT
// ============================================================================

export const AccessibleModal = forwardRef<ModalRef, ModalProps>(
  ({
    isOpen,
    onClose,
    title,
    hideTitle = false,
    children,
    size = 'md',
    variant = 'default',
    closeOnBackdropClick = true,
    closeOnEscape = true,
    showCloseButton = true,
    closeButtonContent,
    preventBodyScroll = true,
    initialFocus,
    returnFocus,
    portalContainer,
    className = '',
    backdropClassName = '',
    contentClassName = '',
    id,
    ariaLabel,
    ariaDescribedBy,
    ariaLabelledBy,
    role = 'dialog',
    onOpen,
    onAfterClose,
    loading = false,
    loadingMessage = 'Loading...',
    animationDuration = 300,
    disableAnimation = false,
  }, ref) => {
    // ========================================================================
    // REFS & STATE
    // ========================================================================

    const modalRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    const modalId = id || `modal-${Math.random().toString(36).substr(2, 9)}`;
    const titleId = `${modalId}-title`;
    const contentId = `${modalId}-content`;

    // ========================================================================
    // FOCUS MANAGEMENT
    // ========================================================================

    const { focusFirstElement } = useFocusTrap(isOpen, modalRef);

    const handleInitialFocus = useCallback(() => {
      if (!isOpen || !modalRef.current) return;

      // Handle custom initial focus
      if (initialFocus) {
        if (typeof initialFocus === 'string') {
          const element = modalRef.current.querySelector(initialFocus) as HTMLElement;
          if (element) {
            element.focus();
            return;
          }
        } else if (initialFocus.current) {
          initialFocus.current.focus();
          return;
        }
      }

      // Default focus behavior
      if (variant === 'alert' || variant === 'confirmation') {
        // For alerts/confirmations, focus the modal itself first
        modalRef.current.focus();
      } else {
        // For other modals, focus the first focusable element
        focusFirstElement();
      }
    }, [isOpen, initialFocus, variant, focusFirstElement]);

    // ========================================================================
    // EVENT HANDLERS
    // ========================================================================

    const handleClose = useCallback(() => {
      onClose();
      
      // Handle return focus
      setTimeout(() => {
        if (returnFocus?.current) {
          returnFocus.current.focus();
        }
        onAfterClose?.();
      }, disableAnimation ? 0 : animationDuration);
    }, [onClose, returnFocus, onAfterClose, disableAnimation, animationDuration]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault();
        handleClose();
      }
    }, [closeOnEscape, handleClose]);

    const handleBackdropClick = useCallback((event: React.MouseEvent) => {
      if (closeOnBackdropClick && event.target === backdropRef.current) {
        handleClose();
      }
    }, [closeOnBackdropClick, handleClose]);

    // ========================================================================
    // EFFECTS
    // ========================================================================

    // Handle body scroll prevention
    useEffect(() => {
      if (!preventBodyScroll) return;

      if (isOpen) {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        
        return () => {
          document.body.style.overflow = originalOverflow;
        };
      }
    }, [isOpen, preventBodyScroll]);

    // Handle focus when modal opens
    useEffect(() => {
      if (isOpen) {
        onOpen?.();
        // Delay focus to ensure modal is rendered
        setTimeout(handleInitialFocus, 0);
      }
    }, [isOpen, onOpen, handleInitialFocus]);

    // ========================================================================
    // IMPERATIVE HANDLE
    // ========================================================================

    useImperativeHandle(ref, () => ({
      focus: () => modalRef.current?.focus(),
      close: handleClose,
      getElement: () => modalRef.current,
    }), [handleClose]);

    // ========================================================================
    // RENDER
    // ========================================================================

    if (!isOpen) return null;

    const modalContent = (
      <div
        ref={backdropRef}
        className={`modal-backdrop ${backdropClassName} ${disableAnimation ? '' : 'animated'}`}
        onClick={handleBackdropClick}
        style={{
          animationDuration: disableAnimation ? '0ms' : `${animationDuration}ms`,
        }}
      >
        <div
          ref={modalRef}
          id={modalId}
          className={`modal ${className} modal-${size} modal-${variant} ${disableAnimation ? '' : 'animated'}`}
          role={role}
          aria-modal="true"
          aria-labelledby={ariaLabelledBy || titleId}
          aria-describedby={ariaDescribedBy || contentId}
          aria-label={ariaLabel}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          style={{
            animationDuration: disableAnimation ? '0ms' : `${animationDuration}ms`,
          }}
        >
          <div ref={contentRef} className={`modal-content ${contentClassName}`}>
            {/* Header */}
            <div className="modal-header">
              <h2
                ref={titleRef}
                id={titleId}
                className={`modal-title ${hideTitle ? 'sr-only' : ''}`}
              >
                {title}
              </h2>
              
              {showCloseButton && (
                <button
                  ref={closeButtonRef}
                  type="button"
                  className="modal-close-button"
                  onClick={handleClose}
                  aria-label="Close modal"
                >
                  {closeButtonContent || (
                    <span aria-hidden="true">&times;</span>
                  )}
                </button>
              )}
            </div>

            {/* Body */}
            <div id={contentId} className="modal-body">
              {loading ? (
                <div className="modal-loading" role="status" aria-live="polite">
                  <span className="loading-spinner" aria-hidden="true"></span>
                  <span className="loading-text">{loadingMessage}</span>
                </div>
              ) : (
                children
              )}
            </div>
          </div>
        </div>
      </div>
    );

    return createPortal(modalContent, portalContainer || document.body);
  }
);

AccessibleModal.displayName = 'AccessibleModal';

// ============================================================================
// MODAL HOOK FOR EASIER USAGE
// ============================================================================

export interface UseModalReturn {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Open the modal */
  open: () => void;
  /** Close the modal */
  close: () => void;
  /** Toggle the modal */
  toggle: () => void;
  /** Modal ref for imperative control */
  modalRef: React.RefObject<ModalRef>;
}

export const useModal = (initialOpen = false): UseModalReturn => {
  const [isOpen, setIsOpen] = React.useState(initialOpen);
  const modalRef = useRef<ModalRef>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    modalRef,
  };
};

// ============================================================================
// MODAL COMPONENTS FOR COMMON PATTERNS
// ============================================================================

export interface ConfirmationModalProps extends Omit<ModalProps, 'variant' | 'children'> {
  /** Confirmation message */
  message: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Confirm button variant */
  confirmVariant?: 'primary' | 'danger' | 'warning';
  /** Callback when confirmed */
  onConfirm: () => void;
  /** Callback when cancelled */
  onCancel?: () => void;
  /** Whether confirm action is loading */
  confirmLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  confirmLoading = false,
  onClose,
  ...modalProps
}) => {
  const handleConfirm = () => {
    onConfirm();
    if (!confirmLoading) {
      onClose();
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  return (
    <AccessibleModal
      {...modalProps}
      variant="confirmation"
      role="alertdialog"
      onClose={onClose}
      initialFocus=".modal-cancel-button"
    >
      <div className="confirmation-modal-content">
        <p className="confirmation-message">{message}</p>
        
        <div className="confirmation-actions">
          <button
            type="button"
            className="modal-cancel-button"
            onClick={handleCancel}
            disabled={confirmLoading}
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            className={`modal-confirm-button ${confirmVariant}`}
            onClick={handleConfirm}
            disabled={confirmLoading}
          >
            {confirmLoading ? (
              <>
                <span className="loading-spinner" aria-hidden="true"></span>
                Loading...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </AccessibleModal>
  );
};

export interface AlertModalProps extends Omit<ModalProps, 'variant' | 'children'> {
  /** Alert message */
  message: string;
  /** Alert type */
  alertType?: 'info' | 'warning' | 'error' | 'success';
  /** Acknowledge button text */
  acknowledgeText?: string;
  /** Callback when acknowledged */
  onAcknowledge?: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  message,
  alertType = 'info',
  acknowledgeText = 'OK',
  onAcknowledge,
  onClose,
  ...modalProps
}) => {
  const handleAcknowledge = () => {
    onAcknowledge?.();
    onClose();
  };

  return (
    <AccessibleModal
      {...modalProps}
      variant="alert"
      role="alertdialog"
      onClose={onClose}
      initialFocus=".modal-acknowledge-button"
    >
      <div className={`alert-modal-content alert-${alertType}`}>
        <div className="alert-icon" aria-hidden="true">
          {alertType === 'error' && '⚠️'}
          {alertType === 'warning' && '⚠️'}
          {alertType === 'success' && '✅'}
          {alertType === 'info' && 'ℹ️'}
        </div>
        
        <p className="alert-message">{message}</p>
        
        <div className="alert-actions">
          <button
            type="button"
            className="modal-acknowledge-button"
            onClick={handleAcknowledge}
          >
            {acknowledgeText}
          </button>
        </div>
      </div>
    </AccessibleModal>
  );
};

export default AccessibleModal;
