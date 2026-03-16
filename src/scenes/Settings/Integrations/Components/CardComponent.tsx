import React, { useState } from 'react';
import POSButton from '@/components/POS/Common/POSButton';
import POSDeleteModal from '@/components/POS/Common/POSDeleteModal';
import { Box, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import { useNavigate } from 'react-router-dom';

interface CardComponentProps {
    isActive: boolean;
    isAvailableOnOutlet: boolean;
    onActivate: () => void;
    setIntegrationName: (name: string) => void;
    setCloseingTab: (value: boolean) => void;
    urlLink?: string;
    intigrationName: string;
    image?: string;
    label: string;
}

const CardComponent = ({
    isActive,
    isAvailableOnOutlet,
    onActivate,
    setIntegrationName,
    setCloseingTab,
    urlLink,
    intigrationName,
    image,
    label,
}: CardComponentProps) => {
    const navigate = useNavigate();
    const [inactiveModalOpen, setInactiveModalOpen] = useState(false);

    const handleActivateClick = () => {
        if (!isAvailableOnOutlet) {
            setInactiveModalOpen(true);
            return;
        }
        onActivate();
    };

    const buttonBlock = (
        <Box
            sx={{
                mt: 4,
                gap: 2,
                display: 'flex',
                justifyContent: { xs: 'center', md: 'space-between' },
            }}
        >
            {isActive && isAvailableOnOutlet ? (
                <Stack
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: { xs: 'center', md: 'space-between' },
                        gap: 1,
                        mt: 4,
                        width: '100%',
                    }}
                >
                    <POSButton
                        title={t('GiftCard.Settings')}
                        sx={{
                            background: '#D9D9D9',
                            color: 'white',
                            p: { md: 0 },
                        }}
                        width={{ xs: '100%', md: 'fit-content' }}
                        onClick={() => navigate(urlLink as string)}
                    />
                    <POSButton
                        title={t('Integration.Deactive')}
                        sx={{
                            background: '#D30000',
                            color: 'white',
                            p: { md: 0 },
                        }}
                        width={{ xs: '100%', md: 'fit-content' }}
                        onClick={() => {
                            setIntegrationName(intigrationName);
                            setCloseingTab(true);
                        }}
                    />
                </Stack>
            ) : (
                <POSButton
                    title={t('GiftCard.Activate')}
                    sx={{
                        mt: 4,
                        background: '#44B904',
                        color: 'white',
                        p: { md: 0 },
                    }}
                    width={{ xs: '100%', md: 'fit-content' }}
                    onClick={handleActivateClick}
                />
            )}
        </Box>
    );

    const content =
        image != null && label != null ? (
            <Box sx={{ boxShadow: 3, p: { xs: 3, md: 4 }, height: '100%' }}>
                <Box sx={{ width: '80%', gap: 2, display: 'flex', alignItems: 'center' }}>
                    <img src={image} alt={label} style={{ width: '120px', height: '60px', objectFit: 'contain' }} />
                </Box>
                <Typography sx={{ mt: 1 }}>{label}</Typography>
                {buttonBlock}
            </Box>
        ) : (
            buttonBlock
        );

    return (
        <React.Fragment>
            {content}
            <POSDeleteModal
                hideDismiss={true}
                confirmTitle={t('Customer.ButtonTitleOk')}
                open={inactiveModalOpen}
                handleClose={() => setInactiveModalOpen(false)}
                title={t('Integration.NotActivated', { integrationName: label })}
                description={
                    <Typography
                        variant="body1"
                        sx={{ fontSize: '16px', color: '#6F6F6F', whiteSpace: 'pre-line', mt: 2 }}
                    >
                        {' '}
                        {t('Integration.NotActivatedOnOutlet')} <br />
                        {t('Integration.ContactServiceProvider')}
                    </Typography>
                }
                onClickDismiss={() => setInactiveModalOpen(false)}
                onClickConfirm={() => setInactiveModalOpen(false)}
                dismissColor="#44B904"
                dismissBg="transparent"
                ConfirmColor="#fff"
                ConfirmBg="#44B904"
            />
        </React.Fragment>
    );
};

export default CardComponent;
