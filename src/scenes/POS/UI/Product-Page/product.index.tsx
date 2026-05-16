import { Stack } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { t } from 'i18next';
import { Menu,  } from '@mui/icons-material';
import CreateCategory from './UI/Modals/CreateCategory';
import POSProductList from './UI/List/POSProductList';
import { productHandler } from './Core/product.handler';
import EditProductItems from './UI/Modals/EditProductItems';
import { useNavigate } from 'react-router-dom';
import {
    GetApiProductCategories200Item,
    GetApiProductsListing200,
    GetApiProductsListing200ProductsItem,
    GetApiProductsListing200ProductsItemProductsItem,
    PostApiProductCategoriesBody,
    PutApiProductCategoriesId200,
    PutApiUpdateProductsBodyDataItem,
} from '@/shared/api/models';
import POSInput from '@/components/POS/Common/POSInput';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSButton from '@/components/POS/Common/POSButton';
import POSDeleteModal from '@/components/POS/Common/POSDeleteModal';
import { usePOS } from '@/context/POS/POSContext';
import { useCreateProductCategory, useDeleteProductCategory, useUpdateProductCategory } from '@/hooks/api/pos/products';
import { useDeleteProducts, useUpdateProducts } from '@/hooks/api/pos/products/useProducts';
import POSProductMultiEdit from './UI/Modals/EditMultiProductForm';
import Permission from '@/utils/POS/Permission';

export default function POSProducts() {
    const [boolState, setBoolState] = useState<{
        [key: string]: boolean;
    }>({
        categoryModal: false,
        categoryDeleteModal: false,
        multiProductModal: false,
        deleteMultiProductModal: false,
        exportModal: false,
    });

    const { product } = usePOS() as {
        product: { data: GetApiProductsListing200 | null; isLoading: boolean; error: any; refetch: () => void };
    };

    const { mutate: createCategory } = useCreateProductCategory();
    const { mutate: updateCategory } = useUpdateProductCategory();
    const { mutate: deleteCategory } = useDeleteProductCategory();
    const { mutate: deleteProducts } = useDeleteProducts();
    const { mutate: updateProducts } = useUpdateProducts({ data: [] });
    const [apiData, setApiData] = useState<GetApiProductsListing200ProductsItem[] | null>(product.data?.products ?? []);
    const [selectedCategory, setSelectedCategory] = useState<GetApiProductCategories200Item[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<GetApiProductsListing200ProductsItemProductsItem[]>([]);
    const [categoryToEdit, setCategoryToEdit] = useState<GetApiProductCategories200Item | null>(null);
    const [searchText, setSearchText] = useState<string>('');
    const { isAllowed } = Permission();

    const navigate = useNavigate();

    useEffect(() => {
        setApiData(product.data?.products ?? []);
    }, [product.data]);

    const handleSearch = (value: string) => {
        setSearchText(value);

        const filteredCategories =
            product?.data?.products
                ?.map((category) => {
                    const filteredProducts = category.products?.filter(
                        (p) =>
                            p.name?.toLowerCase().includes(value.toLowerCase()) ||
                            p.brand?.toLowerCase().includes(value.toLowerCase()),
                    );

                    return filteredProducts?.length ? { ...category, products: filteredProducts } : null;
                })
                .filter(Boolean) ?? [];

        setApiData(filteredCategories as GetApiProductsListing200ProductsItem[]);
    };

    const handleCategoryCheck = ({ category }: { category: GetApiProductsListing200ProductsItem }) => {
        productHandler.CategoryClick({
            category,
            selectedCategory,
            selectedProduct,
            setSelectedCategory,
            setSelectedProduct,
        });
    };

    const handleProductCheck = ({ product }: { product: GetApiProductsListing200ProductsItemProductsItem }) => {
        productHandler.ProductClick({
            product,
            selectedCategory,
            selectedProduct,
            setSelectedCategory,
            setSelectedProduct,
            categories: apiData ?? [],
        });
    };

    const handleProductClick = ({ product }: { product: GetApiProductsListing200ProductsItemProductsItem }) => {
        navigate(`/pos/products/${product?.id}`);
    };

    const handleEditCategory = ({ category }: { category: GetApiProductCategories200Item }) => {
        productHandler.EditCategory({
            category,
            setCategoryToEdit,
            handleModalOpen: setBoolState,
        });
        product.refetch();
    };

    const CategoryCreate = async ({ body }: { body: PostApiProductCategoriesBody }) => {
        setBoolState((prev) => ({ ...prev, categoryModal: false }));
        setCategoryToEdit(null);
        createCategory(body, {
            onSuccess: () => {
                product.refetch();
            },
        });
    };

    const CategoryUpdate = async ({ id, body }: { id: string; body: PutApiProductCategoriesId200 }) => {
        setBoolState((prev) => ({ ...prev, categoryModal: false }));
        setCategoryToEdit(null);
        updateCategory(
            { id, data: { description: body.description ?? '', name: body.name ?? '' } },
            {
                onSuccess: () => {
                    product.refetch();
                },
            },
        );
    };

    const CategoryDelete = ({ id }: { id: string }) => {
        setBoolState((prev) => ({ ...prev, categoryModal: false }));
        setCategoryToEdit(null);
        deleteCategory(id, {
            onSuccess: () => {
                product.refetch();
                setSelectedProduct([]);
                setSelectedCategory([]);
            },
        });
    };

    const removeProducts = async ({ ids }: { ids: Array<string> }) => {
        setApiData((prev) => {
            if (!prev) return null;
            return prev.filter((category) => !ids.includes(category?.id));
        });

        deleteProducts(ids, {
            onSuccess: () => {
                product.refetch();
            },
        });

        setSelectedProduct([]);
        setSelectedCategory([]);
    };

    const editMultipleProducts = async ({ products }: { products: PutApiUpdateProductsBodyDataItem[] }) => {
        setBoolState((prev) => ({ ...prev, multiProductModal: false }));
        updateProducts(
            { data: products },
            {
                onSuccess: () => {
                    product.refetch();
                },
            },
        );
        setSelectedProduct([]);
        setSelectedCategory([]);
    };

    return (
        <Stack sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', position: 'relative' }}>
            <Stack
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'center',
                    width: '100%',
                    gap: { xs: 1, md: 2 },
                }}
            >
                <POSHeading text={t('POS.Products')} />

                <Stack
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 1,
                        justifyContent: { md: 'flex-end' },
                        width: '100%',
                    }}
                >

                    {isAllowed('Category', 'create') && (
                        <POSButton
                            title={
                                <Stack
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 1,
                                    }}
                                >
                                    <Menu />
                                    {t('POS.CreateCat')}
                                </Stack>
                            }
                            variant="save"
                            type="button"
                            width={{ xs: '100%', md: 'auto' }}
                            onClick={() => {
                                setBoolState({
                                    ...boolState,
                                    categoryModal: true,
                                });
                            }}
                        />
                    )}

                    {isAllowed('Product', 'create') && (
                        <POSButton
                            title={`+ ${t('POS.CreatePdt')}`}
                            variant="save"
                            type="button"
                            width={{ xs: '100%', md: 'auto' }}
                            onClick={() => {
                                navigate('/pos/products/create');
                            }}
                        />
                    )}
                </Stack>
            </Stack>

            <Stack
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: { xs: 'flex-start', md: 'flex-end' },
                    gap: 1,
                    mt: { xs: 2, md: 0 },
                    width: '100%',
                    alignItems: 'center',
                }}
            >
                <POSInput
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder={t('POS.SearchByBrandOrName')}
                />
            </Stack>

            <POSProductList
                categories={apiData ?? []}
                handleCategoryCheck={handleCategoryCheck}
                handleProductCheck={handleProductCheck}
                handleProductClick={handleProductClick}
                selectedCategory={selectedCategory}
                selectedProduct={selectedProduct}
                handleEditCategory={handleEditCategory}
                handleDeleteCategory={({ category }) => {
                    setBoolState((prev) => ({ ...prev, categoryDeleteModal: true }));
                    setCategoryToEdit(category);
                }}
                loading={product?.isLoading}
            />

            {boolState.categoryModal && (
                <CreateCategory
                    open={boolState.categoryModal}
                    onClose={() => {
                        setCategoryToEdit(null);
                        setBoolState((prev) => ({ ...prev, categoryModal: false }));
                    }}
                    category={categoryToEdit}
                    handleClick={(id, body) => {
                        if (id) {
                            CategoryUpdate({ id, body });
                            setCategoryToEdit(null);
                        } else {
                            CategoryCreate({ body: body as PostApiProductCategoriesBody });
                            setCategoryToEdit(null);
                        }
                    }}
                />
            )}

            {selectedProduct.length > 0 && (
                <EditProductItems
                    onRemoveProducts={() => {
                        setBoolState((prev) => ({ ...prev, deleteMultiProductModal: true }));
                    }}
                    onEditProducts={() => {
                        setBoolState((prev) => ({ ...prev, multiProductModal: true }));
                    }}
                    onResetProducts={() => {
                        setSelectedProduct([]);
                        setSelectedCategory([]);
                    }}
                    selectedProduct={selectedProduct}
                />
            )}

            {boolState.categoryDeleteModal && (
                <POSDeleteModal
                    open={boolState.categoryDeleteModal}
                    handleClose={() => {
                        setBoolState((prev) => ({ ...prev, categoryDeleteModal: false }));
                    }}
                    description={t('POS.RemoveCatDesc')}
                    title={t('POS.RemoveCat')}
                    onClickDismiss={() => {
                        setBoolState((prev) => ({ ...prev, categoryDeleteModal: false }));
                    }}
                    onClickConfirm={() => {
                        setBoolState((prev) => ({ ...prev, categoryDeleteModal: false }));
                        CategoryDelete({ id: categoryToEdit?.id ?? '' });
                        setCategoryToEdit(null);
                        product.refetch();
                    }}
                />
            )}

            {boolState?.multiProductModal && (
                <POSProductMultiEdit
                    open={boolState?.multiProductModal}
                    onClose={() => {
                        setBoolState((prev) => ({ ...prev, multiProductModal: false }));
                    }}
                    handleClick={(body) => {
                        editMultipleProducts({ products: body });
                    }}
                    selectedProducts={selectedProduct}
                    categories={product?.data?.products ?? []}
                />
            )}

            {boolState?.deleteMultiProductModal && (
                <POSDeleteModal
                    open={boolState?.deleteMultiProductModal}
                    handleClose={() => {
                        setBoolState((prev) => ({ ...prev, deleteMultiProductModal: false }));
                    }}
                    description={t('POS.RemSelProdsDesc')}
                    title={t('POS.RemSelProds')}
                    onClickDismiss={() => {
                        setBoolState((prev) => ({ ...prev, deleteMultiProductModal: false }));
                    }}
                    onClickConfirm={() => {
                        setBoolState((prev) => ({ ...prev, deleteMultiProductModal: false }));
                        removeProducts({ ids: selectedProduct.map((p) => p.id ?? '') });
                        product.refetch();
                    }}
                />
            )}

        </Stack>
    );
}
