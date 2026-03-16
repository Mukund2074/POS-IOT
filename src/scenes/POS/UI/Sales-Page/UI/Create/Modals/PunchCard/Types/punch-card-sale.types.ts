export type SummaryItem = {
    serviceId: number;
    serviceName: string;
    cartQty: number;
    residueQty: number;
    amount: number; // unit price
    coveredByPunch: number; // qty covered by punches
    extraToPay: number; // qty NOT covered by punches
};

export type ErrorOrWarning = {
    serviceId: number | string;
    itemName: string;
    quantity: number;
    residueQty: number;
    message: string;
    extraQty?: number;
};

export type calculatedData = {
    summary: SummaryItem[];
    errors: ErrorOrWarning[];
    warnings: ErrorOrWarning[];
    succeededItems: SummaryItem[];
    failedItems: SummaryItem[];
    totals: {
        totalAmount: number;
        totalCoveredByPunch: number;
        totalRemaining: number;
    };
};
