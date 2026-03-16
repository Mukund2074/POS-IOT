import React from 'react';
import { Stack, Typography, Grid2 } from '@mui/material';
import moment from 'moment';
import { t } from 'i18next';
import FPrimaryHeading from '../commonComponents/F_PrimaryHeading';
import FButton from '../commonComponents/F_Button';

export default function RescheduleBottomModel({
    open,
    onClose = () => {},
    rescheduledata,
    editPause = () => {},
    isCopyBooking = false,
}) {
    if (!open) return null;
    const isPause = rescheduledata?.booking?.type === 'CALENDAR_PAUSE';
    const isGrouped = rescheduledata?.booking?.isGrouped;

    // Get bunch booking information - use event start/end times for grouped bookings
    const bunchStartTime = rescheduledata?.event?.start ? moment(rescheduledata.event.start).format('HH:mm') : '';
    const bunchEndTime = rescheduledata?.event?.end ? moment(rescheduledata.event.end).format('HH:mm') : '';
    const bunchTimeSlot = bunchStartTime && bunchEndTime ? `${bunchStartTime} - ${bunchEndTime}` : '';

    // Get comma-separated service names for grouped bookings
    const serviceNames =
        isGrouped && rescheduledata?.booking?.origialBookings
            ? rescheduledata.booking.origialBookings.map((booking) => booking.booking_details?.service_name).join(', ')
            : rescheduledata?.booking?.service?.name || (isPause ? t('Calendar.CalendarPause') : '');

    return (
        <Grid2
            container
            spacing={{ xs: 1, md: 2 }}
            sx={{
                alignItems: 'center',
                px: { xs: 2, md: 3 },
                backgroundColor: '#fff',
                height: '10dvh',
                minHeight: '10dvh',
                borderRadius: { xs: 0, md: 1 },
                overflowY: 'scroll',
                scrollbarWidth: 'none',
                overflowX: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Booking Details Section */}
            <Grid2 size={{ xs: 7, md: 4 }}>
                <Stack
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: { xs: 0.5, md: 0 },
                        height: '100%',
                        justifyContent: { xs: 'flex-start', md: 'center' },
                    }}
                >
                    <Typography
                        variant="body1"
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: 1.5,
                            color: '#333',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                        }}
                    >
                        {t('Common.Time')} : &nbsp;
                        {isGrouped && bunchTimeSlot ? (
                            `${moment(rescheduledata?.event?.start).format('DD/MM-YYYY')} t. ${bunchTimeSlot}`
                        ) : (
                            <>
                                {rescheduledata?.booking?.booking_datetime_start &&
                                    moment(rescheduledata?.booking?.booking_datetime_start).format(
                                        'DD/MM-YYYY  t. HH:mm',
                                    )}
                                &nbsp;-&nbsp;
                                {rescheduledata?.booking?.booking_datetime_end &&
                                    moment(rescheduledata?.booking?.booking_datetime_end).format('HH:mm')}
                            </>
                        )}
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: 1.5,
                            color: '#666',
                            fontSize: '0.8rem',
                        }}
                    >
                        {t('Common.Service')} : {serviceNames}
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: 1.5,
                            color: '#666',
                            fontSize: '0.8rem',
                        }}
                    >
                        {t('Common.CapsEmployee')} : {rescheduledata?.booking?.booking_details?.employee_name || ''}
                    </Typography>
                </Stack>
            </Grid2>

            {/* Message Section */}
            <Grid2
                size={{ xs: 12, md: 5 }}
                sx={{
                    height: '100%',
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    flexDirection: 'column',
                    width: '100%',
                    pt: 1,
                }}
            >
                <FPrimaryHeading
                    text={
                        isPause
                            ? t('Calendar.ReschTitlePause')
                            : isCopyBooking
                              ? t('Calendar.CopyBookingTitle')
                              : t('Calendar.ReschTitle')
                    }
                    sx={{
                        mt: 0,
                        fontSize: '1.1rem',
                        display: '-webkit-box',
                        WebkitLineClamp: { xs: 2, md: 1 },
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1.4,
                        fontWeight: 600,
                        color: '#333',
                    }}
                />

                <FPrimaryHeading
                    text={
                        isPause
                            ? t('Calendar.ReschDescPause')
                            : isCopyBooking
                              ? t('Calendar.CopyBookingDesc')
                              : t('Calendar.ReschDesc')
                    }
                    sx={{
                        fontSize: '0.8rem',
                        display: '-webkit-box',
                        WebkitLineClamp: { xs: 3, md: 2 },
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1.5,
                        fontWeight: 400,
                        color: '#666',
                    }}
                />
            </Grid2>

            {/* Actions Section */}
            <Grid2 size={{ xs: 5, md: 3 }}>
                <Stack
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 1,
                        alignItems: { xs: 'flex-end', md: 'flex-end' },
                        justifyContent: { xs: 'flex-end', md: 'flex-end' },
                        height: '100%',
                    }}
                >
                    {isPause && (
                        <FButton
                            title={t('Calendar.EditPause')}
                            variant="delete"
                            sx={{
                                px: 0,
                                whiteSpace: 'nowrap',
                                width: 'fit-content',
                                height: { xs: 30, md: 35 },
                            }}
                            titlesx={{
                                fontSize: { xs: 12, md: 14 },
                            }}
                            onClick={editPause}
                        />
                    )}
                    <FButton
                        title={t('Setting.Cancel')}
                        variant="save"
                        sx={{
                            bgcolor: '#d2d2d2',
                            whiteSpace: 'nowrap',
                            width: 'fit-content',
                            height: { xs: 30, md: 35 },
                        }}
                        titlesx={{
                            fontSize: { xs: 12, md: 14 },
                        }}
                        onClick={onClose}
                    />
                </Stack>
            </Grid2>
        </Grid2>
    );
}
