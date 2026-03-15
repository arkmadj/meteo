/**
 * State Pattern Exports
 * 
 * Exports all components of the State pattern implementation
 * for managing modal states.
 */

// Core interfaces and types
export type { IModalState, IModalContext, IModalData, ModalStateType } from './ModalState';
export { BaseModalState } from './ModalState';

// Concrete state implementations
export {
  ClosedState,
  OpeningState,
  OpenState,
  ClosingState,
  LoadingState,
  ErrorState,
} from './ModalStates';

// Context manager
export { ModalContext } from './ModalContext';

// React hook
export { useModalState } from './useModalState';
export type { UseModalStateOptions, UseModalStateReturn } from './useModalState';

// Examples
export {
  BasicModalExample,
  ConfirmationModalExample,
  LoadingErrorModalExample,
} from './examples';

