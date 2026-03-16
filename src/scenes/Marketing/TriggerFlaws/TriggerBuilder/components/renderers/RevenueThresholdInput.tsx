import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { RadixSelect, RadixInput } from '@/components/radix';
import { t } from 'i18next';
import { usePlaygroundFormRegistry } from '../../hooks/usePlaygroundFormRegistry';

interface RevenueThreshold {
    type: 'AGGREGATE_GT' | 'AGGREGATE_LT' | 'AGGREGATE_EQ';
    amount?: number | null;
}

interface RevenueThresholdCompositeValues {
    threshold?: RevenueThreshold;
    days?: [number | null, number | null];
}

type RevenueThresholdValue = RevenueThreshold | number | null;

interface RevenueThresholdInputProps {
    value: RevenueThresholdValue | null | undefined;
    compositeValues?: RevenueThresholdCompositeValues;
    conditionInstanceId: string;
    hasPeriod?: boolean;
}

const thresholdTypeOptions = [
    { label: t('Marketing.Above'), value: 'AGGREGATE_GT' },
    { label: t('Marketing.Below'), value: 'AGGREGATE_LT' },
    { label: t('Marketing.Equal'), value: 'AGGREGATE_EQ' },
];

const RevenueThresholdInput = ({
    value,
    compositeValues,
    conditionInstanceId,
    hasPeriod: explicitHasPeriod,
}: RevenueThresholdInputProps) => {
    const { register } = usePlaygroundFormRegistry();
    const hasPeriod = explicitHasPeriod !== undefined ? explicitHasPeriod : compositeValues?.days !== undefined;
    // Extract threshold from compositeValues or parse from value
    const thresholdData =
        compositeValues?.threshold ||
        (typeof value === 'object' && value !== null ? value : { type: 'AGGREGATE_GT', amount: value || null });
    const days = compositeValues?.days || [7, null];

    const formik = useFormik({
        initialValues: {
            type: thresholdData.type || 'AGGREGATE_GT',
            amount: thresholdData.amount || null,
            days: days,
        },
        validationSchema: Yup.object().shape({
            type: Yup.string().oneOf(['AGGREGATE_GT', 'AGGREGATE_LT', 'AGGREGATE_EQ']).required(),
            amount: Yup.number().nullable().required(t('Marketing.AmountRequired')),
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
                        type: true,
                        amount: true,
                        ...(hasPeriod ? { days: true } : {}),
                    });
                    return false;
                }
                return true;
            },
            getValues: () => {
                if (hasPeriod) {
                    return {
                        threshold: {
                            type: formik.values.type,
                            amount: formik.values.amount,
                        },
                        days: formik.values.days,
                    };
                }
                return {
                    threshold: {
                        type: formik.values.type,
                        amount: formik.values.amount,
                    },
                };
            },
        });
        // Keep validator in registry on unmount so we can validate all at once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conditionInstanceId, formik.values, hasPeriod, register]);

    const handleTypeChange = (typeValue: string) => {
        formik.setFieldValue('type', typeValue);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const amount = e.target.value ? parseFloat(e.target.value) : null;
        formik.setFieldValue('amount', amount);
    };

    return (
        <div className="flex flex-col gap-4 space-y-4">
            {/* Threshold Type Select */}
            <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Marketing.ThresholdType')}</label>
                <RadixSelect
                    options={thresholdTypeOptions}
                    value={formik.values.type}
                    onValueChange={handleTypeChange}
                    placeholder={t('Marketing.SelectThresholdType')}
                    className="w-full"
                />
                {formik.touched.type && formik.errors.type && (
                    <div className="text-sm text-red-500 mt-1">
                        {typeof formik.errors.type === 'string' ? formik.errors.type : ''}
                    </div>
                )}
            </div>

            {/* Amount Input */}
            <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Marketing.ThresholdAmount')}</label>
                <RadixInput
                    type="number"
                    value={formik.values.amount !== null ? String(formik.values.amount) : ''}
                    onChange={handleAmountChange}
                    placeholder={t('Marketing.EnterAmount')}
                    className="w-full"
                />
                {formik.touched.amount && formik.errors.amount && (
                    <div className="text-sm text-red-500 mt-1">
                        {typeof formik.errors.amount === 'string' ? formik.errors.amount : ''}
                    </div>
                )}
            </div>

            {/* Days Range Input - only show if period mode */}
            {hasPeriod && (
                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('Marketing.DaysRange')}</label>
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

export default RevenueThresholdInput;
