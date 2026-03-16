import { ColumnType, POSTable, RowType } from '@/components/POS/Common';
import POSButton from '@/components/POS/Common/POSButton';
import { GetApiInsightsCustomers200, GetApiInsightsCustomers200OneOf } from '@/shared/api/models';
import { api } from '@/utils/Api/POS';
import { CSVGenerator } from '@/utils/POS/CSVGenerator';
import { Print } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import { useEffect, useState } from 'react';

interface TranslateColumnType {
    [key: string]: string;
}

interface DataType {
    customer: string;
    number: string;
    email: string;
}

const ExcludedFromBooking = () => {
    const [loading, setLoading] = useState(false);
    const translateColumn: TranslateColumnType = {
        customer: 'Common.Customers',
        number: 'Report.Number',
        email: 'Common.Email',
    };

    const Column: ColumnType[] = ['customer', 'number', 'email'].map((col) => ({
        id: col,
        name: t(translateColumn[col]),
        selector: (row: RowType) => row[col],
    }));

    const [data, setData] = useState<DataType[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response: GetApiInsightsCustomers200 = await api.getApiInsightsCustomers({
                status: 'BLOCKED',
            });

            const { data } = response as GetApiInsightsCustomers200OneOf;
            const formattedData: DataType[] = Array.isArray(data)
                ? data.map((emp) => ({
                      customer: emp.name ?? '',
                      number: emp.phoneNumber ?? '',
                      email: String(emp.email ?? ''),
                  }))
                : [];
            setData(formattedData);
        } catch (error) {
            console.error('Error : ', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const response: GetApiInsightsCustomers200 = await api.getApiInsightsCustomers({
                status: 'BLOCKED',
                type: 'csv',
            });
            CSVGenerator({ response: response.toString(), fileTitle: 'Exc.Online_Booking' });
        } catch (error) {
            console.error('error', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <Box>
            <Box sx={{ display: { xs: 'block', md: 'flex' }, justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ color: '#1F1F1F', fontSize: '22px' }} fontWeight={700} variant="h6">
                    {t('Report.ExcludedFromOnlineBooking')}
                </Typography>
                <Box sx={{ display: { xs: 'block', md: 'flex' }, gap: 4, alignItems: 'center' }}>
                    <Box sx={{ borderRadius: 2, cursor: 'pointer', mt: 2 }}>
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
                    </Box>
                </Box>
            </Box>
            <POSTable columns={Column} data={data} loading={loading} />
        </Box>
    );
};

export default ExcludedFromBooking;
