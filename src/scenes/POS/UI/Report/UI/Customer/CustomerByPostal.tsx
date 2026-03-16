import { GetApiInsightsZipcodeStatistics200, GetApiInsightsZipcodeStatistics200DataItem } from '@/shared/api/models';
import { api } from '@/utils/Api/POS';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import { useEffect, useState } from 'react';

const CustomerByPostal = () => {
    const [loading, setLoading] = useState(false);
    const [customerData, setCustomerData] = useState<GetApiInsightsZipcodeStatistics200DataItem[]>([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response: GetApiInsightsZipcodeStatistics200 = await api.getApiInsightsZipcodeStatistics();
            setCustomerData(response?.data);
        } catch (error) {
            console.error('error', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <Box>
            <Box sx={{ display: { xs: 'block', md: 'flex' }, justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h3" fontWeight={700}>
                    {t('Report.CustomerByPostal')}
                </Typography>
            </Box>

            {/* table box */}
            <Stack sx={{ mt: 4, border: '1px solid #d9d9d9', borderRadius: '18px', overflow: 'hidden' }}>
                {/* Header */}
                <Box
                    sx={{
                        display: 'flex',
                        background: '#e6e6e6',
                        borderBottom: '1px solid #d9d9d9',
                    }}
                >
                    <Typography
                        sx={{
                            width: '20%',
                            p: 2,
                            fontWeight: 800,
                            textAlign: 'center',
                            borderRight: '1px solid #d9d9d9',
                        }}
                    >
                        {t('Report.CustomerCount')}
                    </Typography>
                    <Typography sx={{ width: '80%', p: 2, fontWeight: 800 }}>{t('Common.ZipCode')}</Typography>
                </Box>

                {/* Loader or Rows */}
                {loading ? (
                    <Stack sx={{ justifyContent: 'center', alignItems: 'center', height: '100dvh' }}>
                        <CircularProgress size={40} sx={{ color: 'inherit' }} />
                    </Stack>
                ) : (
                    <Stack>
                        {customerData.map((data: GetApiInsightsZipcodeStatistics200DataItem, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    background: 'white',
                                    borderBottom: index === customerData.length - 1 ? 'none' : '1px solid #d9d9d9', // avoid double border on last row
                                }}
                            >
                                <Typography
                                    sx={{
                                        width: '20%',
                                        p: 2,
                                        textAlign: 'center',
                                        borderRight: '1px solid #d9d9d9',
                                    }}
                                >
                                    {data?.customerCount}
                                </Typography>
                                <Typography sx={{ width: '80%', p: 2 }}>{data?.zipCode}</Typography>
                            </Box>
                        ))}
                    </Stack>
                )}
            </Stack>
        </Box>
    );
};

export default CustomerByPostal;
