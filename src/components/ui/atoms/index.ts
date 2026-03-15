/**
 * Atom Components Barrel Export
 * Centralized export of all atom components for easy importing
 */

export { default as AccentColorPicker } from './AccentColorPicker';
export { default as AccessibleVirtualList } from './AccessibleVirtualList';
export { default as Button } from './Button';
export { default as Card, CardBody, CardFooter, CardHeader } from './Card';
export { default as Checkbox } from './Checkbox';
export { default as CheckboxGroup } from './CheckboxGroup';
export { default as Dropdown } from './Dropdown';
export { default as FABSpeedDial } from './FABSpeedDial';
export { default as FloatingActionButton } from './FloatingActionButton';
export { default as Icon } from './Icon';
export { default as Input } from './Input';
export { default as Label } from './Label';
export { default as NativeSelect } from './NativeSelect';
export { default as Radio } from './Radio';
export { default as RadioGroup } from './RadioGroup';
export { default as SearchInput } from './SearchInput';
export { default as Select } from './Select';
export { default as Switch } from './Switch';
export { default as Table } from './Table';
export { default as Textarea } from './Textarea';
export { default as VirtualizedTable } from './VirtualizedTable';

// Re-export types for convenience
export type { AccentColorPickerProps } from './AccentColorPicker';
export type { AccessibleVirtualListProps } from './AccessibleVirtualList';
export type { ButtonProps, ButtonSize, ButtonVariant } from './Button';
export type {
  CardBodyProps,
  CardFooterProps,
  CardHeaderProps,
  CardPadding,
  CardProps,
  CardShadow,
  CardSize,
  CardVariant,
} from './Card';
export type { CheckboxProps, CheckboxSize } from './Checkbox';
export type { CheckboxGroupOption, CheckboxGroupProps, CheckboxGroupSize } from './CheckboxGroup';
export type {
  DropdownItem,
  DropdownPlacement,
  DropdownProps,
  DropdownSize,
  DropdownVariant,
} from './Dropdown';
export type { FABSpeedDialProps, SpeedDialAction } from './FABSpeedDial';
export type {
  FABPosition,
  FABSize,
  FABVariant,
  FloatingActionButtonProps,
} from './FloatingActionButton';
export type { IconColor, IconName, IconProps, IconSize } from './Icon';
export type { InputProps, InputSize, InputType, InputVariant } from './Input';
export type { LabelProps, LabelSize, LabelVariant } from './Label';
export type {
  NativeSelectOption,
  NativeSelectProps,
  NativeSelectSize,
  NativeSelectVariant,
} from './NativeSelect';
export type { RadioProps, RadioSize } from './Radio';
export type { RadioGroupOption, RadioGroupProps, RadioGroupSize } from './RadioGroup';
export type { SearchInputProps, SearchInputSize, SearchInputVariant } from './SearchInput';
export type { SelectOption, SelectProps, SelectSize, SelectVariant } from './Select';
export type { SwitchProps, SwitchSize, SwitchVariant } from './Switch';
export type {
  TableColumn,
  TableDensity,
  TableProps,
  TableRow,
  TableSize,
  TableVariant,
} from './Table';
export type { TextareaProps, TextareaResize, TextareaSize, TextareaVariant } from './Textarea';
export type { VirtualizedTableProps, VirtualizedTableRef } from './VirtualizedTable';

// Common types used across atom components
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ComponentVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';
