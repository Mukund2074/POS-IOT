import { Visibility, VisibilityOff, LockOpenRounded, ArrowBackIosNewRounded } from '@mui/icons-material';
import { Box, Button, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { resetPasswordApi } from '../../utils/Api/Authantication';
import { HttpStatusCode } from 'axios';
import theme from '../../ui/theme'; // Using your design tokens
import { ShieldCheck } from 'lucide-react';

const ConfirmPass = ({ handleResBack, handleResetPass, token }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isPending, setIspending] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validationSchema = Yup.object({
        password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
        confirm_password: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Confirm password is required'),
    });

    const formik = useFormik({
        initialValues: { password: '', confirm_password: '' },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setIspending(true);
                const response = await resetPasswordApi({ token, password: values.password });
                if (response.status === HttpStatusCode.Ok) {
                    toast.success('Security Updated');
                    handleResetPass();
                }
            } catch (error) {
                toast.error('Update Failed');
            } finally {
                setIspending(false);
            }
        },
    });

    return (
        <Box
            component={'form'}
            noValidate
            sx={{
                width: '100%',
                maxWidth: '520px',
                bgcolor: '#FFFFFF',
                borderRadius: '44px',
                p: { xs: 4, md: 6 },
                boxShadow: '0px 40px 80px -20px rgba(0, 0, 0, 0.12)',
                border: `1px solid ${theme.colors.grey[100]}`,
                display: 'flex',
                flexDirection: 'column',
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
                <IconButton onClick={handleResBack} sx={{ bgcolor: theme.colors.grey[50], mr: 2, p: 1.5 }}>
                    <ArrowBackIosNewRounded sx={{ fontSize: '18px' }} />
                </IconButton>
                <Typography
                    sx={{ fontSize: '27px', fontWeight: 800, color: theme.colors.grey[900], letterSpacing: '-1.5px' }}
                >
                    Create new password
                </Typography>
            </Stack>

            <Stack spacing={4} sx={{ width: '100%' }}>
                {/* DESCRIPTION BOX */}
                <Box sx={{ bgcolor: theme.colors.primary[50], p: 2, borderRadius: '20px', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: theme.colors.primary[700] }}>
                        Your new password must be different from previously used passwords
                    </Typography>
                </Box>

                {/* PASSWORD FIELD */}
                <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: 1 }}>
                        <LockOpenRounded sx={{ fontSize: '18px', color: theme.colors.primary[500] }} />
                        <Typography
                            sx={{
                                fontSize: '13px',
                                fontWeight: 800,
                                color: theme.colors.grey[700],
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                            }}
                        >
                            New password
                        </Typography>
                    </Stack>
                    <TextField
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        placeholder="••••••••"
                        value={formik.values.password.replace(/\s/g, '')}
                        onChange={formik.handleChange}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '20px',
                                bgcolor: theme.colors.grey[50],
                                '& fieldset': { borderColor: theme.colors.grey[100], borderWidth: '2px' },
                                '&.Mui-focused fieldset': { borderColor: theme.colors.primary[500] },
                            },
                        }}
                    />
                </Stack>

                {/* CONFIRM PASSWORD FIELD */}
                <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: 1 }}>
                        <ShieldCheck sx={{ fontSize: '18px', color: theme.colors.primary[500] }} />
                        <Typography
                            sx={{
                                fontSize: '13px',
                                fontWeight: 800,
                                color: theme.colors.grey[700],
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                            }}
                        >
                            Confirm password
                        </Typography>
                    </Stack>
                    <TextField
                        id="confirm_password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        variant="outlined"
                        placeholder="••••••••"
                        value={formik.values.confirm_password.replace(/\s/g, '')}
                        onChange={formik.handleChange}
                        error={formik.touched.confirm_password && Boolean(formik.errors.confirm_password)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                                        {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '20px',
                                bgcolor: theme.colors.grey[50],
                                '& fieldset': { borderColor: theme.colors.grey[100], borderWidth: '2px' },
                                '&.Mui-focused fieldset': { borderColor: theme.colors.primary[500] },
                            },
                        }}
                    />
                    {formik.touched.confirm_password && formik.errors.confirm_password && (
                        <Typography variant="caption" color="error" sx={{ ml: 1, fontWeight: 700 }}>
                            {formik.errors.confirm_password}
                        </Typography>
                    )}
                </Stack>

                {/* SUBMIT BUTTON */}
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
                        bgcolor: theme.colors.grey[950],
                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
                        '&:hover': { bgcolor: theme.colors.grey[800], transform: 'translateY(-2px)' },
                    }}
                >
                    Confirm
                </Button>
            </Stack>
        </Box>
    );
};

export default ConfirmPass;
