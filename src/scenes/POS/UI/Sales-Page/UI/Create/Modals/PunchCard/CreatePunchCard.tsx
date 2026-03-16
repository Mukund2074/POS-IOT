import POSHeading from '@/components/POS/Common/POSHeading';
import { useCart } from '@/context/POS/CartContext';
import FilterAndList from '@/scenes/PunchCard/PAGES/punch-card/UI/List/FilterAndList';
import { PostApiSaleBodyDataItemsItem, PostApiSaleBodyDataItemsItemItemType } from '@/shared/api/models';
import { GetApiBundleOffers200ItemsItem } from '@/shared/api/models/getApiBundleOffers200ItemsItem';
import { CartOverride } from '@/types/CartContext.type';
import { Close, StyleOutlined } from '@mui/icons-material';
import { IconButton, Modal, Paper, Stack } from '@mui/material';
import { t } from 'i18next';
import React from 'react';

interface CreatePunchCardProps {
    open: boolean;
    onClose: () => void;
}

export default function CreatePunchCard({ open, onClose }: CreatePunchCardProps) {
    const { cart, addItem } = useCart() as {
        cart: CartOverride;
        addItem: (item: PostApiSaleBodyDataItemsItem) => void;
    };

    const handleApplyClick = (selectedItem: GetApiBundleOffers200ItemsItem) => {
        if (selectedItem) {
            // Handle the case when an item is selected

            const cartItem = {
                employeeId: cart?.sellBy,
                itemName: selectedItem.name,
                itemType: 'CUT_CARD' as PostApiSaleBodyDataItemsItem['itemType'],
                saleType: 'SALE' as PostApiSaleBodyDataItemsItem['saleType'],
                quantity: 1,
                amount: selectedItem.price,
                discountAmount: 0,
                discountPercentage: 0,
                taxAmount: 0,
                price: selectedItem.price ?? 0,
                note: '',
                description: selectedItem?.description || '',
                itemImageUrl: null,
                unitId: null,
                unitName: null,
                unitAbbreviation: null,
                categoryId: null,
                categoryName: '',
                discountType: 'VARIABLE_PERCENTAGE' as PostApiSaleBodyDataItemsItem['discountType'],
                taxes: [],
                tax: [],
                bundleOffer: {
                    bundleOfferId: selectedItem.id,
                },
                discounts: [],
                subTotal: selectedItem.price ?? 0,
                productId: null,
                serviceId: null,
            };
            addItem(cartItem);
            onClose();
        }
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
                    maxWidth: { xs: '95%', md: '80%' },
                    minHeight: '50%',
                    maxHeight: { xs: '95%', md: '80%' },
                    borderRadius: 3,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    p: 3,
                    gap: 2,
                }}
            >
                <IconButton
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: 'text.secondary',
                    }}
                    onClick={onClose}
                >
                    <Close />
                </IconButton>

                <Stack direction="column" alignItems="center" spacing={2}>
                    <StyleOutlined sx={{ fontSize: { xs: 64, md: 128 }, color: '#847A71' }} />
                    <POSHeading text={t('PunchCard.SellPunchCard')} sx={{ fontSize: 20, fontWeight: 600 }} />
                </Stack>

                <FilterAndList asComponent onApplyClick={handleApplyClick} />
            </Paper>
        </Modal>
    );
}
