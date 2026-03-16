import React, { useEffect, useState } from 'react';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSInput from '@/components/POS/Common/POSInput';
import POSSelect from '@/components/POS/Common/POSSelect';
import { Stack } from '@mui/material';
import { useCart } from '@/context/POS/CartContext';
import { processedRegularItems } from '@/utils/POS/Functions';
import { t } from 'i18next';
import { ExtendedSaleItem } from '@/types/CartContext.type';
import { useSelector } from 'react-redux';

interface Props {
    item: ExtendedSaleItem;
    index: number;
    onFieldChange?: (index: number, field: string, value: any) => void;
    disabled?: boolean;
}

export default function DiscountInput({ item, index, onFieldChange, disabled }: Props) {
    const [discountValue, setDiscountValue] = useState('0');
    const { updateItem } = useCart();
    const shouldRoundUp =
        useSelector((state: any) => state?.settings?.data)?.posSetting?.value?.cashDrawerPermissions?.roundingAmount
            ?.roundDiscount || {};

    useEffect(() => {
        const value =
            item.discountType === 'VARIABLE_PERCENTAGE' ? item.discountPercentage : (item.discountAmount ?? 0);
        setDiscountValue(value?.toString() || '0');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item.discountAmount, item.discountPercentage]);

    const handleDiscountChange = (raw: string) => {
        // ✅ Allow only digits and one dot
        let value = raw.replace(/[^0-9.]/g, '');
        const dotIndex = value.indexOf('.');
        if (dotIndex !== -1) {
            value = value.slice(0, dotIndex + 1) + value.slice(dotIndex + 1).replace(/\./g, '');
        }

        let parsed = parseFloat(value) || 0;
        const type = item.discountType;

        // ✅ Clamp values immediately
        if (type === 'VARIABLE_PERCENTAGE' && parsed > 100) {
            parsed = 100;
            value = '100';
        } else if (type === 'VARIABLE_AMOUNT' && parsed > item.price) {
            parsed = item.price;
            value = item.price.toString();
        }

        // ✅ Update local state with clamped value
        setDiscountValue(value);

        const newItem = {
            ...item,
            discountAmount: type === 'VARIABLE_AMOUNT' ? parsed : 0,
            discountPercentage: type === 'VARIABLE_PERCENTAGE' ? parsed : 0,
        };

        const discounted = processedRegularItems(newItem, shouldRoundUp);

        if (type === 'VARIABLE_PERCENTAGE') {
            onFieldChange?.(index, 'discountPercentage', newItem.discountPercentage);
        } else {
            onFieldChange?.(index, 'discountAmount', newItem.discountAmount);
        }

        updateItem(index, discounted);
    };

    return (
        <Stack width="100%">
            <POSHeading text={t('POS.Discount')} sx={{ fontSize: 14, fontWeight: 600 }} />
            <POSInput
                value={discountValue}
                onChange={(e) => handleDiscountChange(e.target.value)}
                disabled={disabled}
                slotProps={{
                    input: {
                        endAdornment: (
                            <POSSelect
                                disabled={disabled}
                                value={item.discountType ?? 'VARIABLE_PERCENTAGE'}
                                borderThickness={0}
                                options={[
                                    { label: '%', value: 'VARIABLE_PERCENTAGE' },
                                    { label: t('POS.Currency'), value: 'VARIABLE_AMOUNT' },
                                ]}
                                onChange={(e) => {
                                    const type = e.target.value;

                                    setDiscountValue('0');
                                    onFieldChange?.(index, 'discountType', type);
                                }}
                            />
                        ),
                    },
                }}
            />
        </Stack>
    );
}
