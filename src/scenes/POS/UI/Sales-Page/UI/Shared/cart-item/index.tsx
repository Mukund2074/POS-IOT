import React from 'react';
import { Paper } from '@mui/material';
import POSAccordion from '@/components/POS/Common/POSAccordion';
import CartItemSummary from './CartItemSummary';
import CartItemDetails from './CartItemDetails';
import { ExtendedSaleItem } from '@/types/CartContext.type';

interface CartItemProps {
    item: ExtendedSaleItem;
    index: number;
    isRefund?: boolean;
    onQtyChange?: (index: number, type: 'increment' | 'decrement') => void;
    onRemove?: (index: number) => void;
    onFieldChange?: (index: number, field: string, value: any) => void;
    expanded?: number | null;
    onExpand?: (index: number | null) => void;
    disabled?: boolean;
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
    disabled = false,
}: CartItemProps) {
    return (
        <Paper sx={{ borderRadius: 2, mt: 1, bgcolor: '#f0f0f099', border: 'none' }}>
            <POSAccordion
                title={
                    <CartItemSummary
                        item={item}
                        index={index}
                        isRefund={isRefund}
                        onQtyChange={onQtyChange}
                        onRemove={onRemove}
                        onFieldChange={onFieldChange}
                        disabled={disabled}
                    />
                }
                expanded={expanded === index}
                onChange={(_, exp) => onExpand?.(exp ? index : null)}
                sx={{
                    position: 'relative',
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                    '&:before': { display: 'none' },
                }}
                summarySx={{ px: { xs: 1, md: 2 }, py: 1, minHeight: 'auto' }}
                detailsSx={{ p: 0 }}
            >
                <CartItemDetails item={item} index={index} isRefund={isRefund} onFieldChange={onFieldChange} disabled={disabled} />
            </POSAccordion>
        </Paper>
    );
}
