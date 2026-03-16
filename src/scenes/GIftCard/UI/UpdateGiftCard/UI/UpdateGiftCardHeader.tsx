import POSButton from '@/components/POS/Common/POSButton';
import POSHeading from '@/components/POS/Common/POSHeading';
import { Stack } from '@mui/material';
import { t } from 'i18next';
import { UpdateGiftCardHeadertypeProps } from '../Types/UpdateGiftCard.types';

const UpdateGiftCardHeader = ({ status, isChanges, formik, handleUsed }: UpdateGiftCardHeadertypeProps) => {
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
            <POSHeading sx={{ my: 2 }} text={t('GiftCard.EditGiftCard')} />

            <Stack
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2,
                    width: { xs: '100%', md: 'auto' },
                    height: '100%',
                }}
            >
                <POSButton
                    title={status === 'USED' ? t('GiftCard.Unused') : t('GiftCard.MarkasUsed')}
                    variant={'f_outline'}
                    width={{ xs: '100%', md: 'auto' }}
                    onClick={() => handleUsed({ showToast: true, isUsed: status === 'USED' ? false : true })}
                    sx={{ backgroundColor: '#FFF' }}
                    disabled={formik.values.remainingAmount === 0}
                />
                {isChanges && (
                    <POSButton
                        title={t('GiftCard.update')}
                        variant={'save'}
                        width={{ xs: '100%', md: 'auto' }}
                        onClick={formik.handleSubmit}
                    />
                )}
            </Stack>
        </Stack>
    );
};

export default UpdateGiftCardHeader;
