import { Grid2, IconButton, Modal, Paper, Stack, Typography } from '@mui/material';
import React, { useEffect, useState, useCallback } from 'react';
import { t } from 'i18next';
import FDatePicker from '../commonComponents/F_DatePicker';
import FSwitch from '../commonComponents/f-switch';
import FPrimaryHeading from '../commonComponents/F_PrimaryHeading';
import { Close } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import FButton from '../commonComponents/F_Button';
import moment from 'moment';
import CustomTimePicker from '../settings/commonTimePicker';
import { useSelector } from 'react-redux';
import apiFetcher from '../../utils/interCeptor';
import SendEmailModal from '../customer/customerDetail/Advanced-journal/popup/SendEmailModal';
import { toast } from 'react-toastify';
import { CreateBookingApi } from '../../utils/Api/Booking';

export default function Reschedule({
    open,
    onClose,
    // handleEventUpdate,
    scheduleChange,
    handleBunchBookingEdit,
    onConfirm,
    bookingObject = { booking: { booking_details: {}, outlet_customer: {} }, event: {} },
    employees,
    events,
    isEventOverlapping,
    isCopyBooking,
}) {
    const setting = useSelector((state) => state.settings.data);
    const [data, setdata] = useState({ email: '', id: '', outlet_customer: {} });
    const [showEmailmodel, setshowEmailmodel] = useState(false);
    const [largestServiceDuration, setLargestServiceDuration] = useState(null);
    const [hasTrimError, setHasTrimError] = useState(false);
    const sortedBookings = bookingObject?.booking?.origialBookings?.sort(
        (a, b) => a.booking_details?.start_time - b.booking_details?.start_time,
    );

    const tempBookingObject = { booking: { booking_details: {}, outlet_customer: {} }, event: {} };

    const fetchData = async ({ bookingId }) => {
        try {
            const res = await apiFetcher(`api/v1/store/booking/${bookingId}`);
            setdata((prev) => ({
                ...prev,
                email: res?.data?.data?.booking?.outlet_customer?.email,
                id: res?.data?.data?.booking?.outlet_customer?.id,
                outlet_customer: res?.data?.data?.booking?.outlet_customer,
            }));
            if (!res?.data?.data?.booking?.outlet_customer?.email) {
                formik.setFieldValue('email_conf', false);
                formik.setFieldValue('sms_conf', false);
            }

            // Calculate largest service duration for bunch bookings
            if (scheduleChange?.data?.event?.isGrouped && res?.data?.data?.group_bookings) {
                const groupBookings = [res.data.data.booking, ...res.data.data.group_bookings];
                const largestDuration = Math.max(
                    ...groupBookings.map((booking) => booking.booking_details.duration_min || 0),
                );
                setLargestServiceDuration(largestDuration);
            } else {
                setLargestServiceDuration(null);
            }
        } catch (error) {
            toast.error(t('Calendar.ToastErrBookingReschedule'));
        }
    };

    useEffect(() => {
        if (scheduleChange) {
            formik.setValues({
                date: moment(scheduleChange?.data?.start),
                start_time: moment(scheduleChange?.data?.start),
                end_time: moment(scheduleChange?.data?.end),
                email_conf: false,
                sms_conf: false,
            });
            fetchData({ bookingId: scheduleChange?.data?.event?.id });
        } else if (isCopyBooking) {
            const totalDuration = bookingObject?.booking?.origialBookings.reduce((acc, booking) => {
                return acc + (booking.booking_details?.duration_min || 30);
            }, 0);

            formik.setValues({
                date: moment(event?.start),
                start_time: moment(event?.start),
                end_time: moment(event?.start).add(totalDuration, 'minutes'),
                email_conf: bookingObject?.booking?.last_email_sent,
                sms_conf: bookingObject?.booking?.last_sms_sent,
            });

            fetchData({ bookingId: bookingObject?.booking?.id });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scheduleChange, bookingObject]);

    const validationSchema = Yup.object().shape({
        date: Yup.string().typeError(t('Calendar.YupErrDateReq')).required(t('Calendar.YupErrDateReq')),
        start_time: Yup.string()
            .typeError(t('SpOffers.YupErrStartTimeRequired'))
            .required(t('SpOffers.YupErrStartTimeRequired')),
        end_time: Yup.string()
            .required(t('SpOffers.YupErrEndingTimeRequired'))
            .typeError(t('SpOffers.YupErrEndingTimeRequired'))
            .test('isAfterStartTime', t('Setting.YupEnTimeAftr'), function (value) {
                const { start_time } = this.parent;
                return !value || !start_time || moment(value).isAfter(moment(start_time));
            })
            .test('minDuration', function (value) {
                const { start_time } = this.parent;
                if (largestServiceDuration && value && start_time) {
                    const duration = moment(value).diff(moment(start_time), 'minutes');
                    const minAllowedDuration = largestServiceDuration - 5;
                    const originalDuration = scheduleChange?.data
                        ? moment(scheduleChange.data.end).diff(moment(scheduleChange.data.start), 'minutes')
                        : null;

                    // Only validate if we're shortening the booking (new duration < original duration)
                    const isShortening = originalDuration && duration < originalDuration;
                    if (isShortening && duration < minAllowedDuration) {
                        return this.createError({
                            message: t('Calendar.MinDurationError', {
                                minDuration: minAllowedDuration,
                                defaultValue: `${t('Calendar.MinDuration1')} ${minAllowedDuration} ${t('Calendar.MinDuration2')}`,
                            }),
                        });
                    }
                }
                return true;
            }),
        email_conf: Yup.bool(),
        sms_conf: Yup.bool(),
    });

    const formik = useFormik({
        initialValues: { date: null, start_time: null, end_time: null, email_conf: false, sms_conf: false },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            // Check if both start and end times have changed from original
            const originalStart = moment(scheduleChange?.data?.start);
            const originalEnd = moment(scheduleChange?.data?.end);
            const newStart = values.start_time;
            const newEnd = values.end_time;

            const startChanged = !newStart.isSame(originalStart, 'minute');
            const endChanged = !newEnd.isSame(originalEnd, 'minute');
            const anyTimeChanged = startChanged || endChanged;

            // console.log('🎯 [DEBUG] Reschedule form submitted with values:', {
            //     startTime: values.start_time.format('HH:mm'),
            //     endTime: values.end_time.format('HH:mm'),
            //     originalStart: originalStart.format('HH:mm'),
            //     originalEnd: originalEnd.format('HH:mm'),
            //     startChanged,
            //     endChanged,
            //     bothChanged,
            //     anyTimeChanged,
            //     isResizing: scheduleChange?.isResizing,
            //     isDragAndDrop: !scheduleChange?.isResizing && !anyTimeChanged,
            // });

            let finalValues = {
                ...scheduleChange?.data,
                date: values.date.toDate(),
                start: values.start_time.toDate(),
                end: values.end_time.toDate(),
                send_email: values.email_conf,
                send_sms: values.sms_conf,
            };

            if (isCopyBooking) {
                await handleConfirmBooking().then(() => {
                    onClose();
                    onConfirm();
                });
                return;
            } else {
                await handleBunchBookingEdit({
                    event: scheduleChange?.data?.event,
                    start: values.start_time.toDate(),
                    end: values.end_time.toDate(),
                    resourceId: finalValues.resourceId,
                    isDragAndDrop: !scheduleChange?.isResizing && !anyTimeChanged,
                    send_email: finalValues.send_email,
                    send_sms: finalValues.send_sms,
                }).then(() => {
                    onClose();
                });
                return;
            }
        },
    });

    useEffect(() => {
        if (setting?.OnlineBooking?.autoToggle?.email) {
            formik.setFieldValue('email_conf', setting?.OnlineBooking?.autoToggle?.email);
        }
        if (setting?.OnlineBooking?.autoToggle?.sms) {
            formik.setFieldValue('sms_conf', setting?.OnlineBooking?.autoToggle?.sms);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setting]);

    const isEmailPermission = !data.outlet_customer ? false : setting?.profile?.enable_email;
    const isSmsPermission = !data.outlet_customer ? false : setting?.profile?.enable_sms;
    const updateEmail = async (values) => {
        try {
            await apiFetcher.patch(`api/v1/store/customer/outlet?id=${data?.id}`, {
                ...data?.outlet_customer,
                email: values?.email,
            });
            setdata((prev) => ({ ...prev, email: values?.email }));
            toast.success(t('Customer.CustomerUpdateSuccess'));
            setshowEmailmodel(false);
        } catch (error) {
            toast.error(t('Customer.CustomerUpdateFailed'));
        }
    };

    // Check for conflicts and calculate trimming using existing function
    const checkConflictsAndTrim = useCallback(() => {
        if (!bookingObject) return { error: 'No booking object' };
        const { booking, event } = bookingObject;
        const { origialBookings } = booking || {};

        // Sort bookings by their original start time to maintain chronological order
        const allBookings = (origialBookings || [booking].filter(Boolean)).sort((a, b) => {
            const timeA = moment(a.booking_details?.start_time || a.start_time);
            const timeB = moment(b.booking_details?.start_time || b.start_time);
            return timeA.diff(timeB);
        });

        // Create a single event for the entire group
        const newEvent = {
            start: formik.values.start_time,
            end: formik.values.end_time,
            resourceId: event?.resourceId,
            event: { id: event?.id },
        };

        const { isOverlap, event: conflictingEvent } = isEventOverlapping(events, newEvent);

        if (!isOverlap || !conflictingEvent || !conflictingEvent.start || !conflictingEvent.end) {
            // No conflicts - return original bookings
            return allBookings;
        }

        // There's a conflict - calculate how much we need to trim
        const conflictingStart = moment(conflictingEvent.start);
        const newEventEnd = moment(newEvent.end);
        const trimAmount = newEventEnd.diff(conflictingStart, 'minutes');

        const largestBooking = allBookings.reduce((max, booking) => {
            return Math.max(max, booking.booking_details?.duration_min || 30);
        }, 0);
        const minServiceDuration = 5;
        const maxAllowedTrimming = largestBooking - minServiceDuration;

        if (trimAmount <= maxAllowedTrimming) {
            // We can trim enough - only trim the last booking(s) that are conflicting
            const trimmedBookings = [...allBookings];

            // Find which booking(s) are conflicting with the existing booking
            let cumulativeTime = 0;
            let conflictingIndex = -1;

            for (let i = 0; i < allBookings.length; i++) {
                const bookingDuration = allBookings[i].booking_details?.duration_min || 30;
                const bookingStart = moment(formik.values.start_time).add(cumulativeTime, 'minutes');
                const bookingEnd = moment(bookingStart).add(bookingDuration, 'minutes');

                // Check if this booking conflicts
                if (bookingStart.isBefore(conflictingStart) && bookingEnd.isAfter(conflictingStart)) {
                    conflictingIndex = i;
                    break;
                }
                cumulativeTime += bookingDuration;
            }

            if (conflictingIndex >= 0) {
                // Trim the conflicting booking
                const conflictingBooking = trimmedBookings[conflictingIndex];
                const newDuration = Math.max(
                    minServiceDuration,
                    (conflictingBooking.booking_details?.duration_min || 30) - trimAmount,
                );

                trimmedBookings[conflictingIndex] = {
                    ...conflictingBooking,
                    booking_details: {
                        ...conflictingBooking.booking_details,
                        duration_min: newDuration,
                    },
                };
            }

            return trimmedBookings;
        } else {
            return { error: t('Calendar.CannotTrimEnough') };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookingObject, formik.values.start_time, formik.values.end_time, isEventOverlapping, events]);

    // Check for trim errors when formik values change
    useEffect(() => {
        if (formik.values.start_time && formik.values.end_time) {
            const trimResult = checkConflictsAndTrim();
            setHasTrimError(!!trimResult.error);
        }
    }, [formik.values.start_time, formik.values.end_time, checkConflictsAndTrim]);

    if (isCopyBooking && !bookingObject) return null;
    const { booking = { booking_details: {}, outlet_customer: {} }, event = {} } = bookingObject || tempBookingObject;
    const { booking_details, outlet_customer } = booking;

    // Calculate new times for each booking - each booking starts when the previous one ends
    const calculateNewBookingTimes = (booking, index, trimmedBookings) => {
        const originalDuration = booking.booking_details?.duration_min || 30;

        // Calculate total available time from formik start to end
        const totalAvailableMinutes = moment(formik.values.end_time).diff(moment(formik.values.start_time), 'minutes');

        // Calculate total original duration of all bookings
        const totalOriginalDuration = trimmedBookings.reduce(
            (sum, b) => sum + (b.booking_details?.duration_min || 30),
            0,
        );

        // Calculate proportional duration for this booking and round to nearest 5 minutes
        const proportionalDuration = Math.round((originalDuration / totalOriginalDuration) * totalAvailableMinutes);
        const roundedDuration = Math.round(proportionalDuration / 5) * 5; // Round to nearest 5 minutes

        if (index === 0) {
            // First booking starts at the new event start time
            const startTime = formik.values.start_time;
            const endTime = moment(startTime).add(roundedDuration, 'minutes');
            return { startTime, endTime, duration: roundedDuration };
        } else if (index === trimmedBookings.length - 1) {
            // Last booking - ensure it ends exactly at formik end time
            let cumulativeDuration = 0;
            for (let i = 0; i < index; i++) {
                const prevOriginalDuration = trimmedBookings[i].booking_details?.duration_min || 30;
                const prevProportionalDuration = Math.round(
                    (prevOriginalDuration / totalOriginalDuration) * totalAvailableMinutes,
                );
                const prevRoundedDuration = Math.round(prevProportionalDuration / 5) * 5; // Round to nearest 5 minutes
                cumulativeDuration += prevRoundedDuration;
            }

            const startTime = moment(formik.values.start_time).add(cumulativeDuration, 'minutes');
            const endTime = formik.values.end_time; // Use exact formik end time
            const actualDuration = moment(endTime).diff(moment(startTime), 'minutes');
            return { startTime, endTime, duration: actualDuration };
        } else {
            // Calculate cumulative duration of all previous bookings
            let cumulativeDuration = 0;
            for (let i = 0; i < index; i++) {
                const prevOriginalDuration = trimmedBookings[i].booking_details?.duration_min || 30;
                const prevProportionalDuration = Math.round(
                    (prevOriginalDuration / totalOriginalDuration) * totalAvailableMinutes,
                );
                const prevRoundedDuration = Math.round(prevProportionalDuration / 5) * 5; // Round to nearest 5 minutes
                cumulativeDuration += prevRoundedDuration;
            }

            // Start time is the form start time plus cumulative duration of previous bookings
            const startTime = moment(formik.values.start_time).add(cumulativeDuration, 'minutes');
            const endTime = moment(startTime).add(roundedDuration, 'minutes');
            return { startTime, endTime, duration: roundedDuration };
        }
    };

    // Generate payload for copying bookings
    const generateCopyBookingPayload = () => {
        // Recalculate trimmed bookings with current formik values
        const trimResult = checkConflictsAndTrim();
        const trimmedBookings = trimResult.error ? [] : trimResult;

        // Update error state
        setHasTrimError(!!trimResult.error);

        const services = trimmedBookings.map((originalBooking, index) => {
            const { startTime, endTime, duration } = calculateNewBookingTimes(originalBooking, index, trimmedBookings);
            const timeSlot = `${startTime.format('HH:mm')} - ${endTime.format('HH:mm')}`;

            return {
                service_id: originalBooking.service_id,
                time_slot: timeSlot,
                employee_id: event?.resourceId,
                duration: duration,
                total_amount: originalBooking.total_amount || originalBooking.booking_details?.price,
                booking_id: null,
            };
        });

        return {
            booking_id: null,
            customer_name: booking_details?.customer_name || outlet_customer?.name || '',
            customer_country_code: booking_details?.customer_country_code || outlet_customer?.country_code || '',
            customer_country_iso_code: outlet_customer?.country_iso_code || 'DK',
            customer_phone_number: booking_details?.customer_phone_number || outlet_customer?.phone_number || '',
            booking_date: formik.values.date
                ? formik.values.date.format('YYYY-MM-DD')
                : moment(sortedBookings[0]?.booking_date, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD'),
            note: booking_details?.note || '',
            send_email: booking?.send_email || false,
            send_sms: booking?.send_sms || true,
            walk_in: booking_details?.walk_in || false,
            created_by_emp_id: booking?.created_by_emp_id || 988,
            created_by_emp_name: employees.find((emp) => emp.id === event?.resourceId)?.name || '',
            need_customer_info: false,
            customer_info_metadata: [],
            services: services,
        };
    };

    // Handle confirm booking
    const handleConfirmBooking = async () => {
        try {
            const payload = generateCopyBookingPayload();
            const response = await CreateBookingApi({
                isEdit: false,
                body: { ...payload, google_calendar_sync: true },
            });

            if (response?.data?.success) {
                const bookingCount = payload.services?.length || 0;
                toast.success(
                    `Successfully copied ${bookingCount} booking${bookingCount > 1 ? 's' : ''} to new schedule!`,
                );
                onClose();
            } else {
                toast.error(t('Calendar.ToastErrBookingFailed') || 'Failed to copy bookings. Please try again.');
            }
        } catch (error) {
            console.error('Error copying bookings:', error);
            toast.error(t('Calendar.ToastErrBookingFailed') || 'Failed to copy bookings. Please try again.');
        } finally {
            onConfirm();
        }
    };

    return (
        <Modal
            disableAutoFocus
            open={open}
            onClose={onClose}
            keepMounted
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Paper
                sx={{
                    position: 'relative',
                    maxWidth: 600,
                    maxHeight: '80%',
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 8,
                    py: 4,
                    px: 6,
                    minWidth: '20%',
                    minHeight: '10%',
                }}
            >
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={onClose}>
                    <Close />
                </IconButton>

                <FPrimaryHeading text={isCopyBooking ? t('Calendar.CopyBooking') : t('Calendar.Reschedule')} />

                {hasTrimError && isCopyBooking && (
                    <Stack
                        sx={{
                            backgroundColor: '#f8d7da',
                            border: '1px solid #dc3545',
                            borderRadius: 2,
                            p: 2,
                            mb: 2,
                        }}
                    >
                        <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
                            {t('Calendar.CopyError')}
                        </Typography>
                        <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                            {t('Calendar.CopyErrorDesc')}
                            {t('Calendar.CopyErrorDesc2')}
                        </Typography>
                    </Stack>
                )}

                <Grid2 container spacing={2} mt={4}>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                        <FDatePicker
                            format={'DD/MM-YYYY'}
                            value={formik.values.date}
                            onChange={(value) => formik.setFieldValue('date', value)}
                            sx={{ width: '100%' }}
                        />
                        {formik?.touched?.date && formik?.errors?.date && (
                            <Typography style={{ color: 'red' }}>{formik?.errors?.date}</Typography>
                        )}
                    </Grid2>

                    <Grid2 size={{ xs: 12, md: 6 }}>
                        <Stack display={'flex'} flexDirection="row" alignItems="center" m={0}>
                            <Stack sx={{ width: '47.5%' }}>
                                <CustomTimePicker
                                    value={formik.values.start_time}
                                    onChange={(time) => formik.setFieldValue('start_time', time)}
                                    borderRadius={{
                                        topLeft: '13px',
                                        topRight: '0px',
                                        bottomLeft: '0px',
                                        bottomRight: '13px',
                                    }}
                                    sx={{ width: '100%' }}
                                />
                            </Stack>

                            <Stack
                                sx={{
                                    width: '15%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderTop: '1px solid #d1d1d1',
                                    borderBottom: '1px solid #d1d1d1',
                                    height: 40,
                                }}
                            >
                                <Typography sx={{ width: 'full', color: '#1F1F1F' }}>{t('Common.To')}</Typography>
                            </Stack>

                            <Stack sx={{ width: '47.5%' }}>
                                <CustomTimePicker
                                    value={formik.values.end_time}
                                    onChange={(time) => formik.setFieldValue('end_time', time)}
                                    borderRadius={{
                                        topLeft: '0px',
                                        topRight: '13px',
                                        bottomLeft: '13px',
                                        bottomRight: '0px',
                                    }}
                                    sx={{ width: '100%' }}
                                />
                            </Stack>
                        </Stack>
                        {formik.errors.start_time && formik.touched.start_time && (
                            <Typography variant="body2" sx={{ color: 'red' }}>
                                {formik.errors.start_time}
                            </Typography>
                        )}
                        {formik.errors.end_time && formik.touched.end_time && (
                            <Typography variant="body2" sx={{ color: 'red' }}>
                                {formik.errors.end_time}
                            </Typography>
                        )}
                        {largestServiceDuration && (
                            <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
                                {t('Calendar.MinDurationInfo', {
                                    minDuration: largestServiceDuration - 5,
                                    defaultValue: `${t('Calendar.MinDurationInfo', {
                                        minDuration: largestServiceDuration - 5,
                                        defaultValue: `${t('Calendar.MinDuration1')} ${largestServiceDuration - 5} ${t('Calendar.MinDuration2')}`,
                                    })}`,
                                })}
                            </Typography>
                        )}
                    </Grid2>
                </Grid2>

                <FPrimaryHeading sx={{ mt: 4 }} text={t('Calendar.Confirmation')} />

                <Stack width={'50%'} mt={2} gap={1}>
                    <FSwitch
                        disabled={!isEmailPermission}
                        checked={formik.values.email_conf}
                        onChange={(e) => {
                            formik.setFieldValue('email_conf', !formik.values.email_conf);
                            if (!data.email) {
                                if (!formik.values.email_conf) {
                                    setshowEmailmodel(true);
                                }
                            }
                        }}
                        label={t('Calendar.EmailConf')}
                    />
                    {showEmailmodel && (
                        <SendEmailModal
                            open={showEmailmodel}
                            onClose={() => {
                                setshowEmailmodel(false);
                                formik.setFieldValue('email_conf', !formik.values.email_conf);
                            }}
                            handleSubmit={(values) => {
                                if (data.id) {
                                    updateEmail(values);
                                } else {
                                    toast.error(t('Customer.CustomerUpdateFailed'));
                                }
                            }}
                        />
                    )}

                    <FSwitch
                        disabled={!isSmsPermission}
                        checked={formik.values.sms_conf}
                        onChange={(e) => formik.setFieldValue('sms_conf', !formik.values.sms_conf)}
                        label={t('Calendar.SmsConf')}
                        sx={{ width: 'auto' }}
                    />
                </Stack>

                <Stack
                    sx={{
                        mt: 4,
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <FButton
                        variant={'save'}
                        sx={{ backgroundColor: '#d0d0d0', minWidth: '25%' }}
                        title={t('Setting.Cancel')}
                        onClick={onClose}
                    />
                    <FButton
                        variant={'save'}
                        sx={{ minWidth: '25%' }}
                        title={isCopyBooking ? t('Calendar.CopyBooking') : t('Calendar.Reschedule')}
                        onClick={formik.handleSubmit}
                    />
                </Stack>
            </Paper>
        </Modal>
    );
}
