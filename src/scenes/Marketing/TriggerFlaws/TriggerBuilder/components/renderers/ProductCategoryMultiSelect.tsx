import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { RadixMultiSelect, RadixSelect } from '@/components/radix';
import { t } from 'i18next';
import { useProductCategories } from '@/hooks/api/pos/products/useProductCategories';
import { usePlaygroundFormRegistry } from '../../hooks/usePlaygroundFormRegistry';

type ProductCategoryValue = string[] | string | number[];

interface ProductCategoryCompositeValues {
    categoryIds?: string[] | number[];
    days?: [number | null, number | null];
}

interface ProductCategoryMultiSelectProps {
    value: ProductCategoryValue | null | undefined;
    compositeValues?: ProductCategoryCompositeValues;
    conditionInstanceId: string;
    hasPeriod?: boolean;
}

const ProductCategoryMultiSelect = ({
    value,
    compositeValues,
    conditionInstanceId,
    hasPeriod: explicitHasPeriod,
}: ProductCategoryMultiSelectProps) => {
    const { register } = usePlaygroundFormRegistry();
    const hasPeriod = explicitHasPeriod !== undefined ? explicitHasPeriod : !!compositeValues;
    // Fetch product categories
    const { data: categoriesData, isLoading } = useProductCategories(true);

    // Transform categories to options
    const categoryOptions: Array<{ label: string; value: string }> = [];
    if (categoriesData && Array.isArray(categoriesData)) {
        categoriesData.forEach((category: { id: number | string; name?: string }) => {
            categoryOptions.push({
                label: category.name || `Category ${category.id}`,
                value: String(category.id),
            });
        });
    }

    // Extract values from compositeValues or use defaults
    const categoryIds = hasPeriod ? compositeValues?.categoryIds || [] : value;
    const days = compositeValues?.days || [7, null];

    const formik = useFormik({
        initialValues: {
            categoryIds: Array.isArray(categoryIds)
                ? categoryIds.map(String)
                : categoryIds
                  ? [String(categoryIds)]
                  : [],
            days: days,
        },
        validationSchema: Yup.object().shape({
            categoryIds: Yup.array().of(Yup.string()).min(1, t('Marketing.CategoriesRequired')),
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
                        categoryIds: true,
                        ...(hasPeriod ? { days: true } : {}),
                    });
                    return false;
                }
                return true;
            },
            getValues: () => {
                if (hasPeriod) {
                    return {
                        categoryIds: formik.values.categoryIds,
                        days: formik.values.days,
                    };
                }
                return formik.values.categoryIds;
            },
        });
        // Keep validator in registry on unmount so we can validate all at once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conditionInstanceId, formik.values, hasPeriod, register]);

    const handleCategoryChange = (selectedValues: Set<string>) => {
        formik.setFieldValue('categoryIds', Array.from(selectedValues));
    };

    const selectedValuesSet = new Set(formik.values.categoryIds || []);

    return (
        <div className={hasPeriod ? 'flex flex-col gap-4 space-y-4' : 'w-full'}>
            {/* Category Selection */}
            <div className="w-full min-w-full">
                <label className="block text-sm font-medium text-text-primary mb-2">
                    {t('Marketing.SelectProductCategories')}
                </label>
                <RadixMultiSelect
                    options={categoryOptions}
                    selectedValues={selectedValuesSet}
                    onSelectionChange={handleCategoryChange}
                    placeholder={t('Marketing.SelectProductCategories')}
                    textToDisplayWithCount={t('Marketing.CategoriesSelected')}
                    className="min-w-full"
                    disabled={isLoading}
                />
                {formik.touched.categoryIds && formik.errors.categoryIds && (
                    <div className="text-sm text-red-500 mt-1">
                        {typeof formik.errors.categoryIds === 'string'
                            ? formik.errors.categoryIds
                            : Array.isArray(formik.errors.categoryIds)
                              ? (formik.errors.categoryIds as string[]).join(', ')
                              : t('Marketing.CategoriesRequired')}
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
                        className="w-full min-w-full"
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

export default ProductCategoryMultiSelect;
