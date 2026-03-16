import * as React from 'react';
import * as Select from '@radix-ui/react-select';
import { Check } from '@mui/icons-material';
import { cnMerge } from '../../utils/cnMerge';
import { t } from 'i18next';
import ChevronRight from '@/assets/Marketing/ChevronRight.svg';
import RadixSpinner from './RadixSpinner';

export interface RadixSelectOption {
    label: string;
    value: string;
    disabled?: boolean;
    description?: string;
}

export interface RadixSelectProps {
    options: RadixSelectOption[];
    placeholder?: string | React.ReactNode;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onClick?: () => void;
    onPointerDown?: () => void;
    className?: string;
    triggerClassName?: string;
    contentClassName?: string;
    itemClassName?: string;
    hideIcon?: boolean;
    isLoading?: boolean;
}

const RadixSelect: React.FC<RadixSelectProps> = ({
    options,
    placeholder = t('Common.Select'),
    value,
    defaultValue,
    onValueChange,
    disabled = false,
    open,
    onOpenChange,
    onClick,
    onPointerDown,
    className,
    triggerClassName,
    contentClassName,
    itemClassName,
    hideIcon = false,
    isLoading = false,
}) => {
    return (
        <Select.Root
            value={value}
            defaultValue={defaultValue}
            onValueChange={onValueChange}
            disabled={disabled}
            open={open}
            onOpenChange={onOpenChange}
        >
            <Select.Trigger
                onClick={onClick}
                onPointerDown={onPointerDown}
                className={cnMerge(
                    'w-full h-10',
                    'cursor-pointer',
                    'group inline-flex items-center justify-between',
                    'px-4 py-2 rounded-md',
                    'border-[1px] border-solid border-border-default',
                    'bg-background-paper',
                    'text-text-primary shadow-sm',
                    'hover:bg-grey-50 focus:outline-none focus:ring-none',
                    disabled && !triggerClassName?.includes('opacity')
                        ? 'disabled:opacity-50 '
                        : 'disabled:cursor-not-allowed',
                    'dark:bg-background-paper dark:text-text-primary',
                    'dark:hover:bg-grey-800',
                    className,
                    triggerClassName,
                )}
            >
                <Select.Value placeholder={placeholder} />
                {isLoading && (
                    <span className="mx-2  flex items-center gap-2">
                        <RadixSpinner size="sm" variant="primary" className="inline-flex" />
                        <span className="text-sm text-text-primary">{t('Common.Loading')}</span>
                    </span>
                )}
                {!hideIcon && (
                    <Select.Icon
                        className={cnMerge('ml-2', 'w-4 h-4 dark:text-text-primary flex items-center justify-center')}
                    >
                        <img
                            src={ChevronRight}
                            alt="Chevron Right"
                            className="transition-transform duration-200 rotate-90 group-data-[state=open]:rotate-[270deg]  filter brightness-0"
                        />
                    </Select.Icon>
                )}
            </Select.Trigger>

            <Select.Portal>
                <Select.Content
                    className={cnMerge(
                        'overflow-hidden rounded-md shadow-lg',
                        'bg-background-paper',
                        'z-[10000]',
                        'dark:bg-background-paper',
                        contentClassName,
                    )}
                    position="popper"
                    sideOffset={4}
                >
                    <Select.Viewport className="p-1 max-h-[300px] overflow-y-auto">
                        {options.map((option) => {
                            return (
                                <Select.Item
                                    key={option.value}
                                    value={option.value}
                                    disabled={option.disabled}
                                    className={cnMerge(
                                        'relative flex px-4 py-2 rounded-md',
                                        option.description ? 'flex-col items-start' : 'items-center',
                                        'text-text-primary cursor-pointer select-none',
                                        'focus:outline-none',
                                        'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
                                        // Selected state - always applied when checked
                                        'data-[state=checked]:bg-primary-50 data-[state=checked]:dark:bg-primary-900/20',
                                        // Hover state - only when not selected
                                        'hover:bg-grey-50 hover:dark:bg-grey-800',
                                        // Hover state for selected items - maintain selected background
                                        'data-[state=checked]:hover:bg-primary-50 data-[state=checked]:hover:dark:bg-primary-900/20',
                                        // Focus state - only when not selected
                                        'focus:bg-grey-50 focus:dark:bg-grey-800',
                                        // Focus state for selected items - maintain selected background
                                        'data-[state=checked]:focus:bg-primary-50 data-[state=checked]:focus:dark:bg-primary-900/20',
                                        'dark:text-text-primary',
                                        itemClassName,
                                    )}
                                >
                                    <Select.ItemText>{option.label}</Select.ItemText>
                                    {option.description && (
                                        <span className="text-xs text-text-secondary line-clamp-1">
                                            {option.description}
                                        </span>
                                    )}
                                    <Select.ItemIndicator className="hidden">
                                        <Check className="w-4 h-4 text-primary-500" />
                                    </Select.ItemIndicator>
                                </Select.Item>
                            );
                        })}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
};

RadixSelect.displayName = 'RadixSelect';

export default RadixSelect;
