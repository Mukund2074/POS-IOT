import { Stack } from '@mui/material';
import { t } from 'i18next';
import POSHeading from '@/components/POS/Common/POSHeading';
import { ChevronRight } from '@mui/icons-material';
import React, { useState } from 'react';
import RefundModal from '../Create/Modals/RefundModal';
import {
    GetApiPreviousSalesItemsCustomerId200,
    PostApiSaleBodyData,
    PostApiSaleBodyDataItemsItemDiscountType,
    PostApiSaleBodyDataItemsItemItemType,
    PostApiSaleBodyDataItemsItemSaleType,
} from '@/shared/api/models';
import { useCart } from '@/context/POS/CartContext';
import { UseQueryResult } from '@tanstack/react-query';
import { ExtendedSaleItem } from '@/types/CartContext.type';

export default function PreviousSales({
    handleComponentChange,
    asRefund,
    search,
}: {
    handleComponentChange: (component: number) => void;
    asRefund?: boolean;
    search?: string;
}) {
    const {
        cart,
        addItem,
        addRefundItem,
        previousSalesQuery,
        regularItems,
        refundItems,
        updateItem,
        updateRefundItem,
    } = useCart() as {
        cart: PostApiSaleBodyData;
        addItem: (item: ExtendedSaleItem) => void;
        addRefundItem: (item: ExtendedSaleItem) => void;
        previousSalesQuery: UseQueryResult<GetApiPreviousSalesItemsCustomerId200, Error>;
        regularItems: ExtendedSaleItem[];
        refundItems: ExtendedSaleItem[];
        updateItem: (index: number, item: ExtendedSaleItem) => void;
        updateRefundItem: (index: number, item: ExtendedSaleItem) => void;
    };

    const { data: previousSales } = previousSalesQuery;
    const [refundModalOpen, setRefundModalOpen] = useState(false);

    return (
        <Stack sx={{ height: '100%', overflow: 'hidden', overflowY: 'scroll', scrollbarWidth: 'thin' }}>
            <Stack
                sx={{
                    cursor: 'pointer',
                    p: 2,
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #d9d9d9',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 1,
                    width: '100%',
                }}
                onClick={() => {
                    handleComponentChange(1);
                }}
            >
                <POSHeading
                    text={t('POS.GoBack')}
                    sx={{
                        fontSize: 14,
                        fontWeight: 600,
                        width: '100%',
                    }}
                />
                <ChevronRight sx={{ transform: 'rotate(180deg)' }} />
            </Stack>

            {previousSales?.items && previousSales?.items?.length === 0 && (
                <Stack sx={{ p: 2 }}>
                    <POSHeading text={t('POS.PrevSaleNoData')} />
                </Stack>
            )}
            {previousSales?.items &&
                previousSales?.items?.length > 0 &&
                previousSales?.items
                    .filter(
                        (sale) =>
                            !search ||
                            search.length <= 1 ||
                            sale.itemName?.toLowerCase().includes(search.toLowerCase()),
                    )
                    .map((sale, index) => {
                        // Create unique IDs for regular vs refund to avoid conflict
                        let id: string | number | undefined;

                        if (asRefund) {
                            if (sale?.serviceId) {
                                id = `refund-${sale?.serviceId}`;
                            } else if (sale?.productId) {
                                id = `refund-${sale?.productId}`;
                            }
                        } else {
                            if (sale?.serviceId) {
                                id = sale?.serviceId;
                            } else if (sale?.productId) {
                                id = sale?.productId;
                            }
                        }
                        // Get the appropriate items array based on mode
                        const currentItems = asRefund ? refundItems : regularItems;

                        // Find existing item in the correct array
                        const existingItem = currentItems.find((item) => item.uniqueId === sale.id);

                        return (
                            <Stack
                                key={`${asRefund ? 'refund' : 'regular'}-${sale.id}`}
                                onClick={() => {
                                    // Get the original sale price (use sale.price as the base price, not sale.amount)
                                    const originalPrice = Number(sale.price) || 0;
                                    const originalAmount = Number(sale.amount) || 0;

                                    if (existingItem) {
                                        // Item already exists, increment quantity
                                        const itemIndex = currentItems.indexOf(existingItem);
                                        const updatedItem = {
                                            ...existingItem,
                                            uniqueId: sale.id,
                                            quantity: existingItem.quantity + 1,
                                        };

                                        if (asRefund) {
                                            updateRefundItem(itemIndex, updatedItem);
                                        } else {
                                            updateItem(itemIndex, updatedItem);
                                        }
                                    } else {
                                        // Create new item
                                        const saleItem = {
                                            productId: !sale.serviceId ? String(id) : '',
                                            serviceId: sale.serviceId,
                                            servId: String(id),
                                            uniqueId: sale.id,
                                            quantity: 1,
                                            // For refunds: make both price and amount negative
                                            amount: asRefund ? -Math.abs(originalAmount) : originalAmount,
                                            price: asRefund ? -Math.abs(originalPrice) : originalPrice,
                                            itemName: sale.itemName || 'Unknown Item',
                                            discountAmount: 0,
                                            discountType: PostApiSaleBodyDataItemsItemDiscountType.VARIABLE_PERCENTAGE,
                                            discounts: [],
                                            saleType: PostApiSaleBodyDataItemsItemSaleType.SALE,
                                            itemType: PostApiSaleBodyDataItemsItemItemType.PRODUCT,
                                            employeeId: Number(cart.sellBy),
                                        };

                                        if (asRefund) {
                                            addRefundItem(saleItem);
                                        } else {
                                            addItem(saleItem);
                                        }
                                    }
                                }}
                                sx={{
                                    cursor: 'pointer',
                                    p: 1,
                                    '&:hover': { backgroundColor: asRefund ? '#ffe6e6' : '#f0f0f099' },
                                    bgcolor: existingItem ? (asRefund ? '#ffe6e6' : '#f0f0f099') : 'transparent',
                                    borderLeft: existingItem
                                        ? asRefund
                                            ? '4px solid #ff0000'
                                            : '4px solid #000'
                                        : 'none',
                                    borderBottom: '1px solid #d9d9d9',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    gap: 1,
                                }}
                            >
                                <Stack
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 1,
                                        flex: 1,
                                    }}
                                >
                                    <POSHeading
                                        text={sale.itemName || 'Unknown Item'}
                                        sx={{ fontSize: 14, fontWeight: 600 }}
                                    />
                                    {existingItem && (
                                        <POSHeading
                                            text={`(${existingItem.quantity})`}
                                            sx={{
                                                fontSize: 12,
                                                fontWeight: 500,
                                                color: asRefund ? '#ff0000' : '#666',
                                                backgroundColor: asRefund ? '#ffcccc' : '#e0e0e0',
                                                px: 0.5,
                                                borderRadius: '4px',
                                            }}
                                        />
                                    )}
                                </Stack>
                                <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                                    {sale?.discountAmount > 0 && (
                                        <POSHeading
                                            text={`${asRefund ? '-' : ''}${sale.amount.toFixed(2) || 0}`}
                                            sx={{
                                                fontSize: 14,
                                                fontWeight: 600,
                                                color: asRefund ? '#ff0000' : 'inherit',
                                            }}
                                        />
                                    )}
                                    <POSHeading
                                        text={`${asRefund ? '-' : ''}${sale.price.toFixed(2) || 0}`}
                                        sx={{
                                            fontSize: 14,
                                            fontWeight: 400,
                                            textDecoration: sale?.discountAmount > 0 ? 'line-through' : 'none',
                                            color: asRefund ? '#ff0000' : 'inherit',
                                        }}
                                    />
                                </Stack>
                            </Stack>
                        );
                    })}

            {/* Refund Modal */}
            {refundModalOpen && <RefundModal open={refundModalOpen} onClose={() => setRefundModalOpen(false)} />}
        </Stack>
    );
}
