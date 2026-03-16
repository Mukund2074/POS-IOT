import { Button, Popover, Stack, SxProps, Typography } from '@mui/material';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { useEffect, useRef, useState } from 'react';
import { DateRangePicker, createStaticRanges, RangeKeyDict } from 'react-date-range';
import moment, { Moment } from 'moment';
import { t } from 'i18next';
import { CalendarMonth } from '@mui/icons-material';
import { enGB, da } from 'date-fns/locale'; // already present

interface POSDateRangePickerProps {
    disableMonths?: number | Boolean;
    startdate: string;
    endDate: string;
    setStartDate: (date: Moment) => void;
    setEndDate: (date: Moment) => void;
    wrapperSx?: SxProps;
    borderRadius?: number | string;
}

interface MomentRange {
    startDate: Moment;
    endDate: Moment;
    key: string;
}

export const POSDateRangePicker: React.FC<POSDateRangePickerProps> = ({
    disableMonths = 6,
    startdate,
    endDate,
    setStartDate,
    setEndDate,
    wrapperSx,
    borderRadius = '15px',
}) => {
    const [openCalendar, setOpenCalendar] = useState(false);
    const anchorRef = useRef<HTMLButtonElement | null>(null);

    // Safely parse incoming dates
    const parsedStart = moment.parseZone(startdate, 'YYYY-MM-DD').startOf('day');
    const parsedEnd = moment.parseZone(endDate, 'YYYY-MM-DD').endOf('day');

    const safeStart = parsedStart.isValid() ? parsedStart : moment().subtract(1, 'month').add(1, 'day');
    const safeEnd = parsedEnd.isValid() ? parsedEnd : moment();

    const [dateRange, setDateRange] = useState<MomentRange>({
        startDate: safeStart,
        endDate: safeEnd,
        key: 'selection',
    });

    const [selectedLanguage, setSelectedLanguage] = useState('da');

    useEffect(() => {
        const lang = localStorage.getItem('language');
        if (lang) setSelectedLanguage(lang);
    }, []);

    const openPicker = Boolean(anchorRef.current && openCalendar);

    const handleCalendarClick = () => setOpenCalendar((prev) => !prev);

    const handleDateSelect = (ranges: RangeKeyDict) => {
        const range = ranges.selection;
        if (!range.startDate || !range.endDate) return;

        const start = moment(range.startDate);
        const end = moment(range.endDate);

        if (!start.isValid() || !end.isValid()) return;

        // ✅ dynamic maxDays based on disableMonths
        const months = typeof disableMonths === 'number' ? disableMonths : 6;
        const maxDays = moment().add(months, 'months').diff(moment(), 'days');

        if (end.diff(start, 'days') > maxDays) return;

        // Pass formatted string back
        setStartDate(start);
        setEndDate(end);

        setDateRange({
            ...dateRange,
            startDate: start,
            endDate: end,
        });

        if (!start.isSame(end)) setOpenCalendar(false);
    };

    const staticRanges = createStaticRanges([
        {
            label: t('Common.Today'),
            range: () => {
                const today = moment();
                return {
                    startDate: today.clone().startOf('day').toDate(),
                    endDate: today.clone().endOf('day').toDate(),
                };
            },
        },
        {
            label: t('Common.Yesterday'),
            range: () => {
                const yesterday = moment().subtract(1, 'day');
                return {
                    startDate: yesterday.clone().startOf('day').toDate(),
                    endDate: yesterday.clone().endOf('day').toDate(),
                };
            },
        },
        {
            label: t('Common.ThisWeek'),
            range: () => {
                const start = moment().startOf('isoWeek');
                const end = moment().endOf('isoWeek');
                return {
                    startDate: start.toDate(),
                    endDate: end.toDate(),
                };
            },
            isSelected: () =>
                dateRange.startDate.isSame(moment().startOf('isoWeek'), 'day') &&
                dateRange.endDate.isSame(moment().endOf('isoWeek'), 'day'),
        },
        {
            label: t('Common.LastWeek'),
            range: () => {
                const start = moment().subtract(1, 'week').startOf('isoWeek');
                const end = moment().subtract(1, 'week').endOf('isoWeek');
                return {
                    startDate: start.toDate(),
                    endDate: end.toDate(),
                };
            },
            isSelected: () =>
                dateRange.startDate.isSame(moment().subtract(1, 'week').startOf('isoWeek'), 'day') &&
                dateRange.endDate.isSame(moment().subtract(1, 'week').endOf('isoWeek'), 'day'),
        },
        {
            label: t('Common.ThisMonth'),
            range: () => {
                const start = moment().startOf('month');
                const end = moment().endOf('month');
                return {
                    startDate: start.toDate(),
                    endDate: end.toDate(),
                };
            },
        },
        {
            label: t('Common.LastMonth'),
            range: () => {
                const start = moment().subtract(1, 'month').startOf('month');
                const end = moment().subtract(1, 'month').endOf('month');
                return {
                    startDate: start.toDate(),
                    endDate: end.toDate(),
                };
            },
        },
    ]);

    const minDate = dateRange.startDate
        .clone()
        .subtract(typeof disableMonths === 'number' ? disableMonths : 6, 'months');
    const maxDate = dateRange.startDate.clone().add(typeof disableMonths === 'number' ? disableMonths : 6, 'months');

    const disabledDay = (date: Date): boolean => {
        if (disableMonths === false) return false;
        const m = moment(date);
        return m.isBefore(minDate, 'day') || m.isAfter(maxDate, 'day');
    };

    return (
        <Stack sx={{ width: '100%', ...wrapperSx }}>
            <Button
                variant="outlined"
                size="small"
                onClick={handleCalendarClick}
                ref={anchorRef}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: '#A0A0A0',
                    border: '1.5px solid #D9D9D9',
                    backgroundColor: '#FFFFFF',
                    width: '100%',
                    borderRadius: borderRadius,
                    height: '42px',
                    fontSize: '14px',
                    textTransform: 'none',
                    padding: '0 16px',
                }}
            >
                <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                    <CalendarMonth sx={{ width: '22.7px', height: '21.7px' }} />
                    <Typography noWrap>
                        {' '}
                        {dateRange.startDate.format('MMM D, YYYY')} - {dateRange.endDate.format('MMM D, YYYY')}
                    </Typography>
                </Stack>
            </Button>

            <Popover
                open={openPicker}
                onClose={() => setOpenCalendar(false)}
                anchorEl={anchorRef.current}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <DateRangePicker
                    ranges={[
                        {
                            startDate: moment(dateRange.startDate).toDate(),
                            endDate: moment(dateRange.endDate).toDate(),
                            key: dateRange.key,
                        },
                    ]}
                    onChange={handleDateSelect}
                    editableDateInputs
                    moveRangeOnFirstSelection={false}
                    months={1}
                    direction="horizontal"
                    locale={selectedLanguage.startsWith('da') ? da : enGB}
                    rangeColors={['#BBB0A4']}
                    weekStartsOn={1}
                    staticRanges={staticRanges}
                    showDateDisplay={false}
                    showMonthAndYearPickers={false}
                    className="date-r-picker"
                    disabledDay={disabledDay}
                />
            </Popover>
        </Stack>
    );
};
