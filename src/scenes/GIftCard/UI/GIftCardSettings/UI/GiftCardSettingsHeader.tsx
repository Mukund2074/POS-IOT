import POSButton from '@/components/POS/Common/POSButton';
import { AppBar, CircularProgress, Stack } from '@mui/material';
import { FormikProps } from 'formik';
import { t } from 'i18next';
import { GiftCardSettingsFormValues } from '../Types/GiftCardSettings.types';

const GiftCardSettingsHeader = ({
    formik,
    showSaveButton,
}: {
    formik: FormikProps<GiftCardSettingsFormValues>;
    showSaveButton: boolean;
}) => {
    return (
        <Stack
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: { md: 'space-between' },
                alignItems: 'center',
                pb: 2,
            }}
        >
            {showSaveButton && (
                <AppBar
                    sx={{
                        flexDirection: { xs: 'column', md: 'row' },
                        pb: 2,
                        position: 'fixed',
                        top: 45,
                        left: 0,
                        right: 0,
                        py: 1,
                        px: 4,
                        bgcolor: '#fff',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'flex-end',
                        width: '100%',
                        zIndex: 8,
                    }}
                >
                    <POSButton
                        title={
                            formik?.isSubmitting ? (
                                <Stack sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: 1 }}>
                                    <CircularProgress size={20} color="inherit" />
                                    {t('POS.Processing')}
                                </Stack>
                            ) : (
                                t('Customer.SaveCh')
                            )
                        }
                        variant={'save'}
                        width={{ xs: '100%', md: 'auto' }}
                        onClick={formik.handleSubmit}
                    />
                </AppBar>
            )}
        </Stack>
    );
};

export default GiftCardSettingsHeader;
