import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

import '../../../index.css';
import greaterImg from '../../../assets/greter.png';
import lessImg from '../../../assets/less.png';
import { DateCalendar } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { Badge, Box, Button, IconButton, Stack, Typography } from '@mui/material';

import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import FSelect from '../../commonComponents/F_Select';
import PopupForEmployee from '../../calanderPopups/PopUpForEmployee';
import { t } from 'i18next';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import 'moment/locale/en-gb';
import 'moment/locale/da';
import { Notifications, StickyNote2Rounded } from '@mui/icons-material';
import FButton from '../../commonComponents/F_Button';
import PopUpForOTP from '../../calanderPopups/PopUpForOTP';
import { authEmployeeApi } from '../../../utils/Api/Authantication';
import { useData } from '../../../context/DataContext';
import CustomTimeHeader from './CustomTimeHeader';
import FormNotificationMenu from './ToolbarHelpers/FormNotificationMenu';
import NotificationsMenu from './ToolbarHelpers/NotificationsMenu';

const CustomSVGIcon = (props) => (
    <img
        {...props}
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 22 22' fill='none'%3E%3Cpath d='M18.2583 8.20312L12.2816 14.1798C11.5758 14.8856 10.4208 14.8856 9.71495 14.1798L3.73828 8.20312' stroke='%23545454' stroke-width='2' stroke-miterlimit='10' stroke-linecap='round' stroke-linejoin='round'%3E%3C/path%3E%3C/svg%3E"
        alt="Custom icon"
        style={{ width: '22px', height: '22px', color: '#545454', transform: 'translateY(-20%)' }}
    />
);

const CustomToolbar = ({
    label,
    onNavigate,
    openForm,
    view,
    setView,
    setEmployeeId,
    employees,
    selectedDate,
    setSelectedDate,
    selectedLanguage,
    notifications = [],
    readAllNotifications = () => {},
    handleNotificationClick = () => {},
    formNotifications = [],
    handleFormNotificationClick = () => {},
}) => {
    const isToday = moment(selectedDate).isSame(moment(), 'day');
    const { locations, refreshSettings } = useData();
    const user = useSelector((state) => state.user.data);
    const setting = useSelector((state) => state?.settings?.data);
    const employee = localStorage.getItem('employee_id');
    const role = localStorage.getItem('employee_role');
    const currentYear =
        moment(selectedDate) && moment(selectedDate).year() ? moment(selectedDate).year() : moment().year();

    const [calendarOpen, setCalendarOpen] = useState(false);
    const [calendarValue, setCalendarValue] = useState(moment(selectedDate));
    const [selectedLocation, setSelectedLocation] = useState('');
    const [showEmployeePopup, setShowEmployeePopup] = useState(false);
    const [employeeObjectForPopUp, setEmployeeObjectForPopUp] = useState([]);
    const [selectedPopUpEmployee, setSelectedPopUpEmployee] = useState(null);
    const [showOTPPopup, setShowOTPPopup] = useState(false);
    const [passcode, setPasscode] = useState(['', '', '', '', '', '']);
    const [selectedEmployees, setSelectedEmployees] = useState(() => {
        const storedSelectedEmployees = localStorage.getItem(`selectedEmployees_${employee}`);
        if (storedSelectedEmployees) {
            return JSON.parse(storedSelectedEmployees);
        }
        return [employee];
    });
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const calendarRef = useRef(null);
    const [anchorEl2, setAnchorEl2] = useState(null);
    const open2 = Boolean(anchorEl2);

    // const isEnableUnread = JSON.parse(localStorage.getItem("isEnableUnread"));

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClick2 = (event) => {
        setAnchorEl2(event.currentTarget);
    };

    useEffect(() => {
        const extractAndTranslateDate = () => {
            let parsedDate = null;
            if (view === 'week') {
                const [startDateStr, endDateStr] = label.split(' – ');
                // Set locale before parsing dates
                moment.locale(selectedLanguage);

                const startDate = moment(startDateStr, 'MMMM DD').year(currentYear);
                let endDate = moment(endDateStr, 'MMMM DD').year(currentYear);

                const daysInStartMonth = startDate.daysInMonth();
                const startMonth = startDate.month();
                const endMonth = endDate.month();

                if (endDate.isBefore(startDate, 'day')) {
                    endDate = endDate.year(currentYear);
                }
                if ((startMonth === 11 && endMonth === 0) || (startMonth === 0 && endMonth === 11)) {
                    const decemberContribution = daysInStartMonth - startDate.date() + 1;
                    const januaryContribution = endDate.date();

                    if (januaryContribution > decemberContribution) {
                        parsedDate = moment(endDateStr, 'MMMM DD').year(currentYear);
                    } else {
                        parsedDate = moment(startDateStr, 'MMMM DD').year(currentYear);
                    }
                } else {
                    parsedDate = moment(startDateStr, 'MMMM DD').year(currentYear);
                }
            } else if (view === 'day') {
                // Set locale before parsing date
                moment.locale(selectedLanguage);

                const match = label.match(/([A-Za-zæøåÆØÅ]+ \d{2})/);
                if (match) {
                    const [_, dateStr] = match;
                    // Parse with explicit format and locale
                    parsedDate = moment(dateStr, 'MMMM DD').year(currentYear);
                }
            }

            return <CustomTimeHeader date={parsedDate} />;
        };

        extractAndTranslateDate();
    }, [label, selectedLanguage, currentYear]);

    const handleNavigate = (direction) => {
        onNavigate(direction);
    };

    const toggleCalendar = () => {
        setCalendarOpen(!calendarOpen);
    };

    const handleDateChange = (date) => {
        // }
        setCalendarValue(date);
        setSelectedDate(date);
        onNavigate('DATE', date.toDate());
        setView('day');
    };

    const employeeOptions = useMemo(() => {
        if (employees.length > 0) {
            return employees.map((data) => ({
                value: data.id,
                label: data.name,
            }));
        }
        return [];
    }, [employees]);

    // Load selected employees from localStorage on component mount
    useEffect(() => {
        if (employees.length > 0 && selectedEmployees.length === 0) {
            const initialSelection = [Number(employee)];
            localStorage.setItem(`selectedEmployees_${employee}`, JSON.stringify(initialSelection));
            setSelectedEmployees(initialSelection);
        }
    }, [employees, selectedEmployees.length]);

    // Update localStorage when selected employees change
    useEffect(() => {
        if (selectedEmployees && selectedEmployees.length > 0) {
            localStorage.setItem(`selectedEmployees_${employee}`, JSON.stringify(selectedEmployees));
        }
    }, [selectedEmployees]);

    const handleEmployeeSelect = useCallback(
        (e) => {
            const currentEmployeeId = e.target.value;

            if (currentEmployeeId === '0' || currentEmployeeId.includes(0)) {
                if (employeeOptions.length === selectedEmployees?.length) {
                    setSelectedEmployees([]);
                } else {
                    setSelectedEmployees(employeeOptions.map((emp) => emp.value));
                }
            } else if (currentEmployeeId.length === 0) {
                setSelectedEmployees([]);
            } else {
                setSelectedEmployees(currentEmployeeId);
            }
        },
        [employeeOptions, selectedEmployees],
    );

    // ✅ Safe formatter (keeps your original)
    const safeFormat = (dateStr, format, lang = 'en', fallback = 'DD MMMM YYYY') => {
        const m = moment(dateStr, format).locale(lang);
        return m.isValid() ? m.format(fallback) : moment().locale(lang).format(fallback);
    };

    // ✅ Always 7-day gap version
    const formatDateRange = (label) => {
        if (view === 'week') {
            const start = moment(selectedDate).startOf('week').locale(selectedLanguage);
            if (!start.isValid()) {
                console.warn('Invalid selectedDate, defaulting to today');
                return moment().locale(selectedLanguage).format('DD MMMM YYYY');
            }

            const end = moment(start).endOf('week');

            const formattedStartDate = start.format('DD MMMM');
            const formattedEndDate = end.format('DD MMMM');

            return `${formattedStartDate} - ${formattedEndDate}`;
        } else {
            const formattedSelectedDate = safeFormat(selectedDate, '', selectedLanguage, 'ddd. DD MMMM YYYY');
            return formattedSelectedDate;
        }
    };

    const resetStates = (e, reason) => {
        if (reason === 'backdropClick') {
            return;
        }
        setSelectedLocation(0);
        setEmployeeObjectForPopUp();
        setShowEmployeePopup(false);
        setSelectedPopUpEmployee();
        setShowOTPPopup(false);
        setPasscode(['', '', '', '', '', '']);
    };

    const handleSelectLocation = useCallback(
        (e) => {
            const selectedLocationId = e?.target?.value;

            // Update the local state with the selected location's ID
            setSelectedLocation(selectedLocationId);

            // Find the employee object corresponding to the selected location
            const employee = locations.find((location) => location?.profile?.id === selectedLocationId);

            // Update the employee object for the popup
            setEmployeeObjectForPopUp(employee);

            // Show the employee popup
            setShowEmployeePopup(true);
        },
        [locations],
    );

    const handleSelectPopUpEmployee = (emp) => {
        setSelectedPopUpEmployee(emp);
    };

    const handleTransferToOTP = () => {
        const isBypass = locations?.find((location) => location?.profile?.id === selectedLocation)?.by_pass_access_code;
        if (isBypass) {
            handleFinalLogin({
                employee: selectedPopUpEmployee,
                combinedPasscode: undefined,
                selectedLocationToken: locations?.find((location) => location?.profile?.id === selectedLocation)
                    ?.access_token,
            }).then(() => {
                refreshSettings();
            });
            return;
        }
        if (selectedPopUpEmployee) {
            setShowEmployeePopup(false);
            setShowOTPPopup(true);
        } else {
            toast.error(t('Calendar.ToastErrEmpSelect'));
            return;
        }
    };

    const handlePasscodeChange = (e, index) => {
        const newPasscode = [...passcode];
        newPasscode[index] = e.target.value.slice(-1);
        setPasscode(newPasscode);

        if (e.target.value && index < passcode.length - 1) {
            document.getElementById(`passcode-${index + 1}`).focus();
        }
    };

    const handleFinalSavePopuUs = async () => {
        const combinedPasscode = passcode.join('');

        if (combinedPasscode.length !== 6) {
            toast.error(t('Calendar.ToastErrPasscode'));
            setPasscode(['', '', '', '', '', '']);
            return;
        }

        if (!selectedPopUpEmployee) {
            toast.error(t('Calendar.ToastErrEmpSelect'));
            return;
        }

        await handleFinalLogin({
            employee: selectedPopUpEmployee,
            combinedPasscode,
            selectedLocationToken: locations?.find((location) => location?.profile?.id === selectedLocation)
                ?.access_token,
        });
    };

    const handleFinalLogin = async ({ employee, combinedPasscode, selectedLocationToken }) => {
        try {
            const res = await authEmployeeApi({
                token: selectedLocationToken,
                employee_id: selectedPopUpEmployee?.id.toString(),
                access_code: combinedPasscode,
            });

            if (res) {
                const { access_token } = res.data.data;

                localStorage.setItem('auth_token', access_token);
                localStorage.setItem('employee_id', selectedPopUpEmployee?.id);
                localStorage.setItem('employee_role', selectedPopUpEmployee?.role);
                localStorage.setItem('employees', JSON.stringify(employeeObjectForPopUp?.profile?.employees));

                setShowOTPPopup(false);
                toast.success(t('Calendar.ToastSuccessDepartmentChange'));
                setTimeout(() => {
                    resetStates();
                    window.location.reload();
                }, 800);
            }
        } catch (error) {
            toast.error(t('Calendar.ToastErrPasscode'));
            setPasscode(['', '', '', '', '', '']);
            setSelectedLocation(employee);
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
        setAnchorEl2(null);
    };

    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

    const unreadNotifications =
        notifications && notifications.length > 0 && notifications.filter((notification) => !notification.is_read);
    const notificationsToShow = showUnreadOnly ? unreadNotifications : notifications;

    const handleClickNotification = ({ item }) => {
        handleNotificationClick({ item });
    };

    const handleUnreadNotification = (val) => {
        // const isEnableUnread = e.target.checked;
        let DataToStore = JSON.stringify({ val, employee });
        localStorage.setItem('isEnableUnread', DataToStore);
        setShowUnreadOnly(val);
    };

    useEffect(() => {
        try {
            const storedData = localStorage.getItem('isEnableUnread');
            if (storedData) {
                const data = JSON.parse(storedData);
                if (data && data.employee === employee) {
                    setShowUnreadOnly(data.val);
                }
            }
        } catch (error) {
            console.error('Error parsing isEnableUnread from localStorage:', error);
        }
    }, [employee]);

    const handleToday = () => onNavigate('DATE', moment());

    let unreadCount = 0;
    if (formNotifications.length > 0) {
        unreadCount = formNotifications.filter((item) => !item.is_read).length;
    }

    const hasNotificationPermissions = () => {
        if (user?.role === 'ADMIN') {
            return true;
        } else if (user?.settings?.read_all_notification || user?.settings?.read_own_notification) {
            return true;
        } else {
            return false;
        }
    };

    const handleWeekClick = useCallback(
        (weekNumber) => {
            const currentYear = moment(calendarValue).year();
            const weekStartDate = moment().year(currentYear).isoWeek(weekNumber).startOf('isoWeek');

            if (weekStartDate.isValid()) {
                setCalendarValue(weekStartDate);
                setSelectedDate(weekStartDate);
                onNavigate('DATE', weekStartDate.toDate());
                setCalendarOpen(false);
            }
        },
        [calendarValue, setCalendarValue, setSelectedDate, onNavigate],
    );

    useEffect(() => {
        if (!calendarOpen) return;

        const handler = (e) => {
            const clickedEl = e.target;

            const cell = clickedEl.closest('td, [role="cell"], .MuiDayCalendar-weekNumber, [class*="weekNumber"]');

            if (!cell) return;

            // Check if this is the first column (week number column)
            const row = cell.parentElement;
            if (!row) return;

            const cells = Array.from(row.children);
            const isFirstColumn = cells.indexOf(cell) === 0;

            // Also check if it's a table row (tbody > tr)
            const isTableRow = row.tagName === 'TR' || row.getAttribute('role') === 'row';

            if (!isFirstColumn || !isTableRow) return;

            // Get text content - could be from cell or nested elements
            let text = cell.textContent?.trim();
            if (!text || !/^\d+$/.test(text)) {
                text = clickedEl.textContent?.trim();
            }

            const weekNum = parseInt(text, 10);

            // Validate it's a week number
            if (weekNum >= 1 && weekNum <= 53) {
                e.preventDefault();
                e.stopPropagation();
                handleWeekClick(weekNum);
            }
        };

        // Wait for calendar to render, then attach listener
        let calendarElement = null;
        const timeoutId = setTimeout(() => {
            calendarElement = calendarRef.current;
            if (calendarElement) {
                calendarElement.addEventListener('click', handler, true);
            }
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            if (calendarElement) {
                calendarElement.removeEventListener('click', handler, true);
            }
        };
    }, [calendarOpen, handleWeekClick]);

    return (
        <Stack
            sx={{
                bgcolor: '#bbb0a466',
                width: '100%',
                maxHeight: { md: 60 },
                display: 'flex',
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', md: 'row' },
                py: 1,
                px: 2,
            }}
        >
            <Stack
                width={'100%'}
                direction="row"
                justifyContent={'space-between'}
                gap={2}
                sx={{ pl: { xs: 4, md: 0 } }}
            >
                {locations.length > 1 && (user?.role === 'ADMIN' || user?.settings.change_department) && (
                    <FSelect
                        IconComponent={CustomSVGIcon}
                        options={locations
                            ?.filter(({ profile, is_active }) => profile?.id !== setting?.profile?.id && is_active)
                            .map(({ profile }) => ({
                                value: profile?.id,
                                label: profile?.name,
                            }))}
                        value={selectedLocation}
                        onChange={handleSelectLocation}
                        placeholderText={t('Calendar.SelectLocation')}
                        backgroundColor="#fff"
                        borderColor="#ccc"
                        borderRadius={12}
                    />
                )}

                {hasNotificationPermissions() && (
                    <IconButton
                        disableRipple
                        disableTouchRipple
                        disableFocusRipple
                        onClick={handleClick}
                        sx={{
                            ml: { xs: 'auto' },
                            display: { xs: 'flex', md: 'none' },
                            bgcolor: '#fff',
                            position: 'relative',
                            mr: user?.settings?.create_customers || user?.role === 'ADMIN' ? 0 : 2,
                        }}
                    >
                        <Badge
                            badgeContent={notifications[0]?.unread_count > 99 ? '99+' : notifications[0]?.unread_count}
                            color="error"
                            sx={{ position: 'absolute', top: '3px', right: '3px' }}
                        />
                        <Notifications />
                    </IconButton>
                )}

                <IconButton
                    disableRipple
                    disableTouchRipple
                    disableFocusRipple
                    onClick={handleClick2}
                    sx={{
                        display: { xs: 'flex', md: 'none' },
                        bgcolor: '#fff',
                        position: 'relative',
                        mr: user?.settings?.create_customers || user?.role === 'ADMIN' ? 0 : 2,
                        minWidth: 42,
                        height: 40,
                    }}
                >
                    <Badge
                        badgeContent={unreadCount > 99 ? '99+' : unreadCount}
                        color="error"
                        sx={{ position: 'absolute', top: '3px', right: '3px' }}
                    />
                    <StickyNote2Rounded />
                </IconButton>
            </Stack>

            <Stack
                sx={{
                    ml: { md: 'auto' },
                    display: 'flex',
                    gap: 2,
                    flexDirection: { xs: 'column', md: 'row' },
                    mt: { xs: 2, md: 0 },
                }}
            >
                <Stack
                    gap={2}
                    maxHeight={40}
                    border={'1px solid #a19d99'}
                    py={0}
                    px={1}
                    flexDirection={'row'}
                    alignItems={'center'}
                    bgcolor={'#fff'}
                    borderRadius={12}
                >
                    <button onClick={() => handleNavigate('PREV')} className="rotated-button">
                        <img src={lessImg} alt="Less" height={12} />
                    </button>
                    <Stack sx={{ height: '100%', display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                        <Button
                            onClick={handleToday}
                            // className="today-button"
                            sx={{
                                bgcolor: !isToday ? '#ffffff' : '#BBB0A4',
                                color: !isToday ? '#BBB0A4' : '#ffffff',
                                fontWeight: 700,
                                height: '100%',
                                border: 'none',
                                textTransform: 'none',
                                fontSize: '.85rem',
                                borderRadius: 0,
                                borderRight: '1px solid #a19d99',
                                borderLeft: '1px solid #a19d99',
                            }}
                        >
                            {t('Common.Today')}
                        </Button>

                        <span style={{ marginLeft: '10px' }} className="toolbar-label" onClick={toggleCalendar}>
                            {formatDateRange(label)}
                        </span>
                    </Stack>

                    <button
                        onClick={() => handleNavigate('NEXT')}
                        className="rotated-button"
                        style={{ marginLeft: 'auto' }}
                    >
                        <img src={greaterImg} alt="Greater" height={12} />
                    </button>
                </Stack>

                {calendarOpen && (
                    <LocalizationProvider
                        dateAdapter={AdapterMoment}
                        localeText={{
                            calendarWeekNumberHeaderText: t('Common.Week'),
                        }}
                        adapterLocale={selectedLanguage == 'da' ? 'da' : 'en-gb'}
                    >
                        <Box ref={calendarRef} className="index-calendar">
                            <DateCalendar
                                defaultValue={moment()}
                                value={calendarValue}
                                displayWeekNumber={true}
                                onChange={(newValue) => handleDateChange(newValue)}
                                sx={{
                                    width: '100%',
                                    '& .MuiPickersDay-root': {
                                        color: 'black',
                                        fontSize: '18px',
                                    },
                                    '& .Mui-selected': {
                                        backgroundColor: '#BBB0A4 !important',
                                        color: 'white !important',
                                        fontSize: '18px',
                                    },
                                    '& .MuiPickersCalendarHeader-label': {
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        color: '#000',
                                        marginLeft: '20px',
                                    },

                                    '& .MuiTypography-root': {
                                        color: '#5b6980',
                                        fontSize: '18px',
                                    },
                                    '& .MuiIconButton-root': {
                                        color: 'black',
                                        fontSize: '18px',
                                    },

                                    '& .MuiDayCalendar-weekNumber': {
                                        cursor: 'pointer',
                                        '&:hover': {
                                            backgroundColor: 'rgba(187, 176, 164, 0.1)',
                                            borderRadius: '50%',
                                        },
                                    },
                                }}
                            />
                        </Box>
                    </LocalizationProvider>
                )}

                {(role === 'ADMIN' || user?.settings?.view_all_employees) && (
                    <FSelect
                        selectAllRenderText={t('Common.AllEmployees')}
                        backgroundColor="#fff"
                        isMultiSelect={true}
                        value={selectedEmployees}
                        TextToDisplayWithCount={`${t('Common.Employees')}`}
                        sx={{ width: { xs: '100%', md: '30%', minWidth: 150 } }}
                        onChange={handleEmployeeSelect}
                        placeholderText={t('Common.AllEmployees')}
                        selectAllRenderCheckBoxText={t('Common.AllEmployees')}
                        options={employeeOptions}
                        borderRadius={50}
                        padding={0}
                        onClose={() => {
                            // if (selectedEmployees.length === employees.length) {
                            //   setEmployeeId("0");
                            // } else if (selectedEmployees.length === 0) {
                            // } else {
                            setEmployeeId(selectedEmployees);
                            // }
                        }}
                    />
                )}

                {hasNotificationPermissions() && (
                    <IconButton
                        disableRipple
                        disableTouchRipple
                        disableFocusRipple
                        onClick={handleClick}
                        sx={{
                            display: { xs: 'none', md: 'flex' },
                            bgcolor: '#fff',
                            position: 'relative',
                            mr: user?.settings?.create_customers || user?.role === 'ADMIN' ? 0 : 2,
                            minWidth: 42,
                            height: 40,
                        }}
                    >
                        <Badge
                            badgeContent={notifications[0]?.unread_count > 99 ? '99+' : notifications[0]?.unread_count}
                            color="error"
                            sx={{ position: 'absolute', top: '3px', right: '3px' }}
                        />
                        <Notifications />
                    </IconButton>
                )}
                <NotificationsMenu
                    anchorEl={anchorEl}
                    open={open}
                    handleClose={handleClose}
                    notificationsToShow={notificationsToShow}
                    handleClickNotification={handleClickNotification}
                    readAllNotifications={readAllNotifications}
                    handleUnreadNotification={handleUnreadNotification}
                    showUnreadOnly={showUnreadOnly}
                />

                {formNotifications?.length > 0 && (
                    <IconButton
                        disableRipple
                        disableTouchRipple
                        disableFocusRipple
                        onClick={handleClick2}
                        sx={{
                            display: { xs: 'none', md: 'flex' },
                            bgcolor: '#fff',
                            position: 'relative',
                            mr: user?.settings?.create_customers || user?.role === 'ADMIN' ? 0 : 2,
                            minWidth: 42,
                            height: 40,
                        }}
                    >
                        <Badge
                            badgeContent={unreadCount > 99 ? '99+' : unreadCount}
                            color="error"
                            sx={{ position: 'absolute', top: '3px', right: '3px' }}
                        />
                        <StickyNote2Rounded />
                    </IconButton>
                )}

                <FormNotificationMenu
                    anchorEl2={anchorEl2}
                    open2={open2}
                    handleClose={handleClose}
                    formNotifications={formNotifications}
                    handleFormNotificationClick={handleFormNotificationClick}
                />

                {(user?.settings?.create_customers || user?.role === 'ADMIN') && (
                    <FButton
                        variant={'save'}
                        sx={{ width: { xs: '100%', md: 'auto' }, minWidth: '150px', bgcolor: '#bbb0a4' }}
                        onClick={openForm}
                        className="new-booking-button"
                        title={
                            <Typography noWrap textTransform={'none'} fontWeight={700}>
                                {t('Customer.NewBooking')}
                            </Typography>
                        }
                    />
                )}
            </Stack>

            {showEmployeePopup && (
                <PopupForEmployee
                    open={showEmployeePopup}
                    onClose={resetStates}
                    selectedPopUpEmployee={selectedPopUpEmployee}
                    handleSelectPopUpEmployee={handleSelectPopUpEmployee}
                    employeeData={employeeObjectForPopUp}
                    handleTransferToOTP={handleTransferToOTP}
                />
            )}

            {showOTPPopup && (
                <PopUpForOTP
                    open={showOTPPopup}
                    onClose={resetStates}
                    passcode={passcode}
                    handlePasscodeChange={handlePasscodeChange}
                    selectedPopUpEmployee={selectedPopUpEmployee}
                    handleFinalSavePopuUs={handleFinalSavePopuUs}
                />
            )}
        </Stack>
    );
};

export default CustomToolbar;
