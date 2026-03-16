import React, { useEffect, useState } from 'react';
import { InputAdornment, Stack, Typography } from '@mui/material';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSInput from '@/components/POS/Common/POSInput';
import { t } from 'i18next';
import { ExtendedSaleItem } from '@/types/CartContext.type';
import { useCart } from '@/context/POS/CartContext';

interface Props {
    item: ExtendedSaleItem;
    index: number;
    isRefund?: boolean;
    onFieldChange?: (index: number, field: string, value: any) => void;
    disabled?: boolean;
}

export default function PriceInput({ item, index, isRefund, onFieldChange, disabled }: Props) {
    const [priceValue, setPriceValue] = useState(item.price?.toString() ?? '0');
    const { updateItem } = useCart();

    useEffect(() => {
        setPriceValue(item.price?.toString() ?? '0');
    }, [item.price]);

    const handlePriceChange = (val: string) => {
        const value = val.replace(/[^0-9.]/g, '');
        const formatted = value.split('.').length > 2 ? value.split('.').slice(0, 2).join('.') : value;
        const numeric = parseFloat(formatted) || 0;
        const finalPrice = isRefund ? -Math.abs(numeric) : numeric;
        setPriceValue(formatted);
        onFieldChange?.(index, 'price', finalPrice);
        updateItem(index, {
            ...item,
            price: finalPrice,
            discounts: [],
            discountAmount: 0,
            discountPercentage: 0,
            discountType: 'VARIABLE_PERCENTAGE',
        });
    };

    return (
        <Stack width="100%">
            <POSHeading text={t('Common.Price')} sx={{ fontSize: 14, fontWeight: 600 }} />
            <POSInput
                value={priceValue}
                onChange={(e) => handlePriceChange(e.target.value)}
                disabled={item.itemType === 'GIFT_CARD' || disabled}
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
    );
}
