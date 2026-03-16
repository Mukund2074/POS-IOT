import { PostApiSaleBodyDataItemsItem } from '@/shared/api/models';

export const getDiscountedPrice = (item: PostApiSaleBodyDataItemsItem): number => {
    // Always work with absolute price for discount calculations
    const basePrice = Math.abs(item.price || 0);
    const discountAmount = item.discountAmount ?? 0;

    if (item.discountType === 'VARIABLE_PERCENTAGE') {
        const discountValue = (basePrice * discountAmount) / 100;
        const finalPrice = basePrice - discountValue;
        return finalPrice;
    }

    return basePrice - discountAmount;
};
