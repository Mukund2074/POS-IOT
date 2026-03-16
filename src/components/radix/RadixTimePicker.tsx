import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { format, setHours, setMinutes } from 'date-fns';
import { MdAccessTime as TimeIcon } from 'react-icons/md';
import { cnMerge } from '../../utils/cnMerge';
import RadixTimePickerContent from './RadixTimePickerContent';

export interface RadixTimePickerProps {
    value?: Date | null;
    defaultValue?: Date;
    onChange?: (time: Date | null) => void;
    label?: string;
    placeholder?: string;
    error?: string;
    helperText?: string;
    disabled?: boolean;
    format?: string;
    minuteStep?: number;
    className?: string;
    triggerClassName?: string;
    contentClassName?: string;
}

const RadixTimePicker: React.FC<RadixTimePickerProps> = ({
    value,
    defaultValue,
    onChange,
    label,
    placeholder = 'Select time',
    error,
    helperText,
    disabled = false,
    format: timeFormat = 'HH:mm',
    minuteStep = 1,
    className,
    triggerClassName,
    contentClassName,
}) => {
    const isValidDate = (date: Date | null | undefined): date is Date => {
        return date instanceof Date && !isNaN(date.getTime());
    };

    const [open, setOpen] = React.useState(false);
    const initialValue = value || defaultValue || null;
    const [internalValue, setInternalValue] = React.useState<Date | null>(
        isValidDate(initialValue) ? initialValue : null,
    );

    React.useEffect(() => {
        if (value !== undefined) {
            if (isValidDate(value)) {
                setInternalValue(value);
            } else {
                setInternalValue(null);
            }
        }
    }, [value]);

    const handleTimeSelect = (hours: number, minutes: number, shouldClose: boolean = true) => {
        const baseDate = isValidDate(internalValue) ? internalValue : new Date();
        const newDate = setMinutes(setHours(baseDate, hours), minutes);
        setInternalValue(newDate);
        onChange?.(newDate);
        if (shouldClose) {
            setOpen(false);
        }
    };

    const displayValue = isValidDate(internalValue) ? format(internalValue, timeFormat) : '';

    const labelClasses = cnMerge('block text-sm font-medium mb-1', 'text-text-primary', 'dark:text-text-primary');

    return (
        <div className={cnMerge('w-full', className)}>
            {label && <label className={labelClasses}>{label}</label>}
            <Popover.Root open={open} onOpenChange={setOpen}>
                <Popover.Trigger asChild>
                    <button
                        type="button"
                        disabled={disabled}
                        className={cnMerge(
                            'w-full h-12 rounded-md',
                            'bg-background-paper px-4 py-2 text-sm',
                            'text-text-primary placeholder-text-secondary',
                            'outline-none focus:outline-none',
                            'focus:ring-0 focus:ring-offset-0',
                            'disabled:opacity-50 disabled:bg-background-subtle disabled:cursor-not-allowed',
                            'transition-all duration-base',
                            'dark:bg-background-paper dark:text-text-primary',
                            'flex items-center justify-between',
                            'border-solid border-border-default border-[1px]',
                            triggerClassName,
                        )}
                    >
                        <span className={internalValue ? 'text-text-primary' : 'text-text-secondary'}>
                            {displayValue || placeholder}
                        </span>
                        <TimeIcon className="w-5 h-5 text-text-secondary" />
                    </button>
                </Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content
                        className={cnMerge(
                            'bg-background-paper shadow-xl z-[10000] rounded-md',
                            'focus:outline-none',
                            'border-0',
                            'dark:bg-background-paper',
                            'w-[calc(100vw-2rem)] max-w-[240px]',
                            'sm:w-auto sm:min-w-[200px]',
                            'md:min-w-[240px]',
                            contentClassName,
                        )}
                        style={{ border: 'none' }}
                        sideOffset={8}
                    >
                        <RadixTimePickerContent
                            value={internalValue || undefined}
                            onChange={handleTimeSelect}
                            minuteStep={minuteStep}
                        />
                        <Popover.Arrow className="fill-background-paper dark:fill-background-paper" />
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
            {error && <p className={cnMerge('mt-1 text-sm text-red-500', 'dark:text-red-400')}>{error}</p>}
            {helperText && !error && (
                <p className={cnMerge('mt-1 text-sm text-text-secondary', 'dark:text-text-secondary')}>{helperText}</p>
            )}
        </div>
    );
};

RadixTimePicker.displayName = 'RadixTimePicker';

export default RadixTimePicker;
