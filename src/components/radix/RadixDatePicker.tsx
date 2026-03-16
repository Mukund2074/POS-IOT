import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import moment from 'moment';
import 'moment/locale/da';
import 'moment/locale/en-gb';
import i18next from 'i18next';
import { cnMerge } from '@/utils/cnMerge';
import RadixCalendar from './RadixCalendar';
import CalendarIcon from '@/assets/Marketing/Calendar.svg';

export interface RadixDatePickerProps {
    value?: Date | null;
    defaultValue?: Date;
    onChange?: (date: Date | null) => void;
    label?: string;
    placeholder?: string;
    error?: string;
    helperText?: string;
    disabled?: boolean;
    minDate?: Date;
    maxDate?: Date;
    format?: string;
    className?: string;
    triggerClassName?: string;
    contentClassName?: string;
    hideIcon?: boolean;
}

const RadixDatePicker: React.FC<RadixDatePickerProps> = ({
    value,
    defaultValue,
    onChange,
    label,
    placeholder = 'Select date',
    error,
    helperText,
    disabled = false,
    minDate,
    maxDate,
    format: dateFormat = 'DD/MM-YYYY',
    className,
    triggerClassName,
    contentClassName,
    hideIcon = false,
}) => {
    const [open, setOpen] = React.useState(false);

    // Get current language from i18next and set moment locale
    React.useMemo(() => {
        const lang = i18next.language || 'da';
        moment.locale(lang === 'da' ? 'da' : 'en-gb');
        return lang;
    }, []);

    // Helper to validate Date object
    const isValidDate = (date: Date | null | undefined): boolean => {
        if (!date) return false;
        return date instanceof Date && !isNaN(date.getTime());
    };

    const getInitialValue = (): Date | null => {
        if (value && isValidDate(value)) return value;
        if (defaultValue && isValidDate(defaultValue)) return defaultValue;
        return null;
    };

    const [internalValue, setInternalValue] = React.useState<Date | null>(getInitialValue());

    React.useEffect(() => {
        if (value !== undefined) {
            if (isValidDate(value)) {
                setInternalValue(value);
            } else {
                setInternalValue(null);
            }
        }
    }, [value]);

    const handleDateChange = (date: Date | null) => {
        if (isValidDate(date)) {
            setInternalValue(date);
            onChange?.(date);
        } else {
            setInternalValue(null);
            onChange?.(null);
        }
        setOpen(false);
    };

    const displayValue = internalValue && isValidDate(internalValue) ? moment(internalValue).format(dateFormat) : '';

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
                            'appearance-none',
                            'border-[1px] border-solid border-border-default dark:border-grey-600',
                            'disabled:opacity-50 disabled:bg-grey-50 disabled:cursor-not-allowed',
                            'transition-all duration-base',
                            'dark:bg-background-paper dark:text-text-primary',
                            'flex items-center justify-between',
                            triggerClassName,
                        )}
                    >
                        <span className={internalValue ? 'text-text-primary' : 'text-text-secondary'}>
                            {displayValue || placeholder}
                        </span>
                        {!hideIcon && (
                            <img
                                src={CalendarIcon}
                                alt="Calendar"
                                className="w-5 h-5 text-text-secondary "
                                style={{ filter: 'grayscale(100%) opacity(0.5)' }}
                            />
                        )}
                    </button>
                </Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content
                        className={cnMerge(
                            'bg-white dark:bg-background-paper shadow-xl p-2 z-[10000] rounded-md',
                            'focus:outline-none',
                            'border-none',
                            'w-[calc(100vw-2rem)] max-w-[280px]',
                            contentClassName,
                        )}
                        style={{ border: 'none' }}
                        sideOffset={8}
                    >
                        <RadixCalendar
                            value={internalValue || undefined}
                            onChange={handleDateChange}
                            minDate={minDate}
                            maxDate={maxDate}
                        />
                        <Popover.Arrow className="fill-white dark:fill-background-paper" />
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

RadixDatePicker.displayName = 'RadixDatePicker';

export default RadixDatePicker;
