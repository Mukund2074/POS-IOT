import React, { useEffect, useState } from 'react';
import { Modal, Paper, Stack, IconButton, Typography, Box } from '@mui/material';
import { t } from 'i18next';
import { toast } from 'react-toastify';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSButton from '@/components/POS/Common/POSButton';
import POSInput from '@/components/POS/Common/POSInput';
import { Close, CheckCircle, Email } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { salesApi } from '../../../Core/sales.api';

interface SendReceiptModalProps {
    open: boolean;
    onClose: () => void;
    saleId: string;
    customerEmail?: string;
    customerName?: string;
}

export default function SendReceiptModal({
    open,
    onClose,
    saleId,
    customerEmail,
    customerName,
}: SendReceiptModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    const validationSchema = Yup.object().shape({
        email: Yup.string().email(t('Customer.EmailError')).required(t('Customer.IsRequired')),
    });

    const formik = useFormik({
        initialValues: {
            email: customerEmail || '',
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setIsSubmitting(true);
                setShowSuccessAlert(false);

                await salesApi.sendEmailReceipt({
                    body: {
                        email: values.email,
                        salesId: saleId,
                    },
                });

                setShowSuccessAlert(true);
                toast.success(t('Calendar.SendEmailSuccess'));

                // Auto close after 2 seconds
                setTimeout(() => {
                    handleClose();
                }, 2000);
            } catch (error) {
                console.error('Error sending email receipt:', error);
                toast.error(t('Calendar.SendEmailError'));
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    const handleClose = () => {
        setShowSuccessAlert(false);
        formik.resetForm();
        onClose();
    };

    useEffect(() => {
        if (open && customerEmail) {
            formik.setFieldValue('email', customerEmail);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, customerEmail]);

    useEffect(() => {
        if (open) {
            setShowSuccessAlert(false);
        } else {
            setShowSuccessAlert(false);
        }
    }, [open]);

    return (
        <Modal
            open={open}
            onClose={!isSubmitting ? handleClose : undefined}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                zIndex: 1400,
            }}
        >
            <Paper
                sx={{
                    width: '100%',
                    maxWidth: 500,
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    position: 'relative',
                }}
            >
                <IconButton
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                    onClick={handleClose}
                    disabled={isSubmitting}
                >
                    <Close />
                </IconButton>

                {/* Form Content */}
                <Box>
                    {/* Status Icon */}
                    <Stack alignItems="center" mb={3}>
                        <Stack
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                backgroundColor: showSuccessAlert ? '#e8f5e8' : '#fff3e0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2,
                                transition: 'all 0.3s ease',
                            }}
                        >
                            {showSuccessAlert ? (
                                <CheckCircle sx={{ fontSize: 40, color: '#4caf50' }} />
                            ) : (
                                <Email sx={{ fontSize: 40, color: '#ff9800' }} />
                            )}
                        </Stack>

                        <POSHeading
                            text={showSuccessAlert ? t('POS.ReceiptSentSuccessfully') : t('POS.SendReceiptToCustomer')}
                            sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}
                        />

                        {customerName && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {t('Insights.Customer')}: {customerName}
                            </Typography>
                        )}
                    </Stack>

                    {/* Email Input Form */}
                    {!showSuccessAlert && (
                        <Stack spacing={2} mb={3}>
                            <Stack>
                                <POSHeading
                                    text={t('Setting.Email')}
                                    sx={{ fontSize: 16, fontWeight: 600, mb: 1, textAlign: 'left' }}
                                />
                                <POSInput
                                    name="email"
                                    id="email"
                                    helperText={formik.touched.email && formik.errors.email ? formik.errors.email : ''}
                                    error={formik.touched.email && !!formik.errors.email}
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={() => formik.handleBlur('email')}
                                    placeholder={t('example@example.com')}
                                    disabled={isSubmitting}
                                    sx={{ textAlign: 'left' }}
                                />
                            </Stack>
                        </Stack>
                    )}

                    <POSHeading
                        text={showSuccessAlert ? t('POS.ReceiptSentToEmail') : t('POS.EnterEmailToSendReceipt')}
                        sx={{ fontSize: 14, mb: 3, color: '#666' }}
                    />

                    {/* Action Buttons */}
                    {!showSuccessAlert && (
                        <Stack
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 2,
                            }}
                        >
                            <POSButton
                                title={t('Setting.Cancel')}
                                variant="f_outline"
                                onClick={handleClose}
                                width={{ xs: '100%', md: 'auto' }}
                                disabled={isSubmitting}
                            />
                            <POSButton
                                title={
                                    isSubmitting ? (
                                        <Stack
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                flexDirection: 'row',
                                                gap: 1,
                                            }}
                                        >
                                            <Typography>{t('POS.Processing')}</Typography>
                                        </Stack>
                                    ) : (
                                        t('POS.Send')
                                    )
                                }
                                variant="save"
                                onClick={formik.handleSubmit}
                                width={{ xs: '100%', md: 'auto' }}
                                disabled={!formik.values.email || isSubmitting || !formik.isValid}
                            />
                        </Stack>
                    )}

                    {showSuccessAlert && (
                        <POSButton
                            title={t('POS.Close')}
                            variant="save"
                            onClick={handleClose}
                            width={{ xs: '100%', md: 'auto' }}
                        />
                    )}
                </Box>
            </Paper>
        </Modal>
    );
}
