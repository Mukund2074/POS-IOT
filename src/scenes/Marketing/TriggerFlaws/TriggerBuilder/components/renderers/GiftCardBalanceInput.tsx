import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { RadixSelect, RadixInput } from '@/components/radix';
import { t } from 'i18next';
import { usePlaygroundFormRegistry } from '../../hooks/usePlaygroundFormRegistry';

interface GiftCardBalanceCompositeValues {
    balanceOperator: '>' | '<' | '=';
    balanceAmount: number | null;
    expirationPeriod: [number | null, number | null];
}

interface GiftCardBalanceInputProps {
    value: number | null | undefined;
    compositeValues?: GiftCardBalanceCompositeValues;
    conditionInstanceId: string;
}

// Balance operator options
const balanceOperatorOptions = [
    { label: 'Greater than', value: '>' },
    { label: 'Less than', value: '<' },
    { label: 'Equal to', value: '=' },
];

const validationSchema = Yup.object().shape({
    balanceOperator: Yup.string().oneOf(['>', '<', '=']).required(t('Marketing.BalanceOperatorRequired')),
    balanceAmount: Yup.number()
        .required(t('Marketing.BalanceAmountRequired'))
        .typeError(t('Marketing.BalanceAmountMustBeNumber'))
        .min(0, t('Marketing.BalanceAmountMustBePositive')),
    expirationPeriod: Yup.array()
        .of(Yup.number().nullable())
        .test('required', t('Marketing.DaysRequired'), (value) => {
            return Array.isArray(value) && value.length >= 1 && value[0] !== null && value[0] !== undefined;
        }),
});

const GiftCardBalanceInput = ({ value, compositeValues, conditionInstanceId }: GiftCardBalanceInputProps) => {
    const { register } = usePlaygroundFormRegistry();
    const balanceOperator = compositeValues?.balanceOperator || '>';
    const balanceAmount = compositeValues?.balanceAmount || null;
    const expirationPeriod = compositeValues?.expirationPeriod || [7, null];

    const formik = useFormik({
        initialValues: {
            balanceOperator: balanceOperator,
            balanceAmount: balanceAmount,
            expirationPeriod: expirationPeriod,
        },
        validationSchema,
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
                    formik.setTouched({ balanceOperator: true, balanceAmount: true, expirationPeriod: true });
                    return false;
                }
                return true;
            },
            getValues: () => ({
                balanceOperator: formik.values.balanceOperator,
                balanceAmount: formik.values.balanceAmount,
                expirationPeriod: formik.values.expirationPeriod,
            }),
        });
        // Keep validator in registry on unmount so we can validate all at once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conditionInstanceId, formik.values, register]);

    const handleBalanceOperatorChange = (val: string) => {
        formik.setFieldValue('balanceOperator', val);
    };

    const handleBalanceAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const amount = e.target.value ? Number(e.target.value) : null;
        formik.setFieldValue('balanceAmount', amount);
    };

    return (
        <div className="flex flex-col gap-4 space-y-4">
            {/* Balance Operator */}
            <div className="w-full">
                <label className="block text-sm font-medium text-text-primary mb-2">
                    {t('Marketing.BalanceCondition')}
                </label>
                <RadixSelect
                    options={balanceOperatorOptions.map((opt) => ({
                        label: opt.label,
                        value: opt.value,
                    }))}
                    value={formik.values.balanceOperator}
                    onValueChange={handleBalanceOperatorChange}
                    placeholder={t('Marketing.SelectBalanceCondition')}
                    className="w-full"
                />
                {formik.touched.balanceOperator && formik.errors.balanceOperator && (
                    <div className="text-sm text-red-500 mt-1">
                        {typeof formik.errors.balanceOperator === 'string'
                            ? formik.errors.balanceOperator
                            : t('Marketing.BalanceOperatorRequired')}
                    </div>
                )}
            </div>

            {/* Balance Amount */}
            <div className="w-full">
                <label className="block text-sm font-medium text-text-primary mb-2">{t('Common.Amount')}</label>
                <RadixInput
                    type="number"
                    value={formik.values.balanceAmount !== null ? String(formik.values.balanceAmount) : ''}
                    onChange={handleBalanceAmountChange}
                    placeholder="1000"
                    className="w-full"
                />
                {formik.touched.balanceAmount && formik.errors.balanceAmount && (
                    <div className="text-sm text-red-500 mt-1">
                        {typeof formik.errors.balanceAmount === 'string'
                            ? formik.errors.balanceAmount
                            : t('Marketing.BalanceAmountRequired')}
                    </div>
                )}
            </div>

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
                    <div className="text-sm text-red-500 mt-1">
                        {typeof formik.errors.expirationPeriod === 'string'
                            ? formik.errors.expirationPeriod
                            : t('Marketing.DaysRequired')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GiftCardBalanceInput;
