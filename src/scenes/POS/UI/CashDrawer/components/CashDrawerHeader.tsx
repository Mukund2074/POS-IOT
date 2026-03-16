import { Stack } from '@mui/material';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSBadge from '@/components/POS/Common/POSBadge';
import { t } from 'i18next';
import moment from 'moment';
import { CashDrawerData } from '../Types/cash-drawer.types';
import { FormikProps } from 'formik';
// import POSSelect from '@/components/POS/Common/POSSelect';
import { EmployeeListingSchema } from '../../Sales-Page/Types/sales.types';
// import { Dispatch, SetStateAction } from 'react';

const CashDrawerHeader = ({
    formik,
    storeName,
    employee,
    setVoteForSecondTerm,
    // setSelectedCashDrawerEmployee,
    // selectedCashDrawerEmployee,
}: {
    formik: FormikProps<CashDrawerData>;
    storeName: string;
    employee: EmployeeListingSchema[];
    setVoteForSecondTerm: (vote: boolean) => void;
    // setSelectedCashDrawerEmployee: Dispatch<SetStateAction<number>>;
    // selectedCashDrawerEmployee: number;
}) => {
    return (
        <Stack
            direction={{
                xs: 'column',
                md: 'row',
            }}
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                my: 2,
                alignItems: { xs: 'flex-start', md: 'center' },
                pr: {
                    md: 4,
                    lg: 6.5,
                },
            }}
        >
            <POSHeading text={t('POS.CashDrawer')} />
            <Stack
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                {/* <POSBadge text={t('POS.CashDrawerBadge1Text') + ` : ${storeName}`} /> */}

                {/* {employee.length > 0 && (
                    <POSSelect
                        options={employee.map((emp: EmployeeListingSchema) => ({
                            label: `vote for: ${emp.name}`,
                            value: emp.id,
                        }))}
                        onChange={(e) => setSelectedCashDrawerEmployee(Number(e.target.value))}
                        value={selectedCashDrawerEmployee}
                        sx={{
                            pr: { xs: 0, md: 2, lg: 4 },
                            backgroundColor: 'white',
                            border: 'none',
                            boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.1)',
                        }}
                        fontSize={15}
                        fontWeight={400}
                        fontColor={'gray'}
                    />
                )} */}

                <POSBadge
                    startDate={
                        moment(formik.values?.fromDate).isValid()
                            ? moment(formik.values?.fromDate).format('DD/MM/YYYY')
                            : ''
                    }
                    text={
                        t('POS.CashDrawerBadge2Text') +
                        ' : ' +
                        (moment(formik.values?.fromDate).isValid()
                            ? moment(formik.values?.fromDate).format('DD/MM/YYYY')
                            : '') +
                        ' - ' +
                        (moment(formik.values?.drawerEndDate).isValid()
                            ? moment(formik.values?.drawerEndDate).format('DD/MM/YYYY')
                            : '')
                    }
                    badgeText={t('POS.VoteForSecondTerm')}
                    onClick={() => {
                        setVoteForSecondTerm(true);
                    }}
                    condition={
                        moment(formik.values?.toDate).isValid() &&
                        moment(formik.values?.fromDate).isValid() &&
                        moment(formik.values?.toDate).format('YYYY-MM-DD') !==
                            moment(formik.values?.fromDate).format('YYYY-MM-DD')
                    }
                />
            </Stack>
        </Stack>
    );
};

export default CashDrawerHeader;
