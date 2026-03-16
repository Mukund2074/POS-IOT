import moment from 'moment';
import { GetApiSalesDetailsId200 } from '@/shared/api/models';
import { CartOverride, ExtendedSaleItem } from '@/types/CartContext.type';
import { overridePayment } from '../Types/sales.types';

export class SalesHandler {
    async resaleItem({
        seletedSales,
        setCart,
        addItem,
        addRefundItem,
        id,
    }: {
        seletedSales: GetApiSalesDetailsId200;
        setCart: React.Dispatch<React.SetStateAction<CartOverride>>;
        addItem: (item: ExtendedSaleItem, index?: number) => void;
        addRefundItem: (item: ExtendedSaleItem, index?: number) => void;
        id?: string;
    }) {
        // Process each item and add it to the appropriate list
        seletedSales?.items?.forEach((item, index) => {
            if (
                item?.itemType !== 'PRODUCT' &&
                item?.itemType !== 'SERVICE' &&
                // dont return anything i fits edit sale
                !id
            ) {
                return;
            }

            const newItem = {
                productId: item?.productId,
                serviceId: item?.serviceId,
                itemName: item.itemName || '',
                itemType: item.itemType ?? 'PRODUCT',
                saleType: item.saleType ?? 'SALE',
                quantity: item.quantity ?? 1,
                amount: Number(item.amount) ?? 0,
                price: Number(item.price) ?? 0,
                taxAmount: Number(item.taxAmount) ?? 0,
                tax: item?.taxes?.map((tax) => tax?.TaxId).filter((id): id is string => !!id) || [],
                note: item.note || '',
                employeeId: item.employeeId ? Number(item.employeeId) : Number(localStorage.getItem('employee_id')),
                description: item.description || '',
                discountPercentage:
                    item.discounts?.[0]?.amountType === 'VARIABLE_PERCENTAGE' && item.amount
                        ? (Number(item.discountAmount) / (Number(item.amount) + Number(item.discountAmount))) * 100
                        : Number(item.discountAmount),
                // Convert discountAmount to percentage if it's VARIABLE_PERCENTAGE
                discountAmount: item.discountAmount ?? 0,
                discountType: item?.discounts?.[0]?.amountType || 'VARIABLE_PERCENTAGE',

                // Convert discount inside discounts array similarly
                discounts:
                    item.discounts?.map((discount) => {
                        const isPercentage = discount.amountType === 'VARIABLE_PERCENTAGE';
                        return {
                            discountAmount: Number(discount.amount) ?? 0,
                            amountType: discount.amountType || 'VARIABLE_PERCENTAGE',
                            amount: Number(discount.amount) ?? 0,
                            couponId: discount.couponId ?? null,
                            discountId: discount.discountId ?? null,
                            discountName: discount.discountName ?? '',
                            percentage:
                                isPercentage && item.amount
                                    ? (Number(discount.amount) / (Number(item.amount) + Number(item.discountAmount))) *
                                      100
                                    : (Number(discount.amount) ?? 0),
                        };
                    }) || [],
            };

            // Determine if it's a refund item based on amount or saleType
            if (newItem.amount < 0 || newItem.saleType === 'RETURN') {
                addRefundItem(newItem, index);
            } else {
                addItem(newItem, index);
            }
        });

        const paymentItems: overridePayment[] = [];
        let paidAmount = 0;
        let creditAmount = 0;
        // if id means its edit sales so payments need to be added
        if (id) {
            seletedSales?.transactions?.map((transaction) => {
                paymentItems.push({
                    amount: transaction?.amount ?? 0,
                    tenderAmount: transaction?.tenderAmount ?? 0,
                    paymentType: transaction?.paymentType ?? '',
                    change: transaction?.change ?? 0,
                    txStatus: transaction?.txStatus ?? '',
                    terminalId: transaction?.terminalId ?? '',
                    terminalRefId: transaction?.terminalRefId ?? '',
                    terminalStatus: transaction?.terminalStatus ?? '',
                    cardType: transaction?.cardType ?? '',
                    cardFourDigit: transaction?.cardFourDigit ?? '',
                    currency: transaction?.currency ?? 'DKK',
                    isAlreadyPaid: true,
                });
                transaction?.paymentType !== 'OUTSTANDING' &&
                    !transaction?.paymentType?.toLocaleLowerCase()?.includes('credit') &&
                    (paidAmount += transaction?.amount ?? 0);

                transaction?.paymentType?.toLocaleLowerCase()?.includes('credit') &&
                    (creditAmount += transaction?.amount ?? 0);
            });
        }

        // Update customer info and other cart details
        setCart((prevCart) => ({
            ...prevCart,
            customerId: seletedSales?.customerId || prevCart.customerId,
            customerName: seletedSales?.customerName || prevCart.customerName,
            salesNote: prevCart.salesNote || seletedSales?.salesNote || '',
            sellBy: Number(seletedSales?.sellBy) || Number(localStorage.getItem('employee_id')),
            salesDate: moment().format('YYYY-MM-DD HH:mm:ss'),
            saleId: id,
            payment: paymentItems,
            paidAmount: paidAmount - creditAmount,
            existingPayments: paymentItems,
        }));

        return true;
    }
}

export const handleSales = new SalesHandler();
