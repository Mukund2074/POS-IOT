import React from 'react';
import { Box, Modal, IconButton, Paper, SxProps, CircularProgress, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { t } from 'i18next';
import POSHeading from './POSHeading';
import POSButton from './POSButton';

interface POSDeleteModalProps {
    open: boolean;
    handleClose: () => void;
    description: string | React.ReactNode;
    title?: string;
    type?: string;
    onClickDismiss: () => void;
    onClickConfirm: () => void;
    dismissColor?: string;
    dismissBg?: string;
    ConfirmColor?: string;
    ConfirmBg?: string;
    descriptionStyle?: SxProps;
    disabled?: boolean;
    hideDismiss?: boolean;
    confirmTitle?: string;
    dismissTitle?: string;
}

const POSDeleteModal: React.FC<POSDeleteModalProps> = ({
    open,
    handleClose = () => {},
    description,
    title,
    onClickDismiss = () => {},
    onClickConfirm = () => {},
    dismissColor = '#44B904',
    dismissBg = 'transparent',
    ConfirmColor = '#fff',
    ConfirmBg = '#D30000',
    descriptionStyle = {},
    disabled = false,
    hideDismiss = false,
    confirmTitle = t('Common.Confirm'),
    dismissTitle = t('Common.Dismiss'),
}) => {
    const handleCloseModal = (_event: React.SyntheticEvent, reason: string) => {
        if (reason === 'backdropClick') {
            return;
        }
        handleClose();
    };

    return (
        <Modal
            open={open}
            onClose={handleCloseModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={handleClose}
                        aria-label="close"
                        sx={{
                            position: 'absolute',
                            top: '10px',
                            right: '30px',
                            zIndex: 10,
                            color: 'black',
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                <POSHeading text={title || t('Common.Delete')} />

                <Box sx={{ display: 'flex', width: '100%' }}>
                    {typeof description === 'string' ? (
                        <POSHeading
                            fontSize="16px"
                            fontColor="#6F6F6F"
                            text={description}
                            sx={{ ...descriptionStyle }}
                        />
                    ) : (
                        description
                    )}
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'flex-end',
                        width: '100%',
                        mt: { xs: 2, md: 4 },
                        gap: 2,
                    }}
                >
                    {!hideDismiss && (
                        <POSButton
                            width={{ xs: '100%', md: '150px' }}
                            height="40px"
                            sx={{
                                minWidth: '150px',
                                backgroundColor: dismissBg,
                            }}
                            titleColor={dismissColor}
                            onClick={onClickDismiss}
                            title={dismissTitle}
                            disabled={disabled}
                        />
                    )}
                    <POSButton
                        width={{ xs: '100%', md: '150px' }}
                        height="40px"
                        sx={{
                            minWidth: '150px',
                            backgroundColor: ConfirmBg,
                        }}
                        titleColor={ConfirmColor}
                        onClick={onClickConfirm}
                        title={
                            disabled ? (
                                <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                                    <CircularProgress size={20} color="inherit" />
                                    <Typography color="inherit">{t('POS.Processing')}</Typography>
                                </Stack>
                            ) : (
                                confirmTitle
                            )
                        }
                        disabled={disabled}
                    />
                </Box>
            </Paper>
        </Modal>
    );
};

export default POSDeleteModal;
