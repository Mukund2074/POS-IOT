import { t } from 'i18next';
import POSCashDrawerSalesBreakdownText from '../../POSCashDrawerSalesBreakdownText';
import { Stack } from '@mui/material';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { CashDrawerData } from '../../../Types/cash-drawer.types';
import { FormikProps } from 'formik';

const CashTaxForm = ({ formik }: { formik: FormikProps<CashDrawerData> }) => {
    return (
        <Stack
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                width: '100%',
                height: '100%',
                backgroundColor: '#FFF',
                borderRadius: 1.5,
                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                boxSizing: 'border-box',
            }}
        >
            <POSCashDrawerSalesBreakdownText
                mainTitle={t('POS.CashDrawerSerivceSale')}
                mainValue={formatCurrency(formik.values.salesBreakdown.serviceSale)}
                sub1Title={t('POS.CashDrawerWithVat')}
                sub1Value={formatCurrency(formik.values.salesBreakdown.serviceSaleTaxable)}
                sub2Title={t('POS.CashDrawerWithoutVat')}
                sub2Value={formatCurrency(formik.values.salesBreakdown.serviceSaleNonTaxable)}
            />
            <POSCashDrawerSalesBreakdownText
                mainTitle={t('POS.CashDrawerSerivceProduct')}
                mainValue={formatCurrency(formik.values.salesBreakdown.productSale)}
                sub1Title={t('POS.CashDrawerWithVat')}
                sub1Value={formatCurrency(formik.values.salesBreakdown.productSaleTaxable)}
                sub2Title={t('POS.CashDrawerWithoutVat')}
                sub2Value={formatCurrency(formik.values.salesBreakdown.productSaleNonTaxable)}
                showBottomBorder={true}
            />
            <POSCashDrawerSalesBreakdownText
                mainTitle={t('POS.CashDrawerGiftCardSales')}
                mainValue={formatCurrency(formik.values.salesBreakdown.giftCardSaleTaxable)}
                sub1Title={t('POS.CashDrawerWithVat')}
                sub1Value={formatCurrency(formik.values.salesBreakdown.giftCardSaleTaxable)}
                sub2Title={t('POS.CashDrawerWithoutVat')}
                sub2Value={formatCurrency(formik.values.salesBreakdown.giftCardSaleNonTaxable)}
                showTopBorder={true}
            />
            <POSCashDrawerSalesBreakdownText
                mainTitle={t('POS.CutCards')}
                mainValue={formatCurrency(formik.values.salesBreakdown.punchSaleNonTaxable)}
                sub1Title={t('POS.CashDrawerWithVat')}
                sub1Value={formatCurrency(formik.values.salesBreakdown.punchSaleTaxable)}
                sub2Title={t('POS.CashDrawerWithoutVat')}
                sub2Value={formatCurrency(formik.values.salesBreakdown.punchSaleNonTaxable)}
                showBottomBorder={true}
            />

            <POSCashDrawerSalesBreakdownText
                mainTitle={t('POS.Turnover')}
                sub1Title={t('POS.CashDrawerWithVat')}
                sub1Value={formatCurrency(0)}
                sub2Title={t('POS.CashDrawerWithoutVat')}
                sub2Value={formatCurrency(0)}
                mainValue={formatCurrency(0)}
            />
            {Number(formik.values.paymentBreakdown.outstandingAmount) > 0 && (
                <POSCashDrawerSalesBreakdownText
                    mainTitle={t('POS.CashDrawerOutstandingRegistered')}
                    mainValue={formatCurrency(formik.values.paymentBreakdown.outstandingAmount)}
                    showTitle1={false}
                    showTitle2={false}
                    vatText={true}
                    showTopBorder={true}
                />
            )}

            {Number(formik.values.paymentBreakdown.paidOutstandingAmount) > 0 && (
                <POSCashDrawerSalesBreakdownText
                    mainTitle={t('POS.PaidOutStanding')}
                    mainValue={formatCurrency(formik.values.paymentBreakdown.paidOutstandingAmount)}
                    showTitle1={false}
                    showTitle2={false}
                    vatText={true}
                    showTopBorder={true}
                />
            )}
        </Stack>
    );
};

export default CashTaxForm;
