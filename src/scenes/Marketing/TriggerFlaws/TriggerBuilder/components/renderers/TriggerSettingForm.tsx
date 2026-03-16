import React, { useEffect, useImperativeHandle, useMemo } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    RadixInput,
    RadixSelect,
    RadixCheckbox,
    RadixPhoneField,
    RadixTextarea,
    type PhoneValue,
} from '@/components/radix';
import { t } from 'i18next';
import moment from 'moment';
import { ConditionComponentRef } from '../ConditionRenderer';
import { TriggerFlowData } from '@/redux/slices/Marketing/triggerFlow';

// Period options: label and value in days (same as DaysRangeInput)
const periodOptions = (type: 'waiting' | 'spam') => [
    {
        label: t('Marketing.PleaseSelect', {
            type: type === 'waiting' ? t('Marketing.WaitingPeriod') : t('Marketing.SpamPeriod'),
        }),
        value: 'UNSET',
    },
    { label: `3 ${t('Setting.Days')}`, value: '3' },
    { label: `7 ${t('Setting.Days')}`, value: '7' },
    { label: `15 ${t('Setting.Days')}`, value: '15' },
    { label: `30 ${t('Setting.Days')}`, value: '30' },
    { label: `2 ${t('Marketing.Months')}`, value: '60' },
    { label: `3 ${t('Marketing.Months')}`, value: '90' },
    { label: `6 ${t('Marketing.Months')}`, value: '180' },
];

interface TriggerSettingFormProps {
    value?: any;
    conditionRef?: React.MutableRefObject<ConditionComponentRef | null>;
    onChange?: (value: TriggerFlowData['triggerSetting']) => void;
}

interface TriggerSettingValues extends Omit<NonNullable<TriggerFlowData['triggerSetting']>, 'testPhoneNumber'> {
    testPhoneNumber: PhoneValue | string;
}

const validationSchema = Yup.object().shape({
    weekdays: Yup.object().shape({
        Mon: Yup.boolean(),
        Tue: Yup.boolean(),
        Wed: Yup.boolean(),
        Thu: Yup.boolean(),
        Fri: Yup.boolean(),
        Sat: Yup.boolean(),
        Sun: Yup.boolean(),
    }),
    waitingPeriod: Yup.string().nullable(),
    spamPeriod: Yup.string().nullable(),
    name: Yup.string().required(t('Customer.ADVJournalFieldNameError')),
});

const TriggerSettingForm = ({ value, conditionRef, onChange }: TriggerSettingFormProps) => {
    // Convert value from Redux (ISO strings) to Date objects for form
    // Memoize to prevent unnecessary re-renders
    const initialValues: TriggerSettingValues = useMemo(() => {
        if (value) {
            // Convert phone number from string to PhoneValue if needed
            let testPhoneNumber: PhoneValue | string = value.testPhoneNumber || '';
            if (typeof testPhoneNumber === 'string' && testPhoneNumber) {
                testPhoneNumber = { country_code: '+45', phone: testPhoneNumber, countryISOCode: 'DK' };
            } else if (!testPhoneNumber || (typeof testPhoneNumber === 'object' && !testPhoneNumber.phone)) {
                testPhoneNumber = { country_code: '+45', phone: '', countryISOCode: 'DK' };
            }

            return {
                ...value,
                testPhoneNumber,
            };
        }
        return {
            name: '',
            triggerType: 'EMAIL',
            testPhoneNumber: { country_code: '+45', phone: '', countryISOCode: 'DK' },
            description: '',
            testEmail: '',
            bccEmail: '',
            weekdays: {
                Mon: false,
                Tue: false,
                Wed: false,
                Thu: false,
                Fri: false,
                Sat: false,
                Sun: false,
            },
            waitingPeriod: 'UNSET',
            spamPeriod: 'UNSET',
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        value?.name,
        value?.triggerType,
        value?.testPhoneNumber,
        value?.description,
        value?.testEmail,
        value?.bccEmail,
        value?.waitingPeriod,
        value?.spamPeriod,
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ]);

    const formik = useFormik({
        initialValues,
        validationSchema,
        enableReinitialize: true, // Re-enable but with stable initialValues
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: () => {
            // Validation handled automatically
        },
    });

    // Expose validate and getValues methods via ref
    useImperativeHandle(
        conditionRef,
        () => ({
            validate: async () => {
                const errors = await formik.validateForm();
                if (Object.keys(errors).length > 0) {
                    // Mark all fields as touched to show errors
                    formik.setTouched({
                        name: true,
                        triggerType: true,
                        testPhoneNumber: true,
                        description: true,
                        testEmail: true,
                        bccEmail: true,
                        triggerTime: true,
                        weekdays: {
                            Mon: true,
                            Tue: true,
                            Wed: true,
                            Thu: true,
                            Fri: true,
                            Sat: true,
                            Sun: true,
                        },
                        waitingPeriod: true,
                        spamPeriod: true,
                    });
                    return false;
                }
                return true;
            },
            getValues: () => {
                const values = formik.values;
                const restValues = { ...values };
                if (restValues.waitingPeriod === 'UNSET') {
                    restValues.waitingPeriod = null;
                }
                if (restValues.spamPeriod === 'UNSET') {
                    restValues.spamPeriod = null;
                }
                return {
                    ...restValues,
                    triggerTime: values.triggerTime,
                };
            },
        }),
        [formik],
    );

    // Auto-save to Redux when form values change (only when different from value to avoid update loop)
    const testPhoneNumberKey = JSON.stringify(formik.values.testPhoneNumber);
    const weekdaysKey = JSON.stringify(formik.values.weekdays);
    useEffect(() => {
        if (!onChange) return;
        const values = formik.values;
        const payload = {
            ...values,
            waitingPeriod: values.waitingPeriod === 'UNSET' ? null : values.waitingPeriod,
            spamPeriod: values.spamPeriod === 'UNSET' ? null : values.spamPeriod,
        } as TriggerFlowData['triggerSetting'];
        const prev = value;
        if (prev && JSON.stringify(prev) === JSON.stringify(payload)) return;
        onChange(payload);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        value,
        formik.values.name,
        formik.values.triggerType,
        formik.values.description,
        formik.values.testEmail,
        formik.values.bccEmail,
        formik.values.triggerTime,
        formik.values.waitingPeriod,
        formik.values.spamPeriod,
        testPhoneNumberKey,
        weekdaysKey,
        onChange,
    ]);

    const handleWeekdayChange = (day: keyof TriggerSettingValues['weekdays'], checked: boolean) => {
        const newWeekdays = {
            ...formik.values.weekdays,
            [day]: checked,
        };
        formik.setFieldValue('weekdays', newWeekdays);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Name of trigger */}
            <div>
                <label className="text-sm font-medium text-text-primary">{t('Marketing.NameOfTrigger')}</label>
                <RadixInput
                    name="name"
                    id="name"
                    value={formik.values.name}
                    onChange={(e) => {
                        formik.setFieldValue('name', e.target.value);
                    }}
                    onBlur={formik.handleBlur}
                    placeholder="Test"
                    error={formik.touched.name && formik.errors.name ? String(formik.errors.name) : undefined}
                />
            </div>
            {/* Trigger type */}
            <div>
                <label className="text-sm font-medium text-text-primary">{t('Marketing.TriggerType')}</label>
                <RadixSelect
                    value={formik.values.triggerType}
                    onValueChange={(val) => {
                        formik.setFieldValue('triggerType', val);
                    }}
                    options={[
                        { value: 'EMAIL', label: t('Common.Email') },
                        { value: 'SMS', label: t('Calendar.SMS') },
                    ]}
                />
                {formik.touched.triggerType && formik.errors.triggerType && (
                    <p className="text-xs text-error-500">{String(formik.errors.triggerType)}</p>
                )}
            </div>

            {/* Test Phone number */}
            {formik.values.triggerType === 'SMS' && (
                <RadixPhoneField
                    name="testPhoneNumber"
                    id="testPhoneNumber"
                    label={t('Marketing.TestPhoneNumber')}
                    value={
                        typeof formik.values.testPhoneNumber === 'string'
                            ? { country_code: '+45', phone: formik.values.testPhoneNumber, countryISOCode: 'DK' }
                            : formik.values.testPhoneNumber || { country_code: '+45', phone: '', countryISOCode: 'DK' }
                    }
                    onChange={(phoneValue) => {
                        formik.setFieldValue('testPhoneNumber', phoneValue);
                    }}
                    onBlur={formik.handleBlur}
                    placeholder="5689567892"
                    error={
                        formik.touched.testPhoneNumber && formik.errors.testPhoneNumber
                            ? String(formik.errors.testPhoneNumber)
                            : undefined
                    }
                />
            )}

            {/* Description */}
            <div>
                <label className="text-sm font-medium text-text-primary">{t('Setting.Description')}</label>
                <RadixTextarea
                    name="description"
                    id="description"
                    value={formik.values.description}
                    onChange={(e) => {
                        formik.setFieldValue('description', e.target.value);
                    }}
                    onBlur={formik.handleBlur}
                    placeholder={t('Marketing.AddDescriptionHere')}
                    rows={4}
                    resize="vertical"
                    error={
                        formik.touched.description && formik.errors.description
                            ? String(formik.errors.description)
                            : undefined
                    }
                />
            </div>

            {/* Test email */}
            {formik.values.triggerType === 'EMAIL' && (
                <div>
                    <label className="text-sm font-medium text-text-primary">{t('Marketing.TestEmail')}</label>
                    <RadixInput
                        name="testEmail"
                        id="testEmail"
                        value={formik.values.testEmail}
                        onChange={(e) => {
                            formik.setFieldValue('testEmail', e.target.value);
                        }}
                        onBlur={formik.handleBlur}
                        placeholder="abc@example.com"
                        type="email"
                        error={
                            formik.touched.testEmail && formik.errors.testEmail
                                ? String(formik.errors.testEmail)
                                : undefined
                        }
                    />
                </div>
            )}

            {/* Bcc email */}
            {formik.values.triggerType === 'EMAIL' && (
                <div>
                    <label className="text-sm font-medium text-text-primary">{t('Marketing.BccEmail')}</label>
                    <RadixInput
                        name="bccEmail"
                        id="bccEmail"
                        value={formik.values.bccEmail}
                        onChange={(e) => {
                            formik.setFieldValue('bccEmail', e.target.value);
                        }}
                        onBlur={formik.handleBlur}
                        placeholder="abc@example.com"
                        type="email"
                        error={
                            formik.touched.bccEmail && formik.errors.bccEmail
                                ? String(formik.errors.bccEmail)
                                : undefined
                        }
                    />
                </div>
            )}

            {/* Trigger Time */}
            <div>
                <label className="text-sm font-medium text-text-primary">{t('Common.Time')}</label>
                <RadixSelect
                    value={String(formik.values.triggerTime || '')}
                    onValueChange={(val) => {
                        formik.setFieldValue('triggerTime', val);
                    }}
                    options={Array.from({ length: 24 }, (_, i) => ({
                        value: String(i),
                        label: i < 10 ? `0${i}:00` : `${i}:00`,
                    }))}
                />
                {formik.touched.triggerTime && formik.errors.triggerTime && (
                    <p className="text-xs text-error-500">{String(formik.errors.triggerTime)}</p>
                )}
            </div>

            {/* Weekdays */}
            <div>
                <label className="text-sm font-medium text-text-primary">{t('Statistics.Weekdays')}</label>
                <div className="flex flex-wrap gap-3">
                    {(
                        [
                            { key: 'Mon', dayIndex: 1 },
                            { key: 'Tue', dayIndex: 2 },
                            { key: 'Wed', dayIndex: 3 },
                            { key: 'Thu', dayIndex: 4 },
                            { key: 'Fri', dayIndex: 5 },
                            { key: 'Sat', dayIndex: 6 },
                            { key: 'Sun', dayIndex: 0 },
                        ] as const
                    ).map(({ key, dayIndex }) => (
                        <RadixCheckbox
                            key={key}
                            checked={formik.values.weekdays[key]}
                            onChange={(checked) => handleWeekdayChange(key, checked)}
                            label={moment().day(dayIndex).format('ddd')}
                        />
                    ))}
                </div>
                {formik.touched.weekdays && typeof formik.errors.weekdays === 'object' && formik.errors.weekdays && (
                    <p className="text-xs text-error-500">{String(formik.errors.weekdays)}</p>
                )}
            </div>

            {/* Waiting Period */}
            <div>
                <label className="text-sm font-medium text-text-primary">{t('Marketing.WaitingPeriod')}</label>
                <RadixSelect
                    value={formik.values.waitingPeriod || 'UNSET'}
                    onValueChange={(val) => {
                        formik.setFieldValue('waitingPeriod', val);
                    }}
                    options={periodOptions('waiting')}
                />
                {formik.touched.waitingPeriod && formik.errors.waitingPeriod && (
                    <p className="text-xs text-error-500">{String(formik.errors.waitingPeriod)}</p>
                )}
            </div>

            {/* Spam Period */}
            <div>
                <label className="text-sm font-medium text-text-primary">{t('Marketing.SpamPeriod')}</label>
                <RadixSelect
                    value={formik.values.spamPeriod || 'UNSET'}
                    onValueChange={(val) => {
                        formik.setFieldValue('spamPeriod', val);
                    }}
                    options={periodOptions('spam')}
                    placeholder={t('Marketing.SelectDaysRange')}
                />
                {formik.touched.spamPeriod && formik.errors.spamPeriod && (
                    <p className="text-xs text-error-500">{String(formik.errors.spamPeriod)}</p>
                )}
            </div>
        </div>
    );
};

export default TriggerSettingForm;
