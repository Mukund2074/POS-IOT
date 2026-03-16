import { POSAutocompleteOption } from '@/components/POS/Common/POSAutocomplete';
import { GetApiCustomers200CustomersItemGiftCardsItem, PostApiSaleBodyDataPaymentItem } from '@/shared/api/models';
import { CartOverride } from '@/types/CartContext.type';

export type CustomerListingSchema = {
    id: number;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
};

export type EmployeeListingSchema = {
    id: number;
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
};

export type CustomerListingSchemaParams = {
    search: string;
    offset: number;
    limit: number;
    employees: string;
    sort_by: string;
    sort: string;
};

export interface FormValues {
    amount: number;
    selectedService: POSAutocompleteOption | null;
    createOwnCode: boolean;
    customCode: string;
    addRecipientName: boolean;
    recipientName: string;
    codeError: string;
}

export interface GiftCard {
    id?: string;
    code: string;
    residueValue: number;
    expiresDate: string;
    isActive: boolean;
    applicableServiceIds?: string[];
}

export interface ApplyGiftCardProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (giftCardId: string, amount: number) => void;
    predefinedAmount?: number;
    activeGiftCards: GetApiCustomers200CustomersItemGiftCardsItem[];
    setActiveGiftCards: React.Dispatch<React.SetStateAction<GetApiCustomers200CustomersItemGiftCardsItem[]>>;
    localPayments: PostApiSaleBodyDataPaymentItem[];
}

export interface UseGiftCardConfirmProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (giftCardId: string, amount: number) => void;
    predefinedAmount?: number;
    amountComparison: {
        giftCardAmount: number;
        requiredAmount: number;
        residueValue: number;
    } | null;
    pendingGiftCard: GiftCard | null;
    setPendingGiftCard: React.Dispatch<React.SetStateAction<GiftCard | null>>;
    setAmountComparison: React.Dispatch<
        React.SetStateAction<{
            giftCardAmount: number;
            requiredAmount: number;
            residueValue: number;
        } | null>
    >;
    setActiveGiftCards: React.Dispatch<React.SetStateAction<GetApiCustomers200CustomersItemGiftCardsItem[]>>;
}

export interface PaymentMethod {
    id: string;
    name: string;
    icon: React.ReactNode;
    type:
        | 'CASH'
        | 'CARD'
        | 'GIFT_CARD'
        | 'BANK_TRANSFER'
        | 'MOBILE_PAY'
        | 'CUT_CARD'
        | 'OUTSTANDING'
        | 'BONUS'
        | 'CARD_TERMINAL';
}

export interface CreditSaleFunctions {
    addPayment: (payment: Omit<PostApiSaleBodyDataPaymentItem, 'paymentId'>) => void;
    removePayment: (index: number) => void;
    clearPayments: () => void;
    setPayments: (payments: PostApiSaleBodyDataPaymentItem[]) => void;
    cart: CartOverride;
    setCartOption: (cart: CartOverride) => void;
}

export interface RefundItemsTabProps {
    cartOption: CartOverride;
    setCartOption: (cart: CartOverride) => void;
    setSelectedTab: (tab: 'payment' | 'refund') => void;
}

export interface RefundFormValues {
    refundQuantities: Record<string, number>;
}

export interface overridePayment extends PostApiSaleBodyDataPaymentItem {
    reference?: string;
    punchCardId?: string;
    isAlreadyPaid?: boolean;
}

export type orderSummaryType = {
    total: number;
    paidAmount: number;
    discount: number;
    tax: number;
    netTotal: number;
};
