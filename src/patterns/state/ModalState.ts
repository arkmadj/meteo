/**
 * State Pattern Implementation for Modal Management
 *
 * This implementation demonstrates the State pattern for managing modal states.
 * Each state encapsulates its own behavior and transitions.
 *
 * States:
 * - Closed: Modal is not visible
 * - Opening: Modal is animating in
 * - Open: Modal is fully visible and interactive
 * - Closing: Modal is animating out
 * - Loading: Modal is showing loading state
 * - Error: Modal is showing error state
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Modal state types
 */
export type ModalStateType = 'closed' | 'opening' | 'open' | 'closing' | 'loading' | 'error';

/**
 * Modal data that can be passed between states
 */
export interface IModalData {
  title?: string;
  content?: React.ReactNode;
  errorMessage?: string;
  loadingMessage?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  metadata?: Record<string, unknown>;
}

/**
 * Modal context that maintains state and data
 */
export interface IModalContext {
  currentState: IModalState;
  data: IModalData;
  setState: (state: IModalState) => void;
  updateData: (data: Partial<IModalData>) => void;
  onStateChange?: (oldState: ModalStateType, newState: ModalStateType) => void;
}

/**
 * Base interface for all modal states
 */
export interface IModalState {
  readonly type: ModalStateType;

  /**
   * Open the modal
   */
  open(context: IModalContext): void;

  /**
   * Close the modal
   */
  close(context: IModalContext): void;

  /**
   * Confirm action (for confirmation modals)
   */
  confirm(context: IModalContext): void;

  /**
   * Cancel action (for confirmation modals)
   */
  cancel(context: IModalContext): void;

  /**
   * Start loading state
   */
  startLoading(context: IModalContext, message?: string): void;

  /**
   * Handle error
   */
  handleError(context: IModalContext, error: string): void;

  /**
   * Check if modal is visible
   */
  isVisible(): boolean;

  /**
   * Check if modal is interactive
   */
  isInteractive(): boolean;

  /**
   * Get state-specific CSS classes
   */
  getClasses(): string[];

  /**
   * Handle keyboard events (ESC, Enter, etc.)
   */
  handleKeyDown(context: IModalContext, event: KeyboardEvent): void;

  /**
   * Handle backdrop click
   */
  handleBackdropClick(context: IModalContext): void;
}

/**
 * Abstract base class for modal states
 * Provides default implementations that can be overridden
 */
export abstract class BaseModalState implements IModalState {
  abstract readonly type: ModalStateType;

  open(context: IModalContext): void {
    console.warn(`Cannot open modal from ${this.type} state`);
  }

  close(context: IModalContext): void {
    console.warn(`Cannot close modal from ${this.type} state`);
  }

  confirm(context: IModalContext): void {
    console.warn(`Cannot confirm from ${this.type} state`);
  }

  cancel(context: IModalContext): void {
    console.warn(`Cannot cancel from ${this.type} state`);
  }

  startLoading(context: IModalContext, message?: string): void {
    console.warn(`Cannot start loading from ${this.type} state`);
  }

  handleError(context: IModalContext, error: string): void {
    console.warn(`Cannot handle error from ${this.type} state`);
  }

  abstract isVisible(): boolean;
  abstract isInteractive(): boolean;
  abstract getClasses(): string[];

  handleKeyDown(context: IModalContext, event: KeyboardEvent): void {
    // Default: do nothing
  }

  handleBackdropClick(context: IModalContext): void {
    // Default: do nothing
  }
}
