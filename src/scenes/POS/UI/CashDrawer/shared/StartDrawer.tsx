import POSButton from '@/components/POS/Common/POSButton';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSInput from '@/components/POS/Common/POSInput';
import { InputAdornment, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import React from 'react';

export default function StartDrawer({ onSubmit }: { onSubmit?: (amount: number) => void }) {
    const [amount, setAmount] = React.useState<number>(0);

    const handleAmountChange = (value: string) => {
        const onlyNumbers = value.replace(/[^0-9.]/g, '');
        setAmount(Number(onlyNumbers));
    };

    return (
        <Stack>
            <POSHeading
                text={t('POS.CashReconsiliation')}
                sx={{ fontSize: 30, fontWeight: 600, color: '#333', px: 2, py: 1 }}
            />

            <Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80dvh' }}>
                <POSHeading
                    text={t('POS.EnterAmountInBox')}
                    sx={{ py: 1, px: 5, fontSize: 32, fontStyle: 'sans', color: '#333' }}
                />
                <POSInput
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder={t('POS.CashDrawerStartDrawer')}
                    sx={{
                        width: '100%',
                        maxWidth: { xs: 400, md: 600 },
                        my: { xs: 1, md: 4 },
                        height: { xs: 70, md: 80 },
                    }}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Typography>{t('POS.Currency')}</Typography>
                                </InputAdornment>
                            ),
                        },
                    }}
                    inputFontSize={40}
                    textAlign="center"
                />

                <POSButton
                    onClick={() => {
                        if (onSubmit) {
                            onSubmit(amount);
                        }
                    }}
                    variant="save"
                    titleSize={25}
                    height={{ xs: 50, md: 60 }}
                    title={t('POS.StartCashDrawer')}
                />
            </Stack>
        </Stack>
    );
}
