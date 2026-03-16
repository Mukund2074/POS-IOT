import * as React from 'react';
import moment from 'moment';
import 'moment/locale/da';
import 'moment/locale/en-gb';
import i18next from 'i18next';
import { cnMerge } from '../../utils/cnMerge';

export interface RadixCalendarProps {
    value?: Date | null;
    onChange?: (date: Date | null) => void;
    minDate?: Date;
    maxDate?: Date;
    className?: string;
}

type CalendarView = 'month' | 'year' | 'decade';

const RadixCalendar: React.FC<RadixCalendarProps> = ({ value, onChange, minDate, maxDate, className }) => {
    const [currentMonth, setCurrentMonth] = React.useState(() => moment(value || undefined).startOf('month'));
    const [view, setView] = React.useState<CalendarView>('month');

    // Get current language from i18next and set moment locale
    React.useMemo(() => {
        const lang = i18next.language || 'da';
        moment.locale(lang === 'da' ? 'da' : 'en-gb');
        return lang;
    }, []);

    React.useEffect(() => {
        if (value) {
            setCurrentMonth(moment(value).startOf('month'));
        }
    }, [value]);

    // Calendar helpers
    const isSameDay = (date1: moment.Moment, date2: moment.Moment) => date1.isSame(date2, 'day');
    const isSameMonth = (date1: moment.Moment, date2: moment.Moment) => date1.isSame(date2, 'month');
    const isToday = (date: moment.Moment) => date.isSame(moment(), 'day');
    const isDisabled = (date: moment.Moment) => {
        if (minDate && date.isBefore(moment(minDate), 'day')) return true;
        if (maxDate && date.isAfter(moment(maxDate), 'day')) return true;
        return false;
    };
    const capitalizeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    const getDaysInMonth = () => {
        // Always start weeks on Monday (ISO week) to match EU expectations.
        const start = currentMonth.clone().startOf('month').startOf('isoWeek');
        const days: moment.Moment[] = [];
        // Always show 6 weeks (42 days) for consistent grid size
        for (let i = 0; i < 42; i++) {
            days.push(start.clone().add(i, 'day'));
        }
        return days;
    };

    const getMonthsInYear = () => {
        const months: moment.Moment[] = [];
        for (let i = 0; i < 12; i++) {
            months.push(currentMonth.clone().month(i));
        }
        return months;
    };

    const getYearsInDecade = () => {
        const years: moment.Moment[] = [];
        const startYear = Math.floor(currentMonth.year() / 10) * 10;
        for (let i = 0; i < 12; i++) {
            years.push(currentMonth.clone().year(startYear + i));
        }
        return years;
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentMonth((prev) => prev.clone().add(direction === 'next' ? 1 : -1, 'month'));
    };

    const navigateYear = (direction: 'prev' | 'next') => {
        setCurrentMonth((prev) => prev.clone().add(direction === 'next' ? 1 : -1, 'year'));
    };

    const navigateDecade = (direction: 'prev' | 'next') => {
        setCurrentMonth((prev) => prev.clone().add(direction === 'next' ? 10 : -10, 'year'));
    };

    const selectMonth = (month: moment.Moment) => {
        setCurrentMonth(month);
        setView('month');
    };

    const selectYear = (year: moment.Moment) => {
        setCurrentMonth(year);
        setView('month');
    };

    const selectDate = (date: moment.Moment) => {
        if (!isDisabled(date)) {
            onChange?.(date.toDate());
        }
    };

    const renderCalendarHeader = () => {
        if (view === 'decade') {
            const startYear = Math.floor(currentMonth.year() / 10) * 10;
            return (
                <div className="flex items-center justify-between mb-4">
                    <button
                        type="button"
                        onClick={() => navigateDecade('prev')}
                        className="p-2 cursor-pointer bg-transparent border-0 hover:bg-grey-100 dark:hover:bg-grey-800 text-text-primary transition-colors rounded-md"
                    >
                        &laquo;
                    </button>
                    <span className="text-sm font-semibold text-text-primary">
                        {startYear} - {startYear + 9}
                    </span>
                    <button
                        type="button"
                        onClick={() => navigateDecade('next')}
                        className="p-2 cursor-pointer bg-transparent border-0 hover:bg-grey-100 dark:hover:bg-grey-800 text-text-primary transition-colors rounded-md"
                    >
                        &raquo;
                    </button>
                </div>
            );
        }

        if (view === 'year') {
            return (
                <div className="flex items-center justify-between mb-4">
                    <button
                        type="button"
                        onClick={() => navigateYear('prev')}
                        className="p-2 cursor-pointer bg-transparent border-0 hover:bg-grey-100 dark:hover:bg-grey-800 text-text-primary transition-colors rounded-md"
                    >
                        &laquo;
                    </button>
                    <button
                        type="button"
                        onClick={() => setView('decade')}
                        className="text-sm font-semibold hover:text-primary-500 px-2 py-1 cursor-pointer bg-transparent border-0 hover:bg-grey-100 dark:hover:bg-grey-800 transition-colors rounded-md"
                    >
                        {currentMonth.format('YYYY')}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigateYear('next')}
                        className="p-2 cursor-pointer bg-transparent border-0 hover:bg-grey-100 dark:hover:bg-grey-800 text-text-primary transition-colors rounded-md"
                    >
                        &raquo;
                    </button>
                </div>
            );
        }

        return (
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => navigateYear('prev')}
                        className="p-2 cursor-pointer bg-transparent border-0 hover:bg-grey-100 dark:hover:bg-grey-800 text-text-primary transition-colors rounded-md"
                        title="Previous year"
                    >
                        &laquo;
                    </button>
                    <button
                        type="button"
                        onClick={() => navigateMonth('prev')}
                        className="p-2 cursor-pointer bg-transparent border-0 hover:bg-grey-100 dark:hover:bg-grey-800 text-text-primary transition-colors rounded-md"
                    >
                        &lsaquo;
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setView('year')}
                        className="text-sm font-semibold hover:text-primary-500 px-2 py-1 cursor-pointer bg-transparent border-0 hover:bg-grey-100 dark:hover:bg-grey-800 transition-colors rounded-md"
                    >
                        {capitalizeFirst(currentMonth.format('MMMM'))}
                    </button>
                    <button
                        type="button"
                        onClick={() => setView('year')}
                        className="text-sm font-semibold hover:text-primary-500 px-2 py-1 cursor-pointer bg-transparent border-0 hover:bg-grey-100 dark:hover:bg-grey-800 transition-colors rounded-md"
                    >
                        {currentMonth.format('YYYY')}
                    </button>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => navigateMonth('next')}
                        className="p-2 cursor-pointer bg-transparent border-0 hover:bg-grey-100 dark:hover:bg-grey-800 text-text-primary transition-colors rounded-md"
                    >
                        &rsaquo;
                    </button>
                    <button
                        type="button"
                        onClick={() => navigateYear('next')}
                        className="p-2 cursor-pointer bg-transparent border-0 hover:bg-grey-100 dark:hover:bg-grey-800 text-text-primary transition-colors rounded-md"
                        title="Next year"
                    >
                        &raquo;
                    </button>
                </div>
            </div>
        );
    };

    const renderCalendarContent = () => {
        if (view === 'decade') {
            const years = getYearsInDecade();
            return (
                <div className="grid grid-cols-3 gap-2">
                    {years.map((year) => {
                        const isSelected = value && moment(value).isSame(year, 'year');
                        const isCurrentYear = year.isSame(moment(), 'year');
                        return (
                            <button
                                key={year.format('YYYY')}
                                type="button"
                                onClick={() => selectYear(year)}
                                className={cnMerge(
                                    'px-4 py-3 w-full cursor-pointer bg-transparent border-0 transition-all duration-200 rounded-md',
                                    isSelected
                                        ? 'text-primary-500 font-semibold'
                                        : 'text-text-primary hover:text-primary-500 hover:bg-grey-100 dark:hover:bg-grey-800',
                                    isCurrentYear && !isSelected && 'font-semibold',
                                )}
                            >
                                {year.format('YYYY')}
                            </button>
                        );
                    })}
                </div>
            );
        }

        if (view === 'year') {
            const months = getMonthsInYear();
            return (
                <div className="grid grid-cols-3 gap-2">
                    {months.map((month) => {
                        const isSelected = value && moment(value).isSame(month, 'month');
                        const isCurrentMonth = month.isSame(moment(), 'month');
                        return (
                            <button
                                key={month.format('MMM')}
                                type="button"
                                onClick={() => selectMonth(month)}
                                className={cnMerge(
                                    'px-4 py-3 w-full cursor-pointer bg-transparent border-0 transition-all duration-200 rounded-md',
                                    isSelected
                                        ? 'text-primary-500 font-semibold'
                                        : 'text-text-primary hover:text-primary-500 hover:bg-grey-100 dark:hover:bg-grey-800',
                                    isCurrentMonth && !isSelected && 'font-semibold',
                                )}
                            >
                                {capitalizeFirst(month.format('MMM'))}
                            </button>
                        );
                    })}
                </div>
            );
        }

        // Month view
        const days = getDaysInMonth();
        // Ensure weekday headers start from Monday (even though moment's weekdaysShort() is Sunday-first)
        const weekdays = moment.localeData().weekdaysShort();
        const weekdaysMondayFirst = [...weekdays.slice(1), weekdays[0]];

        return (
            <div>
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekdaysMondayFirst.map((day, index) => (
                        <div
                            key={index}
                            className="text-xs font-semibold text-text-secondary text-center py-2 dark:text-text-secondary"
                        >
                            {capitalizeFirst(day)}
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, index) => {
                        const isSelected = value && isSameDay(moment(value), day);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isTodayDate = isToday(day);
                        const disabled = isDisabled(day);

                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => selectDate(day)}
                                disabled={disabled}
                                className={cnMerge(
                                    'aspect-square text-sm font-medium cursor-pointer border-0 transition-all duration-200 rounded-md',
                                    'flex items-center justify-center',
                                    !isCurrentMonth && 'text-text-secondary opacity-50',
                                    disabled && 'opacity-30 cursor-not-allowed',
                                    isSelected
                                        ? '!bg-primary-500 text-white'
                                        : isTodayDate
                                          ? 'text-text-primary font-semibold  bg-transparent hover:bg-grey-100 dark:hover:bg-grey-800'
                                          : 'text-text-primary hover:text-primary-500 bg-transparent hover:bg-grey-100 dark:hover:bg-grey-800',
                                )}
                            >
                                {day.format('D')}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className={cnMerge('w-full', className)}>
            {renderCalendarHeader()}
            {renderCalendarContent()}
        </div>
    );
};

RadixCalendar.displayName = 'RadixCalendar';

export default RadixCalendar;
