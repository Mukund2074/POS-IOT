import { Stack } from '@mui/material';
import POSCashDrawerText from '../../POSCashDrawerText';
import POSCashDrawerInput from '../../POSCashDrawerInput';
import { t } from 'i18next';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { FormikProps } from 'formik';
import { CashDrawerData, CashFormType } from '../../../Types/cash-drawer.types';

const CashDifferenceForm = ({ formik }: { formik: FormikProps<CashDrawerData> }) => {
    const isDifference = formik.values.cardDifference;

    return (
        <Stack
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                width: '100%',
                height: '100%',
                backgroundColor: '#F5f5f5',
                borderRadius: 1.5,
                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                boxSizing: 'border-box',
            }}
        >
            <POSCashDrawerText
                title={t('POS.Card')}
                text={formatCurrency(formik.values.paymentBreakdown.cardAmount)}
                showTopBorder={false}
                textContainerStyle={{
                    width: '50%',
                    
                }}
                renderIcon={false}
                
            />

            {formik.values.CashDifferenceForm.map((item: CashFormType, idx: number) => (
                <POSCashDrawerInput
                    key={item.key}
                    title={item.label}
                    value={item.val}
                    setValue={(val) => formik.setFieldValue(`CashDifferenceForm[${idx}].val`, val)}
                />
            ))}

            <POSCashDrawerText
                title={t('POS.CashDrawerDIFFERENCE')}
                text={formatCurrency(isDifference)}
                sx={{ borderTop: '1px dashed black', height: 50 }}
                titleStyle={{
                    fontSize: 18,
                }}
                textStyle={{ fontSize: 18, fontWeight: 600, ml: 0.3, color: isDifference < 0 ? 'red' : isDifference === 0 ? 'black' : 'green' }}
                textContainerStyle={{
                    width: '50%',
                   
                }}
                renderIcon={false}
            />

             
        </Stack>
    );
};

export default CashDifferenceForm;
