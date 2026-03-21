import { Avatar, Button, Stack, Typography, Box, Fade } from '@mui/material';
import { t } from 'i18next';
import React from 'react';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import theme from '../../ui/theme'; // Using your design tokens

export default function SelectEmployee({ selectedEmployee, employees, handleSelectEmployee, handleNext }) {
    return (
        <Stack
            sx={{
                width: '100%',
                maxWidth: '520px',
                bgcolor: '#FFFFFF',
                borderRadius: '40px',
                position: 'relative',
                overflow: 'hidden',
                p: { xs: 3, md: 6 },
                boxShadow: '0px 40px 80px -20px rgba(0, 0, 0, 0.1)',
                border: `1px solid ${theme.colors.grey[100]}`,
                maxHeight: '85vh',
            }}
        >
            {/* BRAND HEADER */}
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

            {/* MAIN TITLE */}
            <Typography
                sx={{
                    textAlign: 'center',
                    color: theme.colors.grey[900],
                    fontSize: '27px',
                    letterSpacing: '-1.5px',
                    mb: 4,
                    lineHeight: 1,
                }}
            >
                {t('Common.ChooseEmp')}
            </Typography>

            {/* EMPLOYEE LIST AREA */}
            <Stack
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    px: 1,
                    gap: 1.5,
                    pb: 12, // Space for the floating button
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                }}
            >
                {employees.map((employee, index) => {
                    const isSelected = selectedEmployee === index;

                    return (
                        <Stack
                            key={index}
                            onClick={() => handleSelectEmployee(index)}
                            direction="row"
                            alignItems="center"
                            spacing={2}
                            sx={{
                                p: 2,
                                borderRadius: '22px',
                                cursor: 'pointer',
                                border: '2.5px solid',
                                borderColor: isSelected ? theme.colors.primary[500] : theme.colors.grey[50],
                                bgcolor: isSelected ? theme.colors.primary[50] : '#FFFFFF',
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                                boxShadow: isSelected
                                    ? `0px 12px 24px ${theme.colors.primary[100]}`
                                    : '0px 2px 4px rgba(0,0,0,0.02)',
                                '&:hover': {
                                    borderColor: isSelected ? theme.colors.primary[500] : theme.colors.primary[200],
                                    bgcolor: isSelected ? theme.colors.primary[50] : theme.colors.grey[50],
                                },
                            }}
                        >
                            <Avatar
                                src={employee?.image}
                                sx={{
                                    width: 56,
                                    height: 56,
                                    boxShadow: isSelected ? '0 0 0 3px #FFFFFF' : 'none',
                                    border: `1px solid ${theme.colors.grey[100]}`,
                                }}
                            />

                            <Typography
                                sx={{
                                    flex: 1,
                                    fontSize: '1.15rem',
                                    color: isSelected ? theme.colors.grey[950] : theme.colors.grey[800],
                                    fontWeight: isSelected ? 800 : 600,
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {employee.name}
                            </Typography>

                            {isSelected && (
                                <Fade in={isSelected}>
                                    <CheckCircleRoundedIcon
                                        sx={{ color: theme.colors.primary[500], fontSize: '30px' }}
                                    />
                                </Fade>
                            )}
                        </Stack>
                    );
                })}
            </Stack>

            {/* BOTTOM ACTION BUTTON */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 4,
                    background: 'linear-gradient(to top, #FFFFFF 80%, rgba(255,255,255,0) 100%)',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <Button
                    variant="contained"
                    disabled={selectedEmployee === null}
                    onClick={handleNext}
                    sx={{
                        py: 2.2,
                        px: 6,
                        fontSize: '17px',
                        fontWeight: 900,
                        textTransform: 'none',
                        borderRadius: '24px',
                        bgcolor: theme.colors.grey[950],
                        color: '#FFFFFF',
                        width: '100%',
                        boxShadow: selectedEmployee !== null ? '0px 20px 40px rgba(0,0,0,0.25)' : 'none',
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
                </Button>
            </Box>
        </Stack>
    );
}
