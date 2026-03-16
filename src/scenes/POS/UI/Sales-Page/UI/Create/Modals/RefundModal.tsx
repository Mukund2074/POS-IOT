import { IconButton, Modal, Paper, Stack } from '@mui/material';
import React, { useState } from 'react';
import POSHeading from '@/components/POS/Common/POSHeading';
import { t } from 'i18next';
import { Close, ShoppingCartCheckoutRounded } from '@mui/icons-material';
import POSInput from '@/components/POS/Common/POSInput';
import PreviousSales from '../../Shared/PreviousSales';
import CategoryList from '../../Shared/CategoryList';
import { usePOS } from '@/context/POS/POSContext';
import { GetApiProductsListing200 } from '@/shared/api/models';

export default function RefundModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [currentComponent, setCurrentComponent] = useState(0);
    const [search, setSearch] = useState('');
    const handleClose = () => {
        onClose();
    };
    const { product: productData } = usePOS() as {
        product: { data: GetApiProductsListing200 | null; isLoading: boolean; error: any; refetch: () => void };
    };

    const [openItemId, setOpenItemId] = useState<string | null>(null);

    const renderComponent = () => {
        switch (currentComponent) {
            case 0:
                return (
                    <React.Fragment>
                        <POSInput
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('Common.Search')}
                            sx={{ width: '100%', mb: 2 }}
                            borderColor="transparent"
                            borderRadius="0"
                        />

                        <Stack
                            sx={{
                                cursor: 'pointer',
                                p: 2,
                                backgroundColor: '#f0f0f0',
                                border: '1px solid #d9d9d9',
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: 1,
                                width: '100%',
                            }}
                            onClick={() => {
                                setCurrentComponent(1);
                            }}
                        >
                            <POSHeading
                                text={t('POS.RefundPreviousSales')}
                                sx={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    width: '100%',
                                }}
                            />
                            <ShoppingCartCheckoutRounded sx={{ fontSize: 20 }} />
                        </Stack>

                        {/* {(isLoadingProducts || isDebouncing) && search.length >= 2 && (
                            <Stack sx={{ p: 2, textAlign: 'center' }}>
                                <POSHeading text={t('Common.Loading')} sx={{ fontSize: 14 }} />
                            </Stack>
                        )} */}

                        {search.length > 0 && search.length < 2 && (
                            <Stack sx={{ p: 2, textAlign: 'center' }}>
                                <POSHeading
                                    text={t('Common.MinimumSearchLength', { length: 2 })}
                                    sx={{ fontSize: 14, color: 'text.secondary' }}
                                />
                            </Stack>
                        )}

                        {!productData?.isLoading &&
                            // !isDebouncing &&
                            productData?.data?.products &&
                            productData?.data?.products.length > 0 &&
                            productData?.data?.products
                                .filter((p) => p.name?.length > 0)
                                .filter((p) => p.products?.length > 0)
                                .map((product) => (
                                    <CategoryList
                                        category={product}
                                        search={search}
                                        accesKey={'products'}
                                        asRefund={true}
                                        openItemId={openItemId}
                                        onExpand={(idx) => {
                                            setOpenItemId(idx);
                                        }}
                                    />
                                ))}

                        {!productData?.isLoading &&
                            (!productData?.data?.products ||
                                productData?.data?.products.length === 0 ||
                                productData?.data?.products.filter((p) => p.name?.length > 0).length === 0) && (
                                <Stack sx={{ p: 2, textAlign: 'center' }}>
                                    <POSHeading
                                        text={t('Common.NoResultsFound')}
                                        sx={{ fontSize: 14, color: 'text.secondary' }}
                                    />
                                </Stack>
                            )}
                    </React.Fragment>
                );
            case 1:
                return (
                    <PreviousSales
                        asRefund={true}
                        handleComponentChange={() => {
                            setCurrentComponent(0);
                        }}
                        search={search}
                    />
                );
        }
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            keepMounted
            disableAutoFocus
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Paper
                sx={{
                    position: 'relative',
                    width: { xs: '90%', md: '50%' },
                    height: { xs: '70%', md: '50%' },
                    overflow: 'hidden',
                    overflowY: 'scroll',
                    scrollbarWidth: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    p: { xs: 1, md: 4 },
                    // forcefully set z-index to 1001 to avoid overlapping with sidebar
                    zIndex: 1001,
                }}
            >
                <IconButton sx={{ position: 'absolute', right: 2, top: 2 }} onClick={handleClose}>
                    <Close />
                </IconButton>

                <POSHeading text={t('POS.Refund')} />

                <Stack
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        height: '100%',
                        border: '1px solid #d9d9d9',
                        borderRadius: 2,
                        overflow: 'hidden',
                        overflowY: 'scroll',
                        scrollbarWidth: 'none',
                    }}
                >
                    {renderComponent()}
                </Stack>
            </Paper>
        </Modal>
    );
}
