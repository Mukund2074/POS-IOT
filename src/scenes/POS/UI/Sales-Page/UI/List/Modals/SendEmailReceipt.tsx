import POSButton from '@/components/POS/Common/POSButton';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSInput from '@/components/POS/Common/POSInput';
import SimpleSuccessAnimation from '@/components/POS/Common/SimpleSuccessAnimation';
import { Close } from '@mui/icons-material';
import { CircularProgress, IconButton, Modal, Paper, Stack, Fade, Box } from '@mui/material';
import { t } from 'i18next';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { salesApi } from '../../../Core/sales.api';
import { toast } from 'react-toastify';

export default function SendEmailReceipt({
    open,
    onClose,
    invoiceId,
    email,
    showSuccessAnimation = false,
}: {
    open: boolean;
    onClose: () => void;
    invoiceId: string;
    email?: string;
    showSuccessAnimation?: boolean;
}) {
    const [showAnimation, setShowAnimation] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const validationSchema = Yup.object().shape({
        email: Yup.string().email(t('Customer.EmailError')).required(t('Customer.IsRequired')),
    });
    const formik = useFormik({
        initialValues: {
            email: '',
        },
        validationSchema,
        onSubmit: (values) => {
            salesApi
                .sendEmailReceipt({
                    body: {
                        email: values.email,
                        salesId: invoiceId,
                    },
                })
                .then(() => {
                    toast.success(t('Calendar.SendEmailSuccess'));
                    setShowAnimation(true);
                })
                .catch(() => {
                    toast.error(t('Calendar.SendEmailError'));
                })
                .finally(() => {
                    setTimeout(() => {
                        onClose();
                    }, 1500);
                });
            formik.resetForm();
        },
    });

    useEffect(() => {
        if (email) {
            formik.setFieldValue('email', email);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (open) {
            if (showSuccessAnimation) {
                setShowAnimation(true);
                setShowForm(false);
                // Show animation for 1.5 seconds, then show form
                const timer = setTimeout(() => {
                    setShowAnimation(false);
                    setShowForm(true);
                }, 1500);
                return () => clearTimeout(timer);
            } else {
                setShowForm(true);
                setShowAnimation(false);
            }
        } else {
            setShowAnimation(false);
            setShowForm(false);
        }
    }, [open, showSuccessAnimation]);

    return (
        <Modal
            disableAutoFocus
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            open={open}
            onClose={onClose}
        >
            <Paper
                sx={{
                    width: { xs: '90%', sm: '75%', md: '50%' },
                    minHeight: 250,
                    borderRadius: 4,
                    overflow: 'auto',
                    scrollbarWidth: 'none',
                    my: { xs: 1 },
                    position: 'relative',
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {!showAnimation && (
                    <IconButton sx={{ position: 'absolute', right: 0, top: 0 }} onClick={onClose}>
                        <Close />
                    </IconButton>
                )}

                {/* Success Animation */}
                {showAnimation && (
                    <Fade in={showAnimation} timeout={1500}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                minHeight: 200,
                            }}
                        >
                            <SimpleSuccessAnimation size={60} color="#4caf50" />
                            <POSHeading
                                text={t('POS.SendReceiptToCustomer')}
                                sx={{ mt: 1, fontSize: 14, color: '#666', textAlign: 'center' }}
                            />
                        </Box>
                    </Fade>
                )}

                {/* Form Content */}
                <Fade in={showForm} timeout={500}>
                    <Box sx={{ display: showForm ? 'block' : 'none' }}>
                        <POSHeading text={t('POS.SendManualReceipt')} />

                        <Stack sx={{ my: 1 }}>
                            <POSHeading
                                text={t('POS.SendManualReceipt')}
                                sx={{ mt: 2, fontSize: 16, color: '#222', fontWeight: 600 }}
                            />
                            <POSInput
                                name="email"
                                id="email"
                                helperText={formik.errors.email}
                                error={!!formik.errors.email}
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                placeholder={t('example@example.com')}
                            />
                        </Stack>

                        <Stack
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                justifyContent: 'flex-end',
                                gap: 2,
                                mt: 'auto',
                            }}
                        >
                            <POSButton
                                variant="save"
                                title={t('POS.Cancel')}
                                onClick={onClose}
                                width={{ xs: '100%', md: 'fit-content' }}
                                sx={{ px: 2, bgcolor: '#d2d2d2' }}
                            />
                            <POSButton
                                variant="save"
                                title={
                                    formik.isSubmitting ? (
                                        <Stack direction="row" gap={2} alignItems="center">
                                            <CircularProgress size={20} color="inherit" />
                                            {t('POS.Processing')}
                                        </Stack>
                                    ) : (
                                        t('POS.Send')
                                    )
                                }
                                disabled={!formik.values.email || formik.isSubmitting}
                                onClick={formik.handleSubmit}
                                width={{ xs: '100%', md: 'fit-content' }}
                                sx={{ px: 2, bgcolor: formik?.isSubmitting && '#d2d2d2' }}
                            />
                        </Stack>
                    </Box>
                </Fade>
            </Paper>
        </Modal>
    );
}
