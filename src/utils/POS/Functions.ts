import { ExtendedSaleItem } from '@/types/CartContext.type';

export const CountryCodeGetter = ({ code = '+91' }: { code?: string }) => {
    const countryCode = code?.replace('+', '');
    if (code) {
        return Number(countryCode);
    } else {
        return 91;
    }
};

export const formatMobileNumber = (number: string) => {
    if (number != '') {
        return number?.replace(/(\d{2})(?=\d)/g, '$1 ');
    } else {
        return '';
    }
};

// Calculate item discount amount based on discount type
export const calculateItemDiscount = (item: ExtendedSaleItem): number => {
    const baseAmount = Math.abs((item.price || 0) * (item.quantity || 1));
    const discountAmount = item.discountAmount || 0;
    const discountPercentage = item.discountPercentage || 0;

    if (item.discountType === 'VARIABLE_PERCENTAGE') {
        const calculatedDiscount = (baseAmount * discountPercentage) / 100;
        return calculatedDiscount;
    } else if (item.discountType === 'VARIABLE_AMOUNT') {
        return Math.min(discountAmount, baseAmount);
    }

    return 0;
};

export const processedRegularItems = (item: ExtendedSaleItem, shouldRoundUp?: boolean) => {
    const subTotal = (item.price || 0) * (item.quantity || 1);
    let discountAmount = calculateItemDiscount(item);
    // calculate amount
    let amount = subTotal - discountAmount;

    // ✅ rounding logic as per your instruction
    if (shouldRoundUp && item.discountType === 'VARIABLE_PERCENTAGE') {
        amount = Math.round(amount * 2) / 2; // rounds to nearest 0, .5, or 1
        discountAmount = Math.round(discountAmount * 2) / 2;
    }
    // Create discount object if discount exists
    const discounts = [];
    if (item.discountAmount && item.discountAmount > 0) {
        const discountObj = {
            discountId: null,
            couponId: null,
            discountName: `${item.discountType === 'VARIABLE_PERCENTAGE' ? 'Percentage' : 'Amount'} Discount`,
            discountAmount: discountAmount, // Calculated discount amount (e.g., 30)
            amountType: item.discountType || 'VARIABLE_PERCENTAGE',
            percentage: item.discountType === 'VARIABLE_PERCENTAGE' ? item.discountPercentage : 0,
            amount: item.discountType === 'VARIABLE_PERCENTAGE' ? amount : item.discountAmount,
        };

        discounts.push(discountObj);
    } else {
        discounts.push({
            discountId: null,
            couponId: null,
            discountName: `${item.discountType === 'VARIABLE_PERCENTAGE' ? 'Percentage' : 'Amount'} Discount`,
            discountAmount: discountAmount, // Calculated discount amount (e.g., 30)
            amountType: item.discountType || 'VARIABLE_PERCENTAGE',
            percentage: item.discountType === 'VARIABLE_PERCENTAGE' ? item.discountPercentage : 0,
            amount: item.discountType === 'VARIABLE_PERCENTAGE' ? discountAmount : item.discountAmount,
        });
    }

    return {
        ...item,
        subTotal,
        discountAmount,
        amount,
        discounts, // Include discount objects
    };
};
