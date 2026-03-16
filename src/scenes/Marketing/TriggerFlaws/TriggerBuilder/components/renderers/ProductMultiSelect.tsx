import React, { useEffect, useState, useMemo } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { RadixMultiSelect, RadixSelect } from '@/components/radix';
import { t } from 'i18next';
import { useSelector } from 'react-redux';
import { useProductService } from '@/hooks/api/pos/products/useProducts';
import { usePlaygroundFormRegistry } from '../../hooks/usePlaygroundFormRegistry';

type ProductMultiSelectValue = string[] | string | number[];

interface ProductMultiSelectCompositeValues {
    productIds?: string[] | string;
    days?: [number | null, number | null];
}

interface ProductMultiSelectProps {
    value: ProductMultiSelectValue | null | undefined;
    compositeValues?: ProductMultiSelectCompositeValues;
    conditionInstanceId: string;
    hasPeriod?: boolean; // Explicitly control whether to show days input
}

const ProductMultiSelect = ({
    value,
    compositeValues,
    conditionInstanceId,
    hasPeriod: explicitHasPeriod,
}: ProductMultiSelectProps) => {
    const { register } = usePlaygroundFormRegistry();
    const hasPeriod = explicitHasPeriod !== undefined ? explicitHasPeriod : !!compositeValues;
    interface SettingsState {
        settings?: {
            data?: {
                profile?: {
                    outlet_addons?: Array<{ addon_name?: string }>;
                };
            };
        };
    }
    const settings = useSelector((state: SettingsState) => state?.settings?.data);
    const [isPOSEnabled, setIsPOSEnabled] = useState(false);

    // Check if POS is enabled
    useEffect(() => {
        const outletAddons = settings?.profile?.outlet_addons || [];
        const hasPOS = outletAddons.some((addon) => addon.addon_name === 'POS');
        setIsPOSEnabled(hasPOS);
    }, [settings]);

    // Memoize query params to prevent infinite re-renders
    const queryParams = useMemo(() => ({ page: 1, limit: 1000 }), []);

    // Fetch products if POS is enabled
    const { data: productsData, isLoading } = useProductService(queryParams, 500, 0, isPOSEnabled, isPOSEnabled);

    // Flatten products from categories
    const productOptions: Array<{ label: string; value: string }> = [];
    if (productsData?.products) {
        productsData.products.forEach((category) => {
            if (category.products && Array.isArray(category.products)) {
                category.products.forEach((product: { id: number | string; name: string; isActive?: boolean }) => {
                    // Only include active products
                    if (product.isActive !== false) {
                        productOptions.push({
                            label: product.name,
                            value: String(product.id),
                        });
                    }
                });
            }
        });
    }

    // Extract values from compositeValues or use defaults
    const productIds = hasPeriod ? compositeValues?.productIds || [] : value;
    const days = compositeValues?.days || [7, null];

    const formik = useFormik({
        initialValues: {
            productIds: hasPeriod
                ? Array.isArray(productIds)
                    ? productIds.map(String)
                    : typeof productIds === 'string'
                      ? productIds
                      : ''
                : Array.isArray(productIds)
                  ? productIds.map(String)
                  : productIds
                    ? [String(productIds)]
                    : [],
            days: days,
        },
        validationSchema: Yup.object().shape({
            productIds: hasPeriod
                ? Yup.mixed().test('required', t('Marketing.ProductsRequired'), (value) => {
                      if (Array.isArray(value)) {
                          return value.length > 0;
                      }
                      return typeof value === 'string' && value.trim().length > 0;
                  })
                : Yup.array().of(Yup.string()).min(1, t('Marketing.ProductsRequired')),
            days: hasPeriod
                ? Yup.array()
                      .of(Yup.number().nullable())
                      .test(
                          'required',
                          t('Marketing.DaysRequired'),
                          (value) =>
                              Array.isArray(value) && value.length >= 1 && value[0] !== null && value[0] !== undefined,
                      )
                : Yup.mixed().notRequired(),
        }),
        enableReinitialize: true,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: () => {
            // Validation handled automatically
        },
    });

    useEffect(() => {
        register(conditionInstanceId, {
            validate: async () => {
                const errors = await formik.validateForm();
                if (Object.keys(errors).length > 0) {
                    formik.setTouched({
                        productIds: true,
                        ...(hasPeriod ? { days: true } : {}),
                    });
                    return false;
                }
                return true;
            },
            getValues: () => {
                if (hasPeriod) {
                    return {
                        productIds: Array.isArray(formik.values.productIds)
                            ? formik.values.productIds
                            : typeof formik.values.productIds === 'string'
                              ? formik.values.productIds
                              : [],
                        days: formik.values.days,
                    };
                }
                return formik.values.productIds;
            },
        });
        // Keep validator in registry on unmount so we can validate all at once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conditionInstanceId, formik.values, hasPeriod, register]);

    const handleProductChange = (selectedValues: Set<string>) => {
        const productIdsArray = Array.from(selectedValues);
        formik.setFieldValue('productIds', productIdsArray);
    };

    const selectedValuesSet = new Set(
        Array.isArray(formik.values.productIds)
            ? formik.values.productIds
            : typeof formik.values.productIds === 'string'
              ? []
              : formik.values.productIds
                ? [String(formik.values.productIds)]
                : [],
    );

    return (
        <div className={hasPeriod ? 'flex flex-col gap-4 space-y-4' : 'w-full'}>
            {/* Product Selection */}
            <div className="w-full">
                {!isPOSEnabled ? (
                    <p className="text-sm leading-5 font-normal text-text-primary m-0 p-0 mb-1">
                        <span className="text-error-500">⚠️{t('Marketing.POSNotEnabled')}</span>
                    </p>
                ) : (
                    <>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            {t('Marketing.SelectProducts')}
                        </label>
                        <RadixMultiSelect
                            options={productOptions}
                            selectedValues={selectedValuesSet}
                            onSelectionChange={handleProductChange}
                            placeholder={t('Marketing.SelectProducts')}
                            textToDisplayWithCount={t('POS.ProdSelect')}
                            className="w-full min-w-full"
                            disabled={isLoading}
                        />
                    </>
                )}
                {formik.touched.productIds && formik.errors.productIds && (
                    <div className="text-sm text-red-500 mt-1">
                        {typeof formik.errors.productIds === 'string'
                            ? formik.errors.productIds
                            : Array.isArray(formik.errors.productIds)
                              ? (formik.errors.productIds as string[]).join(', ')
                              : t('Marketing.ProductsRequired')}
                    </div>
                )}
            </div>

            {/* Days Range Input - only show if period mode */}
            {hasPeriod && (
                <div className="w-full">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        {t('Marketing.DaysRange')}
                    </label>
                    <RadixSelect
                        options={[
                            { label: `${t('Common.Before')} 3 ${t('Setting.Days')}`, value: '3' },
                            { label: `${t('Common.Before')} 7 ${t('Setting.Days')}`, value: '7' },
                            { label: `${t('Common.Before')} 15 ${t('Setting.Days')}`, value: '15' },
                            { label: `${t('Common.Before')} 30 ${t('Setting.Days')}`, value: '30' },
                            { label: `${t('Common.Before')} 2 ${t('Marketing.Months')}`, value: '60' },
                            { label: `${t('Common.Before')} 3 ${t('Marketing.Months')}`, value: '90' },
                            { label: `${t('Common.Before')} 6 ${t('Marketing.Months')}`, value: '180' },
                        ]}
                        value={String(formik.values.days?.[0] ?? 7)}
                        onValueChange={(val) => {
                            const numVal = val ? Number(val) : 7;
                            formik.setFieldValue('days', [numVal, null]);
                        }}
                        placeholder={t('Marketing.SelectDaysRange')}
                        className="w-full"
                    />
                    {formik.touched.days && formik.errors.days && (
                        <div className="text-sm text-red-500 mt-1">
                            {typeof formik.errors.days === 'string' ? formik.errors.days : t('Marketing.DaysRequired')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductMultiSelect;
