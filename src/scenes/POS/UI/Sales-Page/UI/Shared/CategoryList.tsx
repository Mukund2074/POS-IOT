import { Stack, Alert, Fade, Slide } from '@mui/material';
import React, { useState } from 'react';
import POSAccordion from '@/components/POS/Common/POSAccordion';
import POSHeading from '@/components/POS/Common/POSHeading';
import {
    GetApiProductsListing200ProductsItem,
    GetApiProductsListing200ServicesItem,
    GetApiProductsListing200ProductsItemProductsItem,
    GetApiProductsListing200ServicesItemServicesItem,
    PostApiSaleBodyData,
    PostApiSaleBodyDataItemsItem,
    PostApiSaleBodyDataItemsItemDiscountType,
    PostApiSaleBodyDataItemsItemItemType,
    PostApiSaleBodyDataItemsItemSaleType,
} from '@/shared/api/models';
import { t } from 'i18next';
import { useCart } from '@/context/POS/CartContext';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';

export default function CategoryList({
    category,
    search,
    accesKey,
    asRefund,
    openItemId,
    onExpand,
}: {
    category: GetApiProductsListing200ProductsItem | GetApiProductsListing200ServicesItem;
    search: string;
    accesKey: 'products' | 'services';
    asRefund?: boolean;
    openItemId?: string | null;
    onExpand?: (idx: string | null) => void;
}) {
    const [showOutOfStockAlert, setShowOutOfStockAlert] = useState(false);
    const [outOfStockItem, setOutOfStockItem] = useState<{
        name: string;
        type: 'product' | 'service';
    } | null>(null);
    const { cart, addItem, updateItem, addRefundItem, updateRefundItem, regularItems, refundItems } = useCart() as {
        cart: PostApiSaleBodyData;
        addItem: (item: PostApiSaleBodyDataItemsItem) => void;
        updateItem: (index: number, item: PostApiSaleBodyDataItemsItem) => void;
        addRefundItem: (item: PostApiSaleBodyDataItemsItem) => void;
        updateRefundItem: (index: number, item: PostApiSaleBodyDataItemsItem) => void;
        regularItems: PostApiSaleBodyDataItemsItem[];
        refundItems: PostApiSaleBodyDataItemsItem[];
    };

    const isProductCategory = accesKey === 'products';
    const isServiceCategory = accesKey === 'services';

    const getCategoryTitle = () => {
        if (category.id === '0') {
            return isProductCategory ? t('POS.UnCatProds') : t('POS.UnCatServices');
        }
        return category.name;
    };

    const getItemsArray = () => {
        if (isProductCategory) {
            return (category as GetApiProductsListing200ProductsItem).products;
        } else {
            return (category as GetApiProductsListing200ServicesItem).services;
        }
    };

    const items = getItemsArray();

    return (
        <POSAccordion
            key={category.id}
            expanded={openItemId === category.id.toString() || search?.length > 1}
            onChange={(_, expanded) => {
                onExpand?.(expanded ? category.id.toString() : null);
            }}
            title={<POSHeading sx={{ fontSize: 14, fontWeight: 400, px: 2 }} text={getCategoryTitle()} />}
            sx={{
                p: 0,
                width: '100%',
                m: 0,
                '&.Mui-expanded': {
                    m: 0,
                    p: 0,
                },
            }}
            summarySx={{
                borderBottom: '1px solid #d2d2d2',
                backgroundColor: '#f0f0f099',
                p: 0,
                px: 2,
                m: 0,
            }}
            detailsSx={{ p: 0, m: 0 }}
        >
            {Array.isArray(items) &&
                items.map(
                    (
                        item:
                            | GetApiProductsListing200ProductsItemProductsItem
                            | GetApiProductsListing200ServicesItemServicesItem,
                    ) => {
                        // Product item
                        if (isProductCategory) {
                            const productItem = item as GetApiProductsListing200ProductsItemProductsItem;
                            const currentItems = asRefund ? refundItems : regularItems;
                            // Create unique ID for refund vs regular to avoid conflicts
                            const uniqueProductId = asRefund
                                ? `refund-product-${productItem.id}`
                                : productItem.id.toString();
                            const existingProduct = currentItems.find((i) => i.productId === uniqueProductId);

                            return (
                                <Stack
                                    key={productItem.id}
                                    onClick={() => {
                                        if ((item as any)?.stock <= 0) {
                                            setShowOutOfStockAlert(true);
                                            setOutOfStockItem({
                                                name: productItem.name,
                                                type: 'product',
                                            });
                                            setTimeout(() => {
                                                setShowOutOfStockAlert(false);
                                                setOutOfStockItem(null);
                                            }, 3000);
                                        }
                                        if (existingProduct) {
                                            const itemIndex = currentItems.indexOf(existingProduct);
                                            const updatedItem = {
                                                ...existingProduct,
                                                quantity: existingProduct.quantity + 1,
                                            };

                                            if (asRefund) {
                                                updateRefundItem(itemIndex, updatedItem);
                                            } else {
                                                updateItem(itemIndex, updatedItem);
                                            }
                                        } else {
                                            const newItem = {
                                                productId: uniqueProductId,
                                                quantity: 1,
                                                amount: asRefund
                                                    ? -Math.abs(Number(productItem.price))
                                                    : Number(productItem.price) || 0,
                                                price: asRefund
                                                    ? -Math.abs(Number(productItem.price))
                                                    : Number(productItem.price) || 0,
                                                itemName: productItem.name,
                                                discountAmount: 0,
                                                discountPercentage: 0,
                                                discountType:
                                                    PostApiSaleBodyDataItemsItemDiscountType.VARIABLE_PERCENTAGE,
                                                discounts: [],
                                                saleType: asRefund
                                                    ? PostApiSaleBodyDataItemsItemSaleType.RETURN
                                                    : PostApiSaleBodyDataItemsItemSaleType.SALE,
                                                itemType: PostApiSaleBodyDataItemsItemItemType.PRODUCT,
                                                employeeId: Number(cart.sellBy),
                                                tax: productItem?.tax,
                                            };

                                            if (asRefund) {
                                                addRefundItem(newItem);
                                            } else {
                                                addItem(newItem);
                                            }
                                        }
                                    }}
                                    sx={{
                                        cursor: 'pointer',
                                        p: 1,
                                        '&:hover': { backgroundColor: '#f0f0f099' },
                                        bgcolor: existingProduct ? (asRefund ? '#ffe6e6' : '#f0f0f099') : 'transparent',
                                        borderLeft: existingProduct
                                            ? asRefund
                                                ? '4px solid #ff0000'
                                                : '4px solid #000'
                                            : 'none',
                                        borderBottom: '0.5px solid #d2d2d2',
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        gap: 1,
                                    }}
                                >
                                    <POSHeading text={productItem.name} sx={{ fontSize: 14, fontWeight: 600 }} />
                                    <Stack direction={'column'}>
                                        <POSHeading
                                            text={`${asRefund ? '-' : ''}${formatCurrency(productItem.price)}`}
                                            sx={{
                                                fontSize: 14,
                                                fontWeight: 400,
                                                color: asRefund ? '#ff0000' : 'inherit',
                                            }}
                                        />
                                        <POSHeading
                                            text={`${productItem?.stock || 0} ${t('POS.InStock')}`}
                                            sx={{
                                                fontSize: 12,
                                                fontWeight: 400,
                                                color: '#666',
                                            }}
                                        />
                                    </Stack>
                                </Stack>
                            );
                        }
                        // Service item
                        if (isServiceCategory) {
                            const serviceItem = item as GetApiProductsListing200ServicesItemServicesItem;
                            const currentItems = asRefund ? refundItems : regularItems;
                            // Create unique ID for refund vs regular to avoid conflicts
                            const uniqueServiceId = asRefund
                                ? Number(`refund-service-${serviceItem.id}`)
                                : Number(serviceItem.id.toString());
                            const existingService = currentItems.find((i) => i.serviceId === uniqueServiceId);

                            return (
                                <Stack
                                    key={serviceItem.id}
                                    onClick={() => {
                                        if (existingService) {
                                            const itemIndex = currentItems.indexOf(existingService);
                                            const updatedItem = {
                                                ...existingService,
                                                quantity: existingService.quantity + 1,
                                            };

                                            if (asRefund) {
                                                updateRefundItem(itemIndex, updatedItem);
                                            } else {
                                                updateItem(itemIndex, updatedItem);
                                            }
                                        } else {
                                            const newItem = {
                                                serviceId: uniqueServiceId,
                                                quantity: 1,
                                                amount: asRefund
                                                    ? -Math.abs(Number(serviceItem.price || 0))
                                                    : Number(serviceItem.price || 0),
                                                price: asRefund
                                                    ? -Math.abs(Number(serviceItem.price || 0))
                                                    : Number(serviceItem.price || 0),
                                                itemName: serviceItem.name,
                                                discountAmount: 0,
                                                discountPercentage: 0,
                                                discountType:
                                                    PostApiSaleBodyDataItemsItemDiscountType.VARIABLE_PERCENTAGE,
                                                discounts: [],
                                                saleType: asRefund
                                                    ? PostApiSaleBodyDataItemsItemSaleType.RETURN
                                                    : PostApiSaleBodyDataItemsItemSaleType.SALE,
                                                itemType: PostApiSaleBodyDataItemsItemItemType.SERVICE,
                                                employeeId: Number(cart.sellBy),
                                            };

                                            if (asRefund) {
                                                addRefundItem(newItem);
                                            } else {
                                                addItem(newItem);
                                            }
                                        }
                                    }}
                                    sx={{
                                        cursor: 'pointer',
                                        p: 1,
                                        '&:hover': { backgroundColor: '#f0f0f099' },
                                        bgcolor: existingService ? (asRefund ? '#ffe6e6' : '#f0f0f099') : 'transparent',
                                        borderLeft: existingService
                                            ? asRefund
                                                ? '4px solid #ff0000'
                                                : '4px solid #000'
                                            : 'none',
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        gap: 1,
                                    }}
                                >
                                    <Stack sx={{ width: '90%', overflow: 'hidden' }}>
                                        <POSHeading
                                            text={serviceItem.name}
                                            sx={{
                                                fontSize: 14,
                                                fontWeight: 600,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                whiteSpace: 'normal',
                                                overflow: 'wrap',
                                                breakWords: true,
                                                textOverflow: 'ellipsis',
                                            }}
                                        />
                                        <POSHeading
                                            text={serviceItem.description || ''}
                                            sx={{
                                                fontSize: 14,
                                                fontWeight: 400,
                                                color: '#666',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        />
                                    </Stack>
                                    <Stack direction={'column'}>
                                        <POSHeading
                                            text={`${asRefund ? '-' : ''}${formatCurrency(serviceItem.price)}`}
                                            sx={{
                                                fontSize: 14,
                                                fontWeight: 400,
                                                color: asRefund ? '#ff0000' : 'inherit',
                                            }}
                                        />
                                        <POSHeading
                                            text={`${serviceItem?.durationMin || 0} ${t('POS.Minutes')}`}
                                            sx={{
                                                fontSize: 12,
                                                fontWeight: 400,
                                                color: '#666',
                                                whiteSpace: 'nowrap',
                                            }}
                                        />
                                    </Stack>
                                </Stack>
                            );
                        }
                        return null;
                    },
                )}
            <Fade in={showOutOfStockAlert} timeout={300}>
                <Slide direction="down" in={showOutOfStockAlert} timeout={300}>
                    <Stack
                        sx={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            zIndex: 1000,
                            display: showOutOfStockAlert ? 'flex' : 'none',
                            justifyContent: 'center',
                            alignItems: 'center',
                            p: 4,
                        }}
                    >
                        <Alert
                            severity="warning"
                            sx={{
                                minWidth: 300,
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                borderRadius: 2,
                                animation: showOutOfStockAlert ? 'pulse 0.6s ease-in-out' : 'none',
                                '@keyframes pulse': {
                                    '0%': {
                                        transform: 'scale(1)',
                                    },
                                    '50%': {
                                        transform: 'scale(1.05)',
                                    },
                                    '100%': {
                                        transform: 'scale(1)',
                                    },
                                },
                            }}
                        >
                            {outOfStockItem?.name} {t('POS.OutOfStock')}
                        </Alert>
                    </Stack>
                </Slide>
            </Fade>
        </POSAccordion>
    );
}
