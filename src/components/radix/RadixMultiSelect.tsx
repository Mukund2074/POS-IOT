import * as React from 'react';
import * as Select from '@radix-ui/react-select';
import { cnMerge } from '../../utils/cnMerge';
import RadixCheckbox from './RadixCheckbox';
import ChevronRight from '@/assets/Marketing/ChevronRight.svg';

export interface RadixMultiSelectOption {
    label: string;
    value: string;
    disabled?: boolean;
}

export interface RadixMultiSelectProps {
    options: RadixMultiSelectOption[];
    selectedValues: Set<string>;
    onSelectionChange: (selectedValues: Set<string>) => void;
    placeholder?: string;
    selectAllLabel?: string;
    disabled?: boolean;
    className?: string;
    triggerClassName?: string;
    contentClassName?: string;
    maxHeight?: string;
    textToDisplayWithCount?: string;
    showSelectAll?: boolean;
    hideCount?: boolean;
}

const RadixMultiSelect: React.FC<RadixMultiSelectProps> = ({
    options,
    selectedValues,
    onSelectionChange,
    placeholder = 'Select...',
    selectAllLabel = 'Select All',
    disabled = false,
    className,
    triggerClassName,
    contentClassName,
    maxHeight = '400px',
    showSelectAll = true,
    textToDisplayWithCount = 'selected',
    hideCount = false,
}) => {
    const allSelected =
        options.length > 0 && options.every((option) => option.disabled || selectedValues.has(option.value));

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allValues = new Set(options.filter((opt) => !opt.disabled).map((opt) => opt.value));
            onSelectionChange(allValues);
        } else {
            onSelectionChange(new Set());
        }
    };

    const handleSelectOption = (value: string, checked: boolean) => {
        const newSelection = new Set(selectedValues);
        if (checked) {
            newSelection.add(value);
        } else {
            newSelection.delete(value);
        }
        onSelectionChange(newSelection);
    };

    const selectedCount = selectedValues.size;
    const displayText =
        selectedCount === 0
            ? placeholder
            : selectedCount === 1
              ? options.find((opt) => opt.value === Array.from(selectedValues)[0])?.label
              : hideCount
                ? textToDisplayWithCount
                : `${selectedCount} ${textToDisplayWithCount || 'selected'}`;

    return (
        <Select.Root>
            <Select.Trigger
                disabled={disabled}
                className={cnMerge(
                    'group inline-flex items-center justify-between h-10',
                    'px-4 py-2 rounded-md',
                    'md:max-w-[200px]',
                    'bg-background-paper border-[1px] border-solid border-border-default',
                    'text-text-primary shadow-sm',
                    'hover:bg-grey-50 focus:outline-none focus:ring-none',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'dark:bg-background-paper dark:text-text-primary',
                    'dark:border-border-default dark:hover:bg-grey-800',
                    className,
                    triggerClassName,
                )}
            >
                <span className="truncate max-w-full md:max-w-[150px]">{displayText}</span>
                <Select.Icon className={cnMerge('ml-2', 'dark:text-text-primary')}>
                    <img
                        src={ChevronRight}
                        alt="Chevron Right"
                        className="w-4 h-4 text-text-primary transition-transform duration-200 dark:text-text-primary rotate-90 group-data-[state=open]:rotate-[270deg]"
                    />
                </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
                <Select.Content
                    className={cnMerge(
                        'overflow-hidden rounded-md shadow-lg',
                        'bg-background-paper border-[1px] border-solid border-border-default',
                        'z-[10000]',
                        'dark:bg-background-paper dark:border-border-default',
                        contentClassName,
                    )}
                    position="popper"
                    sideOffset={4}
                >
                    <Select.Viewport className="p-1 overflow-y-auto" style={{ maxHeight }}>
                        {/* Select All Option */}
                        {showSelectAll && (
                            <>
                                <div
                                    className="px-4 py-2 hover:bg-grey-50 dark:hover:bg-grey-800 cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Only trigger if clicking directly on the div (not on checkbox or label)
                                        const target = e.target as HTMLElement;
                                        const isCheckboxOrLabel =
                                            target.closest('label') || target.closest('[data-radix-checkbox-root]');
                                        if (!isCheckboxOrLabel) {
                                            handleSelectAll(!allSelected);
                                        }
                                    }}
                                >
                                    <RadixCheckbox
                                        checked={allSelected}
                                        onChange={(checked) => handleSelectAll(checked as boolean)}
                                        label={selectAllLabel}
                                    />
                                </div>
                                <div className="h-px bg-border-default my-1 dark:bg-border-default" />
                            </>
                        )}

                        {/* Options */}
                        {options.map((option) => {
                            const isSelected = selectedValues.has(option.value);
                            return (
                                <div
                                    key={option.value}
                                    className={cnMerge(
                                        'px-4 py-2 hover:bg-grey-50 dark:hover:bg-grey-800 cursor-pointer',
                                        option.disabled && 'opacity-50 cursor-not-allowed',
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (option.disabled) return;
                                        // Only trigger if clicking directly on the div (not on checkbox or label)
                                        const target = e.target as HTMLElement;
                                        const isCheckboxOrLabel =
                                            target.closest('label') || target.closest('[data-radix-checkbox-root]');
                                        if (!isCheckboxOrLabel) {
                                            handleSelectOption(option.value, !isSelected);
                                        }
                                    }}
                                >
                                    <RadixCheckbox
                                        checked={isSelected}
                                        onChange={(checked) =>
                                            !option.disabled && handleSelectOption(option.value, checked as boolean)
                                        }
                                        label={option.label}
                                        disabled={option.disabled}
                                    />
                                </div>
                            );
                        })}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
};

RadixMultiSelect.displayName = 'RadixMultiSelect';

export default RadixMultiSelect;
