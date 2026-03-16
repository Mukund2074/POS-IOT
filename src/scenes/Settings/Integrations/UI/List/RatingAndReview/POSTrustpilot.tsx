import POSButton from '@/components/POS/Common/POSButton';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSInput from '@/components/POS/Common/POSInput';
import POSSwitch from '@/components/POS/Common/POSSwitch';
import { api } from '@/utils/Api/POS';
import { AppBar, Box, Grid2, Skeleton, Stack, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

interface InitialValueDataType {
    enabled: boolean;
    trustPilotAFSEmail: string;
}

const POSTrustpilot = () => {
    const [activeBar, setActiveBar] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [initialValues, setInitialValues] = useState<InitialValueDataType>({
        enabled: false,
        trustPilotAFSEmail: '',
    });

    const [duplicateData, setDuplicateData] = useState<InitialValueDataType>({
        enabled: false,
        trustPilotAFSEmail: '',
    });

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object({
            enabled: Yup.boolean(),
            trustPilotAFSEmail: Yup.string()
                .nullable()
                .when('enabled', {
                    is: true,
                    then: (schema) =>
                        schema.required(t('Setting.EmailIsRequired')).email(t('Setting.InvalidEmailFormat')),
                    otherwise: (schema) => schema.notRequired(),
                }),
        }),

        onSubmit: (values) => {
            callPostApi(values);
        },
    });

    const fetchData = async () => {
        setLoading(true)
        try {
            const response = await api.getApiTrustpilotConfig();
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
            const response = await api.postApiTrustpilot({
                enabled: values?.enabled,
                trustPilotAFSEmail: values?.trustPilotAFSEmail,
            });
            if (response) {
                setActiveBar(false);
                toast.success(t('Services.ToastUpSuccess'));
                fetchData();
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
        setActiveBar(JSON.stringify(formik.values) !== JSON.stringify(duplicateData));
    }, [formik?.values]);

    return (
        <Box p={4.5}>
            {activeBar && (
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
                    sx={{ p: { xs: 2, md: 5 }, background: '#fff', borderRadius: '25px', mt: activeBar ? 7 : 0 }}
                >
                    <Grid2 size={{ xs: 12, md: 4 }}>
                        <POSHeading text={t('Integration.EnableTrustPilot')} />
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
                                        formik.setFieldValue('trustPilotAFSEmail', duplicateData?.trustPilotAFSEmail);
                                    }
                                }}
                            />

                            <Box marginTop={2} sx={{ display: formik?.values?.enabled ? 'block' : 'none' }}>
                                <Typography fontWeight={700}>{t('Integration.TrustpilotTextFieldHeader')}</Typography>
                                <POSInput
                                    value={formik.values.trustPilotAFSEmail}
                                    onChange={(e) => formik.setFieldValue('trustPilotAFSEmail', e.target.value)}
                                    onBlur={() => formik.setFieldTouched('trustPilotAFSEmail', true)}
                                    sx={{ width: '100%' }}
                                    type="email"
                                    error={
                                        formik.touched.trustPilotAFSEmail && Boolean(formik.errors.trustPilotAFSEmail)
                                    }
                                />

                                {formik.touched.trustPilotAFSEmail && formik.errors.trustPilotAFSEmail && (
                                    <Typography variant="caption" color="error">
                                        {formik.errors.trustPilotAFSEmail}
                                    </Typography>
                                )}
                            </Box>
                        </Grid2>
                    )}
                </Grid2>
            </React.Fragment>
        </Box>
    );
};

export default POSTrustpilot;
