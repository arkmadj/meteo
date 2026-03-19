/**
 * State Pattern Exports
 *
 * Exports all components of the State pattern implementation
 * for managing modal states.
 */

// Core interfaces and types
export { BaseModalState } from './ModalState';
export type { IModalContext, IModalData, IModalState, ModalStateType } from './ModalState';

// Concrete state implementations
export {
  ClosedState,
  ClosingState,
  ErrorState,
  LoadingState,
  OpenState,
  OpeningState,
} from './ModalStates';

// Context manager
export { ModalContext } from './ModalContext';

// React hook
export { useModalState } from './useModalState';
export type { UseModalStateOptions, UseModalStateReturn } from './useModalState';

// Examples file not yet created
// export { BasicModalExample, ConfirmationModalExample, LoadingErrorModalExample } from './examples';
