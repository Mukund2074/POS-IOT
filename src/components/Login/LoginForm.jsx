import React, { useState } from 'react';
import { IconButton, Stack, Typography, Box } from '@mui/material';
import { Visibility, VisibilityOff, ArrowForwardRounded, SensorsRounded } from '@mui/icons-material';
import RadixPhoneField from '../radix/RadixPhoneField';
import RadixInput from '../radix/RadixInput';
import RadixButton from '../radix/RadixButton';
import theme from '../../ui/theme';

export default function LoginForm({
    handlePhoneChange,
    phone,
    countryCode,
    countryISOCode,
    password,
    setPassword,
    handleLogin,
    handleResetPass,
}) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Stack
            sx={{
                width: '100%',
                maxWidth: '480px',
                backgroundColor: '#FFFFFF',
                borderRadius: '48px', // Ultra-soft premium curves
                p: { xs: 4, md: 7 },
                position: 'relative',
                boxShadow: '0px 40px 80px -20px rgba(0, 0, 0, 0.08)',
                border: `1px solid ${theme.colors.grey[100]}`,
                overflow: 'hidden',
            }}
        >
            {/* BACKGROUND DECORATION - COOL BLUR */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -50,
                    left: -50,
                    width: 150,
                    height: 150,
                    background: theme.colors.primary[100],
                    filter: 'blur(60px)',
                    borderRadius: '50%',
                    opacity: 0.5,
                }}
            />

            {/* HIGH-IMPACT BRANDING SECTION */}
            <Stack spacing={0} sx={{ mb: 6, position: 'relative' }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                        sx={{
                            p: 1,
                            borderRadius: '14px',
                            backgroundColor: theme.colors.primary[50],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <SensorsRounded sx={{ color: theme.colors.primary[500], fontSize: '32px' }} />
                    </Box>
                    <Typography
                        sx={{
                            fontSize: '14px',
                            fontWeight: 800,
                            letterSpacing: '3px',
                            textTransform: 'uppercase',
                            color: theme.colors.primary[500],
                        }}
                    >
                        Connected System
                    </Typography>
                </Stack>

                <Typography
                    variant="h1"
                    sx={{
                        fontSize: '4.5rem', // MASSIVE TITLE
                        fontWeight: 900,
                        color: theme.colors.grey[950],
                        lineHeight: 0.9,
                        letterSpacing: '-4px',
                        fontFamily: theme.fonts.secondary,
                        mt: 2,
                        display: 'flex',
                        alignItems: 'baseline',
                    }}
                >
                    POS
                    <Box
                        component="span"
                        sx={{
                            color: theme.colors.primary[500],
                            fontSize: '2.5rem',
                            ml: 1,
                            letterSpacing: '-1px',
                            fontWeight: 700,
                        }}
                    >
                        IoT
                    </Box>
                </Typography>

                <Typography
                    sx={{
                        fontSize: '17px',
                        color: theme.colors.grey[500],
                        mt: 2,
                        fontWeight: 500,
                        lineHeight: 1.4,
                    }}
                >
                    Access your smart terminal dashboard.
                </Typography>
            </Stack>

            {/* FORM FIELDS */}
            <Stack spacing={4}>
                {/* Phone Input */}
                <Stack spacing={1.5}>
                    <Typography
                        sx={{
                            fontSize: '13px',
                            fontWeight: 700,
                            ml: 0.5,
                            color: theme.colors.grey[800],
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                        }}
                    >
                        Device Phone Number
                    </Typography>
                    <Box
                        sx={{
                            '& .radix-input-wrapper': {
                                borderRadius: '20px !important',
                                border: `2px solid ${theme.colors.grey[100]} !important`,
                                p: '4px',
                                transition: 'all 0.3s ease',
                                '&:focus-within': {
                                    borderColor: `${theme.colors.primary[400]} !important`,
                                    boxShadow: `0 0 20px ${theme.colors.primary[50]}`,
                                },
                            },
                        }}
                    >
                        <RadixPhoneField
                            value={{
                                country_code: countryCode,
                                phone: phone,
                                countryISOCode: countryISOCode,
                            }}
                            onChange={(value) => handlePhoneChange(value)}
                            placeholder="Enter Device Phone Number"
                        />
                    </Box>
                </Stack>

                {/* Password Input */}
                <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography
                            sx={{
                                fontSize: '13px',
                                fontWeight: 700,
                                ml: 0.5,
                                color: theme.colors.grey[800],
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                            }}
                        >
                            Access Key
                        </Typography>
                    </Stack>
                    <RadixInput
                        value={password.replace(/\s/g, '')}
                        onChange={(e) => setPassword(e.target.value.replace(/\s/g, ''))}
                        placeholder="••••••••"
                        type={showPassword ? 'text' : 'password'}
                        endComponent={
                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                        }
                    />
                </Stack>

                {/* PRIMARY ACTION */}
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <RadixButton
                        variant="primary"
                        onClick={handleLogin}
                        style={{
                            width: '100%',
                            height: '64px', // Taller button for "cool" factor
                            fontSize: '18px',
                            fontWeight: 800,
                            borderRadius: '22px',
                            backgroundColor: theme.colors.grey[950],
                            color: '#FFF',
                            boxShadow: '0 15px 30px -10px rgba(0,0,0,0.3)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer',
                        }}
                    >
                        Enter Dashboard <ArrowForwardRounded sx={{ fontSize: '20px' }} />
                    </RadixButton>

                    <Typography
                        onClick={handleResetPass}
                        sx={{
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: theme.colors.grey[500],
                            cursor: 'pointer',
                            '&:hover': { color: theme.colors.primary[500] },
                        }}
                    >
                        Forgotten Access Key?
                    </Typography>
                </Stack>
            </Stack>

            {/* BOTTOM BADGE */}
            <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 0.5,
                        borderRadius: '100px',
                        border: `1px solid ${theme.colors.grey[100]}`,
                        backgroundColor: theme.colors.grey[50],
                    }}
                >
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: theme.colors.secondary[500],
                            animation: 'pulse 2s infinite',
                        }}
                    />
                    <Typography sx={{ fontSize: '12px', fontWeight: 700, color: theme.colors.grey[600] }}>
                        SYSTEM ONLINE
                    </Typography>
                </Box>
            </Box>
        </Stack>
    );
}
