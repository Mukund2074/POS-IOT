import { ColumnType, POSTable, RowType } from '@/components/POS/Common';
import POSButton from '@/components/POS/Common/POSButton';
import { POSDateRangePicker } from '@/components/POS/Common/POSDateRangePicker';
import POSSelect from '@/components/POS/Common/POSSelect';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { GetApiGiftCards200} from '@/shared/api/models';
import { api } from '@/utils/Api/POS';
import { CSVGenerator } from '@/utils/POS/CSVGenerator';
import { Print } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import moment from 'moment';
import { useEffect, useState } from 'react';

interface LanguageColumnTranslateType {
    [key: string]: string;
}

const ActiveGiftCard = () => {
    const status = [
        {
            label: t('Common.All'),
            value: 'all',
        },
        {
            label: t('PunchCard.Used'),
            value: 'used',
        },
        {
            label: t('PunchCard.Unused'),
            value: 'unused',
        },
        {
            label: t('Report.PurchasedOnline'),
            value: 'purchased_online',
        },
    ];
    const [selectedStatus, setSelectedStatus] = useState<any>('all');
    const [loading, setLoading] = useState(false);

    const [filter, setFilter] = useState({
        fromDate: moment().subtract(3, 'months').toISOString(),
        toDate: moment().toISOString(),
    });

    const languageColumnTranslate: LanguageColumnTranslateType = {
        id: 'Id',
        customer: 'Insights.Customer',
        expires: 'Report.Expires',
        residualValue: 'Report.ResidualValue',
        soldBy: 'PunchCard.SoldBy',
    };

    const activeGiftCardColumn: ColumnType[] = ['id', 'customer', 'expires', 'residualValue', 'soldBy'].map((agcc) => ({
        id: agcc,
        name: t(languageColumnTranslate[agcc]),
        selector: (row: RowType) => row[agcc],
    }));

    const [activeGiftCardData, setActiveGiftCardData] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response: GetApiGiftCards200 = await api.getApiGiftCards({
                status: selectedStatus.toUpperCase(),
                fromDate: filter.fromDate,
                toDate: filter.toDate,
            });
            const formatData = response?.items.map((data) => ({
                id: (
                    <Typography
                        sx={{ cursor: 'pointer', textDecoration: 'underline', color: '#1976d2', fontWeight: 'bold' }}
                        onClick={() => window.open(`https://api-node-dev.fiind.app/api/gift-cards/${data?.id}/pdf`)}
                    >
                        {data?.giftCardCode}
                    </Typography>
                ),
                customer: data?.customer?.name,
                expires: moment(data?.expiryDate).format('YYYY-MM-DD'),
                residualValue: formatCurrency(data?.residueValue),
                soldBy: data?.employee?.name,
            }));
            setActiveGiftCardData(formatData);
        } catch (error) {
            console.error('fetch data failed', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        const respones = await api.getApiGiftCardsListType(
            { fromDate: filter.fromDate, toDate: filter.toDate, status: selectedStatus.toUpperCase() },
            'csv',
        );
        CSVGenerator({ fileTitle: 'gift_card_report', response: respones });
    };

    useEffect(() => {
        fetchData();
    }, [selectedStatus, filter.fromDate, filter.toDate]);

    return (
        <Box>
            <Box sx={{ display: { xs: 'block', md: 'flex' }, justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h3" fontWeight={700}>
                    {t('Report.ActiveGiftCard')}
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 1, md: 4 },
                        mt: { xs: 2, md: 0 },
                    }}
                >
                    <Box sx={{ borderRadius: 2, cursor: 'pointer' }}>
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
                            onClick={handleExport}
                        />
                    </Box>
                    <POSSelect
                        options={status}
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as string)}
                        sx={{ width: { xs: '100%', md: 200 }, borderRadius: '45px', background: '#fff' }}
                        fontColor="#a0a0a0"
                    />
                    <POSDateRangePicker
                        wrapperSx={{
                            width: { xs: '100%', md: 'fit-content' },
                        }}
                        borderRadius={50}
                        startdate={filter.fromDate}
                        endDate={filter.toDate}
                        setStartDate={(date) =>
                            setFilter((prev) => ({
                                ...prev,
                                fromDate: moment(date).toISOString(),
                            }))
                        }
                        setEndDate={(date) =>
                            setFilter((prev) => ({
                                ...prev,
                                toDate: moment(date).toISOString(),
                            }))
                        }
                    />
                </Box>
            </Box>
            <Box sx={{ mt: 3 }}>
                <POSTable columns={activeGiftCardColumn} data={activeGiftCardData} loading={loading} />
            </Box>
        </Box>
    );
};

export default ActiveGiftCard;
