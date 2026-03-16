import POSHeading from '@/components/POS/Common/POSHeading';
import { StyleOutlined, Close } from '@mui/icons-material';
import { Alert, IconButton, Modal, Paper, Stack } from '@mui/material';
import { t } from 'i18next';
import React, { useState } from 'react';
import PunchCardList from '../../../Shared/PunchCardList';
import { CartOverride } from '@/types/CartContext.type';
import { useCart } from '@/context/POS/CartContext';
import POSInput from '@/components/POS/Common/POSInput';
import POSButton from '@/components/POS/Common/POSButton';
import { api } from '@/utils/Api/POS';
import { GetApiBundleOffersCodeBundleOfferCode200 } from '@/shared/api/models/getApiBundleOffersCodeBundleOfferCode200';
import { PunchCardHandlersForSales } from './Core/punch-card.handlers';
import PunchCardPaymentSummary from './PunchCardPaymentSummary';
import { calculatedData } from './Types/punch-card-sale.types';
import { overridePayment } from '../../../../Types/sales.types';
import { PostApiSaleBodyDataPaymentItemPaymentType, PostApiSaleBodyDataPaymentItemTxStatus } from '@/shared/api/models';

interface PunchCardPayModalProps {
    open: boolean;
    handleClose: () => void;
    totalAmount: number;
    paymentAmount: number;
    handlePunchCardPayment: (paymentItem: overridePayment) => void;
}

export default function PunchCardPayModal({
    open,
    handleClose,
    totalAmount,
    paymentAmount,
    handlePunchCardPayment,
}: PunchCardPayModalProps) {
    const { cart }: { cart: CartOverride } = useCart();
    const [punchCardInput, setPunchCardInput] = useState('');
    const [validating, setValidating] = useState(false);
    const [alertMessage, setAlertMessage] = useState<{ severity: 'info' | 'error'; message: string }>({
        severity: 'info',
        message: '',
    });
    const [punchCardData, setPunchCardData] = useState<GetApiBundleOffersCodeBundleOfferCode200 | null>(null);
    const [summary, setSummary] = useState<calculatedData | null>(null);
    const [showSummary, setShowSummary] = useState(false);

    const punchCardHandler = new PunchCardHandlersForSales(
        punchCardData,
        cart,
        setAlertMessage,
        cart?.customer?.bundleOffers?.filter((offer) => offer?.residuePunches && offer?.residuePunches > 0),
    );

    const ValidatePunchCard = async ({ id }: { id: string }) => {
        // Implement your validation logic here
        try {
            setValidating(true);
            const response = await api.getApiBundleOffersCodeBundleOfferCode(id);
            punchCardHandler.updatePunchCardData(response);
            setAlertMessage({ severity: 'info', message: '' });
            setPunchCardData(response);
            setTimeout(async () => {
                // validateAndProceed();
                const validate = await punchCardHandler.preparePunchCardSummary();
                if (validate?.success) {
                    setSummary(validate.data);
                    setShowSummary(true);
                }
            }, 200);
        } catch (error) {
            console.error('Error validating Punch Card:', error);
            setAlertMessage({ severity: 'error', message: t('PunchCard.InvalidPunchCard') });
        } finally {
            setValidating(false);
        }
    };

    const onClickContinue = async () => {
        if (!summary) return;

        const PaymentItem = {
            paymentId: null,
            amount: summary?.totals?.totalCoveredByPunch,
            tenderAmount: summary?.totals?.totalCoveredByPunch,
            change: 0,
            txStatus: 'SUCCEEDED' as PostApiSaleBodyDataPaymentItemTxStatus,
            terminalId: null,
            terminalRefId: null,
            terminalStatus: null,
            cardType: null,
            cardFourDigit: null,
            paymentType: 'CUT_CARD' as PostApiSaleBodyDataPaymentItemPaymentType,
            bundleOffer: {
                bundleOfferId: punchCardHandler?.punchCardData?.soldBundleOffer?.id,
                services: summary.succeededItems.map((item) => ({
                    serviceId: item.serviceId,
                    quantity: item?.cartQty,
                })),
            },
            soldBundleOfferId: punchCardHandler?.punchCardData?.soldBundleOffer?.id,
        };

        handlePunchCardPayment(PaymentItem);
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
            }}
        >
            <Paper
                sx={{
                    maxWidth: '90%',
                    maxHeight: '90%',
                    minWidth: '50%',
                    overflow: 'auto',
                    borderRadius: 4,
                    position: 'relative',
                    p: 3,
                }}
            >
                <IconButton
                    sx={{ position: 'absolute', top: 2, right: 2 }}
                    onClick={handleClose}
                    disableFocusRipple
                    disableRipple
                    disableTouchRipple
                >
                    <Close />
                </IconButton>
                {/* Header */}
                <Stack direction="column" alignItems="center" spacing={2}>
                    <StyleOutlined sx={{ fontSize: { xs: 64, md: 128 }, color: '#847A71' }} />
                    <POSHeading text={t('PunchCard.PayWithPunchCard')} sx={{ fontSize: 20, fontWeight: 600 }} />
                </Stack>

                {alertMessage?.message && (
                    <Alert severity={alertMessage?.severity} sx={{ my: 2 }}>
                        {alertMessage.message}
                    </Alert>
                )}

                <Stack direction="row" spacing={2} my={3}>
                    <POSInput
                        value={punchCardInput}
                        onChange={(e) => {
                            setAlertMessage({ severity: 'info', message: '' });
                            setPunchCardInput(e.target.value);
                        }}
                        placeholder={t('PunchCard.WritePunchCardCodeHere')}
                        sx={{ flex: 1 }}
                        disabled={validating}
                    />
                    <POSButton
                        title={t('PunchCard.ValidatePunchCard')}
                        variant="save"
                        onClick={() => {
                            ValidatePunchCard({ id: punchCardInput });
                        }}
                        disabled={!punchCardInput.trim() || validating}
                        width="auto"
                    />
                </Stack>
                {cart?.customerId && (
                    <PunchCardList
                        disabled={validating}
                        onApply={(punchCard) => {
                            if (punchCard.bundleOfferCode) {
                                punchCardHandler.updatePunchCardData(null);
                                ValidatePunchCard({ id: punchCard.bundleOfferCode });
                            } else {
                                setAlertMessage({ severity: 'error', message: t('PunchCard.InvalidPunchCard') });
                            }
                        }}
                        data={punchCardHandler.offersList}
                    />
                )}

                {showSummary && (
                    <PunchCardPaymentSummary
                        open={showSummary}
                        onClose={() => setShowSummary(false)}
                        summary={summary}
                        onContinue={() => {
                            setAlertMessage({ severity: 'info', message: '' });
                            setShowSummary(false);
                            onClickContinue();
                            handleClose();
                            // Handle continue action
                        }}
                    />
                )}
            </Paper>
        </Modal>
    );
}
