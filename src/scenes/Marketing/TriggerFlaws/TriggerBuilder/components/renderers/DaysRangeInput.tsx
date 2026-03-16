import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { RadixSelect } from '@/components/radix';
import { t } from 'i18next';
import { usePlaygroundFormRegistry } from '../../hooks/usePlaygroundFormRegistry';

interface DaysRangeInputProps {
    value: number[] | number | null; // Accept both array (backward compatibility) and number
    conditionInstanceId: string;
    isBooking?: boolean;
}

// Days options: label and value in days
const getDaysOptions = (isBooking: boolean) => {
    if (isBooking) {
        return [
            { label: `${t('Common.After')} 3 ${t('Setting.Days')}`, value: 3 },
            { label: `${t('Common.After')} 7 ${t('Setting.Days')}`, value: 7 },
            { label: `${t('Common.After')} 15 ${t('Setting.Days')}`, value: 15 },
            { label: `${t('Common.After')} 30 ${t('Setting.Days')}`, value: 30 },
            { label: `${t('Common.After')} 2 ${t('Marketing.Months')}`, value: 60 },
            { label: `${t('Common.After')} 3 ${t('Marketing.Months')}`, value: 90 },
            { label: `${t('Common.After')} 6 ${t('Marketing.Months')}`, value: 180 },
        ];
    } else {
        return [
            { label: `${t('Common.Before')} 3 ${t('Setting.Days')}`, value: 3 },
            { label: `${t('Common.Before')} 7 ${t('Setting.Days')}`, value: 7 },
            { label: `${t('Common.Before')} 15 ${t('Setting.Days')}`, value: 15 },
            { label: `${t('Common.Before')} 30 ${t('Setting.Days')}`, value: 30 },
            { label: `${t('Common.Before')} 2 ${t('Marketing.Months')}`, value: 60 },
            { label: `${t('Common.Before')} 3 ${t('Marketing.Months')}`, value: 90 },
            { label: `${t('Common.Before')} 6 ${t('Marketing.Months')}`, value: 180 },
        ];
    }
};

const validationSchema = Yup.object().shape({
    days: Yup.number().test('required', t('Marketing.DaysRequired'), (value) => value !== null && value !== undefined),
});

const DaysRangeInput = ({ value, conditionInstanceId, isBooking = false }: DaysRangeInputProps) => {
    const { register } = usePlaygroundFormRegistry();
    // Handle both array (backward compatibility) and number formats
    const daysValue = Array.isArray(value) ? value[0] : typeof value === 'number' ? value : null;

    const formik = useFormik({
        initialValues: {
            days: daysValue ?? 7,
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
                    formik.setTouched({ days: true });
                    return false;
                }
                return true;
            },
            getValues: () => formik.values.days,
        });
        // Keep validator in registry on unmount so we can validate all at once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conditionInstanceId, formik.values, register]);

    return (
        <div className="flex flex-col items-start">
            <p className="text-sm leading-5 font-normal text-text-primary m-0 p-0 mb-1">
                {isBooking ? t('Marketing.SelectTimePeriod') : t('Marketing.SelectDaysRange')}
            </p>
            <div className="w-full">
                <RadixSelect
                    options={
                        getDaysOptions(isBooking).map((opt) => ({
                            label: opt.label,
                            value: String(opt.value),
                        })) ?? []
                    }
                    onValueChange={(val) => {
                        const numVal = val ? Number(val) : 7;
                        formik.setFieldValue('days', numVal);
                    }}
                    placeholder={isBooking ? t('Marketing.SelectTimePeriod') : t('Marketing.SelectDaysRange')}
                    className="w-full"
                    value={String(formik.values.days)}
                />
                {formik.touched.days && formik.errors.days && (
                    <div className="text-sm text-error-500 mt-1">{formik.errors.days}</div>
                )}
            </div>
        </div>
    );
};

export default DaysRangeInput;
