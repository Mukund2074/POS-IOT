import * as React from 'react';
import { cnMerge } from '../../utils/cnMerge';
import { t } from 'i18next';

export interface RadixTimePickerContentProps {
    value?: Date | null;
    onChange?: (hours: number, minutes: number, shouldClose?: boolean) => void;
    minuteStep?: number;
    minuteSelectable?: boolean;
    className?: string;
}

const RadixTimePickerContent: React.FC<RadixTimePickerContentProps> = ({
    value,
    onChange,
    minuteStep = 1,
    minuteSelectable = true,
    className,
}) => {
    // Helper function to validate Date
    const isValidDate = (date: Date | null | undefined): date is Date => {
        return date instanceof Date && !isNaN(date.getTime());
    };

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i).filter((minute) => minute % minuteStep === 0);

    const handleTimeSelect = (hours: number, minutes: number, shouldClose: boolean = true) => {
        onChange?.(hours, minutes, shouldClose);
    };

    return (
        <div className={cnMerge('p-3 md:p-4', className)}>
            <div className="flex gap-3 md:gap-4 max-h-[280px] md:max-h-[320px] overflow-hidden">
                {/* Hours */}
                <div className="flex flex-col flex-1 min-w-0">
                    <div className={cnMerge('text-sm text-text-primary font-semibold px-2 text-center pb-2 ')}>
                        {t('Statistics.Hours')}
                    </div>
                    <span className="h-[1px] w-full bg-border-default" />
                    <div className="flex flex-col gap-1 overflow-y-auto pr-1 scrollbar-hidden mt-2">
                        {hours.map((hour) => {
                            const isSelected = isValidDate(value) && value.getHours() === hour;
                            return (
                                <button
                                    key={hour}
                                    type="button"
                                    onClick={() => {
                                        if (minuteSelectable) {
                                            const currentMinutes = isValidDate(value) ? value.getMinutes() : 0;
                                            // Round to nearest valid minute step
                                            const roundedMinutes = Math.round(currentMinutes / minuteStep) * minuteStep;
                                            const validMinutes = Math.min(roundedMinutes, 59);
                                            // Don't close when selecting hour - keep modal open for minute selection
                                            handleTimeSelect(hour, validMinutes, false);
                                        } else {
                                            // If minutes are not selectable, set to 0 and close
                                            handleTimeSelect(hour, 0, true);
                                        }
                                    }}
                                    className={cnMerge(
                                        'w-full px-4 py-2.5 text-sm',
                                        'transition-all duration-200 ease-in-out',
                                        'focus:outline-none outline-none focus:ring-0 focus:ring-offset-0 rounded-md border border-solid border-border-default',
                                        'text-center cursor-pointer',
                                        isSelected
                                            ? 'bg-primary-500 text-white shadow-sm hover:bg-primary-600 dark:bg-primary-500 dark:text-white dark:hover:bg-primary-600'
                                            : 'bg-transparent text-text-primary hover:bg-grey-100 active:bg-grey-200 dark:hover:bg-grey-800',
                                    )}
                                >
                                    {minuteSelectable
                                        ? hour.toString().padStart(2, '0')
                                        : `${hour.toString().padStart(2, '0')}:00`}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {minuteSelectable && <div className="w-px bg-border-default" />}

                {/* Minutes */}
                {minuteSelectable && (
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className={cnMerge('text-sm text-text-primary font-semibold px-2 pb-2 text-center')}>
                            {t('POS.Minutes')}
                        </div>
                        <span className="h-[1px] w-full bg-border-default" />
                        <div className="flex flex-col gap-1 overflow-y-auto pr-1 scrollbar-hidden mt-2">
                            {minutes.map((minute) => {
                                const isSelected = isValidDate(value) && value.getMinutes() === minute;
                                return (
                                    <button
                                        key={minute}
                                        type="button"
                                        onClick={() => {
                                            const currentHours = isValidDate(value) ? value.getHours() : 0;
                                            // Close modal when selecting minutes (complete time selection)
                                            handleTimeSelect(currentHours, minute, true);
                                        }}
                                        className={cnMerge(
                                            'w-full px-4 py-2.5 text-sm cursor-pointer',
                                            'transition-all duration-200 ease-in-out',
                                            'focus:outline-none outline-none focus:ring-0 focus:ring-offset-0 rounded-md border border-solid border-border-default',
                                            'text-center',
                                            isSelected
                                                ? 'bg-primary-500 text-white shadow-sm hover:bg-primary-600 dark:bg-primary-500 dark:text-white dark:hover:bg-primary-600'
                                                : 'bg-transparent text-text-primary hover:bg-grey-100 active:bg-grey-200 dark:hover:bg-grey-800',
                                        )}
                                    >
                                        {minute.toString().padStart(2, '0')}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

RadixTimePickerContent.displayName = 'RadixTimePickerContent';

export default RadixTimePickerContent;
