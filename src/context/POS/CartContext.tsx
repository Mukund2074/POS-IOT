import React, { createContext, useContext, useEffect, useState } from 'react';
import moment from 'moment';
import {
    PostApiSaleBodyData,
    PostApiSaleBodyDataItemsItem,
    PostApiSaleBodyDataPaymentItem,
} from '../../shared/api/models';
import { usePreviousSales } from '../../hooks/api/pos/sales';
import { calculateItemDiscount } from '@/utils/POS/Functions';
import { CartOverride, ExtendedSaleItem, PaymentBreakdown, SalesBreakdown } from '@/types/CartContext.type';
import { useSelector } from 'react-redux';
import { usePOS } from './POSContext';

const CartContext = createContext({} as any);

export const defaultCart: PostApiSaleBodyData = {
    customerId: null,
    customerName: '',
    subTotal: 0,
    totalTax: 0,
    netTotal: 0,
    tenderAmount: 0,
    change: 0,
    roundOff: 0,
    tips: 0,
    salesNote: '',
    salesType: 'SALES',
    sellBy: Number(localStorage.getItem('employee_id')),
    salesDiscounts: [],
    salesTaxes: [],
    salesDate: moment().format('YYYY-MM-DD HH:mm:ss'),
    items: [],
    payment: [],
};

export const CartProvider = ({ children }: React.PropsWithChildren) => {
    const [cart, setCart] = useState<CartOverride>(defaultCart);
    const [rawItems, setRawItems] = useState<ExtendedSaleItem[]>([]);
    const [rawRefundItems, setRawRefundItems] = useState<ExtendedSaleItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentBreakdown>({
        cashAmount: 0,
        cardAmount: 0,
        mobilePayAmount: 0,
        bankTransferAmount: 0,
        creditAmount: 0,
        otherAmount: 0,
        outstandingAmount: 0,
        paidOutstandingAmount: 0,
        giftCardAmount: 0,
        bonusAmount: 0,
    });
    const [salesBreakdown, setSalesBreakdown] = useState<SalesBreakdown>({
        productSale: 0,
        serviceSale: 0,
        giftCardSale: 0,
        cutCardSale: 0,
        productSaleTaxable: 0,
        productSaleNonTaxable: 0,
        serviceSaleTaxable: 0,
        serviceSaleNonTaxable: 0,
        cashCredit: 0,
        cardCredit: 0,
        bankTransferCredit: 0,
        mobilePayCredit: 0,
    });
    const { punchCardSettings, giftCardSettings, tax: taxList } = usePOS();

    const shouldRoundUp =
        useSelector((state: any) => state?.settings?.data)?.posSetting?.value?.cashDrawerPermissions?.roundingAmount
            ?.roundDiscount || false;

    const previousSalesQuery = usePreviousSales({
        customerId: cart.customerId ?? null,
        params: { showDeleted: false, limit: 10000 },
        enabled: !!cart.customerId,
    });

    // Add regular item with timestamp
    const addItem = (item: PostApiSaleBodyDataItemsItem, index?: number) => {
        const loggedInEmployeeId = Number(localStorage.getItem('employee_id'));
        const itemWithTimestamp: ExtendedSaleItem = {
            ...item,
            addedAt: index ? Number(new Date().getTime() + index) : Number(new Date().getTime()),
            subTotal: (item.price || 0) * (item.quantity || 1),
            employeeId: item.employeeId || loggedInEmployeeId, // Set logged-in employee as default if not provided
        };
        setRawItems((prev) => [...prev, itemWithTimestamp]);
    };

    // Add refund item with timestamp
    const addRefundItem = (item: PostApiSaleBodyDataItemsItem, index?: number) => {
        const loggedInEmployeeId = Number(localStorage.getItem('employee_id'));
        const itemWithTimestamp: ExtendedSaleItem = {
            ...item,
            addedAt: index ? Number(new Date().getTime() + index) : Number(new Date().getTime()),
            subTotal: (item.price || 0) * (item.quantity || 1),
            employeeId: item.employeeId || loggedInEmployeeId, // Set logged-in employee as default if not provided
        };
        setRawRefundItems((prev) => [...prev, itemWithTimestamp]);
    };

    // Remove regular item by index
    const removeItem = (index: number) => {
        setRawItems((prev) => prev.filter((_, i) => i !== index));
    };

    // Remove refund item by index
    const removeRefundItem = (index: number) => {
        setRawRefundItems((prev) => prev.filter((_, i) => i !== index));
    };

    // Update regular item by index
    const updateItem = (index: number, item: PostApiSaleBodyDataItemsItem) => {
        setRawItems((prev) => {
            const updated = [...prev];
            const existingItem = updated[index];

            if (!existingItem) {
                console.warn(`updateItem: No item found at index ${index}`);
                return prev;
            }

            updated[index] = {
                ...item,
                addedAt: existingItem.addedAt,
                subTotal: (item.price || 0) * (item.quantity || 1),
            };

            return updated;
        });
    };

    // Update refund item by index
    const updateRefundItem = (index: number, item: PostApiSaleBodyDataItemsItem) => {
        setRawRefundItems((prev) => {
            const updated = [...prev];
            const existingItem = updated[index];

            if (!existingItem) {
                console.warn(`updateRefundItem: No refund item found at index ${index}`);
                return prev;
            }

            updated[index] = {
                ...item,
                addedAt: existingItem.addedAt,
                subTotal: (item.price || 0) * (item.quantity || 1),
            };

            return updated;
        });
    };

    // Calculate payment breakdown
    const calculatePaymentBreakdown = (payments: PostApiSaleBodyDataPaymentItem[]): PaymentBreakdown => {
        const breakdown: PaymentBreakdown = {
            cashAmount: 0,
            cardAmount: 0,
            mobilePayAmount: 0,
            bankTransferAmount: 0,
            creditAmount: 0,
            otherAmount: 0,
            outstandingAmount: 0,
            paidOutstandingAmount: 0,
            giftCardAmount: 0,
            bonusAmount: 0,
        };

        payments.forEach((payment) => {
            const amount = payment.amount || 0;
            switch (payment.paymentType) {
                case 'CASH':
                    breakdown.cashAmount += amount;
                    break;
                case 'CARD':
                    breakdown.cardAmount += amount;
                    break;
                case 'MOBILE_PAY':
                    breakdown.mobilePayAmount += amount;
                    break;
                case 'BANK_TRANSFER':
                    breakdown.bankTransferAmount += amount;
                    break;
                case 'OUTSTANDING':
                    breakdown.outstandingAmount += amount;
                    break;
                case 'OTHER':
                default:
                    breakdown.otherAmount += amount;
                    break;
            }
        });

        return breakdown;
    };

    // Calculate sales breakdown
    const calculateSalesBreakdown = (items: ExtendedSaleItem[]): SalesBreakdown => {
        const breakdown: SalesBreakdown = {
            productSale: 0,
            serviceSale: 0,
            giftCardSale: 0,
            cutCardSale: 0,
            productSaleTaxable: 0,
            productSaleNonTaxable: 0,
            serviceSaleTaxable: 0,
            serviceSaleNonTaxable: 0,
            cashCredit: 0,
            cardCredit: 0,
            bankTransferCredit: 0,
            mobilePayCredit: 0,
        };

        items.forEach((item) => {
            const netAmount = item.amount || 0;
            const isRefund = (item.amount || 0) < 0;
            const hasTaxes = (item.taxes || []).length > 0;

            if (item.productId) {
                // Product item
                if (isRefund) {
                    breakdown.productSale += netAmount;
                } else {
                    breakdown.productSale += netAmount;
                    if (hasTaxes) {
                        breakdown.productSaleTaxable += netAmount;
                    } else {
                        breakdown.productSaleNonTaxable += netAmount;
                    }
                }
            } else if (item.serviceId) {
                // Service item
                if (isRefund) {
                    breakdown.serviceSale += netAmount;
                } else {
                    breakdown.serviceSale += netAmount;
                    if (hasTaxes) {
                        breakdown.serviceSaleTaxable += netAmount;
                    } else {
                        breakdown.serviceSaleNonTaxable += netAmount;
                    }
                }
            }
        });

        return breakdown;
    };

    // Add payment method
    const addPayment = (payment: Omit<PostApiSaleBodyDataPaymentItem, 'paymentId'>) => {
        // Calculate remaining amount
        const currentPaidAmount = cart.payment.reduce((sum, p) => sum + (p.amount || 0), 0);
        const remainingAmount = cart.netTotal - currentPaidAmount;

        // Don't allow payment to exceed remaining amount
        if ((payment.amount || 0) > remainingAmount) {
            return;
        }

        setCart((prev) => {
            const newPayment = {
                ...payment,
                paymentId: null,
                // Preserve the original amount
                amount: payment.amount,
                tenderAmount: payment.amount,
            };

            const newCart = {
                ...prev,
                payment: [...prev.payment, newPayment],
            };
            return newCart;
        });
    };

    // Remove payment by index
    const removePayment = (index: number) => {
        setCart((prev) => ({
            ...prev,
            payment: prev.payment.filter((_, i) => i !== index),
        }));
    };

    // Update payment by index
    const updatePayment = (index: number, payment: PostApiSaleBodyDataPaymentItem) => {
        setCart((prev) => ({
            ...prev,
            payment: prev.payment.map((p, i) => (i === index ? { ...payment } : p)),
        }));
    };

    // Clear all payments
    const clearPayments = () => {
        setCart((prev) => ({
            ...prev,
            payment: [],
        }));
    };

    // Set multiple payments at once (for payment modal)
    const setPayments = (payments: PostApiSaleBodyDataPaymentItem[]) => {
        setCart((prev) => {
            const newCart = {
                ...prev,
                payment: payments,
            };
            return newCart;
        });
    };

    // Clear entire cart including refund items
    const clearCart = () => {
        setCart(defaultCart);
        setRawItems([]);
        setRawRefundItems([]);
    };

    // Clear only refund items
    const clearRefundItems = () => {
        setRawRefundItems([]);
    };

    // Get item or all items (regular items)
    const getItem = (index: number, all = false) => {
        if (all) return rawItems;
        return rawItems[index];
    };

    // Get refund item or all refund items
    const getRefundItem = (index: number, all = false) => {
        if (all) return rawRefundItems;
        return rawRefundItems[index];
    };

    // Get all items combined (regular + refund)
    const getAllItems = () => {
        const allItems = [...rawItems, ...rawRefundItems];
        return allItems.sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
    };

    const calculateItemTaxes = (item: ExtendedSaleItem) => {
        if (!item || !item?.subTotal) return [];

        const taxes = [];

        // add punch card taxes
        if (punchCardSettings && item?.itemType === 'CUT_CARD') {
            const punchCardTaxes = punchCardSettings.data?.taxIds?.map((taxId) => {
                const tax = taxList.data?.find((tax) => tax.id === taxId);
                let taxAmount = 0;

                if (tax?.taxType === 'PERCENTAGE') {
                    taxAmount = ((item?.price || 0) * tax?.taxRate) / 100;
                } else if (tax?.taxType === 'AMOUNT') {
                    taxAmount = tax?.taxRate || 0;
                }
                return {
                    taxId: tax?.id,
                    taxName: tax?.taxName,
                    taxRate: tax?.taxRate,
                    taxAmount: parseFloat(taxAmount?.toFixed(2)) * (item.quantity || 1),
                    includeTaxInItemPrice: tax?.includeTaxInItemPrice,
                    isInclusive: tax?.includeTaxInItemPrice,
                };
            });
            taxes.push(...(punchCardTaxes || []));
        }

        // add gift card taxes
        if (giftCardSettings && item?.itemType === 'GIFT_CARD') {
            const giftCardTaxes = giftCardSettings.data?.taxIds?.map((taxId) => {
                const tax = taxList.data?.find((tax) => tax.id === taxId);
                let taxAmount = 0;

                if (tax?.taxType === 'PERCENTAGE') {
                    taxAmount = ((item?.price || 0) * tax?.taxRate) / 100;
                } else if (tax?.taxType === 'AMOUNT') {
                    taxAmount = tax?.taxRate || 0;
                }
                return {
                    taxId: tax?.id,
                    taxName: tax?.taxName,
                    taxRate: tax?.taxRate,
                    taxAmount: parseFloat(taxAmount?.toFixed(2)) * (item.quantity || 1),
                    includeTaxInItemPrice: tax?.includeTaxInItemPrice,
                    isInclusive: tax?.includeTaxInItemPrice,
                };
            });
            taxes.push(...(giftCardTaxes || []));
        }

        // Add 25% inclusive VAT for service items
        if (item.itemType === 'SERVICE') {
            const vatRate = 25;
            const vatAmount = ((item?.price || 0) * vatRate) / 100;

            const TaxVAT = taxList.data?.[0] ?? null;
            if (TaxVAT) {
                taxes.push({
                    taxId: TaxVAT?.id,
                    taxName: TaxVAT?.taxName,
                    taxRate: vatRate,
                    taxAmount: parseFloat(vatAmount?.toFixed(2)) * (item.quantity || 1),
                    includeTaxInItemPrice: true,
                    isInclusive: true,
                });
            }
        }

        // Add other taxes from taxList if available
        if (taxList?.data?.length) {
            const otherTaxes = taxList.data
                ?.filter(
                    (tax) => tax?.isActive && tax?.applyTaxTo === 'ALL_ITEMS_SERVICES' && item?.tax?.includes(tax?.id),
                )
                .map((tax) => {
                    let taxAmount = 0;

                    if (tax?.taxType === 'PERCENTAGE') {
                        taxAmount = ((item?.price || 0) * tax?.taxRate) / 100;
                    } else if (tax.taxType === 'AMOUNT') {
                        taxAmount = tax?.taxRate;
                    }

                    return {
                        taxId: tax.id,
                        taxName: tax?.taxName,
                        taxRate: tax?.taxRate,
                        taxAmount: parseFloat(taxAmount?.toFixed(2)) * (item.quantity || 1),
                        includeTaxInItemPrice: tax?.includeTaxInItemPrice,
                        isInclusive: tax?.includeTaxInItemPrice,
                    };
                });

            taxes.push(...otherTaxes);
        }

        return taxes;
    };

    // Recalculate cart totals with proper backend-compatible calculations
    const calculateCart = async () => {
        // Process regular items with basic calculations
        const processedRegularItems = rawItems.map((item, index) => {
            const subTotal = (item.price || 0) * (item.quantity || 1);

            let discountAmount = calculateItemDiscount(item);

            const taxes = calculateItemTaxes(item);
            const taxAmount = taxes.reduce((acc, tax) => acc + (tax.taxAmount || 0), 0);

            // calculate amount
            let amount = subTotal - discountAmount;

            // ✅ rounding logic
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
                    // Backend bug workaround
                    amount: item.discountType === 'VARIABLE_PERCENTAGE' ? discountAmount : item.discountAmount,
                };

                discounts.push(discountObj);
            }

            const finalItem = {
                ...item,
                subTotal,
                discountAmount,
                amount: amount, // Simple calculation without tax
                discounts, // Include discount objects
                taxes: taxes,
                taxAmount: taxAmount,
            };

            return finalItem;
        });

        // Process refund items with basic calculations
        const processedRefundItems = rawRefundItems.map((item) => {
            const subTotal = (item.price || 0) * (item.quantity || 1); // Refund subtotal should be negative
            let discountAmount = calculateItemDiscount(item);

            const taxes = calculateItemTaxes(item);
            const taxAmount = taxes.reduce((acc, tax) => acc + (tax.taxAmount || 0), 0);

            // calculate amount
            let amount = subTotal - discountAmount;

            // ✅ rounding logic
            if (shouldRoundUp && item.discountType === 'VARIABLE_PERCENTAGE') {
                amount = Math.round(amount * 2) / 2;
                discountAmount = Math.round(discountAmount * 2) / 2;
            }

            // Create discount object if discount exists
            const discounts = [];
            if (item.discountAmount && item.discountAmount > 0) {
                discounts.push({
                    discountId: null,
                    couponId: null,
                    discountName: `${item.discountType === 'VARIABLE_PERCENTAGE' ? 'Percentage' : 'Amount'} Discount`,
                    discountAmount: discountAmount, // ✅ always positive
                    amountType: item.discountType || 'VARIABLE_PERCENTAGE',
                    amount: discountAmount, // ✅ FIXED: no negatives
                });
            }

            return {
                ...item,
                taxes,
                taxAmount,
                subTotal,
                discountAmount,
                // For refunds: if subTotal is negative, discount makes it less negative
                amount: (() => {
                    let baseAmount = subTotal < 0 ? subTotal + discountAmount : subTotal - discountAmount;
                    return shouldRoundUp ? Math.round(baseAmount * 2) / 2 : baseAmount;
                })(),
                discounts,
            };
        });

        // Combine all items and sort by timestamp to maintain chronological order
        const allProcessedItems = [...processedRegularItems, ...processedRefundItems]
            .sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0))
            .map(({ addedAt, ...item }) => item); // Remove addedAt from final items

        const subTotal = allProcessedItems.reduce((acc, item) => acc + (item.subTotal || 0), 0);
        const totalDiscounts = allProcessedItems.reduce((acc, item) => acc + (item.discountAmount || 0), 0);
        const netTotal = subTotal - totalDiscounts + (cart.roundOff || 0) + (cart.tips || 0) - (cart.paidAmount || 0);

        const newPaymentBreakdown = calculatePaymentBreakdown(cart.payment || []);
        const newSalesBreakdown = calculateSalesBreakdown(allProcessedItems);
        const totalTax = allProcessedItems.reduce((acc, item) => acc + (item.taxAmount || 0), 0);

        setPaymentBreakdown(newPaymentBreakdown);
        setSalesBreakdown(newSalesBreakdown);

        setCart((prev) => ({
            ...prev,
            items: allProcessedItems, // Combined items in chronological order
            salesDiscounts: [], // Clear salesDiscounts - will be calculated only for API call
            salesTaxes: [], // Clear salesTaxes - will be calculated only for API call
            totalTax: totalTax,
            subTotal,
            netTotal,
            totalDiscount: calculateTotalDiscount(),
            salesType: netTotal < 0 ? 'RETURN' : 'SALES',
        }));
    };

    // Recalculate when rawItems or rawRefundItems changes
    useEffect(() => {
        calculateCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        rawItems,
        rawRefundItems,
        cart.roundOff,
        cart.tips,
        taxList.data,
        punchCardSettings.data,
        giftCardSettings.data,
    ]);

    // Calculate salesDiscounts array from item discounts (for backend validation)
    const calculateSalesDiscounts = () => {
        const totalItems = [...rawItems, ...rawRefundItems];
        const itemDiscounts = totalItems
            .filter((item) => item.discounts && item.discounts.length > 0)
            .flatMap((item) => item.discounts || []);

        return itemDiscounts;
    };

    // remove extra keys words from items and remove refund-product- or product-refund- from the id
    const removeExtraKeysFromItems = (id: string) => {
        if (id?.trim() === '' || id === null) return null;
        if (id.includes('refund')) {
            const result = id.replace(/^(refund-product-|product-refund-)/, '');
            return result;
        } else if (id.includes('refund-service-')) {
            const result = id.replace(/^(refund-service-)/, '');
            return result;
        } else if (id.startsWith('product-')) {
            const result = id.replace(/^product-/, '');
            return result;
        } else if (id.startsWith('service-')) {
            const result = id.replace(/^service-/, '');
            return result;
        } else if (id.startsWith('custom')) {
            const result = null;
            return result;
        }

        return id;
    };

    const calculateTotalDiscount = () => {
        return cart.items.reduce((acc, item) => acc + (item.discountAmount || 0), 0);
    };

    // calculate tender & change for payment summary modal
    const calculateTenderAndChange = () => {
        const tenderAmount = cart?.payment?.reduce((acc, payment) => acc + (payment?.amount ?? 0), 0) ?? 0;
        const change = Math.max(0, tenderAmount - cart.netTotal);
        return { tenderAmount, change };
    };

    const calculateSalesTaxes = () => {
        // const taxAmount = taxes.reduce((acc, tax) => acc + (tax.taxAmount || 0), 0);
        // apply tax to all items
        const newItems = cart.items.map((item) => {
            return {
                ...item,
                taxes: calculateItemTaxes(item),
                taxAmount: calculateItemTaxes(item).reduce((acc, tax) => acc + (tax.taxAmount || 0), 0),
            };
        });

        const newCart = {
            ...cart,
            items: newItems,
        };

        setCart(newCart);

        const salesTaxes = newCart.items.flatMap((item) => item.taxes || []).filter((tax) => (tax?.taxAmount || 0) > 0);
        return salesTaxes;
    };

    // Get cart data ready for API submission with calculated salesDiscounts
    const getCartForSubmission = () => {
        const updatedItems = cart.items.map((item: ExtendedSaleItem) => {
            const cleanProductId = removeExtraKeysFromItems(item?.productId?.toString() || '');
            const cleanServiceId = removeExtraKeysFromItems(item?.serviceId?.toString() || '');

            const { servId, productId, serviceId, uniqueId, ...rest } = item;
            return {
                ...rest,
                amount: item?.amount,
                // amount: item?.amount,
                subTotal: item?.subTotal || 0,
                // subTotal: item?.subTotal,
                // price: item?.price,
                productId: cleanProductId,
                serviceId: typeof serviceId === 'number' ? serviceId : cleanServiceId,
            };
        });
        const { tenderAmount, change } = calculateTenderAndChange();
        // remove customer object from cart
        const { customer, ...rest } = cart;

        const finalCart = {
            ...rest,
            items: updatedItems,
            salesDate: new Date(moment(cart.salesDate).format('YYYY-MM-DD HH:mm:ss')),
            salesDiscounts: calculateSalesDiscounts(),
            totalDiscount: calculateTotalDiscount(),
            salesTaxes: calculateSalesTaxes(),
            totalTax: cart.totalTax,
            // payment: cart.payment,
            // subTotal: cart.subTotal,
            netTotal: cart?.saleId ? (cart?.paidAmount || 0) + cart.netTotal : cart.netTotal,
            tenderAmount: cart?.saleId ? (cart?.paidAmount || 0) + tenderAmount : tenderAmount,
            subTotal: cart.subTotal,
            change: cart.salesType === 'RETURN' ? 0 : change,
            salesType: cart.salesType || 'SALES',
        };

        return finalCart;
    };

    useEffect(() => {
        // console.log('rowitems', rawItems);
        // console.log('refunditems', rawRefundItems);
        // console.log('cart', cart);
    }, [cart]);

    return (
        <CartContext.Provider
            value={{
                cart,
                setCart,
                loading,
                setLoading,
                // Regular item methods
                addItem,
                removeItem,
                updateItem,
                getItem,
                // Refund item methods
                addRefundItem,
                removeRefundItem,
                updateRefundItem,
                getRefundItem,
                clearRefundItems,
                // Combined methods
                getAllItems,
                // Payment methods
                addPayment,
                removePayment,
                updatePayment,
                clearPayments,
                setPayments,
                clearCart,
                // Calculation methods
                getCartForSubmission,
                // Breakdown data
                paymentBreakdown,
                salesBreakdown,
                // Separate arrays for UI access (removing addedAt for external use)
                regularItems: rawItems.map(({ addedAt, uniqueId, ...item }) => ({ ...item, uniqueId })),
                refundItems: rawRefundItems.map(({ addedAt, uniqueId, ...item }) => ({ ...item, uniqueId })),
                previousSalesQuery,
                calculateTotalDiscount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

// Hook to access cart context
export const useCart = () => useContext(CartContext);
