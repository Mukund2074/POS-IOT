import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal, Paper, Stack, IconButton, Divider } from '@mui/material';
import { Close } from '@mui/icons-material';
import { t } from 'i18next';
import { useSelector, useDispatch } from 'react-redux';
import {
    setShowSummary,
    setShowGiftCardModal,
    setShowMobilePayModal,
    setShowPunchCardModal,
    setShowBonusConfirmationModal,
    setShouldDirectPay,
    setSelectedTab,
    setActiveGiftCards,
    setMobilepayReference,
    setPendingBonusPayment,
} from '@/redux/slices/Sales/payment';
import {
    selectShowSummary,
    selectShowGiftCardModal,
    selectShowMobilePayModal,
    selectShowPunchCardModal,
    selectShowBonusConfirmationModal,
    selectShouldDirectPay,
    selectSelectedTab,
    selectActiveGiftCards,
    selectMobilepayReference,
    selectPendingBonusPayment,
} from '@/redux/slices/Sales/payment';
import POSHeading from '@/components/POS/Common/POSHeading';
import { useCart } from '@/context/POS/CartContext';
import {
    GetApiCustomers200CustomersItemGiftCardsItem,
    PostApiSaleBodyDataPaymentItemPaymentType,
    PostApiSaleBodyDataPaymentItemTxStatus,
} from '@/shared/api/models';
// @ts-ignore
import { useSocket } from '@/context/SocketContext';

import { toast } from 'react-toastify';
import ApplyGiftCard from '../GiftCard/ApplyGiftCard';
import { overridePayment, PaymentMethod } from '../../../../Types/sales.types';
import PaymentTab from '../../../Shared/PaymentTab';
import RefundItemsTab from '../../../Shared/RefundItemsTab';
import { api } from '@/utils/Api/POS';
import { SalesPaymentProps } from './Types/sales-payment.types';
import { CartOverride, ExtendedSaleItem } from '@/types/CartContext.type';
import PunchCardPayModal from '../PunchCard/PunchCardPayModal';
import MobilePayModal from '../MobilePay/MobilePayModal';
import PaymentSummary from './PaymentSummaryModal';
import BonusConfirmationModal from './BonusConfirmationModal';
import CardTerminalLoadingModal from './CardTerminalLoadingModal';
import { Settings } from '@/scenes/POS/UI/Pos-settings/Types/pos-settings.types';
import { checkTerminalPaymentStatus, processCardPayment, validateTerminalConfig } from './utils/payment-functions';
import {
    canRemovePayment,
    markPaymentAsCompleted,
    clearCompletedPayments,
    clearCartState,
    saveCartState,
    getCartState,
    shouldClearCart,
} from './utils/payment-protection';
import { createPaymentObject, getPaymentMethodName as getPaymentMethodNameHelper } from './utils/payment-helpers';
import { getPaymentMethodIcon as getPaymentMethodIconHelper } from './utils/payment-icons';
import { getPaymentMethods } from './utils/payment-methods';

export default function PaymentModal({
    open,
    onClose,
    onComplete,
    asCreditSale = false,
    creditSale,
    asEditSale = false,
    onSaleSuccess,
}: SalesPaymentProps & { onSaleSuccess?: (saleId: string, customerEmail?: string, customerName?: string) => void }) {
    const storeSettings = useSelector((state: any) => state?.settings?.data);

    const {
        cart,
        addPayment,
        removePayment,
        clearPayments,
        setPayments: setCartPayments,
        calculateTotalDiscount,
        refundItems,
    } = useCart() as {
        cart: CartOverride;
        addPayment: (payment: Omit<overridePayment, 'paymentId'>) => void;
        removePayment: (index: number) => void;
        clearPayments: () => void;
        setPayments: (payments: overridePayment[]) => void;
        calculateTotalDiscount(): number;
        refundItems: ExtendedSaleItem[];
    };

    const cartOption = creditSale?.cart || cart;
    const addPaymentFn = creditSale?.addPayment || addPayment;
    const removePaymentFn = creditSale?.removePayment || removePayment;
    const clearPaymentsFn = creditSale?.clearPayments || clearPayments;
    const setPaymentsFn = creditSale?.setPayments || setCartPayments;

    const { socket2IsOn, isConnected } = useSocket();

    const [localPayments, setLocalPayments] = useState<overridePayment[]>(() => {
        if (asEditSale) {
            return cartOption?.payment || [];
        } else {
            return [];
        }
    });
    // const [failedPayments, setFailedPayments] = useState<overridePayment[]>([]);
    const dispatch = useDispatch();

    // Redux modal states
    const showSummary = useSelector(selectShowSummary);
    const showGiftCardModal = useSelector(selectShowGiftCardModal);
    const showMobilePayModal = useSelector(selectShowMobilePayModal);
    const showPunchCardModal = useSelector(selectShowPunchCardModal);
    const showBonusConfirmationModal = useSelector(selectShowBonusConfirmationModal);

    const [paymentAmount, setPaymentAmount] = useState<string>('');
    const [isCardTerminalProcessing, setIsCardTerminalProcessing] = useState(false);
    const [cardTerminalLoadingModal, setCardTerminalLoadingModal] = useState<{
        open: boolean;
        status: 'processing' | 'success' | 'error';
        message?: string;
    }>({
        open: false,
        status: 'processing',
    });

    // Timeout tracking for socket payments (local state)
    const [paymentTimeouts, setPaymentTimeouts] = useState<Map<string, NodeJS.Timeout>>(new Map());
    const [timedOutPayments, setTimedOutPayments] = useState<Set<string>>(new Set());

    // Redux states
    const shouldDirectPay = useSelector(selectShouldDirectPay);
    const selectedTab = useSelector(selectSelectedTab);
    const activeGiftCards = useSelector(selectActiveGiftCards);
    const mobilepayRefrence = useSelector(selectMobilepayReference);
    const pendingBonusPayment = useSelector(selectPendingBonusPayment);

    const salesType = cartOption.salesType || 'SALES';
    const totalAmount = asCreditSale ? cartOption.remainingCredit || 0 : cartOption.netTotal || 0;
    const paidAmount = localPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const remainingAmount = useMemo(() => {
        if (!totalAmount && !paidAmount) return null;
        return totalAmount - paidAmount;
    }, [totalAmount, paidAmount]);
    const changeAmount = paidAmount > totalAmount ? paidAmount - totalAmount : 0;

    const MOOBILE_PAY_LIMIT = 65000;

    // Generate a unique reference for this payment session using socket ID
    const paymentReference = socket2IsOn?.id || `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const [terminalPaymentResponse, setTerminalPaymentResponse] = useState<any>(null);
    // const [retryTerminalPaymentResponse, setRetryTerminalPaymentResponse] = useState<any>(null);
    const [terminalPaymentAmount, setTerminalPaymentAmount] = useState<number>(0);
    const macAddress = storeSettings?.macAddress;
    const [isCancelLoading, setIsCancelLoading] = useState(false);

    // Function to check terminal payment status on modal load and resume payment flow
    const checkTerminalPaymentStatusOnLoad = async (paymentId: string, paymentAmount: number) => {
        try {
            console.log('[PAYMENT_MODAL] Checking terminal payment status:', { paymentId, paymentAmount });
            const result = await checkTerminalPaymentStatus(paymentId);
            const paymentStatus = result?.paymentStatus;
            console.log('[PAYMENT_MODAL] Payment status result:', { paymentStatus, result });

            if (paymentStatus === 'SUCCEEDED') {
                // Clear terminalPaymentId when status is SUCCESS
                const currentCart = getCartState();
                if (currentCart?.terminalPaymentId) {
                    saveCartState(
                        currentCart.cartId,
                        localPayments,
                        currentCart.items,
                        currentCart.refundItems,
                        currentCart.customerId,
                        currentCart.customerName,
                        currentCart.customer,
                        undefined,
                        undefined,
                    );
                }

                // Add payment to localPayments
                const newPayment = createPaymentObject(paymentAmount, 'CARD', {
                    paymentId,
                    cardType: 'CARD',
                    reference: '',
                });

                const updatedPayments = [...localPayments, newPayment];
                setLocalPayments(updatedPayments);
                setPaymentsFn(updatedPayments);
                addPaymentToCartContext(updatedPayments);
                saveCartStateIfNeeded(updatedPayments);

                // Reset terminal processing state
                setTerminalPaymentResponse(null);
                setIsCardTerminalProcessing(false);

                // Show success modal
                setCardTerminalLoadingModal({
                    open: true,
                    status: 'success',
                    message: t('POS.PaymentSuccess'),
                });

                // Close modal and update remaining amount after modal closes
                setTimeout(() => {
                    setCardTerminalLoadingModal({
                        open: false,
                        status: 'success',
                        message: t('POS.PaymentSuccess'),
                    });

                    // Update remaining amount after modal closes
                    const paidAmount = updatedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
                    setPaymentAmount(Math.max(totalAmount - paidAmount, 0).toFixed(2));
                }, 1500);
            } else if (paymentStatus === 'CANCELLED' || paymentStatus === 'FAILED') {
                // Clear terminalPaymentId when status is CANCELLED or FAILED
                const currentCart = getCartState();
                if (currentCart?.terminalPaymentId) {
                    saveCartState(
                        currentCart.cartId,
                        localPayments,
                        currentCart.items,
                        currentCart.refundItems,
                        currentCart.customerId,
                        currentCart.customerName,
                        currentCart.customer,
                        undefined,
                        undefined,
                    );
                }

                // Reset terminal processing state
                setTerminalPaymentResponse(null);
                setIsCardTerminalProcessing(false);

                // Show error modal
                setCardTerminalLoadingModal({
                    open: true,
                    status: 'error',
                    message: t(paymentStatus === 'FAILED' ? 'POS.PaymentFailed' : 'POS.PaymentCancelled'),
                });
                setTimeout(() => {
                    setCardTerminalLoadingModal({
                        open: false,
                        status: 'error',
                        message: t(paymentStatus === 'FAILED' ? 'POS.PaymentFailed' : 'POS.PaymentCancelled'),
                    });
                }, 1500);
            } else if (paymentStatus === 'PENDING') {
                console.log('[PAYMENT_MODAL] Payment is PENDING, resuming flow');
                // Resume payment processing flow
                // Set terminal payment response to resume socket listening
                setTerminalPaymentResponse({
                    data: {
                        paymentId,
                    },
                });
                setTerminalPaymentAmount(paymentAmount);
                setIsCardTerminalProcessing(true);

                // Join socket room if available
                if (socket2IsOn && socket2IsOn.connected && macAddress && macAddress.length > 0) {
                    console.log('[PAYMENT_MODAL] Joining socket room:', macAddress[0]);
                    socket2IsOn.emit('join-room', macAddress[0]);
                } else {
                    console.log('[PAYMENT_MODAL] Socket not available:', {
                        socket2IsOn: !!socket2IsOn,
                        connected: socket2IsOn?.connected,
                        macAddress,
                    });
                }

                // Open processing modal
                console.log('[PAYMENT_MODAL] Opening processing modal');
                setCardTerminalLoadingModal({
                    open: true,
                    status: 'processing',
                    message: t('POS.PaymentProcessing'),
                });
            } else {
                console.log('[PAYMENT_MODAL] Unknown payment status:', paymentStatus);
                // Reset terminal processing state for unknown status
                setTerminalPaymentResponse(null);
                setIsCardTerminalProcessing(false);
                setCardTerminalLoadingModal({
                    open: false,
                    status: 'processing',
                    message: '',
                });
            }
        } catch (error) {
            console.error('Error checking terminal payment status on load:', error);
        }
    };

    // Function to check payment status via API
    const checkPaymentStatus = async (reference: string, paymentIndex: number) => {
        try {
            const response = await api.getApiMobilepayPaymentStatusReference(reference);
            if (response?.success && response.data) {
                const status = response.data?.state;

                if (status === 'AUTHORIZED' || status === 'SUCCESS') {
                    changePaymentMethodTxStatus(paymentIndex, 'SUCCEEDED');
                    toast.success(t('POS.PaymentSuccess'));
                } else if (status === 'CREATED') {
                    toast.success(t('POS.PaymentPending'));
                } else if (status === 'DECLINED' || status === 'FAILED' || status === 'ABORTED') {
                    changePaymentMethodTxStatus(paymentIndex, 'FAILED');
                    toast.error(t('POS.PaymentFailed'));
                    if (paymentIndex !== -1) {
                        // setFailedPayments([...failedPayments, localPayments[paymentIndex]]);
                        handleRemovePayment(paymentIndex);
                    }
                } else {
                    // Still pending, set timeout again
                    setPaymentTimeout(reference, paymentIndex);
                }
            } else {
                // No data or failed response, set timeout again
                setPaymentTimeout(reference, paymentIndex);
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
            // On error, set timeout again
            setPaymentTimeout(reference, paymentIndex);
        }
    };

    // Function to set timeout for payment
    const setPaymentTimeout = (reference: string, paymentIndex: number) => {
        // Clear existing timeout if any
        const existingTimeout = paymentTimeouts.get(reference);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        // Set new timeout for 60 seconds
        const timeoutId = setTimeout(() => {
            setTimedOutPayments((prev) => new Set(prev).add(reference));

            // Remove from timeouts map
            setPaymentTimeouts((prev) => {
                const newMap = new Map(prev);
                newMap.delete(reference);
                return newMap;
            });
        }, 60000); // 60 seconds

        // Store timeout ID
        setPaymentTimeouts((prev) => new Map(prev).set(reference, timeoutId));
    };

    // Function to clear timeout for payment
    const clearPaymentTimeout = (reference: string) => {
        const timeoutId = paymentTimeouts.get(reference);
        if (timeoutId) {
            clearTimeout(timeoutId);
            setPaymentTimeouts((prev) => {
                const newMap = new Map(prev);
                newMap.delete(reference);
                return newMap;
            });
        }
        setTimedOutPayments((prev) => {
            const newSet = new Set(prev);
            newSet.delete(reference);
            return newSet;
        });
    };

    // Check if modal is open, if so, try to restore cart state from localStorage
    useEffect(() => {
        if (open) {
            // Check if customer is selected, if so, set active gift cards
            if (cartOption.customerId) {
                dispatch(setActiveGiftCards(cartOption.customer?.giftCards || []));
            }

            // Try to restore cart state from localStorage
            const savedCartState = getCartState();
            if (savedCartState) {
                // Check if there are payments to restore
                const hasPayments = savedCartState.payments && savedCartState.payments.length > 0;

                if (hasPayments) {
                    // Check conditions before restoring
                    const bookingStatus = cartOption.saleId ? 'SUCCESS' : undefined;
                    if (shouldClearCart(savedCartState.payments, bookingStatus)) {
                        clearCartState();
                        // Start fresh
                        setLocalPayments([]);
                        clearPaymentsFn();
                        setPaymentAmount(
                            remainingAmount && remainingAmount > 0
                                ? Number(remainingAmount).toFixed(2)
                                : totalAmount.toFixed(2),
                        );
                    } else {
                        // Restore payments from localStorage
                        setLocalPayments(savedCartState.payments);
                        setPaymentsFn(savedCartState.payments);

                        // Recalculate payment amount
                        const restoredPaidAmount = savedCartState.payments.reduce(
                            (sum, payment) => sum + (payment.amount || 0),
                            0,
                        );
                        const newRemainingAmount = totalAmount - restoredPaidAmount;
                        setPaymentAmount(newRemainingAmount > 0 ? newRemainingAmount.toFixed(2) : '0');
                    }
                } else {
                    // No payments to restore, start fresh
                    setLocalPayments([]);
                    clearPaymentsFn();
                    setPaymentAmount(
                        remainingAmount && remainingAmount > 0
                            ? Number(remainingAmount).toFixed(2)
                            : totalAmount.toFixed(2),
                    );
                }

                // Check terminal payment status if terminalPaymentId exists (regardless of payments)
                if (savedCartState.terminalPaymentId && savedCartState.terminalPaymentAmount) {
                    console.log('[PAYMENT_MODAL] Resuming terminal payment:', {
                        paymentId: savedCartState.terminalPaymentId,
                        amount: savedCartState.terminalPaymentAmount,
                    });
                    checkTerminalPaymentStatusOnLoad(
                        savedCartState.terminalPaymentId,
                        savedCartState.terminalPaymentAmount,
                    );
                }
            } else {
                // No saved state, start fresh
                setLocalPayments([]);
                clearPaymentsFn();
                setPaymentAmount(
                    remainingAmount && remainingAmount > 0
                        ? Number(remainingAmount).toFixed(2)
                        : totalAmount.toFixed(2),
                );
            }
        } else {
            // Clear all timeouts when modal closes
            paymentTimeouts.forEach((timeoutId) => {
                clearTimeout(timeoutId);
            });
            setPaymentTimeouts(new Map());
            setTimedOutPayments(new Set());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, totalAmount, cartOption.customerId, dispatch]);

    // Function to save cart state when payments are updated
    const saveCartStateIfNeeded = (payments: overridePayment[]) => {
        // Only save if there are payments and at least one is successful
        // AND the payment type is MOBILE_PAY or CARD with terminal info (card terminal)

        const hasPendingPayment = payments.some(
            (payment) =>
                payment.txStatus === 'PENDING' &&
                (payment.paymentType === 'CARD' ||
                    payment.paymentType === ('CARD_TERMINAL' as overridePayment['paymentType'])) &&
                payment.paymentId,
        );
        const hasSuccessfulPayment = payments.some(
            (payment) =>
                payment.txStatus === 'SUCCEEDED' &&
                // REMOVED SAVING CART FOR MOBILE PAYMENTS UNTIL WE GET CONFIRMATION ABOUT NEW MOBILE PAY FLOW
                // (payment.paymentType === 'MOBILE_PAY' ||
                (payment.paymentType === 'CARD' ||
                    payment.paymentType === ('CARD_TERMINAL' as overridePayment['paymentType'])) &&
                payment.paymentId,
        );
        // );

        if (hasSuccessfulPayment || hasPendingPayment) {
            const cartId = `cart_${Date.now()}`;
            // Get current cart items from the cart context
            const cartItems = cartOption.items || [];
            const existingCart = getCartState();
            saveCartState(
                cartId,
                payments,
                cartItems,
                refundItems,
                cartOption.customerId as any,
                cartOption.customerName,
                cartOption.customer,
                existingCart?.terminalPaymentId,
                existingCart?.terminalPaymentAmount,
            );
        }
    };

    // Function to change payment method transaction status
    const changePaymentMethodTxStatus = (index: number, status: PostApiSaleBodyDataPaymentItemTxStatus) => {
        const updatedPayments = [...localPayments];
        if (index >= 0 && index < updatedPayments.length) {
            updatedPayments[index].txStatus = status;
            setLocalPayments(updatedPayments);

            // Mark payment as completed if it succeeded and is a mobile pay or card terminal payment
            if (status === 'SUCCEEDED') {
                const payment = updatedPayments[index];
                if (payment.paymentType === 'MOBILE_PAY' || (payment.paymentType === 'CARD' && payment.paymentId)) {
                    markPaymentAsCompleted(payment);
                }
            }

            // Save cart state if needed
            saveCartStateIfNeeded(updatedPayments);
        } else {
            console.warn('Invalid index in changePaymentMethodTxStatus:', index, updatedPayments);
        }
    };

    // Function to handle payment method click
    const handlePaymentMethodClick = (method: PaymentMethod, mobileByPass?: boolean, referenceId?: string | null) => {
        if (salesType !== 'RETURN') {
            if (!paymentAmount || Number(paymentAmount) <= 0) {
                return;
            }
        }

        let amount = Number(paymentAmount);

        // Special validation for bonus payments
        if (method.type === 'BONUS') {
            const customerBonusAmount = cartOption.customer?.bonus || 0;
            if (customerBonusAmount <= 0) {
                toast.error(t('POS.NoBonusAmountAvailable'));
                return;
            }
            if (amount > customerBonusAmount) {
                // Show confirmation modal instead of toast
                dispatch(
                    setPendingBonusPayment({
                        method,
                        amount,
                        mobileByPass,
                        referenceId,
                    }),
                );
                dispatch(setShowBonusConfirmationModal(true));
                return;
            }
        }

        if (method.type !== 'CASH') {
            if (remainingAmount && (amount <= 0 || amount > remainingAmount)) {
                amount = remainingAmount;
            }
        }

        if (method.type === 'GIFT_CARD') {
            dispatch(setShowGiftCardModal(true));
            return;
        }

        if (method.type === 'CUT_CARD') {
            dispatch(setShowPunchCardModal(true));
            return;
        }

        if (method.type === 'CARD_TERMINAL') {
            setTerminalPaymentAmount(amount);
            handleCardTerminalPayment(amount);
            return;
        }

        // REMOVED MOBILE PAY LIMIT CHECK UNTIL WE GET CONFIRMATION ABOUT NEW MOBILE PAY FLOW
        // if (!asCreditSale && method.type === 'MOBILE_PAY' && amount > 65000) {
        //     toast.error(`${t('POS.MobilePayLimit')} ${MOOBILE_PAY_LIMIT}`);
        //     return;
        // } else if (!asCreditSale && method.type === 'MOBILE_PAY' && !mobileByPass) {
        //     setShowMobilePayModal(true);
        //     return;
        // }

        // Check if payment method already exists
        const existingIndex = localPayments.findIndex(
            (p) => p.paymentType === method.type && !p.giftCardId && p.paymentType !== 'MOBILE_PAY',
        );

        let updatedLocalPayments;
        if (existingIndex !== -1) {
            // Update the existing payment entry
            updatedLocalPayments = localPayments.map((p, idx) =>
                idx === existingIndex
                    ? {
                          ...p,
                          amount: (p.amount || 0) + amount,
                          tenderAmount: (p.tenderAmount || 0) + amount,
                      }
                    : p,
            );
        } else {
            // Create new payment entry according to API schema
            const newPayment = createPaymentObject(amount, method.type as PostApiSaleBodyDataPaymentItemPaymentType, {
                cardType: method.type === 'CARD' ? 'CREDIT' : null,
                reference: referenceId ? referenceId : mobilepayRefrence,
            });
            updatedLocalPayments = [...localPayments, newPayment];
        }
        setLocalPayments(updatedLocalPayments);

        // Add payments to cart context
        addPaymentToCartContext(updatedLocalPayments);

        // Save cart state if needed
        saveCartStateIfNeeded(updatedLocalPayments);

        // Set timeout for MOBILE_PAY payments if referenceId is provided
        if (method.type === 'MOBILE_PAY' && referenceId) {
            const newPaymentIndex = updatedLocalPayments.length - 1;
            setPaymentTimeout(referenceId, newPaymentIndex);
        }

        // Calculate new remaining amount after this payment
        const newPaidAmount = updatedLocalPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        const newRemainingAmount = totalAmount - newPaidAmount;

        // Reset payment amount to remaining amount
        setPaymentAmount(newRemainingAmount > 0 ? newRemainingAmount.toFixed(2).toString() : '0');
    };

    // Function to add payments to cart context
    const addPaymentToCartContext = (payments: overridePayment[]) => {
        clearPaymentsFn();
        payments.forEach((p) => addPaymentFn(p));
    };

    // Function to handle gift card payment
    const handleGiftCardPayment = (giftCardId: string, amount: number) => {
        // Check if this gift card payment already exists
        const existingIndex = localPayments.findIndex(
            (p) => p.paymentType === 'GIFT_CARD' && p.giftCardId === giftCardId,
        );
        let updatedLocalPayments;
        if (existingIndex !== -1) {
            updatedLocalPayments = localPayments.map((p, idx) =>
                idx === existingIndex
                    ? {
                          ...p,
                          amount: (p.amount || 0) + amount,
                          tenderAmount: (p.tenderAmount || 0) + amount,
                      }
                    : p,
            );
        } else {
            const newPayment = createPaymentObject(amount, 'GIFT_CARD', {
                giftCardId: giftCardId,
            });
            updatedLocalPayments = [...localPayments, newPayment];
        }
        setLocalPayments(updatedLocalPayments);
        addPaymentToCartContext(updatedLocalPayments);

        // Calculate new remaining amount after this payment
        const newPaidAmount = updatedLocalPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        const newRemainingAmount = totalAmount - newPaidAmount;

        // Reset payment amount to remaining amount
        setPaymentAmount(newRemainingAmount > 0 ? newRemainingAmount.toString() : '0');
    };

    // Function to handle punch card payment
    const handlePunchCardPayment = (paymentItem: overridePayment) => {
        // Check if punch card payment already exists
        const existingIndex = localPayments.findIndex(
            (p) =>
                p.paymentType === 'CUT_CARD' &&
                p?.bunddleOffer?.bundleOfferId === paymentItem.bunddleOffer?.bundleOfferId,
        );
        let updatedLocalPayments;
        if (existingIndex !== -1) {
            updatedLocalPayments = localPayments.map((p, idx) =>
                idx === existingIndex
                    ? {
                          ...p,
                          amount: (p.amount || 0) + (paymentItem.amount || 0),
                          tenderAmount: (p.tenderAmount || 0) + (paymentItem.tenderAmount || 0),
                      }
                    : p,
            );
        } else {
            updatedLocalPayments = [...localPayments, paymentItem];
        }
        setLocalPayments(updatedLocalPayments);
        addPaymentToCartContext(updatedLocalPayments);

        // Calculate new remaining amount after this payment
        const newPaidAmount = updatedLocalPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        const newRemainingAmount = totalAmount - newPaidAmount;

        // Reset payment amount to remaining amount
        setPaymentAmount(newRemainingAmount > 0 ? newRemainingAmount.toString() : '0');
    };

    // Function to handle card terminal payment
    const handleCardTerminalPayment = async (amount: number) => {
        // Prevent multiple simultaneous requests
        if (isCardTerminalProcessing) {
            console.info('[CARD_TERMINAL_PAYMENT] ALREADY PROCESSING');
            return;
        }

        try {
            setIsCardTerminalProcessing(true);

            // Show beautiful loading modal
            setCardTerminalLoadingModal({
                open: true,
                status: 'processing',
                message: 'Connecting to terminal...',
            });

            // Get settings from store
            const settings = storeSettings?.posSetting?.value as Settings;

            if (!settings) {
                setCardTerminalLoadingModal({
                    open: true,
                    status: 'error',
                    message: 'POS settings not found. Please configure your terminal settings.',
                });
                return;
            }

            // Validate terminal configuration
            const validation = validateTerminalConfig(settings);
            if (!validation.isValid) {
                setCardTerminalLoadingModal({
                    open: true,
                    status: 'error',
                    message: `Terminal configuration error: ${validation.errors.join(', ')}`,
                });
                return;
            }

            // Update loading message
            setCardTerminalLoadingModal({
                open: true,
                status: 'processing',
                message: t('POS.PaymentProcessing'),
            });

            // INITIATE PAYMENT REQUEST AND GET THE RESPONSE
            const result = await processCardPayment(amount, 'DKK', settings);
            if (socket2IsOn && socket2IsOn.connected && macAddress && macAddress.length > 0) {
                socket2IsOn.emit('join-room', macAddress[0]);
            }
            console.info('Terminal payment result:', result);

            if ('data' in result && result.data?.paymentId) {
                setTerminalPaymentResponse(result);

                // Save cart with payment ID and amount when terminal payment is initiated
                const cartId = `cart_${Date.now()}`;
                saveCartState(
                    cartId,
                    localPayments,
                    cartOption.items || [],
                    refundItems,
                    cartOption.customerId as any,
                    cartOption.customerName,
                    cartOption.customer,
                    result.data.paymentId,
                    amount,
                );
            } else {
                setTerminalPaymentResponse(null);
            }
        } catch (error: any) {
            console.error('[CARD_TERMINAL_PAYMENT] Card terminal payment error:', error);
        } finally {
            setIsCardTerminalProcessing(false);
        }
    };

    const handleRemovePayment = (index: number) => {
        const paymentToRemove = localPayments[index];

        // Check if payment can be removed using protection logic
        const removalCheck = canRemovePayment(paymentToRemove);

        if (!removalCheck.canRemove) {
            toast.error(removalCheck.reason || 'Cannot remove this payment');
            return;
        }

        // Check if the payment to be removed is a gift card
        const isGiftCard = paymentToRemove?.paymentType === 'GIFT_CARD';

        // Remove from local payments
        const updatedLocalPayments = localPayments.filter((_, i) => i !== index);
        setLocalPayments(updatedLocalPayments);

        // Remove from cart context
        removePaymentFn(index);

        // if gift card payment, reset active gift cards
        if (isGiftCard) {
            dispatch(setActiveGiftCards(cartOption.customer?.giftCards || []));
        }

        // Recalculate remaining amount
        const newPaidAmount = updatedLocalPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        const newRemainingAmount = totalAmount - newPaidAmount;
        setPaymentAmount(newRemainingAmount > 0 ? newRemainingAmount.toFixed(2).toString() : '0');
    };

    const handleComplete = () => {
        if (asCreditSale) {
            onComplete();
            onClose();
            handleResetPayment();
            // Clear completed payments and cart state when sale is completed
            clearCompletedPayments();
            return;
        }

        if (asEditSale) {
            // onComplete(localPayments);
            const finalPayments = [...localPayments];
            setLocalPayments(finalPayments);
            setPaymentsFn(finalPayments);

            dispatch(setShowSummary(true));
            // onClose();
            // handleResetPayment();
            return;
        }
        if (paidAmount >= totalAmount) {
            const finalPayments = [...localPayments];
            setLocalPayments(finalPayments);
            setPaymentsFn(finalPayments);

            dispatch(setShowSummary(true));
        }
    };

    const handleConfirmPayment = () => {
        // Process payments without modifying amounts
        const processedPayments = localPayments.map((payment, index) => {
            // For Outstanding payment, ensure it's the last payment and matches remaining
            if (payment.paymentType === 'OUTSTANDING') {
                const previousPayments = localPayments.slice(0, index);
                const paidAmount = previousPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
                const remainingAmount = totalAmount - paidAmount;

                return {
                    ...payment,
                    amount: remainingAmount,
                    tenderAmount: remainingAmount,
                    change: 0,
                };
            }

            return {
                ...payment,
                amount: payment.amount,
                tenderAmount: payment.amount,
                change: 0,
            };
        });

        // Update cart with processed payments
        setPaymentsFn(processedPayments);
        onComplete();
        dispatch(setShowSummary(false));
        onClose();
    };

    const handleResetPayment = () => {
        // Check if any payments are protected before resetting
        const hasProtectedPayments = localPayments.some((payment) => {
            const removalCheck = canRemovePayment(payment);
            return !removalCheck.canRemove;
        });

        if (hasProtectedPayments) {
            toast.error(t('POS.CannotResetProtectedPayments'));
            return;
        }

        dispatch(setShowSummary(false));
        setLocalPayments([]);
        clearPaymentsFn(); // Clear cart payments as well
        setPaymentAmount(totalAmount.toString());
    };

    const handleBonusPaymentConfirm = () => {
        if (pendingBonusPayment) {
            // Process the bonus payment with the receivable amount (not the asked amount)
            const { method, referenceId } = pendingBonusPayment;
            const receivableAmount = cartOption.customer?.bonus || 0;

            // Create new payment entry according to API schema
            const newPayment = createPaymentObject(
                receivableAmount,
                method.type as PostApiSaleBodyDataPaymentItemPaymentType,
                {
                    reference: referenceId || undefined,
                },
            );

            const updatedLocalPayments = [...localPayments, newPayment];
            setLocalPayments(updatedLocalPayments);
            addPaymentToCartContext(updatedLocalPayments);

            // Calculate new remaining amount after this payment
            const newPaidAmount = updatedLocalPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
            const newRemainingAmount = totalAmount - newPaidAmount;

            // Reset payment amount to remaining amount
            setPaymentAmount(newRemainingAmount > 0 ? newRemainingAmount.toFixed(2).toString() : '0');
        }

        // Clear pending payment and close modal
        dispatch(setPendingBonusPayment(null));
        dispatch(setShowBonusConfirmationModal(false));
    };

    const handleBonusPaymentCancel = () => {
        dispatch(setPendingBonusPayment(null));
        dispatch(setShowBonusConfirmationModal(false));
    };

    // Helper function to get payment method name by type
    const getPaymentMethodName = (paymentType: string, payment?: overridePayment): string => {
        const translationKey = getPaymentMethodNameHelper(paymentType, payment);
        return t(translationKey);
    };

    // Helper function to get payment method icon by type
    const getPaymentMethodIcon = (paymentType: string, payment?: overridePayment): React.ReactNode => {
        return getPaymentMethodIconHelper(paymentType, payment);
    };

    const customerBonusAmount = cartOption.customer?.bonus || 0;
    const paymentMethods = getPaymentMethods(asCreditSale, asEditSale, customerBonusAmount, storeSettings);

    // Initialize selectedTab and reset shouldDirectPay when modal opens
    useEffect(() => {
        if (open) {
            // Reset shouldDirectPay to false on modal open (will be set to true by auto-pay effect if needed)
            dispatch(setShouldDirectPay(false));
            // Initialize selectedTab based on sale type and cart state
            const initialTab = asCreditSale || cartOption.items.length === 0 ? 'refund' : 'payment';
            dispatch(setSelectedTab(initialTab));
        }
    }, [open, asCreditSale, cartOption.items.length, dispatch]);

    // Debug effect to log when mobilepayRefrence changes
    // useEffect(() => {
    //     if (mobilepayRefrence) {
    //         console.info('MobilePay reference changed:', mobilepayRefrence);
    //     }
    // }, [mobilepayRefrence]);

    useEffect(() => {
        if (!socket2IsOn) {
            console.info('Socket not available');
            return;
        }

        if (!isConnected) {
            console.info('Socket not connected');
            return;
        }

        // // Listen for room-joined event to confirm connection
        const handleRoomJoined = (data: any) => {
            console.info('Joined payment room:', data);
        };

        // Listen for card payment terminal payment updates
        const handleCardPaymentTerminalPaymentUpdate = (data: any) => {
            console.info('Card payment terminal payment update:', data);
            switch (data.status) {
                case 'SUCCEEDED':
                    console.log('0 - [SOCKET-SUCCEEDED]', data);
                    if (data?.paymentId === terminalPaymentResponse?.data?.paymentId) {
                        setCardTerminalLoadingModal({
                            open: true,
                            status: 'success',
                            message: t('POS.PaymentSuccess'),
                        });

                        // Close modal and update payments after modal closes
                        setTimeout(() => {
                            setCardTerminalLoadingModal({
                                open: false,
                                status: 'success',
                                message: t('POS.PaymentSuccess'),
                            });

                            // Update payments and remaining amount after modal closes
                            const newPayment = createPaymentObject(
                                data.responseObject?.responseData?.amounts?.total / 100,
                                'CARD',
                                {
                                    paymentId: data.paymentId,
                                    cardType: 'CARD',
                                    reference: data.reference,
                                },
                            );
                            const updatedPayments = [...localPayments, newPayment];
                            setLocalPayments(updatedPayments);
                            addPaymentToCartContext(updatedPayments);

                            // Clear terminalPaymentId when payment succeeds (no longer pending)
                            const currentCart = getCartState();
                            if (currentCart?.terminalPaymentId) {
                                saveCartState(
                                    currentCart.cartId,
                                    updatedPayments,
                                    currentCart.items,
                                    currentCart.refundItems,
                                    currentCart.customerId,
                                    currentCart.customerName,
                                    currentCart.customer,
                                    undefined,
                                    undefined,
                                );
                            } else {
                                saveCartStateIfNeeded(updatedPayments);
                            }

                            const newPaidAmount = updatedPayments.reduce(
                                (sum, payment) => sum + (payment.amount || 0),
                                0,
                            );
                            const newRemainingAmount = totalAmount - newPaidAmount;
                            setPaymentAmount(newRemainingAmount > 0 ? newRemainingAmount.toFixed(2).toString() : '0');
                        }, 1500);
                    }
                    break;
                case 'FAILED':
                    console.log('1 - [SOCKET-FAILED]', data);
                    if (data?.paymentId === terminalPaymentResponse?.data?.paymentId) {
                        // Clear terminalPaymentId when payment fails (no longer pending)
                        const currentCart = getCartState();
                        if (currentCart?.terminalPaymentId) {
                            saveCartState(
                                currentCart.cartId,
                                localPayments,
                                currentCart.items,
                                currentCart.refundItems,
                                currentCart.customerId,
                                currentCart.customerName,
                                currentCart.customer,
                                undefined,
                                undefined,
                            );
                        }
                        setCardTerminalLoadingModal({
                            open: true,
                            status: 'error',
                            message: t('POS.PaymentFailed'),
                        });
                        setTimeout(() => {
                            setCardTerminalLoadingModal({
                                open: false,
                                status: 'error',
                                message: t('POS.PaymentFailed'),
                            });
                        }, 1500);
                    }
                    break;
                case 'ABORT_FAILED':
                    console.log('1 - [SOCKET-ABORT_FAILED]', data);
                    if (data?.paymentId === terminalPaymentResponse?.data?.paymentId) {
                        // Clear terminalPaymentId when payment aborts (no longer pending)
                        const currentCart = getCartState();
                        if (currentCart?.terminalPaymentId) {
                            saveCartState(
                                currentCart.cartId,
                                localPayments,
                                currentCart.items,
                                currentCart.refundItems,
                                currentCart.customerId,
                                currentCart.customerName,
                                currentCart.customer,
                                undefined,
                                undefined,
                            );
                        }
                        setCardTerminalLoadingModal({
                            open: true,
                            status: 'error',
                            message: t('POS.FailedToCancelPayment'),
                        });
                        setTimeout(() => {
                            setCardTerminalLoadingModal({
                                open: false,
                                status: 'error',
                                message: t('POS.FailedToCancelPayment'),
                            });
                        }, 1500);
                    }
                    break;
                case 'PENDING':
                    console.log('2 - [SOCKET-PENDING]', data);
                    if (
                        data?.responseObject?.statusCode === 429 &&
                        data?.responseObject?.paymentId === terminalPaymentResponse?.data?.paymentId
                    ) {
                        console.info('Terminal busy');
                        setCardTerminalLoadingModal({
                            open: true,
                            status: 'processing',
                            message: t('POS.TerminalBusy'),
                        });

                        setTimeout(() => {
                            setCardTerminalLoadingModal({
                                open: false,
                                status: 'processing',
                                message: t('POS.TerminalBusy'),
                            });
                        }, 2000);
                    } else {
                        if (data?.responseObject?.paymentId === terminalPaymentResponse?.data?.paymentId) {
                            setCardTerminalLoadingModal({
                                open: true,
                                status: 'processing',
                                message: t('POS.PaymentProcessing'),
                            });
                        }
                    }
                    break;
                case 'CANCELLED':
                    console.log('3 - [SOCKET-CANCELLED]', data);
                    if (data?.paymentId === terminalPaymentResponse?.data?.paymentId) {
                        // Clear terminalPaymentId when payment is cancelled (no longer pending)
                        const currentCart = getCartState();
                        if (currentCart?.terminalPaymentId) {
                            saveCartState(
                                currentCart.cartId,
                                localPayments,
                                currentCart.items,
                                currentCart.refundItems,
                                currentCart.customerId,
                                currentCart.customerName,
                                currentCart.customer,
                                undefined,
                                undefined,
                            );
                        }
                        setCardTerminalLoadingModal({
                            open: true,
                            status: 'error',
                            message: t('POS.PaymentCancelled'),
                        });

                        // Check if there are any successful terminal payments before clearing cart
                        const hasSuccessfulTerminalPayments = localPayments.some((p) => {
                            const isCardTerminal = p.paymentType === 'CARD' && (p.paymentId || p.terminalId);
                            return isCardTerminal && p.txStatus === 'SUCCEEDED';
                        });

                        // Only clear cart if there are no successful terminal payments
                        if (!hasSuccessfulTerminalPayments) {
                            clearCartState();
                        }

                        setTimeout(() => {
                            setCardTerminalLoadingModal({
                                open: false,
                                status: 'error',
                                message: t('POS.PaymentCancelled'),
                            });
                            setTerminalPaymentResponse(null);
                            setIsCardTerminalProcessing(false);
                            setIsCancelLoading(false);
                        }, 2000);
                    }
                    break;
                case 'ABORTED':
                    console.log('4 - [SOCKET-ABORTED]', data);
                    if (data?.paymentId === terminalPaymentResponse?.data?.paymentId) {
                        setCardTerminalLoadingModal({
                            open: true,
                            status: 'processing',
                            message: t('POS.Cancelling'),
                        });
                    }
                    break;
                default:
                    console.log('4 - [SOCKET-DEFAULT]', data);
                    if (data?.paymentId === terminalPaymentResponse?.data?.paymentId) {
                        setCardTerminalLoadingModal({
                            open: true,
                            status: 'processing',
                            message: t('POS.PaymentProcessing'),
                        });
                    }
                    break;
            }
        };

        // Listen for payment updates on the specific reference
        const handlePaymentUpdate = (data: any) => {
            console.info('Payment update:', data);
            // Check if this update is for our mobilepay reference or payment reference
            if (
                data.reference === mobilepayRefrence ||
                data.reference === paymentReference ||
                data.reference === socket2IsOn?.id
            ) {
                let paymentIndex = localPayments.findIndex((p) => p.reference === data.reference);

                if (paymentIndex === -1) {
                    const lastMobilePayIndex = [...localPayments]
                        .reverse()
                        .findIndex((p) => p.paymentType === 'MOBILE_PAY');
                    paymentIndex = lastMobilePayIndex === -1 ? -1 : localPayments.length - 1 - lastMobilePayIndex;
                }

                changePaymentMethodTxStatus(paymentIndex, 'PENDING');

                // Show toast with the name and message from the socket response
                if (data.name && data.message) {
                    if (data.name === 'AUTHORIZED' || data.name === 'success') {
                        changePaymentMethodTxStatus(paymentIndex, 'SUCCEEDED');
                        window.dispatchEvent(new Event('mobilepay-payment-success'));
                        toast.success(t('POS.PaymentSuccess'));
                        // Clear timeout on success
                        if (data.reference) {
                            clearPaymentTimeout(data.reference);
                        }
                    } else if (data.name === 'DECLINED' || data.name === 'failed' || data.name === 'ABORTED') {
                        window.dispatchEvent(new Event('mobilepay-payment-error'));
                        toast.error(t('POS.PaymentFailed'));
                        changePaymentMethodTxStatus(paymentIndex, 'FAILED');
                        // Clear timeout on failure
                        if (data.reference) {
                            clearPaymentTimeout(data.reference);
                        }
                        if (paymentIndex !== -1) {
                            handleRemovePayment(paymentIndex);
                        }
                    } else {
                        toast.info(data.message);
                        changePaymentMethodTxStatus(paymentIndex, 'PENDING');
                    }
                } else {
                    // Fallback to default messages
                    if (data.name === 'AUTHORIZED' || data.name === 'success') {
                        window.dispatchEvent(new Event('mobilepay-payment-success'));
                        toast.success(t('POS.PaymentSuccess'));
                        changePaymentMethodTxStatus(paymentIndex, 'SUCCEEDED');
                        // Clear timeout on success
                        if (data.reference) {
                            clearPaymentTimeout(data.reference);
                        }
                    } else if (data.name === 'DECLINED' || data.name === 'failed' || data.name === 'ABORTED') {
                        window.dispatchEvent(new Event('mobilepay-payment-error'));
                        toast.error(t('POS.PaymentFailed'));
                        changePaymentMethodTxStatus(paymentIndex, 'FAILED');
                        // Clear timeout on failure
                        if (data.reference) {
                            clearPaymentTimeout(data.reference);
                        }
                        if (paymentIndex !== -1) {
                            handleRemovePayment(paymentIndex);
                        }
                    }
                }
            }
            //  else {
            //     console.info('Payment update for different reference:', data.reference);
            //     console.info('Expected references:', {
            //         socketId: socket2IsOn?.id,
            //         paymentReference,
            //         mobilepayRefrence,
            //     });
            // }
        };

        // Listen for leave room event
        const handleLeaveRoom = (data: any) => {
            console.info('Left payment room:', data);
        };

        // Listen for ABORTED payment event
        // const handleAbortedPayment = (data: any) => {
        //     console.info('Cancel payment:', data);
        // };

        // Add event listeners
        socket2IsOn.on('room-joined', handleRoomJoined);
        socket2IsOn.on('broadcast-to-room', handleRoomJoined);
        socket2IsOn.on('payment-update', handlePaymentUpdate);
        socket2IsOn.on('PAYMENT_RESPONSE', handleCardPaymentTerminalPaymentUpdate);
        socket2IsOn.on('leave-room', handleLeaveRoom);
        // socket2IsOn.on('ABORT_PAYMENT', handleAbortedPayment);
        // Cleanup listeners on unmount
        return () => {
            if (socket2IsOn) {
                socket2IsOn.off('room-joined', handleRoomJoined);
                socket2IsOn.off('broadcast-to-room', handleRoomJoined);
                socket2IsOn.off('payment-update', handlePaymentUpdate);
                socket2IsOn.off('PAYMENT_RESPONSE', handleCardPaymentTerminalPaymentUpdate);
                socket2IsOn.off('leave-room', handleLeaveRoom);
                // socket2IsOn.off('ABORT_PAYMENT', handleAbortedPayment);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket2IsOn, paymentReference, mobilepayRefrence, isConnected, localPayments]);

    const isAnyPending = localPayments.some((payment) => payment.txStatus === 'PENDING');

    const handleRetryCardTerminalPayment = useCallback(
        async (paymentId: string) => {
            if (paymentId !== terminalPaymentResponse?.data?.paymentId) return;

            const openModal = (status: 'success' | 'error' | 'processing', message: string, autoClose = true) => {
                setCardTerminalLoadingModal({ open: true, status, message });
                if (autoClose) {
                    setTimeout(() => setCardTerminalLoadingModal({ open: false, status, message }), 1500);
                }
            };

            try {
                const result = await checkTerminalPaymentStatus(paymentId);
                const paymentStatus = result?.paymentStatus;

                if (paymentStatus === 'SUCCEEDED') {
                    const newPayment = createPaymentObject(terminalPaymentAmount, 'CARD', {
                        paymentId,
                        cardType: 'CARD',
                        reference: '',
                    });

                    const updatedPayments = [...localPayments, newPayment];
                    setLocalPayments(updatedPayments);
                    addPaymentToCartContext(updatedPayments);
                    saveCartStateIfNeeded(updatedPayments);

                    // Show success modal and update remaining amount after modal closes
                    openModal('success', t('POS.PaymentSuccess'));

                    setTimeout(() => {
                        // Update remaining amount after modal closes
                        const paidAmount = updatedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
                        setPaymentAmount(Math.max(totalAmount - paidAmount, 0).toFixed(2));
                    }, 1500);

                    return;
                }

                if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
                    openModal('error', t(paymentStatus === 'FAILED' ? 'POS.PaymentFailed' : 'POS.PaymentCancelled'));

                    setTerminalPaymentResponse(null);
                    setIsCardTerminalProcessing(false);
                    return;
                }

                if (paymentStatus === 'PENDING') {
                    openModal('processing', t('POS.PaymentProcessing'), false);
                    return;
                }

                // fallback
                openModal('processing', t('POS.PaymentProcessing'));
            } catch {
                openModal('error', 'Unexpected error while retrying payment');
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [terminalPaymentResponse, localPayments, totalAmount, terminalPaymentAmount],
    );

    useEffect(() => {
        if (socket2IsOn) {
            socket2IsOn.connect();
        }

        return () => {
            if (socket2IsOn) {
                socket2IsOn.disconnect();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cardTerminalLoadingModal?.open, showMobilePayModal]);

    useEffect(() => {
        if (remainingAmount !== null && remainingAmount <= 0 && !isAnyPending) {
            dispatch(setShouldDirectPay(true));
            handleComplete();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remainingAmount, isAnyPending, dispatch]);

    const cancelTerminalPayment = async (paymentId: string) => {
        setIsCancelLoading(true);
        setCardTerminalLoadingModal({ open: true, status: 'processing', message: t('POS.Cancelling') });

        try {
            const result = await api.postApiAbortCardPayment({ paymentId });
            if (result.success) {
                setCardTerminalLoadingModal({ open: true, status: 'processing', message: t('POS.Cancelling') });
            } else {
                setCardTerminalLoadingModal({ open: true, status: 'error', message: t('POS.FailedToCancelPayment') });

                setTimeout(() => {
                    setCardTerminalLoadingModal({
                        open: false,
                        status: 'error',
                        message: t('POS.FailedToCancelPayment'),
                    });
                    setIsCancelLoading(false);
                }, 1500);
            }
        } catch (error) {
            console.error('Cancel terminal payment error:', error);
            setCardTerminalLoadingModal({ open: true, status: 'error', message: t('POS.FailedToCancelPayment') });

            setTimeout(() => {
                setCardTerminalLoadingModal({ open: false, status: 'error', message: t('POS.FailedToCancelPayment') });
                setIsCancelLoading(false);
            }, 1500);
        } finally {
            setIsCancelLoading(false);
        }
    };

    return (
        <React.Fragment>
            <Modal
                open={open}
                onClose={(event, reason) => {
                    if (reason === 'backdropClick') {
                        return;
                    }
                    if (!isAnyPending) onClose();
                }}
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
                        maxWidth: 600,
                        maxHeight: '90vh',
                        minHeight: '50vh',
                        overflow: 'auto',
                        borderRadius: 2,
                        p: 3,
                        position: 'relative',
                    }}
                >
                    <IconButton
                        sx={{ position: 'absolute', top: 0, right: 0 }}
                        onClick={() => {
                            if (!isAnyPending) onClose();
                        }}
                    >
                        <Close />
                    </IconButton>
                    {asCreditSale && (
                        <Stack
                            sx={{
                                mb: 2,
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2,
                            }}
                        >
                            <POSHeading
                                text={t('POS.PaymentMethod')}
                                sx={{
                                    fontSize: 18,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    borderBottom: selectedTab === 'payment' ? '2px solid #000' : 'none',
                                }}
                                fontColor={selectedTab !== 'payment' ? '#d2d2d2' : '#1F1F1F'}
                                onClick={() => dispatch(setSelectedTab('payment'))}
                            />
                            <Divider orientation="vertical" flexItem sx={{ borderColor: 'divider', borderWidth: 1 }} />
                            <POSHeading
                                text={t('POS.RefundItems')}
                                sx={{
                                    fontSize: 18,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    borderBottom: selectedTab === 'refund' ? '2px solid #000' : 'none',
                                }}
                                fontColor={selectedTab !== 'refund' ? '#d2d2d2' : '#1F1F1F'}
                                onClick={() => dispatch(setSelectedTab('refund'))}
                            />
                        </Stack>
                    )}
                    {selectedTab === 'payment' && (
                        <PaymentTab
                            asCreditSale={asCreditSale}
                            onClose={onClose}
                            cartOption={cartOption}
                            paymentAmount={paymentAmount}
                            setPaymentAmount={setPaymentAmount}
                            paymentMethods={paymentMethods}
                            handlePaymentMethodClick={handlePaymentMethodClick}
                            localPayments={localPayments}
                            handleRemovePayment={handleRemovePayment}
                            totalAmount={totalAmount}
                            paidAmount={paidAmount}
                            remainingAmount={remainingAmount || 0}
                            changeAmount={changeAmount}
                            handleComplete={handleComplete}
                            getPaymentMethodIcon={getPaymentMethodIcon}
                            getPaymentMethodName={getPaymentMethodName}
                            isAnyPending={isAnyPending}
                            timedOutPayments={timedOutPayments}
                            handleRefreshPaymentStatus={checkPaymentStatus}
                            calculateTotalDiscount={calculateTotalDiscount}
                            asEditSale={asEditSale}
                            isCardTerminalProcessing={isCardTerminalProcessing}
                        />
                    )}
                    {selectedTab === 'refund' && (
                        <RefundItemsTab
                            cartOption={cartOption}
                            setCartOption={creditSale?.setCartOption || (() => {})}
                            setSelectedTab={(tab: 'payment' | 'refund') => dispatch(setSelectedTab(tab))}
                        />
                    )}
                </Paper>
            </Modal>

            {/* Payment Summary Modal */}
            {showSummary && (
                <PaymentSummary
                    open={showSummary}
                    onClose={() => dispatch(setShowSummary(false))}
                    onConfirm={handleConfirmPayment}
                    onReset={handleResetPayment}
                    totalAmount={totalAmount}
                    paidAmount={paidAmount}
                    changeAmount={changeAmount}
                    payments={localPayments}
                    asEditSale={asEditSale}
                    onSaleSuccess={onSaleSuccess}
                    hasProtectedPayments={localPayments.some((payment) => {
                        const removalCheck = canRemovePayment(payment);
                        return !removalCheck.canRemove;
                    })}
                    shouldDirectPay={shouldDirectPay}
                />
            )}

            {/* Gift Card Modal */}
            {showGiftCardModal && (
                <ApplyGiftCard
                    open={showGiftCardModal}
                    onClose={() => dispatch(setShowGiftCardModal(false))}
                    onConfirm={handleGiftCardPayment}
                    predefinedAmount={Number(paymentAmount)}
                    activeGiftCards={activeGiftCards}
                    setActiveGiftCards={(cards) =>
                        dispatch(setActiveGiftCards(cards as GetApiCustomers200CustomersItemGiftCardsItem[]))
                    }
                    localPayments={localPayments}
                />
            )}

            {/* Punch Card Modal */}
            {showPunchCardModal && (
                <PunchCardPayModal
                    open={showPunchCardModal}
                    handleClose={() => dispatch(setShowPunchCardModal(false))}
                    totalAmount={totalAmount}
                    paymentAmount={Number(paymentAmount)}
                    handlePunchCardPayment={handlePunchCardPayment}
                />
            )}

            {/* Mobile Payment Modal */}
            {showMobilePayModal && (
                <MobilePayModal
                    open={showMobilePayModal}
                    onClose={() => dispatch(setShowMobilePayModal(false))}
                    amount={Number(paymentAmount)}
                    customer={cartOption.customer || null}
                    MOOBILE_PAY_LIMIT={MOOBILE_PAY_LIMIT}
                    setMobilepayReference={setMobilepayReference as any}
                    cart={cartOption}
                    socket2IsOn={socket2IsOn}
                    handlePaymentMethodClick={handlePaymentMethodClick}
                />
            )}

            {/* Bonus Confirmation Modal */}
            {showBonusConfirmationModal && pendingBonusPayment && (
                <BonusConfirmationModal
                    open={showBonusConfirmationModal}
                    onClose={handleBonusPaymentCancel}
                    onConfirm={handleBonusPaymentConfirm}
                    customerBonusAmount={cartOption.customer?.bonus || 0}
                    paymentAmount={pendingBonusPayment.amount}
                    customerName={cartOption.customer?.name}
                />
            )}

            {/* Card Terminal Loading Modal */}
            <CardTerminalLoadingModal
                open={cardTerminalLoadingModal.open}
                status={cardTerminalLoadingModal.status}
                message={cardTerminalLoadingModal.message}
                onClose={() => {
                    setCardTerminalLoadingModal({ open: false, status: 'processing' });
                    setTerminalPaymentResponse(null);
                    setIsCardTerminalProcessing(false);
                }}
                onRetry={async () => {
                    await handleRetryCardTerminalPayment(terminalPaymentResponse?.data?.paymentId);
                }}
                onCancel={() => cancelTerminalPayment(terminalPaymentResponse?.data?.paymentId)}
                retryTimeout={5000}
                isCancellingPayment={isCancelLoading}
            />
        </React.Fragment>
    );
}
