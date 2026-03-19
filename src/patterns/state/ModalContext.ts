/**
 * Modal Context Manager
 *
 * Manages the modal state machine and provides a clean API for state transitions.
 */

import type { IModalContext, IModalData, IModalState, ModalStateType } from './ModalState';
import { ClosedState } from './ModalStates';

// ============================================================================
// MODAL CONTEXT IMPLEMENTATION
// ============================================================================

/**
 * Modal Context Manager
 * Implements the context that holds the current state and manages transitions
 */
export class ModalContext implements IModalContext {
  private _currentState: IModalState;
  private _data: IModalData;
  private _onStateChange?: (oldState: ModalStateType, newState: ModalStateType) => void;

  constructor(
    initialData: IModalData = {},
    onStateChange?: (oldState: ModalStateType, newState: ModalStateType) => void
  ) {
    this._currentState = new ClosedState();
    this._data = initialData;
    this._onStateChange = onStateChange;
  }

  // ========================================================================
  // GETTERS
  // ========================================================================

  get currentState(): IModalState {
    return this._currentState;
  }

  get data(): IModalData {
    return this._data;
  }

  get stateType(): ModalStateType {
    return this._currentState.type;
  }

  get onStateChange(): ((oldState: ModalStateType, newState: ModalStateType) => void) | undefined {
    return this._onStateChange;
  }

  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================

  setState(state: IModalState): void {
    const oldState = this._currentState.type;
    const newState = state.type;

    this._currentState = state;

    // Notify listeners of state change
    if (this._onStateChange && oldState !== newState) {
      this._onStateChange(oldState, newState);
    }
  }

  updateData(data: Partial<IModalData>): void {
    this._data = { ...this._data, ...data };
  }

  setData(data: IModalData): void {
    this._data = data;
  }

  // ========================================================================
  // CONVENIENCE METHODS (Delegate to current state)
  // ========================================================================

  open(): void {
    this._currentState.open(this);
  }

  close(): void {
    this._currentState.close(this);
  }

  confirm(): void {
    this._currentState.confirm(this);
  }

  cancel(): void {
    this._currentState.cancel(this);
  }

  startLoading(message?: string): void {
    this._currentState.startLoading(this, message);
  }

  handleError(error: string): void {
    this._currentState.handleError(this, error);
  }

  handleKeyDown(event: KeyboardEvent): void {
    this._currentState.handleKeyDown(this, event);
  }

  handleBackdropClick(): void {
    this._currentState.handleBackdropClick(this);
  }

  // ========================================================================
  // STATE QUERIES
  // ========================================================================

  isVisible(): boolean {
    return this._currentState.isVisible();
  }

  isInteractive(): boolean {
    return this._currentState.isInteractive();
  }

  getClasses(): string[] {
    return this._currentState.getClasses();
  }

  isClosed(): boolean {
    return this._currentState.type === 'closed';
  }

  isOpen(): boolean {
    return this._currentState.type === 'open';
  }

  isLoading(): boolean {
    return this._currentState.type === 'loading';
  }

  isError(): boolean {
    return this._currentState.type === 'error';
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  reset(): void {
    this._currentState = new ClosedState();
    this._data = {};
  }
}
