import { Close } from '@mui/icons-material';
import { CircularProgress, DialogContent, Divider, IconButton, Modal, Paper, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import CalenderIcon from '../../assets/calendar.png';
import ClockIcon from '../../assets/newClockDesign.svg';
import { useState } from 'react';
import FPrimaryHeading from '../commonComponents/F_PrimaryHeading';
import moment from 'moment';
import { formatAmount } from '../../utils/format-amout';
import FTextInput from '../commonComponents/F_TextInput';
import FButton from '../commonComponents/F_Button';
import apiFetcher from '../../utils/interCeptor';
import { toast } from 'react-toastify';
import BlurPrice from '@/components/commonComponents/BlurPrice';

const CancellationOfferModal = ({
    cancellationOfferModal,
    setCancellationOfferModal,
    bookingDetails,
    refreshBooking,
    setShowForm,
}) => {
    const [loading, setLoading] = useState(false);
    const price = bookingDetails?.booking?.service?.price || 0;

    const [newPrice, setNewPrice] = useState(bookingDetails?.booking?.service?.cancellation_offer_price || '');
    const [percentage, setPercentage] = useState('0');

    // Helper to allow only numbers and decimals
    const onlyNumbers = (value) => value.replace(/[^\d.]/g, '');

    // Handler when New Price changes
    const handleNewPriceChange = (value) => {
        const cleaned = onlyNumbers(value);
        setNewPrice(cleaned);

        if (cleaned && price) {
            const percent = ((price - parseFloat(cleaned)) / price) * 100;
            setPercentage(percent.toFixed(2));
        } else {
            setPercentage('');
        }
    };

    // Handler when Percentage changes
    const handlePercentageChange = (value) => {
        const cleaned = onlyNumbers(value);
        setPercentage(cleaned);

        if (cleaned && price) {
            const calculatedPrice = price - (price * parseFloat(cleaned)) / 100;
            setNewPrice(calculatedPrice.toFixed(2));
        } else {
            setNewPrice('');
        }
    };

    const handleCancellationOffer = async () => {
        try {
            setLoading(true);

            const response = await apiFetcher.post('/api/v1/store/service/cancellation_offer', {
                booking_id: bookingDetails?.booking?.id,
                cancellation_offer_price: newPrice,
            });

            if (response) {
                toast.success(t('Calendar.CancelOfferSuccess'));
                setCancellationOfferModal(false);
                refreshBooking();
                setShowForm((prev) => ({ ...prev, detail: false }));
            }
        } catch (error) {
            console.error('Error : ', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            keepMounted
            disableAutoFocus
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
            onClose={() => setCancellationOfferModal(false)}
            open={cancellationOfferModal}
        >
            <Paper
                sx={{
                    position: 'relative',
                    maxWidth: { xs: '90%', md: '40%' },
                    width: '100%',
                    borderRadius: { xs: 5, md: 7 },
                    overflow: 'hidden',
                    maxHeight: '90%',
                    overflowY: 'scroll',
                    scrollbarWidth: 'none',
                    boxShadow: cancellationOfferModal ? 'none' : undefined,
                    backgroundColor: '#fff',
                    p: { xs: 2, md: 3 },
                }}
            >
                {cancellationOfferModal && (
                    <IconButton
                        disableRipple
                        aria-label="close"
                        sx={{ position: 'absolute', right: 8, top: 8, color: '#6f6f6f' }}
                        onClick={() => setCancellationOfferModal(false)}
                    >
                        <Close />
                    </IconButton>
                )}

                {loading ? (
                    <DialogContent
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minWidth: '30dvw',
                            minHeight: '50dvh',
                            p: { xs: 1, md: 2 },
                        }}
                    >
                        <CircularProgress size="2.5rem" sx={{ color: '#6f6f6f' }} />
                    </DialogContent>
                ) : (
                    <>
                        <FPrimaryHeading text={t('Calendar.CreateCancelationOffer')} />

                        <Stack sx={{ p: 1, mt: 2 }}>
                            <Stack
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', md: 'row' },
                                    alignItems: { xs: 'flex-start', md: 'center' },
                                    justifyContent: { xs: 'flex-start', md: 'space-between' },
                                    gap: { xs: 1, md: 0 },
                                    width: '100%',
                                }}
                            >
                                <Stack sx={{ display: 'flex', gap: 1 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                        {t('Calendar.ServiceName')} :{' '}
                                        {bookingDetails?.booking?.booking_details?.service_name}
                                    </Typography>
                                    <BlurPrice>
                                        <Typography variant="body1">
                                            {t('Common.Price')} : {formatAmount(price)}
                                        </Typography>
                                    </BlurPrice>
                                </Stack>

                                <Stack
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'row', md: 'column' },
                                        gap: 1,
                                        width: { xs: '100%', md: 'auto' },
                                    }}
                                >
                                    <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                                        <img
                                            src={CalenderIcon}
                                            alt="calendar"
                                            style={{ height: '20px', width: '20px' }}
                                        />
                                        <Typography variant="body2">
                                            {moment(bookingDetails?.booking?.booking_datetime_start).format(
                                                'DD/MM-YYYY',
                                            )}
                                        </Typography>
                                    </Stack>
                                    <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                                        <img src={ClockIcon} alt="clock" style={{ height: '20px', width: '20px' }} />
                                        <Typography variant="body2">
                                            {moment(bookingDetails?.booking?.booking_datetime_start).format('HH:mm')} -{' '}
                                            {moment(bookingDetails?.booking?.booking_datetime_end).format('HH:mm')}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Stack>

                            <Divider sx={{ borderWidth: '0.5', borderColor: '#696969', my: 3 }} />

                            <Stack sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1 }}>
                                <Stack sx={{ width: { xs: '100%', md: '50%' } }}>
                                    <FPrimaryHeading
                                        text={`${t('SpOffers.NewPR')} (${t('POS.Currency')})`}
                                        fontSize="16px"
                                    />
                                    <FTextInput
                                        placeholder={t('SpOffers.NewPR')}
                                        value={newPrice}
                                        onChange={(e) => handleNewPriceChange(e.target.value)}
                                        sx={{ width: '100%', mt: 1 }}
                                    />
                                </Stack>

                                <Stack sx={{ width: { xs: '100%', md: '50%' } }}>
                                    <FPrimaryHeading text={`${t('SpOffers.Percentage')} (%)`} fontSize="16px" />
                                    <FTextInput
                                        placeholder={t('SpOffers.Percentage')}
                                        value={percentage}
                                        onChange={(e) => handlePercentageChange(e.target.value)}
                                        sx={{ width: '100%', mt: 1 }}
                                    />
                                </Stack>
                            </Stack>
                        </Stack>

                        <Divider sx={{ borderWidth: '0.5', borderColor: '#696969', my: 3 }} />

                        <Stack
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                justifyContent: { md: 'space-between' },
                                gap: 1,
                                mt: 1,
                            }}
                        >
                            <FButton
                                title={t('Calendar.Cancel')}
                                titleColor={'#fff'}
                                sx={{ backgroundColor: '#D9D9D9', height: { xs: 35, md: 40 } }}
                                onClick={() => setCancellationOfferModal(false)}
                            />
                            <FButton
                                title={t('Calendar.CreateCancelationOffer')}
                                titleColor={'#fff'}
                                sx={{
                                    backgroundColor: !newPrice || Number(newPrice) <= 0 ? '#D9D9D9' : '#44b904',
                                    height: { xs: 35, md: 40 },
                                }}
                                onClick={() => handleCancellationOffer()}
                                disabled={!newPrice || Number(newPrice) <= 0}
                            />
                        </Stack>
                    </>
                )}
            </Paper>
        </Modal>
    );
};

export default CancellationOfferModal;
