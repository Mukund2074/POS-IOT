import { Close } from '@mui/icons-material';
import { IconButton, Modal, Paper, Stack, Typography, Divider } from '@mui/material';
import React from 'react';
import { calculatedData } from './Types/punch-card-sale.types';
import POSHeading from '@/components/POS/Common/POSHeading';
import { t } from 'i18next';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import POSButton from '@/components/POS/Common/POSButton';

interface PunchCardPaymentSummaryProps {
    open: boolean;
    onClose: () => void;
    summary: calculatedData | null;
    onContinue: () => void;
}

export default function PunchCardPaymentSummary({ open, onClose, summary, onContinue }: PunchCardPaymentSummaryProps) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
            }}
        >
            <Paper
                sx={{
                    maxHeight: '90%',
                    width: { xs: '90%', md: 600 },
                    overflow: 'auto',
                    borderRadius: 4,
                    position: 'relative',
                    p: 3,
                }}
            >
                <IconButton
                    sx={{ position: 'absolute', top: 2, right: 2 }}
                    onClick={onClose}
                    disableFocusRipple
                    disableTouchRipple
                    disableRipple
                >
                    <Close />
                </IconButton>

                <POSHeading text={t('PunchCard.PaymentSummary')} />

                {summary ? (
                    <Stack sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2, width: '100%' }}>
                        {/* ✅ Succeeded Items */}
                        <Stack>
                            <Typography fontWeight={600} variant="h6" color="success.main">
                                {t('PunchCard.SucceededItems')}
                            </Typography>
                            <Divider sx={{ my: 1, borderColor: '#000', borderWidth: '1px' }} />
                            {summary.succeededItems.length > 0 ? (
                                summary.succeededItems.map((item) => (
                                    <Stack
                                        key={item.serviceId}
                                        direction="row"
                                        justifyContent="space-between"
                                        sx={{ py: 0.5 }}
                                    >
                                        <Typography>{item.serviceName}</Typography>
                                        <Typography>
                                            {item.cartQty} × {formatCurrency(item.amount)} ={' '}
                                            {formatCurrency(item.amount * item.cartQty)}
                                        </Typography>
                                    </Stack>
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    {t('PunchCard.NoSucceeded')}
                                </Typography>
                            )}
                        </Stack>

                        {/* ❌ Failed Items */}
                        {summary?.failedItems?.length > 0 && (
                            <Stack>
                                <Typography fontWeight={600} variant="h6" color="error.main">
                                    {t('PunchCard.FailedItems')}
                                </Typography>
                                <Divider sx={{ my: 1, borderColor: '#000', borderWidth: '1px' }} />
                                {summary.failedItems.map((item) => (
                                    <Stack
                                        key={item.serviceId}
                                        direction="row"
                                        justifyContent="space-between"
                                        sx={{ py: 0.5 }}
                                    >
                                        <Typography>{item.serviceName}</Typography>
                                        <Typography>
                                            {item.cartQty} × {formatCurrency(item.amount)} ={' '}
                                            {formatCurrency(item.amount * item.cartQty)}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        )}

                        {/* Totals */}
                        <Stack sx={{ mt: 4 }}>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography fontWeight={700}>{t('POS.TotalAmount')}</Typography>
                                <Typography fontWeight={700}>{formatCurrency(summary.totals.totalAmount)}</Typography>
                            </Stack>
                            <Divider sx={{ my: 1, borderColor: '#000', borderWidth: '1px' }} />
                            <Stack direction="row" justifyContent="space-between">
                                <Typography fontWeight={600}>{t('PunchCard.CoveredByPunchCard')}</Typography>
                                <Typography fontWeight={600}>
                                    {formatCurrency(summary.totals.totalCoveredByPunch)}
                                </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography fontWeight={600}>{t('PunchCard.RemainingToPay')}</Typography>
                                <Typography fontWeight={600}>
                                    {formatCurrency(summary.totals.totalRemaining)}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Stack>
                ) : (
                    <Typography mt={2}>{t('PunchCard.NoSummaryYet')}</Typography>
                )}

                <Stack
                    sx={{
                        mt: 2,
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'flex-end',
                        width: '100%',
                        gap: 1,
                    }}
                >
                    <POSButton
                        sx={{ ml: 'auto', bgcolor: '#d2d2d2' }}
                        width={{ xs: '100%', md: 'auto' }}
                        variant="save"
                        onClick={() => onClose()}
                        title={t('Setting.Cancel')}
                    />
                    <POSButton
                        width={{ xs: '100%', md: 'auto' }}
                        variant="save"
                        onClick={() => onContinue()}
                        title={t('POS.Apply')}
                    />
                </Stack>
            </Paper>
        </Modal>
    );
}
