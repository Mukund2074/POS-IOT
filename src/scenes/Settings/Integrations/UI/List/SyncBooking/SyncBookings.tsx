import React, { useState } from 'react';
import IntegrationCard from '../../Shared/IntegrationCard';
import { Grid2, Skeleton, Stack } from '@mui/material';
import { t } from 'i18next';
import POSDeleteModal from '@/components/POS/Common/POSDeleteModal';
import { toast } from 'react-toastify';
import CardComponent from '../../../Components/CardComponent';
import { POSIntegrationPropsType } from '../../../Types/Integration-type';
import { api } from '@/utils/Api/POS';
import google_calendar from '@/assets/google_calendar.webp';
import calendly_logo from '@/assets/Calendly_icon.svg';

const SyncBookings = ({ CategoryAddons, fetchData, isLoading }: POSIntegrationPropsType) => {
    const [closeTab, setCloseingTab] = useState(false);
    const [deactivateLoading, setDeactivateLoading] = useState(false);
    const [integrationName, setIntegrationName] = useState('');

    const handleIsActive = async (intigrationName: string) => {
        try {
            if (intigrationName === 'google_calendar') {
                const response = await api.getApiGoogleCalendarAuthUrl();
                if (response) {
                    window.open(response?.data?.authUrl as string);
                }
            }
            if (intigrationName === 'calendly') {
                const response = await api.getApiCalendlyAuthUrl();
                if (response) {
                    window.open(response?.data?.authUrl as string);
                }
            }
        } catch (error) {
            console.error('Error', error);
            toast.error(t('Integration.FailedToActivate'));
        }
    };

    const handleDeactive = async (integrationName: string) => {
        setDeactivateLoading(true);
        try {
            if (integrationName === 'google_calendar') {
                await api.postApiGoogleCalendarDisconnect();
            }
            if (integrationName === 'calendly') {
                await api.postApiCalendlyDisconnect();
            }
            toast.success(t('Integration.DeactivationSuccess'));
            setCloseingTab(false);
            fetchData();
            setDeactivateLoading(false);
        } catch (error) {
            console.error('error', error);
            toast.error('Integration.DeactivationFailedMessage');
        }
    };
    return (
        <React.Fragment>
            <IntegrationCard
                title={t('Setting.SyncBooking')}
                // description={t('Integration.CRMDescription')}
                topDivider={false}
                bottomDivider={true}
                processContent={
                    isLoading ? (
                        <Stack
                            spacing={2}
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                alignItems: 'center',
                                gap: 3,
                            }}
                        >
                            <Skeleton variant="rectangular" width="30%" height={250} />
                            <Skeleton variant="rectangular" width="30%" height={250} sx={{ mt: '0 !important' }} />
                        </Stack>
                    ) : (
                        <Grid2 container spacing={3}>
                            <Grid2 size={{ xs: 12, sm: 6, xl: 4 }}>
                                {CategoryAddons?.addons?.map(
                                    (allAddons, index) =>
                                        allAddons?.id === 9 && (
                                            <CardComponent
                                                label={t('Setting.GoogleCalendar')}
                                                isAvailableOnOutlet={
                                                    CategoryAddons?.addons?.find((a) => a.id === 9)
                                                        ?.isAvailableOnStore ?? false
                                                }
                                                intigrationName={'google_calendar'}
                                                key={index}
                                                isActive={allAddons?.isActive}
                                                onActivate={() => handleIsActive('google_calendar')}
                                                setCloseingTab={setCloseingTab}
                                                setIntegrationName={setIntegrationName}
                                                urlLink="/settings/integration/google-calendar"
                                                image={google_calendar}
                                            />
                                        ),
                                )}
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6, xl: 4 }}>
                                {CategoryAddons?.addons?.map(
                                    (allAddons, index) =>
                                        allAddons?.id === 11 && (
                                            <CardComponent
                                                label={t('Setting.Calendly')}
                                                isAvailableOnOutlet={
                                                    CategoryAddons?.addons?.find((a) => a.id === 11)
                                                        ?.isAvailableOnStore ?? false
                                                }
                                                key={index}
                                                intigrationName={'calendly'}
                                                isActive={allAddons?.isActive}
                                                onActivate={() => handleIsActive('calendly')}
                                                setCloseingTab={setCloseingTab}
                                                setIntegrationName={setIntegrationName}
                                                urlLink="/settings/integration/calendly"
                                                image={calendly_logo}
                                            />
                                        ),
                                )}
                            </Grid2>
                        </Grid2>
                    )
                }
            />
            {closeTab && (
                <POSDeleteModal
                    open={closeTab}
                    handleClose={() => setCloseingTab(false)}
                    title={t('Integration.Deactivate')}
                    description={`${t('Integration.DeactivationMessage')} ${integrationName}?`}
                    onClickDismiss={() => setCloseingTab(false)}
                    onClickConfirm={() => handleDeactive(integrationName)}
                    disabled={deactivateLoading}
                />
            )}
        </React.Fragment>
    );
};

export default SyncBookings;
