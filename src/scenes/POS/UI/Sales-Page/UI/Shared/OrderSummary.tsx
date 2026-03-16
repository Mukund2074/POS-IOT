import React, { useEffect, useState } from 'react';
import { Stack, Grid2 } from '@mui/material';
import POSHeading from '@/components/POS/Common/POSHeading';
import { useCart } from '@/context/POS/CartContext';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { t } from 'i18next';
import { orderSummaryType } from '../../Types/sales.types';
import { CartOverride } from '@/types/CartContext.type';

interface cartProps {
    cart: CartOverride;
    calculateTotalDiscount(): number;
}

export default function OrderSummary() {
    const { cart, calculateTotalDiscount } = useCart() as cartProps;

    const [orderSummary, setOrderSummary] = useState<orderSummaryType>({
        total: 0,
        paidAmount: 0,
        discount: 0,
        tax: 0,
        netTotal: 0,
    });

    useEffect(() => {
        setOrderSummary({
            total: cart.subTotal,
            paidAmount: cart.paidAmount || 0,
            discount: calculateTotalDiscount(),
            tax: cart.totalTax,
            netTotal: cart.netTotal,
        });
    }, [cart, calculateTotalDiscount]);

    const fields = [
        { id: 1, label: t('Common.Total'), value: formatCurrency(orderSummary.total) },
        // { id: 2, label: t('POS.AlreadyPaid'), value: formatCurrency(orderSummary.paidAmount) },
        { id: 3, label: t('POS.TotalDiscount'), value: `- ${formatCurrency(orderSummary.discount)}` },
        { id: 4, label: `${t('POS.TotalTax')} (${t('POS.Inclusive')})`, value: formatCurrency(orderSummary.tax) },
        { id: 5, label: t('POS.NetTotal'), value: formatCurrency(orderSummary.netTotal) },
    ];

    return (
        <Stack
            sx={{
                borderRadius: 2,
                p: { xs: 1, sm: 2 }, // smaller padding on mobile
                bgcolor: '#f0f0f0',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                width: '100%',
                zIndex: 100,
            }}
        >
            <POSHeading
                text={t('POS.OrderSummary')}
                sx={{
                    fontSize: { xs: 14, sm: 16 }, // smaller on small screens
                    fontWeight: 700,
                    mb: { xs: 1, sm: 2 },
                }}
            />

            <Grid2 container spacing={{ xs: 0.5, sm: 1 }}>
                {fields.map((field, index) => (
                    <Grid2 key={index} size={12}>
                        <Stack direction="row" justifyContent="space-between">
                            <POSHeading
                                text={field.label}
                                sx={{
                                    fontSize: field.id === 5 ? { xs: 14, sm: 16 } : { xs: 12, sm: 14 },
                                    fontWeight:
                                        field.id === 5 || (field.id === 2 && cart?.paidAmount && cart.paidAmount > 0)
                                            ? 600
                                            : 500,
                                }}
                            />
                            <POSHeading
                                text={field.value}
                                sx={{
                                    fontSize: field.id === 5 ? { xs: 14, sm: 16 } : { xs: 12, sm: 14 },
                                    fontWeight:
                                        field.id === 5 || (field.id === 2 && cart?.paidAmount && cart.paidAmount > 0)
                                            ? 600
                                            : 500,
                                    color:
                                        field.id === 2 && cart?.paidAmount && cart.paidAmount > 0 ? '#4CAF50' : 'black',
                                }}
                            />
                        </Stack>
                    </Grid2>
                ))}
            </Grid2>
        </Stack>
    );
}
