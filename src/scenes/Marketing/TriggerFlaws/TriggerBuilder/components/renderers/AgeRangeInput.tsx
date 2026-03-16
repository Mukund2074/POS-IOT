import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { RadixInput } from '@/components/radix';
import { t } from 'i18next';
import { usePlaygroundFormRegistry } from '../../hooks/usePlaygroundFormRegistry';

interface AgeRangeInputProps {
    value: [number | null, number | null] | null;
    conditionInstanceId: string;
}

const validationSchema = Yup.object().shape({
    minAge: Yup.number()
        .required(() => t('Marketing.AgeFrom') + ' ' + t('Customer.IsRequired'))
        .test('is-positive', t('Marketing.InvalidAgeRange'), function (value) {
            if (value === null || value === undefined) return true;
            return value > 0;
        })
        .typeError(t('Marketing.InvalidAgeRange')),
    maxAge: Yup.number()
        .required(() => t('Marketing.AgeTo') + ' ' + t('Customer.IsRequired'))
        .min(0, t('Marketing.InvalidAgeRange'))
        .test('is-greater-than-min', t('Marketing.InvalidAgeRange'), function (value) {
            const { minAge } = this.parent;
            if (minAge === null || value === null || value === undefined) return true;
            return value > minAge;
        })
        .typeError(t('Marketing.InvalidAgeRange')),
});

const AgeRangeInput = ({ value, conditionInstanceId }: AgeRangeInputProps) => {
    const { register } = usePlaygroundFormRegistry();
    const formik = useFormik({
        initialValues: {
            minAge: value?.[0] ?? null,
            maxAge: value?.[1] ?? null,
        },
        validationSchema,
        enableReinitialize: true,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: () => {},
    });

    useEffect(() => {
        register(conditionInstanceId, {
            validate: async () => {
                const errors = await formik.validateForm();
                if (Object.keys(errors).length > 0) {
                    formik.setTouched({ minAge: true, maxAge: true });
                    return false;
                }
                return true;
            },
            getValues: () => [formik.values.minAge, formik.values.maxAge],
        });
        // Keep validator in registry on unmount so we can validate all at once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conditionInstanceId, formik.values, register]);

    return (
        <div className="flex flex-col items-start">
            <label className="block text-sm font-medium text-text-primary">{t('Marketing.AgeFrom')}</label>
            <RadixInput
                type="number"
                name="minAge"
                id="minAge"
                placeholder={t('Marketing.AgeFrom')}
                value={formik.values.minAge !== null ? String(formik.values.minAge) : ''}
                onChange={(e) => {
                    const inputValue = e.target.value.replace(/[^0-9]/g, '');
                    if (inputValue === '') {
                        formik.setFieldValue('minAge', null);
                        return;
                    }
                    const val = Number(inputValue);
                    if (!isNaN(val) && val > 0) {
                        formik.setFieldValue('minAge', val);
                    }
                }}
                onBlur={formik.handleBlur}
                min={1}
            />
            {formik.touched.minAge && formik.errors.minAge && (
                <div className="text-sm text-error-500 mt-1">{formik.errors.minAge}</div>
            )}

            <label className="block text-sm font-medium text-text-primary mt-3">{t('Marketing.AgeTo')}</label>
            <RadixInput
                type="number"
                name="maxAge"
                id="maxAge"
                placeholder={t('Marketing.AgeTo')}
                value={formik.values.maxAge !== null ? String(formik.values.maxAge) : ''}
                onChange={(e) => {
                    const inputValue = e.target.value.replace(/[^0-9]/g, '');
                    if (inputValue === '') {
                        formik.setFieldValue('maxAge', null);
                        return;
                    }
                    const val = Number(inputValue);
                    formik.setFieldValue('maxAge', val);
                }}
                onBlur={formik.handleBlur}
                min={formik.values.minAge !== null ? formik.values.minAge + 1 : undefined}
                disabled={formik.values.minAge === null}
            />
            {formik.touched.maxAge && formik.errors.maxAge && (
                <div className="text-sm text-error-500 mt-1">{formik.errors.maxAge}</div>
            )}
        </div>
    );
};

export default AgeRangeInput;
