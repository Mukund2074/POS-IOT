import React, { useEffect, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { RadixMultiSelect, RadixSelect } from '@/components/radix';
import { t } from 'i18next';
// @ts-ignore - Service.js doesn't have type definitions
import { GetServiceGroup } from '@/utils/Api/Service';
import { usePlaygroundFormRegistry } from '../../hooks/usePlaygroundFormRegistry';

interface ActiveBookingServiceCompositeValues {
    serviceIds?: number[] | string[];
    days?: [number | null, number | null];
    operator?: string; // Operator for days condition (BEFORE_DAYS, WITHIN_LAST_DAYS)
    status?: ('BOOKED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NOSHOW')[] | 'CANCELLED'[];
}

interface ActiveBookingServiceInputProps {
    value: number[] | string[] | null | undefined;
    compositeValues?: ActiveBookingServiceCompositeValues;
    fixedStatus?: 'BOOKED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NOSHOW';
    conditionInstanceId: string;
    renderId?: number; // renderId 8 shows both BEFORE_DAYS and WITHIN_LAST_DAYS, renderId 9 only shows BEFORE_DAYS
}

// Booking status options
const bookingStatusOptions = [
    { label: t('Calendar.Booked'), value: 'BOOKED' },
    { label: t('Calendar.Rescheduled'), value: 'RESCHEDULED' },
    { label: t('Common.Completed'), value: 'COMPLETED' },
    { label: t('Common.Cancelled'), value: 'CANCELLED' },
    { label: t('Calendar.AbsenceBooking'), value: 'NOSHOW' },
];

// Create unique values by combining operator and number to avoid conflicts
const daysOptions = [
    { label: `${t('Common.After')} 3 ${t('Setting.Days')}`, value: 'BEFORE_DAYS_3', operator: 'BEFORE_DAYS', days: 3 },
    { label: `${t('Common.After')} 7 ${t('Setting.Days')}`, value: 'BEFORE_DAYS_7', operator: 'BEFORE_DAYS', days: 7 },
    {
        label: `${t('Common.After')} 15 ${t('Setting.Days')}`,
        value: 'BEFORE_DAYS_15',
        operator: 'BEFORE_DAYS',
        days: 15,
    },
    {
        label: `${t('Common.After')} 30 ${t('Setting.Days')}`,
        value: 'BEFORE_DAYS_30',
        operator: 'BEFORE_DAYS',
        days: 30,
    },
    {
        label: `${t('Common.After')} 2 ${t('Marketing.Months')}`,
        value: 'BEFORE_DAYS_60',
        operator: 'BEFORE_DAYS',
        days: 60,
    },
    {
        label: `${t('Common.After')} 3 ${t('Marketing.Months')}`,
        value: 'BEFORE_DAYS_90',
        operator: 'BEFORE_DAYS',
        days: 90,
    },
    {
        label: `${t('Common.After')} 6 ${t('Marketing.Months')}`,
        value: 'BEFORE_DAYS_180',
        operator: 'BEFORE_DAYS',
        days: 180,
    },
    {
        label: `${t('Common.Last')} 30 ${t('Setting.Days')}`,
        value: 'WITHIN_LAST_DAYS_30',
        operator: 'WITHIN_LAST_DAYS',
        days: 30,
    },
    {
        label: `${t('Common.Last')} 2 ${t('Marketing.Months')}`,
        value: 'WITHIN_LAST_DAYS_60',
        operator: 'WITHIN_LAST_DAYS',
        days: 60,
    },
    {
        label: `${t('Common.Last')} 3 ${t('Marketing.Months')}`,
        value: 'WITHIN_LAST_DAYS_90',
        operator: 'WITHIN_LAST_DAYS',
        days: 90,
    },
];

// Create validation schema function that accepts fixedStatus
const createValidationSchema = (fixedStatus?: string) => {
    return Yup.object().shape({
        serviceIds: Yup.array().of(Yup.string()).min(1, t('Marketing.ServicesRequired')),
        days: Yup.array()
            .of(Yup.number().nullable())
            .test(
                'required',
                t('Marketing.DaysRequired'),
                (value) => Array.isArray(value) && value.length >= 1 && value[0] !== null && value[0] !== undefined,
            ),
        status: fixedStatus
            ? Yup.array()
                  .of(Yup.string().oneOf([fixedStatus]))
                  .min(1) // If fixedStatus is provided, only validate it matches
            : Yup.array()
                  .of(Yup.string().oneOf(['BOOKED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'NOSHOW']))
                  .min(1, t('Marketing.StatusRequired')),
    });
};

const ActiveBookingServiceInput = ({
    value,
    compositeValues,
    fixedStatus,
    conditionInstanceId,
    renderId,
}: ActiveBookingServiceInputProps) => {
    const { register } = usePlaygroundFormRegistry();
    const [services, setServices] = useState<Array<{ label: string; value: string }>>([]);
    const [loading, setLoading] = useState(true);

    // Filter days options based on renderId
    // renderId 8: Show both BEFORE_DAYS and WITHIN_LAST_DAYS
    // renderId 9 (and others): Only show BEFORE_DAYS
    const filteredDaysOptions = useMemo(() => {
        if (renderId === 8) {
            return daysOptions; // Show all options for renderId 8
        }
        // For renderId 9 and others, only show BEFORE_DAYS options
        return daysOptions.filter((opt) => opt.operator === 'BEFORE_DAYS');
    }, [renderId]);

    // Extract values from compositeValues or use defaults
    const serviceIds = compositeValues?.serviceIds || [];
    const days = compositeValues?.days || [7, null];
    // Extract operator from compositeValues or use default
    // For renderId 9 (and others), force BEFORE_DAYS even if WITHIN_LAST_DAYS is provided
    const operatorFromComposite =
        renderId !== 8 && compositeValues?.operator === 'WITHIN_LAST_DAYS'
            ? 'BEFORE_DAYS'
            : compositeValues?.operator || 'BEFORE_DAYS';

    // Find the matching option based on days value and operator - memoized to recalculate when dependencies change
    // Use filteredDaysOptions to ensure we only match against available options
    const selectedOptionValue = useMemo(() => {
        const daysValue = compositeValues?.days?.[0] ?? 7;
        const operator = compositeValues?.operator || 'BEFORE_DAYS';

        // If renderId is not 8 and operator is WITHIN_LAST_DAYS, fallback to BEFORE_DAYS
        const effectiveOperator = renderId !== 8 && operator === 'WITHIN_LAST_DAYS' ? 'BEFORE_DAYS' : operator;

        const option = filteredDaysOptions.find((opt) => opt.days === daysValue && opt.operator === effectiveOperator);
        return option?.value || 'BEFORE_DAYS_7';
    }, [compositeValues?.days, compositeValues?.operator, filteredDaysOptions, renderId]);

    // Status should always be an array - convert if needed
    const statusFromComposite = compositeValues?.status
        ? Array.isArray(compositeValues.status)
            ? compositeValues.status
            : [compositeValues.status]
        : null;
    const status = fixedStatus ? [fixedStatus] : statusFromComposite || ['BOOKED'];

    const formik = useFormik({
        initialValues: {
            serviceIds: Array.isArray(serviceIds) ? serviceIds.map(String) : [],
            days: days,
            operator: operatorFromComposite, // Store operator for payload
            selectedOptionValue: selectedOptionValue, // Store the composite value for the select
            status: Array.isArray(status) ? status : [status], // Store as array for multi-select
        },
        validationSchema: createValidationSchema(fixedStatus),
        enableReinitialize: true,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: () => {
            // Validation handled automatically
        },
    });

    // Fetch services on mount
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const response = await GetServiceGroup();
                const serviceGroups = response?.data?.data || [];

                // Flatten all services from all groups
                const allServices: Array<{ label: string; value: string }> = [];
                serviceGroups.forEach((group: { services?: Array<{ id: number | string; name?: string }> }) => {
                    if (group.services && Array.isArray(group.services)) {
                        group.services.forEach((service: { id: number | string; name?: string }) => {
                            allServices.push({
                                label: service.name || `Service ${service.id}`,
                                value: String(service.id),
                            });
                        });
                    }
                });

                setServices(allServices);
            } catch (error) {
                console.error('Error fetching services:', error);
                setServices([]);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    useEffect(() => {
        register(conditionInstanceId, {
            validate: async () => {
                formik.setTouched({ serviceIds: true, days: true, status: true });
                const errors = await formik.validateForm();
                if (Object.keys(errors).length > 0) return false;
                return true;
            },
            getValues: () => {
                const selectedOption = filteredDaysOptions.find(
                    (opt) => opt.value === formik.values.selectedOptionValue,
                );
                const currentOperator = selectedOption?.operator || formik.values.operator || 'BEFORE_DAYS';
                const currentDays = selectedOption?.days || formik.values.days?.[0] || 7;
                const finalOperator =
                    renderId !== 8 && currentOperator === 'WITHIN_LAST_DAYS' ? 'BEFORE_DAYS' : currentOperator;
                return {
                    serviceIds: formik.values.serviceIds.map(Number),
                    days: [currentDays, null],
                    operator: finalOperator,
                    status: fixedStatus
                        ? [fixedStatus]
                        : Array.isArray(formik.values.status) && formik.values.status.length > 0
                          ? formik.values.status
                          : ['BOOKED'],
                };
            },
        });
        // Keep validator in registry on unmount so we can validate all at once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conditionInstanceId, formik.values, register]);

    const handleServiceChange = (selectedValues: Set<string>) => {
        const serviceIdsArray = Array.from(selectedValues);
        formik.setFieldValue('serviceIds', serviceIdsArray);
    };

    const handleStatusChange = (selectedValues: Set<string>) => {
        if (fixedStatus) return;
        const statusArray = Array.from(selectedValues);
        formik.setFieldValue('status', statusArray.length > 0 ? statusArray : ['BOOKED']);
    };

    return (
        <div className="flex flex-col gap-4 space-y-4">
            {/* Service Multi-Select */}
            <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Marketing.SelectServices')}</label>
                <RadixMultiSelect
                    options={services}
                    selectedValues={new Set(formik.values.serviceIds)}
                    onSelectionChange={handleServiceChange}
                    placeholder={t('Marketing.SelectServices')}
                    textToDisplayWithCount={t('Marketing.ServicesSelected')}
                    className="w-full min-w-full"
                    disabled={loading}
                />
                {formik.touched.serviceIds && formik.errors.serviceIds && (
                    <div className="text-sm text-red-500 mt-1">
                        {typeof formik.errors.serviceIds === 'string'
                            ? formik.errors.serviceIds
                            : Array.isArray(formik.errors.serviceIds)
                              ? formik.errors.serviceIds.join(', ')
                              : 'Please select at least one service'}
                    </div>
                )}
            </div>

            {/* Days Range Input */}
            <div className="w-full">
                <label className="block text-sm font-medium text-text-primary mb-2">
                    {t('Marketing.SelectTimePeriod')}
                </label>
                <RadixSelect
                    options={filteredDaysOptions.map((opt) => ({ label: opt.label, value: opt.value }))}
                    value={formik.values.selectedOptionValue || 'BEFORE_DAYS_7'}
                    onValueChange={(val) => {
                        // Find the selected option to extract operator and days
                        const selectedOption = filteredDaysOptions.find((opt) => opt.value === val);
                        if (selectedOption) {
                            formik.setFieldValue('selectedOptionValue', val);
                            formik.setFieldValue('days', [selectedOption.days, null]);
                            formik.setFieldValue('operator', selectedOption.operator);
                        }
                    }}
                    placeholder={t('Marketing.SelectTimePeriod')}
                    className="w-full min-w-full"
                />
                {formik.touched.days && formik.errors.days && (
                    <div className="text-sm text-error-500 mt-1">
                        {typeof formik.errors.days === 'string' ? formik.errors.days : t('Marketing.DaysRequired')}
                    </div>
                )}
            </div>

            {/* Status Select - Only show if status is not fixed */}
            {!fixedStatus && (
                <div className="w-full">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        {t('Marketing.BookingStatus')}
                    </label>
                    <RadixMultiSelect
                        options={bookingStatusOptions.map((status) => ({
                            label: status.label,
                            value: status.value,
                        }))}
                        selectedValues={
                            new Set(Array.isArray(formik.values.status) ? formik.values.status : [formik.values.status])
                        }
                        onSelectionChange={handleStatusChange}
                        placeholder={t('Marketing.SelectStatus')}
                        className="w-full min-w-full"
                    />
                    {formik.touched.status && formik.errors.status && (
                        <div className="text-sm text-error-500 mt-1">
                            {typeof formik.errors.status === 'string'
                                ? formik.errors.status
                                : t('Marketing.StatusRequired')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ActiveBookingServiceInput;
