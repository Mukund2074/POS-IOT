import React, { useState, useEffect, useRef } from 'react';
import POSHeading from '@/components/POS/Common/POSHeading';
import { CircularProgress, Grid2, Modal, Stack } from '@mui/material';
import { Paper } from '@mui/material';
import { IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { t } from 'i18next';
import { useCart } from '@/context/POS/CartContext';
import { useForm, FormProvider } from 'react-hook-form';
import { PostApiSaleBodyDataItemsItem } from '@/shared/api/models';
import POSButton from '@/components/POS/Common/POSButton';
import CartManager from './CartManager';
import ItemBrowser from './ItemBrowser';
import PaymentModal from './Modals/Payment/PaymentModal';
import { CartOverride, ExtendedSaleItem } from '@/types/CartContext.type';
import { usePOS } from '@/context/POS/POSContext';
import { getCartState, clearCompletedPayments } from './Modals/Payment/utils/payment-protection';

export default function CreateSales({
    open,
    onClose,
    onSaleSuccess,
}: {
    open: boolean;
    onClose: () => void;
    onSaleSuccess?: (saleId: string, customerEmail?: string, customerName?: string) => void;
}) {
    const { loading, clearCart, getAllItems, cart, addItem, addRefundItem, setPayments, setCart } = useCart() as {
        loading: boolean;
        clearCart: () => void;
        getAllItems: () => ExtendedSaleItem[];
        cart: CartOverride;
        addItem: (item: PostApiSaleBodyDataItemsItem, index?: number) => void;
        addRefundItem: (item: PostApiSaleBodyDataItemsItem, index?: number) => void;
        setPayments: (payments: any[]) => void;
        setCart: (cart: CartOverride) => void;
    };
    const { tax: taxList, giftCardSettings, punchCardSettings } = usePOS();
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [hasSavedCart, setHasSavedCart] = useState(false);
    const cartItems = getAllItems();
    const hasRestoredState = useRef(false);

    useEffect(() => {
        if (open && !(taxList.data || giftCardSettings.data || punchCardSettings.data)) {
            // Reset the flag when modal closes
            giftCardSettings.refetch();
            punchCardSettings.refetch();
            taxList.refetch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reset restoration flag when modal opens
    useEffect(() => {
        if (open) {
            hasRestoredState.current = false;
        }
    }, [open]);

    // Restore cart state when modal opens
    useEffect(() => {
        if (open && !hasRestoredState.current) {
            const savedCartState = getCartState();
            if (savedCartState) {
                const hasItems = savedCartState.items && savedCartState.items.length > 0;
                const hasRefundItems = savedCartState.refundItems && savedCartState.refundItems.length > 0;
                const hasPayments = savedCartState.payments && savedCartState.payments.length > 0;
                const hasTerminalPaymentId = savedCartState.terminalPaymentId;

                // Set hasSavedCart flag to hide ItemBrowser
                setHasSavedCart(true);

                // Only restore items if cart is empty (no existing items)
                const isCartEmpty = cartItems.length === 0;

                // Always restore customer information and payments
                if (savedCartState.customerId || savedCartState.customerName || savedCartState.customer) {
                    setCart({
                        ...cart,
                        customerId: savedCartState.customerId ? Number(savedCartState.customerId) : null,
                        customerName: savedCartState.customerName,
                        customer: savedCartState.customer,
                    });
                }

                // Restore items only if cart is empty
                if (hasItems && isCartEmpty) {
                    savedCartState.items.forEach((item, index) => {
                        addItem(item, index);
                    });
                }

                // Restore refund items only if cart is empty
                if (hasRefundItems && isCartEmpty) {
                    savedCartState.refundItems.forEach((item, index) => {
                        addRefundItem(item, index);
                    });
                }

                // Always restore payments
                if (hasPayments) {
                    setPayments(savedCartState.payments);
                }

                // Open payment modal if there are saved payments OR a pending terminal payment
                if (hasPayments || hasTerminalPaymentId) {
                    // Automatically open payment modal to resume payment flow
                    setPaymentModalOpen(true);
                }

                // Mark as restored to prevent infinite loop
                hasRestoredState.current = true;
            } else {
                // No saved cart state, show ItemBrowser
                setHasSavedCart(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleClose = () => {
        onClose();
        methods.reset();

        // Check if there's saved cart state in localStorage
        const savedCartState = getCartState();
        const hasSavedData =
            savedCartState &&
            ((savedCartState.items && savedCartState.items.length > 0) ||
                (savedCartState.refundItems && savedCartState.refundItems.length > 0) ||
                (savedCartState.payments && savedCartState.payments.length > 0));

        // Only clear cart if there's no saved data in localStorage
        if (!hasSavedData) {
            clearCart();
            clearCompletedPayments();
        }

        // Reset the restoration flag and hasSavedCart state
        hasRestoredState.current = false;
        setHasSavedCart(false);
    };

    const handleSave = () => {
        // Check if cart has items before opening payment modal
        if (cartItems && cartItems.length > 0) {
            setPaymentModalOpen(true);
        }
    };

    const handlePaymentComplete = () => {
        // Clear saved cart state when payment is completed
        clearCompletedPayments();
        // Clear the cart when sale is completed
        clearCart();
        // Reset the restoration flag and hasSavedCart state
        hasRestoredState.current = false;
        setHasSavedCart(false);
        onClose();
        methods.reset();
    };

    useEffect(() => {
        const handleMobilePaySuccess = () => setHasSavedCart(true);
        // const handleMobilePayError = () => setHasSavedCart(true);

        window.addEventListener('mobilepay-payment-success', handleMobilePaySuccess);
        // window.addEventListener('mobilepay-payment-error', handleMobilePayError);

        return () => {
            window.removeEventListener('mobilepay-payment-success', handleMobilePaySuccess);
            // window.removeEventListener('mobilepay-payment-error', handleMobilePayError);
        };
    }, []);

    // Initialize react-hook-form
    const methods = useForm<{ items: PostApiSaleBodyDataItemsItem[] }>({
        defaultValues: {
            items: [],
        },
    });

    return (
        <Modal
            open={open}
            onClose={handleClose}
            keepMounted
            disableAutoFocus
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Paper
                sx={{
                    position: 'relative',
                    width: '95%',
                    height: '95%',
                    overflow: 'hidden',
                    overflowY: 'scroll',
                    scrollbarWidth: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    p: { xs: 1, md: 4 },
                    // forcefully set z-index to 1001 to avoid overlapping with sidebar
                    zIndex: 1001,
                }}
            >
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={handleClose}>
                    <Close />
                </IconButton>
                <POSHeading text={hasSavedCart ? t('POS.PendingSale') : t('POS.CreatrSale')} />

                {loading ? (
                    <Stack sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <CircularProgress />
                    </Stack>
                ) : (
                    <FormProvider {...methods}>
                        <Grid2
                            container
                            spacing={{ xs: 2, md: 0 }}
                            sx={{
                                height: '100%',
                                border: '1px solid #d9d9d9',
                                borderRadius: 2,
                                overflow: 'hidden',
                                overflowY: 'scroll',
                                scrollbarWidth: 'none',
                            }}
                        >
                            {!hasSavedCart && <ItemBrowser />}
                            <CartManager hasSavedCart={hasSavedCart} />
                        </Grid2>

                        <Stack
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                width: '100%',
                                gap: 2,
                                mt: 2,
                            }}
                        >
                            <POSButton
                                title={t('Setting.Cancel')}
                                variant={'save'}
                                width={{ xs: '100%', md: 'fit-content' }}
                                sx={{ backgroundColor: '#d9d9d9' }}
                                onClick={handleClose}
                            />
                            <POSButton
                                title={cart.salesType === 'RETURN' ? t('POS.CreditSale') : t('Common.Save')}
                                variant={'save'}
                                width={{ xs: '100%', md: 'fit-content' }}
                                onClick={handleSave}
                                disabled={!cartItems || cartItems.length === 0}
                            />
                        </Stack>
                    </FormProvider>
                )}

                {/* Payment Modal */}
                {paymentModalOpen && (
                    <PaymentModal
                        open={paymentModalOpen}
                        onClose={() => setPaymentModalOpen(false)}
                        onComplete={handlePaymentComplete}
                        onSaleSuccess={onSaleSuccess}
                    />
                )}
            </Paper>
        </Modal>
    );
}
