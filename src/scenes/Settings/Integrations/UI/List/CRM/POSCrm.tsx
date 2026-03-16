import { Grid2, Skeleton, Stack } from '@mui/material';
import React, { useState } from 'react';
import IntegrationCard from '../../Shared/IntegrationCard';
import { t } from 'i18next';
import POSDeleteModal from '@/components/POS/Common/POSDeleteModal';
import { useNavigate } from 'react-router-dom';
import { api } from '@/utils/Api/POS';
import { toast } from 'react-toastify';
import { POSIntegrationPropsType } from '../../../Types/Integration-type';
import CardComponent from '../../../Components/CardComponent';
import apiFetcher2 from '@/utils/Api/POS/Interceptor2';
import KlaviyoLogo from '@/assets/klaviyo_logo.png';
import WebhookIcon from '@/assets/icons8-webhook-240.png';

const POSCrm = ({ CategoryAddons, fetchData, isLoading }: POSIntegrationPropsType) => {
    const [deactivateLoading, setDeactivateLoading] = useState(false);
    const [integrationName, setIntegrationName] = useState('');
    const [closeTab, setCloseingTab] = useState(false);
    const navigate = useNavigate();

    const handleIsActive = async (integrationType: string) => {
        try {
            if (integrationType === 'klaviyo') {
                const response = await api.postApiKlaviyo({ enabled: true });
                if (response) {
                    navigate('/settings/integration/klaviyo-setup');
                }
            } else if (integrationType === 'webhook') {
                navigate('/settings/integration/webhook-setup');
            }
        } catch (error) {
            console.error('Error', error);
            toast.error(t('Integration.FailedToActivate'));
        }
    };

    const handleDeactive = async (integrationName: string) => {
        setDeactivateLoading(true);
        try {
            if (integrationName === 'klaviyo') {
                await api.postApiKlaviyoDisconnect();
            } else if (integrationName === 'webhook') {
                // Webhook disconnect logic - assuming similar API pattern
                await apiFetcher2.post('/api/webhook/disconnect');
            }
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
                title={t('Integration.CRM')}
                description={t('Integration.CRMDescription')}
                topDivider={false}
                bottomDivider={false}
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
                            <Skeleton variant="rounded" width="30%" height={250} />
                            <Skeleton variant="rounded" width="30%" height={250} sx={{ mt: '0 !important' }} />
                        </Stack>
                    ) : (
                        <Grid2 container spacing={3}>
                            <Grid2 size={{ xs: 12, sm: 6, xl: 4 }}>
                                {CategoryAddons?.addons?.map(
                                    (allAddons, index) =>
                                        allAddons?.id === 8 && (
                                            <CardComponent
                                                intigrationName={'klaviyo'}
                                                label={t('Integration.Klaviyo')}
                                                isAvailableOnOutlet={
                                                    CategoryAddons?.addons?.find((a) => a.id === 8)
                                                        ?.isAvailableOnStore ?? false
                                                }
                                                key={index}
                                                isActive={allAddons?.isActive}
                                                onActivate={() => handleIsActive('klaviyo')}
                                                setCloseingTab={setCloseingTab}
                                                setIntegrationName={setIntegrationName}
                                                urlLink="/settings/integration/klaviyo-setup"
                                                image={KlaviyoLogo}
                                            />
                                        ),
                                )}
                            </Grid2>
                            {CategoryAddons?.addons?.map(
                                (allAddons, index) =>
                                    allAddons?.id === 10 && (
                                        <Grid2 size={{ xs: 12, sm: 6, xl: 4 }} key={index}>
                                            <CardComponent
                                                intigrationName={'webhook'}
                                                image={WebhookIcon}
                                                isAvailableOnOutlet={
                                                    CategoryAddons?.addons?.find((a) => a.id === 10)
                                                        ?.isAvailableOnStore ?? false
                                                }
                                                label={t('Integration.Webhook')}
                                                isActive={allAddons?.isActive}
                                                onActivate={() => handleIsActive('webhook')}
                                                setCloseingTab={setCloseingTab}
                                                setIntegrationName={setIntegrationName}
                                                urlLink="/settings/integration/webhook-setup"
                                            />
                                        </Grid2>
                                    ),
                            )}
                        </Grid2>
                    )
                }
            />
            {closeTab && (
                <POSDeleteModal
                    open={closeTab}
                    handleClose={() => setCloseingTab(false)}
                    title={`${t('Integration.Deactivate')} ${integrationName}`}
                    description={`${t('Integration.DeactivationMessage')} ${integrationName}?`}
                    onClickDismiss={() => setCloseingTab(false)}
                    onClickConfirm={() => handleDeactive(integrationName)}
                    disabled={deactivateLoading}
                />
            )}
        </React.Fragment>
    );
};

export default POSCrm;
