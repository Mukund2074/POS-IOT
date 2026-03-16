import React from 'react';
import {  Modal, Paper, Stack, Typography } from '@mui/material';
import PrimaryHeading from '../settings/commonPrimaryHeading';
import { t } from 'i18next';
import FButton from './F_Button';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '30%',
    bgcolor: '#FFFFFF',
    borderRadius: 3,
    boxShadow: 0,
    pt: 4,
    px:6.5,
    pb:5
};

function FSaveModal(props) {
    const { open, description, title, onClickDismiss, onClickConfirm, dismissColor = "#fff", dismissBg = "#D9D9D9", ConfirmColor = "#fff", ConfirmBg = "#44B904" } = props;


    const handleCloseModal = (event, reason) => {
        if (reason === 'backdropClick') {
            return
        }
    };


    return (
        <Modal
            disableAutoFocus
            open={open}
            onClose={handleCloseModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            
        >
            <Paper sx={[style, {
                zIndex: 12,
                height:"35%",
                overflowY: { xs: 'auto', sm: '85vh' },
                overflowX: 'hidden',
                maxHeight: { xs: '90vh', sm: '85vh' },
                position: 'relative',
                width: "30%",
                borderRadius: "25px",
                display: "flex",
                flexDirection: "column",
               
                justifyContent: "space-between",
            
            }]}>

              

                <PrimaryHeading  text={title ? title : t("Customer.SaveChanges")} />

                <Stack sx={{ display: 'flex', width: '100%',mt:-4}}>
         <Typography variant='body1'  fontWeight={400} color='#6F6F6F'>{description}</Typography>
                </Stack>

                <Stack style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%',  gap: 2 }}>

                    <FButton
                   sx={{ width : "150px", backgroundColor:dismissBg}}
                        titleColor={dismissColor}
                        onClick={onClickDismiss}
                        title={t("Customer.SaveChangeCan")}
                    />

                    <FButton
                     sx={{ width : "150px", backgroundColor:ConfirmBg}}
                       
                        titleColor={ConfirmColor}
                        onClick={onClickConfirm}
                        title={t("Customer.SaveChangeConf")}
                    />
                </Stack>  
            </Paper>

        </Modal>
    )
}

export default FSaveModal;
