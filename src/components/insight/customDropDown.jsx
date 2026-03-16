import { Box, Button, Popover } from '@mui/material';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { DateRangePicker, createStaticRanges } from 'react-date-range';
import {
    startOfDay,
    endOfDay,
    startOfMonth,
    endOfMonth,
    addMonths,
    isSameDay,
    startOfISOWeek,
    endOfISOWeek,
    subDays,
} from 'date-fns';
import { subMonths, addDays } from 'date-fns';
import { da, enGB } from 'date-fns/locale'; // Import the desired locale
import calendarIcon from '../../assets/calendar.png';
import moment from 'moment';
import { t } from 'i18next';
import FPrimaryHeading from '../commonComponents/F_PrimaryHeading';

export const DropDown = ({ show, startdate, endDate, setStartDate, setEndDate }) => {
    const [openCalendar, setOpenCalendar] = useState(false);
    const [dateRange, setDateRange] = useState([
        {
            startDate: show ? moment(startdate, 'YYYY-MM-DD').toDate() : addDays(subMonths(new Date(), 1), 1),
            endDate: show ? moment(endDate, 'YYYY-MM-DD').toDate() : new Date(),
            key: 'selection',
        },
    ]);

    const localeValue = localStorage.getItem('language');

    const [selectedLanguage, setSelectedLanguage] = useState('da');

    useEffect(() => {
        if (localeValue) {
            setSelectedLanguage(localeValue);
        }
    }, localeValue);

    const anchorRef = useRef(null);
    const openPicker = Boolean(anchorRef.current && openCalendar);

    const handleCalendarClick = () => {
        setOpenCalendar((prevOpen) => !prevOpen);
    };

    const handleDateSelect = (ranges) => {
        const { startDate, endDate } = ranges.selection;
        const start = dayjs(startDate);
        const end = dayjs(endDate);

        // Limit: max 6 months
        const maxDays = 180;
        if (end.diff(start, 'day') > maxDays) {
            return;
        }

        setStartDate(start);
        setEndDate(end);

        setDateRange([
            {
                ...ranges.selection,
                startDate: start.toDate(),
                endDate: end.toDate(),
            },
        ]);
        if (moment(startDate).isSame(moment(endDate))) {
        } else {
            setOpenCalendar(false);
        }
    };

    const staticRanges = createStaticRanges([
        {
            label: t('Common.Today'),
            range: () => ({
                startDate: startOfDay(new Date()),
                endDate: endOfDay(new Date()),
            }),
        },
        {
            label: t('Common.Yesterday'),
            range: () => ({
                startDate: startOfDay(addDays(new Date(), -1)),
                endDate: endOfDay(addDays(new Date(), -1)),
            }),
        },
        {
            label: t('Common.ThisWeek'),
            range: () => ({
                startDate: startOfISOWeek(new Date()),
                endDate: endOfISOWeek(new Date()),
                key: 'selection',
            }),
            isSelected: (range) => {
                if (range.startDate && range.endDate) {
                    return (
                        isSameDay(range?.startDate, startOfISOWeek(new Date())) &&
                        isSameDay(range?.endDate, endOfISOWeek(new Date()))
                    );
                }
                return false;
            },
        },
        {
            label: t('Common.LastWeek'),
            range: () => ({
                startDate: startOfISOWeek(subDays(new Date(), 7)),
                endDate: endOfISOWeek(subDays(new Date(), 7)),
                key: 'selection',
            }),
            isSelected: (range) => {
                if (range.startDate && range.endDate) {
                    return (
                        isSameDay(range.startDate, startOfISOWeek(subDays(new Date(), 7))) &&
                        isSameDay(range.endDate, endOfISOWeek(subDays(new Date(), 7)))
                    );
                }
                return false;
            },
        },
        {
            label: t('Common.ThisMonth'),
            range: () => ({
                startDate: startOfMonth(new Date()),
                endDate: endOfMonth(new Date()),
            }),
        },
        {
            label: t('Common.LastMonth'),
            range: () => ({
                startDate: startOfMonth(addMonths(new Date(), -1)),
                endDate: endOfMonth(addMonths(new Date(), -1)),
            }),
        },
    ]);

    const minDate = dayjs(dateRange[0].startDate).subtract(6, 'month').toDate();
    const maxDate = dayjs(dateRange[0].startDate).add(6, 'month').toDate();

    const disabledDay = (date) => {
        return date < minDate || date > maxDate;
    };

    return (
        <Box width={'100%'}>
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
                    borderRadius: '15px',
                    height: '42px',
                    fontSize: '14px',
                    textTransform: 'none',
                    padding: '0 16px',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={calendarIcon} alt="Calendar Icon" style={{ width: '22.7px', height: '21.7px' }} />
                    {dayjs(dateRange[0].startDate).format('MMM D, YYYY')} -{' '}
                    {dayjs(dateRange[0].endDate).format('MMM D, YYYY')}
                </Box>
                {/* <img src={downArrow} alt="Down Arrow" style={{ height: "14px" ,paddingRight: '2px', transform:'translateY(-5px)'}} /> */}
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
                    ranges={dateRange}
                    onChange={handleDateSelect}
                    editableDateInputs={true}
                    moveRangeOnFirstSelection={false}
                    months={1}
                    direction="horizontal"
                    locale={selectedLanguage == 'da' ? da : enGB}
                    rangeColors={['#BBB0A4']}
                    weekStartsOn={1}
                    staticRanges={staticRanges}
                    showDateDisplay={false}
                    showMonthAndYearPickers={false}
                    className="date-r-picker"
                    disabledDay={disabledDay}
                />
            </Popover>
        </Box>
    );
};
