import React, { useEffect, useState } from 'react';
import { Modal, Paper, Stack, Alert, IconButton } from '@mui/material';
import { t } from 'i18next';
import { toast } from 'react-toastify';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSButton from '@/components/POS/Common/POSButton';
import SimpleSuccessAnimation from '@/components/POS/Common/SimpleSuccessAnimation';
import { useCart } from '@/context/POS/CartContext';
import { PostApiSaleBody, PostApiSaleBodyDataPaymentItem, PutApiEditSalesIdBodyData } from '@/shared/api/models';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { useSelector } from 'react-redux';
import { api } from '@/utils/Api/POS';
import { Close } from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import { CartOverride } from '@/types/CartContext.type';
import { orderSummaryType } from '../../../../Types/sales.types';
import { salesApi } from '../../../../Core/sales.api';

interface PaymentSummaryModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    onReset: () => void;
    totalAmount: number;
    paidAmount: number;
    changeAmount: number;
    payments: PostApiSaleBodyDataPaymentItem[];
    asEditSale?: boolean;
    onSaleSuccess?: (saleId: string, customerEmail?: string, customerName?: string) => void;
    hasProtectedPayments?: boolean;
    shouldDirectPay?: boolean;
}

export default function PaymentSummary({
    open,
    onClose,
    onConfirm,
    onReset,
    totalAmount,
    paidAmount,
    changeAmount,
    payments,
    asEditSale,
    onSaleSuccess,
    hasProtectedPayments = false,
    shouldDirectPay = false,
}: PaymentSummaryModalProps) {
    const { cart, getCartForSubmission, clearCart, calculateTotalDiscount } = useCart() as {
        cart: CartOverride;
        getCartForSubmission: () => CartOverride;
        clearCart: () => void;
        calculateTotalDiscount: () => number;
        paymentBreakdown: {
            cashAmount: number;
            cardAmount: number;
            mobilePayAmount: number;
            bankTransferAmount: number;
            creditAmount: number;
            otherAmount: number;
            outstandingAmount: number;
            paidOutstandingAmount: number;
            giftCardAmount: number;
            bonusAmount: number;
        };
    };

    const setting = useSelector((state: any) => state.settings.data);
    const autoMail = setting?.posSetting?.value?.sendEmailReceipt;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const queryClient = useQueryClient();
    const [orderSummary, setOrderSummary] = useState<orderSummaryType>({
        total: 0,
        paidAmount: 0,
        discount: 0,
        tax: 0,
        netTotal: 0,
    });

    useEffect(() => {
        setOrderSummary({
            total: cart.subTotal,
            paidAmount: cart.paidAmount || 0,
            discount: calculateTotalDiscount(),
            tax: cart.totalTax,
            netTotal: cart.netTotal,
        });
    }, [cart, calculateTotalDiscount]);

    const fields = [
        { id: 1, label: t('Common.Total'), value: formatCurrency(orderSummary.total) },
        // { id: 2, label: t('POS.AlreadyPaid'), value: formatCurrency(orderSummary.paidAmount) },
        { id: 3, label: t('POS.TotalDiscount'), value: `- ${formatCurrency(orderSummary.discount)}` },
        { id: 4, label: `${t('POS.TotalTax')} (${t('POS.Inclusive')})`, value: formatCurrency(orderSummary.tax) },
        { id: 5, label: t('POS.NetTotal'), value: formatCurrency(orderSummary.netTotal) },
    ];

    if (asEditSale) {
        fields.push({ id: 2, label: t('POS.AlreadyPaid'), value: formatCurrency(cart.paidAmount) });
    }

    // const { mutate: createSale, isPending } = useCreateSale();

    const createSale = async (data: PostApiSaleBody) => {
        try {
            const response = await api.postApiSale(data);
            if (response) {
                const myCart = cart as CartOverride;

                if (
                    autoMail &&
                    myCart?.customerId &&
                    myCart?.customer?.email !== '' &&
                    myCart?.customer?.email &&
                    response?.data?.id
                ) {
                    const body = {
                        email: myCart?.customer?.email,
                        salesId: response?.data?.id,
                    };
                    salesApi.sendEmailReceiptOnSaleCreated({ body });
                    if (asEditSale) {
                        showToast(t('POS.AmountPaidSuccessWithEmail'), 'success');
                    } else {
                        showToast(t('POS.SaleCreatedSuccessfullyWithEmail'), 'success');
                    }
                } else {
                    if (asEditSale) {
                        showToast(t('POS.AmountPaidSuccess'), 'success');
                    } else {
                        showToast(t('POS.SaleCreatedSuccessfully'), 'success');
                    }
                }

                // Set success state
                setShowSuccessAlert(true);

                // Clear cart and close modal after delay
                const timeout = setTimeout(() => {
                    clearCart();
                    onConfirm();
                    setIsSubmitting(false);
                    setShowSuccessAlert(false);
                    queryClient.invalidateQueries({ queryKey: ['sales', 'list'] });
                    queryClient.invalidateQueries({ queryKey: ['products', 'services'] });
                    queryClient.invalidateQueries({ queryKey: ['getCashDrawer', cart.sellBy] });

                    // Call onSaleSuccess callback if provided
                    // Show modal if auto-mail is off OR if auto-mail is on but customer has no email or no customer selected
                    if (
                        onSaleSuccess &&
                        response?.data?.id &&
                        (!autoMail || !myCart?.customer?.email || !myCart?.customerId)
                    ) {
                        onSaleSuccess(
                            response.data.id.toString(),
                            myCart?.customer?.email || undefined,
                            myCart?.customer?.name || undefined,
                        );
                    }
                }, 2000);

                return () => clearTimeout(timeout);
            }
            return response;
        } catch (error: any) {
            if (asEditSale) {
                setErrorMessage(t('POS.FailedToPayAmount'));
                toast.error(t('POS.FailedToPayAmount'));
            } else {
                setErrorMessage(t('POS.FailedToCreateSale'));
                toast.error(t('POS.FailedToCreateSale'));
            }
            setShowErrorAlert(true);

            // Show error toast

            setIsSubmitting(false);
            return error;
        }
    };

    const updateSale = async (payload: CartOverride) => {
        if (payload?.saleId) {
            try {
                const response = await api.putApiEditSalesId(payload?.saleId, {
                    data: payload as PutApiEditSalesIdBodyData,
                });
                if (response) {
                    const myCart = cart as CartOverride;

                    if (
                        autoMail &&
                        myCart?.customerId &&
                        myCart?.customer?.email !== '' &&
                        myCart?.customer?.email &&
                        response?.data?.id
                    ) {
                        const body = {
                            email: myCart?.customer?.email,
                            salesId: response?.data?.id,
                        };
                        salesApi.sendEmailReceiptOnSaleCreated({ body });
                        showToast(t('POS.SaleCreatedSuccessfullyWithEmail'), 'success');
                    } else {
                        showToast(t('POS.SaleCreatedSuccessfully'), 'success');
                    }

                    // Set success state
                    setShowSuccessAlert(true);

                    // Clear cart and close modal after delay
                    const timeout = setTimeout(() => {
                        clearCart();
                        onConfirm();
                        setIsSubmitting(false);
                        setShowSuccessAlert(false);
                        queryClient.invalidateQueries({ queryKey: ['sales', 'list'] });
                        queryClient.invalidateQueries({ queryKey: ['sales-details', payload?.saleId] });
                        queryClient.invalidateQueries({ queryKey: ['products', 'services'] });
                        queryClient.invalidateQueries({ queryKey: ['getCashDrawer', cart.sellBy] });

                        // Call onSaleSuccess callback if provided
                        // Show modal if auto-mail is off OR if auto-mail is on but customer has no email or no customer selected
                        if (
                            onSaleSuccess &&
                            response?.data?.id &&
                            (!autoMail || !myCart?.customer?.email || !myCart?.customerId)
                        ) {
                            onSaleSuccess(
                                response.data.id.toString(),
                                myCart?.customer?.email || undefined,
                                myCart?.customer?.name || undefined,
                            );
                        }
                    }, 2000);

                    return () => clearTimeout(timeout);
                }
            } catch (error: any) {
                // Parse error message
                let errorMsg = t('POS.FailedToCreateSale');
                setErrorMessage(errorMsg);
                setShowErrorAlert(true);

                // Show error toast
                toast.error(errorMsg);

                setIsSubmitting(false);
            }
        }
    };

    // Helper function to get payment methods used from payments prop
    const getPaymentMethods = () => {
        if (!payments || payments.length === 0) return [];
        // Group and sum by paymentType
        const summary: Record<string, { type: string; amount: number; key: string }> = {};
        payments.forEach((p) => {
            const type = p.paymentType || 'OTHER';
            if (!summary[type]) {
                summary[type] = {
                    type,
                    amount: 0,
                    key: type.toLowerCase(),
                };
            }
            summary[type].amount += p.amount || 0;
        });
        // Optionally, map type to display name
        const typeMap: Record<string, string> = {
            CASH: t('POS.Cash'),
            CARD: t('POS.Cards'),
            MOBILE_PAY: t('POS.MobilePay'),
            BANK_TRANSFER: t('POS.BankTransfer'),
            GIFT_CARD: t('POS.GiftCard'),
            OUTSTANDING: t('POS.Outstanding'),
            ECOMMERCE: t('POS.Ecommerce'),
            CUT_CARD: t('POS.CutCard'),
        };
        return Object.values(summary).map((item) => ({
            ...item,
            type: typeMap[item.type] || item.type,
        }));
    };

    // Get the primary payment method for change (usually cash, or the largest payment)
    const getPrimaryPaymentMethodForChange = () => {
        const methods = getPaymentMethods();
        if (methods.length === 0) return 'Cash';

        // Prefer cash for change if it was used
        const cashMethod = methods.find((m) => m.key === 'cash');
        if (cashMethod) return t('POS.Cash');

        // Otherwise, use the largest payment method
        const largestMethod = methods.reduce((prev, current) => (prev.amount > current.amount ? prev : current));
        return largestMethod.type;
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        toast[type](message, {
            position: 'top-right',
            autoClose: 5000,
        });
    };

    const handleConfirmPayment = async () => {
        try {
            setIsSubmitting(true);
            setShowErrorAlert(false);

            if (!cart.items || cart.items.length === 0) {
                setErrorMessage(t('POS.NoItemsInCart'));
                setShowErrorAlert(true);
                toast.error(t('POS.NoItemsInCart'), {
                    position: 'top-right',
                    autoClose: 3000,
                });
                return;
            }
            const data = getCartForSubmission();

            if (data?.saleId) {
                updateSale(data);
            } else {
                const payload: PostApiSaleBody = { data };
                createSale(payload);
            }
        } catch (error: any) {
            setIsSubmitting(false);
            const errorMsg = error?.message || t('POS.UnexpectedError');
            setErrorMessage(errorMsg);
            setShowErrorAlert(true);

            toast.error(errorMsg, {
                position: 'top-right',
                autoClose: 5000,
            });
        }
    };

    const handleReset = () => {
        setShowErrorAlert(false);
        setShowSuccessAlert(false);
        setErrorMessage('');
        onReset();
    };

    const isLoading = isSubmitting;

    useEffect(() => {
        if (shouldDirectPay) {
            handleConfirmPayment();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Modal
            open={open}
            onClose={!isLoading ? onClose : undefined} // Prevent closing while loading
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                zIndex: 1400,
            }}
        >
            <Paper
                sx={{
                    width: '100%',
                    maxWidth: 500,
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    position: 'relative',
                    opacity: 1,
                }}
            >
                <IconButton sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <Close onClick={onClose} />
                </IconButton>
                {/* Success Alert */}
                {showSuccessAlert && (
                    <Alert
                        severity="success"
                        sx={{
                            mb: 2,
                            '& .MuiAlert-message': {
                                fontWeight: 600,
                            },
                        }}
                    >
                        {t('POS.SaleCreatedSuccessfully')}
                    </Alert>
                )}

                {/* Error Alert */}
                {showErrorAlert && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 2,
                            '& .MuiAlert-message': {
                                fontWeight: 600,
                            },
                        }}
                        onClose={() => setShowErrorAlert(false)}
                    >
                        {errorMessage}
                    </Alert>
                )}

                {/* Status Icon */}
                <Stack alignItems="center" mb={3}>
                    {showSuccessAlert ? (
                        <SimpleSuccessAnimation size={80} color="#4caf50" />
                    ) : (
                        <Stack
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                backgroundColor: changeAmount > 0 ? '#fff3e0' : '#e8f5e8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2,
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <Stack sx={{ fontSize: 40, color: '#ff9800' }}>⚠️</Stack>
                        </Stack>
                    )}

                    <POSHeading
                        text={
                            showSuccessAlert
                                ? t('POS.SaleCreatedSuccessfully')
                                : changeAmount > 0
                                  ? t('POS.SaleIncludesChange')
                                  : t('POS.SalesSummary')
                        }
                        sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}
                    />
                </Stack>

                {/* Payment Summary */}
                <Stack spacing={1} mb={3} sx={{ textAlign: 'left' }}>
                    <Stack direction="row" justifyContent="space-between">
                        <POSHeading text={`- ${t('POS.TotalAmount')}:`} sx={{ fontSize: 14 }} />
                        <POSHeading text={formatCurrency(totalAmount || 0)} sx={{ fontSize: 14, fontWeight: 600 }} />
                    </Stack>

                    {/* Show each payment method used */}
                    {getPaymentMethods().map((method, index) => (
                        <Stack key={method.key} direction="row" justifyContent="space-between">
                            <POSHeading text={`- ${method.type}:`} sx={{ fontSize: 14, pl: 1 }} />
                            <POSHeading
                                text={formatCurrency(method.amount || 0)}
                                sx={{ fontSize: 14, fontWeight: 600 }}
                            />
                        </Stack>
                    ))}

                    {/* Total paid amount */}
                    {/* <Stack direction="row" justifyContent="space-between" sx={{ borderTop: '1px solid #eee', pt: 1 }}>
                        <POSHeading text={`- ${t('POS.TotalPaid')}:`} sx={{ fontSize: 14, fontWeight: 600 }} />
                        <POSHeading text={formatCurrency(paidAmount || 0)} sx={{ fontSize: 14, fontWeight: 600 }} />
                    </Stack> */}

                    {fields.map((field, index) => (
                        <Stack
                            key={field.id}
                            direction="row"
                            justifyContent="space-between"
                            sx={{ borderTop: index === 0 ? '1px solid #eee' : 'none', pt: index === 0 ? 1 : 0 }}
                        >
                            <POSHeading text={`- ${field.label}:`} sx={{ fontSize: 14, pl: 1 }} />
                            <POSHeading text={field.value} sx={{ fontSize: 14, fontWeight: 600 }} />
                        </Stack>
                    ))}

                    {changeAmount > 0 && (
                        <Stack direction="row" justifyContent="space-between">
                            <POSHeading text={`- ${t('POS.CustomerReceives')}:`} sx={{ fontSize: 14 }} />
                            <POSHeading
                                text={`${formatCurrency(changeAmount || 0)} in ${getPrimaryPaymentMethodForChange()}`}
                                sx={{ fontSize: 14, fontWeight: 600, color: '#4caf50' }}
                            />
                        </Stack>
                    )}
                </Stack>

                <POSHeading
                    text={showSuccessAlert ? t('POS.SaleProcessedSuccessfully') : t('POS.PaymentConfirmationText')}
                    sx={{ fontSize: 14, mb: 3, color: '#666' }}
                />

                {/* Action Buttons */}
                <Stack
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <POSButton
                        title={t('POS.ResetPaymentMethod')}
                        variant="f_outline"
                        onClick={handleReset}
                        width={{ xs: '100%', md: 'auto' }}
                        disabled={isLoading || hasProtectedPayments}
                    />
                    <POSButton
                        title={
                            isLoading
                                ? t('POS.Processing')
                                : showSuccessAlert
                                  ? t('POS.Complete')
                                  : t('POS.ConfirmPayment')
                        }
                        variant="save"
                        onClick={handleConfirmPayment}
                        width={{ xs: '100%', md: 'auto' }}
                        disabled={isLoading}
                    />
                </Stack>
            </Paper>
        </Modal>
    );
}
