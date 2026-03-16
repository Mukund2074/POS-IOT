import { Divider, Grid2, InputAdornment, Paper, Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import POSHeading from '@/components/POS/Common/POSHeading';
import { t } from 'i18next';
import POSButton from '@/components/POS/Common/POSButton';
import { FormikTouched, useFormik } from 'formik';
import * as Yup from 'yup';
import POSInput from '@/components/POS/Common/POSInput';
import POSTextArea from '@/components/POS/Common/POSTextArea';
import POSSelect from '@/components/POS/Common/POSSelect';
import { productApi } from '../../Core/product.api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import POSDeleteModal from '@/components/POS/Common/POSDeleteModal';
import {
    GetApiListSuppliers200Item,
    GetApiProductCategories200Item,
    GetApiProductsId200,
    PostApiProductBody,
    PutApiProductIdBody,
} from '@/shared/api/models';
import POSSwitch from '@/components/POS/Common/POSSwitch';
import HistoryTable from '../Shared/HistoryTable';
import { supplierApi } from '@/scenes/POS/UI/Supplier-Page/Core/supplier.api.';
import { useQueryClient } from '@tanstack/react-query';
import { POSFormSkeleton } from '../Shared/ProductFormSkeleton';
import AddOrRemoveStock from '../Modals/AddOrRemoveStock';
import Permission, { PermissionDenied } from '@/utils/POS/Permission';
import { usePOS } from '@/context/POS/POSContext';

export default function POSProductForm() {
    const [loading, setLoading] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [categories, setCategories] = useState<GetApiProductCategories200Item[] | null>(null);
    const [suppliers, setSuppliers] = useState<GetApiListSuppliers200Item[] | null>(null);
    const [stockValue, setStockValue] = useState<number | null>(null);
    const [product, setProduct] = useState<GetApiProductsId200 | null>(null);
    const pathname = window.location.pathname;
    const id = pathname.split('/').pop();
    const isCreate = !id || id === 'create';
    const { isAllowed } = Permission();

    const isAllowedToCreate = isAllowed('Product', 'create');
    const isAllowedToUpdate = isAllowed('Product', 'update');
    const isAllowedToDelete = isAllowed('Product', 'delete');

    const { tax: taxList } = usePOS();

    useEffect(() => {
        if (!isAllowedToCreate && isCreate) {
            toast.error(t('POS.PermissionDenied'));
            const interval = setTimeout(() => {
                navigate('/pos/products');
            }, 1500);
            return () => clearTimeout(interval);
        } else if (!isAllowedToUpdate && !isCreate) {
            toast.error(t('POS.PermissionDenied'));
            const interval = setTimeout(() => {
                navigate('/pos/products');
            }, 1500);
            return () => clearTimeout(interval);
        }
    }, [isAllowedToCreate, isAllowedToUpdate, isAllowedToDelete, isCreate]);

    const [initialValues, setInitialValues] = useState<PostApiProductBody | PutApiProductIdBody>(() => {
        const baseValues = {
            name: '',
            description: '',
            image: '',
            sku: '',
            categoryId: null,
            supplierId: null,
            brand: '',
            price: undefined,
            costPrice: undefined,
            isActive: true,
            availableOnline: true,
            taxIds: [],
            trackInventory: true,
            lowStockAlert: false,
            lowStockAlertQuantity: 0,
        };

        if (isCreate) {
            return {
                ...baseValues,
                stock: null,
            } as PostApiProductBody;
        }

        return baseValues as PutApiProductIdBody;
    });

    const navigate = useNavigate();
    const showToast = (message: string, type: 'success' | 'error') => toast(message, { type });
    const queryClient = useQueryClient();

    const setFormikValues = (values: GetApiProductsId200) => {
        const baseValues = {
            name: values.name,
            description: values.description ?? '',
            image: values.image ?? '',
            sku: values.sku ?? '',
            categoryId: values.categoryId ?? null,
            supplierId: values.supplierId ?? null,
            brand: values.brand ?? '',
            price: values.price ?? null,
            costPrice: values.costPrice ?? null,
            isActive: values.isActive,
            availableOnline: values.availableOnline,
            lowStockAlert: values.lowStockAlert,
            lowStockAlertQuantity: values.lowStockAlertQuantity,
        };

        setStockValue(values?.stock ?? null);

        // if (isCreate) {
        //     setInitialValues({
        //         ...baseValues,
        //         taxIds: values?.tax ?? [],
        //         trackInventory: true,
        //         stock: values?.stock ?? null,
        //     } as PostApiProductBody);
        // } else {
        setInitialValues({
            ...baseValues,
            taxIds: values?.tax ?? [],
            trackInventory: true,
            stock: values?.stock ?? null,
        } as PutApiProductIdBody);
        // }
    };

    useEffect(() => {
        // seedAllProducts(showToast, navigate);
        productApi.fetchCategories({ setCategories, showToast: () => {} });
        supplierApi.GetSupplier({ showToast: () => {}, setSuppliers });
        if (!isCreate) {
            productApi.GetProductById({ id, showToast, navigate, setFormikValues, setLoading, setProduct });
        }
    }, []);

    const [showAddStockModal, setShowAddStockModal] = useState<boolean>(false);
    const [type, setType] = useState<'add' | 'remove'>('add');

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required(t('Customer.ADVJournalFieldNameError'))
            .typeError(t('Customer.ADVJournalFieldNameError')),
        lowStockAlertQuantity: Yup.mixed().when('lowStockAlert', {
            is: true,
            then: Yup.number()
                .typeError(t('POS.LowStockAlertQuantity') + ' ' + t('Customer.IsRequired'))
                .required(t('POS.LowStockAlertQuantity') + ' ' + t('Customer.IsRequired')),
            otherwise: Yup.mixed().notRequired(),
        }),
    });

    const formik = useFormik({
        initialValues: initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values) => {
            if (!isCreate) {
                productApi.UpdateProduct({
                    id,
                    body: values as PutApiProductIdBody,
                    showToast,
                    navigate,
                    queryClient,
                });
                return;
            } else {
                const createValues = {
                    ...values,
                    // stock: stockValue,
                } as PostApiProductBody;
                productApi.CreateProduct({ body: createValues, showToast, navigate, queryClient });
            }
        },
    });

    const ErrorComponent: React.FC<{ field: keyof typeof formik.initialValues }> = ({ field }) => {
        const touched = formik.touched[field as keyof typeof formik.touched];
        const error = formik.errors[field as keyof typeof formik.errors];

        if (touched && typeof error === 'string') {
            return <Typography style={{ color: 'red' }}>{error}</Typography>;
        }

        return null;
    };

    if (!isAllowedToCreate && isCreate) {
        return <PermissionDenied />;
    } else if (!isAllowedToUpdate && !isCreate) {
        return <PermissionDenied />;
    }

    return (
        <Stack
            sx={{
                p: { xs: 0, md: 2 },
            }}
        >
            {!loading && (
                <Stack
                    sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 1,
                        width: '100%',
                    }}
                >
                    <POSHeading
                        text={id && id !== 'create' ? t('POS.UpProd') : t('POS.CreatePdt')}
                        sx={{ width: '100%' }}
                    />

                    <Stack
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: 1,
                            width: '100%',
                        }}
                    >
                        {!isCreate && (
                            <React.Fragment>
                                <POSButton
                                    title={t('POS.AddStock')}
                                    variant="save"
                                    width={{ xs: '100%', md: 'auto' }}
                                    onClick={() => {
                                        setType('add');
                                        setShowAddStockModal(true);
                                    }}
                                    disabled={formik?.isSubmitting}
                                />

                                <POSButton
                                    title={t('POS.RemoveStock')}
                                    variant="save"
                                    width={{ xs: '100%', md: 'auto' }}
                                    onClick={() => {
                                        setType('remove');
                                        setShowAddStockModal(true);
                                    }}
                                    disabled={formik?.isSubmitting}
                                />
                            </React.Fragment>
                        )}
                        {formik?.dirty && (
                            <POSButton
                                title={id && id !== 'create' ? t('Customer.SaveCh') : t('POS.CreatePdt')}
                                variant="save"
                                width={{ xs: '100%', md: 'auto' }}
                                onClick={() => formik.submitForm()}
                                disabled={formik?.isSubmitting}
                            />
                        )}
                    </Stack>
                </Stack>
            )}

            <form
                style={{
                    width: '100%',
                    backgroundColor: '#fff',
                    borderRadius: '25px',
                    marginTop: 10,
                }}
                onSubmit={formik.handleSubmit}
            >
                {loading ? (
                    <POSFormSkeleton />
                ) : (
                    <React.Fragment>
                        <Grid2 container spacing={{ xs: 0, md: 3 }} sx={{ mt: 2, p: { xs: 2, md: 4 } }}>
                            <Grid2 size={{ xs: 12, md: 4 }}>
                                <POSHeading text={t('POS.Information')} />
                                <POSHeading
                                    text={t('POS.InformationDesc')}
                                    sx={{ fontSize: 16, color: '#afafaf', fontWeight: 400 }}
                                />
                            </Grid2>

                            <Grid2
                                sx={{
                                    mt: { xs: 2, md: 0 },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: { xs: 2, md: 4, xl: 5 },
                                }}
                                size={{ xs: 12, md: 4 }}
                            >
                                <Stack>
                                    <POSHeading text={t('POS.ProdName')} fontSize={16} />
                                    <POSInput
                                        name="name"
                                        value={formik.values.name ?? ''}
                                        onChange={formik.handleChange}
                                        placeholder={t('POS.ProdName')}
                                        onBlur={() => formik.setFieldTouched('name', true)}
                                    />
                                    <ErrorComponent field="name" />
                                </Stack>

                                <Stack>
                                    <POSHeading text={t('POS.Categories')} fontSize={16} />
                                    <POSSelect
                                        value={formik.values.categoryId ?? ''}
                                        onChange={(e) => formik.setFieldValue('categoryId', e.target.value)}
                                        onBlur={() => formik.setFieldTouched('categoryId', true)}
                                        options={
                                            categories && categories?.length > 0
                                                ? categories.map((category) => ({
                                                      label: category.name,
                                                      value: category.id,
                                                  }))
                                                : []
                                        }
                                    />
                                </Stack>

                                <Stack>
                                    <POSHeading text={t('POS.Brand')} fontSize={16} />
                                    <POSInput
                                        name="brand"
                                        placeholder={t('POS.Brand')}
                                        value={formik.values.brand ?? ''}
                                        onChange={formik.handleChange}
                                        onBlur={() => formik.setFieldTouched('brand', true)}
                                    />
                                </Stack>

                                <Stack>
                                    <POSHeading text={t('Common.Price')} fontSize={16} />
                                    <POSInput
                                        name="price"
                                        placeholder={t('Common.Price')}
                                        value={formik.values.price ?? ''}
                                        onChange={(e) => {
                                            // Remove any non-numeric characters except decimal point
                                            const numericValue = e.target.value.replace(/[^0-9.]/g, '');

                                            // Ensure only one decimal point is allowed
                                            const parts = numericValue.split('.');
                                            let formattedValue =
                                                parts.length > 2
                                                    ? parts[0] + '.' + parts.slice(1).join('')
                                                    : numericValue;

                                            // Limit to 2 decimal places
                                            if (parts.length === 2 && parts[1].length > 2) {
                                                formattedValue = parts[0] + '.' + parts[1].substring(0, 2);
                                            }
                                            formik.setFieldValue('price', formattedValue);
                                        }}
                                        onBlur={() => formik.setFieldTouched('brand', true)}
                                        slotProps={{
                                            input: {
                                                endAdornment: (
                                                    <InputAdornment position="end">{t('POS.Currency')}</InputAdornment>
                                                ),
                                            },
                                        }}
                                    />
                                    <ErrorComponent field="price" />
                                </Stack>

                                <Stack>
                                    <POSHeading text={t('POS.PurPrice')} fontSize={16} />
                                    <POSInput
                                        name="costPrice"
                                        placeholder={t('POS.PurPrice')}
                                        value={formik.values.costPrice ?? ''}
                                        onChange={(e) => {
                                            // Remove any non-numeric characters except decimal point
                                            const numericValue = e.target.value.replace(/[^0-9.]/g, '');

                                            // Ensure only one decimal point is allowed
                                            const parts = numericValue.split('.');
                                            let formattedValue =
                                                parts.length > 2
                                                    ? parts[0] + '.' + parts.slice(1).join('')
                                                    : numericValue;

                                            // Limit to 2 decimal places
                                            if (parts.length === 2 && parts[1].length > 2) {
                                                formattedValue = parts[0] + '.' + parts[1].substring(0, 2);
                                            }
                                            formik.setFieldValue('costPrice', formattedValue);
                                        }}
                                        onBlur={() => formik.setFieldTouched('costPrice', true)}
                                        slotProps={{
                                            input: {
                                                endAdornment: (
                                                    <InputAdornment position="end">{t('POS.Currency')}</InputAdornment>
                                                ),
                                            },
                                        }}
                                    />
                                    <ErrorComponent field="costPrice" />
                                </Stack>

                                <Stack>
                                    <POSHeading text={t('POS.LowStockAlert')} fontSize={16} />
                                    <POSSwitch
                                        name="lowStockAlert"
                                        checked={formik.values.lowStockAlert ?? false}
                                        onChange={(e) =>
                                            formik.setFieldValue('lowStockAlert', !formik.values.lowStockAlert)
                                        }
                                        label={t('POS.LowStockAlert')}
                                    />
                                </Stack>

                                {formik?.values?.lowStockAlert && (
                                    <Stack>
                                        <POSHeading text={t('POS.LowStockAlertQuantity')} fontSize={16} />
                                        <POSInput
                                            name="lowStockAlertQuantity"
                                            placeholder={t('POS.LowStockAlertQuantity')}
                                            value={formik.values.lowStockAlertQuantity ?? ''}
                                            onChange={(e) => {
                                                let value = e.target.value;

                                                // Remove any non-numeric characters except minus
                                                value = value.replace(/[^0-9-]/g, '');

                                                // Allow only one minus sign at the beginning
                                                if (value.includes('-')) {
                                                    const minusCount = (value.match(/-/g) || []).length;
                                                    if (minusCount > 1) {
                                                        // Keep only the first minus sign
                                                        value = '-' + value.replace(/-/g, '');
                                                    } else if (!value.startsWith('-')) {
                                                        // Move minus to the beginning if it's not already there
                                                        value = '-' + value.replace(/-/g, '');
                                                    }
                                                }

                                                formik.setFieldValue('lowStockAlertQuantity', value);
                                            }}
                                            onBlur={() => formik.setFieldTouched('lowStockAlertQuantity', true)}
                                        />
                                        <ErrorComponent field="lowStockAlertQuantity" />
                                    </Stack>
                                )}
                            </Grid2>

                            <Grid2
                                sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 4, xl: 5 } }}
                                size={{ xs: 12, md: 4 }}
                            >
                                <Stack>
                                    <POSHeading text={t('POS.Sku')} fontSize={16} />
                                    <POSInput
                                        name="sku"
                                        placeholder={t('POS.Sku')}
                                        value={formik.values.sku ?? ''}
                                        onChange={formik.handleChange}
                                        onBlur={() => formik.setFieldTouched('sku', true)}
                                    />
                                </Stack>

                                <Stack>
                                    <POSHeading text={t('POS.Supplier')} fontSize={16} />
                                    <POSSelect
                                        value={formik?.values?.supplierId}
                                        onChange={(e) => formik.setFieldValue('supplierId', e.target.value)}
                                        onBlur={() => formik.setFieldTouched('supplierId', true)}
                                        options={
                                            suppliers && suppliers?.length > 0
                                                ? suppliers?.map((supplier) => ({
                                                      label: supplier.name,
                                                      value: supplier?.id ?? '',
                                                  }))
                                                : []
                                        }
                                    />
                                </Stack>

                                <Stack>
                                    <POSHeading text={t('Setting.Description')} fontSize={16} />
                                    <POSTextArea
                                        placeholder={t('Setting.Description')}
                                        name="description"
                                        value={formik?.values?.description ?? ''}
                                        onChange={formik.handleChange}
                                        onBlur={() => formik.setFieldTouched('description', true)}
                                    />
                                </Stack>

                                {/* <Stack>
                                    <POSHeading text={t('POS.Image')} fontSize={16} />
                                    <POSUpload
                                        handleFileUpload={(e) => formik.setFieldValue('image', e.target.files)}
                                    />
                                </Stack> */}

                                {/* {isCreate && (
                                    <POSSwitch
                                        name="trackInventory"
                                        checked={formik.values.trackInventory ?? false}
                                        onChange={(e) =>
                                            formik.setFieldValue('trackInventory', !formik.values.trackInventory)
                                        }
                                        label={t('POS.TrackInventory')}
                                    />
                                )} */}
                            </Grid2>

                            <Grid2 size={{ xs: 12, md: 4 }} />

                            <Grid2 container spacing={{ xs: 0, md: 3 }} size={{ xs: 12, md: 8 }}>
                                {taxList.data &&
                                    taxList.data?.length > 0 &&
                                    taxList.data?.map((tax) => (
                                        <Grid2 size={{ xs: 12, md: 6 }}>
                                            <POSSwitch
                                                name="taxIds"
                                                checked={formik?.values?.taxIds?.includes(tax.id) || false}
                                                onChange={(e) => {
                                                    if (formik.values.taxIds?.includes(tax.id)) {
                                                        formik.setFieldValue('taxIds', [
                                                            ...(formik.values?.taxIds?.filter((id) => id !== tax.id) ||
                                                                []),
                                                        ]);
                                                    } else {
                                                        formik.setFieldValue('taxIds', [
                                                            ...(formik.values?.taxIds || []),
                                                            tax.id,
                                                        ]);
                                                    }
                                                }}
                                                label={`${tax.taxName} (${tax.taxRate}%)`}
                                            />
                                        </Grid2>
                                    ))}
                            </Grid2>
                        </Grid2>
                        {isCreate && (
                            <React.Fragment>
                                <Divider sx={{ borderWidth: 2, width: '100%', borderColor: '#D2D2D2' }} />
                                <Grid2 container spacing={{ xs: 0, md: 3 }} sx={{ p: { xs: 3, md: 4 } }}>
                                    <Grid2 size={{ xs: 12, md: 4 }}>
                                        <POSHeading text={t('POS.StockStatus')} />
                                        <POSHeading
                                            text={t('POS.StockDesc')}
                                            sx={{ fontSize: 16, color: '#afafaf', fontWeight: 400 }}
                                        />
                                    </Grid2>

                                    <Grid2
                                        sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 4, xl: 5 } }}
                                        size={{ xs: 12, md: 8 }}
                                    >
                                        {/* <POSHeading text={t('POS.Storename')} /> */}
                                        <Stack>
                                            <POSHeading text={t('POS.QtyInStock')} fontSize={16} />
                                            <POSInput
                                                name="stock"
                                                placeholder={t('POS.QtyInStock')}
                                                value={stockValue ?? ''}
                                                onChange={(e) => {
                                                    const onlyNumber = e.target.value.replace(/[^0-9]/g, '');
                                                    formik.setFieldValue(
                                                        'stock',
                                                        onlyNumber ? Number(onlyNumber) : null,
                                                    );
                                                    setStockValue(onlyNumber ? Number(onlyNumber) : null);
                                                }}
                                            />
                                        </Stack>
                                    </Grid2>
                                </Grid2>
                            </React.Fragment>
                        )}
                    </React.Fragment>
                )}
            </form>

            {!loading && !isCreate && (
                <Paper
                    sx={{
                        p: 2,
                        mt: 2,
                        borderRadius: 2,
                        width: { xs: '100%', md: '30%' },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        ml: { md: 'auto' },
                        borderColor: stockValue && stockValue < 0 ? 'red' : 'green',
                        borderWidth: 3,
                        borderStyle: 'solid',
                        borderBottom: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                    }}
                >
                    <POSHeading text={t('POS.Stock')} />
                    <Typography
                        sx={{
                            fontSize: { xs: 24, md: 30 },
                            fontWeight: 700,
                            color: stockValue && stockValue < 0 ? 'red' : stockValue === 0 ? '#000' : 'green',
                        }}
                    >
                        {stockValue}
                    </Typography>
                </Paper>
            )}
            {!isCreate && !loading && (
                <React.Fragment>
                    <POSHeading sx={{ mt: 3 }} text={t('POS.History')} />

                    <HistoryTable data={product?.inventoryTransaction ?? []} />

                    {isAllowedToDelete && (
                        <POSButton
                            variant="delete"
                            title={t('POS.RemProd')}
                            sx={{
                                mt: 2,
                                ml: 'auto',
                            }}
                            width={{ xs: '100%', md: 'auto' }}
                            onClick={() => {
                                setShowDeleteModal(true);
                            }}
                            disabled={formik?.isSubmitting}
                        />
                    )}
                </React.Fragment>
            )}

            {showDeleteModal && (
                <POSDeleteModal
                    open={showDeleteModal}
                    handleClose={() => setShowDeleteModal(false)}
                    onClickDismiss={() => setShowDeleteModal(false)}
                    onClickConfirm={async () => {
                        if (id && id !== 'create') {
                            setShowDeleteModal(false);
                            await productApi.DeleteProducts({ ids: [id], showToast });
                            await queryClient.invalidateQueries({ queryKey: ['products', 'services'] });
                            showToast(t('POS.ToastSuccProdDel'), 'success');
                            const interval = setTimeout(() => {
                                navigate('/pos/products');
                            }, 1500);
                            return () => clearTimeout(interval);
                        }
                    }}
                    title={t('POS.RemProd')}
                    description={t('POS.RemProdDesc')}
                />
            )}

            {showAddStockModal && (
                <AddOrRemoveStock
                    type={type}
                    open={showAddStockModal}
                    onClose={() => setShowAddStockModal(false)}
                    productId={id ?? ''}
                    refetch={() => {
                        productApi.GetProductById({
                            id: id ?? '',
                            showToast,
                            navigate,
                            setFormikValues,
                            setLoading,
                            setProduct,
                        });
                        setShowAddStockModal(false);
                    }}
                />
            )}
        </Stack>
    );
}
