import { useSelector } from 'react-redux';
import { CalendarColors } from '../../../data/CalendarColors';
import moment from 'moment';
import { Stack, Typography, CircularProgress, Tooltip, Box, IconButton } from '@mui/material';
import React from 'react';
import ImportantNoteIcon from '../../../assets/ImportantNoteIcon.svg';
import { t } from 'i18next';
import { PiCarProfileDuotone } from 'react-icons/pi';
import { distanceFormat } from '../../../utils/distanceFormat';
import PaidIcon from '@mui/icons-material/Paid';
import { CalendarHandler } from '../../../scenes/Calendar/CalendarUtils/CalendarHandlers';

export default function CustomEvent({ event, setHealthDeclarationBooking }) {
    const data = useSelector((state) => state?.settings?.data);
    const eventDetails = event?.event;
    const showNotes = process.env?.REACT_APP_SHOW_NOTE?.split(',') ?? [];

    if (!eventDetails) {
        return null;
    }
    // Helper function to lighten a hex color
    const lightenColor = (hex, percent) => {
        if (!hex) return '#FFB6C1'; // Fallback to light pink

        // Remove # if present
        let color = hex.replace('#', '');

        // Handle colors with opacity (8 characters) - take first 6
        if (color.length === 8) {
            color = color.substring(0, 6);
        }

        // Handle invalid colors
        if (color.length !== 6) {
            return '#FFB6C1'; // Fallback to light pink
        }

        try {
            // Convert to RGB
            const r = parseInt(color.substring(0, 2), 16);
            const g = parseInt(color.substring(2, 4), 16);
            const b = parseInt(color.substring(4, 6), 16);

            // Lighten by adding white
            const newR = Math.round(r + (255 - r) * percent);
            const newG = Math.round(g + (255 - g) * percent);
            const newB = Math.round(b + (255 - b) * percent);

            // Convert back to hex
            return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
        } catch (e) {
            return '#FFB6C1'; // Fallback to light pink
        }
    };

    // Get event background color (same logic as eventPropGetter)
    const getEventBackgroundColor = () => {
        let backgroundColor = '#3174ad';
        let color = '#fff';
        let titleColor = '#000';

        if (eventDetails.type !== 'BOOKING') {
            backgroundColor = '#C74141';
        } else {
            if (eventDetails.status === 'BOOKED' || eventDetails.status === 'Awaiting new customer') {
                if (eventDetails?.source === 'DIRECTWEBSTORE' || eventDetails?.source === 'WEBMARKETPLACE') {
                    const matchcolor = data?.profile.custom_statuses?.filter((val) => {
                        if (eventDetails.custom_status_id === val.id) {
                            return val.status_color;
                        }
                    });
                    if (matchcolor?.length > 0) {
                        backgroundColor = matchcolor[0]?.status_color;
                        color = matchcolor[0]?.label_color;
                        titleColor = matchcolor[0]?.status_color;
                    } else {
                        backgroundColor = eventDetails?.online_booking_color
                            ? CalendarColors[eventDetails?.online_booking_color]?.bgColor
                            : '#A79C92';
                        color = eventDetails?.online_booking_color
                            ? CalendarColors[eventDetails?.online_booking_color]?.textColor
                            : '#fff';
                        titleColor = eventDetails?.online_booking_color
                            ? CalendarColors[eventDetails?.online_booking_color]?.textColor
                            : '#000';
                    }
                } else if (eventDetails.status === 'BOOKED' && eventDetails.custom_status_id !== null) {
                    const matchcolor = data?.profile.custom_statuses?.filter((val) => {
                        if (eventDetails.custom_status_id === val.id) {
                            return val.status_color;
                        }
                    });
                    if (matchcolor?.length > 0) {
                        backgroundColor = matchcolor[0]?.status_color;
                        color = matchcolor[0]?.label_color;
                        titleColor = matchcolor[0]?.status_color;
                    } else {
                        backgroundColor = eventDetails?.manual_booking_color
                            ? CalendarColors[eventDetails?.manual_booking_color]?.bgColor
                            : '#A79C92';
                        color = eventDetails?.manual_booking_color
                            ? CalendarColors[eventDetails?.manual_booking_color]?.textColor
                            : '#fff';
                        titleColor = eventDetails?.manual_booking_color
                            ? CalendarColors[eventDetails?.manual_booking_color]?.textColor
                            : '#000';
                    }
                } else {
                    backgroundColor = eventDetails?.manual_booking_color
                        ? CalendarColors[eventDetails?.manual_booking_color]?.bgColor
                        : '#A79C92';
                    color = eventDetails?.manual_booking_color
                        ? CalendarColors[eventDetails?.manual_booking_color]?.textColor
                        : '#fff';
                    titleColor = '#000';
                }
            } else if (eventDetails.status === 'CANCELLED' || eventDetails.status === 'Cancelled by customer') {
                backgroundColor = '#C7414180';
                // color = '#C74141';
                // titleColor = '#C74141';
            } else if (eventDetails.status === 'COMPLETED') {
                backgroundColor = '#367B3D';
                // color = '#367B3D';
                // titleColor = '#367B3D';
            } else if (eventDetails.status === 'OFFERED' || eventDetails.status === 'Awaiting new customer') {
                backgroundColor = '#E19957';
                // color = '#E19957';
                // titleColor = '#E19957';
            } else if (
                eventDetails.status === 'Cancellation offer accepted' ||
                eventDetails.status === 'OFFER_ACCEPTED'
            ) {
                backgroundColor = '#447BCD';
                // color = '#447BCD';
                // titleColor = '#447BCD';
            } else if (eventDetails.status === 'Absence from booking NOSHOW ' || eventDetails.status === 'NOSHOW') {
                backgroundColor = '#E19957';
                // color = '#E19957';
                // titleColor = '#E19957';
            } else if (eventDetails.status === 'RESCHEDULED') {
                if (eventDetails?.source === 'DIRECTWEBSTORE' || eventDetails?.source === 'WEBMARKETPLACE') {
                    backgroundColor = eventDetails?.online_booking_color
                        ? CalendarColors[eventDetails?.online_booking_color]?.bgColor
                        : '#A79C92';
                    color = eventDetails?.online_booking_color
                        ? CalendarColors[eventDetails?.online_booking_color]?.textColor
                        : '#fff';
                    titleColor = eventDetails?.online_booking_color
                        ? CalendarColors[eventDetails?.online_booking_color]?.textColor
                        : '#000';
                } else {
                    backgroundColor = eventDetails?.manual_booking_color
                        ? CalendarColors[eventDetails?.manual_booking_color]?.bgColor
                        : '#A79C92';
                    color = eventDetails?.manual_booking_color
                        ? CalendarColors[eventDetails?.manual_booking_color]?.textColor
                        : '#fff';
                    titleColor = '#000';
                }
            } else if (eventDetails.status === 'AUTOCOMPLETED') {
                backgroundColor = '#6FB847';
                // color = '#6FB847';
                // titleColor = '#6FB847';
            }
        }

        return { backgroundColor, color, titleColor };
    };

    const { backgroundColor, color, titleColor } = getEventBackgroundColor();
    const lightenedBackgroundColor = lightenColor(backgroundColor, 0.6); // Lighten by 60%

    let duration = moment(eventDetails.end).diff(moment(eventDetails.start), 'minutes');
    const inspectionDuration = eventDetails?.inspectionDuration || 0;
    const inspectionDistance = eventDetails?.inspectionDistance || null;
    const hasInspectionTime = inspectionDuration > 0;

    // Format inspection duration as hours and minutes if >= 60 minutes, otherwise just minutes
    const formatInspectionDuration = (minutes) => {
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            if (remainingMinutes > 0) {
                return `${hours}h ${remainingMinutes}m`;
            }
            return `${hours}h`;
        }
        return `${minutes}m`;
    };

    // Get calendar interval to calculate driving section height
    const calendarInterval = data?.calendar?.calendarInterval || 15;

    // Calculate height per minute based on calendar interval
    // Default slot heights: 5min=15px, 10min=25px, 15min=35px, 30min=55px, 60min=120px
    const getSlotHeight = (interval) => {
        if (interval === 5) return 15;
        if (interval === 10) return 25;
        if (interval === 15) return 35;
        if (interval === 30) return 55;
        if (interval === 60) return 120;
        return 35; // default
    };

    const slotHeight = getSlotHeight(calendarInterval);
    const heightPerMinute = slotHeight / calendarInterval;
    const calculatedDrivingHeight = inspectionDuration * heightPerMinute;

    // Calculate calendar min time to limit driving section height
    const getCalendarMinTime = () => {
        const { schedule, calendar } = data || {};
        if (!schedule || !schedule.length) {
            return moment(eventDetails.start).startOf('day'); // Default to 00:00
        }

        const eventDate = moment(eventDetails.start);
        const currentDay = eventDate.locale('en-gb').format('dddd');
        const foundDay = schedule.find((dayObj) => dayObj.day === currentDay);

        if (foundDay) {
            let momentStartTime = moment(foundDay.open_time, 'HH:mm:ss');
            const { setCalendarOpeningHour } = calendar || {};
            if (setCalendarOpeningHour && momentStartTime.format('HH:mm:ss') !== '00:00:00') {
                momentStartTime = momentStartTime.minutes(0).subtract(setCalendarOpeningHour, 'minutes');
            }
            // Clamp to start of day (00:00) minimum
            return momentStartTime.isBefore(eventDate.startOf('day'), 'minutes')
                ? eventDate.startOf('day')
                : momentStartTime;
        }

        return eventDate.startOf('day'); // Default to 00:00
    };

    const calendarMinTime = getCalendarMinTime();
    const eventStartTime = moment(eventDetails.start);
    const isPastEvent = eventStartTime.isBefore(moment(), 'minute');

    // Calculate available space from event start to calendar min time
    let availableMinutes = eventStartTime.diff(calendarMinTime, 'minutes');

    // For past events: if event is before calendar min time, use start of day as reference
    // This ensures we can still show driving time info for historical events
    if (isPastEvent && availableMinutes < 0) {
        const startOfDay = eventStartTime.clone().startOf('day');
        availableMinutes = eventStartTime.diff(startOfDay, 'minutes');
    }

    const availableHeight = availableMinutes * heightPerMinute;

    // Limit driving section height by available space, but ensure minimum visibility
    // For past events before calendar min, we use start of day as constraint
    const drivingSectionHeight = Math.max(0, Math.min(calculatedDrivingHeight, availableHeight));

    if (eventDetails?.isEventLoading) {
        return (
            <Stack
                sx={{
                    // width: "100%",
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Typography
                    sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontWeight: 700,
                    }}
                >
                    {' '}
                    {moment(eventDetails.start).format('HH:mm') + ` - ` + moment(eventDetails.end).format('HH:mm')}{' '}
                </Typography>
                <CircularProgress size="1rem" sx={{ color: '#fff', alignContent: 'center' }} />
            </Stack>
        );
    }

    return (
        <Stack
            title=""
            className={`time-slot-wrapper ${hasInspectionTime ? 'has-driving-time' : ''}`}
            color={color}
            position="relative"
            sx={{
                height: '100%',
                width: '100%',
                overflow: hasInspectionTime ? 'visible' : 'hidden',
            }}
        >
            {/* Driving time section - positioned above the event */}
            {hasInspectionTime && inspectionDuration > 0 && drivingSectionHeight > 0 && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                        height: `${drivingSectionHeight}px`,
                        backgroundColor: lightenedBackgroundColor, // Lighter shade of event color
                        borderRadius: '15px 15px 0 0',
                        position: 'absolute',
                        bottom: '105%',
                        left: -5,
                        right: -5,
                        zIndex: 2,
                        py: 2,
                        px: 1,
                    }}
                >
                    <Typography
                        sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            position: 'relative',
                            zIndex: 2,
                            display: 'flex',
                            alignItems: 'center',
                            color: '#000',
                        }}
                    >
                        {formatInspectionDuration(inspectionDuration)}
                    </Typography>
                    <PiCarProfileDuotone
                        size={24}
                        style={{ color: '#000', filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))' }}
                    />

                    <Typography
                        sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            color: '#000',
                        }}
                    >
                        {distanceFormat(inspectionDistance || 0)} {t('Setting.Km')}
                    </Typography>
                </Box>
            )}

            {duration >= 25 && eventDetails?.origialBookings?.[0]?.sales_id && (
                <Box sx={{ position: 'absolute', bottom: 4, right: 2, zIndex: 2 }}>
                    <PaidIcon sx={{ fontSize: 20, background: '#fff', borderRadius: '50%', color: '#367B3D' }} />
                </Box>
            )}

            <Stack
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '25px',
                }}
            >
                <Typography
                    sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontWeight: 700,
                        fontSize: duration >= 15 ? '14px' : '12px',
                    }}
                >
                    {' '}
                    {moment(eventDetails.start).format('HH:mm') + ` - ` + moment(eventDetails.end).format('HH:mm')}{' '}
                </Typography>
                <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    {eventDetails?.type !== 'CALENDAR_PAUSE' && eventDetails?.outlet_customer_note && (
                        <Tooltip
                            title={eventDetails?.outlet_customer_note?.split('\n').map((line, i) => (
                                <React.Fragment key={i}>
                                    {line}
                                    {i < eventDetails?.outlet_customer_note?.split('\n').length - 1 && <br />}
                                </React.Fragment>
                            ))}
                        >
                            <img src={ImportantNoteIcon} alt="note" />
                        </Tooltip>
                    )}
                    {eventDetails?.isNewCustomer && (
                        <Typography
                            sx={{
                                backgroundColor: '#367B3D',
                                color: '#fff',
                                fontSize: 10,
                                fontWeight: 700,
                                border: '1px solid #fff',
                                borderRadius: 12,
                                px: 1.5,
                                py: 0,
                                height: '10px',
                                display: 'flex',
                                zIndex: 2,
                                alignItems: 'center',
                            }}
                        >
                            {t('Common.New')}
                        </Typography>
                    )}
                    {eventDetails?.origialBookings?.some((booking) => booking?.health_declaration) && (
                        <IconButton
                            disableFocusRipple
                            disableRipple
                            disableTouchRipple
                            sx={{
                                color: '#6f6f6f',
                                fontSize: 14,
                                borderRadius: '50%',
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setHealthDeclarationBooking({
                                    show: true,
                                    origialBookings: eventDetails?.origialBookings,
                                });
                            }}
                        >
                            {CalendarHandler.getHealthDeclarationStatusIcon(eventDetails?.origialBookings)}
                        </IconButton>
                    )}
                </Stack>
            </Stack>
            {duration > 15 && eventDetails?.type !== 'CALENDAR_PAUSE' && (
                <Typography
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: duration > 20 ? '16px' : '14px',
                    }}
                >
                    {' '}
                    <strong
                        style={{
                            width: '100%',
                            display: 'inline-block',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow:
                                eventDetails?.customerName && eventDetails?.customerName?.length > 20
                                    ? 'ellipsis'
                                    : 'unset',
                        }}
                    >
                        {eventDetails?.customerName}
                    </strong>
                </Typography>
            )}
            {duration >= (eventDetails?.walk_in ? 15 : 26) && (
                <span>
                    <Typography>{eventDetails.title}</Typography>
                    <Typography sx={{ fontSize: '12px' }}>{eventDetails.headline} </Typography>
                </span>
            )}
            {duration > 50 && <Typography> {eventDetails?.customerPhone} </Typography>}
            {data?.profile?.inspection_module &&
                duration > 60 &&
                eventDetails?.type === 'BOOKING' &&
                eventDetails?.origialBookings && (
                    <Typography>
                        {eventDetails?.origialBookings[0]?.inspection_data?.userInformation?.address},
                        {eventDetails?.origialBookings[0]?.inspection_data?.userInformation?.city},
                        {eventDetails?.origialBookings[0]?.inspection_data?.userInformation?.zipCode}
                    </Typography>
                )}
            {duration >= 45 && showNotes?.includes(String(data?.profile?.id)) && (
                <Typography
                    sx={{
                        whiteSpace: 'pre-line',
                        fontSize: '12px',
                    }}
                >
                    {eventDetails?.customerNote}
                </Typography>
            )}
        </Stack>
    );
}
