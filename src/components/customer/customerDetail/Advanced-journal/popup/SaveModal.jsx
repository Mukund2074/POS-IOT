import React from 'react';
import { Modal, IconButton, Paper, Typography, Stack } from '@mui/material';
import { t } from 'i18next';
import PrimaryHeading from '../../../../settings/commonPrimaryHeading';
import { Close } from '@mui/icons-material';
import FButton from '../../../../commonComponents/F_Button';

function SaveModal(props) {
    const {
        open,
        handleClose,
        description,
        title,
        onClickDismiss,
        onClickConfirm,
        ConfirmText,
        dismissText = t('Common.Dismiss'),
        dismissColor = '#44B904',
        dismissBg = 'transparent',
        ConfirmColor = '#fff',
        ConfirmBg = '#D30000',
        hideButton = false,
    } = props;

    const closeModal = () => {
        handleClose();
    };

    const handleCloseModal = (event, reason) => {
        if (reason === 'backdropClick') {
            return;
        }
    };

    return (
        <Modal
            disableAutoFocus
            open={open}
            onClose={handleCloseModal}
            sx={{ zIndex: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Paper
                sx={{
                    position: 'relative',
                    maxWidth: '90%',
                    maxHeight: '80%',
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: { xs: 4, md: 8 },
                    padding: { xs: 2, md: 4 },
                    minWidth: '30%',
                    minHeight: '10%',
                }}
            >
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={closeModal}>
                    <Close />
                </IconButton>

                <PrimaryHeading fontColor="#1F1F1F" text={title ?? t('Common.Save')} />

                <Typography variant="body1" sx={{ fontWeight: 400, color: '#666', pt: 2, pb: 6 }}>
                    {description}
                </Typography>

                <Stack
                    display={'flex'}
                    flexDirection={{ xs: 'column', md: 'row' }}
                    gap={2}
                    justifyContent={!hideButton ? 'space-between' : 'flex-end'}
                >
                    {!hideButton && (
                        <FButton
                            onClick={onClickDismiss}
                            title={dismissText}
                            variant={'cancel'}
                            sx={{ width: { xs: '100%', md: 'fit-content' }, bgcolor: dismissBg, color: dismissColor }}
                        />
                    )}
                    <FButton
                        onClick={onClickConfirm}
                        title={
                            ConfirmText ? (
                                <Typography fontWeight={700} whiteSpace={'nowrap'}>
                                    {ConfirmText}
                                </Typography>
                            ) : (
                                t('Common.Save')
                            )
                        }
                        variant={'save'}
                        sx={{ minWidth: { xs: '100%', md: 'fit-content' }, bgcolor: ConfirmBg, color: ConfirmColor }}
                    />
                </Stack>
            </Paper>
        </Modal>
    );
}

export default SaveModal;
