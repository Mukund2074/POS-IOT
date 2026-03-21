import { Box, Button, IconButton, Stack, Typography, Fade } from '@mui/material';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useState } from 'react';
import { t } from 'i18next';
import theme from '../../ui/theme'; // Using your design tokens
import { ArrowBackIosNewRounded, PhoneAndroidRounded, ErrorOutlineRounded } from '@mui/icons-material';
import RadixPhoneField from '../../components/radix/RadixPhoneField';

const ResNumberInForm = ({
    handleResetPass,
    OTPSending,
    phone,
    countryCode,
    countryISOCode,
    onPhoneChange,
    setPhoneNumber,
    handleResBack,
}) => {
    const [isPending, setIspending] = useState(false);

    const validationSchema = Yup.object({
        phone: Yup.string()
            .required(t('Common.PhoneRequired') || 'Required')
            .matches(/^\d{6,15}$/, t('Common.PhoneDigits') || 'Enter a valid phone number'),
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: { phone: `${phone}` },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setIspending(true);
            const success = await OTPSending({ setter: setIspending, phoneNumber: values.phone });
            if (success) {
                setPhoneNumber(values.phone);
                formik.setFieldValue('phone', '');
                handleResetPass();
            }
            setIspending(false);
        },
    });

    return (
        <Box
            component={'form'}
            noValidate
            sx={{
                width: '100%',
                maxWidth: '520px',
                backgroundColor: '#FFFFFF',
                borderRadius: '40px',
                display: 'flex',
                flexDirection: 'column',
                p: { xs: 4, md: 6 },
                boxShadow: '0px 40px 80px -20px rgba(0, 0, 0, 0.1)',
                border: `1px solid ${theme.colors.grey[100]}`,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* BRANDING HEADER */}
            <Stack direction="row" justifyContent="center" alignItems="baseline" sx={{ mb: 2 }}>
                <Typography
                    sx={{ fontSize: '3em', fontWeight: 900, color: theme.colors.grey[950], letterSpacing: '-1px' }}
                >
                    POS
                </Typography>
                <Typography sx={{ fontSize: '2em', fontWeight: 700, color: theme.colors.primary[500], ml: 0.5 }}>
                    IoT
                </Typography>
            </Stack>

            {/* HEADER WITH BACK BUTTON */}
            <Stack direction="row" alignItems="center" sx={{ width: '100%', mb: 5 }}>
                <IconButton
                    onClick={handleResBack}
                    sx={{
                        bgcolor: theme.colors.grey[50],
                        p: 1.5,
                        mr: 2,
                        '&:hover': { bgcolor: theme.colors.primary[50], color: theme.colors.primary[500] },
                    }}
                >
                    <ArrowBackIosNewRounded sx={{ fontSize: '18px' }} />
                </IconButton>
                <Typography
                    sx={{
                        fontSize: '27px',
                        fontWeight: 800,
                        color: theme.colors.grey[900],
                        letterSpacing: '-1px',
                    }}
                >
                    {t('Common.LogForPass')}
                </Typography>
            </Stack>

            <Stack spacing={4} sx={{ width: '100%' }}>
                {/* INPUT SECTION */}
                <Stack spacing={1.5}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: 1 }}>
                        <PhoneAndroidRounded sx={{ fontSize: '18px', color: theme.colors.primary[500] }} />
                        <Typography
                            sx={{
                                fontSize: '14px',
                                fontWeight: 700,
                                color: theme.colors.grey[700],
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                            }}
                        >
                            {t('Common.LoginMNummEnt')}
                        </Typography>
                    </Stack>

                    <Box
                        sx={{
                            position: 'relative',
                            '& .radix-input-wrapper': {
                                borderRadius: '20px !important',
                                border: `2px solid ${formik.touched.phone && formik.errors.phone ? theme.colors.red[400] : theme.colors.grey[100]} !important`,
                                p: '6px 12px',
                                transition: 'all 0.3s ease',
                                '&:focus-within': {
                                    borderColor: `${theme.colors.primary[500]} !important`,
                                    boxShadow: `0 0 15px ${theme.colors.primary[100]}`,
                                },
                            },
                        }}
                    >
                        <RadixPhoneField
                            id="phone"
                            value={{
                                phone: formik.values.phone,
                                country_code: countryCode ?? '+91',
                                countryISOCode: countryISOCode ?? 'IN',
                            }}
                            onChange={(value) => {
                                formik.setFieldValue('phone', value?.phone ?? '');
                                onPhoneChange?.(value);
                            }}
                            placeholder="Enter Device Phone Number"
                        />
                    </Box>

                    {formik.touched.phone && formik.errors.phone && (
                        <Fade in={true}>
                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ ml: 1 }}>
                                <ErrorOutlineRounded sx={{ fontSize: '14px', color: theme.colors.red[500] }} />
                                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: theme.colors.red[500] }}>
                                    {formik.errors.phone}
                                </Typography>
                            </Stack>
                        </Fade>
                    )}
                </Stack>

                {/* RECOVERY BUTTON */}
                <Button
                    loading={isPending}
                    variant="contained"
                    onClick={formik.handleSubmit}
                    sx={{
                        py: 2.2,
                        width: '100%',
                        borderRadius: '24px',
                        fontSize: '17px',
                        fontWeight: 900,
                        textTransform: 'none',
                        color: 'white',
                        backgroundColor: theme.colors.grey[950],
                        boxShadow: '0 15px 30px -10px rgba(0,0,0,0.3)',
                        '&:hover': {
                            backgroundColor: theme.colors.grey[800],
                            transform: 'translateY(-2px)',
                        },
                        '&:disabled': { backgroundColor: theme.colors.grey[100] },
                    }}
                >
                    {t('Common.LogNext')}
                </Button>
            </Stack>

            <Typography
                sx={{ mt: 4, textAlign: 'center', fontSize: '12px', color: theme.colors.grey[400], fontWeight: 600 }}
            >
                Verification code will be sent to this number
            </Typography>
        </Box>
    );
};

export default ResNumberInForm;
