import { Grid2 } from '@mui/material';
import CashReconcilationForm from './form/CashReconcilationForm';
import CashDifferenceForm from './form/CashDifferenceForm';
import CashTaxForm from './form/CashTaxForm';
import { CashDrawerData } from '../../Types/cash-drawer.types';
import { FormikProps } from 'formik';

const CashReconcilationBody = ({
    formik,
    handlePaymentClick,
}: {
    formik: FormikProps<CashDrawerData>;
    handlePaymentClick: ({ name }: { name: string }) => void;
}) => {
    return (
        <Grid2 className="print-cashdrawer-reconcilation" container sx={{ width: '100%', mt: 2 }} gap={2}>
            <CashReconcilationForm formik={formik} handlePaymentClick={handlePaymentClick} />
            <Grid2
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    backgroundColor: 'transparent',
                    borderRadius: 1.5,
                    boxSizing: 'border-box',
                    px: { xs: 0.1, md: 1 },
                    height: '100%',
                }}
                size={{ xs: 12, md: 5.75 }}
            >
                <CashDifferenceForm formik={formik} />
                <CashTaxForm formik={formik} />
            </Grid2>
        </Grid2>
    );
};

export default CashReconcilationBody;
