import { ColumnType, POSTable, RowType } from '@/components/POS/Common';
import { POSDateRangePicker } from '@/components/POS/Common/POSDateRangePicker';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { GetApiInsightsTopCustomers200, GetApiInsightsTopCustomers200DataItemEmail } from '@/shared/api/models';
import { api } from '@/utils/Api/POS';
import { Box, Typography } from '@mui/material';
import { t } from 'i18next';
import moment from 'moment';
import { useEffect, useState } from 'react';

interface TranslateColumnTitleType { 
    [key : string] : string
}

interface TopCustomerData {
    customer: string;
    amount: string;
    phoneNumber: string;
    email: GetApiInsightsTopCustomers200DataItemEmail;
}

const TopCustomer = () => {
    const [filter, setFilter] = useState({
        startDate: moment().subtract(3, 'months').format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD'),
    });
    const [loading, setLoading] = useState(false);

    const translateColumnTitle: TranslateColumnTitleType = {
        customer: 'Common.Customers',
        amount: 'Common.Amount',
        phoneNumber: 'Calendar.PhoneNumber',
        email: 'Common.Email',
    };
    const topCustomerColumn: ColumnType[] = ['customer', 'amount', 'phoneNumber', 'email'].map((tcc) => ({
        id: tcc,
        name: t(translateColumnTitle[tcc]),
        selector: (row: RowType) => row[tcc],
    }));

    const [topCustomerData, setTopCustomerData] = useState<TopCustomerData[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response: GetApiInsightsTopCustomers200 = await api.getApiInsightsTopCustomers({
                endDate: filter.endDate,
                startDate: filter.startDate,
            });

            const formattedData = response?.data.map((emp) => ({
                customer: emp.name,
                amount: formatCurrency(emp.totalRevenue),
                phoneNumber: emp.phoneNumber,
                email: emp.email,
            }));
            setTopCustomerData(formattedData);
        } catch (error) {
            console.error('error : ', error)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filter.startDate, filter.endDate]);

    return (
        <Box>
            <Box sx={{ display: { xs: 'block', md: 'flex' }, justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h3" fontWeight={700}>
                    {t('Report.Top100CustomersTitle')}
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 1, md: 4 },
                        mt: { xs: 2, md: 0 },
                    }}
                >
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
            <Box sx={{ mt: 5 }}>
                <POSTable columns={topCustomerColumn} data={topCustomerData} loading={loading} />
            </Box>
        </Box>
    );
};

export default TopCustomer;
