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
import trustpilot_logo from '@/assets/trustpilot_logo.png';

const POSRatingAndReview = ({ CategoryAddons, fetchData, isLoading }: POSIntegrationPropsType) => {
    const [deactivateLoading, setDeactivateLoading] = useState(false);
    const [integrationName, setIntegrationName] = useState('');
    const [closeTab, setCloseingTab] = useState(false);
    const navigate = useNavigate();

    const handleIsActive = async () => {
        try {
            const response = await api.postApiTrustpilot({ enabled: true });
            if (response) {
                navigate('/settings/integration/trustpilot-setup');
            }
        } catch (error) {
            console.error('Error', error);
            toast.error(t('Integration.FailedToActivate'));
        }
    };

    const handleDeactive = async (integrationName: string) => {
        setDeactivateLoading(true);
        try {
            if (integrationName === 'trustpilot') {
                await api.postApiTrustpilotDisconnect();
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
                title={t('Integration.RatingAndReview')}
                description={t('Integration.RatingAndReviewDescription')}
                processContent={
                    isLoading ? (
                        <Stack spacing={2}>
                            <Skeleton variant="rounded" width="30%" height={250} />
                        </Stack>
                    ) : (
                        <Grid2 container spacing={3}>
                            <Grid2 size={{ xs: 12, sm: 6, xl: 4 }}>
                                {CategoryAddons?.addons?.map(
                                    (allAddons, index) =>
                                        allAddons?.id === 7 && (
                                            <CardComponent
                                                label={t('Integration.Trustpilot')}
                                                intigrationName={'trustpilot'}
                                                key={index}
                                                isActive={allAddons?.isActive}
                                                isAvailableOnOutlet={
                                                    CategoryAddons?.addons?.find((a) => a.id === 7)
                                                        ?.isAvailableOnStore ?? false
                                                }
                                                onActivate={handleIsActive}
                                                setCloseingTab={setCloseingTab}
                                                setIntegrationName={setIntegrationName}
                                                urlLink="/settings/integration/trustpilot-setup"
                                                image={trustpilot_logo}
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

export default POSRatingAndReview;
