import React from 'react';
import { IconButton, Modal, Paper, Stack } from '@mui/material';
import { Close } from '@mui/icons-material';
import POSHeading from '@/components/POS/Common/POSHeading';
import { GetApiCustomers200CustomersItem } from '@/shared/api/models';
import POSButton from '@/components/POS/Common/POSButton';
import { t } from 'i18next';
import { useCart } from '@/context/POS/CartContext';

export default function OutstandigConfirmation({
    open,
    onClose,
    customer,
}: {
    open: boolean;
    onClose: () => void;
    customer: GetApiCustomers200CustomersItem | undefined;
}) {
    const { addItem, cart } = useCart();

    const handleAddOutstanding = () => {
        addItem({
            itemName: t('POS.Outstanding'),
            quantity: 1,
            price: customer?.outstandingAmount?.toFixed(2) ?? 0,
            amount: customer?.outstandingAmount?.toFixed(2) ?? 0,
            discount: 0,
            discounts: [],
            productId: null,
            serviceId: null,
            itemType: 'OUTSTANDING',
            saleType: 'SALE',
            tax: [],
            taxs: [],
            employeeId: cart?.sellBy,
        });

        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            disableAutoFocus
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
                    maxWidth: 600,
                    maxHeight: { xs: '80%', md: '30%' },
                    overflow: 'auto',
                    borderRadius: 4,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 3,
                }}
            >
                <IconButton sx={{ position: 'absolute', top: 0, right: 0 }} onClick={onClose}>
                    <Close />
                </IconButton>
                {/* The customer has an outstanding on 6000 ₹
Do you want to add the outstanding amount to the customer's expense right away
 */}

                <POSHeading
                    text={`${t('POS.OutstandingConfirmationDesc')} ${customer?.outstandingAmount.toFixed(2) ?? ''} ₹`}
                />
                <POSHeading text={t('POS.OutstandingConfirmationDesc2')} sx={{ fontSize: 15, fontWeight: 400 }} />
                <Stack
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        gap: 2,
                        width: '100%',
                        mt: 5,
                    }}
                >
                    <POSButton
                        title={t('POS.DoNotAdd')}
                        sx={{ bgcolor: '#d2d2d2' }}
                        variant="save"
                        onClick={() => {
                            onClose();
                        }}
                        width={{ xs: '100%', md: 'auto' }}
                    />
                    <POSButton
                        title={t('POS.AddOutstanding')}
                        variant="save"
                        onClick={handleAddOutstanding}
                        width={{ xs: '100%', md: 'auto' }}
                    />
                </Stack>
            </Paper>
        </Modal>
    );
}
