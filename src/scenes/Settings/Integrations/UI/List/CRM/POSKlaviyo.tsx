import POSButton from '@/components/POS/Common/POSButton';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSInput from '@/components/POS/Common/POSInput';
import POSSwitch from '@/components/POS/Common/POSSwitch';
import { api } from '@/utils/Api/POS';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { AppBar, Box, Grid2, Skeleton, Stack, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

interface InitialValueDataType {
    enabled: boolean;
    klaviyoApiKey: string;
    enableCustomerSync: boolean;
}

const POSKlaviyo = () => {
    const [isSaveChanges, setSaveChanegs] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleTogglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    const [initialValues, setInitialValues] = useState<InitialValueDataType>({
        enabled: false,
        enableCustomerSync: false,
        klaviyoApiKey: '',
    });

    const [duplicateData, setDuplicateData] = useState<InitialValueDataType>({
        enabled: false,
        enableCustomerSync: false,
        klaviyoApiKey: '',
    });

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object({
            enabled: Yup.boolean(),
            klaviyoApiKey: Yup.string()
                .nullable()
                .when('enabled', {
                    is: true,
                    then: (schema) => schema.required(t('Integration.APIKeyRequired')),
                    otherwise: (schema) => schema.notRequired(),
                }),
            enableCustomerSync: Yup.boolean(),
        }),

        onSubmit: (values) => {
            callPostApi(values);
        },
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.getApiKlaviyoConfig();
            if (response) {
                setInitialValues(response?.data as InitialValueDataType);
                setDuplicateData(response?.data as InitialValueDataType);
            }
        } catch (error) {
            console.error('Error : ', error);
        } finally {
            setLoading(false);
        }
    };

    const callPostApi = async (values: InitialValueDataType) => {
        setLoading(true);
        try {
            const response = await api.postApiKlaviyo(values);
            if (response) {
                setSaveChanegs(false);
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
                        <POSHeading text={t('Integration.EnableKlaviyo')} />
                        {/* <POSHeading sx={{ fontWeight: 400 }} fontSize={16} fontColor="#666" text={'description'} /> */}
                    </Grid2>
                    {isLoading ? (
                        <Stack sx={{ width: '65%' }}>
                            <Skeleton variant="rounded" sx={{ width: '100%' }} height={50} />
                        </Stack>
                    ) : (
                        <Grid2 size={{ xs: 12, md: 8 }}>
                            <POSSwitch
                                checked={formik.values.enabled}
                                onChange={(e) => {
                                    const isChecked = e.target.checked;
                                    formik.setFieldValue('enabled', isChecked);

                                    if (!isChecked) {
                                        formik.setFieldValue('klaviyoApiKey', duplicateData?.klaviyoApiKey);
                                    }
                                }}
                            />

                            <Box marginTop={2} sx={{ display: formik?.values?.enabled ? 'block' : 'none' }}>
                                <Typography fontWeight={700}>{t('Integration.KlaviyoApiKey')}</Typography>
                                <POSInput
                                    type={showPassword ? 'text' : 'password'}
                                    value={formik.values.klaviyoApiKey}
                                    onChange={(e) => formik.setFieldValue('klaviyoApiKey', e.target.value)}
                                    onBlur={() => formik.setFieldTouched('klaviyoApiKey', true)}
                                    sx={{ width: '100%' }}
                                    error={formik.touched.klaviyoApiKey && Boolean(formik.errors.klaviyoApiKey)}
                                    autoComplete={'new-password'}
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <Box style={{ cursor: 'pointer' }} onClick={handleTogglePassword}>
                                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                                </Box>
                                            ),
                                        },
                                    }}
                                />

                                {formik.touched.klaviyoApiKey && formik.errors.klaviyoApiKey && (
                                    <Typography variant="caption" color="error">
                                        {formik.errors.klaviyoApiKey}
                                    </Typography>
                                )}
                                <Stack
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column-reverse',
                                        alignItems: 'center',
                                        mt: 3,
                                    }}
                                >
                                    <POSSwitch
                                        checked={formik.values.enableCustomerSync}
                                        onChange={(e) => {
                                            formik.setFieldValue('enableCustomerSync', e.target.checked);
                                        }}
                                        sx={{ mr: 'auto' }}
                                    />
                                    <Typography sx={{ mr: 'auto', fontWeight: 700 }}>
                                        {t('Integration.SyncCustomer')}
                                    </Typography>
                                </Stack>
                            </Box>
                        </Grid2>
                    )}
                </Grid2>
            </React.Fragment>
        </Box>
    );
};

export default POSKlaviyo;
