/**
 * Molecule Components Barrel Export
 * Centralized export of all molecule components for easy importing
 */

// Import styles
import './styles/AccessibleComponents.css';

// Accessible Dropdown Component
export {
  default as AccessibleDropdown,
  type DropdownOption,
  type DropdownProps,
  type DropdownRef,
} from './AccessibleDropdown';

// Accessible Modal Components
export {
  default as AccessibleModal,
  AlertModal,
  ConfirmationModal,
  useModal,
  type AlertModalProps,
  type ConfirmationModalProps,
  type ModalProps,
  type ModalRef,
  type ModalSize,
  type ModalVariant,
  type UseModalReturn,
} from './AccessibleModal';

// Type-Safe Form Components
export {
  TypeSafeCheckbox,
  TypeSafeSelect,
  TypeSafeTextInput,
  ValidationRules,
  useForm,
  type FormErrors,
  type FormFieldProps,
  type FormTouched,
  type TypeSafeCheckboxProps,
  type TypeSafeSelectProps,
  type TypeSafeTextInputProps,
  type UseFormOptions,
  type UseFormReturn,
  type ValidationRule,
} from './TypeSafeFormComponents';
