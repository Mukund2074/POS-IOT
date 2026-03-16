import { Stack } from '@mui/material';
import POSCashDrawerText from '../../POSCashDrawerText';
import { t } from 'i18next';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { FormikProps } from 'formik';
import { CashDrawerData } from '../../../Types/cash-drawer.types';

const CashReconcilationForm = ({
    formik,
    handlePaymentClick,
}: {
    formik: FormikProps<CashDrawerData>;
    handlePaymentClick: ({ name }: { name: string }) => void;
}) => {
    const totalAmount =
        (formik.values.paymentBreakdown.cardAmount ?? 0) +
        (formik.values.paymentBreakdown.cashAmount ?? 0) +
        (formik.values.paymentBreakdown.bankTransferAmount ?? 0) +
        (formik.values.paymentBreakdown.mobilePayAmount ?? 0) -
        (formik.values.creditBreakdown.mobilePayCredit ?? 0) -
        (formik.values.creditBreakdown.bankTransferCredit ?? 0) -
        (formik.values.creditBreakdown.cashCredit ?? 0) -
        (formik.values.creditBreakdown.cardCredit ?? 0) -
        (formik.values.paymentBreakdown.outlayAmount ?? 0) -
        (formik.values.paymentBreakdown.otherAmount ?? 0);

    return (
        <Stack
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                height: '100%',
                backgroundColor: '#F5f5f5',
                borderRadius: 1.5,
                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                boxSizing: 'border-box',
                width: { xs: '100%', md: '45%' },
                ml: { xs: 0, md: 2.9, lg: 5.5 },
            }}
        >
            <POSCashDrawerText
                title={t('POS.Card')}
                text={formatCurrency(formik.values.paymentBreakdown.cardAmount)}
                showTopBorder={false}
                conditionalRender={Boolean(
                    formik.values.paymentBreakdown.cardAmount && formik.values.paymentBreakdown.cardAmount > 0,
                )}
                onClick={() => handlePaymentClick({ name: 'CARD' })}
            />
            <POSCashDrawerText
                title={t('POS.CashDrawerCredited') + ` (${t('POS.DebitCard')})`}
                text={`-${formatCurrency(formik.values.creditBreakdown.cardCredit)}`}
                showBottomBorder={true}
                conditionalRender={Boolean(
                    formik.values.creditBreakdown.cardCredit && formik.values.creditBreakdown.cardCredit > 0,
                )}
                onClick={() => handlePaymentClick({ name: 'CARD_CREDIT' })}
            />

            <POSCashDrawerText
                title={t('POS.Cash')}
                text={formatCurrency(formik.values.paymentBreakdown.cashAmount)}
                sx={{ mt: 2.5 }}
                conditionalRender={Boolean(
                    formik.values.paymentBreakdown.cashAmount && formik.values.paymentBreakdown.cashAmount > 0,
                )}
                onClick={() => handlePaymentClick({ name: 'CASH' })}
            />
            <POSCashDrawerText
                title={t('POS.CashDraweerCashOutlays')}
                text={`-${formatCurrency(formik.values.paymentBreakdown.outlayAmount)}`}
                // conditionalRender={Boolean(
                //     formik.values.paymentBreakdown.outlayAmount && formik.values.paymentBreakdown.outlayAmount > 0,
                // )}
                onClick={() => handlePaymentClick({ name: 'OUTLAYS' })}
            />
            <POSCashDrawerText
                title={t('POS.CashDrawerCredited') + ` (${t('POS.CashDrawercash')})`}
                text={`-${formatCurrency(formik.values.creditBreakdown.cashCredit)}`}
                conditionalRender={Boolean(
                    formik.values.creditBreakdown.cashCredit && formik.values.creditBreakdown.cashCredit > 0,
                )}
                onClick={() => handlePaymentClick({ name: 'CASH_CREDIT' })}
            />
            <POSCashDrawerText
                title={t('POS.CashDrawerChange') + ` (${t('POS.CashDrawercash')})`}
                text={`-${formatCurrency(formik.values.paymentBreakdown.otherAmount)}`}
                showBottomBorder={true}
                conditionalRender={Boolean(
                    formik.values.paymentBreakdown.otherAmount && formik.values.paymentBreakdown.otherAmount > 0,
                )}
                onClick={() => handlePaymentClick({ name: 'CHANGE' })}
            />

            <POSCashDrawerText
                title={t('POS.BankTransfer')}
                text={formatCurrency(formik.values.paymentBreakdown.bankTransferAmount)}
                sx={{ mt: 2.5 }}
                conditionalRender={Boolean(
                    formik.values.paymentBreakdown.bankTransferAmount &&
                        formik.values.paymentBreakdown.bankTransferAmount > 0,
                )}
                onClick={() => handlePaymentClick({ name: 'BANK_TRANSFER' })}
            />
            <POSCashDrawerText
                title={t('POS.CashDrawerCredited') + ` (${t('POS.CashDrawerBankTransfer')})`}
                text={`-${formatCurrency(formik.values.creditBreakdown.bankTransferCredit)}`}
                showBottomBorder={true}
                conditionalRender={Boolean(
                    formik.values.creditBreakdown.bankTransferCredit &&
                        formik.values.creditBreakdown.bankTransferCredit > 0,
                )}
                onClick={() => handlePaymentClick({ name: 'BANK_TRANSFER_CREDIT' })}
            />

            <POSCashDrawerText
                title={t('POS.CashDrawerMobilePay')}
                text={formatCurrency(formik.values.paymentBreakdown.mobilePayAmount)}
                sx={{ mt: 2.5 }}
                conditionalRender={Boolean(
                    formik.values.paymentBreakdown.mobilePayAmount &&
                        formik.values.paymentBreakdown.mobilePayAmount > 0,
                )}
                onClick={() => handlePaymentClick({ name: 'MOBILE_PAY' })}
            />
            <POSCashDrawerText
                title={t('POS.CashDrawerCredited') + ` (${t('POS.CashDrawerMobilePay')})`}
                text={`-${formatCurrency(formik.values.creditBreakdown.mobilePayCredit)}`}
                showBottomBorder={true}
                conditionalRender={Boolean(
                    formik.values.paymentBreakdown.mobilePayAmount &&
                        formik.values.paymentBreakdown.mobilePayAmount > 0,
                )}
                onClick={() => handlePaymentClick({ name: 'MOBILE_PAY_CREDIT' })}
            />

            <POSCashDrawerText
                title={t('POS.Bonus')}
                text={formatCurrency(formik.values.paymentBreakdown.bonusAmount)}
                sx={{ mt: 2.5 }}
                conditionalRender={Boolean(
                    formik.values.paymentBreakdown.bonusAmount &&
                        formik.values.paymentBreakdown.bonusAmount > 0,
                )}
                onClick={() => handlePaymentClick({ name: 'BONUS' })}
            />

            <POSCashDrawerText
                title={t('POS.CashDrawerTotal')}
                text={formatCurrency(totalAmount)}
                sx={{ mt: 2.5, borderTop: '1px dashed black' }}
                titleStyle={{
                    fontSize: 18,
                }}
                textStyle={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: totalAmount < 0 ? 'red' : totalAmount === 0 ? 'black' : 'green',
                }}
            />
        </Stack>
    );
};

export default CashReconcilationForm;
