import React from 'react';
import { Stack, IconButton, Typography, Chip } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import POSHeading from '@/components/POS/Common/POSHeading';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { ExtendedSaleItem } from '@/types/CartContext.type';
import POSInput from '@/components/POS/Common/POSInput';
import { t } from 'i18next';

const deleteIcon = require('@/assets/Delete.svg').default;

interface Props {
    item: ExtendedSaleItem;
    index: number;
    isRefund?: boolean;
    onQtyChange?: (index: number, type: 'increment' | 'decrement') => void;
    onRemove?: (index: number) => void;
    onFieldChange?: (index: number, field: string, value: any) => void;
    disabled?: boolean;
}

export default function CartItemSummary({
    item,
    index,
    isRefund,
    onQtyChange,
    onRemove,
    onFieldChange,
    disabled,
}: Props) {
    const isDiscounted = (item.discountAmount ?? 0) > 0 || (item.discountPercentage ?? 0) > 0;

    return (
        <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            gap={{ xs: 1, md: 2 }}
            width="100%"
            pr={{ xs: 0, md: 2 }}
        >
            <Stack flex={1} direction="row" alignItems="center" gap={1}>
                {item?.productId?.includes('custom-line-product') ? (
                    <POSInput
                        disabled={disabled}
                        value={item.itemName ?? ''}
                        onChange={(e) => {
                            e.stopPropagation();
                            onFieldChange?.(index, 'itemName', e.target.value);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                                e.stopPropagation();
                            }
                        }}
                        onKeyUp={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                                e.stopPropagation();
                            }
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        sx={{
                            width: '100%',
                            bgcolor: 'transparent',
                            minWidth: 250,
                            fontWeight: 600,
                            p: 0,
                            borderRadius: 0,
                            '& .css-c62jy6-MuiInputBase-root-MuiOutlinedInput-root': {
                                height: 20,
                            },
                        }}
                        placeholder={t('POS.CustomLine')}
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
                ) : (
                    <POSHeading
                        text={item.itemName ?? ''}
                        sx={{
                            whiteSpace: 'nowrap',
                            width: '100%',
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: 14,
                            fontWeight: 600,
                        }}
                    />
                )}
                {isRefund && (
                    <Chip
                        label="Refund"
                        size="small"
                        sx={{ bgcolor: '#ff0000', color: 'white', fontSize: '10px', height: '20px' }}
                    />
                )}
            </Stack>

            <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, width: '100%' }}>
                <Stack ml="auto" direction="row" alignItems="center" gap={1}>
                    {!disabled && (
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onQtyChange?.(index, 'decrement');
                            }}
                            disabled={item.itemType === 'GIFT_CARD' || item?.itemType === 'CUT_CARD'}
                        >
                            <Remove />
                        </IconButton>
                    )}
                    <Typography>
                        {disabled && t('POS.Quantity')} {item.quantity}
                    </Typography>
                    {!disabled && (
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onQtyChange?.(index, 'increment');
                            }}
                            disabled={item.itemType === 'GIFT_CARD' || item?.itemType === 'CUT_CARD'}
                        >
                            <Add />
                        </IconButton>
                    )}
                </Stack>

                <Stack whiteSpace="nowrap">
                    {isDiscounted ? (
                        <>
                            <POSHeading
                                text={formatCurrency(item.price * item.quantity)}
                                sx={{ fontSize: 14, textDecoration: 'line-through' }}
                            />
                            <POSHeading
                                text={formatCurrency(item.amount ?? 0)}
                                sx={{ fontSize: 14, fontWeight: 600 }}
                            />
                        </>
                    ) : (
                        <POSHeading text={formatCurrency(item.amount ?? 0)} sx={{ fontSize: 14, fontWeight: 600 }} />
                    )}
                </Stack>

                {!disabled && (
                    <IconButton
                        size="small"
                        sx={{ ml: { xs: 'auto', md: '0' } }}
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onRemove?.(index);
                        }}
                    >
                        <img src={deleteIcon} alt="delete" />
                    </IconButton>
                )}
            </Stack>
        </Stack>
    );
}
