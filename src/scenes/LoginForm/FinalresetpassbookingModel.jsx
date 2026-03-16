import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import React from 'react';
import finalr from '../../assets/finalr.png';
import { t } from 'i18next';

const FinalresetpassbookingModel = ({ handleResBack, backButton, onSubmit }) => {
    return (
        <Box
            noValidate
            component={'form'}
            sx={{
                width: '90%', // Makes it responsive
                maxWidth: '500px', // Limits max width for larger screens
                minWidth: '320px', // Ensures it doesn't shrink too much
                maxHeight: '80%',
                backgroundColor: 'white',
                borderRadius: '25px',
                display: 'flex',
                flexDirection: 'column',
                padding: '20px 30px',
                paddingBottom: '0px',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // Adds subtle shadow
                alignItems: 'center', // Centers content
            }}
        >
            <Stack
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                    position: 'relative',
                }}
            >
                <IconButton
                    aria-label="close"
                    disableRipple
                    sx={{
                        position: 'absolute',
                        left: { xs: 2, md: 8 },

                        color: '#6f6f6f',
                    }}
                    onClick={handleResBack}
                >
                    <img src={backButton} alt="Back" />
                </IconButton>

                <Typography
                    variant="body1"
                    sx={{
                        fontSize: '25px',
                        fontWeight: '400',
                        color: '#6F6F6F',
                        textAlign: 'center',
                    }}
                >
                    {t('Common.SuccessResspass')}
                </Typography>
            </Stack>
            <Typography variant="body2" color="#4B4B4B" mt={2}>
                {' '}
                {t('Common.SuccessrespassDesc')}
            </Typography>

            <Stack
                sx={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexDirection: 'column',
                    p: 2,
                    gap: 2,
                }}
            >
                <IconButton
                    sx={{
                        width: 135,
                        height: 135,
                        bgcolor: 'grey.100',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <img src={finalr} alt="logo" height={100} />
                </IconButton>

                {/* Login Button */}
                <Button
                    type="submit"
                    onClick={onSubmit}
                    sx={{
                        width: '100%',
                        maxWidth: '200px',
                        borderRadius: 12,
                        height: 40,

                        fontSize: '17px',
                        fontWeight: '400',
                        color: 'white',
                        backgroundColor: '#BBB0A4',
                        textTransform: 'capitalize',
                        '&:hover': { backgroundColor: '#9C968B' },
                    }}
                >
                    {t('Common.SuccessresPasBTn')}
                </Button>
            </Stack>
        </Box>
    );
};

export default FinalresetpassbookingModel;
