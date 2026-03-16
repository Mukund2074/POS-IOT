import { Close } from '@mui/icons-material'
import { IconButton, Modal, Paper } from '@mui/material'
import React from 'react'

export default function PreviewModal({ open, onClose, content, title }) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            disableAutoFocus
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Paper sx={{
                width: "80%", height: "80%", display: 'flex', flexDirection: 'column', position: "relative", py: 6, px: { xs: 2, md: 24 },
            }
            }>
                <IconButton
                    disableRipple disableFocusRipple disableTouchRipple
                    sx={{ position: "absolute", right: 8, top: 8, zIndex: 11 }} onClick={onClose} >
                    <Close />
                </IconButton>

                {/* hiiii */}
                <iframe srcDoc={content} width="100%" height="100%" title={`Preview of ${title}`} />

            </Paper>
        </Modal>
    )
}
