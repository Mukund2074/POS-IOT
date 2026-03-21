'use client';

import { useState, useRef, useEffect } from 'react';
import { useFormik } from 'formik';
import { Box, Typography, Button, IconButton, Stack } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import theme from '../../ui/theme'; // Using your design tokens
import { ArrowBackIosNewRounded } from '@mui/icons-material';
import { Clock, RefreshCw, ShieldCheck } from 'lucide-react';

const formatPhoneNumber = (n) => (n ? String(n).replace(/(\d{2})(?=\d)/g, '$1 ') : '');

export default function VerificationCode({
    handleResBack,
    handleResetPass,
    country_code,
    phoneNumber,
    setResPassToken,
}) {
    const [timeLeft, setTimeLeft] = useState(90);
    const [isResendActive, setIsResendActive] = useState(false);
    const inputs = useRef([]);
    const [isPending, setIspending] = useState(false);

    const formik = useFormik({
        initialValues: { code: ['', '', '', ''] },
        onSubmit: async (values) => {
            setIspending(true);
            const otpString = values.code.join('');

            try {
                const response = await axios.post(`${process.env.REACT_APP_URL}/api/v1/store/auth/verifyOTP`, {
                    country_code: country_code ?? '+91',
                    phone_number: phoneNumber,
                    otp: otpString,
                });

                if (response.data.success) {
                    setResPassToken(response.data.data.token);
                    toast.success('Access Granted');
                    handleResetPass();
                } else {
                    toast.error('Invalid Security Code');
                    handleResBack();
                }
            } catch (error) {
                toast.error('Invalid Security Code');
            } finally {
                setIspending(false);
            }
        },
    });

    useEffect(() => {
        let timer;
        if (timeLeft > 0) {
            timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        } else {
            setIsResendActive(true);
        }
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleInput = (index, value) => {
        const val = value.replace(/[^0-9]/g, '');
        if (!val) return;
        const newCode = [...formik.values.code];
        newCode[index] = val.slice(-1);
        formik.setFieldValue('code', newCode);
        if (index < 3) inputs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            const newCode = [...formik.values.code];
            if (!newCode[index] && index > 0) {
                inputs.current[index - 1]?.focus();
            }
            newCode[index] = '';
            formik.setFieldValue('code', newCode);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Stack
            sx={{
                width: '100%',
                maxWidth: '520px',
                bgcolor: '#FFFFFF',
                borderRadius: '44px',
                p: { xs: 4, md: 6 },
                boxShadow: '0px 40px 80px -20px rgba(0, 0, 0, 0.12)',
                border: `1px solid ${theme.colors.grey[100]}`,
                position: 'relative',
                alignItems: 'center',
            }}
        >
            {/* BRANDING HEADER */}
            <Stack direction="row" alignItems="baseline" sx={{ mb: 2 }}>
                <Typography
                    sx={{ fontSize: '3em', fontWeight: 900, color: theme.colors.grey[950], letterSpacing: '-1px' }}
                >
                    POS
                </Typography>
                <Typography sx={{ fontSize: '2em', fontWeight: 700, color: theme.colors.primary[500], ml: 0.5 }}>
                    IoT
                </Typography>
            </Stack>

            {/* HEADER WITH BACK */}
            <Stack direction="row" alignItems="center" sx={{ width: '100%', mb: 4 }}>
                <IconButton onClick={handleResBack} sx={{ bgcolor: theme.colors.grey[50], mr: 2 }}>
                    <ArrowBackIosNewRounded size={18} />
                </IconButton>
                <Typography
                    sx={{ fontSize: '27px', fontWeight: 800, color: theme.colors.grey[900], letterSpacing: '-1.5px' }}
                >
                    Verify yourself
                </Typography>
            </Stack>

            {/* VERIFICATION ICON & TEXT */}
            <Stack alignItems="center" spacing={1} sx={{ mb: 5 }}>
                <Box
                    sx={{
                        p: 2,
                        borderRadius: '24px',
                        bgcolor: theme.colors.primary[50],
                        color: theme.colors.primary[500],
                        mb: 1,
                    }}
                >
                    <ShieldCheck size={40} strokeWidth={2.5} />
                </Box>
                <Typography sx={{ fontSize: '18px', fontWeight: 700, color: theme.colors.grey[800] }}>
                    SMS sent
                </Typography>
                <Typography sx={{ textAlign: 'center', color: theme.colors.grey[500], fontSize: '14px', px: 2 }}>
                    We sent a 4-digit code to
                    <Box
                        component="span"
                        sx={{ display: 'block', color: theme.colors.grey[950], fontWeight: 800, mt: 0.5 }}
                    >
                        {country_code} {formatPhoneNumber(phoneNumber)}
                    </Box>
                </Typography>
            </Stack>

            {/* OTP INPUTS */}
            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                {formik.values.code.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputs.current[index] = el)}
                        value={digit}
                        onChange={(e) => handleInput(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        maxLength={1}
                        inputMode="numeric"
                        style={{
                            width: '65px',
                            height: '75px',
                            fontSize: '28px',
                            fontWeight: '900',
                            textAlign: 'center',
                            border: `2.5px solid ${digit ? theme.colors.primary[400] : theme.colors.grey[100]}`,
                            borderRadius: '20px',
                            backgroundColor: digit ? theme.colors.primary[50] : theme.colors.grey[50],
                            outline: 'none',
                            transition: 'all 0.2s ease',
                            boxShadow: digit ? `0px 10px 20px ${theme.colors.primary[100]}` : 'none',
                        }}
                    />
                ))}
            </Stack>

            {/* TIMER / RESEND */}
            <Box sx={{ mb: 6 }}>
                {isResendActive ? (
                    <Button
                        onClick={() => {
                            setTimeLeft(90);
                            setIsResendActive(false);
                        }}
                        startIcon={<RefreshCw size={16} />}
                        sx={{ color: theme.colors.primary[500], fontWeight: 800, textTransform: 'none' }}
                    >
                        Resend Code
                    </Button>
                ) : (
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ bgcolor: theme.colors.grey[50], px: 2, py: 0.5, borderRadius: '100px' }}
                    >
                        <Clock size={14} color={theme.colors.grey[400]} />
                        <Typography sx={{ fontSize: '14px', fontWeight: 700, color: theme.colors.grey[600] }}>
                            {formatTime(timeLeft)}
                        </Typography>
                    </Stack>
                )}
            </Box>

            {/* SUBMIT ACTION */}
            <Button
                loading={isPending}
                onClick={formik.handleSubmit}
                variant="contained"
                disabled={formik.values.code.join('').length < 4}
                sx={{
                    width: '100%',
                    py: 2.2,
                    borderRadius: '24px',
                    fontSize: '17px',
                    fontWeight: 900,
                    textTransform: 'none',
                    bgcolor: theme.colors.grey[950],
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
                    '&:hover': { bgcolor: theme.colors.grey[800] },
                }}
            >
                Confirm
            </Button>
        </Stack>
    );
}
