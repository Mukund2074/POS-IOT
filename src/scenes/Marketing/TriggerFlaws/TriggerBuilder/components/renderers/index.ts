// Condition-specific renderers
// Each condition ID can have its own custom renderer component
// To add a new condition renderer:
// 1. Create a new component file (e.g., ConditionXInput.tsx)
// 2. Export it from this index file
// 3. Import and add a case in ConditionRenderer.tsx

// Condition renderers
// Note: Condition input components no longer export ref types as they use the common conditionRef prop pattern
export { default as DateRangeInput } from './DateRangeInput';
export { default as PostalCodeInput } from './PostalCodeInput';
export { default as BirthdayInput } from './BirthdayInput';
export { default as AgeRangeInput } from './AgeRangeInput';
export { default as DaysRangeInput } from './DaysRangeInput';
export { default as ActiveBookingServiceInput } from './ActiveBookingServiceInput';
export { default as ProductMultiSelect } from './ProductMultiSelect';
export { default as ProductCategoryMultiSelect } from './ProductCategoryMultiSelect';
export { default as RevenueThresholdInput } from './RevenueThresholdInput';
export { default as GiftCardBalanceInput } from './GiftCardBalanceInput';
export { default as ClipCardBalanceInput } from './ClipCardBalanceInput';
export { default as CommunicationInput } from './CommunicationInput';

// Form components
export { default as TriggerSettingForm } from './TriggerSettingForm';
export { default as ContentBoxForm } from './ContentBoxForm';
