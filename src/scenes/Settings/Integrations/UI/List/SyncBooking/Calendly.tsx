import POSButton from '@/components/POS/Common/POSButton';
import POSDeleteModal from '@/components/POS/Common/POSDeleteModal';
import POSHeading from '@/components/POS/Common/POSHeading';
import { api } from '@/utils/Api/POS';
import { Circle, Replay } from '@mui/icons-material';
import { Alert, CircularProgress, Grid2, IconButton, Stack } from '@mui/material';
import { useFormik } from 'formik';
import { t } from 'i18next';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';

const Calendly = () => {
    const [initialValues, setInitialValues] = useState<{ calendlySyncConnectionStatus: boolean | null }>({
        calendlySyncConnectionStatus: null,
    });
    const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [disconnectLoading, setDisconnectLoading] = useState(false);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues,
        onSubmit: () => {},
    });

    const handleCalendlySync = async () => {
        try {
            const response = await api.getApiCalendlyAuthUrl();
            window.open(response?.data?.authUrl, '_blank');
        } catch (error) {
            toast.error(t('Setting.CalendlyConnectionFailed'));
        }
    };

    const calendlySyncConnectionStatus = useCallback(async () => {
        setIsCheckingStatus(true);
        try {
            const response = await api.getApiCalendlyStatus();
            const isConnected = response?.data?.isConnected as boolean;
            setInitialValues((prev) => ({
                ...prev,
                calendlySyncConnectionStatus: isConnected,
            }));
            formik.setFieldValue('calendlySyncConnectionStatus', isConnected);
        } catch (error) {
            setInitialValues((prev) => ({ ...prev, calendlySyncConnectionStatus: false }));
            formik.setFieldValue('calendlySyncConnectionStatus', false);
            toast.error(t('Setting.CalendlyConnectionFailed'));
        } finally {
            setIsCheckingStatus(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCalendlyDisconnect = async () => {
        setDisconnectLoading(true);
        try {
            await api.postApiCalendlyDisconnect();
            toast.success(t('Setting.CalendlyDisconnectSuccess'));
            calendlySyncConnectionStatus();
        } catch (error) {
            toast.error(t('Setting.CalendlyDisconnectError'));
        } finally {
            setDisconnectLoading(false);
            setDisconnectModalOpen(false);
        }
    };

    const handleCalendlyCallback = useCallback(
        async ({ code: calendlyCode }: { code: string }) => {
            try {
                await api.getApiCalendlyCallback({ code: calendlyCode });
                toast.success(t('Setting.CalendlySyncSuccess'));
            } catch (error) {
                toast.error(t('Setting.CalendlyConnectionFailed'));
            } finally {
                window.history.replaceState(null, '', window.location.pathname);
                calendlySyncConnectionStatus();
            }
        },
        [calendlySyncConnectionStatus],
    );

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');

        if (code) {
            handleCalendlyCallback({ code });
        } else if (!code) {
            calendlySyncConnectionStatus();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Stack sx={{ p: { xs: 2, md: 4 }, width: '100%' }}>
            <Alert severity="warning" sx={{ m: 2 }}>
                {t('Setting.CalendlyNote')}
            </Alert>
            <Grid2 container spacing={3} sx={{ p: 2 }}>
                <Grid2 size={{ xs: 12, md: 4 }}>
                    <POSHeading variant="h6" fontSize={22} text={t('Setting.CalendlySync')} />
                    <POSHeading
                        sx={{
                            whiteSpace: 'pre-line',
                            fontWeight: 400,
                            fontSize: 14,
                            color: '#666',
                            maxWidth: '80%',
                            mt: 1,
                        }}
                        text={t('Setting.CalendlySyncDesc')}
                    />
                </Grid2>

                <Grid2 size={{ xs: 12, md: 8 }}>
                    <POSHeading text={t('Setting.CalendlyConnectionStatus')} fontSize={16} />
                    <Stack
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            alignItems: { xs: 'flex-start', md: 'center' },
                            gap: 2,
                            px: 2,
                            py: { xs: 1, md: 1.5 },
                            mt: 1,
                            borderRadius: 3,
                            bgcolor:
                                formik.values.calendlySyncConnectionStatus === null
                                    ? '#F5F5F5'
                                    : formik.values.calendlySyncConnectionStatus === true
                                      ? '#E6F4EA'
                                      : '#F5F5F5',
                        }}
                    >
                        <Stack
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 2,
                                width: '100%',
                            }}
                        >
                            {isCheckingStatus ? (
                                <CircularProgress size={15} sx={{ color: '#666', m: 1 }} />
                            ) : (
                                <Circle
                                    sx={{
                                        fontSize: 12,
                                        color:
                                            formik.values.calendlySyncConnectionStatus === true
                                                ? 'green'
                                                : formik.values.calendlySyncConnectionStatus === false
                                                  ? 'red'
                                                  : '#999',
                                    }}
                                />
                            )}
                            <span>
                                {isCheckingStatus || formik.values.calendlySyncConnectionStatus === null
                                    ? t('Setting.Checking')
                                    : formik.values.calendlySyncConnectionStatus === true
                                      ? t('Setting.Connected')
                                      : t('Setting.Disconnected')}
                            </span>
                            {!isCheckingStatus && (
                                <IconButton
                                    sx={{ ml: 'auto' }}
                                    disableFocusRipple
                                    disableRipple
                                    disableTouchRipple
                                    onClick={() => {
                                        calendlySyncConnectionStatus();
                                    }}
                                >
                                    <Replay sx={{ fontSize: 24 }} />
                                </IconButton>
                            )}
                        </Stack>
                        {!isCheckingStatus &&
                            formik.values.calendlySyncConnectionStatus !== null &&
                            (formik.values.calendlySyncConnectionStatus === true ? (
                                <POSButton
                                    variant="save"
                                    title={t('Setting.Disconnect')}
                                    sx={{
                                        backgroundColor: '#C74141',
                                        minWidth: { xs: '100%', md: 'fit-content' },
                                    }}
                                    onClick={() => setDisconnectModalOpen(true)}
                                />
                            ) : (
                                <POSButton variant="save" title={t('Setting.Connect')} onClick={handleCalendlySync} />
                            ))}
                    </Stack>
                </Grid2>
            </Grid2>

            {disconnectModalOpen && (
                <POSDeleteModal
                    open={disconnectModalOpen}
                    handleClose={() => setDisconnectModalOpen(false)}
                    title={t('Integration.Deactivate') + ' Calendly'}
                    description={`${t('Integration.DeactivationMessage') + ' Calendly'}?`}
                    onClickDismiss={() => setDisconnectModalOpen(false)}
                    onClickConfirm={handleCalendlyDisconnect}
                    disabled={disconnectLoading}
                />
            )}
        </Stack>
    );
};

export default Calendly;
