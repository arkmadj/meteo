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

export type { IUIFactory, Platform } from './UIFactory';
export { BaseUIFactory } from './UIFactory';

// ============================================================================
// CONCRETE FACTORIES
// ============================================================================

export { WebFactory } from './WebFactory';
export { MobileFactory } from './MobileFactory';
export { DesktopFactory } from './DesktopFactory';

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

export {
  basicFactoryExample,
  componentInteractionExample,
  crossPlatformExample,
  factoryProviderExample,
  formCreationExample,
  platformFeaturesExample,
  runAllExamples,
  themeCustomizationExample,
} from './examples';
