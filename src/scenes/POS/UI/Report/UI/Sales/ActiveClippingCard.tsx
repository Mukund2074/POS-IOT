import { ColumnType, POSTable, RowType } from '@/components/POS/Common';
import POSButton from '@/components/POS/Common/POSButton';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { GetApiBundleOffersSoldIdType200Item } from '@/shared/api/models';
import { api } from '@/utils/Api/POS';
import { CSVGenerator } from '@/utils/POS/CSVGenerator';
import { Print } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import { useEffect, useState } from 'react';

interface TranslateColumnTitleType {
    [key: string]: string;
}

const ActiveClippingCard = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<GetApiBundleOffersSoldIdType200Item[]>([]);

    const translateColumnTitle: TranslateColumnTitleType = {
        code: 'GiftCard.Code',
        customer: 'Insights.Customer',
        validFor: 'Report.ValidFor',
        cutBack: 'Report.CutBack',
        residualValue: 'Report.ResidualValue',
    };

    const activeGiftCardColumn: ColumnType[] = ['code', 'customer', 'validFor', 'cutBack', 'residualValue'].map(
        (agcc) => ({
            id: agcc,
            name: t(translateColumnTitle[agcc]),
            selector: (row: RowType) => row[agcc],
        }),
    );

    useEffect(() => {
        const fetchSoldPunchCards = async () => {
            try {
                setLoading(true);
                const response = await api.getApiBundleOffersSoldIdType('', undefined, 'json');
                setData(response || []);
            } catch (error) {
                console.error('Error fetching sold punch cards:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSoldPunchCards();
    }, []);

    const handleExport = async () => {
        try {
            const response = await api.getApiBundleOffersSoldIdType('', undefined, 'csv');
            CSVGenerator({ response: response.toString(), fileTitle: 'clippingcard_report' });
        } catch (error) {
            console.error('Error exporting CSV:', error);
        }
    };

    const formateData =
        data?.map((formatteData: GetApiBundleOffersSoldIdType200Item) => ({
            code: (
                <Typography
                    sx={{ cursor: 'pointer', textDecoration: 'underline', color: '#1976d2', fontWeight: 'bold' }}
                    onClick={() => window.open(`https://api-node-dev.fiind.app/api/punch-card/${formatteData.id}/pdf`)}
                >
                    {formatteData.bundleOfferCode}
                </Typography>
            ),
            customer: formatteData.customer?.name,
            cutBack: `${formatteData.orignalPunches}/${formatteData.residuePunches}`,
            validFor: formatteData.expiryDate,
            residualValue: formatCurrency(formatteData.price),
        })) || [];

    return (
        <Box>
            <Box sx={{ display: { xs: 'block', md: 'flex' }, justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h3" fontWeight={700}>
                    {t('Report.ActiveClippingCard')}
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
                </Box>
            </Box>
            <Box sx={{ mt: 3 }}>
                <POSTable columns={activeGiftCardColumn} data={formateData} loading={loading} />
            </Box>
        </Box>
    );
};

export default ActiveClippingCard;
