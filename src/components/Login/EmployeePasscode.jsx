import { CircularProgress, Stack, TextField, Typography, Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { t } from 'i18next';
import React from 'react';
import theme from '../../ui/theme'; // Using your design system

export default function EmployeePasscode({
    isLoading,
    selectedEmployee,
    employees,
    passcode,
    handlePasscodeChange,
    handleBackspace,
    handleNext,
}) {
    const isComplete = passcode.join('').length === 6;

    return (
        <Stack
            sx={{
                width: '100%',
                maxWidth: '500px',
                bgcolor: theme.colors.background.paper,
                borderRadius: '40px',
                position: 'relative',
                overflow: 'hidden',
                p: { xs: 4, md: 6 },
                boxShadow: '0px 40px 80px -20px rgba(0, 0, 0, 0.12)',
                border: `1px solid ${theme.colors.grey[100]}`,
                alignItems: 'center',
            }}
        >
            {/* BRAND HEADER - CONSISTENCY IS COOL */}
            <Stack direction="row" alignItems="baseline" sx={{ mb: 4, opacity: 0.8 }}>
                <Typography
                    sx={{ fontSize: '1.5rem', fontWeight: 900, color: theme.colors.grey[950], letterSpacing: '-1px' }}
                >
                    POS
                </Typography>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: theme.colors.primary[500], ml: 0.5 }}>
                    IoT
                </Typography>
            </Stack>

            {/* MAIN TITLE */}
            <Typography
                sx={{
                    textAlign: 'center',
                    color: theme.colors.grey[900],
                    fontWeight: 800,
                    fontSize: '32px',
                    letterSpacing: '-1px',
                    mb: 1,
                }}
            >
                {t('Common.OtpT')}
            </Typography>

            {selectedEmployee !== null && (
                <Box
                    sx={{
                        bgcolor: theme.colors.primary[50],
                        px: 2,
                        py: 0.5,
                        borderRadius: '12px',
                        mb: 4,
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: theme.colors.primary[700],
                            textAlign: 'center',
                        }}
                    >
                        {t('Common.OTPD')} {employees[selectedEmployee].name}
                    </Typography>
                </Box>
            )}

            {/* PASSCODE INPUTS - THE "VAULT" LOOK */}
            <Stack direction="row" justifyContent="center" spacing={1.5} sx={{ width: '100%', mb: 6 }}>
                {passcode.map((digit, index) => (
                    <TextField
                        key={index}
                        id={`passcode-${index}`}
                        autoComplete="off"
                        inputProps={{
                            maxLength: 1,
                            pattern: '[0-9]*',
                            inputMode: 'numeric',
                            style: {
                                textAlign: 'center',
                                fontWeight: 800,
                                fontSize: '24px',
                                color: theme.colors.grey[900],
                            },
                        }}
                        value={digit}
                        onChange={(e) => handlePasscodeChange(e, index)}
                        onKeyDown={(e) => handleBackspace(e, index)}
                        sx={{
                            width: { xs: '45px', md: '60px' },
                            '& .MuiOutlinedInput-root': {
                                height: { xs: '55px', md: '75px' },
                                borderRadius: '18px',
                                backgroundColor: digit ? theme.colors.primary[50] : theme.colors.grey[50],
                                border: `2px solid ${digit ? theme.colors.primary[400] : theme.colors.grey[200]}`,
                                transition: 'all 0.2s ease',
                                '& fieldset': { border: 'none' },
                                '&:hover': {
                                    backgroundColor: theme.colors.grey[100],
                                },
                                '&.Mui-focused': {
                                    backgroundColor: '#FFFFFF',
                                    boxShadow: `0px 10px 20px ${theme.colors.primary[100]}`,
                                    borderColor: theme.colors.primary[500],
                                },
                            },
                        }}
                    />
                ))}
            </Stack>

            {/* ACTION BUTTON */}
            <LoadingButton
                loading={isLoading}
                onClick={handleNext}
                disabled={!isComplete || isLoading}
                loadingIndicator={<CircularProgress size={24} sx={{ color: '#fff' }} />}
                sx={{
                    py: 2,
                    width: '100%',
                    fontSize: '18px',
                    fontWeight: 800,
                    textTransform: 'none',
                    borderRadius: '20px',
                    bgcolor: theme.colors.grey[950],
                    color: '#FFFFFF',
                    boxShadow: isComplete ? '0px 20px 40px rgba(0,0,0,0.2)' : 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        bgcolor: theme.colors.grey[800],
                        transform: 'translateY(-2px)',
                    },
                    '&.Mui-disabled': {
                        bgcolor: theme.colors.grey[100],
                        color: theme.colors.grey[400],
                    },
                }}
            >
                {t('Common.LogNext')}
            </LoadingButton>

            {/* DECORATIVE FOOTER */}
            <Typography
                sx={{
                    mt: 4,
                    fontSize: '12px',
                    fontWeight: 600,
                    color: theme.colors.grey[400],
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                }}
            >
                Secure Terminal Access
            </Typography>
        </Stack>
    );
}
