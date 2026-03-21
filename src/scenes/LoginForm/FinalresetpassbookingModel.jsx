import { Box, Button, IconButton, Stack, Typography, Zoom } from '@mui/material';
import React from 'react';
import finalr from '../../assets/finalr.png';
import theme from '../../ui/theme'; // Using your design tokens
import { CheckCircleRounded, ArrowForwardRounded } from '@mui/icons-material';

const FinalresetpassbookingModel = ({ handleResBack, onSubmit }) => {
    return (
        <Box
            noValidate
            component={'form'}
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
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* OPTIONAL: LIGHT BACKGROUND ACCENT */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -100,
                    width: 300,
                    height: 300,
                    background: `radial-gradient(circle, ${theme.colors.secondary[50]} 0%, transparent 70%)`,
                    zIndex: 0,
                }}
            />

            {/* BRANDING HEADER */}
            <Stack direction="row" alignItems="baseline" sx={{ mb: 4, zIndex: 1 }}>
                <Typography
                    sx={{ fontSize: '3em', fontWeight: 900, color: theme.colors.grey[950], letterSpacing: '-1px' }}
                >
                    POS
                </Typography>
                <Typography sx={{ fontSize: '2em', fontWeight: 700, color: theme.colors.primary[500], ml: 0.5 }}>
                    IoT
                </Typography>
            </Stack>

            {/* SUCCESS ICON WITH HALO */}
            <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                <Box
                    sx={{
                        position: 'relative',
                        mb: 5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            width: 180,
                            height: 180,
                            bgcolor: theme.colors.secondary[50],
                            borderRadius: '50%',
                            zIndex: 0,
                            animation: 'pulse 3s infinite ease-in-out',
                        }}
                    />
                    <IconButton
                        sx={{
                            width: 140,
                            height: 140,
                            bgcolor: '#FFFFFF',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                            borderRadius: '50%',
                            zIndex: 1,
                            '&:hover': { bgcolor: '#FFFFFF' },
                        }}
                    >
                        <img src={finalr} alt="Success" height={80} />
                    </IconButton>
                    <CheckCircleRounded
                        sx={{
                            position: 'absolute',
                            bottom: 5,
                            right: 15,
                            fontSize: 45,
                            color: theme.colors.secondary[500],
                            bgcolor: '#FFF',
                            borderRadius: '50%',
                            zIndex: 2,
                        }}
                    />
                </Box>
            </Zoom>

            {/* TEXT CONTENT */}
            <Stack spacing={1.5} sx={{ zIndex: 1, mb: 6 }}>
                <Typography
                    sx={{
                        fontSize: '32px',
                        fontWeight: 900,
                        color: theme.colors.grey[950],
                        letterSpacing: '-1.5px',
                        lineHeight: 1,
                    }}
                >
                    Password reset successful
                </Typography>
                <Typography
                    sx={{
                        fontSize: '16px',
                        color: theme.colors.grey[500],
                        fontWeight: 500,
                        px: 2,
                    }}
                >
                    Your password has been reset successfully
                </Typography>
            </Stack>

            {/* FINAL ACTION BUTTON */}
            <Button
                variant="contained"
                onClick={onSubmit}
                endIcon={<ArrowForwardRounded />}
                sx={{
                    width: '100%',
                    py: 2.2,
                    borderRadius: '24px',
                    fontSize: '18px',
                    fontWeight: 900,
                    textTransform: 'none',
                    bgcolor: theme.colors.grey[950], // High-contrast black
                    color: '#FFFFFF',
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
                    zIndex: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        bgcolor: theme.colors.grey[800],
                        transform: 'translateY(-2px)',
                    },
                }}
            >
                Continue to login
            </Button>

            {/* KEYFRAME ANIMATION (Add this to your global CSS or a styled component) */}
            <style>
                {`
                @keyframes pulse {
                    0% { transform: scale(0.95); opacity: 0.5; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                    100% { transform: scale(0.95); opacity: 0.5; }
                }
                `}
            </style>
        </Box>
    );
};

export default FinalresetpassbookingModel;
