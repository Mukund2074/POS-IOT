import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { RadixInput, RadixRadio, RadixRadioGroup, RadixCheckbox } from '@/components/radix';
import { t } from 'i18next';
import { usePlaygroundFormRegistry } from '../../hooks/usePlaygroundFormRegistry';

interface BirthdayInputProps {
    value: number[] | string | null | undefined;
    conditionInstanceId: string;
    fieldValue?: Record<string, any>; // Direct fieldValue instead of compositeValues
}

const validationSchema = Yup.object().shape({
    milestone: Yup.boolean().required(),
    mode: Yup.string().oneOf(['exactDay', 'range']).required(),
    beforeDays: Yup.number()
        .nullable()
        .when('mode', {
            is: 'range',
            then: (schema) =>
                schema.required(t('Marketing.BeforeDaysRequired')).typeError(t('Marketing.BeforeDaysMustBeNumber')),
            otherwise: (schema) => schema.nullable().typeError(t('Marketing.BeforeDaysMustBeNumber')),
        }),
    afterDays: Yup.number()
        .nullable()
        .when('mode', {
            is: 'range',
            then: (schema) =>
                schema.required(t('Marketing.AfterDaysRequired')).typeError(t('Marketing.AfterDaysMustBeNumber')),
            otherwise: (schema) => schema.nullable().typeError(t('Marketing.AfterDaysMustBeNumber')),
        }),
});

const BirthdayInput = ({ value, conditionInstanceId, fieldValue }: BirthdayInputProps) => {
    // Direct access to initial values
    const isFieldValueObject = fieldValue && typeof fieldValue === 'object' && !Array.isArray(fieldValue);
    const isValueArray = Array.isArray(value) && value.length === 2;

    // Initial milestone: from fieldValue.milestone or default to false
    const initialMilestone =
        isFieldValueObject && typeof fieldValue.milestone === 'boolean' ? fieldValue.milestone : false;

    // Initial mode: range if milestone is false and has last/next, otherwise exactDay
    const initialMode: 'exactDay' | 'range' =
        isFieldValueObject &&
        fieldValue.milestone === false &&
        typeof fieldValue.last === 'number' &&
        typeof fieldValue.next === 'number'
            ? 'range'
            : isValueArray
              ? 'range'
              : 'exactDay';

    // Initial days: extract from fieldValue or value array
    const initialDays = {
        beforeDays:
            initialMode === 'range' && isFieldValueObject && typeof fieldValue.last === 'number'
                ? fieldValue.last
                : isValueArray && typeof value[0] === 'number'
                  ? value[0]
                  : null,
        afterDays:
            initialMode === 'range' && isFieldValueObject && typeof fieldValue.next === 'number'
                ? fieldValue.next
                : isValueArray && typeof value[1] === 'number'
                  ? value[1]
                  : null,
    };

    const formik = useFormik({
        initialValues: {
            milestone: initialMilestone,
            mode: initialMode,
            beforeDays: initialDays.beforeDays,
            afterDays: initialDays.afterDays,
        },
        validationSchema,
        enableReinitialize: true,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: () => {},
    });

    const { register } = usePlaygroundFormRegistry();
    useEffect(() => {
        register(conditionInstanceId, {
            validate: async () => {
                const errors = await formik.validateForm();
                if (Object.keys(errors).length > 0) {
                    formik.setTouched({
                        milestone: true,
                        mode: true,
                        beforeDays: true,
                        afterDays: true,
                    });
                    return false;
                }
                return true;
            },
            getValues: () => {
                const result: Record<string, any> = {};
                const currentMilestone = formik.values.milestone;
                const currentMode = formik.values.mode;
                const currentBeforeDays = formik.values.beforeDays;
                const currentAfterDays = formik.values.afterDays;

                if (currentMode === 'range') {
                    const rangeFieldValue: any = {
                        milestone: currentMilestone,
                    };
                    if (typeof currentBeforeDays === 'number') {
                        rangeFieldValue.last = currentBeforeDays;
                    }
                    if (typeof currentAfterDays === 'number') {
                        rangeFieldValue.next = currentAfterDays;
                    }
                    result.fieldValue = rangeFieldValue;
                } else {
                    result.fieldValue = {
                        milestone: currentMilestone,
                    };
                }

                if (result.fieldValue && currentMode === 'exactDay') {
                    delete result.fieldValue.last;
                    delete result.fieldValue.next;
                }

                return result;
            },
        });
        // Keep validator in registry on unmount so we can validate all at once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conditionInstanceId, formik.values, register]);

    const handleMilestoneChange = (checked: boolean) => {
        formik.setFieldValue('milestone', checked);
    };

    const handleModeChange = (newMode: string) => {
        formik.setFieldValue('mode', newMode);
        if (newMode !== 'range') {
            formik.setFieldValue('beforeDays', null);
            formik.setFieldValue('afterDays', null);
        }
    };

    const handleBeforeDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value.replace(/[^0-9]/g, '');
        const numValue = inputValue === '' ? null : Number(inputValue);
        if (inputValue === '' || (!isNaN(numValue!) && numValue !== null)) {
            formik.setFieldValue('beforeDays', numValue);
        }
    };

    const handleAfterDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value.replace(/[^0-9]/g, '');
        const numValue = inputValue === '' ? null : Number(inputValue);
        if (inputValue === '' || (!isNaN(numValue!) && numValue !== null)) {
            formik.setFieldValue('afterDays', numValue);
        }
    };

    return (
        <div className="space-y-4">
            {/* Milestone Checkbox */}
            <div>
                <RadixCheckbox
                    checked={formik.values.milestone}
                    onChange={handleMilestoneChange}
                    label={t('Marketing.MilestoneBirthday')}
                />
            </div>

            {/* Mode Selection - Radio Buttons (always visible) */}
            <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                    {t('Marketing.BirthdayMode')}
                </label>
                <RadixRadioGroup value={formik.values.mode} onValueChange={handleModeChange}>
                    <RadixRadio value="exactDay" label={t('Marketing.ExactDayTrigger')} />
                    <RadixRadio value="range" label={t('Marketing.BirthdayBetween')} />
                </RadixRadioGroup>
            </div>

            {/* Range Mode - Days Before/After */}
            {formik.values.mode === 'range' && (
                <div className="border-l-2 border-primary-200 space-y-3 pl-4">
                    <p className="text-sm text-text-secondary">{t('Marketing.BirthdayRangeDescription')}</p>
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            {t('Marketing.DaysBefore')}
                        </label>
                        <RadixInput
                            type="number"
                            placeholder="e.g., 50"
                            value={formik.values.beforeDays !== null ? String(formik.values.beforeDays) : ''}
                            onChange={handleBeforeDaysChange}
                            onBlur={formik.handleBlur}
                            className="w-full"
                        />
                        {formik.touched.beforeDays && formik.errors.beforeDays && (
                            <div className="text-sm text-error-500 mt-1">
                                {typeof formik.errors.beforeDays === 'string' ? formik.errors.beforeDays : ''}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            {t('Marketing.DaysAfter')}
                        </label>
                        <RadixInput
                            type="number"
                            placeholder="e.g., 30"
                            value={formik.values.afterDays !== null ? String(formik.values.afterDays) : ''}
                            onChange={handleAfterDaysChange}
                            onBlur={formik.handleBlur}
                            className="w-full"
                        />
                        {formik.touched.afterDays && formik.errors.afterDays && (
                            <div className="text-sm text-error-500 mt-1">
                                {typeof formik.errors.afterDays === 'string' ? formik.errors.afterDays : ''}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Exact Day Mode - Info */}
            {formik.values.mode === 'exactDay' && (
                <div className="border-l-2 border-primary-200 space-y-3 pl-4">
                    <p className="text-sm text-text-secondary">{t('Marketing.ExactDayTriggerDescription')}</p>
                </div>
            )}
        </div>
    );
};

export default BirthdayInput;
