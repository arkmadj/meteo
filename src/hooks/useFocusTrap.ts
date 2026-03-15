/**
 * Focus Trap Hook
 * Manages focus trapping for modal dialogs and other overlay components
 * Ensures accessibility by preventing focus from escaping the container
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Selectors for focusable elements
 */
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ');

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
  
  return Array.from(elements).filter((el) => {
    // Filter out disabled and hidden elements
    return (
      !el.hasAttribute('disabled') &&
      el.offsetParent !== null &&
      !el.hasAttribute('aria-hidden') &&
      el.tabIndex !== -1
    );
  });
}

/**
 * Focus the first focusable element in container
 */
function focusFirstElement(container: HTMLElement): void {
  const focusableElements = getFocusableElements(container);
  
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  } else {
    // Fallback: make container focusable and focus it
    container.setAttribute('tabindex', '-1');
    container.focus();
  }
}

/**
 * Hide background content from screen readers and keyboard navigation
 */
function hideBackgroundContent(modalId: string): HTMLElement[] {
  const topLevelElements = Array.from(document.body.children).filter(
    (el) => el.id !== modalId && el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE'
  ) as HTMLElement[];
  
  topLevelElements.forEach((el) => {
    // Skip if already hidden
    if (el.getAttribute('aria-hidden') === 'true') return;
    
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('data-focus-trap-hidden', 'true');
    
    // Use inert attribute for modern browsers
    if ('inert' in el) {
      el.inert = true;
    }
  });
  
  return topLevelElements;
}

/**
 * Show background content
 */
function showBackgroundContent(): void {
  const hiddenElements = document.querySelectorAll<HTMLElement>('[data-focus-trap-hidden="true"]');
  
  hiddenElements.forEach((el) => {
    el.removeAttribute('aria-hidden');
    el.removeAttribute('data-focus-trap-hidden');
    
    if ('inert' in el) {
      el.inert = false;
    }
  });
}

/**
 * Prevent body scroll and compensate for scrollbar
 */
function preventBodyScroll(): { overflow: string; paddingRight: string } {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  const originalStyles = {
    overflow: document.body.style.overflow,
    paddingRight: document.body.style.paddingRight,
  };
  
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = `${scrollbarWidth}px`;
  
  return originalStyles;
}

/**
 * Restore body scroll
 */
function restoreBodyScroll(originalStyles: { overflow: string; paddingRight: string }): void {
  document.body.style.overflow = originalStyles.overflow;
  document.body.style.paddingRight = originalStyles.paddingRight;
}

/**
 * Options for useFocusTrap hook
 */
export interface UseFocusTrapOptions {
  /** Whether the focus trap is active */
  isOpen: boolean;
  /** Callback when escape key is pressed */
  onClose?: () => void;
  /** Ref to element that should receive initial focus */
  initialFocusRef?: React.RefObject<HTMLElement>;
  /** Ref to element that should receive focus when trap is deactivated */
  finalFocusRef?: React.RefObject<HTMLElement>;
  /** Whether to prevent body scroll */
  preventScroll?: boolean;
  /** Whether to hide background content */
  hideBackground?: boolean;
  /** ID of the modal container (for aria-hidden management) */
  modalId?: string;
}

/**
 * Hook for managing focus trap in modal dialogs
 * 
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   const modalRef = useFocusTrap({
 *     isOpen,
 *     onClose,
 *     preventScroll: true,
 *     hideBackground: true,
 *   });
 * 
 *   if (!isOpen) return null;
 * 
 *   return (
 *     <div ref={modalRef} role="dialog" aria-modal="true">
 *       <h2>Modal Title</h2>
 *       <button onClick={onClose}>Close</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFocusTrap({
  isOpen,
  onClose,
  initialFocusRef,
  finalFocusRef,
  preventScroll = true,
  hideBackground = true,
  modalId = 'focus-trap-container',
}: UseFocusTrapOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const originalBodyStyles = useRef<{ overflow: string; paddingRight: string } | null>(null);

  /**
   * Handle Tab key for focus cycling
   */
  const handleTabKey = useCallback((event: KeyboardEvent) => {
    if (!containerRef.current) return;
    
    const focusableElements = getFocusableElements(containerRef.current);
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Shift + Tab on first element -> focus last
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
    // Tab on last element -> focus first
    else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }, []);

  /**
   * Handle Escape key
   */
  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        event.preventDefault();
        onClose();
      }
    },
    [onClose]
  );

  /**
   * Setup focus trap when modal opens
   */
  useEffect(() => {
    if (!isOpen) return;

    // Store previously focused element
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // Focus initial element
    const focusInitial = () => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (containerRef.current) {
        focusFirstElement(containerRef.current);
      }
    };

    // Small delay to ensure modal is rendered
    const timeoutId = setTimeout(focusInitial, 0);

    // Hide background content
    if (hideBackground) {
      hideBackgroundContent(modalId);
    }

    // Prevent body scroll
    if (preventScroll) {
      originalBodyStyles.current = preventBodyScroll();
    }

    // Cleanup
    return () => {
      clearTimeout(timeoutId);

      // Show background content
      if (hideBackground) {
        showBackgroundContent();
      }

      // Restore body scroll
      if (preventScroll && originalBodyStyles.current) {
        restoreBodyScroll(originalBodyStyles.current);
      }

      // Restore focus
      const elementToFocus = finalFocusRef?.current || previouslyFocusedElement.current;
      
      if (elementToFocus && document.body.contains(elementToFocus)) {
        // Small delay to ensure modal is removed from DOM
        setTimeout(() => {
          elementToFocus.focus();
        }, 0);
      }
    };
  }, [isOpen, initialFocusRef, finalFocusRef, preventScroll, hideBackground, modalId]);

  /**
   * Setup keyboard event listeners
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        handleTabKey(event);
      } else if (event.key === 'Escape') {
        handleEscapeKey(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleTabKey, handleEscapeKey]);

  return containerRef;
}

/**
 * Export utility functions for advanced use cases
 */
export const focusTrapUtils = {
  getFocusableElements,
  focusFirstElement,
  hideBackgroundContent,
  showBackgroundContent,
  preventBodyScroll,
  restoreBodyScroll,
};

