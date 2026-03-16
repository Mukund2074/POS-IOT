import React from 'react';
import { Stack } from '@mui/material';
import PriceInput from './PriceInput';
import DiscountInput from './DiscountInput';
import ServedBySelect from './ServedBySelect';
import { ExtendedSaleItem } from '@/types/CartContext.type';

interface Props {
    item: ExtendedSaleItem;
    index: number;
    isRefund?: boolean;
    onFieldChange?: (index: number, field: string, value: any) => void;
    disabled?: boolean;
}

export default function CartItemDetails({ item, index, isRefund, onFieldChange, disabled }: Props) {
    return (
        <Stack direction={{ xs: 'column', md: 'row' }} gap={2} width={{ xs: '90%', md: '60%' }} pl={2} pb={2}>
            <PriceInput
                item={item}
                index={index}
                isRefund={isRefund}
                onFieldChange={onFieldChange}
                disabled={disabled}
            />
            <DiscountInput item={item} index={index} onFieldChange={onFieldChange} disabled={disabled} />
            <ServedBySelect item={item} index={index} onFieldChange={onFieldChange} disabled={disabled} />
        </Stack>
    );
}
