'use client';

import { useState, useRef, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Typography, Button, IconButton, Paper, Stack } from '@mui/material';
import FTextInput from '../../components/commonComponents/F_TextInput';
import backButton from '../../assets/less.png';
import { Clock } from 'lucide-react';
import resmImage from '../../assets/resm.png';
import axios from 'axios';
import { toast } from 'react-toastify';
import { t } from 'i18next';
import { formatPhoneNumber } from '../../components/calanderComponents/booking/utils/functions';

const validationSchema = Yup.object().shape({
    code: Yup.array()
        .of(
            Yup.string()
                .matches(/^[0-9]$/, 'Must be a number')
                .required('Required'),
        )
        .length(4, 'Must be exactly 4 digits'),
});

export default function VerificationCode({
    handleResBack,
    handleResetPass,
    country_code,
    phone_number,
    setResPassToken,
    OTPSending,
}) {
    const [timeLeft, setTimeLeft] = useState(90);
    const [isResendActive, setIsResendActive] = useState(false);
    const inputs = useRef([]);
    const [isPending, setIspending] = useState(false);

    const formik = useFormik({
        initialValues: {
            code: ['', '', '', ''],
        },
        validationSchema,
        onSubmit: async (values) => {
            setIspending(true);
            let cod = '';
            formik.values.code.map((m) => (cod += m));

            const response = await axios.post(`${process.env.REACT_APP_URL}/api/v1/store/auth/verifyOTP`, {
                country_code: country_code ?? '+45',
                phone_number: phone_number,
                otp: cod,
            });

            const { success } = response.data;
            if (success) {
                setIspending(false);
                setResPassToken(response.data.data.token);
                toast.success('OTP verified successfully');
                handleResetPass();
            } else {
                setIspending(false);
                toast.error('Invalid OTP');
            }
        },
    });

    useEffect(() => {
        let timer;
        if (timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else {
            setIsResendActive(true);
        }

        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleInput = (index, value) => {
        if (value.length > 1) return;

        const newCode = [...formik.values.code];
        newCode[index] = value;
        formik.setFieldValue('code', newCode);

        if (value && index < 3) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !formik.values.code[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleResendCode = async () => {
        await OTPSending({ setter: setIspending, phoneNumber: phone_number });
        setTimeLeft(90);
        setIsResendActive(false);
        formik.resetForm();
    };

    return (
        <Paper
            component={'form'}
            noValidate
            sx={{
                width: '100%',
                maxWidth: '550px',
                minWidth: '320px',
                height: 'auto',
                borderRadius: '25px',
                display: 'flex',
                flexDirection: 'column',
                padding: '20px 30px',
                alignItems: 'center',
                bgcolor: '#fff',
            }}
        >
            <Stack sx={{ display: 'flex', justifyContent: 'center', width: '100%', position: 'relative' }}>
                <IconButton
                    aria-label="close"
                    disableRipple
                    sx={{
                        position: 'absolute',
                        left: 8,

                        color: '#6f6f6f',
                    }}
                    onClick={handleResBack}
                >
                    <img src={backButton} alt="Back" />
                </IconButton>

                <Typography
                    sx={{
                        fontSize: '25px',
                        fontWeight: '400',
                        color: '#6F6F6F',
                        textAlign: 'center',
                    }}
                >
                    {t('Common.ResOTPt')}
                </Typography>
            </Stack>

            <Stack
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mb: 2,
                }}
            >
                <IconButton
                    sx={{
                        width: 64,
                        height: 64,
                        bgcolor: 'grey.100',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        mt: 0.8,
                    }}
                >
                    <img src={resmImage} alt="logo" height={40} />
                </IconButton>
                <Typography variant="body1" sx={{ mb: 1, fontSize: 20, fontWeight: 'bold' }}>
                    {t('Common.ResSms')}
                </Typography>
                <Typography variant="body1" sx={{ textAlign: 'center', color: '#4B4B4B' }}>
                    {t('Common.ResOtpDes1')}
                    <br />
                    {t('Common.ResOtpDes2')}
                </Typography>
                <Typography variant="body1" sx={{ color: '#BBB0A4', font: 'DM Sans' }}>
                    +45 {formatPhoneNumber(phone_number)}
                </Typography>
            </Stack>

            <Stack
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 2,
                    p: 1,
                }}
            >
                {formik.values.code.map((digit, index) => (
                    <FTextInput
                        key={index}
                        inputRef={(el) => (inputs.current[index] = el)}
                        value={digit}
                        onChange={(e) => handleInput(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        inputProps={{
                            maxLength: 1,
                            pattern: '[0-9]*',

                            inputMode: 'numeric',
                            style: { textAlign: 'center', fontSize: '1.2rem', border: 'none' },
                        }}
                        sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none',
                                zIndex: 0,
                            },

                            width: { xs: '40px', md: '55px' },
                            // height: { xs: "40px", md: "55px" },
                            fontSize: { xs: '18px', md: '22px' },
                            border: '1px solid #A79C92',
                            borderRadius: '13px',
                            boxShadow: '0px 4px 4px 0px #00000040',
                        }}
                        error={formik.errors.code && formik.touched.code}
                    />
                ))}
            </Stack>

            {formik.errors.code && formik.touched.code && (
                <Typography color="error" variant="caption" sx={{ display: 'block', textAlign: 'center', mb: 2 }}>
                    {Array.isArray(formik.errors.code) ? formik.errors.code[0] : formik.errors.code}
                </Typography>
            )}

            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: 3, marginTop: 2 }}>
                {isResendActive ? (
                    <Button
                        onClick={handleResendCode}
                        sx={{ color: '#BBB0A4', fontWeight: 500, width: { xs: '100%', md: 'auto' } }}
                        disableRipple
                        TouchRippleProps={{ disabled: true }} // Ensures ripple is disabled
                    >
                        Resend Now
                    </Button>
                ) : (
                    <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <IconButton disableRipple>
                            <Clock size={17} color="#A79C92" />
                        </IconButton>
                        <Typography variant="body2" sx={{ color: '#4B4B4B', fontSize: 17, mb: 0.1 }}>
                            {formatTime(timeLeft)}
                        </Typography>
                    </Stack>
                )}
            </Box>

            <Stack
                sx={{
                    width: '100%',
                    display: 'flex',
                    backgroundColor: '#fff',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Button
                    loading={isPending}
                    type="submit"
                    onClick={formik.handleSubmit}
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={!formik.isValid || !formik.dirty}
                    sx={{
                        width: '100%',
                        maxWidth: { xs: '100%', md: '210px' },
                        borderRadius: '25px',
                        height: '40px',
                        my: 'auto',
                        fontSize: '17px',
                        fontWeight: '400',
                        color: 'white',
                        backgroundColor: '#BBB0A4',
                        textTransform: 'capitalize',
                        '&:hover': { backgroundColor: '#9C968B' },
                    }}
                >
                    {t('Common.ResOTpSubBTN')}
                </Button>
            </Stack>
        </Paper>
    );
}
