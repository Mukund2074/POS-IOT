import { PostApiSaleBodyDataPaymentItemPaymentType } from '@/shared/api/models';
import { overridePayment } from '@/scenes/POS/UI/Sales-Page/Types/sales.types';

/**
 * Helper function to create payment objects with defaults
 */
export const createPaymentObject = (
    amount: number,
    paymentType: PostApiSaleBodyDataPaymentItemPaymentType,
    overrides?: Partial<overridePayment>,
): overridePayment => {
    return {
        paymentId: null,
        amount: amount,
        tenderAmount: overrides?.tenderAmount ?? amount,
        change: 0,
        txStatus: 'SUCCEEDED',
        terminalId: null,
        terminalRefId: null,
        terminalStatus: null,
        cardType: null,
        cardFourDigit: null,
        paymentType: paymentType,
        ...overrides, // Allow overriding any field
    };
};

/**
 * Helper function to get payment method name by type
 * Returns the translation key - caller should use t() to translate
 */
export const getPaymentMethodName = (paymentType: string, payment?: overridePayment): string => {
    // Check if it's a card terminal payment (converted from CARD_TERMINAL to CARD with terminal info)
    if (paymentType === 'CARD' && payment && payment.paymentId) {
        return 'POS.CardTerminal';
    }

    const methodMap: Record<string, string> = {
        CARD: 'POS.Cards',
        CARD_TERMINAL: 'POS.CardTerminal',
        CASH: 'POS.Cash',
        MOBILE_PAY: 'POS.MobilePay',
        BANK_TRANSFER: 'POS.BankTransfer',
        OUTSTANDING: 'POS.Outstanding',
        GIFT_CARD: 'POS.GiftCard',
        ECOMMERCE: 'POS.Ecommerce',
        CUT_CARD: 'POS.CutCard',
    };
    return methodMap[paymentType] || paymentType;
};
