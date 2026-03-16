import POSButton from '@/components/POS/Common/POSButton';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSInput from '@/components/POS/Common/POSInput';
import POSSelect from '@/components/POS/Common/POSSelect';
import POSSwitch from '@/components/POS/Common/POSSwitch';
import { AppBar, Box, Grid2, Skeleton, Stack, Typography } from '@mui/material';
import { SelectChangeEvent } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormik } from 'formik';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { api } from '@/utils/Api/POS';

interface InitialValueDataType {
    enabled: boolean;
    webhookUrl: string;
    event: string;
    secret: string;
    webhookId?: number;
}

const POSWebhook = () => {
    const [isSaveChanges, setSaveChanegs] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [showSecret, setShowSecret] = useState(false);

    const handleToggleSecret = () => {
        setShowSecret((prev) => !prev);
    };

    const [initialValues, setInitialValues] = useState<InitialValueDataType>({
        enabled: false,
        webhookUrl: '',
        event: 'marketplace-booking',
        secret: '',
    });

    const [duplicateData, setDuplicateData] = useState<InitialValueDataType>({
        enabled: false,
        webhookUrl: '',
        event: 'marketplace-booking',
        secret: '',
    });

    const eventOptions = [{ label: t('Integration.WebhookEventMarketplaceBooking'), value: 'marketplace-booking' }];

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object({
            enabled: Yup.boolean(),
            webhookUrl: Yup.string()
                .nullable()
                .when('enabled', {
                    is: true,
                    then: (schema) =>
                        schema.required(t('Integration.WebhookUrlRequired')).url(t('Integration.WebhookUrlInvalid')),
                    otherwise: (schema) => schema.notRequired(),
                }),
            event: Yup.string()
                .nullable()
                .when('enabled', {
                    is: true,
                    then: (schema) => schema.required(t('Integration.WebhookEventRequired')),
                    otherwise: (schema) => schema.notRequired(),
                }),
        }),

        onSubmit: (values) => {
            callPostApi(values);
        },
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch all webhooks and filter for marketplace-booking event
            const response = await api.getApiWebhooks();
            const responseData = response as any;
            // Handle both direct response and wrapped response
            const webhooks = responseData?.webhooks || responseData?.data?.webhooks || [];

            // Find webhook for marketplace-booking event
            const webhook = webhooks.find((wh: any) => wh.event === 'marketplace-booking');

            if (webhook) {
                const values = {
                    enabled: webhook.active || false,
                    webhookUrl: webhook.webhookUrl || '',
                    event: webhook.event || 'marketplace-booking',
                    secret: webhook.secret || '',
                    webhookId: webhook.id,
                };
                setInitialValues(values);
                setDuplicateData(values);
            } else {
                // No webhook found, set defaults
                setInitialValues({
                    enabled: false,
                    webhookUrl: '',
                    event: 'marketplace-booking',
                    secret: '',
                });
                setDuplicateData({
                    enabled: false,
                    webhookUrl: '',
                    event: 'marketplace-booking',
                    secret: '',
                });
            }
        } catch (error) {
            console.error('Error : ', error);
            // Set defaults on error
            setInitialValues({
                enabled: false,
                webhookUrl: '',
                event: 'marketplace-booking',
                secret: '',
            });
            setDuplicateData({
                enabled: false,
                webhookUrl: '',
                event: 'marketplace-booking',
                secret: '',
            });
        } finally {
            setLoading(false);
        }
    };

    const callPostApi = async (values: InitialValueDataType) => {
        setLoading(true);
        try {
            const payload = {
                event: values.event,
                webhookUrl: values.webhookUrl,
                secret: values.secret || undefined,
                active: values.enabled,
            };

            let response: any;
            if (values.webhookId) {
                // Update existing webhook
                response = await api.putApiWebhooksId(values.webhookId, payload);
            } else {
                // Create new webhook
                response = await api.postApiWebhooks(payload);
            }

            // Handle response - could be direct or wrapped
            const responseData = response as any;
            if (responseData?.id || responseData?.data?.id) {
                const webhookId = responseData.id || responseData.data.id;
                values.webhookId = webhookId;
                setSaveChanegs(false);
                setDuplicateData(values);
                setInitialValues(values);
                toast.success(t('Services.ToastUpSuccess'));
            } else if (response) {
                // Response exists but no id (update case)
                setSaveChanegs(false);
                setDuplicateData(values);
                setInitialValues(values);
                toast.success(t('Services.ToastUpSuccess'));
            }
        } catch (error) {
            console.error('Error : ', error);
            toast.error(t('Services.ToastUpErr'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const a = JSON.stringify(formik.values || {});
        const b = JSON.stringify(duplicateData || {});
        setSaveChanegs(a !== b);
    }, [formik.values, duplicateData]);

    return (
        <Box p={4.5}>
            {isSaveChanges && (
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
                        mb: 5,
                    }}
                >
                    <POSButton
                        variant="save"
                        width="auto"
                        height={35}
                        title={t('Setting.SaveChanges')}
                        onClick={formik.handleSubmit}
                        loading={isLoading}
                    />
                </AppBar>
            )}

            <React.Fragment>
                <Grid2
                    container
                    sx={{ p: { xs: 2, md: 5 }, background: '#fff', borderRadius: '25px', mt: isSaveChanges ? 7 : 0 }}
                >
                    <Grid2 size={{ xs: 12, md: 4 }}>
                        <POSHeading text={t('Integration.Webhook')} />
                        <POSHeading
                            sx={{ fontWeight: 400 }}
                            fontSize={16}
                            fontColor="#666"
                            text={t('Integration.WebhookDescription')}
                        />
                    </Grid2>
                    {isLoading ? (
                        <Stack sx={{ width: '65%' }}>
                            <Skeleton variant="rounded" sx={{ width: '100%' }} height={50} />
                        </Stack>
                    ) : (
                        <Grid2 size={{ xs: 12, md: 8 }}>
                            <Stack spacing={3}>
                                <Box>
                                    <Typography fontWeight={700} sx={{ mb: 1 }}>
                                        {t('Integration.EnableWebhook')}
                                    </Typography>
                                    <POSSwitch
                                        checked={formik.values.enabled}
                                        onChange={(e) => {
                                            const isChecked = e.target.checked;
                                            formik.setFieldValue('enabled', isChecked);

                                            if (!isChecked) {
                                                formik.setFieldValue('webhookUrl', duplicateData?.webhookUrl);
                                                formik.setFieldValue('event', duplicateData?.event);
                                                formik.setFieldValue('secret', duplicateData?.secret);
                                            }
                                        }}
                                    />
                                </Box>

                                <Box sx={{ display: formik?.values?.enabled ? 'block' : 'none' }}>
                                    <Typography fontWeight={700} sx={{ mb: 1 }}>
                                        {t('Integration.WebhookUrl')}
                                    </Typography>
                                    <POSInput
                                        type="url"
                                        value={formik.values.webhookUrl}
                                        onChange={(e) => formik.setFieldValue('webhookUrl', e.target.value)}
                                        onBlur={() => formik.setFieldTouched('webhookUrl', true)}
                                        sx={{ width: '100%' }}
                                        error={formik.touched.webhookUrl && Boolean(formik.errors.webhookUrl)}
                                        placeholder={t('Integration.WebhookUrlPlaceholder')}
                                    />

                                    {formik.touched.webhookUrl && formik.errors.webhookUrl && (
                                        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                                            {formik.errors.webhookUrl}
                                        </Typography>
                                    )}
                                </Box>

                                <Box sx={{ display: formik?.values?.enabled ? 'block' : 'none' }}>
                                    <Typography fontWeight={700} sx={{ mb: 1 }}>
                                        {t('Integration.WebhookEvent')}
                                    </Typography>
                                    <POSSelect
                                        value={formik.values.event || ''}
                                        onChange={(
                                            e: SelectChangeEvent<string | number | (string | number)[] | null>,
                                        ) => {
                                            formik.setFieldValue('event', (e.target.value as string) || '');
                                        }}
                                        onBlur={() => formik.setFieldTouched('event', true)}
                                        options={eventOptions}
                                        placeholderText={t('Integration.WebhookEventPlaceholder')}
                                        error={formik.touched.event && Boolean(formik.errors.event)}
                                        helperText={
                                            formik.touched.event && formik.errors.event ? formik.errors.event : ''
                                        }
                                        sx={{ width: '100%' }}
                                    />
                                </Box>

                                <Box sx={{ display: formik?.values?.enabled ? 'block' : 'none' }}>
                                    <Typography fontWeight={700} sx={{ mb: 1 }}>
                                        {t('Integration.WebhookSecret')}
                                    </Typography>
                                    <POSInput
                                        type={showSecret ? 'text' : 'password'}
                                        value={formik.values.secret}
                                        onChange={(e) => formik.setFieldValue('secret', e.target.value)}
                                        onBlur={() => formik.setFieldTouched('secret', true)}
                                        sx={{ width: '100%' }}
                                        error={formik.touched.secret && Boolean(formik.errors.secret)}
                                        placeholder={t('Integration.WebhookSecretPlaceholder')}
                                        autoComplete={'new-password'}
                                        slotProps={{
                                            input: {
                                                endAdornment: (
                                                    <Box style={{ cursor: 'pointer' }} onClick={handleToggleSecret}>
                                                        {showSecret ? <Visibility /> : <VisibilityOff />}
                                                    </Box>
                                                ),
                                            },
                                        }}
                                    />

                                    {formik.touched.secret && formik.errors.secret && (
                                        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                                            {formik.errors.secret}
                                        </Typography>
                                    )}
                                </Box>
                            </Stack>
                        </Grid2>
                    )}
                </Grid2>
            </React.Fragment>
        </Box>
    );
};

export default POSWebhook;
