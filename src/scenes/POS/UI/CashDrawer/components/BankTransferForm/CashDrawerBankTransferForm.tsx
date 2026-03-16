import { Grid2, Stack } from '@mui/material';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSCashDrawerText from '../POSCashDrawerText';
import POSCashDrawerInput from '../POSCashDrawerInput';
import { t } from 'i18next';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { FormikProps } from 'formik';
import { CashDrawerData } from '../../Types/cash-drawer.types';

const CashDrawerBankTransferForm = ({ formik }: { formik: FormikProps<CashDrawerData> }) => {
    if (!formik.values) return <></>;
    const data = [
        { key: t('Common.Price'), value: formik.values.openingCash, isZeroShow: true },
        { key: t('POS.Cash'), value: formik.values.paymentBreakdown.cashAmount, isZeroShow: true },
        { key: t('POS.CashCredit'), value: formik.values.creditBreakdown.cashCredit, isZeroShow: false },
        { key: t('POS.CashDraweerCashOutlays'), value: formik.values.paymentBreakdown.outlayAmount, isZeroShow: false },
        { key: `${t('POS.CashDrawerChange')} (${t('POS.CashDrawercash')})`, value: formik.values.paymentBreakdown.otherAmount, isZeroShow: false },
        {
            key: t('POS.CashDrawerTotal'),
            value:
                (formik.values.paymentBreakdown.cashAmount ?? 0) +
                formik.values.openingCash -
                (formik.values.creditBreakdown.cashCredit ?? 0) -
                (formik.values.paymentBreakdown.outlayAmount ?? 0) -
                (formik.values.paymentBreakdown.otherAmount ?? 0),
            isZeroShow: true,
        },
    ];

    return (
        <Stack
            className="print-cashdrawer-bank-transfer"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: 'auto',
                backgroundColor: '#fff',
                borderRadius: 1.5,
                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                boxSizing: 'border-box',
                width: {
                    sm: '99.5%',
                    md: '93.5%',
                },
                my: 5,
                mx: {
                    xs: 0.2,
                    md: 2.9,
                    lg: 5.5,
                },
            }}
        >
            <POSHeading
                text={t('POS.CashDrawerCountBankTransfer')}
                sx={{ py: 1, px: 5, fontSize: 18, fontStyle: 'sans', color: '#333' }}
            />

            {data.map(({ key, value, isZeroShow }, idx) => {
                if (!isZeroShow && value === 0) return null;

                return (
                    <POSCashDrawerText
                        key={key}
                        title={key}
                        text={`${(key === t('POS.CashCredit') || key === t('POS.CashDraweerCashOutlays') || key === `${t('POS.CashDrawerChange')} (${t('POS.CashDrawercash')})`) ? '-' : ''} ${formatCurrency(value)}`}
                        showBottomBorder={idx !== 0}
                        textContainerStyle={{
                            width: {
                                xs: '25%',
                                sm: '51%',
                                md: '79%',
                            },
                            justifyContent: 'flex-start',
                            textAlign: 'right',
                        }}
                        textStyle={{color : key === t('POS.CashDrawerTotal') ? value && value < 0 ? 'red' : value && value === 0 ? 'black' : 'green' : '#333'}}
                        renderIcon={false}
                    />
                );
            })}

            <Grid2 container className="print-cashdrawer-grid">
                {formik.values?.bankTransformForm.map(
                    ({ key, val, label }: { key: number; val: number; label: string }) => (
                        <Grid2
                            key={key}
                            size={{ xs: 12, md: 6 }}
                            gap={0}
                            sx={{ display: 'flex', alignItems: 'center', p: 0, borderBottom: '1px solid #ccc' }}
                        >
                            <POSCashDrawerInput
                                className="print-cashdrawer-grid-item"
                                title={label}
                                id={`bankTransformForm_${key}.val`}
                                name={`bankTransformForm.${key}.val`}
                                value={val}
                                setValue={(val) => formik.setFieldValue(`bankTransformForm.${key}.val`, val)} 
                                inputContainerStyle={{ ml: 5, pr: 2 }}
                                inputStyle={{
                                    ml: {
                                        xs: -1,
                                        md: -4.5,
                                    },
                                }}
                                showBottomBorder={false}
                                showTopBorder={false}
                                showCurrency={false}
                                
                            />
                        </Grid2>
                    ),
                )}
                <span className="print-cashdrawer-grid-item"></span>
            </Grid2>

            <POSCashDrawerText
                title={t('POS.CashDrawerDIFFERENCE')}
                text={formatCurrency(formik.values.bankDifference)}
                sx={{
                    borderTop: '1px dashed black',
                    height: 50,
                    borderBottomLeftRadius: 10,
                    borderBottomRightRadius: 10, 
                    color : formik.values.bankDifference < 0 ? 'red' : formik.values.bankDifference === 0 ? 'black' : 'green'
                }}
                titleStyle={{
                    fontSize: 18,
                }}
                textStyle={{ fontSize: 18, fontWeight: 600, ml: 0.5, color: formik.values.bankDifference < 0 ? 'red' : formik.values.bankDifference === 0 ? 'black' : 'green', pr: 0.5 }}
                textContainerStyle={{
                    width: {
                        xs: '50%',
                        sm: '51%',
                        md: '79%',
                        lg: '78%',
                    },
                    textAlign: 'right',
                }}
                renderIcon={false}
            />
        </Stack>
    );
};

export default CashDrawerBankTransferForm;
