import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { RadixSelect } from '@/components/radix';
import { t } from 'i18next';
import { useGetCampaigns } from '@/hooks/api/marketing/useGetCampaigns';
import { GetApiCampaignsCampaignStatusItem } from '@/shared/api/models/getApiCampaignsCampaignStatusItem';
import { usePlaygroundFormRegistry } from '../../hooks/usePlaygroundFormRegistry';

interface CommunicationCompositeValues {
    campaignId?: string;
    interactionStatus?: string[];
    interactionField?: string;
    days?: [number | null, number | null];
}

interface CommunicationInputProps {
    value?: string | string[] | null;
    compositeValues?: CommunicationCompositeValues;
    conditionInstanceId: string;
}

// Interaction status options
const interactionStatusOptions = [
    { label: t('Marketing.EmailCampaignsSent'), value: 'SENT', field: 'sent_at' },
    { label: t('Marketing.Opened'), value: 'OPENED', field: 'email_opened_at' },
    { label: t('Marketing.NotOpened'), value: 'NOT_OPENED', field: 'sent_at' },
    { label: t('Marketing.Clicked'), value: 'CLICKED', field: 'email_clicked_at' },
];

const CommunicationInput = ({ value, compositeValues, conditionInstanceId }: CommunicationInputProps) => {
    const { register } = usePlaygroundFormRegistry();
    // Fetch campaigns with limit 10000, excluding DRAFT and SCHEDULED statuses via API filter
    const { campaigns, isLoading: campaignsLoading } = useGetCampaigns({
        params: {
            page: 1,
            limit: 10000,
            campaign_status: [
                GetApiCampaignsCampaignStatusItem.TRIGGERED,
                GetApiCampaignsCampaignStatusItem.COMPLETED,
                GetApiCampaignsCampaignStatusItem.FAILED,
                GetApiCampaignsCampaignStatusItem.PAUSED,
                GetApiCampaignsCampaignStatusItem.CANCELLED,
            ],
        },
    });

    // Transform campaigns to options (already filtered by API)
    const campaignOptions =
        campaigns?.map((campaign) => ({
            label: campaign.name,
            value: campaign.id,
        })) || [];

    // Extract values from compositeValues - only handle array format
    const campaignId = compositeValues?.campaignId || (typeof value === 'string' ? value : null);
    const interactionStatusArray = compositeValues?.interactionStatus || (Array.isArray(value) ? value : []);
    // For single select, use first item from array
    const interactionStatus = interactionStatusArray.length > 0 ? interactionStatusArray[0] : '';
    const days = compositeValues?.days || [7, null];

    const formik = useFormik({
        initialValues: {
            campaignId: campaignId,
            interactionStatus: interactionStatus || '',
            days: days,
        },
        validationSchema: Yup.object().shape({
            campaignId: Yup.string()
                .required(t('Marketing.CampaignRequired'))
                .typeError(t('Marketing.CampaignRequired')),
            interactionStatus: Yup.string()
                .oneOf(['SENT', 'OPENED', 'NOT_OPENED', 'CLICKED'], t('Marketing.InteractionStatusRequired'))
                .required(t('Marketing.InteractionStatusRequired')),
            days: Yup.array()
                .of(Yup.number().nullable())
                .test(
                    'required',
                    t('Marketing.DaysRequired'),
                    (value) => Array.isArray(value) && value.length >= 1 && value[0] !== null && value[0] !== undefined,
                ),
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
                if (campaignOptions.length === 0 && !campaignsLoading) return false;
                const errors = await formik.validateForm();
                if (Object.keys(errors).length > 0) {
                    formik.setTouched({
                        campaignId: true,
                        interactionStatus: true,
                        days: true,
                    });
                    return false;
                }
                return true;
            },
            getValues: () => {
                if (campaignOptions.length === 0 && !campaignsLoading) {
                    return {
                        campaignId: null,
                        interactionStatus: [],
                        interactionField: null,
                        days: [7, null],
                    };
                }
                const selectedOption = interactionStatusOptions.find(
                    (option) => option.value === formik.values.interactionStatus,
                );
                const interactionField = selectedOption?.field || null;
                return {
                    campaignId: formik.values.campaignId,
                    interactionStatus: formik.values.interactionStatus ? [formik.values.interactionStatus] : [],
                    interactionField: interactionField,
                    days: formik.values.days,
                };
            },
        });
        // Keep validator in registry on unmount so we can validate all at once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conditionInstanceId, formik.values, campaignOptions.length, campaignsLoading, register]);

    const handleCampaignChange = (val: string) => {
        formik.setFieldValue('campaignId', val);
    };

    const handleInteractionStatusChange = (val: string) => {
        formik.setFieldValue('interactionStatus', val);
    };

    // Show message if no campaigns available
    if (!campaignsLoading && campaignOptions.length === 0) {
        return (
            <div className="flex flex-col gap-4 space-y-4">
                <div className="w-full p-4 bg-warning-50 border border-warning-200 rounded-md">
                    <p className="text-sm text-warning-700">{t('Marketing.NoActivatedTriggersOnOutlet')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 space-y-4">
            {/* Campaign Select */}
            <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Marketing.Trigger')}</label>
                <RadixSelect
                    options={campaignOptions}
                    value={formik.values.campaignId || undefined}
                    onValueChange={handleCampaignChange}
                    placeholder={t('Marketing.SelectTrigger')}
                    className="w-full"
                    disabled={campaignsLoading}
                />
                {formik.touched.campaignId && formik.errors.campaignId && (
                    <div className="text-sm text-red-500 mt-1">
                        {typeof formik.errors.campaignId === 'string'
                            ? formik.errors.campaignId
                            : t('Marketing.CampaignRequired')}
                    </div>
                )}
            </div>

            {/* Interaction Status Select */}
            <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('Marketing.InteractionStatus')}
                </label>
                <RadixSelect
                    options={interactionStatusOptions.map((option) => ({
                        label: option.label,
                        value: option.value,
                    }))}
                    value={formik.values.interactionStatus || undefined}
                    onValueChange={handleInteractionStatusChange}
                    placeholder={t('Common.Select')}
                    className="w-full"
                />
                {formik.touched.interactionStatus && formik.errors.interactionStatus && (
                    <div className="text-sm text-red-500 mt-1">
                        {typeof formik.errors.interactionStatus === 'string'
                            ? formik.errors.interactionStatus
                            : t('Marketing.InteractionStatusRequired')}
                    </div>
                )}
            </div>

            {/* Time Period Select */}
            <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('Marketing.SelectTimePeriod')}
                </label>
                <RadixSelect
                    options={[
                        { label: `${t('Common.Last')} 3 ${t('Setting.Days')}`, value: '3' },
                        { label: `${t('Common.Last')} 7 ${t('Setting.Days')}`, value: '7' },
                        { label: `${t('Common.Last')} 15 ${t('Setting.Days')}`, value: '15' },
                        { label: `${t('Common.Last')} 30 ${t('Setting.Days')}`, value: '30' },
                        { label: `${t('Common.Last')} 2 ${t('Marketing.Months')}`, value: '60' },
                        { label: `${t('Common.Last')} 3 ${t('Marketing.Months')}`, value: '90' },
                        { label: `${t('Common.Last')} 6 ${t('Marketing.Months')}`, value: '180' },
                    ]}
                    value={String(formik.values.days?.[0] ?? 7)}
                    onValueChange={(val) => {
                        const numVal = val ? Number(val) : 7;
                        formik.setFieldValue('days', [numVal, null]);
                    }}
                    placeholder={t('Marketing.SelectTimePeriod')}
                    className="w-full"
                />
                {formik.touched.days && formik.errors.days && (
                    <div className="text-sm text-red-500 mt-1">
                        {typeof formik.errors.days === 'string' ? formik.errors.days : t('Marketing.DaysRequired')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunicationInput;
