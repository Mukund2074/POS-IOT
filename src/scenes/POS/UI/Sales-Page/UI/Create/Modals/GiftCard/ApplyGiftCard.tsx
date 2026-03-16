import { IconButton, Modal, Paper, Stack, Typography, Alert } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { Close, CardGiftcard } from '@mui/icons-material';
import { t } from 'i18next';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSButton from '@/components/POS/Common/POSButton';
import POSInput from '@/components/POS/Common/POSInput';
import { useCart } from '@/context/POS/CartContext';
import GiftCardList from '../../../Shared/GiftCardList';
import { useGiftCardByCode } from '@/hooks/api/giftCard';
import { GetApiGiftCardsCodeCode200, PostApiSaleBodyDataItemsItem } from '@/shared/api/models';
import { ApplyGiftCardProps, GiftCard } from '../../../../Types/sales.types';
import UseGiftCardConfirm from './UseGiftCardConfirm';

export default function ApplyGiftCard({
    open,
    onClose,
    onConfirm,
    predefinedAmount,
    activeGiftCards,
    setActiveGiftCards,
    localPayments,
}: ApplyGiftCardProps) {
    const [giftCardCode, setGiftCardCode] = useState('');

    const [validating, setValidating] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [showAmountModal, setShowAmountModal] = useState(false);
    const [pendingGiftCard, setPendingGiftCard] = useState<GiftCard | null>(null);
    const [amountComparison, setAmountComparison] = useState<{
        giftCardAmount: number;
        requiredAmount: number;
        residueValue: number;
    } | null>(null);
    const { getAllItems } = useCart();
    const cartItems = getAllItems();

    const [giftCardInput, setGiftCardInput] = useState('');
    const [selectedGiftCard, setSelectedGiftCard] = useState<GiftCard | GetApiGiftCardsCodeCode200 | null>(null);

    const { data: giftCardValidation, isLoading: isValidationLoading } = useGiftCardByCode({
        code: giftCardCode,
        enabled: validating && !!giftCardCode,
        isReverseCheck: false,
    });
    const [showUseAnyWay, setShowUseAnyWay] = useState(false);

    const validateAndProceed = ({
        giftCard,
        residueValue,
    }: {
        giftCard: GetApiGiftCardsCodeCode200;
        residueValue: number;
    }) => {
        setSelectedGiftCard(giftCard);
        // Check if gift card is applicable to current cart items
        const applicabilityCheck = validateGiftCardApplicability(giftCard);

        if (!applicabilityCheck.isApplicable) {
            setAlertMessage(applicabilityCheck.message);
            setValidating(false);
            setGiftCardCode('');
            return;
        }

        const giftCardAmount = residueValue || 0;
        if (giftCardAmount <= 0) {
            setAlertMessage(t('POS.GiftCardUsed'));
            return;
        }
        const amountToCheck: number = calculateRequiredAmount(applicabilityCheck.applicableItems || []);

        const newCard: GiftCard = {
            code: giftCardCode,
            residueValue: giftCardAmount,
            expiresDate: giftCardValidation?.giftCard?.expiryDate || '',
            isActive: true,
            id: giftCardValidation?.giftCard?.id,
            applicableServiceIds: giftCardValidation?.giftCard?.applicableServiceIds || [],
        };

        // Check if gift card amount is less than required/predefined amount
        if (giftCardAmount < amountToCheck) {
            setPendingGiftCard(newCard);
            setAmountComparison({
                giftCardAmount,
                requiredAmount: amountToCheck,
                residueValue: residueValue,
            });
            setShowAmountModal(true);
        } else {
            setActiveGiftCards((prev) =>
                prev.map((card) =>
                    card.giftCardCode === newCard.code
                        ? { ...card, residueValue: card.residueValue - amountToCheck }
                        : card,
                ),
            );
            onConfirm(giftCardValidation?.giftCard?.id || '', amountToCheck);
            onClose();
        }

        setAlertMessage(''); // Clear alert on success
    };

    useEffect(() => {
        if (!validating) return;

        if (!isValidationLoading && validating) {
            if (giftCardValidation?.valid && giftCardValidation.giftCard) {
                // Only subtract localPayments for this specific gift card
                const residueValue =
                    (giftCardValidation.giftCard?.residueValue || 0) -
                    (localPayments
                        ?.filter(
                            (payment) =>
                                payment.paymentType === 'GIFT_CARD' &&
                                payment.giftCardId === giftCardValidation.giftCard?.id,
                        )
                        .reduce((acc, payment) => acc + (payment.amount ?? 0), 0) || 0);
                validateAndProceed({
                    giftCard: giftCardValidation.giftCard as GetApiGiftCardsCodeCode200,
                    residueValue,
                });
            } else if (giftCardValidation && !giftCardValidation.valid) {
                setAlertMessage(t('POS.InvalidGiftCardCode'));
            }
            setGiftCardCode('');
            setValidating(false);
        }
    }, [validating, isValidationLoading, giftCardValidation, giftCardCode]);

    const validateGiftCardApplicability = (giftCard: GetApiGiftCardsCodeCode200) => {
        setShowUseAnyWay(false);
        const applicableServiceIds = giftCard?.applicableServiceIds || [];

        const serviceItems = cartItems.filter((item: PostApiSaleBodyDataItemsItem) => item.serviceId);
        const applicableItems = serviceItems.filter((item: PostApiSaleBodyDataItemsItem) =>
            applicableServiceIds.includes(item.serviceId?.toString() || ''),
        );

        if ((serviceItems.length !== 0 || cartItems.length > 0) && applicableServiceIds.length === 0) {
            return {
                isApplicable: true,
                message: '',
                applicableItems: [],
            };
        }

        if (applicableItems.length === 0) {
            setShowUseAnyWay(true);
            return {
                isApplicable: false,
                message: t('POS.GiftCardNotApplicableToCartItems'),
                applicableItems: [],
            };
        }

        return { isApplicable: true, message: '', applicableItems };
    };

    const calculateRequiredAmount = (applicableItems: PostApiSaleBodyDataItemsItem[]) => {
        const totalAmount = applicableItems.reduce((total: number, item: PostApiSaleBodyDataItemsItem) => {
            const itemTotal = (item.price || 0) * (item.quantity || 1);
            if (predefinedAmount && predefinedAmount > 0 && total + itemTotal) {
                return predefinedAmount;
            }
            return total + itemTotal;
        }, 0);

        return totalAmount || predefinedAmount || 0;
    };

    const handleValidateGiftCard = async ({ code }: { code: string }) => {
        if (!code.trim()) {
            setAlertMessage(t('POS.EnterGiftCardCode'));
            return;
        }

        setGiftCardCode(code);
        setValidating(true);
        setAlertMessage(''); // Clear previous alert
    };

    const handleClose = () => {
        setAlertMessage(''); // Clear alert when modal closes
        onClose();
    };

    return (
        <React.Fragment>
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
                        width: '100%',
                        maxWidth: 750,
                        maxHeight: '90vh',
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
                        <CardGiftcard sx={{ fontSize: { xs: 64, md: 128 }, color: '#847A71' }} />
                        <POSHeading text={t('POS.EnterGiftCard')} sx={{ fontSize: 20, fontWeight: 600 }} />
                    </Stack>

                    {/* Gift Card Input */}
                    <Stack direction="row" spacing={2} my={3}>
                        <POSInput
                            value={giftCardInput}
                            onChange={(e) => setGiftCardInput(e.target.value)}
                            placeholder={t('POS.WriteGiftCardCodeHere')}
                            sx={{ flex: 1 }}
                            disabled={validating}
                        />
                        <POSButton
                            title={t('POS.ValidateGiftCards')}
                            variant="save"
                            onClick={() => handleValidateGiftCard({ code: giftCardInput })}
                            disabled={!giftCardInput.trim() || validating}
                            width="auto"
                        />
                    </Stack>

                    {/* Validation Alert */}
                    <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                        {alertMessage && (
                            <Alert severity="error" sx={{ mb: 3, flex: 1 }}>
                                {alertMessage}
                            </Alert>
                        )}
                        {showUseAnyWay && (
                            <POSButton
                                title={t('GiftCard.UseAnyWay')}
                                variant="save"
                                width={{ xs: '100%', md: 'fit-content' }}
                                onClick={async () => {
                                    await onConfirm(
                                        selectedGiftCard?.id || '',
                                        Math.min(selectedGiftCard?.residueValue || 0, predefinedAmount || 0) || 0,
                                    );
                                    onClose();
                                }}
                            />
                        )}
                    </Stack>

                    {/* Customer Alert */}
                    {/* {!cart.customerId && (
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            {t('POS.CustomerRequiredForGiftCards')}
                        </Alert>
                    )} */}

                    {/* Active Gift Cards Section */}
                    <Stack mb={2}>
                        <POSHeading
                            text={t('POS.ActiveGiftCardsForCustomer')}
                            sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}
                        />

                        {activeGiftCards.length === 0 ? (
                            <Stack alignItems="center" py={4}>
                                <Typography variant="body2" color="text.secondary">
                                    {t('POS.NoActiveGiftCards')}
                                </Typography>
                            </Stack>
                        ) : (
                            <GiftCardList
                                giftCards={activeGiftCards}
                                onApply={(giftCard) => {
                                    if (giftCard.residueValue <= 0) return; // Prevent applying exhausted card
                                    setSelectedGiftCard(giftCard);
                                    handleValidateGiftCard({
                                        code: giftCard?.giftCardCode || giftCard?.code,
                                    });
                                }}
                            />
                        )}
                    </Stack>
                </Paper>
            </Modal>

            {/* Amount Comparison Modal */}
            {showAmountModal && (
                <UseGiftCardConfirm
                    open={showAmountModal}
                    onClose={() => setShowAmountModal(false)}
                    onConfirm={(giftCardId: string, amount: number) => {
                        onConfirm(giftCardId, amount);
                        onClose();
                    }}
                    predefinedAmount={predefinedAmount}
                    amountComparison={amountComparison}
                    pendingGiftCard={pendingGiftCard}
                    setPendingGiftCard={setPendingGiftCard}
                    setAmountComparison={setAmountComparison}
                    setActiveGiftCards={setActiveGiftCards}
                />
            )}
        </React.Fragment>
    );
}
