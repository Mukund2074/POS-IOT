import { overridePayment } from '@/scenes/POS/UI/Sales-Page/Types/sales.types';
import { t } from 'i18next';
import { ExtendedSaleItem } from '@/types/CartContext.type';

const COMPLETED_PAYMENTS_KEY = 'bahlou_completed_payments';
const CART_STATE_KEY = 'bahlou_cart_state';

export interface CompletedPayment extends overridePayment {
    completedAt: string;
    sessionId: string;
}

export interface CartState {
    cartId: string;
    payments: overridePayment[];
    items: ExtendedSaleItem[];
    refundItems: ExtendedSaleItem[];
    customerId?: string | null;
    customerName?: string;
    customer?: any;
    timestamp: string;
    terminalPaymentId?: string;
    terminalPaymentAmount?: number;
}

/**
 * Save a completed payment to localStorage to prevent removal
 */
function saveCompletedPayment(payment: overridePayment, sessionId: string = 'default'): void {
    try {
        const completedPayments = getCompletedPayments();
        const completedPayment: CompletedPayment = {
            ...payment,
            completedAt: new Date().toISOString(),
            sessionId,
        };

        completedPayments.push(completedPayment);

        // Keep only last 50 completed payments to prevent localStorage bloat
        if (completedPayments.length > 50) {
            completedPayments.splice(0, completedPayments.length - 50);
        }

        localStorage.setItem(COMPLETED_PAYMENTS_KEY, JSON.stringify(completedPayments));
    } catch (error) {
        console.error('Failed to save completed payment:', error);
    }
}

/**
 * Get all completed payments from localStorage
 */
function getCompletedPayments(): CompletedPayment[] {
    try {
        const stored = localStorage.getItem(COMPLETED_PAYMENTS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to get completed payments:', error);
        return [];
    }
}

/**
 * Save current cart state with payments and items to localStorage
 */
export function saveCartState(
    cartId: string,
    payments: overridePayment[],
    items?: ExtendedSaleItem[],
    refundItems?: ExtendedSaleItem[],
    customerId?: string | null,
    customerName?: string,
    customer?: any,
    terminalPaymentId?: string,
    terminalPaymentAmount?: number,
): void {
    try {
        const cartState: CartState = {
            cartId,
            payments: [...payments],
            items: items ? [...items] : [],
            refundItems: refundItems ? [...refundItems] : [],
            customerId,
            customerName,
            customer,
            timestamp: new Date().toISOString(),
            terminalPaymentId,
            terminalPaymentAmount,
        };

        localStorage.setItem(CART_STATE_KEY, JSON.stringify(cartState));
    } catch (error) {
        console.error('Failed to save cart state:', error);
    }
}

/**
 * Get saved cart state from localStorage
 */
export function getCartState(): CartState | null {
    try {
        const stored = localStorage.getItem(CART_STATE_KEY);
        if (!stored) return null;

        const parsed = JSON.parse(stored);

        // Ensure all required properties exist with default values
        return {
            cartId: parsed.cartId || '',
            payments: Array.isArray(parsed.payments) ? parsed.payments : [],
            items: Array.isArray(parsed.items) ? parsed.items : [],
            refundItems: Array.isArray(parsed.refundItems) ? parsed.refundItems : [],
            customerId: parsed.customerId || null,
            customerName: parsed.customerName || '',
            customer: parsed.customer || null,
            timestamp: parsed.timestamp || new Date().toISOString(),
            terminalPaymentId: parsed.terminalPaymentId || undefined,
            terminalPaymentAmount: parsed.terminalPaymentAmount || undefined,
        };
    } catch (error) {
        console.error('Failed to get cart state:', error);
        return null;
    }
}

/**
 * Check if a payment can be removed based on completion status
 */
export function canRemovePayment(payment: overridePayment): { canRemove: boolean; reason?: string } {
    // Check if it's a completed mobile payment
    // SHOW AS SUCCESSED UNTIL WE GET CONFIRMATION ABOUT NEW MOBILE PAY FLOW
    // if (payment.paymentType === 'MOBILE_PAY' && payment.txStatus === 'SUCCEEDED') {
    //     return {
    //         canRemove: false,
    //         reason: t('POS.CannotRemoveCompletedMobilePayment'),
    //     };
    // }

    // Check if it's a completed card terminal payment (CARD_TERMINAL type during processing)
    if ((payment.paymentType as any) === 'CARD_TERMINAL' && payment.txStatus === 'SUCCEEDED') {
        return {
            canRemove: false,
            reason: t('POS.CannotRemoveCompletedCardTerminalPayment'),
        };
    }

    // Check if it's a completed card terminal payment (converted to CARD type with terminal info)
    if (payment.paymentType === 'CARD' && payment.txStatus === 'SUCCEEDED' && payment.paymentId) {
        return {
            canRemove: false,
            reason: t('POS.CannotRemoveCompletedCardTerminalPayment'),
        };
    }

    // Note: Card terminal payments are processed as 'CARD' type with terminalId/terminalRefId

    // Check against saved completed payments
    const completedPayments = getCompletedPayments();
    const isInCompletedPayments = completedPayments.some(
        (completed) =>
            completed.paymentType === payment.paymentType &&
            completed.amount === payment.amount &&
            completed.txStatus === 'SUCCEEDED' &&
            (completed.terminalId === payment.terminalId || completed.terminalRefId === payment.terminalRefId),
    );

    if (isInCompletedPayments) {
        return {
            canRemove: false,
            reason: t('POS.CannotRemoveCompletedPayment'),
        };
    }

    return { canRemove: true };
}

/*
 * Clear cart state
 */
export function clearCartState(): void {
    try {
        localStorage.removeItem(CART_STATE_KEY);
    } catch (error) {
        console.error('Failed to clear cart state:', error);
    }
}

/**
 * Mark a payment as completed and save to localStorage
 */
export function markPaymentAsCompleted(payment: overridePayment, sessionId: string = 'default'): void {
    if (payment.txStatus === 'SUCCEEDED') {
        saveCompletedPayment(payment, sessionId);
    }
}

/**
 * Clear completed payments (useful when sale is completed)
 */
export function clearCompletedPayments(): void {
    try {
        localStorage.removeItem(COMPLETED_PAYMENTS_KEY);
        localStorage.removeItem(CART_STATE_KEY);
    } catch (error) {
        console.error('Failed to clear completed payments:', error);
    }
}

/**
 * Check if cart should be cleared based on booking status and card terminal payments
 */
export function shouldClearCart(payments: overridePayment[], bookingStatus?: string): boolean {
    // Check if booking is NOT (pending || success)
    const bookingNotPendingOrSuccess =
        !bookingStatus || (bookingStatus !== 'PENDING' && bookingStatus !== 'SUCCESS' && bookingStatus !== 'SUCCEEDED');

    // Check if there are NO card terminal payments that are pending or success
    const hasCardTerminalPendingOrSuccess = payments.some((p) => {
        // Card terminal payments are stored as 'CARD' type with paymentId or terminalId
        const isCardTerminal = p.paymentType === 'CARD' && (p.paymentId || p.terminalId);
        return isCardTerminal && (p.txStatus === 'PENDING' || p.txStatus === 'SUCCEEDED');
    });

    return bookingNotPendingOrSuccess && !hasCardTerminalPendingOrSuccess;
}
