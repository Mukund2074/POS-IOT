import { CashDrawerData } from '../Types/cash-drawer.types';

export class CashDrawerUtils {
    // constructor salesData
    constructor(public cashDrawerData: CashDrawerData) {
        this.cashDrawerData = cashDrawerData;
    }

    // methods 1 : update cash drawer data
    updateCashDrawerData(data: CashDrawerData) {
        this.cashDrawerData = data;
    }

    // #method 2 : get list by payment type
    getListByPaymentType(paymentType: string) {
        if (!this.cashDrawerData.detailedPaymentBreakdown) {
            return [];
        }

        // Find the object that contains the payment type
        const paymentTypeData = this.cashDrawerData.detailedPaymentBreakdown.find(
            (item: any) => item[paymentType] !== undefined,
        );

        // Return the array for that payment type, or empty array if not found
        return paymentTypeData ? paymentTypeData[paymentType] : [];
    }
}
