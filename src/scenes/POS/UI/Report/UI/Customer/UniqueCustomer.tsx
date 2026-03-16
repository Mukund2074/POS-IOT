import { POSDateRangePicker } from '@/components/POS/Common/POSDateRangePicker';
import POSSelect from '@/components/POS/Common/POSSelect';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { api } from '@/utils/Api/POS';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Employee from '../../EmployeeDataType';
import { GetApiInsightsUniqueCustomers200, GetApiInsightsUniqueCustomers200DataItem } from '@/shared/api/models';

const UniqueCustomer = () => {
    const [filter, setFilter] = useState({
        startDate: moment().subtract(3, 'months').format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD'),
    });
    const employee = useSelector((state: any) => state.settings.data.employees);
    const employees = [
        { label: t('Common.AllEmployees'), value: -1 },
        ...employee.map((emp: Employee) => ({
            label: emp.name,
            value: emp.id,
        })),
    ];
    const [selectedEmployee, setSelectedEmployee] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [uniqueCustomerData, setUniqueCustomerData] = useState<GetApiInsightsUniqueCustomers200 | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response : GetApiInsightsUniqueCustomers200 = await api.getApiInsightsUniqueCustomers({
                startDate: filter.startDate,
                endDate: filter.endDate,
                employeeId: selectedEmployee === -1 ? undefined : selectedEmployee,
            });
            setUniqueCustomerData(response);
        } catch (error) {
            console.error('error :', error)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filter.startDate, filter.endDate, selectedEmployee]);
    return (
        <Box>
            <Box sx={{ display: { xs: 'block', md: 'flex' }, justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h3" fontWeight={700}>
                    {t('Report.UniqueCustomers')}
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 1, md: 4 },
                        mt: { xs: 2, md: 0 },
                    }}
                >
                    <POSSelect
                        options={employees}
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(Number(e.target.value))}
                        showPlaceHolder={false}
                        sx={{ width: { xs: '100%', md: 180,background : '#fff', borderRadius : '45px' } }}
                        fontColor="#a0a0a0"
                    />
                    <POSDateRangePicker
                        wrapperSx={{
                            width: { xs: '100%', md: 'fit-content' },
                        }}
                        borderRadius={50}
                        startdate={filter.startDate}
                        endDate={filter.endDate}
                        setStartDate={(date) =>
                            setFilter((prev) => ({
                                ...prev,
                                startDate: moment(date).format('YYYY-MM-DD'),
                            }))
                        }
                        setEndDate={(date) =>
                            setFilter((prev) => ({
                                ...prev,
                                endDate: moment(date).format('YYYY-MM-DD'),
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
                <Box sx={{ mt: 3 }}>
                    {uniqueCustomerData?.data?.length === 0 && (
                        <Typography sx={{ textAlign: 'center', fontWeight: 800 }}>No customers</Typography>
                    )}
                    {uniqueCustomerData?.data?.map((customer: GetApiInsightsUniqueCustomers200DataItem) => {
                        return (
                            <Box sx={{ mt: 1 }}>
                                <Typography sx={{ mb: 1, fontWeight: 700, fontSize: 25 }}>
                                    {customer?.employeeName}
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, 1fr)',
                                        gap: 2,
                                    }}
                                >
                                    <Box sx={{ background: '#fff', p: 5, boxShadow: 1 }}>
                                        <Typography sx={{ textAlign: 'center' }}>
                                            {t('Report.TotalNumbeoFUniqueCustomer')}
                                        </Typography>
                                        <Typography sx={{ mt: 1, textAlign: 'center', fontSize: 35, fontWeight: 800 }}>
                                            {customer?.totalUniqueCustomers}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ background: '#fff', p: 5, boxShadow: 1 }}>
                                        <Typography sx={{ textAlign: 'center' }}>
                                            {t('Report.GnsEarningPerCustomer')}
                                        </Typography>
                                        <Typography sx={{ mt: 1, textAlign: 'center', fontSize: 35, fontWeight: 800 }}>
                                            {formatCurrency(customer?.totalRevenue)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ background: '#fff', p: 5, boxShadow: 1 }}>
                                        <Typography sx={{ textAlign: 'center' }}>
                                            {t('Report.AvgBookingPerCustomer')}
                                        </Typography>
                                        <Typography sx={{ mt: 1, textAlign: 'center', fontSize: 35, fontWeight: 800 }}>
                                            {formatCurrency(customer?.averageRevenuePerCustomer)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            )}
        </Box>
    );
};

export default UniqueCustomer;
