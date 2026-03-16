import { CartOverride } from '@/types/CartContext.type';
import { CreditSaleFunctions, overridePayment, PaymentMethod } from '../../../../../Types/sales.types';

export interface PaymentTabProps {
    asCreditSale: boolean;
    onClose: () => void;
    cartOption: CartOverride;
    paymentAmount: string;
    setPaymentAmount: (value: string) => void;
    paymentMethods: PaymentMethod[];
    handlePaymentMethodClick: (method: PaymentMethod) => void;
    localPayments: overridePayment[];
    handleRemovePayment: (index: number) => void;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    changeAmount: number;
    handleComplete: () => void;
    getPaymentMethodIcon: (paymentType: string) => React.ReactNode;
    getPaymentMethodName: (paymentType: string) => string;
    isAnyPending?: boolean;
    timedOutPayments?: Set<string>;
    handleRefreshPaymentStatus?: (reference: string, paymentIndex: number) => Promise<void>;
    calculateTotalDiscount: () => number;
    asEditSale?: boolean;
    isCardTerminalProcessing?: boolean;
}

export interface SalesPaymentProps {
    open: boolean;
    onClose: () => void;
    onComplete: () => void;
    asCreditSale?: boolean;
    creditSale?: CreditSaleFunctions;
    asEditSale?: boolean;
}

type PunchCardService = {
    name: string;
    residue: number;
    original: number;
};

export type PunchCardServicesMap = Record<string, PunchCardService>;
