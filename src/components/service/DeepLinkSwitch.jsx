import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import FSwitch from '../commonComponents/f-switch';
import { CheckCircle, CopyAll } from '@mui/icons-material';
import { Grid, Stack, Typography } from '@mui/material';

import { t } from 'i18next';
import CustomTextField from '../settings/commonTextinput';
import { IconButton, CircularProgress } from '@mui/material';

export const DeepLinkSwitch = ({ idtype, selectid,formik,checked}) => {



    const [copyStatus, setCopyStatus] = useState('initial');
    const settings = useSelector((state) => state.settings.data);







    const handleCopy = async () => {
        setCopyStatus('started');
        setTimeout(async () => {
            try {
                await navigator.clipboard.writeText(
                    `${process.env.REACT_APP_MARKETPLACE_URL ?? 'https://bahlou.dk/'}klinik/${settings?.profile?.web_store_name}?${idtype}=${selectid}`,
                );
                setCopyStatus('success');
            } catch (error) {
                setCopyStatus('failed');
            }
            setTimeout(() => {
                setCopyStatus('initial');
            }, 2000);
        }, 1000);
    };

    return (
        <React.Fragment>
            <Grid
                sx={{
                    width: { xl: '73%', lg: '85%', md: '70%', sm: '100%', xs: '100%' },
                }}
            >
                <FSwitch
                    sx={{ mt: 2 }}
                    label={
                        <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                            {' '}
                            {t('Services.marketHide')}
                        </Typography>
                    }
                    checked={formik.values.marketplace_hidden}
                    onChange={(e) => {
                        formik.setFieldValue('marketplace_hidden', !formik.values.marketplace_hidden);
                    }}
                />

                {selectid !== 0 && (
                    <Stack position={'relative'} p={0} m={0}>
                        <CustomTextField
                            width={'100%'}
                            value={`${process.env.REACT_APP_MARKETPLACE_URL ?? 'https://bahlou.dk/'}klinik/${settings?.profile?.web_store_name}?${idtype}=${selectid}`}
                            readOnly={true}
                            disabled
                            inputFontSize={'16px'}
                            borderColor={'#A79C92'}
                            borderThickness={'1px'}
                            height={40}
                        />
                        <IconButton
                            disableTouchRipple
                            disableFocusRipple
                            disableRipple
                            sx={{ position: 'absolute', right: 4, top: '60%', transform: 'translateY(-50%)' }}
                            onClick={handleCopy}
                        >
                            {copyStatus === 'started' ? (
                                <CircularProgress size={20} />
                            ) : copyStatus === 'success' ? (
                                <CheckCircle color="success" />
                            ) : (
                                <CopyAll />
                            )}
                        </IconButton>
                    </Stack>
                )}
            </Grid>
        </React.Fragment>
    );
}
