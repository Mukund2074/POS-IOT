import { Stack } from '@mui/material';
import moment from 'moment';
import { LuSquareMenu } from 'react-icons/lu';
import { t } from 'i18next';
import React, { useState } from 'react';
import { useCart } from '@/context/POS/CartContext';
import {
    GetApiProductsListing200,
    GetApiProductsListing200ProductsItem,
    GetApiProductsListing200ServicesItem,
    PostApiSaleBodyDataItemsItemItemType,
    PostApiSaleBodyDataItemsItemSaleType,
} from '@/shared/api/models';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSAccordion from '@/components/POS/Common/POSAccordion';
import { HiOutlineGift, HiOutlineReceiptRefund } from 'react-icons/hi';
import { ShoppingCartCheckoutRounded, StyleOutlined } from '@mui/icons-material';
import RefundModal from '../Create/Modals/RefundModal';
import CategoryList from './CategoryList';
import { usePOS } from '@/context/POS/POSContext';
import { CartOverride, ExtendedSaleItem } from '@/types/CartContext.type';
import CreatePunchCard from '../Create/Modals/PunchCard/CreatePunchCard';
import CreateGiftCardModal from '../Create/Modals/GiftCard/CreateGiftCardModal';
import { useSelector } from 'react-redux';

export const ItemCard = ({
    search,
    handleComponentChange,
}: {
    search: string;
    handleComponentChange: (component: number) => void;
}) => {
    const storeSettings = useSelector((state: any) => state?.settings?.data);
    const { addItem, cart } = useCart() as {
        addItem: (item: ExtendedSaleItem) => void;
        cart: CartOverride;
    };
    const { product: productData } = usePOS() as {
        product: { data: GetApiProductsListing200 | null; isLoading: boolean; error: any; refetch: () => void };
    };

    const [refundModalOpen, setRefundModalOpen] = useState(false);
    const [createGiftCardModalOpen, setCreateGiftCardModalOpen] = useState(false);
    const [createPunchCardModalOpen, setCreatePunchCardModalOpen] = useState(false);
    const custolineID = `custom-line-product-${moment().unix()}`;

    const [openItemId, setOpenItemId] = useState<string | null>(null);
    const [servicesAccordionOpen, setServicesAccordionOpen] = useState(false);

    const filteredProducts = productData?.data?.products
        ?.filter((category) => {
            return category.products?.length > 0 && category.products.some((product) => {
                return (
                    product.name.toLowerCase().includes(search.toLowerCase()) ||
                    product.brand?.toLowerCase().includes(search.toLowerCase())
                );
            });
        })
        .map((category) => ({
            ...category,
            products: category.products.filter((product) => {
                return (
                    product.name.toLowerCase().includes(search.toLowerCase()) ||
                    product.brand?.toLowerCase().includes(search.toLowerCase())
                );
            }),
        })) ?? [];

    const filteredServices = productData?.data?.services
        ?.filter((serviceGroup) => {
            return serviceGroup.services?.length > 0 && serviceGroup.services.some((service) => {
                return service.name.toLowerCase().includes(search.toLowerCase());
            });
        })
        .map((serviceGroup) => ({
            ...serviceGroup,
            services: serviceGroup.services.filter((service) => {
                return service.name.toLowerCase().includes(search.toLowerCase());
            }),
        })) ?? [];


    return (
        <Stack
            sx={{
                overflow: 'hidden',
                scrollbarWidth: 'none',
                overflowY: 'scroll',
                height: { xs: 'auto', md: '100%' },
            }}
        >
            <Stack
                sx={{
                    cursor: 'pointer',
                    p: 2,
                    '&:hover': { backgroundColor: '#f0f0f099' },
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 1,
                    width: '100%',
                }}
                onClick={() => {
                    addItem({
                        productId: custolineID,
                        quantity: 1,
                        amount: 0,
                        price: 0,
                        itemName: t('POS.CustomLine'),
                        discountAmount: 0,
                        discountType: 'VARIABLE_PERCENTAGE',
                        discounts: [],
                        employeeId: cart?.sellBy,
                        saleType: PostApiSaleBodyDataItemsItemSaleType.SALE,
                        itemType: PostApiSaleBodyDataItemsItemItemType.PRODUCT,
                    });
                }}
            >
                <POSHeading
                    text={t('POS.CustomLine')}
                    sx={{
                        fontSize: 14,
                        fontWeight: 600,
                        width: '100%',
                    }}
                />
                <LuSquareMenu size={20} />
            </Stack>

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
                    setRefundModalOpen(true);
                }}
            >
                <POSHeading
                    text={t('POS.RefundProducts')}
                    sx={{
                        fontSize: 14,
                        fontWeight: 600,
                        width: '100%',
                    }}
                />
                <HiOutlineReceiptRefund size={20} />
            </Stack>

            {storeSettings?.profile?.outlet_addons?.some((addon: any) => addon?.addon_name === 'GiftCard') && (
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
                        setCreateGiftCardModalOpen(true);
                    }}
                >
                    <POSHeading
                        text={t('GiftCard.SellGiftCard')}
                        sx={{
                            fontSize: 14,
                            fontWeight: 600,
                            width: '100%',
                        }}
                    />
                    <HiOutlineGift size={20} />
                </Stack>
            )}

            {storeSettings?.profile?.outlet_addons?.some((addon: any) => addon?.addon_name === 'PunchCard') && (
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
                        setCreatePunchCardModalOpen(true);
                    }}
                >
                    <POSHeading
                        text={t('PunchCard.SellPunchCard')}
                        sx={{
                            fontSize: 14,
                            fontWeight: 600,
                            width: '100%',
                        }}
                    />
                    <StyleOutlined sx={{ fontSize: 20 }} />
                </Stack>
            )}

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
                    handleComponentChange(2);
                }}
            >
                <POSHeading
                    text={t('POS.PreviousSales')}
                    sx={{
                        fontSize: 14,
                        fontWeight: 600,
                        width: '100%',
                    }}
                />
                <ShoppingCartCheckoutRounded sx={{ fontSize: 20 }} />
            </Stack>

            {filteredServices &&
                filteredServices.length > 0 &&
                (
                    <POSAccordion
                        title={<POSHeading sx={{ fontSize: 14, fontWeight: 400, px: 2 }} text={t('Common.Services')} />}
                        expanded={
                            servicesAccordionOpen ||
                            search?.length > 1 ||
                            (openItemId !== null &&
                                filteredServices?.some(
                                    (serviceGroup: GetApiProductsListing200ServicesItem) =>
                                        serviceGroup.id.toString() === openItemId,
                                ))
                        }
                        onChange={(_, expanded) => {
                            setServicesAccordionOpen(expanded);
                            // this will allow direct close the perent accordion
                            if (!expanded) {
                                setOpenItemId(null);
                            }
                        }}
                        sx={{
                            p: 0,
                            width: '100%',
                            m: 0,
                            '&.Mui-expanded': {
                                m: 0,
                            },
                        }}
                        summarySx={{
                            border: '1px solid #d9d9d9',
                            // backgroundColor: '#f0f0f0',
                            p: 0,
                            px: 2,
                            m: 0,
                        }}
                        detailsSx={{ p: 0, ml: 1 }}
                    >
                        {filteredServices?.map((serviceGroup: GetApiProductsListing200ServicesItem) => (
                                    <CategoryList
                                        key={serviceGroup.id}
                                        category={serviceGroup}
                                        search={search}
                                        openItemId={openItemId}
                                        onExpand={(idx) => {
                                            setOpenItemId(idx);
                                        }}
                                        accesKey="services"
                                    />
                                ))}
                    </POSAccordion>
                )}

            <React.Fragment>
                {filteredProducts?.length > 0 &&
                    filteredProducts.map((category: GetApiProductsListing200ProductsItem) => (
                        <CategoryList
                            key={category.id}
                            category={category}
                            search={search}
                            accesKey="products"
                            openItemId={openItemId}
                            onExpand={(idx) => {
                                setOpenItemId(idx);
                            }}
                        />
                    ))}
            </React.Fragment>

            {refundModalOpen && <RefundModal open={refundModalOpen} onClose={() => setRefundModalOpen(false)} />}
            {createGiftCardModalOpen && (
                <CreateGiftCardModal
                    open={createGiftCardModalOpen}
                    onClose={() => setCreateGiftCardModalOpen(false)}
                    services={productData?.data?.services ?? []}
                />
            )}

            {createPunchCardModalOpen && (
                <CreatePunchCard open={createPunchCardModalOpen} onClose={() => setCreatePunchCardModalOpen(false)} />
            )}
        </Stack>
    );
};
