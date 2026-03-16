import React from 'react';
import { Box, Modal, IconButton, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CommonButton from './settings/commonButton';
import SecondaryHeading from './settings/commonSecondaryHeading';
import PrimaryHeading from './settings/commonPrimaryHeading';
import { t } from 'i18next';

function CustomDeleteModal({
    open,
    handleClose = () => {},
    description = '',
    title = '',
    onClickDismiss = () => {},
    onClickConfirm = () => {},
    dismissColor = '#44B904',
    dismissBg = 'transparent',
    ConfirmColor = '#fff',
    ConfirmBg = '#D30000',
    confirmTitle = t('Common.Confirm'),
    dismissTitle = t('Common.Dismiss'),
    loading = false,
}) {
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
            open={open}
            onClose={handleCloseModal}
            disableAutoFocus
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
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={() => closeModal()}
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
                <PrimaryHeading text={title ? title : t('Common.Delete')} />
                <Box style={{ display: 'flex', width: '100%' }}>
                    <SecondaryHeading fontColor="#6F6F6F" text={description} />
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
                    <CommonButton
                        disabled={loading}
                        width={{ xs: '100%', md: '150px' }}
                        height="40px"
                        minWidth="150px"
                        backgroundColor={dismissBg}
                        titleColor={dismissColor}
                        onClick={onClickDismiss}
                        title={dismissTitle}
                    />
                    <CommonButton
                        disabled={loading}
                        width={{ xs: '100%', md: '150px' }}
                        height="40px"
                        backgroundColor={ConfirmBg}
                        titleColor={ConfirmColor}
                        onClick={onClickConfirm}
                        title={confirmTitle}
                    />
                </Box>
            </Paper>
        </Modal>
    );
}
export default CustomDeleteModal;
