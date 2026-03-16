import React, { useEffect } from 'react';
import { Modal, IconButton, Paper, Typography, Stack } from '@mui/material';
import { t } from 'i18next';
import PrimaryHeading from '../../../../settings/commonPrimaryHeading';
import { Close } from '@mui/icons-material';
import FTextInput from '../../../../commonComponents/F_TextInput';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import FButton from '../../../../commonComponents/F_Button';
import FPrimaryHeading from '../../../../commonComponents/F_PrimaryHeading';

const validationSchema = Yup.object({
    email: Yup.string().email(t('Setting.InvalidEmailFormat')).required(t('Setting.EmailIsRequired')),
});

export default function SendEmailModal({ open, onClose, handleSubmit }) {
    const formik = useFormik({
        initialValues: {
            email: '',
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            handleSubmit(values);
        },
    });

    const handleClose = () => {
        formik.handleReset();
        onClose();
    };

    useEffect(() => {
        formik.handleReset();
    }, []);

    return (
        <Modal
            open={open}
            onClose={handleClose}
            disableAutoFocus
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 111111 }}
        >
            <Paper
                sx={{
                    position: 'relative',
                    minWidth: '40%',
                    p: 5,
                    bgcolor: '#fff',
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <Close sx={{ color: '#a2a2a2' }} />
                </IconButton>

                <Stack sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <PrimaryHeading text={t('Customer.SendConfEmail')} />
                    <Typography variant="body1" sx={{ fontWeight: 400, color: '#666' }}>
                        {t('Customer.SendConfEmailDesc')}
                    </Typography>
                </Stack>

                <FPrimaryHeading text={t('Common.Email')} fontSize={14} sx={{ mt: 3 }} />
                <FTextInput
                    placeholder={t('Common.Email')}
                    value={formik.values.email}
                    onBlur={formik.handleBlur}
                    onChange={(e) => formik.setFieldValue('email', e.target.value)}
                    name="email"
                    sx={{ mt: 0.5 }}
                />
                {formik.errors.email && (
                    <Typography variant="body1" sx={{ color: 'red' }}>
                        {formik.errors.email}
                    </Typography>
                )}

                <Stack
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        gap: 2,
                        mt: 2,
                    }}
                >
                    <FButton
                        title={t('Setting.Cancel')}
                        variant={'save'}
                        onClick={handleClose}
                        sx={{ mt: 2, maxWidth: 'fit-content', width: { xs: '100%', md: '50%' }, bgcolor: '#d2d2d2' }}
                    />
                    <FButton
                        title={t('Customer.SendAndUpdate')}
                        variant={'save'}
                        onClick={formik.handleSubmit}
                        titlesx={{ whiteSpace: 'nowrap' }}
                        sx={{ mt: 2, maxWidth: 'fit-content', width: { xs: '100%', md: '50%' } }}
                    />
                </Stack>
            </Paper>
        </Modal>
    );
}
