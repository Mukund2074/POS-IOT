import { InputAdornment, Stack, Typography } from '@mui/material';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSInput from '@/components/POS/Common/POSInput';
import POSSelect from '@/components/POS/Common/POSSelect';
import POSButton from '@/components/POS/Common/POSButton';
import { t } from 'i18next';
import { FormikProps } from 'formik';
import { CashDrawerData } from '../../Types/cash-drawer.types';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { useEffect } from 'react';
import { EmployeeListingSchema } from '@/scenes/POS/UI/Sales-Page/Types/sales.types';

interface Props {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    formik?: FormikProps<CashDrawerData>; // Optional, if you want to use formik for form handling
    storeName: string; // Optional, if you want to display the store name
    employee: EmployeeListingSchema[]; // Optional, if you want to display the employee name
    employeeId: number;
}

const CashDrawerFooter = ({ setOpen, formik, storeName, employee, employeeId }: Props) => {
    // const [employee, setEmployee] = useState('Yug Singh');
    useEffect(() => {
        // Update the formik values when the component mounts
        if (formik) {
            formik.setFieldValue(
                'remainingCashForNextDay',
                (formik?.values.bankTransferTotal ?? 0) - (formik?.values.transferToBank ?? 0),
            );
        }
    }, [formik?.values?.transferToBank, formik?.values?.bankTransferTotal]);

    return (
        <Stack
            spacing={1.8}
            className="print-cashdrawer-footer"
            sx={{
                py: 1,
                borderRadius: 2,
                boxSizing: 'border-box',
                width: {
                    sm: '99.5%',
                    md: '93.5%',
                },

                mx: {
                    xs: 0.2,
                    md: 2.9,
                    lg: 5.5,
                },
                my: 2,
            }}
        >
            <Stack spacing={1}>
                <POSHeading text={t('POS.CashDrawerToTransferBank')} sx={{ fontWeight: 600, fontSize: 15 }} />
                <POSInput
                    id="transferToBank"
                    name="transferToBank"
                    value={formik?.values.transferToBank || 0}
                    onChange={(e) => {
                        const onlyNumbers = e.target.value.replace(/[^0-9.]/g, '');
                        formik?.setFieldValue('transferToBank', Number(onlyNumbers));
                        formik?.setFieldTouched('transferToBank', true);
                    }}
                    error={formik?.touched.transferToBank && Boolean(formik?.errors.transferToBank)}
                    helperText={
                        formik?.touched.transferToBank && formik?.errors.transferToBank
                            ? String(formik?.errors.transferToBank)
                            : undefined
                    }
                    sx={{ width: '100%' }}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Typography>{t('POS.Currency')}</Typography>
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Stack>

            <Stack>
                <POSHeading text={t('POS.CashDrawerForNextDay')} sx={{ fontWeight: 600, fontSize: 15 }} />
                <POSHeading
                    text={formatCurrency(formik?.values.remainingCashForNextDay)}
                    sx={{
                        fontWeight: 500,
                        fontSize: 14,
                        color:
                            formik?.values.remainingCashForNextDay && formik?.values.remainingCashForNextDay < 0
                                ? 'red'
                                : formik?.values.remainingCashForNextDay === 0
                                  ? '#333'
                                  : 'green',
                    }}
                />
            </Stack>

            <Stack>
                <POSHeading text={t('POS.CashDrawerReconcilation')} sx={{ fontWeight: 600, fontSize: 15 }} />
                <POSHeading text={storeName} sx={{ fontWeight: 500, fontSize: 14, color: '#333' }} />
            </Stack>

            <Stack>
                <POSHeading text={t('POS.WhichEmployee')} sx={{ fontWeight: 600, fontSize: 15, mb: 1 }} />
                <POSSelect
                    id="selectedEmployee"
                    options={employee.map((emp: EmployeeListingSchema) => ({ label: emp.name, value: emp.id }))}
                    onChange={(e) => formik?.setFieldValue('selectedEmployee', e.target.value)}
                    placeholderText="Select an employee"
                    value={formik?.values.selectedEmployee || employeeId}
                    sx={{
                        width: {
                            xs: '100%',
                            sm: 'auto',
                            md: '15%',
                        },
                        backgroundColor: 'white',
                    }}
                />
            </Stack>
            <POSButton
                variant="save"
                style={{
                    minWidth: '100%',
                    color: 'white',
                }}
                title="Proceeed"
                // disabled={!formik?.isValid}
                onClick={() => setOpen((prev) => !prev)}
            />
        </Stack>
    );
};

export default CashDrawerFooter;
