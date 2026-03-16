import POSHeading from '@/components/POS/Common/POSHeading';
import POSInput from '@/components/POS/Common/POSInput';
import { formatCurrency, formatPrice } from '@/scenes/POS/Core/pos.utils';
import { Close, Refresh } from '@mui/icons-material';
import { Alert, CircularProgress, Divider, Grid2, IconButton, Stack } from '@mui/material';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { PaymentMethod, orderSummaryType, overridePayment } from '../../Types/sales.types';
import POSButton from '@/components/POS/Common/POSButton';
import { PaymentTabProps } from '../Create/Modals/Payment/Types/sales-payment.types';
import { canRemovePayment } from '../Create/Modals/Payment/utils/payment-protection';

export default function PaymentTab({
    asCreditSale,
    onClose,
    cartOption,
    paymentAmount,
    setPaymentAmount,
    paymentMethods,
    handlePaymentMethodClick,
    localPayments,
    handleRemovePayment,
    totalAmount,
    paidAmount,
    remainingAmount,
    changeAmount,
    handleComplete,
    getPaymentMethodIcon,
    getPaymentMethodName,
    isAnyPending,
    timedOutPayments = new Set(),
    handleRefreshPaymentStatus,
    calculateTotalDiscount,
    asEditSale = false,
    isCardTerminalProcessing = false,
}: PaymentTabProps) {
    const [orderSummary, setOrderSummary] = useState<orderSummaryType>({
        total: 0,
        paidAmount: 0,
        discount: 0,
        tax: 0,
        netTotal: 0,
    });

    useEffect(() => {
        setOrderSummary({
            total: cartOption.subTotal,
            paidAmount: cartOption.paidAmount || 0,
            discount: calculateTotalDiscount(),
            tax: cartOption.totalTax,
            netTotal: cartOption.netTotal,
        });
    }, [cartOption, calculateTotalDiscount]);

    const fields = [
        { id: 1, label: t('Common.Total'), value: formatCurrency(orderSummary.total) },

        { id: 3, label: t('POS.TotalDiscount'), value: `- ${formatCurrency(orderSummary.discount)}` },
        { id: 4, label: `${t('POS.TotalTax')} (${t('POS.Inclusive')})`, value: formatCurrency(orderSummary.tax) },
        { id: 5, label: t('POS.NetTotal'), value: formatCurrency(orderSummary.netTotal) },
    ];

    if (asEditSale) {
        fields.push({ id: 2, label: t('POS.AlreadyPaid'), value: formatCurrency(orderSummary.paidAmount) });
    }

    const buttonText = () => {
        if (cartOption.salesType === 'RETURN') {
            return t('POS.CreditSale');
        }
        return t('POS.CompletePayment');
    };

    const renderChip = (payment: overridePayment) => {
        const chips: React.ReactNode[] = [];

        // KEEP SUCCESSED UNTIL WE GET CONFIRMATION ABOUT NEW MOBILE PAY FLOW
        // // Mobile Pay status chip
        // if (payment.paymentType === 'MOBILE_PAY') {
        //     let label = '';
        //     let color = 'default';

        //     switch (payment.txStatus) {
        //         case 'PENDING':
        //             label = t('Common.Pending');
        //             color = 'warning';
        //             break;
        //         case 'SUCCEEDED':
        //             color = 'success';
        //             label = t('POS.Success');
        //             break;
        //         case 'FAILED':
        //             color = 'error';
        //             label = t('POS.Failed');
        //             break;
        //     }

        //     chips.push(
        //         <Chip
        //             key="mobile-pay-status"
        //             label={label}
        //             variant="outlined"
        //             color={color as 'success' | 'error' | 'default' | 'primary' | 'secondary' | 'info' | 'warning'}
        //             sx={{ mr: 1 }}
        //         />,
        //     );
        // }

        return chips.length > 0 ? <>{chips}</> : null;
    };

    const renderPaymentAction = (payment: overridePayment, index: number) => {
        if (payment.paymentType !== 'MOBILE_PAY') return null;

        const isTimedOut = payment.reference && timedOutPayments.has(payment.reference);

        if (payment.txStatus === 'PENDING' && !isTimedOut) {
            return <CircularProgress size={20} color="inherit" />;
        }

        if (
            isTimedOut &&
            handleRefreshPaymentStatus &&
            payment.txStatus !== 'SUCCEEDED' &&
            payment.txStatus !== 'FAILED'
        ) {
            return (
                <IconButton
                    size="small"
                    onClick={async () => await handleRefreshPaymentStatus(payment.reference!, index)}
                    sx={{ color: '#1976d2' }}
                    title={t('POS.RefreshPaymentStatus')}
                >
                    <Refresh fontSize="small" />
                </IconButton>
            );
        }

        return null;
    };
    return (
        <React.Fragment>
            {/* Header */}
            <Stack direction="row" justifyContent="center" alignItems="center" mb={2}>
                <POSHeading
                    text={asCreditSale ? t('POS.CreditSaleDesc') : t('POS.PaymentMethod')}
                    sx={{ fontSize: 18, fontWeight: 600 }}
                />
            </Stack>

            {/* Customer Warning */}
            {!cartOption.customerId && !asCreditSale && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    {t('POS.NoCustomerLinked')}
                </Alert>
            )}

            {/* Instructions */}
            {!asCreditSale && (
                <POSHeading text={t('POS.ChoosePaymentMethod')} sx={{ fontSize: 14, mb: 2, textAlign: 'center' }} />
            )}

            {/* Payment Amount Input */}
            <Stack alignItems="center" mb={3}>
                <POSInput
                    value={paymentAmount}
                    onChange={(e) => {
                        let value = formatPrice(e.target.value);

                        if (cartOption.salesType === 'RETURN') {
                            value = value.replace(/[^0-9.-]/g, '');

                            if ((value.match(/-/g) || []).length > 1 || (value.includes('-') && value[0] !== '-')) {
                                return;
                            }
                        } else if (asCreditSale) {
                            if (Number(value) > totalAmount) {
                                value = (totalAmount - paidAmount).toString();
                            }
                        } else {
                            value = value.replace(/[^0-9.]/g, '');
                        }

                        setPaymentAmount(value);
                    }}
                    sx={{
                        '& .MuiInputBase-input': {
                            fontSize: 48,
                            fontWeight: 300,
                            color: '#666',
                            textAlign: 'center',
                            border: 'none',
                            padding: '8px',
                        },
                        '& .MuiOutlinedInput-root': {
                            border: '2px dashed #ccc',
                            borderRadius: 2,
                            '&:hover': {
                                borderColor: '#999',
                            },
                            '&.Mui-focused': {
                                borderColor: '#666',
                            },
                        },
                        minWidth: 200,
                    }}
                    disabled={asCreditSale && paidAmount >= totalAmount}
                    placeholder={t('POS.EnterAmount')}
                />
            </Stack>

            {/* Payment Methods Grid */}
            <Grid2 container spacing={0.5}>
                {paymentMethods?.map((method: PaymentMethod) => (
                    <Grid2 key={method.id} size={6}>
                        <Stack
                            onClick={() => {
                                // Disable card terminal button when processing
                                if (method.type === 'CARD_TERMINAL' && isCardTerminalProcessing) {
                                    return;
                                }
                                handlePaymentMethodClick(method);
                            }}
                            sx={{
                                width: '100%',
                                height: 50,
                                border: '2px solid #e0e0e0',
                                borderRadius: 2,
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                                cursor:
                                    !paymentAmount ||
                                    (Number(paymentAmount) <= 0 && cartOption.salesType !== 'RETURN') ||
                                    (method.type === 'CARD_TERMINAL' && isCardTerminalProcessing)
                                        ? 'not-allowed'
                                        : 'pointer',

                                opacity:
                                    !paymentAmount ||
                                    (Number(paymentAmount) <= 0 && cartOption.salesType !== 'RETURN') ||
                                    (method.type === 'CARD_TERMINAL' && isCardTerminalProcessing)
                                        ? 0.5
                                        : 1,
                                backgroundColor: 'transparent',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor:
                                        !paymentAmount ||
                                        (Number(paymentAmount) <= 0 && cartOption.salesType !== 'RETURN') ||
                                        (method.type === 'CARD_TERMINAL' && isCardTerminalProcessing)
                                            ? 'transparent'
                                            : '#f5f5f5',
                                    borderColor:
                                        !paymentAmount ||
                                        (Number(paymentAmount) <= 0 && cartOption.salesType !== 'RETURN') ||
                                        (method.type === 'CARD_TERMINAL' && isCardTerminalProcessing)
                                            ? '#e0e0e0'
                                            : '#c0c0c0',
                                    transform:
                                        !paymentAmount ||
                                        (Number(paymentAmount) <= 0 && cartOption.salesType !== 'RETURN') ||
                                        (method.type === 'CARD_TERMINAL' && isCardTerminalProcessing)
                                            ? 'none'
                                            : 'translateY(-1px)',
                                },
                                '&:active': {
                                    transform:
                                        !paymentAmount ||
                                        (Number(paymentAmount) <= 0 && cartOption.salesType !== 'RETURN') ||
                                        (method.type === 'CARD_TERMINAL' && isCardTerminalProcessing)
                                            ? 'none'
                                            : 'translateY(0px)',
                                },
                            }}
                        >
                            <Stack
                                sx={{
                                    fontSize: 24,
                                    color:
                                        !paymentAmount ||
                                        (Number(paymentAmount) <= 0 && cartOption.salesType !== 'RETURN') ||
                                        (method.type === 'CARD_TERMINAL' && isCardTerminalProcessing)
                                            ? '#bbb'
                                            : '#666',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {method.type === 'CARD_TERMINAL' && isCardTerminalProcessing ? (
                                    <CircularProgress size={20} />
                                ) : (
                                    method.icon
                                )}
                            </Stack>
                            <POSHeading
                                text={method.name}
                                sx={{
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color:
                                        !paymentAmount ||
                                        (Number(paymentAmount) <= 0 && cartOption.salesType !== 'RETURN') ||
                                        (method.type === 'CARD_TERMINAL' && isCardTerminalProcessing)
                                            ? '#bbb'
                                            : '#333',
                                }}
                            />
                        </Stack>
                    </Grid2>
                ))}
            </Grid2>

            {/* Payment Entries */}
            {localPayments.length > 0 && (
                <Stack spacing={1} my={1}>
                    <POSHeading
                        text={`${t('POS.PaymentEntries')} (${localPayments.length})`}
                        sx={{ fontSize: 14, fontWeight: 600 }}
                    />
                    {localPayments.map((payment, index) => (
                        <Stack
                            key={`payment-${index}`}
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{
                                p: 1,
                                bgcolor: '#f5f5f5',
                                borderRadius: 1,
                                border: '1px solid #e0e0e0',
                            }}
                        >
                            <Stack sx={{ color: '#666', display: 'flex', flexDirection: 'row', gap: 1 }}>
                                {(() => {
                                    // Check if it's a card terminal payment (converted from CARD_TERMINAL to CARD with terminal info)
                                    if (payment.paymentType === 'CARD' && payment?.paymentId) {
                                        return getPaymentMethodIcon('CARD_TERMINAL');
                                    }
                                    return getPaymentMethodIcon(payment.paymentType || 'CASH');
                                })()}
                                <POSHeading
                                    text={(() => {
                                        // Check if it's a card terminal payment (converted from CARD_TERMINAL to CARD with terminal info)
                                        if (payment.paymentType === 'CARD' && payment?.paymentId) {
                                            return t('POS.CardTerminal');
                                        }
                                        return getPaymentMethodName(payment.paymentType || 'CASH');
                                    })()}
                                    sx={{ fontSize: 14, fontWeight: 500 }}
                                />
                            </Stack>
                            <Stack
                                sx={{
                                    ml: 'auto',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    gap: 1,
                                    alignItems: 'center',
                                }}
                            >
                                <POSHeading
                                    text={formatCurrency(payment.amount || 0)}
                                    sx={{ fontSize: 14, fontWeight: 600 }}
                                />
                                {renderChip(payment)}

                                {renderPaymentAction(payment, index)}
                                {(() => {
                                    const removalCheck = canRemovePayment(payment);
                                    return (
                                        removalCheck.canRemove && (
                                            <IconButton
                                                size="small"
                                                onClick={() => handleRemovePayment(index)}
                                                sx={{ color: '#f44336' }}
                                            >
                                                <Close fontSize="small" />
                                            </IconButton>
                                        )
                                    );
                                })()}
                            </Stack>
                        </Stack>
                    ))}
                </Stack>
            )}

            <Divider sx={{ mb: 2 }} />

            {/* Summary */}
            <Stack spacing={1} mb={3}>
                {fields?.map((field) => (
                    <Stack direction="row" justifyContent="space-between" key={field.id}>
                        <POSHeading text={field.label} sx={{ fontSize: 16 }} />
                        <POSHeading text={field.value} sx={{ fontSize: 16, fontWeight: 600 }} />
                    </Stack>
                ))}
                <Stack direction="row" justifyContent="space-between">
                    <POSHeading
                        text={`${t('POS.Paid')} (${localPayments.length} ${t('POS.Payments')})`}
                        sx={{ fontSize: 16 }}
                    />
                    <POSHeading text={formatCurrency(paidAmount || 0)} sx={{ fontSize: 16, fontWeight: 600 }} />
                </Stack>
                {asCreditSale && (
                    <Stack direction="row" justifyContent="space-between">
                        <POSHeading text={t('POS.AlreadyPaid')} sx={{ fontSize: 16 }} />
                        <POSHeading
                            text={formatCurrency(
                                cartOption.netTotal - (cartOption?.paidAmount || cartOption?.remainingCredit || 0) || 0,
                            )}
                            sx={{ fontSize: 16, fontWeight: 600, color: '#4caf50' }}
                        />
                    </Stack>
                )}
                {remainingAmount > 0 && (
                    <Stack direction="row" justifyContent="space-between">
                        <POSHeading text={t('POS.Remaining')} sx={{ fontSize: 16 }} />
                        <POSHeading
                            text={formatCurrency(remainingAmount || 0)}
                            sx={{ fontSize: 16, fontWeight: 600, color: '#f44336' }}
                        />
                    </Stack>
                )}
                {changeAmount > 0 && (
                    <Stack direction="row" justifyContent="space-between">
                        <POSHeading text={t('POS.Change')} sx={{ fontSize: 16, color: '#4caf50' }} />
                        <POSHeading
                            text={formatCurrency(changeAmount || 0)}
                            sx={{ fontSize: 16, fontWeight: 600, color: '#4caf50' }}
                        />
                    </Stack>
                )}
            </Stack>

            {/* Action Buttons */}
            <Stack
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <POSButton
                    disabled={isAnyPending}
                    sx={{ cursor: isAnyPending ? 'not-allowed' : 'pointer' }}
                    title={t('Setting.Cancel')}
                    variant="f_outline"
                    onClick={!isAnyPending ? onClose : undefined}
                    width={{ xs: '100%', md: 'auto' }}
                />
                <POSButton
                    title={`${buttonText()} ${localPayments.length > 0 ? `(${localPayments.length})` : ''}`}
                    variant="save"
                    onClick={!isAnyPending ? handleComplete : undefined}
                    disabled={
                        (paidAmount < totalAmount && !asCreditSale && !asEditSale) ||
                        (asCreditSale && localPayments?.length === 0) ||
                        isAnyPending
                    }
                    width={{ xs: '100%', md: 'auto' }}
                    sx={{ cursor: isAnyPending ? 'not-allowed' : 'pointer' }}
                />
            </Stack>
        </React.Fragment>
    );
}
