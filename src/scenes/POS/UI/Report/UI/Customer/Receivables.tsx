import { ColumnType, POSTable, RowType } from '@/components/POS/Common';
import POSButton from '@/components/POS/Common/POSButton';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { GetApiInsightsCustomers200, GetApiInsightsCustomers200OneOf, GetApiInsightsCustomers200OneOfDataItem, GetApiInsightsCustomers200OneOfDataItemEmail } from '@/shared/api/models';
import { api } from '@/utils/Api/POS';
import { CSVGenerator } from '@/utils/POS/CSVGenerator';
import { Print } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import { useEffect, useState } from 'react';

interface TranslateColumnType {
    [key: string]: string;
}

interface FormattedDataType {
    customer: string;
    receive: string;
    number: string | undefined;
    email: GetApiInsightsCustomers200OneOfDataItemEmail | undefined;
}

const Receivables = () => {
    const [loading ,setLoading] = useState(false)
    const translateColumn: TranslateColumnType = {
        customer: 'Common.Customers',
        receive: 'Report.Receive',
        number: 'Report.Number',
        email: 'Common.Email',
    };

    const Column: ColumnType[] = ['customer', 'receive', 'number', 'email'].map((col) => ({
        id: col,
        name: t(translateColumn[col]),
        selector: (row: RowType) => row[col],
    }));

    const [data, setData] = useState<FormattedDataType[]>([]);

    const fetchData = async () => {
        setLoading(true)
        try {
              const response: GetApiInsightsCustomers200 = await api.getApiInsightsCustomers({ status: 'ALL' });
              const { data } = response as GetApiInsightsCustomers200OneOf;
              const formattedData: FormattedDataType[] = data?.map((emp: GetApiInsightsCustomers200OneOfDataItem) => ({
                  customer: emp.name,
                  receive: formatCurrency(emp.receivableAmount),
                  number: `+91 ${emp.phoneNumber}`,
                  email: emp.email,
              }));
              setData(formattedData);
        } catch (error) {
            console.error('Error : ', error)
        }finally{
            setLoading(false)
        }
      
    };

    const handleSave = async () => {
        try {
            const response: GetApiInsightsCustomers200 = await api.getApiInsightsCustomers({
                status: 'ALL',
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
                    {t('Common.Customers')} - {t('Report.Receivables')}
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

export default Receivables;
