import { Avatar, Button, Stack, Typography, Box, Fade } from '@mui/material';
import { t } from 'i18next';
import React from 'react';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'; // Modern replacement for tickImg
import theme from '../../ui/theme';

export default function Departments({ locations, selectedLocation, handleSelectLocation, handleNext }) {
    return (
        <Stack
            sx={{
                width: '100%',
                maxWidth: '550px',
                bgcolor: '#FFFFFF',
                borderRadius: '40px',
                position: 'relative',
                overflow: 'hidden',
                p: { xs: 3, md: 5 },
                boxShadow: '0px 40px 80px -20px rgba(0, 0, 0, 0.1)',
                border: `1px solid ${theme.colors.grey[100]}`,
                maxHeight: '85vh',
            }}
        >
            {/* BRANDING CONSISTENCY */}
            <Stack direction="row" justifyContent="center" alignItems="baseline" sx={{ mb: 3 }}>
                <Typography
                    sx={{ fontSize: '3em', fontWeight: 900, color: theme.colors.grey[950], letterSpacing: '-1px' }}
                >
                    POS
                </Typography>
                <Typography sx={{ fontSize: '2em', fontWeight: 700, color: theme.colors.primary[500], ml: 0.5 }}>
                    IoT
                </Typography>
            </Stack>

            {/* TITLE */}
            <Typography
                sx={{
                    textAlign: 'center',
                    color: theme.colors.grey[900],
                    fontSize: '27px',
                    letterSpacing: '-1px',
                    mb: 4,
                }}
            >
                {t('Common.LogChooseDepartment')}
            </Typography>

            {/* SELECTION LIST */}
            <Stack
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    px: 1,
                    gap: 2,
                    pb: 10, // Space for the fixed button
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                }}
            >
                {locations.map((location, index) => {
                    const isSelected = selectedLocation === index;
                    const isActive = location.is_active;

                    return (
                        <Stack
                            key={index}
                            onClick={() => isActive && handleSelectLocation(index)}
                            direction="row"
                            alignItems="center"
                            spacing={2}
                            sx={{
                                p: 2.5,
                                borderRadius: '24px',
                                cursor: isActive ? 'pointer' : 'not-allowed',
                                border: '2px solid',
                                borderColor: isSelected ? theme.colors.primary[500] : theme.colors.grey[100],
                                bgcolor: isSelected
                                    ? theme.colors.primary[50]
                                    : isActive
                                      ? '#FFFFFF'
                                      : theme.colors.grey[50],
                                opacity: isActive ? 1 : 0.6,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                boxShadow: isSelected ? `0px 10px 25px ${theme.colors.primary[100]}` : 'none',
                                '&:hover': {
                                    borderColor: isActive ? theme.colors.primary[300] : theme.colors.grey[100],
                                    bgcolor: isActive && !isSelected ? theme.colors.grey[50] : undefined,
                                },
                            }}
                        >
                            <Avatar
                                src={location.image}
                                sx={{
                                    width: 52,
                                    height: 52,
                                    border: `2px solid ${isSelected ? theme.colors.primary[200] : 'transparent'}`,
                                }}
                            />

                            <Stack sx={{ flex: 1 }}>
                                <Typography sx={{ fontSize: '1.1rem', color: theme.colors.grey[900], fontWeight: 700 }}>
                                    {location.name}
                                </Typography>
                                <Typography
                                    sx={{ fontSize: '0.85rem', color: theme.colors.grey[500], fontWeight: 500 }}
                                >
                                    {location.email}
                                </Typography>
                            </Stack>

                            {isSelected && (
                                <Fade in={isSelected}>
                                    <CheckCircleRoundedIcon
                                        sx={{ color: theme.colors.primary[500], fontSize: '28px' }}
                                    />
                                </Fade>
                            )}
                        </Stack>
                    );
                })}
            </Stack>

            {/* FIXED NEXT ACTION */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 3,
                    background: 'linear-gradient(to top, #FFFFFF 70%, rgba(255,255,255,0) 100%)',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <Button
                    variant="contained"
                    disabled={selectedLocation === null}
                    onClick={handleNext}
                    sx={{
                        py: 2,
                        px: 8,
                        fontSize: '16px',
                        fontWeight: 800,
                        textTransform: 'none',
                        borderRadius: '20px',
                        bgcolor: theme.colors.grey[950],
                        color: '#FFFFFF',
                        width: { xs: '100%', md: 'auto' },
                        minWidth: '200px',
                        boxShadow: selectedLocation !== null ? '0px 15px 30px rgba(0,0,0,0.2)' : 'none',
                        '&:hover': {
                            bgcolor: theme.colors.grey[800],
                        },
                        '&.Mui-disabled': {
                            bgcolor: theme.colors.grey[100],
                            color: theme.colors.grey[400],
                        },
                    }}
                >
                    {t('Common.LogNext')}
                </Button>
            </Box>
        </Stack>
    );
}
