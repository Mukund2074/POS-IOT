import React from 'react';
import { Box, Modal, IconButton, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RadixButton from './radix/RadixButton';

function CustomDeleteModal({
    open,
    handleClose = () => {},
    description = '',
    title = '',
    onClickDismiss = () => {},
    onClickConfirm = () => {},
    confirmTitle = 'Confirm',
    dismissTitle = 'Dismiss',
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
                <h5>{title ? title : 'Delete'}</h5>
                <Box style={{ display: 'flex', width: '100%' }}>
                    <p>{description}</p>
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
                    <RadixButton variant="outline" disabled={loading} onClick={onClickDismiss}>
                        {dismissTitle}
                    </RadixButton>
                    <RadixButton variant="danger" disabled={loading} onClick={onClickConfirm}>
                        {confirmTitle}
                    </RadixButton>
                </Box>
            </Paper>
        </Modal>
    );
}
export default CustomDeleteModal;
