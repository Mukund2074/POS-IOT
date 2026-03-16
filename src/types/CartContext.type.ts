import { overridePayment } from '@/scenes/POS/UI/Sales-Page/Types/sales.types';
import {
    GetApiCustomers200CustomersItem,
    PostApiSaleBodyData,
    PostApiSaleBodyDataItemsItem,
    PostApiSaleBodyDataItemsItemDiscountsItemAmountType,
} from '@/shared/api/models';

// Extended type to include ordering and calculation fields
export interface ExtendedSaleItem extends PostApiSaleBodyDataItemsItem {
    addedAt?: number;
    subTotal?: number;
    taxAmount?: number;
    discountAmount?: number;
    discountPercentage?: number;
    netAmount?: number;
    uniqueId?: string;
    servId?: string;
    netQuantity?: number;
    alreadyCredit?: number;
    tax?: string[];
    discounts?: {
        percentage?: number;
        discountAmount?: number;
        amountType?: PostApiSaleBodyDataItemsItemDiscountsItemAmountType;
        amount?: number;
    }[];
}

export interface CartOverride extends PostApiSaleBodyData {
    customer?: GetApiCustomers200CustomersItem;
    saleId?: string;
    remainingCredit?: number;
    items: ExtendedSaleItem[];
    payment: overridePayment[];
    paidAmount?: number;
    existingPayments?: overridePayment[];
}

// Payment breakdown type matching backend schema
export type PaymentBreakdown = {
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

// Sales breakdown type matching backend schema
export type SalesBreakdown = {
    productSale: number;
    serviceSale: number;
    giftCardSale: number;
    cutCardSale: number;
    productSaleTaxable: number;
    productSaleNonTaxable: number;
    serviceSaleTaxable: number;
    serviceSaleNonTaxable: number;
    cashCredit: number;
    cardCredit: number;
    bankTransferCredit: number;
    mobilePayCredit: number;
};
