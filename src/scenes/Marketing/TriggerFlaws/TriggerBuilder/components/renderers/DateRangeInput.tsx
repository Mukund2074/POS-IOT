import React, { useImperativeHandle } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { RadixDatePicker } from '@/components/radix';
import { t } from 'i18next';
import { formatDateToISO, parseDateFromISO } from '@/utils/dateFormatter';

interface ConditionComponentRef {
    validate: () => Promise<boolean>;
    getValues: () => [string | null, string | null];
}

interface DateRangeInputProps {
    value: [string | null, string | null] | null | undefined;
    conditionRef?: React.MutableRefObject<ConditionComponentRef | null>;
}

const validationSchema = Yup.object().shape({
    fromDate: Yup.string().nullable(),
    toDate: Yup.string()
        .nullable()
        .test('is-after-from', t('Marketing.ToDateMustBeAfterFromDate'), function (value) {
            const { fromDate } = this.parent;
            if (!fromDate || !value) return true;
            return new Date(value) >= new Date(fromDate);
        }),
});

const DateRangeInput = ({ value, conditionRef }: DateRangeInputProps) => {
    const formik = useFormik({
        initialValues: {
            fromDate: (Array.isArray(value) && value.length === 2 ? value[0] : null) ?? null,
            toDate: (Array.isArray(value) && value.length === 2 ? value[1] : null) ?? null,
        },
        validationSchema,
        enableReinitialize: true,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: () => {},
    });

    useImperativeHandle(conditionRef, () => ({
        validate: async () => {
            const errors = await formik.validateForm();
            if (Object.keys(errors).length > 0) {
                formik.setTouched({ fromDate: true, toDate: true });
                return false;
            }
            return true;
        },
        getValues: () => [formik.values.fromDate, formik.values.toDate],
    }));

    // Parse date strings to Date objects for date pickers
    // Ensure we only pass valid Date objects or null
    const fromDate = parseDateFromISO(formik.values.fromDate);
    const toDate = parseDateFromISO(formik.values.toDate);

    // Validate dates before passing to RadixDatePicker
    const isValidDate = (date: Date | null): boolean => {
        if (!date) return false;
        return date instanceof Date && !isNaN(date.getTime());
    };

    const validFromDate = fromDate && isValidDate(fromDate) ? fromDate : null;
    const validToDate = toDate && isValidDate(toDate) ? toDate : null;

    const handleFromDateChange = (date: Date | null) => {
        const fromDateStr = formatDateToISO(date);
        formik.setFieldValue('fromDate', fromDateStr);
    };

    const handleToDateChange = (date: Date | null) => {
        const toDateStr = formatDateToISO(date);
        formik.setFieldValue('toDate', toDateStr);
    };

    return (
        <div className="space-y-3">
            <div>
                <RadixDatePicker
                    label={t('Marketing.FromDate')}
                    value={validFromDate}
                    onChange={handleFromDateChange}
                    placeholder={t('Marketing.SelectFromDate')}
                    maxDate={validToDate || undefined}
                />
                {formik.touched.fromDate && formik.errors.fromDate && (
                    <div className="text-sm text-error-500 mt-1">
                        {typeof formik.errors.fromDate === 'string' ? formik.errors.fromDate : ''}
                    </div>
                )}
            </div>
            <div>
                <RadixDatePicker
                    label={t('Marketing.ToDate')}
                    value={validToDate}
                    onChange={handleToDateChange}
                    placeholder={t('Marketing.SelectToDate')}
                    minDate={validFromDate || undefined}
                />
                {formik.touched.toDate && formik.errors.toDate && (
                    <div className="text-sm text-error-500 mt-1">
                        {typeof formik.errors.toDate === 'string' ? formik.errors.toDate : ''}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DateRangeInput;
