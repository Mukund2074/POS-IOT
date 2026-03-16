import React from 'react';
import { Modal, Paper, Stack, Typography, Box } from '@mui/material';
import { t } from 'i18next';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSButton from '@/components/POS/Common/POSButton';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';

interface BonusConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    customerBonusAmount: number;
    paymentAmount: number;
    customerName?: string;
}

export default function BonusConfirmationModal({
    open,
    onClose,
    onConfirm,
    customerBonusAmount,
    paymentAmount,
    customerName,
}: BonusConfirmationModalProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                zIndex: 1400,
            }}
        >
            <Paper
                sx={{
                    width: '100%',
                    maxWidth: { xs: '95%', md: 700 },
                    borderRadius: 2,
                    p: { xs: 2, sm: 3 },
                    textAlign: 'center',
                    position: 'relative',
                    mx: { xs: 1, sm: 0 },
                }}
            >
                {/* Header */}
                <Stack alignItems="center" mb={3}>
                    <Box
                        sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            backgroundColor: '#fff3e0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                        }}
                    >
                        <Typography sx={{ fontSize: 30 }}>⚠️</Typography>
                    </Box>

                    <POSHeading
                        text={t('POS.BonusAmountExceededTitle')}
                        sx={{ fontSize: 18, fontWeight: 600, mb: 1 }}
                    />
                </Stack>

                {/* Content */}
                <Stack spacing={2} mb={3} sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" color="text.secondary">
                        {customerName && `${customerName} `}
                        {t('POS.BonusAmountExceededDescription1')} {formatCurrency(customerBonusAmount)}
                        {t('POS.BonusAmountExceededDescription2')}
                    </Typography>

                    <Box
                        sx={{
                            backgroundColor: '#f5f5f5',
                            borderRadius: 1,
                            p: 2,
                            border: '1px solid #e0e0e0',
                        }}
                    >
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" fontWeight={500}>
                                {t('POS.PaymentAmount')}:
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                                {formatCurrency(paymentAmount)}
                            </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" fontWeight={500}>
                                {t('POS.AvailableBonus')}:
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="primary">
                                {formatCurrency(customerBonusAmount)}
                            </Typography>
                        </Stack>
                    </Box>
                </Stack>

                {/* Action Buttons */}
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    <POSButton
                        title={t('POS.CancelPayment')}
                        variant="f_outline"
                        onClick={handleCancel}
                        width={{ xs: '100%', sm: 'auto' }}
                    />
                    <POSButton
                        title={t('POS.ContinueWithPayment')}
                        variant="save"
                        onClick={handleConfirm}
                        width={{ xs: '100%', sm: 'auto' }}
                    />
                </Stack>
            </Paper>
        </Modal>
    );
}
