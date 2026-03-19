/**
 * Abstract Factory Pattern Exports
 *
 * Exports all components of the Abstract Factory pattern implementation
 * for creating platform-specific UI components.
 */

// ============================================================================
// CORE INTERFACES AND TYPES
// ============================================================================

export type {
  IButton,
  IButtonProps,
  ICheckbox,
  ICheckboxProps,
  IInput,
  IInputProps,
  IUIComponent,
} from './UIComponent';

export { BaseUIFactory } from './UIFactory';
export type { IUIFactory, Platform } from './UIFactory';

// ============================================================================
// CONCRETE FACTORIES
// ============================================================================

export { DesktopFactory } from './DesktopFactory';
export { MobileFactory } from './MobileFactory';
export { WebFactory } from './WebFactory';

// ============================================================================
// CONCRETE COMPONENTS
// ============================================================================

// Web Components
export { WebButton, WebCheckbox, WebInput } from './WebComponents';

// Mobile Components
export { MobileButton, MobileCheckbox, MobileInput } from './MobileComponents';

// Desktop Components
export { DesktopButton, DesktopCheckbox, DesktopInput } from './DesktopComponents';

// ============================================================================
// FACTORY PROVIDER
// ============================================================================

export {
  FactoryProvider,
  getCurrentPlatform,
  getFactory,
  getFactoryForPlatform,
} from './FactoryProvider';

// ============================================================================
// EXAMPLES
// ============================================================================

// Examples file not yet created
// export {
//   basicFactoryExample,
//   componentInteractionExample,
//   crossPlatformExample,
//   factoryProviderExample,
//   formCreationExample,
//   platformFeaturesExample,
//   runAllExamples,
//   themeCustomizationExample,
// } from './examples';
