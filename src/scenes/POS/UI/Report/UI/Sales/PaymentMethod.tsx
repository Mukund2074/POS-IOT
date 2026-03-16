import POSSelect from '@/components/POS/Common/POSSelect';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { POSDateRangePicker } from '@/components/POS/Common/POSDateRangePicker';
import moment from 'moment';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { api } from '@/utils/Api/POS';
import { ColumnType, POSTable, RowType } from '@/components/POS/Common';
import POSHeading from '@/components/POS/Common/POSHeading';
import { useSelector } from 'react-redux';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import POSButton from '@/components/POS/Common/POSButton';
import { Print } from '@mui/icons-material';
import { CSVGenerator } from '@/utils/POS/CSVGenerator';
import { GetApiInsightsEmployeePaymentsType200, GetApiInsightsEmployeePaymentsType200DataEmployeesItem } from '@/shared/api/models';
import Employee from '../../EmployeeDataType';

type TranslateLanguageColumnType = {
    [key: string]: string;
};

const PaymentMethod = () => {
    const [selectedEmployee, setSelectedEmployee] = useState(0);
    const [filter, setFilter] = useState({
        fromDate: moment().subtract(3, 'months').format('YYYY-MM-DD'),
        toDate: moment().format('YYYY-MM-DD'),
    });
    const [loading, setLoading] = useState(false);

    const getEmployee = useSelector((state: any) => state.settings.data.employees);
    const employee = [
        { label: t('Common.AllEmployees'), value: 0 },
        ...getEmployee.map((emp: Employee) => ({
            label: emp.name,
            value: emp.id,
        })),
    ];

    const translateLanguageColumn: TranslateLanguageColumnType = {
        paymentMethod: 'POS.PaymentMethod',
        paid: 'POS.Paid',
        credited: 'Report.Credited',
        total: 'Statistics.Total',
    };

    const translateRowLanguage: TranslateLanguageColumnType = {
        cash: 'POS.Cash',
        card: 'POS.Card',
        punchCard: 'PunchCard.PunchCard',
        giftCard: 'POS.GiftCard',
        outstanding: 'POS.Outstanding',
        bankTransfer: 'POS.BankTransfer',
        mobilePay: 'POS.MobilePay',
        receivable: 'POS.Receivable',
    };

    const paymentMethod: ColumnType[] = ['paymentMethod', 'paid', 'credited', 'total'].map((pm) => ({
        id: pm,
        name: t(translateLanguageColumn[pm]),
        selector: (row: RowType) => row[pm],
    }));

    const [empData, setEmpData] = useState<GetApiInsightsEmployeePaymentsType200DataEmployeesItem[]>([]);
    const [totalSummary, setTotalSummary] = useState<GetApiInsightsEmployeePaymentsType200[]>([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response: GetApiInsightsEmployeePaymentsType200 = await api.getApiInsightsEmployeePaymentsType({
                fromDate: filter.fromDate,
                toDate: filter.toDate,
                employeeId: selectedEmployee,
            });
            setEmpData(response?.data?.employees || []);
            setTotalSummary(response?.data?.paymentMethodSummary || []);
        } catch (error) {
            console.error('Error fetching employee payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const response: GetApiInsightsEmployeePaymentsType200 = await api.getApiInsightsEmployeePaymentsType(
                {
                    fromDate: filter.fromDate,
                    toDate: filter.toDate,
                    employeeId: selectedEmployee,
                },
                'csv',
            );
            CSVGenerator({ response: response.toString(), fileTitle: 'payment_method' });
        } catch (error) {
            console.error('something wrong', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filter.fromDate, filter.toDate, selectedEmployee]);

    return (
        <Box>
            <Box sx={{ display: { xs: 'block', md: 'flex' }, justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h3" fontWeight={700}>
                    {t('POS.PaymentMethod')}
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 1, md: 4 },
                        mt: { xs: 2, md: 0 },
                    }}
                >
                    <POSButton
                        title={
                            <Stack
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <Print />
                                {t('Setting.Export')}
                            </Stack>
                        }
                        variant="save"
                        width={{ xs: '100%', md: 'auto' }}
                        sx={{ ml: 'auto', mb: 2 }}
                        onClick={handleSave}
                    />
                    <POSSelect
                        options={employee}
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(Number(e.target.value))}
                        sx={{ width: { xs: '100%', md: 180 }, background: '#fff', borderRadius: '45px' }}
                        showPlaceHolder={false}
                        fontColor="#a0a0a0"
                    />
                    <POSDateRangePicker
                        wrapperSx={{ width: { xs: '100%', md: 'fit-content' } }}
                        borderRadius={50}
                        startdate={filter.fromDate}
                        endDate={filter.toDate}
                        setStartDate={(date) =>
                            setFilter((prev) => ({
                                ...prev,
                                fromDate: moment(date).format('YYYY-MM-DD'),
                            }))
                        }
                        setEndDate={(date) =>
                            setFilter((prev) => ({
                                ...prev,
                                toDate: moment(date).format('YYYY-MM-DD'),
                            }))
                        }
                    />
                </Box>
            </Box>

            {loading ? (
                <Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh' }}>
                    <CircularProgress size={40} sx={{ color: 'inherit' }} />
                </Stack>
            ) : (
                <Box>
                    <Box>
                        {empData.length === 0 ? (
                            <Box sx={{ mt: 3 }}>
                                <POSTable columns={paymentMethod} data={[]} loading={loading} />
                            </Box>
                        ) : (
                            (selectedEmployee === 0
                                ? empData
                                : empData.filter(
                                      (emp: GetApiInsightsEmployeePaymentsType200DataEmployeesItem) =>
                                          emp.employeeId === selectedEmployee,
                                  )
                            ).map((emp: GetApiInsightsEmployeePaymentsType200DataEmployeesItem) => (
                                <Box key={emp.employeeId} sx={{ mb: 4, mt: 4 }}>
                                    <POSHeading text={emp.employeeName} />
                                    <POSTable
                                        columns={paymentMethod}
                                        data={emp.paymentMethods.map((m: any) => ({
                                            ...m,
                                            paymentMethod: translateRowLanguage[m.paymentMethod]
                                                ? t(translateRowLanguage[m.paymentMethod])
                                                : m.paymentMethod
                                                      .replace(/([A-Z])/g, ' $1')
                                                      .replace(/^./, (c: any) => c.toUpperCase()),
                                            paid: formatCurrency(m.paid),
                                            credited: formatCurrency(m.credited),
                                            total: formatCurrency(m.total),
                                        }))}
                                        loading={loading}
                                    />
                                </Box>
                            ))
                        )}
                    </Box>
                    {totalSummary?.length > 0 && (
                        <Box sx={{ mt: 4 }}>
                            <POSHeading text={t('Report.TotalPeriodSummary')} />
                            <POSTable
                                columns={paymentMethod}
                                data={totalSummary.map((m: any) => ({
                                    ...m,
                                    paymentMethod: translateRowLanguage[m.paymentMethod]
                                        ? t(translateRowLanguage[m.paymentMethod])
                                        : m.paymentMethod
                                              .replace(/([A-Z])/g, ' $1')
                                              .replace(/^./, (c: any) => c.toUpperCase()),
                                    paid: formatCurrency(m.paid),
                                    credited: formatCurrency(m.credited),
                                    total: formatCurrency(m.total),
                                }))}
                                loading={loading}
                            />
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default PaymentMethod;
