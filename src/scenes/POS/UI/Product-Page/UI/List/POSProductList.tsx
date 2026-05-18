import { Skeleton, Stack, Typography } from '@mui/material';
import React from 'react';
import POSCheckbox from '@/components/POS/Common/POSCheckbox';
import { t } from 'i18next';
import {
    GetApiProductCategories200Item,
    GetApiProductsListing200ProductsItem,
    GetApiProductsListing200ProductsItemProductsItem,
} from '@/shared/api/models';
import POSHeading from '@/components/POS/Common/POSHeading';
import { ArrowForward } from '@mui/icons-material';
import Permission from '@/utils/POS/Permission';
const DeleteIcon: string = require('@/assets/Delete.svg').default;
const EditIcon: string = require('@/assets/editProduct.svg').default;

export default function POSProductList({
    categories,
    handleCategoryCheck,
    handleProductCheck,
    handleProductClick,
    selectedCategory,
    selectedProduct,
    handleEditCategory,
    handleDeleteCategory,
    loading,
}: {
    categories: GetApiProductsListing200ProductsItem[];
    handleCategoryCheck: ({ category }: { category: GetApiProductsListing200ProductsItem }) => void;
    handleProductCheck: ({ product }: { product: GetApiProductsListing200ProductsItemProductsItem }) => void;
    handleProductClick: ({ product }: { product: GetApiProductsListing200ProductsItemProductsItem }) => void;
    selectedCategory: GetApiProductCategories200Item[];
    selectedProduct: GetApiProductsListing200ProductsItemProductsItem[];
    handleEditCategory: ({ category }: { category: GetApiProductCategories200Item }) => void;
    handleDeleteCategory: ({ category }: { category: GetApiProductCategories200Item }) => void;
    loading: boolean;
}) {
    if (loading) return <POSProductListSkeleton />;

    const { isAllowed } = Permission();
    const isAllowedToEdit = isAllowed('Category', 'update');
    const isAllowedToDelete = isAllowed('Category', 'delete');

    // no data found hadle
    if (!loading && categories?.length === 0) {
        return (
            <Stack sx={{ width: '100%', p: 0, overflowX: 'scroll', scrollbarWidth: 'none', pb: 20 }}>
                <POSHeading sx={{ textAlign: 'center', mt: 10 }} text={t('Customer.NoDataFound')} />
            </Stack>
        );
    }

    return (
        <Stack
            sx={{
                width: '100%',
                p: 0,
                overflowX: 'scroll',
                scrollbarWidth: 'none',
                pb: 20,
            }}
        >
            {categories?.length > 0 &&
                categories.map((category) => {
                    return (
                        <Stack sx={{ py: 1 }} key={category.id}>
                            <Stack
                                sx={{
                                    display: category?.id === '0' && category?.products?.length === 0 ? 'none' : 'flex',
                                    flexDirection: 'row',
                                    backgroundColor: '#d7d7d7',
                                    borderRadius: '15px',
                                    border: '1px solid #D9D9D9',
                                    alignItems: 'center',
                                    maxHeight: 40,
                                    py: 2,
                                    px: 3,
                                    gap: 1,
                                }}
                            >
                                {category?.id !== '0' &&
                                    (isAllowed('Product', 'update') || isAllowed('Product', 'delete')) && (
                                        <POSCheckbox
                                            onClick={() => handleCategoryCheck({ category })}
                                            checked={selectedCategory.some((c) => c.id === category.id)}
                                        />
                                    )}
                                {category?.id === '0' ? t('POS.UnCatProds') : category?.name}
                                <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 2, ml: 'auto' }}>
                                    {category?.id !== '0' && isAllowedToEdit && (
                                        <img
                                            style={{ cursor: 'pointer' }}
                                            alt=""
                                            src={EditIcon}
                                            onClick={() => handleEditCategory({ category })}
                                        />
                                    )}
                                    {category?.id !== '0' && isAllowedToDelete && (
                                        <img
                                            style={{ cursor: 'pointer' }}
                                            alt=""
                                            src={DeleteIcon}
                                            onClick={() => handleDeleteCategory({ category })}
                                        />
                                    )}
                                </Stack>
                            </Stack>
                            <Stack sx={{ flex: 1, width: '100%', gap: 1, pl: { xs: 1, md: 5 }, pt: 2 }}>
                                {category?.products?.map(
                                    (product: GetApiProductsListing200ProductsItemProductsItem) => {
                                        return (
                                            <Stack
                                                key={product.id}
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    backgroundColor: '#fff',
                                                    borderRadius: '15px',
                                                    border: '1px solid #D9D9D9',
                                                    alignItems: 'center',
                                                    maxHeight: 40,
                                                    py: 2,
                                                    px: 1,
                                                    gap: 1,
                                                }}
                                            >
                                                {(isAllowed('Product', 'update') || isAllowed('Product', 'delete')) && (
                                                    <POSCheckbox
                                                        sx={{
                                                            cursor:
                                                                isAllowed('Product', 'update') ||
                                                                isAllowed('Product', 'delete')
                                                                    ? 'pointer'
                                                                    : 'default',
                                                        }}
                                                        onClick={() => {
                                                            if (
                                                                isAllowed('Product', 'update') ||
                                                                isAllowed('Product', 'delete')
                                                            ) {
                                                                handleProductCheck({ product });
                                                            }
                                                        }}
                                                        checked={selectedProduct.some((p) => p.id === product.id)}
                                                    />
                                                )}
                                                <Typography
                                                    noWrap
                                                    onClick={() => {
                                                        if (isAllowed('Product', 'update')) {
                                                            handleProductClick({ product });
                                                        }
                                                    }}
                                                    sx={{
                                                        width: '100%',
                                                        cursor: isAllowed('Product', 'update') ? 'pointer' : 'default',
                                                        display: 'flex',
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        px: 1,
                                                    }}
                                                >
                                                    {product.name}
                                                    {isAllowed('Product', 'update') && (
                                                        <ArrowForward
                                                            sx={{ fontSize: 20, color: '#44B904', marginLeft: 'auto' }}
                                                        />
                                                    )}
                                                </Typography>
                                            </Stack>
                                        );
                                    },
                                )}
                            </Stack>
                        </Stack>
                    );
                })}
        </Stack>
    );
}

export function POSProductListSkeleton() {
    return (
        <Stack
            sx={{
                width: '100%',
                p: 0,
                overflowX: 'scroll',
                scrollbarWidth: 'none',
                pb: 20,
            }}
        >
            {[1, 2, 3].map((catIndex) => (
                <Stack sx={{ py: 1 }} key={catIndex}>
                    {/* Category skeleton */}
                    <Stack
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            backgroundColor: '#d7d7d7',
                            borderRadius: '15px',
                            border: '1px solid #D9D9D9',
                            alignItems: 'center',
                            maxHeight: 40,
                            py: 2,
                            px: 3,
                            gap: 1,
                        }}
                    >
                        <Skeleton variant="circular" width={20} height={20} />
                        <Skeleton variant="text" width={120} height={20} />
                        <Skeleton variant="rectangular" width={20} height={20} sx={{ marginLeft: 'auto' }} />
                        <Skeleton variant="rectangular" width={20} height={20} />
                    </Stack>

                    {/* Product skeletons */}
                    <Stack sx={{ flex: 1, width: '100%', gap: 1, pl: { xs: 1, md: 5 }, pt: 2 }}>
                        {[1, 2, 3].map((prodIndex) => (
                            <Stack
                                key={`${catIndex}-${prodIndex}`}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    backgroundColor: '#fff',
                                    borderRadius: '15px',
                                    border: '1px solid #D9D9D9',
                                    alignItems: 'center',
                                    maxHeight: 40,
                                    py: 2,
                                    px: 1,
                                    gap: 1,
                                }}
                            >
                                <Skeleton variant="circular" width={20} height={20} />
                                <Skeleton variant="text" width="100%" height={20} />
                            </Stack>
                        ))}
                    </Stack>
                </Stack>
            ))}
        </Stack>
    );
}
