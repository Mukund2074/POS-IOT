import React, { useState, useEffect } from 'react';
import { Paper, Stack, IconButton, Typography, InputAdornment, Chip } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import POSInput from '@/components/POS/Common/POSInput';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSSelect from '@/components/POS/Common/POSSelect';
import POSAccordion from '@/components/POS/Common/POSAccordion';
import { t } from 'i18next';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { useSelector } from 'react-redux';
import { EmployeeListingSchema } from '@/scenes/POS/UI/Sales-Page/Types/sales.types';
import { useCart } from '@/context/POS/CartContext';
import { processedRegularItems } from '@/utils/POS/Functions';
import { ExtendedSaleItem } from '@/types/CartContext.type';
const deleteIcon = require('@//assets/Delete.svg').default;

interface SelectedItemCardProps {
    item: ExtendedSaleItem;
    index: number;
    isRefund?: boolean;
    onQtyChange?: (index: number, type: 'increment' | 'decrement') => void;
    onRemove?: (index: number) => void;
    onFieldChange?: (index: number, field: string, value: any) => void;
    expanded?: number | null;
    onExpand?: (index: number | null) => void;
}

interface CartHookProps {
    updateItem: (index: number, item: ExtendedSaleItem) => void;
}

export default function CartItem({
    item,
    index,
    isRefund = false,
    onQtyChange,
    onRemove,
    onFieldChange,
    expanded,
    onExpand,
}: SelectedItemCardProps) {
    // Local state for discount input to prevent feedback loops
    const [discountInputValue, setDiscountInputValue] = useState(() => {
        if (item.discountType === 'VARIABLE_PERCENTAGE') {
            return item.discountPercentage?.toString() ?? '0';
        }
        return item.discountAmount?.toString() ?? '0';
    });
    const [priceInputValue, setPriceInputValue] = useState(item.price?.toString() ?? '0');

    const { updateItem } = useCart() as CartHookProps;
    const setting = useSelector((state: any) => state?.settings?.data);
    const isHavingDiscount =
        (item?.discountAmount && item?.discountAmount > 0) ||
        (item?.discountPercentage && item?.discountPercentage > 0) ||
        false;

    useEffect(() => {
        const currentValue = parseFloat(discountInputValue) || 0;
        const itemValue =
            item.discountType === 'VARIABLE_PERCENTAGE' ? item?.discountPercentage : item.discountAmount || 0;

        if (itemValue === 0 && currentValue !== 0) {
            setDiscountInputValue('0');
        } else if (itemValue !== 0) {
            setDiscountInputValue(itemValue?.toString() ?? '0');
        }
    }, [item.discountAmount, item.discountPercentage]);

    // Update price input value when item price changes from external source
    useEffect(() => {
        const currentValue = parseFloat(priceInputValue) || 0;
        const itemValue = item.price ?? 0;

        if (itemValue === 0 && currentValue !== 0) {
            setPriceInputValue('0');
        } else if (itemValue !== 0 && currentValue === 0 && priceInputValue === '') {
            setPriceInputValue(itemValue.toString());
        } else if (Math.abs(itemValue - currentValue) > 0.001 && priceInputValue !== '') {
            setPriceInputValue(itemValue.toString());
        }
    }, [item.price]);

    // Summary content - Product name, quantity controls, and price
    const summaryContent = (
        <Stack
            sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 2,
                width: '100%',
                pr: 2,
            }}
        >
            {item?.productId?.includes('custom-line-product') ? (
                <Stack sx={{ width: '60%', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <Stack onClick={(e) => e.stopPropagation()} style={{ flex: 1 }}>
                        <POSInput
                            value={item.itemName ?? ''}
                            onChange={(e) => {
                                onFieldChange?.(index, 'itemName', e.target.value);
                            }}
                            sx={{
                                width: '100%',
                                bgcolor: 'transparent',
                                fontWeight: 600,
                                p: 0,
                                borderRadius: 0,
                                '& .css-c62jy6-MuiInputBase-root-MuiOutlinedInput-root': {
                                    height: 20,
                                },
                            }}
                            placeholder="Custom Line Product"
                            slotProps={{
                                input: {
                                    sx: {
                                        borderBottom: 'none',
                                        p: 0,
                                        height: 35,
                                    },
                                },
                            }}
                        />
                    </Stack>
                    {isRefund && (
                        <Chip
                            label={t('POS.Refund')}
                            size="small"
                            sx={{
                                bgcolor: '#ff0000',
                                color: 'white',
                                fontSize: '10px',
                                height: '20px',
                                '& .MuiChip-label': {
                                    fontWeight: 600,
                                    px: 1,
                                },
                            }}
                        />
                    )}
                </Stack>
            ) : (
                <Stack sx={{ width: '60%', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <POSHeading
                        text={item.itemName ?? ''}
                        sx={{
                            flex: 1,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: 14,
                            fontWeight: 600,
                        }}
                    />
                    {isRefund && (
                        <Chip
                            label={t('POS.Refund')}
                            size="small"
                            sx={{
                                bgcolor: '#ff0000',
                                color: 'white',
                                fontSize: '10px',
                                height: '20px',
                                '& .MuiChip-label': {
                                    fontWeight: 600,
                                    px: 1,
                                },
                            }}
                        />
                    )}
                </Stack>
            )}

            <Stack
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 1,
                    height: '100%',
                    p: 0,
                }}
            >
                <IconButton
                    size="small"
                    disabled={item?.itemType === 'GIFT_CARD'}
                    onClick={(e) => {
                        e.stopPropagation();
                        onQtyChange?.(index, 'decrement');
                    }}
                >
                    <Remove />
                </IconButton>
                <Typography>{item.quantity}</Typography>
                <IconButton
                    size="small"
                    disabled={item?.itemType === 'GIFT_CARD'}
                    onClick={(e) => {
                        e.stopPropagation();
                        onQtyChange?.(index, 'increment');
                    }}
                >
                    <Add />
                </IconButton>
            </Stack>

            {isHavingDiscount ? (
                <Stack sx={{ ml: 'auto', whiteSpace: 'nowrap' }}>
                    <POSHeading
                        text={`${formatCurrency(item.price * item.quantity)}`}
                        sx={{ fontSize: 14, fontWeight: 600, textDecoration: 'line-through' }}
                    />
                    <POSHeading
                        text={`${formatCurrency(item.amount ?? 0)}`}
                        sx={{ fontSize: 14, fontWeight: 600, ml: 'auto' }}
                    />
                </Stack>
            ) : (
                <POSHeading
                    text={`${formatCurrency(item.amount ?? 0)}`}
                    sx={{ fontSize: 14, fontWeight: 600, ml: 'auto' }}
                />
            )}

            <IconButton
                size="small"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove?.(index);
                }}
            >
                <img src={deleteIcon} alt="delete" />
            </IconButton>
        </Stack>
    );

    // Details content - Price input, discount input, and delete button
    const detailsContent = (
        <Stack
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 2,
                width: { xs: '90%', md: '60%' },
                pl: 2,
                pb: 2,
            }}
        >
            <Stack sx={{ width: '100%' }}>
                <POSHeading text={t('Common.Price')} sx={{ fontSize: 14, fontWeight: 600 }} />
                <POSInput
                    value={priceInputValue}
                    disabled={item?.itemType === 'GIFT_CARD'}
                    onChange={(e) => {
                        // Allow numbers and decimal point
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        // Prevent multiple decimal points
                        const parts = value.split('.');
                        const formattedValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : value;

                        // Update local state immediately for responsive UI
                        setPriceInputValue(formattedValue === '' ? '0' : formattedValue);

                        // Handle the numeric conversion properly
                        let numericValue = 0;
                        if (formattedValue !== '') {
                            numericValue = parseFloat(formattedValue) || 0;
                        }

                        // For refund items, always store as negative price (even when 0)
                        // For regular items, store as positive price
                        const finalPrice = isRefund ? -Math.abs(numericValue) : numericValue;
                        onFieldChange?.(index, 'price', finalPrice);
                    }}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Typography>{t('POS.Currency')}</Typography>
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Stack>

            <Stack sx={{ width: '100%' }}>
                <POSHeading text={t('POS.Discount')} sx={{ fontSize: 14, fontWeight: 600 }} />
                <POSInput
                    value={discountInputValue}
                    size="small"
                    placeholder={t('POS.Discount')}
                    onChange={(e) => {
                        // Allow numbers and decimal point
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = value.split('.');
                        const formattedValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : value;

                        const newItem = {
                            ...item,
                            discountAmount:
                                item?.discountType === 'VARIABLE_AMOUNT'
                                    ? Math.min(Number(formattedValue), item.price)
                                    : 0,
                            discountPercentage:
                                item?.discountType === 'VARIABLE_PERCENTAGE'
                                    ? Math.min(Number(formattedValue), 100)
                                    : 0,
                        };

                        const addedDiscountedItem = processedRegularItems(newItem);

                        if (item.discountType === 'VARIABLE_PERCENTAGE') {
                            if (Number(value) > 100) {
                                setDiscountInputValue('100');
                                onFieldChange?.(index, 'discountPercentage', 100);
                                updateItem(index, {
                                    ...addedDiscountedItem,
                                    discountAmount: 0,
                                    discountType: 'VARIABLE_PERCENTAGE',
                                    amount: 0,
                                    discountPercentage: 100,
                                });
                                return;
                            } else {
                                onFieldChange?.(index, 'discountPercentage', Number(formattedValue));
                                updateItem(index, addedDiscountedItem);
                                setDiscountInputValue(formattedValue);
                                return;
                            }
                        }
                        if (item.discountType === 'VARIABLE_AMOUNT') {
                            if (Number(value) > item.price) {
                                setDiscountInputValue(item.price.toString());
                                onFieldChange?.(index, 'discountAmount', item.price);
                                updateItem(index, {
                                    ...addedDiscountedItem,
                                    discountType: 'VARIABLE_AMOUNT',
                                    amount: 0,
                                    discountPercentage: 0,
                                    discountAmount: item.price,
                                });
                                return;
                            } else {
                                onFieldChange?.(index, 'discountAmount', Number(formattedValue));
                                updateItem(index, addedDiscountedItem);
                                setDiscountInputValue(formattedValue);
                                return;
                            }
                        }
                    }}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <POSSelect
                                    value={item.discountType ?? 'VARIABLE_PERCENTAGE'}
                                    options={[
                                        { label: '%', value: 'VARIABLE_PERCENTAGE' },
                                        {
                                            label: t('POS.Currency'),
                                            value: 'VARIABLE_AMOUNT',
                                        },
                                    ]}
                                    onChange={(e) => {
                                        const newDiscountType = e.target.value;
                                        onFieldChange?.(index, 'discountAmount', 0);
                                        onFieldChange?.(index, 'discountPercentage', 0);
                                        onFieldChange?.(index, 'discounts', []);
                                        setDiscountInputValue('0');
                                        onFieldChange?.(index, 'discountType', newDiscountType);

                                        // Reset discount amount when changing type to prevent invalid values
                                        const currentDiscount = item.discountAmount ?? 0;
                                        if (newDiscountType === 'VARIABLE_PERCENTAGE' && currentDiscount > 100) {
                                            onFieldChange?.(index, 'discountAmount', 0);
                                            onFieldChange?.(index, 'discountPercentage', 0);
                                        } else if (
                                            newDiscountType === 'VARIABLE_AMOUNT' &&
                                            currentDiscount > Math.abs(item.price ?? 0)
                                        ) {
                                            onFieldChange?.(index, 'discountAmount', 0);
                                            onFieldChange?.(index, 'discountPercentage', 0);
                                        }

                                        updateItem(index, {
                                            discountType: newDiscountType as 'VARIABLE_PERCENTAGE' | 'VARIABLE_AMOUNT',
                                            amount: 0,
                                            discountPercentage: 0,
                                            discountAmount: 0,
                                            discounts: [],
                                            quantity: item.quantity,
                                            price: item.price,
                                        });
                                    }}
                                    borderThickness={0}
                                />
                            ),
                        },
                    }}
                    sx={{ p: 0 }}
                />
            </Stack>
            <Stack sx={{ width: '100%' }}>
                <POSHeading text={t('POS.ServedBy')} sx={{ fontSize: 14, fontWeight: 600 }} />
                <POSSelect
                    backgroundColor="#fff"
                    value={item?.employeeId ?? ''}
                    options={setting?.employees?.map((employee: EmployeeListingSchema) => ({
                        label: employee.name,
                        value: employee.id,
                    }))}
                    onChange={(e) => {
                        onFieldChange?.(index, 'employeeId', e.target.value);
                    }}
                />
            </Stack>
        </Stack>
    );

    return (
        <Paper
            key={item.productId ?? index}
            sx={{
                borderRadius: 2,
                mt: 1,
                bgcolor: '#f0f0f099',
                border: 'none',
            }}
        >
            <POSAccordion
                title={summaryContent}
                expanded={expanded === index}
                onChange={(_, expanded) => {
                    if (expanded) {
                        onExpand?.(index);
                    } else {
                        onExpand?.(null);
                    }
                }}
                sx={{
                    position: 'relative',
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                    '&:before': {
                        display: 'none',
                    },
                }}
                summarySx={{
                    px: 2,
                    py: 1,
                    minHeight: 'auto',
                }}
                detailsSx={{
                    p: 0,
                }}
            >
                {detailsContent}
            </POSAccordion>
        </Paper>
    );
}
