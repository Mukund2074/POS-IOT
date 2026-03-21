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

/** 15-minute slots for vote modal (same shape as legacy booking utils). */
export function generateTimeSlots(): string[] {
    const slots: string[] = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 15) {
            const start = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            let endH = h;
            let endM = m + 15;
            if (endM >= 60) {
                endH += 1;
                endM -= 60;
            }
            const end =
                endH >= 24
                    ? `00:${String(endM).padStart(2, '0')}`
                    : `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
            slots.push(`${start} - ${end}`);
        }
    }
    return slots;
}
