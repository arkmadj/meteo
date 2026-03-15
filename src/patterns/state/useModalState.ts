/**
 * React Hook for Modal State Pattern
 *
 * Provides a React-friendly interface to the modal state machine.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { ModalContext } from './ModalContext';
import type { IModalData, ModalStateType } from './ModalState';

// ============================================================================
// TYPES
// ============================================================================

export interface UseModalStateOptions {
  /** Initial modal data */
  initialData?: IModalData;
  /** Callback when state changes */
  onStateChange?: (oldState: ModalStateType, newState: ModalStateType) => void;
  /** Callback when modal opens */
  onOpen?: () => void;
  /** Callback when modal closes */
  onClose?: () => void;
  /** Callback when loading starts */
  onLoadingStart?: () => void;
  /** Callback when error occurs */
  onError?: (error: string) => void;
}

export interface UseModalStateReturn {
  /** Current state type */
  stateType: ModalStateType;
  /** Modal data */
  data: IModalData;
  /** Whether modal is visible */
  isVisible: boolean;
  /** Whether modal is interactive */
  isInteractive: boolean;
  /** CSS classes for current state */
  classes: string[];
  /** Open the modal */
  open: () => void;
  /** Close the modal */
  close: () => void;
  /** Confirm action */
  confirm: () => void;
  /** Cancel action */
  cancel: () => void;
  /** Start loading */
  startLoading: (message?: string) => void;
  /** Handle error */
  handleError: (error: string) => void;
  /** Update modal data */
  updateData: (data: Partial<IModalData>) => void;
  /** Handle keyboard events */
  handleKeyDown: (event: KeyboardEvent) => void;
  /** Handle backdrop click */
  handleBackdropClick: () => void;
  /** Reset to initial state */
  reset: () => void;
  /** Get the modal context (for advanced usage) */
  getContext: () => ModalContext;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for managing modal state using the State pattern
 *
 * @example
 * ```tsx
 * const modal = useModalState({
 *   initialData: { title: 'Confirm Action' },
 *   onOpen: () => console.log('Modal opened'),
 *   onClose: () => console.log('Modal closed'),
 * });
 *
 * return (
 *   <div>
 *     <button onClick={modal.open}>Open Modal</button>
 *     {modal.isVisible && (
 *       <div className={modal.classes.join(' ')}>
 *         <h2>{modal.data.title}</h2>
 *         <button onClick={modal.confirm}>Confirm</button>
 *         <button onClick={modal.cancel}>Cancel</button>
 *       </div>
 *     )}
 *   </div>
 * );
 * ```
 */
export function useModalState(options: UseModalStateOptions = {}): UseModalStateReturn {
  const { initialData = {}, onStateChange, onOpen, onClose, onLoadingStart, onError } = options;

  // Create modal context (only once)
  const contextRef = useRef<ModalContext | null>(null);
  if (!contextRef.current) {
    contextRef.current = new ModalContext(initialData, onStateChange);
  }

  // Force re-render when state changes
  const [, forceUpdate] = useState({});
  const rerender = useCallback(() => forceUpdate({}), []);

  // Get current context
  const context = contextRef.current;

  // Track previous state for lifecycle callbacks
  const prevStateRef = useRef<ModalStateType>(context.stateType);

  // Handle state change callbacks
  useEffect(() => {
    const currentState = context.stateType;
    const prevState = prevStateRef.current;

    if (currentState !== prevState) {
      // Handle open callback
      if (currentState === 'open' && prevState !== 'open') {
        onOpen?.();
      }

      // Handle close callback
      if (currentState === 'closed' && prevState !== 'closed') {
        onClose?.();
      }

      // Handle loading callback
      if (currentState === 'loading' && prevState !== 'loading') {
        onLoadingStart?.();
      }

      // Handle error callback
      if (currentState === 'error' && prevState !== 'error') {
        onError?.(context.data.errorMessage || 'An error occurred');
      }

      prevStateRef.current = currentState;
    }
  }, [context, onOpen, onClose, onLoadingStart, onError]);

  // Wrap methods to trigger re-render
  const open = useCallback(() => {
    context.open();
    rerender();
  }, [context, rerender]);

  const close = useCallback(() => {
    context.close();
    rerender();
  }, [context, rerender]);

  const confirm = useCallback(() => {
    context.confirm();
    rerender();
  }, [context, rerender]);

  const cancel = useCallback(() => {
    context.cancel();
    rerender();
  }, [context, rerender]);

  const startLoading = useCallback(
    (message?: string) => {
      context.startLoading(message);
      rerender();
    },
    [context, rerender]
  );

  const handleError = useCallback(
    (error: string) => {
      context.handleError(error);
      rerender();
    },
    [context, rerender]
  );

  const updateData = useCallback(
    (data: Partial<IModalData>) => {
      context.updateData(data);
      rerender();
    },
    [context, rerender]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      context.handleKeyDown(event);
      rerender();
    },
    [context, rerender]
  );

  const handleBackdropClick = useCallback(() => {
    context.handleBackdropClick();
    rerender();
  }, [context, rerender]);

  const reset = useCallback(() => {
    context.reset();
    rerender();
  }, [context, rerender]);

  const getContext = useCallback(() => context, [context]);

  return {
    stateType: context.stateType,
    data: context.data,
    isVisible: context.isVisible(),
    isInteractive: context.isInteractive(),
    classes: context.getClasses(),
    open,
    close,
    confirm,
    cancel,
    startLoading,
    handleError,
    updateData,
    handleKeyDown,
    handleBackdropClick,
    reset,
    getContext,
  };
}
