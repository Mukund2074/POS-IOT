import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import moment from 'moment';
import 'moment/locale/da';
import 'moment/locale/en-gb';
import i18next from 'i18next';
import { cnMerge } from '../../utils/cnMerge';
import { t } from 'i18next';
import RadixCalendar from './RadixCalendar';
import RadixTimePickerContent from './RadixTimePickerContent';
import CalendarIcon from '@/assets/Marketing/Calendar.svg';

export interface RadixDateTimePickerProps {
    value?: Date | null;
    defaultValue?: Date;
    onChange?: (dateTime: Date | null) => void;
    label?: string;
    placeholder?: string;
    error?: string;
    helperText?: string;
    disabled?: boolean;
    minDate?: Date;
    maxDate?: Date;
    dateFormat?: string;
    timeFormat?: string;
    minuteStep?: number;
    minuteSelectable?: boolean;
    className?: string;
    triggerClassName?: string;
    contentClassName?: string;
    iconClassName?: string;
    iconStyle?: React.CSSProperties;
}

const RadixDateTimePicker: React.FC<RadixDateTimePickerProps> = ({
    value,
    defaultValue,
    onChange,
    label,
    placeholder = t('Marketing.EmailCampaignsSelectDateTime'),
    error,
    helperText,
    disabled = false,
    minDate,
    maxDate,
    dateFormat = 'DD/MM-YYYY',
    timeFormat = 'HH:mm',
    minuteStep = 1,
    minuteSelectable = true,
    className,
    triggerClassName,
    contentClassName,
    iconClassName,
    iconStyle,
}) => {
    const [open, setOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState<Date | null>(value || defaultValue || null);
    const [activeTab, setActiveTab] = React.useState<'date' | 'time'>('date');

    // Get current language from i18next and set moment locale
    React.useMemo(() => {
        const lang = i18next.language || 'da';
        moment.locale(lang === 'da' ? 'da' : 'en-gb');
        return lang;
    }, []);

    React.useEffect(() => {
        if (value !== undefined) {
            setInternalValue(value);
        }
    }, [value]);

    const handleDateChange = (date: Date | null) => {
        if (date) {
            const newDate = internalValue
                ? moment(date)
                      .hour(moment(internalValue).hour())
                      .minute(moment(internalValue).minute())
                      .second(0)
                      .millisecond(0)
                      .toDate()
                : date;
            setInternalValue(newDate);
            onChange?.(newDate);
        }
    };

    const handleTimeSelect = (hours: number, minutes: number) => {
        const baseDate = internalValue || moment().toDate();
        const newDate = moment(baseDate).hour(hours).minute(minutes).second(0).millisecond(0).toDate();
        setInternalValue(newDate);
        onChange?.(newDate);
    };

    const displayValue = internalValue
        ? `${moment(internalValue).format(dateFormat)} ${
              minuteSelectable ? moment(internalValue).format(timeFormat) : `${moment(internalValue).format('HH')}:00`
          }`
        : '';

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
                            'flex items-center justify-between',
                            'rounded-md h-12 w-full min-w-[200px]',
                            'bg-background-paper px-4 py-2 text-sm',
                            'text-text-primary placeholder-text-secondary',
                            'outline-none focus:outline-none',
                            'focus:ring-0 focus:ring-offset-0',
                            'appearance-none',
                            'border-[1px] border-solid border-border-default',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            'cursor-pointer',
                            'transition-all duration-base',
                            'dark:text-text-primary',
                            className,
                        )}
                    >
                        <span className={internalValue ? 'text-text-primary' : 'text-text-secondary'}>
                            {displayValue || placeholder}
                        </span>
                        <img
                            src={CalendarIcon}
                            alt="Calendar"
                            className={cnMerge('w-5 h-5', ' text-text-secondary', iconClassName)}
                            // grayscale filter
                            style={{ filter: disabled ? 'grayscale(100%) opacity(0.5)' : 'none', ...iconStyle }}
                        />
                    </button>
                </Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content
                        className={cnMerge(
                            'bg-white dark:bg-background-paper shadow-xl z-[10000] rounded-md',
                            'focus:outline-none',
                            'border-0',
                            'w-[calc(100vw-2rem)] max-w-[360px]',
                            'sm:w-auto sm:min-w-[320px]',
                            'md:min-w-[360px]',
                            contentClassName,
                        )}
                        style={{ border: 'none' }}
                        sideOffset={8}
                    >
                        {/* Tabs */}
                        <div className="flex border-b-0">
                            <button
                                type="button"
                                onClick={() => setActiveTab('date')}
                                className={cnMerge(
                                    'flex-1 px-2 py-2 md:px-4 md:py-3 text-xs md:text-sm font-semibold cursor-pointer bg-transparent border-0 transition-all duration-200 rounded-md',
                                    'relative',
                                    activeTab === 'date'
                                        ? 'text-primary-500'
                                        : 'text-text-secondary hover:text-text-primary',
                                )}
                            >
                                {t('Common.Date')}
                                {activeTab === 'date' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('time')}
                                className={cnMerge(
                                    'flex-1 px-2 py-2 md:px-4 md:py-3 text-xs md:text-sm font-semibold cursor-pointer bg-transparent border-0 transition-all duration-200 rounded-md',
                                    'relative',
                                    activeTab === 'time'
                                        ? 'text-primary-500'
                                        : 'text-text-secondary hover:text-text-primary ',
                                )}
                            >
                                {t('Common.Time')}
                                {activeTab === 'time' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
                                )}
                            </button>
                        </div>

                        {/* Date Picker */}
                        {activeTab === 'date' && (
                            <div className="p-2 md:p-3">
                                <RadixCalendar
                                    value={internalValue || undefined}
                                    onChange={handleDateChange}
                                    minDate={minDate}
                                    maxDate={maxDate}
                                />
                            </div>
                        )}

                        {/* Time Picker */}
                        {activeTab === 'time' && (
                            <RadixTimePickerContent
                                value={internalValue || undefined}
                                onChange={handleTimeSelect}
                                minuteStep={minuteStep}
                                minuteSelectable={minuteSelectable}
                            />
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 p-2 md:p-3 border-t-0">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm hover:text-primary-500 cursor-pointer bg-transparent border-0 transition-all duration-200 rounded-md hover:bg-grey-100 dark:hover:bg-grey-800"
                            >
                                {t('Calendar.Cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-primary-500 hover:text-primary-600 cursor-pointer bg-transparent border-0 transition-all duration-200 rounded-md hover:bg-grey-100 dark:hover:bg-grey-800"
                            >
                                {t('Marketing.Done')}
                            </button>
                        </div>

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

RadixDateTimePicker.displayName = 'RadixDateTimePicker';

export default RadixDateTimePicker;
