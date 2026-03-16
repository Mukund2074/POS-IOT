import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';

import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

import '../../index.css';
import NewBookingForm from '../../components/calanderPopups/NewBookingForm';
import 'moment/locale/nb'; // Import Norwegian Bokmål locale
import '../../components/WeekViewModal.css';

import 'moment/locale/da';

import { CircularProgress, Stack } from '@mui/material';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import apiFetcher from '../../utils/interCeptor';
import { isEmpAvailableOnSpecificSlot } from '../../components/settings/opningHours/utils/Functions';
import CustomToolBar from '../../components/calanderComponents/HelperComponents/CustomToolBar';
import { useDispatch } from 'react-redux';
import { settings } from '../../context/settingsSlice';
import { t } from 'i18next';

import { useSocket } from '../../context/SocketContext';
import { formatPhoneNumber, calendarOpeningHours } from '../../components/calanderComponents/booking/utils/functions';
import Reschedule from '../../components/calanderPopups/Reschedule';
import { HttpStatusCode } from 'axios';
import { CalendarColors } from '../../data/CalendarColors';
import { ReadFormNotificationApi } from '../../utils/Api/Booking';
import FormNotificationModal from '../../components/calanderPopups/FormNotificationModal';

import { CalendarHandler } from './CalendarUtils/CalendarHandlers';
import { calendarApi } from './CalendarUtils/CalendarApis';
import RescheduleBottomModel from '../../components/calanderPopups/RescheduleBottomModel';
import TopReschedulePopup from '../../components/calanderPopups/TopReschedulePopup';
import DynamicOpeningHourMenu from '../../components/calanderPopups/DynamicOpeningHourMenu';
import { reasons } from '../../data/CalendarPauseReasons';
import CustomEvent from '../../components/calanderComponents/HelperComponents/CustomEvent';
import Loader from '../Loader';
import WeeklyHeader from '../../components/calanderComponents/HelperComponents/WeeklyHeader';
import TimeSlotWrapper from '../../components/calanderComponents/HelperComponents/TimeSlotWrapper';
import ResourceHeader from '../../components/calanderComponents/HelperComponents/ResourceHeader';
import CustomTimeHeader from '../../components/calanderComponents/HelperComponents/CustomTimeHeader';
import { useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import BookingDetailsModal from '../../components/calanderComponents/bookingDetails';
import HealthDeclarationBookingModal from '../../components/calanderPopups/HealthDeclarationBooking';

let emIDs = 0;
let stw = moment().startOf('week').format('YYYY-MM-DD');
let enw = moment().endOf('week').format('YYYY-MM-DD');

const DnDCalendar = withDragAndDrop(Calendar);

moment.locale('da'); // Set the global locale to Danish
moment.updateLocale('da', {
    week: {
        dow: 1, // Set Monday as start of week
    },
});
// Ensure the week starts on Monday
moment.updateLocale('en', {
    week: {
        dow: 1, // Set Monday as start of week for English locale too
    },
});
const localizer = momentLocalizer(moment);

const CustomCalendar = () => {
    const user = useSelector((state) => state.user.data);
    const { refreshSettings } = useData();
    const employee = localStorage.getItem('employee_id');
    const [showForm, setShowForm] = useState({
        booking: false,
        detail: false,
        reschedule: false,
        formNotification: false,
        newReschedule: false,
        rescheduleConfirmation: false,
    });
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(moment().toDate());
    const [view, setView] = useState(localStorage.getItem('calendarView') || 'week');
    const [employees, setEmployees] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [currentWeek, setCurrentWeek] = useState(null);
    const [lastValidWeek, setLastValidWeek] = useState(null);
    const [timeSlotHeight, setTimeSlotHeight] = useState('50px');
    const [loading, setLoading] = useState(true);
    const [rescheduleProps, setRescheduleProps] = useState(null);
    const [createEventObj, setCreateEventObj] = useState(null);
    const [pauseProps, setPauseProps] = useState(null);
    const [scheduleChange, setScheduleChange] = useState();
    const [tempId, setTempId] = useState(null);
    const [processingData, setProcessingData] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [currentEmployeeId, setCurrentEmployeeId] = useState(null);
    const [currentWeekStart, setCurrentWeekStart] = useState(null);
    const [formNotifications, setFormNotifications] = useState([]);
    const [notificationFormProp, setNotificationFormProp] = useState({});
    const [empToShow, setEmpToShow] = useState(() => {
        const employee1 = localStorage.getItem('employee_id');
        const storedSelectedEmployees = localStorage.getItem(`selectedEmployees_${employee1}`);
        if (storedSelectedEmployees) {
            return JSON.parse(storedSelectedEmployees);
        }
        return [Number(employee1)]; // Default to current employee if no stored selection
    });

    const [rescheduleData, setRescheduleData] = useState(null);
    const [openingHourEmp, setOpeningHourEmp] = useState({
        data: {},
        existing: {},
        updated: {},
        isChanged: false,
        event: {},
    });
    const [anchorEl, setAnchorEl] = useState(null);
    const [loader, setLoader] = useState(false);
    const [healthDeclarationBooking, setHealthDeclarationBooking] = useState({
        show: false,
        origialBookings: null,
    });

    const open = Boolean(anchorEl);
    const location = useLocation();

    const settingsSelector = useSelector((state) => state.settings);
    const dispatch = useDispatch();
    const { data } = settingsSelector;

    const apiUrl = process.env.REACT_APP_URL;
    const { socketIsOn: socket } = useSocket();
    const selectedLanguage = localStorage.getItem('language');

    // Check if current outlet should block mobile drag and drop
    const shouldBlockMobileDragDrop = useMemo(() => {
        const blockedOutletIds = process.env.REACT_APP_BLOCK_MOBILE_CALENDAR_DRAG_DROP
            ? process.env.REACT_APP_BLOCK_MOBILE_CALENDAR_DRAG_DROP.split(',').map((id) => id.trim())
            : [];

        if (!data?.profile?.id || blockedOutletIds.length === 0) return false;
        return blockedOutletIds.includes(data.profile.id.toString());
    }, [data?.profile?.id]);

    // Detect if device is mobile/touch
    const isMobileDevice = useMemo(() => {
        return (
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0
        );
    }, []);

    const params = useMemo(() => new URLSearchParams(window.location.search), []);

    useEffect(() => {
        refreshSettings();
    }, []);

    // Initialize empToShow with current employee if empty
    useEffect(() => {
        const storageKey = `selectedEmployees_${employee}`;
        if (!employees.length) return;

        const storedIds = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const validIds = storedIds.filter((id) => employees.some((emp) => emp.id === id));

        if (validIds.length !== storedIds.length) {
            localStorage.setItem(storageKey, JSON.stringify(validIds));
        }

        if (!storedIds.length && employee) {
            const initialSelection = [employee];
            localStorage.setItem(storageKey, JSON.stringify(initialSelection));
            setEmpToShow(initialSelection);
        } else if (!empToShow.length) {
            setEmpToShow(validIds);
        }
    }, [employees, employee]);

    // Update emIDs and week dates when empToShow or selectedDate changes
    useEffect(() => {
        if (empToShow && empToShow.length > 0) {
            emIDs = empToShow.join(',');
            stw = moment(selectedDate).startOf('week').format('YYYY-MM-DD');
            enw = moment(selectedDate).endOf('week').format('YYYY-MM-DD');
        }
    }, [empToShow, selectedDate]);

    // Fetch bookings when week or employee selection changes
    useEffect(() => {
        const newWeekStart = moment(selectedDate).startOf('week').format('YYYY-MM-DD');
        const newWeekEnd = moment(selectedDate).endOf('week').format('YYYY-MM-DD');

        // Only fetch if the week has changed or employee selection has changed
        if (newWeekStart !== currentWeekStart || JSON.stringify(empToShow) !== JSON.stringify(currentEmployeeId)) {
            setProcessingData(true);
            const controller = new AbortController();
            const signal = controller.signal;

            setCurrentWeekStart(newWeekStart);
            setCurrentEmployeeId(empToShow);

            // Clear existing events before fetching new ones
            setEvents([]);

            fetchBookings(signal, newWeekStart, newWeekEnd, empToShow);

            return () => controller.abort();
        }
    }, [selectedDate, view, empToShow]);

    const fetchBookings = useCallback(
        async (signal, startWeek, endWeek, empId) => {
            try {
                const response = await apiFetcher.get(
                    `/api/v1/store/booking`,
                    {
                        params: {
                            date: startWeek || moment(selectedDate).startOf('week').format('YYYY-MM-DD'),
                            to_date: endWeek || moment(selectedDate).endOf('week').format('YYYY-MM-DD'),
                            limit: 1000,
                            offset: 0,
                            booking_type: 'All',
                            filter_equipment_bookings: false,
                            employee_id: empId?.join(','),
                            include_calendar_pauses: true,
                        },
                    },
                    signal,
                );

                if (response.data.success) {
                    const hideCancelBookings = data?.calendar?.hide_cancel_bookings;

                    // Helper function to get inspection duration from booking
                    const getInspectionDuration = (booking) => {
                        if (!booking?.inspection_data) {
                            return 0;
                        }
                        return booking.inspection_data.duration || 0;
                    };

                    // Filter bookings based on hide_cancel_bookings setting
                    let filteredBookings = response.data.data;
                    if (hideCancelBookings) {
                        // If hide_cancel_bookings is true, filter out canceled bookings
                        filteredBookings = response.data.data.filter((booking) => booking.status !== 'CANCELLED');
                    }

                    // Group bookings by group_booking_uuid
                    const groupedBookings = new Map();
                    const processedIds = new Set();

                    // First pass: group bookings by group_booking_uuid
                    filteredBookings.forEach((booking) => {
                        if (booking.group_booking_uuid && !processedIds.has(booking.id)) {
                            const groupUuid = booking.group_booking_uuid;
                            const groupBookings = filteredBookings.filter((b) => b.group_booking_uuid === groupUuid);

                            // Sort by start time
                            const sortedBookings = groupBookings.sort((a, b) =>
                                moment(a.booking_datetime_start).diff(moment(b.booking_datetime_start)),
                            );

                            // Find sequential subsets within the group, also checking for same employee
                            const sequentialSubsets = [];
                            let currentSubset = [sortedBookings[0]];

                            for (let i = 1; i < sortedBookings.length; i++) {
                                const currentEnd = moment(sortedBookings[i - 1].booking_datetime_end);
                                const nextStart = moment(sortedBookings[i].booking_datetime_start);
                                const currentEmployee = sortedBookings[i - 1].employee_id;
                                const nextEmployee = sortedBookings[i].employee_id;

                                // Check if the current booking ends exactly when the next one starts (no gap)
                                // and both bookings have the same employee_id
                                if (currentEnd.isSame(nextStart, 'minute') && currentEmployee === nextEmployee) {
                                    currentSubset.push(sortedBookings[i]);
                                } else {
                                    // Gap found or different employee, save current subset if it has more than 1 booking
                                    if (currentSubset.length > 1) {
                                        sequentialSubsets.push([...currentSubset]);
                                    }
                                    // Start new subset
                                    currentSubset = [sortedBookings[i]];
                                }
                            }

                            // Don't forget the last subset
                            if (currentSubset.length > 1) {
                                sequentialSubsets.push(currentSubset);
                            }

                            // Note: Removed the fallback logic that was grouping all bookings with same group_booking_uuid
                            // This was causing bookings with gaps to be incorrectly grouped together

                            // Create grouped events for each sequential subset
                            sequentialSubsets.forEach((subset, index) => {
                                const first = subset[0];
                                const last = subset[subset.length - 1];
                                const services = subset.map((b) => b.booking_details.service_name).join(', ');
                                const serviceIds = subset.map((b) => b.service_id);

                                // Get inspection duration - only from the first (earliest) booking in the group
                                // For group bookings, only the first booking should have driving time
                                const inspectionDuration = getInspectionDuration(first);
                                const firstBookingStart = moment(first.booking_datetime_start);
                                const lastBookingEnd = moment(last.booking_datetime_end);
                                // Keep original start time - driving time will be shown visually above the event

                                // Use unique key for each subset
                                const subsetKey = `${groupUuid}_${index}`;

                                groupedBookings.set(subsetKey, {
                                    id: first.id,
                                    title: services,
                                    start: firstBookingStart.toDate(), // Keep original start time
                                    end: lastBookingEnd.toDate(),
                                    inspectionDuration: inspectionDuration,
                                    inspectionDistance:
                                        first?.inspection_data?.distance_text ||
                                        first?.inspection_data?.distance ||
                                        null,
                                    status: first.status,
                                    resourceId: first.employee_id,
                                    customerName: first.booking_details.customer_name,
                                    customerPhone: first.booking_details.customer_phone_number,
                                    customerNote: first.booking_details.note,
                                    employeeName: first.booking_details.employee_name,
                                    serviceDuration: subset.reduce(
                                        (total, b) => total + (b.booking_details.duration_min || 0),
                                        0,
                                    ),
                                    createdDate: first.created_at,
                                    servicePrice: subset.reduce(
                                        (total, b) => total + (parseFloat(b.total_amount) || 0),
                                        0,
                                    ),
                                    serviceType: subset.map((b) => b.booking_details.service_type).join(', '),
                                    serviceId: serviceIds, // Use the array of service IDs instead of just the first one
                                    employeeId: first.employee_id,
                                    outlet_customer_note: first.booking_details.outlet_customer_note,
                                    type: 'BOOKING',
                                    isEventLoading: false,
                                    online_booking_color: first.booking_details.online_booking_color,
                                    manual_booking_color: first.booking_details.manual_booking_color,
                                    source: first.source,
                                    walk_in: first?.booking_details?.walk_in,
                                    custom_status_id: first?.custom_status_id,
                                    services: services,
                                    serviceIds: serviceIds,
                                    isGrouped: true,
                                    group_booking_uuid: first?.group_booking_uuid,
                                    origialBookings: subset,
                                    bookingIds: subset.map((b) => b.id),
                                    isNewCustomer: first?.booking_details?.new_customer,
                                    health_declaration: first?.health_declaration
                                        ? { ...first.health_declaration, serviceId: serviceIds }
                                        : undefined,
                                });

                                // Mark all bookings in this subset as processed
                                subset.forEach((b) => processedIds.add(b.id));
                            });
                        }
                    });

                    // Create individual bookings for non-grouped or non-sequential bookings
                    let bookings = filteredBookings
                        .filter((booking) => !processedIds.has(booking.id))
                        .map((booking) => {
                            // For bookings with group_booking_uuid, only the earliest booking should have inspection duration
                            let inspectionDuration = 0;
                            if (booking.group_booking_uuid) {
                                // Find all bookings with the same group_booking_uuid
                                const groupBookings = filteredBookings.filter(
                                    (b) => b.group_booking_uuid === booking.group_booking_uuid,
                                );
                                // Sort by start time to find the earliest
                                const sortedGroupBookings = groupBookings.sort((a, b) =>
                                    moment(a.booking_datetime_start).diff(moment(b.booking_datetime_start)),
                                );
                                // Only use inspection duration if this is the earliest booking in the group
                                if (sortedGroupBookings.length > 0 && sortedGroupBookings[0].id === booking.id) {
                                    inspectionDuration = getInspectionDuration(booking);
                                }
                            } else {
                                // For non-grouped bookings, use their own inspection duration
                                inspectionDuration = getInspectionDuration(booking);
                            }

                            const bookingStart = moment(booking.booking_datetime_start);
                            const bookingEnd = moment(booking.booking_datetime_end);
                            // Keep original start time - driving time will be shown visually above the event

                            return {
                                id: booking.id,
                                title: booking.booking_details.service_name,
                                start: bookingStart.toDate(), // Keep original start time
                                end: bookingEnd.toDate(),
                                inspectionDuration: inspectionDuration,
                                inspectionDistance:
                                    booking?.inspection_data?.distance_text ||
                                    booking?.inspection_data?.distance ||
                                    null,
                                status: booking.status,
                                resourceId: booking.employee_id,
                                customerName: booking.booking_details.customer_name,
                                customerPhone: booking.booking_details.customer_phone_number,
                                customerNote: booking.booking_details.note,
                                employeeName: booking.booking_details.employee_name,
                                serviceDuration: booking.booking_details.duration_text,
                                createdDate: booking.created_at,
                                servicePrice: booking.booking_details.price,
                                serviceType: booking.booking_details.service_type,
                                serviceId: booking.service_id,
                                employeeId: booking.employee_id,
                                outlet_customer_note: booking.booking_details.outlet_customer_note,
                                type: 'BOOKING',
                                isEventLoading: false,
                                online_booking_color: booking.booking_details.online_booking_color,
                                manual_booking_color: booking.booking_details.manual_booking_color,
                                source: booking.source,
                                walk_in: booking?.booking_details?.walk_in,
                                custom_status_id: booking?.custom_status_id,
                                group_booking_uuid: booking?.group_booking_uuid,
                                bookingIds: [booking?.id],
                                origialBookings: [booking],
                                isNewCustomer: booking?.booking_details?.new_customer,
                                health_declaration: booking?.health_declaration
                                    ? { ...booking.health_declaration, serviceId: booking.service_id }
                                    : undefined,
                            };
                        });

                    // Combine grouped and individual bookings
                    bookings = [...bookings, ...Array.from(groupedBookings.values())];

                    const calendarPause = response.data.calendar_pauses.map((pauseEvent) => ({
                        id: pauseEvent.id,
                        title: reasons[pauseEvent.reason],
                        reason: pauseEvent.reason,
                        headline: pauseEvent.headline,
                        description: pauseEvent.description,
                        start: moment(pauseEvent.datetime_start).toDate(),
                        end: moment(pauseEvent.datetime_end).toDate(),
                        status: null,
                        resourceId: pauseEvent.employee_id,
                        customerName: '',
                        customerPhone: '',
                        customerNote: '',
                        employeeName: data?.employees?.find((emp) => emp.id == pauseEvent.employee_id)?.name || '',
                        serviceDuration: '',
                        createdDate: pauseEvent.created_at,
                        servicePrice: 0,
                        serviceType: '',
                        serviceId: null,
                        employeeId: pauseEvent.employee_id,
                        type: 'CALENDAR_PAUSE',
                        isEventLoading: false,
                        origialBookings: [pauseEvent],
                    }));

                    // Only update events after all data is processed
                    setEvents([...bookings, ...calendarPause]);
                }
            } catch (error) {
                console.error('Error fetching bookings:', error);
            } finally {
                setProcessingData(false);
            }
        },
        [selectedDate, empToShow, data],
    );

    const refreshBookings = useCallback(() => {
        setProcessingData(true);
        const controller = new AbortController();
        const signal = controller.signal;

        const startWeek = moment(selectedDate).startOf('week').format('YYYY-MM-DD');
        const endWeek = moment(selectedDate).endOf('week').format('YYYY-MM-DD');

        // Clear existing events before fetching new ones
        setEvents([]);

        fetchBookings(signal, startWeek, endWeek, empToShow);

        return () => controller.abort();
    }, [selectedDate, empToShow, fetchBookings]);

    useEffect(() => {
        if (params.get('d') && params.get('i')) {
            setSelectedDate(params.get('d'));
            setSelectedBooking(params.get('i'));
            setShowForm((prev) => ({ ...prev, detail: true }));

            const newParams = new URLSearchParams(window.location.search);
            newParams.delete('d');
            newParams.delete('i');

            // Update the URL without reloading the page
            window.history.replaceState(null, '', `${window.location.pathname}`);
        } else if (location?.state) {
            setShowForm((prev) => ({ ...prev, booking: true }));
            setCreateEventObj({
                date: moment().format('YYYY-MM-DD'),
                employeeId: empToShow[0],
                customerdata: location.state,
            });

            window.history.replaceState(null, '', `${window.location.pathname}`);
        }
    }, [params]);

    useEffect(() => {
        if (empToShow) {
            emIDs = empToShow.join(',');
            stw = moment(selectedDate).startOf('week').format('YYYY-MM-DD');
            enw = moment(selectedDate).endOf('week').format('YYYY-MM-DD');
        }
    }, [empToShow, selectedDate]);

    useEffect(() => {
        if (!socket) return;
        // Handler for bookings_updated
        const handleBookingsUpdated = (data) => {
            const employee1 = localStorage.getItem('employee_id');
            const storedSelectedEmployees = JSON.parse(localStorage.getItem(`selectedEmployees_${employee1}`) || '[]');
            if (storedSelectedEmployees?.includes(data?.employeeId)) {
                const storageKey = `selectedEmployees_${employee}`;
                const storedIds = JSON.parse(localStorage.getItem(storageKey) || '[]');

                const controller = new AbortController();
                const signal = controller.signal;
                fetchBookings(signal, stw, enw, storedIds);
                calendarApi.getNotification({ eid: localStorage.getItem('employee_id'), setNotifications });
            } else if (!data?.employeeId) {
                const storageKey = `selectedEmployees_${employee}`;
                const storedIds = JSON.parse(localStorage.getItem(storageKey) || '[]');
                const controller = new AbortController();
                const signal = controller.signal;
                fetchBookings(signal, stw, enw, storedIds);
                calendarApi.getNotification({ eid: localStorage.getItem('employee_id'), setNotifications });
            }
            // getFormNotifications(); // Only if you want this on bookings_updated too
        };

        // Handler for process_customer_info
        const handleCustomerInfo = () => {
            calendarApi.getFormNotifications({ setFormNotifications });
        };

        socket.on('bookings_updated', handleBookingsUpdated);
        socket.on('process_customer_info', handleCustomerInfo);

        return () => {
            socket.off('bookings_updated', handleBookingsUpdated);
            socket.off('process_customer_info', handleCustomerInfo);
        };
    }, [socket]);

    const [calendar, setCalendar] = useState({
        setCalendarOpeningHour: 240,
        setCalendarClosingHour: 240,
        grayOutClosedHours: false,
        showOnlyAvailableEmployee: false,
        calendarInterval: 15,
    });

    useEffect(() => {
        if (data?.calendar) {
            const retValue = data?.calendar;
            setCalendar(retValue);
        }
    }, [data?.calendar]);

    useEffect(() => {
        if (calendar) {
            const { calendarInterval } = calendar;

            let slotHeightsinPixel = '50px';
            if (calendarInterval == 5) {
                slotHeightsinPixel = '15px';
            } else if (calendarInterval == 10) {
                slotHeightsinPixel = '25px';
            } else if (calendarInterval == 15) {
                slotHeightsinPixel = '35px';
            } else if (calendarInterval == 30) {
                slotHeightsinPixel = '55px';
            } else if (calendarInterval == 60) {
                slotHeightsinPixel = '120px';
            }

            setTimeSlotHeight(slotHeightsinPixel);
        }
    }, [calendar]);

    const handleEventClick = (event) => {
        setRescheduleData(null);
        setShowForm((prev) => ({ ...prev, reschedule: false, rescheduleConfirmation: false, newReschedule: false }));
        if (event.type === 'CALENDAR_PAUSE') {
            const selectedEvent = {
                booking: {
                    ...event,
                    booking_datetime_start: event?.start,
                    booking_datetime_end: event?.end,
                    booking_details: {
                        duration_min: moment(event?.end).diff(moment(event?.start), 'minutes'),
                        employee_name: data?.employees?.find((emp) => emp.id == event.employeeId)?.name || '',
                    },
                    employee_id: event.employeeId,
                },
            };
            setRescheduleData(selectedEvent);
            setShowForm((prev) => ({ ...prev, newReschedule: true }));
            // setPauseProps(event);
            // setShowForm((prev) => ({ ...prev, booking: true }));
        } else if (!event?.isEventLoading) {
            setSelectedBooking(event?.id);
            setShowForm((prev) => ({ ...prev, detail: true }));
        }
    };

    useEffect(() => {
        calendarApi.fetchSettingsNew({ setEmployees, dispatch, settings, setLoading });
        calendarApi.getFormNotifications({ setFormNotifications });
        calendarApi.getNotification({ eid: localStorage.getItem('employee_id'), setNotifications });
        calendarApi?.getCalendarOpeningHour({ setOpeningHourEmp: setOpeningHourEmp, setLoader });
    }, []);

    useEffect(() => {
        if (empToShow?.length >= 2) {
            const timeContent = document.querySelector('.rbc-time-content');
            const timeHeader = document.querySelector('.rbc-time-header');

            timeContent?.style?.setProperty('--min-width', `${135 * employees.length}px`);
            timeHeader?.style?.setProperty('--min-width', `${135 * employees.length}px`);

            // if (calendar?.showOnlyAvailableEmployee) {
            //   checkAvailability(selectedDate, view)
            // }
        }
    }, [empToShow, selectedDate, calendar, employees]);

    const isSlotAvailable = (currentSlot, resourceId) => {
        const { is_individual_opening_hour, employees_opening_hour } = data;
        // if individual opening hour is false then all slots will be available
        // so no need to check individual employee opening hour
        if (!is_individual_opening_hour) {
            return true;
        }

        const currentDay = moment(currentSlot).locale('en-gb').format('dddd');
        if (data?.schedule?.find((dayObj) => dayObj.day === currentDay)?.is_closed) {
            return false;
        }
        // if there is no resourceId then it means it is day selected
        let selectedEmpId = empToShow;
        if (resourceId) {
            selectedEmpId = resourceId;
        }

        let selectedEmployeeHours = employees_opening_hour.find((empObj) => empObj.id == selectedEmpId);
        if (selectedEmployeeHours) {
            return isEmpAvailableOnSpecificSlot(selectedEmployeeHours, moment(currentSlot));
        } else {
            return false;
        }
    };

    const openForm = () => {
        const props = {
            date: selectedDate,
            employeeId: empToShow,
        };

        setCreateEventObj(props);
        setShowForm((prev) => ({ ...prev, booking: true }));
    };

    const closeForm = () => {
        setRescheduleProps(null);
        setShowForm((prev) => ({
            ...prev,
            booking: false,
            formNotification: false,
        }));
        setPauseProps(null);
        setSelectedBooking(null);
        setTempId(null);
        setEvents((prev) => prev.filter((item) => item?.id !== tempId));
        setNotificationFormProp(null);
    };

    const closeReschedule = () => {
        setShowForm((prev) => ({ ...prev, reschedule: false, copyBookingSummary: false, isCopyBooking: false }));
        setScheduleChange(null);
    };

    const scrollToTime = moment().subtract(1, 'hour').subtract(30, 'minutes');

    const formats = {
        dayFormat: (date, culture, localizer) => {
            if (empToShow?.length >= 2) {
                return employees.map((employee) => employee?.name || 'No Name').join('\n');
            } else {
                return (
                    localizer.format(date, 'dddd', culture).charAt(0).toUpperCase() +
                    localizer.format(date, 'dddd', culture).slice(1) +
                    `\n${localizer.format(date, 'DD/MM', culture)}`
                );
            }
        },
        selectRangeFormat: ({ start, end }, culture, localizer) =>
            localizer.format(start, 'HH:mm', culture) + ' - ' + localizer.format(end, 'HH:mm', culture),
        eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
            localizer.format(start, 'HH:mm', culture) + ' - ' + localizer.format(end, 'HH:mm', culture),

        timeGutterFormat: 'HH:mm',
    };

    useEffect(() => {
        if (empToShow?.length >= 2) {
            setView('day');
            localStorage.setItem('calendarView', 'day');
        } else {
            setView('week');
            localStorage.setItem('calendarView', 'week');
        }
    }, [empToShow]);

    const updateTimeIndicator = (view) => {
        const timeIndicator = document.querySelector('.rbc-current-time-indicator');

        if (timeIndicator) {
            const nDayOfWeek = moment().day();

            let nOfEmployee = employees.length;
            if (empToShow?.length > 0) {
                nOfEmployee = empToShow.length;
            }
            let left;
            let width;

            if (view == 'day') {
                left = 0;
                width = 100;

                if (empToShow?.length > 0) {
                    if (nOfEmployee > 0) {
                        width = nOfEmployee * 100;
                    }
                }
            } else {
                if (nDayOfWeek == 0) {
                    left = -600;
                } else {
                    left = (nDayOfWeek - 1) * -100;
                }
                width = 700;
            }

            timeIndicator.style.setProperty('--width', `${width}%`);
            timeIndicator.style.setProperty('--left', `${left}%`);
            timeIndicator.style.setProperty('--display', `flex`);
        }
    };

    // Handle week number updates
    useEffect(() => {
        const updateWeekNumber = () => {
            if (selectedDate) {
                const weekNumber = moment(selectedDate).isoWeek();
                setCurrentWeek(weekNumber);
                setLastValidWeek(weekNumber);
            }
        };

        updateWeekNumber();
    }, [selectedDate, view]);

    function isEventOverlapping(eventsList, newEvent) {
        let events = [...eventsList];
        const newStart = moment(newEvent.start);
        const newEnd = moment(newEvent.end);
        let updatedEvents = [];
        for (const event of events) {
            const start = moment(event.start);
            const end = moment(event.end);
            // Check if new event overlaps with the current eventin
            if (
                event.id !== newEvent?.event?.id &&
                newStart.isBefore(end) &&
                newEnd.isAfter(start) &&
                event?.resourceId === newEvent?.resourceId
            ) {
                return { isOverlap: true, updatedEvents, event: event }; // Overlap found
            } else {
                if (event.id === newEvent?.event?.id) {
                    updatedEvents.push({
                        ...event,
                        start: newEvent.start,
                        end: newEvent.end,
                    });
                    // event.start = start;
                    // event.end = end;
                } else {
                    updatedEvents.push(event);
                }
            }
        }

        // console.log('[UPDATED EVENTS FROM IS EVENT OVERLAPPING]', updatedEvents);

        return { isOverlap: false, updatedEvents }; // Overlap found
    }

    const allowReschdule = (eventData) => {
        if (eventData) {
            if (!user?.settings.reschedule_all_bookings && user?.id != eventData.employeeId && user?.role != 'ADMIN') {
                toast.error(t('Calendar.ToastErrPermission'), {
                    toastId: 'customId',
                });
                return false;
            } else {
                if (
                    !user?.settings.reschedule_own_bookings &&
                    user?.id == eventData.employeeId &&
                    user?.role != 'ADMIN'
                ) {
                    toast.error(t('Calendar.ToastErrPermission'), {
                        toastId: 'customId',
                    });
                    return false;
                }
            }
        }

        return true;
    };

    const rescheduleBooking = async (payload) => {
        try {
            const response = await apiFetcher.post(`api/v1/store/booking/reschedule`, {
                ...payload,
                google_calendar_sync: true,
            });

            if (response.status === HttpStatusCode.Ok) {
                toast.success(t('Calendar.ToastSuccessBookingReschedule'));
            } else {
                toast.error(t('Calendar.ToastErrBookingReschedule'));
            }
        } catch (error) {
            console.error('Error rescheduling booking:', error);
            toast.error(error?.response?.data?.detail);
        } finally {
            refreshBookings();
        }
    };

    const reschedulePauseHours = async (eventId, payload) => {
        try {
            const endpoint = `${apiUrl}/api/v1/store/employee/pause-calendar/${eventId}`;
            const response = await apiFetcher.put(endpoint, payload);

            if (response.status === HttpStatusCode.Ok) {
                toast.success(t('Calendar.ToastSuccessPauseReschedule'));
            } else {
                toast.error(t('Calendar.ToastErrPauseReschedule'));
            }
        } catch (error) {
            console.error('Error rescheduling pause hours:', error.response.data.detail);
            toast.error(error.response.data.detail);
        } finally {
            refreshBookings();
        }
    };

    const handleGroupBookingResize = async (eventData) => {
        const { event, start, end, resourceId } = eventData;

        try {
            // Fetch the individual bookings for this group
            const response = await apiFetcher.get(`/api/v1/store/booking/${event.id}`);
            if (!response.data.success) {
                toast.error(t('Calendar.ToastErrBookingReschedule'));
                return;
            }

            const bookingDetails = response.data.data;
            const groupBookings = [bookingDetails.booking, ...bookingDetails.group_bookings];

            // Sort bookings by start time to get first and last services
            const sortedBookings = groupBookings
                ?.filter((booking) => event?.serviceIds?.includes(booking.service_id))
                .sort((a, b) => moment(a.booking_datetime_start).diff(moment(b.booking_datetime_start)));

            // Find the ORIGINAL largest service duration in the bunch booking (from original bookings)
            // Note: This should ideally come from the event's original data, not fresh API fetch
            const originalLargestServiceDuration = Math.max(
                ...sortedBookings.map((booking) => booking.booking_details.duration_min || 0),
            );

            const originalStart = moment(event.start);
            const originalEnd = moment(event.end);
            const newStart = moment(start);
            const newEnd = moment(end);

            // Calculate the new total duration
            const newTotalDuration = newEnd.diff(newStart, 'minutes');

            // Check if the new duration is less than the ORIGINAL largest service duration minus 1 minute
            const minAllowedDuration = originalLargestServiceDuration - 1;

            if (newTotalDuration < minAllowedDuration) {
                toast.error(
                    t('Calendar.MinDurationError', {
                        minDuration: minAllowedDuration,
                        defaultValue: `Booking duration cannot be reduced below ${minAllowedDuration} minutes (largest service duration minus 1 minute)`,
                    }),
                );
                return;
            }

            // Determine if resize is at top (start changed) or bottom (end changed)
            const isTopResize = !newStart.isSame(originalStart, 'minute');
            const isBottomResize = !newEnd.isSame(originalEnd, 'minute');

            let targetBooking = null;
            let newTimeSlot = '';

            if (isTopResize) {
                // Extend first service duration
                targetBooking = sortedBookings[0];
                const durationDiff = originalStart.diff(newStart, 'minutes');
                const newStartTime = moment(targetBooking.booking_datetime_start).subtract(durationDiff, 'minutes');
                const newEndTime = moment(targetBooking.booking_datetime_end);
                newTimeSlot = `${newStartTime.format('HH:mm')} - ${newEndTime.format('HH:mm')}`;
            } else if (isBottomResize) {
                // Extend last service duration
                targetBooking = sortedBookings[sortedBookings.length - 1];
                const durationDiff = newEnd.diff(originalEnd, 'minutes');
                const newStartTime = moment(targetBooking.booking_datetime_start);
                const newEndTime = moment(targetBooking.booking_datetime_end).add(durationDiff, 'minutes');
                newTimeSlot = `${newStartTime.format('HH:mm')} - ${newEndTime.format('HH:mm')}`;
            }

            if (targetBooking) {
                const payload = {
                    id: targetBooking.id,
                    booking_date: moment(start).format('YYYY-MM-DD'),
                    time_slot: newTimeSlot,
                    employee_id: resourceId || event.employeeId,
                    total_amount: targetBooking.total_amount,
                    update_duration: true,
                    allow_past_date: true,
                    send_email: false,
                    send_sms: false,
                };

                await rescheduleBooking(payload);
            }
        } catch (error) {
            console.error('Error resizing group booking:', error);
            toast.error(t('Calendar.ToastErrBookingReschedule'));
        }
    };

    const handleEventUpdate = async (eventData, isResizing = false) => {
        console.log('🔧 [DEBUG] handleEventUpdate called with:', { eventData, isResizing });
        const { event, start, end, resourceId, send_email, send_sms } = eventData;

        if (!allowReschdule(event)) {
            return false;
        }

        // Handle group booking resize through popup
        if (event.isGrouped && isResizing) {
            await handleGroupBookingResize(eventData);
            return;
        }

        let newEvents = [...events];
        if (resourceId) {
            newEvents = events.filter((eventObj) => eventObj?.employeeId === resourceId);
        }
        const propEvent = {
            ...eventData,
            resourceId: resourceId ? resourceId : empToShow[0],
        };
        const { isOverlap, updatedEvents } = isEventOverlapping(newEvents, propEvent);

        if (!data?.calendar?.allow_overlap && isOverlap) {
            toast.error(t('Calendar.ToastErrOverlap'));
            return;
        }

        if (updatedEvents.length > 0) {
            setEvents(updatedEvents);
        }

        const date = moment(eventData?.date ? eventData?.date : start).format('YYYY-MM-DD');
        const timeSlot = `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`;

        if (event.type !== 'BOOKING') {
            const payload = {
                id: event.id,
                employee_id: event.employeeId,
                datetime_start: moment(start).format('YYYY-MM-DD HH:mm:ss'),
                datetime_end: moment(end).format('YYYY-MM-DD HH:mm:ss'),
                google_calendar_sync: true,
            };
            reschedulePauseHours(event.id, payload);
            return;
        }

        const payload = {
            id: event.id,
            booking_date: date,
            time_slot: timeSlot,
            employee_id: resourceId || event.employeeId,
            total_amount: event.servicePrice,
            update_duration: isResizing,
            allow_past_date: true,
            send_email: send_email,
            send_sms: send_sms,
        };

        rescheduleBooking(payload);
    };

    useEffect(() => {
        CalendarHandler.handleOpeningHourTrack(
            openingHourEmp?.data,
            view === 'day' ? anchorEl : { id: empToShow[0] },
            selectedDate,
            setOpeningHourEmp,
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [anchorEl]);

    const calendarSettings = (date) => {
        const { schedule, outlet_holidays } = data;

        const closedDays = [];
        if (schedule) {
            schedule.forEach((dayObj) => {
                if (dayObj?.is_closed) {
                    closedDays.push(dayObj.day);
                }
            });
        }

        if (closedDays.includes(`${moment(date).locale('en-gb').format('dddd')}`)) {
            return true;
        } else {
            const outletValues = outlet_holidays.map((outletObj) => {
                if (
                    moment(date).isSameOrAfter(moment(outletObj?.start_date, 'YYYY-MM-DD'), 'date') &&
                    moment(date).isSameOrBefore(moment(outletObj?.end_date, 'YYYY-MM-DD'), 'date')
                ) {
                    return true;
                }
            });

            if (outletValues.includes(true)) {
                // return true
                return true;
            }
        }

        // return false
        return false;
    };

    const handleReschedule = (event) => {
        let allBookings = [event?.booking, ...event?.group_bookings];
        let duration = [];
        for (let minute = 5; minute <= 1440; minute += 5) {
            let label;
            if (minute < 60) {
                label = `${minute} min`;
            } else if (minute % 60) {
                label = `${Math.floor(minute / 60)} hr ${minute % 60} min`;
            } else if (minute % 60 === 0) {
                const hours = Math.floor(minute / 60);
                label = `${hours} hr`;
            }

            duration.push({
                value: minute,
                label,
                minutes: minute,
            });
        }

        let formatBooking =
            allBookings &&
            allBookings.map((item) => ({
                booking_id: item?.id,
                selectedService: {
                    id: item?.service_id,
                    name: item?.booking_details?.service_name,
                },
                selectedEmployee: {
                    id: item?.employee_id,
                    name: item?.booking_details?.employee_name,
                    label: item?.booking_details?.employee_name,
                    value: item?.employee_id,
                },
                available_time: `${moment(item?.booking_datetime_start).format('HH:mm')} - ${moment(
                    item?.booking_datetime_start,
                )
                    .add(30, 'minutes')
                    .format('HH:mm')}`,
                duration_min: item?.booking_details?.duration_min,
                price: item?.booking_details?.price,
                durationList: duration,
            }));

        let formattedEvent = {
            employeeId: event?.booking?.employee_id,
            booking_id: event?.booking?.id,
            selectedCustomer: {
                id: event?.booking?.outlet_customer?.id,
                label: `${event?.booking?.outlet_customer?.name} (${formatPhoneNumber(
                    event?.booking?.outlet_customer?.phone_number,
                )})`,
                name: event?.booking?.outlet_customer?.name,
                phone_number: event?.booking?.outlet_customer?.phone_number,
            },
            date: moment(event?.booking?.booking_datetime_start),
            note: event?.booking?.booking_details?.note,
            walk_in: event?.booking?.booking_details?.walk_in,
            send_email: event?.booking?.send_email,
            send_sms: event?.booking?.send_sms,
        };

        let prop = { booking: formatBooking, ...formattedEvent };
        if (event?.booking?.inspection_data) {
            prop.inspection_data = event?.booking?.inspection_data;
        }
        setRescheduleProps(prop);
        setShowForm({ detail: false, booking: true });
    };

    const validatePause = (prop) => {
        let valid =
            events &&
            !events.some((event) => {
                const eventStart = moment(event.start);
                const eventEnd = moment(event.end);
                const propStart = moment(prop.datetime_start, 'YYYY-MM-DD HH:mm:ss');
                const propEnd = moment(prop.datetime_end, 'YYYY-MM-DD HH:mm:ss');

                if (event?.id === prop?.pauseProps) {
                    return false; // Do not consider the event with the same id as a conflict
                } else {
                    return (
                        propStart.isBefore(eventEnd) &&
                        propEnd.isAfter(eventStart) &&
                        prop.employee_ids.includes(event.employeeId) &&
                        !event?.id === tempId
                    ); // Overlap detected
                }
            });

        return valid;
    };

    const handleSelectSlot = ({ start, end, resourceId, action }) => {
        const newEvent = {
            start: start,
            end: end,
            resourceId: resourceId ?? empToShow[0],
        };

        const targetResourceId = resourceId ?? empToShow[0];
        newEvent.resourceId = targetResourceId;
        const isOverlaped = isEventOverlapping(events, newEvent);

        if (!data?.calendar?.allow_overlap && isOverlaped?.isOverlap) {
            if (action === 'click') {
                const slotMinutes = Number(calendar?.calendarInterval) || 15;
                // const guardLimit = Math.ceil((24 * 60) / slotMinutes);
                let candidateStart = moment(start).startOf('minute').add(slotMinutes, 'minutes');
                let slotFound = false;

                newEvent.start = candidateStart.toDate();
                newEvent.end = candidateStart.clone().add(slotMinutes, 'minutes').toDate();
                slotFound = true;

                if (!slotFound) {
                    toast.error(t('Calendar.ToastErrOverlap'));
                    return;
                }
            } else {
                toast.error(t('Calendar.ToastErrOverlap'));
                return;
            }
        }

        setRescheduleData((prev) => ({ ...prev, type: 'BOOKING', event: newEvent }));
        if (rescheduleData && showForm?.newReschedule) {
            if (rescheduleData?.booking?.type === 'CALENDAR_PAUSE') {
                if (rescheduleData?.booking?.employeeId !== newEvent?.resourceId) {
                    toast.error(t('Calendar.Invalid'));
                    return;
                }
            }

            if (rescheduleData && showForm?.isCopyBooking) {
                setShowForm((prev) => ({ ...prev, copyBookingSummary: true }));
                return;
            }

            setShowForm((prev) => ({ ...prev, rescheduleConfirmation: true }));
            return;
        }

        // action is click
        if (action === 'click') {
            const startDate = moment(start);
            const endDate = moment(start);

            // if both start and end are same, then open popup but set only start time and not end time and  return
            setCreateEventObj({
                date: startDate.format('YYYY-MM-DD'),
                serviceId: null,
                employeeId: resourceId ?? empToShow[0],
                employeeName: '',
                timeSlot: `${startDate.format('HH:MM')} - ${endDate.format('HH:MM')}`,
                start_time: startDate.format('YYYY-MM-DD HH:mm:ss'),
                end_time: null,
                price: null,
            });

            let id = moment().format('x');
            setTempId(id);
            let obj = {
                id: id,
                start: moment(start).toDate(),
                end: null,
                status: 'BOOKED',
                resourceId: resourceId,
                employeeId: resourceId ?? empToShow[0],
                type: 'BOOKING',
            };

            setEvents((prev) => [...prev, obj]);
            setShowForm((prev) => ({ ...prev, booking: true }));

            return;
        }

        // Only proceed if this is a select action (drag) and not a click
        if (action === 'select') {
            const startDate = moment(start);
            const endDate = moment(end);
            const durationInMinutes = endDate.diff(startDate, 'minutes');

            // Only create event if duration is greater than or equal to the minimum slot duration
            // and start time is different from end time (indicating drag)
            if (durationInMinutes >= (calendar?.calendarInterval ?? 15) && !startDate.isSame(endDate)) {
                setCreateEventObj({
                    date: startDate.format('YYYY-MM-DD'),
                    serviceId: null,
                    employeeId: targetResourceId,
                    employeeName: '',
                    timeSlot: `${startDate.format('HH:mm')} - ${endDate.format('HH:mm')}`,
                    start_time: startDate.format('YYYY-MM-DD HH:mm:ss'),
                    end_time: endDate.format('YYYY-MM-DD HH:mm:ss'),
                    price: null,
                });

                let id = moment().format('x');
                setTempId(id);
                let obj = {
                    id: id,
                    start: moment(start).toDate(),
                    end: moment(end).toDate(),
                    status: 'BOOKED',
                    resourceId: targetResourceId,
                    employeeId: targetResourceId,
                    type: 'BOOKING',
                };

                setEvents((prev) => [...prev, obj]);
                setShowForm((prev) => ({ ...prev, booking: true }));
            }
        }
    };

    const readAllNotifications = async () => {
        const emp_id = localStorage.getItem('employee_id');
        try {
            if (notifications[0]?.unread_count > 0) {
                const response = await apiFetcher.post(`api/v1/store/notifications/read-all?employee_id=${emp_id}`);
                if (response.status === HttpStatusCode.Ok) {
                    toast.success(t('Calendar.ToastSuccessReadAll'));
                    calendarApi.getNotification({ eid: localStorage.getItem('employee_id'), setNotifications });
                }
            } else {
                toast.error(t('Calendar.ToastErrNoUnread'));
            }
        } catch (error) {
            toast.error(t('Calendar.ToastErrReadAll'));
        }
    };

    const handleNotificationClick = async ({ item }) => {
        try {
            const emp_id = localStorage.getItem('employee_id');

            if (!item?.is_read) {
                const response = await apiFetcher.post(
                    `api/v1/store/notifications/${item?.id}/read?employee_id=${emp_id}`,
                );
                if (response.status === HttpStatusCode.Ok) {
                    setSelectedDate(moment(item.booking_datetime_start, 'YYYY-MM-DDTHH:mm:ss'));
                    setSelectedBooking(item?.booking_id);
                    setShowForm((prev) => ({ ...prev, detail: true }));
                    calendarApi.getNotification({ eid: emp_id, setNotifications });
                }
            } else {
                calendarApi.getNotification({ eid: emp_id, setNotifications });
                setSelectedDate(moment(item.booking_datetime_start, 'YYYY-MM-DDTHH:mm:ss'));
                setSelectedBooking(item?.booking_id);
                setShowForm((prev) => ({ ...prev, detail: true }));
            }
        } catch (error) {
            toast.error(t('Calendar.ToastErrRead'));
        }
    };

    const handleFormNotificationClick = async ({ item }) => {
        try {
            if (!item?.is_read) {
                await ReadFormNotificationApi({ id: item?.id });
            }
            setNotificationFormProp(item);
            setShowForm((prev) => ({ ...prev, formNotification: true }));
        } catch (error) {
            toast.error(t('Calendar.ToastErrRead'));
        }
    };

    const handleBunchBookingEdit = async ({
        event,
        start,
        end,
        resourceId,
        isDragAndDrop = false,
        shortenedDuration = null,
        send_email = false,
        send_sms = false,
    }) => {
        // console.log('🔧 [DEBUG] handleBunchBookingEdit called with:', {
        //     start: moment(start).format('YYYY-MM-DD HH:mm'),
        //     end: moment(end).format('YYYY-MM-DD HH:mm'),
        //     isDragAndDrop,
        //     shortenedDuration,
        //     eventId: event.id,
        // });

        // Create the bunch booking object structure
        const bunchBookingObject = {
            booking_id: event.id,
            booking_date: moment(start).format('YYYY-MM-DD'),
            note: event.customerNote || '',
            send_email: send_email,
            send_sms: send_sms,
            need_customer_info: false,
            customer_info_metadata: [],
            services: [],
            edit_only: true,
        };

        // If it's a grouped booking, create services from the original bookings
        if (event.isGrouped && event.origialBookings) {
            // Sort all grouped bookings by time from top to bottom
            const sortedBookings = event.origialBookings.sort((a, b) =>
                moment(a.booking_datetime_start).diff(moment(b.booking_datetime_start)),
            );

            // console.log(
            //     '📋 [DEBUG] Original bookings:',
            //     sortedBookings.map((b) => ({
            //         id: b.id,
            //         start: moment(b.booking_datetime_start).format('HH:mm'),
            //         end: moment(b.booking_datetime_end).format('HH:mm'),
            //         duration: b.booking_details.duration_min,
            //     })),
            // );

            // Handle drag and drop case - move all bookings as a group without changing durations
            if (isDragAndDrop) {
                // console.log('🔄 [DEBUG] DRAG AND DROP MODE - Moving all bookings as group');

                // Calculate the time difference from the original group start to the new start
                const originalGroupStart = moment(sortedBookings[0].booking_datetime_start);
                // const originalGroupEnd = moment(sortedBookings[sortedBookings.length - 1].booking_datetime_end);
                const timeDifference = moment(start).diff(originalGroupStart, 'minutes');

                // console.log('⏰ [DEBUG] Time calculations:', {
                //     originalStart: originalGroupStart.format('HH:mm'),
                //     originalEnd: originalGroupEnd.format('HH:mm'),
                //     newStart: moment(start).format('HH:mm'),
                //     newEnd: moment(end).format('HH:mm'),
                //     timeDifference: timeDifference + ' minutes',
                // });

                sortedBookings.forEach((booking, index) => {
                    // Move each booking by the same time difference
                    const originalStart = moment(booking.booking_datetime_start);
                    const originalEnd = moment(booking.booking_datetime_end);

                    let newStart = originalStart.clone().add(timeDifference, 'minutes');
                    let newEnd = originalEnd.clone().add(timeDifference, 'minutes');

                    // console.log(`📝 [DEBUG] Processing booking ${index}:`, {
                    //     originalStart: originalStart.format('HH:mm'),
                    //     originalEnd: originalEnd.format('HH:mm'),
                    //     newStart: newStart.format('HH:mm'),
                    //     newEnd: newEnd.format('HH:mm'),
                    //     isLast: index === sortedBookings.length - 1,
                    // });

                    // If there's a shortened duration and this is the last booking, adjust its duration
                    if (shortenedDuration && index === sortedBookings.length - 1) {
                        // Parse shortened duration to get minutes
                        let shortenedMinutes = 0;
                        if (typeof shortenedDuration === 'string') {
                            if (shortenedDuration.includes('hr')) {
                                const parts = shortenedDuration.split(' ');
                                const hours = parseInt(parts[0]) || 0;
                                const minutes = parseInt(parts[2]) || 0;
                                shortenedMinutes = hours * 60 + minutes;
                            } else {
                                shortenedMinutes = parseInt(shortenedDuration) || 0;
                            }
                        } else {
                            shortenedMinutes = shortenedDuration;
                        }

                        // Deduct the shortened duration from the last booking's end time
                        newEnd = newEnd.subtract(shortenedMinutes, 'minutes');
                        // console.log('✂️ [DEBUG] Last booking shortened:', {
                        //     originalDuration: booking.booking_details.duration_min + ' min',
                        //     shortenedBy: shortenedMinutes + ' min',
                        //     newDuration: newEnd.diff(newStart, 'minutes') + ' min',
                        // });
                    }

                    bunchBookingObject.services.push({
                        service_id: booking.service_id,
                        time_slot: `${newStart.format('HH:mm')} - ${newEnd.format('HH:mm')}`,
                        employee_id: resourceId || event.employeeId,
                        duration: newEnd.diff(newStart, 'minutes'),
                        total_amount: booking.booking_details.price || booking.total_amount,
                        booking_id: booking.id,
                    });
                });

                // console.log('✅ [DEBUG] Final bunch booking object:', bunchBookingObject);
            } else {
                // Get the original start and end times of the group
                const originalGroupStart = moment(sortedBookings[0].booking_datetime_start);
                const originalGroupEnd = moment(sortedBookings[sortedBookings.length - 1].booking_datetime_end);

                // Use the new start and end times from the form
                const newStart = moment(start);
                const newEnd = moment(end);

                // Determine if the change is from the top (start time changed) or bottom (end time changed)
                const isTopChange = !newStart.isSame(originalGroupStart, 'minute');
                const isBottomChange = !newEnd.isSame(originalGroupEnd, 'minute');

                // Check if we're shortening the booking - compare original vs new duration
                const originalGroupDuration = originalGroupEnd.diff(originalGroupStart, 'minutes');
                const newGroupDuration = newEnd.diff(newStart, 'minutes');
                const isShorteningBooking = newGroupDuration < originalGroupDuration;

                // Check individual direction changes for expanding only
                // const topDurationDiff = originalGroupStart.diff(newStart, 'minutes');
                // const bottomDurationDiff = newEnd.diff(originalGroupEnd, 'minutes');
                // const isExpandingAtTop = isTopChange && topDurationDiff > 0;
                // const isExpandingAtBottom = isBottomChange && bottomDurationDiff > 0;

                // console.log('🔍 [DEBUG] Change detection:', {
                //     isTopChange,
                //     isBottomChange,
                //     isShorteningBooking,
                //     originalGroupStart: originalGroupStart.format('HH:mm'),
                //     originalGroupEnd: originalGroupEnd.format('HH:mm'),
                //     newStart: newStart.format('HH:mm'),
                //     newEnd: newEnd.format('HH:mm'),
                // });

                if (isTopChange && isBottomChange) {
                    // Both start and end times changed - redistribute time proportionally
                    let currentStart = newStart.clone();

                    // Calculate total duration available
                    const totalDurationAvailable = newEnd.diff(newStart, 'minutes');
                    const totalOriginalDuration = originalGroupEnd.diff(originalGroupStart, 'minutes');

                    // Calculate the time difference to distribute
                    const timeDifference = totalDurationAvailable - totalOriginalDuration;

                    // Calculate how much time to add to each booking proportionally
                    const timePerBooking = timeDifference / sortedBookings.length;

                    sortedBookings.forEach((booking, index) => {
                        let serviceStart, serviceEnd;

                        if (index === sortedBookings.length - 1) {
                            // Last booking: use currentStart and new end time
                            serviceStart = currentStart.clone();
                            serviceEnd = newEnd.clone();
                        } else {
                            // Other bookings: use currentStart and original duration plus proportional time
                            serviceStart = currentStart.clone();
                            const originalDuration = moment(booking.booking_datetime_end).diff(
                                moment(booking.booking_datetime_start),
                                'minutes',
                            );
                            const newDuration = originalDuration + timePerBooking;
                            serviceEnd = serviceStart.clone().add(newDuration, 'minutes');
                        }

                        currentStart = serviceEnd; // Move to next slot

                        bunchBookingObject.services.push({
                            service_id: booking.service_id,
                            time_slot: `${serviceStart.format('HH:mm')} - ${serviceEnd.format('HH:mm')}`,
                            employee_id: resourceId || event.employeeId,
                            duration: serviceEnd.diff(serviceStart, 'minutes'),
                            total_amount: booking.booking_details.price || booking.total_amount,
                            booking_id: booking.id,
                        });
                    });

                    // console.log('✅ [DEBUG] Both top and bottom change - Final object:', bunchBookingObject);
                } else if (isTopChange) {
                    let currentStart = newStart.clone();

                    sortedBookings.forEach((booking, index) => {
                        let serviceStart, serviceEnd;

                        if (index === sortedBookings.length - 1) {
                            // Last booking: use currentStart and new end time
                            serviceStart = currentStart.clone();
                            serviceEnd = newEnd.clone();
                        } else {
                            // Other bookings: use currentStart and original duration
                            serviceStart = currentStart.clone();
                            const originalDuration = moment(booking.booking_datetime_end).diff(
                                moment(booking.booking_datetime_start),
                                'minutes',
                            );
                            serviceEnd = serviceStart.clone().add(originalDuration, 'minutes');
                        }

                        // Round start and end times to 5-minute increments
                        const roundedStart = moment(serviceStart)
                            .startOf('minute')
                            .minute(Math.floor(serviceStart.minute() / 5) * 5);
                        const roundedEnd = moment(serviceEnd)
                            .startOf('minute')
                            .minute(Math.ceil(serviceEnd.minute() / 5) * 5);

                        // Calculate duration in 5-minute increments
                        const duration = Math.ceil(roundedEnd.diff(roundedStart, 'minutes') / 5) * 5;

                        currentStart = roundedEnd; // Move to next slot using rounded end time

                        bunchBookingObject.services.push({
                            service_id: booking.service_id,
                            time_slot: `${roundedStart.format('HH:mm')} - ${roundedEnd.format('HH:mm')}`,
                            employee_id: resourceId || event.employeeId,
                            duration: duration,
                            total_amount: booking.booking_details.price || booking.total_amount,
                            booking_id: booking.id,
                        });
                    });

                    // console.log('✅ [DEBUG] Top change - Final object:', bunchBookingObject);
                } else if (isShorteningBooking) {
                    // When shortening: reduce duration from the largest booking and adjust all bookings accordingly
                    const totalDurationReduction = originalGroupDuration - newGroupDuration;

                    // Find the largest booking to reduce duration from
                    const largestBooking = sortedBookings.reduce((largest, b) =>
                        (b.booking_details.duration_min || 0) > (largest.booking_details.duration_min || 0)
                            ? b
                            : largest,
                    );

                    // console.log('✂️ [DEBUG] Shortening booking:', {
                    //     totalReduction: totalDurationReduction + ' minutes',
                    //     largestBookingId: largestBooking.id,
                    // });

                    let currentStart = newStart.clone();

                    sortedBookings.forEach((booking, index) => {
                        let serviceStart, serviceEnd;

                        serviceStart = currentStart.clone();

                        if (index === sortedBookings.length - 1) {
                            // Last booking: use new end time
                            serviceEnd = newEnd.clone();
                        } else if (booking.id === largestBooking.id) {
                            // Reduce duration from the largest booking
                            const originalDuration = moment(booking.booking_datetime_end).diff(
                                moment(booking.booking_datetime_start),
                                'minutes',
                            );
                            const newDuration = Math.max(originalDuration - totalDurationReduction, 1); // Minimum 1 minute
                            serviceEnd = serviceStart.clone().add(newDuration, 'minutes');

                            // console.log(`✂️ [DEBUG] Booking ${booking.id} shortened:`, {
                            //     original: originalDuration + 'min',
                            //     new: newDuration + 'min',
                            // });
                        } else {
                            // Other bookings keep their original duration
                            const originalDuration = moment(booking.booking_datetime_end).diff(
                                moment(booking.booking_datetime_start),
                                'minutes',
                            );
                            serviceEnd = serviceStart.clone().add(originalDuration, 'minutes');
                        }

                        currentStart = serviceEnd; // Move to next slot

                        bunchBookingObject.services.push({
                            service_id: booking.service_id,
                            time_slot: `${serviceStart.format('HH:mm')} - ${serviceEnd.format('HH:mm')}`,
                            employee_id: resourceId || event.employeeId,
                            duration: serviceEnd.diff(serviceStart, 'minutes'),
                            total_amount: booking.booking_details.price || booking.total_amount,
                            booking_id: booking.id,
                        });
                    });

                    // console.log('✅ [DEBUG] Shortening booking - Final object:', bunchBookingObject);
                } else if (isBottomChange) {
                    // If change is from bottom, only update the end time of the last booking
                    // and keep other bookings as they were, but maintain proper sequence
                    let currentStart = newStart.clone();

                    sortedBookings.forEach((booking, index) => {
                        let serviceStart, serviceEnd;

                        // console.log(`📝 [DEBUG] Bottom change - Processing booking ${index}:`, {
                        //     originalStart: moment(booking.booking_datetime_start).format('HH:mm'),
                        //     originalEnd: moment(booking.booking_datetime_end).format('HH:mm'),
                        //     currentStart: currentStart.format('HH:mm'),
                        // });

                        if (index === sortedBookings.length - 1) {
                            // Last booking: use currentStart and new end time
                            serviceStart = currentStart.clone();
                            serviceEnd = newEnd.clone();

                            // console.log('📝 [DEBUG] Last booking (bottom change):', {
                            //     newStart: serviceStart.format('HH:mm'),
                            //     newEnd: serviceEnd.format('HH:mm'),
                            // });
                        } else {
                            // Other bookings: use currentStart for proper sequence and original duration
                            serviceStart = currentStart.clone();
                            const originalDuration = moment(booking.booking_datetime_end).diff(
                                moment(booking.booking_datetime_start),
                                'minutes',
                            );
                            serviceEnd = serviceStart.clone().add(originalDuration, 'minutes');
                            currentStart = serviceEnd; // Move to next slot

                            // console.log(`📝 [DEBUG] Other booking ${index} (bottom change):`, {
                            //     start: serviceStart.format('HH:mm'),
                            //     end: serviceEnd.format('HH:mm'),
                            //     nextCurrentStart: currentStart.format('HH:mm'),
                            // });
                        }

                        bunchBookingObject.services.push({
                            service_id: booking.service_id,
                            time_slot: `${serviceStart.format('HH:mm')} - ${serviceEnd.format('HH:mm')}`,
                            employee_id: resourceId || event.employeeId,
                            duration: serviceEnd.diff(serviceStart, 'minutes'),
                            total_amount: booking.booking_details.price || booking.total_amount,
                            booking_id: booking.id,
                        });
                    });

                    // console.log('✅ [DEBUG] Bottom change - Final object:', bunchBookingObject);
                } else {
                    // If neither top nor bottom changed, use the new times but maintain the same structure
                    let currentStart = newStart.clone();

                    sortedBookings.forEach((booking, index) => {
                        let serviceStart, serviceEnd;

                        if (index === sortedBookings.length - 1) {
                            // Last booking: use new end time
                            serviceStart = currentStart.clone();
                            serviceEnd = newEnd.clone();
                        } else {
                            // Other bookings: use currentStart and original duration
                            serviceStart = currentStart.clone();
                            const originalDuration = moment(booking.booking_datetime_end).diff(
                                moment(booking.booking_datetime_start),
                                'minutes',
                            );
                            serviceEnd = serviceStart.clone().add(originalDuration, 'minutes');
                            currentStart = serviceEnd; // Move to next slot
                        }

                        bunchBookingObject.services.push({
                            service_id: booking.service_id,
                            time_slot: `${serviceStart.format('HH:mm')} - ${serviceEnd.format('HH:mm')}`,
                            employee_id: resourceId || event.employeeId,
                            duration: serviceEnd.diff(serviceStart, 'minutes'),
                            total_amount: booking.booking_details.price || booking.total_amount,
                            booking_id: booking.id,
                        });
                    });

                    // console.log('✅ [DEBUG] Else case - Final object:', bunchBookingObject);
                }
            }
        } else {
            // Single booking
            bunchBookingObject.services.push({
                service_id: event.serviceId,
                time_slot: `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
                employee_id: resourceId || event.employeeId,
                duration: moment(end).diff(moment(start), 'minutes'),
                total_amount: event.servicePrice || '0',
                booking_id: event.id,
            });

            // console.log('✅ [DEBUG] Single booking - Final object:', bunchBookingObject);
        }

        try {
            const response = await apiFetcher.post(`api/v1/store/booking/edit-multi`, {
                ...bunchBookingObject,
                google_calendar_sync: true,
            });
            if (response.status === HttpStatusCode.Ok) {
                toast.success(t('Calendar.ToastSuccessBookingReschedule'));
            } else {
                toast.error(t('Calendar.ToastErrBookingReschedule'));
            }
        } catch (error) {
            console.error('Error rescheduling booking:', error);
            toast.error(
                error?.response?.data?.detail?.includes('400:')
                    ? error?.response?.data?.detail.split(':')[1]
                    : error?.response?.data?.detail,
            );
        } finally {
            refreshSettings();
        }
    };

    if (loading) return <Loader />;

    return (
        <Stack sx={{ position: 'relative', overflow: 'auto', scrollbarWidth: 'none', height: '100dvh', width: '100%' }}>
            <Stack
                className="calendar-wrapper"
                sx={{ backgroundColor: '#f0f8ff', height: showForm?.newReschedule ? '90dvh' : '100dvh' }}
            >
                {processingData && (
                    <Stack
                        sx={{
                            position: 'absolute',
                            zIndex: 110,
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(0,0,0,0.1)',
                        }}
                    >
                        <CircularProgress size="2.5rem" sx={{ color: '#6f6f6f' }} />
                    </Stack>
                )}
                <DnDCalendar
                    culture={selectedLanguage ?? 'da'}
                    localizer={localizer}
                    formats={formats}
                    events={events}
                    view={empToShow?.length >= 2 ? 'day' : view}
                    date={selectedDate}
                    dayLayoutAlgorithm={'no-overlap'}
                    onNavigate={(date) => setSelectedDate(date)}
                    onSelectEvent={handleEventClick}
                    defaultDate={moment()}
                    scrollToTime={scrollToTime}
                    style={{ height: '100vh', backgroundColor: '#FFFFFF' }}
                    step={calendar?.calendarInterval ?? 15} //5
                    timeslots={parseInt(60 / calendar?.calendarInterval) ?? 4} //12
                    min={calendarOpeningHours({ data, selectedDate, view })?.momentStartTime || null}
                    max={calendarOpeningHours({ data, selectedDate, view })?.momentEndTime || null}
                    // step={5} //5
                    // timeslots={12} //12
                    // dayPropGetter={date => (moment(date).day() === 2) && ({ className: 'rbc-selected-day' })}
                    dayPropGetter={(date) =>
                        calendar?.grayOutClosedHours && calendarSettings(date) && { className: 'rbc-selected-day' }
                    }
                    onEventDrop={(e) => {
                        if (
                            e?.resourceId !== e?.event?.resourceId &&
                            e?.resourceId !== null &&
                            e?.event?.type == 'CALENDAR_PAUSE'
                        ) {
                            toast.error(t('Calendar.InvalidAction'));
                        } else if (e?.event?.type == 'CALENDAR_PAUSE') {
                            handleEventUpdate(e, false);
                        } else {
                            console.log('🔧 [DEBUG] onEventDrop called with:', { e });
                            setScheduleChange({ data: e, isResizing: false });
                            setShowForm((prev) => ({ ...prev, reschedule: true }));
                        }
                    }}
                    // slotPropGetter={(date, resourceId) => {

                    //   if(!isSlotAvailable(date, resourceId)){
                    //     return {
                    //       className: "rbc-selected-day",
                    //     };
                    //   }
                    //   // else{
                    //   //   return {
                    //   //     className:'rbc-unselected-day'
                    //   //   }
                    //   // }

                    //   // const day = moment(date).day();
                    //   // if (day === 0 || day === 4) {

                    //   //   return {
                    //   //     className: "rbc-selected-day",
                    //   //   };
                    //   // }
                    // }}
                    onEventResize={(e) => {
                        if (e?.event?.type == 'CALENDAR_PAUSE') {
                            handleEventUpdate(e, true);
                        } else {
                            setScheduleChange({ data: e, isResizing: true });
                            setShowForm((prev) => ({ ...prev, reschedule: true }));
                        }
                        // resizeEvent(e)
                    }}
                    eventPropGetter={(event) => {
                        let backgroundColor = '#3174ad';
                        let fontSize = '1rem';
                        let color = '#fff';

                        if (event.type != 'BOOKING') {
                            backgroundColor = '#C74141';
                        } else {
                            if (event.status === 'BOOKED' || event.status === 'Awaiting new customer') {
                                if (event?.source === 'DIRECTWEBSTORE' || event?.source === 'WEBMARKETPLACE') {
                                    const matchcolor = data?.profile.custom_statuses?.filter((val) => {
                                        if (event.custom_status_id === val.id) {
                                            return val.status_color;
                                        }
                                    });
                                    if (matchcolor?.length > 0) {
                                        backgroundColor = matchcolor[0]?.status_color;
                                    } else {
                                        backgroundColor = event?.online_booking_color
                                            ? CalendarColors[event?.online_booking_color]?.bgColor
                                            : '#A79C92';
                                    }
                                } else if (event.status === 'BOOKED' && event.custom_status_id !== null) {
                                    const matchcolor = data?.profile.custom_statuses?.filter((val) => {
                                        if (event.custom_status_id === val.id) {
                                            return val.status_color;
                                        }
                                    });
                                    if (matchcolor?.length > 0) {
                                        backgroundColor = matchcolor[0]?.status_color;
                                    } else {
                                        backgroundColor = event?.manual_booking_color
                                            ? CalendarColors[event?.manual_booking_color]?.bgColor
                                            : '#A79C92';
                                    }
                                } else {
                                    backgroundColor = event?.manual_booking_color
                                        ? CalendarColors[event?.manual_booking_color]?.bgColor
                                        : '#A79C92';
                                }

                                // backgroundColor = "#A79C92";
                            } else if (event.status === 'CANCELLED' || event.status === 'Cancelled by customer') {
                                backgroundColor = '#C7414180';
                            } else if (event.status === 'COMPLETED') {
                                backgroundColor = '#367B3D';
                            } else if (event.status === 'OFFERED' || event.status === 'Awaiting new customer') {
                                backgroundColor = '#E19957';
                            } else if (
                                event.status === 'Cancellation offer accepted' ||
                                event.status === 'OFFER_ACCEPTED'
                            ) {
                                backgroundColor = '#447BCD';
                            } else if (event.status === 'Absence from booking NOSHOW ' || event.status === 'NOSHOW') {
                                backgroundColor = '#E19957';
                            } else if (event.status === 'RESCHEDULED') {
                                if (event?.source === 'DIRECTWEBSTORE' || event?.source === 'WEBMARKETPLACE') {
                                    backgroundColor = event?.online_booking_color
                                        ? CalendarColors[event?.online_booking_color]?.bgColor
                                        : '#A79C92';
                                } else {
                                    backgroundColor = event?.manual_booking_color
                                        ? CalendarColors[event?.manual_booking_color]?.bgColor
                                        : '#A79C92';
                                }
                                // backgroundColor = "#A79C92";
                            } else if (event.status === 'AUTOCOMPLETED') {
                                backgroundColor = '#6FB847';
                            }
                        }

                        const durationInMinutes = moment(event.end).diff(moment(event.start), 'minutes');

                        let flexDirection = 'column';
                        let justifyContent = 'start';
                        let alignContent = 'center';
                        let textAlign = 'left';

                        if (durationInMinutes <= 5) {
                            fontSize = '0.7rem';
                            flexDirection = 'row';
                            justifyContent = 'space-between';
                            alignContent = 'center';
                            // textAlign = "right";
                        } else if (durationInMinutes >= 6 && durationInMinutes <= 10) {
                            fontSize = '0.7rem';
                            flexDirection = 'row';
                            alignContent = 'center';
                            // textAlign = "right";
                        } else if (durationInMinutes >= 11 && durationInMinutes <= 15) {
                            fontSize = '0.8rem';
                            flexDirection = 'row';
                            alignContent = 'center';
                            // textAlign = "right";
                        } else if (durationInMinutes >= 16 && durationInMinutes <= 20) {
                            fontSize = '0.8rem';
                            flexDirection = 'column';
                        } else if (durationInMinutes >= 21 && durationInMinutes <= 40) {
                            fontSize = '1rem';
                            flexDirection = 'column';
                        } else if (durationInMinutes >= 41 && durationInMinutes <= 60) {
                            fontSize = '1.1rem';
                            flexDirection = 'column';
                        } else if (durationInMinutes >= 60 && durationInMinutes <= 120) {
                            fontSize = '1.1rem';
                            flexDirection = 'column';
                        } else if (durationInMinutes > 120) {
                            fontSize = '1.1rem';
                            flexDirection = 'column';
                        }

                        // Remove top border radius if there's driving time (inspection duration)
                        const hasDrivingTime = event?.inspectionDuration > 0;
                        const borderRadius = hasDrivingTime ? '0 0 15px 15px' : '15px'; // No top radius if driving time exists

                        return {
                            style: {
                                backgroundColor,
                                borderRadius: borderRadius,
                                color,
                                fontSize,
                                display: 'flex',
                                flex: 1,
                                paddingTop: 0.1 * durationInMinutes,
                                flexDirection,
                                justifyContent,
                                alignContent,
                                textAlign,
                                // marginTop: -2,
                            },
                        };
                    }}
                    components={{
                        timeGutterHeader: (props) => {
                            return (
                                <CustomTimeHeader {...props} currentWeek={currentWeek} lastValidWeek={lastValidWeek} />
                            );
                        },
                        event: (event) => (
                            <CustomEvent event={event} setHealthDeclarationBooking={setHealthDeclarationBooking} />
                        ),
                        header: (props) => {
                            const handleHeaderClick = (e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                const clickedDate = props.date;
                                let headerElement = e.currentTarget;

                                let parentHeader = headerElement.closest('.rbc-header');
                                if (parentHeader) {
                                    headerElement = parentHeader;
                                }

                                setSelectedDate(moment(clickedDate).format('YYYY-MM-DD'));
                                CalendarHandler.handleClickResource({
                                    e: { currentTarget: headerElement },
                                    setAnchorEl,
                                });
                            };

                            return (
                                <WeeklyHeader
                                    empToShow={empToShow}
                                    employees={employees}
                                    handleHeaderClick={handleHeaderClick}
                                    props={props}
                                    selectedDate={selectedDate}
                                    anchorEl={anchorEl}
                                />
                            );
                        },

                        toolbar: (props) => {
                            setTimeout(() => {
                                updateTimeIndicator(view);
                            }, 200);

                            return (
                                <CustomToolBar
                                    {...props}
                                    openForm={openForm}
                                    view={view}
                                    setView={(view) => {
                                        setView(view);
                                        localStorage.setItem('calendarView', view);
                                    }}
                                    setEmployeeId={setEmpToShow}
                                    selectedDate={selectedDate}
                                    setSelectedDate={setSelectedDate}
                                    employees={employees}
                                    selectedLanguage={selectedLanguage}
                                    notifications={notifications}
                                    readAllNotifications={readAllNotifications}
                                    handleNotificationClick={handleNotificationClick}
                                    formNotifications={formNotifications}
                                    handleFormNotificationClick={handleFormNotificationClick}
                                />
                            );
                        },
                        timeSlotWrapper: ({ children, value, resource }) => {
                            return (
                                <TimeSlotWrapper
                                    children={children}
                                    value={value}
                                    resource={resource}
                                    timeSlotHeight={timeSlotHeight}
                                    calendar={calendar}
                                    isSlotAvailable={isSlotAvailable}
                                />
                            );
                        },
                    }}
                    resources={
                        empToShow && employees && empToShow.length >= (view === 'day' ? 1 : 2)
                            ? employees
                                  ?.filter((em) => empToShow.includes(em.id))
                                  ?.map((employee) => ({
                                      id: employee.id,
                                      title:
                                          (
                                              <ResourceHeader
                                                  employee={employee}
                                                  empToShow={empToShow}
                                                  view={view}
                                                  setAnchorEl={setAnchorEl}
                                                  CalendarHandler={CalendarHandler}
                                                  anchorEl={anchorEl}
                                              />
                                          ) || t('Calendar.UnnamedEmployee'),
                                  }))
                            : null
                    }
                    resourceIdAccessor="id"
                    resourceTitleAccessor="title"
                    messages={{
                        next: 'Neste',
                        previous: 'Forrige',
                        today: 'I dag',
                        month: 'Måned',
                        week: 'Uke',
                        day: 'Dag',
                        agenda: 'Agenda',
                        date: 'Dato',
                        time: 'Tid',
                        event: 'Hendelse',
                        allDay: 'Hele dagen',
                    }}
                    selectable={!(shouldBlockMobileDragDrop && isMobileDevice)}
                    onSelectSlot={handleSelectSlot}
                />
            </Stack>

            {showForm?.newReschedule && (
                <RescheduleBottomModel
                    open={showForm?.newReschedule}
                    rescheduledata={rescheduleData}
                    onClose={() => {
                        setShowForm((prev) => ({ ...prev, newReschedule: false, isCopyBooking: false }));
                    }}
                    editPause={() => {
                        const event = events.find((event) => event.id === rescheduleData?.booking?.id);
                        setPauseProps(event);
                        setShowForm((prev) => ({ ...prev, booking: true, newReschedule: false }));
                        setRescheduleData(null);
                    }}
                    isCopyBooking={showForm?.isCopyBooking}
                />
            )}

            {showForm?.detail && (
                <BookingDetailsModal
                    bookingId={selectedBooking}
                    open={showForm?.detail}
                    handleReschedule={handleReschedule}
                    closeForm={() => {
                        setShowForm((prev) => ({ ...prev, detail: false }));
                        setSelectedBooking(null);
                        setHealthDeclarationBooking({ show: false, origialBookings: null });
                    }}
                    setShowForm={setShowForm}
                    setRescheduleData={setRescheduleData}
                    events={events}
                    setHealthDeclarationBooking={setHealthDeclarationBooking}
                    refreshBookings={() => refreshBookings()}
                />
            )}

            {(showForm?.reschedule || showForm?.copyBookingSummary) && (
                <Reschedule
                    open={showForm?.reschedule || showForm?.copyBookingSummary}
                    onClose={closeReschedule}
                    handleEventUpdate={handleEventUpdate}
                    scheduleChange={scheduleChange}
                    handleBunchBookingEdit={handleBunchBookingEdit}
                    isCopyBooking={showForm?.copyBookingSummary}
                    onConfirm={() => {
                        setShowForm((prev) => ({
                            ...prev,
                            copyBookingSummary: false,
                            isCopyBooking: false,
                            newReschedule: false,
                        }));
                        setRescheduleData(null);
                    }}
                    bookingObject={rescheduleData}
                    employees={employees}
                    events={events}
                    isEventOverlapping={isEventOverlapping}
                />
            )}

            {showForm?.rescheduleConfirmation && (
                <TopReschedulePopup
                    open={showForm?.rescheduleConfirmation}
                    onClose={() => {
                        setShowForm((prev) => ({ ...prev, rescheduleConfirmation: false, newReschedule: false }));
                        setRescheduleData(null);
                    }}
                    onCancel={() => {
                        setShowForm((prev) => ({ ...prev, rescheduleConfirmation: false }));
                    }}
                    rescheduledata={rescheduleData}
                    handleReschedule={
                        rescheduleData?.booking?.type === 'CALENDAR_PAUSE' ? reschedulePauseHours : rescheduleBooking
                    }
                    allEvents={events}
                    handleBunchBookingEdit={handleBunchBookingEdit}
                />
            )}

            {showForm?.booking && (
                <NewBookingForm
                    closeForm={closeForm}
                    open={showForm?.booking}
                    validatePause={validatePause}
                    rescheduleProps={rescheduleProps}
                    initialData={createEventObj}
                    refreshBookings={() => refreshBookings()}
                    pauseProps={pauseProps}
                    setEvents={setEvents}
                    tempId={tempId}
                    settingSelector={data}
                />
            )}

            {showForm?.formNotification && (
                <FormNotificationModal
                    open={showForm?.formNotification}
                    closeForm={closeForm}
                    data={notificationFormProp}
                />
            )}

            {open && (
                <DynamicOpeningHourMenu
                    loader={loader}
                    anchorEl={anchorEl}
                    open={open}
                    onClose={() => {
                        setAnchorEl(null);
                        setOpeningHourEmp((prev) => ({
                            ...prev,
                            updated: {},
                            isChanged: false,
                            event: {},
                            existing: {},
                        }));
                    }}
                    setAnchorEl={view === 'day' ? setAnchorEl : null}
                    selectedDate={selectedDate}
                    setOpeningHourEmp={setOpeningHourEmp}
                    openingHourEmp={openingHourEmp}
                    settingResource={{ setEmployees, dispatch, settings, setLoading }}
                    setLoader={setLoader}
                    componentType={view === 'day' ? 'menu' : 'popover'}
                />
            )}

            {healthDeclarationBooking?.show && (
                <HealthDeclarationBookingModal
                    open={healthDeclarationBooking?.show}
                    onClose={() => setHealthDeclarationBooking({ show: false, origialBookings: null })}
                    origialBookings={healthDeclarationBooking?.origialBookings}
                    refreshBookings={() => refreshBookings()}
                />
            )}
        </Stack>
    );
};

export default CustomCalendar;
