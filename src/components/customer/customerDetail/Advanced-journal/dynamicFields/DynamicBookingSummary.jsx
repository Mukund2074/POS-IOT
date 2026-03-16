import React, { useState } from 'react';
import { Stack, Accordion, AccordionSummary, AccordionDetails, Typography, Grid2 } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { t } from 'i18next';
import FButton from '../../../../commonComponents/F_Button';
import SendEmailModal from '../popup/SendEmailModal';
import moment from 'moment';
import { SendBookingConfirmationEmailApi } from '../../../../../utils/Api/Customer';
import { toast } from 'react-toastify';
import { HttpStatusCode } from 'axios';

export default function DynamicBookingSummary({ bookings, field, fetchFixedData, customer, formik, name }) {
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [expanded, setExpanded] = useState(false);

    const handleSubmit = async (values) => {
        const payload = {
            booking_id: values?.booking_id || selectedBooking?.id,
            email: values?.email,
            outlet_customer_id: customer?.id,
        };
        try {
            const response = await SendBookingConfirmationEmailApi({ payload });
            if (response?.status === HttpStatusCode.Ok || response?.status === HttpStatusCode.Created) {
                toast.success(t('Customer.SendConfEmailSuccess'));
                // Refresh data once after successful email send
                const timeout = setTimeout(() => {
                    fetchFixedData(false);
                }, 1000);
                return () => clearTimeout(timeout);
            }
        } catch (error) {
            console.error(error);
            toast.error(t('Customer.SendConfEmailError'));
        }
    };

    const handleButtonClick = (booking) => {
        setSelectedBooking(booking);
        if (customer?.email && customer?.email !== '') {
            handleSubmit({ email: customer?.email, booking_id: booking?.id });
        } else {
            setShowEmailModal(true);
        }
    };

    const BookingCard = ({ booking }) => (
        <Grid2
            onClick={(e) => {
                if (booking?.last_email_at) {
                    e.stopPropagation();
                    e.preventDefault();
                    formik.setFieldValue(name, moment.parseZone(booking?.last_email_at).format('DD/MM-YYYY HH.mm'));
                    setExpanded(false);
                }
            }}
            container
            spacing={3}
            sx={{
                bgcolor: getDate(booking?.booking_start_datetime).includes('today') ? '#EBFFE5' : '#D9D9D966',
                p: 1,
                cursor: 'pointer',
            }}
        >
            <Grid2 size={{ xs: 12, md: 6 }}>
                <BookingDetail label={t('Insights.Customer')} value={booking?.customer_name} />
                <BookingDetail label={t('Customer.Telephone')} value={booking?.customer_telephone} />
                <BookingDetail label={t('Common.CapsEmployee')} value={booking?.employee_name} />
                <BookingDetail label={t('Common.Service')} value={booking?.services} />
                <BookingDetail
                    label={t('Common.Time')}
                    value={booking?.booking_start_datetime ? getDate(booking?.booking_start_datetime) : ''}
                />
                <BookingDetail label={t('Common.Total')} value={`${booking?.total_amount} Kr.`} />
            </Grid2>

            <Grid2 size={{ xs: 12, md: 6 }}>
                <BookingDetail
                    direction="column"
                    label={t('Customer.BookingCreated')}
                    value={
                        booking?.booking_created_at
                            ? moment(booking?.booking_created_at).format('DD/MM-YYYY HH.mm')
                            : ''
                    }
                />
                <BookingDetail
                    label={t('Customer.PatientInformationSent')}
                    value={
                        booking?.last_email_at
                            ? `${moment.parseZone(booking?.last_email_at).format('DD/MM-YYYY')} kl. ${moment.parseZone(booking?.last_email_at).format('HH:mm')}`
                            : `${t('Customer.NotSent')}!`
                    }
                    color={booking?.last_email_at ? '#4caf50' : '#BA0000'}
                    fontWeight={700}
                    direction="column"
                />

                {!booking?.last_email_at && (
                    <FButton
                        variant={'save'}
                        title={t('Customer.SendNow')}
                        sx={{ height: 30, maxWidth: 'fit-content', px: 0, bgcolor: '#fff', color: '#000', mt: 1 }}
                        titleSize={12}
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleButtonClick(booking);
                        }}
                    />
                )}
            </Grid2>
        </Grid2>
    );

    return (
        <Stack spacing={2} width={{ xs: '100%', md: '50%' }}>
            <Typography fontWeight={700} variant="body1">
                {field?.name || ''}
            </Typography>

            <Accordion
                expanded={expanded}
                onChange={(e, expanded) => {
                    setExpanded(expanded);
                }}
                sx={{
                    border: '1px solid #f9f9f9',
                    borderRadius: '10px !important',
                    '&:before': {
                        display: 'none',
                    },
                    '&.Mui-expanded': {
                        borderRadius: '10px !important',
                        margin: 0,
                    },
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                        backgroundColor: '#ffffff',
                        borderRadius: 4,
                        minHeight: 48,
                        '&.Mui-expanded': {
                            borderRadius: 4,
                            minHeight: 48,
                        },
                    }}
                >
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {formik?.values[name] || formik?.values[name] !== ''
                            ? formik?.values[name]
                            : t('Customer.ChooseBooking')}
                    </Typography>
                </AccordionSummary>

                <AccordionDetails
                    sx={{
                        p: 0,
                        gap: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: 350,
                        overflowY: 'scroll',
                        scrollbarWidth: 'thin',
                    }}
                >
                    {bookings?.length > 0 &&
                        bookings?.map((booking, index) => <BookingCard key={booking.id} booking={booking} />)}
                    {bookings?.length === 0 && (
                        <Typography variant="body1" sx={{ fontWeight: 600, p: 4, textAlign: 'center' }}>
                            {t('Customer.NoBookings')}
                        </Typography>
                    )}
                </AccordionDetails>
            </Accordion>

            <SendEmailModal
                open={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                handleSubmit={handleSubmit}
            />
        </Stack>
    );
}

const BookingDetail = ({ label, value, color = '#1F1F1F', fontWeight = 400, direction = 'row' }) => (
    <Stack
        sx={{
            display: 'flex',
            flexDirection: direction,
            alignItems: direction === 'column' ? 'flex-start' : 'center',
            gap: direction === 'column' ? 0 : 1,
        }}
    >
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F1F1F', fontSize: 14, whiteSpace: 'nowrap' }}>
            {label}:
        </Typography>
        <Typography
            variant="body2"
            sx={{
                color: color,
                fontWeight: fontWeight,
                fontSize: 14,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}
        >
            {value}
        </Typography>
    </Stack>
);

const getDate = (date) => {
    return moment(date).isSame(moment(), 'day')
        ? `${moment.parseZone(date).format('ddd [d.] DD/MM-YYYY [kl.] HH:mm')} (today)`
        : moment.parseZone(date).format('ddd [d.] DD/MM-YYYY [kl.] HH:mm');
};
