import React, { useState } from 'react';
import { t } from 'i18next';
import { Box, Grid, Skeleton, Stack, Typography } from '@mui/material';
import IntegrationCard from '../Shared/IntegrationCard';
import POSButton from '@/components/POS/Common/POSButton';
import POSDeleteModal from '@/components/POS/Common/POSDeleteModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '@/utils/Api/POS';
import { CategoryAddon } from '../../Types/Integration-type';

// const dinero_logo: string = require('@/assets/dinero.png');
const economic_logo: string = require('@/assets/economic.png');
const billy: string = require('@/assets/billy.png');

type LoadingState = {
    [key: string]: boolean;
};

interface POSIntegrationPropsType {
    CategoryAddon: CategoryAddon;
    fetchData: () => void;
    settings: any;
    isLoading?: boolean;
}

const POSIntegration = ({ CategoryAddon, fetchData, settings, isLoading }: POSIntegrationPropsType) => {
    const navigate = useNavigate();
    const [closeTab, setCloseTab] = useState(false);
    const [loadingState, setLoadingState] = useState<LoadingState>({});
    // const [id, setId] = useState(0);
    const [deactivateLoading, setDeactivateLoading] = useState(false);
    const [integrationName, setIntegrationName] = useState('');

    const handleDeactive = async (integrationName: string) => {
        setDeactivateLoading(true);
        try {
            if (integrationName === 'economic') {
                await api.postApiEconomicDisconnect();
            }
            if (integrationName === 'billy') {
                // await api.deleteApiAddonsAddonId(id);
            }
            if (integrationName === 'trustpilot') {
                await api.postApiTrustpilotDisconnect();
            }
            setCloseTab(false);
            fetchData();
            setDeactivateLoading(false);
        } catch (error) {
            console.error('error', error);
            toast.error(t('Integration.DeactivationFailedMessage'));
        }
    };

    const handleIsActive = async (arg: any) => {
        try {
            setLoadingState((prev) => ({ ...prev, [arg]: true }));
            await api.postApiAddonsUpsert({ addonName: arg });

            if (arg === 'billy') {
                navigate('/settings/integration/billy-setup');
            } else if (arg === 'economic') {
                navigate('/settings/integration/economic-setup');
            }
        } catch (error) {
            console.error('error ', error);
            toast.error(t('Integration.FailedToActivate'));
        } finally {
            setLoadingState((prev) => ({ ...prev, [arg]: false }));
        }
    };

    return (
        <React.Fragment>
            <IntegrationCard
                title={t('POS.Integration')}
                description={t('POS.IntegrationDescription')}
                bottomDivider={false}
                topDivider={true}
                processContent={
                    isLoading ? (
                        <Stack spacing={2} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                            <Skeleton variant="rounded" width="30%" height={250} />
                            <Skeleton variant="rounded" width="30%" height={250} sx={{ mt: '0 !important' }} />
                        </Stack>
                    ) : (
                        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 12, md: 12 }}>
                            {/* Dinero Integration */}
                            {/* <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ boxShadow: 3, p: 4 }}>
                                <Box sx={{ width: '80%' }}>
                                    <img src={dinero_logo} alt="Dinero Logo" width={'70%'} />
                                </Box>
                                <Typography sx={{ mt: 2 }}>{t('Integration.Dinero')}</Typography>
                                {data[0]?.isActive ? (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            mt: 3,
                                            justifyContent: 'center',
                                            flexWrap: 'wrap',
                                            gap: 1,
                                        }}
                                    >
                                        <POSButton
                                            title={t('GiftCard.Settings')}
                                            sx={{
                                                background: '#D9D9D9',
                                                color: 'white',
                                                p: { md: 0 },
                                                '@media (max-width:600px)': {
                                                    width: '100%', // For mobile devices
                                                },
                                                '@media (min-width:600px) and (max-width:960px)': {
                                                    width: '100%', // For tablet devices
                                                },
                                                '@media (min-width:960px) and (max-width:1445px)': {
                                                    width: '100%', // For screens between 960px and 1445px
                                                },
                                                '@media (min-width:1445px)': {
                                                    width: '20%', // For large screens (1445px and up)
                                                },
                                            }}
                                            width={'20%'}
                                            onClick={() => navigate('/settings/integration/dinero-setup?status=success')}
                                        />
                                        <POSButton
                                            title={t('Integration.Deactive')}
                                            sx={{
                                                background: '#D30000',
                                                color: 'white',
                                                p: { md: 0 },
                                                '@media (max-width:600px)': {
                                                    width: '100%', // For mobile devices
                                                },
                                                '@media (min-width:600px) and (max-width:960px)': {
                                                    width: '100%', // For tablet devices
                                                },
                                                '@media (min-width:960px) and (max-width:1445px)': {
                                                    width: '100%', // For screens between 960px and 1445px
                                                },
                                                '@media (min-width:1445px)': {
                                                    width: '20%', // For large screens (1445px and up)
                                                },
                                            }}
                                            width={'20%'}
                                            onClick={() => {
                                                setCloseTab(true);
                                                setId(data[0]?.id);
                                            }}
                                        />
                                    </Box>
                                ) : (
                                    <POSButton
                                        title={t('GiftCard.Activate')}
                                        sx={{
                                            mt: 3,
                                            background: '#44B904',
                                            color: 'white',
                                            p: { md: 0 },
                                            '@media (max-width:600px)': {
                                                width: '100%', // For mobile devices
                                                mt: 10,
                                            },
                                            '@media (min-width:600px) and (max-width:960px)': {
                                                width: '100%', // For tablet devices
                                                mt: 10,
                                            },
                                            '@media (min-width:960px) and (max-width:1445px)': {
                                                width: '100%', // For screens between 960px and 1445px
                                                mt: 10,
                                            },
                                            '@media (min-width:1445px)': {
                                                width: '20%', // For large screens (1445px and up)
                                            },
                                        }}
                                        width={2}
                                        onClick={() => {
                                            if (data[0].meta?.authUrl) {
                                                setLoadingState({ dinero: true });
                                                window.location.href = data[0].meta.authUrl;
                                            } else {
                                                toast.error('Auth URL not found');
                                            }
                                        }}
                                        loading={loadingState?.dinero ? true : false}
                                    />
                                )}
                            </Box>
                        </Grid> */}

                            {/* Economic Integration */}
                            {settings?.profile?.inspection_module && (
                                <Grid item xs={12} sm={6} md={4}>
                                    <Box sx={{ boxShadow: 3, p: 4, height: '100%' }}>
                                        <Box sx={{ width: '80%' }}>
                                            <img src={economic_logo} width={'70%'} alt="" />
                                        </Box>
                                        <Typography sx={{ mt: 1 }}>{t('Integration.Economic')}</Typography>
                                        {CategoryAddon?.addons.find((a) => a.id === 2)?.isActive ? (
                                            <Box
                                                sx={{
                                                    mt: 4,
                                                    justifyContent: 'center',
                                                    flexWrap: 'wrap',
                                                    gap: 1,
                                                    display: 'flex', // Default display for larger screens
                                                    '@media (max-width:600px)': {
                                                        display: 'block', // For mobile screens
                                                    },
                                                    '@media (min-width:600px) and (max-width:960px)': {
                                                        display: 'block', // For tablet screens, still block display
                                                    },
                                                    '@media (min-width:960px) and (max-width:1445px)': {
                                                        display: 'flex', // For screens between 960px and 1445px
                                                        justifyContent: 'center', // Center buttons
                                                    },
                                                    '@media (min-width:1445px)': {
                                                        display: 'flex', // For large screens (1445px and up)
                                                        justifyContent: 'space-between', // Center buttons
                                                    },
                                                }}
                                            >
                                                <POSButton
                                                    title={t('GiftCard.Settings')}
                                                    sx={{
                                                        background: '#D9D9D9',
                                                        color: 'white',
                                                        p: { md: 0 },
                                                        '@media (max-width:600px)': {
                                                            width: '100%', // For mobile devices
                                                            mb: 2,
                                                        },
                                                        '@media (min-width:600px) and (max-width:960px)': {
                                                            width: '100%', // For tablet devices
                                                            mb: 2,
                                                        },
                                                        '@media (min-width:960px) and (max-width:1445px)': {
                                                            width: '100%', // For screens between 960px and 1445px
                                                        },
                                                        '@media (min-width:1445px)': {
                                                            width: '20%', // For large screens (1445px and up)
                                                        },
                                                    }}
                                                    onClick={() => navigate('/settings/integration/economic-setup')}
                                                />
                                                <POSButton
                                                    title={t('Integration.Deactive')}
                                                    sx={{
                                                        background: '#D30000',
                                                        color: 'white',
                                                        p: { md: 0 },
                                                        '@media (max-width:600px)': {
                                                            width: '100%', // For mobile devices
                                                        },
                                                        '@media (min-width:600px) and (max-width:960px)': {
                                                            width: '100%', // For tablet devices
                                                        },
                                                        '@media (min-width:960px) and (max-width:1445px)': {
                                                            width: '100%', // For screens between 960px and 1445px
                                                        },
                                                        '@media (min-width:1445px)': {
                                                            width: '20%', // For large screens (1445px and up)
                                                        },
                                                    }}
                                                    onClick={() => {
                                                        setCloseTab(true);
                                                        setIntegrationName('economic');
                                                    }}
                                                />
                                            </Box>
                                        ) : (
                                            <Box sx={{ height: '65%' }}>
                                                <POSButton
                                                    title={t('GiftCard.Activate')}
                                                    sx={{
                                                        mt: 4,
                                                        background: '#44B904',
                                                        color: 'white',
                                                        p: { md: 0 },
                                                        '@media (max-width:600px)': {
                                                            width: '100%', // For mobile devices
                                                            mt: 10,
                                                        },
                                                        '@media (min-width:600px) and (max-width:960px)': {
                                                            width: '100%', // For tablet devices
                                                            mt: 10,
                                                        },
                                                        '@media (min-width:960px) and (max-width:1445px)': {
                                                            width: '100%', // For screens between 960px and 1445px
                                                            mt: 10,
                                                        },
                                                        '@media (min-width:1445px)': {
                                                            width: '20%', // For large screens (1445px and up)
                                                        },
                                                    }}
                                                    width={2}
                                                    onClick={() =>
                                                        window.location.replace(
                                                            CategoryAddon?.addons[1]?.meta?.authUrl as string,
                                                        )
                                                    }
                                                />
                                            </Box>
                                        )}
                                    </Box>
                                </Grid>
                            )}

                            {/* Billy Integration */}
                            <Grid item xs={12} sm={6} md={4}>
                                <Box sx={{ boxShadow: 3, p: 4 }}>
                                    <Box sx={{ width: '80%' }}>
                                        <img src={billy} width="70%" alt="Billy Logo" />
                                    </Box>
                                    <Typography sx={{ my: 1 }}>{t('Integration.Billy')}</Typography>
                                    {CategoryAddon?.addons.find((a) => a.id === 3)?.isActive ? (
                                        <Box
                                            sx={{
                                                mt: 4,
                                                justifyContent: 'center',
                                                flexWrap: 'wrap',
                                                gap: 1,
                                                display: 'flex', // Default display for larger screens
                                                '@media (max-width:600px)': {
                                                    display: 'block', // For mobile screens
                                                },
                                                '@media (min-width:600px) and (max-width:960px)': {
                                                    display: 'block', // For tablet screens, still block display
                                                },
                                                '@media (min-width:960px) and (max-width:1445px)': {
                                                    display: 'flex', // For screens between 960px and 1445px
                                                    justifyContent: 'center', // Center buttons
                                                },
                                                '@media (min-width:1445px)': {
                                                    display: 'flex', // For large screens (1445px and up)
                                                    justifyContent: 'space-between', // Center buttons
                                                },
                                            }}
                                        >
                                            <POSButton
                                                title={t('GiftCard.Settings')}
                                                sx={{
                                                    background: '#D9D9D9',
                                                    color: 'white',
                                                    p: { md: 0 },
                                                    '@media (max-width:600px)': {
                                                        width: '100%', // For mobile devices
                                                        mb: 2,
                                                    },
                                                    '@media (min-width:600px) and (max-width:960px)': {
                                                        width: '100%', // For tablet devices
                                                        mb: 2,
                                                    },
                                                    '@media (min-width:960px) and (max-width:1445px)': {
                                                        width: '100%', // For screens between 960px and 1445px
                                                    },
                                                    '@media (min-width:1445px)': {
                                                        width: '20%', // For large screens (1445px and up)
                                                    },
                                                }}
                                                onClick={() => navigate('/settings/integration/billy-setup')}
                                            />
                                            {/* <POSButton
                                                title={t('Integration.Deactive')}
                                                sx={{
                                                    background: '#D30000',
                                                    color: 'white',
                                                    p: { md: 0 },
                                                    '@media (max-width:600px)': {
                                                        width: '100%', // For mobile devices
                                                    },
                                                    '@media (min-width:600px) and (max-width:960px)': {
                                                        width: '100%', // For tablet devices
                                                    },
                                                    '@media (min-width:960px) and (max-width:1445px)': {
                                                        width: '100%', // For screens between 960px and 1445px
                                                    },
                                                    '@media (min-width:1445px)': {
                                                        width: '20%', // For large screens (1445px and up)
                                                    },
                                                }}
                                                onClick={() => {
                                                    setCloseTab(true);
                                                    setIntegrationName('billy');
                                                }}
                                            /> */}
                                        </Box>
                                    ) : (
                                        <POSButton
                                            title={t('GiftCard.Activate')}
                                            sx={{
                                                mt: 3,
                                                background: '#44B904',
                                                color: 'white',
                                                p: { md: 0 },
                                                '@media (max-width:600px)': {
                                                    width: '100%', // For mobile devices
                                                    mt: 10,
                                                },
                                                '@media (min-width:600px) and (max-width:960px)': {
                                                    width: '100%', // For tablet devices
                                                    mt: 10,
                                                },
                                                '@media (min-width:960px) and (max-width:1445px)': {
                                                    width: '100%', // For screens between 960px and 1445px
                                                    mt: 10,
                                                },
                                                '@media (min-width:1445px)': {
                                                    width: '20%', // For large screens (1445px and up)
                                                },
                                            }}
                                            width={2}
                                            onClick={() => {
                                                handleIsActive('billy');
                                            }}
                                            loading={loadingState?.billy ? true : false}
                                        />
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    )
                }
            />
            {closeTab && (
                <POSDeleteModal
                    open={closeTab}
                    handleClose={() => setCloseTab(false)}
                    title={t('Integration.Deactivate')}
                    description={`${t('Integration.DeactivationMessage')} ${integrationName}?`}
                    onClickDismiss={() => setCloseTab(false)}
                    onClickConfirm={() => handleDeactive(integrationName)}
                    disabled={deactivateLoading}
                />
            )}
        </React.Fragment>
    );
};

export default POSIntegration;
