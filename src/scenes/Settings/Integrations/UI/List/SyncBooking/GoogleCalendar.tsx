import POSButton from '@/components/POS/Common/POSButton';
import POSDeleteModal from '@/components/POS/Common/POSDeleteModal';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSSwitch from '@/components/POS/Common/POSSwitch';
import { api } from '@/utils/Api/POS';
import { Circle, Close, Replay } from '@mui/icons-material';
import {
    Box,
    CircularProgress,
    Divider,
    Grid2,
    IconButton,
    Modal,
    Paper,
    Skeleton,
    Stack,
    Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { t } from 'i18next';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
// @ts-ignore
import { dividerSx } from '@/scenes/Settings/Index';

const GoogleCalendar = () => {
    const [initialValues, setInitialValues] = useState({
        googleCalendarSyncConnectionStatus: false,
        syncOpeningHours: false,
    });
    const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [loading, setLoading] = useState(false);
    const hasProcessedCallback = useRef(false);

    const [openingHoursDisableModalOpen, setOpeningHoursDisableModalOpen] = useState(false);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues,
        onSubmit: () => {},
    });

    const handleGoogleCalendarSync = async () => {
        try {
            const response = await api.getApiGoogleCalendarAuthUrl();
            window.open(response?.data?.authUrl, '_blank');
        } catch (error) {
            toast.error(t('Setting.GoogleCalendarCoonnectionFailed'));
        }
    };

    const googleCalendarSyncConnectionStatus = useCallback(async () => {
        setLoading(true);
        setIsCheckingStatus(true);
        try {
            const response = await api.getApiGoogleCalendarStatus();
            const isConnected = response?.data?.isConnected as boolean;
            setInitialValues((prev) => ({
                ...prev,
                googleCalendarSyncConnectionStatus: isConnected,
                syncOpeningHours: response?.data?.sync_opening_hours ?? false,
            }));
            formik.setFieldValue('googleCalendarSyncConnectionStatus', isConnected);
            formik.setFieldValue('syncOpeningHours', response?.data?.sync_opening_hours ?? false);
        } catch (error) {
            setInitialValues((prev) => ({
                ...prev,
                googleCalendarSyncConnectionStatus: false,
                syncOpeningHours: false,
            }));
            formik.setFieldValue('googleCalendarSyncConnectionStatus', false);
            formik.setFieldValue('syncOpeningHours', false);
            toast.error(t('Setting.GoogleCalendarCoonnectionFailed'));
        } finally {
            setIsCheckingStatus(false);
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleGoogleCalendarDisconnect = async () => {
        try {
            await api.postApiGoogleCalendarDisconnect();
            toast.success(t('Setting.GoogleCalendarDisconnectSuccess'));
            googleCalendarSyncConnectionStatus();
        } catch (error) {
            toast.error(t('Setting.GoogleCalendarDisconnectError'));
        } finally {
            setDisconnectModalOpen(false);
        }
    };

    // Enable opening hours sync using real API.
    const changeOpeningHoursSync = useCallback(
        async ({
            syncOpeningHours,
            deleteSyncedOpeningHours,
        }: {
            syncOpeningHours: boolean;
            deleteSyncedOpeningHours?: boolean;
        }) => {
            const toastId = toast.loading(t('POS.Processing'));
            setLoading(true);
            try {
                await api.patchApiGoogleCalendarSettings({
                    syncOpeningHours,
                    deleteSyncedOpeningHours,
                });
                toast.update(toastId, {
                    render: syncOpeningHours
                        ? t('Setting.OpeningHoursSyncEnabledToast')
                        : t('Setting.OpeningHoursSyncDisabledToast'),
                    type: 'success',
                    isLoading: false,
                    autoClose: 2000,
                });
            } catch (error) {
                toast.update(toastId, {
                    render: t('Setting.OpeningHoursSyncError'),
                    type: 'error',
                    isLoading: false,
                    autoClose: 2000,
                });
            } finally {
                setLoading(false);
                googleCalendarSyncConnectionStatus();
            }
        },
        [googleCalendarSyncConnectionStatus],
    );

    const handleGoogleCalendarCallback = useCallback(
        async ({ googleCalendarCode }: { googleCalendarCode: string }) => {
            if (hasProcessedCallback.current) {
                return;
            }
            hasProcessedCallback.current = true;
            try {
                await api.getApiGoogleCalendarCallback({ code: googleCalendarCode });
                toast.success(t('Setting.GoogleCalendarSyncSuccess'));
                // SILENTLY CLEAR PARAMS FROM URL WITHOUT RELOADING THE PAGE
                window.history.replaceState(null, '', `${window.location.pathname}`);
                googleCalendarSyncConnectionStatus();
            } catch (error) {
                toast.error(t('Setting.GoogleCalendarCoonnectionFailed'));
                hasProcessedCallback.current = false;
            }
        },
        [googleCalendarSyncConnectionStatus],
    );

    useEffect(() => {
        // Check for Google Calendar callback code in URL
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');

        if (code && !hasProcessedCallback.current) {
            handleGoogleCalendarCallback({ googleCalendarCode: code });
        } else if (!code) {
            googleCalendarSyncConnectionStatus();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Stack sx={{ p: { xs: 2, md: 4 }, width: '100%' }}>
            <Stack sx={{ bgcolor: '#fff', borderRadius: '25px', scrollbarWidth: 'none', overflowX: 'hidden' }}>
                <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                    <Grid2 size={{ xs: 12, md: 4 }}>
                        <POSHeading variant="h6" fontSize={22} text={t('Setting.GoogleCalendarSync')} />
                        <POSHeading fontSize={16} sx={{ fontWeight: 400 }} text={t('Setting.GoogleCalendarSyncDesc')} />
                    </Grid2>

                    {loading ? (
                        <Stack sx={{ width: '65%' }}>
                            <Skeleton variant="rounded" sx={{ width: '100%' }} height={50} />
                        </Stack>
                    ) : (
                        <Grid2 size={{ xs: 12, md: 8 }}>
                            <POSHeading text={t('Setting.GoogleCalenderConnectionStatus')} fontSize={16} />
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
                                        formik.values.googleCalendarSyncConnectionStatus === null
                                            ? '#F5F5F5'
                                            : formik.values.googleCalendarSyncConnectionStatus === true
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
                                        <CircularProgress size={12} sx={{ color: '#666' }} />
                                    ) : (
                                        <Circle
                                            sx={{
                                                fontSize: 12,
                                                color:
                                                    formik.values.googleCalendarSyncConnectionStatus === true
                                                        ? 'green'
                                                        : formik.values.googleCalendarSyncConnectionStatus === false
                                                          ? 'red'
                                                          : '#999',
                                            }}
                                        />
                                    )}
                                    <span>
                                        {isCheckingStatus || formik.values.googleCalendarSyncConnectionStatus === null
                                            ? t('Setting.Checking')
                                            : formik.values.googleCalendarSyncConnectionStatus === true
                                              ? t('Setting.Connected')
                                              : t('Setting.Disconnected')}
                                    </span>
                                    <IconButton
                                        sx={{ ml: 'auto' }}
                                        disableFocusRipple
                                        disableRipple
                                        disableTouchRipple
                                        onClick={() => {
                                            googleCalendarSyncConnectionStatus();
                                        }}
                                        disabled={isCheckingStatus}
                                    >
                                        <Replay sx={{ fontSize: 24 }} />
                                    </IconButton>
                                </Stack>
                                {/* Buttons */}
                                {!isCheckingStatus &&
                                    formik.values.googleCalendarSyncConnectionStatus !== null &&
                                    (formik.values.googleCalendarSyncConnectionStatus === true ? (
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
                                        <POSButton
                                            variant="save"
                                            title={t('Setting.Connect')}
                                            onClick={handleGoogleCalendarSync}
                                        />
                                    ))}
                            </Stack>
                        </Grid2>
                    )}
                </Grid2>

                {formik.values.googleCalendarSyncConnectionStatus === true && (
                    <React.Fragment key="opening-hours-sync-section">
                        <Divider sx={{ ...dividerSx }} />

                        <Grid2 container spacing={3} sx={{ p: { xs: 2, md: 5 } }}>
                            <Grid2 size={{ xs: 12, md: 4 }}>
                                <POSHeading variant="h6" fontSize={22} text={t('Setting.OpeningHoursSyncTitle')} />
                                <POSHeading
                                    fontSize={16}
                                    sx={{ fontWeight: 400, whiteSpace: 'pre-line', mt: 1 }}
                                    fontColor="#6F6F6F"
                                    text={t('Setting.OpeningHoursSyncDescription')}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 8 }}>
                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1F1F1F' }}>
                                    {t('Setting.Sync')}
                                </Typography>
                                <POSSwitch
                                    checked={formik.values.syncOpeningHours}
                                    onChange={async (e) => {
                                        const checked = e.target.checked;
                                        if (checked) {
                                            await changeOpeningHoursSync({ syncOpeningHours: true });
                                        } else {
                                            setOpeningHoursDisableModalOpen(true);
                                        }
                                    }}
                                    disabled={loading}
                                    inputProps={{ 'aria-label': t('Setting.OpeningHoursSyncAriaLabel') }}
                                    sx={{ mt: 1 }}
                                />
                            </Grid2>
                        </Grid2>
                    </React.Fragment>
                )}
            </Stack>

            <POSDeleteModal
                open={disconnectModalOpen}
                handleClose={() => setDisconnectModalOpen(false)}
                title={t('Integration.Deactivate')}
                description={`${t('Integration.DeactivationMessage')} Google calendar?`}
                dismissTitle={t('Common.Dismiss')}
                confirmTitle={t('Common.Confirm')}
                onClickDismiss={() => setDisconnectModalOpen(false)}
                onClickConfirm={handleGoogleCalendarDisconnect}
                disabled={loading}
            />

            {openingHoursDisableModalOpen && (
                <Modal
                    open={true}
                    onClose={() => setOpeningHoursDisableModalOpen(false)}
                    disableAutoFocus
                    aria-labelledby="opening-hours-disable-modal-title"
                    aria-describedby="opening-hours-disable-modal-description"
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Paper
                        sx={{
                            position: 'relative',
                            maxWidth: '90%',
                            maxHeight: '80%',
                            overflow: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 8,
                            padding: 4,
                            minWidth: '30%',
                            minHeight: '10%',
                        }}
                    >
                        <IconButton
                            sx={{ position: 'absolute', top: 10, right: 10 }}
                            onClick={() => setOpeningHoursDisableModalOpen(false)}
                            disableFocusRipple
                            disableRipple
                            disableTouchRipple
                        >
                            <Close />
                        </IconButton>
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <Typography
                                id="opening-hours-disable-modal-title"
                                variant="h6"
                                sx={{ fontWeight: 700, color: '#1F1F1F' }}
                            >
                                {t('Setting.OpeningHoursSyncDisableTitle')}
                            </Typography>
                            <Typography
                                id="opening-hours-disable-modal-description"
                                variant="body1"
                                sx={{ mt: 1, fontSize: 16, color: '#6F6F6F', whiteSpace: 'pre-line' }}
                            >
                                {t('Setting.OpeningHoursSyncDisableDescription')}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                justifyContent: 'flex-end',
                                gap: { xs: 1, md: 2 },
                                mt: { xs: 5, md: 3 },
                                ml: { md: 'auto' },
                                width: '100%',
                            }}
                        >
                            <POSButton
                                title={t('Setting.Cancel')}
                                titleColor="#44B904"
                                sx={{ '&:hover': { background: 'transparent' } }}
                                width={{ xs: '100%', md: 10 }}
                                onClick={() => setOpeningHoursDisableModalOpen(false)}
                                disabled={loading}
                            />
                            <POSButton
                                title={t('Setting.OpeningHoursSyncTurnOffOnly')}
                                titleColor="#1F1F1F"
                                sx={{
                                    backgroundColor: '#F5F5F5',
                                    '&:hover': { backgroundColor: '#E9E9EA' },
                                }}
                                width={{ xs: '100%', md: 10 }}
                                onClick={async () => {
                                    await changeOpeningHoursSync({ syncOpeningHours: false });
                                    setOpeningHoursDisableModalOpen(false);
                                }}
                                disabled={loading}
                            />
                            <POSButton
                                title={
                                    loading ? (
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <CircularProgress size={20} color="inherit" />
                                            <Typography component="span" color="inherit" variant="body2">
                                                {t('POS.Processing')}
                                            </Typography>
                                        </Stack>
                                    ) : (
                                        t('Setting.OpeningHoursSyncTurnOffAndRemove')
                                    )
                                }
                                sx={{ background: '#D30000' }}
                                titleColor="#fff"
                                width={{ xs: '100%', md: 10 }}
                                onClick={async () => {
                                    await changeOpeningHoursSync({
                                        syncOpeningHours: false,
                                        deleteSyncedOpeningHours: true,
                                    });
                                    setOpeningHoursDisableModalOpen(false);
                                }}
                                disabled={loading}
                            />
                        </Box>
                    </Paper>
                </Modal>
            )}
        </Stack>
    );
};

export default GoogleCalendar;
