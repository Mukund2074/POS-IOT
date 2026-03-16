import { POSDateRangePicker } from '@/components/POS/Common/POSDateRangePicker';
import POSSelect from '@/components/POS/Common/POSSelect';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { api } from '@/utils/Api/POS';
import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Employee from '../../EmployeeDataType';
import { GetApiInsightsCustomerStatistics200 } from '@/shared/api/models';

const NewCustomers = () => {
    const [filter, setFilter] = useState({
        startData: moment().subtract(3, 'months').format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD'),
    });

    const employee = useSelector((state: any) => state.settings.data.employees);
    const allEmployees = [
        { label: 'All', value: -1 },
        ...employee.map((emp: Employee) => ({
            label: emp.name,
            value: emp.id,
        })),
    ];

    const [selectedEmployees, setSelectedEmployees] = useState(-1);
    const [loading, setLoading] = useState(false);

    const [data, setData] = useState<GetApiInsightsCustomerStatistics200 | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response: GetApiInsightsCustomerStatistics200 = await api.getApiInsightsCustomerStatistics({
                endDate: filter.endDate,
                startDate: filter.startData,
                employeeId: selectedEmployees === -1 ? undefined : selectedEmployees,
            });
            setData(response);
        } catch (error) {
            console.error('error', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filter.startData, filter.endDate, selectedEmployees]);

    return (
        <Box>
            <Box sx={{ display: { xs: 'block', md: 'flex' }, justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h3" fontWeight={700}>
                    {t('Insights.NewCustomers')}
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
                        options={allEmployees}
                        value={selectedEmployees}
                        onChange={(e) => {
                            setSelectedEmployees(Number(e.target.value));
                        }}
                        sx={{ width: { xs: '100%', md: 130 }, borderRadius : '45px', background : '#fff' }}
                        showPlaceHolder={false}
                    />
                    <POSDateRangePicker
                        wrapperSx={{ width: { xs: '100%', md: 'fit-content' } }}
                        borderRadius={50}
                        startdate={filter.startData}
                        endDate={filter.endDate}
                        setStartDate={(date) =>
                            setFilter((prev) => ({
                                ...prev,
                                startData: moment(date).format('YYYY-MM-DD'),
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, my: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                    {t('Report.NewCustomerBlueAlert')}
                </Alert>
            </Box>
            {loading ? (
                <Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh' }}>
                    <CircularProgress size={40} sx={{ color: 'inherit' }} />
                </Stack>
            ) : (
                <Box>
                    {data?.data?.length === 0 && (
                        <Typography sx={{ textAlign: 'center', fontWeight: 800 }}>No customers</Typography>
                    )}
                    {data?.data?.map((emp: any) => {
                        return (
                            <Box sx={{ mt: 1 }}>
                                <Typography sx={{ mb: 1, fontWeight: 700, fontSize: 25 }}>
                                    {emp?.employeeName}
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                        gap: 2,
                                    }}
                                >
                                    <Box sx={{ background: '#fff', p: 5, boxShadow: 1 }}>
                                        <Typography sx={{ textAlign: 'center' }}>
                                            {t('Report.TotalNumberOfCustomer')}
                                        </Typography>
                                        <Typography sx={{ mt: 1, textAlign: 'center', fontSize: 35, fontWeight: 800 }}>
                                            {emp?.newCustomerCount}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ background: '#fff', p: 5, boxShadow: 1 }}>
                                        <Typography sx={{ textAlign: 'center' }}>
                                            {t('Report.GnsEarningPerCustomer')}
                                        </Typography>
                                        <Typography sx={{ mt: 1, textAlign: 'center', fontSize: 35, fontWeight: 800 }}>
                                            {formatCurrency(emp?.averageRevenuePerCustomer)}
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

export default NewCustomers;
