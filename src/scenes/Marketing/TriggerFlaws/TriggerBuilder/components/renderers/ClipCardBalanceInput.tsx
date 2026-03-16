import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { RadixInput, RadixSelect } from '@/components/radix';
import { t } from 'i18next';
import { usePlaygroundFormRegistry } from '../../hooks/usePlaygroundFormRegistry';

interface ClipCardBalanceCompositeValues {
    minClips: number | null;
    maxClips: number | null;
    expirationPeriod: [number | null, number | null];
    clipType?: 'min' | 'max';
}

interface ClipCardBalanceInputProps {
    value: number | null | undefined;
    compositeValues?: ClipCardBalanceCompositeValues;
    conditionInstanceId: string;
}

const ClipCardBalanceInput = ({ value, compositeValues, conditionInstanceId }: ClipCardBalanceInputProps) => {
    const { register } = usePlaygroundFormRegistry();
    const minClips = compositeValues?.minClips || null;
    const maxClips = compositeValues?.maxClips || null;
    const expirationPeriod = compositeValues?.expirationPeriod || [7, null];

    // Determine initial clip type from compositeValues or existing values
    const initialClipType =
        compositeValues?.clipType || (minClips !== null ? 'min' : maxClips !== null ? 'max' : 'min');

    const formik = useFormik({
        initialValues: {
            clipType: initialClipType,
            minClips: minClips,
            maxClips: maxClips,
            expirationPeriod: expirationPeriod,
        },
        validationSchema: Yup.object().shape({
            clipType: Yup.string().oneOf(['min', 'max']).required(),
            minClips: Yup.number()
                .nullable()
                .when('clipType', {
                    is: 'min',
                    then: (schema) =>
                        schema
                            .required(t('Marketing.MinClipsRequired'))
                            .typeError(t('Marketing.MinClipsMustBeNumber'))
                            .min(0, t('Marketing.MinClipsMustBePositive')),
                    otherwise: (schema) => schema.nullable(),
                }),
            maxClips: Yup.number()
                .nullable()
                .when('clipType', {
                    is: 'max',
                    then: (schema) =>
                        schema
                            .required(t('Marketing.MaxClipsRequired'))
                            .typeError(t('Marketing.MaxClipsMustBeNumber'))
                            .min(0, t('Marketing.MaxClipsMustBePositive')),
                    otherwise: (schema) => schema.nullable(),
                }),
            expirationPeriod: Yup.array()
                .of(Yup.number().nullable())
                .test('required', t('Marketing.DaysRequired'), (value) => {
                    return Array.isArray(value) && value.length >= 1 && value[0] !== null && value[0] !== undefined;
                }),
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
                    const touchedFields: Record<string, boolean> = { expirationPeriod: true };
                    if (formik.values.clipType === 'min') {
                        touchedFields.minClips = true;
                    } else {
                        touchedFields.maxClips = true;
                    }
                    formik.setTouched(touchedFields);
                    return false;
                }
                return true;
            },
            getValues: () => {
                const clipType = formik.values.clipType;
                return {
                    dualCondition: true,
                    expirationCondition: {
                        conditionId: 13,
                        value: formik.values.expirationPeriod?.[0] ?? null,
                    },
                    clipsCondition: {
                        conditionId: 14,
                        ...(clipType === 'min'
                            ? { minClips: formik.values.minClips, maxClips: null }
                            : { minClips: null, maxClips: formik.values.maxClips }),
                    },
                };
            },
        });
        // Keep validator in registry on unmount so we can validate all at once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conditionInstanceId, formik.values, register]);

    const handleMinClipsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const clips = e.target.value ? Number(e.target.value) : null;
        formik.setFieldValue('minClips', clips);
    };

    const handleMaxClipsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const clips = e.target.value ? Number(e.target.value) : null;
        formik.setFieldValue('maxClips', clips);
    };

    const handleClipTypeChange = (val: string) => {
        formik.setFieldValue('clipType', val);
        // Clear the non-selected field when switching
        if (val === 'min') {
            formik.setFieldValue('maxClips', null);
        } else {
            formik.setFieldValue('minClips', null);
        }
    };

    const isMinSelected = formik.values.clipType === 'min';

    return (
        <div className="flex flex-col gap-4 space-y-4">
            {/* Clip Type Select */}
            <div className="w-full">
                <label className="block text-sm font-medium text-text-primary mb-2">{t('Marketing.ClipType')}</label>
                <RadixSelect
                    options={[
                        { label: t('Marketing.MinClips'), value: 'min' },
                        { label: t('Marketing.MaxClips'), value: 'max' },
                    ]}
                    value={formik.values.clipType}
                    onValueChange={handleClipTypeChange}
                    placeholder={t('Marketing.SelectClipType')}
                    className="w-full"
                />
            </div>

            {/* Min Clips - only render if selected */}
            {isMinSelected && (
                <div className="w-full">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        {t('Marketing.MinClips')}
                    </label>
                    <RadixInput
                        type="number"
                        value={formik.values.minClips !== null ? String(formik.values.minClips) : ''}
                        onChange={handleMinClipsChange}
                        placeholder="0"
                        className="w-full"
                    />
                    {formik.touched.minClips && formik.errors.minClips && (
                        <div className="text-sm text-error-500 mt-1">
                            {typeof formik.errors.minClips === 'string'
                                ? formik.errors.minClips
                                : t('Marketing.MinClipsRequired')}
                        </div>
                    )}
                </div>
            )}

            {/* Max Clips - only render if selected */}
            {!isMinSelected && (
                <div className="w-full">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        {t('Marketing.MaxClips')}
                    </label>
                    <RadixInput
                        type="number"
                        value={formik.values.maxClips !== null ? String(formik.values.maxClips) : ''}
                        onChange={handleMaxClipsChange}
                        placeholder="0"
                        className="w-full"
                    />
                    {formik.touched.maxClips && formik.errors.maxClips && (
                        <div className="text-sm text-error-500 mt-1">
                            {typeof formik.errors.maxClips === 'string'
                                ? formik.errors.maxClips
                                : t('Marketing.MaxClipsRequired')}
                        </div>
                    )}
                </div>
            )}

            {/* Expiration Period (Days Range) */}
            <div className="w-full">
                <label className="block text-sm font-medium text-text-primary mb-2">
                    {t('Marketing.ExpirationPeriod')}
                </label>
                <RadixSelect
                    options={[
                        { label: `${t('Common.After')} 3 ${t('Setting.Days')}`, value: '3' },
                        { label: `${t('Common.After')} 7 ${t('Setting.Days')}`, value: '7' },
                        { label: `${t('Common.After')} 15 ${t('Setting.Days')}`, value: '15' },
                        { label: `${t('Common.After')} 30 ${t('Setting.Days')}`, value: '30' },
                        { label: `${t('Common.After')} 2 ${t('Marketing.Months')}`, value: '60' },
                        { label: `${t('Common.After')} 3 ${t('Marketing.Months')}`, value: '90' },
                        { label: `${t('Common.After')} 6 ${t('Marketing.Months')}`, value: '180' },
                    ]}
                    value={String(formik.values.expirationPeriod?.[0] ?? 7)}
                    onValueChange={(val) => {
                        const numVal = val ? Number(val) : 7;
                        formik.setFieldValue('expirationPeriod', [numVal, null]);
                    }}
                    placeholder={t('Marketing.SelectDaysRange')}
                    className="w-full"
                />
                {formik.touched.expirationPeriod && formik.errors.expirationPeriod && (
                    <div className="text-sm text-error-500 mt-1">
                        {typeof formik.errors.expirationPeriod === 'string'
                            ? formik.errors.expirationPeriod
                            : t('Marketing.DaysRequired')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClipCardBalanceInput;
