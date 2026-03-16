import { InputAdornment, Stack, Typography } from '@mui/material';
import React from 'react';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSInput from '@/components/POS/Common/POSInput';
import { t } from 'i18next';
import Permission from '@/utils/POS/Permission';
interface Props {
    title: string;
    value: number;
    setValue: (value: number) => void;
    showBottomBorder?: boolean;
    showTopBorder?: boolean;
    sx?: object;
    titleStyle?: object;
    inputStyle?: object;
    inputContainerStyle?: object;
    id?: string;
    name?: string;
    className?: string;
    showCurrency?: boolean;
}
const POSCashDrawerInput = ({
    className = '',
    id = '',
    name = '',
    title,
    value,
    setValue,
    showBottomBorder = false,
    showTopBorder = true,
    sx,
    titleStyle,
    inputStyle,
    inputContainerStyle,
    showCurrency = true,
}: Props) => {
    const { isAllowed } = Permission();

    return (
        <Stack
            className={`print-cashdrawer-reconcilation ${className}`}
            sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#fff',
                borderBottom: showBottomBorder ? '1px solid #e6e6e6' : 'none',
                borderTop: showTopBorder ? '1px solid #e6e6e6' : 'none',

                height: 60,
                width: '100%',
                boxSizing: 'border-box',
                ...sx,
            }}
        >
            <POSHeading
                text={title}
                sx={{
                    fontWeight: 600,
                    fontSize: 15,
                    whiteSpace: 'wrap',
                    pr: 1,
                    pl: 2,
                    ...titleStyle,
                }}
            />
            <Stack
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '50%',
                    justifyContent: 'flex-start',
                    pr: 2,

                    ...inputContainerStyle,
                }}
            >
                <POSInput
                    className="print-cashdrawer-bank-transfer-input"
                    id={id}
                    name={name}
                    value={value}
                    disabled={!isAllowed('CashDrawer', 'update')}
                    onChange={(e) => {
                        const onlyNumbers = e.target.value.replace(/[^0-9.]/g, '');
                        setValue(Number(onlyNumbers));
                    }}
                    sx={{
                        ...inputStyle,
                        cursor: !isAllowed('CashDrawer', 'update') ? 'not-allowed' : 'pointer',
                    }}
                    width={'100%'}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    {showCurrency && <Typography>{t('POS.Currency')}</Typography>}
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Stack>
        </Stack>
    );
};

export default POSCashDrawerInput;
