import POSButton from '@/components/POS/Common/POSButton';
import { GetApiCustomers200CustomersItemGiftCardsItem } from '@/shared/api/models';
import { CardGiftcard, Close } from '@mui/icons-material';
import { Alert, IconButton, Modal, Paper, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import React from 'react';
import { UseGiftCardConfirmProps } from '../../../../Types/sales.types';

export default function UseGiftCardConfirm({
    open,
    onClose,
    onConfirm,
    predefinedAmount,
    amountComparison,
    pendingGiftCard,
    setPendingGiftCard,
    setAmountComparison,
    setActiveGiftCards,
}: UseGiftCardConfirmProps) {
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
                    width: '100%',
                    maxWidth: 500,
                    borderRadius: 4,
                    position: 'relative',
                    p: 3,
                }}
            >
                <IconButton sx={{ position: 'absolute', top: 2, right: 2 }} onClick={onClose}>
                    <Close />
                </IconButton>

                <Stack spacing={3} alignItems="center">
                    <CardGiftcard sx={{ fontSize: 64, color: '#ff9800' }} />

                    <Typography variant="h6" textAlign="center">
                        {t('POS.GiftCardAmountComparison')}
                    </Typography>

                    <Stack spacing={2} width="100%">
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1" color="text.secondary">
                                {t('POS.GiftCardAmount')}:
                            </Typography>
                            <Typography variant="h6" color="primary">
                                {amountComparison?.residueValue || 0} ₹.
                            </Typography>
                        </Stack>

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1" color="text.secondary">
                                {predefinedAmount && predefinedAmount > 0
                                    ? t('POS.RequestedAmount')
                                    : t('POS.RequiredAmount')}
                                :
                            </Typography>
                            <Typography variant="h6" color="error">
                                {amountComparison?.requiredAmount || 0} ₹.
                            </Typography>
                        </Stack>

                        <Alert severity="warning" sx={{ mt: 2 }}>
                            {predefinedAmount && predefinedAmount > 0
                                ? t('POS.GiftCardInsufficientForRequestedAmount')
                                : t('POS.GiftCardInsufficientAmount')}
                        </Alert>
                    </Stack>

                    <Stack direction="row" spacing={2} width="100%">
                        <POSButton
                            title={t('POS.Cancel')}
                            variant="f_outline"
                            onClick={() => {
                                onClose();
                                setPendingGiftCard(null);
                                setAmountComparison(null);
                            }}
                            width="50%"
                        />
                        <POSButton
                            title={t('POS.UseAnyway')}
                            variant="save"
                            onClick={() => {
                                if (pendingGiftCard) {
                                    setActiveGiftCards((prev: GetApiCustomers200CustomersItemGiftCardsItem[]) =>
                                        prev.map((card) =>
                                            card.giftCardCode === pendingGiftCard.code
                                                ? {
                                                      ...card,
                                                      residueValue: card.residueValue - pendingGiftCard.residueValue,
                                                  }
                                                : card,
                                        ),
                                    );
                                    onConfirm(pendingGiftCard?.id || '', pendingGiftCard.residueValue);
                                    onClose();
                                }
                                onClose();
                                setPendingGiftCard(null);
                                setAmountComparison(null);
                            }}
                            width="50%"
                        />
                    </Stack>
                </Stack>
            </Paper>
        </Modal>
    );
}
