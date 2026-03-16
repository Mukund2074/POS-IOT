import React, { useEffect, useState } from 'react';
import { Stack, Typography, Modal, Paper } from '@mui/material';
import FButton from '../commonComponents/F_Button';
import moment from 'moment';
import { t } from 'i18next';

export default function TopReschedulePopup({
    open,
    onClose,
    onCancel,
    handleReschedule,
    rescheduledata,
    allEvents,
    handleBunchBookingEdit,
}) {
    const events = allEvents.filter((val) => val.id !== rescheduledata?.booking?.id);

    const [newTimeSlot, setNewTimeSlot] = useState('');
    const [shortened, setshortened] = useState('');

    // Get bunch booking information for grouped bookings
    const isGrouped = rescheduledata?.booking?.isGrouped;

    const allotetime = () => {
        const selectedDate = moment(rescheduledata?.event?.start).format('YYYY-MM-DD');
        const startSlot = moment(rescheduledata?.event?.start, 'hh:mm');

        // For grouped bookings, use the bunch duration, otherwise use individual booking duration
        let duration;
        if (isGrouped && rescheduledata?.booking?.origialBookings) {
            // Calculate total duration of all bookings in the bunch
            duration = rescheduledata.booking.origialBookings.reduce(
                (total, booking) => total + (booking.booking_details?.duration_min || 0),
                0,
            );
        } else {
            duration = rescheduledata?.booking?.booking_details?.duration_min || 0;
        }

        const endSlot = startSlot.clone().add(duration, 'minutes');
        setNewTimeSlot(`${moment(startSlot).format('HH:mm')} - ${moment(endSlot).format('HH:mm')}`);

        const filterdata = events.filter((val) => selectedDate === moment(val.end).format('YYYY-MM-DD'));

        filterdata.map((val) => {
            if (
                moment(val.start).isBetween(startSlot, endSlot) &&
                val?.resourceId === rescheduledata?.event?.resourceId
            ) {
                // Calculate how much time is deducted
                const availableTime = moment(val.start).diff(startSlot, 'minutes');
                const deductedTime = duration - availableTime;

                if (deductedTime > 60) {
                    setshortened(`${Math.floor(deductedTime / 60)} hr ${deductedTime % 60} min`);
                } else {
                    setshortened(`${deductedTime} minutes`);
                }
                setNewTimeSlot(`${moment(startSlot).format('HH:mm')} - ${moment(val.start).format('HH:mm')}`);
                return true;
            }
            return false;
        });
    };

    useEffect(() => {
        allotetime();
    }, []);

    const handleClose = () => {
        onClose();
        setNewTimeSlot('');
        setshortened('');
    };

    const start = moment(rescheduledata?.event?.start).format('YYYY-MM-DD') + ' ' + newTimeSlot.split(' - ')[0];
    const end = moment(rescheduledata?.event?.start).format('YYYY-MM-DD') + ' ' + newTimeSlot.split(' - ')[1];

    return (
        <React.Fragment>
            <Modal
                open={open}
                onClose={handleClose}
                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', zIndex: 20 }}
            >
                <Paper
                    sx={{
                        width: { xs: '95%', md: '55%' },
                        overflow: 'hidden',
                        position: 'absolute',
                        top: { md: '20px', xs: '50px' },
                        msOverflowStyle: 'none',
                        borderRadius: 4,
                    }}
                >
                    {shortened ? (
                        <Stack
                            sx={{
                                p: 2,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontWeight: 'bold',
                                }}
                            >
                                {t('Calendar.NotEnoughSlot')}
                            </Typography>
                            <Typography sx={{ color: '#6F6F6F' }}>
                                {rescheduledata?.booking?.type === 'CALENDAR_PAUSE'
                                    ? `${t('Calendar.NoEnoughSlotAvailablePause')} ${shortened}.`
                                    : `${t('Calendar.NoEnoughSlotAvailable')} ${shortened}.`}
                            </Typography>
                        </Stack>
                    ) : (
                        <Stack
                            sx={{
                                p: 2,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontWeight: 'bold',
                                }}
                            >
                                {t('Calendar.ReschTitle')}
                            </Typography>
                            <Typography sx={{ color: '#6F6F6F' }}>
                                {rescheduledata?.booking?.type === 'CALENDAR_PAUSE'
                                    ? `${t('Calendar.ReschDescPause')} ${shortened}.`
                                    : `${t('Calendar.ReschDesc')} ${shortened}.`}
                                {rescheduledata?.event?.start
                                    ? moment(rescheduledata.event.start).format('YYYY-MM-DD')
                                    : ''}{' '}
                                at {newTimeSlot}
                            </Typography>
                        </Stack>
                    )}

                    <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'end', p: 2 }}>
                        <FButton
                            sx={{
                                '&:hover': {
                                    backgroundColor: '#fff',
                                },

                                color: '#44B904',
                            }}
                            title={t('Setting.Cancel')}
                            onClick={onCancel}
                        />
                        <FButton
                            title={t('Calendar.Accept')}
                            sx={{
                                backgroundColor: '#D30000',
                                color: '#fff',
                            }}
                            onClick={async () => {
                                if (rescheduledata?.booking?.type === 'CALENDAR_PAUSE') {
                                    handleReschedule(rescheduledata?.booking?.id, {
                                        datetime_start: start,
                                        datetime_end: end,
                                        employee_id: rescheduledata?.event?.resourceId,
                                        id: rescheduledata?.booking?.id,
                                    });
                                } else {
                                    // Use handleBunchBookingEdit for grouped bookings
                                    if (rescheduledata?.booking?.isGrouped) {
                                        const start = `${moment(rescheduledata?.event?.start).format('YYYY-MM-DD')} ${newTimeSlot.split(' - ')[0]}`;
                                        const end = `${moment(rescheduledata?.event?.start).format('YYYY-MM-DD')} ${newTimeSlot.split(' - ')[1]}`;
                                        await handleBunchBookingEdit({
                                            event: rescheduledata?.booking,
                                            start: moment(start, 'YYYY-MM-DD HH:mm').toDate(),
                                            end: moment(end, 'YYYY-MM-DD HH:mm').toDate(),
                                            resourceId:
                                                rescheduledata?.event?.resourceId ||
                                                rescheduledata?.booking?.employee_id,
                                            isDragAndDrop: true, // This is a drag and drop operation
                                            shortenedDuration: shortened,
                                        });
                                    } else {
                                        handleReschedule({
                                            id: rescheduledata?.booking?.id,
                                            booking_date: moment(rescheduledata?.event?.start).format('YYYY-MM-DD'),
                                            time_slot: newTimeSlot,
                                            employee_id:
                                                rescheduledata?.event?.resourceId ||
                                                rescheduledata?.booking?.employee_id,
                                            total_amount: rescheduledata?.booking?.total_amount,
                                            update_duration: true,
                                            allow_past_date: true,
                                            send_sms: rescheduledata?.booking?.send_sms,
                                            send_email: rescheduledata?.booking?.send_email,
                                        });
                                    }
                                }
                                handleClose();
                            }}
                        />
                    </Stack>
                </Paper>
            </Modal>
        </React.Fragment>
    );
}
