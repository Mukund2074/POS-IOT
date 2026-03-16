import POSButton from '@/components/POS/Common/POSButton';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSSelect from '@/components/POS/Common/POSSelect';
import POSSwitch from '@/components/POS/Common/POSSwitch';
import POSTextArea from '@/components/POS/Common/POSTextArea';
import { POSContextType, usePOS } from '@/context/POS/POSContext';
import CommonLayout from '@/scenes/GIftCard/UI/shared/CommonLayout';
import { api } from '@/utils/Api/POS';
import { AppBar, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function PunchCardSettings() {
    interface PunchCardSettingsFormValues {
        taxIds: string[];
        sendDesignBySale: boolean;
        cardColor: string;
        personalMessage: string;
        onlineSaleDescription: string;
        showServiceOnDesign: boolean;
    }

    const [initialValues, setInitialValues] = useState<PunchCardSettingsFormValues>({
        taxIds: [],
        sendDesignBySale: false,
        cardColor: '#FFC28A',
        personalMessage: '',
        onlineSaleDescription: '',
        showServiceOnDesign: false,
    });

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validateOnMount: true,
        onSubmit: async (values) => {
            await handleSubmit({ payload: values });
        },
    });

    const { tax, punchCardSettings } = usePOS() as {
        tax: POSContextType['tax'];
        punchCardSettings: POSContextType['punchCardSettings'];
    };

    const getSettings = async () => {
        try {
            const response = await api.getApiBundleOffersSettings();
            if (response) {
                const values = {
                    taxIds: response.taxIds || [],
                    sendDesignBySale: response.sendDesignBySale || false,
                    cardColor: response?.cardColor || '#FFC28A',
                    personalMessage: response.personalMessage || '',
                    onlineSaleDescription: response.onlineSaleDescription || '',
                    showServiceOnDesign: response.showServiceOnDesign || false,
                };
                setInitialValues(values);
            }
        } catch (error) {
            toast.error(t('PunchCard.PunchCardSettingGetError'));
        }
    };

    useEffect(() => {
        getSettings();
    }, []);

    const handleSubmit = async ({ payload }: { payload: PunchCardSettingsFormValues }) => {
        try {
            const response = await api.putApiBundleOffersSettings(payload);
            if (response) {
                toast.success(t('PunchCard.PunchCardSettingUpdated'));
                formik.resetForm({ values: payload });
                // Refetch punch card settings to update POSContext
                punchCardSettings.refetch();
            }
        } catch (error) {
            toast.error(t('PunchCard.PunchCardSettingError'));
        }
    };

    if (tax.isLoading)
        return (
            <Stack sx={{ justifyContent: 'center', alignItems: 'center', height: '90dvh' }}>
                <CircularProgress color="inherit" />
            </Stack>
        );

    return (
        <React.Fragment>
            {formik.dirty && (
                <AppBar
                    sx={{
                        position: 'fixed',
                        top: 45,
                        left: 0,
                        right: 0,
                        py: 1,
                        px: 4,
                        bgcolor: '#fff',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'flex-end',
                        width: '100%',
                        zIndex: 8,
                    }}
                >
                    <POSButton
                        onClick={formik.handleSubmit}
                        variant="save"
                        width="auto"
                        height={35}
                        title={
                            <React.Fragment>
                                {formik?.isSubmitting ? (
                                    <Stack sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: 1 }}>
                                        <CircularProgress size={20} sx={{ color: '#fff' }} /> {t('POS.Processing')}
                                    </Stack>
                                ) : (
                                    t('Setting.SaveChanges')
                                )}
                            </React.Fragment>
                        }
                        disabled={formik.isSubmitting}
                    />
                </AppBar>
            )}
            <POSHeading sx={{ mt: formik?.dirty ? 4 : 0 }} text={t('PunchCard.PunchCardSettings')} />
            <Paper sx={{ borderRadius: 4, px: 1 }}>
                {tax.data &&
                    tax.data.length > 0 &&
                    tax.data?.map((tax) => (
                        <CommonLayout
                            key={`taxids_${tax.id}`}
                            text={`Include ${tax.taxName} (${tax.taxRate}%)`}
                            HeadingText={tax.taxName}
                            descriptionText={
                                t('PunchCard.PunchCardSetting1Desc') +
                                ' ' +
                                tax?.taxName?.toUpperCase() +
                                ' ' +
                                t('PunchCard.PunchCardSetting2Desc')
                            }
                            children={
                                <POSSwitch
                                    id={`taxids_${tax.id}.isActive`}
                                    checked={formik?.values?.taxIds?.includes(tax?.id ?? '')}
                                    onChange={(event, checked) => {
                                        if (checked) {
                                            formik.setFieldValue('taxIds', [...formik.values.taxIds, tax.id]);
                                        } else {
                                            formik.setFieldValue(
                                                'taxIds',
                                                formik.values.taxIds.filter((id) => id !== tax.id),
                                            );
                                        }
                                    }}
                                    sx={{ pl: 0.55 }}
                                />
                            }
                        />
                    ))}
                <CommonLayout
                    HeadingText={t('PunchCard.sendDesignBySale')}
                    descriptionText={t('PunchCard.sendDesignBySaleDesc')}
                    children={
                        <POSSwitch
                            checked={formik.values.sendDesignBySale}
                            onChange={(event, checked) => {
                                formik.setFieldValue('sendDesignBySale', checked);
                            }}
                            sx={{ pl: 0.55 }}
                        />
                    }
                />
                <CommonLayout
                    HeadingText={t('PunchCard.PunchCardColor')}
                    descriptionText={t('PunchCard.PunchCardSettingColorOfCardDesc')}
                    children={
                        <POSSelect
                            id="cardColor"
                            value={formik.values.cardColor}
                            placeholderText={t('GiftCard.SelectOption')}
                            options={colorWithLabel}
                            onChange={(event) => {
                                formik.setFieldValue('cardColor', event.target.value);
                            }}
                        />
                    }
                />
                <CommonLayout
                    HeadingText={t('GiftCard.GiftCardSettingOnline')}
                    descriptionText={t('PunchCard.PunchCardSettingOnlineDesc')}
                    text={t('GiftCard.OnlineDescription')}
                    children={
                        <POSTextArea
                            id="onlineSaleDescription"
                            placeholder={t('GiftCard.textDescription')}
                            height={100}
                            value={formik.values.onlineSaleDescription}
                            onChange={(event) => {
                                formik.setFieldValue('onlineSaleDescription', event.target.value);
                            }}
                            width={'100%'}
                            mt={0.5}
                        />
                    }
                />
                <CommonLayout
                    HeadingText={t('PunchCard.showServiceOnDesign')}
                    descriptionText={t('PunchCard.showServiceOnDesignDesc')}
                    children={
                        <POSSwitch
                            checked={formik.values.showServiceOnDesign}
                            onChange={(event, checked) => {
                                formik.setFieldValue('showServiceOnDesign', checked);
                            }}
                            sx={{ pl: 0.55 }}
                        />
                    }
                />
            </Paper>
        </React.Fragment>
    );
}

const RenderColorMenuItem = (props: { label: string; value: string }) => {
    return (
        <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
            <Stack bgcolor={props.value} height={18} width={18} my={'auto'} borderRadius={1} />
            <Typography>{props.label}</Typography>
        </Stack>
    );
};

const colorWithLabel = [
    {
        label: RenderColorMenuItem({ label: 'Red', value: '#FF0000' }),
        value: '#FF0000',
    },
    {
        label: RenderColorMenuItem({ label: 'Orange', value: '#FF7F00' }),
        value: '#FF7F00',
    },
    {
        label: RenderColorMenuItem({ label: 'Yellow', value: '#FFFF00' }),
        value: '#FFFF00',
    },
    {
        label: RenderColorMenuItem({ label: 'Green', value: '#00FF00' }),
        value: '#00FF00',
    },
    {
        label: RenderColorMenuItem({ label: 'Cyan', value: '#00FFFF' }),
        value: '#00FFFF',
    },
    {
        label: RenderColorMenuItem({ label: 'Blue', value: '#0000FF' }),
        value: '#0000FF',
    },
    {
        label: RenderColorMenuItem({
            label: 'Default',
            value: '#FFC28A',
        }),
        value: '#FFC28A',
    },
];
