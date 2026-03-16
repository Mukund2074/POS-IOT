import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Stack, Grid2 } from '@mui/material';
import POSHeading from '@/components/POS/Common/POSHeading';
import { t } from 'i18next';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import POSInput from '@/components/POS/Common/POSInput';
import POSButton from '@/components/POS/Common/POSButton';
import { RefundFormValues, RefundItemsTabProps } from '../../Types/sales.types';

export default function RefundItemsTab({ cartOption, setCartOption, setSelectedTab }: RefundItemsTabProps) {
    // Set default values for refund quantities based on cartOption.items
    const { control, handleSubmit, setValue } = useForm<RefundFormValues>({
        defaultValues: {
            refundQuantities: cartOption.items.reduce(
                (acc, item) => {
                    acc[item.productId?.toString() ?? 'default'] = 0;
                    return acc;
                },
                {} as Record<string, number>,
            ),
        },
    });

    // Auto-fill refund quantities when cartOption.items change
    useEffect(() => {
        cartOption.items.forEach((item) => {
            setValue(`refundQuantities.${item.productId?.toString() ?? 'default'}`, 0);
        });
    }, [cartOption.items, setValue]);

    const onSubmit = (data: RefundFormValues) => {
        setCartOption({
            ...cartOption,
            items: cartOption.items.map((item) => ({
                ...item,
                quantity: data.refundQuantities[item.productId?.toString() ?? 'default'],
            })),
        });
        setSelectedTab('payment');
    };

    return (
        <Stack sx={{ minHeight: '50dvh', maxHeight: '80dvh', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {cartOption.items.length === 0 && (
                <Stack sx={{ height: '400px', justifyContent: 'center', alignItems: 'center' }}>
                    <POSHeading text={t('POS.NoItemsToRefund')} sx={{ textAlign: 'center', mb: 2 }} />
                </Stack>
            )}

            {cartOption?.items?.length > 0 && (
                <React.Fragment>
                    <POSHeading text={t('POS.SelectItemQtyDesc')} sx={{ mb: 2 }} />
                    <Stack sx={{ width: '100%', border: '2px solid #e0e0e0', borderRadius: 2, position: 'relative' }}>
                        <Grid2
                            container
                            spacing={2}
                            sx={{ px: 2, py: 2, position: 'sticky', top: 0, backgroundColor: '#d2d2d2' }}
                        >
                            <Grid2 size={6}>
                                <POSHeading sx={{ fontSize: '1rem', fontWeight: 600 }} text={t('POS.ProductName')} />
                            </Grid2>
                            <Grid2 size={3}>
                                <POSHeading sx={{ fontSize: '1rem', fontWeight: 600 }} text={t('Common.Price')} />
                            </Grid2>
                            <Grid2 size={3}>
                                <POSHeading sx={{ fontSize: '1rem', fontWeight: 600 }} text={t('POS.Quantity')} />
                            </Grid2>
                        </Grid2>
                        <Stack sx={{ maxHeight: '40dvh', overflow: 'scroll', scrollbarWidth: 'none' }}>
                            {cartOption.items.map((item, index) => (
                                <Grid2
                                    container
                                    spacing={2}
                                    sx={{
                                        borderTop: '1px solid #e0e0e0',
                                        px: 2,
                                        py: 0.5,
                                        bgcolor: index % 2 !== 0 ? '#f0f0f0' : '#fff',
                                    }}
                                    key={index}
                                >
                                    <Grid2 size={6}>
                                        <POSHeading
                                            sx={{
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                color: '#1f1f1f',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxWidth: '100%',
                                                display: 'block',
                                                textAlign: 'left',
                                                textWrap: 'nowrap',
                                                overflowWrap: 'normal',
                                            }}
                                            text={item.itemName ?? ''}
                                        />
                                    </Grid2>
                                    <Grid2 size={3}>
                                        <POSHeading
                                            sx={{ fontSize: '1rem', fontWeight: 600 }}
                                            text={formatCurrency(item.price ?? 0)}
                                        />
                                    </Grid2>
                                    <Grid2 size={3}>
                                        <Controller
                                            name={`refundQuantities.${item.productId?.toString() ?? 'default'}`}
                                            control={control}
                                            rules={{
                                                validate: (value) =>
                                                    value <= (item.netQuantity ?? 0) || t('POS.RefundExceedsPurchase'),
                                            }}
                                            render={({ field, fieldState }) => (
                                                <POSInput
                                                    {...field}
                                                    sx={{ width: '100%' }}
                                                    InputProps={{
                                                        type: 'number',
                                                        inputProps: {
                                                            min: 0,
                                                            max: item.netQuantity ?? 0,
                                                            style: {
                                                                textAlign: 'center',
                                                            },
                                                        },
                                                    }}
                                                    error={!!fieldState.error}
                                                    helperText={fieldState.error ? fieldState.error.message : ''}
                                                />
                                            )}
                                        />
                                    </Grid2>
                                </Grid2>
                            ))}
                        </Stack>
                    </Stack>
                </React.Fragment>
            )}

            <POSButton
                title={cartOption.items.length === 0 ? t('Common.Continue') : t('POS.Refund')}
                variant="save"
                type="submit"
                sx={{ mt: 'auto', ml: 'auto' }}
                onClick={handleSubmit(onSubmit)}
            />
        </Stack>
    );
}
