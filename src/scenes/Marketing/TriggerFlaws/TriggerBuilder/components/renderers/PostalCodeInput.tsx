import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { RadixInput, RadixSelect } from '@/components/radix';
import { t } from 'i18next';
import { usePlaygroundFormRegistry } from '../../hooks/usePlaygroundFormRegistry';

interface PostalCodeInputProps {
    value: [string] | [string, string] | null;
    conditionInstanceId: string;
}

const schema = Yup.object({
    postalType: Yup.string().oneOf(['specific', 'range']).required(),

    minPostalCode: Yup.string().when('postalType', {
        is: 'specific',
        then: (s) => s.required(t('Marketing.PostalCodeRequired')),
        otherwise: (s) => s.required(t('Marketing.SelectValidPostalCodeRange')),
    }),

    maxPostalCode: Yup.string().when('postalType', {
        is: 'range',
        then: (s) =>
            s
                .required(t('Marketing.SelectValidPostalCodeRange'))
                .test('greater-than-min', t('Marketing.SelectValidPostalCodeRange'), function (value) {
                    const min = Number(this.parent.minPostalCode);
                    const max = Number(value);
                    return !isNaN(min) && !isNaN(max) && max > min;
                }),
        otherwise: (s) => s.notRequired(),
    }),
});

const PostalCodeInput = ({ value, conditionInstanceId }: PostalCodeInputProps) => {
    const isRange = value?.length === 2;
    const { register } = usePlaygroundFormRegistry();

    const formik = useFormik({
        initialValues: {
            postalType: isRange ? 'range' : 'specific',
            minPostalCode: value?.[0] ?? '',
            maxPostalCode: value?.[1] ?? '',
        },
        validationSchema: schema,
        onSubmit: () => {},
    });

    useEffect(() => {
        register(conditionInstanceId, {
            getValues: () =>
                formik.values.postalType === 'specific'
                    ? [formik.values.minPostalCode]
                    : [formik.values.minPostalCode, formik.values.maxPostalCode],
            validate: async () => {
                const errors = await formik.validateForm();
                formik.setTouched({ minPostalCode: true, maxPostalCode: true });
                return Object.keys(errors).length === 0;
            },
        });
        // Keep validator in registry on unmount so we can validate all conditions at once
    // Intentionally omit formik to avoid re-running on every render; formik.values.* captures current values
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conditionInstanceId, formik.values.postalType, formik.values.minPostalCode, formik.values.maxPostalCode, register]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col">
                <p className="text-sm font-medium text-text-primary p-0 m-0">{t('Marketing.SelectPostalCodeType')}</p>
                <RadixSelect
                    value={formik.values.postalType}
                    onValueChange={(v) => formik.setFieldValue('postalType', v)}
                    options={[
                        { label: t('Marketing.SpecificPostalCode'), value: 'specific' },
                        { label: t('Marketing.PostalCodeRange'), value: 'range' },
                    ]}
                />
            </div>

            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-text-primary p-0 m-0">
                    {formik.values.postalType === 'specific'
                        ? t('Marketing.SpecificPostalCode')
                        : t('Marketing.MinPostalCode')}
                </p>
                <RadixInput
                    placeholder={'eg. 12345'}
                    value={formik.values.minPostalCode}
                    onChange={(e) => {
                        const inputValue = e.target.value.replace(/[^0-9]/g, '');
                        formik.setFieldValue('minPostalCode', inputValue);
                    }}
                    className="w-full"
                />
                {formik.touched.minPostalCode && formik.errors.minPostalCode && (
                    <p className="text-sm text-red-500 m-0 p-0">{formik.errors.minPostalCode}</p>
                )}
            </div>

            {formik.values.postalType === 'range' && (
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-text-primary p-0 m-0">{t('Marketing.MaxPostalCode')}</p>
                    <RadixInput
                        placeholder={'eg. 12345'}
                        value={formik.values.maxPostalCode}
                        onChange={(e) => {
                            const inputValue = e.target.value.replace(/[^0-9]/g, '');
                            formik.setFieldValue('maxPostalCode', inputValue);
                        }}
                        className="w-full"
                    />
                    {formik.touched.maxPostalCode && formik.errors.maxPostalCode && (
                        <p className="text-sm text-red-500 m-0 p-0">{formik.errors.maxPostalCode}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default PostalCodeInput;
