/**
 * Concrete Modal State Implementations
 *
 * Each class represents a specific state of the modal with its own behavior.
 */

import type { IModalContext } from './ModalState';
import { BaseModalState } from './ModalState';

// ============================================================================
// CLOSED STATE
// ============================================================================

/**
 * Closed State - Modal is not visible
 */
export class ClosedState extends BaseModalState {
  readonly type = 'closed' as const;

  open(context: IModalContext): void {
    // Transition to opening state
    const openingState = new OpeningState();
    context.setState(openingState);

    // After animation, transition to open state
    setTimeout(() => {
      if (context.currentState.type === 'opening') {
        context.setState(new OpenState());
      }
    }, 300); // Animation duration
  }

  isVisible(): boolean {
    return false;
  }

  isInteractive(): boolean {
    return false;
  }

  getClasses(): string[] {
    return ['modal-closed'];
  }
}

// ============================================================================
// OPENING STATE
// ============================================================================

/**
 * Opening State - Modal is animating in
 */
export class OpeningState extends BaseModalState {
  readonly type = 'opening' as const;

  close(context: IModalContext): void {
    // Can interrupt opening animation and close
    context.setState(new ClosingState());

    setTimeout(() => {
      if (context.currentState.type === 'closing') {
        context.setState(new ClosedState());
      }
    }, 300);
  }

  isVisible(): boolean {
    return true;
  }

  isInteractive(): boolean {
    return false; // Not interactive during animation
  }

  getClasses(): string[] {
    return ['modal-visible', 'modal-opening'];
  }
}

// ============================================================================
// OPEN STATE
// ============================================================================

/**
 * Open State - Modal is fully visible and interactive
 */
export class OpenState extends BaseModalState {
  readonly type = 'open' as const;

  close(context: IModalContext): void {
    context.setState(new ClosingState());

    setTimeout(() => {
      if (context.currentState.type === 'closing') {
        context.setState(new ClosedState());
      }
    }, 300);
  }

  confirm(context: IModalContext): void {
    if (context.data.onConfirm) {
      context.data.onConfirm();
    }
    this.close(context);
  }

  cancel(context: IModalContext): void {
    if (context.data.onCancel) {
      context.data.onCancel();
    }
    this.close(context);
  }

  startLoading(context: IModalContext, message?: string): void {
    if (message) {
      context.updateData({ loadingMessage: message });
    }
    context.setState(new LoadingState());
  }

  handleError(context: IModalContext, error: string): void {
    context.updateData({ errorMessage: error });
    context.setState(new ErrorState());
  }

  isVisible(): boolean {
    return true;
  }

  isInteractive(): boolean {
    return true;
  }

  getClasses(): string[] {
    return ['modal-visible', 'modal-open'];
  }

  handleKeyDown(context: IModalContext, event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close(context);
    } else if (event.key === 'Enter' && event.ctrlKey) {
      this.confirm(context);
    }
  }

  handleBackdropClick(context: IModalContext): void {
    this.close(context);
  }
}

// ============================================================================
// CLOSING STATE
// ============================================================================

/**
 * Closing State - Modal is animating out
 */
export class ClosingState extends BaseModalState {
  readonly type = 'closing' as const;

  // Cannot perform actions while closing
  open(context: IModalContext): void {
    console.warn('Cannot open modal while closing');
  }

  isVisible(): boolean {
    return true;
  }

  isInteractive(): boolean {
    return false;
  }

  getClasses(): string[] {
    return ['modal-visible', 'modal-closing'];
  }
}

// ============================================================================
// LOADING STATE
// ============================================================================

/**
 * Loading State - Modal is showing loading indicator
 */
export class LoadingState extends BaseModalState {
  readonly type = 'loading' as const;

  close(context: IModalContext): void {
    // Can still close during loading
    context.setState(new ClosingState());

    setTimeout(() => {
      if (context.currentState.type === 'closing') {
        context.setState(new ClosedState());
      }
    }, 300);
  }

  handleError(context: IModalContext, error: string): void {
    context.updateData({ errorMessage: error });
    context.setState(new ErrorState());
  }

  // Loading complete - return to open state
  completeLoading(context: IModalContext): void {
    context.setState(new OpenState());
  }

  isVisible(): boolean {
    return true;
  }

  isInteractive(): boolean {
    return false; // Not interactive while loading
  }

  getClasses(): string[] {
    return ['modal-visible', 'modal-open', 'modal-loading'];
  }

  handleKeyDown(context: IModalContext, event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close(context);
    }
  }
}

// ============================================================================
// ERROR STATE
// ============================================================================

/**
 * Error State - Modal is showing error message
 */
export class ErrorState extends BaseModalState {
  readonly type = 'error' as const;

  close(context: IModalContext): void {
    context.setState(new ClosingState());

    setTimeout(() => {
      if (context.currentState.type === 'closing') {
        context.setState(new ClosedState());
      }
    }, 300);
  }

  // Retry action - return to open state
  retry(context: IModalContext): void {
    context.updateData({ errorMessage: undefined });
    context.setState(new OpenState());
  }

  isVisible(): boolean {
    return true;
  }

  isInteractive(): boolean {
    return true; // Can interact with error actions
  }

  getClasses(): string[] {
    return ['modal-visible', 'modal-open', 'modal-error'];
  }

  handleKeyDown(context: IModalContext, event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close(context);
    }
  }

  handleBackdropClick(context: IModalContext): void {
    this.close(context);
  }
}
