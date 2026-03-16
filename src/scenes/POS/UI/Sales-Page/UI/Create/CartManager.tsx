import { Divider, Grid2, Stack } from '@mui/material';
import React, { memo, useEffect, useRef, useState } from 'react';
import SalesHeader from './SalesHeader';
import POSHeading from '@/components/POS/Common/POSHeading';
import { t } from 'i18next';
import { PostApiSaleBodyDataItemsItem } from '@/shared/api/models';
import { useCart } from '@/context/POS/CartContext';
import OrderSummary from '../Shared/OrderSummary';
import CartItem from '../Shared/cart-item';
import { CartOverride, ExtendedSaleItem } from '@/types/CartContext.type';

export default memo(function CartManager({ hasSavedCart }: { hasSavedCart: boolean }) {
    const {
        regularItems,
        refundItems,
        removeItem: removeItemFromCart,
        updateItem: updateItemInCart,
        removeRefundItem: removeRefundItemFromCart,
        updateRefundItem: updateRefundItemInCart,
        getAllItems,
        cart,
    } = useCart() as {
        regularItems: ExtendedSaleItem[];
        refundItems: ExtendedSaleItem[];
        removeItem: (index: number) => void;
        updateItem: (index: number, item: ExtendedSaleItem) => void;
        removeRefundItem: (index: number) => void;
        updateRefundItem: (index: number, item: ExtendedSaleItem) => void;
        getAllItems: () => ExtendedSaleItem[];
        cart: CartOverride;
    };

    // Helper function to determine if an item is a refund
    const isRefundItem = (item: PostApiSaleBodyDataItemsItem, itemIndex: number) => {
        return (item.price ?? 0) < 0;
    };
    // const cartItems = getAllItems();

    const [openItemId, setOpenItemId] = useState<number | null>(null);
    const [prevLength, setPrevLength] = useState(cart.items.length);
    const lastItemRef = useRef<HTMLDivElement | null>(null);

    // Helper function to find the item in the correct array and get its index
    const findItemIndexAndType = (cartItemIndex: number) => {
        const item = cart.items[cartItemIndex];
        if (!item) return { index: -1, isRefund: false };

        // Determine if this is a refund item based on price/amount being negative
        const isRefundItem = (item.price ?? 0) < 0 || (item.amount ?? 0) < 0;

        if (isRefundItem) {
            // For refund items, search in refundItems array
            const refundIndex = refundItems.findIndex((refundItem, idx) => {
                // Match by exact productId/serviceId first
                if (refundItem.productId && item.productId && refundItem.productId === item.productId) {
                    return true;
                }
                if (refundItem.serviceId && item.serviceId && refundItem.serviceId === item.serviceId) {
                    return true;
                }
                // Fallback to name and price matching for refund items
                return (
                    refundItem.itemName === item.itemName &&
                    Math.abs(refundItem.price ?? 0) === Math.abs(item.price ?? 0) &&
                    (refundItem.price ?? 0) < 0 // Ensure both are negative
                );
            });

            return { index: refundIndex, isRefund: true };
        } else {
            // For regular items, search in regularItems array
            const regularIndex = regularItems.findIndex((regularItem, idx) => {
                // Match by exact productId/serviceId first
                if (regularItem.productId && item.productId && regularItem.productId === item.productId) {
                    return true;
                }
                if (regularItem.serviceId && item.serviceId && regularItem.serviceId === item.serviceId) {
                    return true;
                }
                // Fallback to name and price matching for regular items
                return (
                    regularItem.itemName === item.itemName &&
                    regularItem.price === item.price &&
                    (regularItem.price ?? 0) >= 0 // Ensure both are positive
                );
            });

            return { index: regularIndex, isRefund: false };
        }
    };

    const onQtyChange = (itemIndex: number, type: 'increment' | 'decrement') => {
        const item = cart.items[itemIndex];
        if (!item) return;

        const { index, isRefund } = findItemIndexAndType(itemIndex);
        if (index === -1) return;

        const newQty = type === 'increment' ? item.quantity + 1 : Math.max(1, item.quantity - 1);
        const amount = item.price * newQty;
        const updatedItem = { ...item, quantity: newQty, amount: amount - (item.discountAmount || 0) };

        if (isRefund) {
            updateRefundItemInCart(index, updatedItem);
        } else {
            updateItemInCart(index, updatedItem);
        }
    };

    const onRemove = (itemIndex: number) => {
        const { index, isRefund } = findItemIndexAndType(itemIndex);
        if (index === -1) return;

        if (isRefund) {
            removeRefundItemFromCart(index);
        } else {
            removeItemFromCart(index);
        }
    };

    const onFieldChange = (itemIndex: number, field: string, value: any) => {
        const item = cart.items[itemIndex];
        if (!item) return;

        const { index, isRefund } = findItemIndexAndType(itemIndex);
        if (index === -1) return;
        let updatedItem = { ...item };
        if (field === 'discountType') {
            updatedItem = { ...item, [field]: value, discountAmount: 0, discountPercentage: 0, discounts: [] };
        } else {
            updatedItem = { ...item, [field]: value };
        }

        // Don't recalculate amount here - let CartContext handle all calculations
        // This prevents double calculation and feedback loops

        if (isRefund) {
            updateRefundItemInCart(index, updatedItem);
        } else {
            updateItemInCart(index, updatedItem);
        }
    };

    useEffect(() => {
        if (cart.items.length > prevLength) {
            setOpenItemId(cart.items.length - 1);
        }
        setPrevLength(cart.items.length);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cart.items]);

    useEffect(() => {
        if (cart.items.length > prevLength) {
            setOpenItemId(cart.items.length - 1);
            // Scroll to the last item smoothly
            setTimeout(() => {
                lastItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100); // delay to allow rendering
        }
        setPrevLength(cart.items.length);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cart.items]);

    return (
        <Grid2
            size={{ xs: 12, md: hasSavedCart ? 12 : 8 }}
            sx={{
                height: '100%',
                minHeight: { xs: '100dvh', md: '100%' },
                overflow: 'hidden',
                overflowY: 'scroll',
                scrollbarWidth: 'none',
                px: { xs: 0, md: 2 },
                py: 2,
                position: 'relative',
            }}
        >
            <SalesHeader hasSavedCart={hasSavedCart} />

            <Divider
                sx={{
                    display: { xs: 'block', md: 'none' },
                    mt: 2,
                    borderWidth: 2,
                    borderColor: '#2f2f2f',
                }}
            />

            <POSHeading
                text={t('POS.SelectedProducts')}
                sx={{ fontSize: 16, fontWeight: 600, px: { xs: 2, md: 0 }, mt: { xs: 2, md: 0 } }}
            />

            <Stack
                sx={{
                    display: cart.items.length === 0 ? 'flex' : 'none',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '50dvh',
                    color: '#ccc',
                }}
            >
                <h1>{t('POS.NoitemsSel')}</h1>
            </Stack>

            <Stack
                sx={{
                    display: cart.items.length > 0 ? 'flex' : 'none',
                    height: '60%',
                    overflowY: 'scroll',
                    my: 3,
                    scrollbarWidth: 'thin',
                    px: 2,
                    pb: 4,
                }}
            >
                {cart.items.map((item, index) => {
                    const isLast = index === cart.items.length - 1;
                    return (
                        <div key={`item-${index}`} ref={isLast ? lastItemRef : null}>
                            <CartItem
                                key={`item-${index}`}
                                item={item}
                                index={index}
                                isRefund={isRefundItem(item, index)}
                                expanded={openItemId}
                                onQtyChange={(index, type) => {
                                    if (hasSavedCart) return;
                                    onQtyChange(index, type);
                                }}
                                onRemove={(index) => {
                                    if (hasSavedCart) return;
                                    onRemove(index);
                                }}
                                onFieldChange={(index, field, value) => {
                                    if (hasSavedCart) return;
                                    onFieldChange(index, field, value);
                                }}
                                onExpand={(index) => {
                                    setOpenItemId(index);
                                }}
                                disabled={hasSavedCart}
                            />
                        </div>
                    );
                })}
            </Stack>

            {cart.items.length > 0 && <OrderSummary />}
        </Grid2>
    );
});
